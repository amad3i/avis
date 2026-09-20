import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  let database = "down";
  try {
    await db.$queryRaw`SELECT 1`;
    database = "up";
  } catch {}

  const healthy = database === "up";

  return NextResponse.json(
    {
      success: healthy,
      status: healthy ? "ok" : "degraded",
  checks: {
    database,
  },
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 }
  );
}
