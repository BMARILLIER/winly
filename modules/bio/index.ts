// ---------------------------------------------------------------------------
// Bio Optimizer Engine
// Analyzes a bio, scores it on 5 criteria, and generates 3 improved versions
// ---------------------------------------------------------------------------

export interface BioCriterion {
  id: string;
  label: string;
  description: string;
  weight: number;
}

export const BIO_CRITERIA: BioCriterion[] = [
  { id: "clarity", label: "Clarté", description: "La bio explique-t-elle ce que vous faites ?", weight: 0.25 },
  { id: "value", label: "Proposition de valeur", description: "Montre-t-elle ce que l'audience y gagne ?", weight: 0.25 },
  { id: "keywords", label: "Mots-clés", description: "Contient-elle des termes pertinents pour votre niche ?", weight: 0.2 },
  { id: "cta", label: "Call to action", description: "Incite-t-elle le lecteur à agir ?", weight: 0.15 },
  { id: "length", label: "Longueur", description: "Est-elle concise mais informative ?", weight: 0.15 },
];

export interface CriterionResult {
  id: string;
  label: string;
  score: number; // 0-100
  tip: string;
}

export interface BioAnalysis {
  bio: string;
  overallScore: number;
  criteria: CriterionResult[];
}

// ---- Analysis engine ----

const VALUE_SIGNALS = [
  "help", "learn", "grow", "tips", "advice", "guide", "teach",
  "share", "show", "discover", "build", "achieve", "transform",
  "improve", "boost", "master", "unlock", "free", "daily",
];

const CTA_SIGNALS = [
  "link", "click", "follow", "subscribe", "join", "dm", "message",
  "download", "sign up", "check out", "tap", "grab", "get",
  "book", "shop", "order", "contact", "visit", "read",
  "👇", "⬇️", "🔗", "📩", "💬",
];

export function analyzeBio(bio: string, niche: string): BioAnalysis {
  const lower = bio.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);
  const len = bio.length;

  // 1. Clarity — does it contain action/role words?
  const roleSignals = ["i ", "we ", "creator", "coach", "founder", "writer",
    "designer", "developer", "expert", "specialist", "helping", "building",
    "creating", "sharing", "teaching", "making", "running", "about"];
  const clarityHits = roleSignals.filter((s) => lower.includes(s)).length;
  const clarityScore = Math.min(100, Math.round((clarityHits / 3) * 100));

  // 2. Value proposition
  const valueHits = VALUE_SIGNALS.filter((s) => lower.includes(s)).length;
  const valueScore = Math.min(100, Math.round((valueHits / 2) * 100));

  // 3. Keywords — does it mention the niche?
  const nicheWords = niche.toLowerCase().split(/[\s,]+/).filter(Boolean);
  const nicheHits = nicheWords.filter((w) => lower.includes(w)).length;
  const keywordScore = nicheWords.length > 0
    ? Math.min(100, Math.round((nicheHits / nicheWords.length) * 100))
    : 50;

  // 4. CTA
  const ctaHits = CTA_SIGNALS.filter((s) => lower.includes(s)).length;
  const ctaScore = Math.min(100, Math.round((ctaHits / 1.5) * 100));

  // 5. Length — ideal 80-150 chars
  let lengthScore: number;
  if (len === 0) lengthScore = 0;
  else if (len < 30) lengthScore = 20;
  else if (len < 60) lengthScore = 50;
  else if (len <= 150) lengthScore = 100;
  else if (len <= 200) lengthScore = 70;
  else lengthScore = 40;

  const criteria: CriterionResult[] = [
    {
      id: "clarity",
      label: "Clarté",
      score: clarityScore,
      tip: clarityScore >= 70
        ? "Votre bio communique clairement votre rôle."
        : "Ajoutez une phrase claire sur ce que vous faites ou qui vous aidez.",
    },
    {
      id: "value",
      label: "Proposition de valeur",
      score: valueScore,
      tip: valueScore >= 70
        ? "Bonne proposition de valeur — l'audience sait ce qu'elle y gagne."
        : "Expliquez le bénéfice : qu'est-ce que votre audience gagne à vous suivre ?",
    },
    {
      id: "keywords",
      label: "Mots-clés",
      score: keywordScore,
      tip: keywordScore >= 70
        ? "Les mots-clés de niche sont présents — excellent pour la découvrabilité."
        : `Incluez vos mots-clés de niche (${niche}) pour aider les gens à vous trouver.`,
    },
    {
      id: "cta",
      label: "Call to action",
      score: ctaScore,
      tip: ctaScore >= 70
        ? "CTA clair détecté."
        : "Ajoutez un CTA : lien, invitation à s'abonner ou à envoyer un DM.",
    },
    {
      id: "length",
      label: "Longueur",
      score: lengthScore,
      tip: lengthScore >= 70
        ? "Bonne longueur — concise et informative."
        : len < 60
          ? "Votre bio est trop courte. Visez 80-150 caractères."
          : "Votre bio est longue. Essayez de rester sous 150 caractères.",
    },
  ];

  const overallScore = Math.round(
    criteria.reduce((sum, c) => {
      const criterion = BIO_CRITERIA.find((bc) => bc.id === c.id);
      return sum + c.score * (criterion?.weight ?? 0.2);
    }, 0)
  );

  return { bio, overallScore, criteria };
}

