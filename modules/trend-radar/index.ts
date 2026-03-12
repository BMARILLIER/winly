/**
 * Trend Radar Engine
 *
 * Analyzes trends from local datasets: hashtags, topics, formats, content duration.
 * Computes a trendMomentumScore for each detected trend.
 * Architecture extensible for future API connection (disabled for now).
 *
 * Data sources:
 *   - User's content ideas (workspace)
 *   - Simulated niche-specific trend datasets
 *   - Platform-specific format trends
 */

// --- Types ---

export interface TrendResult {
  topic: string;
  trendScore: number;
  momentum: number; // -100 to +100 (declining to rising)
  suggestedContent: string[];
  category: TrendCategory;
  hashtags: string[];
  format: string;
}

export type TrendCategory = "hashtag" | "topic" | "format" | "duration";

export interface TrendRadarInput {
  niche: string;
  platform: string;
  existingTitles: string[];
  existingFormats: string[];
  postFrequency: string;
}

// --- Simulated trend datasets (per niche) ---

type TrendSeed = {
  topic: string;
  hashtags: string[];
  baseMomentum: number;
  formats: string[];
  suggestions: string[];
};

const NICHE_TRENDS: Record<string, TrendSeed[]> = {
  fitness: [
    { topic: "Routines matinales", hashtags: ["#morningroutine", "#5amclub", "#discipline"], baseMomentum: 72, formats: ["reel", "carousel"], suggestions: ["Filmez votre vraie routine matinale", "5 habitudes qui ont changé mon corps", "Routine matinale : débutant vs avancé"] },
    { topic: "Surcharge progressive", hashtags: ["#progressiveoverload", "#gains", "#gymtok"], baseMomentum: 65, formats: ["carousel", "thread"], suggestions: ["La surcharge progressive expliquée simplement", "Suivez vos charges : pourquoi c'est important", "3 erreurs qui tuent vos gains"] },
    { topic: "Meal prep", hashtags: ["#mealprep", "#eatclean", "#macros"], baseMomentum: 58, formats: ["carousel", "reel"], suggestions: ["Meal prep de la semaine en 2 heures", "Idées meal prep riches en protéines", "Meal prep budget à moins de 50 €"] },
    { topic: "Entraînements maison", hashtags: ["#homeworkout", "#nogymnoproblem", "#bodyweight"], baseMomentum: 45, formats: ["reel", "single_image"], suggestions: ["Entraînement full body sans équipement", "HIIT maison de 15 minutes", "Exercices adaptés aux appartements"] },
    { topic: "Récupération et mobilité", hashtags: ["#recovery", "#mobility", "#stretching"], baseMomentum: 80, formats: ["reel", "carousel"], suggestions: ["5 étirements que vous oubliez", "Routine jour de récupération", "Pourquoi la mobilité compte plus que la musculation"] },
  ],
  tech: [
    { topic: "Outils IA et productivité", hashtags: ["#aitools", "#productivity", "#chatgpt"], baseMomentum: 90, formats: ["carousel", "thread"], suggestions: ["5 outils IA que j'utilise au quotidien", "Comment j'ai automatisé mon workflow", "IA vs manuel : comparaison du temps"] },
    { topic: "Création no-code", hashtags: ["#nocode", "#buildinpublic", "#saas"], baseMomentum: 70, formats: ["thread", "carousel"], suggestions: ["J'ai créé une app sans code", "Comparatif de stacks no-code", "De l'idée au lancement : guide no-code"] },
    { topic: "Setup dev", hashtags: ["#devsetup", "#coding", "#terminal"], baseMomentum: 55, formats: ["reel", "carousel"], suggestions: ["Tour de mon setup dev 2024", "Extensions VS Code indispensables", "Configuration terminal pour la productivité"] },
    { topic: "Open source", hashtags: ["#opensource", "#github", "#devlife"], baseMomentum: 48, formats: ["thread", "text"], suggestions: ["Comment contribuer à l'open source", "Meilleurs projets open source pour apprendre", "Mon histoire de première PR"] },
    { topic: "Conception système", hashtags: ["#systemdesign", "#architecture", "#backend"], baseMomentum: 62, formats: ["carousel", "thread"], suggestions: ["Les bases du system design expliquées", "Comment Netflix gère l'échelle", "Choix de base de données : SQL vs NoSQL"] },
  ],
  food: [
    { topic: "Recettes rapides", hashtags: ["#quickrecipe", "#15minmeals", "#easyrecipes"], baseMomentum: 75, formats: ["reel", "carousel"], suggestions: ["Idées dîner à 3 ingrédients", "5 repas en moins de 15 minutes", "Recettes en une poêle pour les jours chargés"] },
    { topic: "Street food", hashtags: ["#streetfood", "#foodporn", "#foodie"], baseMomentum: 82, formats: ["reel", "single_image"], suggestions: ["Street food à absolument goûter", "Je note les spots de street food", "Reproduire la street food à la maison"] },
    { topic: "Pain au levain", hashtags: ["#sourdough", "#breadmaking", "#baking"], baseMomentum: 40, formats: ["carousel", "reel"], suggestions: ["Guide du levain pour débutants", "Erreurs courantes avec le levain", "Mon parcours avec le levain"] },
    { topic: "Photographie culinaire", hashtags: ["#foodphotography", "#foodstyling", "#flatlay"], baseMomentum: 55, formats: ["carousel", "single_image"], suggestions: ["Conseils photo culinaire pour débutants", "Setup lumière pour photos de plats", "Accessoires qui subliment les photos culinaires"] },
    { topic: "Fermentation", hashtags: ["#fermentation", "#guthealth", "#kimchi"], baseMomentum: 68, formats: ["carousel", "thread"], suggestions: ["Guide de fermentation pour débutants", "5 aliments fermentés à essayer", "Pourquoi la fermentation est tendance"] },
  ],
  business: [
    { topic: "Personal branding", hashtags: ["#personalbrand", "#branding", "#visibility"], baseMomentum: 78, formats: ["carousel", "thread"], suggestions: ["Pourquoi le personal branding compte maintenant", "5 étapes pour construire votre marque", "Erreurs de personal branding à éviter"] },
    { topic: "Culture du travail à distance", hashtags: ["#remotework", "#wfh", "#futureofwork"], baseMomentum: 52, formats: ["text", "carousel"], suggestions: ["Conseils productivité en télétravail", "Construire une culture à distance", "Télétravail vs hybride : mon avis"] },
    { topic: "Économie des créateurs", hashtags: ["#creatoreconomy", "#contentcreator", "#monetize"], baseMomentum: 85, formats: ["thread", "carousel"], suggestions: ["Comment les créateurs gagnent de l'argent en 2024", "Stack d'outils pour créateurs", "Du hobby au business"] },
    { topic: "Construction de communauté", hashtags: ["#community", "#engagement", "#growth"], baseMomentum: 70, formats: ["carousel", "text"], suggestions: ["Comment construire une communauté fidèle", "Communauté vs audience", "Stratégies d'engagement qui fonctionnent"] },
    { topic: "Micro-SaaS", hashtags: ["#microsaas", "#indiehacker", "#startup"], baseMomentum: 65, formats: ["thread", "carousel"], suggestions: ["Qu'est-ce qu'un micro-SaaS ?", "Construire un SaaS en solo", "Jalons de revenus de mon micro-SaaS"] },
  ],
};

