import { test } from "@playwright/test";
import fs from "node:fs";

const OUT_DIR = "/tmp/wills-audit";
fs.mkdirSync(OUT_DIR, { recursive: true });

test.use({ baseURL: "http://localhost:3000" });

test("sticky scroll trace", async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/writing/wills-and-estate-planning", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 60_000 });
  await page.waitForTimeout(1500);
  const vizY = await page.evaluate(() => {
    const el = document.querySelector('section[aria-label^="Deliverables tree"]');
    return el ? window.scrollY + el.getBoundingClientRect().top : -1;
  });
  if (vizY < 0) throw new Error("deliverables-tree section not found");
  const traces: Array<{ scroll: number; rightTop: number; gridTop: number; gridBottom: number }> = [];
  for (const offset of [0, 200, 500, 1000, 2000, 3000]) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), vizY + offset);
    await page.waitForTimeout(150);
    const data = await page.evaluate(() => {
      const viz = document.querySelector('section[aria-label^="Deliverables tree"]');
      const grid = viz?.querySelector("div.grid.gap-5") as HTMLElement | null;
      if (!grid) return { rightTop: 0, gridTop: 0, gridBottom: 0 };
      const right = grid.children[1] as HTMLElement | undefined;
      const gr = grid.getBoundingClientRect();
      return {
        rightTop: right ? Math.round(right.getBoundingClientRect().top) : 0,
        gridTop: Math.round(gr.top),
        gridBottom: Math.round(gr.bottom),
      };
    });
    traces.push({ scroll: offset, ...data });
  }
  fs.writeFileSync(`${OUT_DIR}/deliverables-sticky-trace.json`, JSON.stringify(traces, null, 2));
  console.log(JSON.stringify(traces, null, 2));
});
