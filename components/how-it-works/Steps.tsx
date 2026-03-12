import { Link, BarChart3, Lightbulb } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const steps: { number: number; title: string; description: string; icon: LucideIcon }[] = [
  {
    number: 1,
    title: "Connectez votre compte",
    description:
      "Connectez votre compte social pour permettre \u00e0 Winly d\u2019analyser vos donn\u00e9es et vos performances.",
    icon: Link,
  },
  {
    number: 2,
    title: "Analyse intelligente",
    description:
      "Winly analyse votre profil, vos publications et vos statistiques pour identifier les opportunit\u00e9s d\u2019am\u00e9lioration.",
    icon: BarChart3,
  },
  {
    number: 3,
    title: "Recommandations personnalis\u00e9es",
    description:
      "Recevez des recommandations claires pour am\u00e9liorer votre engagement et d\u00e9velopper votre audience.",
    icon: Lightbulb,
  },
];

export function Steps() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold text-foreground">
          D&eacute;marrer en 3 &eacute;tapes
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3 relative">
          {/* Connecting line on desktop */}
          <div className="hidden md:block absolute top-14 left-[20%] right-[20%] h-px bg-gradient-to-r from-primary/40 via-violet/40 to-cyan/40" />

          {steps.map((step) => (
            <div
              key={step.number}
              className="relative rounded-xl border border-border bg-surface-1 p-6 transition-all duration-200 hover:border-border-hover hover:shadow-glow"
            >
              {/* Step number circle */}
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet text-white font-bold text-lg relative z-10">
                {step.number}
              </div>
              <div className="mb-3 flex justify-center">
                <div className="rounded-lg bg-accent-muted p-2.5">
                  <step.icon className="h-5 w-5 text-accent" />
                </div>
              </div>
              <h3 className="text-center text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-center text-sm text-text-secondary">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
