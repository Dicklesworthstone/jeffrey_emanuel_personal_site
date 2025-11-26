"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SectionShell from "@/components/section-shell";
import BentoGrid from "@/components/bento-grid";
import { projects } from "@/lib/content";
import { GitBranch, Filter, Layers, Zap, Beaker, Box } from "lucide-react";
import { cn } from "@/lib/utils";

const filters = [
  { id: "all", label: "All Work", icon: Layers },
  { id: "product", label: "Products", icon: Box },
  { id: "research", label: "Research", icon: Beaker },
  { id: "oss", label: "Open Source", icon: GitBranch },
] as const;

export default function ProjectsPage() {
  const [activeFilter, setActiveFilter] = useState<typeof filters[number]["id"]>("all");

  const filteredProjects = projects.filter((project) => {
    if (activeFilter === "all") return true;
    return project.kind === activeFilter;
  });

  return (
    <SectionShell
      id="projects"
      icon={Zap}
      eyebrow="The Constellation"
      title="A catalog of experiments and products"
      kicker="Explore the ecosystem of tools, protocols, and research papers I've built. Filter by category or browse the full grid."
    >
      {/* Filter Controls */}
      <div className="mb-12 flex flex-wrap justify-center gap-2">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
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
              <Icon className="relative z-10 h-4 w-4" />
              <span className="relative z-10">{filter.label}</span>
            </button>
          );
        })}
      </div>

      {/* The Grid */}
      <BentoGrid projects={filteredProjects} />

      <div className="mt-16 text-center">
         <p className="text-sm text-slate-500">
            Looking for more? Check out my <a href="https://github.com/Dicklesworthstone" target="_blank" rel="noopener noreferrer" className="underline decoration-slate-700 underline-offset-4 hover:text-slate-300">GitHub profile</a> for the full archive of 30+ repos.
         </p>
      </div>
    </SectionShell>
  );
}