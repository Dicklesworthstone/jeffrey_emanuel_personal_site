import { test, expect } from "@playwright/test";
import fs from "node:fs";

const OUT_DIR = "/tmp/wills-audit";
fs.mkdirSync(OUT_DIR, { recursive: true });

test.use({ baseURL: "http://localhost:3000" });
test.describe.configure({ mode: "serial" });

// Sanity companion to _diag-scroll-indicator.spec.ts: at md+ (>=768px) the
// mobile-overlap fix must NOT have broken the designed desktop treatment.
// The indicator must become `position: absolute` via `md:absolute` and reset
// `mt-12` to `mt-0` via `md:mt-0`. If either is silently dropped, the mobile
// suite still passes but the desktop layout regresses.
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
  test(`desktop indicator is absolute — ${slug}`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`/writing/${slug}`, {
      waitUntil: "load",
      timeout: 90_000,
    });
    await page.waitForTimeout(2500);

    const info = await page.evaluate((expectedLabel) => {
      const heroEl = document.querySelector('[data-section="hero"]');
      if (!heroEl) return { error: "no hero" } as const;
      const labelSpan = Array.from(heroEl.querySelectorAll("span")).find(
        (s) => s.textContent?.trim() === expectedLabel,
      );
      const indicator = labelSpan?.parentElement as HTMLElement | null;
      if (!indicator) return { error: "no indicator" } as const;
      const cs = getComputedStyle(indicator);
      return {
        position: cs.position,
        marginTop: cs.marginTop,
      } as const;
    }, label);

    if ("error" in info) throw new Error(`${slug}: ${info.error}`);
    console.log(`${slug}: position=${info.position} mt=${info.marginTop}`);
    expect(info.position).toBe("absolute");
    expect(info.marginTop).toBe("0px");
    await page
      .locator('[data-section="hero"]')
      .first()
      .screenshot({ path: `${OUT_DIR}/desktop-hero-${slug}.png` });
  });
}
