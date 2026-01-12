import { test, expect } from "@playwright/test";

test.describe("TLDR Page - Flywheel Tools Showcase", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tldr");
  });

  test("should render the hero section", async ({ page }) => {
    // Check hero title is visible
    await expect(
      page.getByRole("heading", { name: /the agentic coding flywheel/i })
    ).toBeVisible();

    // Check subtitle is visible
    await expect(page.getByText(/tl;dr edition/i)).toBeVisible();

    // Check stats are displayed
    await expect(page.getByText("13")).toBeVisible(); // Tools count
    await expect(page.getByText("3,600+")).toBeVisible(); // Stars count
  });

  test("should display core flywheel tools section", async ({ page }) => {
    // Check section header
    await expect(
      page.getByRole("heading", { name: /core flywheel tools/i })
    ).toBeVisible();

    // At minimum, check for some core tool names
    await expect(page.getByText("NTM")).toBeVisible();
    await expect(page.getByText("CASS")).toBeVisible();
  });

  test("should display supporting tools section", async ({ page }) => {
    // Scroll to supporting tools section
    await page.getByRole("heading", { name: /supporting tools/i }).scrollIntoViewIfNeeded();

    // Check section header
    await expect(
      page.getByRole("heading", { name: /supporting tools/i })
    ).toBeVisible();

    // Check that some supporting tools are visible
    await expect(page.getByText("DCG")).toBeVisible();
    await expect(page.getByText("XF")).toBeVisible();
  });

  test("should expand and collapse tool cards", async ({ page }) => {
    // Find the first "Show More" button
    const showMoreButton = page.getByRole("button", { name: /show more/i }).first();
    await showMoreButton.click();

    // After expanding, should show "Why It's Useful" section
    await expect(page.getByText(/why it's useful/i).first()).toBeVisible();

    // Click "Show Less" to collapse
    const showLessButton = page.getByRole("button", { name: /show less/i }).first();
    await showLessButton.click();

    // The detailed section should be hidden
    await expect(page.getByText(/why it's useful/i).first()).not.toBeVisible();
  });

  test("should display synergy diagram", async ({ page }) => {
    // Check that the SVG diagram is present
    const diagram = page.locator('svg[aria-label*="synergy diagram"]');
    await expect(diagram).toBeVisible();

    // Check for the center "Flywheel" label
    await expect(page.locator("text=Flywheel")).toBeVisible();
    await expect(page.locator("text=7 Core Tools")).toBeVisible();
  });

  test("should have working GitHub links", async ({ page }) => {
    // Find a GitHub link and check it has proper attributes
    const githubLink = page.locator('a[href*="github.com/Dicklesworthstone"]').first();
    await expect(githubLink).toHaveAttribute("target", "_blank");
    await expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("should display ACFS installation command", async ({ page }) => {
    // Scroll to footer CTA
    await page.getByRole("heading", { name: /get started/i }).scrollIntoViewIfNeeded();

    // Check the curl command is displayed
    await expect(page.locator("code")).toContainText("curl -fsSL");
    await expect(page.locator("code")).toContainText("agentic_coding_flywheel_setup");
  });

  test("should be accessible via keyboard navigation", async ({ page }) => {
    // Focus on the page
    await page.keyboard.press("Tab");

    // Should be able to tab through interactive elements
    // Check that focus is visible (the focused element should have a focus state)
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });

  test("should have proper page title and meta description", async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/flywheel.*tl;dr/i);

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute(
      "content",
      /13 open-source tools/i
    );
  });

  test("should display tool stars count", async ({ page }) => {
    // Check that star badges are visible
    const starBadges = page.locator('text=/\\d+,?\\d* stars?|★/');
    await expect(starBadges.first()).toBeVisible();
  });

  test("should work on mobile viewport", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();

    // Hero should still be visible
    await expect(
      page.getByRole("heading", { name: /the agentic coding flywheel/i })
    ).toBeVisible();

    // Tool cards should be stacked in single column
    const toolCards = page.locator('[class*="rounded-2xl"][class*="border"]');
    await expect(toolCards.first()).toBeVisible();
  });

  test("should expand all tools in a section", async ({ page }) => {
    // Find and click "Expand All" button in core section
    const expandAllButton = page.getByRole("button", { name: /expand all/i }).first();
    await expandAllButton.click();

    // Wait for animation
    await page.waitForTimeout(500);

    // Check that multiple "Why It's Useful" sections are visible
    const whyUsefulSections = page.getByText(/why it's useful/i);
    const count = await whyUsefulSections.count();
    expect(count).toBeGreaterThan(1);

    // Button should now say "Collapse All"
    await expect(page.getByRole("button", { name: /collapse all/i }).first()).toBeVisible();
  });
});

test.describe("TLDR Page - Navigation", () => {
  test("should be accessible from main navigation", async ({ page }) => {
    // Go to homepage
    await page.goto("/");

    // Click on Flywheel link in navigation
    await page.getByRole("link", { name: /flywheel/i }).click();

    // Should navigate to /tldr
    await expect(page).toHaveURL(/\/tldr/);
  });

  test("should maintain scroll position on card expansion", async ({ page }) => {
    await page.goto("/tldr");

    // Scroll down a bit
    await page.evaluate(() => window.scrollTo(0, 500));
    const scrollBefore = await page.evaluate(() => window.scrollY);

    // Expand a card
    const showMoreButton = page.getByRole("button", { name: /show more/i }).first();
    await showMoreButton.click();

    // Scroll position should not jump significantly
    const scrollAfter = await page.evaluate(() => window.scrollY);
    expect(Math.abs(scrollAfter - scrollBefore)).toBeLessThan(100);
  });
});

test.describe("TLDR Page - Accessibility", () => {
  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/tldr");

    // Check h1 exists
    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);

    // Check h2 exists for sections
    const h2s = page.locator("h2");
    const h2Count = await h2s.count();
    expect(h2Count).toBeGreaterThanOrEqual(2); // At least core and supporting sections
  });

  test("should have aria labels on interactive elements", async ({ page }) => {
    await page.goto("/tldr");

    // GitHub links should have aria labels
    const githubLinks = page.locator('a[aria-label*="GitHub"]');
    const count = await githubLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should respect reduced motion preference", async ({ page }) => {
    // Enable reduced motion
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/tldr");

    // Page should still load correctly
    await expect(
      page.getByRole("heading", { name: /the agentic coding flywheel/i })
    ).toBeVisible();
  });
});
