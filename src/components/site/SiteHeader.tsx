import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Phone, Menu, X, User } from "lucide-react";
import logoAsset from "@/assets/asairspace-logo.png.asset.json";
import { focusFlightSearch, FLIGHT_SEARCH_ID } from "@/lib/focus-search";

const PHONE_DISPLAY = "(800) 436-9330";
const PHONE_TEL = "+18004369330";

const navLinks = [
  { to: "/deals", label: "Deals" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact Us" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function goToFlights() {
    if (!focusFlightSearch()) void navigate({ to: "/", hash: FLIGHT_SEARCH_ID });
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background shadow-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4">
          <Link to="/" className="flex min-w-0 items-center">
            <img
              src={logoAsset.url}
              alt="AsairSpace — Asair Space Travels Pvt. Ltd."
              className="h-9 w-auto max-w-[190px] object-contain"
              width={1500}
              height={600}
            />
          </Link>

          <nav className="hidden items-center gap-7 whitespace-nowrap text-sm font-semibold text-foreground lg:flex">
            <Link to="/" activeOptions={{ exact: true }} className="hover:text-primary" activeProps={{ className: "text-primary" }}>
              Home
            </Link>
            <button type="button" onClick={goToFlights} className="hover:text-primary">
              Flight
            </button>
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="hover:text-primary"
                activeProps={{ className: "text-primary" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-3 whitespace-nowrap">
            <Link
              to="/auth"
              className="hidden items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-sm font-semibold text-navy hover:border-primary hover:text-primary lg:inline-flex"
            >
              <User className="size-4" /> Login / Signup
            </Link>

            <a
              href={`tel:${PHONE_TEL}`}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition hover:brightness-110 lg:px-5 lg:text-sm"
            >
              <Phone className="size-4" />
              <span className="hidden lg:inline">Call Us: {PHONE_DISPLAY}</span>
              <span className="lg:hidden">Call</span>
            </a>

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="grid size-9 place-items-center rounded-xl border border-border text-navy lg:hidden"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-navy/50 backdrop-blur-sm"
          />
          <aside className="absolute right-0 top-0 h-full w-72 max-w-[85vw] overflow-y-auto bg-background p-5 shadow-lux">
            <div className="flex items-center justify-between">
              <span className="font-display text-base font-semibold text-navy">Menu</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid size-9 place-items-center rounded-xl border border-border"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="mt-6 flex flex-col gap-1 text-sm font-semibold">
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 hover:bg-accent"
              >
                Home
              </Link>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  goToFlights();
                }}
                className="rounded-xl px-3 py-3 text-left hover:bg-accent"
              >
                Flight
              </button>
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 hover:bg-accent"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <a
              href={`tel:${PHONE_TEL}`}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
            >
              <Phone className="size-4" /> {PHONE_DISPLAY}
            </a>
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-bold text-navy"
            >
              <User className="size-4" /> Login / Signup
            </Link>
          </aside>
        </div>
      ) : null}
    </>
  );
}
