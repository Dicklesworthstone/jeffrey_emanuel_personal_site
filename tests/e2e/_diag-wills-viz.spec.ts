import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const OUT_DIR = "/tmp/wills-audit";
fs.mkdirSync(OUT_DIR, { recursive: true });

const VIEWPORTS = [
  { name: "mobile-375", width: 375, height: 800 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1280", width: 1280, height: 900 },
  { name: "desktop-1920", width: 1920, height: 1080 },
];

type Target = { id: string; selector: string };

const SECTION_TARGETS: Target[] = [
  { id: "01-hero", selector: '[data-section="hero"]' },
  { id: "02-download", selector: '[data-section="download"]' },
  { id: "03-intro", selector: '[data-section="intro"]' },
  { id: "04-cost", selector: '[data-section="cost"]' },
  { id: "05-what-is-it", selector: '[data-section="what-is-it"]' },
  { id: "06-setup", selector: '[data-section="setup"]' },
  { id: "07-folder", selector: '[data-section="folder"]' },
  { id: "08-tips", selector: '[data-section="tips"]' },
  { id: "09-showcase", selector: '[data-section="showcase"]' },
  { id: "10-attorney", selector: '[data-section="attorney"]' },
  { id: "11-faq", selector: '[data-section="faq"]' },
  { id: "12-pattern", selector: '[data-section="pattern"]' },
];

const VIZ_TARGETS: Target[] = [
  { id: "viz-stack", selector: 'section[aria-label*="combine into a complete"]' },
  { id: "viz-install-flow", selector: 'section[aria-label^="Install flow"]' },
  { id: "viz-working-folder", selector: 'section[aria-label="Working folder visualization"]' },
  { id: "viz-tier-triage", selector: 'section[aria-label^="Wealth tier triage"]' },
  { id: "viz-anti-patterns", selector: 'section[aria-label^="Anti-pattern cards"]' },
  { id: "viz-deliverables-tree", selector: 'section[aria-label^="Deliverables tree"]' },
  { id: "viz-pricing", selector: 'section[aria-label^="Interactive pricing calculator"]' },
];

async function gotoArticle(page: Page, vp: { width: number; height: number }) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  await page.goto("/writing/wills-and-estate-planning", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 60_000 });
  // Give client hydration and lazy-loaded charts time to mount
  await page.waitForTimeout(1500);
}

type OverflowFinding = {
  path: string;
  tag: string;
  cls: string;
  text: string;
  reason: string;
  rect: { x: number; y: number; w: number; h: number };
};

async function collectOverflow(page: Page, rootSelector: string) {
  return page.evaluate(
    ({ rootSelector }) => {
      const root = document.querySelector(rootSelector);
      if (!root) return { found: false, rootRect: null, findings: [] as OverflowFinding[] };
      const rootRect = (root as HTMLElement).getBoundingClientRect();
      const findings: OverflowFinding[] = [];
      const describe = (el: Element): string => {
        const tag = el.tagName.toLowerCase();
        const cls = (el.getAttribute("class") || "").slice(0, 80);
        return `${tag}${cls ? "." + cls.split(/\s+/).slice(0, 2).join(".") : ""}`;
      };
      const pathOf = (el: Element): string => {
        const parts: string[] = [];
        let cur: Element | null = el;
        while (cur && cur !== root && parts.length < 5) {
          parts.unshift(describe(cur));
          cur = cur.parentElement;
        }
        return parts.join(" > ");
      };
      const all = (root as HTMLElement).querySelectorAll("*");
      all.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;
        const style = getComputedStyle(el);
        if (style.position === "fixed") return;
        const overflowsRight = r.right - rootRect.right > 2;
        const overflowsLeft = rootRect.left - r.left > 2;
        if (overflowsRight || overflowsLeft) {
          findings.push({
            path: pathOf(el),
            tag: el.tagName.toLowerCase(),
            cls: (el.getAttribute("class") || "").slice(0, 120),
            text: (el.textContent || "").slice(0, 60).replace(/\s+/g, " "),
            reason: [
              overflowsRight ? `right:+${Math.round(r.right - rootRect.right)}` : "",
              overflowsLeft ? `left:+${Math.round(rootRect.left - r.left)}` : "",
            ]
              .filter(Boolean)
              .join(","),
            rect: {
              x: Math.round(r.x - rootRect.x),
              y: Math.round(r.y - rootRect.y),
              w: Math.round(r.width),
              h: Math.round(r.height),
            },
          });
        }
      });
      return {
        found: true,
        rootRect: {
          w: Math.round(rootRect.width),
          h: Math.round(rootRect.height),
        },
        findings: findings.slice(0, 20),
      };
    },
    { rootSelector },
  );
}

