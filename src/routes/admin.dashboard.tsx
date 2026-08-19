import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  adminLogout,
  adminSessionStatus,
  getAdminBookings,
  updateBookingStatus,
  type AdminBookingRow,
} from "@/lib/bookings.functions";
import { LeadsSection } from "@/components/admin/LeadsSection";
import { VerificationSection } from "@/components/admin/VerificationSection";
import {
  LayoutDashboard,
  ShieldCheck,
  Inbox,
  Link2,
  Ticket,
  TrendingUp,
  Users,
  Percent,
  DollarSign,
  LogOut,
  Loader2,
  X,
} from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Dashboard — EAZAIR Reconciliation | FaresDream" },
      {
        name: "description",
        content:
          "Data-dense admin dashboard with gross bookings value, net revenue yield, EAZAIR affiliate referrals and checkout conversion tracking.",
      },
      { property: "og:title", content: "Admin Dashboard — Affiliate Reconciliation" },
      {
        property: "og:description",
        content: "Track EAZAIR referral traffic, PNR queue and API health in one console.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

const NAV = [
  { label: "Overview", hash: "overview", icon: LayoutDashboard },
  { label: "All Bookings", hash: "reconciliation", icon: Link2 },
  { label: "PNR Queue", hash: "pnr-queue", icon: Ticket },
  { label: "Leads & Quotes", hash: "leads", icon: Inbox },
  { label: "Verification", hash: "verification", icon: ShieldCheck },
] as const;

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending Ticketing" },
  { value: "issued", label: "Ticketed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

function bookingSource(b: AdminBookingRow) {
  return (b.source || b.utm_source || "direct").toUpperCase();
}

function SourceBadge({ source }: { source: string }) {
  const cls =
    source === "EAZAIR"
      ? "bg-emerald-100 text-emerald-700"
      : source === "DIRECT"
        ? "bg-gold/15 text-navy ring-1 ring-gold/40"
        : "bg-secondary text-muted-foreground";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${cls}`}>
      {source}
    </span>
  );
}

function Sidebar({ onSignOut }: { onSignOut: () => void }) {
  return (
    <aside className="bg-navy text-navy-foreground lg:min-h-[100dvh]">
      <div className="px-4 py-5">
        <p className="font-display text-base font-semibold">Mission Control</p>
        <p className="text-[11px] uppercase tracking-widest text-navy-foreground/60">
          FaresDream
        </p>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-2 pb-4 lg:flex-col lg:overflow-visible">
        {NAV.map((n) => (
          <a
            key={n.label}
            href={`#${n.hash}`}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-navy-foreground/80 transition hover:bg-white/10"
          >
            <n.icon className="size-4" />
            {n.label}
          </a>
        ))}
        <button
          onClick={onSignOut}
          className="mt-1 inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-navy-foreground/80 transition hover:bg-white/10"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </nav>
    </aside>
  );
}

function Kpi({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof TrendingUp;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <span className="grid size-8 place-items-center rounded-lg bg-navy text-navy-foreground">
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-2 font-display text-2xl font-semibold text-navy">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-2 last:border-0">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="max-w-[60%] text-right text-sm font-semibold text-navy">{value || "—"}</span>
    </div>
  );
}

