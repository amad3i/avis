import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { sanitizeText } from "@/lib/sanitize";

export async function PATCH(req, { params }) {
  const session = await requireRole("admin");
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const { name, icon, sortOrder, active } = await req.json();

  const data = {};
  if (name !== undefined) data.name = sanitizeText(name, 80);
  if (icon !== undefined) data.icon = sanitizeText(icon, 40);
  if (sortOrder !== undefined) data.sortOrder = Number(sortOrder);
  if (active !== undefined) data.active = active;

  try {
    const category = await db.category.update({ where: { id: Number(id) }, data });
    revalidateTag("categories");
    revalidateTag("products");
    return NextResponse.json({ category });
  } catch {
    return NextResponse.json({ error: "Категория с таким названием уже есть" }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  const session = await requireRole("admin");
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const categoryId = Number(id);

  const used = await db.product.findFirst({ where: { categoryId } });
  if (used) {
    return NextResponse.json({ error: "Сначала перенесите или удалите товары категории" }, { status: 400 });
  }

  await db.category.delete({ where: { id: categoryId } });
  revalidateTag("categories");
  revalidateTag("products");
  return NextResponse.json({ ok: true });
}
