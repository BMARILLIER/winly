/**
 * Live Relationship Chat Engine
 *
 * Analyse en temps réel des conversations avec détection :
 * - Intérêt (scoring 0-100)
 * - Émotions (positif, négatif, neutre, enthousiaste)
 * - Opportunités (collab, sponsoring, vente, partenariat)
 * - Suggestions d'action (relancer, poser question, closer)
 *
 * Règles simples, pas d'IA lourde.
 */

// --- Types ---

export interface ChatAnalysis {
  interestScore: number; // 0-100
  emotion: "positive" | "negative" | "neutral" | "enthusiastic";
  opportunities: Opportunity[];
  suggestions: Suggestion[];
}

export interface Opportunity {
  type: "collab" | "sponsoring" | "sale" | "partnership" | "content";
  label: string;
  confidence: "low" | "medium" | "high";
}

export interface Suggestion {
  id: string;
  action: "ask_question" | "follow_up" | "close" | "share_portfolio" | "propose_collab" | "send_rates";
  text: string;
  priority: "low" | "medium" | "high";
}

// --- Keyword dictionaries ---

const INTEREST_KEYWORDS = {
  high: ["combien", "tarif", "prix", "dispo", "available", "budget", "interested", "intéressé", "deal", "offre", "proposal", "proposition", "travailler ensemble", "work together", "collaboration", "partenariat", "partnership", "let's go", "on fait ça", "banco", "ok pour moi", "je prends", "on signe"],
  medium: ["j'adore", "love", "super", "génial", "amazing", "cool", "nice", "bien", "intéressant", "curious", "curieux", "tell me more", "dis-moi plus", "pourquoi pas", "why not", "peut-être", "maybe", "éventuellement"],
  low: ["ok", "merci", "thanks", "d'accord", "noted", "je vois", "ah", "hmm"],
};

const EMOTION_KEYWORDS = {
  enthusiastic: ["🔥", "❤️", "😍", "🎉", "💯", "amazing", "incroyable", "love", "j'adore", "trop bien", "génial", "awesome", "perfect", "parfait", "excellent", "!!!"],
  positive: ["merci", "thanks", "super", "cool", "nice", "bien", "ok", "great", "bon", "👍", "😊", "🙏", "oui", "yes", "avec plaisir"],
  negative: ["non", "no", "pas intéressé", "not interested", "trop cher", "too expensive", "désolé", "sorry", "impossible", "can't", "ne peux pas", "arrête", "stop", "😤", "😡", "👎"],
};

const OPPORTUNITY_PATTERNS: { pattern: RegExp; type: Opportunity["type"]; label: string }[] = [
  { pattern: /collab|collaboration|ensemble|together/i, type: "collab", label: "Collaboration potentielle" },
  { pattern: /sponsor|sponsoring|partenariat\s+payé|paid\s+partnership/i, type: "sponsoring", label: "Sponsoring potentiel" },
  { pattern: /achet|buy|commander|order|prix|price|tarif|rate/i, type: "sale", label: "Intention d'achat" },
  { pattern: /partenariat|partnership|ambassador|ambassad/i, type: "partnership", label: "Partenariat long terme" },
  { pattern: /contenu|content|post|story|reel|vidéo|video/i, type: "content", label: "Opportunité contenu" },
];

// --- Analysis engine ---

export function analyzeMessages(messages: { sender: string; content: string }[]): ChatAnalysis {
  const contactMessages = messages.filter((m) => m.sender !== "me");
  const allText = contactMessages.map((m) => m.content.toLowerCase()).join(" ");
  const lastMessages = contactMessages.slice(-5);
  const lastText = lastMessages.map((m) => m.content.toLowerCase()).join(" ");

  // 1. Interest scoring
  const interestScore = computeInterestScore(lastText, messages);

  // 2. Emotion detection
  const emotion = detectEmotion(lastText);

  // 3. Opportunity detection
  const opportunities = detectOpportunities(allText);

  // 4. Suggestions
  const suggestions = generateSuggestions(interestScore, emotion, opportunities, messages);

  return { interestScore, emotion, opportunities, suggestions };
}

function computeInterestScore(text: string, messages: { sender: string; content: string }[]): number {
  let score = 30; // baseline

  // High-interest keywords
  for (const kw of INTEREST_KEYWORDS.high) {
    if (text.includes(kw.toLowerCase())) score += 15;
  }

  // Medium-interest keywords
  for (const kw of INTEREST_KEYWORDS.medium) {
    if (text.includes(kw.toLowerCase())) score += 7;
  }

  // Response speed signal: if they respond a lot, they're interested
  const contactMsgCount = messages.filter((m) => m.sender !== "me").length;
  const myMsgCount = messages.filter((m) => m.sender === "me").length;
  if (contactMsgCount > myMsgCount) score += 10; // they write more than us
  if (contactMsgCount > 5) score += 5;

  // Question marks = engagement
  const questionCount = (text.match(/\?/g) || []).length;
  score += questionCount * 5;

  // Long messages = more interest
  const avgLength = text.length / Math.max(1, text.split(" ").length);
  if (avgLength > 4) score += 5;

  // Negative signals
  for (const kw of EMOTION_KEYWORDS.negative) {
    if (text.includes(kw.toLowerCase())) score -= 15;
  }

  return Math.max(0, Math.min(100, score));
}

