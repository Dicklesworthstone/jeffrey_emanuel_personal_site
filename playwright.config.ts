import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E test configuration
 * @see https://playwright.dev/docs/test-configuration
 */

// Check if WebKit dependencies are available
// WebKit requires system libraries that may not be installed
const SKIP_WEBKIT = process.env.SKIP_WEBKIT === "true" || process.env.CI !== "true";

export default defineConfig({
  testDir: "./tests/e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use */
  reporter: "html",
  /* Shared settings for all projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    /* Collect trace when retrying the failed test */
    trace: "on-first-retry",
    /* Screenshot on failure */
    screenshot: "only-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    // WebKit/Safari tests - skip if dependencies not installed
    // Install with: sudo npx playwright install-deps webkit
    ...(!SKIP_WEBKIT ? [{
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    }] : []),
    /* Test against mobile viewports */
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    // Mobile Safari - also requires WebKit
    ...(!SKIP_WEBKIT ? [{
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    }] : []),
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "bun dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
