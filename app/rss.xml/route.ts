import { Feed } from "feed";
import { writingHighlights, siteConfig } from "@/lib/content";
import { getPublishedPosts } from "@/lib/mdx";

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

/** Parse a date; returns null (item is skipped) instead of inventing an epoch date. */
function parseKnownDate(value: string | Date | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Convert the markdown body into simple, safe HTML for `content:encoded`.
 * This is deliberately minimal (headings, paragraphs, fenced code) rather than
 * a full renderer: it keeps the whole article text readable in feed readers
 * without shipping the remark/rehype pipeline into a route handler. Inline
 * markdown is left as-is (readers show it as text).
 */
function markdownToFeedHtml(markdown: string): string {
  const blocks: string[] = [];
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  let paragraph: string[] = [];
  let fence: string | null = null;
  let codeLines: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push(`<p>${escapeHtml(paragraph.join("\n")).replace(/\n/g, "<br />")}</p>`);
    paragraph = [];
  };

  for (const line of lines) {
    const fenceMatch = line.trim().match(/^(`{3,}|~{3,})/);
    if (fence) {
      if (fenceMatch && fenceMatch[1][0] === fence[0] && fenceMatch[1].length >= fence.length) {
        blocks.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        fence = null;
        codeLines = [];
      } else {
        codeLines.push(line);
      }
      continue;
    }

    if (fenceMatch) {
      flushParagraph();
      fence = fenceMatch[1];
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*?)(?:\s+#+)?$/);
    if (headingMatch) {
      flushParagraph();
      // The post title is the feed item's title; body headings sit under it.
      const level = Math.min(6, Math.max(2, headingMatch[1].length + 1));
      blocks.push(`<h${level}>${escapeHtml(headingMatch[2].trim())}</h${level}>`);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      continue;
    }

    paragraph.push(line);
  }

  if (fence && codeLines.length > 0) {
    blocks.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
  }
  flushParagraph();

  return blocks.join("\n");
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

  type FeedEntry = {
    title: string;
    id: string;
    link: string;
    description: string;
    content: string;
    author: typeof defaultAuthor;
    date: Date;
    category: Array<{ name: string }>;
  };

  const itemsByLink = new Map<string, FeedEntry>();

  const upsertItem = (item: FeedEntry) => {
    const existing = itemsByLink.get(item.link);
    if (!existing) {
      itemsByLink.set(item.link, item);
      return;
    }
    itemsByLink.set(item.link, {
      ...existing,
      ...item,
      // Keep the full article body if one side only has a blurb.
      content: item.content.length >= existing.content.length ? item.content : existing.content,
      date: item.date.getTime() > existing.date.getTime() ? item.date : existing.date,
    });
  };

  getPublishedPosts().forEach((post) => {
    const date = parseKnownDate(post.date);
    if (!date) {
      console.warn(`[rss] skipping ${post.slug}: missing or invalid date`);
      return;
    }
    const path = normalizeWritingPath(`/writing/${String(post.slug)}`);
    const link = toAbsoluteUrl(path, origin);
    const excerpt = String(post.excerpt || "");
    const body = markdownToFeedHtml(post.content || "");
    upsertItem({
      title: String(post.title),
      id: link,
      link,
      description: excerpt,
      content: body || excerpt,
      author: defaultAuthor,
      date,
      category: [
        { name: (post.category as string) || "Essay" },
        { name: (post.source as string) || "Blog" },
      ],
    });
  });

  for (const item of writingHighlights) {
    if (item.draft) continue;
    const date = parseKnownDate(item.date);
    if (!date) {
      console.warn(`[rss] skipping ${item.href}: missing or invalid date`);
      continue;
    }

    if (item.href.startsWith("http")) {
      upsertItem({
        title: item.title,
        id: item.href,
        link: item.href,
        description: item.blurb,
        content: item.blurb,
        author: defaultAuthor,
        date,
        category: [{ name: item.category || "" }, { name: item.source || "" }],
      });
      continue;
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
        date,
        category: [{ name: item.category || "Essay" }, { name: item.source || "Blog" }],
      });
    }
  }

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
