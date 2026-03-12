// ---------------------------------------------------------------------------
// Viral Score Module — standalone scoring
// Calculates a viral probability score /100 for a content idea
// Based on: format, duration, hook quality, timing, historical engagement
// ---------------------------------------------------------------------------

export interface ViralScoreInput {
  format: string;
  duration: "short" | "medium" | "long"; // <30s, 30-60s, >60s
  hookStrength: "weak" | "medium" | "strong";
  timing: "peak" | "off-peak" | "unknown";
  engagementHistory: "low" | "average" | "high"; // past performance
  platform: string;
  niche: string;
}

export interface ViralScoreResult {
  score: number; // 0-100
  badge: "fort" | "moyen" | "faible";
  factors: ViralFactor[];
  suggestion: string;
}

export interface ViralFactor {
  id: string;
  label: string;
  score: number; // 0-100
  maxPoints: number;
  feedback: string;
}

// Format virality potential
const FORMAT_SCORES: Record<string, number> = {
  reel: 25, video: 22, carousel: 15, thread: 12, story: 8, text: 6, image: 5, live: 10,
};

// Duration impact
const DURATION_SCORES: Record<string, number> = {
  short: 20, // <30s = high retention
  medium: 15,
  long: 8,
};

// Hook strength
const HOOK_SCORES: Record<string, number> = {
  strong: 20,
  medium: 12,
  weak: 5,
};

// Timing
const TIMING_SCORES: Record<string, number> = {
  peak: 15,
  "off-peak": 5,
  unknown: 8,
};

// Historical engagement bonus
const HISTORY_SCORES: Record<string, number> = {
  high: 20,
  average: 12,
  low: 5,
};

function getBadge(score: number): "fort" | "moyen" | "faible" {
  if (score >= 70) return "fort";
  if (score >= 40) return "moyen";
  return "faible";
}

function getSuggestion(factors: ViralFactor[]): string {
  const weakest = [...factors].sort((a, b) => a.score - b.score)[0];
  const suggestions: Record<string, string> = {
    format: "Passez à un format vidéo court (Reel/Short) pour maximiser le potentiel viral.",
    duration: "Les vidéos courtes (<30s) ont un meilleur taux de rétention et de partage.",
    hook: "Un hook fort dans les 3 premières secondes est essentiel pour la viralité.",
    timing: "Publiez aux heures de pointe de votre audience pour un meilleur démarrage.",
    history: "Construisez un historique d'engagement régulier pour débloquer la distribution algorithmique.",
  };
  return suggestions[weakest?.id ?? "hook"] ?? "Optimisez votre hook et votre format pour augmenter vos chances.";
}

export function calculateViralScore(input: ViralScoreInput): ViralScoreResult {
  const factors: ViralFactor[] = [
    {
      id: "format",
      label: "Format",
      score: FORMAT_SCORES[input.format] ?? 10,
      maxPoints: 25,
      feedback: (FORMAT_SCORES[input.format] ?? 10) >= 20
        ? "Format à fort potentiel viral."
        : "Ce format a un plafond de viralité limité.",
    },
    {
      id: "duration",
      label: "Durée",
      score: DURATION_SCORES[input.duration],
      maxPoints: 20,
      feedback: input.duration === "short"
        ? "Durée optimale — les vidéos courtes sont plus partagées."
        : "Les contenus plus courts ont un meilleur potentiel viral.",
    },
    {
      id: "hook",
      label: "Hook",
      score: HOOK_SCORES[input.hookStrength],
      maxPoints: 20,
      feedback: input.hookStrength === "strong"
        ? "Hook percutant — arrête le scroll efficacement."
        : "Renforcez votre accroche pour capter l'attention immédiatement.",
    },
    {
      id: "timing",
      label: "Timing",
      score: TIMING_SCORES[input.timing],
      maxPoints: 15,
      feedback: input.timing === "peak"
        ? "Publication aux heures de pointe — engagement initial maximisé."
        : "Publiez aux heures de forte activité de votre audience.",
    },
    {
      id: "history",
      label: "Historique",
      score: HISTORY_SCORES[input.engagementHistory],
      maxPoints: 20,
      feedback: input.engagementHistory === "high"
        ? "Bon historique d'engagement — l'algorithme vous fait confiance."
        : "Un meilleur historique débloque plus de distribution.",
    },
  ];

  const score = factors.reduce((sum, f) => sum + f.score, 0);
  const badge = getBadge(score);
  const suggestion = getSuggestion(factors);

  return { score, badge, factors, suggestion };
}

export const BADGE_STYLES: Record<string, { label: string; color: string }> = {
  fort: { label: "Fort", color: "bg-success/15 text-success border-success/30" },
  moyen: { label: "Moyen", color: "bg-warning/15 text-warning border-warning/30" },
  faible: { label: "Faible", color: "bg-danger/15 text-danger border-danger/30" },
};
