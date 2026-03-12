import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { PredictorUI } from "./predictor-ui";

export default async function PredictPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = user.workspaces[0];
  if (!workspace) redirect("/onboarding");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Content Predictor</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Analysez votre contenu avant de publier. Obtenez une prédiction d&apos;engagement et des conseils actionnables.
        </p>
      </div>

      <PredictorUI
        platform={workspace.mainPlatform}
        profileType={workspace.profileType}
        niche={workspace.niche}
      />
    </div>
  );
}
