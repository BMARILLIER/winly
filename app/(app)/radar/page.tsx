import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { detectOpportunities } from "@/modules/radar";
import { RadarUI } from "./radar-ui";

export default async function RadarPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  const existingContent = await prisma.contentIdea.findMany({
    where: { workspaceId: workspace.id },
    select: { title: true },
  });

  const goals: string[] = JSON.parse(workspace.goals || "[]");

  const opportunities = detectOpportunities({
    platform: workspace.mainPlatform,
    niche: workspace.niche,
    goals,
    profileType: workspace.profileType,
    postFrequency: workspace.postFrequency,
    existingTitles: existingContent.map((c) => c.title),
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Growth Radar</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Opportunités de contenu détectées pour votre niche, plateforme et objectifs.
        </p>
      </div>

      <RadarUI opportunities={opportunities} />
    </div>
  );
}
