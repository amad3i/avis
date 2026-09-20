import { test, expect } from "@playwright/test";

test("полный путь: услуги → запись → заявка → регистратура видит", async ({ page }) => {
  // 1. Главная открывается, герой на месте
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();

  // 2. Переход в раздел услуг
  await page.goto("/menu");
  await expect(page.getByText("Все услуги")).toBeVisible();

  // 3. Добавляем первую услугу
  await page.getByRole("button", { name: /Записать/ }).first().click();
  await page.waitForTimeout(400);

  // 4. Открываем запись
  await page.getByRole("button", { name: /Записать/ }).first().click();
  await expect(page.getByText("Итого", { exact: false })).toBeVisible();

  // 5. Оформляем
  await page.getByRole("button", { name: "Записаться на приём" }).click();
  await page.getByPlaceholder("Иван").fill("Playwright Тест");
  await page.getByPlaceholder("+7 999 123-45-67").fill("+79995550011");
  await page.getByRole("button", { name: "Отправить заявку" }).click();

  // 6. Экран успеха с номером
  await expect(page.getByText(/№\d+ отправлена!/)).toBeVisible({ timeout: 10000 });

  // 7. Скрытый вход в регистратуру через /panel (пароль кухни)
  await page.goto("/panel");
  await page.getByPlaceholder("Пароль").fill(process.env.KITCHEN_PASSWORD || "kitchen123");
  await page.getByRole("button", { name: "Войти" }).click();
  await page.waitForURL("**/kitchen");
  await expect(page.getByText("Playwright Тест").first()).toBeVisible({ timeout: 15000 });

  // 8. Подтвердить запись
  await page.getByRole("button", { name: "Подтвердить запись" }).first().click();
  await expect(page.getByText("Подтверждаются")).toBeVisible();
});