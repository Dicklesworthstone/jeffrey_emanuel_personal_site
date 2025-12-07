import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div
      className={cn(
        "prose prose-lg prose-invert max-w-none prose-pre:bg-slate-900/50 prose-pre:border prose-pre:border-slate-800 prose-headings:font-semibold prose-a:text-sky-300 hover:prose-a:text-sky-200 prose-img:rounded-xl",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, [remarkMath, { singleDollarTextMath: true }]]}
        // Keep HTML generation on the server so we don't ship the entire
        // remark/rehype stack to the client. Math is rendered through KaTeX.
        rehypePlugins={[[rehypeKatex, { strict: false }]]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
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
             return (
                 <figure className="block my-8">
                    <img src={src} alt={alt} className="rounded-xl border border-slate-800 shadow-2xl mx-auto" />
                    {alt && <figcaption className="block text-center text-sm text-slate-500 mt-2 italic">{alt}</figcaption>}
                 </figure>
             )
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
