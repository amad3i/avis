import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { getCategories } from "@/lib/data";
import { requireRole } from "@/lib/auth";
import { sanitizeText } from "@/lib/sanitize";

export async function GET() {
  const categories = await getCategories(false);
  return NextResponse.json({ categories });
}

export async function POST(req) {
  const session = await requireRole("admin");
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { name, icon = "wrap", sortOrder = 0, active = true } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Название обязательно" }, { status: 400 });

  try {
    const category = await db.category.create({
      data: { name: sanitizeText(name, 80), icon: sanitizeText(icon, 40), sortOrder: Number(sortOrder), active },
    });
    revalidateTag("categories");
    revalidateTag("products");
    return NextResponse.json({ category });
  } catch {
    return NextResponse.json({ error: "Категория с таким названием уже есть" }, { status: 400 });
  }
}
