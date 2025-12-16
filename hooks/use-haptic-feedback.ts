"use client";

import { useCallback } from "react";

/**
 * Hook for adding haptic feedback to touch interactions on mobile devices
 * Provides native app-like tactile responses
 */
export function useHapticFeedback() {
  const vibrate = useCallback((pattern: number | number[]) => {
    if (typeof window === "undefined") return;
    if (!("vibrate" in navigator)) return;

    // Check if user prefers reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    try {
      navigator.vibrate(pattern);
    } catch {
      // Silently fail if vibration not supported
    }
  }, []);

  const lightTap = useCallback(() => vibrate(5), [vibrate]);
  const mediumTap = useCallback(() => vibrate(10), [vibrate]);
  const heavyTap = useCallback(() => vibrate(15), [vibrate]);
  const doubleTap = useCallback(() => vibrate([5, 50, 5]), [vibrate]);
  const success = useCallback(() => vibrate([10, 50, 10]), [vibrate]);
  const error = useCallback(() => vibrate([15, 100, 15, 100, 15]), [vibrate]);

  return {
    vibrate,
    lightTap,
    mediumTap,
    heavyTap,
    doubleTap,
    success,
    error,
  };
}
