import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Lock, ShieldCheck, CreditCard, CheckCircle2, User } from "lucide-react";
import { parseFlightSearch, currencySymbol } from "@/lib/flight-search-params";
import { Steps } from "@/components/site/ui";
import { track } from "@/lib/analytics";
import {
  validateTraveller,
  type TravellerErrors,
  type TravellerForm,
} from "@/lib/checkout-validation";
import {
  makeBookingId,
  formatBookingDate,
  saveBookingLocal,
  persistBooking,
  type BookingRecord,
} from "@/lib/booking-store";
import { getClickId, getUtmSource } from "@/lib/click-id";



export const Route = createFileRoute("/flight/booking")({
  validateSearch: parseFlightSearch,
  head: () => ({
    meta: [
      { title: "Secure Checkout | FaresDream" },
      {
        name: "description",
        content:
          "Enter traveller, billing and card details to complete your business class booking — 100% safe payment and price parity guaranteed.",
      },
      { property: "og:title", content: "Secure Business Class Checkout" },
      { property: "og:description", content: "Price parity guaranteed on every referred fare." },
    ],
  }),
  component: BookingPage,
});

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "United Arab Emirates",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Singapore",
  "Other",
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-6">
      <h2 className="font-display text-lg font-semibold text-navy">{title}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Text({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  type = "text",
  full,
  required,
  error,
  inputMode,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: string;
  full?: boolean;
  required?: boolean;
  error?: string | undefined;
  inputMode?: "text" | "numeric" | "tel" | "email";
  maxLength?: number;
}) {
  return (
    <label className={`relative z-20 block ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={error ? true : undefined}
        className={`mt-1 w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none ${
          error ? "border-destructive focus:border-destructive" : "border-input focus:border-gold"
        }`}
      />
      {error ? <span className="mt-1 block text-[11px] font-semibold text-destructive">{error}</span> : null}
    </label>
  );
}


function Choice({
  label,
  value,
  onChange,
  options,
  full,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  full?: boolean;
}) {
  return (
    <label className={`relative z-20 block ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-gold"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function BookingPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const sym = currencySymbol(search.currency);
  const baseTotal = Number(search.price) || 0;
  const taxes = Math.round(baseTotal * 0.18);

  const partnerPromo = search.promo_code ?? "";
  const discountPct = Number(search.discount_pct) || 0;
  const discountAmount = Number(search.discount_amount) || 0;
  const flatDiscountVal = Number(search.discount_val) || 0;
  const finalPrice = Number(search.final_price) || 0;

  const rawDiscount =
    (search.discount_type ?? "").toLowerCase() === "percentage" && discountPct > 0
      ? Math.round((baseTotal * discountPct) / 100)
      : discountAmount > 0
        ? discountAmount
        : flatDiscountVal;

  const partnerDiscount = Math.min(Math.max(0, rawDiscount), baseTotal);
  const isPartner = (search.utm_source ?? "").toUpperCase() === "EAZAIR";
  const autoApplied = Boolean(partnerPromo && partnerDiscount > 0 && isPartner);

  const [promoInput, setPromoInput] = useState(autoApplied ? partnerPromo : "");
  const [appliedPromo, setAppliedPromo] = useState(autoApplied ? partnerPromo : "");
  const [promoError, setPromoError] = useState("");

  let discount = appliedPromo ? Math.min(partnerDiscount, baseTotal) : 0;
  // Consistency check: trust the partner's final_price if it disagrees by more than 1 unit.
  if (appliedPromo && finalPrice > 0 && Math.abs(baseTotal - discount - finalPrice) > 1) {
    discount = Math.min(Math.max(0, baseTotal - finalPrice), baseTotal);
  }
  const total = Math.max(0, baseTotal - discount);

  const applyPromo = () => {
    const code = promoInput.trim();
    if (code && partnerPromo && code.toUpperCase() === partnerPromo.toUpperCase()) {
      setAppliedPromo(partnerPromo);
      setPromoError("");
      return;
    }
    setAppliedPromo("");
    setPromoError(code ? "This promo code is not valid for this fare." : "Enter a promo code.");
  };

  useEffect(() => {
    track("Checkout Started", {
      route: `${search.origin}-${search.destination}`,
      cabin: search.cabin,
      total_price: total,
    });
    // Fires once per checkout entry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [t, setT] = useState<TravellerForm>({
    title: "Mr",
    firstName: "",
    lastName: "",
    dobDay: "",
    dobMonth: "",
    dobYear: "",
    gender: "Male",
    passportNo: "",
    passportExpiry: "",
    nationality: "India",
    email: "",
    phone: "",
    address: "",
    country: "India",
    city: "",
    postalCode: "",
  });
  const [touched, setTouched] = useState<Partial<Record<keyof TravellerForm, boolean>>>({});
  const set = (k: keyof TravellerForm) => (v: string) => setT((p) => ({ ...p, [k]: v }));
  const touch = (k: keyof TravellerForm) => () => setTouched((p) => ({ ...p, [k]: true }));

  const fieldErrors: TravellerErrors = useMemo(() => validateTraveller(t), [t]);
  const travellerValid = Object.keys(fieldErrors).length === 0;
  const errorFor = (k: keyof TravellerForm) => (touched[k] ? fieldErrors[k] : undefined);

  const [accepted, setAccepted] = useState(false);

  const paxCount = (search.adults ?? 1) + (search.children ?? 0) + (search.infants ?? 0);
  const travellerSummary = [
    `${search.adults ?? 1} adult${(search.adults ?? 1) > 1 ? "s" : ""}`,
    (search.children ?? 0) > 0 ? `${search.children} child` : "",
    (search.infants ?? 0) > 0 ? `${search.infants} infant` : "",
  ]
    .filter(Boolean)
    .join(", ");


  const continueToBook = () => {
    if (!travellerValid) {
      setTouched(
        Object.fromEntries(Object.keys(t).map((k) => [k, true])) as Record<
          keyof TravellerForm,
          boolean
        >,
      );
      setError("Please correct the highlighted fields before continuing.");
      return;
    }
    setError("");
    setStep(2);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const makePayment = async () => {
    if (!accepted) {
      setError("Please accept the Terms & Conditions to continue.");
      return;
    }
    setError("");
    setSubmitting(true);

    // Card details are never held in app state or sent to our database —
    // Stripe Elements will tokenise them directly with Stripe.
    const record: BookingRecord = {
      bookingId: makeBookingId(),
      bookingDate: formatBookingDate(),
      ...t,
      passengers: paxCount,
      flight: search,
      total,
      utmSource: search.utm_source ?? getUtmSource(),
      clickId: search.click_id ?? getClickId(),
      promoCode: appliedPromo,
      promoDiscount: discount,
    };


    saveBookingLocal(record);
    try {
      await persistBooking(record);
    } catch (e) {
      console.error("[checkout] booking not saved", e);
      setError(
        "We couldn't save your booking. Please call +1-888-596-7882 so our team can confirm it.",
      );
      setSubmitting(false);
      return;
    }
    track("Booking Completed", {
      pnr: record.bookingId,
      gross_amount: total,
      source: record.utmSource || record.clickId ? "affiliate" : "direct",
    });
    navigate({ to: "/flight/Confirm", search });
  };



  return (
    <div className="min-h-[100dvh] bg-secondary/50 px-4 py-6 pb-40">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-gold/40 bg-gold/5 px-4 py-3 text-sm text-navy">
          <User className="size-4 shrink-0 text-gold" />
          <span className="text-muted-foreground">Already have an account?</span>
          <Link to="/auth" className="font-bold text-gold underline-offset-4 hover:underline">
            Sign In
          </Link>
          <span className="text-muted-foreground">
            for faster booking and to earn loyalty points. Guest checkout is fine too.
          </span>
        </div>
        {search.locked ? (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-navy/20 bg-navy/5 px-4 py-3 text-sm text-navy">
            <Lock className="size-4 shrink-0 text-navy" />
            <span className="font-bold">Fare locked from your search</span>
            <span className="text-muted-foreground">
              {search.origin} → {search.destination} · {search.cabin} · {search.departDate}
              {search.returnDate ? ` – ${search.returnDate}` : ""} · {travellerSummary} ·{" "}
              {sym}
              {Number(search.price).toLocaleString()} — no need to search again, just add traveller
              details.
            </span>
          </div>
        ) : null}
        <Steps current={step === 1 ? 3 : 5} />

      </div>

      <div className="mx-auto mt-4 grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-6">
            <h2 className="font-display text-lg font-semibold text-navy">Promo Code</h2>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Enter promo code"
                className="relative z-20 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm uppercase outline-none focus:border-gold"
              />
              <button
                onClick={applyPromo}
                className="shrink-0 rounded-xl bg-navy px-6 py-2.5 text-sm font-bold text-navy-foreground transition hover:brightness-125"
              >
                Apply
              </button>
            </div>
            {appliedPromo ? (
              <p className="mt-2 text-sm font-semibold text-emerald-600">
                {autoApplied && appliedPromo === partnerPromo
                  ? "✓ Partner discount applied automatically!"
                  : `✓ Promo code ${appliedPromo} applied — you save ${sym}${discount.toLocaleString()}.`}
              </p>
            ) : promoError ? (
              <p className="mt-2 text-sm font-semibold text-destructive">{promoError}</p>
            ) : null}
          </section>

          {step === 1 ? (
            <>
              <Section title="Traveller Details">
                <Choice label="Title" value={t.title} onChange={set("title")} options={["Mr", "Mrs", "Ms"]} />
                <Choice label="Gender" value={t.gender} onChange={set("gender")} options={["Male", "Female"]} />
                <Text label="First Name" value={t.firstName} onChange={set("firstName")} onBlur={touch("firstName")} error={errorFor("firstName")} placeholder="As on passport" required />
                <Text label="Last Name" value={t.lastName} onChange={set("lastName")} onBlur={touch("lastName")} error={errorFor("lastName")} placeholder="As on passport" required />
                <div className="grid grid-cols-3 items-start gap-2 sm:col-span-2">
                  <Text label="Day" value={t.dobDay} onChange={(v) => set("dobDay")(v.replace(/\D/g, "").slice(0, 2))} onBlur={touch("dobDay")} error={errorFor("dobDay")} placeholder="DD" inputMode="numeric" maxLength={2} required />
                  <Text label="Month" value={t.dobMonth} onChange={(v) => set("dobMonth")(v.replace(/\D/g, "").slice(0, 2))} onBlur={touch("dobMonth")} error={errorFor("dobMonth")} placeholder="MM" inputMode="numeric" maxLength={2} required />
                  <Text label="Year" value={t.dobYear} onChange={(v) => set("dobYear")(v.replace(/\D/g, "").slice(0, 4))} onBlur={touch("dobYear")} error={errorFor("dobYear")} placeholder="YYYY" inputMode="numeric" maxLength={4} required />
                </div>
                <Text label="Passport Number" value={t.passportNo} onChange={(v) => set("passportNo")(v.replace(/[^A-Za-z0-9]/g, "").toUpperCase())} onBlur={touch("passportNo")} error={errorFor("passportNo")} placeholder="X1234567" required />
                <Text label="Passport Expiry" type="date" value={t.passportExpiry} onChange={set("passportExpiry")} onBlur={touch("passportExpiry")} error={errorFor("passportExpiry")} required />
                <Choice label="Nationality" value={t.nationality} onChange={set("nationality")} options={COUNTRIES} full />
              </Section>

              <Section title="Contact Details">
                <Text label="Email" type="email" inputMode="email" value={t.email} onChange={set("email")} onBlur={touch("email")} error={errorFor("email")} placeholder="you@email.com" required />
                <Text label="Phone Number" type="tel" inputMode="tel" value={t.phone} onChange={(v) => set("phone")(v.replace(/[^\d+\s]/g, ""))} onBlur={touch("phone")} error={errorFor("phone")} placeholder="+1 844 362 5118" required />
              </Section>

              <Section title="Billing Address">
                <Text label="Address" value={t.address} onChange={set("address")} onBlur={touch("address")} error={errorFor("address")} placeholder="Street address" full required />
                <Choice label="Country" value={t.country} onChange={set("country")} options={COUNTRIES} />
                <Text label="City" value={t.city} onChange={set("city")} onBlur={touch("city")} error={errorFor("city")} placeholder="City" required />
                <Text label="Postal Code" value={t.postalCode} onChange={set("postalCode")} onBlur={touch("postalCode")} error={errorFor("postalCode")} placeholder="110041" required />
              </Section>

              {error ? <p className="text-sm font-semibold text-destructive">{error}</p> : null}

              <div className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-6">
                <button
                  onClick={continueToBook}
                  disabled={!travellerValid}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3.5 text-sm font-bold text-gold-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShieldCheck className="size-4" /> Continue to Book
                </button>
                <p className="mt-3 text-center text-xs font-semibold text-muted-foreground">
                  {travellerValid
                    ? "🔒 Your payment is 100% safe"
                    : "Complete every required field above to continue."}
                </p>
              </div>

            </>
          ) : (
            <>
              <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4 sm:p-6">
                  <h2 className="font-display text-lg font-semibold text-navy">Make Your Payment</h2>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
                    {["VISA", "Mastercard", "AMEX", "Maestro"].map((b) => (
                      <span
                        key={b}
                        className="rounded-md border border-border bg-secondary px-2 py-1 uppercase tracking-widest text-navy"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid gap-3 p-4 sm:p-6">
                  <div className="rounded-xl border border-dashed border-border bg-secondary/60 p-5">
                    <div className="flex items-center gap-2 text-navy">
                      <CreditCard className="size-4 text-gold" />
                      <span className="text-sm font-bold">Card details — Stripe Elements</span>
                    </div>
                    <div className="mt-4 space-y-3" aria-hidden>
                      <div className="h-11 animate-pulse rounded-lg border border-border bg-background" />
                      <div className="grid grid-cols-2 gap-3">
                        <div className="h-11 animate-pulse rounded-lg border border-border bg-background" />
                        <div className="h-11 animate-pulse rounded-lg border border-border bg-background" />
                      </div>
                    </div>
                    <p className="mt-4 text-xs text-muted-foreground">
                      The secure Stripe card field mounts here once Stripe is connected. Card number,
                      expiry and CVV are entered inside Stripe's own PCI-compliant iframe — they never
                      touch this form or our database. We only store your booking and contact details
                      with a payment status of <span className="font-semibold text-navy">Pending Auth</span>.
                    </p>
                  </div>


                  <label className="relative z-20 mt-2 flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3 sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={accepted}
                      onChange={(e) => setAccepted(e.target.checked)}
                      className="mt-0.5 size-4 accent-[var(--gold)]"
                    />
                    <span className="text-xs text-muted-foreground">
                      By clicking on "Make Payments" I accept the Terms &amp; Conditions of way4fly and I
                      accept that my bank card will be charged for the above total amount for this
                      purchase.
                    </span>
                  </label>

                  {error ? (
                    <p className="text-sm font-semibold text-destructive sm:col-span-2">{error}</p>
                  ) : null}
                </div>
              </section>

              <button
                onClick={() => setStep(1)}
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-navy"
              >
                ← Back to traveller details
              </button>
            </>
          )}
        </div>

        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="overflow-hidden rounded-2xl bg-navy text-navy-foreground shadow-lux">
            <div className="border-b border-white/10 p-5">
              <h2 className="font-display text-lg font-semibold">Trip Summary</h2>
              <p className="mt-1 text-xs text-navy-foreground/60">
                Price parity locked from your referring search.
              </p>
            </div>
            <dl className="space-y-3 p-5 text-sm">
              <Row label="Route" value={`${search.origin} → ${search.destination}`} />
              <Row label="Airline" value={search.airline} />
              <Row label="Flight" value={search.flightNo} />
              <Row label="Cabin" value={search.cabin} />
              <Row label="Depart" value={search.departDate} />
              {search.returnDate ? <Row label="Return" value={search.returnDate} /> : null}
              <Row label="Travellers" value={travellerSummary} />

              <div className="border-t border-white/10 pt-3">
                <Row label="Base fare" value={`${sym}${(baseTotal - taxes).toLocaleString()}`} />
                <Row label="Taxes & fees" value={`${sym}${taxes.toLocaleString()}`} />
                {appliedPromo ? (
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-xs uppercase tracking-widest text-red-400">
                      Promo Code ({appliedPromo})
                    </dt>
                    <dd className="font-semibold text-red-400">
                      -{sym}
                      {discount.toLocaleString()}
                    </dd>
                  </div>
                ) : null}
              </div>

              <div className="flex items-baseline justify-between border-t border-white/10 pt-3">
                <dt className="text-xs uppercase tracking-widest text-navy-foreground/60">
                  Total per person
                </dt>
                <dd className="font-display text-2xl font-semibold text-gold">
                  {sym}
                  {total.toLocaleString()}
                </dd>
              </div>
            </dl>
            <div className="p-5 pt-0 text-[11px] text-navy-foreground/60">
              <p className="flex items-center gap-2">
                <CreditCard className="size-3.5" /> No hidden booking fees · 24/7 assistance
              </p>
              <p className="mt-2 flex items-center gap-2">
                <CheckCircle2 className="size-3.5" /> Demo checkout — no real payment is processed.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {step === 2 ? (
        <div className="fixed inset-x-0 bottom-14 z-30 border-t border-border bg-card/95 px-4 py-3 backdrop-blur md:bottom-0">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold text-navy">
              You Pay: {sym}
              {total.toLocaleString()}{" "}
              <span className="text-xs font-normal text-muted-foreground">incl. taxes &amp; fees</span>
            </p>
            <button
              onClick={makePayment}
              disabled={submitting}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3 text-sm font-bold text-gold-foreground transition hover:brightness-110 disabled:opacity-60 sm:flex-none"
            >
              <Lock className="size-4" /> {submitting ? "Processing…" : "Make Payments"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-xs uppercase tracking-widest text-navy-foreground/60">{label}</dt>
      <dd className="min-w-0 truncate text-right font-semibold">{value}</dd>
    </div>
  );
}
