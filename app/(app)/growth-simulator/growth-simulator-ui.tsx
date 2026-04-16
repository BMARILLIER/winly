"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label, Input } from "@/components/ui/input";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SimulatorScoreCard } from "@/components/ui/simulator-score-card";
import { ScenarioComparisonCard } from "@/components/ui/scenario-comparison-card";
import {
  simulateGrowth,
  compareScenario,
  type SimulatorInput,
  type SimulatorResult,
  type ScenarioComparison,
} from "@/modules/growth-simulator";
import { growthBenchmarks } from "@/lib/mock/market-intelligence";
import { nicheLabel, formatLabel, type Niche, type ContentFormat, type Platform } from "@/types";
import { PLATFORMS } from "@/lib/workspace-constants";

const niches: Niche[] = ["entrepreneurship", "fitness", "tech", "lifestyle", "finance", "marketing", "wellness", "travel"];
const formats: ContentFormat[] = ["carousel", "reel", "static_image", "story", "video", "thread", "live"];
const platforms: Platform[] = ["instagram", "tiktok", "twitter", "linkedin", "youtube"];

const verdictConfig = {
  above: { color: "text-success", label: "Above avg" },
  below: { color: "text-danger", label: "Below avg" },
  at: { color: "text-warning", label: "At avg" },
};

const impactVariant = { high: "danger", medium: "warning", low: "info" } as const;

interface Props {
  initialFollowers?: number;
  initialEngagement?: number;
  initialNiche?: string;
  initialPlatform?: string;
}

