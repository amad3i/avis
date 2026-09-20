import { randomUUID } from "crypto";
import { db } from "./db";
import { log } from "./log";
import { sanitizeText, sanitizePhone } from "./sanitize";

export class OrderValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "OrderValidationError";
  }
}

const clampQty = (q) => Math.max(1, Math.min(50, Math.floor(Number(q) || 0)));

export function validateOrderInput(body) {
  const { customerName, phone, comment = "", pickupAt = "", items } = body || {};

  if (!customerName || typeof customerName !== "string" || customerName.trim().length < 2) {
    return { error: "Укажите имя (минимум 2 символа)" };
  }
  const digits = typeof phone === "string" ? phone.replace(/\D/g, "") : "";
  if (!/^[78]/.test(digits) || digits.length !== 11) {
    return { error: "Укажите корректный российский номер: 11 цифр, начинается с 7 или 8" };
  }
  if (!Array.isArray(items) || items.length === 0 || items.length > 30) {
    return { error: "Корзина пуста или переполнена" };
  }
  for (const item of items) {
    if (!Number.isInteger(item.productId) || !Number.isInteger(item.sizeId)) {
      return { error: "Некорректный состав корзины" };
    }
    const optOk =
      item.optionIds === undefined ||
      (Array.isArray(item.optionIds) &&
        item.optionIds.every((n) => Number.isInteger(Number(n)) && !Number.isNaN(Number(n))));
    if (!optOk) return { error: "Некорректные опции" };
  }
  return {
    value: {
      customerName: sanitizeText(customerName, 100),
      phone: sanitizePhone(phone, 30),
      comment: sanitizeText(comment, 500),
      pickupAt: sanitizeText(pickupAt, 50),
      items: items.slice(0, 30).map((i) => ({
        productId: i.productId,
        sizeId: i.sizeId,
        optionIds: Array.isArray(i.optionIds) ? i.optionIds.slice(0, 10).map(Number) : [],
        quantity: clampQty(i.quantity),
      })),
    },
  };
}

export const CANCEL_GRACE_MS = 15_000;

export class OrderStateConflictError extends Error {
  constructor(message = "Статус заказа уже изменился") {
    super(message);
    this.name = "OrderStateConflictError";
  }
}

export async function createOrder(input, ip = "") {
  const sizeIds = [...new Set(input.items.map((i) => i.sizeId))];
  const optionIds = [...new Set(input.items.flatMap((i) => i.optionIds))];

  const [sizes, options] = await Promise.all([
    db.size.findMany({ where: { id: { in: sizeIds } }, include: { product: true } }),
    optionIds.length ? db.option.findMany({ where: { id: { in: optionIds }, active: true } }) : [],
  ]);

  const orderItems = [];
  let total = 0;

  for (const item of input.items) {
    const size = sizes.find((s) => s.id === item.sizeId);
    if (!size) {
      throw new OrderValidationError("Позиция недоступна, обновите корзину");
    }
    if (!size.product.active || size.productId !== item.productId) {
      throw new OrderValidationError(`«${size.product.name}» недоступен, обновите корзину`);
    }

    const chosen = item.optionIds
      .map((id) => options.find((o) => o.id === id))
      .filter(Boolean);
    const optionsTotal = chosen.reduce((a, o) => a + o.price, 0);

    total += (size.price + optionsTotal) * item.quantity;
    orderItems.push({
      productId: size.productId,
      name: size.product.name,
      sizeLabel: size.label,
      price: size.price + optionsTotal,
      quantity: item.quantity,
      options: JSON.stringify(chosen.map((o) => ({ name: o.name, price: o.price }))),
    });
  }

  const cancelToken = randomUUID();

  const order = await db.order.create({
    data: {
      cancelToken,
      customerName: input.customerName,
      phone: input.phone,
      comment: input.comment,
      pickupAt: input.pickupAt,
      total,
      ip: (ip || "").slice(0, 60),
      items: { create: orderItems },
    },
    include: { items: true },
  });

  log.info("Order created", { orderId: order.id, total, phone: input.phone });

  return order;
}

export async function setOrderStatus(orderId, status, extra = {}, from = null) {
  const where = { id: orderId };
  if (from) where.status = Array.isArray(from) ? { in: from } : from;
  try {
    const order = await db.order.update({
      where,
      data: { status, ...extra },
      include: { items: true },
    });
    log.info("Order status changed", { orderId, status });
    return order;
  } catch (e) {
    if (e && e.code === "P2025") throw new OrderStateConflictError();
    throw e;
  }
}
