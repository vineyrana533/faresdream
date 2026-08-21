import { BRAND_DOMAIN } from "./brand";
import { runPkfareItinerarySearch, type PkfareItinerary } from "./pkfare.server";
import type { PkfareRawSegment } from "./pkfare-types";

export const BRAND_SLUG = "faresdream";

export type CabinClass = "economy" | "premium_economy" | "business" | "first";

export type MetaSearchRequest = {
  search_id: string;
  trip_type: "round_trip" | "one_way";
  origin: string;
  destination: string;
  departure_date: string;
  return_date?: string | null | undefined;
  passengers: { adults: number; children: number; infants: number };
  cabin_class: CabinClass;
  currency: string;
};

export type MetaSegment = {
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  duration_minutes: number;
  stops: number;
  flight_number: string;
  cabin_class: CabinClass;
};

export type MetaResult = {
  itinerary_id: string;
  airline: string;
  airline_code: string;
  outbound_segment: MetaSegment;
  return_segment?: MetaSegment;
  pricing: {
    base_fare: number;
    taxes_and_fees: number;
    total_price: number;
    currency: string;
  };
  deep_link_url: string;
};

/* ------------------------------- utilities ------------------------------- */

const PKFARE_CABIN: Record<CabinClass, "Economy" | "PremiumEconomy" | "Business" | "First"> = {
  economy: "Economy",
  premium_economy: "PremiumEconomy",
  business: "Business",
  first: "First",
};

const AIRLINE_NAMES: Record<string, string> = {
  AA: "American Airlines",
  DL: "Delta Air Lines",
  UA: "United Airlines",
  B6: "JetBlue Airways",
  AS: "Alaska Airlines",
  WN: "Southwest Airlines",
  NK: "Spirit Airlines",
  F9: "Frontier Airlines",
  AC: "Air Canada",
  BA: "British Airways",
  VS: "Virgin Atlantic",
  EK: "Emirates",
  QR: "Qatar Airways",
  EY: "Etihad Airways",
  LH: "Lufthansa",
  AF: "Air France",
  KL: "KLM",
  IB: "Iberia",
  TK: "Turkish Airlines",
  SQ: "Singapore Airlines",
  CX: "Cathay Pacific",
  JL: "Japan Airlines",
  NH: "ANA",
  AI: "Air India",
  QF: "Qantas",
};

const airlineName = (code: string) => AIRLINE_NAMES[code.toUpperCase()] ?? code.toUpperCase();

const timeOf = (t?: string | null) => (t ? (t.length > 5 ? t.slice(0, 5) : t) : "00:00");

/** PKfare gives local yyyy-MM-dd + HH:mm; publish as UTC ISO with a Z suffix. */
function isoStamp(date?: string | null, time?: string | null): string {
  const day = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "1970-01-01";
  return `${day}T${timeOf(time)}:00.000Z`;
}

function minutesBetween(startIso: string, endIso: string): number {
  const diff = (Date.parse(endIso) - Date.parse(startIso)) / 60000;
  return Number.isFinite(diff) && diff > 0 ? Math.round(diff) : 0;
}

function toMetaSegment(segments: PkfareRawSegment[], cabin: CabinClass): MetaSegment {
  const first = segments[0]!;
  const last = segments[segments.length - 1]!;
  const departure = isoStamp(first.strDepartureDate, first.strDepartureTime);
  const arrival = isoStamp(last.strArrivalDate, last.strArrivalTime);
  return {
    origin: first.departure,
    destination: last.arrival,
    departure_time: departure,
    arrival_time: arrival,
    duration_minutes:
      minutesBetween(departure, arrival) ||
      segments.reduce((sum, s) => sum + (s.flightTime ?? 0), 0),
    stops: Math.max(0, segments.length - 1),
    flight_number: `${first.airline} ${first.flightNum}`,
    cabin_class: cabin,
  };
}

/* --------------------------------- pricing -------------------------------- */

function pct(name: string, fallback: number): number {
  const raw = Number(process.env[name]);
  return Number.isFinite(raw) && raw >= 0 && raw < 100 ? raw : fallback;
}

/**
 * Whole-party pricing policy (must match Way4fly / Business Class Deal so the
 * aggregator compares like with like):
 *  - PKfare quotes per passenger type. Adults pay adtFare + adtTax + qCharge +
 *    tktFee; children pay chdFare/chdTax plus the same per-ticket fees;
 *    infants pay infFare/infTax with NO per-ticket fees.
 *  - If children were requested but PKfare returned no child components, we
 *    fall back to the adult components — never price a child seat as free.
 *  - Faresdream owns its margin: PARTNER_MARKUP_PCT is applied to the FARE
 *    component only, then an optional PARTNER_PROMO_DISCOUNT_PCT is applied.
 *    Taxes and surcharges pass through at real value.
 *  - The returned total is final and authoritative: EazAir shows it as-is and
 *    it is exactly what the traveller pays at our checkout. base_fare +
 *    taxes_and_fees always equals total_price.
 */
