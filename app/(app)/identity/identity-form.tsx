"use client";

import { useState } from "react";
import { saveCreatorIdentity, type CreatorIdentityData } from "@/lib/actions/creator-identity";
import { suggestIdentityField } from "@/lib/actions/identity-suggest";
import { Save, CheckCircle2, Sparkles } from "lucide-react";

const FIELDS: { key: keyof CreatorIdentityData; label: string; placeholder: string; rows: number }[] = [
  { key: "bio", label: "Qui je suis", placeholder: "DJ house basée à Paris, 10 ans d'expérience, résidente au Rex Club...", rows: 2 },
  { key: "tone", label: "Mon ton de communication", placeholder: "Fun, énergique, authentique, parfois provocateur...", rows: 1 },
  { key: "values", label: "Mes valeurs", placeholder: "Partage, authenticité, passion de la musique, accessibilité...", rows: 1 },
  { key: "story", label: "Mon parcours", placeholder: "J'ai commencé à mixer à 16 ans, premier set en club à 20 ans...", rows: 3 },
  { key: "products", label: "Mes produits / services", placeholder: "Sets DJ, cours de mix en ligne, merch, playlist Spotify...", rows: 2 },
  { key: "expertise", label: "Mon expertise", placeholder: "Mix house/tech-house, sélection musicale, transition harmonique...", rows: 2 },
  { key: "audience", label: "Mon audience cible", placeholder: "DJs débutants 18-30 ans, fans de house music, clubbers...", rows: 1 },
  { key: "catchphrases", label: "Mes expressions signatures", placeholder: "\"Le mix c'est la vie\", \"Drop the beat\", expressions que j'utilise souvent...", rows: 1 },
  { key: "avoid", label: "Ce que je ne veux JAMAIS dire/faire", placeholder: "Pas de langage corporate, pas de \"nous\", jamais de contenu négatif sur d'autres DJs...", rows: 2 },
  { key: "references", label: "Mes inspirations", placeholder: "@djsnake, @blackcoffee, Carl Cox, le style de communication de Boiler Room...", rows: 1 },
  { key: "freeNotes", label: "Notes libres", placeholder: "Tout ce qui peut aider l'IA à mieux vous connaître...", rows: 3 },
];

const EMPTY: CreatorIdentityData = {
  bio: "", tone: "", values: "", story: "", products: "",
  expertise: "", audience: "", catchphrases: "", avoid: "",
  references: "", freeNotes: "",
};

interface Props {
  workspaceId: string;
  niche: string;
  platform: string;
  initial: CreatorIdentityData | null;
}

export function IdentityForm({ workspaceId, niche, platform, initial }: Props) {
  const [data, setData] = useState<CreatorIdentityData>(initial ?? EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [suggesting, setSuggesting] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});
  const [rejected, setRejected] = useState<Record<string, string[]>>({});

  function update(key: keyof CreatorIdentityData, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSuggest(field: { key: keyof CreatorIdentityData; label: string }) {
    if (suggesting) return;
    setSuggesting(field.key);
    const rejectedList = rejected[field.key] ?? [];
    const res = await suggestIdentityField(field.key, field.label, niche, platform, data, rejectedList);
    if (res.ok && res.suggestions) {
      // Filter out any that were already rejected (just in case)
      const fresh = res.suggestions.filter((s) => !rejectedList.includes(s));
      setSuggestions((prev) => ({ ...prev, [field.key]: fresh }));
    }
    setSuggesting(null);
  }

  function applySuggestion(key: keyof CreatorIdentityData, suggestion: string) {
    const current = data[key];
    const newValue = current.trim()
      ? `${current}, ${suggestion}`
      : suggestion;
    update(key, newValue);
    setSuggestions((prev) => ({
      ...prev,
      [key]: (prev[key] ?? []).filter((s) => s !== suggestion),
    }));
  }

  function dismissSuggestion(key: keyof CreatorIdentityData, suggestion: string) {
    setSuggestions((prev) => ({
      ...prev,
      [key]: (prev[key] ?? []).filter((s) => s !== suggestion),
    }));
    setRejected((prev) => ({
      ...prev,
      [key]: [...(prev[key] ?? []), suggestion],
    }));
  }

  async function handleSave() {
    setSaving(true);
    const res = await saveCreatorIdentity(workspaceId, data);
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  const filledCount = FIELDS.filter((f) => data[f.key].trim()).length;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="rounded-xl border border-border bg-surface-1 p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            Profil complété : {filledCount}/{FIELDS.length} champs
          </p>
          <p className="text-xs text-text-muted mt-0.5">
            Plus votre profil est complet, plus le contenu généré sera pertinent.
          </p>
        </div>
        <div className="w-24 h-2 rounded-full bg-surface-3 overflow-hidden">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${Math.round((filledCount / FIELDS.length) * 100)}%` }}
          />
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        {FIELDS.map((field) => (
          <div key={field.key} className="rounded-xl border border-border bg-surface-1 p-5 transition-all duration-200 hover:border-border-hover">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-foreground">
                {field.label}
              </label>
              <button
                onClick={() => handleSuggest(field)}
                disabled={suggesting === field.key}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline disabled:opacity-50"
              >
                <Sparkles className="h-3 w-3" />
                {suggesting === field.key ? "..." : "Suggérer"}
              </button>
            </div>

            {field.rows === 1 ? (
              <input
                type="text"
                value={data[field.key]}
                onChange={(e) => update(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="block w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            ) : (
              <textarea
                rows={field.rows}
                value={data[field.key]}
                onChange={(e) => update(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="block w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            )}

            {/* AI Suggestions */}
            {suggestions[field.key] && suggestions[field.key].length > 0 && (
              <div className="mt-2 space-y-1.5">
                {suggestions[field.key].map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg bg-accent/5 border border-accent/15 px-3 py-2"
                  >
                    <p className="flex-1 text-xs text-foreground">{s}</p>
                    <button
                      onClick={() => applySuggestion(field.key, s)}
                      className="shrink-0 rounded px-2 py-0.5 text-[10px] font-medium text-green-600 bg-green-500/10 hover:bg-green-500/20 transition-colors"
                    >
                      Garder
                    </button>
                    <button
                      onClick={() => dismissSuggestion(field.key, s)}
                      className="shrink-0 rounded px-2 py-0.5 text-[10px] font-medium text-danger bg-danger/10 hover:bg-danger/20 transition-colors"
                    >
                      Rejeter
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleSuggest(field)}
                  disabled={suggesting === field.key}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline disabled:opacity-50 mt-1"
                >
                  <Sparkles className="h-3 w-3" />
                  {suggesting === field.key ? "Génération..." : "Proposer d'autres"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Save button */}
      <div className="sticky bottom-4 flex justify-end">
        {saved ? (
          <span className="inline-flex items-center gap-2 rounded-lg bg-green-500/10 px-5 py-3 text-sm font-medium text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            Profil sauvegardé
          </span>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50 shadow-lg"
          >
            <Save className="h-4 w-4" />
            {saving ? "Sauvegarde..." : "Sauvegarder mon profil"}
          </button>
        )}
      </div>
    </div>
  );
}
