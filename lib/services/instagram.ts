import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// ─── Config ───

const CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET ?? "";
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/instagram/callback`;
const ENCRYPT_KEY = process.env.SESSION_SECRET?.slice(0, 32).padEnd(32, "0") ?? "0".repeat(32);

// ─── Encryption ───

export function encryptToken(token: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-cbc", Buffer.from(ENCRYPT_KEY), iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptToken(encrypted: string): string {
  const [ivHex, encHex] = encrypted.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPT_KEY), iv);
  return Buffer.concat([decipher.update(Buffer.from(encHex, "hex")), decipher.final()]).toString("utf8");
}

// ─── OAuth URLs ───

export function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: "instagram_business_basic",
    response_type: "code",
    state,
  });
  return `https://www.instagram.com/oauth/authorize?${params}`;
}

// ─── Token Exchange ───

export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string;
  user_id: string;
}> {
  const res = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
      code,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Instagram token exchange failed: ${text}`);
  }

  return res.json();
}

// ─── Long-Lived Token ───

export async function getLongLivedToken(shortToken: string): Promise<{
  access_token: string;
  expires_in: number;
}> {
  const params = new URLSearchParams({
    grant_type: "ig_exchange_token",
    client_secret: CLIENT_SECRET,
    access_token: shortToken,
  });

  const res = await fetch(`https://graph.instagram.com/access_token?${params}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Instagram long-lived token failed: ${text}`);
  }

  return res.json();
}

// ─── Profile Info ───

export async function getInstagramProfile(accessToken: string): Promise<{
  id: string;
  username: string;
}> {
  const res = await fetch(
    `https://graph.instagram.com/v21.0/me?fields=user_id,username&access_token=${accessToken}`
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Instagram profile fetch failed: ${text}`);
  }

  const data = await res.json();
  return { id: data.user_id ?? data.id, username: data.username };
}
