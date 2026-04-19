import { Feed } from "feed";
import { writingHighlights, siteConfig } from "@/lib/content";
import { getAllPostsMeta } from "@/lib/mdx";

const DEFAULT_SITE_ORIGIN = "https://jeffreyemanuel.com";

const WRITING_SLUG_ALIASES: Record<string, string> = {
  barra_factor_model_article: "barra-factor-model",
};

function getSiteOrigin(): string {
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!rawSiteUrl) return DEFAULT_SITE_ORIGIN;

  try {
    return new URL(rawSiteUrl).origin;
  } catch {
    return DEFAULT_SITE_ORIGIN;
  }
}

function toAbsoluteUrl(pathname: string, origin: string): string {
  return new URL(pathname, `${origin}/`).toString();
}

function normalizeWritingSlug(slug: string): string {
  const normalizedSlug = slug.trim().replace(/\.md$/i, "");
  return WRITING_SLUG_ALIASES[normalizedSlug] ?? normalizedSlug;
}

function normalizeWritingPath(pathname: string): string {
  if (!pathname.startsWith("/writing/")) return pathname;
  const slug = pathname.slice("/writing/".length);
  return `/writing/${normalizeWritingSlug(slug)}`;
}

function parseDateOrEpoch(value: string | Date): Date {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date(0);
  }
  return parsed;
}

export async function GET() {
  const origin = getSiteOrigin();

  const feed = new Feed({
    title: siteConfig.title,
    description: siteConfig.description,
    id: origin,
    link: origin,
    language: "en",
    image: toAbsoluteUrl("/icon-512.png", origin),
    favicon: toAbsoluteUrl("/icon-192.png", origin),
    copyright: `All rights reserved ${new Date().getFullYear()}, ${siteConfig.name}`,
    author: {
      name: siteConfig.name,
      email: siteConfig.email,
      link: origin,
    },
  });

  const defaultAuthor = [
    {
      name: siteConfig.name,
      email: siteConfig.email,
      link: origin,
    },
  ];

  const itemsByLink = new Map<
    string,
    {
      title: string;
      id: string;
      link: string;
      description: string;
      content: string;
      author: typeof defaultAuthor;
      date: Date;
      category: Array<{ name: string }>;
    }
  >();

  const upsertItem = (item: {
    title: string;
    id: string;
    link: string;
    description: string;
    content: string;
    author: typeof defaultAuthor;
    date: Date;
    category: Array<{ name: string }>;
  }) => {
    const existing = itemsByLink.get(item.link);
    if (!existing) {
      itemsByLink.set(item.link, item);
      return;
    }
    itemsByLink.set(item.link, {
      ...existing,
      ...item,
      date: item.date.getTime() > existing.date.getTime() ? item.date : existing.date,
    });
  };

  getAllPostsMeta().forEach((post) => {
    const path = normalizeWritingPath(`/writing/${String(post.slug)}`);
    const link = toAbsoluteUrl(path, origin);
    upsertItem({
      title: String(post.title),
      id: link,
      link,
      description: String(post.excerpt || ""),
      content: String(post.excerpt || ""),
      author: defaultAuthor,
      date: parseDateOrEpoch(String(post.date)),
      category: [
        { name: (post.category as string) || "Essay" },
        { name: (post.source as string) || "Blog" },
      ],
    });
  });

  writingHighlights.filter((item) => !item.draft).forEach((item) => {
    if (item.href.startsWith("http")) {
      upsertItem({
        title: item.title,
        id: item.href,
        link: item.href,
        description: item.blurb,
        content: item.blurb,
        author: defaultAuthor,
        date: parseDateOrEpoch(item.date),
        category: [{ name: item.category || "" }, { name: item.source || "" }],
      });
      return;
    }

    if (item.href.startsWith("/writing/")) {
      const path = normalizeWritingPath(item.href);
      const link = toAbsoluteUrl(path, origin);
      upsertItem({
        title: item.title,
        id: link,
        link,
        description: item.blurb,
        content: item.blurb,
        author: defaultAuthor,
        date: parseDateOrEpoch(item.date),
        category: [{ name: item.category || "Essay" }, { name: item.source || "Blog" }],
      });
    }
  });

  const allItems = Array.from(itemsByLink.values()).sort((a, b) => {
    const t1 = a.date.getTime();
    const t2 = b.date.getTime();
    return t2 - t1;
  });

  allItems.forEach((item) => feed.addItem(item));

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
