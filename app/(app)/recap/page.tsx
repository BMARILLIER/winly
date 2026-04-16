import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { RecapUI } from "./recap-ui";

export default async function RecapPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  return <RecapUI />;
}
