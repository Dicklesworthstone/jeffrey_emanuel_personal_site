"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import ProjectCard from "@/components/project-card";
import type { Project } from "@/lib/content";
import { cn } from "@/lib/utils";

interface BentoGridProps {
  projects: Project[];
  className?: string;
}

// Stagger container for scroll-triggered animations
const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// Individual item animation variants
const itemVariants = {
  hidden: {
    opacity: 0,
    y: 24,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.21, 0.47, 0.32, 0.98],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

// Reduced motion variants (instant, no animation)
const reducedMotionVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function BentoGrid({ projects, className }: BentoGridProps) {
  const prefersReducedMotion = useReducedMotion();

  const variants = prefersReducedMotion ? reducedMotionVariants : itemVariants;

  return (
    <motion.div
      layout
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "grid grid-cols-1 gap-5 md:gap-6 lg:gap-8 md:grid-cols-3 auto-rows-[minmax(180px,auto)] grid-flow-dense",
        className
      )}
      role="list"
    >
      <AnimatePresence mode="popLayout">
        {projects.map((project) => (
          <motion.div
            layout={!prefersReducedMotion}
            key={project.name}
            variants={variants}
            initial="hidden"
            exit="exit"
            className={cn(
              "relative",
              project.size === "large" && "md:col-span-2 md:row-span-2",
              project.size === "wide" && "md:col-span-2",
              project.size === "tall" && "md:row-span-2"
            )}
            role="listitem"
          >
            <ProjectCard project={project} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
