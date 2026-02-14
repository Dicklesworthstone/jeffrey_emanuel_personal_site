import { defineConfig, devices } from "@playwright/test";

const SKIP_WEBKIT = process.env.SKIP_WEBKIT === "true" || process.env.CI !== "true";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    ...(!SKIP_WEBKIT
      ? [{
          name: "Mobile Safari",
          use: { ...devices["iPhone 12"] },
        }]
      : []),
  ],
  webServer: {
    // Build once and serve the production artifact to get realistic performance measurements.
    command: "bun run build && bun run start --hostname 127.0.0.1 --port 3000",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 180000,
  },
});
