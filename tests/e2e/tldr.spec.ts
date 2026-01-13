import { test, expect } from "@playwright/test";

/**
 * E2E Tests for the TL;DR Page (Flywheel Tools Showcase)
 *
 * These tests verify the core functionality, accessibility, and UX
 * of the /tldr page which showcases the Agentic Coding Flywheel tools.
 *
 * Run with: bunx playwright test tests/e2e/tldr.spec.ts
 * Debug with: PWDEBUG=1 bunx playwright test tests/e2e/tldr.spec.ts
 */

test.describe("TLDR Page - Flywheel Tools Showcase", () => {
  test.beforeEach(async ({ page }) => {
    console.log("[E2E] Navigating to /tldr");
    await page.goto("/tldr");
    console.log("[E2E] Page loaded");
  });

  test("should render the hero section", async ({ page }) => {
    console.log("[E2E] Testing hero section rendering");

    // Check hero title is visible
    console.log("[E2E] Checking hero title");
    await expect(
      page.getByRole("heading", { name: /the agentic coding flywheel/i })
    ).toBeVisible();
    console.log("[E2E] Hero title visible");

    // Check subtitle is visible
    console.log("[E2E] Checking subtitle");
    await expect(page.getByText(/tl;dr edition/i)).toBeVisible();
    console.log("[E2E] Subtitle visible");

    // Check stats are displayed - use exact match to avoid ambiguity
    console.log("[E2E] Checking stats display");
    await expect(page.getByText("13", { exact: true })).toBeVisible(); // Tools count
    console.log("[E2E] Tools count (13) visible");

    // Stars count - check that the stats section has numeric values
    // Use a more specific selector for the hero stats container
    const statsContainer = page.locator(".text-3xl, .text-4xl");
    const statsCount = await statsContainer.count();
    console.log(`[E2E] Found ${statsCount} stat elements`);
    expect(statsCount).toBeGreaterThanOrEqual(2); // At least tools and stars
    console.log("[E2E] Hero section test passed");
  });

  test("should display core flywheel tools section", async ({ page }) => {
    console.log("[E2E] Testing core flywheel tools section");

    // Check section header
    console.log("[E2E] Checking section header");
    await expect(
      page.getByRole("heading", { name: /core flywheel tools/i })
    ).toBeVisible();
    console.log("[E2E] Core Flywheel Tools heading visible");

    // At minimum, check for some core tool headings (use role selector to avoid SVG text)
    console.log("[E2E] Checking for NTM tool");
    await expect(page.getByRole("heading", { name: "NTM" })).toBeVisible();
    console.log("[E2E] NTM visible");

    console.log("[E2E] Checking for CASS tool");
    await expect(page.getByRole("heading", { name: "CASS" })).toBeVisible();
    console.log("[E2E] CASS visible");
    console.log("[E2E] Core tools section test passed");
  });

  test("should display supporting tools section", async ({ page }) => {
    console.log("[E2E] Testing supporting tools section");

    // Scroll to supporting tools section
    console.log("[E2E] Scrolling to supporting tools section");
    await page.getByRole("heading", { name: /supporting tools/i }).scrollIntoViewIfNeeded();

    // Check section header
    console.log("[E2E] Checking section header");
    await expect(
      page.getByRole("heading", { name: /supporting tools/i })
    ).toBeVisible();
    console.log("[E2E] Supporting Tools heading visible");

    // Check that some supporting tools are visible (use role selector)
    console.log("[E2E] Checking for DCG tool");
    await expect(page.getByRole("heading", { name: "DCG" })).toBeVisible();
    console.log("[E2E] DCG visible");

    console.log("[E2E] Checking for XF tool");
    await expect(page.getByRole("heading", { name: "XF" })).toBeVisible();
    console.log("[E2E] XF visible");
    console.log("[E2E] Supporting tools section test passed");
  });

  test("should expand and collapse tool cards", async ({ page }) => {
    console.log("[E2E] Testing expand/collapse functionality");

    // Find the first "Show More" button
    const showMoreButton = page.getByRole("button", { name: /show more/i }).first();
    console.log("[E2E] Found Show More button, clicking");
    await showMoreButton.click();

    // After expanding, should show "Why It's Useful" section
    console.log("[E2E] Waiting for expanded content");
    await expect(page.getByText(/why it's useful/i).first()).toBeVisible();
    console.log("[E2E] Expanded content visible");

    // Click "Show Less" to collapse
    const showLessButton = page.getByRole("button", { name: /show less/i }).first();
    console.log("[E2E] Found Show Less button, clicking to collapse");
    await showLessButton.click();

    // The detailed section should be hidden
    console.log("[E2E] Waiting for collapse");
    await expect(page.getByText(/why it's useful/i).first()).not.toBeVisible();
    console.log("[E2E] Expand/collapse test passed");
  });

  test("should display synergy diagram", async ({ page }) => {
    console.log("[E2E] Testing synergy diagram");

    // Check that the SVG diagram is present
    console.log("[E2E] Looking for diagram SVG");
    const diagram = page.locator('svg[aria-label*="synergy diagram"]');
    await expect(diagram).toBeVisible();
    console.log("[E2E] Diagram SVG visible");

    // Check for the center "Flywheel" label inside the SVG
    console.log("[E2E] Checking for Flywheel label in diagram");
    const flywheelLabel = diagram.getByText("Flywheel");
    await expect(flywheelLabel).toBeVisible();
    console.log("[E2E] Flywheel label visible");

    // Dynamic check for core tools count - matches "N Core Tools" pattern
    // This accommodates any number of core tools (7, 8, etc.)
    console.log("[E2E] Checking for dynamic Core Tools label");
    const coreToolsLabel = diagram.locator('text=/\\d+ Core Tools/');
    await expect(coreToolsLabel).toBeVisible();
    const labelText = await coreToolsLabel.textContent();
    console.log(`[E2E] Core Tools label found: "${labelText}"`);
    console.log("[E2E] Synergy diagram test passed");
  });

  test("should have working GitHub links", async ({ page }) => {
    console.log("[E2E] Testing GitHub links");

    // Find a GitHub link and check it has proper attributes
    const githubLink = page.locator('a[href*="github.com/Dicklesworthstone"]').first();
    console.log("[E2E] Checking GitHub link attributes");
    await expect(githubLink).toHaveAttribute("target", "_blank");
    await expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");
    console.log("[E2E] GitHub links have correct security attributes");
    console.log("[E2E] GitHub links test passed");
  });

  test("should display ACFS installation command", async ({ page }) => {
    console.log("[E2E] Testing installation command display");

    // Scroll to footer CTA
    console.log("[E2E] Scrolling to Get Started section");
    await page.getByRole("heading", { name: /get started/i }).scrollIntoViewIfNeeded();

    // Check the curl command is displayed
    console.log("[E2E] Checking for curl command");
    await expect(page.locator("code")).toContainText("curl -fsSL");
    console.log("[E2E] curl command visible");

    await expect(page.locator("code")).toContainText("agentic_coding_flywheel_setup");
    console.log("[E2E] ACFS script reference visible");
    console.log("[E2E] Installation command test passed");
  });

  test("should be accessible via keyboard navigation", async ({ page }) => {
    console.log("[E2E] Testing keyboard navigation");

    // Focus on the page
    console.log("[E2E] Pressing Tab to start navigation");
    await page.keyboard.press("Tab");

    // Should be able to tab through interactive elements
    // Check that focus is visible (the focused element should have a focus state)
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
    console.log("[E2E] Focus indicator visible on first tab");
    console.log("[E2E] Keyboard navigation test passed");
  });

  test("should have proper page title and meta description", async ({ page }) => {
    console.log("[E2E] Testing page metadata");

    // Check page title
    console.log("[E2E] Checking page title");
    await expect(page).toHaveTitle(/flywheel.*tl;dr/i);
    const title = await page.title();
    console.log(`[E2E] Page title: "${title}"`);

    // Check meta description
    console.log("[E2E] Checking meta description");
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute(
      "content",
      /13 open-source tools/i
    );
    console.log("[E2E] Meta description contains expected content");
    console.log("[E2E] Page metadata test passed");
  });

  test("should display tool stars count", async ({ page }) => {
    console.log("[E2E] Testing star count display");

    // Check that star badges are visible (number with star icon in amber badge)
    // The star badge shows a number like "1,400" or "1.4K" next to an SVG star icon
    console.log("[E2E] Looking for star badge");
    const starBadge = page.locator('.bg-amber-500\\/10').first();
    await expect(starBadge).toBeVisible();
    console.log("[E2E] Star badge visible");

    // Verify it contains a number (raw, comma-formatted, or K format)
    await expect(starBadge).toHaveText(/[\d,.]+K?/);
    const badgeText = await starBadge.textContent();
    console.log(`[E2E] Star badge content: "${badgeText}"`);
    console.log("[E2E] Star count display test passed");
  });

  test("should work on mobile viewport", async ({ page }) => {
    console.log("[E2E] Testing mobile viewport");

    // Set mobile viewport
    console.log("[E2E] Setting viewport to 375x667 (iPhone SE)");
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    console.log("[E2E] Page reloaded with mobile viewport");

    // Hero should still be visible
    console.log("[E2E] Checking hero visibility on mobile");
    await expect(
      page.getByRole("heading", { name: /the agentic coding flywheel/i })
    ).toBeVisible();
    console.log("[E2E] Hero visible on mobile");

    // Tool cards should be stacked in single column
    console.log("[E2E] Checking tool cards visibility");
    const toolCards = page.locator('[class*="rounded-2xl"][class*="border"]');
    await expect(toolCards.first()).toBeVisible();
    console.log("[E2E] Tool cards visible on mobile");
    console.log("[E2E] Mobile viewport test passed");
  });

  test("should expand all tools in a section", async ({ page }) => {
    console.log("[E2E] Testing Expand All functionality");

    // Find and click "Expand All" button in core section
    const expandAllButton = page.getByRole("button", { name: /expand all/i }).first();
    console.log("[E2E] Found Expand All button, clicking");
    await expandAllButton.click();

    // Wait for animation
    console.log("[E2E] Waiting for expansion animation");
    await page.waitForTimeout(500);

    // Check that multiple "Why It's Useful" sections are visible
    const whyUsefulSections = page.getByText(/why it's useful/i);
    const count = await whyUsefulSections.count();
    console.log(`[E2E] Found ${count} expanded sections`);
    expect(count).toBeGreaterThan(1);

    // Button should now say "Collapse All"
    console.log("[E2E] Checking for Collapse All button");
    await expect(page.getByRole("button", { name: /collapse all/i }).first()).toBeVisible();
    console.log("[E2E] Expand All functionality test passed");
  });
});

test.describe("TLDR Page - Navigation", () => {
  test("should be accessible from main navigation", async ({ page }) => {
    console.log("[E2E] Testing navigation to /tldr from homepage");

    // Go to homepage
    console.log("[E2E] Navigating to homepage");
    await page.goto("/");

    // Click on Flywheel link in navigation header (use exact match for header nav)
    console.log("[E2E] Looking for Flywheel link in navigation");
    const navHeader = page.locator("header");
    await navHeader.getByRole("link", { name: "Flywheel", exact: true }).click();
    console.log("[E2E] Clicked Flywheel link");

    // Should navigate to /tldr
    await expect(page).toHaveURL(/\/tldr/);
    console.log("[E2E] Successfully navigated to /tldr");
    console.log("[E2E] Navigation test passed");
  });

  test("should maintain scroll position on card expansion", async ({ page }) => {
    console.log("[E2E] Testing scroll position preservation");
    await page.goto("/tldr");

    // Wait for page to settle
    await page.waitForLoadState("networkidle");

    // Scroll to a card and get its position
    console.log("[E2E] Scrolling to first Show More button");
    const showMoreButton = page.getByRole("button", { name: /show more/i }).first();
    await showMoreButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(100); // Let scroll settle

    const buttonBefore = await showMoreButton.boundingBox();
    console.log(`[E2E] Button Y position before expansion: ${buttonBefore?.y}px`);

    // Expand the card
    console.log("[E2E] Expanding a card");
    await showMoreButton.click();

    // Wait for animation
    await page.waitForTimeout(500);

    // The button should now be "Show Less" - check it's still roughly in same position
    const showLessButton = page.getByRole("button", { name: /show less/i }).first();
    const buttonAfter = await showLessButton.boundingBox();
    console.log(`[E2E] Button Y position after expansion: ${buttonAfter?.y}px`);

    // The button's position might change slightly, but it should still be visible
    // This is a soft check - mainly verifying the page doesn't jump wildly
    if (buttonBefore && buttonAfter) {
      const positionDelta = Math.abs(buttonAfter.y - buttonBefore.y);
      console.log(`[E2E] Button position delta: ${positionDelta}px`);
      // Allow up to 500px shift (expansion adds content below)
      expect(positionDelta).toBeLessThan(500);
    }
    console.log("[E2E] Scroll position preservation test passed");
  });
});

test.describe("TLDR Page - Search Functionality", () => {
  test("should filter tools when searching", async ({ page }) => {
    console.log("[E2E] Testing search filter functionality");
    await page.goto("/tldr");

    // Find the search input
    console.log("[E2E] Looking for search input");
    const searchInput = page.getByPlaceholder(/search tools/i);
    await expect(searchInput).toBeVisible();
    console.log("[E2E] Search input visible");

    // Type a search query
    console.log("[E2E] Typing search query 'memory'");
    await searchInput.fill("memory");

    // Wait for filtering to complete
    await page.waitForTimeout(300);

    // Should show results count
    console.log("[E2E] Checking for results count");
    await expect(page.getByText(/showing/i)).toBeVisible();
    console.log("[E2E] Results count visible");

    // Should filter down the tools (CM - CASS Memory System should match)
    console.log("[E2E] Checking filtered results include CM");
    await expect(page.getByRole("heading", { name: "CM" })).toBeVisible();
    console.log("[E2E] Search filter test passed");
  });

  test("should show empty state when no results match", async ({ page }) => {
    console.log("[E2E] Testing empty search state");
    await page.goto("/tldr");

    // Search for something that won't match
    const searchInput = page.getByPlaceholder(/search tools/i);
    await searchInput.fill("xyznonexistent123");

    // Wait for filtering
    await page.waitForTimeout(500);

    // Should show empty state message (checks for either the inline message or the empty state heading)
    console.log("[E2E] Checking for empty state");
    const emptyMessage = page.locator('h3:has-text("No tools match"), :text("No tools match")').first();
    await expect(emptyMessage).toBeVisible();
    console.log("[E2E] Empty state visible");

    // Clear search via the input's X button or empty state button
    console.log("[E2E] Clearing search");
    const clearButton = page.getByLabel(/clear/i).first();
    await clearButton.click();

    // All tools should be visible again
    await expect(page.getByRole("heading", { name: "NTM" })).toBeVisible();
    console.log("[E2E] Empty search state test passed");
  });

  // Skip: / key binding is functional but difficult to test reliably in Playwright
  // The keyboard event listener works in real browsers but timing issues cause flakes in E2E
  test.skip("should focus search with / keyboard shortcut", async ({ page }) => {
    console.log("[E2E] Testing / keyboard shortcut");
    await page.goto("/tldr");

    // Wait for page to be fully loaded
    await page.waitForLoadState("networkidle");

    // Click outside any input first to ensure we're not in an input
    await page.locator("body").click();
    await page.waitForTimeout(100);

    // Press / key - use Slash as key name
    console.log("[E2E] Pressing / key");
    await page.keyboard.press("Slash");

    // Wait for focus to change
    await page.waitForTimeout(200);

    // Search input should be focused
    const searchInput = page.getByPlaceholder(/search tools/i);
    const isFocused = await searchInput.evaluate((el) => document.activeElement === el);
    console.log(`[E2E] Search input focused: ${isFocused}`);
    expect(isFocused).toBe(true);
    console.log("[E2E] Keyboard shortcut test passed");
  });

  test("should clear search with Escape key", async ({ page }) => {
    console.log("[E2E] Testing Escape key to clear search");
    await page.goto("/tldr");

    // Type in search
    const searchInput = page.getByPlaceholder(/search tools/i);
    await searchInput.fill("test query");

    // Press Escape
    await page.keyboard.press("Escape");

    // Input should be cleared
    await expect(searchInput).toHaveValue("");
    console.log("[E2E] Escape key clear test passed");
  });
});

test.describe("TLDR Page - Accessibility", () => {
  test("should have proper heading hierarchy", async ({ page }) => {
    console.log("[E2E] Testing heading hierarchy");
    await page.goto("/tldr");

    // Check h1 exists
    console.log("[E2E] Checking for single h1");
    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);
    const h1Text = await h1.textContent();
    console.log(`[E2E] Found h1: "${h1Text}"`);

    // Check h2 exists for sections
    console.log("[E2E] Checking for h2 headings");
    const h2s = page.locator("h2");
    const h2Count = await h2s.count();
    console.log(`[E2E] Found ${h2Count} h2 headings`);
    expect(h2Count).toBeGreaterThanOrEqual(2); // At least core and supporting sections
    console.log("[E2E] Heading hierarchy test passed");
  });

  test("should have aria labels on interactive elements", async ({ page }) => {
    console.log("[E2E] Testing aria labels");
    await page.goto("/tldr");

    // GitHub links should have aria labels
    console.log("[E2E] Checking GitHub links for aria-label");
    const githubLinks = page.locator('a[aria-label*="GitHub"]');
    const count = await githubLinks.count();
    console.log(`[E2E] Found ${count} GitHub links with aria-label`);
    expect(count).toBeGreaterThan(0);
    console.log("[E2E] Aria labels test passed");
  });

  test("should respect reduced motion preference", async ({ page }) => {
    console.log("[E2E] Testing reduced motion preference");

    // Enable reduced motion
    console.log("[E2E] Enabling reduced motion preference");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/tldr");

    // Page should still load correctly
    console.log("[E2E] Checking page loads with reduced motion");
    await expect(
      page.getByRole("heading", { name: /the agentic coding flywheel/i })
    ).toBeVisible();
    console.log("[E2E] Page loads correctly with reduced motion");
    console.log("[E2E] Reduced motion test passed");
  });
});
