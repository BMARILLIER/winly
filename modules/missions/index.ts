// ---------------------------------------------------------------------------
// Growth Missions Module
// Daily missions, streaks, and progression tracking
// ---------------------------------------------------------------------------

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: "content" | "engagement" | "strategy" | "learning";
  difficulty: "easy" | "medium" | "hard";
  xp: number;
}

export interface DailyMissions {
  date: string;
  missions: Mission[];
}

export interface StreakInfo {
  current: number;
  longest: number;
  todayCompleted: boolean;
  level: number;
  levelLabel: string;
  xpTotal: number;
  xpToNext: number;
  progressPercent: number;
}

// ---- Mission pools ----

const CONTENT_MISSIONS: Omit<Mission, "id">[] = [
  { title: "Écrire un hook", description: "Écrivez un hook accrocheur pour votre prochain post.", category: "content", difficulty: "easy", xp: 10 },
  { title: "Rédiger un brouillon de post", description: "Rédigez une légende ou un brouillon complet. Pas besoin d'être parfait.", category: "content", difficulty: "medium", xp: 20 },
  { title: "Créer un plan de carrousel", description: "Esquissez 5-8 diapos pour un carrousel.", category: "content", difficulty: "medium", xp: 25 },
  { title: "Filmer une courte vidéo", description: "Enregistrez une vidéo de 15-60 secondes pour les Reels ou TikTok.", category: "content", difficulty: "hard", xp: 35 },
  { title: "Réutiliser un contenu existant", description: "Prenez un ancien post et transformez-le dans un nouveau format.", category: "content", difficulty: "easy", xp: 15 },
  { title: "Écrire 3 hooks", description: "Écrivez 3 hooks différents pour le même sujet. Choisissez le meilleur.", category: "content", difficulty: "medium", xp: 20 },
  { title: "Brainstormer 5 idées", description: "Ajoutez 5 nouvelles idées de contenu à votre pipeline.", category: "content", difficulty: "easy", xp: 15 },
  { title: "Écrire un thread", description: "Rédigez un thread en 5-10 parties sur un sujet de votre niche.", category: "content", difficulty: "hard", xp: 30 },
  { title: "Optimiser votre CTA", description: "Passez en revue vos 3 derniers posts et améliorez le call-to-action de chacun.", category: "content", difficulty: "easy", xp: 10 },
  { title: "Créer du contenu par lots", description: "Créez 3 contenus en une seule session.", category: "content", difficulty: "hard", xp: 40 },
];

const ENGAGEMENT_MISSIONS: Omit<Mission, "id">[] = [
  { title: "Commenter 10 posts", description: "Laissez des commentaires sincères et utiles sur 10 posts de votre niche.", category: "engagement", difficulty: "medium", xp: 20 },
  { title: "Répondre à tous les commentaires", description: "Répondez à chaque commentaire sur votre dernier post.", category: "engagement", difficulty: "easy", xp: 10 },
  { title: "Envoyer un DM à 3 créateurs", description: "Envoyez un message sincère à 3 créateurs de votre niche. Pas de pitch.", category: "engagement", difficulty: "medium", xp: 25 },
  { title: "Rejoindre une conversation", description: "Trouvez un sujet tendance dans votre niche et ajoutez votre perspective.", category: "engagement", difficulty: "easy", xp: 10 },
  { title: "Poser une question", description: "Publiez une question à votre audience. Les sondages comptent aussi.", category: "engagement", difficulty: "easy", xp: 10 },
  { title: "Partager le contenu de quelqu'un", description: "Partagez ou repostez le contenu d'un créateur que vous admirez, avec votre avis.", category: "engagement", difficulty: "easy", xp: 10 },
  { title: "Organiser une mini FAQ", description: "Utilisez les Stories ou un post pour répondre à 3 questions de votre audience.", category: "engagement", difficulty: "hard", xp: 30 },
  { title: "Engager pendant 15 minutes", description: "Passez 15 minutes concentrées à interagir avec du contenu de votre niche.", category: "engagement", difficulty: "medium", xp: 20 },
];

const STRATEGY_MISSIONS: Omit<Mission, "id">[] = [
  { title: "Analyser un concurrent", description: "Étudiez un compte à succès dans votre niche. Notez ce qui fonctionne et pourquoi.", category: "strategy", difficulty: "medium", xp: 20 },
  { title: "Consulter vos analytics", description: "Vérifiez les analytics de votre plateforme. Identifiez votre contenu le plus performant.", category: "strategy", difficulty: "easy", xp: 15 },
  { title: "Planifier votre semaine", description: "Planifiez au moins 3 posts dans le calendrier de contenu pour cette semaine.", category: "strategy", difficulty: "medium", xp: 20 },
  { title: "Mettre à jour votre bio", description: "Passez en revue et optimisez la bio de votre profil avec l'Optimiseur de Bio.", category: "strategy", difficulty: "easy", xp: 10 },
  { title: "Lancer un Audit Winly", description: "Complétez un audit complet de votre profil dans le module Audit.", category: "strategy", difficulty: "medium", xp: 25 },
  { title: "Définir un objectif hebdomadaire", description: "Définissez un objectif mesurable pour cette semaine (abonnés, posts, engagement).", category: "strategy", difficulty: "easy", xp: 10 },
  { title: "Identifier vos 3 meilleurs posts", description: "Trouvez vos 3 posts les plus performants. Qu'ont-ils en commun ?", category: "strategy", difficulty: "medium", xp: 20 },
];

