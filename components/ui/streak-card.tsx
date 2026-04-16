"use client";

import { Flame } from "lucide-react";

interface Props {
  streakDays: number;
  completedToday: boolean;
  level: number;
  totalXp: number;
  progressPct: number;
  xpInLevel: number;
  xpToNextLevel: number;
}

function getStreakMessage(streak: number, completedToday: boolean): string {
  if (!completedToday && streak > 0) return `Ta streak est en danger ! Complete une mission aujourd'hui.`;
  if (streak === 0) return "Lance ta premiere streak en completant une mission.";
  if (streak < 3) return "Bon debut ! Continue demain.";
  if (streak < 7) return "Belle serie ! Tu prends le rythme.";
  if (streak < 14) return "1 semaine+ ! Tu es sur une lancee.";
  if (streak < 30) return "Machine ! Rien ne t'arrete.";
  return "Legendaire. Tu es dans le top 1% des createurs.";
}

function getFlameColor(streak: number): string {
  if (streak >= 30) return "text-violet-400";
  if (streak >= 14) return "text-red-500";
  if (streak >= 7) return "text-orange-500";
  if (streak >= 3) return "text-amber-500";
  return "text-text-muted";
}

function getFlameSize(streak: number): string {
  if (streak >= 14) return "h-12 w-12";
  if (streak >= 7) return "h-10 w-10";
  return "h-8 w-8";
}

export function StreakCard({
  streakDays,
  completedToday,
  level,
  totalXp,
  progressPct,
  xpInLevel,
  xpToNextLevel,
}: Props) {
  const inDanger = !completedToday && streakDays > 0;

  return (
    <div
      className={`rounded-xl border p-5 ${
        inDanger
          ? "border-danger/50 bg-danger/5 animate-pulse"
          : "border-border bg-surface-1"
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Flame */}
        <div className="relative">
          <Flame
            className={`${getFlameSize(streakDays)} ${getFlameColor(streakDays)} ${
              streakDays > 0 ? "drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]" : ""
            }`}
          />
          {streakDays > 0 && (
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-surface-1 text-[10px] font-bold text-foreground border border-border">
              {streakDays}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">
              {streakDays} jour{streakDays !== 1 ? "s" : ""}
            </span>
            {inDanger && (
              <span className="rounded-full bg-danger/20 px-2 py-0.5 text-[10px] font-bold text-danger uppercase tracking-wider animate-bounce">
                En danger
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            {getStreakMessage(streakDays, completedToday)}
          </p>
        </div>
      </div>

      {/* Level + XP bar */}
      <div className="mt-4 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet text-[10px] font-bold text-white">
            {level}
          </div>
          <span className="text-xs text-text-muted">{totalXp} XP</span>
        </div>
        <div className="flex-1 h-2 rounded-full bg-surface-3 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-violet transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="text-[10px] text-text-muted">
          {xpInLevel}/{xpToNextLevel}
        </span>
      </div>
    </div>
  );
}
