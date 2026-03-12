import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { OpportunityFinderUI } from "./opportunity-finder-ui";

export default async function OpportunityFinderPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  return <OpportunityFinderUI defaultNiche={workspace.niche} />;
}
