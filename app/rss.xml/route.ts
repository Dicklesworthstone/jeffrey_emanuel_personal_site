import { Feed } from "feed";
import { writingHighlights, siteConfig } from "@/lib/content";
import { getAllPosts } from "@/lib/mdx";

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jeffreyemanuel.com";

  const feed = new Feed({
    title: siteConfig.title,
    description: siteConfig.description,
    id: siteUrl,
    link: siteUrl,
    language: "en",
    image: `${siteUrl}/icon-512.png`,
    favicon: `${siteUrl}/icon-192.png`,
    copyright: `All rights reserved ${new Date().getFullYear()}, ${siteConfig.name}`,
    author: {
      name: siteConfig.name,
      email: siteConfig.email,
      link: siteUrl,
    },
  });

  // Helper to normalize date
  const getDate = (d: string | Date) => new Date(d);

  // 1. Get all dynamic MDX posts
  const mdxItems = getAllPosts().map((post) => ({
    title: post.title,
    id: `${siteUrl}/writing/${post.slug}`,
    link: `${siteUrl}/writing/${post.slug}`,
    description: post.excerpt,
    content: post.excerpt,
    author: [
      {
        name: siteConfig.name,
        email: siteConfig.email,
        link: siteUrl,
      },
    ],
    date: getDate(post.date),
    category: [
      { name: post.category || "Essay" },
      { name: (post.source as string) || "Blog" },
    ],
  }));

  // 2. Get external curated links from highlights
  const externalItems = writingHighlights
    .filter((item) => item.href.startsWith("http"))
    .map((post) => ({
      title: post.title,
      id: post.href,
      link: post.href,
      description: post.blurb,
      content: post.blurb,
      author: [
        {
          name: siteConfig.name,
          email: siteConfig.email,
          link: siteUrl,
        },
      ],
      date: getDate(post.date),
      category: [{ name: post.category || "" }, { name: post.source || "" }],
    }));

  // 3. Combine and sort
  const allItems = [...mdxItems, ...externalItems].sort((a, b) => {
    const t1 = a.date.getTime();
    const t2 = b.date.getTime();
    // Handle invalid dates (treat as old)
    const v1 = Number.isNaN(t1) ? 0 : t1;
    const v2 = Number.isNaN(t2) ? 0 : t2;
    return v2 - v1;
  });

  // 4. Add to feed
  allItems.forEach((item) => feed.addItem(item));

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
