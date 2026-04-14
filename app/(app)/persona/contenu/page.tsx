import { getMyPersonas } from "@/lib/actions/persona";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ContenuForm } from "./contenu-form";

export default async function PersonaContenuPage() {
  const personas = await getMyPersonas();
  const active = personas.find((p) => p.isActive);

  if (!active) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-xl border border-border bg-surface-1 p-12 text-center space-y-4">
          <p className="text-lg text-foreground font-semibold">
            Aucun persona actif
          </p>
          <p className="text-text-secondary">
            Active d&apos;abord un persona pour générer du contenu dans sa voix.
          </p>
          <Link
            href="/persona/mes-personas"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-violet px-6 py-3 font-semibold text-white hover:opacity-90 transition-all shadow-glow"
          >
            Voir mes personas
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Générer du contenu
        </h1>
        <p className="mt-2 text-text-secondary">
          Le contenu sera écrit dans la voix de ton persona actif.
        </p>
      </div>

      {/* Mini-card persona actif */}
      <div className="flex items-center justify-between rounded-xl border border-accent/30 bg-accent-muted/20 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-violet flex items-center justify-center text-sm font-bold text-white">
            {active.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <div>
            <p className="font-semibold text-foreground">{active.name}</p>
            <p className="text-xs text-text-muted">
              {active.niche} · {active.tone} ·{" "}
              {active.platform === "les_deux"
                ? "Instagram + TikTok"
                : active.platform}
            </p>
          </div>
        </div>
        <Link
          href="/persona/mes-personas"
          className="text-sm text-accent hover:text-accent-hover transition-colors font-medium"
        >
          Changer
        </Link>
      </div>

      <ContenuForm personaId={active.id} />
    </div>
  );
}
