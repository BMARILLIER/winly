import { cookies } from "next/headers";

export const SESSION_COOKIE = "winly_session";

/**
 * Session cookie format: "userId:role"
 * getSession() returns only the userId for backward compatibility.
 */
export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value ?? null;
  if (!raw) return null;
  return raw.split(":")[0];
}

export async function setSession(userId: string, role: string = "free") {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, `${userId}:${role}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const userId = await getSession();
  if (!userId) return null;
  const { prisma } = await import("@/lib/db");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      workspaces: {
        include: { socialProfiles: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  return user;
}
