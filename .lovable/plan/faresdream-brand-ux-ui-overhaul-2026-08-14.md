# FaresDream — brand + UX/UI overhaul

Full frontend rebrand of the current AsairSpace OTA into FaresDream (faresdream.com). All backend logic stays untouched: checkout validation, Mixpanel tracking, Stripe auth & capture, EAZAIR webhook postback (partner slug `faresdream`), PKFare search calls, and the Admin Mission Control dashboard are not modified.

## 1. Brand and theme

- Rework the design tokens in the global stylesheet: royal blue primary (#2563EB, deep #1E40AF), orange CTA accent (#F97316 / #EA580C), white background, slate-50 card surfaces. The existing navy/gold tokens are remapped to the new palette so every page inherits the rebrand without hunting hardcoded colors.
- Clean modern sans-serif type (Plus Jakarta Sans headings / Inter body stays, retuned weights).
- New FaresDream wordmark logo generated and used in header, footer, and favicon.
- Replace every AsairSpace / Asair Space Travels name, phone (800) 436-9330, and email across all routes with FaresDream, +1-888-596-7882, support@faresdream.com.

## 2. Navigation

- Desktop header: logo | Flights | Hotels | Deals | About Us | Contact Us | Call Us pill with agent avatar | currency selector (USD default) | Sign In / Join.
- Mobile header: logo | Call button | hamburger.
- Mobile slide-out drawer: royal-blue "Insider-Deal Club" card with Sign in / Join, links (Explore Travel, My Trips, My Rewards, Need Help?), language selector (English), currency selector (USD), Feedback link, and a bottom sticky agent card with "Call For Deals" button.

## 3. Above-the-fold search widget

- Compact hero: "Fares Dream for All Your Travel Requirements" + "Compare flight ticket prices and enjoy wholesale airfare deals." Padding tuned so the widget and both CTAs fit in the first viewport on mobile and desktop (no scroll).
- Tabs: Flights (active), Hotels, Packages, Cars. Only Flights has a live backend; the other three render the same shell with a "call our agents" panel rather than a broken search.
- Desktop: single-line pill — trip type / travelers / cabin sub-row, then Origin ⇆ Destination, departure + return dates, solid orange Search.
- Mobile: circular service icons row, inline toggles, stacked origin/destination with floating swap button, side-by-side date fields, then full-width orange "Search" and outlined "Call for special phone deals: +1-888-596-7882".
- Traveler modal (sheet on mobile): Adults counter (18+), Children counter (1–17), Infants counter, helper text "At least one traveler should be 18 years or more at the time of travel.", Cancel (ghost) + Done (solid blue).
- Upgraded calendar popover styling used consistently on every page that picks dates (home widget, search, booking).
- USD stays the default currency for search params, API payloads, and display; the header selector drives the displayed currency.

## 4. Call-conversion surfaces

- "Better deals are one call away" modal: agent avatar, DIAL50 sub-text, solid blue Call button, Trustpilot 4.2 + "20+ Years in Business" badges. Triggered on exit intent (desktop) / timed delay (mobile), shown once per session.
- Persistent mobile sticky call bar: agent avatar + "Better Deals, Just a Call Away" / "Call and say DIAL50 to save." + circular blue call button to tel:+18885967882. Offset so it never covers page content or the drawer.

## 5. Homepage content

- About FaresDream section with the supplied copy.
- "Join our Insider-deal Club today!" newsletter card with email input, SUBSCRIBE button, and disclaimer (client-side submit + success toast; no new backend table unless you want one).
- "Why Book With FaresDream?" three benefits: Wholesale Price Comparison, 24/7 Dedicated Phone Concierge, 100% Secure & Verified Checkout.

## 6. Footer

- Accordion columns: Popular Airlines, Popular Flight Routes, Cheap Tickets by Destination.
- Payment/security badge bar with inline SVG placeholders: IATAN, ARC, ASTA, Norton Secured, Trustwave, VISA, Mastercard, Amex, Discover, PayPal, Affirm.
- Contact column: 47 W 13th St, Ground Floor, New York, NY 10011, USA; +1-888-596-7882; support@faresdream.com.
- Supplied legal disclaimer and "© 2026 Faresdream. All rights reserved."

## 7. Pages

- /about: FaresDream brand narrative and company values in the new layout.
- /contact: NY address, phone, support email, and a working contact form ("Send us a message and we'll respond as soon as possible") with validation and success state.
- Per-route head metadata (title, description, og/twitter) rewritten for FaresDream on every page.

## Technical notes

- New components: `BrandHeader`, `MobileDrawer`, `SearchTabs`, `TravelerSelector`, `CallDealsModal`, `StickyCallBar`, `NewsletterCard`, `FooterAccordion`, plus a `CurrencyContext` provider defaulting to USD.
- `FlightSearchWidget` is restructured for the new layout but keeps its existing navigate-to-`/flight/search` contract and search-param shape; passenger counts stay collapsed into the existing `passengers` number so no server contract changes.
- Colors go through semantic tokens only — no hardcoded hex in components.
- Existing route files, server functions, and the admin dashboard keep their logic; only presentation and copy change.
