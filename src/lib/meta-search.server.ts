import { airports } from "./airports";
import { BRAND_DOMAIN } from "./brand";

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

/** Deterministic PRNG so the same search_id always yields the same inventory. */
function makeRng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const countryOf = (code: string) =>
  airports.find((a) => a.code === code.toUpperCase())?.country ?? null;

export function isDomestic(origin: string, destination: string): boolean {
  const a = countryOf(origin);
  const b = countryOf(destination);
  if (a && b) return a === b;
  // Unknown airports: assume both US-style 3-letter domestic only if identical prefix logic fails.
  return false;
}

const PRICE_BANDS: Record<CabinClass, { domestic: [number, number]; international: [number, number] }> = {
  economy: { domestic: [120, 380], international: [450, 950] },
  premium_economy: { domestic: [320, 750], international: [950, 1800] },
  business: { domestic: [650, 1400], international: [2200, 4500] },
  first: { domestic: [650, 1400], international: [2200, 4500] },
};

const DOMESTIC_AIRLINES = [
  { code: "AA", name: "American Airlines" },
  { code: "DL", name: "Delta Air Lines" },
  { code: "UA", name: "United Airlines" },
  { code: "B6", name: "JetBlue Airways" },
  { code: "AS", name: "Alaska Airlines" },
  { code: "WN", name: "Southwest Airlines" },
];

const INTERNATIONAL_AIRLINES = [
  { code: "BA", name: "British Airways" },
  { code: "EK", name: "Emirates" },
  { code: "QR", name: "Qatar Airways" },
  { code: "LH", name: "Lufthansa" },
  { code: "AF", name: "Air France" },
  { code: "DL", name: "Delta Air Lines" },
  { code: "AA", name: "American Airlines" },
  { code: "TK", name: "Turkish Airlines" },
];

function isoAt(date: string, minutesFromMidnight: number): string {
  const base = new Date(`${date}T00:00:00.000Z`);
  base.setUTCMinutes(base.getUTCMinutes() + minutesFromMidnight);
  return base.toISOString();
}

/** Normalised, direction-agnostic seed so all partners agree on flight identity. */
function routeSeed(origin: string, destination: string, date: string) {
  const pair = [origin.toUpperCase(), destination.toUpperCase()].sort().join("-");
  return `${pair}|${date}`;
}

function segmentFromSchedule(
  from: string,
  to: string,
  date: string,
  cabin: CabinClass,
  entry: ScheduleEntry,
): MetaSegment {
  const departMinutes = entry.departMinutes;
  const arriveTotal = entry.arriveMinutes + entry.arrivalDayOffset * 1440;
  const duration = arriveTotal - departMinutes;
  return {
    origin: from,
    destination: to,
    departure_time: isoAt(date, departMinutes),
    arrival_time: isoAt(date, arriveTotal),
    duration_minutes: duration,
    stops: entry.stops,
    flight_number: entry.flightNumber,
    cabin_class: cabin,
  };
}

function buildSegment(
  from: string,
  to: string,
  date: string,
  cabin: CabinClass,
  flightNumber: string,
  rng: () => number,
  domestic: boolean,
): MetaSegment {
  const departMinutes = Math.floor(5 * 60 + rng() * 15 * 60);
  const duration = domestic
    ? Math.floor(95 + rng() * 300)
    : Math.floor(420 + rng() * 540);
  return {
    origin: from,
    destination: to,
    departure_time: isoAt(date, departMinutes),
    arrival_time: isoAt(date, departMinutes + duration),
    duration_minutes: duration,
    stops: rng() < (domestic ? 0.6 : 0.45) ? 0 : 1,
    flight_number: flightNumber,
    cabin_class: cabin,
  };
}


export function buildDeepLink(req: MetaSearchRequest, airlineCode: string, totalPrice: number) {
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
  });
  return `https://www.${BRAND_DOMAIN}/flight/booking?${params.toString()}`;
}

/** Deals stored in the database take priority over generated inventory. */
type DealRow = {
  id: string;
  airline: string;
  price: number;
  cabin_class: string;
  currency: string;
};

function airlineCodeFor(name: string, fallback: string) {
  const all = [...DOMESTIC_AIRLINES, ...INTERNATIONAL_AIRLINES];
  const hit = all.find((a) => a.name.toLowerCase() === name.trim().toLowerCase());
  return hit?.code ?? fallback;
}

export function buildResults(req: MetaSearchRequest, deals: DealRow[]): MetaResult[] {
  const rng = makeRng(req.search_id + req.origin + req.destination + req.departure_date);
  const domestic = isDomestic(req.origin, req.destination);
  const band = PRICE_BANDS[req.cabin_class][domestic ? "domestic" : "international"];
  const pool = domestic ? DOMESTIC_AIRLINES : INTERNATIONAL_AIRLINES;
  const count = deals.length > 0 ? Math.min(deals.length, 4) : 3 + (rng() < 0.5 ? 0 : 1);

  const results: MetaResult[] = [];
  for (let i = 0; i < count; i++) {
    const deal = deals[i];
    const carrier = pool[Math.floor(rng() * pool.length)] ?? pool[0]!;
    const airline = deal?.airline ?? carrier.name;
    const airlineCode = deal ? airlineCodeFor(deal.airline, carrier.code) : carrier.code;

    const generated = Math.round(band[0] + rng() * (band[1] - band[0]));
    const total = deal ? Math.round(Number(deal.price)) : generated;
    const taxes = Math.round(total * 0.18);
    const baseFare = total - taxes;

    const flightNumber = `${airlineCode} ${100 + Math.floor(rng() * 899)}`;
    const outbound = buildSegment(
      req.origin,
      req.destination,
      req.departure_date,
      req.cabin_class,
      flightNumber,
      rng,
      domestic,
    );

    const result: MetaResult = {
      itinerary_id: `${req.search_id}-${i + 1}`,
      airline,
      airline_code: airlineCode,
      outbound_segment: outbound,
      pricing: {
        base_fare: baseFare,
        taxes_and_fees: taxes,
        total_price: total,
        currency: req.currency.toUpperCase(),
      },
      deep_link_url: buildDeepLink(req, airlineCode, total),
    };

    if (req.trip_type === "round_trip" && req.return_date) {
      result.return_segment = buildSegment(
        req.destination,
        req.origin,
        req.return_date,
        req.cabin_class,
        `${airlineCode} ${100 + Math.floor(rng() * 899)}`,
        rng,
        domestic,
      );
    }

    results.push(result);
  }

  return results;
}
