import { MetadataRoute } from 'next';
import { getAllPostsMeta } from '@/lib/mdx';
import { navItems, getProjectSlugs } from '@/lib/content';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jeffreyemanuel.com';

  // Static pages from navItems
  // Prioritize home page higher
  const staticPages = navItems.map((item) => ({
    url: `${baseUrl}${item.href === '/' ? '' : item.href}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: item.href === '/' ? 1 : 0.8,
  }));

  // Blog posts
  const posts = getAllPostsMeta();
  const postPages = posts.map((post) => ({
    url: `${baseUrl}/writing/${post.slug}`,
    lastModified: new Date(post.date as string),
    changeFrequency: 'weekly' as const,
    priority: 0.6, // Blog posts are good but main pages are structural
  }));

  // Project detail pages
  const projectPages = getProjectSlugs().map((slug) => ({
    url: `${baseUrl}/projects/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...projectPages, ...postPages];
}
