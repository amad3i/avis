import { test, expect } from "@playwright/test";

const PAGES = ["/", "/menu", "/product/1"];

test("ни на одной странице нет ошибок консоли/гидрации", async ({ page }) => {
  for (const path of PAGES) {
    const errors = [];
    const onConsole = (msg) => {
      if (msg.type() === "error") errors.push(`[console] ${msg.text().slice(0, 200)}`);
    };
    const onPageError = (err) => errors.push(`[pageerror] ${String(err).slice(0, 200)}`);
    page.on("console", onConsole);
    page.on("pageerror", onPageError);

    await page.goto(path, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    page.off("console", onConsole);
    page.off("pageerror", onPageError);

    expect(errors, `на ${path}: \n${errors.join("\n")}`).toEqual([]);
  }
});

test("прямой доступ к /admin и /kitchen закрыт", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL("http://localhost:3177/");
  await page.goto("/kitchen");
  await expect(page.getByText("Панель управления - вход для сотрудников")).toBeVisible();
  await page.goto("/panel");
  await expect(page.getByText("Панель управления - вход для сотрудников")).toBeVisible();
});
