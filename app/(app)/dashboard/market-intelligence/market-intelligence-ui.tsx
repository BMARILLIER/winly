"use client";

import { useState, useMemo } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BenchmarkCard } from "@/components/ui/benchmark-card";
import { NicheComparisonTable } from "@/components/ui/niche-comparison-table";
import { FormatPerformancePanel } from "@/components/ui/format-performance-panel";
import { AudiencePatternChart } from "@/components/ui/audience-pattern-chart";
import { MarketInsightCard } from "@/components/ui/market-insight-card";
import {
  nicheFormatRankings,
  contentPatterns,
  audienceBehaviors,
  nichePostingWindows,
  winningStrategies,
  marketInsights,
  mockMarketReport,
  mockUserMetrics,
} from "@/lib/mock/market-intelligence";
import { nicheLabel, tierLabel, type Niche, type AudienceTier } from "@/types";

const niches: Niche[] = ["entrepreneurship", "fitness", "tech", "lifestyle", "finance", "marketing", "wellness", "travel"];
const tiers: { id: AudienceTier | "all"; label: string }[] = [
  { id: "all", label: "Toutes tailles" },
  { id: "nano", label: "<5K" },
  { id: "micro", label: "5K-25K" },
  { id: "mid", label: "25K-100K" },
  { id: "macro", label: "100K-500K" },
  { id: "mega", label: "500K+" },
];

export function MarketIntelligenceUI() {
  const [selectedNiche, setSelectedNiche] = useState<Niche>(mockUserMetrics.niche);
  const [selectedTier, setSelectedTier] = useState<AudienceTier | "all">("all");

  const report = mockMarketReport;

  const filteredPatterns = useMemo(() => {
    return contentPatterns.filter((p) => {
      if (p.niche !== selectedNiche) return false;
      if (selectedTier !== "all" && p.audienceTier !== selectedTier) return false;
      return true;
    });
  }, [selectedNiche, selectedTier]);

  const filteredBehaviors = useMemo(() => {
    return audienceBehaviors.filter((b) => {
      if (b.niche !== selectedNiche) return false;
      if (selectedTier !== "all" && b.audienceTier !== selectedTier) return false;
      return true;
    });
  }, [selectedNiche, selectedTier]);

  const filteredInsights = useMemo(() => {
    return marketInsights.filter((i) => i.niche === selectedNiche);
  }, [selectedNiche]);

  const selectedRanking = nicheFormatRankings.find((r) => r.niche === selectedNiche);
  const selectedWindows = nichePostingWindows.find((w) => w.niche === selectedNiche);

  const filteredStrategies = useMemo(() => {
    return winningStrategies.filter((s) => {
      if (s.niche !== selectedNiche) return false;
      if (selectedTier !== "all" && !s.appliesTo.includes(selectedTier)) return false;
      return true;
    });
  }, [selectedNiche, selectedTier]);

  return (
    <div>
      <SectionHeader
        title="Market Intelligence"
        description="Données agrégées du marché pour comparer votre stratégie aux meilleurs performeurs."
      />

      {/* Filters */}
      <div className="mb-8 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {niches.map((n) => (
            <button
              key={n}
              onClick={() => setSelectedNiche(n)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer ${
                selectedNiche === n
                  ? "bg-accent text-white"
                  : "bg-surface-2 text-text-secondary hover:text-foreground hover:bg-surface-3"
              }`}
            >
              {nicheLabel(n)}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value as AudienceTier | "all")}
            className="rounded-lg bg-surface-2 border border-border px-3 py-1.5 text-xs text-text-secondary focus:outline-none focus:border-accent"
          >
            {tiers.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Benchmark Comparisons */}
      <h3 className="text-lg font-semibold text-foreground mb-4">Vos performances vs le marché</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {report.comparisons.map((c) => (
          <BenchmarkCard key={c.metric} comparison={c} />
        ))}
      </div>

      {/* Format Match */}
      <Card className="mb-8">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${report.formatMatch.isAligned ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
            {report.formatMatch.isAligned ? (
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none"><path d="M8 4v5M8 11v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Stratégie de format</h4>
            <p className="text-sm text-text-secondary mt-1">{report.formatMatch.suggestion}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Format Performance */}
        {selectedRanking && (
          <Card>
            <h3 className="text-sm font-medium text-text-secondary mb-4">
              Meilleurs formats — {nicheLabel(selectedNiche)}
            </h3>
            <FormatPerformancePanel ranking={selectedRanking} userTopFormat={mockUserMetrics.topFormat} />
          </Card>
        )}

        {/* Posting Windows */}
        {selectedWindows && (
          <Card>
            <h3 className="text-sm font-medium text-text-secondary mb-4">
              Meilleurs créneaux de publication — {nicheLabel(selectedNiche)}
            </h3>
            <AudiencePatternChart postingWindows={selectedWindows} />
          </Card>
        )}
      </div>

      {/* Format Comparison Table */}
      {selectedRanking && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Comparaison des formats</h3>
          <Card>
            <NicheComparisonTable rankings={nicheFormatRankings} selectedNiche={selectedNiche} />
          </Card>
        </div>
      )}

      {/* Content Patterns */}
      {filteredPatterns.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Tendances de contenu</h3>
          <div className="space-y-3">
            {filteredPatterns.map((p) => (
              <Card key={p.id}>
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={p.impactLevel === "high" ? "danger" : p.impactLevel === "medium" ? "warning" : "info"}>
                        impact {p.impactLevel}
                      </Badge>
                      <Badge variant="default">{tierLabel(p.audienceTier)}</Badge>
                      <span className="text-xs text-text-muted">{p.confidence}% confiance</span>
                    </div>
                    <p className="text-sm text-foreground">{p.pattern}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Audience Behavior */}
      {filteredBehaviors.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Comportement de l'audience</h3>
          <div className="space-y-3">
            {filteredBehaviors.map((b) => (
              <Card key={b.id}>
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${b.direction === "above" ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}>
                    <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                      <path d={b.direction === "above" ? "M6 3v6M3 6l3-3 3 3" : "M6 9V3M3 6l3 3 3-3"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-foreground">{b.insight}</p>
                    <p className="text-xs text-text-muted mt-1">Comptes {tierLabel(b.audienceTier)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Winning Strategies */}
      {filteredStrategies.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Stratégies gagnantes</h3>
          <div className="space-y-3">
            {filteredStrategies.map((s) => (
              <Card key={s.id}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={s.evidenceStrength === "strong" ? "success" : s.evidenceStrength === "moderate" ? "warning" : "info"}>
                    {s.evidenceStrength}
                  </Badge>
                  {s.recommendedFormats.map((f) => (
                    <Badge key={f} variant="default">{f}</Badge>
                  ))}
                </div>
                <h4 className="text-sm font-semibold text-foreground mb-1">{s.title}</h4>
                <p className="text-sm text-text-secondary">{s.description}</p>
                <p className="text-xs text-accent mt-2">Impact attendu : {s.expectedImpact}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Market Insights */}
      {filteredInsights.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Insights clés du marché</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredInsights.map((i) => (
              <MarketInsightCard key={i.id} insight={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
