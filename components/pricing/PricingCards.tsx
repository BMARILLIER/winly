import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    tagline: "Id\u00e9al pour d\u00e9buter",
    price: "Gratuit",
    priceSuffix: null,
    features: [
      "Analyse basique du compte",
      "Tableau de bord",
      "Recommandations simples",
      "1 compte social connect\u00e9",
    ],
    highlighted: false,
    buttonLabel: "Commencer",
  },
  {
    name: "Creator",
    tagline: "Pour les cr\u00e9ateurs s\u00e9rieux",
    price: "19\u00a0\u20ac",
    priceSuffix: "/mois",
    badge: "Le plus populaire",
    features: [
      "Analyse avanc\u00e9e",
      "Recommandations IA",
      "Id\u00e9es de contenu",
      "Historique des performances",
      "3 comptes sociaux connect\u00e9s",
    ],
    highlighted: true,
    buttonLabel: "Essayer",
  },
  {
    name: "Pro",
    tagline: "Pour les professionnels",
    price: "49\u00a0\u20ac",
    priceSuffix: "/mois",
    features: [
      "Analyse compl\u00e8te",
      "Assistant IA avanc\u00e9",
      "Strat\u00e9gie de contenu",
      "Analyse concurrentielle",
      "Comptes sociaux illimit\u00e9s",
    ],
    highlighted: false,
    buttonLabel: "Commencer",
  },
];

export function PricingCards() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-center">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 transition-all duration-200 ${
                plan.highlighted
                  ? "border-2 border-accent bg-surface-1 lg:scale-105 shadow-glow"
                  : "border border-border bg-surface-1 hover:border-border-hover"
              }`}
            >
              {plan.badge && (
                <span className="mb-4 inline-block rounded-full bg-gradient-to-r from-primary to-violet px-3 py-1 text-xs font-medium text-white">
                  {plan.badge}
                </span>
              )}
              <h2 className="text-xl font-bold text-foreground">{plan.name}</h2>
              <p className="mt-1 text-sm text-text-secondary">{plan.tagline}</p>
              <p className="mt-4">
                <span className="text-4xl font-bold text-foreground">
                  {plan.price}
                </span>
                {plan.priceSuffix && (
                  <span className="text-sm text-text-muted">
                    {plan.priceSuffix}
                  </span>
                )}
              </p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-sm text-text-secondary"
                  >
                    <Check className="h-4 w-4 shrink-0 text-success" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`mt-8 block w-full rounded-lg py-2.5 text-center text-sm font-medium transition-all duration-200 ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-primary to-violet text-white hover:opacity-90 shadow-glow"
                    : "border border-border text-foreground hover:border-accent hover:text-accent"
                }`}
              >
                {plan.buttonLabel}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
