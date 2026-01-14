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
  let activeFence: string | null = null;

  for (const line of lines) {
    // Track code blocks
    // Matches at least 3 backticks or tildes, capturing the fence sequence
    const fenceMatch = line.trim().match(/^(`{3,}|~{3,})/);
    if (fenceMatch) {
      const fence = fenceMatch[1];
      if (!activeFence) {
        // Start of code block
        activeFence = fence;
      } else if (activeFence && fence.startsWith(activeFence)) {
        // End of code block - standard markdown allows closing fence to be longer than opening
        // but it must be the same character sequence
        // We check if the closing fence starts with the opening fence string
        // (e.g. opening "```", closing "````" is valid)
        // However, standard markdown requires closing fence to be at least as long as opening.
        // Let's stick to a simpler check: if we are in a fence, and we see a fence of same char
        // that is at least as long, we close it.
        // But to keep it simple and robust for this use case:
        if (fence[0] === activeFence[0] && fence.length >= activeFence.length) {
             activeFence = null;
        }
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
