// Opportunity Detector — pure computation, no external dependencies

export type OpportunityCategory =
  | "viral_opportunity"
  | "trend_match"
  | "best_time_window"
  | "undervalued_content"
  | "consistency_gap"
  | "audience_surge"
  | "format_opportunity";

export interface Opportunity {
  id: string;
  category: OpportunityCategory;
  title: string;
  score: number;        // 0-100
  urgency: "high" | "medium" | "low";
  explanation: string;
  action: string;
  expectedImpact: string;
  isEvergreen: boolean;
}

export interface OpportunityInput {
  // Viral
  engagementMomentum: number;   // ratio current / previous period engagement
  topicFitScore: number;        // 0-1 how well recent topics match high-performing ones
  // Trend
  trendAlignmentScore: number;  // 0-1 content theme vs rising niche trends
  trendVolume: number;          // relative search/hashtag volume 0-100
  trendName?: string;           // e.g. "Économie des créateurs"
  // Best time
  peakWindowClarity: number;    // 0-1 how clear the peak window is
  peakHourLabel: string;        // e.g. "Tue & Thu 9-11 AM"
  // Undervalued
  savesSharesAvg: number;       // avg saves+shares per post
  reachAvg: number;             // avg reach per post
  // Consistency
  currentPostFreq: number;      // posts per week now
  bestPostFreq: number;         // posts per week during best period
  // Audience surge
  followerGrowthRate: number;   // current period growth rate (e.g. 0.08 = 8%)
  baselineGrowthRate: number;   // average growth rate
  // Format
  bestFormatEngagement: number; // engagement rate of best format
  bestFormatUsage: number;      // 0-1 usage share of best format
  bestFormatName: string;       // e.g. "Carousels"
}

// --- Detection functions ---

function detectViral(momentum: number, topicFit: number): Omit<Opportunity, "id"> {
  const score = Math.round(Math.min(100, (momentum * 50 + topicFit * 50)));
  return {
    category: "viral_opportunity",
    title: "Potentiel viral détecté",
    score,
    urgency: getUrgency(score),
    explanation: `Votre élan d'engagement récent est de ${momentum.toFixed(1)}x avec un fort alignement thématique (${Math.round(topicFit * 100)}%). Cette combinaison précède historiquement les publications virales.`,
    action: "Misez sur votre angle de contenu actuel. Publiez 2 à 3 variations cette semaine tant que l'élan est fort.",
    expectedImpact: "Augmentation de la portée de 2 à 5x sur la prochaine publication si le timing est bon.",
    isEvergreen: false,
  };
}

function detectTrend(alignment: number, volume: number, trendName?: string): Omit<Opportunity, "id"> {
  const score = Math.round(Math.min(100, alignment * 60 + (volume / 100) * 40));
  const label = trendName ?? "une tendance montante";
  return {
    category: "trend_match",
    title: `Tendance « ${label} » alignée avec votre niche`,
    score,
    urgency: getUrgency(score),
    explanation: `Le sujet « ${label} » s'aligne à ${Math.round(alignment * 100)}% avec vos thématiques de contenu, avec un volume de recherche à ${volume}/100.`,
    action: `Créez une publication qui relie « ${label} » à votre expertise. Soyez en avance, pas en retard.`,
    expectedImpact: "30 à 60 % de portée supplémentaire en surfant sur l'élan de la tendance.",
    isEvergreen: false,
  };
}

function detectBestTime(clarity: number, label: string): Omit<Opportunity, "id"> {
  const score = Math.round(Math.min(100, clarity * 100));
  return {
    category: "best_time_window",
    title: `Meilleur créneau de publication : ${label}`,
    score,
    urgency: getUrgency(score),
    explanation: `Votre audience a un créneau d'activité de pointe clair (confiance à ${Math.round(clarity * 100)}%). Les publications durant ce créneau obtiennent significativement plus d'engagement initial.`,
    action: `Planifiez vos prochaines publications pour ${label}. Utilisez l'outil de planification de votre plateforme.`,
    expectedImpact: "15 à 25 % d'augmentation de l'engagement grâce au timing seul.",
    isEvergreen: true,
  };
}

