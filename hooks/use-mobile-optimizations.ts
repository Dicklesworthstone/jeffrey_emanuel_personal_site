"use client";

import { useEffect } from "react";

/**
 * Mobile-specific optimizations and enhancements
 * Handles iOS-specific quirks, touch interactions, and performance
 */
export function useMobileOptimizations() {
  useEffect(() => {
    // Only run on mobile devices
    if (typeof window === "undefined") return;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) return;

    // NOTE: Removed preventBounce touchmove handler as it was blocking scroll
    // CSS overscroll-behavior-y: none on body already handles iOS bounce

    // Add orientation change listener for better UX
    const handleOrientationChange = () => {
      // Trigger resize to recalculate viewport and fix any layout issues
      // Small delay to ensure orientation change is complete
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 100);
    };

    window.addEventListener("orientationchange", handleOrientationChange);

    // Cleanup
    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []);
}

/**
 * Utility function to detect if user is on mobile device.
 * This is NOT a React hook - it's a simple detection function.
 */
export function checkIsMobile(): boolean {
  if (typeof window === "undefined") return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

/**
 * Alias for checkIsMobile for convenience
 */
export const isMobile = checkIsMobile;
