import { test } from "@playwright/test";
import fs from "node:fs";

const OUT_DIR = "/tmp/wills-audit";
fs.mkdirSync(OUT_DIR, { recursive: true });

test.use({ baseURL: "http://localhost:3000" });

test("render OG images", async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1200, height: 630 });
  const [res1, res2] = await Promise.all([
    page.request.get("/writing/wills-and-estate-planning/opengraph-image", { timeout: 120_000 }),
    page.request.get("/writing/wills-and-estate-planning/twitter-image", { timeout: 120_000 }),
  ]);
  const b1 = await res1.body();
  const b2 = await res2.body();
  fs.writeFileSync(`${OUT_DIR}/og-image-new.png`, b1);
  fs.writeFileSync(`${OUT_DIR}/twitter-image-new.png`, b2);
  console.log("OG status:", res1.status(), "bytes:", b1.length);
  console.log("Twitter status:", res2.status(), "bytes:", b2.length);
});
