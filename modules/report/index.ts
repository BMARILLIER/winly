// Creator Growth Report — pure computation, no external dependencies
//
// Aggregates data from growth-engine, opportunity-detector, and market-intelligence
// into a shareable report card.

import type { GrowthEngineReport, GrowthFactor } from "@/modules/growth-engine";
import type { Opportunity } from "@/modules/opportunity-detector";
import type { NichePostingWindows } from "@/modules/market-intelligence";

export interface GrowthReportInput {
  username: string;
  platform: string;
  niche: string;
  growthReport: GrowthEngineReport;
  opportunities: Opportunity[];
  postingWindows: NichePostingWindows | null;
  viralProbability: number; // 0-100 from simulator or mock
}

export interface GrowthReportData {
  username: string;
  platform: string;
  niche: string;
  date: string;
  growthScore: number;
  growthGrade: string;
  growthLabel: "High" | "Medium" | "Low";
  topStrength: { label: string; score: number };
  biggestOpportunity: { title: string; action: string; urgency: string };
  bestPostingTime: string;
  viralPotential: number;
  summaryText: string;
}

export function computeGrowthReport(input: GrowthReportInput): GrowthReportData {
  const { username, platform, niche, growthReport, opportunities, postingWindows, viralProbability } = input;

  // Top strength = highest-scoring growth factor
  const topFactor = [...growthReport.factors].sort((a, b) => b.score - a.score)[0] as GrowthFactor;

  // Biggest opportunity = highest-score opportunity
  const topOpp = [...opportunities].sort((a, b) => b.score - a.score)[0];
  const biggestOpportunity = topOpp
    ? { title: topOpp.title, action: topOpp.action, urgency: topOpp.urgency }
    : { title: "Continuez à publier régulièrement", action: "Maintenez votre calendrier actuel", urgency: "medium" as const };

  // Best posting time from market data
  const bestPostingTime = postingWindows?.bestWindow
    ? `${postingWindows.bestWindow.day} ${formatHour(postingWindows.bestWindow.hourStart)}-${formatHour(postingWindows.bestWindow.hourEnd)}`
    : "Mar & Jeu 9-11h";

  const date = new Date().toLocaleDateString("fr-FR", { month: "short", day: "numeric", year: "numeric" });

  const summaryText = [
    `Rapport Growth de ${username}`,
    `Score Growth : ${growthReport.score}/100 (${growthReport.grade})`,
    `Point fort : ${topFactor.label} (${topFactor.score}/100)`,
    `Plus grande opportunité : ${biggestOpportunity.title}`,
    `Meilleur moment pour publier : ${bestPostingTime}`,
    `Potentiel viral : ${viralProbability}/100`,
    ``,
    `Généré avec Winly — winly.app`,
  ].join("\n");

  return {
    username,
    platform,
    niche,
    date,
    growthScore: growthReport.score,
    growthGrade: growthReport.grade,
    growthLabel: growthReport.label,
    topStrength: { label: topFactor.label, score: topFactor.score },
    biggestOpportunity,
    bestPostingTime,
    viralPotential: viralProbability,
    summaryText,
  };
}

function formatHour(h: number): string {
  if (h === 0) return "12 AM";
  if (h === 12) return "12 PM";
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}
