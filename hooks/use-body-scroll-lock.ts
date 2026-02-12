import { useLayoutEffect, useEffect } from "react";

// Use useLayoutEffect in browser to prevent flicker, useEffect on server to avoid warnings
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

let lockCount = 0;
let originalStyle:
  | {
      overflow: string;
      position: string;
      top: string;
      left: string;
      right: string;
      width: string;
      paddingRight: string;
      overscrollBehaviorY: string;
      overflowY: string;
    }
  | null = null;
let originalScrollY = 0;

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
      const bodyScrollY = window.scrollY;
      originalScrollY = bodyScrollY;

      // Store original styles
      originalStyle = {
        overflow: document.body.style.overflow,
        position: document.body.style.position,
        top: document.body.style.top,
        left: document.body.style.left,
        right: document.body.style.right,
        width: document.body.style.width,
        paddingRight: document.body.style.paddingRight,
        overscrollBehaviorY: document.body.style.overscrollBehaviorY,
        overflowY: document.body.style.overflowY,
      };

      // Prevent body scrolling while keeping the current position stable.
      // position: fixed with a stored top offset is the most reliable approach on iOS.
      document.body.style.overflow = "hidden";
      document.body.style.overflowY = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${bodyScrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      document.body.style.overscrollBehaviorY = "none";

      // Add padding to body to replace scrollbar.
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
        document.body.style.overflowY = originalStyle.overflowY;
        document.body.style.position = originalStyle.position;
        document.body.style.top = originalStyle.top;
        document.body.style.left = originalStyle.left;
        document.body.style.right = originalStyle.right;
        document.body.style.width = originalStyle.width;
        document.body.style.paddingRight = originalStyle.paddingRight;
        document.body.style.overscrollBehaviorY = originalStyle.overscrollBehaviorY;
        originalStyle = null;
        document.documentElement.style.removeProperty("--scrollbar-width");

        window.scrollTo(0, originalScrollY);
      }
    };
  }, [isLocked]);
}
