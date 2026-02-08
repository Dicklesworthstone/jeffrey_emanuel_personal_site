"use client";

import React, { useState, useMemo, useCallback, useEffect, useId } from "react";
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
  Star,
  Play,
  ArrowRight,
  Check,
  Cog,
  ShieldAlert,
  RefreshCw,
  Image,
  Archive,
  FileCode,
  Sparkles,
} from "lucide-react";
import { flywheelTools, flywheelDescription, type FlywheelTool } from "@/lib/content";
import { cn } from "@/lib/utils";
import { getColorDefinition } from "@/lib/colors";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";
import BottomSheet from "@/components/bottom-sheet";
import Magnetic from "@/components/magnetic";
import { NOISE_SVG_DATA_URI } from "@/lib/constants";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutGrid,
  ShieldCheck,
  Mail,
  GitBranch,
  Bug,
  Brain,
  Search,
  Cog,
  ShieldAlert,
  RefreshCw,
  Image,
  Archive,
  FileCode,
  Sparkles,
};

// Layout constants - base values for desktop (scaled down on mobile via CSS transform)
const CONTAINER_SIZE = 520;
const RADIUS = 200;
const CENTER = CONTAINER_SIZE / 2;
const NODE_SIZE = 60;

// Mobile scale factor - fit 520px into ~300px viewport with padding
const MOBILE_SCALE = 0.58;

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

// Check if CSS Motion Path is supported (not on mobile Safari < 15.4)
function useSupportsMotionPath() {
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    // Check if CSS Motion Path is supported
    if (typeof CSS !== "undefined" && CSS.supports) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Browser feature detection requires effect
      setSupported(CSS.supports("offset-path", "path('M 0 0')"));
    }
  }, []);
  return supported;
}

// Animated particle that flows along a connection
// Uses CSS Motion Path which has limited mobile support
function FlowingParticle({
  path,
  delay,
  duration,
  color,
  enabled,
}: {
  path: string;
  delay: number;
  duration: number;
  color: string;
  enabled: boolean;
}) {
  // Don't render if not enabled (mobile devices without support)
  if (!enabled) return null;

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

// Connection line with animated data flow
const ConnectionLine = React.memo(function ConnectionLine({
  fromPos,
  toPos,
  isHighlighted,
  isActive,
  fromColor,
  toColor,
  reducedMotion,
  connectionId,
  supportsMotionPath,
  scopeId,
}: {
  fromPos: { x: number; y: number };
  toPos: { x: number; y: number };
  isHighlighted: boolean;
  isActive: boolean;
  fromColor: string;
  toColor: string;
  reducedMotion: boolean;
  connectionId: string;
  supportsMotionPath: boolean;
  scopeId: string;
}) {
  const path = getCurvedPath(fromPos, toPos);
  const gradientId = `${scopeId}-gradient-${connectionId}`;
  const flowGradientId = `${scopeId}-flow-gradient-${connectionId}`;

  const color1 = getColorDefinition(fromColor).primary;
  const color2 = getColorDefinition(toColor).primary;

  // Calculate path length for dash animation (approximate)
  const dx = toPos.x - fromPos.x;
  const dy = toPos.y - fromPos.y;
  const pathLength = Math.sqrt(dx * dx + dy * dy) * 1.2;

  return (
    <g>
      <defs>
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse"
          x1={fromPos.x} y1={fromPos.y} x2={toPos.x} y2={toPos.y}>
          <stop offset="0%" stopColor={color1} stopOpacity={isHighlighted ? 0.9 : 0.3} />
          <stop offset="100%" stopColor={color2} stopOpacity={isHighlighted ? 0.9 : 0.3} />
        </linearGradient>
        <linearGradient id={flowGradientId} gradientUnits="userSpaceOnUse"
          x1={fromPos.x} y1={fromPos.y} x2={toPos.x} y2={toPos.y}>
          <stop offset="0%" stopColor={color1} stopOpacity={isHighlighted ? 0.8 : 0.5} />
          <stop offset="50%" stopColor={color2} stopOpacity={isHighlighted ? 0.9 : 0.6} />
          <stop offset="100%" stopColor={color1} stopOpacity={isHighlighted ? 0.8 : 0.5} />
        </linearGradient>
      </defs>

      {/* Dynamic Glow Pulse for Highlighted Connections */}
      <AnimatePresence>
        {isHighlighted && (
          <motion.path
            key="glow"
            d={path}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={12}
            strokeLinecap="round"
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ 
              opacity: [0.2, 0.4, 0.2],
              pathLength: 1 
            }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              pathLength: { duration: 0.8, ease: "easeOut" }
            }}
            style={{ filter: "blur(8px)" }}
          />
        )}
      </AnimatePresence>

      {/* Base connection line */}
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

      {/* Flowing data pulse */}
      {!reducedMotion && (
        <motion.path
          d={path}
          fill="none"
          stroke={`url(#${flowGradientId})`}
          strokeWidth={isHighlighted ? 3 : 1.5}
          strokeLinecap="round"
          strokeDasharray={`4, ${pathLength / 4}`}
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: -pathLength }}
          transition={{
            duration: isHighlighted ? 2 : 4,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ opacity: isHighlighted ? 0.8 : 0.2 }}
        />
      )}

      {/* Flowing particles */}
      {isActive && !reducedMotion && supportsMotionPath && (
        <>
          <FlowingParticle path={path} delay={0} duration={2} color={color1} enabled={supportsMotionPath} />
          <FlowingParticle path={path} delay={0.7} duration={2} color={color2} enabled={supportsMotionPath} />
          <FlowingParticle path={path} delay={1.4} duration={2} color={color1} enabled={supportsMotionPath} />
        </>
      )}
    </g>
  );
});

