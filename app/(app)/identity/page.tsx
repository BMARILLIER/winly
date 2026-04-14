import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCreatorIdentity } from "@/lib/actions/creator-identity";
import { IdentityForm } from "./identity-form";

export default async function IdentityPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  const identity = await getCreatorIdentity(workspace.id);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Mon identité créateur</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Ces informations sont utilisées par l&apos;IA pour adapter tout le contenu généré à votre style, votre univers et votre marque.
        </p>
      </div>

      <IdentityForm workspaceId={workspace.id} niche={workspace.niche} platform={workspace.mainPlatform} initial={identity} />
    </div>
  );
}
