"use client";

import { useMemo } from "react";
import { SectionHeader } from "@/components/ui";
import { GrowthReportCard } from "@/components/ui/growth-report-card";
import { computeGrowthReport } from "@/modules/report";
import { mockGrowthReport } from "@/lib/mock/growth-engine";
import { mockOpportunities } from "@/lib/mock/opportunity-detector";
import { nichePostingWindows } from "@/lib/mock/market-intelligence";

interface Props {
  username: string;
  platform: string;
  niche: string;
}

export function ReportUI({ username, platform, niche }: Props) {
  const reportData = useMemo(() => {
    const postingWindows = nichePostingWindows.find(
      (w) => w.niche === niche.toLowerCase()
    ) ?? nichePostingWindows[0];

    return computeGrowthReport({
      username: `@${username.toLowerCase().replace(/\s+/g, ".")}`,
      platform,
      niche,
      growthReport: mockGrowthReport,
      opportunities: mockOpportunities,
      postingWindows,
      viralProbability: 62,
    });
  }, [username, platform, niche]);

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Creator Growth Report"
        description="Générez et partagez un résumé visuel de vos insights de croissance"
      />
      <GrowthReportCard data={reportData} />
    </div>
  );
}
