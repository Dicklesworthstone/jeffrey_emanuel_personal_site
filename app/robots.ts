import { MetadataRoute } from 'next';

const DEFAULT_SITE_ORIGIN = "https://jeffreyemanuel.com";

function getSiteOrigin(): string {
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!rawSiteUrl) return DEFAULT_SITE_ORIGIN;

  try {
    return new URL(rawSiteUrl).origin;
  } catch {
    return DEFAULT_SITE_ORIGIN;
  }
}

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteOrigin();
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: new URL("/sitemap.xml", `${origin}/`).toString(),
  };
}
