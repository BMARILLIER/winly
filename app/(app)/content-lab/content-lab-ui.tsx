"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { predictContent, PREDICTION_FORMATS, REACH_STYLES, RATE_STYLES } from "@/modules/predictor";
import type { PredictionResult } from "@/modules/predictor";
import { SectionHeader, Card, CardHeader, CardTitle, Badge } from "@/components/ui";
import { FlaskConical, Gem } from "lucide-react";
import Link from "next/link";
import { getCreatorIntelligence } from "@/lib/creator-data-engine";
import { getEngagementForFormatNiche, getTopFormats, ENGAGEMENT_STYLES } from "@/lib/creator-graph";
import type { Niche, ContentFormat } from "@/types";

interface Props {
  platform: string;
  niche: string;
  profileType: string;
}

export function ContentLabUI({ platform, niche, profileType }: Props) {
  const searchParams = useSearchParams();
  const [subject, setSubject] = useState("");
  const [format, setFormat] = useState("reel");
  const [hook, setHook] = useState("");
  const [duration, setDuration] = useState("short");
  const [result, setResult] = useState<PredictionResult | null>(null);
  const creatorData = useMemo(() => getCreatorIntelligence(), []);
  const bestHour = creatorData.aggregated.bestPublishHour;

  // Préremplissage depuis Opportunity Finder (query params)
  useEffect(() => {
    const s = searchParams.get("subject");
    const h = searchParams.get("hook");
    const f = searchParams.get("format");
    const d = searchParams.get("duration");
    if (s) setSubject(s);
    if (h) setHook(h);
    if (f) setFormat(f);
    if (d) setDuration(d);
  }, [searchParams]);

  function handleTest() {
    if (!subject.trim() && !hook.trim()) return;
    const prediction = predictContent({
      title: subject,
      hook,
      caption: `Contenu sur : ${subject}. Durée : ${duration}.`,
      cta: "",
      format,
      platform,
      niche,
      profileType,
    });
    setResult(prediction);
  }

  function handleReset() {
    setSubject("");
    setFormat("reel");
    setHook("");
    setDuration("short");
    setResult(null);
  }

  const reachEstimate = result
    ? result.score >= 85 ? "10K-50K vues" : result.score >= 70 ? "5K-15K vues" : result.score >= 50 ? "1K-5K vues" : "< 1K vues"
    : null;

  const potentialBadge = result
    ? result.score >= 70 ? { label: "Fort", color: "bg-success/15 text-success border-success/30" }
      : result.score >= 40 ? { label: "Moyen", color: "bg-warning/15 text-warning border-warning/30" }
      : { label: "Faible", color: "bg-danger/15 text-danger border-danger/30" }
    : null;

  // Enrichissement via Creator Graph
  const graphEngagement = useMemo(
    () => getEngagementForFormatNiche(format as ContentFormat, niche as Niche),
    [format, niche]
  );
  const graphTopFormat = useMemo(
    () => getTopFormats(niche as Niche)[0],
    [niche]
  );

  const shortRecommendation = result
    ? result.score >= 85 ? `Contenu prêt — publiez vers ${bestHour}h pour maximiser la portée.`
      : result.score >= 70 ? `Bon potentiel — publiez entre ${bestHour}h et ${bestHour + 2}h sur ${platform}.`
      : result.score >= 50
        ? graphEngagement === "low" && graphTopFormat
          ? `Ce format a un engagement faible dans votre niche. Essayez le format ${graphTopFormat.format} (engagement moyen : ${graphTopFormat.avgEngagement}/100).`
          : "Renforcez votre hook et ajoutez un CTA clair avant de publier."
      : graphTopFormat
        ? `Retravaillez le sujet. Le format ${graphTopFormat.format} performe le mieux en ${niche} (${graphTopFormat.avgEngagement}/100).`
        : "Retravaillez le sujet : testez un angle plus spécifique ou un format vidéo court."
    : null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Content Lab"
          description="Testez une idée de contenu avant de la produire"
        />
        <Link
          href="/opportunity-finder"
          className="flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-xs font-medium text-accent hover:bg-accent/10 transition-colors shrink-0"
        >
          <Gem className="h-3.5 w-3.5" />
          Trouver des idées
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Sujet</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="ex: 5 erreurs qui tuent votre croissance Instagram"
              className="w-full rounded-xl border px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Hook</label>
            <input
              type="text"
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              placeholder="ex: Most people get this wrong about hashtags..."
              className="w-full rounded-xl border px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Format</label>
            <div className="flex flex-wrap gap-2">
              {PREDICTION_FORMATS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    format === f.id ? "bg-accent text-white" : "bg-surface-2 text-text-secondary hover:bg-surface-3"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Durée estimée</label>
            <div className="flex gap-2">
              {[
                { id: "short", label: "< 30s" },
                { id: "medium", label: "30-60s" },
                { id: "long", label: "> 60s" },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDuration(d.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    duration === d.id ? "bg-accent text-white" : "bg-surface-2 text-text-secondary hover:bg-surface-3"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleTest}
              disabled={!subject.trim() && !hook.trim()}
              className="rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Tester cette idée
            </button>
            {result && (
              <button
                onClick={handleReset}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-2"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Score + Reach estimate */}
            <Card>
              <div className="flex items-center gap-6 p-6">
                <div className="relative h-28 w-28 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="var(--surface-3)" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke={result.score >= 70 ? "#8b5cf6" : result.score >= 50 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${(result.score / 100) * 264} 264`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-foreground">{result.score}</span>
                    <span className="text-[10px] text-text-muted">/ 100</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FlaskConical className="h-5 w-5 text-accent" />
                    <span className="text-lg font-semibold text-foreground">Score potentiel</span>
                  </div>
                  {potentialBadge && (
                    <div className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold mb-3 ${potentialBadge.color}`}>
                      Potentiel : {potentialBadge.label}
                    </div>
                  )}
                  <div className="rounded-lg bg-surface-2 px-3 py-2 inline-block">
                    <p className="text-xs text-text-muted">Portée estimée</p>
                    <p className="text-sm font-semibold text-foreground">{reachEstimate}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Engagement prediction grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-surface-1 p-3">
                <p className="text-[10px] text-text-muted uppercase font-medium">Portée</p>
                <p className={`text-sm font-semibold ${REACH_STYLES[result.predictions.reachLevel].color}`}>
                  {REACH_STYLES[result.predictions.reachLevel].label}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface-1 p-3">
                <p className="text-[10px] text-text-muted uppercase font-medium">Sauvegardes</p>
                <p className={`text-sm font-semibold ${RATE_STYLES[result.predictions.saveRate].color}`}>
                  {RATE_STYLES[result.predictions.saveRate].label}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface-1 p-3">
                <p className="text-[10px] text-text-muted uppercase font-medium">Partages</p>
                <p className={`text-sm font-semibold ${RATE_STYLES[result.predictions.shareRate].color}`}>
                  {RATE_STYLES[result.predictions.shareRate].label}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface-1 p-3">
                <p className="text-[10px] text-text-muted uppercase font-medium">Commentaires</p>
                <p className={`text-sm font-semibold ${RATE_STYLES[result.predictions.commentRate].color}`}>
                  {RATE_STYLES[result.predictions.commentRate].label}
                </p>
              </div>
            </div>

            {/* Recommandation courte */}
            {shortRecommendation && (
              <div className="rounded-xl border border-border bg-accent-muted p-4">
                <p className="text-xs text-text-muted uppercase font-medium mb-1">Recommandation</p>
                <p className="text-sm text-accent font-medium">{shortRecommendation}</p>
              </div>
            )}

            {/* Tips */}
            {result.tips.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Améliorations suggérées</CardTitle>
                </CardHeader>
                <div className="space-y-2">
                  {result.tips.map((tip, i) => (
                    <div key={i} className="flex gap-2 rounded-lg bg-surface-2 p-3">
                      <span className="text-sm text-warning shrink-0">→</span>
                      <p className="text-sm text-foreground">{tip}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
