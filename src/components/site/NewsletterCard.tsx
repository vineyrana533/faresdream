import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";

export function NewsletterCard() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <div className="rounded-3xl bg-navy p-6 text-navy-foreground shadow-lux sm:p-10">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-grid size-12 place-items-center rounded-2xl bg-white/10 text-gold">
          <Mail className="size-6" />
        </span>
        <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
          Join our Insider-deal Club today!
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-navy-foreground/80">
          Be the first to get handpicked Faresdream discounts, error and price-drop fare alerts, and
          coupons available only to email insiders.
        </p>

        <form
          className="mx-auto mt-6 flex max-w-xl flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            setDone(true);
          }}
        >
          <label className="min-w-0 flex-1 text-left">
            <span className="sr-only">Email Address</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm text-navy-foreground outline-none placeholder:text-navy-foreground/50 focus:border-gold"
            />
          </label>
          <button
            type="submit"
            className="shrink-0 rounded-full bg-gold px-8 py-3 text-sm font-bold uppercase tracking-wider text-gold-foreground transition hover:brightness-110"
          >
            Subscribe
          </button>
        </form>

        {done ? (
          <p className="mt-3 text-sm font-semibold text-gold">
            You&apos;re in — insider fares are on the way.
          </p>
        ) : null}

        <p className="mx-auto mt-4 max-w-2xl text-[11px] leading-relaxed text-navy-foreground/60">
          We&apos;ll never share your info with anyone else. By clicking the &quot;Subscribe&quot;
          button you agree to our{" "}
          <Link to="/terms" className="underline hover:text-gold">
            Terms of Use
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="underline hover:text-gold">
            Privacy Policy
          </Link>
          . You can unsubscribe at any time.
        </p>
      </div>
    </div>
  );
}
