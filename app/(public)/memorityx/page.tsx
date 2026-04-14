import Link from "next/link";

export default function MemorityxLanding() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* ═══════════════════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden px-6 py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/30 to-transparent" />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-violet-400">
            Revenue Intelligence for Chat Agencies
          </p>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl leading-[1.1]">
            Chaque message devrait{" "}
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              generer du revenu
            </span>
          </h1>
          <p className="mt-6 text-lg text-white/60 max-w-xl mx-auto">
            Memorityx optimise chaque conversation, detecte qui va payer,
            et dit a vos chatteurs exactement quoi envoyer.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="#demo"
              className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-3.5 text-sm font-bold shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/40 hover:scale-[1.02]"
            >
              Voir la demo
            </Link>
            <Link
              href="#access"
              className="rounded-xl border border-white/15 bg-white/5 px-8 py-3.5 text-sm font-medium backdrop-blur transition-all hover:bg-white/10 hover:border-white/25"
            >
              Acces agence
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PROBLEME
          ═══════════════════════════════════════════════════════ */}
      <section className="border-t border-white/5 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Vous perdez de l&apos;argent{" "}
            <span className="text-red-400">chaque jour</span>
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <ProblemCard
              icon="💸"
              title="Revenus non captures"
              description="Des clients prets a payer passent entre les mailles. Personne ne les relance au bon moment."
            />
            <ProblemCard
              icon="👻"
              title="Clients oublies"
              description="Apres 48h sans message, le client est perdu. Aucun systeme ne detecte le churn avant qu'il soit trop tard."
            />
            <ProblemCard
              icon="📉"
              title="Chatteurs inefficaces"
              description="Impossible de savoir qui performe, qui gaspille du temps, et qui genere vraiment du revenu."
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SOLUTION
          ═══════════════════════════════════════════════════════ */}
      <section className="border-t border-white/5 bg-gradient-to-b from-violet-950/20 to-transparent px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-sm font-medium uppercase tracking-widest text-violet-400 mb-3">
            La solution
          </p>
          <h2 className="text-center text-2xl font-bold sm:text-3xl mb-12">
            Memorityx transforme chaque chat en revenu
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <SolutionCard
              title="Optimise chaque conversation"
              description="Analyse en temps reel le contexte, l'historique et l'intention du client pour maximiser chaque echange."
            />
            <SolutionCard
              title="Detecte qui va payer"
              description="Scoring automatique des clients par probabilite d'achat. Focus sur les opportunites reelles."
            />
            <SolutionCard
              title="Dit quoi envoyer"
              description="Suggestions de messages basees sur le profil client, son historique de depenses et le moment optimal."
            />
            <SolutionCard
              title="Automatise les actions"
              description="Relances, upsells, re-engagement — executes automatiquement au bon moment, sans intervention manuelle."
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          IMPACT
          ═══════════════════════════════════════════════════════ */}
      <section className="border-t border-white/5 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl mb-12">
            Impact mesurable, des le premier mois
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <ImpactCard value="+30%" label="revenus par chatteur" color="text-emerald-400" />
            <ImpactCard value="-40%" label="temps perdu sur clients froids" color="text-violet-400" />
            <ImpactCard value="100%" label="decisions basees sur la data" color="text-fuchsia-400" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURES
          ═══════════════════════════════════════════════════════ */}
      <section className="border-t border-white/5 bg-gradient-to-b from-violet-950/10 to-transparent px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl mb-12">
            Tout ce qu&apos;il faut, rien de plus
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard title="AI Assistant" description="Suggestions contextuelles en temps reel" />
            <FeatureCard title="Auto Actions" description="Relances et upsells automatises" />
            <FeatureCard title="Revenue Engine" description="Pricing dynamique par client" />
            <FeatureCard title="Star Engine" description="Classement et scoring des chatteurs" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PREUVE / ROI
          ═══════════════════════════════════════════════════════ */}
      <section className="border-t border-white/5 px-6 py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl mb-8">
            Le calcul est simple
          </h2>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <div className="space-y-4 text-sm">
              <RoiLine label="Revenu moyen par chatteur" value="8 000 EUR/mois" />
              <RoiLine label="Gain avec Memorityx (+30%)" value="+2 400 EUR/mois" highlight />
              <RoiLine label="Equipe de 5 chatteurs" value="+12 000 EUR/mois" highlight />
              <div className="border-t border-white/10 pt-4">
                <RoiLine label="Cout Memorityx" value="3 000 - 5 000 EUR/mois" />
              </div>
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
                <p className="text-lg font-bold text-emerald-400">ROI : 2.4x a 4x des le premier mois</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CTA FINAL
          ═══════════════════════════════════════════════════════ */}
      <section id="demo" className="border-t border-white/5 px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-black sm:text-4xl mb-4">
            Pret a maximiser vos revenus ?
          </h2>
          <p className="text-white/50 mb-10">
            Rejoignez les agences qui ont choisi de ne plus laisser d&apos;argent sur la table.
          </p>
          <div id="access" className="flex items-center justify-center gap-4">
            <Link
              href="#"
              className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-10 py-4 text-base font-bold shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/40 hover:scale-[1.02]"
            >
              Voir la demo
            </Link>
            <Link
              href="#"
              className="rounded-xl border border-white/15 bg-white/5 px-10 py-4 text-base font-medium backdrop-blur transition-all hover:bg-white/10 hover:border-white/25"
            >
              Acces agence
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8 text-center">
        <p className="text-xs text-white/30">
          Memorityx · Revenue Intelligence for Chat Agencies
        </p>
      </footer>
    </div>
  );
}

// --- Sub-components ---

function ProblemCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <span className="text-2xl">{icon}</span>
      <h3 className="mt-3 text-sm font-bold">{title}</h3>
      <p className="mt-2 text-xs text-white/50 leading-relaxed">{description}</p>
    </div>
  );
}

function SolutionCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-violet-500/15 bg-violet-500/5 p-6">
      <h3 className="text-sm font-bold">{title}</h3>
      <p className="mt-2 text-xs text-white/50 leading-relaxed">{description}</p>
    </div>
  );
}

function ImpactCard({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur">
      <p className={`text-3xl font-black ${color}`}>{value}</p>
      <p className="mt-2 text-xs text-white/50">{label}</p>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <h3 className="text-sm font-bold">{title}</h3>
      <p className="mt-1 text-[11px] text-white/40">{description}</p>
    </div>
  );
}

function RoiLine({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/60">{label}</span>
      <span className={`font-bold ${highlight ? "text-emerald-400" : "text-white"}`}>{value}</span>
    </div>
  );
}
