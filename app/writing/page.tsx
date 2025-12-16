import SectionShell from "@/components/section-shell";
import WritingGrid from "@/components/writing-grid";
import { writingHighlights, type WritingItem } from "@/lib/content";
import { getAllPosts } from "@/lib/mdx";
import { PenSquare } from "lucide-react";

export default function WritingPage() {
  const allPosts = getAllPosts();

  // Convert MDX posts to WritingItem format
  const mdxItems: WritingItem[] = allPosts.map((post) => ({
    title: post.title,
    href: `/writing/${post.slug}`,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    source: (post.source as any) || "Blog",
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
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div>
      <SectionShell
        id="writing-main"
        iconNode={<PenSquare className="h-5 w-5" />}
        eyebrow="The Library"
        title="Essays, research notes, and deep dives"
        kicker="I write to think. This is a collection of my technical essays on AI architecture, market mechanics, and software engineering. No fluff, just density."
      >
        <WritingGrid featured={featured} archive={archive} />
      </SectionShell>
    </div>
  );
}