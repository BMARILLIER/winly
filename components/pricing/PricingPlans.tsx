"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

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
      <PlanCard
        title="Free"
        price="0€"
        period="pour toujours"
        features={[
          "5 générations de contenu / mois",
          "1 persona maximum",
          "Idées de contenu & hooks",
          "Support communautaire",
        ]}
        cta="Commencer gratuitement"
        onClick={() => router.push("/register")}
      />
      <PlanCard
        title="Pro"
        price="19€"
        period="/ mois"
        popular
        features={[
          "Générations illimitées",
          "Jusqu'à 3 personas",
          "Toutes les fonctionnalités IA",
          "Support prioritaire",
        ]}
        cta={loading ? "Redirection…" : "Passer en PRO"}
        onClick={handleUpgrade}
        disabled={loading}
        error={error}
      />
    </div>
  );
}

function PlanCard({
  title,
  price,
  period,
  features,
  cta,
  onClick,
  popular,
  disabled,
  error,
}: {
  title: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  onClick: () => void;
  popular?: boolean;
  disabled?: boolean;
  error?: string | null;
}) {
  return (
    <div
      className={`relative rounded-2xl border bg-white p-8 shadow-sm ${
        popular ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-gray-200"
      }`}
    >
      {popular && (
        <span className="absolute -top-3 right-6 rounded-full bg-indigo-500 px-3 py-1 text-xs font-medium text-white">
          Populaire
        </span>
      )}
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-sm text-muted-foreground">{period}</span>
      </div>
      <ul className="mt-6 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`mt-8 w-full rounded-lg px-4 py-3 text-sm font-medium transition ${
          popular
            ? "bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            : "border border-gray-300 bg-white hover:bg-gray-50"
        }`}
      >
        {cta}
      </button>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
