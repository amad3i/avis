import { describe, it, expect } from "vitest";
import { formatPrice, formatDate, parseGallery } from "@/lib/format";

describe("format utils", () => {
  it("formatPrice округляет и добавляет ₽", () => {
    expect(formatPrice(300)).toBe("300 ₽");
    expect(formatPrice(299.9)).toBe("300 ₽");
  });

  it("formatDate даёт читаемую дату и время", () => {
    const d = formatDate(new Date("2026-01-05T10:30:00").toISOString());
    expect(d).toMatch(/05\.01/);
    expect(d).toMatch(/10:30/);
  });

  it("parseGallery парсит JSON и фильтрует мусор", () => {
    expect(parseGallery('["/a.jpg","/b.jpg"]')).toEqual(["/a.jpg", "/b.jpg"]);
    expect(parseGallery("[]")).toEqual([]);
    expect(parseGallery("битый json")).toEqual([]);
    expect(parseGallery(null)).toEqual([]);
  });
});

describe("antispam", () => {
  it("itemsFingerprint одинаков для одного состава и разный для другого", async () => {
    const { itemsFingerprint } = await import("@/lib/antispam");
    const a = itemsFingerprint([{ productId: 1, sizeId: 2, optionIds: [3], quantity: 1 }]);
    const b = itemsFingerprint([{ productId: 1, sizeId: 2, optionIds: [3], quantity: 1 }]);
    const c = itemsFingerprint([{ productId: 1, sizeId: 2, optionIds: [3], quantity: 2 }]);
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });

  it("isDuplicateOrder ловит повтор за 30 сек", async () => {
    const { isDuplicateOrder } = await import("@/lib/antispam");
    const ip = `t-${Math.random()}`;
    expect(isDuplicateOrder(ip, "abc")).toBe(false);
    expect(isDuplicateOrder(ip, "abc")).toBe(true);
    expect(isDuplicateOrder(ip, "different")).toBe(false);
  });
});
