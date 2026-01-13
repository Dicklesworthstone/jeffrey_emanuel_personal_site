"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Layers, Wrench, ExpandIcon, ShrinkIcon, Search, X } from "lucide-react";
import Fuse from "fuse.js";
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
// SEARCH BAR COMPONENT
// =============================================================================

function ToolSearchBar({
  query,
  onQueryChange,
  resultCount,
  totalCount,
  inputRef,
  reducedMotion,
}: {
  query: string;
  onQueryChange: (query: string) => void;
  resultCount: number;
  totalCount: number;
  inputRef: React.RefObject<HTMLInputElement | null>;
  reducedMotion: boolean;
}) {
  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.3 }}
      className="mb-10"
    >
      <div className="relative mx-auto max-w-2xl">
        {/* Glass morphism search container */}
        <div className="relative rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm">
          {/* Search icon */}
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
          </div>

          {/* Input field */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search tools by name, description, or tech stack..."
            aria-label="Search flywheel tools"
            className="w-full rounded-2xl bg-transparent py-4 pl-12 pr-20 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />

          {/* Clear button and keyboard hint */}
          <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-4">
            {query && (
              <button
                onClick={() => onQueryChange("")}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <kbd className="hidden rounded-md border border-slate-700 bg-slate-800/50 px-2 py-1 text-xs font-medium text-slate-400 sm:inline-block">
              /
            </kbd>
          </div>
        </div>

        {/* Results count */}
        <AnimatePresence>
          {query && (
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? {} : { opacity: 0, y: -5 }}
              className="mt-3 text-center"
              role="status"
              aria-live="polite"
            >
              <span className="text-sm text-slate-400">
                {resultCount === 0 ? (
                  "No tools match your search"
                ) : (
                  <>
                    Showing{" "}
                    <span className="font-semibold text-white">
                      {resultCount}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-white">
                      {totalCount}
                    </span>{" "}
                    tools
                  </>
                )}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// =============================================================================
// EMPTY STATE COMPONENT
// =============================================================================

function EmptySearchState({
  query,
  onClear,
  reducedMotion,
}: {
  query: string;
  onClear: () => void;
  reducedMotion: boolean;
}) {
  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.3 }}
      className="py-16 text-center"
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10">
        <Search className="h-8 w-8 text-violet-400" />
      </div>
      <h3 className="mt-6 text-lg font-semibold text-white">
        No tools match &quot;{query}&quot;
      </h3>
      <p className="mt-2 text-sm text-slate-400">
        Try searching for &quot;session&quot;, &quot;memory&quot;, or
        &quot;search&quot;
      </p>
      <button
        onClick={onClear}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300 transition-colors hover:bg-violet-500/20"
      >
        <X className="h-4 w-4" />
        Clear search
      </button>
    </motion.div>
  );
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
          aria-label={isExpanded ? "Collapse all tools" : "Expand all tools"}
          className="flex min-h-[44px] items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
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
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Track expanded state for each tool
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());

  // Initialize Fuse.js for fuzzy search
  const fuse = useMemo(
    () =>
      new Fuse(tools, {
        keys: [
          { name: "name", weight: 2 },
          { name: "shortName", weight: 2 },
          { name: "whatItDoes", weight: 1.5 },
          { name: "whyItsUseful", weight: 1 },
          { name: "techStack", weight: 1 },
          { name: "keyFeatures", weight: 0.8 },
        ],
        threshold: 0.3,
        includeMatches: true,
        ignoreLocation: true,
      }),
    [tools]
  );

  // Filter tools based on search query
  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) {
      return tools;
    }
    return fuse.search(searchQuery).map((result) => result.item);
  }, [fuse, searchQuery, tools]);

  // Group filtered tools by category
  const { coreTools, supportingTools } = useMemo(() => {
    return {
      coreTools: filteredTools.filter((t) => t.category === "core"),
      supportingTools: filteredTools.filter((t) => t.category === "supporting"),
    };
  }, [filteredTools]);

  // Keyboard shortcut: "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search on "/" key (when not in an input)
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA"].includes(
          (e.target as HTMLElement)?.tagName ?? ""
        )
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Clear search on Escape
      if (e.key === "Escape" && searchQuery) {
        setSearchQuery("");
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchQuery]);

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

  const hasResults = filteredTools.length > 0;
  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className={cn("space-y-16", className)}>
      {/* Search Bar */}
      <ToolSearchBar
        query={searchQuery}
        onQueryChange={setSearchQuery}
        resultCount={filteredTools.length}
        totalCount={tools.length}
        inputRef={searchInputRef}
        reducedMotion={reducedMotion}
      />

      {/* Empty State */}
      {isSearching && !hasResults && (
        <EmptySearchState
          query={searchQuery}
          onClear={() => setSearchQuery("")}
          reducedMotion={reducedMotion}
        />
      )}

      {/* Core Tools Section */}
      {coreTools.length > 0 && (
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
            <AnimatePresence mode="popLayout">
              {coreTools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  layout={!reducedMotion}
                  initial={reducedMotion ? {} : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reducedMotion ? {} : { opacity: 0, scale: 0.9 }}
                  transition={{
                    duration: reducedMotion ? 0 : 0.3,
                    delay: reducedMotion ? 0 : index * 0.03,
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
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Supporting Tools Section */}
      {supportingTools.length > 0 && (
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
            <AnimatePresence mode="popLayout">
              {supportingTools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  layout={!reducedMotion}
                  initial={reducedMotion ? {} : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reducedMotion ? {} : { opacity: 0, scale: 0.9 }}
                  transition={{
                    duration: reducedMotion ? 0 : 0.3,
                    delay: reducedMotion ? 0 : index * 0.03,
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
            </AnimatePresence>
          </div>
        </section>
      )}
    </div>
  );
}

export default TldrToolGrid;
