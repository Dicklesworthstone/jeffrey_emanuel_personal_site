"use client";

import { useState, useMemo, useRef, useEffect, useCallback, memo } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Layers, Wrench, Search, X, ArrowUpRight, Star, GitCompare } from "lucide-react";
import Fuse from "fuse.js";
import { cn } from "@/lib/utils";
import { formatStarCount, formatStarCountFull } from "@/lib/format-stars";
import BottomSheet from "@/components/bottom-sheet";
import { TldrToolCard, DynamicIcon } from "./tldr-tool-card";
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

const ToolSearchBar = memo(function ToolSearchBar({
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
                type="button"
                onClick={() => onQueryChange("")}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
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
});

// =============================================================================
// EMPTY STATE COMPONENT
// =============================================================================

const EmptySearchState = memo(function EmptySearchState({
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
        <Search className="h-8 w-8 text-violet-400" aria-hidden="true" />
      </div>
      <h3 className="mt-6 text-lg font-semibold text-white">
        No tools match &quot;{query}&quot;
      </h3>
      <p className="mt-2 text-sm text-slate-400">
        Try searching for &quot;session&quot;, &quot;memory&quot;, or
        &quot;search&quot;
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300 transition-colors hover:bg-violet-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
      >
        <X className="h-4 w-4" />
        Clear search
      </button>
    </motion.div>
  );
});

// =============================================================================
// SECTION HEADER COMPONENT
// =============================================================================

const SectionHeader = memo(function SectionHeader({
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
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function TldrToolGrid({ tools, className }: TldrToolGridProps) {
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion ?? false;
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Keyboard navigation state
  const [focusedToolId, setFocusedToolId] = useState<string | null>(null);

  // Mobile bottom sheet state
  const [selectedTool, setSelectedTool] = useState<TldrFlywheelTool | null>(null);
  const handleMobileTap = useCallback((tool: TldrFlywheelTool) => {
    setSelectedTool(tool);
  }, []);
  const handleCloseSheet = useCallback(() => {
    setSelectedTool(null);
  }, []);

  // Compare mode state
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [showComparison, setShowComparison] = useState(false);

  const toggleCompareSelection = useCallback((tool: TldrFlywheelTool) => {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(tool.id)) {
        next.delete(tool.id);
      } else if (next.size < 3) {
        next.add(tool.id);
      }
      return next;
    });
  }, []);

  const compareTools = useMemo(
    () => tools.filter((t) => compareIds.has(t.id)),
    [tools, compareIds]
  );

  const exitCompareMode = useCallback(() => {
    setCompareMode(false);
    setCompareIds(new Set());
    setShowComparison(false);
  }, []);

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

  // Keyboard shortcuts: "/" to focus search, j/k vim navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const inInput = ["INPUT", "TEXTAREA"].includes(
        (e.target as HTMLElement)?.tagName ?? ""
      );

      // Focus search on "/" key (when not in an input)
      if (e.key === "/" && !inInput) {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      // Clear search on Escape
      if (e.key === "Escape") {
        if (searchQuery) {
          setSearchQuery("");
          searchInputRef.current?.blur();
        }
        setFocusedToolId(null);
        return;
      }

      // Vim navigation (only when not in an input)
      if (inInput) return;

      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedToolId((prev) => {
          const idx = prev ? filteredTools.findIndex((t) => t.id === prev) : -1;
          const next = Math.min(idx + 1, filteredTools.length - 1);
          const tool = filteredTools[next];
          if (tool) {
            document.getElementById(`tool-card-${tool.id}`)?.scrollIntoView({
              behavior: reducedMotion ? "instant" : "smooth",
              block: "center",
            });
          }
          return tool?.id ?? prev;
        });
        return;
      }

      if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedToolId((prev) => {
          const idx = prev ? filteredTools.findIndex((t) => t.id === prev) : filteredTools.length;
          const next = Math.max(idx - 1, 0);
          const tool = filteredTools[next];
          if (tool) {
            document.getElementById(`tool-card-${tool.id}`)?.scrollIntoView({
              behavior: reducedMotion ? "instant" : "smooth",
              block: "center",
            });
          }
          return tool?.id ?? prev;
        });
        return;
      }

      // Enter: open details for focused tool
      if (e.key === "Enter" && focusedToolId) {
        const tool = filteredTools.find((t) => t.id === focusedToolId);
        if (tool) setSelectedTool(tool);
        return;
      }

      // g: open GitHub link for focused tool
      if (e.key === "g" && focusedToolId) {
        const tool = filteredTools.find((t) => t.id === focusedToolId);
        if (tool) window.open(tool.href, "_blank", "noopener,noreferrer");
        return;
      }

      // c: toggle compare mode
      if (e.key === "c") {
        setCompareMode((prev) => {
          if (prev) {
            setCompareIds(new Set());
            setShowComparison(false);
          }
          return !prev;
        });
        return;
      }

      // G: jump to last tool
      if (e.key === "G") {
        const last = filteredTools[filteredTools.length - 1];
        if (last) {
          setFocusedToolId(last.id);
          document.getElementById(`tool-card-${last.id}`)?.scrollIntoView({
            behavior: reducedMotion ? "instant" : "smooth",
            block: "center",
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchQuery, filteredTools, focusedToolId, reducedMotion]);

  const hasResults = filteredTools.length > 0;
  const isSearching = searchQuery.trim().length > 0;

  // Defensive: handle empty tools array
  if (tools.length === 0) {
    return (
      <div className={cn("py-16 text-center", className)}>
        <p className="text-sm text-slate-500">No tools to display.</p>
      </div>
    );
  }

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

      {/* Compare Mode Controls */}
      <div className="flex items-center justify-end gap-3 -mt-4 sm:-mt-6">
        <button
          type="button"
          onClick={() => {
            if (compareMode) {
              exitCompareMode();
            } else {
              setCompareMode(true);
            }
          }}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all sm:text-sm",
            compareMode
              ? "bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/40"
              : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
          )}
        >
          <GitCompare className="h-4 w-4" aria-hidden="true" />
          {compareMode ? "Exit Compare" : "Compare"}
        </button>
      </div>

      {/* Compare Mode Floating Pill */}
      <AnimatePresence>
        {compareMode && compareIds.size > 0 && (
          <motion.div
            initial={reducedMotion ? {} : { opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? {} : { opacity: 0, y: 20 }}
            className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-full border border-violet-500/30 bg-slate-900/95 px-5 py-3 shadow-2xl shadow-violet-500/10 backdrop-blur-lg"
          >
            <span className="text-sm font-medium text-white">
              {compareIds.size} of 3 selected
            </span>
            {compareIds.size >= 2 && (
              <button
                type="button"
                onClick={() => setShowComparison(true)}
                className="rounded-full bg-violet-500 px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-violet-400"
              >
                Compare
              </button>
            )}
            <button
              type="button"
              onClick={exitCompareMode}
              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Exit compare mode"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
        <section id="core-tools">
          <SectionHeader
            title="Core Flywheel Tools"
            description="The backbone of multi-agent development: session management, communication, task tracking, static analysis, memory, search, safety guards, multi-repo sync, and automated setup. These tools form a self-reinforcing loop where each makes the others more powerful."
            icon={Layers}
            count={coreTools.length}
            reducedMotion={reducedMotion}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {coreTools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  id={`tool-card-${tool.id}`}
                  layout={!reducedMotion}
                  initial={reducedMotion ? {} : { opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  exit={reducedMotion ? {} : { opacity: 0, scale: 0.9 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: reducedMotion ? 0 : 0.3,
                    delay: reducedMotion ? 0 : index * 0.05,
                  }}
                  className="h-full scroll-mt-24"
                >
                  <TldrToolCard
                    tool={tool}
                    allTools={tools}
                    onMobileTap={compareMode ? undefined : handleMobileTap}
                    isFocused={focusedToolId === tool.id}
                    isCompareMode={compareMode}
                    isSelectedForCompare={compareIds.has(tool.id)}
                    onToggleCompare={toggleCompareSelection}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Supporting Tools Section */}
      {supportingTools.length > 0 && (
        <section id="supporting-tools">
          <SectionHeader
            title="Supporting Tools"
            description="Extend the ecosystem with GitHub issue sync, archive search, and prompt crafting utilities. These tools enhance the core flywheel for specialized workflows."
            icon={Wrench}
            count={supportingTools.length}
            reducedMotion={reducedMotion}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {supportingTools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  id={`tool-card-${tool.id}`}
                  layout={!reducedMotion}
                  initial={reducedMotion ? {} : { opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  exit={reducedMotion ? {} : { opacity: 0, scale: 0.9 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: reducedMotion ? 0 : 0.3,
                    delay: reducedMotion ? 0 : index * 0.05,
                  }}
                  className="h-full scroll-mt-24"
                >
                  <TldrToolCard
                    tool={tool}
                    allTools={tools}
                    onMobileTap={compareMode ? undefined : handleMobileTap}
                    isFocused={focusedToolId === tool.id}
                    isCompareMode={compareMode}
                    isSelectedForCompare={compareIds.has(tool.id)}
                    onToggleCompare={toggleCompareSelection}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}
      {/* Comparison Bottom Sheet */}
      <BottomSheet
        isOpen={showComparison && compareTools.length >= 2}
        onClose={() => setShowComparison(false)}
        title={`Comparing ${compareTools.length} Tools`}
        maxHeight={90}
      >
        <div className="overflow-x-auto -mx-2">
          <table className="w-full min-w-[500px] text-left text-sm">
            <thead>
              <tr>
                <th className="pb-3 pr-3 text-xs font-bold uppercase tracking-wider text-slate-500" />
                {compareTools.map((tool) => (
                  <th key={tool.id} className="pb-3 px-3 text-center">
                    <div className={cn("mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br", tool.color)}>
                      <DynamicIcon name={tool.icon} className="h-5 w-5 text-white" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-bold text-white">{tool.shortName}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="py-3 pr-3 text-xs font-bold uppercase tracking-wider text-slate-500">What It Does</td>
                {compareTools.map((tool) => (
                  <td key={tool.id} className="py-3 px-3 text-xs text-slate-300">{tool.whatItDoes}</td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-3 text-xs font-bold uppercase tracking-wider text-slate-500">Stars</td>
                {compareTools.map((tool) => (
                  <td key={tool.id} className="py-3 px-3 text-center">
                    {tool.stars ? (
                      <span className="inline-flex items-center gap-1 text-amber-300">
                        <Star className="h-3 w-3 fill-amber-400" aria-hidden="true" />
                        {formatStarCount(tool.stars)}
                      </span>
                    ) : "—"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-3 text-xs font-bold uppercase tracking-wider text-slate-500">Tech Stack</td>
                {compareTools.map((tool) => (
                  <td key={tool.id} className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {tool.techStack.map((tech) => (
                        <span key={tech} className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-slate-400">{tech}</span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-3 text-xs font-bold uppercase tracking-wider text-slate-500">Key Features</td>
                {compareTools.map((tool) => (
                  <td key={tool.id} className="py-3 px-3">
                    <ul className="space-y-1">
                      {tool.keyFeatures.slice(0, 3).map((f) => (
                        <li key={f} className="text-xs text-slate-300">• {f}</li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-3 text-xs font-bold uppercase tracking-wider text-slate-500">Synergies</td>
                {compareTools.map((tool) => (
                  <td key={tool.id} className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {tool.synergies.map((s) => {
                        const linked = tools.find((t) => t.id === s.toolId);
                        if (!linked) return null;
                        const isInCompare = compareIds.has(s.toolId);
                        return (
                          <span key={s.toolId} className={cn(
                            "rounded-md px-1.5 py-0.5 text-xs font-medium",
                            isInCompare ? "bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30" : "bg-white/5 text-slate-400"
                          )}>
                            {linked.shortName}{isInCompare ? " ✓" : ""}
                          </span>
                        );
                      })}
                      {tool.synergies.length === 0 && <span className="text-xs text-slate-500">—</span>}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </BottomSheet>

      {/* Mobile Bottom Sheet for tool details */}
      <BottomSheet
        isOpen={!!selectedTool}
        onClose={handleCloseSheet}
        title={selectedTool?.shortName}
        maxHeight={85}
      >
        {selectedTool && (
          <div className="space-y-5">
            {/* Stars + GitHub link */}
            <div className="flex items-center gap-3">
              {selectedTool.stars && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-100 ring-1 ring-inset ring-amber-400/30">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                  <span className="font-mono" title={formatStarCountFull(selectedTool.stars)}>
                    {formatStarCount(selectedTool.stars)}
                  </span>
                </span>
              )}
              <a
                href={selectedTool.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-sm font-medium text-violet-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                View on GitHub
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>

            {/* What It Does */}
            <div>
              <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                What It Does
              </h3>
              <p className="text-sm leading-relaxed text-slate-300">
                {selectedTool.whatItDoes}
              </p>
            </div>

            {/* Why It's Useful */}
            <div>
              <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                Why It&apos;s Useful
              </h3>
              <p className="text-sm leading-relaxed text-slate-300">
                {selectedTool.whyItsUseful}
              </p>
            </div>

            {/* Key Features */}
            <div>
              <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                Key Features
              </h3>
              <ul className="space-y-1.5">
                {selectedTool.keyFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-slate-300"
                  >
                    <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tech Stack */}
            <div>
              <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedTool.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-md bg-white/5 px-2 py-1 text-xs font-medium text-slate-400"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Synergies */}
            {selectedTool.synergies.length > 0 && (
              <div>
                <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Synergies
                </h3>
                <div className="grid gap-2">
                  {selectedTool.synergies.map((synergy) => {
                    const linked = tools.find((t) => t.id === synergy.toolId);
                    if (!linked) return null;
                    return (
                      <div
                        key={synergy.toolId}
                        className="flex items-center gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-inset ring-white/5"
                      >
                        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br", linked.color)}>
                          <span className="text-xs font-bold text-white">
                            {linked.shortName.charAt(0)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white">
                            {linked.shortName}
                          </p>
                          <p className="text-xs text-slate-400">
                            {synergy.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

export default TldrToolGrid;
