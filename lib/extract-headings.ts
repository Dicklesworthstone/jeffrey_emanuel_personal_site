/**
 * Extract headings from markdown content for table of contents.
 */

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

/**
 * Generate a slug from heading text.
 * Matches how most markdown processors generate IDs.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/--+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Extract headings (h2, h3) from markdown content.
 * Returns an array of heading objects with id, text, and level.
 */
export function extractHeadings(content: string): TocHeading[] {
  const headings: TocHeading[] = [];

  // Match markdown headings (## and ###)
  // Avoid matching headings inside code blocks
  const lines = content.split("\n");
  let inCodeBlock = false;

  for (const line of lines) {
    // Track code blocks
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) continue;

    // Match h2 (##) and h3 (###) headings
    const h2Match = line.match(/^##\s+(.+)$/);
    const h3Match = line.match(/^###\s+(.+)$/);

    if (h2Match) {
      const text = h2Match[1].trim();
      headings.push({
        id: slugify(text),
        text,
        level: 2,
      });
    } else if (h3Match) {
      const text = h3Match[1].trim();
      headings.push({
        id: slugify(text),
        text,
        level: 3,
      });
    }
  }

  return headings;
}

export default extractHeadings;
