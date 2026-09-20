import { unstable_cache } from "next/cache";
import { db } from "./db";
import { isMock } from "./config";
import { siteSettingsMap, siteConfig } from "./site.config";

// Слово, убираемое из названий размеров (по white-label конфигу, напр. «сосиска»).
function cleanSizeWord() {
  const word = siteConfig.technical.sizeWord;
  if (!word) return /(?:)/;
  return new RegExp(`\\s*${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[аи]?`, "gi");
}

// Единый источник дефолтных настроек — lib/site.config.js (white-label конфиг).
// Ключи совпадают с полями /admin/settings.
function settingsDefaults() {
  const base = siteSettingsMap();
  return {
    shopName: base.shopName,
    slogan: base.slogan,
    phone: base.phone,
    phoneHref: base.phoneHref,
    address: base.address,
    hoursWeekday: base.hoursWeekday,
    hoursWeekend: base.hoursWeekend,
    instagram: base.instagram,
    instagramHandle: base.instagramHandle,
    vkLink: base.vkLink,
    tgLink: base.tgLink,
    mapsUrl: base.mapsUrl,
    gisUrl: base.gisUrl,
    rating: base.rating,
    reviewCount: base.reviewCount,
    yandexRating: base.yandexRating,
    yandexReviewCount: base.yandexReviewCount,
    colorPrimary: base.colorPrimary,
    colorPrimaryDark: base.colorPrimaryDark,
    colorPrimaryLight: base.colorPrimaryLight,
    secondaryColor: base.secondaryColor,
    colorInk: base.colorInk,
    colorBg: base.colorBg,
    aboutTitle: base.aboutTitle,
    aboutText: base.aboutText,
    seoTitle: base.seoTitle,
    seoDescription: base.seoDescription,
    readyMinutes: base.readyMinutes,
    reviewsJson: base.reviewsJson,
    heroScrim: base.heroScrim,
    logo: process.env.NEXT_PUBLIC_LOGO || base.logo || "/icon-192.png",
  };
}

// ---- Заглушка (DATA_MODE="mock"): данные читаются из in-memory хранилища
// (lib/db-mock.js), которое на старте заполняется из lib/mock-data.js.
// Хранилище живёт в памяти процесса: изменения из админки видны до рестарта.
const _mock = {
  getSettings: async () => {
    const rows = await db.setting.findMany({ orderBy: { key: "asc" } });
    const map = {};
    for (const row of rows) map[row.key] = row.value;
    return {
      ...settingsDefaults(),
      ...map,
    };
  },
  getSettingsMap: async () => {
    const rows = await db.setting.findMany();
    const map = {};
    for (const row of rows) map[row.key] = row.value;
    return map;
  },
  getProducts: async (onlyActive = true) => {
    const products = await db.product.findMany({
      where: onlyActive ? { active: true } : {},
      orderBy: [{ hit: "desc" }, { sortOrder: "asc" }, { id: "asc" }],
      include: { sizes: { orderBy: { sortOrder: "asc" } }, category: true },
    });
    return products.map((p) => ({
      ...p,
      sizes: p.sizes.map((s) => ({
        ...s,
        // убираем граммы (питы) и слово «сосиска» из названий размеров
        label: s.label
           .replace(/\s*[·•]\s*\d+\s*гр\.?/gi, "")
           .replace(cleanSizeWord(), "")
           .replace(/\s+/g, " ")
           .trim(),
       })),
    }));
  },
  getCategories: async (onlyActive = true) =>
    onlyActive
      ? db.category.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } })
      : db.category.findMany({
          orderBy: { sortOrder: "asc" },
          include: { _count: { select: { products: true } } },
        }),
  getSlides: async (onlyActive = true) =>
    db.slide.findMany({ where: onlyActive ? { active: true } : {}, orderBy: { sortOrder: "asc" } }),
  getGlobalOptions: async (onlyActive = true) =>
    db.option.findMany({ where: onlyActive ? { active: true } : {}, orderBy: { sortOrder: "asc" } }),
};

// Orders/analytics в заглушке не имеют смысла (работают через dbMock), поэтому
// их НЕ подменяем здесь. Но getOrders не оборачиваем в unstable_cache в mock.

// В mock-режиме unstable_cache (Next runtime) не нужен: данные и так из памяти.
// Оборачиваем в кэш только "боевой" путь, чтобы интерфейс остался прежним.

const _settingsCached = unstable_cache(
  async () => {
    const rows = await db.setting.findMany();
    const map = {};
    for (const row of rows) map[row.key] = row.value;
    return {
      ...settingsDefaults(),
      ...map,
    };
  },
  ["settings"],
  { tags: ["settings"] }
);

export const getSettings = () => (isMock ? _mock.getSettings() : _settingsCached());

const _settingsMapCached = unstable_cache(
  async () => {
    const rows = await db.setting.findMany();
    const map = {};
    for (const row of rows) map[row.key] = row.value;
    return map;
  },
  ["settings-map"],
  { tags: ["settings"] }
);

export const getSettingsMap = () =>
  isMock ? _mock.getSettingsMap() : _settingsMapCached();

