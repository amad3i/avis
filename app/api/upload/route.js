import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireRole } from "@/lib/auth";
import { put } from "@vercel/blob";

// Allowed image types and their on-disk extension. SVG/HTML/JS are intentionally
// excluded so a stored upload can never be served as an executable document.
const ALLOWED = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

// Verify the actual file content (magic bytes), not just the client-claimed type.
function sniffMime(buffer) {
  if (!buffer || buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47 &&
    buffer[4] === 0x0d && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a
  )
    return "image/png";
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return "image/gif";
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP")
    return "image/webp";
  return null;
}

export async function POST(req) {
  const session = await requireRole("admin");
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
  }

  const declared = file.type;
  if (!ALLOWED[declared]) {
    return NextResponse.json({ error: "Только JPG, PNG, WEBP или GIF" }, { status: 400 });
  }
  if (file.size > 4 * 1024 * 1024) {
    return NextResponse.json({ error: "Максимальный размер - 4 МБ" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const realType = sniffMime(buffer);
  if (!realType || realType !== declared) {
    return NextResponse.json(
      { error: "Содержимое файла не соответствует заявленному типу" },
      { status: 400 }
    );
  }

  const ext = ALLOWED[realType];
  const name = `${Date.now()}-${randomUUID()}.${ext}`;

  const blob = await put(name, buffer, {
    access: "public",
    contentType: realType,
  });

  return NextResponse.json({ url: blob.url });
}
