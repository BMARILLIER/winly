import { NextRequest, NextResponse } from "next/server";
import { isProtected, isGuestOnly, getRequiredRole, getHomeRedirect } from "@/lib/routes/route-groups";

// Inline the cookie name to avoid importing the auth barrel (which pulls in Prisma/libsql — incompatible with Edge runtime)
const SESSION_COOKIE = "winly_session";

function parseSession(raw: string): { userId: string; role: string } {
  const sep = raw.indexOf(":");
  if (sep === -1) return { userId: raw, role: "user" };
  return { userId: raw.slice(0, sep), role: raw.slice(sep + 1) };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const raw = request.cookies.get(SESSION_COOKIE)?.value;
  const session = raw ? parseSession(raw) : null;

  // 1. Guest-only pages → connected users go to their home
  if (isGuestOnly(pathname) && session) {
    return NextResponse.redirect(new URL(getHomeRedirect(session.role), request.url));
  }

  // 2. Protected pages → unauthenticated users go to login
  if (isProtected(pathname) && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. Role-restricted pages → wrong role gets redirected
  if (session) {
    const required = getRequiredRole(pathname);
    if (required && session.role !== required.role) {
      return NextResponse.redirect(new URL(required.redirect, request.url));
    }
  }

  return NextResponse.next();
}

// matcher must be a static literal — Next.js parses it at compile time
export const config = {
  matcher: [
    "/login",
    "/register",
    "/dashboard/:path*",
    "/audit/:path*",
    "/score/:path*",
    "/action-plan/:path*",
    "/content/:path*",
    "/hooks/:path*",
    "/bio/:path*",
    "/repurpose/:path*",
    "/calendar/:path*",
    "/coach/:path*",
    "/radar/:path*",
    "/predict/:path*",
    "/missions/:path*",
    "/progress/:path*",
    "/share/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
    "/creator-score/:path*",
    "/trend-radar/:path*",
    "/analytics/:path*",
    "/growth/:path*",
    "/ai-insights/:path*",
    "/competitors/:path*",
    "/reports/:path*",
    "/growth-simulator/:path*",
    "/admin/:path*",
  ],
};
