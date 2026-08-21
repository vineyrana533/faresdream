/**
 * Persistent affiliate click tracking.
 *
 * EazAir sends visitors with `?source=eazair&click_id=EZ-XXXXX&route=MIA-ORD`.
 * The values must survive the whole checkout journey (multi-page, refreshes),
 * so they are stored for the session and read back at booking time.
 * Empty values never overwrite an already-captured one.
 */

const CLICK_ID_KEY = "fd:click_id";
const UTM_SOURCE_KEY = "fd:utm_source";
const ROUTE_KEY = "fd:route";
const LEGACY_CLICK_ID_KEY = "bcd:click_id";
const LEGACY_UTM_SOURCE_KEY = "bcd:utm_source";
const MAX_LEN = 160;

const write = (key: string, value: string) => {
  const v = value.trim().slice(0, MAX_LEN);
  if (!v) return; // never clobber a stored value with an empty one
  try {
    sessionStorage.setItem(key, v);
  } catch {
    /* storage unavailable */
  }
  try {
    localStorage.setItem(key, v);
  } catch {
    /* storage unavailable */
  }
};

const read = (key: string, legacyKey?: string): string => {
  try {
    const v = sessionStorage.getItem(key) ?? localStorage.getItem(key);
    if (v) return v;
  } catch {
    /* storage unavailable */
  }
  if (!legacyKey) return "";
  try {
    return localStorage.getItem(legacyKey) ?? "";
  } catch {
    return "";
  }
};

/** Reads `click_id` / `source` / `utm_source` / `route` off the URL and persists them. */
export const captureClickId = () => {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  write(CLICK_ID_KEY, params.get("click_id") ?? "");
  write(UTM_SOURCE_KEY, params.get("utm_source") ?? params.get("source") ?? "");
  write(ROUTE_KEY, params.get("route") ?? "");
};

export const getClickId = (): string =>
  typeof window === "undefined" ? "" : read(CLICK_ID_KEY, LEGACY_CLICK_ID_KEY);

export const getUtmSource = (): string =>
  typeof window === "undefined" ? "" : read(UTM_SOURCE_KEY, LEGACY_UTM_SOURCE_KEY);

export const getAffiliateRoute = (): string =>
  typeof window === "undefined" ? "" : read(ROUTE_KEY);
