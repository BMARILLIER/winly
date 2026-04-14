// ---------------------------------------------------------------------------
// Revenue Control Center Engine
// Aggregates actions, tracking, and revenue data into a unified dashboard model
// ---------------------------------------------------------------------------

import type { RevenueReport } from "@/modules/revenue";
import type { Action, ActionPlan } from "@/modules/action-plan";

// --- Types ---

export type Strategy = "aggressive" | "balanced" | "soft";
export type Timing = "now" | "soon" | "later";

export interface RevenueAction {
  id: string;
  title: string;
  description: string;
  pillar: string;
  priorityScore: number; // 0-100, computed
  effort: "quick" | "medium" | "ongoing";
  expectedImpact: number; // EUR estimated
  timing: Timing;
  status: "pending" | "done";
}

export interface RevenueControlData {
  // KPIs
  revenueToday: number;
  revenuePotential: number;
  revenueFromActions: number;
  trend: "up" | "down" | "stable";

  // Top actions
  topActions: RevenueAction[];

  // Auto-summary
  summary: string;

  // Strategy
  strategy: Strategy;
}

// --- Priority scoring ---

const PRIORITY_WEIGHTS = {
  high: 40,
  medium: 25,
  low: 10,
};

const EFFORT_BONUS: Record<string, number> = {
  quick: 20,
  medium: 10,
  ongoing: 0,
};

const PILLAR_REVENUE_IMPACT: Record<string, number> = {
  conversion: 1.5,
  content: 1.2,
  engagement: 1.1,
  profile: 1.0,
  consistency: 0.9,
};

function scorePriority(action: Action): number {
  const base = PRIORITY_WEIGHTS[action.priority] ?? 15;
  const effort = EFFORT_BONUS[action.effort] ?? 0;
  const pillarBoost = (PILLAR_REVENUE_IMPACT[action.pillar] ?? 1) * 10;
  return Math.min(100, Math.round(base + effort + pillarBoost));
}

function estimateImpact(action: Action, report: RevenueReport): number {
  const baseRevenue = (report.monthlyEarningsMin + report.monthlyEarningsMax) / 2;
  const pillarMul = PILLAR_REVENUE_IMPACT[action.pillar] ?? 1;
  const priorityMul = action.priority === "high" ? 0.08 : action.priority === "medium" ? 0.04 : 0.02;
  return Math.round(baseRevenue * priorityMul * pillarMul);
}

function getTiming(action: Action): Timing {
  if (action.priority === "high" && action.effort === "quick") return "now";
  if (action.priority === "high" || action.effort === "quick") return "soon";
  return "later";
}

// --- Main computation ---

export function buildRevenueControl(
  report: RevenueReport,
  actionPlan: ActionPlan | null,
  completedActionIds: string[] = [],
): RevenueControlData {
  const avgMonthly = (report.monthlyEarningsMin + report.monthlyEarningsMax) / 2;
  const revenueToday = Math.round(avgMonthly / 30);

  // Build scored actions
  const actions = (actionPlan?.actions ?? []).map((a): RevenueAction => {
    const priorityScore = scorePriority(a);
    const expectedImpact = estimateImpact(a, report);
    return {
      id: a.id,
      title: a.title,
      description: a.description,
      pillar: a.pillarLabel,
      priorityScore,
      effort: a.effort,
      expectedImpact,
      timing: getTiming(a),
      status: completedActionIds.includes(a.id) ? "done" : "pending",
    };
  });

  // Sort by priorityScore descending
  actions.sort((a, b) => b.priorityScore - a.priorityScore);

  const pendingActions = actions.filter((a) => a.status === "pending");
  const doneActions = actions.filter((a) => a.status === "done");

  const revenuePotential = pendingActions.reduce((sum, a) => sum + a.expectedImpact, 0);
  const revenueFromActions = doneActions.reduce((sum, a) => sum + a.expectedImpact, 0);

  // Trend
  const trend: "up" | "down" | "stable" =
    report.growthPotential === "explosive" || report.growthPotential === "strong"
      ? "up"
      : report.growthPotential === "early"
        ? "down"
        : "stable";

  // Strategy
  const strategy: Strategy =
    report.accountValueScore >= 60 ? "aggressive"
      : report.accountValueScore >= 35 ? "balanced"
        : "soft";

  // Auto-summary
  const topAction = pendingActions[0];
  const summary = topAction
    ? `${trend === "up" ? "Croissance positive" : trend === "down" ? "Phase de lancement" : "Trajectoire stable"} — priorite : ${topAction.title.toLowerCase()}, impact estime +${topAction.expectedImpact} EUR/mois.`
    : `${trend === "up" ? "Croissance positive" : "Trajectoire stable"} — aucune action prioritaire en attente.`;

  return {
    revenueToday,
    revenuePotential,
    revenueFromActions,
    trend,
    topActions: actions.slice(0, 5),
    summary,
    strategy,
  };
}
