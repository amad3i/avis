import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// Премиальная палитра: глубокий зелёный + тёплая бумага + графит
const updates = {
  colorPrimary: "#689F38",
  colorPrimaryDark: "#558B2F",
  colorPrimaryLight: "#8BC34A",
  colorInk: "#1A1A2E",
  colorBg: "#F7F9F2",
  secondaryColor: "#FFC107",
  seoTitle: "Шаурма Топ 1 - Бийск | У нас кушают все!",
  seoDescription:
    "Сочная шаурма, хот-доги в лаваше и детское меню в Бийске. Готовим при вас, самовывоз без очереди, оплата при получении. Предзаказ: +7 996 500-64-20",
  vkLink: "",
  tgLink: "",
  reviewsJson: JSON.stringify(
    [
      { name: "Алексей", text: "Лучшая шаурма в городе. Заворачивают при тебе, всё свежее - видно сразу.", stars: 5 },
      { name: "Марина", text: "Беру детскую сыну и топовую себе. Соусы - огонь, лаваш хрустит.", stars: 5 },
      { name: "Дмитрий", text: "Сделал предзаказ по телефону - забрал без очереди за 15 минут. Как надо.", stars: 5 },
    ],
    null,
    1
  ),
};

for (const [key, value] of Object.entries(updates)) {
  await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
}
console.log("Палитра и новые настройки применены");
await prisma.$disconnect();
