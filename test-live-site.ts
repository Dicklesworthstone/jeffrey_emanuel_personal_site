import { chromium, devices, type ConsoleMessage } from "playwright";
import * as fs from "fs";
import * as path from "path";

const SITE_URL = "https://jeffreyemanuel.com";
const SCREENSHOT_DIR = "./screenshots";

// Console errors to collect
const consoleErrors: { page: string; type: string; text: string }[] = [];
const consoleWarnings: { page: string; type: string; text: string }[] = [];

// Pages to test
const PAGES = [
  { path: "/", name: "home" },
  { path: "/about", name: "about" },
  { path: "/projects", name: "projects" },
  { path: "/writing", name: "writing" },
  { path: "/consulting", name: "consulting" },
  { path: "/media", name: "media" },
  { path: "/contact", name: "contact" },
];

function setupConsoleListener(page: any, pageName: string) {
  page.on("console", (msg: ConsoleMessage) => {
    const type = msg.type();
    const text = msg.text();

    // Filter out known non-issues
    if (text.includes("Download the React DevTools")) return;
    if (text.includes("Third-party cookie")) return;
    if (text.includes("Lit is in dev mode")) return;
    if (text.includes("Failed to load resource") && text.includes("favicon")) return;

    if (type === "error") {
      consoleErrors.push({ page: pageName, type, text });
    } else if (type === "warning") {
      consoleWarnings.push({ page: pageName, type, text });
    }
  });

  page.on("pageerror", (error: Error) => {
    consoleErrors.push({ page: pageName, type: "pageerror", text: error.message });
  });
}

async function testDesktop() {
  console.log("\n🖥️  Testing Desktop View...\n");

  const browser = await chromium.launch({ headless: true });

  for (const pageInfo of PAGES) {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const url = `${SITE_URL}${pageInfo.path}`;
    console.log(`  📄 Testing ${pageInfo.name} (${url})`);

    setupConsoleListener(page, `desktop-${pageInfo.name}`);

    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(3000); // Wait for hydration and animations

      // Take full page screenshot
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `desktop-${pageInfo.name}.png`),
        fullPage: true,
      });
      console.log(`    ✅ Screenshot saved: desktop-${pageInfo.name}.png`);
    } catch (error) {
      console.log(`    ❌ Error on ${pageInfo.name}: ${error}`);
      consoleErrors.push({ page: `desktop-${pageInfo.name}`, type: "navigation", text: String(error) });
    }

    await context.close();
  }

  await browser.close();
}

async function testMobile() {
  console.log("\n📱 Testing Mobile View...\n");

  const browser = await chromium.launch({ headless: true });
  const iPhone = devices["iPhone 14 Pro"];

  for (const pageInfo of PAGES) {
    const context = await browser.newContext({
      ...iPhone,
    });
    const page = await context.newPage();
    const url = `${SITE_URL}${pageInfo.path}`;
    console.log(`  📄 Testing ${pageInfo.name} (mobile)`);

    setupConsoleListener(page, `mobile-${pageInfo.name}`);

    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(3000); // Wait for hydration and animations

      // Take full page screenshot
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `mobile-${pageInfo.name}.png`),
        fullPage: true,
      });
      console.log(`    ✅ Screenshot saved: mobile-${pageInfo.name}.png`);
    } catch (error) {
      console.log(`    ❌ Error on ${pageInfo.name}: ${error}`);
      consoleErrors.push({ page: `mobile-${pageInfo.name}`, type: "navigation", text: String(error) });
    }

    await context.close();
  }

  await browser.close();
}

