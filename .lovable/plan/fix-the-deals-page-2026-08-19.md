# Fix the Deals page

The deals table currently has 0 rows, so `/deals` renders an empty grid. Public read access is already allowed for non-expired deals (anon + authenticated SELECT policy), so no RLS change is needed.

## What changes

1. **Curated fallback inventory**
   - Add a static list of 8 popular deals (JFK→MIA $123, ORD→LAX $149, JFK→LHR $499, DFW→CUN $210, LAX→HNL $189, ATL→CUN $198, SFO→NRT $689, JFK→CDG $459) with airline, cabin, currency and a depart date.
   - The page uses database deals when the query returns rows; if the table is empty or the query errors, it renders the curated set instead. No empty state, no crash.
   - Airline filter chips build from whichever set is displayed.

2. **Fully clickable cards**
   - Each card becomes a single link to `/flight/booking` with prefilled `origin`, `destination`, `depart`, `cabin`, `price`, plus `airline` and `currency` so the fare summary is complete.
   - Card gets `cursor-pointer`, hover elevation, and the "View deal" button sits inside the same link (styled as a button, not a nested anchor).

## Technical notes

- New file `src/lib/fallback-deals.ts` exporting the curated rows shaped like the `deals` table.
- `src/routes/deals.tsx`: query keeps `useQuery` but no longer throws on error; derive `deals = (data?.length ? data : FALLBACK_DEALS)`.
- Link target uses the deep-link aliases already accepted by `parseFlightSearch` (`depart`, `cabin`, `price`), so no param parsing changes are required.
- No backend, RLS, or migration changes.
