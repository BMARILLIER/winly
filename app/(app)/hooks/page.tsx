import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { HOOK_TYPES } from "@/modules/hooks";
import { HookGenerator } from "./hook-generator";
import { SavedHooks } from "./saved-hooks";

interface Props {
  searchParams: Promise<{ type?: string }>;
}

export default async function HooksPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  const params = await searchParams;
  const activeType = params.type ?? null;

  const saved = await prisma.savedHook.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Générateur de Hooks</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Générez des accroches percutantes pour votre contenu.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HookGenerator
            niche={workspace.niche}
            workspaceId={workspace.id}
            activeType={activeType}
          />
        </div>
        <div>
          <SavedHooks hooks={saved} />
        </div>
      </div>
    </div>
  );
}
