import SectionShell from "@/components/section-shell";
import WritingGrid from "@/components/writing-grid";
import { writingHighlights, type WritingItem } from "@/lib/content";
import { getAllPosts } from "@/lib/mdx";
import { PenSquare } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Writing | Jeffrey Emanuel",
  description: "Essays, research notes, and deep dives on AI architecture, market mechanics, and software engineering.",
  alternates: {
    canonical: "/writing",
  },
  openGraph: {
    title: "Writing | Jeffrey Emanuel",
    description: "Essays, research notes, and deep dives on AI architecture, market mechanics, and software engineering.",
    url: "https://jeffreyemanuel.com/writing",
  },
};

export default function WritingPage() {
  const allPosts = getAllPosts();

  // Convert MDX posts to WritingItem format
  const mdxItems: WritingItem[] = allPosts.map((post) => ({
    title: post.title,
    href: `/writing/${post.slug}`,
    source: (post.source as "YTO" | "FMD" | "GitHub") || "Blog",
    category: post.category || "Essay",
    blurb: post.excerpt,
    date: post.date,
    featured: post.featured as boolean | undefined,
    gradient: post.gradient as string | undefined,
  }));

  // Get featured items from manual highlights (curated)
  const featured = writingHighlights.filter((w) => w.featured);
  const featuredHrefs = new Set(featured.map((f) => f.href));

  // Get external archive items from highlights
  const externalArchive = writingHighlights.filter(
    (w) => !w.featured && w.href.startsWith("http")
  );

  // Combine MDX posts and external archive, filtering out duplicates already in featured
  const archive = [...mdxItems, ...externalArchive]
    .filter((item) => !featuredHrefs.has(item.href))
    .sort((a, b) => {
      // Handle potential invalid dates gracefully
      const t1 = new Date(a.date).getTime();
      const t2 = new Date(b.date).getTime();
      if (isNaN(t1)) return 1;
      if (isNaN(t2)) return -1;
      return t2 - t1;
    });

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