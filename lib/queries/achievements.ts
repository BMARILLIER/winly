import { prisma } from "@/lib/db";
import { getActiveConnection } from "@/lib/services/instagram-connection";
import type { Achievement } from "@/components/ui/achievements-card";

export async function getAchievements(userId: string): Promise<Achievement[]> {
  const workspace = await prisma.workspace.findFirst({
    where: { userId },
    select: { id: true },
  });

  const connection = await getActiveConnection(userId);

  const [
    missionCount,
    contentCount,
    hookCount,
    insightCount,
    competitorCount,
    followers,
    mediaStats,
  ] = await Promise.all([
    workspace
      ? prisma.missionCompletion.count({ where: { workspaceId: workspace.id } })
      : 0,
    workspace
      ? prisma.contentIdea.count({ where: { workspaceId: workspace.id } })
      : 0,
    workspace
      ? prisma.savedHook.count({ where: { workspaceId: workspace.id } })
      : 0,
    prisma.aiInsight.count({ where: { userId } }),
    workspace
      ? prisma.competitorInspo.count({ where: { workspaceId: workspace.id } })
      : 0,
    connection
      ? prisma.instagramSnapshot
          .findFirst({
            where: { connectionId: connection.id },
            orderBy: { createdAt: "desc" },
            select: { followers: true },
          })
          .then((s) => s?.followers ?? 0)
      : 0,
    connection
      ? prisma.instagramMedia.aggregate({
          where: { connectionId: connection.id },
          _max: { likeCount: true },
          _count: true,
        })
      : { _max: { likeCount: 0 }, _count: 0 },
  ]);

  const topLikes = mediaStats._max?.likeCount ?? 0;
  const totalPosts = mediaStats._count ?? 0;

  return [
    {
      id: "ig_connected",
      title: "Connecte",
      description: "Connecte ton Instagram",
      icon: "📱",
      unlocked: !!connection,
    },
    {
      id: "first_content",
      title: "Createur",
      description: "Cree ta premiere idee de contenu",
      icon: "✍️",
      unlocked: contentCount >= 1,
    },
    {
      id: "first_hook",
      title: "Accrocheur",
      description: "Sauvegarde ton premier hook",
      icon: "🎣",
      unlocked: hookCount >= 1,
    },
    {
      id: "first_mission",
      title: "Discipline",
      description: "Complete ta premiere mission",
      icon: "🎯",
      unlocked: missionCount >= 1,
    },
    {
      id: "five_missions",
      title: "Regulier",
      description: "Complete 5 missions",
      icon: "🔥",
      unlocked: missionCount >= 5,
    },
    {
      id: "ten_content",
      title: "Prolifique",
      description: "Cree 10 idees de contenu",
      icon: "📝",
      unlocked: contentCount >= 10,
    },
    {
      id: "first_insight",
      title: "Eclaire",
      description: "Genere tes premiers insights IA",
      icon: "💡",
      unlocked: insightCount >= 1,
    },
    {
      id: "first_competitor",
      title: "Stratege",
      description: "Analyse ton premier concurrent",
      icon: "🔍",
      unlocked: competitorCount >= 1,
    },
    {
      id: "100_followers",
      title: "Debutant",
      description: "Atteins 100 followers",
      icon: "👤",
      unlocked: followers >= 100,
    },
    {
      id: "500_followers",
      title: "En route",
      description: "Atteins 500 followers",
      icon: "👥",
      unlocked: followers >= 500,
    },
    {
      id: "1k_followers",
      title: "1K Club",
      description: "Atteins 1000 followers",
      icon: "🚀",
      unlocked: followers >= 1000,
    },
    {
      id: "5k_followers",
      title: "Influenceur",
      description: "Atteins 5000 followers",
      icon: "⭐",
      unlocked: followers >= 5000,
    },
    {
      id: "10k_followers",
      title: "Star",
      description: "Atteins 10K followers",
      icon: "🌟",
      unlocked: followers >= 10000,
    },
    {
      id: "50_likes",
      title: "Apprecie",
      description: "Un post depasse 50 likes",
      icon: "❤️",
      unlocked: topLikes >= 50,
    },
    {
      id: "100_likes",
      title: "Viral",
      description: "Un post depasse 100 likes",
      icon: "💥",
      unlocked: topLikes >= 100,
    },
    {
      id: "20_missions",
      title: "Machine",
      description: "Complete 20 missions",
      icon: "⚡",
      unlocked: missionCount >= 20,
    },
    {
      id: "25_posts_synced",
      title: "Actif",
      description: "25 posts synchronises",
      icon: "📸",
      unlocked: totalPosts >= 25,
    },
    {
      id: "three_competitors",
      title: "Veilleur",
      description: "Analyse 3 concurrents",
      icon: "🕵️",
      unlocked: competitorCount >= 3,
    },
  ];
}
