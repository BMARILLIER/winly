import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getContentFullText } from "@/lib/actions/best-content";
import { getIdentityContext } from "@/lib/actions/creator-identity";
import { Repurposer } from "./repurposer";

interface Props {
  searchParams: Promise<{ source?: string; id?: string }>;
}

export default async function RepurposePage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  const params = await searchParams;

  // Pre-fill content if coming from a suggestion
  let initialText = "";
  if (params.source && params.id) {
    const source = params.source as "content_idea" | "instagram";
    const text = await getContentFullText(params.id, source);
    if (text) initialText = text;
  }

  // Load creator identity context for AI prompts
  const identityContext = await getIdentityContext(workspace.id);

  // Load saved competitor posts
  const savedCompetitorPosts = await prisma.competitorInspo.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, source: true, text: true, notes: true, createdAt: true },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Content Repurposer</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Transformez votre contenu ou inspirez-vous de la concurrence pour créer du contenu original.
        </p>
      </div>

      <Repurposer
        initialText={initialText}
        workspaceId={workspace.id}
        niche={workspace.niche}
        platform={workspace.mainPlatform}
        identityContext={identityContext}
        savedCompetitorPosts={savedCompetitorPosts.map((p) => ({
          id: p.id,
          source: p.source,
          text: p.text,
          notes: p.notes,
          createdAt: p.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
