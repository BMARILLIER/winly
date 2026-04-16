import Link from "next/link";
import {
  BarChart3,
  Sparkles,
  Target,
  MessageCircle,
  TrendingUp,
  Zap,
  ArrowRight,
  ChevronDown,
  Instagram,
  Star,
  Crown,
  Check,
} from "lucide-react";

const features = [
  {
    title: "Analytics Instagram",
    desc: "Followers, engagement, reach, meilleurs posts — toutes tes stats en un coup d'oeil, synchronisées en temps réel.",
    icon: BarChart3,
  },
  {
    title: "Viral Score IA",
    desc: "Colle ton brouillon, l'IA le note /100 et te dit exactement quoi améliorer avant de publier.",
    icon: Target,
  },
  {
    title: "Analyse concurrentielle",
    desc: "Décortique les posts de tes concurrents : patterns, forces, et 3 idées à adapter pour toi.",
    icon: TrendingUp,
  },
  {
    title: "Commentaires IA",
    desc: "Tes commentaires non répondus + des réponses suggérées dans ton ton. Copie, colle, c'est répondu.",
    icon: MessageCircle,
  },
  {
    title: "Coach quotidien",
    desc: "Chaque matin, une mission IA personnalisée basée sur tes stats de la veille. 10-30 min max.",
    icon: Zap,
  },
  {
    title: "Contenu IA sur-mesure",
    desc: "Génère des posts, hooks et captions inspirés de tes concurrents ET adaptés à ton style unique.",
    icon: Sparkles,
  },
];

const steps = [
  {
    num: 1,
    title: "Connecte ton Instagram",
    desc: "Un clic, 30 secondes. Tes données sont synchronisées automatiquement.",
  },
  {
    num: 2,
    title: "Découvre tes insights",
    desc: "L'IA analyse tes posts, détecte ce qui marche, et te montre où progresser.",
  },
  {
    num: 3,
    title: "Crée et grandis",
    desc: "Génère du contenu optimisé, réponds à tes commentaires, et regarde ta communauté grandir.",
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    role: "Créatrice fitness · 12K abonnés",
    text: "Le Viral Score m'a fait passer de 2% à 5% d'engagement en 3 semaines. Je teste chaque post avant de publier maintenant.",
    stars: 5,
  },
  {
    name: "Lucas D.",
    role: "DJ / Producteur · 8K abonnés",
    text: "Le coach quotidien me donne une direction chaque matin. J'ai doublé ma régularité de publication.",
    stars: 5,
  },
  {
    name: "Amira K.",
    role: "Food blogger · 25K abonnés",
    text: "L'analyse concurrentielle m'a ouvert les yeux sur les patterns que je ne voyais pas. Game changer.",
    stars: 5,
  },
];

const faqs = [
  {
    question: "Est-ce que Winly a accès à mon mot de passe Instagram ?",
    answer:
      "Non, jamais. Winly utilise l'authentification officielle Instagram (OAuth). On ne voit ni ne stocke ton mot de passe. Tu peux révoquer l'accès à tout moment depuis les paramètres Instagram.",
  },
  {
    question: "Combien de crédits IA ai-je par mois ?",
    answer:
      "Le plan Free inclut 10 crédits IA/mois (contenu, viral score, analyses). Le plan Pro donne 200 crédits/mois — largement assez pour un usage quotidien.",
  },
  {
    question: "Winly publie-t-il à ma place ?",
    answer:
      "Non. Winly génère le contenu et te dit quand poster, mais tu gardes le contrôle total. Tu copies le texte et publies toi-même sur Instagram.",
  },
  {
    question: "Ça marche avec TikTok ?",
    answer:
      "Pour le moment, Winly est optimisé pour Instagram. Le support TikTok est en développement et arrive bientôt.",
  },
];

