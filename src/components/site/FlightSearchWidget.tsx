import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowLeftRight, Plane, BedDouble, Umbrella, Car, Search, Phone } from "lucide-react";
import { AirportAutocomplete } from "@/components/site/AirportAutocomplete";
import { DatePickerField } from "@/components/site/DatePickerField";
import { TravelerSelector, travelerCount, type Travelers } from "@/components/site/TravelerSelector";
import { useCurrency } from "@/components/site/CurrencyContext";
import { FLIGHT_SEARCH_ID } from "@/lib/focus-search";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/brand";

export const DEFAULT_CURRENCY = "USD";

type Cabin = "Economy" | "PremiumEconomy" | "Business" | "First";
type Tab = "flights" | "hotels" | "packages" | "cars";

const TABS: { id: Tab; label: string; icon: typeof Plane }[] = [
  { id: "flights", label: "Flights", icon: Plane },
  { id: "hotels", label: "Hotels", icon: BedDouble },
  { id: "packages", label: "Packages", icon: Umbrella },
  { id: "cars", label: "Cars", icon: Car },
];

const pillCls =
  "min-w-0 cursor-pointer rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-navy outline-none focus:border-primary sm:text-sm";

export function FlightSearchWidget() {
  const navigate = useNavigate();
  const { currency } = useCurrency();
  const [tab, setTab] = useState<Tab>("flights");
  const [trip, setTrip] = useState<"round" | "one">("round");
  const [origin, setOrigin] = useState("JFK");
  const [destination, setDestination] = useState("MIA");
  const [date, setDate] = useState<Date>(new Date());
  const [returnDate, setReturnDate] = useState<Date>(new Date());
  const [travelers, setTravelers] = useState<Travelers>({ adults: 1, children: 0, infants: 0 });
  const [cabin, setCabin] = useState<Cabin>("Economy");

  const swap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const submitSearch = () =>
    navigate({
      to: "/flight/search",
      search: {
        origin,
        destination,
        date: format(date, "yyyy-MM-dd"),
        passengers: travelerCount(travelers),
        cabin,
        currency: currency || DEFAULT_CURRENCY,
      },
    });

  return (
    <div
      id={FLIGHT_SEARCH_ID}
      className="rounded-3xl bg-card p-3 text-left text-card-foreground shadow-lux sm:p-4"
    >
      {/* Service tabs */}
      <div className="grid grid-cols-4 gap-2 sm:flex sm:gap-2">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-pressed={active}
              className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-bold transition sm:flex-row sm:gap-2 sm:px-4 sm:text-sm ${
                active
                  ? "bg-primary text-primary-foreground shadow-card"
                  : "bg-secondary text-navy hover:bg-accent"
              }`}
            >
              <t.icon className="size-4 shrink-0" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab !== "flights" ? (
        <div className="mt-3 rounded-2xl border border-dashed border-primary/40 bg-secondary p-4 text-center">
          <p className="font-display text-base font-bold text-navy">
            {TABS.find((t) => t.id === tab)?.label} are booked by phone
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Our agents hold unpublished {tab} rates — call and we&apos;ll quote you in minutes.
          </p>
          <a
            href={`tel:${PHONE_TEL}`}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:brightness-110"
          >
            <Phone className="size-4" /> Call {PHONE_DISPLAY}
          </a>
        </div>
      ) : (
        <>
          {/* Trip type / travelers / cabin */}
          <div className="mt-2 flex flex-nowrap items-center gap-2 overflow-x-auto pb-1">
            <select
              aria-label="Trip type"
              value={trip}
              onChange={(e) => setTrip(e.target.value as "round" | "one")}
              className={pillCls}
            >
              <option value="round">Round-trip</option>
              <option value="one">One-way</option>
            </select>
            <TravelerSelector value={travelers} onChange={setTravelers} />
            <select
              aria-label="Cabin class"
              value={cabin}
              onChange={(e) => setCabin(e.target.value as Cabin)}
              className={pillCls}
            >
              <option value="Economy">Economy</option>
              <option value="PremiumEconomy">Premium Economy</option>
              <option value="Business">Business</option>
              <option value="First">First</option>
            </select>
          </div>

          {/* Main row */}
          <div className="mt-2 lg:flex lg:items-center lg:gap-2">
            <div className="relative flex flex-col gap-2 lg:flex-1 lg:flex-row lg:items-center">
              <AirportAutocomplete label="Origin" value={origin} onChange={setOrigin} />
              <button
                type="button"
                onClick={swap}
                aria-label="Swap origin and destination"
                className="absolute right-3 top-1/2 z-30 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-card text-primary shadow-card lg:static lg:translate-y-0 lg:shrink-0"
              >
                <ArrowLeftRight className="size-4" />
              </button>
              <AirportAutocomplete label="Destination" value={destination} onChange={setDestination} />
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 lg:mt-0 lg:flex lg:w-auto lg:shrink-0">
              <DatePickerField label="Departure" value={date} onChange={setDate} />
              {trip === "round" ? (
                <DatePickerField label="Return" value={returnDate} onChange={setReturnDate} />
              ) : null}
            </div>

            <button
              type="button"
              onClick={submitSearch}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-8 py-3 text-sm font-bold uppercase tracking-wider text-gold-foreground shadow-card transition hover:brightness-110 lg:mt-0 lg:w-auto lg:shrink-0"
            >
              <Search className="size-4" /> Search
            </button>
          </div>

          {/* Secondary phone CTA — mobile first view */}
          <a
            href={`tel:${PHONE_TEL}`}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border-2 border-primary px-4 py-2.5 text-xs font-bold text-primary transition hover:bg-accent lg:hidden"
          >
            <Phone className="size-4" /> Call for special phone deals: {PHONE_DISPLAY}
          </a>
        </>
      )}
    </div>
  );
}
