// Growth Engine — pure computation, no external dependencies

export interface GrowthEngineInput {
  engagementRate: number;       // actual engagement rate (e.g. 0.045 = 4.5%)
  benchmarkEngagement: number;  // industry benchmark (e.g. 0.03 = 3%)
  postsLast30d: number;
  targetPostsPerMonth: number;
  maxGapDays: number;           // longest gap between posts in last 30d
  reachCurrent30d: number;
  reachPrevious30d: number;
  topFormatUsageShare: number;  // 0-1 share of posts using top format
  formatCount: number;          // number of distinct formats used
  peakHourPostRatio: number;    // 0-1 ratio of posts in peak hours
  saves: number;
  shares: number;
  comments: number;
  likes: number;
}

export interface GrowthFactor {
  id: string;
  label: string;
  weight: number;
  score: number;       // 0-100
  feedback: string;
}

export interface GrowthRecommendation {
  id: string;
  targetFactor: string;
  title: string;
  why: string;
  trigger: string;
  impact: "high" | "medium" | "low";
}

export interface GrowthEngineReport {
  score: number;       // 0-100
  grade: string;
  label: "High" | "Medium" | "Low";
  factors: GrowthFactor[];
  recommendations: GrowthRecommendation[];
}

// --- Scoring functions ---

function scoreEngagement(actual: number, benchmark: number): { score: number; feedback: string } {
  const ratio = benchmark > 0 ? actual / benchmark : 0;
  const score = Math.round(Math.min(100, Math.max(0, ((ratio - 0.5) / 1.0) * 100)));
  const feedback =
    ratio >= 1.2
      ? "Votre taux d'engagement est bien au-dessus du benchmark. Excellente connexion avec l'audience."
      : ratio >= 0.8
        ? "L'engagement est proche du benchmark. De petites améliorations peuvent faire la différence."
        : "L'engagement est en dessous du benchmark. Travaillez vos accroches et CTA.";
  return { score, feedback };
}

function scoreConsistency(posts: number, target: number, maxGap: number): { score: number; feedback: string } {
  const ratio = target > 0 ? Math.min(1, posts / target) : 0;
  const gapPenalty = maxGap > 7 ? Math.min(30, (maxGap - 7) * 3) : 0;
  const score = Math.round(Math.max(0, ratio * 100 - gapPenalty));
  const feedback =
    score >= 70
      ? "Bonne régularité. Votre audience sait quand attendre du contenu."
      : score >= 40
        ? "Des interruptions de publication détectées. Essayez de préparer du contenu en lot pour rester régulier."
        : "La régularité est un point faible majeur. Adoptez une routine de planification.";
  return { score, feedback };
}

function scoreReachTrend(current: number, previous: number): { score: number; feedback: string } {
  if (previous === 0) return { score: 50, feedback: "Pas assez d'historique pour évaluer les tendances de portée." };
  const ratio = current / previous;
  let score: number;
  let feedback: string;
  if (ratio >= 1.5) {
    score = Math.min(100, 85 + Math.round((ratio - 1.5) * 30));
    feedback = "La portée est en forte hausse. Capitalisez sur cet élan.";
  } else if (ratio >= 1.05) {
    score = 60 + Math.round(((ratio - 1.05) / 0.45) * 25);
    feedback = "La portée progresse régulièrement. Continuez à expérimenter avec les formats.";
  } else if (ratio >= 0.95) {
    score = 40 + Math.round(((ratio - 0.95) / 0.1) * 20);
    feedback = "La portée stagne. Essayez de nouveaux angles de contenu pour percer.";
  } else {
    score = 10 + Math.round(Math.max(0, (ratio - 0.5) / 0.45) * 20);
    feedback = "La portée est en déclin. Revoyez votre stratégie de contenu.";
  }
  return { score: Math.min(100, Math.max(0, score)), feedback };
}

function scoreFormatEfficiency(topFormatShare: number, formatCount: number): { score: number; feedback: string } {
  const baseScore = topFormatShare * 80;
  const diversityBonus = Math.min(20, formatCount * 5);
  const score = Math.round(Math.min(100, baseScore + diversityBonus));
  const feedback =
    score >= 70
      ? "Excellente stratégie de formats. Votre format principal performe bien et vous diversifiez."
      : score >= 40
        ? "Envisagez de miser davantage sur votre format le plus performant."
        : "Expérimentez différents formats de contenu pour trouver ce qui résonne.";
  return { score, feedback };
}

function scorePostingTime(peakRatio: number): { score: number; feedback: string } {
  const score = Math.round(Math.min(100, peakRatio * 120));
  const feedback =
    score >= 70
      ? "Vous publiez aux heures de pointe. Votre timing est optimisé."
      : score >= 40
        ? "Certaines publications manquent les créneaux de pointe. Planifiez davantage pendant les heures de forte activité."
        : "La plupart des publications manquent les heures de pointe. Identifiez les horaires de connexion de votre audience.";
  return { score, feedback };
}

