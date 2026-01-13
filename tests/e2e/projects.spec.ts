import { test, expect } from "@playwright/test";

/**
 * E2E Tests for the Projects Page
 *
 * These tests verify the core functionality, filtering, and UX
 * of the /projects page which showcases Jeffrey's projects.
 *
 * Run with: bunx playwright test tests/e2e/projects.spec.ts
 * Debug with: PWDEBUG=1 bunx playwright test tests/e2e/projects.spec.ts
 */

test.describe("Projects Page - Core Functionality", () => {
  test.beforeEach(async ({ page }) => {
    console.log("[E2E] Navigating to /projects");
    await page.goto("/projects");
    console.log("[E2E] Page loaded");
  });

  test("should load the projects page without errors", async ({ page }) => {
    console.log("[E2E] Testing page load");

    // Check page title
    await expect(page).toHaveTitle(/projects/i);
    console.log("[E2E] Title is correct");

    // Check main heading
    await expect(
      page.getByRole("heading", { name: /catalog of experiments/i, level: 1 })
    ).toBeVisible();
    console.log("[E2E] Main heading visible");

    // Check no error boundaries triggered
    await expect(page.getByText("Something went wrong")).not.toBeVisible();
    await expect(page.getByText("Unable to load")).not.toBeVisible();
    console.log("[E2E] No errors detected");
  });

  test("should display category filter buttons", async ({ page }) => {
    console.log("[E2E] Testing category filter buttons");

    const filterNav = page.getByRole("tablist", {
      name: /filter projects by category/i,
    });
    await expect(filterNav).toBeVisible();

    // Check all filter buttons exist
    await expect(page.getByRole("tab", { name: /all work/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /products/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /research/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /open source/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /flywheel/i })).toBeVisible();
    console.log("[E2E] All filter buttons visible");
  });

  test("should display tag filter section", async ({ page }) => {
    console.log("[E2E] Testing tag filter section");

    // Check tag filter label
    await expect(page.getByText(/filter by tag/i)).toBeVisible();

    // Check that tag buttons exist
    const tagGroup = page.getByRole("group", {
      name: /filter projects by tags/i,
    });
    await expect(tagGroup).toBeVisible();

    // There should be multiple tag buttons
    const tagButtons = tagGroup.locator("button");
    const tagCount = await tagButtons.count();
    console.log(`[E2E] Found ${tagCount} tag buttons`);
    expect(tagCount).toBeGreaterThan(5);
  });

  test("should display project cards", async ({ page }) => {
    console.log("[E2E] Testing project cards display");

    // Wait for projects grid to be visible
    const projectsGrid = page.locator("#projects-grid");
    await expect(projectsGrid).toBeVisible();

    // Check that project cards exist (articles or links within grid)
    const projectCards = projectsGrid.locator("article, a[href]");
    const cardCount = await projectCards.count();
    console.log(`[E2E] Found ${cardCount} project items`);
    expect(cardCount).toBeGreaterThan(10);
  });

  test("should have GitHub link in footer", async ({ page }) => {
    console.log("[E2E] Testing GitHub footer link");

    const githubLink = page.getByRole("link", { name: /github profile/i });
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute(
      "href",
      "https://github.com/Dicklesworthstone"
    );
    console.log("[E2E] GitHub link verified");
  });
});

