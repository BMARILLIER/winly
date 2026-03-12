import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { WorkspaceSettingsForm } from "./workspace-form";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
      <p className="mt-2 text-text-secondary">Gérez votre workspace et vos préférences.</p>

      <div className="mt-8 max-w-2xl">
        <WorkspaceSettingsForm workspace={workspace} />
      </div>
    </div>
  );
}
