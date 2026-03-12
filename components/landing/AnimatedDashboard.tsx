"use client";

import { useEffect, useRef, useState } from "react";
import { TrendingUp, Users, Eye, Heart, ArrowUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatCard {
  label: string;
  before: number;
  after: number;
  suffix: string;
  displaySuffix: string;
  decimals: number;
  icon: LucideIcon;
  color: string;
  growth: string;
}

const statCards: StatCard[] = [
  { label: "Score Social", before: 42, after: 87, suffix: "", displaySuffix: "", decimals: 0, icon: TrendingUp, color: "text-success", growth: "+45" },
  { label: "Followers", before: 10.2, after: 24.5, suffix: "K", displaySuffix: "K", decimals: 1, icon: Users, color: "text-primary", growth: "+140%" },
  { label: "Impressions", before: 58, after: 142, suffix: "K", displaySuffix: "K", decimals: 0, icon: Eye, color: "text-cyan", growth: "+145%" },
  { label: "Engagement", before: 2.1, after: 6.2, suffix: "%", displaySuffix: "%", decimals: 1, icon: Heart, color: "text-violet", growth: "+195%" },
];

const barsBefore = [20, 25, 18, 30, 22, 35, 20, 38, 28, 32, 35, 38, 30, 40, 35, 38, 32, 40, 36, 34, 40, 38, 42, 40];
const barsAfter = [40, 55, 35, 65, 50, 70, 45, 80, 60, 75, 85, 90, 70, 95, 80, 88, 72, 92, 85, 78, 95, 88, 100, 92];

// phase 0: count up to "before" values
// phase 1: pause
// phase 2: grow from "before" to "after" values
type Phase = 0 | 1 | 2;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function AnimatedDashboard() {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>(0);
  const [progress, setProgress] = useState(0); // 0-1 within current phase
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    // Phase 0: count up to "before" (1.2s)
    // Phase 1: pause (1s)
    // Phase 2: grow to "after" (1.5s)
    const timeline = [
      { duration: 1200, phase: 0 as Phase },
      { duration: 1000, phase: 1 as Phase },
      { duration: 1500, phase: 2 as Phase },
    ];

    let cancelled = false;
    let cumulativeDelay = 0;

    for (const step of timeline) {
      const delay = cumulativeDelay;
      setTimeout(() => {
        if (cancelled) return;
        setPhase(step.phase);
        const start = performance.now();

        function animate(now: number) {
          if (cancelled) return;
          const elapsed = now - start;
          const t = Math.min(elapsed / step.duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          setProgress(eased);
          if (t < 1) requestAnimationFrame(animate);
        }

        if (step.phase !== 1) {
          requestAnimationFrame(animate);
        } else {
          setProgress(1);
        }
      }, delay);
      cumulativeDelay += step.duration;
    }

    return () => { cancelled = true; };
  }, [hasStarted]);

  function getCurrentValue(card: StatCard): string {
    let value: number;
    if (phase === 0) {
      value = card.before * progress;
    } else if (phase === 1) {
      value = card.before;
    } else {
      value = lerp(card.before, card.after, progress);
    }
    return card.decimals > 0 ? value.toFixed(card.decimals) : Math.round(value).toString();
  }

  function getBarHeight(i: number): number {
    if (phase === 0) {
      return barsBefore[i] * progress;
    } else if (phase === 1) {
      return barsBefore[i];
    } else {
      return lerp(barsBefore[i], barsAfter[i], progress);
    }
  }

  function getGrowthPercent(): string {
    if (phase === 0) {
      return `+${(3.2 * progress).toFixed(1)}%`;
    } else if (phase === 1) {
      return "+3.2%";
    } else {
      return `+${lerp(3.2, 12.4, progress).toFixed(1)}%`;
    }
  }

  const showGrowthBadges = phase === 2 && progress > 0.3;

  return (
    <div ref={ref} className="mt-16 mx-auto max-w-4xl" style={{ perspective: "1000px" }}>
      <div
        className="rounded-2xl border border-border bg-surface-1 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden"
        style={{ transform: "rotateX(2deg)" }}
      >
        {/* Window bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface-2">
          <span className="h-3 w-3 rounded-full bg-danger/80" />
          <span className="h-3 w-3 rounded-full bg-warning/80" />
          <span className="h-3 w-3 rounded-full bg-success/80" />
          <span className="ml-4 text-xs text-text-muted">WINLY — Dashboard</span>
          {phase >= 1 && (
            <span className="ml-auto text-[10px] text-text-muted">
              {phase === 2 ? "Après 3 mois avec Winly" : "Avant Winly"}
            </span>
          )}
        </div>

        {/* Dashboard content */}
        <div className="p-6">
          {/* Animated stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="rounded-lg border border-border bg-surface-2 p-4 relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-text-muted">{card.label}</span>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
                <p className="text-xl font-bold text-foreground tabular-nums">
                  {getCurrentValue(card)}{card.displaySuffix}{card.suffix && !card.displaySuffix ? card.suffix : ""}
                </p>
                {/* Growth badge */}
                {showGrowthBadges && (
                  <div
                    className="flex items-center gap-0.5 mt-1.5 transition-all duration-500"
                    style={{ opacity: Math.min((progress - 0.3) / 0.3, 1) }}
                  >
                    <ArrowUp className="h-3 w-3 text-success" />
                    <span className="text-[11px] font-medium text-success">{card.growth}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Animated chart */}
          <div className="rounded-lg border border-border bg-surface-2 p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-foreground">Croissance — 30 jours</span>
              <span className="text-xs text-success tabular-nums">
                {getGrowthPercent()}
              </span>
            </div>
            {/* Animated bar chart */}
            <div className="flex items-end gap-1.5 h-24">
              {barsAfter.map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-gradient-to-t from-primary to-violet"
                  style={{
                    height: `${getBarHeight(i)}%`,
                    opacity: 0.5 + 0.5 * (phase === 0 ? progress : 1),
                    transition: "height 0.15s ease-out",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
