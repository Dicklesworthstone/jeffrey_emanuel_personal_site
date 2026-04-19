import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ARTICLE_URL = "/writing/wills-and-estate-planning";
const PRIMER_URL = "/wills-and-estate-planning-primer.md";
const SECTION_ANCHORS = [
  "cost",
  "what-is-it",
  "setup",
  "folder",
  "tips",
  "showcase",
  "attorney",
  "faq",
  "pattern",
];

const VIZ_IDS = [
  "tier-triage",
  "deliverables-tree",
  "anti-pattern-cards",
  "pricing-comparison",
  "install-flow",
  "working-folder",
];
const VIZ_LOAD_MARKERS: Record<(typeof VIZ_IDS)[number], RegExp> = {
  "tier-triage": /Five wealth tiers, with complexity layered on top/i,
  "deliverables-tree":
    /Forty-five artifacts, organized like a real project directory/i,
  "anti-pattern-cards": /The patterns the skill is designed to catch/i,
  "pricing-comparison": /Pricing Reality Check/i,
  "install-flow": /./,
  "working-folder": /./,
};

const KNOWN_A11Y_RULES = ["color-contrast"];
const IGNORED_BROWSER_ERRORS = [
  "favicon",
  "Download the React DevTools",
  "baseline-browser-mapping",
];

function logStep(scenario: string, step: string, outcome = "ok") {
  console.log(JSON.stringify({ scenario, step, outcome }));
}

