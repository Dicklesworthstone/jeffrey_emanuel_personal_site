"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect if user prefers reduced motion.
 * Returns true if the user has requested reduced motion in their system settings.
 *
 * This should be used to:
 * - Disable or simplify animations
 * - Remove parallax effects
 * - Stop auto-playing videos
 * - Reduce visual complexity
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Set initial value
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Browser API detection requires effect
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}

export default useReducedMotion;
