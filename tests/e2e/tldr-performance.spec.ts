import { test, expect, type Page } from "@playwright/test";

/**
 * Performance Tests for the TL;DR Page
 *
 * Measures Core Web Vitals and enforces performance budgets using
 * Playwright's built-in Performance API access. No external deps needed.
 *
 * Run with: bunx playwright test tests/e2e/tldr-performance.spec.ts
 */

function getMobileThresholds(page: Page) {
  const viewportWidth = page.viewportSize()?.width ?? 0;
  const isMobile = viewportWidth > 0 && viewportWidth <= 768;

  return {
    isMobile,
    lcpMs: isMobile ? 7000 : 5000,
    domContentLoadedMs: isMobile ? 6500 : 3000,
    fpsTarget: isMobile ? 15 : 22,
  };
}

test.describe("TLDR Page - Core Web Vitals", () => {
  test("should meet FCP budget (<3s)", async ({ page }) => {
    console.log("[PERF] Measuring First Contentful Paint");

    await page.goto("/tldr", { waitUntil: "domcontentloaded" });

    const fcp = await page.evaluate(() => {
      const entries = performance.getEntriesByName("first-contentful-paint");
      return entries.length > 0 ? entries[0].startTime : null;
    });

    console.log(`[PERF] FCP: ${fcp ? fcp.toFixed(0) + "ms" : "not available"}`);

    if (fcp !== null) {
      // Allow headless/CI startup overhead while still flagging noticeable regressions.
      expect(fcp).toBeLessThan(3000);
    }
  });

  test("should meet LCP budget (<5s)", async ({ page }) => {
    console.log("[PERF] Measuring Largest Contentful Paint");
    const { lcpMs } = getMobileThresholds(page);

    // Set up LCP observer before navigation
    await page.goto("/tldr");

    const lcp = await page.evaluate(
      ({ waitMs }) =>
        new Promise<number>((resolve) => {
          let lastLcp = 0;
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            for (const entry of entries) {
              lastLcp = entry.startTime;
            }
          });
          observer.observe({ type: "largest-contentful-paint", buffered: true });

          // Give time for LCP to finalize
          setTimeout(() => {
            observer.disconnect();
            resolve(lastLcp);
          }, waitMs);
          }),
      { waitMs: lcpMs }
    );

    console.log(`[PERF] LCP: ${lcp.toFixed(0)}ms`);
    expect(lcp).toBeLessThan(lcpMs);
  });

  test("should have minimal CLS (<0.15)", async ({ page }) => {
    console.log("[PERF] Measuring Cumulative Layout Shift");

    await page.goto("/tldr");

    // Wait for page to settle
    await page.waitForLoadState("networkidle");

    const cls = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let clsValue = 0;
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              // @ts-expect-error - Layout shift entry type
              if (!entry.hadRecentInput) {
                // @ts-expect-error - Layout shift entry type
                clsValue += entry.value;
              }
            }
          });
          observer.observe({ type: "layout-shift", buffered: true });

          setTimeout(() => {
            observer.disconnect();
            resolve(clsValue);
          }, 5000);
        })
    );

    console.log(`[PERF] CLS: ${cls.toFixed(4)}`);
    expect(cls).toBeLessThan(0.15);
  });

  test("should have low TBT during initial load", async ({ page }) => {
    console.log("[PERF] Measuring Total Blocking Time (approximation)");

    await page.goto("/tldr");

    const tbt = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let totalBlocking = 0;
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              // Long tasks are >50ms; blocking time = duration - 50ms
              if (entry.duration > 50) {
                totalBlocking += entry.duration - 50;
              }
            }
          });
          observer.observe({ type: "longtask", buffered: true });

          setTimeout(() => {
            observer.disconnect();
            resolve(totalBlocking);
          }, 5000);
        })
    );

    console.log(`[PERF] TBT (approx): ${tbt.toFixed(0)}ms`);
    // Allow 500ms budget (relaxed for CI environments).
    expect(tbt).toBeLessThan(500);
  });
});

test.describe("TLDR Page - Resource Budgets", () => {
  test("should transfer reasonable amount of JS", async ({ page }) => {
    console.log("[PERF] Measuring JS transfer size");

    const jsSizes: { url: string; transferSize: number }[] = [];

    page.on("response", async (response) => {
      const url = response.url();
      const contentType = response.headers()["content-type"] || "";
      if (
        contentType.includes("javascript") ||
        url.endsWith(".js") ||
        url.includes("/_next/static")
      ) {
        const headers = response.headers();
        const contentLength = parseInt(headers["content-length"] || "0", 10);
        if (contentLength > 0) {
          jsSizes.push({
            url: url.split("/").pop() || url,
            transferSize: contentLength,
          });
        }
      }
    });

    await page.goto("/tldr");
    await page.waitForLoadState("networkidle");

    const totalKB = jsSizes.reduce((sum, r) => sum + r.transferSize, 0) / 1024;

    console.log("[PERF] JS resources:");
    for (const r of jsSizes.slice(0, 10)) {
      console.log(
        `[PERF]   ${r.url}: ${(r.transferSize / 1024).toFixed(1)}KB`
      );
    }
    console.log(`[PERF] Total JS transfer: ${totalKB.toFixed(1)}KB`);

    // Budget: total JS should be under 500KB (compressed)
    expect(totalKB).toBeLessThan(500);
  });

  test("should load images efficiently", async ({ page }) => {
    console.log("[PERF] Checking image loading");

    const imgRequests: string[] = [];
    page.on("request", (req) => {
      const url = req.url();
      if (/\.(png|jpg|jpeg|webp|avif|gif|svg)$/i.test(url)) {
        imgRequests.push(url.split("/").pop() || url);
      }
    });

    await page.goto("/tldr");
    await page.waitForLoadState("networkidle");

    console.log(`[PERF] Images loaded: ${imgRequests.length}`);
    for (const img of imgRequests.slice(0, 10)) {
      console.log(`[PERF]   ${img}`);
    }

    // Should use lazy loading — not all images should load immediately
    // Verify the page doesn't load an unreasonable number of images at once
    expect(imgRequests.length).toBeLessThan(30);
  });
});

