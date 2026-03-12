"use client";

import { GrowthScoreCard } from "@/components/ui/growth-score-card";
import { RecommendationList } from "@/components/ui/recommendation-list";
import { SectionHeader } from "@/components/ui/section-header";
import { Card } from "@/components/ui/card";
import { mockGrowthReport } from "@/lib/mock/growth-engine";

export function DashboardInsightsUI() {
  const report = mockGrowthReport;

  return (
    <div>
      <SectionHeader
        title="Growth Insights"
        description="Recommandations personnalisées pour accélérer votre croissance."
      />

      {/* Score summary */}
      <Card className="mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <GrowthScoreCard score={report.score} grade={report.grade} label={report.label} />
          <div>
            <p className="text-sm text-text-secondary">
              Votre score de croissance est de <span className="font-semibold text-foreground">{report.score}/100</span> ({report.grade}).
              {report.recommendations.length > 0 && (
                <> Nous avons identifié <span className="font-semibold text-foreground">{report.recommendations.length} recommandations</span> pour améliorer vos points faibles.</>
              )}
            </p>
          </div>
        </div>
      </Card>

      {/* Recommendations */}
      <h3 className="text-lg font-semibold text-foreground mb-4">Recommandations</h3>
      <RecommendationList recommendations={report.recommendations} />
    </div>
  );
}
