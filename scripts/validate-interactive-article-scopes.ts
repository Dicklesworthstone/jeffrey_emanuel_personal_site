import { readFileSync } from "node:fs";
import { join } from "node:path";

const cssPath = join(process.cwd(), "app", "globals.css");
const css = readFileSync(cssPath, "utf8");

const requiredAnchors = [
  "/* INTERACTIVE ARTICLE SCOPES START - Validated by scripts/validate-interactive-article-scopes.ts */",
  "/* INTERACTIVE ARTICLE SCOPES END - Validated by scripts/validate-interactive-article-scopes.ts */",
];

const requiredSelectors = [
  ".overprompting-scope .op-display-title",
  ".raptorq-scope .rq-display-title",
  ".hoeffding-scope .hd-callout",
  ".bakery-scope .ba-display-title",
  ".cmaes-scope .rq-display-title",
  ".barra-scope .barra-display-title",
  ".overprompting-scope.op-body p:not(.text-sm):not(.text-base):not(.text-xl)",
  ".raptorq-scope.rq-body p:not(.text-sm):not(.text-base):not(.text-xl)",
  ".hd-body p:not(.text-sm):not(.text-base):not(.text-xl)",
  ".bakery-scope.ba-body p:not(.text-sm):not(.text-base)",
  ".cmaes-scope.rq-body p:not(.text-sm):not(.text-base)",
  ".barra-scope.barra-body p:not(.text-sm):not(.text-base):not(.text-xl)",
];

const missingAnchors = requiredAnchors.filter((anchor) => !css.includes(anchor));
const missingSelectors = requiredSelectors.filter((selector) => !css.includes(selector));

const startIndex = css.indexOf(requiredAnchors[0]);
const endIndex = css.indexOf(requiredAnchors[1]);
const orderError = startIndex === -1 || endIndex === -1 || startIndex > endIndex;

if (missingAnchors.length || missingSelectors.length || orderError) {
  console.error("Interactive article scope validation failed.");
  if (missingAnchors.length) {
    console.error("Missing anchors:");
    for (const anchor of missingAnchors) console.error(`  - ${anchor}`);
  }
  if (orderError) {
    console.error("Anchor order is invalid: START must appear before END.");
  }
  if (missingSelectors.length) {
    console.error("Missing critical selectors:");
    for (const selector of missingSelectors) console.error(`  - ${selector}`);
  }
  process.exit(1);
}

console.log("Interactive article scope validation passed.");
