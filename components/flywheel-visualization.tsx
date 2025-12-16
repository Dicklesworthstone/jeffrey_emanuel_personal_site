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
  X,
  ExternalLink,
  Zap,
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

// Layout constants
const CONTAINER_SIZE = 420;
const RADIUS = 150;
const CENTER = CONTAINER_SIZE / 2;
const NODE_SIZE = 72;

// Calculate node positions in a circle
function getNodePosition(index: number, total: number) {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  return {
    x: CENTER + Math.cos(angle) * RADIUS,
    y: CENTER + Math.sin(angle) * RADIUS,
  };
}

// Generate a curved path between two points through the center area
function getCurvedPath(from: { x: number; y: number }, to: { x: number; y: number }) {
  // Calculate midpoint with slight curve toward center
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  // Pull control point toward center for a nice curve
  const pullFactor = 0.3;
  const controlX = midX + (CENTER - midX) * pullFactor;
  const controlY = midY + (CENTER - midY) * pullFactor;

  return `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`;
}

// Animated particle that flows along a connection
function FlowingParticle({
  path,
  delay,
  duration,
  color,
}: {
  path: string;
  delay: number;
  duration: number;
  color: string;
}) {
  return (
    <motion.circle
      r="3"
      fill={color}
      filter="url(#particleGlow)"
      initial={{ offsetDistance: "0%" }}
      animate={{ offsetDistance: "100%" }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{
        offsetPath: `path('${path}')`,
        offsetRotate: "0deg",
      }}
    />
  );
}

// Connection line with optional flowing particles
function ConnectionLine({
  fromPos,
  toPos,
  isHighlighted,
  isActive,
  fromColor,
  toColor,
  reducedMotion,
  connectionId,
}: {
  fromPos: { x: number; y: number };
  toPos: { x: number; y: number };
  isHighlighted: boolean;
  isActive: boolean;
  fromColor: string;
  toColor: string;
  reducedMotion: boolean;
  connectionId: string;
}) {
  const path = getCurvedPath(fromPos, toPos);
  const gradientId = `gradient-${connectionId}`;

  // Extract color values for gradient
  const getGradientColor = (colorClass: string) => {
    const colorMap: Record<string, string> = {
      "from-sky-500 to-blue-600": "#0ea5e9",
      "from-amber-500 to-orange-600": "#f59e0b",
      "from-violet-500 to-purple-600": "#8b5cf6",
      "from-emerald-500 to-teal-600": "#10b981",
      "from-rose-500 to-red-600": "#f43f5e",
      "from-pink-500 to-fuchsia-600": "#ec4899",
      "from-cyan-500 to-sky-600": "#06b6d4",
    };
    for (const [key, value] of Object.entries(colorMap)) {
      if (colorClass.includes(key.split(" ")[0].replace("from-", ""))) {
        return value;
      }
    }
    return "#8b5cf6";
  };

  const color1 = getGradientColor(fromColor);
  const color2 = getGradientColor(toColor);

  return (
    <g>
      {/* Gradient definition for this line */}
      <defs>
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse"
          x1={fromPos.x} y1={fromPos.y} x2={toPos.x} y2={toPos.y}>
          <stop offset="0%" stopColor={color1} stopOpacity={isHighlighted ? 0.9 : 0.3} />
          <stop offset="100%" stopColor={color2} stopOpacity={isHighlighted ? 0.9 : 0.3} />
        </linearGradient>
      </defs>

      {/* Glow layer for highlighted connections */}
      {isHighlighted && (
        <motion.path
          d={path}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={8}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          exit={{ opacity: 0 }}
          style={{ filter: "blur(6px)" }}
        />
      )}

      {/* Main connection line */}
      <motion.path
        d={path}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={isHighlighted ? 2.5 : 1.5}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{
          pathLength: 1,
          opacity: isHighlighted ? 1 : 0.4,
        }}
        transition={{
          pathLength: { duration: reducedMotion ? 0 : 0.8, ease: "easeOut" },
          opacity: { duration: reducedMotion ? 0 : 0.3 },
        }}
      />

      {/* Flowing particles when active */}
      {isActive && !reducedMotion && (
        <>
          <FlowingParticle path={path} delay={0} duration={2} color={color1} />
          <FlowingParticle path={path} delay={0.7} duration={2} color={color2} />
          <FlowingParticle path={path} delay={1.4} duration={2} color={color1} />
        </>
      )}
    </g>
  );
}

