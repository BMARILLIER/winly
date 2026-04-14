import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getInstagramMetrics } from "@/lib/services/instagram-metrics";
import { getDefaultCreatorProfile, type CreatorProfile } from "@/modules/deal-analyzer";
import { DealAnalyzerPageUI } from "./deal-analyzer-page-ui";
import { DemoBanner } from "@/components/ui/demo-banner";

export default async function DealAnalyzerPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  const igMetrics = await getInstagramMetrics(user.id);

  const creatorProfile: CreatorProfile = igMetrics
    ? {
        followers: igMetrics.followers,
        engagementRate: igMetrics.engagementRate,
        niche: workspace.niche,
      }
    : getDefaultCreatorProfile(workspace.niche);

  return (
    <>
      {!igMetrics && (
        <DemoBanner feature="Le Deal Analyzer (sans Instagram connecté)" />
      )}
      <DealAnalyzerPageUI
        creatorProfile={creatorProfile}
        hasInstagram={!!igMetrics}
        followers={igMetrics?.followers ?? null}
        engagementRate={igMetrics?.engagementRate ?? null}
        niche={workspace.niche}
      />
    </>
  );
}
