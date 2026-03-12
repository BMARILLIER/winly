/**
 * Creator Graph — Base de connaissance niche × format × hook × engagement
 *
 * Source unique de données reliant :
 * - niche (fitness, tech, entrepreneurship, etc.)
 * - format (reel, carousel, thread, etc.)
 * - hook type (question, éducatif, storytelling, etc.)
 * - durée (short, medium, long)
 * - engagement observé (0-100)
 * - volume existant (0-100)
 *
 * Utilisé par :
 * - Opportunity Finder → sujets sous-exploités
 * - Content Lab → scoring et recommandations contextuelles
 * - Creator Genome → profil de performance par format/hook
 * - Viral Score → potentiel viral par format/niche
 * - Market Radar → benchmarks niche
 *
 * Données mockées, remplaçables par connecteurs réels.
 */

import type { Niche, ContentFormat } from "@/types";

// ─── Types ───

export type HookType = "question" | "educational" | "storytelling" | "controversial" | "statistical" | "curiosity";
export type Duration = "short" | "medium" | "long";
export type EngagementLevel = "high" | "medium" | "low";

export interface GraphNode {
  id: string;
  title: string;
  niche: Niche;
  format: ContentFormat;
  hookType: HookType;
  duration: Duration;
  engagement: number;         // 0-100
  volume: number;             // 0-100 (combien de créateurs couvrent ce sujet)
  growthScore: number;        // 0-100 (potentiel de croissance)
  opportunityScore: number;   // 0-100 (calculé : engagement haut + volume bas)
  recommendation: string;
}

// ─── Scoring ───

function computeOpportunityScore(engagement: number, volume: number): number {
  return Math.round(Math.min(100, Math.max(0, engagement * 0.6 + (100 - volume) * 0.4)));
}

function computeGrowthScore(engagement: number, volume: number, format: ContentFormat): number {
  const formatBoost: Partial<Record<ContentFormat, number>> = {
    reel: 12, video: 10, carousel: 8, thread: 6, story: 4, static_image: 2, live: 5,
  };
  const base = engagement * 0.5 + (100 - volume) * 0.3;
  const boost = formatBoost[format] ?? 5;
  return Math.round(Math.min(100, Math.max(0, base + boost)));
}

function getEngagementLevel(engagement: number): EngagementLevel {
  if (engagement >= 75) return "high";
  if (engagement >= 45) return "medium";
  return "low";
}

// ─── Graph Data ───

interface RawNode {
  title: string;
  niche: Niche;
  format: ContentFormat;
  hookType: HookType;
  duration: Duration;
  engagement: number;
  volume: number;
  recommendation: string;
}

