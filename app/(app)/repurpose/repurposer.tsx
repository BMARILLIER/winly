"use client";

import { useState } from "react";
import { OUTPUT_FORMATS, type RepurposedContent } from "@/modules/repurpose";
import { repurposeWithAI, saveRepurposedAsDraft } from "@/lib/actions/repurpose";
import { repurposeFromCompetitor, saveCompetitorPost, deleteCompetitorPost } from "@/lib/actions/competitor";
import { Save, CheckCircle2, Eye, Sparkles, Trash2 } from "lucide-react";

const PLATFORM_HINTS: Record<string, string> = {
  thread: "Twitter/X, LinkedIn",
  carousel: "Instagram, LinkedIn",
  video_script: "TikTok, Reels, YouTube",
  post: "Toutes plateformes",
};

type Mode = "own" | "competitor";

interface CompetitorPost {
  id: string;
  source: string;
  text: string;
  notes: string | null;
  createdAt: string;
}

interface Props {
  initialText?: string;
  workspaceId: string;
  niche: string;
  platform: string;
  identityContext: string;
  savedCompetitorPosts: CompetitorPost[];
}

export function Repurposer({ initialText = "", workspaceId, niche, platform, identityContext, savedCompetitorPosts }: Props) {
  const [mode, setMode] = useState<Mode>("own");
  const [source, setSource] = useState(initialText);
  const [competitorSource, setCompetitorSource] = useState("");
  const [competitorHandle, setCompetitorHandle] = useState("");
  const [competitorNotes, setCompetitorNotes] = useState("");
  const [results, setResults] = useState<RepurposedContent[] | null>(null);
  const [activeTab, setActiveTab] = useState("thread");
  const [copiedPart, setCopiedPart] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<CompetitorPost[]>(savedCompetitorPosts);
  const [savingPost, setSavingPost] = useState(false);
  const [postSaved, setPostSaved] = useState(false);

  async function handleRepurpose() {
    const text = mode === "own" ? source : competitorSource;
    if (!text.trim() || loading) return;
    setLoading(true);
    setFromCache(false);
    setSaved(new Set());
    try {
      const res = mode === "own"
        ? await repurposeWithAI(text, identityContext)
        : await repurposeFromCompetitor(text, niche, platform, identityContext);
      if (res.ok && res.results) {
        setResults(res.results);
        setActiveTab(res.results[0]?.formatId ?? "thread");
        setFromCache(!!res.fromCache);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveCompetitorPost() {
    if (!competitorSource.trim()) return;
    setSavingPost(true);
    const res = await saveCompetitorPost(
      workspaceId,
      competitorHandle || "concurrent",
      competitorSource,
      competitorNotes
    );
    if (res.ok && res.id) {
      setSavedPosts((prev) => [{
        id: res.id!,
        source: competitorHandle || "concurrent",
        text: competitorSource,
        notes: competitorNotes || null,
        createdAt: new Date().toISOString(),
      }, ...prev]);
      setPostSaved(true);
      setTimeout(() => setPostSaved(false), 2000);
    }
    setSavingPost(false);
  }

  async function handleDeleteCompetitorPost(id: string) {
    await deleteCompetitorPost(id);
    setSavedPosts((prev) => prev.filter((p) => p.id !== id));
  }

  function loadCompetitorPost(post: CompetitorPost) {
    setCompetitorSource(post.text);
    setCompetitorHandle(post.source);
    setCompetitorNotes(post.notes || "");
  }

  async function handleSaveDraft(content: RepurposedContent) {
    if (saved.has(content.formatId)) return;
    setSaving(content.formatId);
    try {
      const res = await saveRepurposedAsDraft(workspaceId, content.formatId, content.formatLabel, content.parts);
      if (res.ok) {
        setSaved((prev) => new Set(prev).add(content.formatId));
      }
    } finally {
      setSaving(null);
    }
  }

  function copyPart(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedPart(id);
    setTimeout(() => setCopiedPart(null), 2000);
  }

  function copyAll(content: RepurposedContent) {
    const full = content.parts.join("\n\n---\n\n");
    navigator.clipboard.writeText(full);
    setCopiedAll(content.formatId);
    setTimeout(() => setCopiedAll(null), 2000);
  }

  const activeResult = results?.find((r) => r.formatId === activeTab);

  return (
    <div>
      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setMode("own"); setResults(null); }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === "own"
              ? "bg-accent text-white"
              : "bg-surface-2 text-text-secondary hover:bg-surface-3"
          }`}
        >
          Mon contenu
        </button>
        <button
          onClick={() => { setMode("competitor"); setResults(null); }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === "competitor"
              ? "bg-accent text-white"
              : "bg-surface-2 text-text-secondary hover:bg-surface-3"
          }`}
        >
          <Sparkles className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
          Inspiration concurrent
        </button>
      </div>

      {/* Own content mode */}
      {mode === "own" && (
        <div className="rounded-xl border border-border bg-surface-1 p-6 transition-all duration-200 hover:border-border-hover">
          <label htmlFor="source" className="block text-sm font-medium text-foreground">
            Votre contenu
          </label>
          <textarea
            id="source"
            rows={6}
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Collez votre post, article, notes..."
            className="mt-2 block w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-text-muted">{source.length} characters</span>
            <button
              onClick={handleRepurpose}
              disabled={!source.trim() || loading}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
            >
              {loading ? "Transformation..." : "Repurpose"}
            </button>
          </div>
        </div>
      )}

      {/* Competitor mode */}
      {mode === "competitor" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-accent/30 bg-accent/5 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground">
                Post du concurrent
              </label>
              <p className="text-xs text-text-secondary mt-0.5 mb-2">
                Collez un post qui a bien performé — Claude analysera ce qui fonctionne et créera du contenu original pour vous.
              </p>
              <textarea
                rows={6}
                value={competitorSource}
                onChange={(e) => setCompetitorSource(e.target.value)}
                placeholder="Collez le texte du post concurrent ici..."
                className="block w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-text-secondary">Source (optionnel)</label>
                <input
                  type="text"
                  value={competitorHandle}
                  onChange={(e) => setCompetitorHandle(e.target.value)}
                  placeholder="@compte_concurrent"
                  className="mt-1 block w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary">Notes (optionnel)</label>
                <input
                  type="text"
                  value={competitorNotes}
                  onChange={(e) => setCompetitorNotes(e.target.value)}
                  placeholder="Ex: 200k vues, bon hook..."
                  className="mt-1 block w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {postSaved ? (
                  <span className="text-xs text-green-600">Sauvegardé !</span>
                ) : (
                  <button
                    onClick={handleSaveCompetitorPost}
                    disabled={!competitorSource.trim() || savingPost}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
                  >
                    <Save className="h-3 w-3" />
                    {savingPost ? "..." : "Garder en mémoire"}
                  </button>
                )}
                <span className="text-xs text-text-muted">{competitorSource.length} chars</span>
              </div>
              <button
                onClick={handleRepurpose}
                disabled={!competitorSource.trim() || loading}
                className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
              >
                {loading ? "Analyse..." : "S'inspirer de ce post"}
              </button>
            </div>
          </div>

          {/* Saved competitor posts library */}
          {savedPosts.length > 0 && (
            <div className="rounded-xl border border-border bg-surface-1 p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Posts concurrents sauvegardés ({savedPosts.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {savedPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-start gap-2 rounded-lg bg-surface-2 p-3 group"
                  >
                    <button
                      onClick={() => loadCompetitorPost(post)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-accent">{post.source}</span>
                        {post.notes && (
                          <span className="text-[10px] text-text-muted">{post.notes}</span>
                        )}
                      </div>
                      <p className="text-xs text-text-secondary line-clamp-2">{post.text}</p>
                    </button>
                    <button
                      onClick={() => handleDeleteCompetitorPost(post.id)}
                      className="shrink-0 p-1 text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {results && results.length > 0 && (
        <div className="mt-8">
          {fromCache && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2 text-xs text-green-600">
              <span>En cache — aucun token consommé</span>
            </div>
          )}

          {mode === "competitor" && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-2 text-xs text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Contenu original généré à partir de l&apos;analyse du post concurrent — pas de copie, juste de l&apos;inspiration.</span>
            </div>
          )}

          <div className="flex gap-2 mb-6 overflow-x-auto">
            {OUTPUT_FORMATS.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveTab(f.id)}
                className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === f.id
                    ? "bg-accent text-white"
                    : "bg-surface-2 text-text-secondary hover:bg-surface-3"
                }`}
              >
                {f.icon} {f.label}
              </button>
            ))}
          </div>

          {activeResult && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {OUTPUT_FORMATS.find((f) => f.id === activeResult.formatId)?.icon}{" "}
                    {activeResult.formatLabel}
                  </h2>
                  <p className="text-xs text-text-secondary">
                    {activeResult.parts.length} part{activeResult.parts.length !== 1 ? "s" : ""}
                    {PLATFORM_HINTS[activeResult.formatId] && (
                      <span className="ml-2 text-text-muted">
                        — {PLATFORM_HINTS[activeResult.formatId]}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {saved.has(activeResult.formatId) ? (
                    <span className="inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Sauvegardé
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSaveDraft(activeResult)}
                      disabled={saving === activeResult.formatId}
                      className="inline-flex items-center gap-1 rounded-lg border border-accent px-4 py-2 text-sm font-medium text-accent hover:bg-accent hover:text-white transition-colors disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      {saving === activeResult.formatId ? "Sauvegarde..." : "Sauvegarder en brouillon"}
                    </button>
                  )}
                  <button
                    onClick={() => copyAll(activeResult)}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-accent hover:bg-accent-muted transition-colors"
                  >
                    {copiedAll === activeResult.formatId ? "Copied!" : "Copy all"}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {activeResult.parts.map((part, i) => {
                  const partId = `${activeResult.formatId}-${i}`;
                  return (
                    <div
                      key={i}
                      className="rounded-xl border border-border bg-surface-1 p-5 transition-all duration-200 hover:border-border-hover"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground whitespace-pre-line">{part}</p>
                        </div>
                        <button
                          onClick={() => copyPart(part, partId)}
                          className="shrink-0 rounded-lg px-3 py-1 text-xs font-medium text-text-muted hover:text-accent hover:bg-accent-muted transition-colors"
                        >
                          {copiedPart === partId ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-text-muted">Part {i + 1}/{activeResult.parts.length}</span>
                        <span className="text-xs text-text-muted">·</span>
                        <span className="text-xs text-text-muted">{part.length} chars</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {saved.has(activeResult.formatId) && (
                <div className="mt-4 rounded-lg bg-green-500/10 px-4 py-3 text-xs text-green-600">
                  Brouillon sauvegardé dans votre{" "}
                  <a href="/content" className="underline font-medium">planning de contenu</a>.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
