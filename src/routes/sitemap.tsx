import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/ui";

export const Route = createFileRoute("/sitemap")({
  head: () => ({
    meta: [
      { title: "Sitemap | FaresDream Flight Deals" },
      {
        name: "description",
        content:
          "Browse every page on FaresDream — flight search, deals, destinations, airlines, support and policy pages in one place.",
      },
      { property: "og:title", content: "Sitemap | FaresDream" },
      { property: "og:description", content: "All FaresDream pages in one simple index." },
    ],
  }),
  component: SitemapPage,
});

const groups = [
  {
    title: "Explore",
    links: [
      { label: "Home", to: "/" as const },
      { label: "Deals", to: "/deals" as const },
      { label: "Destinations", to: "/destinations" as const },
      { label: "Airlines", to: "/airlines" as const },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", to: "/about" as const },
      { label: "Contact Us", to: "/contact" as const },
      { label: "Login / Signup", to: "/auth" as const },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "/privacy" as const },
      { label: "Terms of Use", to: "/terms" as const },
      { label: "Refund & Cancellation Policy", to: "/refund-policy" as const },
    ],
  },
];

function SitemapPage() {
  return (
    <PageShell
      eyebrow="Sitemap"
      title="All FaresDream pages"
      subtitle="Find any page on FaresDream in one place."
    >
      <div className="grid gap-6 sm:grid-cols-3">
        {groups.map((g) => (
          <div key={g.title}>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
              {g.title}
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {g.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-foreground hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