const RAW_NODES: RawNode[] = [
  // ── Fitness ──
  { title: "Routine matin 5 minutes", niche: "fitness", format: "reel", hookType: "question", duration: "short", engagement: 88, volume: 25, recommendation: "Reel court avec hook direct et démonstration en temps réel." },
  { title: "Étirements pour bureau", niche: "fitness", format: "carousel", hookType: "educational", duration: "medium", engagement: 75, volume: 18, recommendation: "Carrousel avec 5 mouvements simples et timer." },
  { title: "Entraînement sans matériel voyage", niche: "fitness", format: "reel", hookType: "storytelling", duration: "short", engagement: 82, volume: 30, recommendation: "Reel de 30s en espace réduit, format POV." },
  { title: "Nutrition post-entraînement", niche: "fitness", format: "carousel", hookType: "educational", duration: "medium", engagement: 70, volume: 55, recommendation: "Carrousel éducatif avec macro-nutriments et timing optimal." },
  { title: "Progression calisthenics débutant", niche: "fitness", format: "video", hookType: "storytelling", duration: "medium", engagement: 85, volume: 22, recommendation: "Série vidéo courte montrant les étapes semaine par semaine." },
  { title: "HIIT en 10 minutes", niche: "fitness", format: "reel", hookType: "question", duration: "short", engagement: 90, volume: 45, recommendation: "Reel avec timer visible et musique énergique." },
  { title: "Erreurs squat débutant", niche: "fitness", format: "carousel", hookType: "controversial", duration: "medium", engagement: 84, volume: 35, recommendation: "Carrousel comparatif : mauvaise vs bonne forme." },

  // ── Tech ──
  { title: "Automatiser avec l'IA", niche: "tech", format: "thread", hookType: "educational", duration: "long", engagement: 90, volume: 40, recommendation: "Thread avec 5 outils concrets et cas d'usage." },
  { title: "Setup dev minimaliste 2026", niche: "tech", format: "reel", hookType: "curiosity", duration: "short", engagement: 78, volume: 20, recommendation: "Reel tour du setup avec chaque outil justifié." },
  { title: "CLI tools méconnus", niche: "tech", format: "carousel", hookType: "educational", duration: "medium", engagement: 82, volume: 15, recommendation: "Carrousel top 5 avec capture d'écran." },
  { title: "Debug en production", niche: "tech", format: "thread", hookType: "storytelling", duration: "long", engagement: 86, volume: 28, recommendation: "Post storytelling avec chronologie du bug et solution." },
  { title: "Side project en un week-end", niche: "tech", format: "reel", hookType: "curiosity", duration: "short", engagement: 92, volume: 35, recommendation: "Reel timelapse du build avec résultat en hook." },
  { title: "VS Code extensions cachées", niche: "tech", format: "carousel", hookType: "educational", duration: "medium", engagement: 80, volume: 22, recommendation: "Carrousel avec capture et raccourci pour chacune." },
  { title: "API design en 60 secondes", niche: "tech", format: "reel", hookType: "educational", duration: "short", engagement: 77, volume: 18, recommendation: "Reel avec schéma animé simple." },

  // ── Entrepreneurship ──
  { title: "Premier client sans audience", niche: "entrepreneurship", format: "carousel", hookType: "storytelling", duration: "medium", engagement: 91, volume: 30, recommendation: "Carrousel avec les 5 étapes exactes, montants inclus." },
  { title: "Automatiser son business solo", niche: "entrepreneurship", format: "thread", hookType: "educational", duration: "long", engagement: 85, volume: 38, recommendation: "Thread avec chaque outil, coût et temps gagné." },
  { title: "Revenus passifs réalistes", niche: "entrepreneurship", format: "reel", hookType: "controversial", duration: "short", engagement: 88, volume: 65, recommendation: "Reel avec les montants réels — transparence." },
  { title: "Erreurs première année", niche: "entrepreneurship", format: "carousel", hookType: "storytelling", duration: "medium", engagement: 80, volume: 22, recommendation: "Carrousel personnel avec leçon par erreur." },
  { title: "Comment fixer ses prix", niche: "entrepreneurship", format: "carousel", hookType: "educational", duration: "medium", engagement: 83, volume: 25, recommendation: "Carrousel framework 3 étapes + exemple concret." },
  { title: "Lancer sans budget pub", niche: "entrepreneurship", format: "reel", hookType: "question", duration: "short", engagement: 86, volume: 20, recommendation: "Reel avec les 3 canaux gratuits qui convertissent." },

  // ── Lifestyle ──
  { title: "Routine productivité douce", niche: "lifestyle", format: "reel", hookType: "controversial", duration: "short", engagement: 79, volume: 20, recommendation: "Reel anti-hustle culture avec routine efficace." },
  { title: "Minimalisme digital", niche: "lifestyle", format: "carousel", hookType: "educational", duration: "medium", engagement: 84, volume: 18, recommendation: "Carrousel avant/après écran + règles simples." },
  { title: "Capsule wardrobe saison", niche: "lifestyle", format: "carousel", hookType: "educational", duration: "medium", engagement: 76, volume: 42, recommendation: "Carrousel 15 pièces essentielles avec combinaisons." },
  { title: "Journal de gratitude", niche: "lifestyle", format: "reel", hookType: "storytelling", duration: "short", engagement: 72, volume: 35, recommendation: "Reel de la routine avec template en CTA." },
  { title: "Morning routine sans écran", niche: "lifestyle", format: "reel", hookType: "curiosity", duration: "short", engagement: 81, volume: 25, recommendation: "Reel POV filmé en lumière naturelle." },

  // ── Finance ──
  { title: "Épargne automatique débutants", niche: "finance", format: "carousel", hookType: "educational", duration: "medium", engagement: 86, volume: 28, recommendation: "Carrousel étape par étape avec captures d'app." },
  { title: "Investir avec 50€/mois", niche: "finance", format: "thread", hookType: "statistical", duration: "long", engagement: 90, volume: 32, recommendation: "Thread avec simulation 5 ans, graphique inclus." },
  { title: "Budget 50/30/20 adapté", niche: "finance", format: "carousel", hookType: "educational", duration: "medium", engagement: 75, volume: 55, recommendation: "Carrousel avec exemples par niveau de revenus." },
  { title: "ETF en 60 secondes", niche: "finance", format: "reel", hookType: "educational", duration: "short", engagement: 82, volume: 20, recommendation: "Reel avec animation simple et analogie." },
  { title: "Calculer son taux d'épargne", niche: "finance", format: "carousel", hookType: "statistical", duration: "medium", engagement: 78, volume: 15, recommendation: "Carrousel interactif avec formule et exemples." },

  // ── Marketing ──
  { title: "Hook formulas qui marchent", niche: "marketing", format: "carousel", hookType: "educational", duration: "medium", engagement: 89, volume: 45, recommendation: "Carrousel avec 7 formules + exemple réel." },
  { title: "Audit de profil en 5 min", niche: "marketing", format: "reel", hookType: "educational", duration: "short", engagement: 83, volume: 22, recommendation: "Reel screen recording d'audit en direct." },
  { title: "CTA qui convertissent", niche: "marketing", format: "carousel", hookType: "educational", duration: "medium", engagement: 78, volume: 30, recommendation: "Carrousel comparatif : CTA faible vs fort." },
  { title: "Stratégie hashtag 2026", niche: "marketing", format: "thread", hookType: "educational", duration: "long", engagement: 80, volume: 50, recommendation: "Thread méthode 3-5-2 avec exemples par niche." },
  { title: "Storytelling pour vendre", niche: "marketing", format: "reel", hookType: "storytelling", duration: "short", engagement: 85, volume: 28, recommendation: "Reel avec exemple de transformation client." },

  // ── Wellness ──
  { title: "Respiration anti-stress 4-7-8", niche: "wellness", format: "reel", hookType: "educational", duration: "short", engagement: 81, volume: 15, recommendation: "Reel guidé 30s avec timer et musique douce." },
  { title: "Routine soir déconnexion", niche: "wellness", format: "carousel", hookType: "educational", duration: "medium", engagement: 77, volume: 22, recommendation: "Carrousel 5 étapes avec bénéfices scientifiques." },
  { title: "Micro-méditation bureau", niche: "wellness", format: "reel", hookType: "curiosity", duration: "short", engagement: 74, volume: 12, recommendation: "Reel discret et silencieux, réalisable en open space." },
  { title: "Yoga 5 poses essentielles", niche: "wellness", format: "carousel", hookType: "educational", duration: "medium", engagement: 79, volume: 30, recommendation: "Carrousel avec photo et instruction par pose." },

  // ── Travel ──
  { title: "Destination sous-cotée Europe", niche: "travel", format: "carousel", hookType: "curiosity", duration: "medium", engagement: 87, volume: 25, recommendation: "Carrousel 5 photos + budget/jour + meilleure saison." },
  { title: "Packing list minimaliste", niche: "travel", format: "carousel", hookType: "educational", duration: "medium", engagement: 80, volume: 40, recommendation: "Carrousel flat lay avec chaque item justifié." },
  { title: "Voyager seul première fois", niche: "travel", format: "reel", hookType: "storytelling", duration: "short", engagement: 83, volume: 20, recommendation: "Reel storytelling : 3 peurs dépassées et réalité." },
  { title: "City guide en 24h", niche: "travel", format: "reel", hookType: "curiosity", duration: "medium", engagement: 85, volume: 35, recommendation: "Reel dynamique avec itinéraire chronologique." },
];

