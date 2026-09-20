import fs from "node:fs";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// 1. Дефолты в seed и data.js
for (const f of ["prisma/seed.mjs", "lib/data.js"]) {
  let t = fs.readFileSync(f, "utf8");
  t = t.replace(/colorPrimary: "[^"]+",/, 'colorPrimary: "#689F38",');
  t = t.replace(/colorPrimaryDark: "[^"]+",/, 'colorPrimaryDark: "#558B2F",');
  t = t.replace(/colorPrimaryLight: "[^"]+",/, 'colorPrimaryLight: "#8BC34A",');
  t = t.replace(/secondaryColor: "[^"]+",/, 'secondaryColor: "#FFC107",');
  t = t.replace(/colorInk: "[^"]+",/, 'colorInk: "#1A1A2E",');
  t = t.replace(/colorBg: "[^"]+",/, 'colorBg: "#F7F9F2",');
  fs.writeFileSync(f, t);
}

// 2. Палитра в БД
const updates = {
  colorPrimary: "#689F38",
  colorPrimaryDark: "#558B2F",
  colorPrimaryLight: "#8BC34A",
  secondaryColor: "#FFC107",
  colorInk: "#1A1A2E",
  colorBg: "#F7F9F2",
};
for (const [key, value] of Object.entries(updates)) {
  await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
}
console.log("Палитра #689F38 восстановлена (БД + дефолты)");
await prisma.$disconnect();
