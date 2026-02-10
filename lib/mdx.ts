import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import { cache } from "react";

// Turbopack sometimes runs with process.cwd() at the monorepo root, and the
// compiled server chunks live inside .next/. Walk upward from both the module
// location and cwd until we find content/writing to keep SSG stable.
const moduleDir = path.dirname(fileURLToPath(import.meta.url));

function resolvePostsDirectory(): string | null {
  // 1. Try process.cwd() joined with content/writing (Standard Next.js)
  const cwdPath = path.join(process.cwd(), "content/writing");
  if (fs.existsSync(cwdPath)) return cwdPath;

  // 2. Fallback: Check relative to module location (useful for some monorepo/test setups)
  // Walk up a few levels just in case
  let cursor = moduleDir;
  for (let i = 0; i < 5; i++) {
    const candidate = path.resolve(cursor, "content/writing");
    if (fs.existsSync(candidate)) return candidate;
    
    const parent = path.resolve(cursor, "..");
    if (parent === cursor) break;
    cursor = parent;
  }
  
  return null;
}

const postsDirectory = resolvePostsDirectory();

export type Post = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  author?: string;
  category?: string;
  tags?: string[];
  coverImage?: string;
  source?: string;
  featured?: boolean;
  gradient?: string;
  [key: string]: unknown;
};

export function getPostSlugs() {
  if (!postsDirectory || !fs.existsSync(postsDirectory)) {
    return [];
  }
  return fs.readdirSync(postsDirectory).filter((file) => file.endsWith(".md"));
}

export const getPostBySlug = cache((slug: string) => {
  if (!postsDirectory) {
    throw new Error(`Post not found: ${slug} (Content directory missing)`);
  }

  // Sanitize slug to prevent path traversal attacks
  // Only allow alphanumeric, hyphens, and underscores
  const realSlug = slug.replace(/\.md$/, "");
  if (!/^[\w-]+$/.test(realSlug)) {
    throw new Error(`Invalid slug format: ${slug}`);
  }

  const fullPath = path.join(postsDirectory, `${realSlug}.md`);

  // Verify the resolved path is within the posts directory (defense in depth)
  const resolvedPath = path.resolve(fullPath);
  const resolvedPostsDir = path.resolve(postsDirectory);
  if (!resolvedPath.startsWith(resolvedPostsDir + path.sep)) {
    throw new Error(`Invalid slug: ${slug}`);
  }

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Post not found: ${slug}`);
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const parsedDate = data.date ? new Date(data.date) : null;
  // Use a fixed fallback date for deterministic builds/rendering if date is invalid
  const safeDate =
    parsedDate && !Number.isNaN(parsedDate.getTime())
      ? parsedDate.toISOString()
      : "1970-01-01T00:00:00.000Z";

  const items: Post = {
    ...data,
    slug: realSlug,
    title: data.title || realSlug.replace(/-/g, " "),
    date: safeDate,
    excerpt: data.excerpt || "",
    content: content,
  };

  return items;
});

export function getAllPosts() {
  const slugs = getPostSlugs();
  const posts: Post[] = [];

  for (const slug of slugs) {
    try {
      posts.push(getPostBySlug(slug));
    } catch (err) {
      // Skip malformed markdown/frontmatter instead of breaking the whole build
      console.warn(`[content] Skipping ${slug}: ${(err as Error).message}`);
    }
  }

  // sort posts by date in descending order (newest first)
  return posts.sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

/**
 * Get all posts with metadata only (no content body).
 * Optimized for listing pages to reduce memory usage and payload size.
 */
export function getAllPostsMeta() {
  if (!postsDirectory) return [];
  
  const slugs = getPostSlugs();
  const posts: Omit<Post, "content">[] = [];

  for (const slug of slugs) {
    try {
      const realSlug = slug.replace(/\.md$/, "");
      const fullPath = path.join(postsDirectory, slug);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);
      
      const parsedDate = data.date ? new Date(data.date) : null;
      const safeDate =
        parsedDate && !Number.isNaN(parsedDate.getTime())
          ? parsedDate.toISOString()
          : "1970-01-01T00:00:00.000Z";

      posts.push({
        ...data,
        slug: realSlug,
        title: data.title || realSlug.replace(/-/g, " "),
        date: safeDate,
        excerpt: data.excerpt || "",
      } as Omit<Post, "content">);
    } catch (err) {
      console.warn(`[content] Skipping ${slug} meta: ${(err as Error).message}`);
    }
  }

  return posts.sort((a, b) => String(b.date).localeCompare(String(a.date)));
}
