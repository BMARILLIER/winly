"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, type ResetState } from "@/lib/actions/auth";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState<ResetState, FormData>(
    requestPasswordReset,
    null,
  );

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface-1 p-8 shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
        <h1 className="text-2xl font-bold text-foreground">Mot de passe oublié</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Entre ton email, on t&apos;envoie un lien pour le réinitialiser.
        </p>

        {state?.success ? (
          <div className="mt-6 rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
            Si un compte existe pour cet email, tu vas recevoir un lien de réinitialisation.
          </div>
        ) : (
          <>
            {state?.error && (
              <p className="mt-4 rounded-lg bg-danger/15 px-4 py-2 text-sm text-danger">
                {state.error}
              </p>
            )}
            <form action={action} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-medium uppercase tracking-wider text-text-muted"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="mt-1.5 w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-lg bg-gradient-to-r from-primary to-violet py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {pending ? "Envoi…" : "Envoyer le lien"}
              </button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-sm text-text-secondary">
          <Link href="/login" className="font-medium text-accent hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
