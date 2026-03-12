"use client";

import Link from "next/link";
import { GrowthScoreCard } from "@/components/ui/growth-score-card";
import { ScoreBreakdownCard } from "@/components/ui/score-breakdown-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockGrowthReport } from "@/lib/mock/growth-engine";
import { mockOpportunities } from "@/lib/mock/opportunity-detector";
import { mockSocialRadarReport } from "@/lib/mock/social-radar";
import { RadarSummaryPanel } from "@/components/ui/radar-summary-panel";

function getScoreColor(score: number) {
  if (score >= 70) return "text-success";
  if (score >= 40) return "text-warning";
  return "text-danger";
}

function getScoreRingColor(score: number) {
  if (score >= 70) return "stroke-[#22c55e]";
  if (score >= 40) return "stroke-[#f59e0b]";
  return "stroke-[#ef4444]";
}

const urgencyVariant = { high: "danger", medium: "warning", low: "info" } as const;

interface DashboardOverviewUIProps {
  workspaceName: string;
  platform: string;
  niche: string;
  winlyScore: number;
  hasWinlyScore: boolean;
  creatorScore: number | null;
  priorities: { label: string; done: boolean }[];
  nextContent: { suggestion: string; platform: string; frequency: string };
  progression: {
    steps: { label: string; done: boolean }[];
    completed: number;
    total: number;
    percent: number;
  };
  quickActions: { label: string; href: string }[];
}

export function DashboardOverviewUI({
  workspaceName,
  platform,
  niche,
  winlyScore,
  hasWinlyScore,
  creatorScore,
  priorities,
  nextContent,
  progression,
  quickActions,
}: DashboardOverviewUIProps) {
  const report = mockGrowthReport;
  const topOpportunities = mockOpportunities.slice(0, 3);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {workspaceName} &middot; {platform} &middot; {niche}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 flex flex-wrap gap-2">
        {quickActions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="rounded-lg border border-border bg-surface-2 px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-3 hover:text-foreground hover:border-border-hover transition-all duration-200"
          >
            {a.label}
          </Link>
        ))}
      </div>

      {/* Growth Score Hero */}
      <Card className="mb-6">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <GrowthScoreCard score={report.score} grade={report.grade} label={report.label} />
          <div className="flex-1 w-full">
            <h2 className="text-lg font-semibold text-foreground mb-4">Détail du Growth Score</h2>
            <ScoreBreakdownCard factors={report.factors} />
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Winly Score */}
        <Card>
          <h2 className="text-sm font-medium text-text-secondary">Winly Score</h2>
          <div className="mt-4 flex items-center gap-6">
            <div className="relative h-28 w-28 shrink-0">
              <svg className="h-28 w-28 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="var(--surface-3)" strokeWidth="10" />
                {hasWinlyScore && (
                  <circle
                    cx="60" cy="60" r="52" fill="none"
                    className={getScoreRingColor(winlyScore)}
                    strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${(winlyScore / 100) * 327} 327`}
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                {hasWinlyScore ? (
                  <span className={`text-3xl font-bold ${getScoreColor(winlyScore)}`}>{winlyScore}</span>
                ) : (
                  <span className="text-lg font-medium text-text-muted">&mdash;</span>
                )}
              </div>
            </div>
            <div>
              {hasWinlyScore ? (
                <p className="text-sm text-text-secondary">
                  {winlyScore >= 70 ? "Excellent travail ! Continuez ainsi." : winlyScore >= 40 ? "Des améliorations sont possibles." : "C'est parti !"}
                </p>
              ) : (
                <div>
                  <p className="text-sm font-medium text-foreground">Pas encore de score</p>
                  <p className="mt-1 text-sm text-text-secondary">Lancez votre premier audit pour obtenir votre Winly Score.</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Creator Score */}
        <Card>
          <h2 className="text-sm font-medium text-text-secondary">Creator Score</h2>
          <div className="mt-4">
            {creatorScore !== null ? (
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold ${getScoreColor(creatorScore)}`}>{creatorScore}</span>
                <span className="text-lg text-text-muted">/ 100</span>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-foreground">Pas encore de score</p>
                <p className="mt-1 text-sm text-text-secondary">Calculez votre Creator Score pour suivre vos performances.</p>
              </div>
            )}
            <a href="/creator-score" className="mt-3 inline-block text-sm font-medium text-accent hover:text-accent-hover transition-colors">
              {creatorScore !== null ? "Voir les détails" : "Obtenir mon score"} &rarr;
            </a>
          </div>
        </Card>

        {/* Priorities */}
        <Card>
          <h2 className="text-sm font-medium text-text-secondary">Priorités</h2>
          <ul className="mt-4 space-y-3">
            {priorities.map((p, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${p.done ? "bg-success/15 text-success" : "bg-surface-3 text-text-muted"}`}>
                  {p.done ? (
                    <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  ) : (
                    <span className="text-xs font-medium">{i + 1}</span>
                  )}
                </div>
                <span className={`text-sm ${p.done ? "text-text-muted line-through" : "text-foreground"}`}>{p.label}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Next Content */}
        <Card>
          <h2 className="text-sm font-medium text-text-secondary">Prochain contenu</h2>
          <div className="mt-4">
            <p className="text-sm font-medium text-foreground">{nextContent.suggestion}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-accent-muted px-2.5 py-0.5 text-xs font-medium text-accent">{nextContent.platform}</span>
              <span className="inline-flex items-center rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-text-secondary">{nextContent.frequency}</span>
            </div>
          </div>
        </Card>

        {/* Progression */}
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-text-secondary">Progression</h2>
            <span className="text-sm font-medium text-foreground">{progression.completed}/{progression.total}</span>
          </div>
          <div className="mt-4 h-2 w-full rounded-full bg-surface-3">
            <div className="h-2 rounded-full bg-gradient-to-r from-primary via-violet to-cyan transition-all" style={{ width: `${progression.percent}%` }} />
          </div>
          <ul className="mt-4 space-y-2">
            {progression.steps.map((s, i) => (
              <li key={i} className="flex items-center gap-2">
                {s.done ? (
                  <svg className="h-4 w-4 text-success" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-border" />
                )}
                <span className={`text-sm ${s.done ? "text-text-muted line-through" : "text-foreground"}`}>{s.label}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Social Radar Preview */}
        <RadarSummaryPanel report={mockSocialRadarReport} />

        {/* Top Opportunities */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-text-secondary">Meilleures opportunités</h2>
            <Link href="/dashboard/opportunities" className="text-xs font-medium text-accent hover:text-accent-hover transition-colors">
              Voir tout &rarr;
            </Link>
          </div>
          <div className="space-y-3">
            {topOpportunities.map((o) => (
              <div key={o.id} className="flex items-center gap-3 rounded-lg bg-surface-2 p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{o.title}</p>
                  <p className="text-xs text-text-secondary mt-0.5 truncate">{o.action}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-foreground">{o.score}</span>
                  <Badge variant={urgencyVariant[o.urgency]}>{o.urgency}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
