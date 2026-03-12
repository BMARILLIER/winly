// ---------------------------------------------------------------------------
// Winly Score Engine — 5 piliers, score global pondéré sur 100
// ---------------------------------------------------------------------------

export interface ScorePillar {
  id: string;
  label: string;
  weight: number; // 0-1, all weights sum to 1
  description: string;
  questions: ScoreQuestion[];
}

export interface ScoreQuestion {
  id: string;
  text: string;
  options: { value: string; label: string; points: number }[];
}

export interface PillarResult {
  pillarId: string;
  label: string;
  score: number; // 0-100
  weight: number;
  advice: string;
}

export interface ScoreReport {
  globalScore: number;
  pillars: PillarResult[];
  createdAt: string;
}

// ---- Options réutilisées dans les questions ----
const LEVEL_3 = [
  { value: "weak", label: "Pas vraiment", points: 0 },
  { value: "ok", label: "Un peu", points: 50 },
  { value: "strong", label: "Oui, clairement", points: 100 },
];

const FREQ_OPTIONS = [
  { value: "never", label: "Rarement ou jamais", points: 0 },
  { value: "sometimes", label: "Parfois", points: 33 },
  { value: "often", label: "Souvent", points: 66 },
  { value: "always", label: "Toujours", points: 100 },
];

// ---- Piliers ----
export const SCORE_PILLARS: ScorePillar[] = [
  {
    id: "profile",
    label: "Profil",
    weight: 0.2,
    description: "Votre profil est-il optimisé et clair ?",
    questions: [
      { id: "p_bio", text: "Votre bio est-elle claire et percutante ?", options: LEVEL_3 },
      { id: "p_positioning", text: "Votre profil communique-t-il un positionnement unique ?", options: LEVEL_3 },
      { id: "p_visual", text: "Votre branding visuel est-il cohérent (couleurs, style, ton) ?", options: LEVEL_3 },
      { id: "p_link", text: "Avez-vous un lien fonctionnel dans votre bio ?", options: LEVEL_3 },
    ],
  },
  {
    id: "content",
    label: "Contenu",
    weight: 0.25,
    description: "Quelle est la qualité du contenu que vous créez ?",
    questions: [
      { id: "c_value", text: "Votre contenu apporte-t-il une valeur claire (éduquer, inspirer, divertir) ?", options: LEVEL_3 },
      { id: "c_variety", text: "Utilisez-vous différents formats (carrousel, vidéo, texte, stories) ?", options: LEVEL_3 },
      { id: "c_hooks", text: "Vos publications commencent-elles par une accroche forte ?", options: FREQ_OPTIONS },
      { id: "c_niche", text: "Votre contenu reste-t-il en lien avec votre niche ?", options: LEVEL_3 },
    ],
  },
  {
    id: "consistency",
    label: "Régularité",
    weight: 0.2,
    description: "Votre rythme de publication est-il régulier et prévisible ?",
    questions: [
      { id: "s_frequency", text: "Publiez-vous au moins une fois par semaine ?", options: LEVEL_3 },
      { id: "s_schedule", text: "Suivez-vous un calendrier de publication régulier ?", options: LEVEL_3 },
      { id: "s_batching", text: "Planifiez-vous ou préparez-vous votre contenu à l'avance ?", options: FREQ_OPTIONS },
      { id: "s_gaps", text: "Évitez-vous les longues pauses sans publier ?", options: LEVEL_3 },
    ],
  },
  {
    id: "engagement",
    label: "Engagement",
    weight: 0.2,
    description: "Comment interagissez-vous avec votre communauté ?",
    questions: [
      { id: "e_replies", text: "Répondez-vous aux commentaires et messages privés ?", options: FREQ_OPTIONS },
      { id: "e_interactive", text: "Créez-vous du contenu interactif (sondages, questions, Q&A) ?", options: FREQ_OPTIONS },
      { id: "e_community", text: "Interagissez-vous avec d'autres créateurs de votre niche ?", options: FREQ_OPTIONS },
      { id: "e_conversations", text: "Votre contenu génère-t-il des conversations ?", options: LEVEL_3 },
    ],
  },
  {
    id: "conversion",
    label: "Conversion",
    weight: 0.15,
    description: "Transformez-vous efficacement l'attention en action ?",
    questions: [
      { id: "v_cta", text: "Vos publications incluent-elles un call to action clair ?", options: FREQ_OPTIONS },
      { id: "v_funnel", text: "Avez-vous un moyen de capturer des leads (liste email, lien en bio, landing page) ?", options: LEVEL_3 },
      { id: "v_offers", text: "Promouvez-vous régulièrement des offres ou produits ?", options: FREQ_OPTIONS },
      { id: "v_tracking", text: "Suivez-vous les clics, inscriptions ou ventes provenant de votre contenu ?", options: LEVEL_3 },
    ],
  },
];

