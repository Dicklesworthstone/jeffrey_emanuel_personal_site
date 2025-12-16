import { chromium } from "playwright";

const SITE_URL = "https://jeffreyemanuel.com";

async function testPages() {
  console.log("🔍 Testing each page for JS errors...\n");

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const pages = [
    { path: "/", name: "home" },
    { path: "/about", name: "about" },
    { path: "/contact", name: "contact" },
    { path: "/media", name: "media" },
    { path: "/consulting", name: "consulting" },
    { path: "/projects", name: "projects" },
    { path: "/writing", name: "writing" },
    { path: "/writing/the_short_case_for_nvda", name: "article" },
  ];

  for (const pageInfo of pages) {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });

    const page = await context.newPage();
    let errorCount = 0;
    let errorDetails = "";

    page.on("pageerror", (error: Error) => {
      errorCount++;
      errorDetails = error.message.substring(0, 100);
    });

    try {
      await page.goto(`${SITE_URL}${pageInfo.path}`, {
        waitUntil: "domcontentloaded",
        timeout: 20000
      });
      await page.waitForTimeout(3000);

      if (errorCount === 0) {
        console.log(`✅ ${pageInfo.name}: No JS errors`);
      } else {
        console.log(`❌ ${pageInfo.name}: ${errorCount} error(s) - ${errorDetails}`);
      }
    } catch (e) {
      console.log(`⚠️ ${pageInfo.name}: Navigation error`);
    }

    await context.close();
  }

  await browser.close();
}

testPages().catch(console.error);
