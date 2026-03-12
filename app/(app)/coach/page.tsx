import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { analyzeStrategy, getRecommendations } from "@/modules/coach";
import { CoachUI } from "./coach-ui";

export default async function CoachPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  // Gather context
  const [contentCount, scheduledCount, latestScore] = await Promise.all([
    prisma.contentIdea.count({ where: { workspaceId: workspace.id } }),
    prisma.contentIdea.count({
      where: { workspaceId: workspace.id, scheduledDate: { not: null } },
    }),
    prisma.scoreResult.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const hasAudit = await prisma.auditResult
    .findFirst({ where: { userId: user.id } })
    .then((r) => !!r);

  const scoreDetails = latestScore
    ? JSON.parse(latestScore.details)
    : null;
  const scorePillars = scoreDetails
    ? (Array.isArray(scoreDetails) ? scoreDetails : scoreDetails.pillars ?? null)
    : null;

  const goals: string[] = JSON.parse(workspace.goals || "[]");

  const ctx = {
    profileType: workspace.profileType,
    platform: workspace.mainPlatform,
    niche: workspace.niche,
    goals,
    postFrequency: workspace.postFrequency,
    contentCount,
    scheduledCount,
    hasAudit,
    hasScore: !!latestScore,
    scorePillars,
  };

  const insights = analyzeStrategy(ctx);
  const recommendations = getRecommendations(ctx);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Growth Coach</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Analyse stratégique, recommandations personnalisées et réponses à vos questions de croissance.
        </p>
      </div>

      <CoachUI insights={insights} recommendations={recommendations} />
    </div>
  );
}