// ---- Conseils par pilier ----
const PILLAR_ADVICE: Record<string, { low: string; mid: string; high: string }> = {
  profile: {
    low: "Votre profil a besoin d'attention. Commencez par réécrire votre bio avec une proposition de valeur claire et ajoutez un lien.",
    mid: "Votre profil est correct mais pourrait être plus percutant. Affinez votre positionnement et assurez la cohérence visuelle.",
    high: "Profil solide ! Gardez-le à jour et testez de petits ajustements pour optimiser davantage.",
  },
  content: {
    low: "Concentrez-vous sur la création de contenu à valeur ajoutée, spécifique à votre niche. Commencez par un format avec lequel vous êtes à l'aise.",
    mid: "Votre contenu est sur la bonne voie. Expérimentez avec les accroches et essayez de nouveaux formats pour vous démarquer.",
    high: "Excellente stratégie de contenu. Continuez à itérer et doublez la mise sur ce qui fonctionne le mieux.",
  },
  consistency: {
    low: "La régularité est votre plus grand levier en ce moment. Choisissez 2-3 jours par semaine et tenez-vous-y.",
    mid: "Vous publiez régulièrement mais pourriez être plus prévisible. Préparez du contenu par lots pour rester en avance.",
    high: "Super régularité ! Vous avez construit un bon rythme. Envisagez d'augmenter la fréquence si cela a du sens.",
  },
  engagement: {
    low: "Commencez à interagir davantage. Répondez à chaque commentaire et passez 15 minutes par jour à interagir avec les autres.",
    mid: "Bonnes habitudes d'engagement. Ajoutez plus de formats interactifs (sondages, Q&A) pour booster les conversations.",
    high: "Vous construisez une vraie communauté. Continuez à être présent et à approfondir ces connexions.",
  },
  conversion: {
    low: "Vous laissez de la valeur sur la table. Ajoutez des CTA à vos publications et mettez en place une capture de leads simple.",
    mid: "Vous convertissez une partie de l'attention. Rendez vos CTA plus clairs et commencez à suivre les résultats.",
    high: "Excellente conversion ! Optimisez votre tunnel et testez différentes offres.",
  },
};

// ---- Moteur de scoring ----
export function computeScoreReport(
  answers: Record<string, string>
): ScoreReport {
  const pillars: PillarResult[] = SCORE_PILLARS.map((pillar) => {
    let totalPoints = 0;

    for (const q of pillar.questions) {
      const answer = answers[q.id];
      const option = q.options.find((o) => o.value === answer);
      totalPoints += option?.points ?? 0;
    }

    const score = Math.round(totalPoints / pillar.questions.length);

    const adviceSet = PILLAR_ADVICE[pillar.id];
    let advice = adviceSet?.mid ?? "";
    if (score < 40) advice = adviceSet?.low ?? "";
    else if (score >= 70) advice = adviceSet?.high ?? "";

    return {
      pillarId: pillar.id,
      label: pillar.label,
      score,
      weight: pillar.weight,
      advice,
    };
  });

  const globalScore = Math.round(
    pillars.reduce((sum, p) => sum + p.score * p.weight, 0)
  );

  return {
    globalScore,
    pillars,
    createdAt: new Date().toISOString(),
  };
}
