/**
 * Server-to-server affiliate postback to EazAir.
 *
 * Fired only after every booking-related row has committed, only when the
 * booking is attributable (source eazair + click_id), and never fatally —
 * checkout confirmation must not depend on the partner being reachable.
 */

export const PARTNER_SLUG = "faresdream";
const DEFAULT_WEBHOOK_URL = "https://eazair.com/api/public/webhooks/booking";

export type EazairPostback = {
  clickId: string;
  pnr: string;
  route: string;
  amount: number;
  currency: string;
  status?: string;
  source?: string;
};

/** EazAir attribution requires the eazair source and a click id. */
export const isAttributable = (source: string | null | undefined, clickId: string | null | undefined) =>
  (source ?? "").trim().toLowerCase().includes("eazair") && !!(clickId ?? "").trim();

export async function sendEazairPostback(input: EazairPostback) {
  // Tolerate a configured value that was pasted with surrounding brackets/quotes.
  const configured = (process.env["EAZAIR_WEBHOOK_URL"] ?? "").trim().replace(/^[[<"']+|[\]>"']+$/g, "");
  const url = /^https?:\/\//i.test(configured) ? configured : DEFAULT_WEBHOOK_URL;
  const secret = process.env["PARTNER_POSTBACK_SECRET"] ?? "";

  const payload = {
    partner_slug: PARTNER_SLUG,
    click_id: input.clickId,
    pnr: input.pnr,
    route: input.route,
    amount: Number(input.amount.toFixed(2)),
    currency: (input.currency || "USD").toUpperCase(),
    status: input.status ?? "pending",
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(secret ? { "x-partner-signature": secret } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error(
        `[eazair-postback] ${payload.pnr} rejected (${res.status})`,
        await res.text().catch(() => ""),
      );
      return { sent: false as const, status: res.status, payload };
    }
    console.log(`[eazair-postback] ${payload.pnr} reported click ${payload.click_id} → ${url}`);
    return { sent: true as const, status: res.status, payload };
  } catch (error) {
    console.error(`[eazair-postback] ${payload.pnr} failed`, error);
    return { sent: false as const, status: 0, payload };
  }
}
