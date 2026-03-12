"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  scheduleContent,
  unscheduleContent,
  updateCalendarStatus,
  createAndSchedule,
} from "@/lib/actions/calendar";
import { shiftWeek, weekLabel, type CalendarDay } from "@/modules/calendar";
import { STATUSES, FORMATS } from "@/modules/content";

interface ScheduledItem {
  id: string;
  title: string;
  format: string;
  status: string;
  scheduledDate: string;
}

interface BacklogItem {
  id: string;
  title: string;
  format: string;
  status: string;
}

interface Props {
  days: CalendarDay[];
  refDate: string;
  scheduled: ScheduledItem[];
  backlog: BacklogItem[];
  workspaceId: string;
}

export function WeekView({ days, refDate, scheduled, backlog, workspaceId }: Props) {
  const router = useRouter();
  const [quickAddDay, setQuickAddDay] = useState<string | null>(null);
  const [quickTitle, setQuickTitle] = useState("");
  const [assignDay, setAssignDay] = useState<string | null>(null);

  function navigateWeek(direction: -1 | 1) {
    const newDate = shiftWeek(refDate, direction);
    router.push(`/calendar?week=${newDate}`);
  }

  function goToday() {
    router.push("/calendar");
  }

  function getItemsForDay(date: string) {
    return scheduled.filter((s) => s.scheduledDate === date);
  }

  function handleQuickAdd(date: string) {
    if (!quickTitle.trim()) return;
    const formData = new FormData();
    formData.set("workspaceId", workspaceId);
    formData.set("title", quickTitle);
    formData.set("date", date);
    createAndSchedule(formData);
    setQuickTitle("");
    setQuickAddDay(null);
  }

  return (
    <div>
      {/* Week navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateWeek(-1)}
            className="rounded-lg border px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-2"
          >
            ← Prev
          </button>
          <button
            onClick={goToday}
            className="rounded-lg border px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent-muted"
          >
            Today
          </button>
          <button
            onClick={() => navigateWeek(1)}
            className="rounded-lg border px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-2"
          >
            Next →
          </button>
        </div>
        <span className="text-sm font-medium text-foreground">
          {weekLabel(days)}
        </span>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-3 mb-8">
        {days.map((day) => {
          const items = getItemsForDay(day.date);
          return (
            <div
              key={day.date}
              className={`rounded-xl border border-border bg-surface-1 min-h-[180px] flex flex-col transition-all duration-200 hover:border-border-hover ${
                day.isToday ? "ring-2 ring-violet-500" : ""
              }`}
            >
              {/* Day header */}
              <div
                className={`px-3 py-2 text-center border-b border-border ${
                  day.isToday ? "bg-accent-muted" : "bg-surface-2"
                }`}
              >
                <span
                  className={`text-xs font-medium ${
                    day.isToday ? "text-accent" : "text-text-secondary"
                  }`}
                >
                  {day.label}
                </span>
              </div>

              {/* Items */}
              <div className="flex-1 p-2 space-y-1.5">
                {items.map((item) => {
                  const statusInfo = STATUSES.find((s) => s.id === item.status);
                  return (
                    <div
                      key={item.id}
                      className="rounded-lg bg-surface-2 p-2 group"
                    >
                      <p className="text-xs font-medium text-foreground line-clamp-2">
                        {item.title}
                      </p>
                      <div className="mt-1 flex items-center justify-between">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${statusInfo?.color ?? "bg-surface-2 text-text-secondary"}`}
                        >
                          {statusInfo?.label ?? item.status}
                        </span>
                        <div className="hidden group-hover:flex gap-1">
                          {/* Cycle status */}
                          <form action={updateCalendarStatus}>
                            <input type="hidden" name="ideaId" value={item.id} />
                            <input
                              type="hidden"
                              name="status"
                              value={nextStatus(item.status)}
                            />
                            <button
                              type="submit"
                              className="text-[10px] text-accent hover:underline"
                              title={`Move to ${nextStatus(item.status)}`}
                            >
                              →
                            </button>
                          </form>
                          {/* Unschedule */}
                          <form action={unscheduleContent}>
                            <input type="hidden" name="ideaId" value={item.id} />
                            <button
                              type="submit"
                              className="text-[10px] text-text-muted hover:text-danger"
                              title="Remove from calendar"
                            >
                              ×
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Quick add */}
                {quickAddDay === day.date ? (
                  <div className="mt-1">
                    <input
                      type="text"
                      value={quickTitle}
                      onChange={(e) => setQuickTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleQuickAdd(day.date);
                        if (e.key === "Escape") setQuickAddDay(null);
                      }}
                      placeholder="Title..."
                      autoFocus
                      className="w-full rounded border border-border px-2 py-1 text-xs text-foreground focus:border-accent focus:outline-none"
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setQuickAddDay(day.date);
                      setQuickTitle("");
                    }}
                    className="w-full rounded-lg py-1 text-[10px] text-text-muted hover:text-violet-500 hover:bg-accent-muted transition-colors"
                  >
                    +
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Backlog — unscheduled content */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            Unscheduled ({backlog.length})
          </h2>
          {assignDay && (
            <button
              onClick={() => setAssignDay(null)}
              className="text-xs text-text-muted hover:text-text-secondary"
            >
              Cancel assign
            </button>
          )}
        </div>

        {backlog.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface-1 p-8 text-center transition-all duration-200 hover:border-border-hover">
            <p className="text-sm text-text-muted">
              No unscheduled content. Create ideas in the Content module.
            </p>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {backlog.map((item) => {
              const statusInfo = STATUSES.find((s) => s.id === item.status);
              const formatLabel = FORMATS.find((f) => f.id === item.format)?.label ?? item.format;

              return (
                <div key={item.id} className="rounded-xl border border-border bg-surface-1 p-4 transition-all duration-200 hover:border-border-hover">
                  <p className="text-sm font-medium text-foreground line-clamp-1">
                    {item.title}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${statusInfo?.color ?? "bg-surface-2 text-text-secondary"}`}
                    >
                      {statusInfo?.label ?? item.status}
                    </span>
                    <span className="text-[10px] text-text-muted">{formatLabel}</span>
                  </div>

                  {/* Assign to day */}
                  {assignDay === item.id ? (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {days.map((d) => (
                        <form key={d.date} action={scheduleContent}>
                          <input type="hidden" name="ideaId" value={item.id} />
                          <input type="hidden" name="date" value={d.date} />
                          <button
                            type="submit"
                            className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                              d.isToday
                                ? "bg-accent-muted text-accent"
                                : "bg-surface-2 text-text-secondary hover:bg-accent-muted hover:text-accent"
                            }`}
                          >
                            {d.label}
                          </button>
                        </form>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={() => setAssignDay(item.id)}
                      className="mt-2 text-xs font-medium text-accent hover:underline"
                    >
                      Assign to day
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function nextStatus(current: string): string {
  const order = ["idea", "draft", "ready", "published"];
  const idx = order.indexOf(current);
  return idx < order.length - 1 ? order[idx + 1] : order[0];
}