export function GrowthSimulatorUI({
  initialFollowers,
  initialEngagement,
  initialNiche,
  initialPlatform,
}: Props = {}) {
  // Form state — pre-filled with real IG data if available
  const [followers, setFollowers] = useState(String(initialFollowers ?? 12000));
  const [postsPerWeek, setPostsPerWeek] = useState("3");
  const [niche, setNiche] = useState<Niche>((initialNiche as Niche) ?? "entrepreneurship");
  const [format, setFormat] = useState<ContentFormat>("carousel");
  const [platform, setPlatform] = useState<Platform>((initialPlatform as Platform) ?? "instagram");
  const [engagementRate, setEngagementRate] = useState(String(initialEngagement ?? 4.2));

  // Result
  const [result, setResult] = useState<SimulatorResult | null>(null);
  const [scenarios, setScenarios] = useState<ScenarioComparison[]>([]);
  const [currentInput, setCurrentInput] = useState<SimulatorInput | null>(null);

  function handleSimulate() {
    const input: SimulatorInput = {
      followerCount: parseInt(followers) || 0,
      postsPerWeek: parseFloat(postsPerWeek) || 0,
      niche,
      mainFormat: format,
      platform,
      engagementRate: (parseFloat(engagementRate) || 0) / 100,
    };

    const benchmark = growthBenchmarks.find(
      (b) => b.niche === niche && b.platform === platform
    );

    const res = simulateGrowth(input, benchmark);
    setResult(res);
    setCurrentInput(input);

    // Auto-generate "what if" scenarios
    const newScenarios: ScenarioComparison[] = [];

    // Scenario 1: Double posting frequency
    if (input.postsPerWeek < 6) {
      newScenarios.push(
        compareScenario(
          input,
          { ...input, postsPerWeek: Math.min(7, input.postsPerWeek * 2) },
          `What if I post ${Math.min(7, Math.round(input.postsPerWeek * 2))}x/week instead of ${input.postsPerWeek}x?`
        )
      );
    }

    // Scenario 2: Switch to best format for platform
    const bestFormats: Record<Platform, ContentFormat> = {
      instagram: "reel", tiktok: "reel", twitter: "thread",
      linkedin: "carousel", youtube: "video",
    };
    const bestFmt = bestFormats[input.platform];
    if (bestFmt && bestFmt !== input.mainFormat) {
      newScenarios.push(
        compareScenario(
          input,
          { ...input, mainFormat: bestFmt },
          `What if I switch from ${formatLabel(input.mainFormat)} to ${formatLabel(bestFmt)}?`
        )
      );
    }

    // Scenario 3: Higher engagement
    if (input.engagementRate < 0.06) {
      const boosted = Math.min(0.08, input.engagementRate * 1.5);
      newScenarios.push(
        compareScenario(
          input,
          { ...input, engagementRate: boosted },
          `What if my engagement rate reaches ${(boosted * 100).toFixed(1)}%?`
        )
      );
    }

    setScenarios(newScenarios);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      {/* Form */}
      <Card className="h-fit lg:sticky lg:top-6">
        <h3 className="text-lg font-semibold text-foreground mb-5">Your Profile</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="followers">Follower Count</Label>
            <Input
              id="followers"
              type="number"
              value={followers}
              onChange={(e) => setFollowers(e.target.value)}
              placeholder="e.g. 12000"
            />
          </div>

          <div>
            <Label htmlFor="postsPerWeek">Posts Per Week</Label>
            <Input
              id="postsPerWeek"
              type="number"
              step="0.5"
              value={postsPerWeek}
              onChange={(e) => setPostsPerWeek(e.target.value)}
              placeholder="e.g. 3"
            />
          </div>

          <div>
            <Label htmlFor="engagementRate">Avg Engagement Rate (%)</Label>
            <Input
              id="engagementRate"
              type="number"
              step="0.1"
              value={engagementRate}
              onChange={(e) => setEngagementRate(e.target.value)}
              placeholder="e.g. 4.2"
            />
          </div>

          <div>
            <Label>Niche</Label>
            <select
              value={niche}
              onChange={(e) => setNiche(e.target.value as Niche)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
            >
              {niches.map((n) => (
                <option key={n} value={n}>{nicheLabel(n)}</option>
              ))}
            </select>
          </div>

          <div>
            <Label>Platform</Label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
            >
              {platforms.map((p) => (
                <option key={p} value={p}>
                  {PLATFORMS.find((pl) => pl.id === p)?.label ?? p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Main Format</Label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as ContentFormat)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
            >
              {formats.map((f) => (
                <option key={f} value={f}>{formatLabel(f)}</option>
              ))}
            </select>
          </div>

          <Button onClick={handleSimulate} size="lg" className="w-full mt-2">
            Simulate Growth
          </Button>
        </div>
      </Card>

      {/* Results */}
      <div>
        {!result ? (
          <Card className="flex flex-col items-center justify-center py-16">
            <p className="text-4xl mb-4">🧪</p>
            <p className="text-lg font-semibold text-foreground">Enter your profile data</p>
            <p className="text-sm text-text-secondary mt-1">
              Adjust the inputs and hit &ldquo;Simulate Growth&rdquo; to see your scores.
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Score Results */}
            <Card>
              <h3 className="text-lg font-semibold text-foreground mb-5">Simulation Results</h3>
              <SimulatorScoreCard scores={result.scores} grade={result.grade} />
            </Card>

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <Card>
                <h3 className="text-lg font-semibold text-foreground mb-4">Key Recommendations</h3>
                <div className="space-y-3">
                  {result.recommendations.map((r) => (
                    <div key={r.id} className="flex items-start gap-3 rounded-lg bg-surface-2 p-3">
                      <Badge variant={impactVariant[r.impact]}>{r.impact}</Badge>
                      <p className="text-sm text-foreground">{r.title}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Benchmark Summary */}
            <Card>
              <h3 className="text-lg font-semibold text-foreground mb-4">Benchmark Summary</h3>
              <div className="space-y-3">
                {result.benchmarkSummary.map((b) => {
                  const v = verdictConfig[b.verdict];
                  return (
                    <div key={b.metric} className="flex items-center justify-between rounded-lg bg-surface-2 p-3">
                      <span className="text-sm text-foreground">{b.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-foreground">{b.userValue}</span>
                        <span className="text-xs text-text-muted">vs {b.benchmarkValue}</span>
                        <span className={`text-xs font-medium ${v.color}`}>{v.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* What If Scenarios */}
            {scenarios.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">What If Scenarios</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {scenarios.map((s, i) => (
                    <ScenarioComparisonCard key={i} comparison={s} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
