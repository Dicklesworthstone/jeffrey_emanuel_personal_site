import { useEffect, useRef } from "react";

/**
 * Hook to lock body scroll when a component is mounted or active.
 * Handles setting overflow to hidden and cleaning up on unmount/deactivation.
 * Also compensates for scrollbar width to prevent layout shift.
 */
export function useBodyScrollLock(isLocked: boolean) {
  const originalStyle = useRef<{ overflow: string; paddingRight: string } | null>(null);

  useEffect(() => {
    if (isLocked) {
      // Measure scrollbar width
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      // Store original styles only if we haven't already (to handle rapid toggles safely)
      if (!originalStyle.current) {
        originalStyle.current = {
          overflow: document.body.style.overflow,
          paddingRight: document.body.style.paddingRight,
        };
      }

      // Apply styles
      document.body.style.overflow = "hidden";
      // Add padding to body to replace scrollbar
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      
      // Set global CSS variable for other fixed elements (like header) to use
      document.documentElement.style.setProperty("--scrollbar-width", `${scrollbarWidth}px`);

      return () => {
        // Restore styles
        if (originalStyle.current) {
          document.body.style.overflow = originalStyle.current.overflow;
          document.body.style.paddingRight = originalStyle.current.paddingRight;
          originalStyle.current = null;
        }
        document.documentElement.style.removeProperty("--scrollbar-width");
      };
    }
    return undefined;
  }, [isLocked]);
}
