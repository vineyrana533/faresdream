import { Link } from "@tanstack/react-router";
import { MapPin, Phone, Mail } from "lucide-react";
import logoAsset from "@/assets/asairspace-logo.png.asset.json";

const quickLinks = [
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms of Use", to: "/terms" },
  { label: "About Us", to: "/about" },
  { label: "Contact Us", to: "/contact" },
  { label: "Sitemap", to: "/sitemap" },
] as const;

const dealLinks = [
  { label: "Last Minute Flight", to: "/deals" },
  { label: "Flights Under 199", to: "/deals" },
  { label: "Flights Under 99", to: "/deals" },
  { label: "Flights Under 49", to: "/deals" },
  { label: "Military Day", to: "/deals" },
] as const;

export function SiteFooter() {
  return (
    <footer className="bg-navy text-navy-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="inline-flex items-center rounded-lg bg-background px-3 py-2">
            <img
              src={logoAsset.url}
              alt="AsairSpace"
              className="h-8 w-auto max-w-[170px] object-contain"
              loading="lazy"
              width={1500}
              height={600}
            />
          </Link>
          <p className="mt-4 max-w-xs text-xs leading-relaxed text-navy-foreground/70">
            Asair Space Travels Pvt. Ltd. helps travellers find affordable flight deals worldwide
            with 24/7 booking support.
          </p>
        </div>

        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Contact Us</h3>
          <ul className="mt-3 space-y-2.5 text-sm text-navy-foreground/85">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
              206, Sai Complex, Nangloi, 110041, India
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 size-4 shrink-0 text-gold" />
              <a href="tel:+18004369330" className="hover:text-gold">
                (800) 436-9330
              </a>
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 size-4 shrink-0 text-gold" />
              <a href="mailto:info@asairspace.com" className="hover:text-gold">
                info@asairspace.com
              </a>
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 size-4 shrink-0 text-gold" />
              <a href="mailto:support@asairspace.com" className="hover:text-gold">
                support@asairspace.com
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Quick Links</h3>
          <ul className="mt-3 space-y-2 text-sm text-navy-foreground/85">
            {quickLinks.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="hover:text-gold">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Deals</h3>
          <ul className="mt-3 space-y-2 text-sm text-navy-foreground/85">
            {dealLinks.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="hover:text-gold">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-5">
        <p className="mx-auto max-w-7xl text-[11px] leading-relaxed text-navy-foreground/55">
          Disclaimer: Asair Space Travels Pvt. Ltd. is an Independent Online Travel Agency Portal. We
          Are Not Working With Any Association, Subsidiary and Third Party Support. All fares,
          airline names and logos displayed are for reference purposes only and remain the property
          of their respective owners.
        </p>
        <p className="mx-auto mt-3 max-w-7xl text-[11px] text-navy-foreground/70">
          © Copyright Asair Space Travels Pvt. Ltd. 2026. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
