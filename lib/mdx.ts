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

  const bases = [moduleDir, process.cwd()];
  for (const base of bases) {
    let cursor = base;
    for (let i = 0; i < 6; i++) {
      const candidate = path.resolve(cursor, "content/writing");
      if (fs.existsSync(candidate)) return candidate;
      cursor = path.resolve(cursor, "..");
    }
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
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = path.join(postsDirectory, `${realSlug}.md`);
  
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Post not found: ${slug}`);
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const parsedDate = data.date ? new Date(data.date) : null;
  const safeDate =
    parsedDate && !Number.isNaN(parsedDate.getTime())
      ? parsedDate.toISOString()
      : new Date().toISOString();

  const items: Post = {
    slug: realSlug,
    title: data.title || realSlug.replace(/-/g, " "),
    date: safeDate,
    excerpt: data.excerpt || "",
    content: content,
    ...data,
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

  // sort posts by date in descending order
  return posts.sort((post1, post2) => {
    const t1 = new Date(post1.date).getTime();
    const t2 = new Date(post2.date).getTime();
    if (Number.isNaN(t1)) return 1;
    if (Number.isNaN(t2)) return -1;
    return t2 - t1;
  });
}
