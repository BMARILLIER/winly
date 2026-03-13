import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  computeCreatorScore,
  type CreatorScoreInput,
} from "@/modules/creator-score";

export async function POST(request: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { username, platform } = body as {
    username?: string;
    platform?: string;
  };

  if (!username || !platform) {
    return NextResponse.json(
      { error: "username and platform are required" },
      { status: 400 }
    );
  }

  // Find workspace matching this username + platform
  const profile = await prisma.socialProfile.findFirst({
    where: { username, platform },
    include: {
      workspace: {
        include: {
          user: { select: { id: true } },
          contentIdeas: { select: { status: true, scheduledDate: true } },
          savedHooks: { select: { id: true } },
          socialProfiles: { select: { id: true } },
        },
      },
    },
  });

  if (!profile) {
    return NextResponse.json(
      { error: "No workspace found for this username and platform" },
      { status: 404 }
    );
  }

  const ws = profile.workspace;
  const ownerId = ws.user.id;

  // Gather all input data
  const [latestAudit, latestScore, missions] = await Promise.all([
    prisma.auditResult.findFirst({
      where: { userId: ownerId },
      orderBy: { createdAt: "desc" },
      select: { score: true },
    }),
    prisma.scoreResult.findFirst({
      where: { userId: ownerId },
      orderBy: { createdAt: "desc" },
      select: { score: true },
    }),
    prisma.missionCompletion.aggregate({
      where: { workspaceId: ws.id },
      _count: { id: true },
      _sum: { xp: true },
    }),
  ]);

  const input: CreatorScoreInput = {
    totalContent: ws.contentIdeas.length,
    publishedContent: ws.contentIdeas.filter((c) => c.status === "published")
      .length,
    draftContent: ws.contentIdeas.filter((c) => c.status === "draft").length,
    readyContent: ws.contentIdeas.filter((c) => c.status === "ready").length,
    scheduledContent: ws.contentIdeas.filter((c) => c.scheduledDate).length,
    postFrequency: ws.postFrequency,
    socialProfileCount: ws.socialProfiles.length,
    savedHooks: ws.savedHooks.length,
    latestAuditScore: latestAudit?.score ?? null,
    latestWinlyScore: latestScore?.score ?? null,
    completedMissions: missions._count.id,
    totalXp: missions._sum.xp ?? 0,
  };

  const report = computeCreatorScore(input);

  // Store result
  await prisma.creatorScore.create({
    data: {
      userId: ownerId,
      workspaceId: ws.id,
      score: report.score,
      details: JSON.stringify(report),
      platform,
      username,
    },
  });

  return NextResponse.json({
    score: report.score,
    engagementScore: report.engagementScore,
    growthScore: report.growthScore,
    consistencyScore: report.consistencyScore,
    performanceScore: report.performanceScore,
  });
}
