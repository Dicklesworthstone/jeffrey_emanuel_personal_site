"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  LayoutGrid,
  ShieldCheck,
  Mail,
  GitBranch,
  Bug,
  Brain,
  Search,
  ArrowUpRight,
  Zap,
  X,
  ExternalLink,
} from "lucide-react";
import { flywheelTools, flywheelDescription, type FlywheelTool } from "@/lib/content";
import { cn } from "@/lib/utils";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutGrid,
  ShieldCheck,
  Mail,
  GitBranch,
  Bug,
  Brain,
  Search,
};

// Fixed radius in SVG coordinate space
const SVG_RADIUS = 140;
const SVG_SIZE = 420;

// Calculate positions for circular layout
function getCircularPosition(index: number, total: number, radius: number) {
  const angle = ((index / total) * 2 * Math.PI) - (Math.PI / 2);
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
}

// Connection line with glow effect
function ConnectionLine({
  from,
  to,
  isHighlighted,
  isActive,
  reducedMotion,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isHighlighted: boolean;
  isActive: boolean;
  reducedMotion: boolean;
}) {
  return (
    <g>
      {/* Glow layer */}
      {isHighlighted && (
        <motion.line
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke="url(#lineGradient)"
          strokeWidth={8}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          exit={{ opacity: 0 }}
          style={{ filter: "blur(4px)" }}
        />
      )}
      {/* Main line */}
      <motion.line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={isHighlighted ? "url(#lineGradient)" : "rgba(148, 163, 184, 0.15)"}
        strokeWidth={isHighlighted ? 2.5 : 1}
        strokeDasharray={isActive && !reducedMotion ? "8 4" : undefined}
        strokeLinecap="round"
        initial={{ opacity: 0 }}
        animate={{
          opacity: isHighlighted ? 1 : 0.3,
          strokeDashoffset: isActive && !reducedMotion ? [12, 0] : 0,
        }}
        transition={{
          opacity: { duration: reducedMotion ? 0 : 0.3, ease: "easeInOut" },
          strokeDashoffset: isActive && !reducedMotion
            ? { duration: 0.5, repeat: Infinity, ease: "linear" }
            : { duration: 0 },
        }}
      />
    </g>
  );
}

