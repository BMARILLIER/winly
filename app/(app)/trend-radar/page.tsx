import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { analyzeTrends, type TrendRadarInput } from "@/modules/trend-radar";
import { TrendRadarUI } from "./trend-radar-ui";

export default async function TrendRadarPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  const contentIdeas = await prisma.contentIdea.findMany({
    where: { workspaceId: workspace.id },
    select: { title: true, format: true },
  });

  const input: TrendRadarInput = {
    niche: workspace.niche,
    platform: workspace.mainPlatform,
    existingTitles: contentIdeas.map((c) => c.title),
    existingFormats: [...new Set(contentIdeas.map((c) => c.format))],
    postFrequency: workspace.postFrequency,
  };

  const trends = analyzeTrends(input);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Trend Radar</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Tendances détectées à partir des datasets locaux pour{" "}
          <span className="font-medium capitalize">{workspace.niche}</span> sur{" "}
          <span className="font-medium capitalize">
            {workspace.mainPlatform}
          </span>
          .
        </p>
      </div>

      <TrendRadarUI trends={trends} />
    </div>
  );
}
