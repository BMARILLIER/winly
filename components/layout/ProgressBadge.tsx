import Link from "next/link";
import { Flame, Sparkles } from "lucide-react";
import { getProgressStats } from "@/lib/queries/progress-stats";

export async function ProgressBadge({ userId }: { userId: string }) {
  const stats = await getProgressStats(userId);
  if (!stats) return null;

  return (
    <Link
      href="/missions"
      className="hidden sm:flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-3 py-1.5 hover:border-accent/50 hover:bg-surface-3 transition-colors"
      title={`Niveau ${stats.level} · ${stats.totalXp} XP · Streak ${stats.streakDays}j`}
    >
      <div className="flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-accent" />
        <span className="text-xs font-semibold text-foreground">
          Niv. {stats.level}
        </span>
      </div>

      <div className="h-3 w-16 overflow-hidden rounded-full bg-surface-1">
        <div
          className="h-full bg-gradient-to-r from-primary to-violet"
          style={{ width: `${stats.progressPct}%` }}
        />
      </div>

      <div
        className={`flex items-center gap-1 text-xs font-medium ${
          stats.completedToday ? "text-accent" : "text-text-muted"
        }`}
      >
        <Flame
          className={`h-3.5 w-3.5 ${
            stats.streakDays > 0 ? "text-orange-500" : "text-text-muted"
          }`}
        />
        <span>{stats.streakDays}j</span>
      </div>
    </Link>
  );
}
