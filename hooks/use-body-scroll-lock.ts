import { useLayoutEffect, useEffect } from "react";

// Use useLayoutEffect in browser to prevent flicker, useEffect on server to avoid warnings
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

let lockCount = 0;
let originalStyle:
  | {
      htmlOverflow: string;
      htmlPaddingRight: string;
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

    const body = document.body;
    const documentElement = document.documentElement;

    if (lockCount === 0) {
      // Measure scrollbar width
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const bodyScrollY = window.scrollY;
      originalScrollY = bodyScrollY;

      // Store original styles
      originalStyle = {
        htmlOverflow: documentElement.style.overflow,
        htmlPaddingRight: documentElement.style.paddingRight,
        overflow: body.style.overflow,
        position: body.style.position,
        top: body.style.top,
        left: body.style.left,
        right: body.style.right,
        width: body.style.width,
        paddingRight: body.style.paddingRight,
        overscrollBehaviorY: body.style.overscrollBehaviorY,
        overflowY: body.style.overflowY,
      };

      // Prevent body scrolling while keeping the current position stable.
      // position: fixed with a stored top offset is the most reliable approach on iOS.
      body.style.overflow = "hidden";
      body.style.overflowY = "hidden";
      body.style.position = "fixed";
      body.style.top = `-${bodyScrollY}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      body.style.overscrollBehaviorY = "none";

      documentElement.style.overflow = "hidden";

      // Add padding to body to replace scrollbar.
      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
        documentElement.style.paddingRight = `${scrollbarWidth}px`;
      }

      // Set global CSS variable for other fixed elements (like header) to use
      document.documentElement.style.setProperty("--scrollbar-width", `${scrollbarWidth}px`);
    }

    lockCount += 1;

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0 && originalStyle) {
        // Restore styles
        const body = document.body;
        const documentElement = document.documentElement;
        const scrollY = originalScrollY;

        body.style.overflow = originalStyle.overflow;
        body.style.overflowY = originalStyle.overflowY;
        body.style.position = originalStyle.position;
        body.style.top = originalStyle.top;
        body.style.left = originalStyle.left;
        body.style.right = originalStyle.right;
        body.style.width = originalStyle.width;
        body.style.paddingRight = originalStyle.paddingRight;
        body.style.overscrollBehaviorY = originalStyle.overscrollBehaviorY;

        documentElement.style.overflow = originalStyle.htmlOverflow;
        documentElement.style.paddingRight = originalStyle.htmlPaddingRight;
        originalStyle = null;
        document.documentElement.style.removeProperty("--scrollbar-width");

        requestAnimationFrame(() => {
          window.scrollTo(0, scrollY);
        });
      }
    };
  }, [isLocked]);
}
