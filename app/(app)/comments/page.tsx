import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { CommentsUI } from "./comments-ui";

export default async function CommentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  return <CommentsUI />;
}
