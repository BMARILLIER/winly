// ---------------------------------------------------------------------------
// Daily Growth Plan Module
// Generates 3 simple daily actions based on workspace profile and day of week
// ---------------------------------------------------------------------------

export interface DailyAction {
  id: string;
  title: string;
  description: string;
  category: "publish" | "engage" | "optimize";
  priority: 1 | 2 | 3;
}

export interface DailyGrowthPlan {
  date: string;
  dayLabel: string;
  actions: DailyAction[];
  focusTip: string;
}

const PUBLISH_ACTIONS: Omit<DailyAction, "id" | "priority">[] = [
  { title: "Publier un Reel", description: "Filmez une vidéo courte de 15-30s sur un sujet tendance de votre niche.", category: "publish" },
  { title: "Publier un carrousel", description: "Créez un carrousel éducatif en 5-7 slides sur un conseil actionnable.", category: "publish" },
  { title: "Poster une story interactive", description: "Utilisez un sondage ou une question pour engager votre audience.", category: "publish" },
  { title: "Publier un post texte", description: "Partagez une leçon, un avis tranché ou un retour d'expérience.", category: "publish" },
  { title: "Publier un thread", description: "Développez un sujet en 5-8 parties avec un hook fort en ouverture.", category: "publish" },
  { title: "Repurposer un ancien contenu", description: "Transformez votre meilleur post récent dans un nouveau format.", category: "publish" },
  { title: "Poster un behind-the-scenes", description: "Montrez les coulisses de votre activité pour humaniser votre marque.", category: "publish" },
];

const ENGAGE_ACTIONS: Omit<DailyAction, "id" | "priority">[] = [
  { title: "Répondre aux commentaires", description: "Répondez à tous les commentaires reçus dans les dernières 24h.", category: "engage" },
  { title: "Commenter 10 posts de votre niche", description: "Laissez des commentaires utiles et sincères, pas de spam.", category: "engage" },
  { title: "Envoyer 3 DMs", description: "Envoyez un message personnalisé à 3 créateurs ou abonnés engagés.", category: "engage" },
  { title: "Rejoindre une conversation", description: "Trouvez un sujet tendance et ajoutez votre perspective unique.", category: "engage" },
  { title: "Poser une question à votre audience", description: "Utilisez les stories ou un post pour sonder votre communauté.", category: "engage" },
  { title: "Partager le contenu d'un pair", description: "Repostez un contenu pertinent avec votre propre commentaire.", category: "engage" },
];

const OPTIMIZE_ACTIONS: Omit<DailyAction, "id" | "priority">[] = [
  { title: "Analyser vos stats", description: "Identifiez votre post le plus performant cette semaine et comprenez pourquoi.", category: "optimize" },
  { title: "Optimiser votre bio", description: "Revoyez votre bio pour qu'elle communique clairement votre valeur.", category: "optimize" },
  { title: "Planifier 3 contenus", description: "Préparez les sujets, hooks et formats de vos 3 prochains posts.", category: "optimize" },
  { title: "Tester un nouvel horaire", description: "Publiez à une heure différente et comparez les résultats.", category: "optimize" },
  { title: "Écrire 3 hooks", description: "Rédigez 3 accroches pour votre prochain contenu et gardez la meilleure.", category: "optimize" },
  { title: "Revoir votre stratégie de hashtags", description: "Vérifiez que vos hashtags sont ciblés et pertinents pour votre niche.", category: "optimize" },
];

const FOCUS_TIPS = [
  "Concentrez-vous sur la qualité du hook — c'est ce qui arrête le scroll.",
  "Publiez aux heures de pointe de votre audience pour maximiser la distribution.",
  "Chaque interaction authentique renforce votre communauté.",
  "La régularité bat la perfection — un bon contenu publié vaut mieux qu'un parfait jamais posté.",
  "Analysez ce qui fonctionne avant de créer du nouveau contenu.",
  "Votre CTA est aussi important que votre hook — dites quoi faire ensuite.",
  "Testez un nouveau format cette semaine pour diversifier votre portée.",
];

function hashDate(date: string): number {
  let h = 0;
  for (let i = 0; i < date.length; i++) {
    h = ((h << 5) - h + date.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function getDailyGrowthPlan(date: string): DailyGrowthPlan {
  const seed = hashDate(date);
  const d = new Date(date + "T12:00:00");
  const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const dayLabel = dayNames[d.getDay()];

  // Pick 1 from each category
  const publishIdx = seed % PUBLISH_ACTIONS.length;
  const engageIdx = (seed + 3571) % ENGAGE_ACTIONS.length;
  const optimizeIdx = (seed + 7919) % OPTIMIZE_ACTIONS.length;

  const actions: DailyAction[] = [
    { ...PUBLISH_ACTIONS[publishIdx], id: `dgp_pub_${date}`, priority: 1 },
    { ...ENGAGE_ACTIONS[engageIdx], id: `dgp_eng_${date}`, priority: 2 },
    { ...OPTIMIZE_ACTIONS[optimizeIdx], id: `dgp_opt_${date}`, priority: 3 },
  ];

  const focusTip = FOCUS_TIPS[seed % FOCUS_TIPS.length];

  return { date, dayLabel, actions, focusTip };
}

export const CATEGORY_STYLES: Record<DailyAction["category"], { label: string; color: string }> = {
  publish: { label: "Publier", color: "bg-violet-100 text-violet-700" },
  engage: { label: "Engager", color: "bg-blue-100 text-blue-700" },
  optimize: { label: "Optimiser", color: "bg-amber-100 text-amber-700" },
};