// Fallback trends for unknown niches
const UNIVERSAL_TRENDS: TrendSeed[] = [
  { topic: "Dans les coulisses", hashtags: ["#bts", "#behindthescenes", "#dayinmylife"], baseMomentum: 70, formats: ["reel", "story"], suggestions: ["Une journée dans ma vie", "Les coulisses de mon processus", "À quoi ressemble vraiment mon travail"] },
  { topic: "Storytelling", hashtags: ["#storytelling", "#storytime", "#myjourney"], baseMomentum: 75, formats: ["carousel", "thread"], suggestions: ["Mon plus gros échec", "Comment j'ai commencé", "3 leçons apprises à la dure"] },
  { topic: "Listes", hashtags: ["#tips", "#howto", "#didyouknow"], baseMomentum: 65, formats: ["carousel", "thread"], suggestions: ["5 choses que j'aurais aimé savoir plus tôt", "Top 3 outils dont je ne peux pas me passer", "7 erreurs que font les débutants"] },
  { topic: "Contenu authentique", hashtags: ["#authentic", "#real", "#nofilter"], baseMomentum: 80, formats: ["text", "reel"], suggestions: ["Ce que personne ne vous dit sur ma niche", "Mon avis honnête sur les tendances", "Ce que je pense vraiment de ça"] },
  { topic: "Éducatif format court", hashtags: ["#learnontiktok", "#educate", "#explained"], baseMomentum: 72, formats: ["reel", "carousel"], suggestions: ["Expliquer un concept en 60 secondes", "Tutoriel rapide sur une compétence clé", "Mythe vs réalité dans mon domaine"] },
];

