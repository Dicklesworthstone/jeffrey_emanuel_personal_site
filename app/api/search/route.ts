import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/mdx";

export async function GET() {
  const posts = getAllPosts();
  
  // Create a lightweight index for search
  const searchIndex = posts.map((post) => ({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    category: post.category,
    tags: post.tags || [],
    // We include content for full-text search, but stripped of markdown if possible would be better.
    // For now, raw content is fine for a small blog.
    content: post.content, 
  }));

  return NextResponse.json(searchIndex);
}
