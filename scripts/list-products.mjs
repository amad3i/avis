import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
const products = await db.product.findMany({
  include: { sizes: true, category: true },
  orderBy: [{ categoryId: "asc" }, { sortOrder: "asc" }],
});
for (const p of products) {
  console.log(`${p.id}\t${p.category.name}\t${p.name}\timg=${p.image || "-"}\t${p.sizes.map(s=>s.label+":"+s.price).join(",")}\thit=${p.hit} new=${p.isNew} active=${p.active}`);
}
const slides = await db.slide.findMany();
console.log("---slides---");
for (const s of slides) console.log(`${s.id}\t${s.title}\timg=${s.image||"-"}\tactive=${s.active}`);
await db.$disconnect();