function scoreAudienceResponse(saves: number, shares: number, comments: number, likes: number): { score: number; feedback: string } {
  const total = saves + shares + comments + likes;
  if (total === 0) return { score: 0, feedback: "Aucune donnée d'interaction avec l'audience disponible." };
  const weighted = saves * 0.4 + shares * 0.3 + comments * 0.2 + likes * 0.1;
  const maxPossible = total * 0.4; // max if all were saves
  const score = Math.round(Math.min(100, (weighted / maxPossible) * 100));
  const feedback =
    score >= 70
      ? "Fort engagement en profondeur — les sauvegardes et partages sont élevés."
      : score >= 40
        ? "Réponse correcte, mais les sauvegardes et partages pourraient être plus forts."
        : "L'interaction de l'audience reste superficielle. Créez du contenu qui incite à sauvegarder.";
  return { score, feedback };
}

// --- Grade + Label ---

function getGrade(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}

function getLabel(score: number): "High" | "Medium" | "Low" {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

// --- Recommendations ---

function generateRecommendations(factors: GrowthFactor[]): GrowthRecommendation[] {
  const sorted = [...factors].sort((a, b) => a.score - b.score);
  const weakest = sorted.slice(0, 3);

  const templates: Record<string, { title: string; why: string; trigger: string }> = {
    engagement_rate: {
      title: "Boostez votre taux d'engagement",
      why: "Votre engagement est en dessous du benchmark, ce qui signifie que votre contenu ne génère pas assez d'interactions.",
      trigger: "Ajoutez un CTA clair à chaque publication et utilisez des accroches dès la première ligne.",
    },
    consistency: {
      title: "Comblez vos interruptions de publication",
      why: "Une publication irrégulière entraîne des pénalités algorithmiques et une perte d'audience.",
      trigger: "Préparez une semaine de contenu chaque dimanche et planifiez à l'avance.",
    },
    reach_trend: {
      title: "Inversez le déclin de votre portée",
      why: "Une portée en baisse limite votre potentiel de croissance, peu importe la qualité de votre contenu.",
      trigger: "Testez 3 nouveaux angles de contenu cette semaine et suivez lequel obtient le plus de distribution.",
    },
    format_efficiency: {
      title: "Optimisez vos formats de contenu",
      why: "Vous n'exploitez pas pleinement votre format le plus performant.",
      trigger: "Doublez votre production dans votre meilleur format et mesurez l'engagement par format.",
    },
    posting_time: {
      title: "Corrigez votre calendrier de publication",
      why: "Vous publiez en dehors des heures de pointe, perdant les signaux d'engagement initiaux.",
      trigger: "Consultez vos statistiques pour identifier les créneaux de forte activité et replanifiez vos publications.",
    },
    audience_response: {
      title: "Créez du contenu qui incite à sauvegarder",
      why: "Votre audience interagit en surface (likes) mais ne sauvegarde ni ne partage.",
      trigger: "Ajoutez de la valeur éducative ou des conseils actionnables que les gens voudront revisiter.",
    },
  };

  return weakest.map((f) => {
    const t = templates[f.id] ?? {
      title: `Améliorez ${f.label}`,
      why: `Votre score de ${f.label.toLowerCase()} est de ${f.score}/100.`,
      trigger: "Passez en revue vos performances récentes et expérimentez des améliorations.",
    };
    return {
      id: `rec_${f.id}`,
      targetFactor: f.id,
      title: t.title,
      why: t.why,
      trigger: t.trigger,
      impact: f.score < 30 ? "high" : f.score < 60 ? "medium" : "low",
    };
  });
}

// --- Main export ---

export function computeGrowthEngine(input: GrowthEngineInput): GrowthEngineReport {
  const eng = scoreEngagement(input.engagementRate, input.benchmarkEngagement);
  const con = scoreConsistency(input.postsLast30d, input.targetPostsPerMonth, input.maxGapDays);
  const rch = scoreReachTrend(input.reachCurrent30d, input.reachPrevious30d);
  const fmt = scoreFormatEfficiency(input.topFormatUsageShare, input.formatCount);
  const tim = scorePostingTime(input.peakHourPostRatio);
  const aud = scoreAudienceResponse(input.saves, input.shares, input.comments, input.likes);

  const factors: GrowthFactor[] = [
    { id: "engagement_rate", label: "Taux d'engagement", weight: 0.25, score: eng.score, feedback: eng.feedback },
    { id: "consistency", label: "Régularité", weight: 0.20, score: con.score, feedback: con.feedback },
    { id: "reach_trend", label: "Tendance de portée", weight: 0.20, score: rch.score, feedback: rch.feedback },
    { id: "format_efficiency", label: "Efficacité des formats", weight: 0.15, score: fmt.score, feedback: fmt.feedback },
    { id: "posting_time", label: "Timing de publication", weight: 0.10, score: tim.score, feedback: tim.feedback },
    { id: "audience_response", label: "Réponse de l'audience", weight: 0.10, score: aud.score, feedback: aud.feedback },
  ];

  const score = Math.round(factors.reduce((sum, f) => sum + f.score * f.weight, 0));
  const grade = getGrade(score);
  const label = getLabel(score);
  const recommendations = generateRecommendations(factors);

  return { score, grade, label, factors, recommendations };
}
