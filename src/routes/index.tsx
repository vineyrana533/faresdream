import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Plane,
  BadgeDollarSign,
  Zap,
  Headphones,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { FlightSearchWidget } from "@/components/site/FlightSearchWidget";
import { FLIGHT_SEARCH_ID, focusFlightSearch } from "@/lib/focus-search";
import heroAsset from "@/assets/hero-tropical.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AsairSpace — Cheap Flight Deals & Air Tickets Booking" },
      {
        name: "description",
        content:
          "Book cheap air tickets with Asair Space Travels Pvt. Ltd. Compare affordable flight deals, round-trip and one-way fares worldwide with 24/7 customer support.",
      },
      { property: "og:title", content: "AsairSpace — Cheap Flight Deals & Air Tickets Booking" },
      {
        property: "og:description",
        content:
          "Affordable flight deals, instant booking and round-the-clock support from Asair Space Travels Pvt. Ltd.",
      },
    ],
  }),
  component: Home,
});

const whyUs = [
  {
    icon: BadgeDollarSign,
    title: "Affordable Flight Deals",
    body: "Are you looking for something which is cheap and qualitative also? Take a glance at our Cheap Air Tickets Deals in USA to manage your bookings affordably.",
  },
  {
    icon: Zap,
    title: "Instant Booking",
    body: "The last-minute hassles may create lots of troubles for your journey but the support of Best Air Tickets Booking Agency can solve your all queries and issues.",
  },
  {
    icon: Headphones,
    title: "Customer Support",
    body: "No matter it is midnight or a day? Our customer care executive helps you to manage your new bookings or upcoming flight deals anytime anywhere.",
  },
];

const featuredDeals = [
  { from: "London", to: "Paris", trip: "One Way", price: 399 },
  { from: "Dubai", to: "Spain", trip: "Round-Trip", price: 570 },
  { from: "Bangkok", to: "Australia", trip: "One Way", price: 399 },
  { from: "London", to: "Turkey", trip: "Round-Trip", price: 599 },
  { from: "New York", to: "Dubai", trip: "Round-Trip", price: 599 },
  { from: "Dhaka", to: "Chicago", trip: "One Way", price: 399 },
];

const journeySteps = [
  "Destination of Travel",
  "Date of Travel",
  "Total Number of Members",
  "Make the List of Sightseeing",
  "Prepare Travel Cheat Sheet",
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
    q: "Can I Get Extra Airfare Discount on More Than Three or Four Tickets?",
    a: "Yes, Sure our agents will guide you regarding the special offer available on group and multi-passenger bookings. Call our travel desk before you confirm so the discount can be applied to your itinerary.",
  },
  {
    q: "What are the top occasions to book a cheap ticket?",
    a: "According to our data, Black Friday and Christmas are the two strongest windows for discounted airfare, followed by New Year and off-season sale periods announced by airlines.",
  },
  {
    q: "Are Asair Space Travels Pvt. Ltd. Flights Deals Provide Enough Saving?",
    a: "Maybe yes, because our deals are cheapest for the holiday season and we constantly compare published and negotiated fares so you pay the lowest available price.",
  },
  {
    q: "How many days before flight tickets should book?",
    a: "If you book your travel before 60 days then you will get the cheapest offer on most routes. Domestic trips can still be affordable around 30 days ahead.",
  },
  {
    q: "Are Flights are Cheaper on the Last Minute?",
    a: "Not for all destinations! Some destinations are still cheap at the last minute when airlines release unsold seats, but popular routes usually get more expensive.",
  },
  {
    q: "Which is the Updated Promo Code?",
    a: "W4F2020 Is the current or updated discount coupon. Apply it during checkout or mention it to our agent to claim your saving.",
  },
];

function Home() {
  useEffect(() => {
    if (window.location.hash === `#${FLIGHT_SEARCH_ID}`) focusFlightSearch();
  }, []);

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="bg-background pb-16">
      {/* HERO + SEARCH */}
      <section className="relative">
        <img
          src={heroAsset.url}
          alt="Tropical beach resort with palm trees at sunset"
          className="absolute inset-0 size-full object-cover"
          width={1920}
          height={1088}
        />
        <div className="absolute inset-0 bg-navy/55" />
        <div className="relative mx-auto max-w-6xl px-4 py-5 text-left sm:py-10">
          <h1 className="font-display text-xl font-bold leading-tight text-navy-foreground sm:text-4xl lg:text-5xl">
            Find Cheap Flight Deals with <span className="text-gold">AsairSpace</span>
          </h1>

          <div className="mt-3 sm:mt-6">
            <FlightSearchWidget />
          </div>

          <p className="mt-2.5 max-w-3xl text-xs leading-snug text-navy-foreground/85 sm:text-sm">
            Compare affordable air tickets worldwide and book in minutes with Asair Space Travels
            Pvt. Ltd.
          </p>
        </div>
      </section>


      {/* SECTION A */}
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading title="Why fly Asair Space Travels Pvt. Ltd.?" />
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

      {/* SECTION B */}
      <section className="bg-secondary/50 px-4 py-14 sm:px-6 lg:px-8">
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
                  From{" "}
                  <span className="font-display text-2xl font-bold text-gold">${d.price}</span>
                </p>
                <span className="mt-3 inline-block text-xs font-semibold text-primary group-hover:underline">
                  View deal
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION C + D */}
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
            <SectionHeading title="Got flexible travel plans?" />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Good to See You on This Page if you are a common sky flyer. The Deals on Flights
              Booking through Asair Space Travels Pvt. Ltd. can not only manage your complete Travel
              Budget but also Ensure Your Journey without Wasting Too Much Time.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
            <SectionHeading title="How to Make Your Journey at the Cheapest Cost?" />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              This is also the query of the users... Make the mind-set of travel and note some
              important points:
            </p>
            <ol className="mt-4 space-y-2.5">
              {journeySteps.map((s, i) => (
                <li key={s} className="flex items-center gap-3 text-sm font-medium text-navy">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* SECTION E */}
      <section className="bg-secondary/50 px-4 py-14 sm:px-6 lg:px-8">
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

      {/* SECTION F */}
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