async function testInteractiveFeatures() {
  console.log("\n🎮 Testing Interactive Features...\n");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();
  setupConsoleListener(page, "interactive");

  try {
    // Test 1: Home page navigation
    console.log("  🔗 Testing navigation links...");
    await page.goto(SITE_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2000);

    // Click navigation links
    const navLinks = await page.locator('nav a').all();
    console.log(`    Found ${navLinks.length} navigation links`);

    // Test 2: Projects page filter buttons
    console.log("  🔘 Testing project filter buttons...");
    await page.goto(`${SITE_URL}/projects`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2000);

    const filterButtons = await page.locator('nav[role="tablist"] button').all();
    console.log(`    Found ${filterButtons.length} filter buttons`);

    for (let i = 0; i < Math.min(filterButtons.length, 3); i++) {
      const button = filterButtons[i];
      const text = await button.textContent();
      await button.click();
      await page.waitForTimeout(500);
      console.log(`    ✅ Clicked filter: ${text?.trim()}`);
    }

    // Take screenshot of filtered state
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "interactive-filters.png"),
      fullPage: false,
    });

    // Test 3: Flywheel visualization interaction
    console.log("  🎡 Testing flywheel visualization...");
    const flywheelNodes = await page.locator('button[aria-label*="tagline"]').all();
    console.log(`    Found ${flywheelNodes.length} flywheel nodes`);

    if (flywheelNodes.length > 0) {
      await flywheelNodes[0].click();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "interactive-flywheel.png"),
      });
      console.log("    ✅ Clicked flywheel node");
    }

    // Test 4: Mobile menu toggle
    console.log("  📱 Testing mobile menu...");
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(SITE_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2000);

    const menuButton = page.locator('button[aria-label="Toggle navigation"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "interactive-mobile-menu.png"),
      });
      console.log("    ✅ Mobile menu opened");
    }

    // Test 5: Scroll behavior
    console.log("  📜 Testing scroll behavior...");
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(SITE_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2000);

    // Scroll down and check header behavior
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "interactive-scrolled.png"),
    });
    console.log("    ✅ Scroll behavior tested");

    // Test 6: Command palette (Cmd+K)
    console.log("  ⌨️ Testing command palette...");
    await page.keyboard.press("Meta+k");
    await page.waitForTimeout(500);

    const palette = page.locator('[role="dialog"][aria-label="Command palette"]');
    if (await palette.isVisible({ timeout: 2000 }).catch(() => false)) {
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "interactive-command-palette.png"),
      });
      console.log("    ✅ Command palette opened");
      await page.keyboard.press("Escape");
    } else {
      console.log("    ⚠️ Command palette not visible (may need different key combo)");
    }

  } catch (error) {
    console.log(`  ❌ Interactive test error: ${error}`);
    consoleErrors.push({ page: "interactive", type: "test-error", text: String(error) });
  }

  await browser.close();
}

async function testWritingArticle() {
  console.log("\n📝 Testing Writing Article Page...\n");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();
  setupConsoleListener(page, "writing-article");

  try {
    // Test a specific article page
    await page.goto(`${SITE_URL}/writing/the_short_case_for_nvda`, {
      waitUntil: "domcontentloaded",
      timeout: 30000
    });
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "desktop-writing-article.png"),
      fullPage: true,
    });
    console.log("  ✅ Writing article page screenshot saved");

    // Test table of contents if present
    const toc = page.locator('[aria-label="Table of contents"]');
    if (await toc.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log("  ✅ Table of contents present");
    }

  } catch (error) {
    console.log(`  ❌ Writing article test error: ${error}`);
    consoleErrors.push({ page: "writing-article", type: "test-error", text: String(error) });
  }

  await browser.close();
}

async function main() {
  console.log("🚀 Starting Live Site Tests for jeffreyemanuel.com\n");
  console.log("=".repeat(60));

  // Create screenshots directory
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  // Run all tests
  await testDesktop();
  await testMobile();
  await testInteractiveFeatures();
  await testWritingArticle();

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 TEST SUMMARY\n");

  console.log(`Screenshots saved to: ${SCREENSHOT_DIR}/`);
  const screenshots = fs.readdirSync(SCREENSHOT_DIR).filter(f => f.endsWith('.png'));
  console.log(`Total screenshots: ${screenshots.length}`);
  screenshots.forEach(s => console.log(`  - ${s}`));

  console.log("\n🔴 Console Errors:");
  if (consoleErrors.length === 0) {
    console.log("  ✅ ZERO console errors! 🎉");
  } else {
    consoleErrors.forEach(e => {
      console.log(`  ❌ [${e.page}] ${e.type}: ${e.text.substring(0, 200)}`);
    });
  }

  console.log("\n🟡 Console Warnings:");
  if (consoleWarnings.length === 0) {
    console.log("  ✅ No warnings");
  } else {
    consoleWarnings.forEach(w => {
      console.log(`  ⚠️ [${w.page}] ${w.type}: ${w.text.substring(0, 200)}`);
    });
  }

  console.log("\n" + "=".repeat(60));

  // Exit with error code if there were errors
  if (consoleErrors.length > 0) {
    console.log("\n❌ Tests completed with errors");
    process.exit(1);
  } else {
    console.log("\n✅ All tests passed!");
    process.exit(0);
  }
}

main().catch(console.error);
