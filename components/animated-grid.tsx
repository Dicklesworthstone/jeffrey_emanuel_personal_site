"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { type ReactNode, Children, useState, useRef, useEffect } from "react";

interface AnimatedGridProps {
  children: ReactNode;
  className?: string;
  /** Delay between each item animating in */
  staggerDelay?: number;
  /** Initial delay before animations start */
  initialDelay?: number;
}

// Stagger container for scroll-triggered animations
const containerVariants = {
  hidden: { opacity: 1 },
  visible: (custom: { staggerDelay: number; initialDelay: number }) => ({
    opacity: 1,
    transition: {
      staggerChildren: custom.staggerDelay,
      delayChildren: custom.initialDelay,
    },
  }),
};

// Individual item animation variants
const itemVariants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.21, 0.47, 0.32, 0.98],
    },
  },
};

// Reduced motion variants (instant, no animation)
const reducedMotionVariants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
};

/**
 * A wrapper component that adds scroll-triggered stagger animations to its children.
 * Each direct child will animate in sequence when the grid scrolls into view.
 */
export default function AnimatedGrid({
  children,
  className,
  staggerDelay = 0.1,
  initialDelay = 0.05,
}: AnimatedGridProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion ? reducedMotionVariants : itemVariants;

  return (
    <motion.div
      variants={containerVariants}
      custom={{ staggerDelay, initialDelay }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className={cn(className)}
    >
      {Children.map(children, (child, index) => (
        <motion.div key={index} variants={variants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

/**
 * A wrapper for individual animated items within an AnimatedGrid.
 * Use this when you need more control over the item wrapper.
 */
export function AnimatedGridItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion ? reducedMotionVariants : itemVariants;

  return (
    <motion.div variants={variants} className={cn(className)}>
      {children}
    </motion.div>
  );
}

/**
 * Skeleton placeholder for lazy-loaded content sections.
 * Shows animated placeholder cards until real content loads.
 */
function LazySectionSkeleton({
  minHeight = "300px",
  cardCount = 3,
}: {
  minHeight?: string;
  cardCount?: number;
}) {
  return (
    <div
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      style={{ minHeight }}
      aria-hidden="true"
    >
      {Array.from({ length: cardCount }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-slate-800/80 bg-slate-950/80 p-6 shadow-lg"
        >
          <div className="h-3 w-20 rounded bg-slate-800/80" />
          <div className="mt-3 h-5 w-3/4 rounded bg-slate-800/60" />
          <div className="mt-4 space-y-2">
            <div className="h-4 w-full rounded bg-slate-800/40" />
            <div className="h-4 w-5/6 rounded bg-slate-800/40" />
          </div>
          <div className="mt-6 flex gap-2">
            <div className="h-6 w-16 rounded-md bg-slate-800/50" />
            <div className="h-6 w-20 rounded-md bg-slate-800/50" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton placeholder for timeline sections.
 */
export function TimelineSkeleton({ itemCount = 4 }: { itemCount?: number }) {
  return (
    <div className="relative" aria-hidden="true">
      <div className="absolute left-6 top-4 bottom-4 hidden w-px bg-gradient-to-b from-slate-800/50 via-slate-800/20 to-transparent md:block" />
      <div className="space-y-8 pl-2 md:space-y-12 md:pl-0">
        {Array.from({ length: itemCount }).map((_, i) => (
          <div key={i} className="relative md:pl-20 animate-pulse">
            <div className="hidden md:flex absolute left-[8.5px] top-1 h-8 w-8 items-center justify-center rounded-xl border border-slate-800/50 bg-slate-950/50">
              <div className="h-2 w-2 rounded-full bg-slate-800" />
            </div>
            <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-6 md:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="h-5 w-48 rounded bg-slate-800/60" />
                  <div className="h-4 w-32 rounded bg-slate-800/50" />
                </div>
                <div className="h-6 w-24 rounded-full bg-slate-800/40" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-4 w-full rounded bg-slate-800/40" />
                <div className="h-4 w-4/5 rounded bg-slate-800/40" />
              </div>
              <div className="mt-6 h-3 w-20 rounded bg-slate-800/30" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface LazySectionProps {
  children: ReactNode;
  /** Minimum height to reserve for the section before loading */
  minHeight?: string;
  /** Number of skeleton cards to show while loading */
  skeletonCards?: number;
  /** Custom skeleton component */
  skeleton?: ReactNode;
  /** Root margin for intersection observer (how early to trigger) */
  rootMargin?: string;
  /** Class name for the wrapper */
  className?: string;
}

/**
 * Wrapper component that defers rendering of children until they enter the viewport.
 * This reduces initial DOM size and defers JavaScript execution for below-fold content.
 *
 * For SSR content, set `ssrVisible={true}` to render content during server render
 * while still deferring client-side hydration for non-visible content.
 *
 * Usage:
 * ```tsx
 * <LazySection minHeight="400px" skeletonCards={6}>
 *   <ExpensiveComponent />
 * </LazySection>
 * ```
 */
export function LazySection({
  children,
  minHeight = "300px",
  skeletonCards = 3,
  skeleton,
  rootMargin = "200px", // Start loading 200px before entering viewport
  className,
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Start true to prevent hydration mismatch - content shows immediately
  // Observer will manage future interactions if needed
  const [isVisible, setIsVisible] = useState(true);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const parseRootMargin = (margin: string) => {
      const value = margin.trim().split(/\s+/)[0] ?? "0px";
      if (value.endsWith("px")) {
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed : 0;
      }
      if (value.endsWith("%")) {
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) ? (parsed / 100) * window.innerHeight : 0;
      }
      const parsed = parseFloat(value);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    // Check if element is already in viewport on mount
    const rect = element.getBoundingClientRect();
    const marginPx = parseRootMargin(rootMargin);
    const isInViewport =
      rect.top < window.innerHeight + marginPx && rect.bottom > -marginPx;

    if (isInViewport) {
      hasTriggeredRef.current = true;
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    // If not in viewport, set to not visible and wait for intersection
    if (!hasTriggeredRef.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Initial visibility detection based on viewport position
      setIsVisible(false);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggeredRef.current) {
          setIsVisible(true);
          hasTriggeredRef.current = true;
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={cn(className)} style={!isVisible ? { minHeight } : undefined}>
      {isVisible ? (
        children
      ) : (
        skeleton || <LazySectionSkeleton minHeight={minHeight} cardCount={skeletonCards} />
      )}
    </div>
  );
}
