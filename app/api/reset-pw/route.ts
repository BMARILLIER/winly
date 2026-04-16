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

  if (!email || !password) {
    return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
  }

  // List all users if no match found
  const allUsers = await prisma.user.findMany({
    select: { id: true, email: true, name: true },
  });

  const user = allUsers.find((u) => u.email.toLowerCase().includes(email.toLowerCase()));

  if (!user) {
    return NextResponse.json({
      error: "User not found",
      availableEmails: allUsers.map((u) => u.email),
    }, { status: 404 });
  }

  const passwordHash = await hash(password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return NextResponse.json({ ok: true, email: user.email });
}
