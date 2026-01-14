import { test, expect } from "@playwright/test";

const PRODUCTION_URL = process.env.PRODUCTION_URL || "https://jeffreyemanuel.com";

// Pages to check for console errors (matches navItems in lib/content.ts)
const PAGES_TO_CHECK = [
  { path: "/", name: "Homepage" },
  { path: "/about", name: "About" },
  { path: "/consulting", name: "Consulting" },
  { path: "/projects", name: "Projects" },
  { path: "/tldr", name: "TL;DR Flywheel" },
  { path: "/writing", name: "Writing" },
  { path: "/media", name: "Media" },
  { path: "/contact", name: "Contact" },
];

// Patterns to ignore in error checking (expected in headless/CI environments)
const IGNORED_ERROR_PATTERNS = [
  "Failed to load resource", // Network errors from external resources
  "net::ERR_", // Network errors
  "favicon.ico", // Missing favicon variants
  "THREE.WebGLRenderer", // WebGL not available in CI
  "WebGL", // WebGL context errors in headless browsers
  "WEBGL", // WebGL context errors (case variation)
  "webgl", // WebGL context errors (lowercase)
  "GPU", // GPU-related errors in headless mode
];

test.describe("Production Health Check", () => {
  test("production site has zero console errors", async ({ page }) => {
    const errors: { page: string; error: string }[] = [];

    // Helper to check if error should be ignored
    const shouldIgnoreError = (text: string): boolean => {
      return IGNORED_ERROR_PATTERNS.some((pattern) =>
        text.toLowerCase().includes(pattern.toLowerCase())
      );
    };

    // Capture page errors (unhandled exceptions)
    page.on("pageerror", (error) => {
      if (!shouldIgnoreError(error.message)) {
        errors.push({
          page: page.url(),
          error: `PageError: ${error.message}`,
        });
      }
    });

    // Capture console errors
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();

        if (!shouldIgnoreError(text)) {
          errors.push({
            page: page.url(),
            error: `ConsoleError: ${text}`,
          });
        }
      }
    });

    // Check each page
    for (const { path, name } of PAGES_TO_CHECK) {
      const url = `${PRODUCTION_URL}${path}`;
      console.log(`Checking ${name} (${url})...`);

      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      // Wait for any async scripts to initialize
      await page.waitForTimeout(2000);
    }

    // Report all errors found
    if (errors.length > 0) {
      console.error("\n=== CONSOLE ERRORS FOUND ===");
      errors.forEach((err, i) => {
        console.error(`\n${i + 1}. Page: ${err.page}`);
        console.error(`   ${err.error}`);
      });
    }

    // Fail the test if any errors were found
    expect(
      errors,
      `Found ${errors.length} console error(s) on production site`
    ).toHaveLength(0);
  });

  test("production site loads within acceptable time", async ({ page }) => {
    const startTime = Date.now();

    await page.goto(PRODUCTION_URL, { waitUntil: "domcontentloaded" });

    const loadTime = Date.now() - startTime;
    console.log(`Homepage DOM loaded in ${loadTime}ms`);

    // Page should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });

  test("production site returns correct status codes", async ({ request }) => {
    for (const { path, name } of PAGES_TO_CHECK) {
      const url = `${PRODUCTION_URL}${path}`;
      const response = await request.get(url);

      console.log(`${name}: ${response.status()}`);
      expect(response.status(), `${name} should return 200`).toBe(200);
    }
  });
});