// ─── Build Graph ───

function buildGraph(): GraphNode[] {
  return RAW_NODES.map((n, i) => ({
    id: `gn_${n.niche}_${i}`,
    ...n,
    growthScore: computeGrowthScore(n.engagement, n.volume, n.format),
    opportunityScore: computeOpportunityScore(n.engagement, n.volume),
  }));
}

const GRAPH: GraphNode[] = buildGraph();

// ─── Query API ───

/** Tous les nœuds du graph */
export function getAllNodes(): GraphNode[] {
  return GRAPH;
}

/** Filtrer par niche */
export function getNodesByNiche(niche: Niche): GraphNode[] {
  return GRAPH.filter((n) => n.niche === niche);
}

/** Filtrer par format */
export function getNodesByFormat(format: ContentFormat): GraphNode[] {
  return GRAPH.filter((n) => n.format === format);
}

/** Filtrer par hook type */
export function getNodesByHookType(hookType: HookType): GraphNode[] {
  return GRAPH.filter((n) => n.hookType === hookType);
}

/** Top opportunités (engagement élevé + volume faible) */
export function getTopOpportunities(niche?: Niche, limit = 10): GraphNode[] {
  const nodes = niche ? getNodesByNiche(niche) : GRAPH;
  return [...nodes].sort((a, b) => b.opportunityScore - a.opportunityScore).slice(0, limit);
}

