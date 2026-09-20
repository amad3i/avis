import { test as setup, expect } from "@playwright/test";
import fs from "fs";

const AUTH_FILE = "tests/e2e/.auth/admin.json";

setup("authenticate as admin via /panel", async ({ page }) => {
  fs.mkdirSync("tests/e2e/.auth", { recursive: true });
  await page.goto("/panel");
  await page.getByPlaceholder("Пароль").fill(process.env.ADMIN_PASSWORD || "admin123");
  await page.getByRole("button", { name: "Войти" }).click();
  await page.waitForURL("**/panel", { timeout: 20000 });
  await expect(page.getByRole("heading", { name: "Дашборд" })).toBeVisible({ timeout: 15000 });
  await page.context().storageState({ path: AUTH_FILE });
});
