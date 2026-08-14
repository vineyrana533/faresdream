import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function DatePickerField({
  label = "Dates",
  value,
  onChange,
  displayFormat = "dd-MM-yyyy",
}: {
  label?: string;
  displayFormat?: string;
  value: Date;
  onChange: (d: Date) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative z-20 flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 text-left sm:py-2"
        >
          <span className="shrink-0 text-primary">
            <CalendarDays className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {label}
            </span>
            <span className="block truncate text-sm font-semibold text-foreground">
              {format(value, displayFormat)}
            </span>
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(d) => {
            if (d) {
              onChange(d);
              setOpen(false);
            }
          }}
          disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}
