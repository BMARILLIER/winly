/**
 * Route classification for middleware.
 *
 * Three categories:
 *   PROTECTED  — require an active session
 *   GUEST_ONLY — accessible only without session (login, register)
 *   ROLE_RULES — require a specific role (extensible)
 */

// Routes that require authentication
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/audit",
  "/score",
  "/action-plan",
  "/content",
  "/hooks",
  "/bio",
  "/repurpose",
  "/identity",
  "/calendar",
  "/coach",
  "/radar",
  "/predict",
  "/missions",
  "/progress",
  "/share",
  "/settings",
  "/onboarding",
  "/creator-score",
  "/trend-radar",
  "/analytics",
  "/growth",
  "/ai-insights",
  "/competitors",
  "/reports",
  "/growth-simulator",
  "/live-chat",
  "/persona",
  "/admin",
] as const;

// Routes reserved for unauthenticated visitors
const GUEST_ONLY_PREFIXES = ["/login", "/register"] as const;

// Routes restricted to a specific role → redirect target if unauthorized
type RoleRule = {
  prefixes: string[];
  role: string;
  redirect: string;
};

const ROLE_RULES: RoleRule[] = [
  { prefixes: ["/admin"], role: "admin", redirect: "/dashboard" },
  // { prefixes: ["/pro-features"], role: "pro", redirect: "/pricing" },
];

// --- Classifiers ---

export function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
}

export function isGuestOnly(pathname: string): boolean {
  return GUEST_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
}

export function getRequiredRole(
  pathname: string
): { role: string; redirect: string } | null {
  for (const rule of ROLE_RULES) {
    if (rule.prefixes.some((p) => pathname.startsWith(p))) {
      return { role: rule.role, redirect: rule.redirect };
    }
  }
  return null;
}

/**
 * Returns the best redirect target for a connected user
 * trying to access a guest-only page (login, register).
 */
export function getHomeRedirect(role: string): string {
  if (role === "admin") return "/admin";
  return "/dashboard";
}

// NOTE: The Next.js middleware `config.matcher` must be a static literal
// in middleware.ts. Keep it in sync with the arrays above when adding routes.
