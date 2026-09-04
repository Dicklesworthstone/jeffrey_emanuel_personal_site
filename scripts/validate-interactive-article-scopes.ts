import { readFileSync } from "node:fs";
import { join } from "node:path";

// The interactive-article scopes used to live inside app/globals.css between the two
// anchor comments below. They now live in per-article CSS files under components/ that
// are imported only by the article components which render them, so non-article routes
// no longer download them. This script asserts:
//   1. the anchors still exist in globals.css, START before END;
//   2. globals.css contains NO article-scope selector any more (outside comments);
//   3. each critical selector exists in the file that now owns it;
//   4. the rule duplicated between raptorq-article.css and cmaes-article.css is identical;
//   5. every article component imports its scope file (and the shared file).

const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf8");
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

const globalsPath = "app/globals.css";
const globals = read(globalsPath);

const requiredAnchors = [
  "/* INTERACTIVE ARTICLE SCOPES START - Validated by scripts/validate-interactive-article-scopes.ts */",
  "/* INTERACTIVE ARTICLE SCOPES END - Validated by scripts/validate-interactive-article-scopes.ts */",
];

const sharedFile = "components/interactive-article-shared.css";

// file -> critical selectors that must exist there.
const requiredSelectorsByFile: Record<string, string[]> = {
  "components/overprompting-article.css": [
    ".overprompting-scope .op-display-title",
    ".overprompting-scope.op-body p:not([class*=\"text-\"]):not(.text-sm):not(.text-base):not(.text-xl)",
  ],
  "components/raptorq-article.css": [
    ".raptorq-scope .rq-display-title",
    ".raptorq-scope.rq-body p:not([class*=\"text-\"]):not(.text-sm):not(.text-base):not(.text-xl)",
    ":is(.raptorq-scope, .cmaes-scope) .rq-progress-bar",
  ],
  "components/hoeffding-article.css": [
    ".hoeffding-scope .hd-callout",
    ".hd-body p:not([class*=\"text-\"]):not(.text-sm):not(.text-base):not(.text-xl)",
  ],
  "components/bakery-article.css": [
    ".bakery-scope .ba-display-title",
    ".bakery-scope.ba-body p:not([class*=\"text-\"]):not(.text-sm):not(.text-base)",
  ],
  "components/cmaes-article.css": [
    ".cmaes-scope .rq-display-title",
    ".cmaes-scope.rq-body p:not([class*=\"text-\"]):not(.text-sm):not(.text-base)",
    ":is(.raptorq-scope, .cmaes-scope) .rq-progress-bar",
  ],
  "components/barra-article.css": [
    ".barra-scope .barra-display-title",
    ".barra-scope.barra-body p:not([class*=\"text-\"]):not(.text-sm):not(.text-base):not(.text-xl)",
  ],
  "components/sm-article.css": [
    ".sm-scope .sm-display-title",
    ".sm-scope.sm-body p:not([class*=\"text-\"]):not(.text-sm):not(.text-base):not(.text-xl)",
  ],
  [sharedFile]: [
    ".sm-scope .sm-viz-container) [class~=\"text-[7px]\"]",
    ".custom-scrollbar::-webkit-scrollbar",
    ".hoeffding-scope section[data-section=\"hero\"]",
  ],
};

// component -> the CSS files it must import (relative specifiers as written in the file).
const requiredImportsByComponent: Record<string, string[]> = {
  "components/hoeffding-article.tsx": ["./hoeffding-article.css", "./interactive-article-shared.css"],
  "components/raptorq-article.tsx": ["./raptorq-article.css", "./interactive-article-shared.css"],
  "components/overprompting-article.tsx": ["./overprompting-article.css", "./interactive-article-shared.css"],
  "components/bakery-article.tsx": ["./bakery-article.css", "./interactive-article-shared.css"],
  "components/cmaes-article.tsx": ["./cmaes-article.css", "./interactive-article-shared.css"],
  "components/barra-article.tsx": ["./barra-article.css", "./interactive-article-shared.css"],
  "components/slack-migration-article.tsx": ["./sm-article.css", "./interactive-article-shared.css"],
  "components/wills-estate-article.tsx": ["./sm-article.css", "./interactive-article-shared.css"],
};

const articleScopePattern =
  /\.(?:hoeffding|raptorq|overprompting|bakery|cmaes|barra|sm)-scope\b|\.(?:hd|rq|op|ba|barra|sm)-[a-z]/g;

const errors: string[] = [];

// 1. Anchors.
const missingAnchors = requiredAnchors.filter((anchor) => !globals.includes(anchor));
for (const anchor of missingAnchors) errors.push(`Missing anchor in ${globalsPath}: ${anchor}`);
const startIndex = globals.indexOf(requiredAnchors[0]);
const endIndex = globals.indexOf(requiredAnchors[1]);
if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
  errors.push("Anchor order is invalid: START must appear before END.");
}

// 2. globals.css must not contain article-scope selectors any more.
const leaked = stripComments(globals).match(articleScopePattern);
if (leaked) {
  const unique = [...new Set(leaked)];
  errors.push(
    `${globalsPath} still contains interactive-article scope selectors (they belong in components/*-article.css): ${unique.join(", ")}`,
  );
}

// 3. Critical selectors live in their new files.
for (const [file, selectors] of Object.entries(requiredSelectorsByFile)) {
  let css: string;
  try {
    css = read(file);
  } catch {
    errors.push(`Missing CSS file: ${file}`);
    continue;
  }
  for (const selector of selectors) {
    if (!css.includes(selector)) errors.push(`Missing critical selector in ${file}: ${selector}`);
  }
}

// 4. The rule duplicated across raptorq/cmaes must stay identical.
try {
  const rulePattern = /:is\(\.raptorq-scope, \.cmaes-scope\) \.rq-progress-bar \{[^}]*\}/g;
  const raptorqRules = read("components/raptorq-article.css").match(rulePattern) ?? [];
  const cmaesRules = read("components/cmaes-article.css").match(rulePattern) ?? [];
  const normalize = (rules: string[]) => rules.map((rule) => rule.replace(/\s+/g, " ").trim());
  const a = normalize(raptorqRules);
  const b = normalize(cmaesRules);
  if (a.length === 0 || a.length !== b.length || a.some((rule, i) => rule !== b[i])) {
    errors.push(
      "The :is(.raptorq-scope, .cmaes-scope) .rq-progress-bar rules differ between components/raptorq-article.css and components/cmaes-article.css.",
    );
  }
} catch (error) {
  errors.push(`Could not compare duplicated progress-bar rules: ${String(error)}`);
}

// 5. Components import their scope files.
for (const [component, specifiers] of Object.entries(requiredImportsByComponent)) {
  let source: string;
  try {
    source = read(component);
  } catch {
    errors.push(`Missing component: ${component}`);
    continue;
  }
  for (const specifier of specifiers) {
    if (!source.includes(`import "${specifier}";`)) {
      errors.push(`${component} must import "${specifier}"`);
    }
  }
}

if (errors.length) {
  console.error("Interactive article scope validation failed.");
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log("Interactive article scope validation passed.");
