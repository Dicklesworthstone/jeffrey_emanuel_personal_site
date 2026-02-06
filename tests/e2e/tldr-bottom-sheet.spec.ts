import { test, expect, devices } from "@playwright/test";

/**
 * E2E Tests for the Mobile Bottom Sheet on the TL;DR Page
 *
 * Tests the bottom sheet component that replaces inline card expansion
 * on mobile viewports (<768px). Triggered by "Show Details" button on
 * tool cards.
 *
 * Run with: bunx playwright test tests/e2e/tldr-bottom-sheet.spec.ts
 */

test.describe("TLDR Page - Mobile Bottom Sheet", () => {
  // Use mobile viewport for all tests in this describe block
  test.use({ ...devices["Pixel 5"] });

  test.beforeEach(async ({ page }) => {
    console.log("[E2E:Sheet] Navigating to /tldr on mobile viewport");
    await page.goto("/tldr");
  });

  test.describe("Sheet Opening", () => {
    test("should display Show Details button on mobile cards", async ({
      page,
    }) => {
      console.log("[E2E:Sheet] Looking for Show Details buttons");
      const showDetailsButtons = page.locator("button").filter({
        hasText: "Show Details",
      });
      const count = await showDetailsButtons.count();
      console.log(`[E2E:Sheet] Found ${count} Show Details buttons`);
      expect(count).toBeGreaterThan(0);
    });

    test("should open bottom sheet when Show Details is tapped", async ({
      page,
    }) => {
      console.log("[E2E:Sheet] Tapping Show Details");
      const showDetailsBtn = page
        .locator("button")
        .filter({ hasText: "Show Details" })
        .first();
      await showDetailsBtn.scrollIntoViewIfNeeded();
      await showDetailsBtn.tap();

      // Wait for animation
      await page.waitForTimeout(500);

      const sheet = page.locator('[data-testid="bottom-sheet"]');
      await expect(sheet).toBeVisible();
      console.log("[E2E:Sheet] Bottom sheet opened");

      // Sheet should have dialog role
      await expect(sheet).toHaveAttribute("role", "dialog");
      await expect(sheet).toHaveAttribute("aria-modal", "true");
      console.log("[E2E:Sheet] Dialog role and aria-modal verified");
    });

    test("should show drag handle on sheet", async ({ page }) => {
      console.log("[E2E:Sheet] Testing drag handle");
      const showDetailsBtn = page
        .locator("button")
        .filter({ hasText: "Show Details" })
        .first();
      await showDetailsBtn.scrollIntoViewIfNeeded();
      await showDetailsBtn.tap();
      await page.waitForTimeout(500);

      const dragHandle = page.locator('[data-testid="drag-handle"]');
      await expect(dragHandle).toBeVisible();
      console.log("[E2E:Sheet] Drag handle visible");
    });

    test("should show tool name in sheet title", async ({ page }) => {
      console.log("[E2E:Sheet] Testing sheet title");

      // Find a specific tool card and tap Show Details
      const toolCards = page.locator('[data-testid="tool-card"]');
      const firstCard = toolCards.first();
      await firstCard.scrollIntoViewIfNeeded();

      // Get the tool's short name from the card heading
      const toolName = await firstCard.locator("h3").first().textContent();
      console.log(`[E2E:Sheet] Tool card name: "${toolName}"`);

      const showDetailsBtn = firstCard
        .locator("button")
        .filter({ hasText: "Show Details" });
      await showDetailsBtn.tap();
      await page.waitForTimeout(500);

      // Sheet title should contain the tool's short name
      const sheet = page.locator('[data-testid="bottom-sheet"]');
      if (toolName) {
        await expect(sheet).toContainText(toolName);
        console.log(`[E2E:Sheet] Sheet title contains "${toolName}"`);
      }
    });
  });

  test.describe("Sheet Content", () => {
    test("should display tool details in sheet", async ({ page }) => {
      console.log("[E2E:Sheet] Testing sheet content");
      const showDetailsBtn = page
        .locator("button")
        .filter({ hasText: "Show Details" })
        .first();
      await showDetailsBtn.scrollIntoViewIfNeeded();
      await showDetailsBtn.tap();
      await page.waitForTimeout(500);

      const sheetContent = page.locator('[data-testid="sheet-content"]');
      await expect(sheetContent).toBeVisible();

      // Should contain tool detail sections
      await expect(
        sheetContent.getByText(/why it's useful/i).first()
      ).toBeVisible();
      console.log("[E2E:Sheet] 'Why It's Useful' section visible");

      await expect(
        sheetContent.getByText(/key features/i).first()
      ).toBeVisible();
      console.log("[E2E:Sheet] 'Key Features' section visible");
    });

    test("should have scrollable content area", async ({ page }) => {
      console.log("[E2E:Sheet] Testing content scrollability");
      const showDetailsBtn = page
        .locator("button")
        .filter({ hasText: "Show Details" })
        .first();
      await showDetailsBtn.scrollIntoViewIfNeeded();
      await showDetailsBtn.tap();
      await page.waitForTimeout(500);

      const sheetContent = page.locator('[data-testid="sheet-content"]');

      // Content should be scrollable (scrollHeight > clientHeight)
      const isScrollable = await sheetContent.evaluate(
        (el) => el.scrollHeight > el.clientHeight
      );
      console.log(`[E2E:Sheet] Content scrollable: ${isScrollable}`);

      if (isScrollable) {
        // Scroll down to verify scrolling works
        await sheetContent.evaluate((el) => {
          el.scrollTop = 100;
        });
        const scrollTop = await sheetContent.evaluate(
          (el) => el.scrollTop
        );
        expect(scrollTop).toBeGreaterThan(0);
        console.log("[E2E:Sheet] Content scrolled successfully");
      }
    });

    test("should display GitHub link in sheet", async ({ page }) => {
      console.log("[E2E:Sheet] Testing GitHub link");
      const showDetailsBtn = page
        .locator("button")
        .filter({ hasText: "Show Details" })
        .first();
      await showDetailsBtn.scrollIntoViewIfNeeded();
      await showDetailsBtn.tap();
      await page.waitForTimeout(500);

      const sheetContent = page.locator('[data-testid="sheet-content"]');
      const githubLink = sheetContent.locator('a[href*="github.com"]');
      await expect(githubLink.first()).toBeVisible();
      await expect(githubLink.first()).toHaveAttribute("target", "_blank");
      console.log("[E2E:Sheet] GitHub link present with target=_blank");
    });
  });

  test.describe("Sheet Closing", () => {
    test("should close on close button tap", async ({ page }) => {
      console.log("[E2E:Sheet] Testing close button");
      const showDetailsBtn = page
        .locator("button")
        .filter({ hasText: "Show Details" })
        .first();
      await showDetailsBtn.scrollIntoViewIfNeeded();
      await showDetailsBtn.tap();
      await page.waitForTimeout(500);

      const sheet = page.locator('[data-testid="bottom-sheet"]');
      await expect(sheet).toBeVisible();

      // Click the close button
      const closeBtn = page
        .locator('[data-testid="bottom-sheet"]')
        .locator('button[aria-label="Close"]');
      await closeBtn.tap();
      await page.waitForTimeout(500);

      await expect(sheet).not.toBeVisible();
      console.log("[E2E:Sheet] Sheet closed via close button");
    });

    test("should close on Escape key", async ({ page }) => {
      console.log("[E2E:Sheet] Testing Escape key");
      const showDetailsBtn = page
        .locator("button")
        .filter({ hasText: "Show Details" })
        .first();
      await showDetailsBtn.scrollIntoViewIfNeeded();
      await showDetailsBtn.tap();
      await page.waitForTimeout(500);

      const sheet = page.locator('[data-testid="bottom-sheet"]');
      await expect(sheet).toBeVisible();

      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);

      await expect(sheet).not.toBeVisible();
      console.log("[E2E:Sheet] Sheet closed via Escape key");
    });

    test("should close on backdrop tap", async ({ page }) => {
      console.log("[E2E:Sheet] Testing backdrop dismiss");
      const showDetailsBtn = page
        .locator("button")
        .filter({ hasText: "Show Details" })
        .first();
      await showDetailsBtn.scrollIntoViewIfNeeded();
      await showDetailsBtn.tap();
      await page.waitForTimeout(500);

      const sheet = page.locator('[data-testid="bottom-sheet"]');
      await expect(sheet).toBeVisible();

      // Tap the backdrop (area above the sheet)
      const backdrop = page.locator('[aria-hidden="true"]').first();
      await backdrop.tap({ position: { x: 50, y: 50 }, force: true });
      await page.waitForTimeout(500);

      await expect(sheet).not.toBeVisible();
      console.log("[E2E:Sheet] Sheet closed via backdrop tap");
    });

    test("should close on swipe down gesture", async ({ page }) => {
      console.log("[E2E:Sheet] Testing swipe-to-dismiss");
      const showDetailsBtn = page
        .locator("button")
        .filter({ hasText: "Show Details" })
        .first();
      await showDetailsBtn.scrollIntoViewIfNeeded();
      await showDetailsBtn.tap();
      await page.waitForTimeout(500);

      const sheet = page.locator('[data-testid="bottom-sheet"]');
      await expect(sheet).toBeVisible();

      const sheetBox = await sheet.boundingBox();
      if (sheetBox) {
        const startX = sheetBox.x + sheetBox.width / 2;
        const startY = sheetBox.y + 30; // Near the drag handle

        console.log(`[E2E:Sheet] Swiping down from (${startX}, ${startY})`);

        // Simulate swipe down (>100px triggers close)
        await page.mouse.move(startX, startY);
        await page.mouse.down();
        await page.mouse.move(startX, startY + 200, { steps: 10 });
        await page.mouse.up();

        await page.waitForTimeout(500);
        await expect(sheet).not.toBeVisible();
        console.log("[E2E:Sheet] Sheet closed via swipe down");
      }
    });
  });

  test.describe("Accessibility", () => {
    test("should have aria-modal and dialog role", async ({ page }) => {
      console.log("[E2E:Sheet] Testing a11y attributes");
      const showDetailsBtn = page
        .locator("button")
        .filter({ hasText: "Show Details" })
        .first();
      await showDetailsBtn.scrollIntoViewIfNeeded();
      await showDetailsBtn.tap();
      await page.waitForTimeout(500);

      const sheet = page.locator('[data-testid="bottom-sheet"]');
      await expect(sheet).toHaveAttribute("role", "dialog");
      await expect(sheet).toHaveAttribute("aria-modal", "true");
      console.log("[E2E:Sheet] Dialog a11y attributes verified");
    });

    test("should have aria-labelledby linked to title", async ({ page }) => {
      console.log("[E2E:Sheet] Testing aria-labelledby");
      const showDetailsBtn = page
        .locator("button")
        .filter({ hasText: "Show Details" })
        .first();
      await showDetailsBtn.scrollIntoViewIfNeeded();
      await showDetailsBtn.tap();
      await page.waitForTimeout(500);

      const sheet = page.locator('[data-testid="bottom-sheet"]');
      const labelledBy = await sheet.getAttribute("aria-labelledby");
      expect(labelledBy).toBeTruthy();
      console.log(`[E2E:Sheet] aria-labelledby: "${labelledBy}"`);

      // The h2 title should have matching id
      const title = sheet.locator(`#${labelledBy}`);
      await expect(title).toBeVisible();
      console.log("[E2E:Sheet] Title element matches aria-labelledby");
    });

    test("should meet minimum touch target sizes for close button", async ({
      page,
    }) => {
      console.log("[E2E:Sheet] Testing touch target size");
      const showDetailsBtn = page
        .locator("button")
        .filter({ hasText: "Show Details" })
        .first();
      await showDetailsBtn.scrollIntoViewIfNeeded();
      await showDetailsBtn.tap();
      await page.waitForTimeout(500);

      const closeBtn = page
        .locator('[data-testid="bottom-sheet"]')
        .locator('button[aria-label="Close"]');

      // Close button should have min-h-[44px] and min-w-[44px] classes
      const classes = await closeBtn.getAttribute("class");
      expect(classes).toContain("min-h-[44px]");
      expect(classes).toContain("min-w-[44px]");
      console.log("[E2E:Sheet] Close button meets 44px touch target");
    });
  });

  test.describe("Desktop Behavior", () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test("should NOT show bottom sheet on desktop viewport", async ({
      page,
    }) => {
      console.log("[E2E:Sheet] Testing desktop fallback");
      await page.goto("/tldr");

      // Show Details buttons should be hidden on desktop (md:hidden)
      const showDetailsButtons = page.locator("button").filter({
        hasText: "Show Details",
      });

      // Even if they exist in DOM, they should not be visible
      const count = await showDetailsButtons.count();
      console.log(`[E2E:Sheet] Show Details buttons in DOM: ${count}`);

      for (let i = 0; i < Math.min(count, 3); i++) {
        await expect(showDetailsButtons.nth(i)).not.toBeVisible();
      }
      console.log(
        "[E2E:Sheet] Show Details buttons hidden on desktop"
      );
    });
  });
});
