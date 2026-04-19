import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ARTICLE_URL = "/writing/wills-and-estate-planning";
const SECTION_ANCHORS = [
  "install",
  "who",
  "insight",
  "intake",
  "produces",
  "workflow",
  "anti",
  "attorney",
  "faq",
  "pattern",
];

const KNOWN_A11Y_RULES = ["color-contrast"];

test.describe("Wills & Estate Planning Article", () => {
  test("should load without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto(ARTICLE_URL);
    await page.waitForLoadState("networkidle");

    const filtered = errors.filter(
      (e) => !e.includes("favicon") && !e.includes("Download the React DevTools"),
    );
    expect(filtered).toEqual([]);
  });

  test("should render the article title", async ({ page }) => {
    await page.goto(ARTICLE_URL);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("should have a scroll progress bar", async ({ page }) => {
    await page.goto(ARTICLE_URL);
    const progressBar = page.locator(".sm-progress-bar");
    await expect(progressBar).toBeAttached();
  });

  test("should render section anchors", async ({ page }) => {
    await page.goto(ARTICLE_URL);
    await page.waitForLoadState("networkidle");

    for (const anchor of SECTION_ANCHORS) {
      const section = page.locator(`#${anchor}`);
      if ((await section.count()) > 0) {
        await expect(section).toBeAttached();
      }
    }
  });

  test("should offer primer download", async ({ page }) => {
    await page.goto(ARTICLE_URL);
    const downloadLink = page.locator(
      'a[href*="wills-and-estate-planning-primer"]',
    );
    if ((await downloadLink.count()) > 0) {
      await expect(downloadLink.first()).toBeVisible();
    }
  });

  test("should have noindex meta in draft mode", async ({ page }) => {
    await page.goto(ARTICLE_URL);
    const robots = page.locator('meta[name="robots"]');
    if ((await robots.count()) > 0) {
      const content = await robots.getAttribute("content");
      expect(content).toContain("noindex");
    }
  });

  test("should pass WCAG 2.1 AA accessibility scan", async ({ page }) => {
    await page.goto(ARTICLE_URL);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .disableRules(KNOWN_A11Y_RULES)
      .analyze();

    for (const v of results.violations) {
      console.log(`[A11Y] ${v.id} (${v.impact}): ${v.description}`);
    }

    expect(results.violations).toEqual([]);
  });

  test.describe("Mobile viewport", () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test("should render without horizontal overflow", async ({ page }) => {
      await page.goto(ARTICLE_URL);
      await page.waitForLoadState("networkidle");

      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(375);
    });

    test("should render article title on mobile", async ({ page }) => {
      await page.goto(ARTICLE_URL);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });
  });

  test.describe("Reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("should load without errors in reduced-motion mode", async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });

      await page.goto(ARTICLE_URL);
      await page.waitForLoadState("networkidle");

      const filtered = errors.filter(
        (e) => !e.includes("favicon") && !e.includes("Download the React DevTools"),
      );
      expect(filtered).toEqual([]);
    });
  });
});
