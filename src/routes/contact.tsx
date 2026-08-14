import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { OFFICE_ADDRESS, PHONE_DISPLAY, PHONE_TEL, SUPPORT_EMAIL } from "@/lib/brand";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact FaresDream — 24/7 Flight Booking Support" },
      {
        name: "description",
        content:
          "Contact FaresDream: call +1-888-596-7882, email support@faresdream.com or message our New York travel desk and we'll respond as soon as possible.",
      },
      { property: "og:title", content: "Contact FaresDream" },
      {
        property: "og:description",
        content: "Call, email or message the FaresDream travel desk — open 24/7.",
      },
    ],
  }),
  component: ContactPage,
});

const items = [
  { icon: <MapPin className="size-4" />, text: OFFICE_ADDRESS },
  { icon: <Phone className="size-4" />, text: PHONE_DISPLAY, href: `tel:${PHONE_TEL}` },
  { icon: <Mail className="size-4" />, text: SUPPORT_EMAIL, href: `mailto:${SUPPORT_EMAIL}` },
  { icon: <Clock className="size-4" />, text: "Travel desk open 24 hours, 7 days a week" },
];

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const set = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="min-h-[100dvh] bg-secondary pb-24">
      <div className="bg-navy px-4 py-12 text-center text-navy-foreground sm:py-16">
        <h1 className="font-display text-3xl font-bold sm:text-5xl">Contact Us</h1>
        <p className="mt-2 text-sm text-navy-foreground/80 sm:text-base">
          Send us a message and we&apos;ll respond as soon as possible.
        </p>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-2">
        <div className="rounded-2xl bg-primary p-6 text-primary-foreground shadow-card sm:p-8">
          <h2 className="font-display text-2xl font-bold">Contact Information</h2>
          <div className="mt-3 h-px w-full bg-white/30" />
          <ul className="mt-6 space-y-4">
            {items.map((i) => (
              <li key={i.text} className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/60">
                  {i.icon}
                </span>
                {i.href ? (
                  <a
                    href={i.href}
                    className="min-w-0 rounded-full border border-white/60 px-4 py-2.5 text-sm font-semibold hover:bg-white/10"
                  >
                    {i.text}
                  </a>
                ) : (
                  <span className="min-w-0 rounded-full border border-white/60 px-4 py-2.5 text-sm font-semibold">
                    {i.text}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
          <h2 className="font-display text-2xl font-bold text-navy">Send us a message</h2>
          <form
            className="mt-5 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <Input label="Full Name" value={form.name} onChange={set("name")} required />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Phone Number" type="tel" value={form.phone} onChange={set("phone")} />
              <Input
                label="E-mail"
                type="email"
                value={form.email}
                onChange={set("email")}
                required
              />
            </div>
            <label className="relative z-20 block">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Message
              </span>
              <textarea
                rows={5}
                required
                value={form.message}
                onChange={(e) => set("message")(e.target.value)}
                className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-gold px-8 py-3 text-sm font-bold uppercase tracking-wider text-gold-foreground transition hover:brightness-110"
            >
              Send message
            </button>
            {sent ? (
              <p className="text-sm font-semibold text-primary">
                Thank you — our travel desk will respond as soon as possible.
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="relative z-20 block">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}
