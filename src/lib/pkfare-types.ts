/** Shared PKFARE types — safe to import from client and server code. */

export interface PkfareSearchQuery {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string | undefined;
  adults?: number | undefined;
  children?: number | undefined;
  infants?: number | undefined;
  cabinClass?: "Economy" | "PremiumEconomy" | "Business" | "First" | undefined;
  currency?: string | undefined;
  solutions?: number | undefined;
  /** Optional 2-letter carrier hint passed straight to the provider. */
  airline?: string | undefined;
}

/** Raw Shopping V4 shapes. Flights/segments arrive as flat pools keyed by id. */
export interface PkfareRawSegment {
  segmentId: string;
  airline: string;
  flightNum: string;
  cabinClass?: string | null;
  departure: string;
  arrival: string;
  flightTime?: number | null;
  strDepartureDate?: string | null;
  strDepartureTime?: string | null;
  strArrivalDate?: string | null;
  strArrivalTime?: string | null;
  departureDate?: number | null;
  arrivalDate?: number | null;
  equipment?: string | null;
  aircraftCode?: string | null;
}

export interface PkfareRawFlight {
  flightId: string;
  journeyTime?: number | null;
  transferCount?: number | null;
  /** The provider really does misspell this; older payloads use `segmentIds`. */
  segmengtIds?: string[];
  segmentIds?: string[];
}

export interface PkfareRawSolution {
  solutionId?: string;
  solutionKey?: string;
  currency?: string;
  adtFare?: number;
  adtTax?: number;
  chdFare?: number;
  chdTax?: number;
  infFare?: number;
  infTax?: number;

  tktFee?: number;
  platingCarrier?: string;
  journeys?: Record<string, string[]>;
  refundable?: boolean | null;
}

export interface PkfareSearchResponse {
  errorCode?: string | number;
  errorMsg?: string | undefined;
  data?: {
    solutions?: PkfareRawSolution[];
    flights?: PkfareRawFlight[];
    segments?: PkfareRawSegment[];
  };
}


export interface PkfareNormalisedFare {
  id: string;
  airline: string;
  /** 2-letter plating carrier code, used for airline + alliance filters. */
  carrierCode: string;
  flightNo: string;
  origin: string;
  destination: string;
  departDate: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  /** Total trip minutes including layovers. */
  durationMinutes: number;
  /** Departure time as minutes since midnight. */
  departMinutes: number;
  /** Arrival time as minutes since midnight. */
  arriveMinutes: number;
  /** Longest single layover in minutes (0 when non-stop). */
  maxLayoverMinutes: number;
  cabin: string;
  currency: string;
  price: number;
  refundable: boolean;
  stops: number;
}
