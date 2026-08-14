import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Phone, Mail, MapPin, Plane } from "lucide-react";
import { parseFlightSearch, currencySymbol } from "@/lib/flight-search-params";
import {
  readBookingLocal,
  makeBookingId,
  formatBookingDate,
  type BookingRecord,
} from "@/lib/booking-store";

export const Route = createFileRoute("/flight/Confirm")({
  validateSearch: parseFlightSearch,
  head: () => ({
    meta: [
      { title: "Online Booking Received | AsairSpace" },
      {
        name: "description",
        content:
          "Your online business class booking has been received and sent to the airline for confirmation. Review your booking id, flight details and price summary.",
      },
      { property: "og:title", content: "Online Booking Received — AsairSpace" },
      {
        property: "og:description",
        content: "Booking received and sent to the airline for confirmation.",
      },
    ],
  }),
  component: ConfirmPage,
});

const ADDRESS = "206, Sai Complex, Nangloi, 110041, India";
const PHONE = "(800) 436-9330";
const EMAIL = "info@asairspace.com";

function ConfirmPage() {
  const s = Route.useSearch();
  const sym = currencySymbol(s.currency);
  const total = Number(s.price) || 0;
  const [record, setRecord] = useState<BookingRecord | null>(null);

  useEffect(() => {
    setRecord(readBookingLocal());
  }, []);

  const bookingId = record?.bookingId ?? makeBookingId();
  const bookingDate = record?.bookingDate ?? formatBookingDate();
  const fullName = record
    ? `${record.title} ${record.firstName} ${record.lastName}`.trim()
    : "Valued Traveller";
  const email = record?.email || EMAIL;
  const phone = record?.phone || PHONE;
  const billing = record
    ? [record.address, record.city, record.postalCode, record.country].filter(Boolean).join(", ") ||
      ADDRESS
    : ADDRESS;
  const passengers = record?.passengers ?? 1;

  return (
    <div className="min-h-[100dvh] bg-secondary/40 pb-24">
      {/* Dark green header bar */}
      <div className="bg-[#1B5E20] text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 text-[11px] font-semibold sm:text-xs">
          <span className="font-display text-sm font-semibold">AsairSpace</span>
          <span className="opacity-60">|</span>
          <span className="inline-flex items-center gap-1">
            Booking Confirmation <Check className="size-3.5" />
          </span>
          <span className="opacity-60">|</span>
          <a href={`tel:${PHONE}`} className="inline-flex items-center gap-1">
            <Phone className="size-3.5" /> {PHONE}
          </a>
          <span className="opacity-60">|</span>
          <a href={`mailto:${EMAIL}`} className="inline-flex items-center gap-1">
            <Mail className="size-3.5" /> {EMAIL}
          </a>
          <span className="opacity-60">|</span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" /> {ADDRESS}
          </span>
        </div>
      </div>

      {/* Green banner */}
      <div className="bg-[#2E7D32] text-white">
        <div className="mx-auto max-w-4xl px-4 py-8 text-center sm:py-12">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#43A047] ring-4 ring-white/30">
            <Check className="size-9 text-white" strokeWidth={3} />
          </span>
          <h1 className="mt-5 font-display text-3xl font-semibold sm:text-4xl">
            Online booking received
          </h1>
          <p className="mt-4 text-sm font-semibold sm:text-base">Dear, {fullName}</p>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-white/90">
            We have received Your Online booking and it has been sent to the airlines for confirmation
            purposes. One of our Sales representatives will contact you with an update shortly,
            alternatively you can give us a call at {PHONE} or send us an email at {EMAIL}. Please find
            the details of your online booking below (Please note these are not your e tickets)
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="font-display text-lg font-semibold text-navy">Contact Information</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <Line label="Email ID" value={email} />
              <Line label="Phone Number" value={phone} />
              <Line label="Address" value={billing} />
            </dl>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="font-display text-lg font-semibold text-navy">Booking Details</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <Line label="Booking Id #" value={bookingId} />
              <Line label="Booking Date" value={bookingDate} />
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#2E7D32] px-3 py-1 text-xs font-bold text-white">
                    Confirmed <Check className="size-3" />
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Segment
            kind="Departure"
            airline={s.airline}
            flightNo={s.flightNo}
            from={s.origin}
            to={s.destination}
            date={s.departDate}
            cabin={s.cabin}
          />
          <Segment
            kind="Return"
            airline={s.airline}
            flightNo={`${s.flightNo.split(" ")[0] ?? "EK"} ${
              Number(s.flightNo.replace(/\D/g, "") || 204) + 1
            }`}
            from={s.destination}
            to={s.origin}
            date={s.departDate}
            cabin={s.cabin}
          />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold text-navy">Price Summary</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Line label="Passengers" value={`${passengers} Adult${passengers > 1 ? "s" : ""}`} />
            <Line label="Cabin" value={s.cabin} />
            <Line
              label="Fare per passenger"
              value={`${sym}${(total / passengers).toLocaleString()}`}
            />
            <div className="flex items-baseline justify-between gap-3 border-t border-border pt-2">
              <dt className="font-semibold text-navy">Total price (incl. taxes &amp; fees)</dt>
              <dd className="font-display text-xl font-semibold text-gold">
                {sym}
                {total.toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-navy px-5 py-3 text-sm font-bold text-navy-foreground"
          >
            Back to home
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-bold text-navy"
          >
            Print booking
          </button>
        </div>
      </div>
    </div>
  );
}

function Segment({
  kind,
  airline,
  flightNo,
  from,
  to,
  date,
  cabin,
}: {
  kind: string;
  airline: string;
  flightNo: string;
  from: string;
  to: string;
  date: string;
  cabin: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        {kind} flight
      </p>
      <div className="mt-2 flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-navy text-navy-foreground">
          <Plane className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-base font-semibold text-navy">{airline}</p>
          <p className="text-xs text-muted-foreground">Flight {flightNo}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <span className="font-display text-2xl font-semibold text-navy">{from}</span>
        <Plane className="size-4 text-mutedblue" />
        <span className="font-display text-2xl font-semibold text-navy">{to}</span>
      </div>
      <dl className="mt-3 space-y-1.5 text-sm">
        <Line label="Date" value={date} />
        <Line label="Departure" value="09:45" />
        <Line label="Arrival" value="19:20" />
        <Line label="Duration" value="9h 35m" />
        <Line label="Cabin" value={cabin} />
      </dl>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right font-semibold text-navy">{value}</dd>
    </div>
  );
}
