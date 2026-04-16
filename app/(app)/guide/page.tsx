import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getGettingStarted } from "@/lib/queries/getting-started";
import { GuideUI } from "./guide-ui";

export default async function GuidePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  const data = await getGettingStarted(user.id);

  return <GuideUI data={data} />;
}
