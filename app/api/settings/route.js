import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { getSettingsMap } from "@/lib/data";
import { requireRole } from "@/lib/auth";
import { sanitizeText, sanitizeUrl, sanitizePhone } from "@/lib/sanitize";

const URL_KEYS = new Set(["mapsUrl", "gisUrl", "instagram", "vkLink", "tgLink"]);
const PHONE_KEYS = new Set(["phoneHref"]);

export async function GET() {
  const settings = await getSettingsMap();
  return NextResponse.json({ settings });
}

export async function PUT(req) {
  const session = await requireRole("admin");
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const entries = Object.entries(body);

  for (const [key, value] of entries) {
    if (typeof value !== "string") continue;
    let clean;
    if (URL_KEYS.has(key)) clean = sanitizeUrl(value);
    else if (PHONE_KEYS.has(key)) clean = sanitizePhone(value);
    else clean = sanitizeText(value);
    await db.setting.upsert({
      where: { key },
      update: { value: clean },
      create: { key, value: clean },
    });
  }

  revalidateTag("settings");
  return NextResponse.json({ ok: true });
}
