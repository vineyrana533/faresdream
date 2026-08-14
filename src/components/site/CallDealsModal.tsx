import { useEffect, useState } from "react";
import { Phone, Star, Award } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import agentAsset from "@/assets/agent-avatar.jpg.asset.json";
import { PHONE_DISPLAY, PHONE_TEL, PROMO_CODE } from "@/lib/brand";

const SEEN_KEY = "fd-call-modal-seen";

export function CallDealsModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(SEEN_KEY)) return;

    const show = () => {
      if (window.sessionStorage.getItem(SEEN_KEY)) return;
      window.sessionStorage.setItem(SEEN_KEY, "1");
      setOpen(true);
    };

    const timer = window.setTimeout(show, 25000);
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) show();
    };
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm gap-0 p-6 text-center">
        <img
          src={agentAsset.url}
          alt="FaresDream phone booking agent"
          loading="lazy"
          width={512}
          height={512}
          className="mx-auto size-24 rounded-full object-cover"
        />
        <h2 className="mt-4 font-display text-xl font-bold text-navy">
          Better deals are one call away
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Say <span className="rounded-md bg-gold-soft px-1.5 py-0.5 font-bold text-gold">{PROMO_CODE}</span>{" "}
          and save up to $50 on phone bookings.
        </p>
        <a
          href={`tel:${PHONE_TEL}`}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition hover:brightness-110"
        >
          <Phone className="size-4" /> Call Us: {PHONE_DISPLAY}
        </a>
        <div className="mt-5 flex items-center justify-center gap-4 text-left">
          <div className="flex items-center gap-1.5">
            <span className="flex text-gold">
              {[0, 1, 2, 3].map((i) => (
                <Star key={i} className="size-3.5 fill-current" />
              ))}
            </span>
            <span className="text-[11px] font-semibold text-navy">
              Great 4.2 Stars
              <span className="block text-muted-foreground">Trustpilot</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-border px-2 py-1">
            <Award className="size-4 text-primary" />
            <span className="text-[11px] font-semibold text-navy">
              20+ Years
              <span className="block text-muted-foreground">in Business</span>
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
