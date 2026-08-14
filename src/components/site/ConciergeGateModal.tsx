import { X, Sparkles, User, ShieldCheck, History } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function ConciergeGateModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center px-4">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-navy/75 backdrop-blur-sm" />
      <div className="relative w-full max-w-md rounded-2xl border border-gold/25 bg-navy p-6 text-navy-foreground shadow-lux">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 grid size-8 place-items-center rounded-lg border border-white/20 text-navy-foreground/70 hover:text-gold"
        >
          <X className="size-4" />
        </button>

        <span className="grid size-11 place-items-center rounded-xl bg-gold text-gold-foreground">
          <Sparkles className="size-5" />
        </span>
        <h2 className="mt-4 font-display text-2xl font-semibold">
          Your Personal 24/7 Travel Concierge
        </h2>
        <p className="mt-2 text-sm text-navy-foreground/70">
          Sign in to open your private concierge — it knows premium cabins inside out and keeps
          every trip conversation saved to your account.
        </p>

        <ul className="mt-4 space-y-2 text-xs text-navy-foreground/70">
          <li className="flex items-center gap-2">
            <History className="size-4 text-gold" /> Your trip planning history, always there
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-gold" /> Private desk quotes on unpublished fares
          </li>
        </ul>

        <Link
          to="/auth"
          search={{ next: "/concierge" }}
          onClick={onClose}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-bold text-gold-foreground"
        >
          <User className="size-4" /> Sign in to continue
        </Link>
      </div>
    </div>
  );
}
