import { NextResponse } from "next/server";
import { getPublishedPosts } from "@/lib/mdx";

export const dynamic = "force-static";

// The index is built once at build time from content/writing; it only changes
// on deploy, so let browsers and the CDN hold it instead of re-downloading
// ~170 KB every time the command palette opens.
const SEARCH_INDEX_CACHE_CONTROL =
  "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400";

export async function GET() {
  const posts = getPublishedPosts();
  
  // Create a lightweight index for search
  const searchIndex = posts.map((post) => {
    // Strip markdown syntax for smaller payload and better text matching
    const plainText = post.content
      .replace(/`{3}[\s\S]*?`{3}/g, "") // Remove code blocks entirely (usually not what users search for)
      .replace(/!\[[^\]]*\]\((?:[^)(]+|\([^)(]*\))*\)/g, "") // Remove images
      .replace(/\[([^\]]+)\]\(.*?\)/g, "$1") // Keep link text, remove URL
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/#{1,6}\s/g, "") // Remove headings markers
      .replace(/(\*\*|__)(.*?)\1/g, "$2") // Remove bold
      .replace(/(\*|_)(.*?)\1/g, "$2") // Remove italic
      .replace(/`(.+?)`/g, "$1") // Remove inline code markers
      .replace(/&[a-z0-9]+;/gi, " ") // Remove HTML entities like &nbsp;
      .replace(/[^\w\s\u00C0-\u017F,.?$%]/gi, " ") // Preserve $, %, and common punctuation
      .replace(/\s+/g, " ") // Collapse multiple spaces
      .trim()
      .slice(0, 8000); // Increased cap slightly for better semantic matching if used

    return {
      title: post.title || "",
      slug: post.slug,
      excerpt: post.excerpt || "",
      category: post.category || "Essay",
      tags: post.tags || [],
      content: plainText || "",
    };
  });

  return NextResponse.json(searchIndex, {
    headers: { "Cache-Control": SEARCH_INDEX_CACHE_CONTROL },
  });
}
