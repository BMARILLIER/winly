import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateIdeas, FORMATS, STATUSES } from "@/modules/content";
import { ContentList } from "./content-list";
import { NewIdeaForm } from "./new-idea-form";
import { ImportPostForm } from "./import-post-form";
import { Suggestions } from "./suggestions";
import { QuotaBadge } from "@/components/ui/quota-badge";

export default async function ContentPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  const ideas = await prisma.contentIdea.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
  });

  const suggestions = generateIdeas(workspace.niche, workspace.mainPlatform, 4);

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Idées de contenu</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {ideas.length} idée{ideas.length !== 1 ? "s" : ""} dans votre pipeline
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main: idea list + create form */}
        <div className="lg:col-span-2 space-y-6">
          <NewIdeaForm workspaceId={workspace.id} niche={workspace.niche} platform={workspace.mainPlatform} />
          <ImportPostForm workspaceId={workspace.id} />
          <ContentList ideas={ideas} />
        </div>

        {/* Sidebar: suggestions */}
        <div className="space-y-4">
          <QuotaBadge userId={user.id} />
          <Suggestions
            suggestions={suggestions}
            workspaceId={workspace.id}
          />
        </div>
      </div>
    </div>
  );
}
