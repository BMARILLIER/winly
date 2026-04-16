"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useActionState } from "react";
import { login, type AuthState } from "@/lib/actions/auth";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(login, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-surface-1 shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
        {/* Left panel — branding */}
        <div className="hidden md:flex md:w-1/2 flex-col items-center justify-center gap-6 bg-gradient-to-br from-primary/20 via-surface-2 to-violet/10 p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(139,92,246,0.12),transparent_70%)]" />
          <div className="relative">
            <Image
              src="/branding/winly-icon.png"
              alt="Winly"
              width={200}
              height={80}
              className="object-contain h-20"
              priority
            />
          </div>
          <div className="relative text-center">
            <p className="text-lg font-semibold text-foreground">
              Power Your Social Growth
            </p>
            <p className="mt-2 text-sm text-text-secondary max-w-[260px]">
              Analysez, optimisez et développez votre présence sur les réseaux sociaux.
            </p>
          </div>
          <div className="relative mt-4 flex gap-3">
            <span className="rounded-full bg-accent/15 px-3 py-1 text-[11px] text-accent">Analytics</span>
            <span className="rounded-full bg-primary/15 px-3 py-1 text-[11px] text-primary">IA</span>
            <span className="rounded-full bg-cyan/15 px-3 py-1 text-[11px] text-cyan">Growth</span>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex w-full flex-col justify-center p-8 sm:p-12 md:w-1/2">
          <div className="md:hidden mb-6 flex justify-center">
            <Image
              src="/branding/winly-icon.png"
              alt="Winly"
              width={140}
              height={56}
              className="object-contain h-8"
              priority
            />
          </div>

          <h1 className="text-2xl font-bold text-foreground">Bon retour</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Connectez-vous à votre compte.
          </p>

          {state?.error && (
            <p className="mt-4 rounded-lg bg-danger/15 px-4 py-2 text-sm text-danger">
              {state.error}
            </p>
          )}

          <form action={action} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider text-text-muted">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-1.5 w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-medium uppercase tracking-wider text-text-muted">
                  Mot de passe
                </label>
                <Link href="/forgot-password" className="text-xs text-accent hover:underline">
                  Oublié ?
                </Link>
              </div>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-gradient-to-r from-primary to-violet py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-all duration-200 cursor-pointer shadow-glow"
            >
              {pending ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-text-secondary">
            Pas encore de compte ?{" "}
            <Link href="/register" className="font-medium text-accent hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
