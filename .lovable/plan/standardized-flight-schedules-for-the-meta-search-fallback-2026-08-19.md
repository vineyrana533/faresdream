# Standardized Flight Schedules for the Meta-Search Fallback

Goal: when EazAir queries several partners for the same route, every partner returns the same flight numbers and departure times, so EazAir can group them into one card with multiple partner prices. Only prices differ.

## What changes

### 1. A shared schedule catalog

A new catalog file lists real-world-style schedules for the top routes, keyed by route pair (both directions). Each entry holds airline name, airline code, flight number, departure time, arrival time and stop count in local clock time.

Starter coverage (~18 routes), including:

```text
JFK-MIA   AA 391  18:00 -> 21:15  non-stop
JFK-MIA   B6 8836 11:15 -> 14:29  non-stop
JFK-MIA   DL 1494 07:30 -> 10:44  non-stop
JFK-MIA   AA 1245 14:05 -> 17:20  non-stop
```

Plus JFK-LAX, JFK-LHR, JFK-DEL, LAX-DXB, LAX-SFO, ORD-LAX, MIA-LAX, ATL-LAX, JFK-CDG, JFK-FCO, LHR-DXB, DXB-DEL, JFK-SFO, BOS-LAX, IAD-LHR, SFO-NRT, EWR-LHR. Each route gets 3-4 itineraries. The catalog is a plain data file so more routes can be appended at any time.

### 2. Deterministic schedules for uncovered routes

Routes with no catalog entry no longer use `search_id` as the seed. Instead the seed is `ORIGIN-DESTINATION` (normalised so both directions agree) plus the departure date. Any partner running the same rule produces identical airlines, flight numbers and departure times for that route and date. Prices stay independent.

### 3. Pricing stays partner-specific

Flight identity (airline, flight number, times, stops) becomes shared and deterministic. Price continues to come from stored deals first, then from the existing cabin price bands, still seeded per partner so FaresDream quotes its own fare on the shared flight.

### 4. Dates and return legs

Catalog times are clock times; they are applied to the requested departure date to build the ISO timestamps. Round trips reuse the same catalog entry's mirrored leg on the return date, so the return flight numbers also match across partners.

## Technical notes

- New file `src/lib/flight-schedules.ts` holding the catalog and a `getSchedules(origin, destination)` lookup that handles reversed pairs.
- `src/lib/meta-search.server.ts`: `buildResults` first checks the catalog; when hit, itineraries are built from those fixed schedules. Otherwise it falls back to the route+date-seeded generator (same generation code, new seed).
- `itinerary_id` stays search-scoped, but a stable `flight_number` and departure timestamp are what EazAir groups on.
- Response contract, deep links, attribution params, API key gating and validation are unchanged.

## Verification

Call the endpoint twice for JFK to MIA with different `search_id` values and confirm the flight numbers and departure times are identical both times, and confirm an uncovered route also returns identical flights across differing `search_id`s.
