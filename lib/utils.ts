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

/**
 * Cross-browser scroll metrics for mobile/desktop.
 * Some engines report scroll state on body, others on documentElement/scroller.
 */
export function getScrollMetrics() {
  if (typeof window === "undefined") {
    return {
      scrollTop: 0,
      maxScroll: 0,
      progress: 0,
    };
  }

  const docEl = document.documentElement;
  const body = document.body;
  const scroller = document.scrollingElement as HTMLElement | null;

  const scrollTop = Math.max(
    window.scrollY || 0,
    scroller?.scrollTop || 0,
    docEl.scrollTop || 0,
    body.scrollTop || 0
  );

  const scrollHeight = Math.max(
    scroller?.scrollHeight || 0,
    docEl.scrollHeight || 0,
    body.scrollHeight || 0
  );

  const clientHeight = Math.max(
    window.innerHeight || 0,
    scroller?.clientHeight || 0,
    docEl.clientHeight || 0
  );

  const maxScroll = Math.max(scrollHeight - clientHeight, 0);
  const progress = maxScroll > 0 ? Math.min(scrollTop / maxScroll, 1) : 0;

  return {
    scrollTop,
    maxScroll,
    progress,
  };
}
