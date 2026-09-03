import SectionShell from "@/components/section-shell";
import WritingGrid from "@/components/writing-grid";
import { writingHighlights, type WritingItem } from "@/lib/content";
import { getPublishedPostsMeta, isDraftPost } from "@/lib/mdx";
import { PenSquare } from "lucide-react";
import type { Metadata } from "next";

const WRITING_HREF_ALIASES: Record<string, string> = {
  "/writing/barra_factor_model_article": "/writing/barra-factor-model",
};

function canonicalizeWritingHref(href: string): string {
  const normalizedHref = href.trim().replace(/\/+$/, "") || "/";
  return WRITING_HREF_ALIASES[normalizedHref] ?? normalizedHref;
}

export const metadata: Metadata = {
  title: "Writing | Jeffrey Emanuel",
  description: "Essays, research notes, and deep dives on AI architecture, market mechanics, and software engineering.",
  alternates: {
    canonical: "/writing",
  },
};

function dateValue(value: string | undefined) {
  const time = value ? new Date(value).getTime() : Number.NaN;
  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
}

export default function WritingPage() {
  const allPosts = getPublishedPostsMeta();

  // Convert MDX posts to WritingItem format
  const mdxItems: WritingItem[] = allPosts.map((post) => ({
    title: post.title as string,
    href: canonicalizeWritingHref(`/writing/${post.slug}`),
    source: (post.source as "YTO" | "FMD" | "GitHub") || "Blog",
    category: (post.category as string) || "Essay",
    blurb: post.excerpt as string,
    date: post.date as string,
    featured: post.featured as boolean | undefined,
    gradient: post.gradient as string | undefined,
    draft: isDraftPost(post),
  }));

  // Merge writingHighlights with MDX posts, giving precedence to manual writingHighlights for metadata
  const itemsByHref = new Map<string, WritingItem>();

  // Add all MDX posts first
  mdxItems.forEach((item) => {
    itemsByHref.set(item.href, item);
  });

  // Then merge/override with writingHighlights
  writingHighlights.forEach((item) => {
    const canonicalHref = canonicalizeWritingHref(item.href);
    const normalizedItem: WritingItem = {
      ...item,
      href: canonicalHref,
      draft: item.draft || false,
    };

    // If we already have this href, merge it (manual highlights win)
    const existing = itemsByHref.get(canonicalHref);
    if (existing) {
      itemsByHref.set(canonicalHref, { ...existing, ...normalizedItem });
    } else {
      itemsByHref.set(canonicalHref, normalizedItem);
    }
  });

  const mergedItems = Array.from(itemsByHref.values()).filter((item) => !item.draft);

  // Get featured items
  const featured = mergedItems.filter((item) => item.featured)
    .sort((a, b) => dateValue(b.date) - dateValue(a.date));
  
  const featuredHrefs = new Set(featured.map((f) => f.href));

  // Get archive items (non-featured)
  const archive = mergedItems
    .filter((item) => !featuredHrefs.has(item.href))
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  // Data eyebrow: "31 essays · 2024–2026" (year range only from items with real dates)
  const years = mergedItems.flatMap((item) => {
    if (!item.date) return [];
    const year = new Date(item.date).getUTCFullYear();
    return Number.isFinite(year) ? [year] : [];
  });
  const essayCount = mergedItems.length;
  const yearRange =
    years.length > 0
      ? (() => {
          const min = Math.min(...years);
          const max = Math.max(...years);
          return min === max ? `${min}` : `${min}–${max}`;
        })()
      : "";
  const eyebrow = `${essayCount} ${essayCount === 1 ? "essay" : "essays"}${yearRange ? ` · ${yearRange}` : ""}`;

  return (
    <div>
      <SectionShell
        id="writing-main"
        iconNode={<PenSquare className="h-5 w-5" />}
        eyebrow={eyebrow}
        title="Essays, research notes, and deep dives"
        kicker="I write to think. This is a collection of my technical essays on AI architecture, market mechanics, and software engineering."
        headingLevel={1}
      >
        <WritingGrid featured={featured} archive={archive} />
      </SectionShell>
    </div>
  );
}
