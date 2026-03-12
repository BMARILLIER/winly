import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ContentLabUI } from "./content-lab-ui";

export default async function ContentLabPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  return (
    <ContentLabUI
      platform={workspace.mainPlatform}
      niche={workspace.niche}
      profileType={workspace.profileType ?? "personal"}
    />
  );
}
