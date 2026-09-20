import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// Возврат к утверждённой салатовой палитре
const updates = {
  colorPrimary: "#689F38",
  colorPrimaryDark: "#558B2F",
  colorPrimaryLight: "#8BC34A",
  colorInk: "#1A1A2E",
  colorBg: "#F7F9F2",
  secondaryColor: "#FFC107",
};

for (const [key, value] of Object.entries(updates)) {
  await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
}
console.log("Салатовая палитра восстановлена");
await prisma.$disconnect();
