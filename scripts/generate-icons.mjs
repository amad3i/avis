import sharp from "sharp";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { circleLogoMarkup } from "../lib/logo-paths.js";
import { siteConfig } from "../lib/site.config.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");
const APP_DIR = join(__dirname, "..", "app");

const BG = ""; // не используется — иконка = само зерно (без подложки)

function svgSquare(size) {
  // Цвет/масштаб зерна берём из единого white-label конфига (1 → все иконки).
  const { logoZoom, logoFill } = siteConfig.brand;
  return circleLogoMarkup({ size, figureFill: logoFill, zoom: logoZoom });
}

async function renderPng(size) {
  // Суперсэмплинг: рисуем в 2048 и даунскейлим lanczos3 — края чёткие,
  // без «шакального» постеризации, как при растеризации SVG вкладкой.
  const master = Math.max(size * 4, 2048);
  return await sharp(Buffer.from(svgSquare(master)))
    .resize(size, size, { fit: "fill", kernel: "lanczos3", withoutEnlargement: true })
    .png()
    .toBuffer();
}

function buildIco(pngs) {
  const count = pngs.length;
  const headerSize = 6 + 16 * count;
  let offset = headerSize;
  const entries = pngs.map(({ size, data }) => {
    const e = { size, offset, length: data.length };
    offset += data.length;
    return e;
  });
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);
  entries.forEach((e, i) => {
    const off = 6 + i * 16;
    header.writeUInt8(e.size === 256 ? 0 : e.size, off + 0);
    header.writeUInt8(e.size === 256 ? 0 : e.size, off + 1);
    header.writeUInt8(0, off + 2);
    header.writeUInt8(0, off + 3);
    header.writeUInt16LE(1, off + 4);
    header.writeUInt16LE(32, off + 6);
    header.writeUInt32LE(e.length, off + 8);
    header.writeUInt32LE(e.offset, off + 12);
  });
  return Buffer.concat([header, ...pngs.map((p) => p.data)]);
}

// ICO-слоты: 16/32/48 — стандарт, 96/192/256 — крупные (браузер берёт самый
// большой для вкладки/плиток). 256 в ICO кодируется байтом 0.
async function main() {
  const targets = [
    { name: "icon-96.png", size: 96 },
    { name: "icon-192.png", size: 192 },
    { name: "icon-512.png", size: 512 },
    { name: "apple-touch-icon.png", size: 180 },
  ];
  for (const t of targets) {
    const data = await renderPng(t.size);
    writeFileSync(join(publicDir, t.name), data);
    console.log("Wrote", t.name);
  }

  // Maskable: по спеке требует непрозрачный фон, но пользователь хочет прозрачный — оставляем так.
  const maskable = await renderPng(512);
  writeFileSync(join(publicDir, "icon-maskable-512.png"), maskable);
  console.log("Wrote maskable");

  const sizes = [16, 32, 48, 96, 192, 256];
  const pngs = await Promise.all(sizes.map(async (sz) => ({ size: sz, data: await renderPng(sz) })));
  const ico = buildIco(pngs);
  // Только favicon-white.ico (кеш-бастер): если в public/ лежит favicon.ico,
  // Next автогенерирует <link rel=icon href=/favicon.ico> со старым кешем —
  // вкладка застревает на устаревшей иконке. Имени favicon.ico избегаем.
  writeFileSync(join(publicDir, "favicon-white.ico"), ico);
  console.log("Wrote favicon-white.ico (public)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});