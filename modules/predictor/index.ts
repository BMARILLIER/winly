// ---------------------------------------------------------------------------
// Content Predictor Module
// Analyze content, predict engagement, calculate potential score
// ---------------------------------------------------------------------------

export interface PredictionResult {
  score: number; // 0-100
  grade: "A" | "B" | "C" | "D" | "F";
  breakdown: PredictionFactor[];
  predictions: EngagementPrediction;
  tips: string[];
}

export interface PredictionFactor {
  id: string;
  label: string;
  score: number; // 0-100
  weight: number;
  feedback: string;
}

export interface EngagementPrediction {
  reachLevel: "viral" | "high" | "medium" | "low";
  saveRate: "high" | "medium" | "low";
  shareRate: "high" | "medium" | "low";
  commentRate: "high" | "medium" | "low";
  bestTimeToPost: string;
}

interface PredictorInput {
  title: string;
  hook: string;
  caption: string;
  cta: string;
  format: string;
  platform: string;
  niche: string;
  profileType: string;
}

// ---- Analysis factors ----

function analyzeHook(hook: string): PredictionFactor {
  let score = 0;
  const feedback: string[] = [];
  const lower = hook.toLowerCase();

  if (!hook.trim()) {
    return {
      id: "hook",
      label: "Qualité du Hook",
      score: 0,
      weight: 25,
      feedback: "Aucun hook fourni. Le hook est l'élément le plus critique — il décide si les gens arrêtent de scroller.",
    };
  }

  // Length check
  if (hook.length >= 10 && hook.length <= 100) {
    score += 15;
  } else if (hook.length > 100) {
    score += 8;
    feedback.push("Le hook est un peu long. Gardez-le percutant — moins de 100 caractères.");
  } else {
    score += 5;
    feedback.push("Le hook est très court. Ajoutez plus d'intrigue.");
  }

  // Commence par un chiffre
  if (/^\d/.test(hook)) {
    score += 12;
    feedback.push("Commence par un chiffre — prouvé pour augmenter les clics.");
  }

  // Contient une question
  if (hook.includes("?")) {
    score += 10;
    feedback.push("Les questions créent des boucles de curiosité.");
  }

  // Power words
  const powerWords = ["secret", "mistake", "never", "always", "stop", "truth", "hack", "free", "proven", "simple", "easy", "worst", "best", "how", "why", "nobody", "everyone", "most people"];
  const powerCount = powerWords.filter((w) => lower.includes(w)).length;
  if (powerCount >= 2) {
    score += 20;
    feedback.push("Excellente utilisation des mots puissants.");
  } else if (powerCount === 1) {
    score += 12;
    feedback.push("Bien — utilise un mot puissant.");
  } else {
    feedback.push("Ajoutez des mots puissants (ex : 'secret', 'erreur', 'prouvé') pour augmenter l'impact.");
  }

  // Curiosity gap
  const curiosityPatterns = ["here's why", "here is why", "you won't believe", "the truth about", "what nobody tells", "most people don't", "i wish i knew", "don't make this"];
  if (curiosityPatterns.some((p) => lower.includes(p))) {
    score += 15;
    feedback.push("Crée un fort écart de curiosité.");
  }

  // Déclencheur émotionnel
  const emotionWords = ["afraid", "love", "hate", "obsessed", "regret", "wish", "dream", "fail", "struggle", "changed my life"];
  if (emotionWords.some((w) => lower.includes(w))) {
    score += 10;
    feedback.push("Le langage émotionnel augmente l'engagement.");
  }

  // Spécificité
  if (/\d+/.test(hook)) {
    score += 8;
    feedback.push("Les chiffres précis ajoutent de la crédibilité.");
  }

  // Avoid weak openers
  const weakOpeners = ["hey guys", "hi everyone", "in this post", "today i want", "so basically"];
  if (weakOpeners.some((w) => lower.startsWith(w))) {
    score -= 15;
    feedback.push("Ouverture faible détectée. Commencez par de la valeur ou de l'intrigue, pas une salutation.");
  }

  return {
    id: "hook",
    label: "Qualité du Hook",
    score: Math.max(0, Math.min(100, score)),
    weight: 25,
    feedback: feedback.join(" ") || "Hook correct mais pourrait être plus percutant.",
  };
}

