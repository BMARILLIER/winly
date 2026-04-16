"use client";

import Link from "next/link";
import { CheckCircle2, Circle, ArrowRight, Trophy, Rocket } from "lucide-react";
import type { GettingStartedData } from "@/lib/queries/getting-started";

interface Props {
  data: GettingStartedData;
}

export function GuideUI({ data }: Props) {
  const nextStep = data.steps.find((s) => !s.completed);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Guide de demarrage</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Suis ces etapes pour tirer le maximum de Winly.
        </p>
      </div>

      {/* Progress */}
      <div className="rounded-xl border border-border bg-surface-1 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {data.allDone ? (
              <Trophy className="h-5 w-5 text-amber-400" />
            ) : (
              <Rocket className="h-5 w-5 text-accent" />
            )}
            <span className="text-sm font-semibold text-foreground">
              {data.allDone
                ? "Bravo ! Tu as tout complete !"
                : `${data.completedCount}/${data.totalCount} etapes completees`}
            </span>
          </div>
          <span className="text-sm font-bold text-accent">{data.progressPct}%</span>
        </div>
        <div className="h-3 rounded-full bg-surface-3 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-violet transition-all duration-500"
            style={{ width: `${data.progressPct}%` }}
          />
        </div>
        {nextStep && (
          <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
            <span>Prochaine etape :</span>
            <Link href={nextStep.href} className="font-medium text-accent hover:underline">
              {nextStep.title} →
            </Link>
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {data.steps.map((step, i) => {
          const isNext = !step.completed && (i === 0 || data.steps[i - 1].completed);

          return (
            <Link
              key={step.id}
              href={step.href}
              className={`block rounded-xl border p-4 transition-all duration-200 ${
                step.completed
                  ? "border-success/30 bg-success/5 hover:bg-success/10"
                  : isNext
                    ? "border-accent/50 bg-accent/5 hover:bg-accent/10 ring-1 ring-accent/20"
                    : "border-border bg-surface-1 hover:border-border-hover hover:bg-surface-2"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Step indicator */}
                <div className="mt-0.5 flex-shrink-0">
                  {step.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : isNext ? (
                    <div className="h-5 w-5 rounded-full border-2 border-accent flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    </div>
                  ) : (
                    <Circle className="h-5 w-5 text-text-muted" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{step.icon}</span>
                    <span
                      className={`text-sm font-semibold ${
                        step.completed ? "text-success" : "text-foreground"
                      }`}
                    >
                      {step.title}
                    </span>
                    {isNext && (
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                        Suivant
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-text-muted">{step.description}</p>
                </div>

                {/* Arrow */}
                {!step.completed && (
                  <ArrowRight className={`h-4 w-4 flex-shrink-0 mt-1 ${isNext ? "text-accent" : "text-text-muted"}`} />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Features map */}
      <div className="rounded-xl border border-border bg-surface-1 p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Toutes les fonctionnalites</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { label: "Dashboard", href: "/dashboard", icon: "📊" },
            { label: "Analytics", href: "/analytics", icon: "📈" },
            { label: "Growth", href: "/growth", icon: "🌱" },
            { label: "Revenue", href: "/revenue", icon: "💰" },
            { label: "AI Insights", href: "/ai-insights", icon: "💡" },
            { label: "Creator Score", href: "/creator-score", icon: "⭐" },
            { label: "Contenu IA", href: "/content", icon: "✍️" },
            { label: "Hooks", href: "/hooks", icon: "🎣" },
            { label: "Hashtags", href: "/hashtags", icon: "#️⃣" },
            { label: "Viral Score", href: "/viral-score", icon: "🎯" },
            { label: "Concurrents", href: "/competitors", icon: "🔍" },
            { label: "Commentaires IA", href: "/comments", icon: "💬" },
            { label: "Bio Optimizer", href: "/bio", icon: "📝" },
            { label: "Identite", href: "/identity", icon: "🎭" },
            { label: "Mon Recap", href: "/recap", icon: "📊" },
            { label: "Parrainage", href: "/referral", icon: "🎁" },
            { label: "Missions", href: "/missions", icon: "🎯" },
            { label: "Parametres", href: "/settings", icon: "⚙️" },
          ].map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-3 transition-colors"
            >
              <span>{f.icon}</span>
              {f.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
