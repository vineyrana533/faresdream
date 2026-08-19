/**
 * Standardized flight schedule catalog.
 *
 * Shared, partner-agnostic flight identities (airline, flight number, clock
 * times, stops) so that every meta-search partner answering for the same route
 * returns matching flights. Only pricing differs per partner, which lets
 * aggregators group offers under a single flight card.
 *
 * Times are local clock minutes from midnight on the travel date.
 * `arrivalDayOffset` marks arrivals landing on a later calendar day.
 */

export type ScheduleEntry = {
  airline: string;
  airlineCode: string;
  flightNumber: string;
  /** Departure clock time, minutes from midnight. */
  departMinutes: number;
  /** Arrival clock time, minutes from midnight. */
  arriveMinutes: number;
  /** Days added to the arrival date (0 = same day). */
  arrivalDayOffset: number;
  stops: number;
};

const hm = (h: number, m: number) => h * 60 + m;

/** Catalog keyed by "ORIGIN-DESTINATION" (directional). */
const CATALOG: Record<string, ScheduleEntry[]> = {
  "JFK-MIA": [
    { airline: "JetBlue Airways", airlineCode: "B6", flightNumber: "B6 8836", departMinutes: hm(11, 15), arriveMinutes: hm(14, 29), arrivalDayOffset: 0, stops: 0 },
    { airline: "American Airlines", airlineCode: "AA", flightNumber: "AA 391", departMinutes: hm(18, 0), arriveMinutes: hm(21, 15), arrivalDayOffset: 0, stops: 0 },
    { airline: "Delta Air Lines", airlineCode: "DL", flightNumber: "DL 1494", departMinutes: hm(7, 30), arriveMinutes: hm(10, 44), arrivalDayOffset: 0, stops: 0 },
    { airline: "American Airlines", airlineCode: "AA", flightNumber: "AA 1245", departMinutes: hm(14, 5), arriveMinutes: hm(17, 20), arrivalDayOffset: 0, stops: 0 },
  ],
  "JFK-LAX": [
    { airline: "Delta Air Lines", airlineCode: "DL", flightNumber: "DL 411", departMinutes: hm(8, 0), arriveMinutes: hm(11, 25), arrivalDayOffset: 0, stops: 0 },
    { airline: "American Airlines", airlineCode: "AA", flightNumber: "AA 3", departMinutes: hm(12, 30), arriveMinutes: hm(15, 58), arrivalDayOffset: 0, stops: 0 },
    { airline: "JetBlue Airways", airlineCode: "B6", flightNumber: "B6 623", departMinutes: hm(17, 29), arriveMinutes: hm(21, 5), arrivalDayOffset: 0, stops: 0 },
    { airline: "United Airlines", airlineCode: "UA", flightNumber: "UA 2402", departMinutes: hm(6, 15), arriveMinutes: hm(9, 40), arrivalDayOffset: 0, stops: 0 },
  ],
  "JFK-SFO": [
    { airline: "United Airlines", airlineCode: "UA", flightNumber: "UA 508", departMinutes: hm(7, 0), arriveMinutes: hm(10, 40), arrivalDayOffset: 0, stops: 0 },
    { airline: "Delta Air Lines", airlineCode: "DL", flightNumber: "DL 448", departMinutes: hm(13, 15), arriveMinutes: hm(16, 55), arrivalDayOffset: 0, stops: 0 },
    { airline: "JetBlue Airways", airlineCode: "B6", flightNumber: "B6 915", departMinutes: hm(18, 50), arriveMinutes: hm(22, 32), arrivalDayOffset: 0, stops: 0 },
  ],
  "JFK-LHR": [
    { airline: "British Airways", airlineCode: "BA", flightNumber: "BA 112", departMinutes: hm(21, 20), arriveMinutes: hm(9, 25), arrivalDayOffset: 1, stops: 0 },
    { airline: "American Airlines", airlineCode: "AA", flightNumber: "AA 100", departMinutes: hm(18, 30), arriveMinutes: hm(6, 30), arrivalDayOffset: 1, stops: 0 },
    { airline: "Delta Air Lines", airlineCode: "DL", flightNumber: "DL 1", departMinutes: hm(19, 40), arriveMinutes: hm(7, 45), arrivalDayOffset: 1, stops: 0 },
    { airline: "Virgin Atlantic", airlineCode: "VS", flightNumber: "VS 4", departMinutes: hm(22, 15), arriveMinutes: hm(10, 20), arrivalDayOffset: 1, stops: 0 },
  ],
  "EWR-LHR": [
    { airline: "United Airlines", airlineCode: "UA", flightNumber: "UA 14", departMinutes: hm(20, 45), arriveMinutes: hm(8, 50), arrivalDayOffset: 1, stops: 0 },
    { airline: "British Airways", airlineCode: "BA", flightNumber: "BA 184", departMinutes: hm(21, 5), arriveMinutes: hm(9, 10), arrivalDayOffset: 1, stops: 0 },
    { airline: "United Airlines", airlineCode: "UA", flightNumber: "UA 934", departMinutes: hm(18, 20), arriveMinutes: hm(6, 25), arrivalDayOffset: 1, stops: 0 },
  ],
  "IAD-LHR": [
    { airline: "United Airlines", airlineCode: "UA", flightNumber: "UA 918", departMinutes: hm(22, 25), arriveMinutes: hm(10, 20), arrivalDayOffset: 1, stops: 0 },
    { airline: "British Airways", airlineCode: "BA", flightNumber: "BA 216", departMinutes: hm(18, 25), arriveMinutes: hm(6, 30), arrivalDayOffset: 1, stops: 0 },
    { airline: "Virgin Atlantic", airlineCode: "VS", flightNumber: "VS 22", departMinutes: hm(21, 0), arriveMinutes: hm(8, 55), arrivalDayOffset: 1, stops: 0 },
  ],
  "JFK-CDG": [
    { airline: "Air France", airlineCode: "AF", flightNumber: "AF 007", departMinutes: hm(19, 30), arriveMinutes: hm(8, 55), arrivalDayOffset: 1, stops: 0 },
    { airline: "Delta Air Lines", airlineCode: "DL", flightNumber: "DL 264", departMinutes: hm(22, 0), arriveMinutes: hm(11, 25), arrivalDayOffset: 1, stops: 0 },
    { airline: "American Airlines", airlineCode: "AA", flightNumber: "AA 44", departMinutes: hm(17, 55), arriveMinutes: hm(7, 20), arrivalDayOffset: 1, stops: 0 },
  ],
  "JFK-FCO": [
    { airline: "ITA Airways", airlineCode: "AZ", flightNumber: "AZ 611", departMinutes: hm(19, 5), arriveMinutes: hm(9, 40), arrivalDayOffset: 1, stops: 0 },
    { airline: "Delta Air Lines", airlineCode: "DL", flightNumber: "DL 246", departMinutes: hm(17, 20), arriveMinutes: hm(7, 55), arrivalDayOffset: 1, stops: 0 },
    { airline: "United Airlines", airlineCode: "UA", flightNumber: "UA 40", departMinutes: hm(20, 35), arriveMinutes: hm(11, 10), arrivalDayOffset: 1, stops: 0 },
  ],
  "JFK-DEL": [
    { airline: "Air India", airlineCode: "AI", flightNumber: "AI 102", departMinutes: hm(0, 45), arriveMinutes: hm(23, 55), arrivalDayOffset: 0, stops: 0 },
    { airline: "Emirates", airlineCode: "EK", flightNumber: "EK 204", departMinutes: hm(11, 15), arriveMinutes: hm(22, 10), arrivalDayOffset: 1, stops: 1 },
    { airline: "Qatar Airways", airlineCode: "QR", flightNumber: "QR 704", departMinutes: hm(20, 25), arriveMinutes: hm(8, 5), arrivalDayOffset: 2, stops: 1 },
    { airline: "Turkish Airlines", airlineCode: "TK", flightNumber: "TK 12", departMinutes: hm(18, 15), arriveMinutes: hm(6, 40), arrivalDayOffset: 2, stops: 1 },
  ],
  "LAX-DXB": [
    { airline: "Emirates", airlineCode: "EK", flightNumber: "EK 216", departMinutes: hm(16, 30), arriveMinutes: hm(19, 15), arrivalDayOffset: 1, stops: 0 },
    { airline: "Qatar Airways", airlineCode: "QR", flightNumber: "QR 740", departMinutes: hm(16, 5), arriveMinutes: hm(22, 45), arrivalDayOffset: 1, stops: 1 },
    { airline: "Turkish Airlines", airlineCode: "TK", flightNumber: "TK 10", departMinutes: hm(18, 45), arriveMinutes: hm(1, 20), arrivalDayOffset: 2, stops: 1 },
  ],
  "LHR-DXB": [
    { airline: "Emirates", airlineCode: "EK", flightNumber: "EK 2", departMinutes: hm(13, 30), arriveMinutes: hm(0, 5), arrivalDayOffset: 1, stops: 0 },
    { airline: "British Airways", airlineCode: "BA", flightNumber: "BA 107", departMinutes: hm(20, 10), arriveMinutes: hm(6, 40), arrivalDayOffset: 1, stops: 0 },
    { airline: "Emirates", airlineCode: "EK", flightNumber: "EK 30", departMinutes: hm(9, 40), arriveMinutes: hm(20, 15), arrivalDayOffset: 0, stops: 0 },
  ],
  "DXB-DEL": [
    { airline: "Emirates", airlineCode: "EK", flightNumber: "EK 512", departMinutes: hm(3, 50), arriveMinutes: hm(8, 45), arrivalDayOffset: 0, stops: 0 },
    { airline: "Air India", airlineCode: "AI", flightNumber: "AI 916", departMinutes: hm(10, 25), arriveMinutes: hm(15, 15), arrivalDayOffset: 0, stops: 0 },
    { airline: "Emirates", airlineCode: "EK", flightNumber: "EK 516", departMinutes: hm(21, 20), arriveMinutes: hm(2, 15), arrivalDayOffset: 1, stops: 0 },
  ],
  "SFO-NRT": [
    { airline: "United Airlines", airlineCode: "UA", flightNumber: "UA 837", departMinutes: hm(11, 15), arriveMinutes: hm(14, 40), arrivalDayOffset: 1, stops: 0 },
    { airline: "Japan Airlines", airlineCode: "JL", flightNumber: "JL 001", departMinutes: hm(13, 5), arriveMinutes: hm(16, 30), arrivalDayOffset: 1, stops: 0 },
    { airline: "ANA", airlineCode: "NH", flightNumber: "NH 7", departMinutes: hm(17, 25), arriveMinutes: hm(20, 50), arrivalDayOffset: 1, stops: 0 },
  ],
  "LAX-SFO": [
    { airline: "United Airlines", airlineCode: "UA", flightNumber: "UA 1128", departMinutes: hm(6, 0), arriveMinutes: hm(7, 32), arrivalDayOffset: 0, stops: 0 },
    { airline: "Delta Air Lines", airlineCode: "DL", flightNumber: "DL 1518", departMinutes: hm(10, 45), arriveMinutes: hm(12, 18), arrivalDayOffset: 0, stops: 0 },
    { airline: "Alaska Airlines", airlineCode: "AS", flightNumber: "AS 1264", departMinutes: hm(15, 30), arriveMinutes: hm(17, 4), arrivalDayOffset: 0, stops: 0 },
    { airline: "American Airlines", airlineCode: "AA", flightNumber: "AA 1418", departMinutes: hm(19, 10), arriveMinutes: hm(20, 45), arrivalDayOffset: 0, stops: 0 },
  ],
  "ORD-LAX": [
    { airline: "United Airlines", airlineCode: "UA", flightNumber: "UA 1136", departMinutes: hm(7, 20), arriveMinutes: hm(9, 55), arrivalDayOffset: 0, stops: 0 },
    { airline: "American Airlines", airlineCode: "AA", flightNumber: "AA 1284", departMinutes: hm(12, 40), arriveMinutes: hm(15, 18), arrivalDayOffset: 0, stops: 0 },
    { airline: "Spirit Airlines", airlineCode: "NK", flightNumber: "NK 385", departMinutes: hm(17, 55), arriveMinutes: hm(20, 30), arrivalDayOffset: 0, stops: 0 },
  ],
  "MIA-LAX": [
    { airline: "American Airlines", airlineCode: "AA", flightNumber: "AA 2401", departMinutes: hm(8, 10), arriveMinutes: hm(11, 5), arrivalDayOffset: 0, stops: 0 },
    { airline: "Delta Air Lines", airlineCode: "DL", flightNumber: "DL 1808", departMinutes: hm(13, 25), arriveMinutes: hm(16, 22), arrivalDayOffset: 0, stops: 0 },
    { airline: "JetBlue Airways", airlineCode: "B6", flightNumber: "B6 1103", departMinutes: hm(18, 40), arriveMinutes: hm(21, 38), arrivalDayOffset: 0, stops: 0 },
  ],
  "ATL-LAX": [
    { airline: "Delta Air Lines", airlineCode: "DL", flightNumber: "DL 1250", departMinutes: hm(7, 45), arriveMinutes: hm(9, 40), arrivalDayOffset: 0, stops: 0 },
    { airline: "American Airlines", airlineCode: "AA", flightNumber: "AA 1552", departMinutes: hm(12, 15), arriveMinutes: hm(14, 12), arrivalDayOffset: 0, stops: 0 },
    { airline: "Delta Air Lines", airlineCode: "DL", flightNumber: "DL 2020", departMinutes: hm(18, 5), arriveMinutes: hm(20, 2), arrivalDayOffset: 0, stops: 0 },
  ],
  "BOS-LAX": [
    { airline: "JetBlue Airways", airlineCode: "B6", flightNumber: "B6 287", departMinutes: hm(8, 30), arriveMinutes: hm(12, 5), arrivalDayOffset: 0, stops: 0 },
    { airline: "Delta Air Lines", airlineCode: "DL", flightNumber: "DL 358", departMinutes: hm(13, 50), arriveMinutes: hm(17, 25), arrivalDayOffset: 0, stops: 0 },
    { airline: "American Airlines", airlineCode: "AA", flightNumber: "AA 33", departMinutes: hm(17, 40), arriveMinutes: hm(21, 18), arrivalDayOffset: 0, stops: 0 },
  ],
  "JFK-MCO": [
    { airline: "JetBlue Airways", airlineCode: "B6", flightNumber: "B6 15", departMinutes: hm(9, 0), arriveMinutes: hm(11, 55), arrivalDayOffset: 0, stops: 0 },
    { airline: "Delta Air Lines", airlineCode: "DL", flightNumber: "DL 2118", departMinutes: hm(14, 20), arriveMinutes: hm(17, 16), arrivalDayOffset: 0, stops: 0 },
    { airline: "American Airlines", airlineCode: "AA", flightNumber: "AA 1618", departMinutes: hm(19, 35), arriveMinutes: hm(22, 30), arrivalDayOffset: 0, stops: 0 },
  ],
};

