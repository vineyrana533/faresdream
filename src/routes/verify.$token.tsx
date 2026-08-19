import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ShieldCheck, Upload, Lock, CheckCircle2 } from "lucide-react";
import {
  getVerificationPortal,
  submitVerification,
  type VerificationPortalState,
} from "@/lib/verification.functions";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/brand";

export const Route = createFileRoute("/verify/$token")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Secure Traveller Verification | FaresDream" },
      {
        name: "description",
        content:
          "Upload your photo ID securely so the FaresDream ticketing desk can verify and issue your booking.",
      },
      { property: "og:title", content: "Secure Traveller Verification" },
      { property: "og:description", content: "Encrypted document upload for FaresDream bookings." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VerifyPage,
});

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });
}

function FileField({
  label,
  hint,
  onPick,
  picked,
}: {
  label: string;
  hint: string;
  onPick: (v: string | undefined) => void;
  picked: boolean;
}) {
  return (
    <label className="block cursor-pointer rounded-xl border border-dashed border-border bg-secondary/40 p-4 text-sm">
      <span className="flex items-center gap-2 font-semibold text-navy">
        {picked ? <CheckCircle2 className="size-4 text-navy" /> : <Upload className="size-4" />}
        {label}
      </span>
      <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp,application/pdf"
        className="mt-2 block w-full text-xs"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return onPick(undefined);
          onPick(await readFile(file));
        }}
      />
    </label>
  );
}

function VerifyPage() {
  const { token } = Route.useParams();
  const load = useServerFn(getVerificationPortal);
  const submit = useServerFn(submitVerification);

  const [state, setState] = useState<VerificationPortalState | null>(null);
  const [idFront, setIdFront] = useState<string>();
  const [idBack, setIdBack] = useState<string>();
  const [selfie, setSelfie] = useState<string>();
  const [addCard, setAddCard] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    void load({ data: { token } }).then(setState).catch(() => setState({ status: "invalid" }));
  }, [load, token]);

  async function send() {
    if (!idFront) {
      setError("Please upload the front of your photo ID.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await submit({
        data: {
          token,
          idFront,
          ...(idBack ? { idBack } : {}),
          ...(selfie ? { selfie } : {}),
          ...(addCard
            ? {
                card: {
                  cardholderName: cardName.trim(),
                  number: cardNumber.replace(/\D/g, ""),
                  expMonth: Number(expMonth),
                  expYear: Number(expYear),
                  cvv: cvv.trim(),
                },
              }
            : {}),
        },
      });
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const shell = (children: React.ReactNode) => (
    <div className="grid min-h-[100dvh] place-items-center bg-secondary/50 px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-card">
        <span className="grid size-11 place-items-center rounded-xl bg-navy text-navy-foreground">
          <ShieldCheck className="size-5" />
        </span>
        {children}
      </div>
    </div>
  );

  if (!state) return shell(<p className="mt-4 text-sm text-muted-foreground">Loading…</p>);

  if (state.status === "invalid" || state.status === "expired")
    return shell(
      <>
        <h1 className="mt-4 font-display text-2xl font-semibold text-navy">
          {state.status === "expired" ? "This link has expired" : "Link not found"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Please call our ticketing desk at{" "}
          <a href={`tel:${PHONE_TEL}`} className="font-bold text-navy">
            {PHONE_DISPLAY}
          </a>{" "}
          and we will send you a fresh secure link.
        </p>
      </>,
    );

  if (state.status === "done" || done)
    return shell(
      <>
        <h1 className="mt-4 font-display text-2xl font-semibold text-navy">Verification received</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Thank you. Our ticketing team is reviewing your documents and will confirm your booking
          shortly.
        </p>
      </>,
    );

  return shell(
    <>
      <h1 className="mt-4 font-display text-2xl font-semibold text-navy">
        Secure traveller verification
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {state.customerName ? `${state.customerName}, ` : ""}upload your photo ID so we can verify
        the cardholder and issue your ticket. Files are encrypted and only visible to our ticketing
        desk.
      </p>

      <div className="mt-5 grid gap-3">
        <FileField
          label="Photo ID / passport — front"
          hint="Required. PNG, JPEG, WEBP or PDF up to 5 MB."
          picked={!!idFront}
          onPick={setIdFront}
        />
        <FileField
          label="Photo ID — back"
          hint="Optional, for driving licences and national ID cards."
          picked={!!idBack}
          onPick={setIdBack}
        />
        <FileField
          label="Selfie holding the payment card"
          hint="Optional. Cover all but the last 4 digits."
          picked={!!selfie}
          onPick={setSelfie}
        />
      </div>

      <label className="mt-4 flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={addCard}
          onChange={(e) => setAddCard(e.target.checked)}
          className="mt-1 size-4"
        />
        <span className="text-muted-foreground">
          Our agent asked me to confirm my card details for this booking.
        </span>
      </label>

      {addCard ? (
        <div className="mt-3 grid gap-3 rounded-xl border border-border bg-secondary/40 p-4">
          <p className="flex items-center gap-2 text-xs font-semibold text-navy">
            <Lock className="size-3.5" /> AES-256 encrypted before storage.
          </p>
          <input
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="Cardholder name"
            className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-gold"
          />
          <input
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            inputMode="numeric"
            placeholder="Card number"
            className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-gold"
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              value={expMonth}
              onChange={(e) => setExpMonth(e.target.value)}
              inputMode="numeric"
              placeholder="MM"
              className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-gold"
            />
            <input
              value={expYear}
              onChange={(e) => setExpYear(e.target.value)}
              inputMode="numeric"
              placeholder="YYYY"
              className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-gold"
            />
            <input
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              inputMode="numeric"
              placeholder="CVV"
              className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-gold"
            />
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm font-semibold text-destructive">{error}</p> : null}

      <button
        onClick={send}
        disabled={busy}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-bold text-gold-foreground disabled:opacity-60"
      >
        <Lock className="size-4" /> {busy ? "Uploading…" : "Submit verification"}
      </button>
    </>,
  );
}
