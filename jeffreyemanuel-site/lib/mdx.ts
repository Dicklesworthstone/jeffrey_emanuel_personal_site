import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

// Turbopack sometimes runs with process.cwd() at the monorepo root, and the
// compiled server chunks live inside .next/. Walk upward from both the module
// location and cwd until we find content/writing to keep SSG stable.
const moduleDir = path.dirname(fileURLToPath(import.meta.url));

function resolvePostsDirectory() {
  const bases = [moduleDir, process.cwd()];
  for (const base of bases) {
    let cursor = base;
    for (let i = 0; i < 6; i++) {
      const candidate = path.resolve(cursor, "content/writing");
      if (fs.existsSync(candidate)) return candidate;
      cursor = path.resolve(cursor, "..");
    }
  }
  throw new Error("Cannot locate content/writing directory");
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
  [key: string]: any;
};

export function getPostSlugs() {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  return fs.readdirSync(postsDirectory).filter((file) => file.endsWith(".md"));
}

export function getPostBySlug(slug: string, fields: string[] = []) {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = path.join(postsDirectory, `${realSlug}.md`);
  
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Post not found: ${slug}`);
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const items: Post = {
    slug: realSlug,
    title: data.title || realSlug.replace(/-/g, " "),
    date: data.date || new Date().toISOString(),
    excerpt: data.excerpt || "",
    content: content,
    ...data,
  };

  return items;
}

export function getAllPosts(fields: string[] = []) {
  const slugs = getPostSlugs();
  const posts: Post[] = [];

  for (const slug of slugs) {
    try {
      posts.push(getPostBySlug(slug, fields));
    } catch (err) {
      // Skip malformed markdown/frontmatter instead of breaking the whole build
      console.warn(`[content] Skipping ${slug}: ${(err as Error).message}`);
    }
  }

  // sort posts by date in descending order
  return posts.sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
}
