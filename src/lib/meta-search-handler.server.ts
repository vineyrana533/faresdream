import { z } from "zod";
import { BRAND_SLUG, buildResults, type MetaSearchRequest } from "./meta-search.server";

const iata = z
  .string()
  .trim()
  .regex(/^[A-Za-z]{3}$/, "Must be a 3-letter IATA code")
  .transform((v) => v.toUpperCase());

const isoDate = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD");

const requestSchema = z.object({
  search_id: z.string().trim().min(1).max(120),
  trip_type: z.enum(["round_trip", "one_way"]),
  origin: iata,
  destination: iata,
  departure_date: isoDate,
  return_date: isoDate.nullish(),
  passengers: z
    .object({
      adults: z.number().int().min(1).max(9),
      children: z.number().int().min(0).max(8).default(0),
      infants: z.number().int().min(0).max(8).default(0),
    })
    .default({ adults: 1, children: 0, infants: 0 }),
  cabin_class: z.enum(["economy", "premium_economy", "business", "first"]).default("economy"),
  currency: z.string().trim().min(3).max(6).default("USD"),
});

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type, x-api-key",
  "access-control-allow-methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

export function metaSearchOptions() {
  return new Response(null, { status: 204, headers: JSON_HEADERS });
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function handleMetaSearch(request: Request): Promise<Response> {
  const expected = process.env["META_SEARCH_API_KEY"];
  if (!expected) {
    return json({ error: "supplier_api_unconfigured" }, 503);
  }

  const provided = request.headers.get("x-api-key") ?? "";
  if (!provided || !safeEqual(provided, expected)) {
    return json({ error: "unauthorized", message: "Missing or invalid x-api-key header." }, 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_json", message: "Request body must be valid JSON." }, 400);
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      { error: "invalid_request", issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })) },
      400,
    );
  }

  const input = parsed.data;
  const req: MetaSearchRequest = {
    search_id: input.search_id,
    trip_type: input.trip_type,
    origin: input.origin,
    destination: input.destination,
    departure_date: input.departure_date,
    return_date: input.trip_type === "round_trip" ? (input.return_date ?? null) : null,
    passengers: input.passengers,
    cabin_class: input.cabin_class,
    currency: input.currency.toUpperCase(),
  };

  return json({
    search_id: req.search_id,
    partner_id: BRAND_SLUG,
    timestamp: new Date().toISOString(),
    results: await buildResults(req),
  });
}
