import Link from "next/link";
import { FlaskConical, Instagram } from "lucide-react";

export function DemoBanner({ feature }: { feature: string }) {
  return (
    <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
      <div className="flex items-start gap-3">
        <FlaskConical className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="flex-1">
          <p className="font-medium text-amber-100">Mode démo</p>
          <p className="text-amber-200/80">
            {feature} affiche des données d&apos;exemple pour illustrer la fonctionnalité.
            La version connectée à tes vraies données arrive bientôt.
          </p>
        </div>
      </div>
      <div className="mt-3 flex justify-center">
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-shadow"
        >
          <Instagram className="h-4 w-4" />
          Connecter Instagram pour des chiffres réels
        </Link>
      </div>
    </div>
  );
}
