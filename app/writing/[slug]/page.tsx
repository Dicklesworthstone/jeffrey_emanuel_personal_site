// KaTeX CSS - only loaded on markdown article pages
import "katex/dist/katex.min.css";

import { notFound, permanentRedirect } from "next/navigation";
import { isValidElement, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import { getAllPostsMeta, getPostBySlug, isDraftPost } from "@/lib/mdx";
import { MarkdownCodeBlock } from "@/components/markdown-renderer";
import ErrorBoundary from "@/components/error-boundary";
import ArticleProgress from "@/components/article-progress";
import TableOfContents from "@/components/table-of-contents";
import { calculateReadingTime } from "@/lib/reading-time";
import { extractHeadings } from "@/lib/extract-headings";
import { cn, formatDate } from "@/lib/utils";
import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";

const WRITING_ROUTE_REDIRECTS: Record<string, string> = {
  barra_factor_model_article: "barra-factor-model",
};

const STATIC_WRITING_ROUTE_SLUGS = new Set([
  "bakery_algorithm",
  "barra-factor-model",
  "cmaes_explainer",
  "hoeffdings_d_explainer",
  "overprompting",
  "raptorq",
  "slack-mattermost-migration",
]);

const SITE_HOSTNAMES = new Set(["jeffreyemanuel.com", "www.jeffreyemanuel.com"]);

function normalizeIncomingSlug(slug: string): string {
  return slug.trim().replace(/\.md$/i, "");
}

function getCanonicalWritingSlug(slug: string): string {
  const normalized = normalizeIncomingSlug(slug);
  return WRITING_ROUTE_REDIRECTS[normalized] ?? normalized;
}

/** Flatten a React node tree (as produced by react-markdown) to its text. */
function nodeToText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeToText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return nodeToText(node.props.children);
  return "";
}

function isExternalHref(href: string | undefined): boolean {
  if (!href) return false;
  try {
    const url = new URL(href);
    return (url.protocol === "http:" || url.protocol === "https:") && !SITE_HOSTNAMES.has(url.hostname);
  } catch {
    return false;
  }
}

/**
 * react-markdown element overrides. Everything here renders on the server;
 * only <MarkdownCodeBlock> is a client island (copy button + lazy highlighter).
 */
const markdownComponents: Components = {
  // The page already renders the post title as the single <h1>, so body "# "
  // headings become <h2> (rehype-slug's id is preserved via props for the TOC).
  h1({ node: _node, ...props }) {
    return <h2 {...props} />;
  },
  pre({ node: _node, children }) {
    if (!isValidElement<{ className?: string; children?: ReactNode }>(children)) {
      return <pre>{children}</pre>;
    }
    const match = /language-([A-Za-z0-9_+#-]+)/.exec(children.props.className || "");
    const code = nodeToText(children.props.children).replace(/\n$/, "");
    return <MarkdownCodeBlock language={match?.[1]} code={code} />;
  },
  code({ node: _node, className, children, ...props }) {
    return (
      <code
        {...props}
        className={cn("bg-slate-800/50 rounded px-1.5 py-0.5 text-sm font-mono text-sky-200", className)}
      >
        {children}
      </code>
    );
  },
  a({ node: _node, href, children, ...props }) {
    if (isExternalHref(href)) {
      return (
        <a {...props} href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    }
    return (
      <a {...props} href={href}>
        {children}
      </a>
    );
  },
  table({ node: _node, children }) {
    return (
      <div className="overflow-x-auto my-8 border border-slate-800 rounded-lg">
        <table className="min-w-full text-left text-sm">{children}</table>
      </div>
    );
  },
  thead({ node: _node, children }) {
    return (
      <thead className="bg-slate-900/50 text-slate-200 font-semibold border-b border-slate-800">
        {children}
      </thead>
    );
  },
  th({ node: _node, children }) {
    return <th className="px-6 py-4">{children}</th>;
  },
  // Markdown wraps a lone image in <p>; our img override renders a block
  // <figure>, which the HTML parser cannot keep inside <p> (it closes the
  // paragraph early and the client tree no longer matches → React #418).
  // Unwrap paragraphs whose only element children are images.
  p({ node, children }) {
    const kids = (node?.children ?? []).filter(
      (c) => !(c.type === "text" && String((c as { value?: string }).value ?? "").trim() === "")
    );
    const imageOnly =
      kids.length > 0 &&
      kids.every((c) => c.type === "element" && (c as { tagName?: string }).tagName === "img");
    if (imageOnly) return <>{children}</>;
    return <p>{children}</p>;
  },
  img({ node: _node, src, alt }) {
    const safeSrc = typeof src === "string" ? src : "";
    // Extract optional width/height from alt text if provided in format "alt text | 600x400"
    const altParts = alt?.split("|") || [];
    const cleanAlt = altParts[0]?.trim() || "";
    const dimensions = altParts[1]?.trim().match(/(\d+)x(\d+)/);
    const width = dimensions ? parseInt(dimensions[1], 10) : undefined;
    const height = dimensions ? parseInt(dimensions[2], 10) : undefined;

    return (
      <figure className="block my-8 relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={safeSrc}
          alt={cleanAlt}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          className="rounded-xl border border-slate-800 shadow-2xl mx-auto max-w-full h-auto"
          style={{ aspectRatio: width && height ? `${width}/${height}` : "auto" }}
        />
        {cleanAlt && (
          <figcaption className="block text-center text-sm text-slate-500 mt-2 italic">
            {cleanAlt}
          </figcaption>
        )}
      </figure>
    );
  },
};

function ArticleBody({ content }: { content: string }) {
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
      <div className="prose prose-lg prose-invert max-w-none pb-6 prose-pre:bg-slate-900/50 prose-pre:border prose-pre:border-slate-800 prose-headings:font-semibold prose-a:text-sky-300 hover:prose-a:text-sky-200 prose-img:rounded-xl">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, [remarkMath, { singleDollarTextMath: true }]]}
          // rehype-slug adds IDs to headings for TOC navigation; math is
          // rendered to static KaTeX markup here on the server.
          rehypePlugins={[rehypeSlug, [rehypeKatex, { strict: false }]]}
          components={markdownComponents}
        >
          {content}
        </ReactMarkdown>
      </div>
    </ErrorBoundary>
  );
}

