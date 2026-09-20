import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

await prisma.setting.upsert({
  where: { key: "readyMinutes" },
  update: { value: "20" },
  create: { key: "readyMinutes", value: "20" },
});

const cnt = await prisma.option.count();
if (cnt === 0) {
  await prisma.option.createMany({
    data: [
      { name: "Дополнительный соус", price: 30, sortOrder: 1 },
      { name: "Дополнительный сыр", price: 50, sortOrder: 2 },
      { name: "Больше острого", price: 0, sortOrder: 3 },
      { name: "Без лука", price: 0, sortOrder: 4 },
    ],
  });
}
console.log("options in db:", await prisma.option.count());
await prisma.$disconnect();
