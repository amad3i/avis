import { PrismaClient } from "@prisma/client";
import { siteSettingsMap, siteConfig } from "../lib/site.config.js";

const prisma = new PrismaClient();

// Всё берётся из ЕДИНОГО конфига бренда (lib/site.config.js) — кофейня.
// Поменял название/цвета/меню там — сид зальёт уже новое.
const settings = { ...siteSettingsMap() };

const options = siteConfig.menuOptions;

const categories = siteConfig.menuCategories.map((c) => ({
  name: c.name,
  emoji: c.emoji,
  icon: c.icon,
  sortOrder: c.sortOrder,
}));

// Меню из конфига.
const products = siteConfig.menuProducts.map((p) => {
  const cat = siteConfig.menuCategories[p.categoryId - 1];
  return {
    name: p.name,
    category: cat.name,
    hit: p.hit || false,
    isNew: p.isNew || false,
    sortOrder: p.sortOrder,
    image: p.image || null,
    description: p.description,
    sizes: p.sizes,
  };
});

const slides = siteConfig.menuSlides.map((s) => ({
  chip: s.chip,
  title: s.title,
  subtitle: s.subtitle,
  ctaText: s.ctaText,
  ctaLink: s.ctaLink,
  cta2Text: s.cta2Text,
  cta2Link: s.cta2Link,
  image: null,
  sortOrder: s.sortOrder,
}));

async function main() {
  // Миграция фона: осветляем старый кремовый (#F7F9F2) до современного светлого.
  // До проверки идемпотентности, чтобы срабатывало при каждом сиде, но только
  // для старого значения — ручные правки в админке не затираются.
  try {
    const bg = await prisma.setting.findUnique({ where: { key: "colorBg" } });
    if (bg && bg.value && bg.value.toLowerCase() === "#f7f9f2") {
      await prisma.setting.update({ where: { key: "colorBg" }, data: { value: "#F8FAFC" } });
    }
  } catch {}

  // Миграция: убираем лишние суффиксы из названий размеров (граммы и т.п.)
  try {
    const prods = await prisma.product.findMany({ include: { sizes: true } });
    for (const p of prods) {
      for (const s of p.sizes) {
        const cleaned = s.label
          .replace(/\s*·\s*\d+\s*гр\.?/gi, "")
          .replace(/\s*сосиск[аи]?/gi, "")
          .replace(/\s+/g, " ")
          .trim();
        if (cleaned && cleaned !== s.label) {
          await prisma.size.update({ where: { id: s.id }, data: { label: cleaned } });
        }
      }
    }
  } catch {}

  // Миграция: выставляем иконку категории товарам без собственной иконки.
  try {
    const prods = await prisma.product.findMany({ include: { category: true } });
    for (const p of prods) {
      if (!p.icon && p.category?.icon) {
        await prisma.product.update({ where: { id: p.id }, data: { icon: p.category.icon } });
      }
    }
  } catch {}

  // Идемпотентность: если каталог уже есть — не трогаем данные (правки в админке сохраняются)
  const existing = await prisma.category.count();
  if (existing > 0) {
    console.log("Категории уже есть — сид пропущен, данные сохранены.");
    return;
  }

  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }

  // Опции (добавки) — пересоздаём полностью, чтобы убрать устаревшие
  await prisma.option.deleteMany({});
  await prisma.option.createMany({ data: options });

  for (const c of categories) {
    await prisma.category.upsert({
      where: { name: c.name },
      update: { emoji: c.emoji, icon: c.icon, sortOrder: c.sortOrder, active: true },
      create: c,
    });
  }

  await prisma.product.deleteMany({});
  for (const p of products) {
    const { category, sizes, ...data } = p;
    const cat = await prisma.category.findUnique({ where: { name: category } });
    await prisma.product.create({
      data: {
        ...data,
        icon: data.icon || cat.icon,
        categoryId: cat.id,
        sizes: { create: sizes.map((s, i) => ({ ...s, sortOrder: i + 1 })) },
      },
    });
  }

  await prisma.slide.deleteMany({});
  for (const s of slides) {
    await prisma.slide.create({ data: s });
  }

  console.log(
    `Сид выполнен: ${products.length} товаров, ${options.length} опций, ${categories.length} категорий, ${slides.length} слайдов`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
