import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== "winly-reset-2026") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const email = req.nextUrl.searchParams.get("email");
  const password = req.nextUrl.searchParams.get("password");
  const name = req.nextUrl.searchParams.get("name") ?? "Crowft";

  if (!email || !password) {
    return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
  }

  const passwordHash = await hash(password, 10);

  // Try to find existing user
  const existing = await prisma.user.findFirst({
    where: { email: email.toLowerCase() },
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { passwordHash },
    });
    return NextResponse.json({ ok: true, action: "password_updated", email: existing.email });
  }

  // Create new user
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      name,
      passwordHash,
      role: "admin",
      plan: "pro",
    },
  });

  return NextResponse.json({ ok: true, action: "user_created", email: user.email, id: user.id });
}