function detectUndervalued(savesShares: number, reach: number): Omit<Opportunity, "id"> {
  const ratio = reach > 0 ? savesShares / reach : 0;
  const score = Math.round(Math.min(100, ratio * 500));
  return {
    category: "undervalued_content",
    title: "Contenu à forte valeur avec faible portée",
    score,
    urgency: getUrgency(score),
    explanation: `Certaines publications obtiennent beaucoup de sauvegardes/partages (moy. ${savesShares.toFixed(0)}) mais une faible portée (moy. ${reach.toFixed(0)}). Le contenu résonne en profondeur mais n'obtient pas de distribution.`,
    action: "Réutilisez vos publications à fort taux de sauvegarde avec de nouvelles accroches. Le contenu fonctionne — c'est l'emballage qui doit évoluer.",
    expectedImpact: "Débloquez 2 à 3x de portée sur des idées de contenu déjà éprouvées.",
    isEvergreen: true,
  };
}

function detectConsistencyGap(current: number, best: number): Omit<Opportunity, "id"> {
  const ratio = best > 0 ? current / best : 1;
  const score = Math.round(Math.min(100, Math.max(0, (1 - ratio) * 120)));
  return {
    category: "consistency_gap",
    title: "Fréquence de publication en baisse",
    score,
    urgency: getUrgency(score),
    explanation: `Vous publiez ${current.toFixed(1)}x/semaine contre ${best.toFixed(1)}x/semaine lors de votre meilleure période (${Math.round(ratio * 100)}% du pic).`,
    action: "Préparez du contenu en lot pour la semaine à venir. Même 1 publication supplémentaire par semaine s'accumule avec le temps.",
    expectedImpact: "Revenir à la fréquence de pointe récupère généralement 20 à 40 % de la portée perdue.",
    isEvergreen: true,
  };
}

function detectAudienceSurge(growth: number, baseline: number): Omit<Opportunity, "id"> {
  const acceleration = baseline > 0 ? growth / baseline : 1;
  const score = Math.round(Math.min(100, acceleration * 40));
  return {
    category: "audience_surge",
    title: "Croissance des abonnés en accélération",
    score,
    urgency: getUrgency(score),
    explanation: `La croissance actuelle des abonnés (${(growth * 100).toFixed(1)}%) est ${acceleration.toFixed(1)}x votre référence (${(baseline * 100).toFixed(1)}%). Une nouvelle audience arrive.`,
    action: "Accueillez les nouveaux abonnés avec une publication d'introduction épinglée. Augmentez la fréquence de publication pour les retenir.",
    expectedImpact: "Retenir les abonnés de cette vague peut consolider 50 à 80 % de la croissance de façon permanente.",
    isEvergreen: false,
  };
}

function detectFormatOpp(engagement: number, usage: number, name: string): Omit<Opportunity, "id"> {
  const gap = engagement * (1 - usage);
  const score = Math.round(Math.min(100, gap * 200));
  return {
    category: "format_opportunity",
    title: `${name} sont sous-utilisés`,
    score,
    urgency: getUrgency(score),
    explanation: `${name} obtiennent ${(engagement * 100).toFixed(0)}% d'engagement mais ne représentent que ${(usage * 100).toFixed(0)}% de votre contenu. Il y a un écart de format évident.`,
    action: `Augmentez les ${name.toLowerCase()} à au moins 40 % de votre mix de contenu ce mois-ci.`,
    expectedImpact: "10 à 30 % d'augmentation globale de l'engagement en ajustant la répartition des formats.",
    isEvergreen: true,
  };
}

function getUrgency(score: number): "high" | "medium" | "low" {
  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  return "low";
}

// --- Main export ---

export function detectOpportunities(input: OpportunityInput): Opportunity[] {
  const detections: Omit<Opportunity, "id">[] = [
    detectViral(input.engagementMomentum, input.topicFitScore),
    detectTrend(input.trendAlignmentScore, input.trendVolume, input.trendName),
    detectBestTime(input.peakWindowClarity, input.peakHourLabel),
    detectUndervalued(input.savesSharesAvg, input.reachAvg),
    detectConsistencyGap(input.currentPostFreq, input.bestPostFreq),
    detectAudienceSurge(input.followerGrowthRate, input.baselineGrowthRate),
    detectFormatOpp(input.bestFormatEngagement, input.bestFormatUsage, input.bestFormatName),
  ];

  return detections
    .map((d, i) => ({ ...d, id: `opp_${i + 1}_${d.category}` }))
    .sort((a, b) => b.score - a.score);
}
