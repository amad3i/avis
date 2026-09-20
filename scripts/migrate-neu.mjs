import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// Салатовый неоморфизм: мягкая база, сочный акцент
const updates = {
  colorPrimary: "#6FAE3A",
  colorPrimaryDark: "#5A9130",
  colorPrimaryLight: "#EAF2DF",
  secondaryColor: "#F5A623",
  colorInk: "#232B1D",
  colorBg: "#E9EDE2",
};

for (const [key, value] of Object.entries(updates)) {
  await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
}
console.log("Неоморфизм-палитра применена");
await prisma.$disconnect();
