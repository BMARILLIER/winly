import { prisma } from "@/lib/db";
import { getActiveConnection } from "@/lib/services/instagram-connection";

export interface GettingStartedStep {
  id: string;
  title: string;
  description: string;
  href: string;
  completed: boolean;
  icon: string;
}

export interface GettingStartedData {
  steps: GettingStartedStep[];
  completedCount: number;
  totalCount: number;
  progressPct: number;
  allDone: boolean;
}

export async function getGettingStarted(userId: string): Promise<GettingStartedData> {
  const [connection, workspace] = await Promise.all([
    getActiveConnection(userId),
    prisma.workspace.findFirst({ where: { userId }, select: { id: true } }),
  ]);

  const [contentCount, hookCount, insightCount, competitorCount, identityExists] =
    await Promise.all([
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
      workspace
        ? prisma.creatorIdentity.findUnique({
            where: { workspaceId: workspace.id },
            select: { id: true },
          })
        : null,
    ]);

  const hasIg = !!connection;
  const hasSynced = hasIg && connection.lastSyncAt !== null;

  const steps: GettingStartedStep[] = [
    {
      id: "workspace",
      title: "Cree ton workspace",
      description: "Choisis ta niche, plateforme et objectifs.",
      href: "/onboarding",
      completed: !!workspace,
      icon: "🏠",
    },
    {
      id: "instagram",
      title: "Connecte Instagram",
      description: "Lie ton compte pour debloquer les analytics.",
      href: "/settings",
      completed: hasIg,
      icon: "📱",
    },
    {
      id: "sync",
      title: "Synchronise tes donnees",
      description: "Recupere tes followers, posts et stats.",
      href: "/settings",
      completed: hasSynced,
      icon: "🔄",
    },
    {
      id: "identity",
      title: "Remplis ton identite createur",
      description: "Ton, valeurs, catchphrases — pour un contenu IA sur-mesure.",
      href: "/identity",
      completed: !!identityExists,
      icon: "🎭",
    },
    {
      id: "insights",
      title: "Decouvre tes insights IA",
      description: "Analyse automatique de tes performances.",
      href: "/ai-insights",
      completed: insightCount > 0,
      icon: "💡",
    },
    {
      id: "content",
      title: "Genere ta premiere idee de contenu",
      description: "Laisse l'IA creer un post adapte a ta niche.",
      href: "/content",
      completed: contentCount > 0,
      icon: "✍️",
    },
    {
      id: "hooks",
      title: "Sauvegarde ton premier hook",
      description: "Des accroches percutantes pour tes posts.",
      href: "/hooks",
      completed: hookCount > 0,
      icon: "🎣",
    },
    {
      id: "competitor",
      title: "Analyse un concurrent",
      description: "Decouvre ses patterns et adapte-les.",
      href: "/competitors",
      completed: competitorCount > 0,
      icon: "🔍",
    },
    {
      id: "viral-score",
      title: "Teste le Viral Score",
      description: "Colle un brouillon et l'IA le note /100.",
      href: "/viral-score",
      completed: false, // Can't easily track, always show
      icon: "🎯",
    },
    {
      id: "recap",
      title: "Partage ton premier recap",
      description: "Genere ta carte de stats et poste-la en Story.",
      href: "/recap",
      completed: false,
      icon: "📊",
    },
    {
      id: "referral",
      title: "Invite un ami",
      description: "Gagne 20 credits IA par parrainage.",
      href: "/referral",
      completed: false,
      icon: "🎁",
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;

  return {
    steps,
    completedCount,
    totalCount: steps.length,
    progressPct: Math.round((completedCount / steps.length) * 100),
    allDone: completedCount === steps.length,
  };
}
