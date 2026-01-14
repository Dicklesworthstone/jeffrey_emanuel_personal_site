import { test, expect } from "@playwright/test";

/**
 * E2E Tests for Performance Optimizations
 *
 * These tests verify that the useMemo, React.memo, and seededRandom
 * optimizations have not broken any functionality.
 *
 * Run with: bunx playwright test tests/e2e/performance-optimization.spec.ts
 * Debug with: PWDEBUG=1 bunx playwright test tests/e2e/performance-optimization.spec.ts
 */

test.describe("Performance Optimization - Stats Grid", () => {
  test("stats display correctly on homepage", async ({ page }) => {
    console.log("[E2E] Testing stats grid functionality after memoization");

    await page.goto("/");
    console.log("[E2E] Navigated to homepage");

    // Wait for stats to be visible
    console.log("[E2E] Waiting for stats section");
    const statsSection = page.locator("dl");
    await expect(statsSection).toBeVisible();
    console.log("[E2E] Stats section visible");

    // Check that stats display numbers
    console.log("[E2E] Verifying stat values are displayed");
    const statValues = page.locator("dd");
    const statCount = await statValues.count();
    console.log(`[E2E] Found ${statCount} stat values`);
    expect(statCount).toBeGreaterThanOrEqual(3);

    // Verify at least one stat contains a number
    const firstStat = statValues.first();
    const text = await firstStat.textContent();
    console.log(`[E2E] First stat value: "${text}"`);
    expect(text).toMatch(/\d/);
    console.log("[E2E] Stats grid test passed");
  });

  test("stats animate when scrolled into view", async ({ page }) => {
    console.log("[E2E] Testing animated stats (after useMemo optimization)");

    await page.goto("/");

    // Scroll to stats section
    console.log("[E2E] Scrolling stats into view");
    const statsSection = page.locator("dl");
    await statsSection.scrollIntoViewIfNeeded();

    // Wait a moment for animation
    await page.waitForTimeout(500);

    // Stats should show final values
    console.log("[E2E] Checking stat values after animation");
    const statValues = page.locator("dd");
    const firstStat = await statValues.first().textContent();
    console.log(`[E2E] Stat value after animation: "${firstStat}"`);

    // Should contain a formatted number (not 0 or empty)
    expect(firstStat).not.toBe("0");
    expect(firstStat).not.toBe("");
    console.log("[E2E] Stats animation test passed");
  });

  test("stats work with reduced motion preference", async ({ page }) => {
    console.log("[E2E] Testing stats with reduced motion");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    // Stats should display immediately without animation
    console.log("[E2E] Checking stats display immediately");
    const statsSection = page.locator("dl");
    await expect(statsSection).toBeVisible();

    const statValues = page.locator("dd");
    const firstStat = await statValues.first().textContent();
    console.log(`[E2E] Stat value with reduced motion: "${firstStat}"`);

    // Should have the final value immediately
    expect(firstStat).not.toBe("0");
    console.log("[E2E] Reduced motion stats test passed");
  });
});

test.describe("Performance Optimization - Tool Grid Search", () => {
  test("search functionality works after React.memo optimization", async ({
    page,
  }) => {
    console.log("[E2E] Testing tool grid search after React.memo optimization");

    await page.goto("/tldr");
    console.log("[E2E] Navigated to /tldr");

    // Find search input
    const searchInput = page.getByPlaceholder(/search tools/i);
    await expect(searchInput).toBeVisible();
    console.log("[E2E] Search input visible");

    // Type search query
    console.log('[E2E] Typing search query "session"');
    await searchInput.fill("session");

    // Wait for filter
    await page.waitForTimeout(300);

    // Should show filtered results
    console.log("[E2E] Checking filtered results");
    await expect(page.getByText(/showing/i)).toBeVisible();
    console.log("[E2E] Search functionality works correctly");
  });

  test("section headers render correctly after React.memo", async ({
    page,
  }) => {
    console.log("[E2E] Testing section headers after React.memo");

    await page.goto("/tldr");

    // Check both section headers exist
    console.log("[E2E] Checking Core Flywheel Tools header");
    await expect(
      page.getByRole("heading", { name: /core flywheel tools/i })
    ).toBeVisible();

    console.log("[E2E] Checking Supporting Tools header");
    await expect(
      page.getByRole("heading", { name: /supporting tools/i })
    ).toBeVisible();

    console.log("[E2E] Section headers test passed");
  });

  test("empty state displays correctly", async ({ page }) => {
    console.log("[E2E] Testing empty state after React.memo optimization");

    await page.goto("/tldr");

    const searchInput = page.getByPlaceholder(/search tools/i);
    await searchInput.fill("xyznonexistent123");

    await page.waitForTimeout(300);

    console.log("[E2E] Checking empty state message");
    const emptyState = page.locator("text=/no tools match/i");
    await expect(emptyState.first()).toBeVisible();
    console.log("[E2E] Empty state test passed");
  });
});

