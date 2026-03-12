"use client";

import { SectionHeader, StatCard, Card, CardHeader, CardTitle, Badge } from "@/components/ui";
import { ChartContainer, ChartTooltip, chartTheme } from "@/components/shared/chart-wrapper";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUp, CalendarDays, BarChart3, Target, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";
import {
  demographics,
  activityHeatmap,
  dayLabels,
  weakSignals,
} from "@/lib/mock/growth";
import type { GrowthEngineReport } from "@/modules/growth-engine";

// ─── Types ───

export interface GrowthData {
  source: "instagram" | "demo";
  igUsername?: string;
  lastSyncAt?: string | null;
  followerGrowth: { date: string; followers: number }[];
  growthRates: {
    daily: { value: string; trend: number };
    weekly: { value: string; trend: number };
    monthly: { value: string; trend: number };
    projected: { value: string; trend: number };
  };
  growthReport: GrowthEngineReport;
}

// ─── Component ───

export function GrowthUI({ data }: { data: GrowthData }) {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Growth"
        description="Suivez la croissance de vos abonnés et la démographie de votre audience"
      />

      {/* Data source indicator */}
      {data.source === "instagram" ? (
        <div className="flex items-center gap-2 rounded-lg bg-purple-500/10 px-3 py-1.5 w-fit">
          <span className="h-2 w-2 rounded-full bg-purple-500" />
          <span className="text-xs font-medium text-purple-400">
            Données Instagram • @{data.igUsername}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-1.5 w-fit">
          <span className="h-2 w-2 rounded-full bg-text-muted" />
          <span className="text-xs font-medium text-text-muted">
            Données de démonstration
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Croissance quotidienne" value={data.growthRates.daily.value} trend={{ value: data.growthRates.daily.trend }} icon={TrendingUp} />
        <StatCard label="Croissance hebdomadaire" value={data.growthRates.weekly.value} trend={{ value: data.growthRates.weekly.trend }} icon={CalendarDays} />
        <StatCard label="Croissance mensuelle" value={data.growthRates.monthly.value} trend={{ value: data.growthRates.monthly.trend }} icon={BarChart3} />
        <StatCard label="Projection (3 mois)" value={data.growthRates.projected.value} trend={{ value: data.growthRates.projected.trend }} icon={Target} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Croissance des abonnés ({data.followerGrowth.length} jours)</CardTitle>
        </CardHeader>
        <ChartContainer height={340}>
          <AreaChart data={data.followerGrowth}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
            <XAxis dataKey="date" stroke={chartTheme.axisColor} fontSize={12} tickLine={false} interval={Math.max(1, Math.floor(data.followerGrowth.length / 6))} />
            <YAxis stroke={chartTheme.axisColor} fontSize={12} tickLine={false} />
            <ChartTooltip />
            <Area type="monotone" dataKey="followers" stroke={chartTheme.palette[0]} fill={chartTheme.palette[0]} fillOpacity={0.15} strokeWidth={2} />
          </AreaChart>
        </ChartContainer>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Démographie par âge</CardTitle>
          </CardHeader>
          <ChartContainer height={260}>
            <BarChart data={demographics}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
              <XAxis dataKey="age" stroke={chartTheme.axisColor} fontSize={12} tickLine={false} />
              <YAxis stroke={chartTheme.axisColor} fontSize={12} tickLine={false} />
              <ChartTooltip />
              <Bar dataKey="percentage" fill={chartTheme.palette[1]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Carte d'activité</CardTitle>
          </CardHeader>
          <div className="space-y-1">
            {dayLabels.map((day, d) => (
              <div key={day} className="flex items-center gap-1">
                <span className="w-8 text-xs text-text-muted">{day}</span>
                <div className="flex gap-0.5 flex-1">
                  {activityHeatmap
                    .filter((c) => c.day === d)
                    .map((c) => (
                      <div
                        key={c.hour}
                        className="h-4 flex-1 rounded-sm"
                        style={{
                          backgroundColor: `rgba(99, 102, 241, ${c.value})`,
                        }}
                        title={`${day} ${c.hour}:00 — ${Math.round(c.value * 100)}%`}
                      />
                    ))}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-1 mt-2">
              <span className="w-8" />
              <span className="text-[10px] text-text-muted">0h</span>
              <span className="flex-1" />
              <span className="text-[10px] text-text-muted">12h</span>
              <span className="flex-1" />
              <span className="text-[10px] text-text-muted">23h</span>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Signaux faibles et résumé stratégique</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {weakSignals.map((s, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg bg-surface-2 p-3">
              <Badge variant={s.impact === "high" ? "danger" : s.impact === "medium" ? "warning" : "info"}>
                {s.impact}
              </Badge>
              <p className="text-sm text-text-secondary">{s.signal}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Growth Diagnosis Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Diagnostic de croissance</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">{data.growthReport.score}</span>
              <span className="text-sm text-text-muted">/ 100</span>
              <Badge variant={data.growthReport.score >= 70 ? "success" : data.growthReport.score >= 40 ? "warning" : "danger"}>
                {data.growthReport.grade}
              </Badge>
            </div>
          </div>
        </CardHeader>

        {/* Factors */}
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-accent" />
            Points forts et freins
          </h4>
          {data.growthReport.factors
            .sort((a, b) => b.score - a.score)
            .map((factor) => {
              const isStrong = factor.score >= 60;
              return (
                <div key={factor.id} className="rounded-lg bg-surface-2 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {isStrong ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-warning" />
                      )}
                      <span className="text-sm font-medium text-foreground">{factor.label}</span>
                    </div>
                    <span className={`text-sm font-bold ${factor.score >= 70 ? "text-success" : factor.score >= 40 ? "text-warning" : "text-danger"}`}>
                      {factor.score}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-3 mb-2 ml-6">
                    <div
                      className={`h-1.5 rounded-full ${factor.score >= 70 ? "bg-success" : factor.score >= 40 ? "bg-warning" : "bg-danger"}`}
                      style={{ width: `${factor.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-text-secondary ml-6">{factor.feedback}</p>
                </div>
              );
            })}
        </div>

        {/* Recommendations */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-accent" />
            Actions recommandées
          </h4>
          {data.growthReport.recommendations.map((rec) => (
            <div key={rec.id} className="rounded-lg border border-border bg-surface-1 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">{rec.title}</span>
                <Badge variant={rec.impact === "high" ? "danger" : rec.impact === "medium" ? "warning" : "info"}>
                  {rec.impact === "high" ? "Impact fort" : rec.impact === "medium" ? "Impact moyen" : "Impact faible"}
                </Badge>
              </div>
              <p className="text-xs text-text-secondary mb-2">{rec.why}</p>
              <div className="rounded-lg bg-accent-muted px-3 py-2">
                <p className="text-xs text-accent font-medium">Action : {rec.trigger}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
