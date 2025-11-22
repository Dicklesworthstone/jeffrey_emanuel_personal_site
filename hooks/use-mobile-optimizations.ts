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

    // Prevent iOS elastic bounce on body (but allow on scrollable elements)
    const preventBounce = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      // Allow scroll on elements with overflow
      if (
        target.scrollHeight > target.clientHeight ||
        target.closest(".overflow-scroll") ||
        target.closest(".overflow-auto")
      ) {
        return;
      }
      // Prevent bounce on body (single-touch scroll past edge)
      // Note: CSS overscroll-behavior-y: none on body handles this too
      // This is a fallback for older iOS versions
      e.preventDefault();
    };

    document.body.addEventListener("touchmove", preventBounce, {
      passive: false,
    });

    // Improve tap responsiveness on iOS
    const touchHandler = () => {};
    const elements = document.querySelectorAll("a, button, [role='button']");
    elements.forEach((el) => {
      el.addEventListener("touchstart", touchHandler, { passive: true });
    });

    // Prevent accidental zooms on double-tap (iOS)
    let lastTouchEnd = 0;
    const preventDoubleTapZoom = (e: TouchEvent) => {
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
      document.body.removeEventListener("touchmove", preventBounce);
      document.removeEventListener("touchend", preventDoubleTapZoom);
      window.removeEventListener("orientationchange", handleOrientationChange);
      // Remove touch listeners from all elements
      elements.forEach((el) => {
        el.removeEventListener("touchstart", touchHandler);
      });
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
