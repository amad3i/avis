import { describe, it, expect } from "vitest";

process.env.DATA_MODE = "mock";

describe("mock db & data layer", () => {
  it("returns settings from memory", async () => {
    const { getSettings } = await import("@/lib/data");
    const s = await getSettings();
    expect(s.shopName).toBe("WhiteDent");
    expect(s.colorPrimary).toBe("#14B8A6");
  });

  it("returns products with category, sizes and demo image paths", async () => {
    const { getProducts } = await import("@/lib/data");
    const products = await getProducts();
    expect(products.length).toBe(15);
    const first = products[0];
    expect(first.category).toBeDefined();
    expect(first.sizes.length).toBeGreaterThan(0);
    expect(first.category.name).toBe("Консультация и диагностика");
    // У услуг из конфига нет фото — карточка показывает иконку.
    expect(first.image).toBe(null);
  });

  it("returns categories with _count", async () => {
    const { getCategories } = await import("@/lib/data");
    const cats = await getCategories(false);
    expect(cats.length).toBe(5);
    expect(cats[0]._count.products).toBeGreaterThan(0);
  });

  it("returns slides and options", async () => {
    const { getSlides, getGlobalOptions } = await import("@/lib/data");
    const slides = await getSlides();
    expect(slides.length).toBe(3);
    expect(slides[0].image).toBe("/demo/hero-1.svg");
    const opts = await getGlobalOptions();
    expect(opts.length).toBe(6);
  });

  it("seeds demo orders with known tokens and statuses", async () => {
    const { db } = await import("@/lib/db");
    const orders = await db.order.findMany({ orderBy: { id: "asc" } });
    expect(orders.length).toBe(5);
    const byId = Object.fromEntries(orders.map((o) => [o.id, o]));
    expect(byId["1001"].status).toBe("new");
    expect(byId["1001"].cancelToken).toBe("demo-token-dent-new");
    expect(byId["1002"].status).toBe("cooking");
    expect(byId["1003"].status).toBe("ready");
    expect(byId["1004"].status).toBe("done");
    expect(byId["1005"].status).toBe("canceled");
    // /order/<id>?token=... читается через findUnique + items
    const demo = await db.order.findUnique({
      where: { id: 1002 },
      include: { items: true },
    });
    expect(demo.cancelToken).toBe("demo-token-dent-cooking");
    expect(demo.items.length).toBe(1);
    expect(demo.items[0].name).toBe("Лечение корневых каналов");
  });

  it("createOrder works against mock db", async () => {
    const { createOrder, validateOrderInput } = await import("@/lib/orders");
    const { value, error } = validateOrderInput({
      customerName: "Иван",
      phone: "+7 999 123-45-67",
      items: [{ productId: 4, sizeId: 4, optionIds: [1], quantity: 1 }],
    });
    expect(error).toBeUndefined();
    const order = await createOrder(value, "127.0.0.1");
    expect(order.id).toBe(1006); // демо-заказы занимают 1001..1005
    expect(order.items.length).toBe(1);
    expect(order.total).toBe(5500 + 500); // Лечение кариеса (product 4, size 4) + Анестезия (option 1)
    expect(order.status).toBe("new");
    expect(order.cancelToken).toBeDefined();
  });

  it("setOrderStatus works", async () => {
    const { setOrderStatus } = await import("@/lib/orders");
    const { db } = await import("@/lib/db");
    const created = await db.order.findUnique({ where: { id: 1006 } });
    const updated = await setOrderStatus(created.id, "cooking");
    expect(updated.status).toBe("cooking");
  });

  it("mock grants admin session (passwordless panels)", async () => {
    const { requireRole } = await import("@/lib/auth");
    const session = await requireRole("admin");
    expect(session).toBeTruthy();
    expect(session.role).toBe("admin");
  });

  it("orders board includes demo + created orders", async () => {
    const { db } = await import("@/lib/db");
    const rows = await db.order.findMany({ where: { status: { in: ["new", "cooking", "ready"] } }, include: { items: true } });
    const ids = rows.map((r) => r.id).sort((a, b) => a - b);
    expect(ids).toEqual([1001, 1002, 1003, 1006].sort((a, b) => a - b));
    expect(rows[0].items).toBeDefined();
  });
});