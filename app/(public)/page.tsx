import Link from "next/link";
import {
  Zap,
  Eye,
  CalendarDays,
  ShieldCheck,
  ArrowRight,
  ChevronDown,
  UserCircle,
} from "lucide-react";
import { AnimatedDashboard } from "@/components/landing/AnimatedDashboard";

const features = [
  {
    title: "Persona IA",
    desc: "Crée un personnage cohérent en 2 minutes — nom, bio, ton, univers visuel — prêt à publier.",
    icon: UserCircle,
  },
  {
    title: "Contenu anonyme",
    desc: "Génère des posts, captions et hooks dans la voix de ton persona. Personne ne saura que c'est toi.",
    icon: Zap,
  },
  {
    title: "Calendrier fantôme",
    desc: "Programme ton contenu à l'avance. Ton persona publie sans que tu apparaisses jamais.",
    icon: CalendarDays,
  },
  {
    title: "Identité protégée",
    desc: "Ton vrai nom, ton visage, tes infos personnelles n'apparaissent nulle part. Jamais.",
    icon: ShieldCheck,
  },
];

const steps = [
  {
    num: 1,
    title: "Décris ton univers",
    desc: "Choisis ta niche, ton style, tes valeurs. Winly génère un persona complet en quelques secondes.",
  },
  {
    num: 2,
    title: "Génère ton contenu",
    desc: "Des posts, des hooks, des captions — tout est créé dans la voix de ton alter ego et posté sous son nom.",
  },
  {
    num: 3,
    title: "Reste invisible",
    desc: "Ta vraie identité reste cachée. Toujours. Tu grandis sans jamais t'exposer.",
  },
];

const faqs = [
  {
    question: "Mon vrai nom apparaît-il quelque part ?",
    answer:
      "Non, jamais. Ton compte Winly est séparé de ton persona public. Aucune information personnelle n'est partagée sur les réseaux.",
  },
  {
    question: "Puis-je avoir plusieurs personas ?",
    answer:
      "Oui, jusqu'à 3 personas différents. Chacun avec son propre univers, ton, style et calendrier de contenu.",
  },
  {
    question: "Ça marche sur TikTok aussi ?",
    answer:
      "Instagram d'abord — c'est notre plateforme principale. TikTok arrive bientôt, et d'autres plateformes suivront.",
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
          {/* Title */}
          <h1 className="text-5xl font-bold tracking-tight md:text-7xl leading-tight">
            <span className="bg-gradient-to-r from-primary via-violet to-cyan bg-clip-text text-transparent">
              Crée ton alter ego.
            </span>
            <br />
            <span className="text-foreground">Reste invisible.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg md:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Winly génère un persona complet pour toi — nom, univers, style,
            contenu — et poste à ta place.
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-gradient-to-r from-primary to-violet px-8 py-3.5 font-semibold text-white hover:opacity-90 transition-all duration-200 shadow-glow text-lg"
            >
              Créer mon persona
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

      {/* ─── FEATURES ─── */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-foreground">
            Deviens créateur sans te montrer
          </h2>
          <p className="mt-4 text-center text-text-secondary text-lg">
            Tout ce qu&apos;il faut pour lancer un compte anonyme qui cartonne
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
                <h3 className="text-lg font-semibold text-foreground">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-24 border-t border-border">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-foreground">
            3 étapes. Zéro exposition.
          </h2>
          <p className="mt-4 text-center text-text-secondary text-lg">
            De l&apos;idée au premier post, sans jamais te montrer
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

      {/* ─── FAQ ─── */}
      <section className="py-24 border-t border-border">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-foreground">
            Questions fréquentes
          </h2>
          <p className="mt-4 text-center text-text-secondary text-lg">
            Ce que tout le monde demande avant de se lancer
          </p>
          <div className="mt-14 space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-xl border border-border bg-surface-1 transition-all duration-300 hover:border-border-hover"
              >
                <summary className="flex cursor-pointer items-center justify-between p-6 text-foreground font-semibold">
                  <span>{faq.question}</span>
                  <ChevronDown className="h-5 w-5 text-text-muted transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-6 text-text-secondary leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="border-t border-border bg-surface-1 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Eye className="mx-auto h-12 w-12 text-text-muted mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Prêt à disparaître ?
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            Crée ton persona, génère ton contenu, et laisse ton alter ego faire
            le reste.
          </p>
          <Link
            href="/register"
            className="mt-10 inline-block rounded-xl bg-gradient-to-r from-primary to-violet px-10 py-4 text-lg font-semibold text-white hover:opacity-90 transition-all duration-200 shadow-glow"
          >
            Créer mon persona gratuit
          </Link>
        </div>
      </section>
    </div>
  );
}
