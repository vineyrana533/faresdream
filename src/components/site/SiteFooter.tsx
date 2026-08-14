import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { MapPin, Phone, Mail, ChevronDown } from "lucide-react";
import logoAsset from "@/assets/faresdream-logo.png.asset.json";
import { PaymentBadges } from "@/components/site/PaymentBadges";
import { OFFICE_ADDRESS, PHONE_DISPLAY, PHONE_TEL, SUPPORT_EMAIL } from "@/lib/brand";

const accordions = [
  {
    title: "Popular Airlines",
    items: [
      "Delta Air Lines",
      "American Airlines",
      "United Airlines",
      "British Airways",
      "Emirates",
      "Qatar Airways",
    ],
  },
  {
    title: "Popular Flight Routes",
    items: [
      "New York to London",
      "Los Angeles to Paris",
      "Miami to Cancun",
      "Chicago to Rome",
      "New York to Dubai",
      "Boston to Lisbon",
    ],
  },
  {
    title: "Cheap Tickets by Destination",
    items: [
      "Cheap flights to Orlando",
      "Cheap flights to Las Vegas",
      "Cheap flights to Cancun",
      "Cheap flights to London",
      "Cheap flights to Tokyo",
      "Cheap flights to Delhi",
    ],
  },
];

const quickLinks = [
  { label: "About Us", to: "/about" },
  { label: "Contact Us", to: "/contact" },
  { label: "Deals", to: "/deals" },
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms of Use", to: "/terms" },
  { label: "Sitemap", to: "/sitemap" },
] as const;

function Accordion({ title, items }: { title: string; items: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10 lg:border-none">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 py-3 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-gold lg:cursor-default lg:py-0"
      >
        {title}
        <ChevronDown className={`size-4 transition lg:hidden ${open ? "rotate-180" : ""}`} />
      </button>
      <ul
        className={`space-y-2 pb-3 text-sm text-navy-foreground/80 lg:mt-3 lg:block lg:pb-0 ${
          open ? "block" : "hidden"
        }`}
      >
        {items.map((i) => (
          <li key={i}>
            <Link to="/deals" className="hover:text-gold">
              {i}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-navy pb-24 text-navy-foreground lg:pb-0">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link to="/" className="inline-flex items-center rounded-lg bg-background px-3 py-2">
            <img
              src={logoAsset.url}
              alt="FaresDream"
              className="h-8 w-auto max-w-[170px] object-contain"
              loading="lazy"
              width={1504}
              height={608}
            />
          </Link>
          <ul className="mt-5 space-y-2.5 text-sm text-navy-foreground/85">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
              {OFFICE_ADDRESS}
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 size-4 shrink-0 text-gold" />
              <a href={`tel:${PHONE_TEL}`} className="hover:text-gold">
                {PHONE_DISPLAY}
              </a>
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 size-4 shrink-0 text-gold" />
              <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-gold">
                {SUPPORT_EMAIL}
              </a>
            </li>
          </ul>

          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-navy-foreground/80">
            {quickLinks.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="hover:text-gold">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {accordions.map((a) => (
          <Accordion key={a.title} title={a.title} items={a.items} />
        ))}
      </div>

      <div className="border-t border-white/10 px-4 py-6">
        <PaymentBadges />
      </div>

      <div className="border-t border-white/10 px-4 py-5">
        <p className="mx-auto max-w-7xl text-[11px] leading-relaxed text-navy-foreground/55">
          Faresdream is an online flight booking and comparison website designed to bridge the world
          through innovative technology and personalized service. We believe in creating a global
          one-stop airline ticket booking solution while acting locally to create tailored customer
          experiences. Enjoy the cheapest flight deals at wholesale prices and dedicated customer
          support.
        </p>
        <p className="mx-auto mt-3 max-w-7xl text-[11px] text-navy-foreground/70">
          © 2026 Faresdream. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
