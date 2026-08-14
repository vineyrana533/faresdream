export type FlightSearch = {
  origin: string;
  destination: string;
  departDate: string;
  airline: string;
  flightNo: string;
  cabin: string;
  currency: string;
  price: string;
  utm_source?: string;
  click_id?: string;
  promo_code?: string;
  discount_val?: string;
  discount_type?: string;
  discount_pct?: string;
  discount_amount?: string;
  original_price?: string;
  final_price?: string;
};

const str = (v: unknown, fallback: string) => {
  if (typeof v === "number") return String(v);
  return typeof v === "string" && v.trim() !== "" ? v : fallback;
};

export const parseFlightSearch = (search: Record<string, unknown>): FlightSearch => ({
  origin: str(search["origin"], "JFK"),
  destination: str(search["destination"], "MIA"),
  departDate: str(search["departDate"], "2026-08-19"),
  airline: str(search["airline"], "Emirates"),
  flightNo: str(search["flightNo"], "EK 204"),
  cabin: str(search["cabin"], "Business"),
  currency: str(search["currency"], "USD"),
  price: str(search["price"], "1289"),
  ...(str(search["utm_source"], "") ? { utm_source: str(search["utm_source"], "") } : {}),
  ...(str(search["click_id"], "") ? { click_id: str(search["click_id"], "") } : {}),
  ...(str(search["promo_code"], "") ? { promo_code: str(search["promo_code"], "") } : {}),
  ...(str(search["discount_val"], "") ? { discount_val: str(search["discount_val"], "") } : {}),
  ...(str(search["discount_type"], "") ? { discount_type: str(search["discount_type"], "") } : {}),
  ...(str(search["discount_pct"], "") ? { discount_pct: str(search["discount_pct"], "") } : {}),
  ...(str(search["discount_amount"], "")
    ? { discount_amount: str(search["discount_amount"], "") }
    : {}),
  ...(str(search["original_price"], "")
    ? { original_price: str(search["original_price"], "") }
    : {}),
  ...(str(search["final_price"], "") ? { final_price: str(search["final_price"], "") } : {}),
});


export const currencySymbol = (c: string) =>
  ({ USD: "$", EUR: "€", GBP: "£", INR: "₹", AED: "AED " })[c.toUpperCase()] ?? `${c} `;
