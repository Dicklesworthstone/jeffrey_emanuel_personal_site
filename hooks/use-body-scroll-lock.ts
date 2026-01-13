import { useEffect } from "react";

/**
 * Hook to lock body scroll when a component is mounted or active.
 * Handles setting overflow to hidden and cleaning up on unmount/deactivation.
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (isLocked) {
      // Prevent scrolling
      document.body.style.overflow = "hidden";
      
      // Cleanup function to restore scrolling
      return () => {
        document.body.style.overflow = "";
      };
    }
    // If not locked, ensure scroll is enabled (handles toggle off)
    document.body.style.overflow = "";
    return undefined;
  }, [isLocked]);
}