function captureRuntimeErrors(page: Page) {
  const errors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(`console.error: ${msg.text()}`);
    }
  });

  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`);
  });

  return {
    errors,
    assertClean() {
      const filtered = errors.filter(
        (error) => !IGNORED_BROWSER_ERRORS.some((ignored) => error.includes(ignored)),
      );
      expect(filtered).toEqual([]);
    },
  };
}

async function visitArticle(page: Page, scenario: string) {
  logStep(scenario, "goto article");
  await page.goto(ARTICLE_URL, { timeout: 60_000 });
  await page.waitForLoadState("networkidle");
}

async function expectInViewport(page: Page, selector: string) {
  await expect(async () => {
    const visible = await page.locator(selector).first().evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight;
    });
    expect(visible).toBe(true);
  }).toPass({ timeout: 3000 });
}

async function expectVisualizationLoaded(page: Page, vizId: (typeof VIZ_IDS)[number]) {
  const viz = page.locator(`[data-viz="${vizId}"]`);
  await viz.scrollIntoViewIfNeeded();
  await expect(viz).toBeVisible({ timeout: 15_000 });
  await expect(viz).not.toContainText("Visualization failed to load");
  await expect(viz).toContainText(VIZ_LOAD_MARKERS[vizId], { timeout: 15_000 });
}

test.describe("Wills & Estate Planning Article", () => {
  // Running this route fully in parallel against `bun dev` causes compilation
  // thrash and flaky `page.goto()` timeouts on local workers.
  test.describe.configure({ mode: "serial" });
  test.setTimeout(60_000);

  test("renders the article shell, TOC, draft noindex, and primer download", async ({ page }) => {
    const scenario = "article-shell";
    const runtime = captureRuntimeErrors(page);

    await visitArticle(page, scenario);

    logStep(scenario, "assert h1");
    await expect(
      page.getByRole("heading", { level: 1, name: /wills & estate planning/i }),
    ).toBeVisible();

    logStep(scenario, "assert scroll progress");
    await expect(page.locator(".sm-progress-bar")).toBeAttached();

    logStep(scenario, "assert draft noindex");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/i,
    );

    logStep(scenario, "assert section anchors");
    for (const anchor of SECTION_ANCHORS) {
      await expect(page.locator(`#${anchor}`)).toBeAttached();
    }

    logStep(scenario, "assert primer response");
    const primerResponse = await page.request.get(PRIMER_URL);
    expect(primerResponse.ok()).toBe(true);
    expect(primerResponse.headers()["content-type"]).toMatch(
      /text\/markdown|text\/plain|application\/octet-stream/i,
    );
    expect((await primerResponse.text()).trim().length).toBeGreaterThan(100);

    logStep(scenario, "assert primer download event");
    const downloadLink = page.locator(`a[href="${PRIMER_URL}"]`).first();
    await expect(downloadLink).toBeVisible();
    const download = await Promise.all([
      page.waitForEvent("download"),
      downloadLink.click(),
    ]).then(([event]) => event);
    expect(download.suggestedFilename()).toBe("WILLS_AND_ESTATE_PLANNING_PRIMER.md");

    runtime.assertClean();
  });

  test("TOC links update the hash and bring sections into view", async ({ page }) => {
    const scenario = "toc-links";
    const runtime = captureRuntimeErrors(page);

    await visitArticle(page, scenario);

    for (const anchor of SECTION_ANCHORS) {
      logStep(scenario, `click #${anchor}`);
      await page.locator(`.sm-toc a[href="#${anchor}"]`).click();
      await expect(page).toHaveURL(new RegExp(`#${anchor}$`));
      await expectInViewport(page, `#${anchor}`);
    }

    runtime.assertClean();
  });

  test("setup section lists the four numbered prerequisites", async ({ page }) => {
    const scenario = "setup-steps";
    const runtime = captureRuntimeErrors(page);

    await visitArticle(page, scenario);
    const setupSection = page.locator('section[data-section="setup"]').first();
    await setupSection.scrollIntoViewIfNeeded();
    await expect(setupSection).toBeVisible();

    logStep(scenario, "assert four numbered steps");
    await expect(setupSection.getByText(/1\. A frontier-model subscription/)).toBeVisible();
    await expect(setupSection.getByText(/2\. The desktop app/)).toBeVisible();
    await expect(setupSection.getByText(/3\. A jeffreys-skills\.md account/)).toBeVisible();
    await expect(setupSection.getByText(/4\. Install the skill/)).toBeVisible();

    logStep(scenario, "assert install-flow viz mounts in setup");
    const installFlowViz = setupSection.locator('[data-viz="install-flow"]');
    await expect(installFlowViz).toBeVisible({ timeout: 15_000 });

    runtime.assertClean();
  });

  test("all visualizations mount without runtime errors", async ({ page }) => {
    const scenario = "visualizations";
    const runtime = captureRuntimeErrors(page);

    await visitArticle(page, scenario);

    for (const vizId of VIZ_IDS) {
      logStep(scenario, `assert ${vizId}`);
      await expectVisualizationLoaded(page, vizId);
    }

    runtime.assertClean();
  });

  test("deliverables tree supports keyboard navigation and links back to the catalog", async ({ page }) => {
    const scenario = "deliverables-tree";
    const runtime = captureRuntimeErrors(page);

    await visitArticle(page, scenario);

    const viz = page.locator('[data-viz="deliverables-tree"]');
    await viz.scrollIntoViewIfNeeded();

    const analysesFolder = viz.getByRole("treeitem", { name: /analyses\//i }).first();
    await analysesFolder.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(viz.getByRole("treeitem", { name: /current-document-audit\.md/i })).toHaveCount(0);

    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");

    const firstAnalysisLeaf = viz.getByRole("treeitem", { name: /current-document-audit\.md/i });
    await expect(firstAnalysisLeaf).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(viz.getByRole("heading", { level: 4, name: /current document audit/i })).toBeVisible();
    await expect(viz.getByRole("link", { name: /view in skill catalog/i })).toHaveAttribute(
      "href",
      /jeffreys-skills\.md\/skills\/wills-and-estate-planning-skill/i,
    );

    runtime.assertClean();
  });

  test("anti-pattern cards flip on hover and keyboard", async ({ page }) => {
    const scenario = "anti-pattern-cards";
    const runtime = captureRuntimeErrors(page);

    await visitArticle(page, scenario);

    const viz = page.locator('[data-viz="anti-pattern-cards"]');
    await viz.scrollIntoViewIfNeeded();

    const firstCard = viz.getByRole("button", {
      name: /anti-pattern card: the ex-spouse still on the 401\(k\)/i,
    });
    await firstCard.scrollIntoViewIfNeeded();
    await expect(firstCard).toBeVisible();
    await firstCard.hover();
    const firstCardBack = viz.getByText(
      /ERISA retirement plans follow the beneficiary designation on file/i,
    );
    await expect(firstCardBack).toBeVisible();

    await firstCard.click();

    await page.mouse.move(0, 0);
    await expect(firstCardBack).toBeVisible();

    const secondCard = viz.getByRole("button", {
      name: /anti-pattern card: the revocable trust that owns nothing/i,
    });
    await secondCard.scrollIntoViewIfNeeded();
    await expect(secondCard).toBeVisible();
    await secondCard.focus();
    await page.keyboard.press("Space");
    await expect(
      viz.getByText(/Signing a revocable trust does not fund it/i),
    ).toBeVisible();

    runtime.assertClean();
  });

  test("pricing calculator responds to slider and chip interactions", async ({ page }) => {
    const scenario = "pricing-calc";
    const runtime = captureRuntimeErrors(page);

    await page.addInitScript(() => {
      const pricingWindow = window as Window & {
        __pricingCalcEvents?: Array<{ net_worth_bucket: string; num_chips: number }>;
      };
      pricingWindow.__pricingCalcEvents = [];

      const originalInfo = console.info.bind(console);
      console.info = (...args) => {
        if (args[0] === "[pricing_calc_changed]" && args[1] && typeof args[1] === "object") {
          pricingWindow.__pricingCalcEvents?.push(
            args[1] as { net_worth_bucket: string; num_chips: number },
          );
        }
        originalInfo(...args);
      };
    });

    await visitArticle(page, scenario);

    const viz = page.locator('[data-viz="pricing-comparison"]');
    await expectVisualizationLoaded(page, "pricing-comparison");

    logStep(scenario, "assert default attorney estimate");
    await expect(viz.getByText("$3,000")).toBeVisible();
    const slider = viz.getByRole("slider");
    await expect(slider).toHaveAttribute("aria-valuetext", "$1,000,000");

    logStep(scenario, "toggle complexity chip");
    const blendedChip = viz.getByRole("button", { name: /blended family/i });
    await blendedChip.click();
    await expect(blendedChip).toHaveAttribute("aria-pressed", "true");

    logStep(scenario, "assert estimate increases with chip");
    await expect(viz.getByText("$5,000")).toBeVisible();
    await expect.poll(async () => {
      return page.evaluate(() => {
        const pricingWindow = window as Window & {
          __pricingCalcEvents?: Array<{ net_worth_bucket: string; num_chips: number }>;
        };
        return pricingWindow.__pricingCalcEvents?.length ?? 0;
      });
    }).toBe(1);

    logStep(scenario, "move slider to high end");
    await slider.evaluate((input, value) => {
      const range = input as HTMLInputElement;
      const valueSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )?.set;
      valueSetter?.call(range, value);
      range.dispatchEvent(new Event("input", { bubbles: true }));
      range.dispatchEvent(new Event("change", { bubbles: true }));
    }, "80");
    await expect(slider).toHaveAttribute("aria-valuetext", "$25,100,000");
    await expect(viz.getByText("$6,250")).toBeVisible();
    await expect.poll(async () => {
      return page.evaluate(() => {
        const pricingWindow = window as Window & {
          __pricingCalcEvents?: Array<{ net_worth_bucket: string; num_chips: number }>;
        };
        return pricingWindow.__pricingCalcEvents?.length ?? 0;
      });
    }).toBe(2);

    logStep(scenario, "assert savings line visible");
    await expect(viz.getByText(/projected savings/i)).toBeVisible();
    const pricingEvents = await page.evaluate(() => {
      const pricingWindow = window as Window & {
        __pricingCalcEvents?: Array<{ net_worth_bucket: string; num_chips: number }>;
      };
      return pricingWindow.__pricingCalcEvents ?? [];
    });
    expect(pricingEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ net_worth_bucket: "1m-3m", num_chips: 1 }),
        expect.objectContaining({ net_worth_bucket: "10m-30m", num_chips: 1 }),
      ]),
    );

    runtime.assertClean();
  });

  test("passes section-level WCAG 2.1 AA accessibility scans", async ({ page }) => {
    const scenario = "a11y";

    await visitArticle(page, scenario);

    for (const anchor of SECTION_ANCHORS) {
      logStep(scenario, `axe #${anchor}`);
      await page.locator(`#${anchor}`).scrollIntoViewIfNeeded();
      const results = await new AxeBuilder({ page })
        .include(`#${anchor}`)
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .disableRules(KNOWN_A11Y_RULES)
        .analyze();

      expect(results.violations).toEqual([]);
    }
  });

  test.describe("Mobile viewport", () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test("renders without horizontal overflow", async ({ page }) => {
      const scenario = "mobile";
      const runtime = captureRuntimeErrors(page);

      await visitArticle(page, scenario);

      await expect(
        page.getByRole("heading", { level: 1, name: /wills & estate planning/i }),
      ).toBeVisible();

      const overflow = await page.evaluate(() => {
        const width = Math.max(
          document.body.scrollWidth,
          document.documentElement.scrollWidth,
        );
        return width - window.innerWidth;
      });
      expect(overflow).toBeLessThanOrEqual(1);

      runtime.assertClean();
    });
  });

  test.describe("Reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("renders visualizations statically without errors", async ({ page }) => {
      const scenario = "reduced-motion";
      const runtime = captureRuntimeErrors(page);

      await visitArticle(page, scenario);

      for (const vizId of VIZ_IDS) {
        logStep(scenario, `assert ${vizId}`);
        await expectVisualizationLoaded(page, vizId);
      }

      runtime.assertClean();
    });
  });
});