function DetailsPanel({
  booking,
  onClose,
  onStatusChange,
  saving,
}: {
  booking: AdminBookingRow;
  onClose: () => void;
  onStatusChange: (status: string) => void;
  saving: boolean;
}) {
  const address = [
    booking.billing_address,
    booking.billing_city,
    booking.billing_postal_code,
    booking.billing_country,
  ]
    .filter(Boolean)
    .join(", ");
  const total = Number(booking.total_price);

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-navy/60" />
      <div className="relative h-full w-full max-w-md overflow-y-auto border-l border-border bg-card p-5 shadow-lux">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">
              Booking details
            </p>
            <h2 className="font-display text-xl font-semibold text-navy">
              {booking.pnr ?? "No PNR"}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-3">
          <SourceBadge source={bookingSource(booking)} />
        </div>

        <section className="mt-5">
          <h3 className="font-display text-sm font-semibold text-navy">Passenger contact</h3>
          <div className="mt-1.5">
            <Row label="Name" value={booking.lead_name ?? ""} />
            <Row label="Email" value={booking.guest_email ?? ""} />
            <Row label="Phone" value={booking.guest_phone ?? ""} />
            <Row label="Billing address" value={address} />
          </div>
        </section>

        <section className="mt-5">
          <h3 className="font-display text-sm font-semibold text-navy">Flight details</h3>
          <div className="mt-1.5">
            <Row label="PNR" value={booking.pnr ?? ""} />
            <Row label="Route" value={`${booking.origin} → ${booking.destination}`} />
            <Row label="Airline" value={booking.airline ?? ""} />
            <Row label="Cabin" value={booking.cabin_class ?? ""} />
            <Row label="Travel date" value={booking.depart_date ?? ""} />
            <Row label="Return" value={booking.return_date ?? ""} />
            <Row label="Booked on" value={new Date(booking.created_at).toLocaleString()} />
          </div>
        </section>

        <section className="mt-5">
          <h3 className="font-display text-sm font-semibold text-navy">Financials</h3>
          <div className="mt-1.5">
            <Row
              label="Total price"
              value={`${booking.currency} ${total.toLocaleString()}`}
            />
            <Row label="Promo code" value={booking.promo_code ?? ""} />
            <Row
              label="Promo discount"
              value={`${booking.currency} ${Number(booking.promo_discount).toLocaleString()}`}
            />
            <Row
              label="Commission (12% yield)"
              value={`${booking.currency} ${Math.round(total * 0.12).toLocaleString()}`}
            />
            <Row label="Click ID" value={booking.click_id ?? ""} />
          </div>
        </section>

        <section className="mt-5">
          <h3 className="font-display text-sm font-semibold text-navy">Status</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((s) => {
              const active = booking.status === s.value;
              return (
                <button
                  key={s.value}
                  disabled={saving || active}
                  onClick={() => onStatusChange(s.value)}
                  className={`rounded-xl px-3 py-2 text-xs font-bold transition disabled:opacity-70 ${
                    active
                      ? "bg-navy text-navy-foreground"
                      : "border border-border bg-background text-navy hover:border-gold"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
          {saving ? (
            <p className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" /> Saving…
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchBookings = useServerFn(getAdminBookings);
  const logout = useServerFn(adminLogout);
  const sessionStatus = useServerFn(adminSessionStatus);
  const setStatus = useServerFn(updateBookingStatus);
  const [openId, setOpenId] = useState<string | null>(null);

  const session = useQuery({
    queryKey: ["admin-session"],
    queryFn: () => sessionStatus(),
    retry: false,
    staleTime: 60_000,
  });

  const { data, isError } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: () => fetchBookings(),
    retry: false,
    enabled: session.data?.admin === true,
  });

  const statusMutation = useMutation({
    mutationFn: (vars: { id: string; status: string }) =>
      setStatus({ data: { id: vars.id, status: vars.status as "pending" } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-bookings"] }),
  });

  const signedOut =
    session.isError || session.data?.admin === false || isError || data?.authorized === false;

  if (session.isPending) {
    return (
      <div className="grid min-h-[100dvh] place-items-center bg-secondary/60 px-4">
        <Loader2 className="size-6 animate-spin text-gold" />
      </div>
    );
  }

  if (signedOut) {
    return (
      <div className="grid min-h-[100dvh] place-items-center bg-secondary/60 px-4 text-center">
        <div>
          <h1 className="font-display text-xl font-semibold text-navy">Session expired</h1>
          <p className="mt-1 text-sm text-muted-foreground">Please sign in again to view the console.</p>
          <Link
            to="/admin"
            className="mt-4 inline-flex rounded-xl bg-gold px-5 py-3 text-sm font-bold text-gold-foreground"
          >
            Go to admin sign-in
          </Link>
        </div>
      </div>
    );
  }

  const all = data?.rows ?? [];

  const gbv = all.reduce((sum, b) => sum + Number(b.total_price), 0);
  const netRevenue = gbv * 0.12;
  const referrals = all.filter((b) => bookingSource(b) === "EAZAIR").length;
  const conversion = all.length
    ? (all.filter((b) => b.status !== "pending").length / all.length) * 100
    : 0;
  const openBooking = all.find((b) => b.id === openId) ?? null;

  return (
    <div className="grid bg-secondary/60 lg:grid-cols-[260px_minmax(0,1fr)]">
      <Sidebar
        onSignOut={async () => {
          await logout();
          navigate({ to: "/admin", replace: true });
        }}
      />

      <main id="overview" className="min-w-0 px-4 py-6 pb-24 lg:px-6">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">Overview</p>
            <h1 className="font-display text-2xl font-semibold text-navy">
              Performance &amp; reconciliation
            </h1>
            <p className="text-sm text-muted-foreground">
              Live booking economics across direct and affiliate channels.
            </p>
          </div>
          <Link to="/" className="text-xs font-semibold text-navy underline">
            Back to site
          </Link>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi
            label="Gross Bookings Value"
            value={`$${Math.round(gbv).toLocaleString()}`}
            sub={`${all.length} bookings tracked`}
            icon={DollarSign}
          />
          <Kpi
            label="Net Revenue"
            value={`$${Math.round(netRevenue).toLocaleString()}`}
            sub="Estimated 12% yield on GBV"
            icon={TrendingUp}
          />
          <Kpi
            label="Total EAZAIR Referrals"
            value={String(referrals)}
            sub="Attributed via utm_source"
            icon={Users}
          />
          <Kpi
            label="Checkout Conversion"
            value={`${conversion.toFixed(1)}%`}
            sub="Issued vs. started checkouts"
            icon={Percent}
          />
        </div>

        <section
          id="reconciliation"
          className="mt-6 rounded-2xl border border-border bg-card shadow-card"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
            <h2 className="font-display text-base font-semibold text-navy">
              All Bookings &amp; PNR Queue
            </h2>
            <span className="text-xs text-muted-foreground">{all.length} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-secondary text-[11px] uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">PNR</th>
                  <th className="px-4 py-2.5 font-semibold">Date</th>
                  <th className="px-4 py-2.5 font-semibold">Route</th>
                  <th className="px-4 py-2.5 font-semibold">Passenger</th>
                  <th className="px-4 py-2.5 font-semibold">Total Price</th>
                  <th className="px-4 py-2.5 font-semibold">Source</th>
                  <th className="px-4 py-2.5 font-semibold">Status</th>
                  <th className="px-4 py-2.5 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody>
                {all.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-xs text-muted-foreground">
                      No bookings recorded yet. Direct checkouts and referred checkouts (with
                      <code className="mx-1 rounded bg-secondary px-1">
                        ?utm_source=EAZAIR&amp;click_id=…
                      </code>
                      ) both land here.
                    </td>
                  </tr>
                ) : (
                  all.map((b) => (
                    <tr key={b.id} className="border-t border-border">
                      <td className="px-4 py-3 font-semibold text-navy">{b.pnr ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(b.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {b.origin} → {b.destination}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {b.lead_name ?? b.guest_email ?? "—"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-navy">
                        {b.currency} {Number(b.total_price).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <SourceBadge source={bookingSource(b)} />
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold capitalize text-navy">
                        {b.status}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setOpenId(b.id)}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-navy transition hover:border-gold"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section
          id="pnr-queue"
          className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-card"
        >
          <h2 className="font-display text-base font-semibold text-navy">PNR Queue</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {all.length
              ? `${all.filter((b) => b.status === "pending").length} bookings awaiting ticketing.`
              : "No bookings in the ticketing queue."}
          </p>
        </section>

        <LeadsSection />
        <VerificationSection />
      </main>

      {openBooking ? (
        <DetailsPanel
          booking={openBooking}
          saving={statusMutation.isPending}
          onClose={() => setOpenId(null)}
          onStatusChange={(status) => statusMutation.mutate({ id: openBooking.id, status })}
        />
      ) : null}
    </div>
  );
}
