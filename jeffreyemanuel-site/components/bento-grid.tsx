"use client";

import { motion, AnimatePresence } from "framer-motion";
import ProjectCard from "@/components/project-card";
import type { Project } from "@/lib/content";
import { cn } from "@/lib/utils";

interface BentoGridProps {
  projects: Project[];
  className?: string;
}

export default function BentoGrid({ projects, className }: BentoGridProps) {
  return (
    <motion.div
      layout
      className={cn(
        "grid grid-cols-1 gap-4 md:grid-cols-3 auto-rows-[minmax(180px,auto)]",
        className
      )}
    >
      <AnimatePresence mode="popLayout">
        {projects.map((project) => (
          <motion.div
            layout
            key={project.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "relative",
              project.size === "large" && "md:col-span-2 md:row-span-2",
              project.size === "wide" && "md:col-span-2",
              project.size === "tall" && "md:row-span-2"
            )}
          >
            <ProjectCard project={project} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
