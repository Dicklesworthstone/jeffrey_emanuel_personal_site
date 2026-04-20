import { test } from "@playwright/test";
import fs from "node:fs";
const OUT_DIR = "/tmp/wills-audit";
fs.mkdirSync(OUT_DIR, { recursive: true });

const viewports = [
  { name: "320x568", w: 320, h: 568 },
  { name: "360x640", w: 360, h: 640 },
  { name: "375x667", w: 375, h: 667 },
];
for (const slug of ["bakery_algorithm", "cmaes_explainer"]) {
  for (const vp of viewports) {
    test(`${slug} @ ${vp.name}`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.goto(`http://localhost:3000/writing/${slug}`, { waitUntil: "load", timeout: 90_000 });
      await page.waitForTimeout(2500);
      const info = await page.evaluate(() => {
        const heroEl = document.querySelector('[data-section="hero"]');
        const scrollLabels = Array.from(heroEl?.querySelectorAll("span") ?? []).filter(s => {
          const t = s.textContent?.trim() ?? "";
          return t === "Scroll to Discover" || t === "Scroll to Optimize";
        });
        const scrollSpan = scrollLabels[0];
        const scrollRect = scrollSpan?.parentElement?.getBoundingClientRect();
        const ec = heroEl?.querySelector(':scope > div:not(.absolute)') as HTMLElement | null;
        const ecRect = ec?.getBoundingClientRect();
        return {
          scrollTop: scrollRect ? Math.round(scrollRect.top) : null,
          ecBottom: ecRect ? Math.round(ecRect.bottom) : null,
        };
      });
      const gap = (info.scrollTop ?? 0) - (info.ecBottom ?? 0);
      console.log(`${slug} ${vp.name}: ecBottom=${info.ecBottom} scrollTop=${info.scrollTop} gap=${gap}px`);
      await page.locator('[data-section="hero"]').first().screenshot({ path: `${OUT_DIR}/${slug}-${vp.name}.png` });
    });
  }
}
