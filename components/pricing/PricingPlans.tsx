"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Sparkles, Crown } from "lucide-react";

const FREE_FEATURES = [
  { text: "10 crédits IA / mois", included: true },
  { text: "1 persona", included: true },
  { text: "Idées de contenu & hooks", included: true },
  { text: "Viral Score (estimation rapide)", included: true },
  { text: "Analyse concurrentielle IA", included: false },
  { text: "Commentaires IA", included: false },
  { text: "Coach quotidien", included: false },
  { text: "Weekly AI Report", included: false },
  { text: "2 comptes Instagram", included: false },
];

const PRO_FEATURES = [
  { text: "200 crédits IA / mois", included: true },
  { text: "3 personas", included: true },
  { text: "Idées de contenu & hooks", included: true },
  { text: "Viral Score IA (analyse brouillon)", included: true },
  { text: "Analyse concurrentielle IA", included: true },
  { text: "Commentaires IA + réponses", included: true },
  { text: "Coach quotidien (mission matinale)", included: true },
  { text: "Weekly AI Report personnalisé", included: true },
  { text: "2 comptes Instagram", included: true },
];

export function PricingPlans() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Free */}
      <div className="rounded-2xl border border-border bg-surface-1 p-8">
        <h2 className="text-xl font-semibold text-foreground">Free</h2>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-4xl font-bold text-foreground">0€</span>
          <span className="text-sm text-text-secondary">pour toujours</span>
        </div>
        <p className="mt-2 text-sm text-text-muted">Découvre Winly et commence à optimiser.</p>
        <ul className="mt-6 space-y-3">
          {FREE_FEATURES.map((f) => (
            <li key={f.text} className="flex items-start gap-2 text-sm">
              {f.included ? (
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              ) : (
                <X className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
              )}
              <span className={f.included ? "text-foreground" : "text-text-muted"}>
                {f.text}
              </span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => router.push("/register")}
          className="mt-8 w-full rounded-lg border border-border bg-surface-2 px-4 py-3 text-sm font-medium text-foreground hover:bg-surface-3 transition-colors"
        >
          Commencer gratuitement
        </button>
      </div>

      {/* Pro */}
      <div className="relative rounded-2xl border border-accent bg-surface-1 p-8 ring-2 ring-accent/20">
        <span className="absolute -top-3 right-6 inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-white">
          <Crown className="h-3 w-3" />
          Populaire
        </span>
        <h2 className="text-xl font-semibold text-foreground">Pro</h2>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-4xl font-bold text-foreground">19€</span>
          <span className="text-sm text-text-secondary">/ mois</span>
        </div>
        <p className="mt-2 text-sm text-text-muted">Toute la puissance IA pour grandir plus vite.</p>
        <ul className="mt-6 space-y-3">
          {PRO_FEATURES.map((f) => (
            <li key={f.text} className="flex items-start gap-2 text-sm">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span className="text-foreground">{f.text}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={handleUpgrade}
          disabled={loading}
          className="mt-8 w-full rounded-lg bg-gradient-to-r from-primary to-violet px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-all shadow-glow"
        >
          {loading ? "Redirection…" : "Passer en PRO — 19€/mois"}
        </button>
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      </div>
    </div>
  );
}
