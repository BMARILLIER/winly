import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getConversations } from "@/lib/actions/live-chat";
import { LiveChatUI } from "./live-chat-ui";

export default async function LiveChatPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  const conversations = await getConversations();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Live Chat</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Gérez vos conversations et recevez des suggestions en temps réel.
        </p>
      </div>
      <LiveChatUI initialConversations={conversations} />
    </div>
  );
}
