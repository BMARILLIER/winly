"use client";

import { useMemo } from "react";
import Link from "next/link";
import { GrowthScoreHeroCard } from "@/components/ui/growth-score-hero-card";
import { OpportunityHighlightCard } from "@/components/ui/opportunity-highlight-card";
import { BestActionCard } from "@/components/ui/best-action-card";
import { TrendSignalCard } from "@/components/ui/trend-signal-card";
import { WeeklyPlanSummary } from "@/components/ui/weekly-plan-summary";
import { DailyGrowthPlanCard } from "@/components/ui/daily-growth-plan-card";
import { AIAssistantAvatar } from "@/components/ui/ai-assistant-avatar";
import { findOpportunities, COMPETITION_STYLES } from "@/modules/opportunity-finder";
import { mockGrowthReport } from "@/lib/mock/growth-engine";
import { mockOpportunities } from "@/lib/mock/opportunity-detector";
import { mockSocialRadarReport } from "@/lib/mock/social-radar";

interface Props {
  workspaceName: string;
  platform: string;
  niche: string;
}

export function CommandCenterUI({ workspaceName, platform, niche }: Props) {
  const report = mockGrowthReport;
  const topOpp = mockOpportunities.sort((a, b) => b.score - a.score)[0];
  const topFinderOpps = useMemo(() => findOpportunities(niche as any).slice(0, 3), [niche]);
  const bestAction = report.recommendations[0];
  const topSignal = mockSocialRadarReport.signals.sort((a, b) => b.score - a.score)[0];

  const explanation = useMemo(() => {
    if (report.score >= 70) return "Votre moteur de croissance tourne à plein régime. Concentrez-vous sur la régularité et capitalisez sur votre meilleur format.";
    if (report.score >= 50) return "Base solide avec de la marge de progression. Concentrez-vous sur votre facteur le plus faible pour débloquer le niveau suivant.";
    if (report.score >= 30) return "Il y a des opportunités claires d'amélioration. Priorisez l'action recommandée ci-dessous pour créer de l'élan.";
    return "Votre parcours de croissance commence. Suivez le plan d'action pour construire des bases solides.";
  }, [report.score]);

  const weeklyActions = useMemo(() => {
    const days = ["Lun", "Mar", "Mer", "Jeu", "Ven"];
    const tasks = [
      { task: "Créer un lot de contenu", category: "content" as const },
      { task: "Engager avec la communauté", category: "engagement" as const },
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
        <h1 className="text-2xl font-bold text-foreground">Centre de commande Growth</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {workspaceName} · {platform} · {niche}
        </p>
      </div>

      {/* Growth Score Hero — full width */}
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
        {/* Top Opportunity */}
        {topOpp && (
          <OpportunityHighlightCard
            title={topOpp.title}
            action={topOpp.action}
            score={topOpp.score}
            urgency={topOpp.urgency}
            explanation={topOpp.explanation}
          />
        )}

        {/* Best Action */}
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
        {/* Trend Signal */}
        {topSignal && (
          <TrendSignalCard
            title={topSignal.title}
            direction={topSignal.direction}
            score={topSignal.score}
            category={topSignal.category}
            action={topSignal.recommendedAction}
          />
        )}

        {/* Weekly Plan */}
        <WeeklyPlanSummary
          actions={weeklyActions}
          focusArea={focusArea}
        />
      </div>

      {/* Top Opportunities from Finder */}
      {topFinderOpps.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Opportunités sous-exploitées</h3>
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
        <DailyGrowthPlanCard />
      </div>

      {/* AI Assistant Teaser */}
      <div className="mt-6 rounded-xl border border-accent/20 bg-accent/5 p-4">
        <div className="flex items-center gap-3">
          <AIAssistantAvatar size="md" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Winly AI</p>
            <p className="text-xs text-text-secondary">
              {bestAction
                ? `Priorité : ${bestAction.title}`
                : "Prêt à vous aider à croître."}
            </p>
          </div>
          <span className="text-[10px] text-text-muted">Cliquez sur le bouton en bas à droite</span>
        </div>
      </div>
    </div>
  );
}
