import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { HashtagGenerator } from "./hashtag-generator";

export default async function HashtagsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Générateur de Hashtags
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Trouvez les hashtags optimaux pour maximiser votre portée.
        </p>
      </div>

      <HashtagGenerator
        niche={workspace.niche}
        platform={workspace.mainPlatform}
      />
    </div>
  );
}
