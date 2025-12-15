"use client";

import { useEffect, useRef, useState } from "react";

interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Hook to detect when an element enters the viewport
 * More performant than Framer Motion's whileInView for many elements
 *
 * Note: Starts with isIntersecting=true to prevent flash of invisible content
 * during SSR/hydration. The observer will correct this if element is not visible.
 */
export function useIntersectionObserver({
  threshold = 0.1,
  rootMargin = "0px",
  triggerOnce = true,
}: UseIntersectionObserverOptions = {}) {
  const ref = useRef<HTMLElement>(null);
  // Start true to prevent flash of invisible content during hydration
  const [isIntersecting, setIsIntersecting] = useState(true);
  const hasTriggeredRef = useRef(false);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // If triggerOnce and already triggered, keep showing as intersecting
    if (triggerOnce && hasTriggeredRef.current) {
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isNowIntersecting = entry.isIntersecting;

        // Only update state after initial check or if becoming visible
        if (hasInitializedRef.current || isNowIntersecting) {
          setIsIntersecting(isNowIntersecting);
        }
        hasInitializedRef.current = true;

        if (isNowIntersecting && triggerOnce) {
          hasTriggeredRef.current = true;
          // Disconnect observer after first trigger to save resources
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isIntersecting };
}
