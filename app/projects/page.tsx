"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import SectionShell from "@/components/section-shell";
import BentoGrid from "@/components/bento-grid";
import FlywheelVisualization from "@/components/flywheel-visualization";
import ErrorBoundary from "@/components/error-boundary";
import { projects } from "@/lib/content";
import { GitBranch, Layers, Zap, Beaker, Box, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";

const filters = [
  { id: "all", label: "All Work", icon: Layers },
  { id: "product", label: "Products", icon: Box },
  { id: "research", label: "Research", icon: Beaker },
  { id: "oss", label: "Open Source", icon: GitBranch },
  { id: "flywheel", label: "Flywheel", icon: Workflow },
] as const;

export default function ProjectsPage() {
  const [activeFilter, setActiveFilter] = useState<typeof filters[number]["id"]>("all");

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (activeFilter === "all") return true;
      if (activeFilter === "flywheel") {
        return project.tags.includes("Flywheel");
      }
      return project.kind === activeFilter;
    });
  }, [activeFilter]);

  const showFlywheel = activeFilter === "all" || activeFilter === "flywheel";

  return (
    <SectionShell
      id="projects"
      icon={Zap}
      eyebrow="The Constellation"
      title="A catalog of experiments and products"
      kicker="Explore the ecosystem of tools, protocols, and research papers I've built. Filter by category or browse the full grid."
    >
      {/* Filter Controls */}
      <LayoutGroup>
        <nav
          className="mb-8 sm:mb-12 flex flex-wrap justify-center gap-1.5 sm:gap-2"
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
                    layoutId="activeFilter"
                    className="absolute inset-0 rounded-full bg-white/10 ring-1 ring-inset ring-white/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
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
            key="flywheel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
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

      {/* The Grid - moves up immediately when flywheel is hidden */}
      <motion.div
        id="projects-grid"
        role="tabpanel"
        layout
        transition={{ duration: 0.3, ease: "easeInOut" }}
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
          for the full archive of 30+ repos.
        </p>
      </div>
    </SectionShell>
  );
}