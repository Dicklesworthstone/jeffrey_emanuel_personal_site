"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup, useReducedMotion } from "framer-motion";
import SectionShell from "@/components/section-shell";
import BentoGrid from "@/components/bento-grid";
import FlywheelVisualization from "@/components/flywheel-visualization";
import ErrorBoundary from "@/components/error-boundary";
import { projects } from "@/lib/content";
import { GitBranch, Layers, Zap, Beaker, Box, Workflow, Tag, X, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";

const filters = [
  { id: "all", label: "All Work", icon: Layers },
  { id: "product", label: "Products", icon: Box },
  { id: "research", label: "Research", icon: Beaker },
  { id: "oss", label: "Open Source", icon: GitBranch },
  { id: "rust-port", label: "Rust Ports", icon: Repeat },
  { id: "flywheel", label: "Flywheel", icon: Workflow },
] as const;

// Extract all unique tags and count occurrences
const tagCounts = projects.reduce<Record<string, number>>((acc, project) => {
  project.tags.forEach((tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
  });
  return acc;
}, {});

// Get tags that appear in 2+ projects, sorted by frequency
const popularTags = Object.entries(tagCounts)
  .filter(([, count]) => count >= 2)
  .sort((a, b) => b[1] - a[1])
  .map(([tag]) => tag);

export default function ProjectsPage() {
  const [activeFilter, setActiveFilter] = useState<typeof filters[number]["id"]>("all");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [mountKey, setMountKey] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  // Force re-animation on client-side navigation by incrementing key on mount
  // This is intentional to re-trigger AnimatePresence animations on navigation
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional one-time trigger on navigation
    setMountKey((k) => k + 1);
  }, []);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  const clearTags = () => {
    setSelectedTags(new Set());
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // First apply category filter
      let passesCategory = true;
      if (activeFilter !== "all") {
        if (activeFilter === "flywheel") {
          passesCategory = project.tags.includes("Flywheel");
        } else {
          passesCategory = project.kind === activeFilter;
        }
      }

      // Then apply tag filter (OR logic - matches if ANY selected tag is present)
      let passesTags = true;
      if (selectedTags.size > 0) {
        passesTags = project.tags.some((tag) => selectedTags.has(tag));
      }

      return passesCategory && passesTags;
    });
  }, [activeFilter, selectedTags]);

  const showFlywheel = activeFilter === "all" || activeFilter === "flywheel";

  return (
    <SectionShell
      id="projects"
      icon={Zap}
      eyebrow="The Constellation"
      title="A catalog of experiments and products"
      kicker="Explore the ecosystem of tools, protocols, and research papers I've built. Filter by category or browse the full grid."
      headingLevel={1}
    >
      {/* Filter Controls */}
      <LayoutGroup>
        <nav
          className="mb-4 sm:mb-6 flex flex-wrap justify-center gap-1.5 sm:gap-2"
          role="tablist"
          aria-label="Filter projects by category"
        >
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                role="tab"
                aria-selected={isActive}
                aria-controls="projects-grid"
                className={cn(
                  "relative flex items-center gap-1.5 sm:gap-2 rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                  isActive
                    ? "text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId={prefersReducedMotion ? undefined : "activeFilter"}
                    className="absolute inset-0 rounded-full bg-white/10 ring-1 ring-inset ring-white/20"
                    transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className="relative z-10 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="relative z-10">{filter.label}</span>
              </button>
            );
          })}
        </nav>
      </LayoutGroup>

      {/* Flywheel Visualization - only shown for "all" or "flywheel" filters */}
      <AnimatePresence mode="wait">
        {showFlywheel && (
          <motion.div
            key={`flywheel-${mountKey}`}
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: "easeInOut" }}
            className="mb-12 sm:mb-16 overflow-hidden"
          >
            <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-b from-violet-950/20 via-black/40 to-black/20 p-4 sm:p-6 md:p-8 lg:p-12 backdrop-blur-sm">
              <ErrorBoundary
                fallback={
                  <div className="flex min-h-[300px] items-center justify-center text-slate-400">
                    <p className="text-sm">Unable to load flywheel visualization</p>
                  </div>
                }
              >
                <FlywheelVisualization />
              </ErrorBoundary>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tag Filters - positioned below flywheel */}
      <div className="mb-8 sm:mb-12">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Tag className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Filter by tag
          </span>
          {selectedTags.size > 0 && (
            <button
              onClick={clearTags}
              className="ml-2 flex items-center gap-1 rounded-full bg-violet-500/20 px-2 py-0.5 text-xs font-medium text-violet-300 transition-colors hover:bg-violet-500/30"
              aria-label={`Clear ${selectedTags.size} selected tags`}
            >
              <X className="h-3 w-3" />
              Clear ({selectedTags.size})
            </button>
          )}
        </div>
        <div
          className="flex flex-wrap justify-center gap-1.5 sm:gap-2"
          role="group"
          aria-label="Filter projects by tags"
        >
          {popularTags.map((tag) => {
            const isSelected = selectedTags.has(tag);
            const count = tagCounts[tag];
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                aria-pressed={isSelected}
                className={cn(
                  "rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-medium transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                  isSelected
                    ? "bg-violet-500/30 text-violet-200 ring-1 ring-inset ring-violet-500/50"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-300"
                )}
              >
                {tag}
                <span className="ml-1 text-xs opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results count indicator */}
      {(selectedTags.size > 0 || activeFilter !== "all") && (
        <div className="mb-6 text-center">
          <p className="text-sm text-slate-400">
            Showing <span className="font-semibold text-white">{filteredProjects.length}</span>{" "}
            {filteredProjects.length === 1 ? "project" : "projects"}
            {selectedTags.size > 0 && (
              <span> matching {selectedTags.size === 1 ? "tag" : "tags"}</span>
            )}
          </p>
        </div>
      )}

      {/* The Grid - moves up immediately when flywheel is hidden */}
      <motion.div
        id="projects-grid"
        role="tabpanel"
        layout={!prefersReducedMotion}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: "easeInOut" }}
      >
        <ErrorBoundary
          fallback={
            <div className="flex min-h-[200px] items-center justify-center text-slate-400">
              <p className="text-sm">Unable to load projects grid</p>
            </div>
          }
        >
          <BentoGrid projects={filteredProjects} />
        </ErrorBoundary>
      </motion.div>

      <div className="mt-12 sm:mt-16 text-center">
        <p className="text-xs sm:text-sm text-slate-500">
          Looking for more? Check out my{" "}
          <a
            href="https://github.com/Dicklesworthstone"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-slate-700 underline-offset-4 transition-colors hover:text-slate-300 hover:decoration-slate-500"
          >
            GitHub profile
          </a>{" "}
          for the full archive of 90+ repos.
        </p>
      </div>
    </SectionShell>
  );
}