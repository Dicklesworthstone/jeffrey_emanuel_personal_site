import { test, expect } from "@playwright/test";
import fs from "node:fs";

const OUT_DIR = "/tmp/wills-audit";
fs.mkdirSync(OUT_DIR, { recursive: true });

// Run serially so cold Vercel renders don't race.
test.describe.configure({ mode: "serial" });

const articles = [
  { slug: "wills-and-estate-planning", label: "Scroll to Explore" },
  { slug: "slack-mattermost-migration", label: "Scroll to Explore" },
  { slug: "overprompting", label: "Scroll to Explore" },
  { slug: "raptorq", label: "Scroll to Explore" },
  { slug: "barra-factor-model", label: "Scroll to Explore" },
  { slug: "bakery_algorithm", label: "Scroll to Discover" },
  { slug: "cmaes_explainer", label: "Scroll to Optimize" },
  { slug: "hoeffdings_d_explainer", label: "Initialization" },
];

for (const { slug, label } of articles) {
  test(`prod mobile hero — ${slug}`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto(`https://jeffreyemanuel.com/writing/${slug}`, {
      waitUntil: "load",
      timeout: 90_000,
    });
    await page.waitForTimeout(3500);

    const info = await page.evaluate((expectedLabel) => {
      const heroEl = document.querySelector('[data-section="hero"]');
      if (!heroEl) return { error: "no hero" } as const;
      const labelSpan = Array.from(heroEl.querySelectorAll("span")).find(
        (s) => s.textContent?.trim() === expectedLabel,
      );
      if (!labelSpan) return { error: "no label" } as const;
      const indicator = labelSpan.parentElement as HTMLElement | null;
      if (!indicator) return { error: "no parent" } as const;
      const indicatorRect = indicator.getBoundingClientRect();
      const children = Array.from(heroEl.children) as HTMLElement[];
      let contentBottom = -Infinity;
      let found = false;
      for (const child of children) {
        if (child === indicator || child.contains(indicator)) continue;
        const cs = getComputedStyle(child);
        if (cs.position === "absolute" || cs.position === "fixed") continue;
        const r = child.getBoundingClientRect();
        if (r.bottom > contentBottom) {
          contentBottom = r.bottom;
          found = true;
        }
      }
      if (!found) return { error: "no in-flow hero content" } as const;
      return {
        indicator: {
          top: Math.round(indicatorRect.top),
          bottom: Math.round(indicatorRect.bottom),
        },
        contentBottom: Math.round(contentBottom),
      } as const;
    }, label);

    if ("error" in info) throw new Error(`${slug}: ${info.error}`);
    const gap = info.indicator.top - info.contentBottom;
    console.log(
      `${slug}: contentBottom=${info.contentBottom} indicator.top=${info.indicator.top} gap=${gap}px`,
    );
    const hero = page.locator('[data-section="hero"]').first();
    await hero.screenshot({ path: `${OUT_DIR}/prod-hero-${slug}.png` });
    expect(info.indicator.top).toBeGreaterThanOrEqual(info.contentBottom - 1);
  });
}
