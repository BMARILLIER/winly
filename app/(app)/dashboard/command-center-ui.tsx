"use client";

import { useMemo } from "react";
import Link from "next/link";
import { GrowthScoreHeroCard } from "@/components/ui/growth-score-hero-card";
import { OpportunityHighlightCard } from "@/components/ui/opportunity-highlight-card";
import { BestActionCard } from "@/components/ui/best-action-card";
import { TrendSignalCard } from "@/components/ui/trend-signal-card";
import { WeeklyPlanSummary } from "@/components/ui/weekly-plan-summary";
import { DailyGrowthPlanCard } from "@/components/ui/daily-growth-plan-card";
import { RevenueCard } from "@/components/ui/revenue-card";
import { RecommendationsCard } from "@/components/ui/recommendations-card";
import { AlertsCard } from "@/components/ui/alerts-card";
import { DealAnalyzerWidget } from "@/components/ui/deal-analyzer-widget";
import type { BestContent } from "@/lib/queries/best-content";
import type { RevenueReport } from "@/modules/revenue";
import type { Recommendation } from "@/modules/recommendations";
import type { Alert } from "@/modules/alerts";
import type { CreatorProfile } from "@/modules/deal-analyzer";
import { AIAssistantAvatar } from "@/components/ui/ai-assistant-avatar";
import { findOpportunities, COMPETITION_STYLES } from "@/modules/opportunity-finder";
import { mockGrowthReport } from "@/lib/mock/growth-engine";
import { mockOpportunities } from "@/lib/mock/opportunity-detector";
import { mockSocialRadarReport } from "@/lib/mock/social-radar";

interface Props {
  workspaceId: string;
  workspaceName: string;
  platform: string;
  niche: string;
  bestContent: BestContent | null;
  igUsername: string | null;
  igLastSync: string | null;
  contentCount: number;
  revenueReport: RevenueReport;
  recommendations: Recommendation[];
  alerts: Alert[];
  hasInstagram: boolean;
  creatorProfile: CreatorProfile;
}

