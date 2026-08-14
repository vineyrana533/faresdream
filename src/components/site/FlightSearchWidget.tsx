import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowLeftRight, Search } from "lucide-react";
import { AirportAutocomplete } from "@/components/site/AirportAutocomplete";
import { DatePickerField } from "@/components/site/DatePickerField";
import { FLIGHT_SEARCH_ID } from "@/lib/focus-search";

export const DEFAULT_CURRENCY = "USD";

type Cabin = "Economy" | "PremiumEconomy" | "Business" | "First";

const pillCls =
  "min-w-0 cursor-pointer rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-navy outline-none focus:border-primary sm:text-sm";

export function FlightSearchWidget() {
  const navigate = useNavigate();
  const [trip, setTrip] = useState<"round" | "one">("round");
  const [origin, setOrigin] = useState("JFK");
  const [destination, setDestination] = useState("MIA");
  const [date, setDate] = useState<Date>(new Date());
  const [returnDate, setReturnDate] = useState<Date>(new Date());
  const [passengers, setPassengers] = useState(1);
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
        passengers,
        cabin,
        currency: DEFAULT_CURRENCY,
      },
    });

  return (
    <div
      id={FLIGHT_SEARCH_ID}
      className="rounded-3xl bg-card p-3 text-left text-card-foreground shadow-lux sm:p-4"
    >
      {/* Top row: trip type / passengers / cabin */}
      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1">
        <select
          aria-label="Trip type"
          value={trip}
          onChange={(e) => setTrip(e.target.value as "round" | "one")}
          className={pillCls}
        >
          <option value="round">Round-trip</option>
          <option value="one">One-way</option>
        </select>
        <select
          aria-label="Passengers"
          value={passengers}
          onChange={(e) => setPassengers(Number(e.target.value))}
          className={pillCls}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "Traveler" : "Travelers"}
            </option>
          ))}
        </select>
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

    </div>
  );
}
