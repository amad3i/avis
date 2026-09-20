import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.setting.upsert({
    where: { key: "secondaryColor" },
    update: { value: "#22C55E" },
    create: { key: "secondaryColor", value: "#22C55E" },
  });
  const cur = await prisma.setting.findUnique({ where: { key: "secondaryColor" } });
  console.log("secondaryColor ->", cur?.value);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
