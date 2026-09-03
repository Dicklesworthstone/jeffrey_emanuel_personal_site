/**
 * Comprehensive Playwright tests for jeffreyemanuel.com
 * Tests all pages on desktop, mobile, and tablet viewports
 * Verifies interactive features and checks for JS errors
 *
 * Usage: npx tsx scripts/playwright-tests.ts
 */

import { chromium, type BrowserContext } from "playwright";
import * as fs from "fs";
import * as path from "path";

const BASE_URL = process.env.TEST_URL || "http://localhost:3000";
const SCREENSHOT_DIR = "./test-screenshots";

const PAGES = [
  { path: "/", name: "home" },
  { path: "/about", name: "about" },
  { path: "/consulting", name: "consulting" },
  { path: "/projects", name: "projects" },
  { path: "/projects/mcp-agent-mail", name: "project-detail-mail" },
  { path: "/tldr", name: "tldr-flywheel" },
  { path: "/writing", name: "writing" },
  { path: "/writing/wills-and-estate-planning", name: "writing-wills-estate" },
  { path: "/writing/cmaes_explainer", name: "writing-cmaes" },
  { path: "/writing/raptorq", name: "writing-raptorq" },
  { path: "/writing/bakery_algorithm", name: "writing-bakery" },
  { path: "/writing/barra-factor-model", name: "writing-barra" },
  { path: "/writing/hoeffdings_d_explainer", name: "writing-hoeffdings" },
  { path: "/media", name: "media" },
  { path: "/contact", name: "contact" },
  { path: "/nvidia-story", name: "nvidia-story" },
];

const VIEWPORTS = {
  desktop: { width: 1440, height: 900, isMobile: false },
  mobile: { width: 375, height: 812, isMobile: true },
  tablet: { width: 768, height: 1024, isMobile: true },
};

interface TestResult {
  page: string;
  viewport: string;
  success: boolean;
  errors: string[];
  warnings: string[];
  screenshot: string;
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testPage(
  context: BrowserContext,
  pagePath: string,
  pageName: string,
  viewportName: string,
  viewport: (typeof VIEWPORTS)["desktop"]
): Promise<TestResult> {
  const page = await context.newPage();
  const errors: string[] = [];
  const warnings: string[] = [];

  // Collect console errors
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      // Filter out non-critical errors
      if (!text.includes("favicon") && !text.includes("_vercel")) {
        errors.push(text);
      }
    }
    if (msg.type() === "warning") {
      warnings.push(msg.text());
    }
  });

  // Collect page errors
  page.on("pageerror", (err) => {
    errors.push(`Page error: ${err.message}`);
  });

  const result: TestResult = {
    page: pageName,
    viewport: viewportName,
    success: true,
    errors: [],
    warnings: [],
    screenshot: "",
  };

  try {
    console.log(`  Testing ${pageName} on ${viewportName}...`);

    await page.goto(`${BASE_URL}${pagePath}`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    await delay(3000);

    // Check for broken layouts
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = viewport.width;

    if (bodyWidth > viewportWidth + 20) {
      warnings.push(
        `Horizontal overflow detected: body=${bodyWidth}px, viewport=${viewportWidth}px`
      );
    }

    // Check if main content is visible
    const hasContent = await page.evaluate(() => {
      const sections = document.querySelectorAll("[data-section], section, main");
      return sections.length > 0;
    });

    if (!hasContent) {
      errors.push("No main content sections found");
    }

    // Take full page screenshot
    const screenshotName = `${pageName}-${viewportName}.png`;
    const screenshotPath = path.join(SCREENSHOT_DIR, screenshotName);
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });
    result.screenshot = screenshotPath;

    // On projects page, verify flywheel is visible on mobile
    if (pageName === "projects" && viewportName === "mobile") {
      const flywheelVisible = await page.evaluate(() => {
        const flywheel = document.querySelector(
          '[aria-label="Interactive flywheel showing tool connections"]'
        );
        if (!flywheel) return { visible: false, reason: "Not found" };
        const rect = flywheel.getBoundingClientRect();
        return {
          visible: rect.width > 0 && rect.height > 0,
          width: rect.width,
          height: rect.height,
        };
      });

      if (!flywheelVisible.visible) {
        errors.push(`Flywheel not visible on mobile: ${JSON.stringify(flywheelVisible)}`);
      } else {
        console.log(`    ✓ Flywheel visible: ${JSON.stringify(flywheelVisible)}`);
      }
    }

    // On media page, verify content is present
    if (pageName === "media") {
      const mediaContent = await page.evaluate(() => {
        const text = document.body.innerText;
        return {
          hasBankless: text.includes("Bankless"),
          hasDiginomica: text.includes("Diginomica"),
          hasSlashdot: text.includes("Slashdot"),
        };
      });

      if (!mediaContent.hasBankless && !mediaContent.hasDiginomica) {
        errors.push("Media page appears empty");
      } else {
        console.log(`    ✓ Media content present`);
      }
    }

    // Test navigation on mobile
    if (viewportName === "mobile") {
      const menuButton = page.locator('button[aria-label="Toggle navigation"]');
      if (await menuButton.isVisible()) {
        await menuButton.click();
        await delay(500);

        const menuOpen = await page.evaluate(() => {
          return document.body.style.overflow === "hidden";
        });

        if (!menuOpen) {
          warnings.push("Mobile menu may not have opened properly");
        }

        await menuButton.click();
        await delay(500);
      }
    }

    result.errors = errors;
    result.warnings = warnings;
    result.success = errors.length === 0;
  } catch (err) {
    result.success = false;
    result.errors = [`Test failed: ${(err as Error).message}`];
  } finally {
    await page.close();
  }

  return result;
}

