import Link from "next/link";
import {
  Zap,
  BarChart3,
  Lightbulb,
  CalendarDays,
  Star,
  ArrowRight,
} from "lucide-react";
import { AnimatedDashboard } from "@/components/landing/AnimatedDashboard";
import { AnimatedStats } from "@/components/landing/AnimatedStats";

const features = [
  {
    title: "Audit de Profil",
    desc: "Analyse approfondie de vos profils réseaux sociaux avec des recommandations concrètes.",
    icon: Zap,
  },
  {
    title: "Score Social",
    desc: "Suivez vos performances avec un score unifié sur toutes les plateformes.",
    icon: BarChart3,
  },
  {
    title: "Idées de Contenu",
    desc: "Suggestions de contenu personnalisées et adaptées à votre audience.",
    icon: Lightbulb,
  },
  {
    title: "Calendrier Éditorial",
    desc: "Planifiez et programmez votre contenu sur toutes vos plateformes.",
    icon: CalendarDays,
  },
];

const testimonials = [
  {
    quote:
      "Winly m'a permis de doubler mon engagement en 3 mois.",
    name: "Sarah M.",
    role: "Créatrice lifestyle",
    initials: "SM",
  },
  {
    quote:
      "L'audit de profil est incroyablement précis. Je recommande à 100%.",
    name: "Thomas K.",
    role: "Community Manager",
    initials: "TK",
  },
  {
    quote:
      "Le meilleur outil pour comprendre ce qui fonctionne sur mes réseaux.",
    name: "Julie R.",
    role: "Entrepreneure",
    initials: "JR",
  },
];

const steps = [
  {
    num: 1,
    title: "Créez votre compte",
    desc: "Inscription gratuite en moins de 30 secondes. Aucune carte bancaire requise.",
  },
  {
    num: 2,
    title: "Lancez votre premier audit",
    desc: "Connectez vos réseaux et obtenez une analyse complète de vos profils.",
  },
  {
    num: 3,
    title: "Suivez vos recommandations",
    desc: "Appliquez les suggestions personnalisées et regardez votre audience grandir.",
  },
];

export default function LandingPage() {
  return (
    <div>
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden py-28 md:py-36">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-violet/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-cyan/5 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-surface-1 px-4 py-1.5 text-sm text-text-secondary">
            <Star className="h-4 w-4 text-warning" />
            Adopté par plus de 12 000 créateurs
          </div>

          {/* Title */}
          <h1 className="text-5xl font-bold tracking-tight md:text-7xl leading-tight">
            <span className="bg-gradient-to-r from-primary via-violet to-cyan bg-clip-text text-transparent">
              Power Your Social Growth
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg md:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Auditez vos profils, suivez votre score, générez des idées de contenu
            et planifiez votre calendrier éditorial — tout en un seul endroit.
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-gradient-to-r from-primary to-violet px-8 py-3.5 font-semibold text-white hover:opacity-90 transition-all duration-200 shadow-glow text-lg"
            >
              Commencer gratuitement
            </Link>
            <Link
              href="/how-it-works"
              className="rounded-xl border border-border px-8 py-3.5 font-semibold text-text-secondary hover:bg-surface-2 hover:text-foreground hover:border-border-hover transition-all duration-200 text-lg"
            >
              Voir comment ça marche
            </Link>
          </div>

          {/* ─── ANIMATED DASHBOARD MOCKUP ─── */}
          <AnimatedDashboard />
        </div>
      </section>

      {/* ─── SOCIAL PROOF BAR (animated) ─── */}
      <AnimatedStats />

      {/* ─── FEATURES ─── */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-foreground">
            Tout ce qu&apos;il faut pour grandir
          </h2>
          <p className="mt-4 text-center text-text-secondary text-lg">
            Des outils puissants conçus pour les créateurs modernes
          </p>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border border-border bg-surface-1 p-6 transition-all duration-300 hover:border-border-hover hover:shadow-glow hover:-translate-y-2"
              >
                <div className="mb-4 rounded-lg bg-accent-muted p-2.5 w-fit">
                  <f.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-24 border-t border-border">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-foreground">
            Ce que disent nos utilisateurs
          </h2>
          <p className="mt-4 text-center text-text-secondary text-lg">
            Des milliers de créateurs nous font confiance
          </p>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-xl border border-border bg-surface-1 p-6 transition-all duration-300 hover:border-border-hover hover:shadow-glow"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-warning text-warning"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-foreground leading-relaxed mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-violet flex items-center justify-center text-sm font-bold text-white">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {t.name}
                    </p>
                    <p className="text-xs text-text-muted">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS PREVIEW ─── */}
      <section className="py-24 border-t border-border">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-foreground">
            Simple comme 1, 2, 3
          </h2>
          <p className="mt-4 text-center text-text-secondary text-lg">
            Commencez en quelques minutes
          </p>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="mx-auto mb-6 h-14 w-14 rounded-full bg-gradient-to-br from-primary to-violet flex items-center justify-center text-xl font-bold text-white shadow-glow">
                  {s.num}
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 text-accent hover:text-accent-hover transition-colors font-medium"
            >
              En savoir plus
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="border-t border-border bg-surface-1 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Prêt à passer au niveau supérieur ?
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            Rejoignez des milliers de créateurs qui utilisent WINLY pour
            développer leur audience.
          </p>
          <Link
            href="/register"
            className="mt-10 inline-block rounded-xl bg-gradient-to-r from-primary to-violet px-10 py-4 text-lg font-semibold text-white hover:opacity-90 transition-all duration-200 shadow-glow"
          >
            Essai gratuit
          </Link>
        </div>
      </section>
    </div>
  );
}
