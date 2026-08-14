import { createFileRoute } from "@tanstack/react-router";
import { PageShell, Card, SectionTitle } from "@/components/site/ui";
import { BedDouble, Sofa, Sparkles, Headphones } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us | AsairSpace" },
      {
        name: "description",
        content:
          "Plan your affordable business class travel with us — discounted unpublished business class fares, a 24/7 helpdesk and fully customisable reservations.",
      },
      { property: "og:title", content: "Plan Your Affordable Business Class Travel with Us" },
      {
        property: "og:description",
        content: "Discounted unpublished business class fares with 24/7 expert support.",
      },
    ],
  }),
  component: AboutPage,
});

const whyItems = [
  {
    icon: <Sofa className="size-5" />,
    title: "Comfort Travel",
    body: "Wide, private cabins with generous pitch, priority boarding and a dedicated crew ratio so you arrive rested.",
  },
  {
    icon: <BedDouble className="size-5" />,
    title: "Lie-flat Seats",
    body: "True lie-flat beds with premium bedding, direct aisle access and privacy doors on selected carriers.",
  },
  {
    icon: <Sparkles className="size-5" />,
    title: "Lounge Access",
    body: "Complimentary flagship lounge entry with à la carte dining, spa treatments and fast-track security.",
  },
  {
    icon: <Headphones className="size-5" />,
    title: "Full-Suit Amenities",
    body: "Designer amenity kits, sleeper suits, noise-cancelling headsets and dine-on-demand menus.",
  },
];

function AboutPage() {
  return (
    <PageShell
      eyebrow="About Us"
      title="Plan Your Affordable Business Class Travel with Us"
      subtitle="We are a luxury travel agency powered by AI and travel experts, specialising in unpublished premium cabin fares."
    >
      <div className="space-y-4">
        <Card>
          <SectionTitle>Don’t Break Your Bank!</SectionTitle>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Flying up front should not cost a fortune. AsairSpace works directly with 47+
            partner airlines and consolidators to access discounted unpublished business class fares —
            inventory that never appears on public search engines. Because these contracted fares sit
            outside standard published pricing, our travellers routinely save up to 60% compared with
            the airline’s own website, on exactly the same aircraft, the same cabin and the same seat.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Every fare we quote is checked for parity, taxes and carrier surcharges before you see it,
            so the price you are shown is the price you pay. No hidden booking fees, no surprise
            add-ons at checkout.
          </p>
        </Card>

        <Card>
          <SectionTitle>What is next?</SectionTitle>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Once your online booking is received, it is passed to our 24/7 helpdesk team who verify
            availability with the airline, confirm your fare rules and contact you with an update. Our
            travel experts are available around the clock by phone and email — before, during and after
            your journey.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Need a stopover in Doha, a different return date, seat selection, special meals, extra
            baggage or a chauffeur transfer? We customise your reservation for you — simply tell us what
            you need and our team rebuilds the itinerary around it.
          </p>
        </Card>

        <Card>
          <SectionTitle>Why Choose Business Class Flight Deals?</SectionTitle>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {whyItems.map((w) => (
              <div key={w.title} className="rounded-2xl border border-border bg-secondary/50 p-4">
                <span className="inline-grid size-10 place-items-center rounded-xl bg-navy text-navy-foreground">
                  {w.icon}
                </span>
                <h3 className="mt-3 font-display text-base font-semibold text-navy">{w.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{w.body}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
