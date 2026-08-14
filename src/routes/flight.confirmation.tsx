import { createFileRoute, Link } from "@tanstack/react-router";
import { parseFlightSearch, currencySymbol } from "@/lib/flight-search-params";
import { PageShell, Card, SectionTitle, Steps } from "@/components/site/ui";
import { CheckCircle2, Download, Plane } from "lucide-react";

export const Route = createFileRoute("/flight/confirmation")({
  validateSearch: parseFlightSearch,
  head: () => ({
    meta: [
      { title: "Booking Confirmed & E-Ticket | FaresDream" },
      {
        name: "description",
        content:
          "Your business class booking is confirmed. View your PNR, download the e-ticket preview and itemised tax invoice.",
      },
      { property: "og:title", content: "Booking Confirmed — E-Ticket Ready" },
      { property: "og:description", content: "PNR, e-ticket preview and itemised VAT invoice." },
    ],
  }),
  component: ConfirmationPage,
});

const pnrFor = (seed: string) => {
  let h = 7;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) % 1679616;
  return h.toString(36).toUpperCase().padStart(6, "A").slice(0, 6);
};

function ConfirmationPage() {
  const s = Route.useSearch();
  const sym = currencySymbol(s.currency);
  const total = Number(s.price) || 0;
  const tax = Math.round(total * 0.18);
  const base = total - tax;
  const pnr = pnrFor(`${s.airline}${s.origin}${s.destination}${s.departDate}${s.price}`);
  const ticketNo = `${pnr.slice(0, 3)}-${(total * 7).toString().slice(0, 7)}`;

  return (
    <PageShell eyebrow="Step 7 of 7" title="Booking confirmed" subtitle="Your e-ticket has been issued.">
      <div className="mb-4">
        <Steps current={6} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <Card>
            <p className="flex items-center gap-2 text-sm font-semibold text-navy">
              <CheckCircle2 className="size-5 text-gold" /> Ticketed — confirmation sent by email
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Box label="PNR / Record locator" value={pnr} />
              <Box label="E-ticket number" value={ticketNo} />
              <Box label="Passenger" value="As entered at checkout" />
              <Box label="Issued by" value="FaresDream" />
            </div>
          </Card>

          <Card>
            <SectionTitle>E-ticket preview</SectionTitle>
            <div className="mt-3 rounded-2xl border border-dashed border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="font-display text-lg font-semibold text-navy">{s.airline}</span>
                <span className="text-xs uppercase tracking-widest text-muted-foreground">{s.cabin}</span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <span className="font-display text-2xl font-semibold">{s.origin}</span>
                <Plane className="size-4 text-mutedblue" />
                <span className="font-display text-2xl font-semibold">{s.destination}</span>
                <span className="ml-auto text-sm text-muted-foreground">{s.departDate}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Flight {s.flightNo} · PNR {pnr} · Ticket {ticketNo}
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-navy"
            >
              <Download className="size-4" /> Download e-ticket
            </button>
          </Card>

          <Card>
            <SectionTitle>Itemised invoice</SectionTitle>
            <dl className="mt-3 space-y-2 text-sm">
              <Line label="Base fare" value={`${sym}${base.toLocaleString()}`} />
              <Line label="Taxes, VAT & carrier fees (18%)" value={`${sym}${tax.toLocaleString()}`} />
              <Line label="Booking fee" value={`${sym}0`} />
              <div className="border-t border-border pt-2">
                <Line label="Total paid" value={`${sym}${total.toLocaleString()}`} />
              </div>
            </dl>
          </Card>
        </div>

        <Card className="lg:sticky lg:top-40 lg:self-start">
          <SectionTitle>What next</SectionTitle>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Check-in opens 48h before departure.</li>
            <li>Lounge invitations are attached to your e-ticket.</li>
            <li>Your concierge will confirm transfers 24h prior.</li>
          </ul>
          <Link
            to="/dashboard"
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-gold px-5 py-3 text-sm font-bold text-gold-foreground"
          >
            Go to My Trips
          </Link>
        </Card>
      </div>
    </PageShell>
  );
}

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary p-3">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="font-display text-lg font-semibold text-navy">{value}</p>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold text-navy">{value}</dd>
    </div>
  );
}
