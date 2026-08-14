import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Plane,
  BadgeDollarSign,
  Headphones,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { FlightSearchWidget } from "@/components/site/FlightSearchWidget";
import { NewsletterCard } from "@/components/site/NewsletterCard";
import { FLIGHT_SEARCH_ID, focusFlightSearch } from "@/lib/focus-search";
import { PHONE_DISPLAY } from "@/lib/brand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FaresDream — Compare Cheap Flights & Wholesale Airfare Deals" },
      {
        name: "description",
        content:
          "FaresDream compares flight ticket prices across the world's leading travel providers. Enter your origin, destination and dates for the best air ticket deals.",
      },
      { property: "og:title", content: "FaresDream — Compare Cheap Flights & Airfare Deals" },
      {
        property: "og:description",
        content:
          "Wholesale airfare deals, instant flight comparison and a 24/7 phone concierge.",
      },
    ],
  }),
  component: Home,
});

const whyUs = [
  {
    icon: BadgeDollarSign,
    title: "Wholesale Price Comparison",
    body: "We compare published and negotiated wholesale fares from the world's leading travel providers so you always see the lowest available price.",
  },
  {
    icon: Headphones,
    title: "24/7 Dedicated Phone Concierge",
    body: `Real travel agents on call day and night at ${PHONE_DISPLAY} — for phone-only fares, changes, seats, baggage and special requests.`,
  },
  {
    icon: ShieldCheck,
    title: "100% Secure & Verified Checkout",
    body: "Encrypted payments, verified fare rules and clear pricing. The price you are shown at checkout is the price you pay.",
  },
];

const featuredDeals = [
  { from: "New York", to: "London", trip: "Round-Trip", price: 449 },
  { from: "Los Angeles", to: "Paris", trip: "Round-Trip", price: 528 },
  { from: "Miami", to: "Cancun", trip: "One Way", price: 129 },
  { from: "Chicago", to: "Rome", trip: "Round-Trip", price: 561 },
  { from: "New York", to: "Dubai", trip: "Round-Trip", price: 599 },
  { from: "Boston", to: "Lisbon", trip: "One Way", price: 289 },
];

const popularRoundTrips = [
  { label: "New York to Los Angeles", price: 340 },
  { label: "New York to Barcelona", price: 740 },
  { label: "New York to Dallas", price: 140 },
  { label: "New York to Miami", price: 100 },
  { label: "New York to London", price: 640 },
];

const faqs = [
  {
    q: "How does FaresDream find cheaper flight tickets?",
    a: "We compare live published fares with wholesale and unpublished inventory from our travel provider network, then show you the cheapest combination for your dates.",
  },
  {
    q: "Can I get an extra discount on three or four tickets?",
    a: `Yes — group and multi-passenger bookings often qualify for an extra saving. Call our travel desk at ${PHONE_DISPLAY} before you confirm so the discount can be applied.`,
  },
  {
    q: "How many days before departure should I book?",
    a: "Booking around 60 days ahead usually returns the cheapest international fares, while domestic trips are typically best around 30 days out.",
  },
  {
    q: "Are last-minute flights cheaper?",
    a: "Sometimes. Airlines release unsold seats close to departure on quieter routes, but popular routes usually get more expensive in the final two weeks.",
  },
  {
    q: "Which promo code is currently active?",
    a: "DIAL50 — mention it to an agent when you book by phone and save up to $50 on your reservation.",
  },
];

function Home() {
  useEffect(() => {
    if (window.location.hash === `#${FLIGHT_SEARCH_ID}`) focusFlightSearch();
  }, []);

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="bg-background pb-16">
      {/* HERO + SEARCH — kept above the fold on mobile and desktop */}
      <section className="bg-linear-to-b from-secondary to-background">
        <div className="mx-auto max-w-6xl px-4 py-4 text-left sm:py-8">
          <h1 className="font-display text-xl font-bold leading-tight text-navy sm:text-3xl lg:text-4xl">
            Fares Dream for All Your Travel Requirements
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Compare flight ticket prices and enjoy wholesale airfare deals.
          </p>

          <div className="mt-3 sm:mt-5">
            <FlightSearchWidget />
          </div>
        </div>
      </section>

      {/* WHY BOOK WITH FARESDREAM */}
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading title="Why Book With FaresDream?" />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {whyUs.map((w) => (
              <div
                key={w.title}
                className="rounded-2xl border border-border bg-card p-6 shadow-card"
              >
                <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <w.icon className="size-6" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-navy">{w.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT FARESDREAM */}
      <section className="bg-secondary px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <SectionHeading title="Fares Dream for All Your Travel Requirements" />
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            Faresdream is a leading flight price comparison website that finds you the best deal on
            air tickets. Faresdream is the leading and cutting-edge website for flight fare
            comparison, and you can find the best deals on flight tickets here. At Faresdream, you
            can explore the ideal ways to save money on traveling, and now there is no need to spend
            hours and money because you can compare flight ticket prices at Faresdream. Working with
            the world’s leading travel providers, all you need to do is enter your origin,
            destination, and dates, and we will immediately display the best and most cost-effective
            options for you.
          </p>
        </div>
      </section>

      {/* FEATURED DEALS */}
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading title="Featured Flight Deals" />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredDeals.map((d) => (
              <Link
                key={`${d.from}-${d.to}-${d.trip}`}
                to="/deals"
                className="group rounded-2xl border border-border bg-card p-5 shadow-card transition hover:border-primary"
              >
                <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                  {d.trip}
                </span>
                <p className="mt-3 flex items-center gap-2 font-display text-lg font-semibold text-navy">
                  {d.from} <ArrowRight className="size-4 text-primary" /> {d.to}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  From <span className="font-display text-2xl font-bold text-gold">${d.price}</span>
                </p>
                <span className="mt-3 inline-block text-xs font-semibold text-primary group-hover:underline">
                  View deal
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <NewsletterCard />
        </div>
      </section>

      {/* POPULAR ROUND TRIPS */}
      <section className="bg-secondary px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading title="Most Popular Round-trip Flight Destinations" />
          <ul className="mt-8 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            {popularRoundTrips.map((r) => (
              <li key={r.label} className="flex items-center justify-between gap-4 px-5 py-4">
                <span className="flex min-w-0 items-center gap-3">
                  <Plane className="size-4 shrink-0 text-primary" />
                  <span className="truncate text-sm font-semibold text-navy">{r.label}</span>
                </span>
                <span className="font-display text-lg font-bold text-gold">${r.price}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Average round-trip price per person, taxes and fees included.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <SectionHeading title="FAQs" />
          <div className="mt-8 space-y-3">
            {faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={f.q}
                  className="overflow-hidden rounded-xl border border-border bg-card shadow-card"
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-navy"
                  >
                    {f.q}
                    <ChevronDown
                      className={`size-4 shrink-0 text-primary transition ${open ? "rotate-180" : ""}`}
                    />
                  </button>
                  {open ? (
                    <p className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                      {f.a}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-navy sm:text-3xl">{title}</h2>
      <span className="mt-3 block h-1 w-16 rounded-full bg-gold" />
    </div>
  );
}
