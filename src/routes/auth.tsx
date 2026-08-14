import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { PageShell, Card, Field } from "@/components/site/ui";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { next?: string | undefined } => {
    const raw = typeof search["next"] === "string" ? search["next"] : "";
    return { next: raw.startsWith("/") && !raw.startsWith("//") ? raw : "" };
  },
  head: () => ({
    meta: [
      { title: "Sign In — Travellers & Agents | FaresDream" },
      {
        name: "description",
        content:
          "Sign in to manage trips, wallet credits, loyalty status and agent net fares on FaresDream.",
      },
      { property: "og:title", content: "Sign in to FaresDream" },
      { property: "og:description", content: "Access My Trips, wallet credits and the agent portal." },
    ],
  }),
  component: AuthPage,
});

const ADMIN_EMAIL = "rjvtravels8@gmail.com";

function AuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const afterAuth = () => {
    if (next) void navigate({ to: next });
    else void navigate({ to: "/dashboard" });
  };
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: fullName },
        },
      });
      setMsg(error ? error.message : "Check your email to confirm your account.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
      else if (email.trim().toLowerCase() === ADMIN_EMAIL) navigate({ to: "/admin" });
      else afterAuth();
    }
    setBusy(false);
  }

  async function google() {
    setMsg(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setMsg("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    afterAuth();
  }

  return (
    <PageShell
      eyebrow="Members"
      title={mode === "signin" ? "Welcome back" : "Create your account"}
      subtitle="One account for My Trips, wallet credits, loyalty status and the agent portal."
    >
      <div className="mx-auto max-w-md">
        <Card>
          <div className="mb-4 inline-flex rounded-full bg-secondary p-1 text-xs font-semibold">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-full px-4 py-1.5 ${
                  mode === m ? "bg-navy text-navy-foreground" : "text-muted-foreground"
                }`}
              >
                {m === "signin" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="grid gap-3">
            {mode === "signup" ? (
              <Field label="Full name" value={fullName} onChange={setFullName} placeholder="Alex Morgan" />
            ) : null}
            <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@email.com" />
            <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
            <button
              disabled={busy}
              className="mt-1 inline-flex w-full items-center justify-center rounded-xl bg-gold px-5 py-3 text-sm font-bold text-gold-foreground disabled:opacity-60"
            >
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button
            onClick={google}
            className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-bold text-navy"
          >
            Continue with Google
          </button>

          {msg ? <p className="mt-3 text-sm text-muted-foreground">{msg}</p> : null}
        </Card>
      </div>
    </PageShell>
  );
}
