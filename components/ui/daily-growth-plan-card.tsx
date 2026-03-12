"use client";

import { getDailyGrowthPlan, CATEGORY_STYLES } from "@/modules/daily-growth-plan";
import { Card, CardHeader, CardTitle, Badge } from "@/components/ui";
import { CheckCircle2, Circle, Lightbulb } from "lucide-react";
import { useState, useMemo } from "react";

export function DailyGrowthPlanCard() {
  const today = new Date().toISOString().slice(0, 10);
  const plan = useMemo(() => getDailyGrowthPlan(today), [today]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const doneCount = completed.size;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Plan de croissance du jour</CardTitle>
          <span className="text-xs text-text-muted">{plan.dayLabel}</span>
        </div>
        {doneCount === 3 && (
          <p className="text-xs text-success font-medium mt-1">Toutes les actions sont complétées !</p>
        )}
      </CardHeader>

      <div className="space-y-2">
        {plan.actions.map((action) => {
          const done = completed.has(action.id);
          const style = CATEGORY_STYLES[action.category];
          return (
            <button
              key={action.id}
              onClick={() => toggle(action.id)}
              className={`flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors ${
                done ? "bg-success/5" : "bg-surface-2 hover:bg-surface-3"
              }`}
            >
              {done ? (
                <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
              ) : (
                <Circle className="h-5 w-5 text-text-muted shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-sm font-medium ${done ? "line-through text-text-muted" : "text-foreground"}`}>
                    {action.title}
                  </span>
                  <Badge variant="default" className={`text-[10px] px-1.5 py-0 ${style.color}`}>
                    {style.label}
                  </Badge>
                </div>
                <p className="text-xs text-text-secondary">{action.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Focus tip */}
      <div className="mt-3 flex items-start gap-2 rounded-lg bg-accent-muted p-3">
        <Lightbulb className="h-4 w-4 text-accent shrink-0 mt-0.5" />
        <p className="text-xs text-accent">{plan.focusTip}</p>
      </div>
    </Card>
  );
}
