import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { CURRENCIES, DEFAULT_CURRENCY } from "@/lib/brand";

type Ctx = {
  currency: string;
  symbol: string;
  setCurrency: (c: string) => void;
};

const CurrencyCtx = createContext<Ctx>({
  currency: DEFAULT_CURRENCY,
  symbol: "$",
  setCurrency: () => {},
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  // USD is the global default for search params, API payloads and display.
  const [currency, setCurrencyState] = useState<string>(DEFAULT_CURRENCY);

  const setCurrency = useCallback((c: string) => setCurrencyState(c.toUpperCase()), []);

  const value = useMemo<Ctx>(
    () => ({
      currency,
      symbol: CURRENCIES.find((c) => c.code === currency)?.symbol ?? "$",
      setCurrency,
    }),
    [currency, setCurrency],
  );

  return <CurrencyCtx.Provider value={value}>{children}</CurrencyCtx.Provider>;
}

export const useCurrency = () => useContext(CurrencyCtx);

export function CurrencySelect({ className = "" }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();
  return (
    <select
      aria-label="Change currency"
      value={currency}
      onChange={(e) => setCurrency(e.target.value)}
      className={`cursor-pointer rounded-full border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground outline-none focus:border-primary ${className}`}
    >
      {CURRENCIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.label}
        </option>
      ))}
    </select>
  );
}
