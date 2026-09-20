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
  const textFields = new Set(["chip", "title", "subtitle", "ctaText", "cta2Text"]);
  const urlFields = new Set(["ctaLink", "cta2Link", "image"]);
  const fields = ["chip", "title", "subtitle", "ctaText", "ctaLink", "cta2Text", "cta2Link", "image", "active", "sortOrder"];

  const data = {};
  for (const f of fields) {
    if (body[f] === undefined) continue;
    if (f === "sortOrder") data[f] = Number(body[f]);
    else if (textFields.has(f)) data[f] = sanitizeText(body[f], 200);
    else if (urlFields.has(f)) data[f] = sanitizeUrl(body[f]);
    else data[f] = body[f];
  }
  if (data.image === "") data.image = null;

  const slide = await db.slide.update({ where: { id: Number(id) }, data });
  revalidateTag("slides");
  return NextResponse.json({ slide });
}

export async function DELETE(req, { params }) {
  const session = await requireRole("admin");
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.slide.delete({ where: { id: Number(id) } });
  revalidateTag("slides");
  return NextResponse.json({ ok: true });
}
