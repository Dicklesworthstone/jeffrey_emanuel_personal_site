"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

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
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <motion.div key={index} variants={variants}>
            {child}
          </motion.div>
        ))
      ) : (
        <motion.div variants={variants}>{children}</motion.div>
      )}
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
