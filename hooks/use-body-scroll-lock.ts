import { useLayoutEffect, useEffect } from "react";

// Use useLayoutEffect in browser to prevent flicker, useEffect on server to avoid warnings
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

let lockCount = 0;
let originalStyle: { overflow: string; paddingRight: string } | null = null;

/**
 * Hook to lock body scroll when a component is mounted or active.
 * Handles setting overflow to hidden and cleaning up on unmount/deactivation.
 * Also compensates for scrollbar width to prevent layout shift.
 */
export function useBodyScrollLock(isLocked: boolean) {
  useIsomorphicLayoutEffect(() => {
    if (!isLocked) return undefined;
    if (typeof window === "undefined") return undefined;

    if (lockCount === 0) {
      // Measure scrollbar width
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      // Store original styles
      originalStyle = {
        overflow: document.body.style.overflow,
        paddingRight: document.body.style.paddingRight,
      };

      // Apply styles
      document.body.style.overflow = "hidden";
      // Add padding to body to replace scrollbar
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      // Set global CSS variable for other fixed elements (like header) to use
      document.documentElement.style.setProperty("--scrollbar-width", `${scrollbarWidth}px`);
    }

    lockCount += 1;

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0 && originalStyle) {
        // Restore styles
        document.body.style.overflow = originalStyle.overflow;
        document.body.style.paddingRight = originalStyle.paddingRight;
        originalStyle = null;
        document.documentElement.style.removeProperty("--scrollbar-width");
      }
    };
  }, [isLocked]);
}
