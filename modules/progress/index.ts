// ---------------------------------------------------------------------------
// User Progression Module
// Levels, milestones, achievements, and progress tracking
// ---------------------------------------------------------------------------

export interface Level {
  id: number;
  name: string;
  minPoints: number;
  maxPoints: number;
  color: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "content" | "engagement" | "consistency" | "mastery";
  points: number;
  unlocked: boolean;
}

export interface ProgressReport {
  level: Level;
  nextLevel: Level | null;
  totalPoints: number;
  pointsInLevel: number;
  pointsForNext: number;
  progressPercent: number;
  achievements: Achievement[];
  unlockedCount: number;
  stats: ProgressStats;
}

export interface ProgressStats {
  contentCreated: number;
  contentPublished: number;
  hooksGenerated: number;
  auditsCompleted: number;
  scoresCompleted: number;
  missionsCompleted: number;
  scheduledPosts: number;
  daysActive: number;
}

// ---- Levels ----

export const LEVELS: Level[] = [
  { id: 1, name: "Débutant", minPoints: 0, maxPoints: 99, color: "from-gray-400 to-gray-500" },
  { id: 2, name: "En croissance", minPoints: 100, maxPoints: 299, color: "from-green-400 to-green-600" },
  { id: 3, name: "Créateur", minPoints: 300, maxPoints: 599, color: "from-blue-400 to-blue-600" },
  { id: 4, name: "Autorité", minPoints: 600, maxPoints: 999, color: "from-violet-400 to-violet-600" },
  { id: 5, name: "Influenceur", minPoints: 1000, maxPoints: Infinity, color: "from-amber-400 to-amber-600" },
];

export function getLevel(points: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) return LEVELS[i];
  }
  return LEVELS[0];
}

// ---- Points attribution ----

const POINTS_TABLE = {
  contentCreated: 5,
  contentPublished: 10,
  hookSaved: 3,
  auditCompleted: 20,
  scoreCompleted: 20,
  missionCompleted: 8,
  postScheduled: 4,
  dayActive: 2,
};

function calculatePoints(stats: ProgressStats): number {
  return (
    stats.contentCreated * POINTS_TABLE.contentCreated +
    stats.contentPublished * POINTS_TABLE.contentPublished +
    stats.hooksGenerated * POINTS_TABLE.hookSaved +
    stats.auditsCompleted * POINTS_TABLE.auditCompleted +
    stats.scoresCompleted * POINTS_TABLE.scoreCompleted +
    stats.missionsCompleted * POINTS_TABLE.missionCompleted +
    stats.scheduledPosts * POINTS_TABLE.postScheduled +
    stats.daysActive * POINTS_TABLE.dayActive
  );
}

// ---- Achievements ----

interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: Achievement["category"];
  points: number;
  condition: (stats: ProgressStats) => boolean;
}

