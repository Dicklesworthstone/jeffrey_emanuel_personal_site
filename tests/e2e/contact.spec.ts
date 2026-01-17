import { test, expect } from "@playwright/test";

/**
 * E2E Tests for the Contact Page
 *
 * Verifies the contact form, layout, and social links.
 */

test.describe("Contact Page", () => {
  test.beforeEach(async ({ page }) => {
    console.log("[E2E] Navigating to /contact");
    await page.goto("/contact");
    console.log("[E2E] Page loaded");
  });

  test("should load the contact page correctly", async ({ page }) => {
    console.log("[E2E] Testing page load");
    
    // Check title
    await expect(page).toHaveTitle(/contact/i);
    
    // Check main heading
    await expect(page.getByRole("heading", { name: /get in touch/i, level: 1 })).toBeVisible();
    console.log("[E2E] Heading visible");
    
    // Check email link
    const emailLink = page.getByRole("link", { name: /jeffreyemanuel@gmail.com/i });
    await expect(emailLink).toBeVisible();
    await expect(emailLink).toHaveAttribute("href", "mailto:jeffreyemanuel@gmail.com");
    console.log("[E2E] Email link verified");
  });

  test("should render social links", async ({ page }) => {
    console.log("[E2E] Testing social links");
    
    const xLink = page.getByRole("link", { name: /x \/ @doodlestein/i });
    await expect(xLink).toBeVisible();
    await expect(xLink).toHaveAttribute("href", "https://x.com/doodlestein");
    
    const githubLink = page.getByRole("link", { name: /github – dicklesworthstone/i });
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute("href", "https://github.com/Dicklesworthstone");
    
    console.log("[E2E] Social links verified");
  });

  test("should display newsletter signup", async ({ page }) => {
    console.log("[E2E] Testing newsletter signup visibility");
    
    // The newsletter on contact page uses "Or just follow along" heading
    await expect(page.getByText("Or just follow along")).toBeVisible();
    
    // Check input exists (visually hidden label "Email address")
    await expect(page.getByLabel("Email address")).toBeVisible();
    
    // Check button exists
    await expect(page.getByRole("button", { name: /subscribe/i })).toBeVisible();
    
    console.log("[E2E] Newsletter component verified");
  });
});