function detectEmotion(text: string): ChatAnalysis["emotion"] {
  let scores = { enthusiastic: 0, positive: 0, negative: 0, neutral: 0 };

  for (const kw of EMOTION_KEYWORDS.enthusiastic) {
    if (text.includes(kw.toLowerCase())) scores.enthusiastic += 3;
  }
  for (const kw of EMOTION_KEYWORDS.positive) {
    if (text.includes(kw.toLowerCase())) scores.positive += 2;
  }
  for (const kw of EMOTION_KEYWORDS.negative) {
    if (text.includes(kw.toLowerCase())) scores.negative += 2;
  }

  if (scores.enthusiastic > scores.positive && scores.enthusiastic > scores.negative) return "enthusiastic";
  if (scores.negative > scores.positive) return "negative";
  if (scores.positive > 0) return "positive";
  return "neutral";
}

function detectOpportunities(text: string): Opportunity[] {
  const found: Opportunity[] = [];

  for (const p of OPPORTUNITY_PATTERNS) {
    if (p.pattern.test(text)) {
      const matchCount = (text.match(p.pattern) || []).length;
      found.push({
        type: p.type,
        label: p.label,
        confidence: matchCount >= 3 ? "high" : matchCount >= 2 ? "medium" : "low",
      });
    }
  }

  return found;
}

function generateSuggestions(
  interest: number,
  emotion: ChatAnalysis["emotion"],
  opportunities: Opportunity[],
  messages: { sender: string; content: string }[]
): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const lastSender = messages[messages.length - 1]?.sender;
  const hasOpportunity = opportunities.length > 0;

  // If last message is from contact and interest is high → close
  if (lastSender !== "me" && interest >= 70) {
    suggestions.push({
      id: "close",
      action: "close",
      text: "Le contact semble très intéressé. Proposez une offre concrète ou un appel.",
      priority: "high",
    });
  }

  // If interest is medium → ask question to qualify
  if (interest >= 40 && interest < 70) {
    suggestions.push({
      id: "qualify",
      action: "ask_question",
      text: "Posez une question pour mieux comprendre ses besoins et qualifier l'opportunité.",
      priority: "medium",
    });
  }

  // If sponsoring opportunity detected → send rates
  if (opportunities.some((o) => o.type === "sponsoring" || o.type === "sale")) {
    suggestions.push({
      id: "rates",
      action: "send_rates",
      text: "Partagez vos tarifs ou votre media kit pour avancer la discussion.",
      priority: "high",
    });
  }

  // If collab opportunity → propose
  if (opportunities.some((o) => o.type === "collab")) {
    suggestions.push({
      id: "collab",
      action: "propose_collab",
      text: "Proposez une idée de collaboration concrète avec un format et un calendrier.",
      priority: "medium",
    });
  }

  // If emotion is enthusiastic → share portfolio
  if (emotion === "enthusiastic" && !hasOpportunity) {
    suggestions.push({
      id: "portfolio",
      action: "share_portfolio",
      text: "Profitez de l'enthousiasme pour partager votre portfolio ou vos meilleurs contenus.",
      priority: "low",
    });
  }

  // If last message is ours and no response → follow up
  if (lastSender === "me" && messages.length > 2) {
    suggestions.push({
      id: "followup",
      action: "follow_up",
      text: "Pas de réponse récente. Envoyez un message de relance bienveillant.",
      priority: "low",
    });
  }

  // If no suggestions yet → default
  if (suggestions.length === 0) {
    suggestions.push({
      id: "engage",
      action: "ask_question",
      text: "Posez une question ouverte pour mieux connaître votre interlocuteur.",
      priority: "low",
    });
  }

  return suggestions.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });
}

// --- Score label ---

export function getInterestLabel(score: number): { label: string; color: "success" | "warning" | "danger" | "info" } {
  if (score >= 70) return { label: "Très intéressé", color: "success" };
  if (score >= 40) return { label: "Intéressé", color: "info" };
  if (score >= 20) return { label: "Tiède", color: "warning" };
  return { label: "Froid", color: "danger" };
}

// --- Emotion label ---

export function getEmotionLabel(emotion: ChatAnalysis["emotion"]): { label: string; emoji: string } {
  switch (emotion) {
    case "enthusiastic": return { label: "Enthousiaste", emoji: "🔥" };
    case "positive": return { label: "Positif", emoji: "😊" };
    case "negative": return { label: "Négatif", emoji: "😐" };
    case "neutral": return { label: "Neutre", emoji: "💬" };
  }
}
