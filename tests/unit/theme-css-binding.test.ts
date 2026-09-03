import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

import { compile as compileCss } from "tailwindcss";
import { describe, expect, it } from "vitest";

/**
 * The first light-mode release bound nothing: Tailwind v4 ships `dark:` as
 * `@media (prefers-color-scheme: dark)` unless a `@custom-variant` says
 * otherwise, so every `dark:` utility followed the visitor's OS while the
 * colour tokens followed the toggle, and the two halves of the theme
 * disagreed. This runs the real app/globals.css through the real compiler and
 * reads the selectors that actually ship, so an upgrade or a stray
 * redefinition cannot quietly reintroduce the OS binding.
 */
const APP_DIR = join(process.cwd(), "app");
const GLOBALS = join(APP_DIR, "globals.css");
const LAYOUT = join(APP_DIR, "layout.tsx");
const TAILWIND_ENTRY = join(process.cwd(), "node_modules", "tailwindcss", "index.css");

/**
 * Uses Tailwind's own `compile` rather than the PostCSS plugin: the plugin
 * memoises its design system for the life of the process, so the seeded
 * defect below would poison every later compile in this file. Passing
 * candidates directly also skips the source scan, keeping this to milliseconds.
 */
async function buildCandidates(css: string, candidates: string[]): Promise<string> {
  const compiler = await compileCss(css, {
    base: APP_DIR,
    loadStylesheet: async (id: string, basedir: string) => {
      const path = id === "tailwindcss" ? TAILWIND_ENTRY : resolve(basedir, id);
      return { path, base: dirname(path), content: readFileSync(path, "utf8") };
    },
    loadModule: async () => {
      throw new Error("globals.css asked to load a JS module; this guard does not supply one");
    },
  });
  return compiler.build(candidates);
}

function ruleFor(full: string, escapedSelector: string): string {
  const at = full.indexOf(escapedSelector);
  expect(at, `the compiler emitted no rule for ${escapedSelector}`).toBeGreaterThan(-1);
  return full.slice(at, at + 320);
}

function stripCustomVariant(source: string, name: "dark" | "light"): string {
  const stripped = source.replace(new RegExp(`^@custom-variant ${name} .*$`, "m"), "");
  expect(stripped, `the @custom-variant ${name} line was not found to remove`).not.toBe(source);
  return stripped;
}

describe("theme variants are bound to the <html> class, never the OS preference", () => {
  const source = readFileSync(GLOBALS, "utf8");

  it("compiles dark: against .dark and light: against .light", async () => {
    const full = await buildCandidates(source, ["dark:bg-black", "light:bg-black"]);

    expect(ruleFor(full, ".dark\\:bg-black")).toContain(":where(.dark, .dark *)");
    expect(ruleFor(full, ".light\\:bg-black")).toContain(":where(.light, .light *)");
    expect(full, "a prefers-color-scheme rule means a variant follows the OS again").not.toContain(
      "prefers-color-scheme"
    );
  });

  it("reports the OS binding when the custom dark variant is removed (seeded defect)", async () => {
    const full = await buildCandidates(stripCustomVariant(source, "dark"), ["dark:bg-black"]);
    const rule = ruleFor(full, ".dark\\:bg-black");
    expect(rule).toContain("prefers-color-scheme");
    expect(rule).not.toContain(":where(.dark, .dark *)");
  });

  it("emits nothing for light: when the custom light variant is removed (seeded defect)", async () => {
    const full = await buildCandidates(stripCustomVariant(source, "light"), ["light:bg-black"]);
    expect(full).not.toContain(".light\\:bg-black");
  });
});

describe("the slate ramp and white resolve through the per-theme role tokens", () => {
  const source = readFileSync(GLOBALS, "utf8");

  it("inlines the role variable into the utility so nested .dark islands re-resolve", async () => {
    const full = await buildCandidates(source, [
      "bg-slate-950",
      "bg-slate-900",
      "text-slate-100",
      "text-white",
      "border-white/10",
    ]);

    expect(ruleFor(full, ".bg-slate-950")).toContain("var(--site-bg-canvas)");
    expect(ruleFor(full, ".bg-slate-900")).toContain("var(--site-bg-surface)");
    expect(ruleFor(full, ".text-slate-100")).toContain("var(--site-text-heading)");
    expect(ruleFor(full, ".text-white")).toContain("var(--site-ink)");
    // Alpha modifiers must go through color-mix on the same variable.
    expect(ruleFor(full, ".border-white\\/10")).toContain("var(--site-ink)");
  });

  it("defines every role token for :root/.dark and again for .light", () => {
    const darkBlock = /:root,\s*\.dark\s*\{([^}]*)\}/.exec(source);
    const lightBlock = /\.light\s*\{([^}]*)\}/.exec(source);
    expect(darkBlock, "no `:root, .dark {}` token block").not.toBeNull();
    expect(lightBlock, "no `.light {}` token block").not.toBeNull();

    const tokens = (block: string) =>
      Array.from(block.matchAll(/--site-[a-z-]+/g), (m) => m[0]).sort();
    const dark = tokens(darkBlock![1]);
    const light = tokens(lightBlock![1]);
    expect(dark.length).toBeGreaterThan(0);
    expect(light).toEqual(dark);

    // Every token referenced from @theme inline must be defined.
    const themeBlock = /@theme inline\s*\{([^}]*)\}/.exec(source);
    expect(themeBlock).not.toBeNull();
    for (const ref of Array.from(themeBlock![1].matchAll(/var\((--site-[a-z-]+)\)/g), (m) => m[1])) {
      expect(dark, `${ref} is referenced from @theme but never defined`).toContain(ref);
    }

    expect(darkBlock![1]).toContain("color-scheme: dark");
    expect(lightBlock![1]).toContain("color-scheme: light");
  });
});

describe("the pre-paint script in layout.tsx agrees with the provider", () => {
  const layout = readFileSync(LAYOUT, "utf8");
  const script = /__html:\s*`([^`]*)`/.exec(layout)?.[1];

  it("stamps a theme class before first paint", () => {
    expect(script, "no inline theme script found in layout.tsx").toBeTruthy();
    expect(script).toContain("documentElement.classList.add(");
  });

  it("defaults to dark and only a stored 'light' opts in", () => {
    expect(script).toContain('var t="dark"');
    expect(script).toContain('localStorage.getItem("theme")==="light"');
  });

  it("never reads prefers-color-scheme", () => {
    expect(script).not.toContain("matchMedia");
    expect(script).not.toContain("prefers-color-scheme");
  });

  it("uses a single media-less theme-color so the provider can rewrite it", () => {
    const viewport = /export const viewport = \{([\s\S]*?)\n\};/.exec(layout)?.[1] ?? "";
    expect(viewport).toContain('themeColor: "#020617"');
    expect(viewport).not.toContain("prefers-color-scheme");
  });
});
