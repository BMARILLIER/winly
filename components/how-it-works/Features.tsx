import { LayoutDashboard, ClipboardCheck, Sparkles, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const features: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "Tableau de bord",
    description: "Visualisez rapidement la performance globale de votre compte.",
    icon: LayoutDashboard,
  },
  {
    title: "Analyse de contenu",
    description: "Comprenez quels types de publications fonctionnent le mieux.",
    icon: ClipboardCheck,
  },
  {
    title: "Assistant IA",
    description: "Obtenez des id\u00e9es de contenu optimis\u00e9es.",
    icon: Sparkles,
  },
  {
    title: "Recommandations",
    description: "Am\u00e9liorez votre strat\u00e9gie gr\u00e2ce \u00e0 des conseils concrets.",
    icon: TrendingUp,
  },
];

export function Features() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold text-foreground">
          Fonctionnalit&eacute;s principales
        </h2>
        <div className="mt-12 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border border-border bg-surface-1 p-6 transition-all duration-200 hover:border-border-hover hover:shadow-glow"
            >
              <div className="mb-4 rounded-lg bg-accent-muted p-2.5 w-fit">
                <f.icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-text-secondary">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
