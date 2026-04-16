import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getActiveConnection } from "@/lib/services/instagram-connection";
import { PLATFORMS } from "@/lib/workspace-constants";
import { queryBestContent } from "@/lib/queries/best-content";
import { getInstagramMetrics } from "@/lib/services/instagram-metrics";
import { computeRevenue, estimateRevenue } from "@/modules/revenue";
import {
  generateRecommendations,
  getDefaultRecommendations,
} from "@/modules/recommendations";
import { detectAlerts, getDefaultAlerts } from "@/modules/alerts";
import { getDefaultCreatorProfile, type CreatorProfile } from "@/modules/deal-analyzer";
import { CommandCenterUI } from "./command-center-ui";
import { FirstWinCard } from "@/components/onboarding/FirstWinCard";
import { DemoBanner } from "@/components/ui/demo-banner";
import { StreakCard } from "@/components/ui/streak-card";
import { AchievementsCard } from "@/components/ui/achievements-card";
import { getProgressStats } from "@/lib/queries/progress-stats";
import { getAchievements } from "@/lib/queries/achievements";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  const platformLabel = PLATFORMS.find((p) => p.id === workspace.mainPlatform)?.label ?? workspace.mainPlatform;

  // Fetch best content server-side for the daily growth plan
  const bestContent = await queryBestContent(workspace.id, user.id);

  // Check Instagram connection status
  const igConnection = await getActiveConnection(user.id);

  // Count content ideas
  const contentCount = await prisma.contentIdea.count({
    where: { workspaceId: workspace.id, status: { in: ["published", "ready"] } },
  });

  // Fetch Instagram metrics for the three new engines
  const [igMetrics, progressStats, achievements] = await Promise.all([
    getInstagramMetrics(user.id),
    getProgressStats(user.id),
    getAchievements(user.id),
  ]);

  // --- Revenue Engine ---
  const revenueReport = igMetrics
    ? computeRevenue({
        followers: igMetrics.followers,
        engagementRate: igMetrics.engagementRate,
        avgLikes: igMetrics.avgLikes,
        avgComments: igMetrics.avgComments,
        mediaCount: igMetrics.mediaCount,
        niche: workspace.niche,
        monthlyGrowth: igMetrics.monthlyGrowth,
      })
    : estimateRevenue(workspace.niche);

  // --- Recommendations Engine ---
  const recommendations = igMetrics
    ? generateRecommendations({
        followers: igMetrics.followers,
        engagementRate: igMetrics.engagementRate,
        postsLast30d: igMetrics.recentMedia.length,
        avgLikes: igMetrics.avgLikes,
        avgComments: igMetrics.avgComments,
        topFormat: igMetrics.mediaByType[0]?.type ?? null,
        monthlyGrowth: igMetrics.monthlyGrowth,
        weeklyGrowth: igMetrics.weeklyGrowth,
        mediaByType: igMetrics.mediaByType,
        hasInstagram: true,
      })
    : getDefaultRecommendations();

  // --- Alerts Engine ---
  const alerts = igMetrics
    ? detectAlerts({
        followers: igMetrics.followers,
        engagementRate: igMetrics.engagementRate,
        previousEngagementRate: null, // TODO: compare with previous period
        weeklyGrowth: igMetrics.weeklyGrowth,
        monthlyGrowth: igMetrics.monthlyGrowth,
        postsLast30d: igMetrics.recentMedia.length,
        avgLikes: igMetrics.avgLikes,
        avgComments: igMetrics.avgComments,
        accountReach: igMetrics.accountReach,
        hasInstagram: true,
      })
    : getDefaultAlerts();

  // --- Creator profile for Deal Analyzer ---
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
        <DemoBanner feature="Le dashboard (chiffres d'exemple basés sur ta niche tant qu'Instagram n'est pas connecté)" />
      )}
      <FirstWinCard userId={user.id} workspaceId={workspace.id} />
      {progressStats && (
        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          <StreakCard
            streakDays={progressStats.streakDays}
            completedToday={progressStats.completedToday}
            level={progressStats.level}
            totalXp={progressStats.totalXp}
            progressPct={progressStats.progressPct}
            xpInLevel={progressStats.xpInLevel}
            xpToNextLevel={progressStats.xpToNextLevel}
          />
          <AchievementsCard achievements={achievements} />
        </div>
      )}
      <CommandCenterUI
        workspaceId={workspace.id}
        workspaceName={workspace.name}
        platform={platformLabel}
        niche={workspace.niche}
        bestContent={bestContent}
        igUsername={igConnection?.igUsername ?? null}
        igLastSync={igConnection?.lastSyncAt?.toISOString() ?? null}
        contentCount={contentCount}
        revenueReport={revenueReport}
        recommendations={recommendations}
        alerts={alerts}
        hasInstagram={!!igMetrics}
        creatorProfile={creatorProfile}
      />
    </>
  );
}
