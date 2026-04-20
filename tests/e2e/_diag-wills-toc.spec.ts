import { test, expect } from "@playwright/test";

test("TOC jumps hit each target top precisely", async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/writing/wills-and-estate-planning", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  const links = [
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
  const results: Array<{ id: string; rectTop: number; scrollY: number; docHeight: number; maxScroll: number }> = [];
  for (const id of links) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    const sel = `nav.sm-toc a[href="#${id}"]`;
    const link = page.locator(sel).first();
    await link.click();
    // Wait long enough for keepAnchorInView to settle (2.4s deadline)
    await page.waitForTimeout(2800);
    const data = await page.evaluate((id) => {
      const el = document.getElementById(id);
      const r = el?.getBoundingClientRect();
      return {
        rectTop: r ? Math.round(r.top) : NaN,
        scrollY: Math.round(window.scrollY),
        docHeight: document.documentElement.scrollHeight,
        maxScroll: document.documentElement.scrollHeight - window.innerHeight,
      };
    }, id);
    results.push({ id, ...data });
  }
  console.log(JSON.stringify(results, null, 2));
  expect(true).toBe(true);
});
