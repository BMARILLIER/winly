"use client";

import { SectionHeader } from "@/components/ui/section-header";
import { OpportunityFeed } from "@/components/ui/opportunity-feed";
import { mockOpportunities } from "@/lib/mock/opportunity-detector";

export function OpportunitiesUI() {
  return (
    <div>
      <SectionHeader
        title="Opportunity Detector"
        description="Des signaux sur lesquels agir avant tout le monde."
      />
      <OpportunityFeed opportunities={mockOpportunities} />
    </div>
  );
}
