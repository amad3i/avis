import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { getProducts } from "@/lib/data";
import { requireRole } from "@/lib/auth";
import { sanitizeText, sanitizeUrl } from "@/lib/sanitize";

export async function GET() {
  const products = await getProducts(false);
  return NextResponse.json({ products });
}

export async function POST(req) {
  const session = await requireRole("admin");
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, description = "", categoryId, image, icon = "wrap", hit = false, active = true, sortOrder = 0, sizes = [], gallery } = body;
  const galleryArr = Array.isArray(gallery)
    ? gallery.map((u) => sanitizeUrl(u)).filter(Boolean).slice(0, 6)
    : undefined;
  const galleryJson = galleryArr ? JSON.stringify(galleryArr) : undefined;

  if (!name?.trim() || !categoryId) {
    return NextResponse.json({ error: "Название и категория обязательны" }, { status: 400 });
  }

  const product = await db.product.create({
    data: {
      name: sanitizeText(name, 120),
      description: sanitizeText(description, 2000),
      categoryId: Number(categoryId),
      image: sanitizeUrl(image) || null,
      gallery: galleryJson || "[]",
      icon: sanitizeText(icon, 40),
      hit,
      active,
      sortOrder: Number(sortOrder),
      sizes: {
        create: sizes
          .filter((s) => s.label?.trim() && Number(s.price) > 0)
          .map((s, idx) => ({ label: sanitizeText(s.label, 40), price: Number(s.price), sortOrder: s.sortOrder ?? idx + 1 })),
      },
    },
    include: { sizes: true },
  });

  revalidateTag("products");
  return NextResponse.json({ product });
}
