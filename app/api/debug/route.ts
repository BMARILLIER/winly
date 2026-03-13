import { NextResponse } from "next/server";

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;
  const dbUrl = process.env.DATABASE_URL;

  try {
    const { prisma } = await import("@/lib/db");
    const count = await prisma.user.count();
    return NextResponse.json({
      ok: true,
      userCount: count,
      hasTursoUrl: !!tursoUrl,
      hasTursoToken: !!tursoToken,
      dbUrlPrefix: dbUrl?.substring(0, 20),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const name = err instanceof Error ? err.constructor.name : "Unknown";
    return NextResponse.json({
      ok: false,
      error: name,
      message,
      hasTursoUrl: !!tursoUrl,
      hasTursoToken: !!tursoToken,
      dbUrlPrefix: dbUrl?.substring(0, 20),
    }, { status: 500 });
  }
}
