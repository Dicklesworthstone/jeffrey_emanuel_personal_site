import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string (YYYY-MM-DD) to "Month Day, Year"
 * safely handling timezones to avoid hydration mismatch.
 * Treats the input date as UTC.
 */
export function formatDate(dateString: string): string {
  if (!dateString) return "";

  // Create date object from string (interpreted as UTC if ISO 8601 YYYY-MM-DD)
  // We append T00:00:00Z to ensure it's treated as UTC midnight
  const date = new Date(dateString.includes("T") ? dateString : `${dateString}T00:00:00Z`);

  // Handle invalid date strings
  if (Number.isNaN(date.getTime())) {
    return dateString; // Return original string as fallback
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC", // Force UTC display
  }).format(date);
}
