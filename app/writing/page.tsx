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

  // Combine MDX items and writing highlights to find all featured items
  // Manual highlights take precedence for duplicates
  const allItems = [...mdxItems, ...writingHighlights.filter((item) => !item.draft)];
  
  // Use a map to handle duplicates by href
  const itemsByHref = new Map<string, WritingItem>();
  allItems.forEach(item => {
    const canonicalHref = canonicalizeWritingHref(item.href);
    const normalizedItem: WritingItem = { ...item, href: canonicalHref };

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
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const featuredHrefs = new Set(featured.map((f) => f.href));

  // Get archive items (non-featured)
  const archive = mergedItems
    .filter((item) => !featuredHrefs.has(item.href))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <SectionShell
        id="writing-main"
        iconNode={<PenSquare className="h-5 w-5" />}
        eyebrow="The Library"
        title="Essays, research notes, and deep dives"
        kicker="I write to think. This is a collection of my technical essays on AI architecture, market mechanics, and software engineering. No fluff, just density."
        headingLevel={1}
      >
        <WritingGrid featured={featured} archive={archive} />
      </SectionShell>
    </div>
  );
}
