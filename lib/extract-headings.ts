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

/** Deepest heading level that is listed in the table of contents. */
const MAX_TOC_LEVEL = 3;

/**
 * Extract headings from markdown content for the table of contents.
 *
 * Body `#` headings are rendered as `<h2>` (the page owns the single `<h1>`),
 * so they are reported as level 2 here; `##` is level 2 and `###` level 3.
 * Every heading level is run through the slugger (even ones deeper than the
 * TOC shows) so duplicate-text suffixes (`foo-1`) stay in sync with rehype-slug,
 * which slugs all headings in document order.
 */
export function extractHeadings(content: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const slugger = new GithubSlugger();

  // Normalize line endings first: several posts are CRLF, and `.` never
  // matches `\r`, so `^##\s+(.*?)$` would silently miss every heading.
  const lines = content.replace(/\r\n?/g, "\n").split("\n");
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

    // Match ATX headings (# through ######), allowing for optional trailing hashes
    const headingMatch = line.match(/^(#{1,6})\s+(.*?)(?:\s+#+)?$/);
    if (!headingMatch) continue;

    const rawText = headingMatch[2].trim();
    const text = normalizeHeadingText(rawText);
    if (!text) continue;

    // Always advance the slugger so ids match rehype-slug's document-wide numbering.
    const slug = slugger.slug(text);
    const markdownLevel = headingMatch[1].length;
    if (markdownLevel > MAX_TOC_LEVEL) continue;

    headings.push({
      id: slug,
      text,
      // Body h1s are rendered as h2 by the article renderer.
      level: Math.max(2, markdownLevel),
    });
  }

  return headings;
}

export default extractHeadings;
