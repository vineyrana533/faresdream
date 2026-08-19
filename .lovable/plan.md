# Mission Control CRM, Verification Portal, Meta-Search API & Deep-Link Checkout

One unified build across three areas. Existing checkout validation, analytics, payment flow, EAZAIR postback and current admin console stay intact — this extends them.

## Part 1 — Mission Control CRM & Verification Portal

Existing state: `/admin` already has a session login (ADMIN_EMAIL / ADMIN_PASSWORD, signed cookie via SESSION_SECRET) and `/admin/dashboard` lists bookings with source, click_id and utm_source. That auth stays as-is.

What gets added:
- **Unified CRM table**: bookings plus custom quote requests (fare leads and corporate leads) in one filterable view — search by name/email/PNR, filter by status, source and date range, expandable row detail showing customer contact, route, cabin, price, booking reference, click_id and utm_source. CSV export.
- **Lead management**: mark leads as new / contacted / converted / closed, with an internal notes field.
- **Verification portal**:
  - Staff click "Request verification" on a booking to generate a one-time secure link with a random token that expires (default 72 hours).
  - Customer opens a public upload page at that token, uploads ID/passport front/back and optionally a card-holding selfie into a private storage bucket. No login needed, no data shown back except the booking reference.
  - Admin reviews uploads through short-lived signed URLs and marks the booking verified or rejected.
- **Card vault**: card details submitted for high-risk verification are encrypted server-side with AES-GCM using `CARD_VAULT_KEY` before being stored; only the last four digits are stored in clear. Decryption happens only inside an admin-session server function, and full numbers are revealed on explicit click with the action logged.

New tables: `verification_requests`, `vaulted_cards`, plus lead status/notes columns. Private storage bucket for documents with no public read.

## Part 2 — Meta-Search Supplier API

- `POST /api/public/meta/search` as the canonical endpoint, with `POST /api/meta/search` as an alias that runs the same handler (no redirects). Both always respond `application/json`, including for errors.
- `x-api-key` header checked against `META_SEARCH_API_KEY` with a timing-safe compare; 401 JSON on missing/invalid. `OPTIONS` returns 204 with CORS headers.
- Zod validation of the documented body: `search_id`, `trip_type`, `origin`, `destination`, `departure_date`, `return_date` (optional/nullable), `passengers {adults, children, infants}`, `cabin_class`, `currency` defaulting to USD. 400 JSON with field errors on bad input.
- Inventory: query stored deals for the route first; when nothing matches, deterministically generate 3–4 realistic itineraries (seeded from `search_id` so repeat calls are stable) with airline names/codes, flight numbers, timestamps, stops and duration. Domestic vs international is inferred from the airport table, and pricing uses the bands you specified per cabin.
- Response follows the exact contract, with `partner_id` set to the brand slug and a `deep_link_url` on every itinerary pointing at `https://www.faresdream.com/flight/booking?...` carrying origin, destination, depart, return, cabin, price, airline, `click_id=<search_id>`, `utm_source=eazair`, `utm_medium=meta`.

## Part 3 — Deep-Link Checkout Locking

- `/flight/booking` search parsing extended to accept the meta params (`depart`, `return`, `cabin`, `price`, `airline`, `click_id`, `utm_source`, `utm_medium`, `adults`, `children`, `infants`) alongside the current ones, keeping existing defaults for organic traffic.
- When a deep link is detected, the route summary, cabin, traveller counts and price render as a locked, read-only fare card with a "Fare locked from your search" note; the user lands directly on passenger details.
- click_id / utm_source from the URL flow into the booking record exactly as today, so attribution and the EAZAIR postback keep working.

## Technical notes

- API lives in TanStack server routes; CRM reads/writes are `createServerFn` guarded by the existing admin session; upload-token endpoints are public but token-scoped and rate-limited.
- Encryption uses WebCrypto AES-GCM (Worker-compatible) with a per-record IV; `CARD_VAULT_KEY` is read inside handlers only.
- New tables get RLS with no anon/authenticated access — all access goes through admin-session server functions using the service role.

## Secrets needed before this works

`META_SEARCH_API_KEY` and `CARD_VAULT_KEY` are not configured yet. I'll request both during the build.
