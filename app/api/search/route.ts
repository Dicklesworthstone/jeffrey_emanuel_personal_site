import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/mdx";

export const dynamic = "force-static";

export async function GET() {
  const posts = getAllPosts();
  
  // Create a lightweight index for search
  const searchIndex = posts.map((post) => {
    // Strip markdown syntax for smaller payload and better text matching
    const plainText = post.content
      .replace(/!\[.*?\]\(.*?\)/g, "") // Remove images
      .replace(/\[([^\]]+)\]\(.*?\)/g, "$1") // Keep link text, remove URL
      .replace(/#{1,6}\s/g, "") // Remove headings
      .replace(/(\*\*|__)(.*?)\1/g, "$2") // Remove bold
      .replace(/(\*|_)(.*?)\1/g, "$2") // Remove italic
      .replace(/`{3}[\s\S]*?`{3}/g, "") // Remove code blocks
      .replace(/`(.+?)`/g, "$1") // Remove inline code
      .replace(/\n+/g, " ") // Collapse whitespace
      .slice(0, 5000); // Cap at 5000 chars per post to prevent massive payloads

    return {
      title: post.title || "",
      slug: post.slug,
      excerpt: post.excerpt || "",
      category: post.category || "Essay",
      tags: post.tags || [],
      content: plainText || "",
    };
  });

  return NextResponse.json(searchIndex);
}
