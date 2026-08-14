import { useEffect, useState } from "react";
import { Minus, Plus, Users } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export type Travelers = { adults: number; children: number; infants: number };

export const travelerCount = (t: Travelers) => t.adults + t.children + t.infants;

export const travelerLabel = (t: Travelers) => {
  const n = travelerCount(t);
  return `${n} ${n === 1 ? "Traveler" : "Travelers"}`;
};

function Counter({
  title,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  title: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const btn =
    "grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground transition hover:brightness-110 disabled:bg-muted disabled:text-muted-foreground";
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="font-display text-base font-bold text-navy">{title}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          aria-label={`Decrease ${title}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className={btn}
        >
          <Minus className="size-4" />
        </button>
        <span className="w-6 text-center text-base font-bold text-navy">{value}</span>
        <button
          type="button"
          aria-label={`Increase ${title}`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className={btn}
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function TravelerSelector({
  value,
  onChange,
  className = "",
}: {
  value: Travelers;
  onChange: (t: Travelers) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Travelers>(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex min-w-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-navy outline-none transition hover:border-primary sm:text-sm ${className}`}
      >
        <Users className="size-3.5 shrink-0 text-primary" />
        <span className="truncate">{travelerLabel(value)}</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md gap-0 p-5 sm:p-6">
          <h2 className="font-display text-xl font-bold text-navy">Travelers</h2>
          <div className="mt-2 divide-y divide-border">
            <Counter
              title="Adults"
              hint="Aged 18+"
              value={draft.adults}
              min={1}
              max={9}
              onChange={(adults) => setDraft((d) => ({ ...d, adults }))}
            />
            <Counter
              title="Child"
              hint="Aged 1–17"
              value={draft.children}
              min={0}
              max={8}
              onChange={(children) => setDraft((d) => ({ ...d, children }))}
            />
            <Counter
              title="Infant"
              hint="Under 1, on lap"
              value={draft.infants}
              min={0}
              max={4}
              onChange={(infants) => setDraft((d) => ({ ...d, infants }))}
            />
          </div>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            At least one traveler should be 18 years or more at the time of travel.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-primary px-5 py-3 text-sm font-bold text-primary transition hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onChange({ ...draft, adults: Math.max(1, draft.adults) });
                setOpen(false);
              }}
              className="rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:brightness-110"
            >
              Done
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
