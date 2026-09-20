import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { getGlobalOptions } from "@/lib/data";
import { requireRole } from "@/lib/auth";
import { sanitizeText } from "@/lib/sanitize";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all");
  const session = all ? await requireRole("admin") : null;

  if (all && !session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const options = await getGlobalOptions(all ? false : true);
  return NextResponse.json({ success: true, options });
}

export async function POST(req) {
  const session = await requireRole("admin");
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { name, price = 0, sortOrder = 0, active = true, group = "addon" } = await req.json();
  if (!name?.trim() || typeof price !== "number" || price < 0) {
    return NextResponse.json({ success: false, error: "Название и цена обязательны" }, { status: 400 });
  }

  const option = await db.option.create({
    data: { name: sanitizeText(name, 60), price, sortOrder: Number(sortOrder), active, group: sanitizeText(group, 20) },
  });
  revalidateTag("options");
  return NextResponse.json({ success: true, option });
}