// Tool node component
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

  const handleClick = useCallback(() => {
    lightTap();
    onSelect();
  }, [lightTap, onSelect]);

  return (
    <motion.div
      className="absolute"
      style={{
        left: position.x - NODE_SIZE / 2,
        top: position.y - NODE_SIZE / 2,
        width: NODE_SIZE,
        height: NODE_SIZE,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: isDimmed ? 0.35 : 1,
      }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : {
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: index * 0.08,
            }
      }
    >
      <motion.button
        onClick={handleClick}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
        onFocus={() => onHover(true)}
        onBlur={() => onHover(false)}
        aria-label={`${tool.name}: ${tool.tagline}`}
        aria-pressed={isSelected}
        className={cn(
          "relative flex h-full w-full flex-col items-center justify-center gap-1 rounded-2xl border p-2",
          "transition-all duration-200 outline-none",
          "focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
          isSelected
            ? "border-white/50 bg-white/20 shadow-xl"
            : isConnected
            ? "border-white/30 bg-white/10"
            : "border-white/10 bg-slate-900/80 hover:border-white/25 hover:bg-white/10"
        )}
        whileHover={reducedMotion ? {} : { scale: 1.1 }}
        whileTap={reducedMotion ? {} : { scale: 0.95 }}
      >
        {/* Glow background */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-2xl blur-xl",
            `bg-gradient-to-br ${tool.color}`
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: isSelected ? 0.6 : isConnected ? 0.35 : 0.15 }}
          transition={{ duration: reducedMotion ? 0 : 0.3 }}
        />

        {/* Icon */}
        <div
          className={cn(
            "relative z-10 flex h-9 w-9 items-center justify-center rounded-xl",
            `bg-gradient-to-br ${tool.color}`,
            isSelected && "shadow-lg"
          )}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>

        {/* Label */}
        <span className="relative z-10 text-[10px] font-bold uppercase tracking-wider text-white">
          {tool.shortName}
        </span>
      </motion.button>
    </motion.div>
  );
}

// Center hub with pulsing animation
function CenterHub({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <div
      className="absolute"
      style={{
        left: CENTER - 32,
        top: CENTER - 32,
        width: 64,
        height: 64,
      }}
    >
      <motion.div
        className="flex h-full w-full items-center justify-center rounded-full border border-violet-500/40 bg-violet-500/20"
        animate={
          reducedMotion
            ? {}
            : {
                boxShadow: [
                  "0 0 20px rgba(139, 92, 246, 0.3)",
                  "0 0 50px rgba(139, 92, 246, 0.5)",
                  "0 0 20px rgba(139, 92, 246, 0.3)",
                ],
              }
        }
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Zap className="h-7 w-7 text-violet-400" />
      </motion.div>
    </div>
  );
}

// Tool detail panel
function ToolDetailPanel({
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
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-xl"
    >
      {/* Background gradient */}
      <div className={cn("absolute inset-0 opacity-10 bg-gradient-to-br", tool.color)} />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg",
                tool.color
              )}
            >
              <Icon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{tool.name}</h3>
              <p className="text-sm text-slate-400">{tool.tagline}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action button */}
        <Link
          href={tool.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "mt-5 flex items-center justify-center gap-2 rounded-xl py-3 px-4",
            "text-sm font-semibold text-white transition-all",
            "bg-gradient-to-r shadow-lg hover:shadow-xl hover:brightness-110",
            tool.color
          )}
        >
          View on GitHub
          <ExternalLink className="h-4 w-4" />
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
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br",
                      targetTool.color
                    )}
                  >
                    <TargetIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">{targetTool.shortName}</p>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {tool.connectionDescriptions[targetId]}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Placeholder panel
function PlaceholderPanel() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/10 ring-1 ring-violet-500/30">
          <Zap className="h-6 w-6 text-violet-400" />
        </div>
        <p className="text-sm text-slate-400">Click a tool to explore its connections</p>
      </div>
      <div className="rounded-xl bg-white/5 p-4 border border-white/5">
        <p className="text-xs leading-relaxed text-slate-400">
          {flywheelDescription.description}
        </p>
      </div>
    </motion.div>
  );
}

