import { test } from "@playwright/test";
import fs from "node:fs";
fs.mkdirSync("/tmp/wills-audit", { recursive: true });

for (const vp of [{w:320,h:568},{w:360,h:640},{w:375,h:800}]) {
  test(`hoeffding @ ${vp.w}x${vp.h}`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.goto(`http://localhost:3000/writing/hoeffdings_d_explainer`, { waitUntil: "load", timeout: 90_000 });
    await page.waitForTimeout(2500);
    const info = await page.evaluate(() => {
      const heroEl = document.querySelector('[data-section="hero"]') ?? document.querySelector('section');
      const init = Array.from(heroEl?.querySelectorAll("span") ?? []).find(s => s.textContent?.trim() === "Initialization");
      const scrollRect = init?.parentElement?.getBoundingClientRect();
      const ec = heroEl?.querySelector(':scope > div:not(.absolute)') as HTMLElement | null;
      const ecRect = ec?.getBoundingClientRect();
      return { scrollTop: scrollRect ? Math.round(scrollRect.top) : null, ecBottom: ecRect ? Math.round(ecRect.bottom) : null };
    });
    const gap = (info.scrollTop ?? 0) - (info.ecBottom ?? 0);
    console.log(`hoeffding ${vp.w}x${vp.h}: ecBottom=${info.ecBottom} scrollTop=${info.scrollTop} gap=${gap}px`);
    const hero = page.locator('section').first();
    await hero.screenshot({ path: `/tmp/wills-audit/hoeffding-${vp.w}x${vp.h}.png` });
  });
}
