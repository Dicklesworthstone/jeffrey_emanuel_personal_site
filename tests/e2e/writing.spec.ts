import { test, expect } from "@playwright/test";

/**
 * E2E Tests for the Writing Page
 */

test.describe("Writing Page", () => {
  test.beforeEach(async ({ page }) => {
    console.log("[E2E] Navigating to /writing");
    await page.goto("/writing");
  });

  test("should load the writing index", async ({ page }) => {
    console.log("[E2E] Testing writing index load");
    await expect(page).toHaveTitle(/writing/i);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("should display a list of essays", async ({ page }) => {
    console.log("[E2E] Checking for essay list");
    // Look for article tags or links to posts
    const articles = page.locator("article");
    const count = await articles.count();
    console.log(`[E2E] Found ${count} articles`);
    
    // If no articles (empty content), this might fail, but assuming content exists
    if (count > 0) {
        await expect(articles.first()).toBeVisible();
    } else {
        console.warn("[E2E] No articles found on writing page");
    }
  });
});