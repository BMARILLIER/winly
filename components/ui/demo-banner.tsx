import { FlaskConical } from "lucide-react";

/**
 * Banner for pages still running on mock data.
 * Used to be honest with users: clearly marks non-live features.
 */
export function DemoBanner({ feature }: { feature: string }) {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
      <FlaskConical className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <p className="font-medium text-amber-100">Mode démo</p>
        <p className="text-amber-200/80">
          {feature} affiche des données d&apos;exemple pour illustrer la fonctionnalité.
          La version connectée à tes vraies données arrive bientôt.
        </p>
      </div>
    </div>
  );
}
