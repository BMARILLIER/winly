"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestBetaAccess, type BetaState } from "@/lib/actions/beta";

export default function BetaPage() {
  const [state, action, pending] = useActionState<BetaState, FormData>(requestBetaAccess, null);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface-1 p-8 shadow-md-dark">
        {/* Header */}
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
            Bêta privée
          </span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Rejoindre la bêta Winly</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Winly est actuellement en bêta privée. Soumettez votre email pour demander un accès anticipé.
          Nous intégrons les créateurs par petits groupes.
        </p>

        {/* Status messages */}
        {state?.error && (
          <p className="mt-4 rounded-lg bg-danger/15 px-4 py-2 text-sm text-danger">
            {state.error}
          </p>
        )}
        {state?.success && (
          <div className="mt-4 rounded-lg bg-success/15 px-4 py-2 text-sm text-success">
            {state.success}
            {state.success.includes("approved") && (
              <Link href="/register" className="ml-1 font-medium underline">
                Créer votre compte →
              </Link>
            )}
          </div>
        )}

        {/* Form */}
        {!state?.success && (
          <form action={action} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-4 py-2 text-sm text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-gradient-to-r from-primary to-violet py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-all duration-200 cursor-pointer"
            >
              {pending ? "Envoi en cours..." : "Demander l'accès bêta"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-text-secondary">
          Déjà approuvé ?{" "}
          <Link href="/register" className="text-accent hover:underline">
            Créer votre compte
          </Link>
        </p>
      </div>
    </div>
  );
}