// Mobile bottom sheet
function MobileBottomSheet({
  tool,
  onClose,
  reducedMotion,
}: {
  tool: FlywheelTool | null;
  onClose: () => void;
  reducedMotion: boolean;
}) {
  useEffect(() => {
    if (tool) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [tool]);

  // Get icon for the tool (or fallback)
  const Icon = tool ? (iconMap[tool.icon] || Zap) : Zap;

  return (
    <AnimatePresence>
      {tool && (
        <>
          <motion.div
            key="mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.1 : 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            key="mobile-sheet"
            initial={reducedMotion ? { opacity: 0 } : { y: "100%" }}
            animate={{ y: 0, opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { y: "100%" }}
            transition={
              reducedMotion
                ? { duration: 0.15 }
                : { type: "spring", damping: 30, stiffness: 300 }
            }
            className="fixed inset-x-0 bottom-0 z-50 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-sheet-title"
          >
            <div className="rounded-t-3xl border-t border-white/10 bg-slate-950/95 backdrop-blur-xl">
              <div className="flex justify-center pt-3 pb-2">
                <div className="h-1 w-10 rounded-full bg-white/20" />
              </div>
              <div className="max-h-[70vh] overflow-y-auto px-5 pb-8">
                <div className="flex items-center gap-4 py-4">
                  <div
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg",
                      tool.color
                    )}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 id="mobile-sheet-title" className="text-xl font-bold text-white">
                      {tool.name}
                    </h3>
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
                <Link
                  href={tool.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl py-3.5 px-4",
                    "text-base font-semibold text-white bg-gradient-to-r shadow-lg",
                    tool.color
                  )}
                >
                  View on GitHub
                  <ExternalLink className="h-5 w-5" />
                </Link>
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
                          <div
                            className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br",
                              targetTool.color
                            )}
                          >
                            <TargetIcon className="h-5 w-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-white">
                              {targetTool.shortName}
                            </p>
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

export default function FlywheelVisualization() {
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [hoveredToolId, setHoveredToolId] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion ?? false;

  const activeToolId = selectedToolId || hoveredToolId;
  const selectedTool = flywheelTools.find((t) => t.id === selectedToolId) ?? null;

  // Calculate node positions
  const positions = useMemo(() => {
    return flywheelTools.reduce((acc, tool, index) => {
      acc[tool.id] = getNodePosition(index, flywheelTools.length);
      return acc;
    }, {} as Record<string, { x: number; y: number }>);
  }, []);

  // Generate unique connections
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

  const isConnectionHighlighted = useCallback(
    (from: string, to: string) => {
      if (!activeToolId) return false;
      const activeTool = flywheelTools.find((t) => t.id === activeToolId);
      if (!activeTool) return false;
      return (
        (from === activeToolId && activeTool.connectsTo.includes(to)) ||
        (to === activeToolId && activeTool.connectsTo.includes(from))
      );
    },
    [activeToolId]
  );

  const isToolConnected = useCallback(
    (toolId: string) => {
      if (!activeToolId || toolId === activeToolId) return false;
      const activeTool = flywheelTools.find((t) => t.id === activeToolId);
      return activeTool?.connectsTo.includes(toolId) ?? false;
    },
    [activeToolId]
  );

  const handleSelectTool = useCallback((toolId: string) => {
    setSelectedToolId((prev) => (prev === toolId ? null : toolId));
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedToolId(null);
  }, []);

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-8 md:mb-12 text-center">
        <div className="mb-4 flex items-center justify-center gap-3">
          <div className="h-px w-8 bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-violet-400">
            Ecosystem
          </span>
          <div className="h-px w-8 bg-gradient-to-l from-transparent via-violet-500/50 to-transparent" />
        </div>
        <h2 className="mb-4 text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-white">
          {flywheelDescription.title}
        </h2>
        <p className="mx-auto max-w-2xl text-sm md:text-base text-slate-400">
          {flywheelDescription.subtitle}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr,340px] xl:grid-cols-[1fr,380px]">
        {/* Flywheel visualization */}
        <div
          className="relative flex items-center justify-center"
          role="img"
          aria-label="Interactive flywheel showing tool connections"
        >
          <div
            className="relative"
            style={{ width: CONTAINER_SIZE, height: CONTAINER_SIZE }}
          >
            {/* SVG for connection lines */}
            <svg
              className="absolute inset-0"
              width={CONTAINER_SIZE}
              height={CONTAINER_SIZE}
              aria-hidden="true"
            >
              <defs>
                {/* Glow filter for particles */}
                <filter id="particleGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Decorative outer ring */}
              <circle
                cx={CENTER}
                cy={CENTER}
                r={RADIUS + 20}
                fill="none"
                stroke="rgba(139, 92, 246, 0.1)"
                strokeWidth="1"
                strokeDasharray="8 6"
              />

              {/* Inner decorative ring */}
              <circle
                cx={CENTER}
                cy={CENTER}
                r={RADIUS * 0.5}
                fill="none"
                stroke="rgba(139, 92, 246, 0.08)"
                strokeWidth="1"
              />

              {/* Connection lines */}
              {connections.map(({ from, to }) => {
                const fromTool = flywheelTools.find((t) => t.id === from);
                const toTool = flywheelTools.find((t) => t.id === to);
                const fromPos = positions[from];
                const toPos = positions[to];
                if (!fromPos || !toPos || !fromTool || !toTool) return null;

                const highlighted = isConnectionHighlighted(from, to);

                return (
                  <ConnectionLine
                    key={`${from}-${to}`}
                    fromPos={fromPos}
                    toPos={toPos}
                    isHighlighted={highlighted}
                    isActive={highlighted && !!selectedToolId}
                    fromColor={fromTool.color}
                    toColor={toTool.color}
                    reducedMotion={reducedMotion}
                    connectionId={`${from}-${to}`}
                  />
                );
              })}
            </svg>

            {/* Center hub */}
            <CenterHub reducedMotion={reducedMotion} />

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

        {/* Detail panel (desktop) */}
        <div className="hidden lg:flex lg:flex-col">
          <AnimatePresence mode="wait">
            {selectedTool ? (
              <ToolDetailPanel
                key={selectedTool.id}
                tool={selectedTool}
                onClose={handleCloseDetail}
                reducedMotion={reducedMotion}
              />
            ) : (
              <PlaceholderPanel key="placeholder" />
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