const LEARNING_MISSIONS: Omit<Mission, "id">[] = [
  { title: "Lire un article", description: "Lisez un article sur la croissance sur les réseaux sociaux dans votre niche.", category: "learning", difficulty: "easy", xp: 10 },
  { title: "Étudier un post viral", description: "Trouvez un post viral et analysez pourquoi il a fonctionné : hook, format, timing.", category: "learning", difficulty: "medium", xp: 20 },
  { title: "Apprendre un nouveau format", description: "Essayez un format de contenu que vous n'avez jamais utilisé.", category: "learning", difficulty: "hard", xp: 30 },
  { title: "Demander à votre Coach", description: "Posez une question dans le module Growth Coach et appliquez le conseil.", category: "learning", difficulty: "easy", xp: 10 },
  { title: "Regarder un tutoriel", description: "Regardez un tutoriel sur la création de contenu ou les fonctionnalités de votre plateforme.", category: "learning", difficulty: "easy", xp: 10 },
  { title: "Expérimenter le timing", description: "Publiez à une heure différente de d'habitude et suivez les résultats.", category: "learning", difficulty: "medium", xp: 15 },
];

const ALL_MISSIONS = [
  ...CONTENT_MISSIONS,
  ...ENGAGEMENT_MISSIONS,
  ...STRATEGY_MISSIONS,
  ...LEARNING_MISSIONS,
];

// ---- Daily mission selection ----

/**
 * Generate 3 daily missions using a date-based seed for consistency.
 * Same date always returns the same missions.
 */
export function getDailyMissions(date: string): DailyMissions {
  // Simple hash from date string
  let seed = 0;
  for (let i = 0; i < date.length; i++) {
    seed = ((seed << 5) - seed + date.charCodeAt(i)) | 0;
  }

  const pool = [...ALL_MISSIONS];
  const selected: Mission[] = [];

  // Pick 3 missions from different categories
  const categories: Mission["category"][] = ["content", "engagement", "strategy", "learning"];
  const usedCategories = new Set<string>();

  for (let i = 0; i < 3; i++) {
    // Filter to unused categories if possible
    let available = pool.filter((m) => !usedCategories.has(m.category));
    if (available.length === 0) available = pool;

    const idx = Math.abs(seed + i * 7919) % available.length;
    const mission = available[idx];
    selected.push({
      ...mission,
      id: `mission_${date}_${i}`,
    });
    usedCategories.add(mission.category);

    // Remove selected from pool
    const poolIdx = pool.indexOf(mission);
    if (poolIdx >= 0) pool.splice(poolIdx, 1);
  }

  return { date, missions: selected };
}

// ---- Streak & progression ----

const LEVELS = [
  { level: 1, label: "Débutant", xpRequired: 0 },
  { level: 2, label: "Starter", xpRequired: 50 },
  { level: 3, label: "Engagé", xpRequired: 150 },
  { level: 4, label: "Régulier", xpRequired: 300 },
  { level: 5, label: "En croissance", xpRequired: 500 },
  { level: 6, label: "Étoile montante", xpRequired: 800 },
  { level: 7, label: "Influenceur", xpRequired: 1200 },
  { level: 8, label: "Autorité", xpRequired: 1800 },
  { level: 9, label: "Leader", xpRequired: 2500 },
  { level: 10, label: "Légende", xpRequired: 3500 },
];

export function calculateStreak(completedDates: string[], totalXp: number): StreakInfo {
  const today = new Date();
  const todayStr = formatDate(today);
  const todayCompleted = completedDates.includes(todayStr);

  // Calculate current streak
  let current = 0;
  const checkDate = new Date(today);

  // If today not completed, start checking from yesterday
  if (!todayCompleted) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dateStr = formatDate(checkDate);
    if (completedDates.includes(dateStr)) {
      current++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // If today is completed, add it
  if (todayCompleted && current === 0) current = 1;

  // Calculate longest streak
  const sorted = [...completedDates].sort();
  let longest = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of sorted) {
    const d = new Date(dateStr + "T12:00:00");
    if (prevDate) {
      const diff = Math.round((d.getTime() - prevDate.getTime()) / 86400000);
      if (diff === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    } else {
      tempStreak = 1;
    }
    longest = Math.max(longest, tempStreak);
    prevDate = d;
  }

  // Calculate level
  let currentLevel = LEVELS[0];
  let nextLevel = LEVELS[1];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVELS[i].xpRequired) {
      currentLevel = LEVELS[i];
      nextLevel = LEVELS[i + 1] ?? LEVELS[i];
      break;
    }
  }

  const xpInLevel = totalXp - currentLevel.xpRequired;
  const xpForLevel = nextLevel.xpRequired - currentLevel.xpRequired;
  const progressPercent = xpForLevel > 0 ? Math.round((xpInLevel / xpForLevel) * 100) : 100;

  return {
    current,
    longest,
    todayCompleted,
    level: currentLevel.level,
    levelLabel: currentLevel.label,
    xpTotal: totalXp,
    xpToNext: nextLevel.xpRequired - totalXp,
    progressPercent: Math.min(100, progressPercent),
  };
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ---- Category metadata ----

export const MISSION_CATEGORIES: Record<Mission["category"], { label: string; color: string }> = {
  content: { label: "Contenu", color: "bg-violet-100 text-violet-700" },
  engagement: { label: "Engagement", color: "bg-blue-100 text-blue-700" },
  strategy: { label: "Stratégie", color: "bg-amber-100 text-amber-700" },
  learning: { label: "Apprentissage", color: "bg-green-100 text-green-700" },
};

export const DIFFICULTY_XP: Record<Mission["difficulty"], { label: string; color: string }> = {
  easy: { label: "Facile", color: "text-green-600" },
  medium: { label: "Moyen", color: "text-amber-600" },
  hard: { label: "Difficile", color: "text-red-600" },
};