function analyzeCaption(caption: string, platform: string): PredictionFactor {
  let score = 0;
  const feedback: string[] = [];
  const lower = caption.toLowerCase();

  if (!caption.trim()) {
    return {
      id: "caption",
      label: "Force de la légende",
      score: 0,
      weight: 20,
      feedback: "Aucune légende fournie. Les légendes génèrent des sauvegardes, partages et commentaires.",
    };
  }

  const wordCount = caption.split(/\s+/).length;

  // Length by platform
  const idealLengths: Record<string, [number, number]> = {
    instagram: [50, 300],
    tiktok: [10, 150],
    twitter: [10, 280],
    linkedin: [50, 500],
    youtube: [50, 500],
  };
  const [min, max] = idealLengths[platform] ?? [30, 300];

  if (wordCount >= min && wordCount <= max) {
    score += 20;
    feedback.push("Bonne longueur de légende pour cette plateforme.");
  } else if (wordCount < min) {
    score += 8;
    feedback.push(`La légende est courte. Visez ${min}+ mots sur ${platform}.`);
  } else {
    score += 12;
    feedback.push("La légende est longue — risque de perte d'attention. Pensez à raccourcir.");
  }

  // Structure (sauts de ligne = lisibilité)
  const lineBreaks = (caption.match(/\n/g) || []).length;
  if (lineBreaks >= 2) {
    score += 15;
    feedback.push("Bonne utilisation des sauts de ligne pour la lisibilité.");
  } else if (wordCount > 30) {
    feedback.push("Ajoutez des sauts de ligne pour améliorer la lisibilité.");
  }

  // Emojis
  const emojiCount = (caption.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
  if (emojiCount >= 1 && emojiCount <= 8) {
    score += 10;
  } else if (emojiCount > 8) {
    score += 5;
    feedback.push("Trop d'emojis peut faire spam. Utilisez 3-5 max.");
  }

  // Indicateurs de valeur
  const valuePatterns = ["step 1", "step 2", "tip:", "here's how", "how to", "learn", "guide", "tutorial", "template", "checklist"];
  if (valuePatterns.some((p) => lower.includes(p))) {
    score += 15;
    feedback.push("Fournit une valeur claire — génère des sauvegardes.");
  }

  // Storytelling
  const storyPatterns = ["i remember", "last year", "when i started", "i used to", "one day", "months ago", "years ago", "my first"];
  if (storyPatterns.some((p) => lower.includes(p))) {
    score += 12;
    feedback.push("Éléments de storytelling détectés — excellent pour la connexion.");
  }

  // Hashtags
  const hashtagCount = (caption.match(/#\w+/g) || []).length;
  if (platform === "instagram" || platform === "tiktok") {
    if (hashtagCount >= 3 && hashtagCount <= 8) {
      score += 10;
    } else if (hashtagCount > 8) {
      score += 4;
      feedback.push("Trop de hashtags. Utilisez 3-5 ciblés.");
    } else if (hashtagCount === 0) {
      feedback.push("Ajoutez 3-5 hashtags pertinents pour la découvrabilité.");
    }
  }

  return {
    id: "caption",
    label: "Force de la légende",
    score: Math.max(0, Math.min(100, score)),
    weight: 20,
    feedback: feedback.join(" ") || "La légende est fonctionnelle mais pourrait être améliorée.",
  };
}

function analyzeCTA(cta: string): PredictionFactor {
  let score = 0;
  const feedback: string[] = [];
  const lower = cta.toLowerCase();

  if (!cta.trim()) {
    return {
      id: "cta",
      label: "Call to Action",
      score: 10,
      weight: 15,
      feedback: "Pas de CTA. Dites toujours à votre audience quoi faire ensuite : sauvegarder, partager, commenter ou cliquer sur le lien.",
    };
  }

  // Exists
  score += 20;

  // Action verbs
  const actionVerbs = ["save", "share", "comment", "follow", "click", "tap", "dm", "subscribe", "download", "grab", "join", "sign up", "try", "watch", "read", "check out", "link in bio"];
  const verbCount = actionVerbs.filter((v) => lower.includes(v)).length;
  if (verbCount >= 2) {
    score += 25;
    feedback.push("CTA multi-actions fort.");
  } else if (verbCount === 1) {
    score += 18;
    feedback.push("CTA unique et clair.");
  } else {
    score += 5;
    feedback.push("Ajoutez un verbe d'action spécifique (sauvegarder, partager, commenter, s'abonner).");
  }

  // Urgence
  const urgencyWords = ["now", "today", "don't miss", "limited", "before it's gone", "last chance"];
  if (urgencyWords.some((w) => lower.includes(w))) {
    score += 15;
    feedback.push("Les mots d'urgence augmentent la conversion.");
  }

  // Invitation à répondre
  if (lower.includes("?") || lower.includes("comment") || lower.includes("tell me") || lower.includes("what do you think")) {
    score += 15;
    feedback.push("Invite à répondre — booste les commentaires.");
  }

  // Preuve sociale
  if (lower.includes("join") || lower.includes("already") || lower.includes("community") || lower.includes("others")) {
    score += 10;
    feedback.push("La preuve sociale dans le CTA augmente la confiance.");
  }

  return {
    id: "cta",
    label: "Call to Action",
    score: Math.max(0, Math.min(100, score)),
    weight: 15,
    feedback: feedback.join(" ") || "CTA présent mais pourrait être plus convaincant.",
  };
}

function analyzeFormat(format: string, platform: string): PredictionFactor {
  const feedback: string[] = [];

  // Format-platform fit scores
  const fitScores: Record<string, Record<string, number>> = {
    reel: { instagram: 95, tiktok: 95, youtube: 85, linkedin: 60, twitter: 50 },
    carousel: { instagram: 90, linkedin: 85, tiktok: 50, twitter: 40, youtube: 30 },
    text: { twitter: 90, linkedin: 85, instagram: 50, tiktok: 30, youtube: 30 },
    thread: { twitter: 95, linkedin: 80, instagram: 40, tiktok: 30, youtube: 20 },
    video: { youtube: 95, tiktok: 90, instagram: 80, linkedin: 70, twitter: 60 },
    story: { instagram: 85, tiktok: 60, youtube: 50, linkedin: 40, twitter: 30 },
    image: { instagram: 70, twitter: 65, linkedin: 65, tiktok: 40, youtube: 30 },
  };

  const platformScores = fitScores[format];
  let score = platformScores?.[platform] ?? 50;

  if (score >= 80) {
    feedback.push(`${format} est un format très performant sur ${platform}.`);
  } else if (score >= 60) {
    feedback.push(`${format} fonctionne sur ${platform} mais n'est pas le format le plus fort.`);
  } else {
    feedback.push(`${format} sous-performe sur ${platform}. Envisagez de changer pour un meilleur format.`);
  }

  // Bonus format à forte portée
  const highReach = ["reel", "carousel", "thread"];
  if (highReach.includes(format)) {
    score = Math.min(100, score + 5);
    feedback.push("Ce format bénéficie d'un boost algorithmique pour la portée.");
  }

  return {
    id: "format",
    label: "Adéquation du format",
    score: Math.max(0, Math.min(100, score)),
    weight: 15,
    feedback: feedback.join(" "),
  };
}

function analyzeTitle(title: string): PredictionFactor {
  let score = 0;
  const feedback: string[] = [];
  const lower = title.toLowerCase();

  if (!title.trim()) {
    return {
      id: "title",
      label: "Impact du titre",
      score: 0,
      weight: 15,
      feedback: "Pas de titre. Un titre fort cadre le contenu et génère des clics.",
    };
  }

  // Length
  if (title.length >= 10 && title.length <= 70) {
    score += 20;
    feedback.push("Bonne longueur de titre.");
  } else if (title.length > 70) {
    score += 10;
    feedback.push("Le titre est long — gardez-le sous 70 caractères pour un meilleur affichage.");
  } else {
    score += 8;
    feedback.push("Le titre est très court. Soyez plus descriptif.");
  }

  // Clarté
  const clarityWords = ["how", "why", "what", "guide", "tips", "ways", "steps", "mistakes", "secrets", "lessons"];
  if (clarityWords.some((w) => lower.includes(w))) {
    score += 20;
    feedback.push("Cadrage éducatif clair.");
  }

  // Chiffres
  if (/\d+/.test(title)) {
    score += 15;
    feedback.push("Les chiffres dans les titres augmentent le taux de clic.");
  }

  // Mots émotionnels
  const emotions = ["ultimate", "essential", "powerful", "brutal", "honest", "real", "shocking", "simple", "fast", "insane"];
  if (emotions.some((w) => lower.includes(w))) {
    score += 15;
    feedback.push("Le modificateur émotionnel ajoute de l'impact.");
  }

  // Specificity
  if (title.split(/\s+/).length >= 4) {
    score += 10;
  }

  // Uniqueness — avoid generic titles
  const generic = ["my post", "new content", "update", "check this out", "untitled"];
  if (generic.some((g) => lower.includes(g))) {
    score -= 10;
    feedback.push("Le titre est trop générique. Soyez précis sur la valeur.");
  }

  return {
    id: "title",
    label: "Impact du titre",
    score: Math.max(0, Math.min(100, score)),
    weight: 15,
    feedback: feedback.join(" ") || "Le titre est correct mais pourrait être plus convaincant.",
  };
}

function analyzeProfileFit(profileType: string, format: string, caption: string): PredictionFactor {
  let score = 60;
  const feedback: string[] = [];

  if (profileType === "anonymous") {
    const facelessFormats = ["carousel", "text", "thread", "image"];
    if (facelessFormats.includes(format)) {
      score += 25;
      feedback.push("Excellent choix de format pour un compte sans visage.");
    } else if (format === "reel" || format === "video") {
      score += 10;
      feedback.push("La vidéo peut fonctionner sans visage avec voix off, enregistrement d'écran ou b-roll.");
    }

    // Check if caption avoids personal references
    const personalRefs = ["my face", "watch me", "look at me", "selfie"];
    if (!personalRefs.some((r) => caption.toLowerCase().includes(r))) {
      score += 10;
    }
  } else {
    // Personal brand or business
    score += 15;
    if (format === "reel" || format === "video") {
      score += 10;
      feedback.push("La vidéo avec votre visage crée une connexion personnelle plus forte.");
    }
  }

  return {
    id: "profile_fit",
    label: "Adéquation au profil",
    score: Math.max(0, Math.min(100, score)),
    weight: 10,
    feedback: feedback.join(" ") || "Le contenu est aligné avec votre type de profil.",
  };
}

// ---- Engagement prediction ----

function predictEngagement(totalScore: number, format: string, platform: string): EngagementPrediction {
  let reachLevel: EngagementPrediction["reachLevel"] = "low";
  if (totalScore >= 85) reachLevel = "viral";
  else if (totalScore >= 70) reachLevel = "high";
  else if (totalScore >= 50) reachLevel = "medium";

  const highSaveFormats = ["carousel", "thread", "image"];
  const saveRate: EngagementPrediction["saveRate"] =
    totalScore >= 70 && highSaveFormats.includes(format) ? "high" :
    totalScore >= 50 ? "medium" : "low";

  const highShareFormats = ["reel", "carousel", "thread"];
  const shareRate: EngagementPrediction["shareRate"] =
    totalScore >= 75 && highShareFormats.includes(format) ? "high" :
    totalScore >= 50 ? "medium" : "low";

  const commentRate: EngagementPrediction["commentRate"] =
    totalScore >= 70 ? "high" : totalScore >= 45 ? "medium" : "low";

  const bestTimes: Record<string, string> = {
    instagram: "7-9h ou 19-21h",
    tiktok: "7-9h ou 19-23h",
    twitter: "8-10h ou 12-13h",
    linkedin: "7-8h ou 12h",
    youtube: "14-16h ou 18-21h",
  };

  return {
    reachLevel,
    saveRate,
    shareRate,
    commentRate,
    bestTimeToPost: bestTimes[platform] ?? "Matin ou soir",
  };
}

// ---- Tips generator ----

function generateTips(factors: PredictionFactor[], input: PredictorInput): string[] {
  const tips: string[] = [];
  const sorted = [...factors].sort((a, b) => a.score - b.score);

  // Tips from weakest factors
  for (const factor of sorted.slice(0, 2)) {
    if (factor.score < 50) {
      switch (factor.id) {
        case "hook":
          tips.push("Réécrivez votre hook en utilisant un écart de curiosité ou une affirmation forte. Test : est-ce que VOUS arrêteriez de scroller ?");
          break;
        case "caption":
          tips.push("Ajoutez plus de valeur à votre légende : incluez des étapes, des conseils ou une histoire personnelle.");
          break;
        case "cta":
          tips.push("Ajoutez un CTA clair : dites aux gens de sauvegarder, partager, commenter ou cliquer sur votre lien.");
          break;
        case "format":
          tips.push(`Envisagez d'utiliser un format différent qui performe mieux sur ${input.platform}.`);
          break;
        case "title":
          tips.push("Rendez votre titre plus spécifique. Utilisez des chiffres et des mots émotionnels.");
          break;
        case "profile_fit":
          tips.push("Ajustez le format de votre contenu pour mieux correspondre à votre type de profil.");
          break;
      }
    }
  }

  // General tips based on content
  if (!input.hook && !input.caption) {
    tips.push("Ajoutez à la fois un hook et une légende pour obtenir une prédiction précise.");
  }

  if (input.format === "text" && input.platform === "instagram") {
    tips.push("Les posts texte seul sous-performent sur Instagram. Envisagez un carrousel ou un Reel à la place.");
  }

  if (input.format === "reel" && !input.hook) {
    tips.push("Les Reels se jouent dans les 3 premières secondes. Écrivez un hook convaincant.");
  }

  // Cap at 4 tips
  return tips.slice(0, 4);
}

// ---- Grade ----

function getGrade(score: number): PredictionResult["grade"] {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 50) return "C";
  if (score >= 30) return "D";
  return "F";
}

// ---- Main function ----

export function predictContent(input: PredictorInput): PredictionResult {
  const factors: PredictionFactor[] = [
    analyzeHook(input.hook),
    analyzeCaption(input.caption, input.platform),
    analyzeCTA(input.cta),
    analyzeFormat(input.format, input.platform),
    analyzeTitle(input.title),
    analyzeProfileFit(input.profileType, input.format, input.caption),
  ];

  // Weighted average
  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
  const weightedScore = factors.reduce((sum, f) => sum + f.score * f.weight, 0);
  const score = Math.round(weightedScore / totalWeight);

  const predictions = predictEngagement(score, input.format, input.platform);
  const tips = generateTips(factors, input);

  return {
    score,
    grade: getGrade(score),
    breakdown: factors,
    predictions,
    tips,
  };
}

// ---- Constants ----

export const PREDICTION_FORMATS = [
  { id: "reel", label: "Reel / Short" },
  { id: "carousel", label: "Carrousel" },
  { id: "text", label: "Post texte" },
  { id: "thread", label: "Thread" },
  { id: "video", label: "Vidéo" },
  { id: "story", label: "Story" },
  { id: "image", label: "Image" },
];

export const REACH_STYLES: Record<string, { label: string; color: string }> = {
  viral: { label: "Potentiel viral", color: "text-red-600" },
  high: { label: "Portée élevée", color: "text-green-600" },
  medium: { label: "Portée moyenne", color: "text-amber-600" },
  low: { label: "Portée faible", color: "text-gray-500" },
};

export const RATE_STYLES: Record<string, { label: string; color: string }> = {
  high: { label: "Élevé", color: "text-green-600" },
  medium: { label: "Moyen", color: "text-amber-600" },
  low: { label: "Faible", color: "text-gray-500" },
};
