/**
 * Calculate estimated reading time for text content.
 *
 * Standard reading speeds:
 * - Average adult: 200-250 words per minute
 * - Technical content: 150-200 words per minute
 *
 * We use 200 wpm as a conservative estimate for mixed content.
 */

const WORDS_PER_MINUTE = 200;

interface ReadingTimeResult {
  /** Reading time in minutes (rounded) */
  minutes: number;
  /** Word count */
  words: number;
  /** Formatted string like "5 min read" */
  text: string;
}

/**
 * Calculate reading time from content string.
 * Strips markdown/HTML formatting before counting words.
 */
export function calculateReadingTime(content: string): ReadingTimeResult {
  // Strip markdown/HTML tags
  const plainText = content
    // Remove HTML tags
    .replace(/<[^>]*>/g, "")
    // Remove markdown images BEFORE links (images are ![alt](url), links are [text](url))
    // Handle one level of nested parentheses in URL: ( ... ( ... ) ... )
    .replace(/!\[([^\]]*)\]\((?:[^)(]+|\([^)(]*\))*\)/g, "")
    // Remove markdown links (keep link text)
    .replace(/\[([^\]]*)\]\((?:[^)(]+|\([^)(]*\))*\)/g, "$1")
    // Remove markdown formatting
    .replace(/[*_~#]/g, "")
    // Remove extra whitespace
    .replace(/\s+/g, " ")
    .trim();

  // Count words
  const words = plainText.split(/\s+/).filter((word) => word.length > 0).length;

  // Calculate minutes (minimum 1 minute)
  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));

  return {
    minutes,
    words,
    text: `${minutes} min read`,
  };
}

export default calculateReadingTime;
