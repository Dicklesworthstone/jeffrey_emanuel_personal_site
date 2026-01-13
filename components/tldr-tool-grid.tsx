"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Layers, Wrench, Search, X } from "lucide-react";
import Fuse from "fuse.js";
import { cn } from "@/lib/utils";
import { TldrToolCard } from "./tldr-tool-card";
import type { TldrFlywheelTool } from "@/lib/content";

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
      className="mb-8 sm:mb-10"
    >
      <div className="relative mx-auto max-w-2xl">
        {/* Glass morphism search container */}
        <div className="relative rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur-sm sm:rounded-2xl">
          {/* Search icon */}
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4">
            <Search className="h-4 w-4 text-slate-400 sm:h-5 sm:w-5" aria-hidden="true" />
          </div>

          {/* Input field */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search tools..."
            aria-label="Search flywheel tools"
            className="w-full rounded-xl bg-transparent py-3 pl-10 pr-16 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 sm:rounded-2xl sm:py-4 sm:pl-12 sm:pr-20"
          />

          {/* Clear button and keyboard hint */}
          <div className="absolute inset-y-0 right-0 flex items-center gap-1.5 pr-3 sm:gap-2 sm:pr-4">
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
              className="mt-2 text-center sm:mt-3"
              role="status"
              aria-live="polite"
            >
              <span className="text-xs text-slate-400 sm:text-sm">
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
  reducedMotion,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  reducedMotion: boolean;
}) {
  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: reducedMotion ? 0 : 0.5 }}
      className="mb-6 sm:mb-8"
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400 sm:h-10 sm:w-10 sm:rounded-xl">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white sm:text-xl md:text-2xl">
            {title}
            <span className="ml-1.5 text-xs font-normal text-slate-500 sm:ml-2 sm:text-sm">
              ({count})
            </span>
          </h2>
        </div>
      </div>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-400 sm:mt-3 sm:text-sm">
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
            description="The backbone of multi-agent development: session management, communication, task tracking, static analysis, memory, search, safety guards, multi-repo sync, and automated setup. These tools form a self-reinforcing loop where each makes the others more powerful."
            icon={Layers}
            count={coreTools.length}
            reducedMotion={reducedMotion}
          />
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                  className="h-full"
                >
                  <TldrToolCard
                    tool={tool}
                    allTools={tools}
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
            description="Extend the ecosystem with GitHub issue sync, archive search, and prompt crafting utilities. These tools enhance the core flywheel for specialized workflows."
            icon={Wrench}
            count={supportingTools.length}
            reducedMotion={reducedMotion}
          />
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                  className="h-full"
                >
                  <TldrToolCard
                    tool={tool}
                    allTools={tools}
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