async function runTests() {
  console.log(`Starting comprehensive Playwright tests against ${BASE_URL}...\n`);

  // Create screenshot directory
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const results: TestResult[] = [];
  const browser = await chromium.launch({ channel: "chrome" });

  try {
    for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
      console.log(`\nTesting ${viewportName} viewport (${viewport.width}x${viewport.height}):`);

      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: viewport.isMobile ? 2 : 1,
        isMobile: viewport.isMobile,
        hasTouch: viewport.isMobile,
        serviceWorkers: "block",
        reducedMotion: "reduce",
      });

      for (const pageInfo of PAGES) {
        const result = await testPage(
          context,
          pageInfo.path,
          pageInfo.name,
          viewportName,
          viewport
        );
        results.push(result);
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("TEST SUMMARY");
  console.log("=".repeat(60) + "\n");

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const result of results) {
    const status = result.success ? "✅" : "❌";
    console.log(`${status} ${result.page} (${result.viewport})`);

    if (result.errors.length > 0) {
      totalErrors += result.errors.length;
      result.errors.forEach((err) => console.log(`   Error: ${err}`));
    }
    if (result.warnings.length > 0) {
      totalWarnings += result.warnings.length;
      result.warnings.forEach((warn) => console.log(`   Warning: ${warn}`));
    }
  }

  console.log("\n" + "-".repeat(60));
  console.log(`Total: ${results.filter((r) => r.success).length}/${results.length} passed`);
  console.log(`Errors: ${totalErrors}, Warnings: ${totalWarnings}`);
  console.log(`Screenshots saved to: ${SCREENSHOT_DIR}/`);

  // Interactive features test
  console.log("\n" + "=".repeat(60));
  console.log("INTERACTIVE FEATURES TEST");
  console.log("=".repeat(60) + "\n");

  const browser2 = await chromium.launch({ channel: "chrome" });
  const desktopContext = await browser2.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const interactivePage = await desktopContext.newPage();

  try {
    // Test project filter buttons
    console.log("Testing project filter buttons...");
    await interactivePage.goto(`${BASE_URL}/projects`, { waitUntil: "domcontentloaded" });
    await delay(2000);

    const filterButtons = interactivePage.locator(
      '[aria-label="Filter projects by category"] button'
    );
    const filterCount = await filterButtons.count();
    console.log(`  Found ${filterCount} filter buttons`);

    for (let i = 0; i < Math.min(filterCount, 3); i++) {
      await filterButtons.nth(i).click();
      await delay(500);
      console.log(`  Clicked filter ${i + 1}`);
    }

    // Test navigation links
    console.log("\nTesting navigation links...");
    await interactivePage.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await delay(2000);

    const navLinks = interactivePage.locator('nav[aria-label="Main navigation"] a');
    const navCount = await navLinks.count();
    console.log(`  Found ${navCount} navigation links`);

    // Test Command Palette (Meta+K / /)
    console.log("\nTesting Command Palette...");
    await interactivePage.keyboard.press("Meta+k");
    await delay(800);
    const searchInput = interactivePage.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      console.log("  ✓ Command palette opened via shortcut");
      await searchInput.fill("mail");
      await delay(600);
      await interactivePage.screenshot({
        path: path.join(SCREENSHOT_DIR, "interactive-command-palette.png"),
      });
      console.log("  ✓ Saved interactive-command-palette.png");
      await interactivePage.keyboard.press("Escape");
      await delay(500);
      console.log("  ✓ Command palette closed via Escape");
    } else {
      console.log("  ⚠ Command palette input not detected after Meta+k");
    }

    // Test Keyboard Shortcuts Modal (?)
    console.log("\nTesting Keyboard Shortcuts Modal...");
    await interactivePage.keyboard.press("?");
    await delay(800);
    const shortcutsModal = interactivePage.locator('[role="dialog"][aria-label="Keyboard shortcuts"]');
    if (await shortcutsModal.isVisible()) {
      console.log("  ✓ Keyboard shortcuts modal opened");
      await interactivePage.screenshot({
        path: path.join(SCREENSHOT_DIR, "interactive-shortcuts-modal.png"),
      });
      console.log("  ✓ Saved interactive-shortcuts-modal.png");
      await interactivePage.keyboard.press("Escape");
      await delay(500);
      console.log("  ✓ Keyboard shortcuts modal closed via Escape");
    } else {
      console.log("  ⚠ Shortcuts modal not visible after ?");
    }

    // Test Consulting intake wizard
    console.log("\nTesting Consulting intake wizard...");
    await interactivePage.goto(`${BASE_URL}/consulting`, { waitUntil: "domcontentloaded" });
    await delay(2000);
    const advisoryOption = interactivePage.locator('input[type="radio"], [role="radio"]').first();
    if (await advisoryOption.isVisible()) {
      await advisoryOption.click();
      await delay(300);
      console.log("  ✓ Selected advisory option in consulting wizard");
    }
    const continueBtn = interactivePage.locator('button:has-text("Continue"), button:has-text("Next")').first();
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
      await delay(600);
      console.log("  ✓ Stepped into consulting contact fields");
      await interactivePage.screenshot({
        path: path.join(SCREENSHOT_DIR, "interactive-consulting-wizard.png"),
      });
      console.log("  ✓ Saved interactive-consulting-wizard.png");
    }

    // Test TLDR Flywheel Compare Mode
    console.log("\nTesting TLDR Flywheel Compare Mode...");
    await interactivePage.goto(`${BASE_URL}/tldr`, { waitUntil: "domcontentloaded" });
    await delay(2000);
    const compareToggle = interactivePage.locator('button:has-text("Compare")').first();
    if (await compareToggle.isVisible()) {
      await compareToggle.click();
      await delay(500);
      console.log("  ✓ Activated Compare Mode");
      const toolCheckboxes = interactivePage.locator('input[type="checkbox"], button[aria-label*="compare"], button[aria-label*="Compare"]');
      const boxCount = await toolCheckboxes.count();
      if (boxCount >= 2) {
        await toolCheckboxes.nth(0).scrollIntoViewIfNeeded();
        await toolCheckboxes.nth(0).click();
        await delay(300);
        await toolCheckboxes.nth(1).scrollIntoViewIfNeeded();
        await toolCheckboxes.nth(1).click();
        await delay(300);
        console.log("  ✓ Selected 2 tools for comparison");
        await interactivePage.screenshot({
          path: path.join(SCREENSHOT_DIR, "interactive-tldr-compare.png"),
        });
        console.log("  ✓ Saved interactive-tldr-compare.png");
      }
    }

    // Test Wills & Estate Planning Interactive Tools
    console.log("\nTesting Wills & Estate Planning Interactive Visualizations...");
    await interactivePage.goto(`${BASE_URL}/writing/wills-and-estate-planning`, { waitUntil: "domcontentloaded" });
    await delay(2500);
    // Find anti-pattern card buttons
    const cardButtons = interactivePage.locator('button[aria-label*="anti-pattern card"]');
    const cardCount = await cardButtons.count();
    if (cardCount > 0) {
      console.log(`  Found ${cardCount} anti-pattern cards`);
      await cardButtons.first().scrollIntoViewIfNeeded();
      await cardButtons.first().click();
      await delay(600);
      console.log("  ✓ Flipped first anti-pattern card");
      await interactivePage.screenshot({
        path: path.join(SCREENSHOT_DIR, "interactive-wills-anti-pattern-flip.png"),
      });
      console.log("  ✓ Saved interactive-wills-anti-pattern-flip.png");
    }

    // Test CMA-ES Explainer Visualizer
    console.log("\nTesting CMA-ES Explainer Visualizer...");
    await interactivePage.goto(`${BASE_URL}/writing/cmaes_explainer`, { waitUntil: "domcontentloaded" });
    await delay(2500);
    const objectiveButtons = interactivePage.locator('button:has-text("Rosenbrock"), button:has-text("Rastrigin")');
    if (await objectiveButtons.count() > 0) {
      await objectiveButtons.first().scrollIntoViewIfNeeded();
      await objectiveButtons.first().click();
      await delay(600);
      console.log("  ✓ Switched CMA-ES objective function");
      await interactivePage.screenshot({
        path: path.join(SCREENSHOT_DIR, "interactive-cmaes-objective.png"),
      });
      console.log("  ✓ Saved interactive-cmaes-objective.png");
    }

    // Test scroll
    console.log("\nTesting scroll functionality...");
    await interactivePage.evaluate(() => window.scrollTo(0, 2000));
    await delay(1000);

    const scrolledPosition = await interactivePage.evaluate(() => window.scrollY);
    console.log(`  Scrolled to position: ${scrolledPosition}`);

    console.log("\n✅ Interactive features test complete");
  } catch (err) {
    console.log(`\n❌ Interactive test error: ${(err as Error).message}`);
  } finally {
    await browser2.close();
  }

  process.exit(totalErrors > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
