"use client";

/**
 * Client islands for the markdown article pipeline.
 *
 * The markdown itself (react-markdown + remark-gfm/remark-math + rehype-slug/
 * rehype-katex) is rendered on the server in app/writing/[slug]/page.tsx, so
 * the parser and KaTeX never ship to the browser. Only the fenced code block
 * needs client behaviour: a copy button and a lazily loaded syntax
 * highlighter that swaps in *after* the server-rendered <pre> is on screen.
 */

import { useEffect, useState, type ComponentType, type CSSProperties } from "react";
import type { SyntaxHighlighterProps } from "react-syntax-highlighter";
import CopyButton from "@/components/copy-button";

type HighlighterBundle = {
  SyntaxHighlighter: ComponentType<SyntaxHighlighterProps>;
  style: Record<string, CSSProperties>;
};

// Languages that appear in content/writing fences (python, bash, rust,
// javascript, markdown) plus the small set the rest of the site links to.
// prism-light registers nothing by default; unregistered languages render as
// plain text, so each fence language must be listed here explicitly.
const SUPPORTED_LANGUAGES = new Set([
  "bash",
  "python",
  "typescript",
  "tsx",
  "javascript",
  "json",
  "rust",
  "yaml",
  "toml",
  "sql",
  "go",
  "diff",
  "markdown",
]);

const LANGUAGE_ALIASES: Record<string, string> = {
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  console: "bash",
  py: "python",
  ts: "typescript",
  js: "javascript",
  jsx: "javascript",
  jsonc: "json",
  yml: "yaml",
  md: "markdown",
  rs: "rust",
  golang: "go",
};

/** Map a fence info string to a registered prism language, or null for plain text. */
export function resolveHighlightLanguage(language: string | undefined): string | null {
  if (!language) return null;
  const key = language.toLowerCase();
  const resolved = LANGUAGE_ALIASES[key] ?? key;
  return SUPPORTED_LANGUAGES.has(resolved) ? resolved : null;
}

let cachedBundle: HighlighterBundle | null = null;
let bundlePromise: Promise<HighlighterBundle> | null = null;

// One promise gates highlighter + theme + grammars, so the plain <pre> is only
// replaced once everything needed to render the highlighted block is ready.
// This preserves the block's height (no collapse-then-reappear).
function loadHighlighter(): Promise<HighlighterBundle> {
  if (cachedBundle) return Promise.resolve(cachedBundle);
  if (!bundlePromise) {
    bundlePromise = Promise.all([
      import("react-syntax-highlighter/dist/esm/prism-light"),
      import("react-syntax-highlighter/dist/esm/styles/prism/one-dark"),
      import("react-syntax-highlighter/dist/esm/languages/prism/bash"),
      import("react-syntax-highlighter/dist/esm/languages/prism/python"),
      import("react-syntax-highlighter/dist/esm/languages/prism/typescript"),
      import("react-syntax-highlighter/dist/esm/languages/prism/tsx"),
      import("react-syntax-highlighter/dist/esm/languages/prism/javascript"),
      import("react-syntax-highlighter/dist/esm/languages/prism/json"),
      import("react-syntax-highlighter/dist/esm/languages/prism/rust"),
      import("react-syntax-highlighter/dist/esm/languages/prism/yaml"),
      import("react-syntax-highlighter/dist/esm/languages/prism/toml"),
      import("react-syntax-highlighter/dist/esm/languages/prism/sql"),
      import("react-syntax-highlighter/dist/esm/languages/prism/go"),
      import("react-syntax-highlighter/dist/esm/languages/prism/diff"),
      import("react-syntax-highlighter/dist/esm/languages/prism/markdown"),
    ])
      .then(
        ([
          light,
          theme,
          bash,
          python,
          typescript,
          tsx,
          javascript,
          json,
          rust,
          yaml,
          toml,
          sql,
          go,
          diff,
          markdown,
        ]) => {
          const SyntaxHighlighter = light.default;
          SyntaxHighlighter.registerLanguage("bash", bash.default);
          SyntaxHighlighter.registerLanguage("python", python.default);
          SyntaxHighlighter.registerLanguage("typescript", typescript.default);
          SyntaxHighlighter.registerLanguage("tsx", tsx.default);
          SyntaxHighlighter.registerLanguage("javascript", javascript.default);
          SyntaxHighlighter.registerLanguage("json", json.default);
          SyntaxHighlighter.registerLanguage("rust", rust.default);
          SyntaxHighlighter.registerLanguage("yaml", yaml.default);
          SyntaxHighlighter.registerLanguage("toml", toml.default);
          SyntaxHighlighter.registerLanguage("sql", sql.default);
          SyntaxHighlighter.registerLanguage("go", go.default);
          SyntaxHighlighter.registerLanguage("diff", diff.default);
          SyntaxHighlighter.registerLanguage("markdown", markdown.default);
          cachedBundle = { SyntaxHighlighter, style: theme.default };
          return cachedBundle;
        }
      )
      .catch((error) => {
        // Allow a later mount to retry instead of caching the failure forever.
        bundlePromise = null;
        throw error;
      });
  }
  return bundlePromise;
}

interface MarkdownCodeBlockProps {
  /** Fence info string, e.g. "python". */
  language?: string;
  /** Raw code text (trailing newline already stripped). */
  code: string;
}

// Copy button reveal: hover on pointer devices, always on touch (no hover),
// and whenever the button itself has focus so keyboard users can see it.
const COPY_WRAPPER_CLASS =
  "absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100";

/**
 * Fenced code block island. Server-renders a plain <pre> (so the article body
 * and its height are in the HTML), then upgrades to the highlighted view once
 * the highlighter bundle has loaded on the client.
 */
export function MarkdownCodeBlock({ language, code }: MarkdownCodeBlockProps) {
  const highlightLanguage = resolveHighlightLanguage(language);
  const [bundle, setBundle] = useState<HighlighterBundle | null>(() => cachedBundle);

  useEffect(() => {
    if (!highlightLanguage || cachedBundle) return;
    let cancelled = false;
    loadHighlighter()
      .then((loaded) => {
        if (!cancelled) setBundle(loaded);
      })
      .catch(() => {
        // Keep the plain <pre>; highlighting is progressive enhancement.
      });
    return () => {
      cancelled = true;
    };
  }, [highlightLanguage]);

  if (!highlightLanguage || !bundle) {
    return (
      <div className="group relative rounded-lg bg-slate-900/80">
        <div className={COPY_WRAPPER_CLASS}>
          <CopyButton text={code} />
        </div>
        <pre className="overflow-x-auto p-4 text-sm">
          <code className="font-mono text-slate-300">{code}</code>
        </pre>
      </div>
    );
  }

  const { SyntaxHighlighter, style } = bundle;

  return (
    <div className="group relative rounded-lg bg-[#282c34]">
      <div className={COPY_WRAPPER_CLASS}>
        <CopyButton text={code} />
      </div>
      <SyntaxHighlighter
        style={style}
        language={highlightLanguage}
        PreTag="div"
        customStyle={{ margin: 0, padding: "1rem", background: "transparent" }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export default MarkdownCodeBlock;
