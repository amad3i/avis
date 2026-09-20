import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// Палитра премиум-лайт: белый базовый, акцент #2ECC71, текст #1A1A2E
const updates = {
  colorPrimary: "#2ECC71",
  colorPrimaryDark: "#27AE60",
  colorPrimaryLight: "#E9FBF0",
  secondaryColor: "#F39C12",
  colorInk: "#1A1A2E",
  colorBg: "#F8F9FA",
};

for (const [key, value] of Object.entries(updates)) {
  await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
}
console.log("Палитра #2ECC71 применена");
await prisma.$disconnect();
