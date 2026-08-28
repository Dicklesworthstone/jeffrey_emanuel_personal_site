"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import ProjectCard from "@/components/project-card";
import type { Project } from "@/lib/content";
import { cn } from "@/lib/utils";

interface BentoGridProps {
  projects: Project[];
  className?: string;
}

/**
 * Card entrance is pure CSS (`@starting-style` + transition) on an inner
 * wrapper, so the grid is fully visible in the server HTML (no `opacity:0`
 * waiting on hydration) and framer only handles layout shifts and exits when
 * the filters change. Only the first few cards animate, with a capped stagger.
 */
const ANIMATED_ITEM_LIMIT = 12;
const MAX_STAGGER_SECONDS = 0.08;
const MAX_TOTAL_STAGGER_SECONDS = 0.6;

const ENTRANCE_CLASS =
  "h-full motion-safe:transition-[opacity,translate] motion-safe:duration-500 motion-safe:ease-out motion-safe:starting:opacity-0 motion-safe:starting:translate-y-6";

export default function BentoGrid({ projects, className }: BentoGridProps) {
  const prefersReducedMotion = useReducedMotion();
  const stagger = Math.min(MAX_STAGGER_SECONDS, MAX_TOTAL_STAGGER_SECONDS / Math.max(projects.length, 1));

  return (
    <motion.div
      layout
      className={cn(
        "grid grid-cols-1 gap-5 md:gap-6 lg:gap-8 md:grid-cols-3 auto-rows-[minmax(180px,auto)] grid-flow-dense",
        className
      )}
      role="list"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {projects.map((project, index) => {
          const animates = index < ANIMATED_ITEM_LIMIT;
          return (
            <motion.div
              layout={!prefersReducedMotion}
              key={project.name}
              exit={
                prefersReducedMotion
                  ? { opacity: 0, transition: { duration: 0 } }
                  : { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
              }
              className={cn(
                "relative",
                project.size === "large" && "md:col-span-2 md:row-span-2",
                project.size === "wide" && "md:col-span-2",
                project.size === "tall" && "md:row-span-2"
              )}
              role="listitem"
            >
              <div
                className={animates ? ENTRANCE_CLASS : "h-full"}
                style={animates ? { transitionDelay: `${(index * stagger).toFixed(3)}s` } : undefined}
              >
                <ProjectCard project={project} />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