export const getAnalytics = unstable_cache(
  async () => {
    const since = new Date();
    since.setDate(since.getDate() - 6);
    since.setHours(0, 0, 0, 0);

    const [orders, topItems] = await Promise.all([
      db.order.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true, total: true, status: true, items: { select: { name: true, quantity: true } } },
      }),
      db.orderItem.groupBy({
        by: ["name"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
    ]);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(since);
      d.setDate(d.getDate() + i);
      const key = d.toDateString();
      const dayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === key && o.status !== "canceled");
      days.push({
        date: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString(siteConfig.technical.locale, { weekday: "short" }),
        count: dayOrders.length,
        revenue: dayOrders.reduce((a, o) => a + o.total, 0),
      });
    }

    const statusCounts = { new: 0, cooking: 0, ready: 0, done: 0, canceled: 0 };
    for (const o of orders) {
      if (statusCounts[o.status] !== undefined) statusCounts[o.status]++;
    }

    const today = new Date().toDateString();
    const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === today);

    return {
      days,
      statusCounts,
      topProducts: topItems.map((t) => ({ name: t.name, quantity: t._sum.quantity || 0 })),
      today: {
        count: todayOrders.length,
        revenue: todayOrders.filter((o) => o.status !== "canceled").reduce((a, o) => a + o.total, 0),
        avgTicket:
          todayOrders.length > 0
            ? Math.round(todayOrders.reduce((a, o) => a + o.total, 0) / todayOrders.length)
            : 0,
      },
    };
  },
  ["analytics"],
  { tags: ["analytics"], revalidate: 15 }
);

const _ordersCached = (status = "all") =>
  unstable_cache(
    async () => {
      let where = {};
      if (status === "active") where = { status: { in: ["new", "cooking", "ready"] } };
      else if (status === "board") where = { status: { in: ["new", "cooking", "ready", "canceled"] } };
      else if (status && status !== "all") where = { status };
      return db.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: status === "board" ? 50 : 200,
        include: { items: true },
      });
    },
    ["orders", status],
    { tags: ["orders"] }
  )();

export const getOrders = (status = "all") => {
  if (isMock) {
    let where = {};
    if (status === "active") where = { status: { in: ["new", "cooking", "ready"] } };
    else if (status === "board") where = { status: { in: ["new", "cooking", "ready", "canceled"] } };
    else if (status && status !== "all") where = { status };
    return db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: status === "board" ? 50 : 200,
      include: { items: true },
    });
  }
  return _ordersCached(status);
};

const _productsActive = unstable_cache(
  async () =>
    db.product.findMany({
      where: { active: true },
      orderBy: [{ hit: "desc" }, { sortOrder: "asc" }, { id: "asc" }],
      include: { sizes: { orderBy: { sortOrder: "asc" } }, category: true },
    }),
  ["products-active"],
  { tags: ["products"] }
);

const _productsAll = unstable_cache(
  async () =>
    db.product.findMany({
      orderBy: [{ hit: "desc" }, { sortOrder: "asc" }, { id: "asc" }],
      include: { sizes: { orderBy: { sortOrder: "asc" } }, category: true },
    }),
  ["products-all"],
  { tags: ["products"] }
);

export const getProducts = (onlyActive = true) => {
  if (isMock) return _mock.getProducts(onlyActive);
  return (onlyActive ? _productsActive() : _productsAll()).then((products) =>
    products.map((p) => ({
      ...p,
sizes: p.sizes.map((s) => ({
         ...s,
         // убираем граммы (питы) и слово-единицу длины (по конфигу, напр. «сосиска»)
         // из названий размеров
         label: s.label
           .replace(/\s*[·•]\s*\d+\s*гр\.?/gi, "")
           .replace(cleanSizeWord(), "")
           .replace(/\s+/g, " ")
           .trim(),
       })),
     }))
   );
 };

const _categoriesActive = unstable_cache(
  async () => db.category.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ["categories-active"],
  { tags: ["categories"] }
);

const _categoriesAll = unstable_cache(
  async () =>
    db.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: true } } },
    }),
  ["categories-all"],
  { tags: ["categories"] }
);

export const getCategories = (onlyActive = true) => {
  if (isMock) return _mock.getCategories(onlyActive);
  return onlyActive ? _categoriesActive() : _categoriesAll();
};

const _slidesActive = unstable_cache(
  async () => db.slide.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ["slides-active"],
  { tags: ["slides"] }
);

const _slidesAll = unstable_cache(
  async () => db.slide.findMany({ orderBy: { sortOrder: "asc" } }),
  ["slides-all"],
  { tags: ["slides"] }
);

export const getSlides = (onlyActive = true) => {
  if (isMock) return _mock.getSlides(onlyActive);
  return onlyActive ? _slidesActive() : _slidesAll();
};

const _optionsActive = unstable_cache(
  async () => db.option.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ["options-active"],
  { tags: ["options"] }
);

const _optionsAll = unstable_cache(
  async () => db.option.findMany({ orderBy: { sortOrder: "asc" } }),
  ["options-all"],
  { tags: ["options"] }
);

export const getGlobalOptions = (onlyActive = true) => {
  if (isMock) return _mock.getGlobalOptions(onlyActive);
  return onlyActive ? _optionsActive() : _optionsAll();
};
