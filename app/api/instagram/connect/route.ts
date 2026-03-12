import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { getSession } from "@/lib/auth";
import { buildAuthUrl } from "@/lib/services/instagram";

export async function GET() {
  const userId = await getSession();
  if (!userId) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
  }

  // Generate CSRF state token
  const state = randomBytes(32).toString("hex");

  // Store state in cookie for validation on callback
  const cookieStore = await cookies();
  cookieStore.set("ig_oauth_state", state, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
  });

  const authUrl = buildAuthUrl(state);
  return NextResponse.redirect(authUrl);
}
