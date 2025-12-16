import { firefox } from "playwright";

const SITE_URL = "https://jeffreyemanuel.com";

async function testFirefox() {
  console.log("🦊 Testing with Firefox...\n");

  const browser = await firefox.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();
  let errorCount = 0;

  page.on("pageerror", (error: Error) => {
    errorCount++;
    console.log(`❌ Page Error: ${error.message}`);
    console.log(`   Stack: ${error.stack?.substring(0, 200)}`);
  });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      if (!text.includes("favicon") && !text.includes("DevTools")) {
        console.log(`❌ Console Error: ${text.substring(0, 200)}`);
      }
    }
  });

  try {
    console.log("Navigating to home page...");
    await page.goto(SITE_URL, {
      waitUntil: "domcontentloaded",
      timeout: 30000
    });

    console.log("Waiting for full load...");
    await page.waitForTimeout(5000);

    if (errorCount === 0) {
      console.log("\n✅ No JavaScript errors in Firefox!");
    } else {
      console.log(`\n❌ Found ${errorCount} error(s) in Firefox`);
    }

  } catch (error) {
    console.log(`Navigation Error: ${error}`);
  }

  await browser.close();
}

testFirefox().catch(console.error);
