"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { type ReactNode, Children, useState, useRef, useEffect, useCallback } from "react";

interface AnimatedGridProps {
  children: ReactNode;
  className?: string;
  /** Delay between each item animating in */
  staggerDelay?: number;
  /** Initial delay before animations start */
  initialDelay?: number;
  /** Show scroll progress dots on mobile for horizontal-scroll containers */
  scrollIndicator?: boolean;
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
  scrollIndicator = false,
}: AnimatedGridProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion ? reducedMotionVariants : itemVariants;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [atEnd, setAtEnd] = useState(false);
  const childCount = Children.count(children);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) {
      setScrollProgress(0);
      setAtEnd(true);
      return;
    }
    const progress = el.scrollLeft / maxScroll;
    setScrollProgress(progress);
    setAtEnd(progress > 0.95);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!scrollIndicator || !el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Initial scroll position sync on mount
    handleScroll();
    return () => el.removeEventListener("scroll", handleScroll);
  }, [scrollIndicator, handleScroll]);

  // Calculate active dot index
  const activeDot = Math.min(
    Math.round(scrollProgress * (childCount - 1)),
    childCount - 1
  );

  return (
    <div className="relative">
      <motion.div
        ref={scrollRef}
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

      {/* Right-edge fade hint for mobile horizontal scroll */}
      {scrollIndicator && (
        <div
          className={cn(
            "pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#020617] to-transparent md:hidden transition-opacity duration-300",
            atEnd ? "opacity-0" : "opacity-100"
          )}
          aria-hidden="true"
        />
      )}

      {/* Scroll progress dots for mobile */}
      {scrollIndicator && childCount > 1 && (
        <div className="mt-4 flex justify-center gap-1.5 md:hidden" aria-hidden="true">
          {Array.from({ length: childCount }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-200",
                i === activeDot
                  ? "w-4 bg-sky-400"
                  : "w-1.5 bg-slate-700"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

