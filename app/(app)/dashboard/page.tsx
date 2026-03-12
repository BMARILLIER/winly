import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { PLATFORMS } from "@/lib/workspace-constants";
import { CommandCenterUI } from "./command-center-ui";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  const platformLabel = PLATFORMS.find((p) => p.id === workspace.mainPlatform)?.label ?? workspace.mainPlatform;

  return (
    <CommandCenterUI
      workspaceName={workspace.name}
      platform={platformLabel}
      niche={workspace.niche}
    />
  );
}
