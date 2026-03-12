import Link from "next/link";

export function PricingCTA() {
  return (
    <section className="border-t border-border bg-surface-1 py-16">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-2xl font-bold text-foreground">
          Commencez &agrave; optimiser votre strat&eacute;gie sociale
        </h2>
        <Link
          href="/register"
          className="mt-8 inline-block rounded-lg bg-gradient-to-r from-primary to-violet px-8 py-3 font-semibold text-white hover:opacity-90 transition-all duration-200 shadow-glow"
        >
          Cr&eacute;er un compte
        </Link>
      </div>
    </section>
  );
}
