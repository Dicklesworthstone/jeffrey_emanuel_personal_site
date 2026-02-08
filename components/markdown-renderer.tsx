"use client";

// KaTeX CSS - only loaded when this component is used (blog posts only)
import "katex/dist/katex.min.css";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import ErrorBoundary from "@/components/error-boundary";
import CopyButton from "@/components/copy-button";

let cachedTheme: Record<string, React.CSSProperties> | null = null;
let themePromise: Promise<Record<string, React.CSSProperties>> | null = null;

function loadTheme() {
  if (cachedTheme) {
    return Promise.resolve(cachedTheme);
  }
  if (!themePromise) {
    themePromise = import("react-syntax-highlighter/dist/esm/styles/prism/one-dark")
      .then((mod) => {
        cachedTheme = mod.default;
        return cachedTheme;
      });
  }
  return themePromise;
}

// Dynamically import syntax highlighter to reduce initial bundle size (~600KB)
const SyntaxHighlighter = dynamic(
  () => import("react-syntax-highlighter/dist/esm/prism-light").then(mod => mod.default),
  {
    ssr: false,
    loading: () => null // Will use fallback code block while loading
  }
);

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Lazy-loaded code block with syntax highlighting
function CodeBlock({ language, children }: { language: string; children: React.ReactNode }) {
  const [style, setStyle] = useState<Record<string, React.CSSProperties> | null>(() => cachedTheme);
  const [isLoaded, setIsLoaded] = useState(() => Boolean(cachedTheme));
  
  // Ensure content is a string
  const content = String(children || "").replace(/\n$/, "");

  useEffect(() => {
    if (cachedTheme) return;
    let cancelled = false;
    loadTheme()
      .then((theme) => {
        if (cancelled) return;
        setStyle(theme);
        setIsLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setIsLoaded(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Show simple code block while loading
  if (!isLoaded || !style) {
    return (
      <div className="group relative rounded-lg bg-slate-900/80">
        <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
          <CopyButton text={content} />
        </div>
        <pre className="overflow-x-auto p-4 text-sm">
          <code className="font-mono text-slate-300">{content}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className="group relative rounded-lg bg-[#282c34]">
      <div className="absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
        <CopyButton text={content} />
      </div>
      <SyntaxHighlighter
        style={style}
        language={language}
        PreTag="div"
        customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
      >
        {content}
      </SyntaxHighlighter>
    </div>
  );
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <ErrorBoundary
      fallback={
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-6 text-center">
          <p className="text-sm text-amber-200/80">
            Unable to render this content. The article may contain formatting that couldn&apos;t be processed.
          </p>
        </div>
      }
    >
      <div
        className={cn(
          "prose prose-lg prose-invert max-w-none prose-pre:bg-slate-900/50 prose-pre:border prose-pre:border-slate-800 prose-headings:font-semibold prose-a:text-sky-300 hover:prose-a:text-sky-200 prose-img:rounded-xl",
          className
        )}
      >
        <ReactMarkdown
        remarkPlugins={[remarkGfm, [remarkMath, { singleDollarTextMath: true }]]}
        // rehype-slug adds IDs to headings for TOC navigation
        // Keep HTML generation on the server so we don't ship the entire
        // remark/rehype stack to the client. Math is rendered through KaTeX.
        rehypePlugins={[rehypeSlug, [rehypeKatex, { strict: false }]]}
        components={{
          code({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <CodeBlock language={match[1]}>
                {children}
              </CodeBlock>
            ) : (
              <code {...props} className={cn("bg-slate-800/50 rounded px-1.5 py-0.5 text-sm font-mono text-sky-200", className)}>
                {children}
              </code>
            );
          },
          table({ children }) {
            return <div className="overflow-x-auto my-8 border border-slate-800 rounded-lg"><table className="min-w-full text-left text-sm">{children}</table></div>;
          },
          thead({ children }) {
            return <thead className="bg-slate-900/50 text-slate-200 font-semibold border-b border-slate-800">{children}</thead>;
          },
          th({ children }) {
            return <th className="px-6 py-4">{children}</th>;
          },
          td({ children }) {
            return <td className="px-6 py-4 border-b border-slate-800/50 text-slate-400 whitespace-normal">{children}</td>;
          },
          img({ src, alt }) {
             const safeSrc = (src as string) || "";
             return (
                 <figure className="block my-8 relative">
                    {/* Use a standard img tag to avoid unknown-dimension Next/Image errors */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={safeSrc}
                      alt={alt || ""}
                      loading="lazy"
                      decoding="async"
                      className="rounded-xl border border-slate-800 shadow-2xl mx-auto w-full h-auto"
                    />
                    {alt && (
                      <figcaption className="block text-center text-sm text-slate-500 mt-2 italic">
                        {alt}
                      </figcaption>
                    )}
                 </figure>
             )
          }
        }}
      >
        {content}
      </ReactMarkdown>
      </div>
    </ErrorBoundary>
  );
}
