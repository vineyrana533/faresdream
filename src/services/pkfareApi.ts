/**
 * Client-side flight search service.
 * All PKFARE traffic (MD5 signing + /apiv2/shopping) happens server-side in
 * src/lib/pkfare.server.ts via the `searchPkfare` server function, so partner
 * credentials are never exposed to the browser.
 */
import { searchPkfare } from "@/lib/pkfare.functions";
import type { PkfareNormalisedFare, PkfareSearchQuery } from "@/lib/pkfare-types";

export type * from "@/lib/pkfare-types";

/** Search live inventory through the secure backend. Throws on upstream/credential errors. */
export async function searchFlights(query: PkfareSearchQuery): Promise<PkfareNormalisedFare[]> {
  return searchPkfare({
    data: {
      origin: query.origin,
      destination: query.destination,
      departDate: query.departDate,
      ...(query.returnDate ? { returnDate: query.returnDate } : {}),
      adults: query.adults ?? 1,
      children: query.children ?? 0,
      infants: query.infants ?? 0,
      cabinClass: query.cabinClass ?? "Business",
      currency: query.currency ?? "USD",
      solutions: query.solutions ?? 20,
      ...(query.airline ? { airline: query.airline } : {}),
    },
  });
}
