/**
 * Star count formatting utilities for consistent display across the site.
 *
 * Used by:
 * - TL;DR page tool cards
 * - Hero stats
 * - Any component displaying GitHub star counts
 */

/**
 * Formats a number into a human-readable star count.
 *
 * @param count - The raw star count number
 * @returns Formatted string (e.g., "1.4K", "891", "2.3M")
 *
 * @example
 * formatStarCount(1400) // "1.4K"
 * formatStarCount(891)  // "891"
 * formatStarCount(2300000) // "2.3M"
 */
export function formatStarCount(count: number): string {
  // Handle edge cases
  if (!Number.isFinite(count)) {
    return String(count);
  }

  // Millions
  if (count >= 1_000_000) {
    const formatted = (count / 1_000_000).toFixed(1);
    return formatted.replace(/\.0$/, "") + "M";
  }

  // Thousands
  if (count >= 1_000) {
    const formatted = (count / 1_000).toFixed(1);
    return formatted.replace(/\.0$/, "") + "K";
  }

  // Small numbers - return as-is
  return count.toString();
}

/**
 * Returns the full number for accessibility (aria-label use).
 * Uses locale formatting for proper thousand separators.
 *
 * @param count - The raw star count number
 * @returns Localized full number (e.g., "1,400")
 *
 * @example
 * formatStarCountFull(1400) // "1,400"
 * formatStarCountFull(2300000) // "2,300,000"
 */
export function formatStarCountFull(count: number): string {
  if (!Number.isFinite(count)) {
    return String(count);
  }
  return count.toLocaleString("en-US");
}

/**
 * Parses a formatted star count string back to a number.
 * Useful for sorting or calculations.
 *
 * @param formatted - Formatted string like "1.4K" or "2.3M"
 * @returns The numeric value, or 0 if parsing fails
 *
 * @example
 * parseStarCount("1.4K") // 1400
 * parseStarCount("2.3M") // 2300000
 * parseStarCount("invalid") // 0
 */
export function parseStarCount(formatted: string): number {
  const trimmed = formatted.trim();
  const normalized = trimmed
    .toLowerCase()
    .replace(/\bstars?\b/i, "")
    .replace(/\+/g, "")
    .trim();

  let result: number;

  if (normalized.endsWith("m")) {
    result = parseFloat(normalized.slice(0, -1)) * 1_000_000;
  } else if (normalized.endsWith("k")) {
    result = parseFloat(normalized.slice(0, -1)) * 1_000;
  } else {
    // Remove commas and parse
    result = parseFloat(normalized.replace(/,/g, ""));
  }

  // Return 0 for NaN/invalid values (safe default for star counts)
  return Number.isNaN(result) ? 0 : result;
}
