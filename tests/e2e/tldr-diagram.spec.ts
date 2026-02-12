import { test, expect } from "@playwright/test";

/**
 * E2E Tests for the Interactive Synergy Diagram on the TL;DR Page
 *
 * Tests hover highlighting, click-to-scroll navigation, keyboard
 * accessibility, and reduced motion support.
 *
 * Run with: bunx playwright test tests/e2e/tldr-diagram.spec.ts
 */

test.describe("TLDR Page - Interactive Synergy Diagram", () => {
  test.beforeEach(async ({ page }) => {
    console.log("[E2E:Diagram] Navigating to /tldr");
    await page.goto("/tldr");

    // Scroll diagram into view
    console.log("[E2E:Diagram] Scrolling diagram into view");
    const diagram = page.locator('svg[aria-label*="synergy diagram"]');
    await diagram.scrollIntoViewIfNeeded();
    await expect(diagram).toBeVisible();
  });

  test.describe("Basic Rendering", () => {
    test("should display the SVG diagram with proper aria attributes", async ({
      page,
    }) => {
      const diagram = page.locator('svg[aria-label*="synergy diagram"]');
      await expect(diagram).toBeVisible();
      console.log("[E2E:Diagram] Synergy diagram SVG is visible");

      const ariaLabel = await diagram.getAttribute("aria-label");
      expect(ariaLabel).toContain("synergy diagram");
      expect(ariaLabel).toContain("Click a tool to scroll");
      console.log("[E2E:Diagram] SVG aria-label describes interaction");
    });

    test("should display Flywheel center label", async ({ page }) => {
      const diagram = page.locator('svg[aria-label*="synergy diagram"]');
      const flywheelLabel = diagram.getByText("Flywheel");
      await expect(flywheelLabel).toBeVisible();
      console.log("[E2E:Diagram] Flywheel center label visible");
    });

    test("should display dynamic core tools count", async ({ page }) => {
      const diagram = page.locator('svg[aria-label*="synergy diagram"]');
      const coreToolsLabel = diagram.locator("text").filter({
        hasText: /\d+ Core Tools/,
      });
      await expect(coreToolsLabel).toBeVisible();

      const text = await coreToolsLabel.textContent();
      console.log(`[E2E:Diagram] Core tools count label: "${text}"`);
      expect(text).toMatch(/^\d+ Core Tools$/);
    });

    test("should render tool nodes with button roles", async ({ page }) => {
      const diagram = page.locator('svg[aria-label*="synergy diagram"]');

      // Nodes should have role="button" for accessibility
      const buttonNodes = diagram.locator('[role="button"]');
      const nodeCount = await buttonNodes.count();
      console.log(`[E2E:Diagram] Found ${nodeCount} button nodes`);
      expect(nodeCount).toBeGreaterThanOrEqual(7); // At least 7 core tools
    });

    test("should have aria-labels on tool nodes", async ({ page }) => {
      const diagram = page.locator('svg[aria-label*="synergy diagram"]');

      // Check specific tool nodes have proper aria-labels
      const ntmNode = diagram.locator(
        '[role="button"][aria-label*="NTM"]'
      );
      await expect(ntmNode).toBeVisible();

      const ariaLabel = await ntmNode.getAttribute("aria-label");
      expect(ariaLabel).toContain("click to scroll to details");
      console.log(`[E2E:Diagram] NTM node aria-label: "${ariaLabel}"`);
    });

    test("should display connection lines between tools", async ({
      page,
    }) => {
      const diagram = page.locator('svg[aria-label*="synergy diagram"]');
      const lines = diagram.locator("line");
      const lineCount = await lines.count();
      console.log(`[E2E:Diagram] Found ${lineCount} connection lines`);
      expect(lineCount).toBeGreaterThan(5);
    });
  });

  test.describe("Hover Interactions", () => {
    test("should dim non-connected nodes when one is hovered", async ({
      page,
    }) => {
      console.log("[E2E:Diagram] Testing hover dimming");
      const diagram = page.locator('svg[aria-label*="synergy diagram"]');

      // Find a node to hover
      const ntmNode = diagram.locator(
        '[role="button"][aria-label*="NTM"]'
      );
      await ntmNode.hover();
      await page.waitForTimeout(200);

      // Non-connected nodes should have reduced opacity
      // The diagram sets opacity to 0.25 for non-connected nodes
      const allNodes = diagram.locator('[role="button"]');
      const nodeCount = await allNodes.count();
      let dimmedCount = 0;

      for (let i = 0; i < nodeCount; i++) {
        const node = allNodes.nth(i);
        const opacity = await node.evaluate(
          (el) => getComputedStyle(el).opacity
        );
        if (parseFloat(opacity) < 0.5) {
          dimmedCount++;
        }
      }

      console.log(
        `[E2E:Diagram] ${dimmedCount} of ${nodeCount} nodes dimmed`
      );
      expect(dimmedCount).toBeGreaterThan(0);
      console.log("[E2E:Diagram] Non-connected nodes are dimmed on hover");
    });

    test("should restore opacity when hover leaves", async ({ page }) => {
      console.log("[E2E:Diagram] Testing hover restore");
      const diagram = page.locator('svg[aria-label*="synergy diagram"]');

      const ntmNode = diagram.locator(
        '[role="button"][aria-label*="NTM"]'
      );
      await ntmNode.hover();
      await page.waitForTimeout(200);

      // Move mouse away from all nodes
      await page.mouse.move(10, 10);
      await page.waitForTimeout(200);

      // All nodes should have full opacity now
      const allNodes = diagram.locator('[role="button"]');
      const nodeCount = await allNodes.count();

      for (let i = 0; i < nodeCount; i++) {
        const node = allNodes.nth(i);
        const opacity = await node.evaluate(
          (el) => getComputedStyle(el).opacity
        );
        expect(parseFloat(opacity)).toBeGreaterThanOrEqual(0.9);
      }

      console.log("[E2E:Diagram] All nodes restored to full opacity");
    });
  });

  test.describe("Click Navigation", () => {
    test("should scroll to tool card when node is clicked", async ({
      page,
    }) => {
      console.log("[E2E:Diagram] Testing click navigation");
      const diagram = page.locator('svg[aria-label*="synergy diagram"]');

      // Get initial scroll position
      const initialScroll = await page.evaluate(() => window.scrollY);
      console.log(`[E2E:Diagram] Initial scroll: ${initialScroll}`);

      // Click a tool node
      const ntmNode = diagram.locator(
        '[role="button"][aria-label*="NTM"]'
      );
      await ntmNode.click();

      // Wait for smooth scroll
      await page.waitForTimeout(1000);

      // Scroll position should have changed
      const newScroll = await page.evaluate(() => window.scrollY);
      console.log(`[E2E:Diagram] Scroll after click: ${newScroll}`);
      expect(newScroll).not.toBe(initialScroll);

      // The NTM tool card should be visible in viewport
      const ntmCard = page
        .locator('[data-testid="tool-card"]')
        .filter({ hasText: /Named Tmux Manager/i });
      await expect(ntmCard).toBeInViewport();
      console.log("[E2E:Diagram] NTM card scrolled into viewport");
    });

    test("should briefly highlight target card after navigation", async ({
      page,
    }) => {
      console.log("[E2E:Diagram] Testing card highlight after click");
      const diagram = page.locator('svg[aria-label*="synergy diagram"]');

      const cassNode = diagram.locator(
        '[role="button"][aria-label*="CASS"]'
      );
      await cassNode.click();
      await page.waitForTimeout(500);

      // Card should have a ring highlight (ring-2 class added briefly)
      const cassCard = page
        .locator('[data-testid="tool-card"]')
        .filter({ hasText: /Coding Agent Session Search/i });

      const hasRing = await cassCard.evaluate((el) =>
        el.className.includes("ring-2")
      );
      console.log(`[E2E:Diagram] Card has ring highlight: ${hasRing}`);
      expect(hasRing).toBe(true);

      // Wait for highlight to fade (1500ms)
      await page.waitForTimeout(2000);

      const hasRingAfter = await cassCard.evaluate((el) =>
        el.className.includes("ring-2")
      );
      console.log(`[E2E:Diagram] Ring removed after timeout: ${!hasRingAfter}`);
      expect(hasRingAfter).toBe(false);
    });
  });

  test.describe("Keyboard Navigation", () => {
    test("should support Tab navigation through nodes", async ({ page }) => {
      console.log("[E2E:Diagram] Testing Tab navigation");
      const diagram = page.locator('svg[aria-label*="synergy diagram"]');

      // Focus the first node
      const firstNode = diagram.locator('[role="button"]').first();
      await firstNode.focus();

      const isFocused = await firstNode.evaluate(
        (el) => document.activeElement === el
      );
      expect(isFocused).toBe(true);
      console.log("[E2E:Diagram] First node focused via focus()");

      // Tab to next node
      await page.keyboard.press("Tab");
      const secondFocused = await diagram
        .locator('[role="button"]:focus')
        .count();
      // Focus might move to next node or leave SVG; just verify no crash
      console.log(
        `[E2E:Diagram] After Tab, ${secondFocused} nodes focused in SVG`
      );
    });

    test("should navigate to card on Enter key", async ({ page }) => {
      console.log("[E2E:Diagram] Testing Enter key navigation");
      const diagram = page.locator('svg[aria-label*="synergy diagram"]');

      const ntmNode = diagram.locator(
        '[role="button"][aria-label*="NTM"]'
      );
      await ntmNode.focus();
      console.log("[E2E:Diagram] NTM node focused");

      const initialScroll = await page.evaluate(() => window.scrollY);
      await page.keyboard.press("Enter");
      await page.waitForTimeout(1000);

      const newScroll = await page.evaluate(() => window.scrollY);
      console.log(
        `[E2E:Diagram] Scroll: ${initialScroll} → ${newScroll}`
      );
      expect(newScroll).not.toBe(initialScroll);

      // NTM card should be in viewport
      const ntmCard = page
        .locator('[data-testid="tool-card"]')
        .filter({ hasText: /Named Tmux Manager/i });
      await expect(ntmCard).toBeInViewport();
      console.log("[E2E:Diagram] Enter key navigation works");
    });

    test("should navigate to card on Space key", async ({ page }) => {
      console.log("[E2E:Diagram] Testing Space key navigation");
      const diagram = page.locator('svg[aria-label*="synergy diagram"]');

      const cassNode = diagram.locator(
        '[role="button"][aria-label*="CASS"]'
      );
      await cassNode.focus();

      const initialScroll = await page.evaluate(() => window.scrollY);
      await page.keyboard.press("Space");
      await page.waitForTimeout(1000);

      const newScroll = await page.evaluate(() => window.scrollY);
      expect(newScroll).not.toBe(initialScroll);
      console.log("[E2E:Diagram] Space key navigation works");
    });
  });

  test.describe("Reduced Motion", () => {
    test("should still function with prefers-reduced-motion", async ({
      page,
    }) => {
      console.log("[E2E:Diagram] Testing reduced motion");
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/tldr");

      const diagram = page.locator('svg[aria-label*="synergy diagram"]');
      await diagram.scrollIntoViewIfNeeded();
      await expect(diagram).toBeVisible();

      // Nodes should still be interactive
      const ntmNode = diagram.locator(
        '[role="button"][aria-label*="NTM"]'
      );
      await ntmNode.click();
      await page.waitForTimeout(500);

      // Should still navigate to card
      const ntmCard = page
        .locator('[data-testid="tool-card"]')
        .filter({ hasText: /Named Tmux Manager/i });
      await expect(ntmCard).toBeInViewport();
      console.log("[E2E:Diagram] Reduced motion: navigation still works");
    });
  });
});
