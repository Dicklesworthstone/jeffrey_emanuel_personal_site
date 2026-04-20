import { test, expect } from "@playwright/test";
import fs from "node:fs";

const OUT_DIR = "/tmp/wills-audit";
fs.mkdirSync(OUT_DIR, { recursive: true });

test.use({ baseURL: "http://localhost:3000" });

const articles = [
  "wills-and-estate-planning",
  "slack-mattermost-migration",
  "overprompting",
  "raptorq",
  "barra-factor-model",
];

for (const slug of articles) {
  test(`mobile hero — ${slug}`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(`/writing/${slug}`, { waitUntil: "load", timeout: 90_000 });
    await page.waitForTimeout(2500);
    const hero = page.locator('[data-section="hero"]').first();
    await hero.scrollIntoViewIfNeeded();
    await hero.screenshot({ path: `${OUT_DIR}/hero-mobile-${slug}.png` });

    // Measure overlap: scroll indicator bbox vs last badge bbox (scoped to hero)
    const info = await page.evaluate(() => {
      const heroEl = document.querySelector('[data-section="hero"]');
      const scrollLabels = Array.from(
        heroEl?.querySelectorAll("span") ?? [],
      ).filter((s) => s.textContent?.trim() === "Scroll to Explore");
      const scrollSpan = scrollLabels[0];
      const scrollRect = scrollSpan?.parentElement?.getBoundingClientRect();
      // Only consider chips inside the hero (articles without hero chips skip the assertion)
      const chips = heroEl?.querySelectorAll(
        'div.inline-flex.rounded-full[class*="font-mono"], div.rounded-full[class*="font-mono"]',
      );
      const lastChip = chips?.[chips.length - 1] as HTMLElement | undefined;
      const chipRect = lastChip?.getBoundingClientRect();
      return {
        scroll: scrollRect
          ? { top: scrollRect.top, bottom: scrollRect.bottom }
          : null,
        chip: chipRect ? { top: chipRect.top, bottom: chipRect.bottom } : null,
      };
    });
    console.log(slug, JSON.stringify(info));
    if (info.scroll && info.chip) {
      // Assert: scroll indicator top should be BELOW chip bottom (no overlap)
      expect(info.scroll.top).toBeGreaterThanOrEqual(info.chip.bottom - 1);
    }
  });
}
