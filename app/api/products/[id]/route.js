import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { sanitizeText, sanitizeUrl } from "@/lib/sanitize";

export async function PATCH(req, { params }) {
  const session = await requireRole("admin");
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { name, description, categoryId, image, icon, hit, active, sortOrder, sizes, gallery } = body;
  const galleryArr = Array.isArray(gallery)
    ? gallery.map((u) => sanitizeUrl(u)).filter(Boolean).slice(0, 6)
    : undefined;
  const galleryJson = galleryArr ? JSON.stringify(galleryArr) : undefined;

  const data = {};
  if (name !== undefined) data.name = sanitizeText(name, 120);
  if (description !== undefined) data.description = sanitizeText(description, 2000);
  if (categoryId !== undefined) data.categoryId = Number(categoryId);
  if (image !== undefined) data.image = sanitizeUrl(image) || null;
  if (galleryJson !== undefined) data.gallery = galleryJson;
  if (icon !== undefined) data.icon = sanitizeText(icon, 40);
  if (hit !== undefined) data.hit = hit;
  if (active !== undefined) data.active = active;
  if (sortOrder !== undefined) data.sortOrder = Number(sortOrder);

  if (sizes) {
    data.sizes = {
      deleteMany: {},
      create: sizes
        .filter((s) => s.label?.trim() && Number(s.price) > 0)
        .map((s, idx) => ({ label: sanitizeText(s.label, 40), price: Number(s.price), sortOrder: s.sortOrder ?? idx + 1 })),
    };
  }

  const product = await db.product.update({
    where: { id: Number(id) },
    data,
    include: { sizes: { orderBy: { sortOrder: "asc" } } },
  });

  revalidateTag("products");
  return NextResponse.json({ product });
}

export async function DELETE(req, { params }) {
  const session = await requireRole("admin");
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const productId = Number(id);

  const usedInOrders = await db.orderItem.findFirst({ where: { productId } });
  if (usedInOrders) {
    await db.product.update({ where: { id: productId }, data: { active: false } });
    revalidateTag("products");
    return NextResponse.json({ ok: true, softDeleted: true });
  }

  await db.product.delete({ where: { id: productId } });
  revalidateTag("products");
  return NextResponse.json({ ok: true });
}
