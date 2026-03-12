import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getGrade, PLATFORM_LABELS } from "@/modules/share";
import { getLevel } from "@/modules/progress";
import { ShareUI } from "./share-ui";
import type { ScoreCardData } from "@/modules/share";

export default async function SharePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  // Get latest score
  const latestScore = await prisma.scoreResult.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // Get stats for level
  const [contentCount, hooksCount, auditsCount, scoresCount, missionsCount, scheduledCount, activeDays] =
    await Promise.all([
      prisma.contentIdea.count({ where: { workspaceId: workspace.id } }),
      prisma.savedHook.count({ where: { workspaceId: workspace.id } }),
      prisma.auditResult.count({ where: { userId: user.id } }),
      prisma.scoreResult.count({ where: { userId: user.id } }),
      prisma.missionCompletion.count({ where: { workspaceId: workspace.id } }),
      prisma.contentIdea.count({ where: { workspaceId: workspace.id, scheduledDate: { not: null } } }),
      prisma.missionCompletion.findMany({
        where: { workspaceId: workspace.id },
        select: { date: true },
        distinct: ["date"],
      }),
    ]);

  const publishedCount = await prisma.contentIdea.count({
    where: { workspaceId: workspace.id, status: "published" },
  });

  // Compute level (same logic as progress module)
  const { computeProgress } = await import("@/modules/progress");
  const progressReport = computeProgress({
    contentCreated: contentCount,
    contentPublished: publishedCount,
    hooksGenerated: hooksCount,
    auditsCompleted: auditsCount,
    scoresCompleted: scoresCount,
    missionsCompleted: missionsCount,
    scheduledPosts: scheduledCount,
    daysActive: activeDays.length,
  });

  // Build pillars from score details
  let pillars: ScoreCardData["pillars"] = [];
  let globalScore = 0;

  if (latestScore) {
    const details = JSON.parse(latestScore.details);
    globalScore = latestScore.score;
    if (Array.isArray(details)) {
      pillars = details.map((p: { label: string; score: number }) => ({
        label: p.label,
        score: p.score,
      }));
    }
  }

  // Top achievement
  const topAchievement = progressReport.achievements
    .filter((a) => a.unlocked)
    .sort((a, b) => b.points - a.points)[0]?.title ?? null;

  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const cardData: ScoreCardData = {
    username: workspace.name || user.name || "Creator",
    platform: PLATFORM_LABELS[workspace.mainPlatform] ?? workspace.mainPlatform,
    niche: workspace.niche,
    level: progressReport.level.name,
    globalScore,
    grade: getGrade(globalScore),
    pillars,
    topAchievement,
    date: dateStr,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Score Card</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Générez une carte visuelle de votre Winly Score et partagez-la.
        </p>
      </div>

      {globalScore === 0 ? (
        <div className="rounded-xl border border-border bg-surface-1 p-8 text-center transition-all duration-200 hover:border-border-hover">
          <p className="text-sm text-text-secondary">
            Complétez d&apos;abord une évaluation Winly Score pour générer votre carte.
          </p>
          <a
            href="/score"
            className="mt-4 inline-block rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
          >
            Passer l&apos;évaluation Score
          </a>
        </div>
      ) : (
        <ShareUI data={cardData} />
      )}
    </div>
  );
}
