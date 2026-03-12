import { Zap, BarChart3, Lightbulb, CalendarDays } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const features: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "Audit de Profil",
    description:
      "Obtenez une analyse complète de vos profils réseaux sociaux. Nous vérifions votre bio, fréquence de publication, taux d'engagement et plus encore pour vous donner des recommandations actionnables.",
    icon: Zap,
  },
  {
    title: "Score Social",
    description:
      "Suivez vos performances avec un score unifié. Mesurez votre progression dans le temps et comparez vos résultats entre plateformes.",
    icon: BarChart3,
  },
  {
    title: "Idées de Contenu",
    description:
      "Ne manquez jamais d'idées de contenu. Recevez des suggestions personnalisées basées sur votre niche, votre audience et les tendances du moment.",
    icon: Lightbulb,
  },
  {
    title: "Calendrier Éditorial",
    description:
      "Planifiez votre stratégie de contenu avec un calendrier visuel. Programmez vos posts, définissez des rappels et maintenez un rythme de publication régulier.",
    icon: CalendarDays,
  },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-4xl font-bold text-foreground">Fonctionnalités</h1>
      <p className="mt-4 text-lg text-text-secondary">
        Tout ce dont vous avez besoin pour construire et maintenir une présence forte sur les réseaux sociaux.
      </p>
      <div className="mt-12 space-y-8">
        {features.map((f) => (
          <div key={f.title} className="rounded-xl border border-border bg-surface-1 p-6 transition-all duration-200 hover:border-border-hover">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-accent-muted p-2.5">
                <f.icon className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">{f.title}</h2>
                <p className="mt-2 text-text-secondary">{f.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
