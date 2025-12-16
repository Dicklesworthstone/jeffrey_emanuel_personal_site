import { chromium, type ConsoleMessage } from "playwright";

const SITE_URL = "https://jeffreyemanuel.com";

async function debugError() {
  console.log("🔍 Debugging JS Error...\n");

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  // Capture all console messages with full details
  page.on("console", async (msg: ConsoleMessage) => {
    const type = msg.type();
    const text = msg.text();
    const location = msg.location();

    if (type === "error") {
      console.log(`\n🔴 Console Error:`);
      console.log(`   Text: ${text}`);
      console.log(`   URL: ${location.url}`);
      console.log(`   Line: ${location.lineNumber}:${location.columnNumber}`);

      // Try to get more context
      try {
        const args = msg.args();
        for (let i = 0; i < args.length; i++) {
          const arg = await args[i].jsonValue().catch(() => 'Unable to serialize');
          console.log(`   Arg ${i}: ${JSON.stringify(arg)}`);
        }
      } catch (e) {
        console.log(`   (Could not get args: ${e})`);
      }
    }
  });

  page.on("pageerror", (error: Error) => {
    console.log(`\n🔴 Page Error:`);
    console.log(`   Message: ${error.message}`);
    console.log(`   Stack: ${error.stack}`);
  });

  // Also intercept network requests to see if there's a problematic script
  page.on("requestfailed", (request) => {
    console.log(`\n🟠 Request Failed: ${request.url()}`);
    console.log(`   Failure: ${request.failure()?.errorText}`);
  });

  try {
    console.log("Navigating to home page...");
    await page.goto(SITE_URL, {
      waitUntil: "domcontentloaded",
      timeout: 30000
    });

    console.log("Waiting for full page load...");
    await page.waitForTimeout(5000);

    console.log("\n✅ Page loaded. Checking for errors above.");

  } catch (error) {
    console.log(`\n❌ Navigation Error: ${error}`);
  }

  await browser.close();
}

debugError().catch(console.error);
