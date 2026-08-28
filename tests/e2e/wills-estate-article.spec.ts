import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writingHighlights } from "../../lib/content";

const ARTICLE_URL = "/writing/wills-and-estate-planning";
// `noindex` is only emitted while the article is marked as a draft in lib/content.
const ARTICLE_IS_DRAFT =
  writingHighlights.find((item) => item.href === ARTICLE_URL)?.draft ?? false;
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
  "stack",
];
const VIZ_LOAD_MARKERS: Record<(typeof VIZ_IDS)[number], RegExp> = {
  "tier-triage": /Five wealth tiers, with complexity layered on top/i,
  "deliverables-tree":
    /Forty-five artifacts, organized like a real project directory/i,
  "anti-pattern-cards": /The patterns the skill is designed to catch/i,
  "pricing-comparison": /Pricing Reality Check/i,
  "install-flow": /What you need \(about twenty minutes of setup\)/i,
  "working-folder":
    /Put your real documents in one folder, point the desktop app at it/i,
  stack: /Agent \+ Skill Stack/i,
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


/**
 * Scroll with the mouse wheel (not `scrollIntoViewIfNeeded`) until the target's
 * top edge is inside the viewport. This is how a reader reaches a section, and
 * it is the path that used to leave the showcase section at `opacity: 0`.
 */
async function wheelScrollTo(page: Page, selector: string, step = 700) {
  const target = page.locator(selector).first();
  for (let i = 0; i < 200; i += 1) {
    const state = await target.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { top: rect.top, inner: window.innerHeight };
    });
    if (state.top < state.inner * 0.6) return;
    await page.mouse.wheel(0, Math.min(step, Math.max(120, state.top - state.inner * 0.4)));
    await page.waitForTimeout(40);
  }
  throw new Error(`wheelScrollTo: never reached ${selector}`);
}

async function expectRevealed(page: Page, selector: string) {
  await expect
    .poll(
      () =>
        page.locator(selector).first().evaluate((element) => {
          const opacity = window.getComputedStyle(element).opacity;
          let node: HTMLElement | null = element as HTMLElement;
          while (node) {
            if (window.getComputedStyle(node).opacity !== "1") return `${node.tagName.toLowerCase()}:${window.getComputedStyle(node).opacity}`;
            node = node.parentElement;
          }
          return opacity;
        }),
      { timeout: 5_000 },
    )
    .toBe("1");
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

    logStep(scenario, ARTICLE_IS_DRAFT ? "assert draft noindex" : "assert published (no noindex)");
    if (ARTICLE_IS_DRAFT) {
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        "content",
        /noindex/i,
      );
    } else {
      await expect(page.locator('meta[name="robots"][content*="noindex" i]')).toHaveCount(0);
    }

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

  test("showcase section and anti-pattern first row are revealed after wheel scrolling", async ({ page }) => {
    const scenario = "section-reveal-desktop";
    const runtime = captureRuntimeErrors(page);

    await visitArticle(page, scenario);

    logStep(scenario, "wheel-scroll to anti-pattern cards");
    await wheelScrollTo(page, '[data-viz="anti-pattern-cards"]');
    await expect(page.locator('[data-viz="anti-pattern-cards"]')).toContainText(
      VIZ_LOAD_MARKERS["anti-pattern-cards"],
      { timeout: 15_000 },
    );

    logStep(scenario, "assert showcase section revealed");
    await expectRevealed(page, "#showcase");
    await expectRevealed(page, '[data-viz="anti-pattern-cards"]');

    logStep(scenario, "assert first card row visible");
    const firstCard = page.getByRole("button", {
      name: /anti-pattern card: the ex-spouse still on the IRA/i,
    });
    await expect(firstCard).toBeVisible();
    await expectRevealed(page, 'button[aria-label*="the ex-spouse still on the IRA"]');

    runtime.assertClean();
  });

  test("TOC jump lands below the fixed header and does not fight a user scroll", async ({ page }) => {
    const scenario = "toc-jump-no-hijack";
    const runtime = captureRuntimeErrors(page);

    await visitArticle(page, scenario);
    await page.locator('.sm-toc a[href="#faq"]').click();
    await expect(page).toHaveURL(/#faq$/);

    logStep(scenario, "assert header offset");
    const offset = await page.locator("#faq").evaluate((element) => {
      const header = document.querySelector("header");
      const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
      return element.getBoundingClientRect().top - headerBottom;
    });
    expect(offset).toBeGreaterThanOrEqual(4);
    expect(offset).toBeLessThanOrEqual(64);

    logStep(scenario, "scroll away immediately and assert the jump does not snap back");
    await page.mouse.wheel(0, 1400);
    await page.waitForTimeout(150);
    const afterUserScroll = await page.evaluate(() => window.scrollY);
    await page.waitForTimeout(900);
    const settled = await page.evaluate(() => window.scrollY);
    expect(Math.abs(settled - afterUserScroll)).toBeLessThanOrEqual(2);

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
      name: /anti-pattern card: the ex-spouse still on the IRA/i,
    });
    await firstCard.scrollIntoViewIfNeeded();
    await expect(firstCard).toBeVisible();
    await firstCard.hover();
    const firstCardBack = viz.getByText(
      /Retirement accounts pay whoever is on the beneficiary form/i,
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
    await expect(viz.getByText("$3,000").first()).toBeVisible();
    const slider = viz.getByRole("slider");
    await expect(slider).toHaveAttribute("aria-valuetext", "$1,000,000");

    logStep(scenario, "toggle complexity chip");
    const blendedChip = viz.getByRole("button", { name: /blended family/i });
    await blendedChip.click();
    await expect(blendedChip).toHaveAttribute("aria-pressed", "true");

    logStep(scenario, "assert estimate increases with chip");
    await expect(viz.getByText("$7,000").first()).toBeVisible();
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
    }, "240");
    await expect(slider).toHaveAttribute("aria-valuetext", "$25,100,000");
    await expect(viz.getByText("$8,250").first()).toBeVisible();
    await expect.poll(async () => {
      return page.evaluate(() => {
        const pricingWindow = window as Window & {
          __pricingCalcEvents?: Array<{ net_worth_bucket: string; num_chips: number }>;
        };
        return pricingWindow.__pricingCalcEvents?.length ?? 0;
      });
    }).toBe(2);

    logStep(scenario, "assert savings line visible");
    await expect(viz.getByText(/projected savings vs attorney consult/i)).toBeVisible();
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

    test("reveals the showcase section and anti-pattern cards after wheel scrolling", async ({ page }) => {
      const scenario = "mobile-reveal";
      const runtime = captureRuntimeErrors(page);

      await visitArticle(page, scenario);

      logStep(scenario, "wheel-scroll to anti-pattern cards");
      await wheelScrollTo(page, '[data-viz="anti-pattern-cards"]', 600);
      await expect(page.locator('[data-viz="anti-pattern-cards"]')).toContainText(
        VIZ_LOAD_MARKERS["anti-pattern-cards"],
        { timeout: 15_000 },
      );

      logStep(scenario, "assert computed opacity is 1");
      await expectRevealed(page, "#showcase");
      await expectRevealed(page, '[data-viz="anti-pattern-cards"]');
      await expect(
        page.getByRole("button", { name: /anti-pattern card: the ex-spouse still on the IRA/i }),
      ).toBeVisible();

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
