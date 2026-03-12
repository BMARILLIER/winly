import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ReportUI } from "./report-ui";

export default async function ReportPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  return (
    <ReportUI
      username={workspace.name}
      platform={workspace.mainPlatform}
      niche={workspace.niche}
    />
  );
}
