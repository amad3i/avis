// Захардкоженные данные для заглушки (DATA_MODE="mock").
//
// Данные дублируют то, что кладёт в базу prisma/seed.mjs, но возвращаются
// в том же виде, в каком их ожидают функции lib/data.js и компоненты.
// Ничего не пишется и не удаляется — это чисто in-memory "база" для
// визуальной демонстрации и деплоя без Neon.

import { siteSettingsMap, siteConfig } from "./site.config.js";

// Настройки берутся из ЕДИНОГО конфига бренда (lib/site.config.js).
// Поменял что-то там — изменилось и здесь (а значит на сайте, в админке,
// на кухне и в /admin/settings).
export const mockSettingsMap = {
  ...siteSettingsMap(),
  logo: process.env.NEXT_PUBLIC_LOGO || siteSettingsMap().logo || "/icon-192.png",
};

// Настройки в том виде, что возвращает getSettings()
export const mockSettings = {
  ...mockSettingsMap,
  logo: process.env.NEXT_PUBLIC_LOGO || mockSettingsMap.logo || "/icon-192.png",
};

const categoryDefs = siteConfig.menuCategories.map((c, i) => ({
  id: i + 1,
  name: c.name,
  emoji: c.emoji,
  icon: c.icon,
  sortOrder: c.sortOrder,
  active: c.active,
}));

// Товары берутся из ЕДИНОГО конфига меню (lib/site.config.js → menuProducts).
const productDefs = siteConfig.menuProducts;

// Нормализуем товары в вид, который ожидает lib/data.js (getProducts):
// поле `category` — объект, `sizes` — массив с sortOrder, `gallery` — строка.
let _pid = 1;
let _sid = 1;
export const mockProducts = productDefs.map((p, i) => {
  const cat = categoryDefs.find((c) => c.id === p.categoryId);
  const sizes = p.sizes.map((s) => ({
    id: _sid++,
    label: s.label,
    price: s.price,
    sortOrder: s.sortOrder ?? 1,
    productId: 0,
  }));
  const product = {
    id: _pid++,
    name: p.name,
    description: p.description,
    categoryId: p.categoryId,
    category: { id: cat.id, name: cat.name, emoji: cat.emoji, icon: cat.icon, sortOrder: cat.sortOrder, active: cat.active },
    image: p.image ?? null,
    zoom: p.zoom ?? 1,
    fit: p.fit ?? "contain",
    rotate: p.rotate ?? 0,
    whiteBg: p.whiteBg ?? false,
    gallery: "[]",
    emoji: cat.emoji,
    icon: p.icon ?? cat.icon,
    hit: p.hit ?? false,
    isNew: p.isNew ?? false,
    active: true,
    sortOrder: p.sortOrder ?? 0,
    sizes,
  };
  for (const s of product.sizes) s.productId = product.id;
  return product;
});

export const mockOptions = siteConfig.menuOptions.map((o, i) => ({
  id: i + 1,
  name: o.name,
  price: o.price,
  sortOrder: o.sortOrder,
  group: o.group,
  active: true,
}));

export const mockSlides = siteConfig.menuSlides.map((s, i) => ({
  id: i + 1,
  chip: s.chip,
  title: s.title,
  subtitle: s.subtitle,
  ctaText: s.ctaText,
  ctaLink: s.ctaLink,
  cta2Text: s.cta2Text,
  cta2Link: s.cta2Link,
  // Иллюстрации слайдов: зубные hero-SVG (файлы в public/demo).
  image: ["/photos/avis/01.jpg","/photos/avis/02.jpg","/photos/avis/03.jpg"][i],
  active: s.active,
  sortOrder: s.sortOrder,
}));

export const mockCategories = categoryDefs;

