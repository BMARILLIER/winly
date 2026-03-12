"use client";

import type { Mission, StreakInfo } from "@/modules/missions";
import { MISSION_CATEGORIES, DIFFICULTY_XP } from "@/modules/missions";
import { completeMission } from "@/lib/actions/missions";

interface Props {
  date: string;
  missions: Mission[];
  completedIds: string[];
  streak: StreakInfo;
  workspaceId: string;
}

export function MissionsUI({ date, missions, completedIds, streak, workspaceId }: Props) {
  const completedToday = missions.filter((m) => completedIds.includes(m.id)).length;
  const allDone = completedToday === missions.length;

  return (
    <div className="space-y-8">
      {/* Streak & Level */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Current streak */}
        <div className="rounded-xl border border-border bg-surface-1 p-5 text-center transition-all duration-200 hover:border-border-hover">
          <p className="text-3xl font-bold text-accent">{streak.current}</p>
          <p className="text-sm text-text-secondary mt-1">Day streak</p>
          <p className="text-[10px] text-text-muted mt-0.5">
            Longest: {streak.longest} days
          </p>
        </div>

        {/* Level */}
        <div className="rounded-xl border border-border bg-surface-1 p-5 text-center transition-all duration-200 hover:border-border-hover">
          <p className="text-3xl font-bold text-foreground">Lv.{streak.level}</p>
          <p className="text-sm text-text-secondary mt-1">{streak.levelLabel}</p>
          <div className="mt-2">
            <div className="h-2 rounded-full bg-surface-2">
              <div
                className="h-2 rounded-full bg-violet-500 transition-all"
                style={{ width: `${streak.progressPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-text-muted mt-1">
              {streak.xpToNext > 0 ? `${streak.xpToNext} XP to next level` : "Max level!"}
            </p>
          </div>
        </div>

        {/* Total XP */}
        <div className="rounded-xl border border-border bg-surface-1 p-5 text-center transition-all duration-200 hover:border-border-hover">
          <p className="text-3xl font-bold text-warning">{streak.xpTotal}</p>
          <p className="text-sm text-text-secondary mt-1">Total XP</p>
          <p className="text-[10px] text-text-muted mt-0.5">
            {completedToday}/{missions.length} missions today
          </p>
        </div>
      </div>

      {/* Today's missions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Today&apos;s Missions</h2>
          {allDone && (
            <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
              All complete!
            </span>
          )}
        </div>

        <div className="space-y-3">
          {missions.map((mission) => {
            const isCompleted = completedIds.includes(mission.id);
            const catInfo = MISSION_CATEGORIES[mission.category];
            const diffInfo = DIFFICULTY_XP[mission.difficulty];

            return (
              <div
                key={mission.id}
                className={`rounded-xl border p-5 transition-all duration-200 ${
                  isCompleted ? "bg-success/15 border-border" : "bg-surface-1 border-border hover:border-border-hover"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${catInfo.color}`}>
                        {catInfo.label}
                      </span>
                      <span className={`text-[10px] font-medium ${diffInfo.color}`}>
                        {diffInfo.label}
                      </span>
                      <span className="text-[10px] font-bold text-warning">
                        +{mission.xp} XP
                      </span>
                    </div>
                    <h3
                      className={`text-sm font-semibold ${
                        isCompleted ? "text-success line-through" : "text-foreground"
                      }`}
                    >
                      {mission.title}
                    </h3>
                    <p className="mt-1 text-xs text-text-secondary">{mission.description}</p>
                  </div>

                  {isCompleted ? (
                    <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-success text-white">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <form action={completeMission}>
                      <input type="hidden" name="workspaceId" value={workspaceId} />
                      <input type="hidden" name="missionId" value={mission.id} />
                      <input type="hidden" name="date" value={mission.id.split("_")[1]} />
                      <input type="hidden" name="xp" value={mission.xp} />
                      <button
                        type="submit"
                        className="flex-shrink-0 rounded-xl bg-accent px-4 py-2 text-xs font-medium text-white hover:bg-accent-hover"
                      >
                        Complete
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