export function CommandCenterUI({
  workspaceId,
  workspaceName,
  platform,
  niche,
  bestContent,
  igUsername,
  igLastSync,
  contentCount,
  revenueReport,
  recommendations,
  alerts,
  hasInstagram,
  creatorProfile,
}: Props) {
  const report = mockGrowthReport;
  const topOpp = mockOpportunities.sort((a, b) => b.score - a.score)[0];
  const topFinderOpps = useMemo(() => findOpportunities(niche as any).slice(0, 3), [niche]);
  const bestAction = report.recommendations[0];
  const topSignal = mockSocialRadarReport.signals.sort((a, b) => b.score - a.score)[0];

  const explanation = useMemo(() => {
    if (report.score >= 70) return "Votre moteur de croissance tourne a plein regime. Concentrez-vous sur la regularite et capitalisez sur votre meilleur format.";
    if (report.score >= 50) return "Base solide avec de la marge de progression. Concentrez-vous sur votre facteur le plus faible pour debloquer le niveau suivant.";
    if (report.score >= 30) return "Il y a des opportunites claires d'amelioration. Priorisez l'action recommandee ci-dessous pour creer de l'elan.";
    return "Votre parcours de croissance commence. Suivez le plan d'action pour construire des bases solides.";
  }, [report.score]);

  const weeklyActions = useMemo(() => {
    const days = ["Lun", "Mar", "Mer", "Jeu", "Ven"];
    const tasks = [
      { task: "Creer un lot de contenu", category: "content" as const },
      { task: "Engager avec la communaute", category: "engagement" as const },
      { task: "Publier & analyser", category: "content" as const },
      { task: "Analyser les statistiques", category: "strategy" as const },
      { task: "Planifier la semaine suivante", category: "strategy" as const },
    ];
    return days.map((day, i) => ({ day, ...tasks[i] }));
  }, []);

  const focusArea = useMemo(() => {
    const weakest = [...report.factors].sort((a, b) => a.score - b.score)[0];
    return weakest?.label ?? "Growth";
  }, [report.factors]);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Centre de commande</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {workspaceName} · {platform} · {niche}
        </p>
      </div>

      {/* Connected sources */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {igUsername ? (
          <div className="inline-flex items-center gap-2 rounded-lg bg-success/10 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-success" />
            <span className="text-xs font-medium text-success">@{igUsername}</span>
            {igLastSync && (
              <span className="text-[10px] text-success/70">
                sync {new Date(igLastSync).toLocaleDateString("fr-FR")}
              </span>
            )}
          </div>
        ) : (
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 rounded-lg bg-warning/10 px-3 py-1.5 hover:bg-warning/20 transition-colors"
          >
            <span className="h-2 w-2 rounded-full bg-warning" />
            <span className="text-xs font-medium text-warning">Instagram non connecte</span>
            <span className="text-[10px] text-warning/70">Connecter →</span>
          </Link>
        )}

        <div className="inline-flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-1.5">
          <span className="text-xs text-text-secondary">
            {contentCount > 0
              ? `${contentCount} contenu${contentCount > 1 ? "s" : ""} analysable${contentCount > 1 ? "s" : ""}`
              : "Aucun contenu importe"}
          </span>
          {contentCount === 0 && (
            <Link href="/content" className="text-[10px] text-accent hover:underline">
              Importer →
            </Link>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          REVENUE ENGINE — the hero section
          ═══════════════════════════════════════════════════════ */}
      <div className="mb-6">
        <RevenueCard report={revenueReport} />
        {!hasInstagram && (
          <p className="mt-2 text-[11px] text-text-muted text-center">
            Estimations basees sur votre niche. <Link href="/settings" className="text-accent hover:underline">Connectez Instagram</Link> pour des chiffres precis.
          </p>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════
          DEAL ANALYZER — interactive widget
          ═══════════════════════════════════════════════════════ */}
      <div className="mb-6">
        <DealAnalyzerWidget creatorProfile={creatorProfile} />
      </div>

      {/* ═══════════════════════════════════════════════════════
          ALERTS + RECOMMENDATIONS — side by side
          ═══════════════════════════════════════════════════════ */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <RecommendationsCard recommendations={recommendations} />
        <AlertsCard alerts={alerts} />
      </div>

      {/* ═══════════════════════════════════════════════════════
          GROWTH SCORE — existing hero
          ═══════════════════════════════════════════════════════ */}
      <div className="mb-6">
        <GrowthScoreHeroCard
          score={report.score}
          grade={report.grade}
          label={report.label}
          explanation={explanation}
        />
      </div>

      {/* 2-column grid */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {topOpp && (
          <OpportunityHighlightCard
            title={topOpp.title}
            action={topOpp.action}
            score={topOpp.score}
            urgency={topOpp.urgency}
            explanation={topOpp.explanation}
          />
        )}

        {bestAction && (
          <BestActionCard
            title={bestAction.title}
            why={bestAction.why}
            trigger={bestAction.trigger}
            impact={bestAction.impact}
            targetFactor={bestAction.targetFactor.replace(/_/g, " ")}
          />
        )}
      </div>

      {/* 2-column grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {topSignal && (
          <TrendSignalCard
            title={topSignal.title}
            direction={topSignal.direction}
            score={topSignal.score}
            category={topSignal.category}
            action={topSignal.recommendedAction}
          />
        )}

        <WeeklyPlanSummary
          actions={weeklyActions}
          focusArea={focusArea}
        />
      </div>

      {/* Top Opportunities from Finder */}
      {topFinderOpps.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Opportunites sous-exploitees</h3>
            <Link href="/opportunity-finder" className="text-xs text-accent hover:underline">
              Voir tout →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {topFinderOpps.map((opp) => {
              const compStyle = COMPETITION_STYLES[opp.competition];
              return (
                <div key={opp.id} className="rounded-xl border border-border bg-surface-1 p-4 transition-all duration-200 hover:border-border-hover">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${compStyle.color}`}>
                      {compStyle.label}
                    </span>
                    <span className="text-sm font-bold text-foreground">{opp.score}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1 line-clamp-1">{opp.title}</p>
                  <p className="text-xs text-text-secondary line-clamp-2">{opp.recommendation}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Daily Growth Plan */}
      <div className="mt-6">
        <DailyGrowthPlanCard workspaceId={workspaceId} bestContent={bestContent} />
      </div>

      {/* AI Assistant Teaser */}
      <div className="mt-6 rounded-xl border border-accent/20 bg-accent/5 p-4">
        <div className="flex items-center gap-3">
          <AIAssistantAvatar size="md" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Winly AI</p>
            <p className="text-xs text-text-secondary">
              {bestAction
                ? `Priorite : ${bestAction.title}`
                : "Pret a vous aider a croitre."}
            </p>
          </div>
          <span className="text-[10px] text-text-muted">Cliquez sur le bouton en bas a droite</span>
        </div>
      </div>
    </div>
  );
}
