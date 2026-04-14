import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  exchangeCodeForToken,
  getLongLivedToken,
  getInstagramProfile,
  encryptToken,
} from "@/lib/services/instagram";

const APP_URL = process.env.NODE_ENV === "production"
  ? (process.env.NEXT_PUBLIC_APP_URL ?? "https://localhost:3000")
  : "https://localhost:3000";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  console.log("[instagram/callback] Params:", { code: code ? `${code.slice(0, 10)}...` : null, state: state?.slice(0, 10), error });

  // User denied access
  if (error) {
    return NextResponse.redirect(new URL("/settings?ig=denied", APP_URL));
  }

  // Missing params
  if (!code || !state) {
    console.error("[instagram/callback] Missing code or state");
    return NextResponse.redirect(new URL("/settings?ig=error", APP_URL));
  }

  // Validate CSRF state
  const cookieStore = await cookies();
  const storedState = cookieStore.get("ig_oauth_state")?.value;
  cookieStore.delete("ig_oauth_state");

  if (!storedState || storedState !== state) {
    console.error("[instagram/callback] CSRF state mismatch");
    return NextResponse.redirect(new URL("/settings?ig=error", APP_URL));
  }

  // Check auth
  const userId = await getSession();
  if (!userId) {
    return NextResponse.redirect(new URL("/login", APP_URL));
  }

  try {
    // 1. Exchange code for short-lived token
    console.log("[instagram/callback] Exchanging code for token...");
    const { access_token: shortToken } = await exchangeCodeForToken(code);
    console.log("[instagram/callback] Short-lived token obtained");

    // 2. Exchange for long-lived token (60 days)
    const { access_token: longToken, expires_in } = await getLongLivedToken(shortToken);
    console.log("[instagram/callback] Long-lived token obtained, expires_in:", expires_in);

    // 3. Get profile info
    const profile = await getInstagramProfile(longToken);
    console.log("[instagram/callback] Profile:", profile.username);

    // 4. Store encrypted token
    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);

    await prisma.instagramConnection.upsert({
      where: { userId },
      create: {
        userId,
        igUserId: profile.id,
        igUsername: profile.username,
        accessToken: encryptToken(longToken),
        tokenExpiresAt,
      },
      update: {
        igUserId: profile.id,
        igUsername: profile.username,
        accessToken: encryptToken(longToken),
        tokenExpiresAt,
      },
    });
    console.log("[instagram/callback] Connection saved for user:", userId);

    return NextResponse.redirect(new URL("/settings?ig=success", APP_URL));
  } catch (err) {
    console.error("[instagram/callback] Error:", err);
    return NextResponse.redirect(new URL("/settings?ig=error", APP_URL));
  }
}
