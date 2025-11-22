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

    // Prevent accidental zooms on double-tap (iOS) - only on non-input elements
    let lastTouchEnd = 0;
    const preventDoubleTapZoom = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      // Allow double-tap on inputs/textareas for text selection
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener("touchend", preventDoubleTapZoom, {
      passive: false,
    });

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
      document.removeEventListener("touchend", preventDoubleTapZoom);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []);
}

/**
 * Utility function to detect if user is on mobile device
 * Note: Not a React hook despite the name - kept for API consistency
 * with mobile optimization hooks
 */
export function useIsMobile() {
  if (typeof window === "undefined") return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

/**
 * Alternative export without 'use' prefix for clarity
 */
export const isMobile = useIsMobile;
