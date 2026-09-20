import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const updates = {
  colorPrimary: "#22C55E",
  colorPrimaryDark: "#16A34A",
  colorPrimaryLight: "#DCFCE7",
  colorInk: "#1A1A2E",
  colorBg: "#F8F9FA",
};

async function main() {
  for (const [key, value] of Object.entries(updates)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    console.log(`✓ ${key} = ${value}`);
  }
  console.log("\nГотово. Перезапустите приложение.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
