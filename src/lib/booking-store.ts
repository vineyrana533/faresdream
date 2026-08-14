import { createBooking } from "./bookings.functions";
import { notifyEazairWebhook } from "./eazair.functions";
import type { FlightSearch } from "./flight-search-params";



export type BookingRecord = {
  bookingId: string;
  bookingDate: string;
  title: string;
  firstName: string;
  lastName: string;
  dobDay: string;
  dobMonth: string;
  dobYear: string;
  gender: string;
  passportNo: string;
  passportExpiry: string;
  nationality: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  city: string;
  postalCode: string;
  passengers: number;
  /** Card data is never collected or stored — Stripe Elements handles it. */

  flight: FlightSearch;
  total: number;
  utmSource: string;
  clickId: string;
  promoCode: string;
  promoDiscount: number;
};


const KEY = "bcd:last-booking";

export const makeBookingId = () =>
  `TFG${Math.floor(100000 + Math.random() * 900000)}`;

export const formatBookingDate = (d = new Date()) =>
  [
    String(d.getDate()).padStart(2, "0"),
    String(d.getMonth() + 1).padStart(2, "0"),
    d.getFullYear(),
  ].join("-");

export const saveBookingLocal = (record: BookingRecord) => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(record));
  } catch {
    /* storage unavailable */
  }
};

export const readBookingLocal = (): BookingRecord | null => {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as BookingRecord) : null;
  } catch {
    return null;
  }
};

/** Persists via the backend so guest (not signed-in) checkouts are saved too. */
export const persistBooking = async (record: BookingRecord) => {
  await createBooking({
    data: {
      pnr: record.bookingId,
      origin: record.flight.origin,
      destination: record.flight.destination,
      airline: record.flight.airline,
      cabinClass: record.flight.cabin,
      departDate: record.flight.departDate,
      totalPrice: record.total,
      currency: record.flight.currency.toUpperCase(),
      utmSource: record.utmSource,
      clickId: record.clickId,
      promoCode: record.promoCode,
      promoDiscount: record.promoDiscount,
      guestEmail: record.email,
      guestPhone: record.phone,
      billingAddress: record.address,
      billingCity: record.city,
      billingCountry: record.country,
      billingPostalCode: record.postalCode,

      passenger: {
        title: record.title,
        firstName: record.firstName,
        lastName: record.lastName,
        gender: record.gender,
        passportNo: record.passportNo,
        dob:
          record.dobYear && record.dobMonth && record.dobDay
            ? `${record.dobYear}-${record.dobMonth.padStart(2, "0")}-${record.dobDay.padStart(2, "0")}`
            : null,
      },
      payment: { method: "stripe", amount: record.total },
    },
  });

  // Affiliate postback — fire-and-forget so the confirmation screen is never delayed.
  if (record.clickId) {
    void notifyEazairWebhook({
      data: {
        clickId: record.clickId,
        pnr: record.bookingId,
        amount: record.total,
        currency: record.flight.currency.toUpperCase(),
        route: `${record.flight.origin} -> ${record.flight.destination}`,
      },
    }).catch(() => {
      /* partner notification is best-effort */
    });
  }
};


