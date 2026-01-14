import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for production health checks.
 * Unlike the main config, this does NOT start a local dev server
 * since we're testing against the live production URL.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  /* Only run production health tests */
  testMatch: "production-health.spec.ts",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Single worker for sequential page checks */
  workers: 1,
  /* Reporter to use */
  reporter: [["html"], ["list"]],
  /* Shared settings for all projects below */
  use: {
    /* No baseURL - tests use absolute production URLs */
    /* Collect trace when retrying the failed test */
    trace: "on-first-retry",
    /* Screenshot on failure */
    screenshot: "only-on-failure",
  },

  /* Only test on Chromium for production checks */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* No webServer - we're testing against the live production site */
});
