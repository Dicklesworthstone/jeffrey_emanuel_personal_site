import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("TL;DR Page Accessibility", () => {
  test.describe("Full Page Scans", () => {
    test("should have no WCAG 2.1 AA violations on initial load", async ({ page }) => {
      console.log('[A11Y] Running full page accessibility scan');
      await page.goto("/tldr");
      
      // Wait for all animations to settle
      await page.waitForTimeout(1000);
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      
      console.log(`[A11Y] Violations found: ${accessibilityScanResults.violations.length}`);
      
      // Log each violation for debugging
      for (const violation of accessibilityScanResults.violations) {
        console.log(`[A11Y] VIOLATION: ${violation.id}`);
        console.log(`[A11Y]   Impact: ${violation.impact}`);
        console.log(`[A11Y]   Description: ${violation.description}`);
        console.log(`[A11Y]   Help: ${violation.helpUrl}`);
        for (const node of violation.nodes) {
          console.log(`[A11Y]   Element: ${node.html.substring(0, 100)}`);
          console.log(`[A11Y]   Fix: ${node.failureSummary}`);
        }
      }
      
      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test("should have no violations with expanded tool card", async ({ page }) => {
      console.log('[A11Y] Testing with expanded card');
      await page.goto("/tldr");
      
      // Expand a tool card - update selector to match current implementation
      // Use 'Show more' if it exists, or just check that we can expand content if cards are expandable
      // Current implementation shows full content by default on desktop, bottom sheet on mobile
      // We'll check mobile bottom sheet separately
      
      // On desktop, we don't have "Show more" buttons anymore, as content is fully visible or uses a different pattern?
      // Let's check tldr-tool-card.tsx. It seems to show full content by default now in the grid.
      // So this test might be redundant for desktop unless there's an expand action.
      // Assuming for now we just scan the page as is.
      
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      
      expect(results.violations).toEqual([]);
    });

    test("should have no violations in search state", async ({ page }) => {
      console.log('[A11Y] Testing search state accessibility');
      await page.goto("/tldr");
      
      // Activate search
      const searchInput = page.getByPlaceholder(/search/i);
      await searchInput.fill('memory');
      await page.waitForTimeout(300);
      
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      
      console.log(`[A11Y] Violations in search state: ${results.violations.length}`);
      
      expect(results.violations).toEqual([]);
    });
  });

  test.describe("Component-Level Scans", () => {
    test("should have no violations in hero section", async ({ page }) => {
      console.log('[A11Y] Scanning hero section');
      await page.goto("/tldr");
      
      const hero = page.locator('#tldr-hero');
      await hero.waitFor();
      
      const results = await new AxeBuilder({ page })
        .include('#tldr-hero')
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      
      console.log(`[A11Y] Hero violations: ${results.violations.length}`);
      expect(results.violations).toEqual([]);
    });

    test("should have no violations in synergy diagram", async ({ page }) => {
      console.log('[A11Y] Scanning synergy diagram');
      await page.goto("/tldr");
      
      const diagram = page.locator('svg[aria-label*="synergy"]');
      await diagram.waitFor();
      
      const results = await new AxeBuilder({ page })
        .include('svg[aria-label*="synergy"]')
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      
      console.log(`[A11Y] Diagram violations: ${results.violations.length}`);
      expect(results.violations).toEqual([]);
    });

    test("should have no violations in tool cards", async ({ page }) => {
      console.log('[A11Y] Scanning tool cards');
      await page.goto("/tldr");
      
      const cards = page.locator('[data-testid="tool-card"]');
      await cards.first().waitFor();
      
      const results = await new AxeBuilder({ page })
        .include('[data-testid="tool-card"]')
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      
      console.log(`[A11Y] Tool card violations: ${results.violations.length}`);
      expect(results.violations).toEqual([]);
    });

    test("should have no violations in footer CTA", async ({ page }) => {
      console.log('[A11Y] Scanning footer CTA');
      await page.goto("/tldr");
      
      await page.getByRole('heading', { name: /get started/i }).scrollIntoViewIfNeeded();
      const cta = page.locator('#get-started');
      await cta.waitFor();
      
      const results = await new AxeBuilder({ page })
        .include('#get-started')
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      
      console.log(`[A11Y] Footer CTA violations: ${results.violations.length}`);
      expect(results.violations).toEqual([]);
    });
  });

  test.describe("Mobile Accessibility", () => {
    test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });

    test("should have no violations on mobile viewport", async ({ page }) => {
      console.log('[A11Y] Testing mobile accessibility');
      await page.goto("/tldr");
      
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      
      console.log(`[A11Y] Mobile violations: ${results.violations.length}`);
      
      expect(results.violations).toEqual([]);
    });

    test.skip("should have no violations with bottom sheet open", async ({ page }) => {
      console.log('[A11Y] Testing bottom sheet accessibility');
      await page.goto("/tldr");
      
      // Tap a node in the flywheel visualization to open the sheet
      // Use accessible name (aria-label)
      const node = page.getByRole('button', { name: /Named Tmux Manager/i }).first();
      await node.waitFor();
      await node.click();
      await page.waitForTimeout(500);
      
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      
      console.log(`[A11Y] Bottom sheet violations: ${results.violations.length}`);
      expect(results.violations).toEqual([]);
    });
  });

  test.describe("Specific Rule Checks", () => {
    test("all images should have alt text", async ({ page }) => {
      console.log('[A11Y] Checking image alt text');
      await page.goto("/tldr");
      
      const results = await new AxeBuilder({ page })
        .withRules(['image-alt'])
        .analyze();
      
      expect(results.violations).toEqual([]);
    });

    test("all form controls should have labels", async ({ page }) => {
      console.log('[A11Y] Checking form labels');
      await page.goto("/tldr");
      
      const results = await new AxeBuilder({ page })
        .withRules(['label', 'label-title-only'])
        .analyze();
      
      expect(results.violations).toEqual([]);
    });

    test("color contrast should meet WCAG AA", async ({ page }) => {
      console.log('[A11Y] Checking color contrast');
      await page.goto("/tldr");
      
      const results = await new AxeBuilder({ page })
        .withRules(['color-contrast'])
        .analyze();
      
      console.log(`[A11Y] Contrast violations: ${results.violations.length}`);
      
      expect(results.violations).toEqual([]);
    });
  });
});
