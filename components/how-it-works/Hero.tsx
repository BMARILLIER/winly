import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-28">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-violet/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-accent/5 blur-3xl" />
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
          <span className="bg-gradient-to-r from-primary via-violet to-cyan bg-clip-text text-transparent">
            Comment fonctionne Winly
          </span>
        </h1>
        <p className="mt-6 text-lg text-text-secondary max-w-2xl mx-auto">
          Winly est un assistant intelligent qui analyse votre pr&eacute;sence sur les
          r&eacute;seaux sociaux et vous aide &agrave; am&eacute;liorer votre croissance, votre
          engagement et vos performances.
        </p>
        <div className="mt-10 flex justify-center">
          <Link
            href="/register"
            className="rounded-lg bg-gradient-to-r from-primary to-violet px-6 py-3 font-semibold text-white hover:opacity-90 transition-all duration-200 shadow-glow"
          >
            Essayer Winly
          </Link>
        </div>
      </div>
    </section>
  );
}