// Tool node component
const ToolNode = React.memo(function ToolNode({
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
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback(() => {
    lightTap();
    onSelect();
  }, [lightTap, onSelect]);

  const handleHoverInternal = useCallback((hovering: boolean) => {
    setIsHovered(hovering);
    onHover(hovering);
  }, [onHover]);

  return (
    <motion.div
      className="absolute"
      style={{
        left: position.x - NODE_SIZE / 2,
        top: position.y - NODE_SIZE / 2,
        width: NODE_SIZE,
        height: NODE_SIZE,
        zIndex: isSelected ? 30 : isConnected ? 20 : 10,
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
              delay: index * 0.05,
            }
      }
    >
      <Magnetic strength={0.25}>
        <motion.button
          onClick={handleClick}
          onMouseEnter={() => handleHoverInternal(true)}
          onMouseLeave={() => handleHoverInternal(false)}
          onFocus={() => handleHoverInternal(true)}
          onBlur={() => handleHoverInternal(false)}
          aria-label={`${tool.name}: ${tool.tagline}`}
          aria-pressed={isSelected}
          className={cn(
            "relative flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-xl border p-1.5 overflow-hidden",
            "transition-all duration-300 outline-none",
            "focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
            isSelected
              ? "border-white/50 bg-white/20 shadow-2xl shadow-violet-500/20"
              : isConnected
              ? "border-white/30 bg-white/10"
              : "border-white/10 bg-slate-900/80 hover:border-white/25 hover:bg-white/10"
          )}
          whileHover={reducedMotion ? {} : { scale: 1.05 }}
          whileTap={reducedMotion ? {} : { scale: 0.95 }}
        >
          {/* Noise Overlay */}
          <div 
            className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay transition-opacity duration-500 group-hover:opacity-[0.06]"
            style={{ backgroundImage: `url("${NOISE_SVG_DATA_URI}")` }}
          />

          {/* Glow background */}
          <motion.div
            className={cn(
              "absolute inset-0 rounded-xl blur-xl",
              `bg-gradient-to-br ${tool.color}`
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: isSelected ? 0.6 : isConnected ? 0.35 : isHovered ? 0.3 : 0.15 }}
            transition={{ duration: reducedMotion ? 0 : 0.3 }}
          />

          {/* Icon with Chromatic Aberration on hover */}
          <div
            className={cn(
              "relative z-10 flex h-7 w-7 items-center justify-center rounded-lg overflow-hidden",
              `bg-gradient-to-br ${tool.color}`,
              isSelected && "shadow-lg"
            )}
          >
            <AnimatePresence>
              {isHovered && !reducedMotion && (
                <>
                  <motion.div 
                    initial={{ opacity: 0, x: 0 }}
                    animate={{ opacity: 0.5, x: -1.5 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center text-rose-500 mix-blend-screen"
                  >
                    <Icon className="h-4 w-4" />
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, x: 0 }}
                    animate={{ opacity: 0.5, x: 1.5 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center text-cyan-500 mix-blend-screen"
                  >
                    <Icon className="h-4 w-4" />
                  </motion.div>
                </>
              )}
            </AnimatePresence>
            <Icon className="relative z-10 h-4 w-4 text-white" />
          </div>

          {/* Label */}
          <span className="relative z-10 text-[10px] font-bold uppercase tracking-wider text-white leading-tight">
            {tool.shortName}
          </span>
        </motion.button>
      </Magnetic>
    </motion.div>
  );
});

const CenterHub = React.memo(function CenterHub({ reducedMotion }: { reducedMotion: boolean }) {
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
});

// Rich tooltip for flywheel nodes - appears on hover with delay
const RichTooltip = React.memo(function RichTooltip({
  tool,
  position,
  containerSize,
  reducedMotion,
  onMouseEnter,
  onMouseLeave,
}: {
  tool: FlywheelTool;
  position: { x: number; y: number };
  containerSize: number;
  reducedMotion: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const Icon = iconMap[tool.icon] || Zap;

  // Determine tooltip placement based on node position
  // If node is on right half, tooltip goes left; if on left half, tooltip goes right
  const isRightHalf = position.x > containerSize / 2;
  const tooltipWidth = 280;
  const gap = 16;

  // Calculate tooltip position
  const tooltipStyle: React.CSSProperties = {
    position: "absolute",
    width: tooltipWidth,
    ...(isRightHalf
      ? { right: containerSize - position.x + NODE_SIZE / 2 + gap }
      : { left: position.x + NODE_SIZE / 2 + gap }),
    top: Math.max(20, Math.min(position.y - 100, containerSize - 280)),
  };

  // Format star count
  const formatStars = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}K`;
    }
    return count.toString();
  };

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: isRightHalf ? 10 : -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: isRightHalf ? 10 : -10 }}
      transition={{ duration: reducedMotion ? 0.1 : 0.2 }}
      style={tooltipStyle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="z-50 overflow-hidden rounded-xl border border-white/10 bg-slate-900/95 shadow-2xl shadow-black/50 backdrop-blur-xl"
      role="tooltip"
    >
      {/* Background gradient */}
      <div className={cn("absolute inset-0 opacity-10 bg-gradient-to-br", tool.color)} />

      <div className="relative p-4">
        {/* Header with icon, name, and stars */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br shadow-lg",
                tool.color
              )}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-white">{tool.name}</h4>
              <p className="text-xs text-slate-400">{tool.tagline}</p>
            </div>
          </div>

          {/* Star badge */}
          {tool.stars && (
            <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-400">
              <Star className="h-3 w-3 fill-current" />
              <span>{formatStars(tool.stars)}</span>
            </div>
          )}
        </div>

        {/* Key features */}
        <div className="mt-4 space-y-1.5">
          {tool.features.map((feature) => (
            <div key={feature} className="flex items-start gap-2 text-xs text-slate-300">
              <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" aria-hidden="true" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          {/* GitHub button */}
          <a
            href={tool.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold",
              "bg-white/10 text-white transition-colors hover:bg-white/20"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-3 w-3" />
            GitHub
          </a>

          {/* Live Demo button (if available) */}
          {tool.demoUrl && (
            <a
              href={tool.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold",
                "bg-gradient-to-r text-white transition-opacity hover:opacity-90",
                tool.color
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <Play className="h-3 w-3 fill-current" />
              Try Demo
            </a>
          )}

          {/* Learn More button (if project has a detail page) */}
          {tool.projectSlug && (
            <Link
              href={`/projects/${tool.projectSlug}`}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold",
                "bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              Learn More
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
});

// Tool detail panel
const ToolDetailPanel = React.memo(function ToolDetailPanel({
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
                      {tool.connectionDescriptions[targetId] || "Integration"}
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
});

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

// Ecosystem vitality badge component
const EcosystemVitalityBadge = React.memo(function EcosystemVitalityBadge({
  toolCount,
  reducedMotion,
}: {
  toolCount: number;
  reducedMotion: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.8 }}
      className="mt-6 flex justify-center"
    >
      <div className="inline-flex items-center gap-3 rounded-full border border-violet-500/20 bg-violet-500/5 px-4 py-2 backdrop-blur-sm">
        {/* Tool count */}
        <div className="flex items-center gap-1.5">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/20">
            <Zap className="h-3 w-3 text-violet-400" />
          </div>
          <span className="text-sm font-semibold text-white">{toolCount}</span>
          <span className="text-xs text-slate-400">tools</span>
        </div>

        <div className="h-4 w-px bg-violet-500/30" />

        {/* Stars estimate */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-white">10K+</span>
          <span className="text-xs text-slate-400">GitHub stars</span>
        </div>

        <div className="h-4 w-px bg-violet-500/30" />

        {/* Synergy indicator */}
        <div className="flex items-center gap-1">
          <motion.div
            className="h-2 w-2 rounded-full bg-emerald-400"
            animate={reducedMotion ? {} : {
              scale: [1, 1.3, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-xs text-emerald-400">Active</span>
        </div>
      </div>
    </motion.div>
  );
});

export default function FlywheelVisualization() {
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [hoveredToolId, setHoveredToolId] = useState<string | null>(null);
  const [tooltipToolId, setTooltipToolId] = useState<string | null>(null);
  const hoverTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion ?? false;
  const supportsMotionPath = useSupportsMotionPath();
  const toolById = useMemo(() => new Map(flywheelTools.map((tool) => [tool.id, tool])), []);
  const scopeId = useId();

  const activeToolId = selectedToolId || hoveredToolId;
  // Show detail panel for hovered tool (desktop) or selected tool (mobile/click)
  const displayedTool = flywheelTools.find((t) => t.id === activeToolId) ?? null;
  // For mobile bottom sheet, only show on explicit click/selection
  const selectedTool = flywheelTools.find((t) => t.id === selectedToolId) ?? null;
  // Tool for rich tooltip (shown with delay)
  const tooltipTool = flywheelTools.find((t) => t.id === tooltipToolId) ?? null;

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Handle hover with delay for tooltip
  const handleNodeHoverStart = useCallback((toolId: string) => {
    setHoveredToolId(toolId);
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    // Set tooltip to show after 300ms delay
    hoverTimeoutRef.current = setTimeout(() => {
      setTooltipToolId(toolId);
    }, 300);
  }, []);

  const handleNodeHoverEnd = useCallback(() => {
    setHoveredToolId(null);
    // Clear the show timeout if hover ends before tooltip shows
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    // Set a short delay before hiding tooltip to allow mouse to move to it
    hoverTimeoutRef.current = setTimeout(() => {
      setTooltipToolId(null);
    }, 150);
  }, []);

  const handleTooltipEnter = useCallback(() => {
    // Cancel the hide timeout when mouse enters tooltip
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  const handleTooltipLeave = useCallback(() => {
    // Hide tooltip immediately when mouse leaves it
    setTooltipToolId(null);
  }, []);

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

  const hasConnection = useCallback(
    (from: string, to: string) => {
      const fromTool = toolById.get(from);
      const toTool = toolById.get(to);
      return Boolean(
        fromTool?.connectsTo.includes(to) || toTool?.connectsTo.includes(from)
      );
    },
    [toolById]
  );

  const isConnectionHighlighted = useCallback(
    (from: string, to: string) => {
      if (!activeToolId) return false;
      if (activeToolId !== from && activeToolId !== to) return false;
      return hasConnection(from, to);
    },
    [activeToolId, hasConnection]
  );

  const isToolConnected = useCallback(
    (toolId: string) => {
      if (!activeToolId || toolId === activeToolId) return false;
      return hasConnection(activeToolId, toolId);
    },
    [activeToolId, hasConnection]
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
          <span className="text-xs font-bold uppercase tracking-widest text-violet-400">
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
          className="relative flex flex-col items-center justify-center"
          role="img"
          aria-label="Interactive flywheel showing tool connections"
        >
          {/* Mobile-responsive wrapper: scales 520px flywheel to fit smaller screens */}
          <div
            className="relative origin-center scale-[var(--flywheel-scale)] md:scale-100"
            style={{
              width: CONTAINER_SIZE,
              height: CONTAINER_SIZE,
              // CSS custom property for mobile scale - 520*0.58 ≈ 302px fits nicely on 375px screens
              "--flywheel-scale": MOBILE_SCALE,
            } as React.CSSProperties}
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
                    supportsMotionPath={supportsMotionPath}
                    scopeId={scopeId}
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
                onHover={(hovering) =>
                  hovering ? handleNodeHoverStart(tool.id) : handleNodeHoverEnd()
                }
                reducedMotion={reducedMotion}
              />
            ))}

            {/* Rich tooltip (desktop only - hidden on mobile via lg:block) */}
            <div className="hidden lg:block">
              <AnimatePresence>
                {tooltipTool && tooltipToolId && positions[tooltipToolId] && (
                  <RichTooltip
                    key={tooltipToolId}
                    tool={tooltipTool}
                    position={positions[tooltipToolId]}
                    containerSize={CONTAINER_SIZE}
                    reducedMotion={reducedMotion}
                    onMouseEnter={handleTooltipEnter}
                    onMouseLeave={handleTooltipLeave}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Ecosystem vitality badge */}
          <EcosystemVitalityBadge
            toolCount={flywheelTools.length}
            reducedMotion={reducedMotion}
          />
        </div>

        {/* Detail panel (desktop) - shows on hover or click */}
        <div className="hidden lg:flex lg:flex-col">
          <AnimatePresence mode="wait">
            {displayedTool ? (
              <ToolDetailPanel
                key={displayedTool.id}
                tool={displayedTool}
                onClose={handleCloseDetail}
                reducedMotion={reducedMotion}
              />
            ) : (
              <PlaceholderPanel key="placeholder" />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile bottom sheet - only shows on explicit click */}
      <BottomSheet
        isOpen={!!selectedTool}
        onClose={handleCloseDetail}
        title={selectedTool?.name}
      >
        {selectedTool && (() => {
          const ToolIcon = iconMap[selectedTool.icon] || Zap;
          return (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg",
                    selectedTool.color
                  )}
                >
                  <ToolIcon className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm text-slate-400 pt-1">{selectedTool.tagline}</p>
              </div>

              <Link
                href={selectedTool.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl py-3.5 px-4",
                  "text-base font-semibold text-white bg-gradient-to-r shadow-lg",
                  selectedTool.color
                )}
              >
                View on GitHub
                <ExternalLink className="h-5 w-5" />
              </Link>

              <div>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Integrates With
                </h4>
                <div className="space-y-2">
                  {selectedTool.connectsTo.map((targetId) => {
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
                            {selectedTool.connectionDescriptions[targetId] || "Integration"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}
      </BottomSheet>
    </div>
  );
}