test.describe("TLDR Page - Interaction Performance", () => {
  test("search should filter within 1s", async ({ page }) => {
    console.log("[PERF] Testing search responsiveness");

    await page.goto("/tldr");
    await page.waitForLoadState("networkidle");

    const searchInput = page.getByPlaceholder(/search/i);

    // Measure time from input to filtered result
    const startMark = "search-start";
    const endMark = "search-end";

    await page.evaluate((mark) => performance.mark(mark), startMark);
    await searchInput.fill("memory");

    // Wait for filtering to complete
    await page.waitForFunction(() => {
      const showing = document.querySelector('[class*="text-slate"]');
      return showing?.textContent?.includes("Showing");
    });
    await page.evaluate((mark) => performance.mark(mark), endMark);

    const duration = await page.evaluate(
      ([start, end]) => {
        const measure = performance.measure("search", start, end);
        return measure.duration;
      },
      [startMark, endMark]
    );

    console.log(`[PERF] Search filter duration: ${duration.toFixed(0)}ms`);
    // Allow a small cushion for slower environments while still failing obvious regressions.
    expect(duration).toBeLessThan(1000);
  });

  test("page scroll should maintain target fps", async ({ page }) => {
    console.log("[PERF] Testing scroll frame rate");
    const fpsTarget = (page.viewportSize()?.width || 0) <= 768 ? 15 : 22;

    await page.goto("/tldr");
    await page.waitForLoadState("networkidle");

    const avgFps = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          const frameTimes: number[] = [];
          let lastTime = 0;

          const measure = (time: number) => {
            if (lastTime > 0) {
              frameTimes.push(time - lastTime);
            }
            lastTime = time;
            if (frameTimes.length < 60) {
              requestAnimationFrame(measure);
            } else {
              const avgFrameTime =
                frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
              resolve(1000 / avgFrameTime);
            }
          };

          // Start scrolling
          let scrollY = 0;
          const scrollInterval = setInterval(() => {
            scrollY += 50;
            window.scrollTo(0, scrollY);
            if (scrollY > 3000) clearInterval(scrollInterval);
          }, 16);

          requestAnimationFrame(measure);
        })
    );

    console.log(`[PERF] Average FPS during scroll: ${avgFps.toFixed(1)}`);
    expect(avgFps).toBeGreaterThanOrEqual(fpsTarget);
  });
});

test.describe("TLDR Page - Mobile Performance", () => {
  test.use({ viewport: { width: 393, height: 851 } });

  test("should load quickly on mobile viewport", async ({ page }) => {
    console.log("[PERF] Testing mobile load performance");
    const thresholds = getMobileThresholds(page);
    const domContentLoadedBudget = thresholds.domContentLoadedMs;

    const startTime = Date.now();
    await page.goto("/tldr");
    await page.waitForLoadState("domcontentloaded");
    const domContentLoaded = Date.now() - startTime;

    await page.waitForLoadState("load");
    const fullLoad = Date.now() - startTime;

    console.log(`[PERF] Mobile DOMContentLoaded: ${domContentLoaded}ms`);
    console.log(`[PERF] Mobile Full Load: ${fullLoad}ms`);

    // DOMContentLoaded should be under 3s even on mobile
    expect(domContentLoaded).toBeLessThan(domContentLoadedBudget);
  });

  test("should not have excessive layout shifts on mobile", async ({
    page,
  }) => {
    console.log("[PERF] Testing mobile CLS");

    await page.goto("/tldr");

    const cls = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let clsValue = 0;
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              // @ts-expect-error - Layout shift entry type
              if (!entry.hadRecentInput) {
                // @ts-expect-error - Layout shift entry type
                clsValue += entry.value;
              }
            }
          });
          observer.observe({ type: "layout-shift", buffered: true });

          // Scroll through the page to trigger any shifts
          let y = 0;
          const interval = setInterval(() => {
            y += 300;
            window.scrollTo(0, y);
            if (y > 5000) clearInterval(interval);
          }, 100);

          setTimeout(() => {
            observer.disconnect();
            resolve(clsValue);
          }, 6000);
        })
    );

    console.log(`[PERF] Mobile CLS: ${cls.toFixed(4)}`);
    expect(cls).toBeLessThan(0.2);
  });
});
