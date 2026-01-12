"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Layers, Wrench, ExpandIcon, ShrinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TldrToolCard } from "./tldr-tool-card";
import type { TldrFlywheelTool, TldrToolCategory } from "@/lib/content";

// =============================================================================
// TYPES
// =============================================================================

interface TldrToolGridProps {
  tools: TldrFlywheelTool[];
  className?: string;
}

// =============================================================================
// SECTION HEADER COMPONENT
// =============================================================================

function SectionHeader({
  title,
  description,
  icon: Icon,
  count,
  isExpanded,
  onToggleAll,
  reducedMotion,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  isExpanded: boolean;
  onToggleAll: () => void;
  reducedMotion: boolean;
}) {
  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: reducedMotion ? 0 : 0.5 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white md:text-2xl">
              {title}
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({count})
              </span>
            </h2>
          </div>
        </div>
        <button
          onClick={onToggleAll}
          className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          {isExpanded ? (
            <>
              <ShrinkIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Collapse All</span>
            </>
          ) : (
            <>
              <ExpandIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Expand All</span>
            </>
          )}
        </button>
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
        {description}
      </p>
    </motion.div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function TldrToolGrid({ tools, className }: TldrToolGridProps) {
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion ?? false;

  // Track expanded state for each tool
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());

  // Group tools by category
  const { coreTools, supportingTools } = useMemo(() => {
    return {
      coreTools: tools.filter((t) => t.category === "core"),
      supportingTools: tools.filter((t) => t.category === "supporting"),
    };
  }, [tools]);

  // Check if all tools in a category are expanded
  const allCoreExpanded = useMemo(
    () => coreTools.every((t) => expandedTools.has(t.id)),
    [coreTools, expandedTools]
  );

  const allSupportingExpanded = useMemo(
    () => supportingTools.every((t) => expandedTools.has(t.id)),
    [supportingTools, expandedTools]
  );

  // Toggle single tool
  const toggleTool = useCallback((toolId: string) => {
    setExpandedTools((prev) => {
      const next = new Set(prev);
      if (next.has(toolId)) {
        next.delete(toolId);
      } else {
        next.add(toolId);
      }
      return next;
    });
  }, []);

  // Toggle all tools in a category
  const toggleAllCategory = useCallback(
    (category: TldrToolCategory) => {
      const categoryTools =
        category === "core" ? coreTools : supportingTools;
      const allExpanded =
        category === "core" ? allCoreExpanded : allSupportingExpanded;

      setExpandedTools((prev) => {
        const next = new Set(prev);
        if (allExpanded) {
          // Collapse all
          categoryTools.forEach((t) => next.delete(t.id));
        } else {
          // Expand all
          categoryTools.forEach((t) => next.add(t.id));
        }
        return next;
      });
    },
    [coreTools, supportingTools, allCoreExpanded, allSupportingExpanded]
  );

  return (
    <div className={cn("space-y-16", className)}>
      {/* Core Tools Section */}
      <section>
        <SectionHeader
          title="Core Flywheel Tools"
          description="The backbone of multi-agent development: session management, communication, task tracking, static analysis, memory, and search. These tools form a self-reinforcing loop where each makes the others more powerful."
          icon={Layers}
          count={coreTools.length}
          isExpanded={allCoreExpanded}
          onToggleAll={() => toggleAllCategory("core")}
          reducedMotion={reducedMotion}
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {coreTools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{
                duration: reducedMotion ? 0 : 0.4,
                delay: reducedMotion ? 0 : index * 0.05,
              }}
            >
              <TldrToolCard
                tool={tool}
                allTools={tools}
                isExpanded={expandedTools.has(tool.id)}
                onToggleExpand={() => toggleTool(tool.id)}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Supporting Tools Section */}
      <section>
        <SectionHeader
          title="Supporting Tools"
          description="Extend the ecosystem with safety guards, cross-repo management, archive search, prompt crafting, and automated setup. These tools enhance the core flywheel without being essential to it."
          icon={Wrench}
          count={supportingTools.length}
          isExpanded={allSupportingExpanded}
          onToggleAll={() => toggleAllCategory("supporting")}
          reducedMotion={reducedMotion}
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {supportingTools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{
                duration: reducedMotion ? 0 : 0.4,
                delay: reducedMotion ? 0 : index * 0.05,
              }}
            >
              <TldrToolCard
                tool={tool}
                allTools={tools}
                isExpanded={expandedTools.has(tool.id)}
                onToggleExpand={() => toggleTool(tool.id)}
              />
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default TldrToolGrid;
