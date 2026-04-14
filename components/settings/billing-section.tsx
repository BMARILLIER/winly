"use client";

import { useState } from "react";

type Props = {
  plan: string;
  hasStripeCustomer: boolean;
};

export function BillingSection({ plan, hasStripeCustomer }: Props) {
  const [loading, setLoading] = useState<"portal" | "checkout" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function go(endpoint: "portal" | "checkout") {
    setLoading(endpoint);
    setError(null);
    try {
      const res = await fetch(`/api/stripe/${endpoint}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
      setLoading(null);
    }
  }

  const isPro = plan === "pro";

  return (
    <div className="rounded-xl border border-border bg-surface-1 p-6">
      <h2 className="text-lg font-semibold text-foreground">Abonnement</h2>
      <p className="mt-1 text-sm text-text-secondary">
        Plan actuel :{" "}
        <span className={isPro ? "font-medium text-accent" : "font-medium"}>
          {isPro ? "Pro" : "Free"}
        </span>
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        {!isPro && (
          <button
            type="button"
            onClick={() => go("checkout")}
            disabled={loading !== null}
            className="rounded-lg bg-gradient-to-r from-primary to-violet px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading === "checkout" ? "Redirection…" : "Passer en Pro — 19€/mois"}
          </button>
        )}
        {hasStripeCustomer && (
          <button
            type="button"
            onClick={() => go("portal")}
            disabled={loading !== null}
            className="rounded-lg border border-border bg-surface-2 px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-3 disabled:opacity-50"
          >
            {loading === "portal" ? "Redirection…" : "Gérer mon abonnement"}
          </button>
        )}
      </div>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </div>
  );
}
