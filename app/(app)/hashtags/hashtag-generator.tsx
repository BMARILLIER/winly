"use client";

import { useState, useCallback } from "react";
import {
  generateHashtagsExtended,
  HASHTAG_CATEGORIES,
  type HashtagResult,
  type HashtagExtendedResult,
} from "@/modules/hashtags";
import { PLATFORMS } from "@/lib/workspace-constants";

interface Props {
  niche: string;
  platform: string;
}

const CATEGORY_STYLES = {
  large: "border-info/30 bg-info/10 text-info",
  medium: "border-violet/30 bg-violet/10 text-violet",
  niche: "border-cyan/30 bg-cyan/10 text-cyan",
} as const;

const CATEGORY_STYLES_SELECTED = {
  large: "border-info/60 bg-info/25 text-info ring-1 ring-info/30",
  medium: "border-violet/60 bg-violet/25 text-violet ring-1 ring-violet/30",
  niche: "border-cyan/60 bg-cyan/25 text-cyan ring-1 ring-cyan/30",
} as const;

function HashtagPill({
  result,
  selected,
  onClick,
  showPosts,
}: {
  result: HashtagResult;
  selected?: boolean;
  onClick?: () => void;
  showPosts?: boolean;
}) {
  const style = selected
    ? CATEGORY_STYLES_SELECTED[result.category]
    : CATEGORY_STYLES[result.category];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex flex-col items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-150 hover:scale-105 cursor-pointer ${style}`}
    >
      <span>{result.hashtag}</span>
      {showPosts && (
        <span className="text-[10px] opacity-60">{result.estimatedPosts} posts</span>
      )}
    </button>
  );
}

export function HashtagGenerator({ niche, platform: defaultPlatform }: Props) {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState(defaultPlatform);
  const [result, setResult] = useState<HashtagExtendedResult | null>(null);
  const [customSelection, setCustomSelection] = useState<Set<string>>(new Set());
  const [copyLabel, setCopyLabel] = useState("Copier tout");
  const [copySelLabel, setCopySelLabel] = useState("Copier la sélection");

  const handleGenerate = useCallback(() => {
    if (!topic.trim()) return;
    const res = generateHashtagsExtended(topic.trim(), platform, niche);
    setResult(res);
    // Initialize custom selection with optimal set
    setCustomSelection(new Set(res.optimal.map((h) => h.hashtag)));
    setCopyLabel("Copier tout");
    setCopySelLabel("Copier la sélection");
  }, [topic, platform, niche]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleGenerate();
    },
    [handleGenerate]
  );

  const toggleHashtag = useCallback((tag: string) => {
    setCustomSelection((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }, []);

  const copyToClipboard = useCallback(
    async (text: string, type: "all" | "selection") => {
      try {
        await navigator.clipboard.writeText(text);
        if (type === "all") {
          setCopyLabel("Copié !");
          setTimeout(() => setCopyLabel("Copier tout"), 2000);
        } else {
          setCopySelLabel("Copié !");
          setTimeout(() => setCopySelLabel("Copier la sélection"), 2000);
        }
      } catch {
        // Fallback: do nothing
      }
    },
    []
  );

  const totalOptimal = result?.optimal.length ?? 0;
  const selectionArray = result
    ? [...customSelection].filter((tag) =>
        [...result.all.large, ...result.all.medium, ...result.all.niche].some(
          (h) => h.hashtag === tag
        )
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Input section */}
      <div className="rounded-xl border border-border bg-surface-1 p-6">
        <label
          htmlFor="hashtag-topic"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Sujet ou thème de votre contenu
        </label>
        <input
          id="hashtag-topic"
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ex : routine matinale, recette healthy, setup dev..."
          className="w-full rounded-lg border border-border bg-surface-2 px-4 py-3 text-sm text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
        />

        {/* Platform selector */}
        <div className="mt-4">
          <p className="text-xs font-medium text-text-secondary mb-2">
            Plateforme
          </p>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlatform(p.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  platform === p.id
                    ? "bg-accent text-white"
                    : "bg-surface-2 text-text-secondary hover:bg-surface-3 hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!topic.trim()}
          className="mt-5 w-full rounded-lg bg-gradient-to-r from-primary to-violet px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Générer les hashtags
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Optimal set */}
          <div className="rounded-xl border border-border bg-surface-1 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {totalOptimal} hashtags recommandés pour{" "}
                  {PLATFORMS.find((p) => p.id === platform)?.label ?? platform}
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Mix optimal : portée large + engagement ciblé
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(result.optimalCopyText, "all")
                }
                className="shrink-0 rounded-lg bg-gradient-to-r from-primary to-violet px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-all duration-200 cursor-pointer min-w-[120px]"
              >
                {copyLabel}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.optimal.map((h) => (
                <HashtagPill
                  key={h.hashtag}
                  result={h}
                  showPosts
                  selected={customSelection.has(h.hashtag)}
                  onClick={() => toggleHashtag(h.hashtag)}
                />
              ))}
            </div>
          </div>

          {/* Custom selection area */}
          {selectionArray.length > 0 && (
            <div className="rounded-xl border border-border bg-surface-1 p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    Votre sélection
                  </h3>
                  <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-text-secondary">
                    {selectionArray.length} sélectionné
                    {selectionArray.length > 1 ? "s" : ""}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(selectionArray.join(" "), "selection")
                  }
                  className="rounded-lg border border-accent/40 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent-muted transition-colors cursor-pointer min-w-[140px]"
                >
                  {copySelLabel}
                </button>
              </div>
              <div className="rounded-lg bg-surface-2 p-3">
                <p className="text-sm text-foreground break-all leading-relaxed">
                  {selectionArray.join(" ")}
                </p>
              </div>
            </div>
          )}

          {/* All hashtags grouped by category */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">
              Tous les hashtags disponibles
            </h3>
            <p className="text-xs text-text-secondary -mt-2">
              Cliquez pour ajouter ou retirer de votre sélection
            </p>

            {(["large", "medium", "niche"] as const).map((cat) => {
              const items = result.all[cat];
              if (items.length === 0) return null;
              const catInfo = HASHTAG_CATEGORIES[cat];

              return (
                <div
                  key={cat}
                  className="rounded-xl border border-border bg-surface-1 p-5"
                >
                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    {catInfo.label}
                    <span className="ml-2 text-xs font-normal text-text-muted">
                      ({items.length})
                    </span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {items.map((h) => (
                      <HashtagPill
                        key={h.hashtag}
                        result={h}
                        showPosts
                        selected={customSelection.has(h.hashtag)}
                        onClick={() => toggleHashtag(h.hashtag)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
