/**
 * Extract headings from markdown content for table of contents.
 */

import GithubSlugger from "github-slugger";

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

/**
 * Normalize heading text to match markdown rendering output.
 * Strips inline markdown and HTML so slugging matches rehype-slug.
 */
function normalizeHeadingText(text: string): string {
  return text
    // Remove HTML tags
    .replace(/<[^>]*>/g, "")
    // Remove markdown images but keep alt text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    // Replace markdown links with link text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    // Replace inline code with its content
    .replace(/`([^`]+)`/g, "$1")
    // Strip emphasis/strikethrough markers
    .replace(/[*_~]/g, "")
    // Collapse whitespace
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract headings (h2, h3) from markdown content.
 * Returns an array of heading objects with id, text, and level.
 */
export function extractHeadings(content: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const slugger = new GithubSlugger();

  // Match markdown headings (## and ###)
  // Avoid matching headings inside code blocks
  const lines = content.split("\n");
  let activeFence: "```" | "~~~" | null = null;

  for (const line of lines) {
    // Track code blocks
    const fenceMatch = line.trim().match(/^(```|~~~)/);
    if (fenceMatch) {
      const fence = fenceMatch[1] as "```" | "~~~";
      if (!activeFence) {
        activeFence = fence;
      } else if (activeFence === fence) {
        activeFence = null;
      }
      continue;
    }

    if (activeFence) continue;

    // Match h2 (##) and h3 (###) headings, allowing for optional trailing hashes
    const h2Match = line.match(/^##\s+(.*?)(?:\s+#+)?$/);
    const h3Match = line.match(/^###\s+(.*?)(?:\s+#+)?$/);

    if (h2Match) {
      const rawText = h2Match[1].trim();
      const text = normalizeHeadingText(rawText);
      if (!text) continue;
      const slug = slugger.slug(text);

      headings.push({
        id: slug,
        text,
        level: 2,
      });
    } else if (h3Match) {
      const rawText = h3Match[1].trim();
      const text = normalizeHeadingText(rawText);
      if (!text) continue;
      const slug = slugger.slug(text);

      headings.push({
        id: slug,
        text,
        level: 3,
      });
    }
  }

  return headings;
}

export default extractHeadings;