/** Return leg flight numbers are conventionally the outbound number + 1. */
function mirrorEntry(e: ScheduleEntry): ScheduleEntry {
  const parts = e.flightNumber.split(" ");
  const num = Number(parts[1] ?? "0");
  const width = (parts[1] ?? "0").length;
  const mirrored = String(num + 1).padStart(width, "0");
  const blockMinutes =
    e.arriveMinutes + e.arrivalDayOffset * 1440 - e.departMinutes;
  // Shift the return departure into the opposite half of the day, stable and deterministic.
  const departMinutes = (e.departMinutes + 720) % 1440;
  const totalArrive = departMinutes + blockMinutes;
  return {
    airline: e.airline,
    airlineCode: e.airlineCode,
    flightNumber: `${parts[0]} ${mirrored}`,
    departMinutes,
    arriveMinutes: totalArrive % 1440,
    arrivalDayOffset: Math.floor(totalArrive / 1440),
    stops: e.stops,
  };
}

/**
 * Look up standardized schedules for a directed route.
 * Falls back to the mirrored catalog entry when only the reverse is listed.
 */
export function getSchedules(origin: string, destination: string): ScheduleEntry[] | null {
  const o = origin.toUpperCase();
  const d = destination.toUpperCase();
  const direct = CATALOG[`${o}-${d}`];
  if (direct) return direct;
  const reverse = CATALOG[`${d}-${o}`];
  if (reverse) return reverse.map(mirrorEntry);
  return null;
}

export function hasSchedules(origin: string, destination: string): boolean {
  return getSchedules(origin, destination) !== null;
}
