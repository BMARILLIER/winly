"use client";

import { getDailyGrowthPlan, CATEGORY_STYLES } from "@/modules/daily-growth-plan";
import type { BestContent } from "@/lib/queries/best-content";
import { Card, CardHeader, CardTitle, Badge } from "@/components/ui";
import { CheckCircle2, Circle, Lightbulb, ArrowRight, Sparkles } from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";

interface Props {
  workspaceId: string;
  bestContent: BestContent | null;
}

export function DailyGrowthPlanCard({ workspaceId, bestContent }: Props) {
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
          const isRepurpose = action.title.toLowerCase().includes("repurposer");

          return (
            <div key={action.id}>
              <button
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

              {/* Smart suggestion for Repurpose action */}
              {isRepurpose && !done && bestContent && (
                <div className="ml-8 mt-1 mb-1 rounded-lg border border-accent/20 bg-accent/5 p-3">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-accent mb-1">
                        Suggestion : votre meilleur contenu
                      </p>
                      <p className="text-xs text-text-secondary line-clamp-2">
                        {bestContent.preview}
                      </p>
                      <Link
                        href={`/repurpose?source=${bestContent.source}&id=${bestContent.id}`}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                      >
                        Repurposer celui-ci
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {isRepurpose && !done && !bestContent && (
                <div className="ml-8 mt-1 mb-1 rounded-lg border border-border bg-surface-1 p-3">
                  <p className="text-xs text-text-secondary mb-2">
                    Pas encore de contenu publié à analyser. Deux options :
                  </p>
                  <div className="flex items-center gap-3">
                    <Link
                      href="/content"
                      className="inline-flex items-center gap-1 text-xs font-medium text-text-muted hover:text-accent"
                    >
                      Créer un premier post
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                    <span className="text-xs text-text-muted">ou</span>
                    <Link
                      href="/repurpose"
                      className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                    >
                      Coller un texte à repurposer
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
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