// ---- Bio generator ----

interface BioContext {
  niche: string;
  platform: string;
  profileType: string; // personal_brand, business, anonymous
  goals: string[];
}

interface GeneratedBio {
  text: string;
  style: string;
  description: string;
}

// Templates per profile type
const TEMPLATES: Record<string, ((ctx: BioContext) => GeneratedBio)[]> = {
  personal_brand: [
    (ctx) => ({
      style: "Autorité",
      description: "Positionnez-vous comme l'expert de référence",
      text: `Expert ${capitalize(ctx.niche)}. Je vous aide à ${goalVerb(ctx.goals)} grâce à des conseils concrets et de l'expérience réelle. ${platformCta(ctx.platform)}`,
    }),
    (ctx) => ({
      style: "Authentique",
      description: "Créez un lien personnel",
      text: `Je partage mon parcours ${ctx.niche} — les victoires, les échecs et tout le reste. Suivez-moi et progressons ensemble. ${platformCta(ctx.platform)}`,
    }),
    (ctx) => ({
      style: "Valeur d'abord",
      description: "Mettez en avant ce que l'audience y gagne",
      text: `Conseils ${ctx.niche} quotidiens pour vous aider à ${goalVerb(ctx.goals)}. Sauvegardez mes posts. ${platformCta(ctx.platform)}`,
    }),
  ],
  business: [
    (ctx) => ({
      style: "Professionnel",
      description: "Clair et orienté business",
      text: `Nous vous aidons à ${goalVerb(ctx.goals)} avec des solutions ${ctx.niche}. Suivez-nous pour des insights et actualités. ${platformCta(ctx.platform)}`,
    }),
    (ctx) => ({
      style: "Orienté résultats",
      description: "Focalisez-vous sur les résultats",
      text: `Stratégies ${capitalize(ctx.niche)} qui livrent des résultats. Conseils, études de cas et méthodes éprouvées. ${platformCta(ctx.platform)}`,
    }),
    (ctx) => ({
      style: "Communauté",
      description: "Construisez la confiance par la communauté",
      text: `Votre ressource de référence pour ${ctx.niche}. Rejoignez notre communauté et commencez à ${goalVerb(ctx.goals)}. ${platformCta(ctx.platform)}`,
    }),
  ],
  anonymous: [
    (ctx) => ({
      style: "Mystérieux",
      description: "Laissez le contenu parler de lui-même",
      text: `Du contenu ${capitalize(ctx.niche)} que vous voudrez sauvegarder. Pas de blabla, juste de la valeur. ${platformCta(ctx.platform)}`,
    }),
    (ctx) => ({
      style: "Autorité de niche",
      description: "Soyez l'expert anonyme",
      text: `Les meilleurs insights ${ctx.niche}, sélectionnés pour vous. Suivez pour des conseils quotidiens et ${goalVerb(ctx.goals)}. ${platformCta(ctx.platform)}`,
    }),
    (ctx) => ({
      style: "Minimaliste",
      description: "Court, percutant, zéro ego",
      text: `${capitalize(ctx.niche)}. Conseils. Résultats. ${platformCta(ctx.platform)}`,
    }),
  ],
};

export function generateBios(ctx: BioContext): GeneratedBio[] {
  const generators = TEMPLATES[ctx.profileType] ?? TEMPLATES.personal_brand;
  return generators.map((gen) => gen(ctx));
}

// ---- Helpers ----

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function goalVerb(goals: string[]): string {
  const map: Record<string, string> = {
    grow_audience: "développer votre audience",
    monetize: "monétiser vos compétences",
    brand_awareness: "construire votre marque",
    engagement: "booster l'engagement",
    consistency: "rester régulier",
  };
  const first = goals.find((g) => map[g]);
  return first ? map[first]! : "passer au niveau supérieur";
}

function platformCta(platform: string): string {
  const ctas: Record<string, string> = {
    instagram: "👇 Lien en bio",
    tiktok: "Suivez pour plus",
    twitter: "Suivez + activez 🔔",
    linkedin: "Connectons-nous 👇",
    youtube: "Abonnez-vous pour plus",
  };
  return ctas[platform] ?? "👇 Lien ci-dessous";
}
