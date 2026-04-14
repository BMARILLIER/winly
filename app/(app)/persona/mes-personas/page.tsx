import { getMyPersonas } from "@/lib/actions/persona";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PersonaCard } from "./persona-card";

export default async function MesPersonasPage() {
  const personas = await getMyPersonas();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mes personas</h1>
          <p className="mt-2 text-text-secondary">
            {personas.length}/3 personas créés
          </p>
        </div>
        {personas.length < 3 && (
          <Link
            href="/persona"
            className="rounded-xl bg-gradient-to-r from-primary to-violet px-5 py-2.5 font-semibold text-white hover:opacity-90 transition-all shadow-glow inline-flex items-center gap-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            Nouveau persona
          </Link>
        )}
      </div>

      {personas.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface-1 p-12 text-center">
          <p className="text-text-muted text-lg">Aucun persona créé.</p>
          <Link
            href="/persona"
            className="mt-4 inline-block rounded-xl bg-gradient-to-r from-primary to-violet px-6 py-3 font-semibold text-white hover:opacity-90 transition-all shadow-glow"
          >
            Créer mon premier persona
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {personas.map((p) => (
            <PersonaCard key={p.id} persona={p} />
          ))}
        </div>
      )}
    </div>
  );
}