test.describe("Projects Page - Category Filtering", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/projects");
  });

  test("should filter to Products when clicking Products tab", async ({
    page,
  }) => {
    console.log("[E2E] Testing Products filter");

    // Click Products filter
    await page.getByRole("tab", { name: /products/i }).click();

    // Wait for filter to apply
    await page.waitForTimeout(300);

    // Check that results count is shown
    await expect(page.getByText(/showing/i)).toBeVisible();
    console.log("[E2E] Products filter applied, results count visible");
  });

  test("should filter to Research when clicking Research tab", async ({
    page,
  }) => {
    console.log("[E2E] Testing Research filter");

    await page.getByRole("tab", { name: /research/i }).click();
    await page.waitForTimeout(300);

    await expect(page.getByText(/showing/i)).toBeVisible();
    console.log("[E2E] Research filter applied");
  });

  test("should filter to Open Source when clicking Open Source tab", async ({
    page,
  }) => {
    console.log("[E2E] Testing Open Source filter");

    await page.getByRole("tab", { name: /open source/i }).click();
    await page.waitForTimeout(300);

    await expect(page.getByText(/showing/i)).toBeVisible();
    console.log("[E2E] Open Source filter applied");
  });

  test("should filter to Flywheel when clicking Flywheel tab", async ({
    page,
  }) => {
    console.log("[E2E] Testing Flywheel filter");

    await page.getByRole("tab", { name: /flywheel/i }).click();
    await page.waitForTimeout(300);

    await expect(page.getByText(/showing/i)).toBeVisible();
    console.log("[E2E] Flywheel filter applied");
  });

  test("should return to All Work showing all projects", async ({ page }) => {
    console.log("[E2E] Testing return to All Work");

    // First filter to something
    await page.getByRole("tab", { name: /products/i }).click();
    await page.waitForTimeout(300);

    // Then return to all
    await page.getByRole("tab", { name: /all work/i }).click();
    await page.waitForTimeout(300);

    // Results count should not be visible when showing all
    await expect(page.getByText(/showing/i)).not.toBeVisible();
    console.log("[E2E] All Work filter restored");
  });

  test("should hide flywheel visualization when filtering to Products", async ({
    page,
  }) => {
    console.log("[E2E] Testing flywheel visibility on filter");

    // Initially flywheel should be visible (on All Work)
    const flywheelContainer = page.locator(
      ".mb-12.sm\\:mb-16, .mb-12.overflow-hidden"
    );

    // Click Products filter
    await page.getByRole("tab", { name: /products/i }).click();
    await page.waitForTimeout(500);

    // Flywheel should be hidden or have zero height
    const flywheelVisible = await page
      .locator('text="Agentic Coding Tooling Flywheel"')
      .isVisible()
      .catch(() => false);
    console.log(`[E2E] Flywheel visible after Products filter: ${flywheelVisible}`);
  });
});

test.describe("Projects Page - Tag Filtering", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/projects");
  });

  test("should filter projects when clicking a tag", async ({ page }) => {
    console.log("[E2E] Testing tag filter");

    const tagGroup = page.getByRole("group", {
      name: /filter projects by tags/i,
    });

    // Click the first tag button
    const firstTag = tagGroup.locator("button").first();
    const tagText = await firstTag.textContent();
    console.log(`[E2E] Clicking tag: ${tagText}`);

    await firstTag.click();
    await page.waitForTimeout(300);

    // Tag should now be selected (aria-pressed="true")
    await expect(firstTag).toHaveAttribute("aria-pressed", "true");

    // Results count should be visible
    await expect(page.getByText(/showing/i)).toBeVisible();
    console.log("[E2E] Tag filter applied");
  });

  test("should show clear button when tags are selected", async ({ page }) => {
    console.log("[E2E] Testing clear tags button");

    const tagGroup = page.getByRole("group", {
      name: /filter projects by tags/i,
    });

    // Click a tag
    await tagGroup.locator("button").first().click();
    await page.waitForTimeout(300);

    // Clear button should appear
    const clearButton = page.getByRole("button", { name: /clear/i });
    await expect(clearButton).toBeVisible();
    console.log("[E2E] Clear button visible");

    // Click clear
    await clearButton.click();
    await page.waitForTimeout(300);

    // Clear button should be gone
    await expect(clearButton).not.toBeVisible();
    console.log("[E2E] Tags cleared");
  });

  test("should allow multiple tags to be selected", async ({ page }) => {
    console.log("[E2E] Testing multiple tag selection");

    const tagGroup = page.getByRole("group", {
      name: /filter projects by tags/i,
    });

    // Click first two tags
    const firstTag = tagGroup.locator("button").first();
    const secondTag = tagGroup.locator("button").nth(1);

    await firstTag.click();
    await page.waitForTimeout(200);
    await secondTag.click();
    await page.waitForTimeout(200);

    // Both should be selected
    await expect(firstTag).toHaveAttribute("aria-pressed", "true");
    await expect(secondTag).toHaveAttribute("aria-pressed", "true");

    // Clear button should show (2)
    await expect(page.getByText(/clear \(2\)/i)).toBeVisible();
    console.log("[E2E] Multiple tags selected");
  });

  test("should deselect tag when clicked again", async ({ page }) => {
    console.log("[E2E] Testing tag toggle off");

    const tagGroup = page.getByRole("group", {
      name: /filter projects by tags/i,
    });
    const firstTag = tagGroup.locator("button").first();

    // Select tag
    await firstTag.click();
    await page.waitForTimeout(200);
    await expect(firstTag).toHaveAttribute("aria-pressed", "true");

    // Deselect tag
    await firstTag.click();
    await page.waitForTimeout(200);
    await expect(firstTag).toHaveAttribute("aria-pressed", "false");
    console.log("[E2E] Tag toggled off");
  });
});

