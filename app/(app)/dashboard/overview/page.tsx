import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  PLATFORMS,
  GOALS,
  POST_FREQUENCIES,
} from "@/lib/workspace-constants";
import { DashboardOverviewUI } from "./dashboard-overview-ui";

export default async function OverviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  const goals: string[] = JSON.parse(workspace.goals);
  const profileConnected = workspace.socialProfiles.length > 0;

  const [latestAudit, latestScore, latestCreatorScore] = await Promise.all([
    prisma.auditResult.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { score: true, createdAt: true },
    }),
    prisma.scoreResult.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { score: true, createdAt: true },
    }),
    prisma.creatorScore.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { score: true, createdAt: true },
    }),
  ]);

  const mostRecent =
    latestScore && latestAudit
      ? latestScore.createdAt > latestAudit.createdAt
        ? latestScore
        : latestAudit
      : latestScore ?? latestAudit;

  const score = mostRecent?.score ?? 0;
  const hasScore = !!mostRecent;

  // Priorities
  const goalMap: Record<string, string> = {
    grow_audience: "Optimiser votre bio et profil",
    monetize: "Identifier les opportunités de monétisation",
    brand_awareness: "Renforcer votre identité visuelle",
    engagement: "Améliorer votre stratégie de publication",
    consistency: "Configurer votre calendrier de contenu",
  };
  const priorities: { label: string; done: boolean }[] = [];
  if (!profileConnected) priorities.push({ label: "Connecter votre profil social", done: false });
  for (const g of goals) {
    if (goalMap[g]) priorities.push({ label: goalMap[g], done: false });
  }
  const priorityList = priorities.slice(0, 4);

  // Next content
  const platformLabel = PLATFORMS.find((p) => p.id === workspace.mainPlatform)?.label ?? workspace.mainPlatform;
  const freqLabel = POST_FREQUENCIES.find((f) => f.id === workspace.postFrequency)?.label?.toLowerCase() ?? workspace.postFrequency;
  const suggestions: Record<string, string> = {
    instagram: `Partager un carrousel avec des conseils sur "${workspace.niche}"`,
    tiktok: `Filmer un conseil rapide de 30s sur "${workspace.niche}"`,
    twitter: `Écrire un thread sur "${workspace.niche}"`,
    linkedin: `Publier une leçon apprise sur "${workspace.niche}"`,
    youtube: `Enregistrer un tutoriel ou avis sur "${workspace.niche}"`,
  };
  const nextContent = {
    suggestion: suggestions[workspace.mainPlatform] ?? `Créer un post sur "${workspace.niche}"`,
    platform: platformLabel,
    frequency: freqLabel,
  };

  // Progression
  const progressionSteps = [
    { label: "Espace de travail créé", done: true },
    { label: "Profil connecté", done: workspace.socialProfiles.length > 0 },
    { label: "Premier audit complété", done: hasScore },
    { label: "Calendrier de contenu configuré", done: false },
  ];
  const completed = progressionSteps.filter((s) => s.done).length;
  const progression = {
    steps: progressionSteps,
    completed,
    total: progressionSteps.length,
    percent: Math.round((completed / progressionSteps.length) * 100),
  };

  // Quick actions
  const quickActions = [
    { label: "Lancer un audit", href: "/audit" },
    { label: "Créer du contenu", href: "/content" },
    { label: "Voir les analytics", href: "/analytics" },
    { label: "AI Insights", href: "/ai-insights" },
  ];

  return (
    <DashboardOverviewUI
      workspaceName={workspace.name}
      platform={PLATFORMS.find((p) => p.id === workspace.mainPlatform)?.label ?? workspace.mainPlatform}
      niche={workspace.niche}
      winlyScore={score}
      hasWinlyScore={hasScore}
      creatorScore={latestCreatorScore?.score ?? null}
      priorities={priorityList}
      nextContent={nextContent}
      progression={progression}
      quickActions={quickActions}
    />
  );
}
