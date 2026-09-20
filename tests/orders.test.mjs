import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { validateOrderInput, createOrder, OrderValidationError, setOrderStatus } from "@/lib/orders";
import { rateLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";

const validInput = {
  customerName: "Тест Тестов",
  phone: "+7 999 111-22-33",
  comment: "тест",
  pickupAt: "12:30",
  items: [],
};

async function firstSize(productId) {
  const product = await db.product.findFirst({ where: { active: true }, include: { sizes: true } });
  const size = productId
    ? (await db.product.findUnique({ where: { id: productId }, include: { sizes: true } })).sizes[0]
    : product.sizes[0];
  return { product: productId ? productId : product.id, size };
}

beforeAll(async () => {
  await db.order.deleteMany({ where: { phone: "+7 999 111-22-33" } });
  await db.order.deleteMany({ where: { customerName: "Тест Тестов" } });
});

afterAll(async () => {
  await db.order.deleteMany({ where: { customerName: "Тест Тестов" } });
  await db.$disconnect();
});

describe("validateOrderInput", () => {
  it("отклоняет пустое имя", () => {
    const { error } = validateOrderInput({ ...validInput, customerName: "  " });
    expect(error).toBeTruthy();
  });

  it("отклоняет короткое имя", () => {
    const { error } = validateOrderInput({ ...validInput, customerName: "Я" });
    expect(error).toBeTruthy();
  });

  it("отклоняет битый телефон", () => {
    const { error } = validateOrderInput({ ...validInput, phone: "123" });
    expect(error).toBeTruthy();
  });

  it("отклоняет пустую корзину", () => {
    const { error } = validateOrderInput(validInput);
    expect(error).toBeTruthy();
  });

  it("отклоняет нецелые id", () => {
    const { error } = validateOrderInput({
      ...validInput,
      items: [{ productId: "abc", sizeId: 1, quantity: 1 }],
    });
    expect(error).toBeTruthy();
  });

  it("принимает корректный заказ и нормализует поля", () => {
    const { value, error } = validateOrderInput({
      ...validInput,
      items: [{ productId: 1, sizeId: 27, quantity: 999, optionIds: [1, "2"] }],
    });
    expect(error).toBeUndefined();
    expect(value.items[0].quantity).toBe(50);
    expect(value.items[0].optionIds).toEqual([1, 2]);
  });
});

describe("createOrder", () => {
  it("считает цену строго по БД и снапшотит позиции", async () => {
    const { product, size } = await firstSize();
    const order = await createOrder({
      ...validInput,
      items: [{ productId: product, sizeId: size.id, optionIds: [], quantity: 2 }],
    });

    expect(order.total).toBe(size.price * 2);
    expect(order.items[0].name).toBeTruthy();
    expect(order.items[0].price).toBe(size.price);
    expect(order.status).toBe("new");
  });

  it("считает опции и сохраняет их снапшот", async () => {
    const option = await db.option.findFirst({ where: { active: true, price: { gt: 0 } } });
    const { product, size } = await firstSize();

    const order = await createOrder({
      ...validInput,
      items: [{ productId: product, sizeId: size.id, optionIds: [option.id], quantity: 1 }],
    });

    expect(order.total).toBe(size.price + option.price);
    const opts = JSON.parse(order.items[0].options);
    expect(opts[0].name).toBe(option.name);
  });

  it("отклоняет несуществующий sizeId", async () => {
    await expect(
      createOrder({ ...validInput, items: [{ productId: 1, sizeId: 999999, optionIds: [], quantity: 1 }] })
    ).rejects.toBeInstanceOf(OrderValidationError);
  });

  it("отклоняет подмену productId (sizeId от другого товара)", async () => {
    const other = await db.product.findFirst({
      where: { id: { not: 1 }, active: true },
      include: { sizes: true },
    });
    await expect(
      createOrder({
        ...validInput,
        items: [{ productId: 1, sizeId: other.sizes[0].id, optionIds: [], quantity: 1 }],
      })
    ).rejects.toBeInstanceOf(OrderValidationError);
  });

  it("не принимает неактивный товар", async () => {
    const inactive = await db.product.findFirst({ where: { active: false } });
    if (!inactive) return;
    const size = await db.size.findFirst({ where: { productId: inactive.id } });
    if (!size) return;
    await expect(
      createOrder({ ...validInput, items: [{ productId: inactive.id, sizeId: size.id, optionIds: [], quantity: 1 }] })
    ).rejects.toBeInstanceOf(OrderValidationError);
  });
});

describe("setOrderStatus", () => {
  it("меняет статус заказа", async () => {
    const { product, size } = await firstSize();
    const order = await createOrder({
      ...validInput,
      items: [{ productId: product, sizeId: size.id, optionIds: [], quantity: 1 }],
    });
    const updated = await setOrderStatus(order.id, "cooking");
    expect(updated.status).toBe("cooking");
    await setOrderStatus(order.id, "done");
  });
});

describe("rateLimit", () => {
  it("пропускает до лимита и блокирует после", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 10; i++) {
      expect(rateLimit(key, 10, 60000).ok).toBe(true);
    }
    const blocked = rateLimit(key, 10, 60000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("разные ключи независимы", () => {
    expect(rateLimit("test-a", 1, 60000).ok).toBe(true);
    expect(rateLimit("test-b", 1, 60000).ok).toBe(true);
  });
});