function priceParty(
  itinerary: PkfareItinerary,
  pax: { adults: number; children: number; infants: number },
) {
  const f = itinerary.fares;
  const markup = 1 + pct("PARTNER_MARKUP_PCT", 6) / 100;
  const promo = 1 - pct("PARTNER_PROMO_DISCOUNT_PCT", 0) / 100;
  const adjust = (fare: number) => fare * markup * promo;

  const perTicketFees = f.qCharge + f.tktFee;

  const childFare = f.chdFare ?? f.adtFare;
  const childTax = f.chdTax ?? f.adtTax;

  const baseRaw =
    pax.adults * adjust(f.adtFare) +
    pax.children * adjust(childFare) +
    pax.infants * adjust(f.infFare ?? 0);

  const taxRaw =
    pax.adults * (f.adtTax + perTicketFees) +
    pax.children * (childTax + perTicketFees) +
    pax.infants * (f.infTax ?? 0);

  const base_fare = Math.round(baseRaw);
  const taxes_and_fees = Math.round(taxRaw);
  return {
    base_fare,
    taxes_and_fees,
    total_price: base_fare + taxes_and_fees,
    currency: itinerary.currency.toUpperCase(),
  };
}

/* ------------------------------- deep links ------------------------------- */

export function buildDeepLink(
  req: MetaSearchRequest,
  airlineCode: string,
  totalPrice: number,
  extra?: {
    airlineName?: string;
    flightNumber?: string;
    itineraryId?: string;
    baseFare?: number;
    taxes?: number;
  },
) {
  const params = new URLSearchParams({
    origin: req.origin,
    destination: req.destination,
    depart: req.departure_date,
    return: req.return_date ?? "",
    cabin: req.cabin_class,
    price: String(totalPrice),
    airline: airlineCode,
    click_id: req.search_id,
    utm_source: "eazair",
    utm_medium: "meta",
    currency: req.currency.toUpperCase(),
    adults: String(req.passengers.adults),
    children: String(req.passengers.children),
    infants: String(req.passengers.infants),
  });
  if (extra?.airlineName) params.set("airline_name", extra.airlineName);
  if (extra?.flightNumber) params.set("flight_number", extra.flightNumber);
  if (extra?.itineraryId) params.set("itinerary_id", extra.itineraryId);
  if (typeof extra?.baseFare === "number") params.set("base_fare", String(extra.baseFare));
  if (typeof extra?.taxes === "number") params.set("taxes", String(extra.taxes));
  return `https://www.${BRAND_DOMAIN}/flight/booking?${params.toString()}`;
}

/* --------------------------------- search --------------------------------- */

/**
 * Real inventory only. Every result comes from a live PKfare solution; when
 * PKfare has nothing for the route we return an empty array rather than
 * inventing fares or padding to a fixed count.
 */
export async function buildResults(req: MetaSearchRequest): Promise<MetaResult[]> {
  const roundTrip = req.trip_type === "round_trip" && !!req.return_date;

  let itineraries: PkfareItinerary[];
  try {
    itineraries = await runPkfareItinerarySearch({
      origin: req.origin,
      destination: req.destination,
      departDate: req.departure_date,
      ...(roundTrip ? { returnDate: req.return_date! } : {}),
      adults: req.passengers.adults,
      children: req.passengers.children,
      infants: req.passengers.infants,
      cabinClass: PKFARE_CABIN[req.cabin_class],
      currency: req.currency.toUpperCase(),
      solutions: 30,
    });
  } catch (error) {
    console.error(
      `[meta/search] PKFARE lookup failed for ${req.origin}-${req.destination} ${req.departure_date}:`,
      error instanceof Error ? error.message : error,
    );
    return [];
  }

  const results: MetaResult[] = [];
  for (const itinerary of itineraries) {
    const outboundSegments = itinerary.journeys[0];
    if (!outboundSegments || outboundSegments.length === 0) continue;

    const returnSegments = itinerary.journeys[1];
    // Never publish a one-way solution as a round trip.
    if (roundTrip && (!returnSegments || returnSegments.length === 0)) continue;

    const code = itinerary.platingCarrier || outboundSegments[0]!.airline.toUpperCase().slice(0, 2);
    const pricing = priceParty(itinerary, req.passengers);
    if (pricing.total_price <= 0) continue;

    const outbound = toMetaSegment(outboundSegments, req.cabin_class);
    const name = airlineName(code);

    const result: MetaResult = {
      itinerary_id: itinerary.solutionId,
      airline: name,
      airline_code: code,
      outbound_segment: outbound,
      pricing,
      deep_link_url: buildDeepLink(req, code, pricing.total_price, {
        airlineName: name,
        flightNumber: outbound.flight_number,
        itineraryId: itinerary.solutionId,
        baseFare: pricing.base_fare,
        taxes: pricing.taxes_and_fees,
      }),
    };

    if (roundTrip && returnSegments) {
      result.return_segment = toMetaSegment(returnSegments, req.cabin_class);
    }

    results.push(result);
  }

  results.sort((a, b) => a.pricing.total_price - b.pricing.total_price);

  if (results.length === 0) {
    console.info(
      `[meta/search] no PKFARE inventory for ${req.origin}-${req.destination} ${req.departure_date}${
        roundTrip ? ` / ${req.return_date}` : ""
      } cabin=${req.cabin_class} — returning empty results`,
    );
  }

  return results;
}

/** Public entry point used by the supplier endpoint. */
export const runMetaSearch = buildResults;
