import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { sanitizeText } from "@/lib/sanitize";

export async function PATCH(req, { params }) {
  const session = await requireRole("admin");
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const { name, price, sortOrder, active, group } = await req.json();

  const data = {};
  if (name !== undefined) data.name = sanitizeText(name, 60);
  if (price !== undefined) data.price = Number(price);
  if (sortOrder !== undefined) data.sortOrder = Number(sortOrder);
  if (active !== undefined) data.active = active;
  if (group !== undefined) data.group = sanitizeText(group, 20);

  const option = await db.option.update({ where: { id: Number(id) }, data });
  revalidateTag("options");
  return NextResponse.json({ success: true, option });
}

export async function DELETE(req, { params }) {
  const session = await requireRole("admin");
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.option.delete({ where: { id: Number(id) } });
  revalidateTag("options");
  return NextResponse.json({ success: true });
}
