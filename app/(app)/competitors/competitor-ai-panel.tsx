"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui";
import { Sparkles, Plus, Trash2 } from "lucide-react";
import {
  analyzeCompetitor,
  type CompetitorAnalysisResult,
} from "@/lib/actions/competitor-ai";

interface PostDraft {
  id: string;
  caption: string;
  stats: string;
}

function emptyPost(): PostDraft {
  return { id: Math.random().toString(36).slice(2, 10), caption: "", stats: "" };
}

export function CompetitorAIPanel() {
  const [username, setUsername] = useState("");
  const [posts, setPosts] = useState<PostDraft[]>([emptyPost(), emptyPost(), emptyPost()]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompetitorAnalysisResult | null>(null);

  function updatePost(id: string, field: "caption" | "stats", value: string) {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  }

  function addPost() {
    if (posts.length >= 5) return;
    setPosts([...posts, emptyPost()]);
  }

  function removePost(id: string) {
    if (posts.length <= 1) return;
    setPosts(posts.filter((p) => p.id !== id));
  }

  async function handleAnalyze() {
    const clean = posts
      .map((p) => ({ caption: p.caption.trim(), stats: p.stats.trim() || undefined }))
      .filter((p) => p.caption.length >= 10);

    if (!username.trim()) {
      setResult({ ok: false, error: "Ajoute le @ du concurrent." });
      return;
    }
    if (clean.length === 0) {
      setResult({ ok: false, error: "Colle au moins 1 post (10 caractères min)." });
      return;
    }

    setLoading(true);
    setResult(null);
    const res = await analyzeCompetitor({ username: username.trim(), posts: clean });
    setResult(res);
    setLoading(false);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Form */}
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Concurrent à analyser
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="@nom_du_concurrent"
            className="w-full rounded-xl border border-border bg-surface-1 px-4 py-2.5 text-sm text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-foreground">
              Ses posts qui cartonnent ({posts.length}/5)
            </label>
            {posts.length < 5 && (
              <button
                onClick={addPost}
                className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-hover"
              >
                <Plus className="h-3 w-3" /> Ajouter
              </button>
            )}
          </div>

          <div className="space-y-3">
            {posts.map((p, i) => (
              <div key={p.id} className="rounded-xl border border-border bg-surface-1 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-text-muted">Post {i + 1}</span>
                  {posts.length > 1 && (
                    <button
                      onClick={() => removePost(p.id)}
                      className="text-text-muted hover:text-danger"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <textarea
                  value={p.caption}
                  onChange={(e) => updatePost(p.id, "caption", e.target.value)}
                  placeholder="Colle la légende du post ici..."
                  rows={3}
                  className="w-full rounded-lg border border-border bg-surface-2 p-2 text-sm text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none resize-y"
                />
                <input
                  type="text"
                  value={p.stats}
                  onChange={(e) => updatePost(p.id, "stats", e.target.value)}
                  placeholder='Stats (optionnel, ex: "200k vues, 15k likes")'
                  className="mt-2 w-full rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-xs text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="h-4 w-4" />
          {loading ? "Analyse en cours..." : "Analyser avec l'IA"}
        </button>
      </div>

      {/* Result */}
      <div className="space-y-4">
        {loading && (
          <Card>
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              <p className="mt-3 text-sm text-text-secondary">
                Claude décortique {username || "le concurrent"}...
              </p>
            </div>
          </Card>
        )}

        {result && !result.ok && (
          <div className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
            {result.error}
          </div>
        )}

        {result?.ok && (
          <>
            {result.summary && (
              <Card>
                <CardHeader>
                  <CardTitle>Résumé</CardTitle>
                </CardHeader>
                <p className="text-sm text-foreground leading-relaxed">{result.summary}</p>
              </Card>
            )}

            {result.patterns && result.patterns.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Patterns récurrents</CardTitle>
                </CardHeader>
                <div className="space-y-3">
                  {result.patterns.map((p, i) => (
                    <div key={i} className="rounded-lg bg-surface-2 p-3">
                      <div className="text-sm font-semibold text-foreground mb-1">
                        {p.title}
                      </div>
                      <div className="text-xs text-text-secondary leading-relaxed">
                        {p.description}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {result.strengths && result.strengths.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Ses forces</CardTitle>
                </CardHeader>
                <ul className="space-y-2 pl-5 list-disc text-sm text-foreground">
                  {result.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </Card>
            )}

            {result.yourGap && (
              <div className="rounded-xl border border-warning/30 bg-warning/10 p-4">
                <div className="text-xs font-semibold text-warning uppercase tracking-wider mb-1">
                  Ton gap
                </div>
                <p className="text-sm text-foreground">{result.yourGap}</p>
              </div>
            )}

            {result.ideasToAdapt && result.ideasToAdapt.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>3 idées à adapter pour toi</CardTitle>
                </CardHeader>
                <ol className="space-y-2 pl-5 list-decimal text-sm text-foreground">
                  {result.ideasToAdapt.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ol>
              </Card>
            )}

            {result.differentiatingAngle && (
              <div className="rounded-xl border border-accent/30 bg-accent/10 p-4">
                <div className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">
                  Ton angle différenciant
                </div>
                <p className="text-sm text-foreground">{result.differentiatingAngle}</p>
              </div>
            )}
          </>
        )}

        {!result && !loading && (
          <Card>
            <div className="p-6 text-center text-sm text-text-secondary">
              Entre le @ d'un concurrent + colle 3 de ses posts qui ont cartonné,
              puis l'IA extraira ses patterns et te proposera des idées à adapter
              pour ta propre audience.
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
