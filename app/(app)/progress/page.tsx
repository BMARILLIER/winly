import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { computeProgress } from "@/modules/progress";
import { ProgressUI } from "./progress-ui";

export default async function ProgressPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  // Gather stats from all modules
  const [
    contentCreated,
    contentPublished,
    hooksGenerated,
    auditsCompleted,
    scoresCompleted,
    missionsCompleted,
    scheduledPosts,
    activeDays,
  ] = await Promise.all([
    prisma.contentIdea.count({ where: { workspaceId: workspace.id } }),
    prisma.contentIdea.count({ where: { workspaceId: workspace.id, status: "published" } }),
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

  const report = computeProgress({
    contentCreated,
    contentPublished,
    hooksGenerated,
    auditsCompleted,
    scoresCompleted,
    missionsCompleted,
    scheduledPosts,
    daysActive: activeDays.length,
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Progression</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Suivez votre parcours de croissance, débloquez des succès et montez de niveau.
        </p>
      </div>

      <ProgressUI report={report} />
    </div>
  );
}
