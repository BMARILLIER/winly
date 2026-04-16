"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveHook, generateHooksWithAI, type HookWithPayoff } from "@/lib/actions/hooks";
import { generateHooks, HOOK_TYPES } from "@/modules/hooks";
import { Sparkles, ChevronDown, ShieldCheck, AlertTriangle } from "lucide-react";

interface Props {
  niche: string;
  workspaceId: string;
  activeType: string | null;
}

export function HookGenerator({ niche, workspaceId, activeType }: Props) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(activeType);
  const [hooks, setHooks] = useState(() =>
    generateHooks(niche, activeType, 6)
  );
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState("");
  const [isAiMode, setIsAiMode] = useState(false);

  function selectType(typeId: string | null) {
    setSelectedType(typeId);
    setHooks(generateHooks(niche, typeId, 6));
    setSavedIds(new Set());
    setIsAiMode(false);
    const url = typeId ? `/hooks?type=${typeId}` : "/hooks";
    router.replace(url, { scroll: false });
  }

  function regenerate() {
    const all = generateHooks(niche, selectedType, 40);
    const offset = hooks.length + savedIds.size;
    const next = all.slice(offset, offset + 6);
    setHooks(next.length > 0 ? next : all.slice(0, 6));
    setSavedIds(new Set());
    setIsAiMode(false);
  }

  const [aiHooks, setAiHooks] = useState<HookWithPayoff[]>([]);
  const [expandedHook, setExpandedHook] = useState<number | null>(null);

  async function handleAiGenerate() {
    setGenerating(true);
    setAiError("");
    const result = await generateHooksWithAI(topic, selectedType, niche);
    setGenerating(false);
    if (result.ok && result.hooks) {
      setAiHooks(result.hooks);
      setHooks(
        result.hooks.map((h) => ({
          text: h.text,
          type: selectedType ?? "curiosity",
        }))
      );
      setSavedIds(new Set());
      setIsAiMode(true);
      setExpandedHook(null);
    } else {
      setAiError(result.error ?? "Erreur inconnue.");
    }
  }

  function markSaved(index: number) {
    setSavedIds((prev) => new Set(prev).add(index));
  }

  return (
    <div>
      {/* AI Topic input */}
      <div className="mb-6 space-y-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Sujet (optionnel)
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ex: mon setup DJ, soirée house, vinyles..."
            className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <button
          onClick={handleAiGenerate}
          disabled={generating}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-violet px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
        >
          <Sparkles className="h-4 w-4" />
          {generating ? "Génération en cours..." : "Générer des hooks avec l'IA"}
        </button>
        {aiError && (
          <div className="rounded-lg bg-danger/15 p-3 text-sm text-danger">
            {aiError}
          </div>
        )}
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => selectType(null)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            selectedType === null
              ? "bg-accent text-white"
              : "bg-surface-2 text-text-secondary hover:bg-surface-3"
          }`}
        >
          Tous les types
        </button>
        {HOOK_TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => selectType(t.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedType === t.id
                ? "bg-accent text-white"
                : `${t.color} hover:opacity-80`
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Selected type description */}
      {selectedType && (
        <p className="mb-4 text-sm text-text-secondary">
          {HOOK_TYPES.find((t) => t.id === selectedType)?.description}
        </p>
      )}

      {/* AI mode badge */}
      {isAiMode && (
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-violet/10 px-3 py-1 text-xs font-medium text-violet">
          <Sparkles className="h-3 w-3" />
          Généré par l&apos;IA
        </div>
      )}

      {/* Generated hooks */}
      <div className="space-y-3">
        {hooks.map((hook, i) => {
          const typeInfo = HOOK_TYPES.find((t) => t.id === hook.type);
          const isSaved = savedIds.has(i);
          const aiHook = isAiMode ? aiHooks[i] : null;
          const isExpanded = expandedHook === i;

          return (
            <div
              key={`${hook.text}-${i}`}
              className="rounded-xl border border-border bg-surface-1 transition-all duration-200 hover:border-border-hover"
            >
              <div className="p-5 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {hook.text}
                  </p>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${typeInfo?.color ?? "bg-surface-2 text-text-secondary"}`}
                    >
                      {typeInfo?.label ?? hook.type}
                    </span>
                    {aiHook && (
                      <>
                        {aiHook.verified ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                            <ShieldCheck className="h-3 w-3" /> Vérifié
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                            <AlertTriangle className="h-3 w-3" /> À vérifier
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {aiHook?.payoff && (
                    <button
                      type="button"
                      onClick={() => setExpandedHook(isExpanded ? null : i)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-2 transition-colors flex items-center gap-1"
                    >
                      Développement
                      <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                  )}
                  {isSaved ? (
                    <span className="rounded-lg px-3 py-1.5 text-xs font-medium text-success">
                      Sauvegardé
                    </span>
                  ) : (
                    <form
                      action={async (formData) => {
                        await saveHook(formData);
                        markSaved(i);
                      }}
                    >
                      <input type="hidden" name="workspaceId" value={workspaceId} />
                      <input type="hidden" name="text" value={hook.text} />
                      <input type="hidden" name="type" value={hook.type} />
                      <button
                        type="submit"
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent-muted transition-colors"
                      >
                        + Sauvegarder
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Payoff / development */}
              {isExpanded && aiHook?.payoff && (
                <div className="border-t border-border px-5 py-4 bg-surface-2/50">
                  <p className="text-sm text-foreground leading-relaxed">
                    {aiHook.payoff}
                  </p>
                  {aiHook.verificationNote && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-xs text-warning">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>{aiHook.verificationNote}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Regenerate */}
      <button
        onClick={isAiMode ? handleAiGenerate : regenerate}
        disabled={generating}
        className="mt-6 w-full rounded-lg border-2 border-dashed border-border py-3 text-sm font-medium text-text-secondary hover:border-accent/50 hover:text-accent transition-colors disabled:opacity-50"
      >
        {generating ? "Génération..." : "Générer plus de hooks"}
      </button>
    </div>
  );
}
