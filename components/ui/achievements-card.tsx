"use client";

import { Trophy, Lock } from "lucide-react";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

interface Props {
  achievements: Achievement[];
}

export function AchievementsCard({ achievements }: Props) {
  const unlocked = achievements.filter((a) => a.unlocked);
  const locked = achievements.filter((a) => !a.unlocked);

  return (
    <div className="rounded-xl border border-border bg-surface-1 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-amber-400" />
        <h3 className="text-sm font-semibold text-foreground">
          Badges ({unlocked.length}/{achievements.length})
        </h3>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {achievements.map((a) => (
          <div
            key={a.id}
            className={`group relative flex flex-col items-center rounded-lg p-2 transition-all ${
              a.unlocked
                ? "bg-accent/10 border border-accent/20"
                : "bg-surface-2 opacity-40"
            }`}
            title={`${a.title}: ${a.description}`}
          >
            <span className="text-xl">{a.unlocked ? a.icon : ""}</span>
            {!a.unlocked && <Lock className="h-4 w-4 text-text-muted" />}
            <span className="text-[9px] text-text-muted text-center mt-1 leading-tight">
              {a.title}
            </span>
          </div>
        ))}
      </div>

      {locked.length > 0 && (
        <p className="mt-3 text-[10px] text-text-muted text-center">
          {locked.length} badge{locked.length > 1 ? "s" : ""} restant{locked.length > 1 ? "s" : ""} a debloquer
        </p>
      )}
    </div>
  );
}