/** Top formats par engagement dans une niche */
export function getTopFormats(niche: Niche): { format: ContentFormat; avgEngagement: number; count: number }[] {
  const nodes = getNodesByNiche(niche);
  const map: Record<string, { total: number; count: number }> = {};
  for (const n of nodes) {
    if (!map[n.format]) map[n.format] = { total: 0, count: 0 };
    map[n.format].total += n.engagement;
    map[n.format].count++;
  }
  return Object.entries(map)
    .map(([format, { total, count }]) => ({
      format: format as ContentFormat,
      avgEngagement: Math.round(total / count),
      count,
    }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement);
}

/** Top hooks par engagement dans une niche */
export function getTopHooks(niche: Niche): { hookType: HookType; avgEngagement: number; count: number }[] {
  const nodes = getNodesByNiche(niche);
  const map: Record<string, { total: number; count: number }> = {};
  for (const n of nodes) {
    if (!map[n.hookType]) map[n.hookType] = { total: 0, count: 0 };
    map[n.hookType].total += n.engagement;
    map[n.hookType].count++;
  }
  return Object.entries(map)
    .map(([hookType, { total, count }]) => ({
      hookType: hookType as HookType,
      avgEngagement: Math.round(total / count),
      count,
    }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement);
}

/** Engagement level pour un couple format×niche */
export function getEngagementForFormatNiche(format: ContentFormat, niche: Niche): EngagementLevel {
  const nodes = GRAPH.filter((n) => n.format === format && n.niche === niche);
  if (nodes.length === 0) return "medium";
  const avg = nodes.reduce((s, n) => s + n.engagement, 0) / nodes.length;
  return getEngagementLevel(avg);
}

/** Stats résumées pour une niche */
export function getNicheSummary(niche: Niche) {
  const nodes = getNodesByNiche(niche);
  if (nodes.length === 0) return null;
  const avgEngagement = Math.round(nodes.reduce((s, n) => s + n.engagement, 0) / nodes.length);
  const avgVolume = Math.round(nodes.reduce((s, n) => s + n.volume, 0) / nodes.length);
  const topFormats = getTopFormats(niche).slice(0, 3);
  const topHooks = getTopHooks(niche).slice(0, 3);
  const topOpps = getTopOpportunities(niche, 3);
  return { niche, nodeCount: nodes.length, avgEngagement, avgVolume, topFormats, topHooks, topOpps };
}

// ─── Style constants ───

export const HOOK_TYPE_LABELS: Record<HookType, string> = {
  question: "Question",
  educational: "Éducatif",
  storytelling: "Storytelling",
  controversial: "Controversé",
  statistical: "Statistique",
  curiosity: "Curiosité",
};

export const DURATION_LABELS: Record<Duration, string> = {
  short: "< 30s",
  medium: "30-60s",
  long: "> 60s",
};

export const ENGAGEMENT_STYLES: Record<EngagementLevel, { label: string; color: string }> = {
  high: { label: "Élevé", color: "text-success" },
  medium: { label: "Moyen", color: "text-warning" },
  low: { label: "Faible", color: "text-danger" },
};
