import { test, expect, type Page } from "@playwright/test";

/**
 * Light/dark theme regression coverage.
 *
 * The first light-mode release resolved the theme from the OS preference and
 * bound every `dark:` utility to a media query, so light-OS visitors landed on
 * a broken light surface they never asked for. These tests pin the contract:
 * dark by default for everyone, light only by explicit choice, and the choice
 * (not the OS) drives the document class, the meta theme-color and the
 * rendered surface colours.
 */

const DARK_CANVAS = "rgb(2, 6, 23)";
const LIGHT_CANVAS = "rgb(248, 250, 252)";

async function readTheme(page: Page) {
  return page.evaluate(() => ({
    html: document.documentElement.className,
    bodyBg: getComputedStyle(document.body).backgroundColor,
    themeColor: document.querySelector('meta[name="theme-color"]')?.getAttribute("content") ?? null,
    stored: (() => {
      try {
        return localStorage.getItem("theme");
      } catch {
        return null;
      }
    })(),
  }));
}

test.describe("theme", () => {
  test("defaults to dark even when the OS prefers light", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    const theme = await readTheme(page);
    expect(theme.html).toContain("dark");
    expect(theme.html).not.toContain("light");
    expect(theme.bodyBg).toBe(DARK_CANVAS);
    expect(theme.themeColor).toBe("#020617");
    expect(theme.stored).toBeNull();
  });

  test("an explicit light choice wins over an OS that prefers dark", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.addInitScript(() => localStorage.setItem("theme", "light"));
    await page.goto("/");
    const theme = await readTheme(page);
    expect(theme.html).toContain("light");
    expect(theme.html).not.toContain("dark");
    expect(theme.bodyBg).toBe(LIGHT_CANVAS);
    expect(theme.themeColor).toBe("#f8fafc");
  });

  test("the header toggle flips the theme, persists it, and survives reload", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: /switch to light mode/i }).first();
    await expect(toggle).toBeVisible();
    await toggle.click();

    let theme = await readTheme(page);
    expect(theme.html).toContain("light");
    expect(theme.bodyBg).toBe(LIGHT_CANVAS);
    expect(theme.stored).toBe("light");
    await expect(page.getByRole("button", { name: /switch to dark mode/i }).first()).toBeVisible();

    await page.reload();
    theme = await readTheme(page);
    expect(theme.html).toContain("light");
    expect(theme.bodyBg).toBe(LIGHT_CANVAS);

    await page.getByRole("button", { name: /switch to dark mode/i }).first().click();
    theme = await readTheme(page);
    expect(theme.html).toContain("dark");
    expect(theme.bodyBg).toBe(DARK_CANVAS);
    expect(theme.stored).toBe("dark");
  });

  test("the T shortcut toggles the theme but not while typing", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("t");
    await expect.poll(async () => (await readTheme(page)).html).toContain("light");

    // Typing into the command palette must not flip the theme.
    await page.keyboard.press("/");
    const input = page.getByRole("dialog", { name: /command palette/i }).getByRole("combobox").or(
      page.getByLabel("Search commands")
    );
    await expect(input.first()).toBeFocused();
    await page.keyboard.type("theme toggle test");
    expect((await readTheme(page)).html).toContain("light");
    await page.keyboard.press("Escape");
    // Shortcuts stay suspended until the palette has fully closed and released focus.
    await expect(page.getByRole("dialog", { name: /command palette/i })).toBeHidden();

    await page.keyboard.press("t");
    await expect.poll(async () => (await readTheme(page)).html).toContain("dark");
  });

  test("the 3D hero stays a dark island in light mode", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("theme", "light"));
    await page.goto("/");
    const heroBg = await page.evaluate(() => {
      const hero = document.querySelector("section[data-section]");
      return hero ? getComputedStyle(hero).backgroundColor : null;
    });
    expect(heroBg).toBe(DARK_CANVAS);
  });
});
