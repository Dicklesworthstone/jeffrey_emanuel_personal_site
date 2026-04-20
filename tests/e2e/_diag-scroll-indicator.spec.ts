import { test, expect } from "@playwright/test";
import fs from "node:fs";

const OUT_DIR = "/tmp/wills-audit";
fs.mkdirSync(OUT_DIR, { recursive: true });

test.use({ baseURL: "http://localhost:3000" });

// Run serially — parallel navigations overwhelm the dev server and produce
// spurious "no hero" errors on cold-compile misses.
test.describe.configure({ mode: "serial" });

// Every article with a hero "Scroll to ..." indicator. The exact label varies
// across articles (Explore / Discover / Optimize / Initialization).
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

// Use narrow mobile viewports — these are the ones that trigger the overlap.
const viewports = [
  { name: "320x568", w: 320, h: 568 },
  { name: "360x640", w: 360, h: 640 },
  { name: "375x667", w: 375, h: 667 },
];

for (const { slug, label } of articles) {
  for (const vp of viewports) {
    test(`no hero overlap — ${slug} @ ${vp.name}`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.goto(`/writing/${slug}`, {
        waitUntil: "load",
        timeout: 90_000,
      });
      await page.waitForTimeout(2500);

      const info = await page.evaluate((expectedLabel) => {
        const heroEl = document.querySelector('[data-section="hero"]');
        if (!heroEl) return { error: "no hero" } as const;
        // Find the scroll-indicator block by locating the label span
        const labelSpan = Array.from(heroEl.querySelectorAll("span")).find(
          (s) => s.textContent?.trim() === expectedLabel,
        );
        if (!labelSpan) return { error: "no label" } as const;
        const indicator = labelSpan.parentElement as HTMLElement | null;
        if (!indicator) return { error: "no parent" } as const;
        const indicatorRect = indicator.getBoundingClientRect();
        // Find the hero's main content container — first non-indicator child of
        // the hero that has rendered text. We skip children that are either
        // the indicator itself or purely decorative (absolute positioned).
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
        `${slug} ${vp.name}: contentBottom=${info.contentBottom} indicator.top=${info.indicator.top} gap=${gap}px`,
      );
      const hero = page.locator('[data-section="hero"]').first();
      await hero.screenshot({
        path: `${OUT_DIR}/hero-${slug}-${vp.name}.png`,
      });
      // Strict: indicator must sit at or below the content container.
      expect(info.indicator.top).toBeGreaterThanOrEqual(info.contentBottom - 1);
    });
  }
}
