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
 */
export function useIntersectionObserver({
  threshold = 0.1,
  rootMargin = "0px",
  triggerOnce = true,
}: UseIntersectionObserverOptions = {}) {
  const ref = useRef<HTMLElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // If triggerOnce and already triggered, don't observe
    if (triggerOnce && hasTriggeredRef.current) {
      setIsIntersecting(true); // Keep showing as intersecting
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isNowIntersecting = entry.isIntersecting;
        setIsIntersecting(isNowIntersecting);

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
  }, [threshold, rootMargin, triggerOnce]); // Removed hasTriggered from dependencies

  return { ref, isIntersecting };
}
