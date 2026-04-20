import { test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const OUT_DIR = "/tmp/wills-viz-screenshots";
fs.mkdirSync(OUT_DIR, { recursive: true });

const VIEWPORTS = [
  { name: "mobile-375", width: 375, height: 800 },
  { name: "tablet-768", width: 768, height: 900 },
  { name: "desktop-1024", width: 1024, height: 900 },
  { name: "desktop-1280", width: 1280, height: 900 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "desktop-1920", width: 1920, height: 1080 },
];

const TARGETS = [
  {
    id: "working-folder",
    label: "Working folder (Using the skill)",
    selector: 'section[aria-label="Working folder visualization"]',
  },
  {
    id: "tier-triage",
    label: "Tier Triage",
    selector: 'section[aria-label^="Wealth tier triage"]',
  },
];

test.describe("wills viz diagnostic", () => {
  test.use({ baseURL: "http://localhost:3000" });

  for (const vp of VIEWPORTS) {
    for (const target of TARGETS) {
      test(`${target.id} @ ${vp.name}`, async ({ page }) => {
        test.setTimeout(90_000);
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto("/writing/wills-and-estate-planning-using-ai", {
          waitUntil: "domcontentloaded",
        });
        await page.waitForLoadState("networkidle", { timeout: 60_000 });
        const locator = page.locator(target.selector).first();
        await locator.waitFor({ state: "attached", timeout: 60_000 });
        await locator.scrollIntoViewIfNeeded();
        await page.waitForTimeout(800);
        await locator.waitFor({ state: "visible", timeout: 30_000 });
        const file = path.join(OUT_DIR, `${target.id}__${vp.name}.png`);
        await locator.screenshot({ path: file });

        // Also capture layout/overflow diagnostics
        const diagnostic = await locator.evaluate((root) => {
          const rootRect = (root as HTMLElement).getBoundingClientRect();
          const findings: Array<{
            path: string;
            tag: string;
            cls: string;
            text: string;
            reason: string;
            rect: { x: number; y: number; w: number; h: number };
          }> = [];
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
            const overflowsRight = r.right - rootRect.right > 2;
            const overflowsLeft = rootRect.left - r.left > 2;
            const overflowsBottom = r.bottom - rootRect.bottom > 2;
            if (overflowsRight || overflowsLeft || overflowsBottom) {
              findings.push({
                path: pathOf(el),
                tag: el.tagName.toLowerCase(),
                cls: (el.getAttribute("class") || "").slice(0, 120),
                text: (el.textContent || "").slice(0, 60).replace(/\s+/g, " "),
                reason: [
                  overflowsRight ? `right:+${Math.round(r.right - rootRect.right)}` : "",
                  overflowsLeft ? `left:+${Math.round(rootRect.left - r.left)}` : "",
                  overflowsBottom ? `bottom:+${Math.round(r.bottom - rootRect.bottom)}` : "",
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
            rootRect: {
              w: Math.round(rootRect.width),
              h: Math.round(rootRect.height),
            },
            overflowCount: findings.length,
            findings: findings.slice(0, 20),
          };
        });

        const jsonFile = path.join(OUT_DIR, `${target.id}__${vp.name}.json`);
        fs.writeFileSync(jsonFile, JSON.stringify(diagnostic, null, 2));
        console.log(`SAVED ${file} rootW=${diagnostic.rootRect.w} overflows=${diagnostic.overflowCount}`);
      });
    }
  }
});