test.describe("Performance Optimization - 3D Scene", () => {
  test("hero 3D scene loads without errors", async ({ page }) => {
    console.log("[E2E] Testing 3D scene after seededRandom fix");

    // Listen for console errors
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
        console.log(`[E2E] Console error: ${msg.text()}`);
      }
    });

    await page.goto("/");
    console.log("[E2E] Navigated to homepage");

    // Wait for scene to load
    await page.waitForTimeout(2000);
    console.log("[E2E] Waited for 3D scene to initialize");

    // Check no errors related to Three.js or canvas
    const threeErrors = errors.filter(
      (e) => e.includes("THREE") || e.includes("WebGL") || e.includes("canvas")
    );
    console.log(`[E2E] Found ${threeErrors.length} Three.js related errors`);
    expect(threeErrors).toHaveLength(0);
    console.log("[E2E] 3D scene test passed - no errors");
  });

  test("3D scene respects reduced motion", async ({ page }) => {
    console.log("[E2E] Testing 3D scene with reduced motion");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    // Page should load without crashing
    console.log("[E2E] Checking page loads with reduced motion");
    await expect(page.locator("body")).toBeVisible();

    // Hero content should be visible
    const heroHeading = page.getByRole("heading").first();
    await expect(heroHeading).toBeVisible();
    console.log("[E2E] 3D scene reduced motion test passed");
  });
});

test.describe("Performance Optimization - No Visual Regressions", () => {
  test("homepage renders completely", async ({ page }) => {
    console.log("[E2E] Testing homepage complete render");

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check key sections exist
    console.log("[E2E] Verifying key sections");
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
    console.log("[E2E] Homepage renders completely");
  });

  test("tldr page renders completely", async ({ page }) => {
    console.log("[E2E] Testing /tldr complete render");

    await page.goto("/tldr");
    await page.waitForLoadState("networkidle");

    // Check key sections
    console.log("[E2E] Verifying tldr page sections");
    await expect(
      page.getByRole("heading", { name: /agentic coding flywheel/i })
    ).toBeVisible();
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();
    console.log("[E2E] /tldr page renders completely");
  });

  test("navigation works across pages", async ({ page }) => {
    console.log("[E2E] Testing navigation after performance optimizations");

    await page.goto("/");
    console.log("[E2E] Starting on homepage");

    // Navigate to projects
    console.log("[E2E] Navigating to projects");
    await page.getByRole("link", { name: /projects/i }).first().click();
    await page.waitForURL(/projects/);
    await expect(page.locator("main")).toBeVisible();
    console.log("[E2E] Projects page loaded");

    // Navigate to tldr (linked as "Flywheel" in nav)
    console.log("[E2E] Navigating to Flywheel (tldr page)");
    await page.getByRole("link", { name: /flywheel/i }).first().click();
    await page.waitForURL(/tldr/);
    await expect(page.locator("main")).toBeVisible();
    console.log("[E2E] Flywheel (tldr) page loaded");

    // Navigate back to homepage
    console.log("[E2E] Navigating back to homepage");
    await page.getByRole("link", { name: /home|jeffrey/i }).first().click();
    await page.waitForURL(/\/$/);
    await expect(page.locator("main")).toBeVisible();
    console.log("[E2E] Navigation test passed - all pages accessible");
  });
});

test.describe("Performance Optimization - Mobile Viewport", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("homepage works on mobile after optimizations", async ({ page }) => {
    console.log("[E2E] Testing homepage on mobile viewport (375x667)");

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    console.log("[E2E] Checking stats visible on mobile");
    const statsSection = page.locator("dl");
    await expect(statsSection).toBeVisible();

    console.log("[E2E] Checking hero visible on mobile");
    const heroHeading = page.getByRole("heading").first();
    await expect(heroHeading).toBeVisible();

    console.log("[E2E] Mobile homepage test passed");
  });

  test("tldr page works on mobile after optimizations", async ({ page }) => {
    console.log("[E2E] Testing tldr on mobile viewport (375x667)");

    await page.goto("/tldr");
    await page.waitForLoadState("networkidle");

    console.log("[E2E] Checking search works on mobile");
    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible();

    // Test search on mobile
    await searchInput.fill("beads");
    await page.waitForTimeout(300);

    console.log("[E2E] Checking results filtered on mobile");
    await expect(page.getByText(/showing/i)).toBeVisible();

    console.log("[E2E] Mobile tldr test passed");
  });
});
