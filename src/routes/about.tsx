import { createFileRoute } from "@tanstack/react-router";
import { PageShell, Card, SectionTitle } from "@/components/site/ui";
import { BadgeDollarSign, Globe2, ShieldCheck, Headphones } from "lucide-react";
import { PHONE_DISPLAY, SUPPORT_EMAIL } from "@/lib/brand";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About FaresDream — Flight Price Comparison & Wholesale Fares" },
      {
        name: "description",
        content:
          "FaresDream is a flight price comparison website offering wholesale airfare, a 24/7 phone concierge and secure checkout for travellers worldwide.",
      },
      { property: "og:title", content: "About FaresDream" },
      {
        property: "og:description",
        content: "Wholesale airfare, global reach and personalised service from real travel agents.",
      },
    ],
  }),
  component: AboutPage,
});

const values = [
  {
    icon: <BadgeDollarSign className="size-5" />,
    title: "Wholesale Pricing",
    body: "We work with the world's leading travel providers to surface negotiated fares you won't find on public search engines.",
  },
  {
    icon: <Globe2 className="size-5" />,
    title: "Global, Yet Local",
    body: "A one-stop global airline ticket booking solution, delivered with locally tailored customer experiences.",
  },
  {
    icon: <Headphones className="size-5" />,
    title: "Real People, 24/7",
    body: `Travel experts on the phone at ${PHONE_DISPLAY} — before, during and after your journey.`,
  },
  {
    icon: <ShieldCheck className="size-5" />,
    title: "Transparent & Secure",
    body: "Verified fare rules, encrypted payments and no surprise add-ons at checkout.",
  },
];

function AboutPage() {
  return (
    <PageShell
      eyebrow="About Us"
      title="Fares Dream for All Your Travel Requirements"
      subtitle="FaresDream is a flight price comparison platform built to make great airfare simple, fast and affordable."
    >
      <div className="space-y-4">
        <Card>
          <SectionTitle>Who we are</SectionTitle>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Faresdream is a leading flight price comparison website that finds you the best deal on
            air tickets. Faresdream is the leading and cutting-edge website for flight fare
            comparison, and you can find the best deals on flight tickets here. At Faresdream, you
            can explore the ideal ways to save money on traveling, and now there is no need to spend
            hours and money because you can compare flight ticket prices at Faresdream. Working with
            the world’s leading travel providers, all you need to do is enter your origin,
            destination, and dates, and we will immediately display the best and most cost-effective
            options for you.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Faresdream is an online flight booking and comparison website designed to bridge the
            world through innovative technology and personalized service. We believe in creating a
            global one-stop airline ticket booking solution while acting locally to create tailored
            customer experiences. Enjoy the cheapest flight deals at wholesale prices and dedicated
            customer support.
          </p>
        </Card>

        <Card>
          <SectionTitle>What we value</SectionTitle>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border border-border bg-secondary p-4">
                <span className="inline-grid size-10 place-items-center rounded-xl bg-navy text-navy-foreground">
                  {v.icon}
                </span>
                <h3 className="mt-3 font-display text-base font-semibold text-navy">{v.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{v.body}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle>Talk to a travel expert</SectionTitle>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Every booking is reviewed by our travel desk, who confirm availability and fare rules
            with the airline and contact you with an update. Need a different date, seat selection,
            special meals, extra baggage or a stopover? Call {PHONE_DISPLAY} or email{" "}
            {SUPPORT_EMAIL} and we rebuild the itinerary around you.
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
