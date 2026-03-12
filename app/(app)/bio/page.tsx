import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { BioOptimizer } from "./bio-optimizer";

export default async function BioPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Bio Optimizer</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Collez votre bio actuelle pour obtenir un score et 3 versions améliorées.
          {workspace.profileType === "anonymous" && (
            <span className="ml-1 text-accent">Compatible anonyme — aucune info personnelle requise.</span>
          )}
        </p>
      </div>

      <BioOptimizer workspaceId={workspace.id} profileType={workspace.profileType} />
    </div>
  );
}
