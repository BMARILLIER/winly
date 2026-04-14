/**
 * Star Engine — evaluates chatteurs performance and ranks them.
 *
 * Computes a composite score (0-100) from revenue, conversion rate,
 * and messaging efficiency. Assigns rank and status labels to each
 * chatter for quick performance overview.
 */

// --- Types ---

export interface ChatterInput {
  id: string;
  name: string;
  revenue: number;        // total revenue generated
  conversion: number;     // 0-1, conversion rate
  messagesSent: number;
}

export interface ChatterScore {
  id: string;
  name: string;
  score: number;          // 0-100
  rank: "top" | "mid" | "low";
  status: "star" | "normal" | "weak";
  revenue: number;
  conversion: number;
  messagesSent: number;
  efficiency: number;     // revenue per message
}

// --- Helpers ---

function computeEfficiency(revenue: number, messagesSent: number): number {
  if (messagesSent <= 0) return 0;
  return revenue / messagesSent;
}

function getRank(score: number): ChatterScore["rank"] {
  if (score >= 70) return "top";
  if (score >= 40) return "mid";
  return "low";
}

function getStatus(score: number): ChatterScore["status"] {
  if (score >= 75) return "star";
  if (score >= 40) return "normal";
  return "weak";
}

// --- Scoring ---

export function scoreChatter(
  input: ChatterInput,
  maxRevenue: number,
  maxEfficiency: number
): ChatterScore {
  const efficiency = computeEfficiency(input.revenue, input.messagesSent);

  // Revenue component: 50% weight, normalized against group max
  const revenueScore = maxRevenue > 0
    ? (input.revenue / maxRevenue) * 100
    : 0;

  // Conversion component: 30% weight, scale 0-1 → 0-100
  const conversionScore = input.conversion * 100;

  // Efficiency component: 20% weight, normalized against group max
  const efficiencyScore = maxEfficiency > 0
    ? (efficiency / maxEfficiency) * 100
    : 0;

  const score = Math.round(
    revenueScore * 0.5 +
    conversionScore * 0.3 +
    efficiencyScore * 0.2
  );

  const clampedScore = Math.min(100, Math.max(0, score));

  return {
    id: input.id,
    name: input.name,
    score: clampedScore,
    rank: getRank(clampedScore),
    status: getStatus(clampedScore),
    revenue: input.revenue,
    conversion: input.conversion,
    messagesSent: input.messagesSent,
    efficiency: Math.round(efficiency * 100) / 100,
  };
}

// --- Batch ranking ---

export function rankChatters(inputs: ChatterInput[]): ChatterScore[] {
  if (inputs.length === 0) return [];

  const maxRevenue = Math.max(...inputs.map((c) => c.revenue));
  const maxEfficiency = Math.max(
    ...inputs.map((c) => computeEfficiency(c.revenue, c.messagesSent))
  );

  return inputs
    .map((input) => scoreChatter(input, maxRevenue, maxEfficiency))
    .sort((a, b) => b.score - a.score);
}

// --- Top performers ---

export function getTopPerformers(
  inputs: ChatterInput[],
  limit: number = 3
): ChatterScore[] {
  return rankChatters(inputs).slice(0, limit);
}
