import { test, expect } from "@playwright/test";

test.use({ storageState: "tests/e2e/.auth/admin.json" });

const SECTIONS = [
  { path: "/panel", text: "Дашборд" },
  { path: "/panel/orders", text: "Управление статусами заказов" },
  { path: "/panel/products", text: "услуг в каталоге" },
  { path: "/panel/categories", text: "Категории" },
  { path: "/panel/options", text: "Опции заказа" },
  { path: "/panel/slides", text: "Слайды главной" },
  { path: "/panel/settings", text: "Настройки" },
];

test.describe("Скрытая админка /panel", () => {
  test("все 7 разделов открываются по скрытому пути с кукой админа (без 404)", async ({ page }) => {
    for (const s of SECTIONS) {
      const resp = await page.goto(s.path);
      expect(resp?.status(), `статус ${s.path}`).toBeLessThan(400);
      await expect(page.getByText(s.text).first()).toBeVisible({ timeout: 15000 });
    }
  });

  test("прямые /admin/* закрыты даже с валидной кукой админа", async ({ page }) => {
    for (const p of ["/admin", "/admin/orders", "/admin/products", "/admin/settings"]) {
      await page.goto(p);
      await expect(page).toHaveURL(/:\/\/localhost:\d+\/$/, `редирект ${p} → /`);
    }
  });

  test("CRUD товара: создать → переименовать → удалить", async ({ page }) => {
    await page.goto("/panel/products");
    await page.waitForLoadState("networkidle");

    const NAME = "E2E Тестовый товар";
    const NAME2 = "E2E Тестовый товар (изм.)";

    // CREATE
    await page.getByRole("button", { name: "+ Добавить товар" }).click();
    const nameInput = page.locator('form [data-testid="product-name"]');
    await nameInput.fill(NAME);
    await page.getByPlaceholder("300").fill("199");
    await page.getByRole("button", { name: "Сохранить" }).click();
    await expect(page.getByText("Товар добавлен")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("p.font-extrabold", { hasText: NAME }).first()).toBeVisible({ timeout: 15000 });

    // UPDATE
    const row = page.locator("div.bg-white.rounded-2xl", { hasText: NAME }).first();
    await row.getByRole("button").nth(2).click(); // 0=Хит, 1=Показан, 2=редактировать
    await nameInput.fill(NAME2);
    await page.getByRole("button", { name: "Сохранить" }).click();
    await expect(page.getByText("Товар обновлён")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("p.font-extrabold", { hasText: NAME2 }).first()).toBeVisible({ timeout: 15000 });

    // DELETE (confirm-диалог принимаем)
    page.on("dialog", (d) => d.accept());
    const row2 = page.locator("div.bg-white.rounded-2xl", { hasText: NAME2 }).first();
    await row2.getByRole("button").last().click();
    await expect(page.locator("p.font-extrabold", { hasText: NAME2 })).toHaveCount(0, { timeout: 15000 });
  });
});
