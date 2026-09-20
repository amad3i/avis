import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { getSlides } from "@/lib/data";
import { requireRole } from "@/lib/auth";
import { sanitizeText, sanitizeUrl } from "@/lib/sanitize";

export async function GET() {
  const slides = await getSlides(false);
  return NextResponse.json({ slides });
}

export async function POST(req) {
  const session = await requireRole("admin");
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const { chip = "", title, subtitle = "", ctaText = "Смотреть услуги", ctaLink = "/#menu", cta2Text = "", cta2Link = "", image, active = true, sortOrder = 0 } = body;

  if (!title?.trim()) return NextResponse.json({ error: "Заголовок обязателен" }, { status: 400 });

  const slide = await db.slide.create({
    data: {
      chip: sanitizeText(chip, 40),
      title: sanitizeText(title, 120),
      subtitle: sanitizeText(subtitle, 200),
      ctaText: sanitizeText(ctaText, 60),
      ctaLink: sanitizeUrl(ctaLink),
      cta2Text: sanitizeText(cta2Text, 60),
      cta2Link: sanitizeUrl(cta2Link),
      image: sanitizeUrl(image) || null,
      active,
      sortOrder: Number(sortOrder),
    },
  });

  revalidateTag("slides");
  return NextResponse.json({ slide });
}
