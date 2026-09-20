import { chromium } from "playwright";

const URL = process.env.URL || "http://localhost:3000";
const TOL = 0.5;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 3000 }, deviceScaleFactor: 2 });
await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(900);

const results = await page.evaluate(() => {
  const out = [];
  const getGlyph = (node) => {
    const r = document.createRange();
    r.selectNodeContents(node);
    return r.getBoundingClientRect();
  };
  const hasBlockChild = (el) => [...el.children].some((c) => /block|inline-block|flex/.test(getComputedStyle(c).display) && getComputedStyle(c).display.includes("block") ? true : /grid|flex/.test(getComputedStyle(c).display));
  for (const el of document.querySelectorAll("*")) {
    const re = el.getBoundingClientRect();
    if (re.width === 0 || re.height < 12 || re.height > 120) continue;
    const cs = getComputedStyle(el);
    if (cs.position === "fixed") continue;
    const display = cs.display;
    const isFlexCentered =
      (display.startsWith("inline-flex") || display.startsWith("flex")) &&
      cs.alignItems === "center";
    if (!isFlexCentered) continue;
    // only leaf-ish: no nested flex/grid children that carry different content
    const flexKids = [...el.children].filter((c) => /flex|grid/.test(getComputedStyle(c).display));
    if (flexKids.length) continue;
    const textNodes = [];
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let t;
    while ((t = w.nextNode())) if (t.textContent.trim()) textNodes.push(t);
    if (textNodes.length === 0) continue;
    const gc = getGlyph(textNodes[0]);
    if (!gc) continue;
    const delta = +(gc.top + gc.height / 2 - (re.top + re.height / 2)).toFixed(2);
    out.push({
      cls: typeof el.className === "string" ? el.className : "",
      text: (el.textContent || "").trim().slice(0, 12),
      h: Math.round(re.height),
      delta,
      lh: cs.lineHeight,
    });
  }
  out.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  return out;
});

await browser.close();

const bad = results.filter((r) => Math.abs(r.delta) > TOL);
console.log("== leaf pill deltas (px); negative = text above center ==");
for (const r of results.slice(0, 45)) {
  const flag = Math.abs(r.delta) > TOL ? "  <-- OUT" : "";
  console.log(`${r.delta >= 0 ? " " : ""}${String(r.delta).padStart(6)}px  h=${String(r.h).padStart(3)}  lh=${r.lh.padEnd(8)}  ${(r.cls || "").slice(0, 54)}  "${r.text}"${flag}`);
}
console.log(`\nMeasured: ${results.length}  |  out of tolerance (>${TOL}px): ${bad.length}`);
process.exit(bad.length ? 1 : 0);