const ACHIEVEMENT_DEFS: AchievementDef[] = [
  // Contenu
  {
    id: "first_idea",
    title: "Première idée",
    description: "Créez votre première idée de contenu.",
    icon: "💡",
    category: "content",
    points: 5,
    condition: (s) => s.contentCreated >= 1,
  },
  {
    id: "idea_machine",
    title: "Machine à idées",
    description: "Créez 10 idées de contenu.",
    icon: "🧠",
    category: "content",
    points: 15,
    condition: (s) => s.contentCreated >= 10,
  },
  {
    id: "content_factory",
    title: "Usine à contenu",
    description: "Créez 50 idées de contenu.",
    icon: "🏭",
    category: "content",
    points: 30,
    condition: (s) => s.contentCreated >= 50,
  },
  {
    id: "first_publish",
    title: "En ligne",
    description: "Marquez votre premier contenu comme publié.",
    icon: "🚀",
    category: "content",
    points: 10,
    condition: (s) => s.contentPublished >= 1,
  },
  {
    id: "publisher_10",
    title: "Éditeur régulier",
    description: "Publiez 10 contenus.",
    icon: "📢",
    category: "content",
    points: 25,
    condition: (s) => s.contentPublished >= 10,
  },
  {
    id: "hook_collector",
    title: "Collecteur de hooks",
    description: "Sauvegardez 5 hooks.",
    icon: "🪝",
    category: "content",
    points: 10,
    condition: (s) => s.hooksGenerated >= 5,
  },
  {
    id: "hook_master",
    title: "Maître des hooks",
    description: "Sauvegardez 20 hooks.",
    icon: "🎣",
    category: "content",
    points: 20,
    condition: (s) => s.hooksGenerated >= 20,
  },

  // Engagement
  {
    id: "first_schedule",
    title: "Planificateur",
    description: "Planifiez votre premier post.",
    icon: "📅",
    category: "engagement",
    points: 5,
    condition: (s) => s.scheduledPosts >= 1,
  },
  {
    id: "week_planned",
    title: "Guerrier de la semaine",
    description: "Planifiez 7 posts.",
    icon: "📆",
    category: "engagement",
    points: 15,
    condition: (s) => s.scheduledPosts >= 7,
  },
  {
    id: "calendar_pro",
    title: "Pro du calendrier",
    description: "Planifiez 30 posts.",
    icon: "🗓️",
    category: "engagement",
    points: 30,
    condition: (s) => s.scheduledPosts >= 30,
  },

  // Régularité
  {
    id: "day_one",
    title: "Jour un",
    description: "Soyez actif pendant 1 jour.",
    icon: "🌱",
    category: "consistency",
    points: 5,
    condition: (s) => s.daysActive >= 1,
  },
  {
    id: "one_week",
    title: "Une semaine",
    description: "Soyez actif pendant 7 jours.",
    icon: "📊",
    category: "consistency",
    points: 15,
    condition: (s) => s.daysActive >= 7,
  },
  {
    id: "one_month",
    title: "Habitué du mois",
    description: "Soyez actif pendant 30 jours.",
    icon: "🔥",
    category: "consistency",
    points: 30,
    condition: (s) => s.daysActive >= 30,
  },
  {
    id: "mission_starter",
    title: "Première mission",
    description: "Complétez votre première mission.",
    icon: "🎯",
    category: "consistency",
    points: 5,
    condition: (s) => s.missionsCompleted >= 1,
  },
  {
    id: "mission_10",
    title: "Motivé par les missions",
    description: "Complétez 10 missions.",
    icon: "⭐",
    category: "consistency",
    points: 20,
    condition: (s) => s.missionsCompleted >= 10,
  },
  {
    id: "mission_50",
    title: "Légende des missions",
    description: "Complétez 50 missions.",
    icon: "🏆",
    category: "consistency",
    points: 40,
    condition: (s) => s.missionsCompleted >= 50,
  },

  // Maîtrise
  {
    id: "first_audit",
    title: "Conscience de soi",
    description: "Complétez votre premier audit.",
    icon: "🔍",
    category: "mastery",
    points: 10,
    condition: (s) => s.auditsCompleted >= 1,
  },
  {
    id: "audit_regular",
    title: "Auditeur régulier",
    description: "Complétez 5 audits.",
    icon: "📋",
    category: "mastery",
    points: 25,
    condition: (s) => s.auditsCompleted >= 5,
  },
  {
    id: "first_score",
    title: "Évalué",
    description: "Complétez votre premier Winly Score.",
    icon: "📈",
    category: "mastery",
    points: 10,
    condition: (s) => s.scoresCompleted >= 1,
  },
  {
    id: "score_tracker",
    title: "Suiveur de score",
    description: "Complétez 5 évaluations Winly Score.",
    icon: "📉",
    category: "mastery",
    points: 25,
    condition: (s) => s.scoresCompleted >= 5,
  },
];

function evaluateAchievements(stats: ProgressStats): Achievement[] {
  return ACHIEVEMENT_DEFS.map((def) => ({
    id: def.id,
    title: def.title,
    description: def.description,
    icon: def.icon,
    category: def.category,
    points: def.points,
    unlocked: def.condition(stats),
  }));
}

// ---- Main function ----

export function computeProgress(stats: ProgressStats): ProgressReport {
  const achievements = evaluateAchievements(stats);
  const achievementPoints = achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.points, 0);

  const activityPoints = calculatePoints(stats);
  const totalPoints = activityPoints + achievementPoints;

  const level = getLevel(totalPoints);
  const levelIdx = LEVELS.indexOf(level);
  const nextLevel = levelIdx < LEVELS.length - 1 ? LEVELS[levelIdx + 1] : null;

  const pointsInLevel = totalPoints - level.minPoints;
  const pointsForNext = nextLevel ? nextLevel.minPoints - level.minPoints : 0;
  const progressPercent = pointsForNext > 0
    ? Math.min(100, Math.round((pointsInLevel / pointsForNext) * 100))
    : 100;

  return {
    level,
    nextLevel,
    totalPoints,
    pointsInLevel,
    pointsForNext,
    progressPercent,
    achievements,
    unlockedCount: achievements.filter((a) => a.unlocked).length,
    stats,
  };
}

// ---- Category metadata ----

export const ACHIEVEMENT_CATEGORIES: Record<Achievement["category"], { label: string; color: string }> = {
  content: { label: "Contenu", color: "bg-violet-100 text-violet-700" },
  engagement: { label: "Engagement", color: "bg-blue-100 text-blue-700" },
  consistency: { label: "Régularité", color: "bg-amber-100 text-amber-700" },
  mastery: { label: "Maîtrise", color: "bg-green-100 text-green-700" },
};
