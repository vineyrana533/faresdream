import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, useSession } from "@tanstack/react-start/server";
import { z } from "zod";

const bookingInput = z.object({
  pnr: z.string().min(3).max(32),
  origin: z.string().min(3).max(4),
  destination: z.string().min(3).max(4),
  airline: z.string().max(120).optional(),
  cabinClass: z.string().max(40).optional(),
  departDate: z.string().max(20).optional(),
  totalPrice: z.number().nonnegative(),
  currency: z.string().min(3).max(6),
  utmSource: z.string().max(80).optional(),
  clickId: z.string().max(160).optional(),
  promoCode: z.string().max(60).optional(),
  promoDiscount: z.number().nonnegative().optional(),
  guestEmail: z.string().max(160).optional(),
  guestPhone: z.string().max(60).optional(),
  billingAddress: z.string().max(240).optional(),
  billingCity: z.string().max(120).optional(),
  billingCountry: z.string().max(120).optional(),
  billingPostalCode: z.string().max(40).optional(),

  passenger: z.object({
    title: z.string().max(20).optional(),
    firstName: z.string().min(1).max(80),
    lastName: z.string().min(1).max(80),
    gender: z.string().max(20).optional(),
    passportNo: z.string().max(40).optional(),
    dob: z.string().max(20).nullable().optional(),
  }),
  payment: z.object({
    method: z.string().max(40).optional(),
    amount: z.number().nonnegative(),
  }),
});

export type CreateBookingInput = z.infer<typeof bookingInput>;

/** Persists a booking with trusted backend access so guest checkouts are kept. */
export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => bookingInput.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Owner is derived from the bearer token only — never from client input.
    let userId: string | null = null;
    const auth = getRequestHeader("authorization");
    const token = auth?.replace(/^Bearer\s+/i, "");
    if (token) {
      const { data: userData } = await supabaseAdmin.auth.getUser(token);
      userId = userData.user?.id ?? null;
    }

    // Source is derived server-side: affiliate when a partner sent us the click,
    // otherwise this is an organic/direct site booking.
    const source = (data.utmSource || "").trim() ? (data.utmSource as string).trim().toLowerCase() : "direct";

    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .insert({
        pnr: data.pnr,
        user_id: userId,
        source,
        lead_name: `${data.passenger.firstName} ${data.passenger.lastName}`.trim(),
        guest_email: data.guestEmail ?? null,
        guest_phone: data.guestPhone ?? null,
        billing_address: data.billingAddress ?? null,
        billing_city: data.billingCity ?? null,
        billing_country: data.billingCountry ?? null,
        billing_postal_code: data.billingPostalCode ?? null,
        origin: data.origin,
        destination: data.destination,
        airline: data.airline ?? null,
        cabin_class: data.cabinClass ?? null,
        depart_date: data.departDate || null,
        total_price: data.totalPrice,
        currency: data.currency.toUpperCase(),
        utm_source: data.utmSource || null,
        click_id: data.clickId || null,
        promo_code: data.promoCode || null,
        promo_discount: data.promoDiscount ?? 0,
      })

      .select("id")
      .single();

    if (error || !booking) {
      console.error("[createBooking] insert failed", error);
      throw new Error("Could not save your booking. Please call us to confirm.");
    }

    const { error: paxError } = await supabaseAdmin.from("passengers").insert({
      booking_id: booking.id,
      title: data.passenger.title ?? null,
      first_name: data.passenger.firstName,
      last_name: data.passenger.lastName,
      gender: data.passenger.gender ?? null,
      passport_no: data.passenger.passportNo ?? null,
      dob: data.passenger.dob || null,
    });
    if (paxError) console.error("[createBooking] passenger insert failed", paxError);

    const { error: payError } = await supabaseAdmin.from("payments").insert({
      booking_id: booking.id,
      amount: data.payment.amount,
      currency: data.currency.toUpperCase(),
      method: data.payment.method ?? null,
      transaction_ref: data.pnr,
      status: "pending_auth",
    });
    if (payError) console.error("[createBooking] payment insert failed", payError);

    return { id: booking.id };
  });

/* ---------------------------------- admin --------------------------------- */

type AdminSession = { admin?: boolean };

function sessionConfig() {
  return {
    password: process.env["SESSION_SECRET"]!,
    name: "bcd-admin",
    maxAge: 60 * 60 * 8,
    // The preview renders the app in a cross-site iframe, where SameSite=Lax
    // cookies are never sent back. None+Secure+Partitioned keeps the session.
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none" as const,
      partitioned: true,
      path: "/",
    },
  };
}



export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ email: z.string().max(160), password: z.string().max(200) }).parse(data),
  )
  .handler(async ({ data }) => {
    const email = process.env["ADMIN_EMAIL"];
    const password = process.env["ADMIN_PASSWORD"];
    if (!email || !password) throw new Error("Admin credentials are not configured.");

    if (data.email.trim().toLowerCase() !== email.trim().toLowerCase() || data.password !== password) {
      return { ok: false as const };
    }

    const session = await useSession<AdminSession>(sessionConfig());
    await session.update({ admin: true });
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<AdminSession>(sessionConfig());
  await session.clear();
  return { ok: true as const };
});

export const adminSessionStatus = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<AdminSession>(sessionConfig());
  return { admin: session.data.admin === true };
});

export type AdminBookingRow = {
  id: string;
  pnr: string | null;
  created_at: string;
  origin: string;
  destination: string;
  airline: string | null;
  cabin_class: string | null;
  depart_date: string | null;
  return_date: string | null;
  total_price: number;
  currency: string;
  status: string;
  source: string;
  utm_source: string | null;
  click_id: string | null;
  promo_code: string | null;
  promo_discount: number;
  lead_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  billing_address: string | null;
  billing_city: string | null;
  billing_country: string | null;
  billing_postal_code: string | null;
};

export type AdminBookingsResult =
  | { authorized: false; rows: [] }
  | { authorized: true; rows: AdminBookingRow[] };

const ADMIN_BOOKING_COLUMNS =
  "id, pnr, created_at, origin, destination, airline, cabin_class, depart_date, return_date, total_price, currency, status, source, utm_source, click_id, promo_code, promo_discount, lead_name, guest_email, guest_phone, billing_address, billing_city, billing_country, billing_postal_code";

export const getAdminBookings = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminBookingsResult> => {
    const session = await useSession<AdminSession>(sessionConfig());
    if (session.data.admin !== true) return { authorized: false, rows: [] };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select(ADMIN_BOOKING_COLUMNS)
      .order("created_at", { ascending: false })
      .limit(300);

    if (error) {
      console.error("[getAdminBookings] read failed", error);
      throw new Error("Could not load bookings.");
    }
    return { authorized: true, rows: (data ?? []) as AdminBookingRow[] };
  },
);

/** Admin-session guarded status change for the PNR queue. */
export const updateBookingStatus = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending", "issued", "cancelled", "refunded"]),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const session = await useSession<AdminSession>(sessionConfig());
    if (session.data.admin !== true) return { ok: false as const };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("bookings")
      .update({ status: data.status })
      .eq("id", data.id);

    if (error) {
      console.error("[updateBookingStatus] update failed", error);
      throw new Error("Could not update the booking status.");
    }
    return { ok: true as const };
  });


