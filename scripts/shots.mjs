import { chromium } from "@playwright/test";
import fs from "fs";

const BASE = "http://localhost:3180";
const OUT = "scripts/shots";
fs.mkdirSync(OUT, { recursive: true });

const run = async () => {
  const browser = await chromium.launch();
  for (const [name, vp] of [
    ["mobile", { width: 360, height: 780 }],
    ["tablet", { width: 768, height: 1024 }],
    ["desktop", { width: 1440, height: 900 }],
  ]) {
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(String(e)));

    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await page.screenshot({ path: `${OUT}/home-${name}.png` });

    // горизонтальный скролл-чек на мобиле
    if (name === "mobile") {
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      console.log(`mobile horizontal overflow: ${overflow}px`);
    }

    await page.goto(BASE + "/menu", { waitUntil: "networkidle" });
    await page.screenshot({ path: `${OUT}/menu-${name}.png` });

    await page.goto(BASE + "/product/12", { waitUntil: "networkidle" });
    await page.screenshot({ path: `${OUT}/product-${name}.png` });

    // админка: логин + дашборд
    await page.goto(BASE + "/panel", { waitUntil: "networkidle" });
    await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD || "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/panel", { timeout: 15000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}/admin-${name}.png` });

    await page.goto(BASE + "/panel/orders", { waitUntil: "networkidle" });
    await page.screenshot({ path: `${OUT}/admin-orders-${name}.png` });

    console.log(`${name}: console errors = ${errors.length}`, errors.slice(0, 3));
    await ctx.close();
  }
  await browser.close();
};

run().catch((e) => { console.error(e); process.exit(1); });
