import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const tokenSchema = z.object({ token: z.string().trim().min(20).max(120) });

export type VerificationPortalState =
  | { status: "invalid" }
  | { status: "expired" }
  | { status: "done"; customerName: string | null }
  | { status: "open"; customerName: string | null; expiresAt: string };

/** Public: resolves a customer verification token into a safe portal state. */
export const getVerificationPortal = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => tokenSchema.parse(data))
  .handler(async ({ data }): Promise<VerificationPortalState> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("verification_requests")
      .select("customer_name, status, expires_at")
      .eq("token", data.token)
      .maybeSingle();

    if (!row) return { status: "invalid" };
    if (new Date(row.expires_at).getTime() < Date.now()) return { status: "expired" };
    if (row.status !== "pending") return { status: "done", customerName: row.customer_name };
    return { status: "open", customerName: row.customer_name, expiresAt: row.expires_at };
  });

const MAX_BYTES = 5 * 1024 * 1024;

const uploadSchema = z.object({
  token: z.string().trim().min(20).max(120),
  idFront: z.string().min(1).max(9_000_000),
  idBack: z.string().max(9_000_000).optional(),
  selfie: z.string().max(9_000_000).optional(),
  card: z
    .object({
      cardholderName: z.string().min(2).max(120),
      number: z.string().regex(/^[0-9]{12,19}$/),
      expMonth: z.number().int().min(1).max(12),
      expYear: z.number().int().min(2024).max(2100),
      cvv: z.string().regex(/^[0-9]{3,4}$/),
    })
    .optional(),
});

function decodeDataUrl(value: string): { bytes: Uint8Array; contentType: string; ext: string } {
  const match = /^data:(image\/(png|jpeg|jpg|webp)|application\/pdf);base64,(.+)$/.exec(value);
  if (!match) throw new Error("Only PNG, JPEG, WEBP or PDF uploads are accepted.");
  const contentType = match[1]!;
  const bin = atob(match[3]!);
  if (bin.length > MAX_BYTES) throw new Error("Each file must be smaller than 5 MB.");
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const ext = contentType === "application/pdf" ? "pdf" : contentType.split("/")[1]!;
  return { bytes, contentType, ext };
}

function brandOf(number: string) {
  if (/^4/.test(number)) return "Visa";
  if (/^5[1-5]/.test(number)) return "Mastercard";
  if (/^3[47]/.test(number)) return "American Express";
  if (/^6/.test(number)) return "Discover";
  return "Card";
}

/** Public: customer submits ID documents and (optionally) card details for vaulting. */
export const submitVerification = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => uploadSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("verification_requests")
      .select("id, status, expires_at")
      .eq("token", data.token)
      .maybeSingle();

    if (!row) throw new Error("This verification link is not valid.");
    if (row.status !== "pending") throw new Error("This verification has already been submitted.");
    if (new Date(row.expires_at).getTime() < Date.now())
      throw new Error("This verification link has expired. Please ask our team for a new one.");

    const uploads: { field: "id_front_path" | "id_back_path" | "selfie_path"; value: string }[] = [];
    const files: [string, string | undefined, "id_front_path" | "id_back_path" | "selfie_path"][] = [
      ["id-front", data.idFront, "id_front_path"],
      ["id-back", data.idBack, "id_back_path"],
      ["selfie", data.selfie, "selfie_path"],
    ];

    for (const [name, value, field] of files) {
      if (!value) continue;
      const { bytes, contentType, ext } = decodeDataUrl(value);
      const path = `${row.id}/${name}-${Date.now()}.${ext}`;
      const { error } = await supabaseAdmin.storage
        .from("verification-docs")
        .upload(path, bytes, { contentType, upsert: true });
      if (error) {
        console.error("[submitVerification] upload failed", error);
        throw new Error("We could not save your documents. Please try again.");
      }
      uploads.push({ field, value: path });
    }

    const patch: {
      status: string;
      submitted_at: string;
      id_front_path?: string;
      id_back_path?: string;
      selfie_path?: string;
    } = {
      status: "submitted",
      submitted_at: new Date().toISOString(),
    };
    uploads.forEach((u) => {
      patch[u.field] = u.value;
    });


    const { error: updateError } = await supabaseAdmin
      .from("verification_requests")
      .update(patch)
      .eq("id", row.id);
    if (updateError) {
      console.error("[submitVerification] update failed", updateError);
      throw new Error("We could not complete your verification. Please try again.");
    }

    if (data.card) {
      const { encryptSecret } = await import("./card-vault.server");
      const payload = JSON.stringify({ number: data.card.number, cvv: data.card.cvv });
      const { ciphertext, iv } = await encryptSecret(payload);
      const { error: cardError } = await supabaseAdmin.from("vaulted_cards").insert({
        verification_request_id: row.id,
        cardholder_name: data.card.cardholderName,
        brand: brandOf(data.card.number),
        last4: data.card.number.slice(-4),
        exp_month: String(data.card.expMonth).padStart(2, "0"),
        exp_year: String(data.card.expYear),

        ciphertext,
        iv,
      });
      if (cardError) {
        console.error("[submitVerification] vault insert failed", cardError);
        throw new Error("We could not securely store your card details. Please call us instead.");
      }
    }

    return { ok: true as const };
  });