// Platform-specific format boosts
const PLATFORM_FORMAT_BOOST: Record<string, Record<string, number>> = {
  instagram: { reel: 15, carousel: 10, single_image: 0, story: 5 },
  tiktok: { reel: 20, story: 5, text: -10 },
  twitter: { thread: 15, text: 10, carousel: 5 },
  linkedin: { carousel: 15, text: 10, thread: 10 },
  youtube: { reel: 10, carousel: -5, text: -10 },
};

// --- Momentum calculation ---

/**
 * Compute momentum with variance based on topic + date seed.
 * Returns value between -100 and +100.
 */
function computeMomentum(baseMomentum: number, topic: string): number {
  // Deterministic variation based on topic hash + current week
  const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  let hash = 0;
  for (let i = 0; i < topic.length; i++) {
    hash = (hash * 31 + topic.charCodeAt(i)) & 0x7fffffff;
  }
  const variation = ((hash + week) % 41) - 20; // -20 to +20
  return Math.max(-100, Math.min(100, baseMomentum + variation));
}

/**
 * Compute trend score (0-100) from momentum + platform fit + user relevance.
 */
function computeTrendScore(
  momentum: number,
  formats: string[],
  platform: string,
  existingFormats: string[]
): number {
  // Base from momentum (normalize -100..100 to 0..60)
  let score = Math.round(((momentum + 100) / 200) * 60);

  // Platform format boost
  const boosts = PLATFORM_FORMAT_BOOST[platform] ?? {};
  const bestBoost = Math.max(0, ...formats.map((f) => boosts[f] ?? 0));
  score += bestBoost;

  // User already creates this format = relevance boost
  const overlap = formats.filter((f) => existingFormats.includes(f));
  if (overlap.length > 0) score += 5;

  return Math.max(0, Math.min(100, score));
}

// --- Detect trend category from primary signal ---

function detectCategory(seed: TrendSeed): TrendCategory {
  if (seed.hashtags.length >= 3) return "hashtag";
  if (seed.formats.includes("reel") || seed.formats.includes("story"))
    return "format";
  return "topic";
}

// --- Main engine ---

export function analyzeTrends(input: TrendRadarInput): TrendResult[] {
  const nicheTrends = NICHE_TRENDS[input.niche] ?? [];
  const allSeeds = [...nicheTrends, ...UNIVERSAL_TRENDS];

  // Deduplicate seeds that match existing content
  const lowerTitles = input.existingTitles.map((t) => t.toLowerCase());

  const results: TrendResult[] = allSeeds.map((seed) => {
    const momentum = computeMomentum(seed.baseMomentum, seed.topic);
    const trendScore = computeTrendScore(
      momentum,
      seed.formats,
      input.platform,
      input.existingFormats
    );

    // Filter out suggestions that overlap with existing content
    const suggestedContent = seed.suggestions.filter(
      (s) => !lowerTitles.some((t) => t.includes(s.toLowerCase().slice(0, 15)))
    );

    return {
      topic: seed.topic,
      trendScore,
      momentum,
      suggestedContent,
      category: detectCategory(seed),
      hashtags: seed.hashtags,
      format: seed.formats[0],
    };
  });

  // Sort by trendScore descending
  results.sort((a, b) => b.trendScore - a.trendScore);

  return results;
}

// --- Category labels for UI ---

export const TREND_CATEGORIES: Record<
  TrendCategory,
  { label: string; color: string }
> = {
  hashtag: { label: "Hashtag", color: "bg-blue-100 text-blue-700" },
  topic: { label: "Sujet", color: "bg-violet-100 text-violet-700" },
  format: { label: "Format", color: "bg-amber-100 text-amber-700" },
  duration: { label: "Durée", color: "bg-green-100 text-green-700" },
};
