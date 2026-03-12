import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CreatorScoreView } from "./creator-score-view";

export default async function CreatorScorePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  const [latestScore, igConnection] = await Promise.all([
    prisma.creatorScore.findFirst({
      where: { userId: user.id, workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.instagramConnection.findUnique({
      where: { userId: user.id },
      select: { igUsername: true },
    }),
  ]);

  const report = latestScore
    ? JSON.parse(latestScore.details)
    : null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Creator Score</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Votre score global de performance créateur basé sur l&apos;activité, la régularité et la qualité du contenu.
        </p>
      </div>

      <CreatorScoreView
        report={report}
        lastUpdated={latestScore?.createdAt.toISOString() ?? null}
        igUsername={igConnection?.igUsername ?? null}
      />
    </div>
  );
}
