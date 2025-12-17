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

    // Check if element is already in viewport on mount
    const rect = element.getBoundingClientRect();
    const isInViewport = rect.top < window.innerHeight + 200;

    if (isInViewport) {
      hasTriggeredRef.current = true;
      return;
    }

    // If not in viewport, set to not visible and wait for intersection
    if (!hasTriggeredRef.current) {
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
