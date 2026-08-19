import { Fragment, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { getAdminLeads, updateLead, type CrmLeadRow } from "@/lib/admin-crm.functions";

const STATUSES = ["new", "contacted", "converted", "closed"] as const;

export function LeadsSection() {
  const fetchLeads = useServerFn(getAdminLeads);
  const saveLead = useServerFn(updateLead);
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | (typeof STATUSES)[number]>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const { data, isPending } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: () => fetchLeads(),
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: (vars: {
      id: string;
      kind: CrmLeadRow["kind"];
      crm_status: (typeof STATUSES)[number];
      admin_notes?: string;
    }) => saveLead({ data: vars }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-leads"] }),
  });

  const rows = (data?.authorized ? data.rows : []).filter(
    (l) => filter === "all" || l.crm_status === filter,
  );

  return (
    <section id="leads" className="mt-6 rounded-2xl border border-border bg-card shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 className="font-display text-base font-semibold text-navy">
          Leads &amp; Quote Requests
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {(["all", ...STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-bold capitalize transition ${
                filter === s
                  ? "bg-navy text-navy-foreground"
                  : "border border-border text-muted-foreground hover:border-gold"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-secondary text-[11px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 font-semibold">Date</th>
              <th className="px-4 py-2.5 font-semibold">Type</th>
              <th className="px-4 py-2.5 font-semibold">Customer</th>
              <th className="px-4 py-2.5 font-semibold">Contact</th>
              <th className="px-4 py-2.5 font-semibold">Route</th>
              <th className="px-4 py-2.5 font-semibold">Cabin</th>
              <th className="px-4 py-2.5 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {isPending ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-xs text-muted-foreground">
                  <Loader2 className="mx-auto size-4 animate-spin" />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-xs text-muted-foreground">
                  No leads captured yet.
                </td>
              </tr>
            ) : (
              rows.map((l) => (
                <Fragment key={l.id}>
                  <tr className="border-t border-border align-top">
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(l.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-xs font-bold capitalize text-navy">{l.kind}</td>
                    <td className="px-4 py-3 font-semibold text-navy">
                      {l.name || "—"}
                      {l.company ? (
                        <span className="block text-xs font-normal text-muted-foreground">
                          {l.company}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {l.email}
                      {l.phone ? <span className="block">{l.phone}</span> : null}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold">{l.route || "—"}</td>
                    <td className="px-4 py-3 text-xs">{l.cabin ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <select
                          value={l.crm_status}
                          onChange={(e) =>
                            mutation.mutate({
                              id: l.id,
                              kind: l.kind,
                              crm_status: e.target.value as (typeof STATUSES)[number],
                              ...(l.admin_notes ? { admin_notes: l.admin_notes } : {}),
                            })
                          }
                          className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-semibold capitalize text-navy"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            setOpenId(openId === l.id ? null : l.id);
                            setNotes(l.admin_notes ?? "");
                          }}
                          className="rounded-lg border border-border px-2 py-1 text-xs font-bold text-navy hover:border-gold"
                        >
                          Notes
                        </button>
                      </div>
                    </td>
                  </tr>
                  {openId === l.id ? (
                    <tr className="border-t border-border bg-secondary/40">
                      <td colSpan={7} className="px-4 py-3">
                        {l.notes ? (
                          <p className="mb-2 text-xs text-muted-foreground">
                            Customer note: {l.notes}
                          </p>
                        ) : null}
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={3}
                          placeholder="Internal follow-up notes…"
                          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-gold"
                        />
                        <button
                          onClick={() =>
                            mutation.mutate({
                              id: l.id,
                              kind: l.kind,
                              crm_status: l.crm_status as (typeof STATUSES)[number],
                              admin_notes: notes,
                            })
                          }
                          disabled={mutation.isPending}
                          className="mt-2 rounded-xl bg-gold px-4 py-2 text-xs font-bold text-gold-foreground disabled:opacity-60"
                        >
                          Save notes
                        </button>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
