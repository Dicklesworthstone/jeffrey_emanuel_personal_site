"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Filter, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import DemoCard from "@/components/demo-card";
import { liveDemos, type DemoCategory } from "@/lib/content";

// Category filter options
const categoryFilters: { value: DemoCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "ai-tools", label: "AI Tools" },
  { value: "developer-tools", label: "Dev Tools" },
  { value: "education", label: "Education" },
];

interface DemoShowcaseProps {
  /** Show filter controls */
  showFilters?: boolean;
  /** Maximum demos to show (0 = all) */
  maxItems?: number;
  /** Custom heading */
  heading?: string;
  /** Custom subheading */
  subheading?: string;
  /** Additional CSS classes */
  className?: string;
}

export function DemoShowcase({
  showFilters = false,
  maxItems = 0,
  heading = "Try It Yourself",
  subheading = "Explore live demos of my projects",
  className,
}: DemoShowcaseProps) {
  const prefersReducedMotion = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState<DemoCategory | "all">("all");

  // Filter demos based on category
  const filteredDemos = useMemo(() => {
    let items = [...liveDemos];

    if (activeCategory !== "all") {
      items = items.filter((d) => d.category === activeCategory);
    }

    if (maxItems > 0) {
      items = items.slice(0, maxItems);
    }

    return items;
  }, [activeCategory, maxItems]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0 : 0.4 },
    },
  };

  // Render filter buttons
  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-slate-500" aria-hidden="true" />
        {categoryFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveCategory(filter.value)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              activeCategory === filter.value
                ? "bg-violet-500/20 text-violet-300"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300"
            )}
            aria-pressed={activeCategory === filter.value}
          >
            {filter.label}
          </button>
        ))}
      </div>
    );
  };

  // Empty state
  if (filteredDemos.length === 0) {
    return (
      <div className={cn("py-12 text-center", className)}>
        <Play className="mx-auto h-12 w-12 text-slate-600" />
        <p className="mt-4 text-slate-500">No demos available for this category.</p>
        {activeCategory !== "all" && (
          <button
            onClick={() => setActiveCategory("all")}
            className="mt-2 text-sm text-violet-400 hover:text-violet-300"
          >
            View all demos
          </button>
        )}
      </div>
    );
  }

  return (
    <section className={cn("", className)} aria-label="Live demos">
      {/* Header */}
      {(heading || subheading) && (
        <div className="mb-8 text-center">
          {heading && (
            <h2 className="text-2xl font-bold text-slate-100 md:text-3xl">
              {heading}
            </h2>
          )}
          {subheading && (
            <p className="mt-2 text-slate-400">{subheading}</p>
          )}
        </div>
      )}

      {renderFilters()}

      {/* Demo grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence mode="popLayout">
          {filteredDemos.map((demo, index) => (
            <motion.div
              key={demo.id}
              variants={itemVariants}
              layout={!prefersReducedMotion}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <DemoCard
                demo={demo}
                featured={index === 0 && filteredDemos.length > 1}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}

export default DemoShowcase;
