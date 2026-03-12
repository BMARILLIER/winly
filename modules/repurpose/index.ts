// ---------------------------------------------------------------------------
// Content Repurposer Engine
// Transforms source content into 4 output formats
// ---------------------------------------------------------------------------

export interface OutputFormat {
  id: string;
  label: string;
  description: string;
  icon: string; // emoji placeholder
}

export const OUTPUT_FORMATS: OutputFormat[] = [
  { id: "thread", label: "Thread", description: "Fil de texte en plusieurs parties (Twitter/X, LinkedIn)", icon: "🧵" },
  { id: "carousel", label: "Carrousel", description: "Contenu diapo par diapo (Instagram, LinkedIn)", icon: "📑" },
  { id: "video_script", label: "Script vidéo", description: "Script court avec scènes (TikTok, Reels, YouTube)", icon: "🎬" },
  { id: "post", label: "Post unique", description: "Légende avec hook et CTA en un seul post", icon: "📝" },
];

export interface RepurposedContent {
  formatId: string;
  formatLabel: string;
  parts: string[]; // each part is a slide, tweet, scene, or paragraph
}

// ---- Helpers ----

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function extractKeyPoints(text: string): string[] {
  const sentences = splitSentences(text);
  // Group sentences into logical chunks of 1-2 sentences
  const points: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) {
    const chunk = sentences.slice(i, i + 2).join(" ");
    if (chunk.length > 10) points.push(chunk);
  }
  return points.length > 0 ? points : [text];
}

function firstSentence(text: string): string {
  const match = text.match(/^[^.!?]+[.!?]/);
  return match ? match[0].trim() : text.slice(0, 100);
}

function summarize(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).replace(/\s+\S*$/, "") + "...";
}

// ---- Repurpose engine ----

function toThread(text: string): RepurposedContent {
  const points = extractKeyPoints(text);
  const parts: string[] = [];

  // Tweet d'ouverture — hook
  parts.push(`🧵 ${firstSentence(text)}\n\nUn thread 👇`);

  // Tweets du corps
  points.forEach((point, i) => {
    parts.push(`${i + 1}/ ${point}`);
  });

  // Tweet de clôture
  parts.push(
    `C'est terminé !\n\nSi c'était utile :\n• Repostez pour partager avec votre audience\n• Suivez pour plus de threads comme celui-ci`
  );

  return { formatId: "thread", formatLabel: "Thread", parts };
}

function toCarousel(text: string): RepurposedContent {
  const points = extractKeyPoints(text);
  const parts: string[] = [];

  // Cover slide
  parts.push(`📌 ${summarize(firstSentence(text), 80)}`);

  // Diapos de contenu
  points.slice(0, 8).forEach((point, i) => {
    parts.push(`Diapo ${i + 2}\n\n${point}`);
  });

  // Diapo CTA
  parts.push(`Sauvegardez ce carrousel pour plus tard.\nSuivez pour plus.\n\n👇 Partagez avec quelqu'un qui en a besoin.`);

  return { formatId: "carousel", formatLabel: "Carrousel", parts };
}

function toVideoScript(text: string): RepurposedContent {
  const points = extractKeyPoints(text);
  const parts: string[] = [];

  // Hook (3 premières secondes)
  parts.push(`🎬 HOOK (0-3s)\n\n"${summarize(firstSentence(text), 100)}"`);

  // Scènes du corps
  const bodyPoints = points.slice(0, 5);
  bodyPoints.forEach((point, i) => {
    const seconds = 3 + i * 5;
    parts.push(
      `📍 SCÈNE ${i + 1} (${seconds}s-${seconds + 5}s)\n\n${point}`
    );
  });

  // Scène CTA
  parts.push(
    `🎯 CTA (fin)\n\n"Si ça vous a aidé, suivez pour plus. Laissez un commentaire avec votre question."`
  );

  return { formatId: "video_script", formatLabel: "Script vidéo", parts };
}

function toPost(text: string): RepurposedContent {
  const hook = firstSentence(text);
  const sentences = splitSentences(text);
  const body = sentences.slice(1, 4).join(" ");
  const cta = "💬 Qu'en pensez-vous ? Commentez ci-dessous.\n📌 Sauvegardez pour plus tard.";

  const parts = [
    `${hook}\n\n${body}\n\n${cta}`,
  ];

  return { formatId: "post", formatLabel: "Post unique", parts };
}

/**
 * Repurpose source content into all 4 formats.
 */
export function repurposeContent(sourceText: string): RepurposedContent[] {
  const cleaned = sourceText.trim();
  if (!cleaned) return [];

  return [
    toThread(cleaned),
    toCarousel(cleaned),
    toVideoScript(cleaned),
    toPost(cleaned),
  ];
}