// Демо-заказы для заглушки.
//
// Сидятся в in-memory хранилище при старте, чтобы в демо-режиме сразу были
// заполнены: доска кухни, заказы в админке, аналитика — и чтобы ссылки
// `/order/<id>?token=...` открывались «из коробки» (можно сразу показывать
// клиенту живую страницу статуса заказа).
//
// Ссылки для демонстрации:
//   /order/1001?token=demo-token-dent-new
//   /order/1002?token=demo-token-dent-cooking
//   /order/1003?token=demo-token-dent-ready
//   /order/1004?token=demo-token-dent-done
//   /order/1005?token=demo-token-dent-canceled
//
// token и id фиксированы. updatedAt заданы так, чтобы статусы выглядели
// «свежими» (для проверки кнопки отмены в первый месяц достаточно).
function daysAgo(n, h = 0) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(d.getHours() - h);
  return d;
}

export const mockOrders = [
  {
    id: 1001,
    customerName: "Анастасия",
    phone: "+7 999 100-10-10",
    comment: "",
    pickupAt: "18:30",
    total: 6000,
    status: "new",
    canceledBy: null,
    prevStatus: null,
    cancelToken: "demo-token-dent-new",
    ip: "demo",
    createdAt: daysAgo(0, 0.4),
    updatedAt: daysAgo(0, 0.4),
    items: [
      { id: 1, productId: 4, name: "Лечение кариеса", sizeLabel: "Под ключ", price: 5500, quantity: 1, options: '[{"name":"Анестезия","price":500}]' },
    ],
  },
  {
    id: 1002,
    customerName: "Дмитрий",
    phone: "+7 999 200-20-20",
    comment: "Очень боюсь стоматологов, будьте аккуратнее",
    pickupAt: "19:00",
    total: 7500,
    status: "cooking",
    canceledBy: null,
    prevStatus: null,
    cancelToken: "demo-token-dent-cooking",
    ip: "demo",
    createdAt: daysAgo(0, 0.9),
    updatedAt: daysAgo(0, 0.2),
    items: [
      { id: 2, productId: 5, name: "Лечение корневых каналов", sizeLabel: "1 канал", price: 6500, quantity: 1, options: '[{"name":"Прицельный рентген-снимок","price":500},{"name":"Анестезия","price":500}]' },
    ],
  },
  {
    id: 1003,
    customerName: "Мария",
    phone: "+7 999 300-30-30",
    comment: "",
    pickupAt: "18:10",
    total: 4500,
    status: "ready",
    canceledBy: null,
    prevStatus: null,
    cancelToken: "demo-token-dent-ready",
    ip: "demo",
    createdAt: daysAgo(1, 2),
    updatedAt: daysAgo(0, 0.1),
    items: [
      { id: 3, productId: 11, name: "Профессиональная гигиена AirFlow", sizeLabel: "Полный курс", price: 4500, quantity: 1, options: "[]" },
    ],
  },
  {
    id: 1004,
    customerName: "Ольга",
    phone: "+7 999 400-40-40",
    comment: "",
    pickupAt: "17:40",
    total: 18000,
    status: "done",
    canceledBy: null,
    prevStatus: null,
    cancelToken: "demo-token-dent-done",
    ip: "demo",
    createdAt: daysAgo(1, 5),
    updatedAt: daysAgo(1, 4),
    items: [
      { id: 4, productId: 12, name: "Отбеливание Zoom 4", sizeLabel: "1 сеанс", price: 18000, quantity: 1, options: "[]" },
    ],
  },
  {
    id: 1005,
    customerName: "Сергей",
    phone: "+7 999 500-50-50",
    comment: "Отменил запись — уезжаю в командировку",
    pickupAt: "",
    total: 3000,
    status: "canceled",
    canceledBy: "kitchen",
    prevStatus: "new",
    cancelToken: "demo-token-dent-canceled",
    ip: "demo",
    createdAt: daysAgo(2, 3),
    updatedAt: daysAgo(2, 2.5),
    items: [
      { id: 5, productId: 8, name: "Удаление зуба", sizeLabel: "Простое", price: 3000, quantity: 1, options: "[]" },
    ],
  },
];
