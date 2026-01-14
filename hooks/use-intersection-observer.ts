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
export function useIntersectionObserver<T extends HTMLElement = HTMLElement>({
  threshold = 0.1,
  rootMargin = "0px",
  triggerOnce = true,
}: UseIntersectionObserverOptions = {}) {
  const ref = useRef<T | null>(null);
  // Start true to prevent flash of invisible content during hydration
  const [isIntersecting, setIsIntersecting] = useState(true);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // If triggerOnce and already triggered, keep showing as intersecting
    if (triggerOnce && hasTriggeredRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isNowIntersecting = entry.isIntersecting;

        // If triggerOnce and we intersect, lock it and disconnect
        if (triggerOnce && isNowIntersecting) {
          setIsIntersecting(true);
          hasTriggeredRef.current = true;
          observer.disconnect();
          return;
        }

        // Otherwise update standard state
        setIsIntersecting(isNowIntersecting);
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
