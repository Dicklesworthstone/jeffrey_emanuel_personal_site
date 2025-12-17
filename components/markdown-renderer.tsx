"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";
import Image from "next/image";
import ErrorBoundary from "@/components/error-boundary";

interface MarkdownRendererProps {
  content: string;
  className?: string;
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
              <SyntaxHighlighter
                {...props}
                style={oneDark}
                language={match[1]}
                PreTag="div"
                customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
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
            return <td className="px-6 py-4 border-b border-slate-800/50 text-slate-400 whitespace-nowrap">{children}</td>;
          },
          img({ src, alt }) {
             // For external images where we can't control the size, use fill or width/height 0
             // We need to handle relative URLs (local images) vs absolute URLs
             return (
                 <figure className="block my-8 relative">
                    <div className="relative w-full h-auto">
                      <Image 
                        src={(src as string) || ""} 
                        alt={alt || ""}
                        width={0}
                        height={0}
                        sizes="100vw"
                        className="rounded-xl border border-slate-800 shadow-2xl mx-auto w-full h-auto"
                        style={{ width: '100%', height: 'auto' }}
                        loading="lazy"
                      />
                    </div>
                    {alt && <figcaption className="block text-center text-sm text-slate-500 mt-2 italic">{alt}</figcaption>}
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