test.describe("wills article — full audit", () => {
  test.use({ baseURL: "http://localhost:3000" });

  for (const vp of VIEWPORTS) {
    test(`audit @ ${vp.name}`, async ({ page }) => {
      test.setTimeout(180_000);

      const consoleMessages: { type: string; text: string }[] = [];
      page.on("console", (msg) => {
        const type = msg.type();
        if (type === "error" || type === "warning") {
          consoleMessages.push({ type, text: msg.text().slice(0, 300) });
        }
      });
      const pageErrors: string[] = [];
      page.on("pageerror", (err) => pageErrors.push(err.message.slice(0, 400)));

      await gotoArticle(page, vp);

      // Capture horizontal scroll overall on root html
      const docMetrics = await page.evaluate(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          scrollHeight: document.documentElement.scrollHeight,
          bodyScrollWidth: document.body.scrollWidth,
          hasHorizontalScroll:
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth + 1,
        };
      });

      const report: Record<string, unknown> = {
        viewport: vp,
        docMetrics,
        sections: [],
        vizes: [],
        consoleMessages,
        pageErrors,
      };

      // Screenshot each section
      for (const t of SECTION_TARGETS) {
        const locator = page.locator(t.selector).first();
        try {
          await locator.waitFor({ state: "attached", timeout: 20_000 });
          await locator.scrollIntoViewIfNeeded();
          await page.waitForTimeout(350);
          const file = path.join(OUT_DIR, `${vp.name}__${t.id}.png`);
          await locator.screenshot({ path: file });
          const overflow = await collectOverflow(page, t.selector);
          (report.sections as unknown[]).push({ target: t, file, overflow });
        } catch (err) {
          (report.sections as unknown[]).push({
            target: t,
            error: (err as Error).message.slice(0, 200),
          });
        }
      }

      // Screenshot each viz
      for (const t of VIZ_TARGETS) {
        const locator = page.locator(t.selector).first();
        try {
          await locator.waitFor({ state: "attached", timeout: 20_000 });
          await locator.scrollIntoViewIfNeeded();
          await page.waitForTimeout(350);
          const file = path.join(OUT_DIR, `${vp.name}__${t.id}.png`);
          await locator.screenshot({ path: file });
          const overflow = await collectOverflow(page, t.selector);
          (report.vizes as unknown[]).push({ target: t, file, overflow });
        } catch (err) {
          (report.vizes as unknown[]).push({
            target: t,
            error: (err as Error).message.slice(0, 200),
          });
        }
      }

      // Full-page screenshot (paginated)
      try {
        const fullFile = path.join(OUT_DIR, `${vp.name}__00-fullpage.png`);
        await page.screenshot({ path: fullFile, fullPage: true });
      } catch (err) {
        report.fullPageError = (err as Error).message.slice(0, 200);
      }

      fs.writeFileSync(
        path.join(OUT_DIR, `${vp.name}__report.json`),
        JSON.stringify(report, null, 2),
      );
      console.log(
        `DONE ${vp.name}: docScrollWidth=${docMetrics.scrollWidth} consoleErrors=${consoleMessages.filter((m) => m.type === "error").length} pageErrors=${pageErrors.length} hscroll=${docMetrics.hasHorizontalScroll}`,
      );

      expect(true).toBe(true);
    });
  }

  test(`interactive checks @ desktop-1280`, async ({ page }) => {
    test.setTimeout(120_000);
    await gotoArticle(page, { width: 1280, height: 900 });

    const findings: Record<string, unknown> = {};

    // 1. TOC anchor jumps work
    const tocLinks = page.locator('nav.sm-toc a');
    const count = await tocLinks.count();
    const tocResults: Array<{ href: string; ok: boolean; scrollY: number; targetVisible: boolean }> = [];
    for (let i = 0; i < count; i++) {
      const href = (await tocLinks.nth(i).getAttribute("href")) || "";
      const targetId = href.replace("#", "");
      await tocLinks.nth(i).click();
      await page.waitForTimeout(700);
      const data = await page.evaluate((id) => {
        const el = document.getElementById(id);
        const rect = el?.getBoundingClientRect();
        return {
          scrollY: window.scrollY,
          targetVisible: rect ? rect.top >= -50 && rect.top < window.innerHeight : false,
        };
      }, targetId);
      tocResults.push({
        href,
        ok: data.targetVisible,
        scrollY: data.scrollY,
        targetVisible: data.targetVisible,
      });
    }
    findings.tocResults = tocResults;

    // 2. First FAQ toggles open/close
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    const firstFaq = page.locator('#faq details').first();
    await firstFaq.scrollIntoViewIfNeeded();
    const wasOpen = await firstFaq.evaluate((el) => (el as HTMLDetailsElement).open);
    await firstFaq.locator("summary").click();
    await page.waitForTimeout(200);
    const isOpenAfter = await firstFaq.evaluate((el) => (el as HTMLDetailsElement).open);
    findings.faqToggle = { wasOpen, isOpenAfter, ok: wasOpen !== isOpenAfter };

    // 3. Image alt-text audit
    const imgAudit = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll("img"));
      return imgs.map((img) => ({
        src: (img.getAttribute("src") || "").slice(0, 120),
        alt: img.getAttribute("alt"),
        missing: img.getAttribute("alt") === null,
      }));
    });
    findings.imgAudit = imgAudit;

    // 4. Focus ring check on first interactive element in each section
    const focusRingCheck = await page.evaluate(() => {
      const sections = Array.from(
        document.querySelectorAll('[data-section]'),
      ) as HTMLElement[];
      return sections.map((s) => {
        const firstFocusable = s.querySelector(
          'a, button, [tabindex], input, details > summary',
        ) as HTMLElement | null;
        if (!firstFocusable) return { section: s.dataset.section, firstFocusable: null };
        firstFocusable.focus();
        const active = document.activeElement as HTMLElement | null;
        const style = active ? getComputedStyle(active) : null;
        return {
          section: s.dataset.section,
          firstFocusable: firstFocusable.tagName.toLowerCase(),
          outlineWidth: style?.outlineWidth,
          outlineStyle: style?.outlineStyle,
          boxShadow: style?.boxShadow?.slice(0, 80),
        };
      });
    });
    findings.focusRingCheck = focusRingCheck;

    fs.writeFileSync(
      path.join(OUT_DIR, `interactive-report.json`),
      JSON.stringify(findings, null, 2),
    );

    expect(true).toBe(true);
  });
});
