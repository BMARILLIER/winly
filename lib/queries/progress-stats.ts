import { prisma } from "@/lib/db";

export type ProgressStats = {
  totalXp: number;
  level: number;
  xpInLevel: number;
  xpToNextLevel: number;
  progressPct: number;
  streakDays: number;
  completedToday: boolean;
};

// 100 XP par niveau, progression linéaire
const XP_PER_LEVEL = 100;

function levelFromXp(xp: number): {
  level: number;
  xpInLevel: number;
  xpToNextLevel: number;
  progressPct: number;
} {
  const level = Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
  const xpInLevel = xp % XP_PER_LEVEL;
  return {
    level,
    xpInLevel,
    xpToNextLevel: XP_PER_LEVEL,
    progressPct: Math.round((xpInLevel / XP_PER_LEVEL) * 100),
  };
}

function computeStreak(dates: string[]): number {
  // dates = liste de "YYYY-MM-DD" uniques, triée décroissante
  if (dates.length === 0) return 0;

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const set = new Set(dates);
  let cursor: Date;

  if (set.has(todayStr)) cursor = today;
  else if (set.has(yesterdayStr)) cursor = yesterday;
  else return 0;

  let streak = 0;
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (set.has(key)) {
      streak += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Agrège les stats de progression du user à travers tous ses workspaces.
 * Retourne null si aucun workspace.
 */
export async function getProgressStats(userId: string): Promise<ProgressStats | null> {
  const workspaces = await prisma.workspace.findMany({
    where: { userId },
    select: { id: true },
  });

  if (workspaces.length === 0) return null;

  const workspaceIds = workspaces.map((w) => w.id);

  const completions = await prisma.missionCompletion.findMany({
    where: { workspaceId: { in: workspaceIds } },
    select: { xp: true, date: true },
    orderBy: { date: "desc" },
  });

  const totalXp = completions.reduce((sum, c) => sum + c.xp, 0);
  const uniqueDates = Array.from(new Set(completions.map((c) => c.date)));
  const streakDays = computeStreak(uniqueDates);
  const todayStr = new Date().toISOString().slice(0, 10);
  const completedToday = uniqueDates.includes(todayStr);

  return {
    totalXp,
    streakDays,
    completedToday,
    ...levelFromXp(totalXp),
  };
}