export async function generateStaticParams() {
  const posts = getAllPostsMeta();
  return posts.flatMap((post) => {
    const slug = String(post.slug);
    if (STATIC_WRITING_ROUTE_SLUGS.has(getCanonicalWritingSlug(slug))) {
      return [];
    }
    return [{ slug }];
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const canonicalSlug = getCanonicalWritingSlug(slug);
  const contentSlug = normalizeIncomingSlug(slug);
  try {
    const post = getPostBySlug(contentSlug);
    return {
      title: post.title,
      description: post.excerpt,
      alternates: {
        canonical: `/writing/${canonicalSlug}`,
      },
      ...(isDraftPost(post) && {
        robots: {
          index: false,
          follow: false,
        },
      }),
    };
  } catch {
    notFound();
  }
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: requestedSlug } = await params;
  const canonicalSlug = getCanonicalWritingSlug(requestedSlug);
  const contentSlug = normalizeIncomingSlug(requestedSlug);

  if (canonicalSlug !== requestedSlug) {
    permanentRedirect(`/writing/${canonicalSlug}`);
  }

  const post = (() => {
    try {
      return getPostBySlug(contentSlug);
    } catch (error) {
      console.error("[writing] failed to load post", contentSlug, error);
      notFound();
    }
  })();

  // Calculate reading time
  const readingTime = calculateReadingTime(post.content || "");

  // Extract headings for table of contents
  const headings = extractHeadings(post.content || "");

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    // Dates are only asserted when the frontmatter actually carries one.
    ...(post.date && { datePublished: post.date, dateModified: post.date }),
    description: post.excerpt,
    author: {
      "@type": "Person",
      name: "Jeffrey Emanuel",
      url: "https://jeffreyemanuel.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Jeffrey Emanuel",
      logo: {
        "@type": "ImageObject",
        url: "https://jeffreyemanuel.com/icon-192.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://jeffreyemanuel.com/writing/${canonicalSlug}`,
    },
  };

  return (
    <>
      <JsonLd data={articleSchema} />
      {/* Reading progress bar */}
      <ArticleProgress />

      {/* Table of contents (sticky sidebar on wide desktops, floating elsewhere) */}
      <TableOfContents headings={headings} />

      <article className="min-h-screen bg-slate-950">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-28 pb-20 md:pt-36">
          <div className="reading-surface mx-auto max-w-3xl">
            <Link
              href="/writing"
              className="group mb-10 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition-colors hover:text-sky-300"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to writing
            </Link>

            <header className="mb-12 border-b border-slate-800/60 pb-10">
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
                {post.category && <span className="text-sky-300">{post.category}</span>}
                {post.date && (
                  <div className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-slate-600" />
                    <time dateTime={post.date}>
                      {formatDate(post.date)}
                    </time>
                  </div>
                )}
                {/* Reading time */}
                <div className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-slate-600" />
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    {readingTime.text}
                  </span>
                </div>
              </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight text-slate-50 text-balance-pro">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-6 text-lg leading-relaxed text-slate-300 md:text-xl">
                {post.excerpt}
              </p>
            )}
          </header>

          <ArticleBody content={post.content} />

          <div className="mt-14 pt-10 border-t border-slate-800/60">
            <Link
              href="/writing"
              className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-800/60 px-8 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-700 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Read more articles
            </Link>
          </div>
        </div>
      </div>
      </article>
    </>
  );
}
