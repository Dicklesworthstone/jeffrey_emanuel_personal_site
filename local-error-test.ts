import { chromium } from "playwright";

async function testLocalErrors() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const errors: string[] = [];

  page.on("pageerror", (err) => {
    errors.push(err.message);
  });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(`Console error: ${msg.text()}`);
    }
  });

  console.log("Testing LOCAL production build...");
  await page.goto("http://localhost:3000", { waitUntil: "load", timeout: 30000 });
  await page.waitForTimeout(3000);

  console.log(`Local errors: ${errors.length}`);
  errors.forEach((e) => console.log(`  - ${e}`));

  console.log("\nTesting LIVE Vercel site...");
  const liveErrors: string[] = [];

  const page2 = await context.newPage();
  page2.on("pageerror", (err) => {
    liveErrors.push(err.message);
  });
  page2.on("console", (msg) => {
    if (msg.type() === "error") {
      liveErrors.push(`Console error: ${msg.text()}`);
    }
  });

  await page2.goto("https://jeffreyemanuel.com", { waitUntil: "load", timeout: 30000 });
  await page2.waitForTimeout(3000);

  console.log(`Live errors: ${liveErrors.length}`);
  liveErrors.forEach((e) => console.log(`  - ${e}`));

  await browser.close();

  if (errors.length === 0 && liveErrors.length > 0) {
    console.log("\n⚠️ Error only happens on Vercel - likely Vercel-injected script issue");
  } else if (errors.length > 0 && liveErrors.length > 0) {
    console.log("\n⚠️ Error happens both locally and on Vercel - code issue");
  } else {
    console.log("\n✅ No JS errors detected");
  }
}

testLocalErrors().catch(console.error);
