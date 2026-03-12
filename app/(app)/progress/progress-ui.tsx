"use client";

import { useState } from "react";
import type { ProgressReport, Achievement } from "@/modules/progress";
import { LEVELS, ACHIEVEMENT_CATEGORIES } from "@/modules/progress";

interface Props {
  report: ProgressReport;
}

type FilterCategory = Achievement["category"] | "all";

export function ProgressUI({ report }: Props) {
  const [filter, setFilter] = useState<FilterCategory>("all");

  const filtered =
    filter === "all"
      ? report.achievements
      : report.achievements.filter((a) => a.category === filter);

  const categories: FilterCategory[] = ["all", "content", "engagement", "consistency", "mastery"];

  return (
    <div className="space-y-8">
      {/* Level banner */}
      <div className={`rounded-2xl bg-gradient-to-r ${report.level.color} p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">Current Level</p>
            <h2 className="text-3xl font-bold mt-1">{report.level.name}</h2>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">{report.totalPoints}</p>
            <p className="text-sm text-white/80">Total points</p>
          </div>
        </div>

        {/* Progress bar to next level */}
        {report.nextLevel && (
          <div className="mt-5">
            <div className="flex items-center justify-between text-sm text-white/80 mb-1.5">
              <span>{report.level.name}</span>
              <span>{report.nextLevel.name}</span>
            </div>
            <div className="h-3 rounded-full bg-white/20">
              <div
                className="h-3 rounded-full bg-white transition-all"
                style={{ width: `${report.progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-white/70 mt-1.5">
              {report.pointsForNext - report.pointsInLevel} points to next level
            </p>
          </div>
        )}
        {!report.nextLevel && (
          <p className="mt-4 text-sm text-white/80">You reached the highest level!</p>
        )}
      </div>

      {/* Level roadmap */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Level Roadmap</h3>
        <div className="flex gap-2">
          {LEVELS.map((lvl) => {
            const isCurrent = lvl.id === report.level.id;
            const isPast = lvl.minPoints <= report.totalPoints;
            return (
              <div
                key={lvl.id}
                className={`flex-1 rounded-xl border p-3 text-center transition-all duration-200 hover:border-border-hover ${
                  isCurrent
                    ? "border-accent/50 bg-accent-muted"
                    : isPast
                      ? "border-success/30 bg-success/15"
                      : "border-border bg-surface-1"
                }`}
              >
                <p
                  className={`text-xs font-bold ${
                    isCurrent
                      ? "text-accent"
                      : isPast
                        ? "text-success"
                        : "text-text-muted"
                  }`}
                >
                  {lvl.name}
                </p>
                <p className="text-[10px] text-text-muted mt-0.5">{lvl.minPoints}+ pts</p>
                {isCurrent && (
                  <span className="inline-block mt-1 rounded-full bg-accent px-2 py-0.5 text-[9px] font-bold text-white">
                    YOU
                  </span>
                )}
                {isPast && !isCurrent && (
                  <span className="inline-block mt-1 text-success text-xs">✓</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Activity Stats</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Content created" value={report.stats.contentCreated} />
          <StatCard label="Published" value={report.stats.contentPublished} />
          <StatCard label="Hooks saved" value={report.stats.hooksGenerated} />
          <StatCard label="Posts scheduled" value={report.stats.scheduledPosts} />
          <StatCard label="Audits" value={report.stats.auditsCompleted} />
          <StatCard label="Score evals" value={report.stats.scoresCompleted} />
          <StatCard label="Missions done" value={report.stats.missionsCompleted} />
          <StatCard label="Days active" value={report.stats.daysActive} />
        </div>
      </div>

      {/* Achievements */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">
            Achievements ({report.unlockedCount}/{report.achievements.length})
          </h3>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((cat) => {
            const isActive = filter === cat;
            const catInfo = cat === "all" ? null : ACHIEVEMENT_CATEGORIES[cat];
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-white"
                    : "bg-surface-2 text-text-secondary hover:bg-surface-3"
                }`}
              >
                {cat === "all" ? "All" : catInfo?.label ?? cat}
              </button>
            );
          })}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((achievement) => {
            const catInfo = ACHIEVEMENT_CATEGORIES[achievement.category];
            return (
              <div
                key={achievement.id}
                className={`rounded-xl border p-4 transition-all duration-200 hover:border-border-hover ${
                  achievement.unlocked
                    ? "bg-surface-1 border-success/30"
                    : "bg-surface-2 border-border opacity-60"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4
                        className={`text-sm font-semibold truncate ${
                          achievement.unlocked ? "text-foreground" : "text-text-secondary"
                        }`}
                      >
                        {achievement.title}
                      </h4>
                      {achievement.unlocked && (
                        <span className="flex-shrink-0 text-success text-xs">✓</span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary">{achievement.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${catInfo.color}`}>
                        {catInfo.label}
                      </span>
                      <span className="text-[10px] font-bold text-warning">
                        +{achievement.points} pts
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface-1 p-3 text-center transition-all duration-200 hover:border-border-hover">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-text-muted mt-0.5">{label}</p>
    </div>
  );
}
