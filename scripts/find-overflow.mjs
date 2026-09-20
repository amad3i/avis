import { chromium } from "@playwright/test";

const run = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 360, height: 780 } });
  await page.goto("http://localhost:3180/", { waitUntil: "networkidle" });
  const wide = await page.evaluate(() => {
    const docW = document.documentElement.clientWidth;
    const bad = [];
    for (const el of document.querySelectorAll("*")) {
      const r = el.getBoundingClientRect();
      if (r.width > docW + 1 || r.right > docW + 8 || r.left < -8) {
        bad.push(`${el.tagName}.${String(el.className).slice(0, 80)} w=${Math.round(r.width)} right=${Math.round(r.right)} left=${Math.round(r.left)}`);
      }
    }
    return { docW, bad: bad.slice(0, 20) };
  });
  console.log(JSON.stringify(wide, null, 2));
  await browser.close();
};
run();
