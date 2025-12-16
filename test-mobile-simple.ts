import { chromium, devices, type ConsoleMessage } from "playwright";
import * as fs from "fs";
import * as path from "path";

const SITE_URL = "https://jeffreyemanuel.com";
const SCREENSHOT_DIR = "./screenshots";

const consoleErrors: { page: string; type: string; text: string }[] = [];

async function testMobile() {
  console.log("📱 Testing Mobile View...\n");

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const iPhone = devices["iPhone 14 Pro"];

  const pages = [
    { path: "/", name: "home" },
    { path: "/about", name: "about" },
    { path: "/projects", name: "projects" },
    { path: "/writing", name: "writing" },
    { path: "/consulting", name: "consulting" },
    { path: "/media", name: "media" },
    { path: "/contact", name: "contact" },
  ];

  for (const pageInfo of pages) {
    console.log(`  Testing ${pageInfo.name}...`);

    const context = await browser.newContext({
      ...iPhone,
      // Reduce timeout for service worker
      serviceWorkers: 'block',
    });

    const page = await context.newPage();

    page.on("console", (msg: ConsoleMessage) => {
      const type = msg.type();
      const text = msg.text();
      if (type === "error" && !text.includes("favicon") && !text.includes("DevTools")) {
        consoleErrors.push({ page: `mobile-${pageInfo.name}`, type, text });
      }
    });

    page.on("pageerror", (error: Error) => {
      consoleErrors.push({ page: `mobile-${pageInfo.name}`, type: "pageerror", text: error.message });
    });

    try {
      const url = `${SITE_URL}${pageInfo.path}`;
      console.log(`    Navigating to ${url}`);

      await page.goto(url, {
        waitUntil: "commit",
        timeout: 15000
      });

      console.log(`    Page loaded, waiting for content...`);
      await page.waitForTimeout(2000);

      console.log(`    Taking screenshot...`);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `mobile-${pageInfo.name}.png`),
        fullPage: true,
      });

      console.log(`    ✅ Done: mobile-${pageInfo.name}.png`);
    } catch (error) {
      console.log(`    ❌ Error: ${error}`);
      consoleErrors.push({ page: `mobile-${pageInfo.name}`, type: "navigation", text: String(error) });
    }

    await context.close();
  }

  await browser.close();

  console.log("\n📊 Summary:");
  console.log(`Console Errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    consoleErrors.forEach(e => console.log(`  ❌ [${e.page}] ${e.text.substring(0, 100)}`));
  }
}

testMobile().catch(console.error);
