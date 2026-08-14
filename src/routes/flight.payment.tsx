import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { parseFlightSearch, currencySymbol } from "@/lib/flight-search-params";
import { PageShell, Card, SectionTitle, Steps, Field } from "@/components/site/ui";
import { Apple, Banknote, CreditCard, Lock, Smartphone } from "lucide-react";

export const Route = createFileRoute("/flight/payment")({
  validateSearch: parseFlightSearch,
  head: () => ({
    meta: [
      { title: "Secure Payment | FaresDream" },
      {
        name: "description",
        content:
          "Pay for your business class booking by credit card, Apple Pay, Google Pay or wire transfer — encrypted checkout with no hidden fees.",
      },
      { property: "og:title", content: "Secure Business Class Payment" },
      { property: "og:description", content: "Card, Apple Pay, Google Pay and wire transfer options." },
    ],
  }),
  component: PaymentPage,
});

const tabs = [
  { id: "card", label: "Credit Card", icon: <CreditCard className="size-4" /> },
  { id: "apple", label: "Apple Pay", icon: <Apple className="size-4" /> },
  { id: "google", label: "Google Pay", icon: <Smartphone className="size-4" /> },
  { id: "wire", label: "Wire Transfer", icon: <Banknote className="size-4" /> },
] as const;

function PaymentPage() {
  const s = Route.useSearch();
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("card");
  const sym = currencySymbol(s.currency);
  const price = Number(s.price) || 0;

  return (
    <PageShell eyebrow="Step 6 of 7" title="Payment" subtitle="256-bit encrypted checkout. No hidden booking fees.">
      <div className="mb-4">
        <Steps current={5} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
                  tab === t.id
                    ? "bg-navy text-navy-foreground"
                    : "border border-border text-muted-foreground"
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {tab === "card" && (
              <>
                <Field label="Card Number" placeholder="4242 4242 4242 4242" full />
                <Field label="Expiry" placeholder="08 / 29" />
                <Field label="CVV" placeholder="123" />
                <Field label="Name on Card" full />
                <Field label="Billing ZIP / Postcode" />
                <p className="text-xs text-muted-foreground sm:col-span-2">
                  Processed via Stripe / Authorize.Net (mock). No real charge is made.
                </p>
              </>
            )}
            {tab === "apple" && (
              <div className="sm:col-span-2 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Confirm with Face ID on your Apple device. Billing details are pulled from your Apple
                  Wallet.
                </p>
                <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm font-bold text-navy-foreground">
                  <Apple className="size-4" /> Pay with Apple Pay
                </button>
              </div>
            )}
            {tab === "google" && (
              <div className="sm:col-span-2 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Choose a saved card from your Google account to complete the booking instantly.
                </p>
                <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm font-bold text-navy-foreground">
                  <Smartphone className="size-4" /> Pay with Google Pay
                </button>
              </div>
            )}
            {tab === "wire" && (
              <div className="sm:col-span-2 space-y-2 text-sm">
                <p className="text-muted-foreground">
                  Wire the total within 24 hours to hold your fare. Tickets are issued on receipt.
                </p>
                <dl className="rounded-xl bg-secondary p-4 text-xs">
                  <Line label="Beneficiary" value="FaresDream LLC" />
                  <Line label="Bank" value="First Republic — New York, NY" />
                  <Line label="Account" value="•••• 4417" />
                  <Line label="SWIFT" value="FRBBUS6S" />
                  <Line label="Reference" value={`${s.origin}${s.destination}-${s.departDate}`} />
                </dl>
              </div>
            )}
          </div>
        </Card>

        <Card className="lg:sticky lg:top-40 lg:self-start">
          <SectionTitle>Amount due</SectionTitle>
          <p className="mt-2 font-display text-3xl font-semibold text-navy">
            {sym}
            {price.toLocaleString()}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {s.airline} · {s.origin} → {s.destination} · {s.cabin}
          </p>
          <Link
            to="/flight/confirmation"
            search={s}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-bold text-gold-foreground"
          >
            <Lock className="size-4" /> Pay {sym}
            {price.toLocaleString()}
          </Link>
        </Card>
      </div>
    </PageShell>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 py-1">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold text-navy">{value}</dd>
    </div>
  );
}
