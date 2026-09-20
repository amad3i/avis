import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sanitizeToken } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const { id } = await params;
  const token = sanitizeToken(new URL(req.url).searchParams.get("token"));

  const order = await db.order.findUnique({ where: { id: Number(id) } });
  if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (!token || order.cancelToken !== token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ status: order.status, canceledBy: order.canceledBy });
}
