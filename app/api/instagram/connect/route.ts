import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { getSession } from "@/lib/auth";
import { buildAuthUrl } from "@/lib/services/instagram";

const APP_URL = process.env.NODE_ENV === "production"
  ? (process.env.NEXT_PUBLIC_APP_URL ?? "https://localhost:3000")
  : "https://localhost:3000";

export async function GET() {
  try {
    const userId = await getSession();
    if (!userId) {
      return NextResponse.redirect(new URL("/login", APP_URL));
    }

    // Guard: refuse to start OAuth if credentials are missing
    if (!process.env.INSTAGRAM_CLIENT_ID || !process.env.INSTAGRAM_CLIENT_SECRET) {
      console.error("[instagram/connect] INSTAGRAM_CLIENT_ID or INSTAGRAM_CLIENT_SECRET is not set");
      return NextResponse.redirect(new URL("/settings?ig=error", APP_URL));
    }

    // Generate CSRF state token
    const state = randomBytes(32).toString("hex");

    // Store state in cookie for validation on callback
    const cookieStore = await cookies();
    cookieStore.set("ig_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
    });

    const authUrl = buildAuthUrl(state);
    console.log("[instagram/connect] Redirecting to:", authUrl);
    return NextResponse.redirect(authUrl);
  } catch (err) {
    console.error("[instagram/connect] Error:", err);
    return NextResponse.redirect(new URL("/settings?ig=error", APP_URL));
  }
}
