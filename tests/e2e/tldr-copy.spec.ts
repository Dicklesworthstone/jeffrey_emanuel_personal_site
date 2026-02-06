import { test, expect } from "@playwright/test";

/**
 * E2E Tests for Copy-to-Clipboard on the TL;DR Page
 *
 * Tests the inline copy button in the Footer CTA section that copies
 * the ACFS install command to clipboard.
 *
 * Run with: bunx playwright test tests/e2e/tldr-copy.spec.ts
 */

test.describe("TLDR Page - Copy-to-Clipboard", () => {
  test.beforeEach(async ({ page, context }) => {
    console.log("[E2E:Copy] Granting clipboard permissions");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    console.log("[E2E:Copy] Navigating to /tldr");
    await page.goto("/tldr");
  });

  test.describe("Footer CTA Code Block", () => {
    test("should display the install command code block", async ({ page }) => {
      console.log("[E2E:Copy] Scrolling to Get Started section");
      await page
        .getByRole("heading", { name: /get started/i })
        .scrollIntoViewIfNeeded();

      const codeBlock = page.locator("code").filter({ hasText: "curl -fsSL" });
      await expect(codeBlock).toBeVisible();
      console.log("[E2E:Copy] Code block with curl command visible");

      await expect(codeBlock).toContainText("agentic_coding_flywheel_setup");
      console.log("[E2E:Copy] Install command content verified");
    });

    test("should display copy button with correct aria-label", async ({
      page,
    }) => {
      console.log("[E2E:Copy] Scrolling to Get Started section");
      await page
        .getByRole("heading", { name: /get started/i })
        .scrollIntoViewIfNeeded();

      const copyButton = page.locator(
        'button[aria-label="Copy to clipboard"]'
      );
      await expect(copyButton).toBeVisible();
      console.log("[E2E:Copy] Copy button visible with correct aria-label");
    });

    test("should copy install command to clipboard on click", async ({
      page,
    }) => {
      console.log("[E2E:Copy] Scrolling to Get Started section");
      await page
        .getByRole("heading", { name: /get started/i })
        .scrollIntoViewIfNeeded();

      const copyButton = page.locator(
        'button[aria-label="Copy to clipboard"]'
      );
      await copyButton.click();
      console.log("[E2E:Copy] Copy button clicked");

      const clipboardContent = await page.evaluate(() =>
        navigator.clipboard.readText()
      );
      console.log(
        `[E2E:Copy] Clipboard: ${clipboardContent.substring(0, 60)}...`
      );

      expect(clipboardContent).toContain("curl -fsSL");
      expect(clipboardContent).toContain("agentic_coding_flywheel_setup");
      console.log("[E2E:Copy] Clipboard content verified");
    });

    test("should show success feedback after copy", async ({ page }) => {
      console.log("[E2E:Copy] Scrolling to Get Started section");
      await page
        .getByRole("heading", { name: /get started/i })
        .scrollIntoViewIfNeeded();

      const copyButton = page.locator(
        'button[aria-label="Copy to clipboard"]'
      );
      await copyButton.click();

      // Aria-label should change to "Copied!"
      console.log("[E2E:Copy] Checking for Copied aria-label");
      await expect(
        page.locator('button[aria-label="Copied!"]')
      ).toBeVisible();
      console.log("[E2E:Copy] Success feedback shown");
    });

    test("should revert to idle state after timeout", async ({ page }) => {
      console.log("[E2E:Copy] Scrolling to Get Started section");
      await page
        .getByRole("heading", { name: /get started/i })
        .scrollIntoViewIfNeeded();

      const copyButton = page.locator(
        'button[aria-label="Copy to clipboard"]'
      );
      await copyButton.click();

      // Verify copied state
      await expect(
        page.locator('button[aria-label="Copied!"]')
      ).toBeVisible();
      console.log("[E2E:Copy] Copied state confirmed");

      // Wait for 2-second reset
      console.log("[E2E:Copy] Waiting for 2s reset");
      await page.waitForTimeout(2500);

      await expect(
        page.locator('button[aria-label="Copy to clipboard"]')
      ).toBeVisible();
      console.log("[E2E:Copy] Button reset to idle state");
    });

    test("should announce copy status to screen readers", async ({ page }) => {
      console.log("[E2E:Copy] Scrolling to Get Started section");
      await page
        .getByRole("heading", { name: /get started/i })
        .scrollIntoViewIfNeeded();

      const copyButton = page.locator(
        'button[aria-label="Copy to clipboard"]'
      );
      await copyButton.click();

      // Status region should exist for a11y announcements
      const statusRegion = page.locator('[role="status"][aria-live="polite"]');
      await expect(statusRegion).toBeAttached();
      console.log("[E2E:Copy] Screen reader status region present");
    });
  });

  test.describe("Keyboard Access", () => {
    test("should be focusable and activatable via keyboard", async ({
      page,
    }) => {
      console.log("[E2E:Copy] Scrolling to Get Started section");
      await page
        .getByRole("heading", { name: /get started/i })
        .scrollIntoViewIfNeeded();

      // Focus the copy button by tabbing
      const copyButton = page.locator(
        'button[aria-label="Copy to clipboard"]'
      );
      await copyButton.focus();

      // Verify it's focused
      const isFocused = await copyButton.evaluate(
        (el) => document.activeElement === el
      );
      expect(isFocused).toBe(true);
      console.log("[E2E:Copy] Copy button focused");

      // Activate via Enter key
      await page.keyboard.press("Enter");

      await expect(
        page.locator('button[aria-label="Copied!"]')
      ).toBeVisible();
      console.log("[E2E:Copy] Keyboard activation successful");
    });
  });

  test.describe("Error Handling", () => {
    test("should not crash when clipboard access fails", async ({
      page,
      context,
    }) => {
      console.log("[E2E:Copy] Revoking clipboard permissions");
      await context.clearPermissions();

      await page.goto("/tldr");
      await page
        .getByRole("heading", { name: /get started/i })
        .scrollIntoViewIfNeeded();

      const copyButton = page.locator(
        'button[aria-label="Copy to clipboard"]'
      );
      await copyButton.click();

      // Page should not crash
      await expect(page.locator("body")).toBeVisible();
      console.log("[E2E:Copy] Page survived clipboard permission denied");
    });
  });
});
