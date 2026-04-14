"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPassword, type ResetState } from "@/lib/actions/auth";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<ResetState, FormData>(
    resetPassword,
    null,
  );

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface-1 p-8 shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
        <h1 className="text-2xl font-bold text-foreground">Nouveau mot de passe</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Choisis un mot de passe d&apos;au moins 8 caractères (lettre + chiffre).
        </p>

        {state?.success ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
              Mot de passe mis à jour. Tu peux maintenant te connecter.
            </div>
            <Link
              href="/login"
              className="block rounded-lg bg-gradient-to-r from-primary to-violet py-2.5 text-center text-sm font-semibold text-white hover:opacity-90"
            >
              Se connecter
            </Link>
          </div>
        ) : (
          <>
            {state?.error && (
              <p className="mt-4 rounded-lg bg-danger/15 px-4 py-2 text-sm text-danger">
                {state.error}
              </p>
            )}
            <form action={action} className="mt-6 space-y-4">
              <input type="hidden" name="token" value={token} />
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-medium uppercase tracking-wider text-text-muted"
                >
                  Mot de passe
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  className="mt-1.5 w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-lg bg-gradient-to-r from-primary to-violet py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {pending ? "Enregistrement…" : "Mettre à jour"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
