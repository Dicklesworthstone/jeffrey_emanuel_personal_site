import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/mdx';
import { navItems } from '@/lib/content';

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
  const posts = getAllPosts();
  const postPages = posts.map((post) => ({
    url: `${baseUrl}/writing/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'weekly' as const,
    priority: 0.6, // Blog posts are good but main pages are structural
  }));

  return [...staticPages, ...postPages];
}
