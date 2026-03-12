import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getDailyMissions, calculateStreak } from "@/modules/missions";
import { toDateStr } from "@/modules/calendar";
import { MissionsUI } from "./missions-ui";

export default async function MissionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  const today = toDateStr(new Date());
  const dailyMissions = getDailyMissions(today);

  // Fetch all completions for this workspace
  const completions = await prisma.missionCompletion.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { date: "desc" },
  });

  const completedMissionIds = completions.map((c) => c.missionId);
  const completedDates = [...new Set(completions.map((c) => c.date))];
  const totalXp = completions.reduce((sum, c) => sum + c.xp, 0);

  const streakInfo = calculateStreak(completedDates, totalXp);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Growth Missions</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Complétez vos missions quotidiennes pour maintenir votre série et monter de niveau.
        </p>
      </div>

      <MissionsUI
        date={today}
        missions={dailyMissions.missions}
        completedIds={completedMissionIds}
        streak={streakInfo}
        workspaceId={workspace.id}
      />
    </div>
  );
}
