import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/mdx";
import MarkdownRenderer from "@/components/markdown-renderer";
import ArticleProgress from "@/components/article-progress";
import TableOfContents from "@/components/table-of-contents";
import { calculateReadingTime } from "@/lib/reading-time";
import { extractHeadings } from "@/lib/extract-headings";
import { cn, formatDate } from "@/lib/utils";
import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = getPostBySlug(slug);
    return {
      title: post.title,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        type: "article",
        publishedTime: post.date,
        authors: ["Jeffrey Emanuel"],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.excerpt,
      },
    };
  } catch {
    notFound();
  }
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let post;
  try {
    post = getPostBySlug(slug);
  } catch (e) {
    console.error("[writing] failed to load post", slug, e);
    notFound();
  }

  // Calculate reading time
  const readingTime = calculateReadingTime(post.content || "");

  // Extract headings for table of contents
  const headings = extractHeadings(post.content || "");

  return (
    <>
      {/* Reading progress bar */}
      <ArticleProgress />

      {/* Table of contents (sticky sidebar on desktop, floating on mobile) */}
      <TableOfContents headings={headings} />

      <article className="min-h-screen bg-[#020617]">
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
              <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 mb-4">
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

          <MarkdownRenderer content={post.content} className="pb-6" />

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
