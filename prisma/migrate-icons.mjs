import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const catIcons = {
  "Шаурма": "wrap",
  "Хот-доги": "hotdog",
  "Детское меню": "kid",
  "Соусы": "sauce",
  "Напитки": "cup",
};

const prodIcons = {
  "Шаурма топовая": "wrap",
  "Шаурма с двойной курицей": "wrap",
  "Шаурма с грибами": "wrap",
  "Шаурма острая": "fire",
  "Шаурма с ананасами": "wrap",
  "Хот-дог в лаваше": "hotdog",
  "Детская шаурма": "kid",
  "Детский хот-дог": "kid",
  "Соус на выбор": "sauce",
  "Чай чёрный / зелёный": "cup",
  "Кофе 3 в 1": "coffee",
};

const prodImages = {
  "Шаурма топовая": "/images/menu_topovaya.jpg",
  "Шаурма с двойной курицей": "/images/menu_double_chicken.jpg",
  "Шаурма с грибами": "/images/menu_mushrooms.jpg",
  "Шаурма острая": "/images/menu_spicy.jpg",
  "Шаурма с ананасами": "/images/menu_pineapple.jpg",
  "Хот-дог в лаваше": "/images/menu_hotdog.jpg",
  "Детская шаурма": "/images/menu_topovaya.jpg",
  "Детский хот-дог": "/images/menu_hotdog.jpg",
  "Соус на выбор": "/images/menu_sauce.jpg",
  "Чай чёрный / зелёный": "/images/menu_tea.jpg",
  "Кофе 3 в 1": "/images/menu_coffee.jpg",
};

const newSettings = {
  mapLat: "52.535666",
  mapLng: "85.195530",
  mapZoom: "17",
  benefit1Icon: "leaf", benefit1Title: "Свежие продукты", benefit1Text: "Овощи и лаваш - каждый день",
  benefit2Icon: "fire", benefit2Title: "Готовим при вас", benefit2Text: "Филе на гриле, всё на глазах",
  benefit3Icon: "bolt", benefit3Title: "Быстрый самовывоз", benefit3Text: "Предзаказ - без очереди",
  benefit4Icon: "wallet", benefit4Title: "Оплата при получении", benefit4Text: "Никаких предоплат",
};

for (const [name, icon] of Object.entries(catIcons)) {
  await prisma.category.updateMany({ where: { name }, data: { icon } });
}
for (const [name, icon] of Object.entries(prodIcons)) {
  await prisma.product.updateMany({ where: { name }, data: { icon, image: prodImages[name] } });
}
for (const [key, value] of Object.entries(newSettings)) {
  await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
}
for (const [chip, data] of Object.entries({
  "Шаурма Топ 1 • Бийск": { image: "/images/hero_grill.jpg" },
  "Хит продаж": { image: "/images/hero_wraps.jpg" },
})) {
  await prisma.slide.updateMany({ where: { chip }, data });
}
console.log("Иконки, фото и настройки карты обновлены");
await prisma.$disconnect();
