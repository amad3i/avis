import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getAnalytics } from "@/lib/data";

export async function GET() {
  const session = await requireRole("admin", "kitchen");
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const data = await getAnalytics();
  return NextResponse.json(data);
}