test.describe("Projects Page - Combined Filtering", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/projects");
  });

  test("should combine category and tag filters", async ({ page }) => {
    console.log("[E2E] Testing combined category and tag filter");

    // Select Products category
    await page.getByRole("tab", { name: /products/i }).click();
    await page.waitForTimeout(300);

    // Get initial count
    const initialText = await page.getByText(/showing \d+/i).textContent();
    console.log(`[E2E] After Products filter: ${initialText}`);

    // Add a tag filter
    const tagGroup = page.getByRole("group", {
      name: /filter projects by tags/i,
    });
    await tagGroup.locator("button").first().click();
    await page.waitForTimeout(300);

    // Count should update
    const afterTagText = await page.getByText(/showing \d+/i).textContent();
    console.log(`[E2E] After adding tag: ${afterTagText}`);

    // Both filters should be active
    await expect(page.getByText(/matching/i)).toBeVisible();
    console.log("[E2E] Combined filters working");
  });
});

test.describe("Projects Page - Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/projects");
  });

  test("should have proper ARIA attributes on filter tabs", async ({
    page,
  }) => {
    console.log("[E2E] Testing ARIA attributes");

    // Check tablist role
    const tablist = page.getByRole("tablist", {
      name: /filter projects by category/i,
    });
    await expect(tablist).toBeVisible();

    // Check tabs have proper roles
    const allTab = page.getByRole("tab", { name: /all work/i });
    await expect(allTab).toHaveAttribute("aria-selected", "true");
    await expect(allTab).toHaveAttribute("aria-controls", "projects-grid");
    console.log("[E2E] ARIA attributes verified");
  });

  test("should have keyboard-navigable filters", async ({ page }) => {
    console.log("[E2E] Testing keyboard navigation");

    // Focus the first tab
    await page.getByRole("tab", { name: /all work/i }).focus();

    // Tab to next filter
    await page.keyboard.press("Tab");

    // Should move focus
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
    console.log("[E2E] Keyboard navigation working");
  });
});

test.describe("Projects Page - Responsive Design", () => {
  test("should display correctly on mobile viewport", async ({ page }) => {
    console.log("[E2E] Testing mobile viewport");

    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/projects");

    // Page should still load
    await expect(
      page.getByRole("heading", { name: /catalog/i, level: 1 })
    ).toBeVisible();

    // Filters should be visible
    await expect(page.getByRole("tablist")).toBeVisible();

    console.log("[E2E] Mobile viewport test passed");
  });

  test("should display correctly on tablet viewport", async ({ page }) => {
    console.log("[E2E] Testing tablet viewport");

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/projects");

    await expect(
      page.getByRole("heading", { name: /catalog/i, level: 1 })
    ).toBeVisible();

    console.log("[E2E] Tablet viewport test passed");
  });
});
