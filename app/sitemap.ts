import { MetadataRoute } from 'next';
import { getPublishedPostsMeta } from '@/lib/mdx';
import { navItems, getProjectSlugs, writingHighlights } from '@/lib/content';

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

function parseDateOrNow(value: unknown): Date {
  if (typeof value !== "string") return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSiteOrigin();

  const staticPaths = new Set(navItems.map((item) => item.href));
  staticPaths.add("/nvidia-story");

  const staticPages = Array.from(staticPaths).map((href) => ({
    url: toAbsoluteUrl(href, origin),
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: href === '/' ? 1 : 0.8,
  }));

  const writingPageMap = new Map<string, Date>();
  const upsertWritingPage = (pathname: string, dateValue: unknown) => {
    const normalizedPath = normalizeWritingPath(pathname);
    const nextDate = parseDateOrNow(dateValue);
    const existingDate = writingPageMap.get(normalizedPath);
    if (!existingDate || nextDate.getTime() > existingDate.getTime()) {
      writingPageMap.set(normalizedPath, nextDate);
    }
  };

  getPublishedPostsMeta().forEach((post) => {
    upsertWritingPage(`/writing/${String(post.slug)}`, post.date);
  });

  writingHighlights.filter((item) => !item.draft).forEach((item) => {
    if (item.href.startsWith("/writing/")) {
      upsertWritingPage(item.href, item.date);
    }
  });

  const writingPages = Array.from(writingPageMap.entries()).map(([pathname, lastModified]) => ({
    url: toAbsoluteUrl(pathname, origin),
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const projectPages = getProjectSlugs().map((slug) => ({
    url: toAbsoluteUrl(`/projects/${slug}`, origin),
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...projectPages, ...writingPages];
}