export default function LandingPage() {
  return (
    <div>
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden py-28 md:py-36">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-violet/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-cyan/5 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm text-accent mb-8">
            <Sparkles className="h-4 w-4" />
            Propulsé par l&apos;IA Claude
          </div>

          <h1 className="text-5xl font-bold tracking-tight md:text-7xl leading-tight">
            <span className="text-foreground">Grandis sur Instagram</span>
            <br />
            <span className="bg-gradient-to-r from-primary via-violet to-cyan bg-clip-text text-transparent">
              avec ton coach IA.
            </span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Analytics, insights personnalisés, contenu optimisé, analyse concurrentielle
            — tout ce qu&apos;il faut pour transformer ton compte Instagram en machine à croissance.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-violet px-8 py-3.5 font-semibold text-white hover:opacity-90 transition-all duration-200 shadow-glow text-lg"
            >
              <Instagram className="h-5 w-5" />
              Commencer gratuitement
            </Link>
            <Link
              href="/pricing"
              className="rounded-xl border border-border px-8 py-3.5 font-semibold text-text-secondary hover:bg-surface-2 hover:text-foreground hover:border-border-hover transition-all duration-200 text-lg"
            >
              Voir les tarifs
            </Link>
          </div>

          <p className="mt-4 text-sm text-text-muted">
            Gratuit pour commencer · Pas de carte bancaire requise
          </p>

          {/* Stats bar */}
          <div className="mt-16 mx-auto max-w-2xl grid grid-cols-3 gap-4 rounded-2xl border border-border bg-surface-1 p-6">
            {[
              { value: "6+", label: "Features IA" },
              { value: "~10s", label: "Pour analyser un post" },
              { value: "200", label: "Crédits IA / mois (Pro)" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-foreground">{s.value}</div>
                <div className="text-xs text-text-muted mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-foreground">
            Tout ce qu&apos;il te faut pour percer
          </h2>
          <p className="mt-4 text-center text-text-secondary text-lg">
            6 outils IA qui travaillent ensemble pour ta croissance
          </p>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border border-border bg-surface-1 p-6 transition-all duration-300 hover:border-accent/50 hover:shadow-glow hover:-translate-y-1"
              >
                <div className="mb-4 rounded-lg bg-accent-muted p-2.5 w-fit">
                  <f.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-24 border-t border-border">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-foreground">
            Opérationnel en 2 minutes
          </h2>
          <p className="mt-4 text-center text-text-secondary text-lg">
            Connecte ton compte et laisse l&apos;IA faire le reste
          </p>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="mx-auto mb-6 h-14 w-14 rounded-full bg-gradient-to-br from-primary to-violet flex items-center justify-center text-xl font-bold text-white shadow-glow">
                  {s.num}
                </div>
                <h3 className="text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-24 border-t border-border">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-foreground">
            Ils grandissent avec Winly
          </h2>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-xl border border-border bg-surface-1 p-6">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-text-muted">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING TEASER ─── */}
      <section className="py-24 border-t border-border">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-foreground">
            Un prix simple
          </h2>
          <p className="mt-4 text-center text-text-secondary text-lg">
            Commence gratuitement, passe en Pro quand tu es prêt
          </p>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface-1 p-8">
              <h3 className="text-xl font-semibold text-foreground">Free</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">0€</span>
                <span className="text-sm text-text-muted">pour toujours</span>
              </div>
              <ul className="mt-6 space-y-2">
                {["10 crédits IA / mois", "Analytics de base", "1 compte Instagram"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                    <Check className="h-4 w-4 text-success shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-6 block text-center rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-3 transition-colors"
              >
                Commencer gratuitement
              </Link>
            </div>
            <div className="relative rounded-2xl border border-accent bg-surface-1 p-8 ring-2 ring-accent/20">
              <span className="absolute -top-3 right-6 inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-white">
                <Crown className="h-3 w-3" /> Populaire
              </span>
              <h3 className="text-xl font-semibold text-foreground">Pro</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">19€</span>
                <span className="text-sm text-text-muted">/ mois</span>
              </div>
              <ul className="mt-6 space-y-2">
                {["200 crédits IA / mois", "Toutes les features IA", "2 comptes Instagram", "Coach quotidien + Weekly Report"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                    <Sparkles className="h-4 w-4 text-accent shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-6 block text-center rounded-lg bg-gradient-to-r from-primary to-violet px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all shadow-glow"
              >
                Essayer Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-24 border-t border-border">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-foreground">
            Questions fréquentes
          </h2>
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
          <Instagram className="mx-auto h-12 w-12 text-pink-400 mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Prêt à passer au niveau supérieur ?
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            Connecte ton Instagram, découvre tes insights, et laisse l&apos;IA
            booster ta croissance.
          </p>
          <Link
            href="/register"
            className="mt-10 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-violet px-10 py-4 text-lg font-semibold text-white hover:opacity-90 transition-all duration-200 shadow-glow"
          >
            Commencer gratuitement
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-3 text-sm text-text-muted">Pas de carte bancaire requise</p>
        </div>
      </section>
    </div>
  );
}
