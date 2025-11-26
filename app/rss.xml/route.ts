import { Feed } from "feed";
import { writingHighlights, siteConfig } from "@/lib/content";

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

  // Sort articles by date (newest first) with validation
  const sortedArticles = [...writingHighlights]
    .filter((article) => {
      // Validate date format
      const date = new Date(article.date);
      return !isNaN(date.getTime());
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });

  sortedArticles.forEach((article) => {
    const articleUrl = `${siteUrl}${article.href}`;

    feed.addItem({
      title: article.title,
      id: articleUrl,
      link: articleUrl,
      description: article.blurb,
      content: article.blurb,
      author: [
        {
          name: siteConfig.name,
          email: siteConfig.email,
          link: siteUrl,
        },
      ],
      date: new Date(article.date),
      category: [
        { name: article.category },
        { name: article.source },
      ],
    });
  });

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
