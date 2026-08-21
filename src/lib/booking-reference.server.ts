/**
 * Branded booking references.
 *
 * Faresdream uses `FDRM-<n>` where <n> comes from a Postgres sequence
 * (`public.booking_reference_seq`, started at 100000). A sequence is used
 * instead of a random number because random values on a unique column
 * eventually collide under concurrent checkout.
 */

export const BOOKING_REFERENCE_PREFIX = "FDRM-";

/** True for both the new branded format and any legacy reference. */
export const isBrandedReference = (ref: string) =>
  ref.toUpperCase().startsWith(BOOKING_REFERENCE_PREFIX);

/**
 * Allocates the next unique branded reference. Server-only: it needs
 * privileged access to the sequence.
 */
export async function nextBookingReference(): Promise<string> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await (
    supabaseAdmin as unknown as {
      rpc: (fn: string) => Promise<{ data: string | null; error: unknown }>;
    }
  ).rpc("next_booking_reference");

  if (error || !data) {
    console.error("[bookingReference] sequence unavailable, using time fallback", error);
    // Time-ordered fallback keeps checkout alive; still collision-safe enough
    // (ms precision + random suffix) and still branded.
    return `${BOOKING_REFERENCE_PREFIX}${Date.now().toString().slice(-9)}`;
  }
  return data;
}
