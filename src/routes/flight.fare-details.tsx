import { createFileRoute, Link } from "@tanstack/react-router";
import { parseFlightSearch, currencySymbol } from "@/lib/flight-search-params";
import { PageShell, Card, SectionTitle, Steps } from "@/components/site/ui";
import { BedDouble, RefreshCcw, Sofa, Ticket } from "lucide-react";

export const Route = createFileRoute("/flight/fare-details")({
  validateSearch: parseFlightSearch,
  head: () => ({
    meta: [
      { title: "Fare Details & Rules | AsairSpace" },
      {
        name: "description",
        content:
          "Full business class fare rules: refundability, change fees, lie-flat seat type and lounge access privileges before you check out.",
      },
      { property: "og:title", content: "Business Class Fare Details" },
      { property: "og:description", content: "Refund rules, change fees, seat type and lounge access." },
    ],
  }),
  component: FareDetails,
});

function FareDetails() {
  const s = Route.useSearch();
  const sym = currencySymbol(s.currency);
  const price = Number(s.price) || 0;

  const rows = [
    { icon: <RefreshCcw className="size-4 text-gold" />, label: "Refundability", value: "Refundable up to 72h before departure, $250 fee" },
    { icon: <Ticket className="size-4 text-gold" />, label: "Change fees", value: "First change free · thereafter $150 + fare difference" },
    { icon: <BedDouble className="size-4 text-gold" />, label: "Seat type", value: "Fully lie-flat suite, 1-2-1 direct aisle access" },
    { icon: <Sofa className="size-4 text-gold" />, label: "Lounge access", value: "Two-guest lounge entry at origin and connecting hub" },
  ];

  return (
    <PageShell
      eyebrow="Step 2 of 7"
      title="Fare details & rules"
      subtitle={`${s.airline} · ${s.origin} → ${s.destination} · ${s.cabin}`}
    >
      <div className="mb-4">
        <Steps current={2} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <SectionTitle>What is included</SectionTitle>
          <ul className="mt-4 divide-y divide-border">
            {rows.map((r) => (
              <li key={r.label} className="flex gap-3 py-3">
                <span className="mt-0.5 shrink-0">{r.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {r.label}
                  </p>
                  <p className="text-sm text-foreground">{r.value}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="lg:sticky lg:top-40 lg:self-start">
          <SectionTitle>Fare summary</SectionTitle>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Flight" value={`${s.flightNo} · ${s.airline}`} />
            <Row label="Route" value={`${s.origin} → ${s.destination}`} />
            <Row label="Depart" value={s.departDate} />
            <Row label="Cabin" value={s.cabin} />
          </dl>
          <p className="mt-4 font-display text-3xl font-semibold text-navy">
            {sym}
            {price.toLocaleString()}
          </p>
          <p className="text-[11px] text-muted-foreground">Per person, taxes & fees included</p>
          <Link
            to="/flight/booking"
            search={s}
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-gold px-5 py-3 text-sm font-bold text-gold-foreground"
          >
            Continue to checkout
          </Link>
        </Card>
      </div>
    </PageShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-xs uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right font-semibold text-navy">{value}</dd>
    </div>
  );
}
