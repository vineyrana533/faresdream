# FaresDream 7-Point Master Upgrade

Checkout is rebuilt into a clean 3-step flow with real card capture and vaulting, and `/admin` becomes a role-aware Mission Control with staff management, a verification gate and audited card reveal. Existing brand UI, analytics, EAZAIR postback and lead CRM stay intact.

## 1. Checkout flow (`/flight/booking`)

Three explicit steps, one visible panel at a time, each with a progress header and Back/Continue:

```text
Step 1 Traveller Details  -> Step 2 Contact Info -> Step 3 Payment
title/gender/first/last      email, phone           card fields + terms
DOB, passport, nationality   billing address        Make Payment
```

- First Name, Last Name, Email and Phone render as normal inputs above the payment section; the stacked `z-20`/overlay leftovers and the fixed bottom pay bar that clipped content are removed in favour of an in-flow submit button.
- Validation stays on the existing Zod schema; a step cannot be passed while its own fields are invalid.
- Step 3 collects card number, expiry, CVV and name on card (Luhn + expiry checks), replacing the placeholder Stripe skeleton.

## 2. Deep-link locking (point 7)

Already-parsed params (`origin`, `destination`, `depart`, `return`, `cabin`, `price`, `airline`, `click_id`, `utm_source`, `utm_medium`, `adults/children/infants`) drive a locked, read-only trip summary and price. Locking now triggers on `utm_source=eazair` or `utm_medium=meta` even when only one attribution param is present, and the traveller counts are shown as fixed text.

## 3. Consolidated checkout backend

One server handler performs, in order: create booking (status `pending`, verification `pending`), insert passengers, insert payment row (`pending_auth`), vault the card. CVV is validated then dropped — never stored or logged. PAN is encrypted with AES-GCM via the existing `CARD_VAULT_KEY` helper; only brand, last4 and expiry are stored in clear. The EAZAIR postback continues to fire after success.

## 4. RBAC staff management

New `staff_users` table (email, password hash + salt, role `agent | manager | superadmin`, active flag, created_at). Login at `/admin` checks the staff table first, then falls back to `ADMIN_EMAIL`/`ADMIN_PASSWORD` as the built-in superadmin. The signed session cookie now carries `{ staffId, email, role }`; every admin server function re-checks role server-side.

Permissions:

| Action | Agent | Manager | Superadmin |
| --- | --- | --- | --- |
| View bookings, masked cards | yes | yes | yes |
| Mark verified / add remarks | no | yes | yes |
| Capture authorized funds | no | yes | yes |
| Break-glass card reveal | no | yes | yes |
| Create / disable staff | no | no | yes |

## 5. Mission Control UI

- Metrics bar: Gross Booking Value, Awaiting Verification, Verified, Ticketed.
- Tabs: **All Bookings & PNR Queue** and **Staff & Roles** (superadmin only), with the existing Leads and Verification panels kept under the bookings tab.
- Booking drawer gains: masked card (`**** **** **** 1234`), verification remarks box, **Mark Verified**, and **Capture Authorized Funds** — disabled until the booking is verified and the viewer is Manager or Superadmin.

## 6. Break-glass card reveal

Manager/Superadmin only. Requires typed remarks before the reveal call, shows the PAN in a modal that auto-hides after 60 seconds, with copy, context-menu and text selection disabled. Every reveal writes an audit row (staff id, booking, remarks, timestamp) surfaced in the console.

## 7. Meta-search supplier API

The existing `/api/meta/search` and `/api/public/meta/search` handlers stay (Zod validation, `x-api-key` timing-safe check against `META_SEARCH_API_KEY`, deterministic 3–4 option fallback per route/date/cabin). Deep links are re-checked against the required format, including `utm_medium=meta` and an empty `return` when one-way.

## Technical notes

- New tables: `staff_users`, `card_reveal_audit`, plus `verification_status`, `verification_remarks`, `verified_by`, `verified_at`, `captured_at` columns on `bookings`, and `booking_id` linkage for `vaulted_cards`. RLS denies all client access; everything goes through admin-session server functions using the service role.
- Password hashing uses PBKDF2-SHA256 via WebCrypto (Worker-compatible) with a per-user salt.
- Card fields exist only in component state for the duration of submit; nothing is written to sessionStorage or analytics.
- Existing checkout Zod validation, Mixpanel-style `track` events, EAZAIR postback and lead CRM are untouched.

## Note on PCI

Capturing raw card numbers in your own form puts this app in PCI-DSS scope; a tokenised Stripe Elements flow avoids that. Building it as you asked, with encryption at rest, CVV discard and audited reveal as the safeguards.
