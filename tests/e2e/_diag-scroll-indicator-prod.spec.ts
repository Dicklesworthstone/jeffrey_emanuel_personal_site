import { test, expect } from "@playwright/test";
import fs from "node:fs";

const OUT_DIR = "/tmp/wills-audit";
fs.mkdirSync(OUT_DIR, { recursive: true });

const articles = ["wills-and-estate-planning", "slack-mattermost-migration", "overprompting", "raptorq", "barra-factor-model"];
for (const slug of articles) {
  test(`prod mobile hero — ${slug}`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(`https://jeffreyemanuel.com/writing/${slug}`, { waitUntil: "domcontentloaded", timeout: 90_000 });
    await page.waitForTimeout(3500);
    const info = await page.evaluate(() => {
      const heroEl = document.querySelector('[data-section="hero"]');
      const scrollLabels = Array.from(heroEl?.querySelectorAll("span") ?? []).filter(s => s.textContent?.trim() === "Scroll to Explore");
      const scrollSpan = scrollLabels[0];
      const scrollRect = scrollSpan?.parentElement?.getBoundingClientRect();
      const chips = heroEl?.querySelectorAll('div.inline-flex.rounded-full[class*="font-mono"], div.rounded-full[class*="font-mono"]');
      const lastChip = chips?.[chips.length-1] as HTMLElement|undefined;
      const chipRect = lastChip?.getBoundingClientRect();
      return { scroll: scrollRect ? {top: Math.round(scrollRect.top), bottom: Math.round(scrollRect.bottom)} : null,
               chip: chipRect ? {top: Math.round(chipRect.top), bottom: Math.round(chipRect.bottom)} : null };
    });
    console.log(slug, JSON.stringify(info));
    const hero = page.locator('[data-section="hero"]').first();
    await hero.scrollIntoViewIfNeeded();
    await hero.screenshot({ path: `${OUT_DIR}/prod-hero-mobile-${slug}.png` });
    if (info.scroll && info.chip) {
      expect(info.scroll.top).toBeGreaterThanOrEqual(info.chip.bottom - 1);
    }
  });
}
