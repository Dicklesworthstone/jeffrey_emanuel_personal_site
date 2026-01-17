"use client";

import { useEffect, useRef, useState } from "react";

interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  initialIsIntersecting?: boolean;
}

/**
 * Hook to detect when an element enters the viewport
 * More performant than Framer Motion's whileInView for many elements
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLElement>({
  threshold = 0.1,
  rootMargin = "0px",
  triggerOnce = true,
  initialIsIntersecting = false,
}: UseIntersectionObserverOptions = {}) {
  const ref = useRef<T | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(initialIsIntersecting);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // If triggerOnce and already triggered, keep showing as intersecting
    if (triggerOnce && hasTriggeredRef.current) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      // Fallback for older browsers: assume visible to avoid hiding content
      const timeoutId = setTimeout(() => {
        setIsIntersecting(true);
        hasTriggeredRef.current = true;
      }, 0);
      return () => clearTimeout(timeoutId);
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
