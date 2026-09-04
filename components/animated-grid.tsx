"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { type CSSProperties, type ReactNode, Children, useState, useRef, useEffect, useCallback } from "react";

/**
 * Post-hydration in-view flag for CSS-driven entrances (the `[data-reveal]`
 * rules in app/globals.css). Renders a plain div: no motion values, no state,
 * no re-render — the attribute is written straight to the DOM once the
 * IntersectionObserver reports, so the server HTML and first paint are the
 * settled markup. States: (none) → "pending" (mounted, out of view, offset
 * applied) → "in" (entered view once; observer disconnected).
 * `observeParent` watches the parent instead of the div itself, so SectionShell
 * keeps its original trigger geometry (10 % of the padded <section>).
 */
export function RevealOnView({
  children,
  className,
  style,
  observeParent = false,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  observeParent?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.dataset.reveal = "in"; // no observer support (and jsdom): render settled
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.reveal = "in";
          observer.disconnect();
        } else {
          el.dataset.reveal = "pending";
        }
      },
      // Any visible pixel counts (framer's whileInView default). A fraction
      // threshold can never be met by a section taller than ten viewports
      // (/projects is ~26,000px), which left it "pending" forever.
      { threshold: 0 }
    );
    observer.observe(observeParent && el.parentElement ? el.parentElement : el);
    return () => observer.disconnect();
  }, [observeParent]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

interface AnimatedGridProps {
  children: ReactNode;
  className?: string;
  /** Delay between each item animating in */
  staggerDelay?: number;
  /** Initial delay before animations start */
  initialDelay?: number;
  /** Show scroll progress dots on mobile for horizontal-scroll containers */
  scrollIndicator?: boolean;
  /** Accessible name for the keyboard-focusable scroll container (scrollIndicator only) */
  ariaLabel?: string;
  /**
   * Stagger the children in when the grid scrolls into view. Reserve this for
   * the first section of a page; later sections should render settled
   * (`animateIn={false}`) so every section does not enter the same way.
   */
  animateIn?: boolean;
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
  ariaLabel = "Scrollable cards",
  animateIn = true,
}: AnimatedGridProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animateIn && !prefersReducedMotion;
  const variants = shouldAnimate ? itemVariants : reducedMotionVariants;
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
        initial={shouldAnimate ? "hidden" : false}
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className={cn(
          className,
          scrollIndicator &&
            "rounded-xl focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500"
        )}
        // Horizontal-scroll containers must be keyboard reachable to scroll
        {...(scrollIndicator
          ? { tabIndex: 0, role: "group", "aria-label": ariaLabel }
          : {})}
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
            "pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-950 to-transparent md:hidden transition-opacity duration-300",
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
                "h-1.5 rounded-full transition-[width,background-color] duration-200",
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

