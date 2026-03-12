import Link from "next/link";

export function PricingHero() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-violet/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-accent/5 blur-3xl" />
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          <span className="bg-gradient-to-r from-primary via-violet to-cyan bg-clip-text text-transparent">
            Choisissez le plan adapt&eacute; &agrave; votre croissance
          </span>
        </h1>
        <p className="mt-6 text-lg text-text-secondary max-w-2xl mx-auto">
          Winly vous aide &agrave; analyser votre compte social, optimiser votre
          contenu et d&eacute;velopper votre audience gr&acirc;ce &agrave;
          l&apos;intelligence artificielle.
        </p>
        <div className="mt-10 flex justify-center">
          <Link
            href="/register"
            className="rounded-lg bg-gradient-to-r from-primary to-violet px-6 py-3 font-semibold text-white hover:opacity-90 transition-all duration-200 shadow-glow"
          >
            Commencer gratuitement
          </Link>
        </div>
      </div>
    </section>
  );
}
