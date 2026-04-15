"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui";
import { Sparkles, Zap } from "lucide-react";
import { analyzeViralScore, type ViralScoreAIResult } from "@/lib/actions/viral-score-ai";

const FORMATS = [
  { id: "reel", label: "Reel / Short" },
  { id: "carousel", label: "Carrousel" },
  { id: "video", label: "Vidéo longue" },
  { id: "image", label: "Photo" },
  { id: "story", label: "Story" },
  { id: "text", label: "Post texte" },
];

interface Props {
  platform: string;
  niche: string;
}

export function ViralScoreAIPanel({ platform, niche }: Props) {
  const [caption, setCaption] = useState("");
  const [format, setFormat] = useState("reel");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ViralScoreAIResult | null>(null);

  async function handleAnalyze() {
    if (caption.trim().length < 10) {
      setResult({ ok: false, error: "Ajoute au moins 10 caractères de légende." });
      return;
    }
    setLoading(true);
    setResult(null);
    const res = await analyzeViralScore({ caption, format, platform, niche });
    setResult(res);
    setLoading(false);
  }

  function useImproved() {
    if (result?.improvedCaption) {
      setCaption(result.improvedCaption);
      setResult(null);
    }
  }

  const score = result?.ok ? result.score ?? 0 : 0;
  const ring =
    score >= 70 ? "#22c55e" : score >= 45 ? "#f59e0b" : "#ef4444";
  const badgeLabel =
    result?.badge === "fort"
      ? "Fort potentiel"
      : result?.badge === "moyen"
        ? "Potentiel moyen"
        : "À retravailler";

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Form */}
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Format prévu
          </label>
          <div className="flex flex-wrap gap-2">
            {FORMATS.map((o) => (
              <button
                key={o.id}
                onClick={() => setFormat(o.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  format === o.id
                    ? "bg-accent text-white"
                    : "bg-surface-2 text-text-secondary hover:bg-surface-3"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Ton brouillon (caption + hashtags)
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={`Colle ici ta caption complète, hook + corps + CTA + hashtags.\n\nEx : "Tu perds tes abonnés ? Voici 3 erreurs..."`}
            rows={10}
            maxLength={3000}
            className="w-full rounded-xl border border-border bg-surface-1 p-4 text-sm text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none resize-y"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-text-muted">{caption.length} / 3000</span>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || caption.trim().length < 10}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="h-4 w-4" />
          {loading ? "Analyse en cours..." : "Analyser avec l'IA"}
        </button>
      </div>

      {/* Result */}
      <div className="space-y-6">
        {loading && (
          <Card>
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              <p className="mt-3 text-sm text-text-secondary">
                Claude analyse ton brouillon...
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
            {/* Score hero */}
            <Card>
              <div className="flex items-center gap-6 p-6">
                <div className="relative h-28 w-28 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="var(--surface-3)" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke={ring}
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${(score / 100) * 264} 264`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-foreground">{score}</span>
                    <span className="text-[10px] text-text-muted">/ 100</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-accent" />
                    <span className="text-lg font-semibold text-foreground">Score IA</span>
                  </div>
                  <div
                    className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold"
                    style={{ color: ring, borderColor: ring, backgroundColor: `${ring}15` }}
                  >
                    {badgeLabel}
                  </div>
                  {result.verdict && (
                    <p className="mt-2 text-sm text-text-secondary max-w-xs">
                      {result.verdict}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Factors */}
            {result.factors && result.factors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Détail des facteurs</CardTitle>
                </CardHeader>
                <div className="space-y-3">
                  {result.factors.map((f) => (
                    <div key={f.id} className="rounded-lg bg-surface-2 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{f.label}</span>
                        <span className="text-sm font-bold text-foreground">{f.score}/100</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-surface-3 mb-2">
                        <div
                          className={`h-1.5 rounded-full ${
                            f.score >= 70
                              ? "bg-success"
                              : f.score >= 45
                                ? "bg-warning"
                                : "bg-danger"
                          }`}
                          style={{ width: `${f.score}%` }}
                        />
                      </div>
                      <p className="text-xs text-text-secondary">{f.feedback}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Improvements */}
            {result.improvements && result.improvements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Actions pour booster ton score</CardTitle>
                </CardHeader>
                <ol className="space-y-2 pl-5 list-decimal">
                  {result.improvements.map((a, i) => (
                    <li key={i} className="text-sm text-foreground">
                      {a}
                    </li>
                  ))}
                </ol>
              </Card>
            )}

            {/* Improved caption */}
            {result.improvedCaption && (
              <Card>
                <CardHeader>
                  <CardTitle>Version améliorée suggérée</CardTitle>
                </CardHeader>
                <div className="rounded-lg bg-surface-2 p-3 text-sm text-foreground whitespace-pre-wrap">
                  {result.improvedCaption}
                </div>
                <button
                  onClick={useImproved}
                  className="mt-3 rounded-lg bg-accent/10 px-4 py-2 text-xs font-medium text-accent hover:bg-accent/20"
                >
                  Utiliser cette version
                </button>
              </Card>
            )}
          </>
        )}

        {!result && !loading && (
          <Card>
            <div className="p-6 text-center text-sm text-text-secondary">
              Colle ton brouillon et clique <strong>Analyser avec l'IA</strong> pour
              obtenir un score /100, le détail par facteur et 3 actions concrètes pour
              améliorer ton post avant de publier.
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
