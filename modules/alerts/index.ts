/**
 * Alerts Engine — lightweight signal detection.
 *
 * Detects engagement drops, growth spikes, and opportunity
 * signals from creator data. Designed to drive daily return.
 */

// --- Types ---

export interface AlertInput {
  followers: number;
  engagementRate: number; // 0-1
  previousEngagementRate: number | null; // 0-1
  weeklyGrowth: number;
  monthlyGrowth: number;
  postsLast30d: number;
  avgLikes: number;
  avgComments: number;
  accountReach: number | null;
  hasInstagram: boolean;
}

export type AlertType = "danger" | "warning" | "success" | "info";

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  timestamp: string; // ISO
}

// --- Detection rules ---

export function detectAlerts(input: AlertInput): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date().toISOString();

  // 1. Engagement drop
  if (
    input.previousEngagementRate != null &&
    input.previousEngagementRate > 0 &&
    input.engagementRate > 0
  ) {
    const change =
      ((input.engagementRate - input.previousEngagementRate) /
        input.previousEngagementRate) *
      100;

    if (change <= -20) {
      alerts.push({
        id: "engagement-drop",
        type: "danger",
        title: "Chute d'engagement",
        description: `Votre engagement a baisse de ${Math.abs(Math.round(change))}%. Verifiez vos derniers posts.`,
        timestamp: now,
      });
    } else if (change <= -10) {
      alerts.push({
        id: "engagement-decline",
        type: "warning",
        title: "Engagement en baisse",
        description: `Baisse de ${Math.abs(Math.round(change))}% detectee. Variez vos formats et testez de nouvelles accroches.`,
        timestamp: now,
      });
    } else if (change >= 20) {
      alerts.push({
        id: "engagement-spike",
        type: "success",
        title: "Engagement en hausse",
        description: `+${Math.round(change)}% d'engagement. Continuez avec le meme type de contenu !`,
        timestamp: now,
      });
    }
  }

  // 2. Follower growth spike
  if (input.weeklyGrowth > 0 && input.followers > 0) {
    const weeklyGrowthRate = (input.weeklyGrowth / input.followers) * 100;
    if (weeklyGrowthRate >= 3) {
      alerts.push({
        id: "growth-spike",
        type: "success",
        title: "Pic de croissance",
        description: `+${input.weeklyGrowth} followers cette semaine (+${weeklyGrowthRate.toFixed(1)}%). Profitez de cet elan.`,
        timestamp: now,
      });
    }
  }

  // 3. Follower loss
  if (input.weeklyGrowth < 0) {
    alerts.push({
      id: "follower-loss",
      type: "warning",
      title: "Perte de followers",
      description: `${input.weeklyGrowth} followers cette semaine. Verifiez la qualite et la frequence de vos posts.`,
      timestamp: now,
    });
  }

  // 4. Inactivity warning
  if (input.postsLast30d < 4) {
    alerts.push({
      id: "inactivity",
      type: "warning",
      title: "Activite faible",
      description: `Seulement ${input.postsLast30d} post${input.postsLast30d !== 1 ? "s" : ""} en 30 jours. L'algorithme penalise l'inactivite.`,
      timestamp: now,
    });
  }

  // 5. Monetization opportunity
  if (input.engagementRate >= 0.05 && input.followers >= 5000) {
    alerts.push({
      id: "monetization-ready",
      type: "info",
      title: "Pret a monetiser",
      description: "Votre engagement et audience sont suffisants pour des partenariats brand. Explorez vos options.",
      timestamp: now,
    });
  }

  // 6. High reach signal
  if (input.accountReach != null && input.followers > 0) {
    const reachRatio = input.accountReach / input.followers;
    if (reachRatio >= 2) {
      alerts.push({
        id: "viral-reach",
        type: "success",
        title: "Portee virale",
        description: `Votre portee depasse 2x votre audience. L'algorithme pousse votre contenu — postez maintenant !`,
        timestamp: now,
      });
    }
  }

  return alerts;
}

// --- Fallback alerts ---

export function getDefaultAlerts(): Alert[] {
  return [
    {
      id: "welcome",
      type: "info",
      title: "Bienvenue sur Winly",
      description: "Connectez Instagram pour recevoir des alertes personnalisees sur votre compte.",
      timestamp: new Date().toISOString(),
    },
  ];
}
