"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession, getCurrentUser } from "@/lib/auth";
import {
  computeCreatorScore,
  type CreatorScoreInput,
} from "@/modules/creator-score";
import { revalidatePath } from "next/cache";
import { getInstagramMetrics } from "@/lib/services/instagram-metrics";

export type CreatorScoreState = { error?: string } | null;

export async function calculateCreatorScore(
  _prev: CreatorScoreState,
  formData: FormData
): Promise<CreatorScoreState> {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) return { error: "No workspace found. Complete onboarding first." };

  const platform = workspace.mainPlatform;
  const profile = workspace.socialProfiles[0];
  const username = profile?.username ?? user.email;

  // Gather workspace data + Instagram metrics in parallel
  const [contentIdeas, savedHooks, latestAudit, latestScore, missions, igMetrics] =
    await Promise.all([
      prisma.contentIdea.findMany({
        where: { workspaceId: workspace.id },
        select: { status: true, scheduledDate: true },
      }),
      prisma.savedHook.count({ where: { workspaceId: workspace.id } }),
      prisma.auditResult.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { score: true },
      }),
      prisma.scoreResult.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { score: true },
      }),
      prisma.missionCompletion.aggregate({
        where: { workspaceId: workspace.id },
        _count: { id: true },
        _sum: { xp: true },
      }),
      getInstagramMetrics(userId),
    ]);

  const input: CreatorScoreInput = {
    totalContent: contentIdeas.length,
    publishedContent: contentIdeas.filter((c) => c.status === "published")
      .length,
    draftContent: contentIdeas.filter((c) => c.status === "draft").length,
    readyContent: contentIdeas.filter((c) => c.status === "ready").length,
    scheduledContent: contentIdeas.filter((c) => c.scheduledDate).length,
    postFrequency: workspace.postFrequency,
    socialProfileCount: workspace.socialProfiles.length,
    savedHooks,
    latestAuditScore: latestAudit?.score ?? null,
    latestWinlyScore: latestScore?.score ?? null,
    completedMissions: missions._count.id,
    totalXp: missions._sum.xp ?? 0,
    // Instagram enrichment (optional)
    igConnected: igMetrics !== null,
    igFollowers: igMetrics?.followers,
    igEngagementRate: igMetrics?.engagementRate,
    igMediaCount: igMetrics?.mediaCount,
    igTotalSaved: igMetrics?.totalSaved,
  };

  const report = computeCreatorScore(input);

  await prisma.creatorScore.create({
    data: {
      userId,
      workspaceId: workspace.id,
      score: report.score,
      details: JSON.stringify(report),
      platform,
      username,
    },
  });

  revalidatePath("/creator-score");
  revalidatePath("/dashboard");
  redirect("/creator-score");
}
