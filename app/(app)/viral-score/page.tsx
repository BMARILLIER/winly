import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ViralScoreUI } from "./viral-score-ui";

export default async function ViralScorePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  return (
    <ViralScoreUI
      platform={workspace.mainPlatform}
      niche={workspace.niche}
    />
  );
}
