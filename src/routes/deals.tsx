import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, Card, Pill } from "@/components/site/ui";
import { Flame } from "lucide-react";

export const Route = createFileRoute("/deals")({
  head: () => ({
    meta: [
      { title: "Live Unpublished AsairSpaces | AsairSpace" },
      {
        name: "description",
        content:
          "Filterable live unpublished business class fare promotions across 47+ partner airlines, updated daily with expiry countdowns.",
      },
      { property: "og:title", content: "Live Unpublished AsairSpaces" },
      { property: "og:description", content: "Filter live premium cabin promos by airline and cabin class." },
    ],
  }),
  component: DealsPage,
});

function DealsPage() {
  const [airline, setAirline] = useState("All");
  const { data, isLoading } = useQuery({
    queryKey: ["deals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .order("price", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const deals = data ?? [];
  const airlineList = ["All", ...Array.from(new Set(deals.map((d) => d.airline)))];
  const filtered = airline === "All" ? deals : deals.filter((d) => d.airline === airline);

  return (
    <PageShell
      eyebrow="Deals Center"
      title="Live unpublished fares"
      subtitle="Private inventory released daily. Prices shown per person, including taxes and fees."
    >
      <div className="mb-4 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {airlineList.map((a) => (
          <button
            key={a}
            onClick={() => setAirline(a)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
              airline === a ? "bg-navy text-navy-foreground" : "bg-card text-muted-foreground border border-border"
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading live fares…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
            <Card key={d.id}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-display text-lg font-semibold text-navy">
                    {d.origin} → {d.destination}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {d.airline} · {d.cabin_class}
                  </p>
                </div>
                <Pill>
                  <Flame className="size-3 text-gold" /> Live
                </Pill>
              </div>
              <p className="mt-3 font-display text-2xl font-semibold text-navy">
                ${Number(d.price).toLocaleString()}
              </p>
              {d.expires_at ? (
                <p className="text-[11px] text-muted-foreground">
                  Expires {new Date(d.expires_at).toLocaleDateString()}
                </p>
              ) : null}
              <Link
                to="/flight/fare-details"
                search={{
                  origin: d.origin,
                  destination: d.destination,
                  departDate: "2026-08-19",
                  airline: d.airline,
                  flightNo: "—",
                  cabin: d.cabin_class,
                  currency: d.currency,
                  price: String(d.price),
                }}
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-gold px-5 py-2.5 text-sm font-bold text-gold-foreground"
              >
                View fare
              </Link>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