// Tool node with accessibility and polish
function ToolNode({
  tool,
  position,
  index,
  isSelected,
  isConnected,
  isDimmed,
  onSelect,
  onHover,
  reducedMotion,
}: {
  tool: FlywheelTool;
  position: { x: number; y: number };
  index: number;
  isSelected: boolean;
  isConnected: boolean;
  isDimmed: boolean;
  onSelect: () => void;
  onHover: (hovering: boolean) => void;
  reducedMotion: boolean;
}) {
  const Icon = iconMap[tool.icon] || Zap;
  const { lightTap } = useHapticFeedback();

  const leftPercent = ((position.x + SVG_SIZE / 2) / SVG_SIZE) * 100;
  const topPercent = ((position.y + SVG_SIZE / 2) / SVG_SIZE) * 100;

  const handleClick = useCallback(() => {
    lightTap();
    onSelect();
  }, [lightTap, onSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  return (
    <motion.div
      className="absolute will-change-transform"
      style={{
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        transform: "translate(-50%, -50%)",
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: isDimmed ? 0.4 : 1,
      }}
      transition={reducedMotion ? { duration: 0 } : {
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: index * 0.05,
      }}
    >
      <motion.button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
        onFocus={() => onHover(true)}
        onBlur={() => onHover(false)}
        aria-label={`${tool.name}: ${tool.tagline}. ${isSelected ? "Selected." : "Click to view connections."}`}
        aria-pressed={isSelected}
        className={cn(
          "group relative flex flex-col items-center gap-1.5 rounded-2xl border p-2.5 sm:p-3 md:p-4",
          "transition-all duration-200 outline-none",
          "focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
          "min-w-[72px] sm:min-w-[80px]",
          isSelected
            ? "border-white/40 bg-white/15 shadow-lg shadow-white/10"
            : isConnected
            ? "border-white/25 bg-white/8"
            : "border-white/10 bg-black/30 hover:border-white/20 hover:bg-white/5"
        )}
        whileHover={reducedMotion ? {} : { scale: 1.08 }}
        whileTap={reducedMotion ? {} : { scale: 0.95 }}
      >
        {/* Glow effect */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-2xl blur-xl",
            `bg-gradient-to-br ${tool.color}`
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: isSelected ? 0.5 : isConnected ? 0.25 : 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.3 }}
        />

        {/* Icon container */}
        <div
          className={cn(
            "relative flex h-9 w-9 sm:h-11 sm:w-11 md:h-12 md:w-12 items-center justify-center rounded-xl",
            "transition-shadow duration-300",
            `bg-gradient-to-br ${tool.color}`,
            isSelected && "shadow-lg"
          )}
        >
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
        </div>

        {/* Label */}
        <span className="relative text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wider text-white whitespace-nowrap">
          {tool.shortName}
        </span>
      </motion.button>
    </motion.div>
  );
}

// Tool detail card (desktop sidebar)
function ToolDetailCard({
  tool,
  onClose,
  reducedMotion,
}: {
  tool: FlywheelTool;
  onClose: () => void;
  reducedMotion: boolean;
}) {
  const Icon = iconMap[tool.icon] || Zap;

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
      transition={reducedMotion ? { duration: 0.15 } : { type: "spring", stiffness: 300, damping: 25 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/70 backdrop-blur-xl"
    >
      {/* Background gradient */}
      <div className={cn("absolute inset-0 opacity-10 bg-gradient-to-br", tool.color)} />

      <div className="relative p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={cn(
              "flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg",
              tool.color
            )}>
              <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-white truncate">{tool.name}</h3>
              <p className="text-xs sm:text-sm text-slate-400 line-clamp-2">{tool.tagline}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hidden lg:flex -mr-1 -mt-1 h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close detail panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* View button */}
        <Link
          href={tool.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "mt-4 flex items-center justify-center gap-2 rounded-xl py-2.5 px-4",
            "text-sm font-semibold text-white transition-all duration-200",
            "bg-gradient-to-r shadow-lg",
            tool.color,
            "hover:shadow-xl hover:brightness-110 active:scale-[0.98]"
          )}
        >
          View on GitHub
          <ExternalLink className="h-4 w-4" />
        </Link>

        {/* Connections */}
        <div className="mt-5 sm:mt-6">
          <h4 className="mb-2.5 sm:mb-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
            Integrates With
          </h4>
          <div className="space-y-2">
            {tool.connectsTo.map((targetId) => {
              const targetTool = flywheelTools.find((t) => t.id === targetId);
              if (!targetTool) return null;
              const TargetIcon = iconMap[targetTool.icon] || Zap;

              return (
                <motion.div
                  key={targetId}
                  initial={reducedMotion ? {} : { opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2.5 sm:gap-3 rounded-xl bg-white/5 p-2.5 sm:p-3 border border-white/5"
                >
                  <div className={cn(
                    "flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br",
                    targetTool.color
                  )}>
                    <TargetIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-white">{targetTool.shortName}</p>
                    <p className="text-[10px] sm:text-xs text-slate-400 line-clamp-1">
                      {tool.connectionDescriptions[targetId]}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Mobile bottom sheet for tool details
function MobileBottomSheet({
  tool,
  onClose,
  reducedMotion,
}: {
  tool: FlywheelTool | null;
  onClose: () => void;
  reducedMotion: boolean;
}) {
  const Icon = tool ? (iconMap[tool.icon] || Zap) : Zap;

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (tool) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [tool]);

  return (
    <AnimatePresence>
      {tool && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.1 : 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { y: "100%" }}
            animate={{ y: 0, opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { y: "100%" }}
            transition={reducedMotion ? { duration: 0.15 } : { type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sheet-title"
          >
            <div className="rounded-t-3xl border-t border-white/10 bg-slate-950/95 backdrop-blur-xl">
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="h-1 w-10 rounded-full bg-white/20" />
              </div>

              <div className="max-h-[70vh] overflow-y-auto overscroll-contain px-5 pb-8">
                {/* Header */}
                <div className="flex items-center gap-4 py-4">
                  <div className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg",
                    tool.color
                  )}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 id="sheet-title" className="text-xl font-bold text-white">{tool.name}</h3>
                    <p className="text-sm text-slate-400">{tool.tagline}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* View button */}
                <Link
                  href={tool.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl py-3.5 px-4",
                    "text-base font-semibold text-white",
                    "bg-gradient-to-r shadow-lg",
                    tool.color,
                  )}
                >
                  View on GitHub
                  <ExternalLink className="h-5 w-5" />
                </Link>

                {/* Connections */}
                <div className="mt-6">
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Integrates With
                  </h4>
                  <div className="space-y-2">
                    {tool.connectsTo.map((targetId) => {
                      const targetTool = flywheelTools.find((t) => t.id === targetId);
                      if (!targetTool) return null;
                      const TargetIcon = iconMap[targetTool.icon] || Zap;

                      return (
                        <div
                          key={targetId}
                          className="flex items-center gap-3 rounded-xl bg-white/5 p-3 border border-white/5"
                        >
                          <div className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br",
                            targetTool.color
                          )}>
                            <TargetIcon className="h-5 w-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-white">{targetTool.shortName}</p>
                            <p className="text-xs text-slate-400">
                              {tool.connectionDescriptions[targetId]}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Placeholder state for desktop panel
function PlaceholderPanel({ reducedMotion }: { reducedMotion: boolean }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.2 }}
      className="rounded-2xl border border-white/10 bg-black/40 p-5 sm:p-6 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/10 ring-1 ring-violet-500/30">
          <Zap className="h-6 w-6 text-violet-400" />
        </div>
        <p className="text-sm text-slate-400">
          {isMobile ? "Tap" : "Click"} a tool to explore its connections
        </p>
      </div>

      <div className="rounded-xl bg-white/5 p-4 border border-white/5">
        <p className="text-xs leading-relaxed text-slate-400">
          {flywheelDescription.description}
        </p>
      </div>
    </motion.div>
  );
}

export default function FlywheelVisualization() {
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [hoveredToolId, setHoveredToolId] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion ?? false;

  const activeToolId = selectedToolId || hoveredToolId;
  const selectedTool = flywheelTools.find((t) => t.id === selectedToolId) ?? null;

  // Calculate positions
  const positions = useMemo(() => {
    return flywheelTools.reduce((acc, tool, index) => {
      acc[tool.id] = getCircularPosition(index, flywheelTools.length, SVG_RADIUS);
      return acc;
    }, {} as Record<string, { x: number; y: number }>);
  }, []);

  // Generate unique connection lines
  const connections = useMemo(() => {
    const seen = new Set<string>();
    const lines: { from: string; to: string }[] = [];
    flywheelTools.forEach((tool) => {
      tool.connectsTo.forEach((targetId) => {
        const key = [tool.id, targetId].sort().join("-");
        if (!seen.has(key)) {
          seen.add(key);
          lines.push({ from: tool.id, to: targetId });
        }
      });
    });
    return lines;
  }, []);

  const isConnectionHighlighted = useCallback((from: string, to: string) => {
    if (!activeToolId) return false;
    const activeTool = flywheelTools.find((t) => t.id === activeToolId);
    if (!activeTool) return false;
    return (
      (from === activeToolId && activeTool.connectsTo.includes(to)) ||
      (to === activeToolId && activeTool.connectsTo.includes(from))
    );
  }, [activeToolId]);

  const isToolConnected = useCallback((toolId: string) => {
    if (!activeToolId || toolId === activeToolId) return false;
    const activeTool = flywheelTools.find((t) => t.id === activeToolId);
    return activeTool?.connectsTo.includes(toolId) ?? false;
  }, [activeToolId]);

  const handleSelectTool = useCallback((toolId: string) => {
    setSelectedToolId((prev) => (prev === toolId ? null : toolId));
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedToolId(null);
  }, []);

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-6 sm:mb-8 md:mb-12 text-center">
        <div className="mb-3 sm:mb-4 flex items-center justify-center gap-3">
          <div className="h-px w-6 sm:w-8 bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-violet-400">
            Ecosystem
          </span>
          <div className="h-px w-6 sm:w-8 bg-gradient-to-l from-transparent via-violet-500/50 to-transparent" />
        </div>
        <h2 className="mb-3 sm:mb-4 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-white">
          {flywheelDescription.title}
        </h2>
        <p className="mx-auto max-w-2xl text-xs sm:text-sm md:text-base text-slate-400 px-4">
          {flywheelDescription.subtitle}
        </p>
      </div>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1fr,340px] xl:grid-cols-[1fr,380px]">
        {/* Flywheel visualization */}
        <div className="relative flex items-center justify-center" role="img" aria-label="Interactive flywheel showing tool connections">
          <div className="relative h-[300px] w-[300px] sm:h-[380px] sm:w-[380px] md:h-[420px] md:w-[420px]">
            {/* Center hub with pulsing animation */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <motion.div
                className="flex h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 items-center justify-center rounded-full border border-violet-500/30 bg-violet-500/10"
                animate={reducedMotion ? {} : {
                  boxShadow: [
                    "0 0 20px rgba(139, 92, 246, 0.2)",
                    "0 0 40px rgba(139, 92, 246, 0.4)",
                    "0 0 20px rgba(139, 92, 246, 0.2)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Zap className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-violet-400" />
              </motion.div>
            </div>

            {/* Connection lines SVG */}
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="-210 -210 420 420"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="rgb(236, 72, 153)" stopOpacity="1" />
                  <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0.8" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Outer ring */}
              <circle
                cx="0"
                cy="0"
                r={SVG_RADIUS}
                fill="none"
                stroke="rgba(148, 163, 184, 0.08)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />

              {/* Inner decorative ring */}
              <circle
                cx="0"
                cy="0"
                r={SVG_RADIUS * 0.4}
                fill="none"
                stroke="rgba(139, 92, 246, 0.1)"
                strokeWidth="1"
              />

              {/* Connection lines */}
              {connections.map(({ from, to }) => {
                const fromPos = positions[from];
                const toPos = positions[to];
                if (!fromPos || !toPos) return null;

                const highlighted = isConnectionHighlighted(from, to);

                return (
                  <ConnectionLine
                    key={`${from}-${to}`}
                    from={fromPos}
                    to={toPos}
                    isHighlighted={highlighted}
                    isActive={highlighted && !!selectedToolId}
                    reducedMotion={reducedMotion}
                  />
                );
              })}
            </svg>

            {/* Tool nodes */}
            {flywheelTools.map((tool, index) => (
              <ToolNode
                key={tool.id}
                tool={tool}
                position={positions[tool.id]}
                index={index}
                isSelected={tool.id === selectedToolId}
                isConnected={isToolConnected(tool.id)}
                isDimmed={!!activeToolId && tool.id !== activeToolId && !isToolConnected(tool.id)}
                onSelect={() => handleSelectTool(tool.id)}
                onHover={(hovering) => setHoveredToolId(hovering ? tool.id : null)}
                reducedMotion={reducedMotion}
              />
            ))}
          </div>
        </div>

        {/* Detail panel (desktop only) */}
        <div className="hidden lg:flex lg:flex-col">
          <AnimatePresence mode="wait">
            {selectedTool ? (
              <ToolDetailCard
                key={selectedTool.id}
                tool={selectedTool}
                onClose={handleCloseDetail}
                reducedMotion={reducedMotion}
              />
            ) : (
              <PlaceholderPanel key="placeholder" reducedMotion={reducedMotion} />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile bottom sheet */}
      <MobileBottomSheet
        tool={selectedTool}
        onClose={handleCloseDetail}
        reducedMotion={reducedMotion}
      />
    </div>
  );
}
