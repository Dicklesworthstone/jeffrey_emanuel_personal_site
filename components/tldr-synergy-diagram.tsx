"use client";

import { useRef, useMemo, useState, useCallback, useId } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { getColorDefinition } from "@/lib/colors";
import type { TldrFlywheelTool } from "@/lib/content";

// =============================================================================
// TYPES
// =============================================================================

interface TldrSynergyDiagramProps {
  tools: TldrFlywheelTool[];
  className?: string;
}

interface NodePosition {
  x: number;
  y: number;
}

// SVG viewBox dimensions
const VB_SIZE = 460;
const VB_CENTER = VB_SIZE / 2;
const VB_RADIUS = 175;

// Generate a curved path between two points through the center area
function getCurvedPath(from: NodePosition, to: NodePosition) {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const pullFactor = 0.3;
  const controlX = midX + (VB_CENTER - midX) * pullFactor;
  const controlY = midY + (VB_CENTER - midY) * pullFactor;
  return `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function TldrSynergyDiagram({
  tools,
  className,
}: TldrSynergyDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion ?? false;
  const scopeId = useId();

  // Interactive state
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Filter to core tools only for the diagram
  const coreTools = useMemo(
    () => tools.filter((t) => t.category === "core"),
    [tools]
  );

  // Calculate node positions in a circle
  const nodePositions = useMemo(() => {
    const positions: Record<string, NodePosition> = {};
    coreTools.forEach((tool, index) => {
      const angle = (index / coreTools.length) * 2 * Math.PI - Math.PI / 2;
      positions[tool.id] = {
        x: VB_CENTER + VB_RADIUS * Math.cos(angle),
        y: VB_CENTER + VB_RADIUS * Math.sin(angle),
      };
    });
    return positions;
  }, [coreTools]);

  // Generate connection lines with both colors
  const connections = useMemo(() => {
    const lines: Array<{
      from: string;
      to: string;
      fromPos: NodePosition;
      toPos: NodePosition;
      fromColor: string;
      toColor: string;
      sourceRgb: string;
    }> = [];

    coreTools.forEach((tool) => {
      tool.synergies.forEach((synergy) => {
        const targetTool = coreTools.find((t) => t.id === synergy.toolId);
        if (targetTool && nodePositions[tool.id] && nodePositions[synergy.toolId]) {
          const existingLine = lines.find(
            (l) =>
              (l.from === synergy.toolId && l.to === tool.id) ||
              (l.from === tool.id && l.to === synergy.toolId)
          );
          if (!existingLine) {
            lines.push({
              from: tool.id,
              to: synergy.toolId,
              fromPos: nodePositions[tool.id],
              toPos: nodePositions[synergy.toolId],
              fromColor: tool.color,
              toColor: targetTool.color,
              sourceRgb: getColorDefinition(tool.color).rgb,
            });
          }
        }
      });
    });

    return lines;
  }, [coreTools, nodePositions]);

  // Compute connected nodes for hover highlighting
  const connectedToHovered = useMemo(() => {
    if (!hoveredNode) return new Set<string>();
    const connected = new Set<string>();

    const tool = coreTools.find((t) => t.id === hoveredNode);
    if (tool) {
      tool.synergies.forEach((s) => {
        if (coreTools.some((t) => t.id === s.toolId)) {
          connected.add(s.toolId);
        }
      });
    }

    coreTools.forEach((t) => {
      t.synergies.forEach((s) => {
        if (s.toolId === hoveredNode) {
          connected.add(t.id);
        }
      });
    });

    return connected;
  }, [hoveredNode, coreTools]);

  // Check if a connection is highlighted
  const isConnectionHighlighted = useCallback(
    (from: string, to: string) => {
      if (!hoveredNode) return false;
      return from === hoveredNode || to === hoveredNode;
    },
    [hoveredNode]
  );

  // Get node opacity based on hover state
  const getNodeOpacity = useCallback(
    (toolId: string) => {
      if (!hoveredNode) return 1;
      if (toolId === hoveredNode) return 1;
      if (connectedToHovered.has(toolId)) return 1;
      return 0.25;
    },
    [hoveredNode, connectedToHovered]
  );

  // Click handler: scroll to the tool card
  const handleNodeClick = useCallback((toolId: string) => {
    const element = document.getElementById(`tool-card-${toolId}`);
    if (element) {
      element.scrollIntoView({
        behavior: prefersReducedMotion ? "instant" : "smooth",
        block: "center",
      });
      element.classList.add("ring-2", "ring-violet-400/60", "rounded-2xl");
      setTimeout(() => {
        element.classList.remove("ring-2", "ring-violet-400/60", "rounded-2xl");
      }, 1500);
    }
  }, [prefersReducedMotion]);

  // Keyboard handler for nodes
  const handleNodeKeyDown = useCallback(
    (e: React.KeyboardEvent, toolId: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleNodeClick(toolId);
      }
    },
    [handleNodeClick]
  );

  // Total stars for vitality badge
  const totalStars = useMemo(
    () => coreTools.reduce((sum, t) => sum + (t.stars ?? 0), 0),
    [coreTools]
  );

  // Defensive: handle no core tools (guard placed after all hooks)
  if (coreTools.length === 0) {
    return (
      <div ref={containerRef} className={cn("relative", className)}>
        <div className="mx-auto flex h-48 max-w-md items-center justify-center rounded-2xl border border-slate-800/40 bg-slate-900/30">
          <p className="text-sm text-slate-500">No tools to visualize</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <motion.div
        initial={reducedMotion ? {} : { opacity: 0, scale: 0.95 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: reducedMotion ? 0 : 0.6 }}
        className="mx-auto max-w-lg"
      >
        <svg
          viewBox={`0 0 ${VB_SIZE} ${VB_SIZE}`}
          className="h-auto w-full"
          aria-label="Flywheel tool synergy diagram showing connections between core tools. Click a tool to scroll to its details."
          role="img"
        >
          {/* All gradient definitions */}
          <defs>
            <radialGradient id={`${scopeId}-centerGlow`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0" />
            </radialGradient>

            {/* Particle glow filter */}
            <filter id={`${scopeId}-particleGlow`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Tool-specific gradients */}
            {coreTools.map((tool) => (
              <linearGradient
                key={`gradient-${tool.id}`}
                id={`${scopeId}-gradient-${tool.id}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor={getColorDefinition(tool.color).from} />
                <stop offset="100%" stopColor={getColorDefinition(tool.color).to} />
              </linearGradient>
            ))}

            {/* Per-connection gradient definitions */}
            {connections.map((conn) => {
              const color1 = getColorDefinition(conn.fromColor).primary;
              const color2 = getColorDefinition(conn.toColor).primary;
              const gradId = `${scopeId}-conn-${conn.from}-${conn.to}`;
              const flowId = `${scopeId}-flow-${conn.from}-${conn.to}`;
              const highlighted = isConnectionHighlighted(conn.from, conn.to);
              return (
                <g key={`defs-${conn.from}-${conn.to}`}>
                  <linearGradient
                    id={gradId}
                    gradientUnits="userSpaceOnUse"
                    x1={conn.fromPos.x}
                    y1={conn.fromPos.y}
                    x2={conn.toPos.x}
                    y2={conn.toPos.y}
                  >
                    <stop offset="0%" stopColor={color1} stopOpacity={highlighted ? 0.9 : 0.3} />
                    <stop offset="100%" stopColor={color2} stopOpacity={highlighted ? 0.9 : 0.3} />
                  </linearGradient>
                  <linearGradient
                    id={flowId}
                    gradientUnits="userSpaceOnUse"
                    x1={conn.fromPos.x}
                    y1={conn.fromPos.y}
                    x2={conn.toPos.x}
                    y2={conn.toPos.y}
                  >
                    <stop offset="0%" stopColor={color1} stopOpacity={highlighted ? 0.8 : 0.5} />
                    <stop offset="50%" stopColor={color2} stopOpacity={highlighted ? 0.9 : 0.6} />
                    <stop offset="100%" stopColor={color1} stopOpacity={highlighted ? 0.8 : 0.5} />
                  </linearGradient>
                </g>
              );
            })}
          </defs>

          {/* Center glow */}
          <circle cx={VB_CENTER} cy={VB_CENTER} r={VB_RADIUS + 40} fill={`url(#${scopeId}-centerGlow)`} />

          {/* Decorative outer ring */}
          <circle
            cx={VB_CENTER}
            cy={VB_CENTER}
            r={VB_RADIUS + 20}
            fill="none"
            stroke="rgba(139, 92, 246, 0.1)"
            strokeWidth="1"
            strokeDasharray="8 6"
          />

          {/* Inner decorative ring */}
          <circle
            cx={VB_CENTER}
            cy={VB_CENTER}
            r={VB_RADIUS * 0.5}
            fill="none"
            stroke="rgba(139, 92, 246, 0.08)"
            strokeWidth="1"
          />

          {/* Connection lines with curves, gradients, glow, and flow */}
          <g className="connections">
            {connections.map((conn, index) => {
              const highlighted = isConnectionHighlighted(conn.from, conn.to);
              const dimmed = hoveredNode && !highlighted;
              const path = getCurvedPath(conn.fromPos, conn.toPos);
              const gradId = `${scopeId}-conn-${conn.from}-${conn.to}`;
              const flowId = `${scopeId}-flow-${conn.from}-${conn.to}`;

              // Approximate path length for dash animation
              const dx = conn.toPos.x - conn.fromPos.x;
              const dy = conn.toPos.y - conn.fromPos.y;
              const pathLength = Math.sqrt(dx * dx + dy * dy) * 1.2;

              return (
                <g key={`${conn.from}-${conn.to}`}>
                  {/* Glow layer for highlighted connections */}
                  {highlighted && (
                    <motion.path
                      d={path}
                      fill="none"
                      stroke={`url(#${gradId})`}
                      strokeWidth={8}
                      strokeLinecap="round"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.4 }}
                      style={{ filter: "blur(6px)" }}
                    />
                  )}

                  {/* Base curved connection line */}
                  <motion.path
                    d={path}
                    fill="none"
                    stroke={`url(#${gradId})`}
                    strokeWidth={highlighted ? 2.5 : 1.5}
                    strokeLinecap="round"
                    initial={reducedMotion ? {} : { pathLength: 0, opacity: 0 }}
                    animate={isInView ? {
                      pathLength: 1,
                      opacity: dimmed ? 0.15 : highlighted ? 1 : 0.4,
                    } : {}}
                    transition={{
                      pathLength: { duration: reducedMotion ? 0 : 0.8, ease: "easeOut", delay: reducedMotion ? 0 : 0.3 + index * 0.03 },
                      opacity: { duration: reducedMotion ? 0 : 0.3, delay: reducedMotion ? 0 : 0.3 + index * 0.03 },
                    }}
                  />

                  {/* Animated flowing dash */}
                  {!reducedMotion && isInView && (
                    <motion.path
                      d={path}
                      fill="none"
                      stroke={`url(#${flowId})`}
                      strokeWidth={highlighted ? 2 : 1}
                      strokeLinecap="round"
                      strokeDasharray={`${pathLength * 0.15} ${pathLength * 0.35}`}
                      initial={{ strokeDashoffset: 0 }}
                      animate={{ strokeDashoffset: -pathLength * 0.5 }}
                      transition={{
                        duration: highlighted ? 1.5 : 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      style={{ opacity: dimmed ? 0.1 : highlighted ? 0.7 : 0.3 }}
                    />
                  )}
                </g>
              );
            })}

            {/* Animated flow particles (SMIL-based) */}
            {!reducedMotion && isInView && connections.map((conn, index) => {
              const path = getCurvedPath(conn.fromPos, conn.toPos);
              const delay1 = ((index * 0.7) % 3).toFixed(1);
              const delay2 = (((index * 0.7) + 1.8) % 3.5).toFixed(1);

              return (
                <g key={`particles-${conn.from}-${conn.to}`} className="pointer-events-none">
                  {/* Primary particle - follows curved path via SMIL animateMotion */}
                  <circle r="3" fill={`rgb(${conn.sourceRgb})`} filter={`url(#${scopeId}-particleGlow)`} opacity="0">
                    <animateMotion dur="3s" repeatCount="indefinite" begin={`${delay1}s`} path={path} />
                    <animate attributeName="opacity" values="0;0.8;0.8;0" dur="3s" repeatCount="indefinite" begin={`${delay1}s`} />
                  </circle>
                  {/* Secondary particle - reverse */}
                  <circle r="2" fill={`rgb(${conn.sourceRgb})`} opacity="0">
                    <animateMotion dur="3.5s" repeatCount="indefinite" begin={`${delay2}s`} path={path} keyPoints="1;0" keyTimes="0;1" calcMode="linear" />
                    <animate attributeName="opacity" values="0;0.5;0.5;0" dur="3.5s" repeatCount="indefinite" begin={`${delay2}s`} />
                  </circle>
                </g>
              );
            })}
          </g>

          {/* Center hub with pulsing glow */}
          <motion.g
            initial={reducedMotion ? {} : { opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.2 }}
          >
            {/* Pulsing glow ring */}
            {!reducedMotion && isInView && (
              <motion.circle
                cx={VB_CENTER}
                cy={VB_CENTER}
                r="42"
                fill="none"
                stroke="rgba(139, 92, 246, 0.15)"
                strokeWidth="1"
                animate={{ r: [42, 50, 42], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="pointer-events-none"
              />
            )}
            <circle
              cx={VB_CENTER}
              cy={VB_CENTER}
              r="35"
              fill="rgba(15, 23, 42, 0.9)"
              stroke="rgba(139, 92, 246, 0.4)"
              strokeWidth="2"
            />
            {/* Pulsing box-shadow via a slightly larger circle */}
            {!reducedMotion && isInView && (
              <motion.circle
                cx={VB_CENTER}
                cy={VB_CENTER}
                r="36"
                fill="none"
                stroke="rgba(139, 92, 246, 0.3)"
                strokeWidth="4"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{ filter: "blur(4px)" }}
                className="pointer-events-none"
              />
            )}
            <text
              x={VB_CENTER}
              y={VB_CENTER - 4}
              textAnchor="middle"
              className="fill-violet-400 text-xs font-bold uppercase tracking-wider"
            >
              Flywheel
            </text>
            <text
              x={VB_CENTER}
              y={VB_CENTER + 10}
              textAnchor="middle"
              className="fill-slate-500 text-[9px]"
            >
              {coreTools.length} Core Tools
            </text>
          </motion.g>

          {/* Tool nodes */}
          {coreTools.map((tool, index) => {
            const pos = nodePositions[tool.id];
            if (!pos) return null;
            const nodeRadius = coreTools.length > 10 ? 20 : coreTools.length > 8 ? 22 : 28;
            const ringRadius = coreTools.length > 10 ? 18 : coreTools.length > 8 ? 20 : 26;
            const fontSize = coreTools.length > 10 ? "8px" : coreTools.length > 8 ? "9px" : "11px";
            const nodeOpacity = getNodeOpacity(tool.id);
            const isHovered = hoveredNode === tool.id;

            return (
              <motion.g
                key={tool.id}
                role="button"
                tabIndex={0}
                aria-label={`${tool.shortName} - click to scroll to details`}
                onMouseEnter={() => setHoveredNode(tool.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onFocus={() => setHoveredNode(tool.id)}
                onBlur={() => setHoveredNode(null)}
                onClick={() => handleNodeClick(tool.id)}
                onKeyDown={(e) => handleNodeKeyDown(e, tool.id)}
                whileHover={reducedMotion ? {} : { scale: 1.15 }}
                initial={reducedMotion ? {} : { opacity: 0, scale: 0 }}
                animate={isInView ? { opacity: nodeOpacity, scale: 1 } : {}}
                transition={{
                  duration: reducedMotion ? 0 : 0.4,
                  delay: reducedMotion ? 0 : 0.4 + index * 0.05,
                  type: "spring",
                  stiffness: 200,
                }}
                className="cursor-pointer outline-none"
                style={{ transition: "opacity 200ms" }}
              >
                {/* Glow behind node on hover */}
                {isHovered && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeRadius + 6}
                    fill={getColorDefinition(tool.color).primary}
                    opacity={0.2}
                    style={{ filter: "blur(8px)" }}
                  />
                )}

                {/* Focus ring (visible on keyboard focus) */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={nodeRadius + 4}
                  fill="none"
                  stroke="rgb(139, 92, 246)"
                  strokeWidth="2"
                  opacity={0}
                  className="[g:focus-visible>&]:opacity-60"
                />

                {/* Node background */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={nodeRadius}
                  fill="rgba(15, 23, 42, 0.95)"
                  stroke={isHovered ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.1)"}
                  strokeWidth={isHovered ? 1.5 : 1}
                  style={{ transition: "stroke 200ms, stroke-width 200ms" }}
                />

                {/* Gradient ring */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={ringRadius}
                  fill="none"
                  stroke={`url(#${scopeId}-gradient-${tool.id})`}
                  strokeWidth={isHovered ? 3 : 2}
                  opacity={isHovered ? 0.9 : 0.6}
                  style={{ transition: "stroke-width 200ms, opacity 200ms" }}
                />

                {/* Tool label */}
                <text
                  x={pos.x}
                  y={pos.y + 3}
                  textAnchor="middle"
                  className="fill-white font-bold pointer-events-none"
                  style={{ fontSize }}
                >
                  {tool.shortName}
                </text>
              </motion.g>
            );
          })}
        </svg>

        {/* Ecosystem vitality badge */}
        <motion.div
          initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.8 }}
          className="mt-6 flex justify-center"
        >
          <div className="inline-flex items-center gap-3 rounded-full border border-violet-500/20 bg-violet-500/5 px-4 py-2 backdrop-blur-sm">
            {/* Tool count */}
            <div className="flex items-center gap-1.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/20">
                <Zap className="h-3 w-3 text-violet-400" />
              </div>
              <span className="text-sm font-semibold text-white">{coreTools.length}</span>
              <span className="text-xs text-slate-400">tools</span>
            </div>

            <div className="h-4 w-px bg-violet-500/30" />

            {/* Stars */}
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-white">
                {totalStars >= 1000 ? `${(totalStars / 1000).toFixed(1).replace(/\.0$/, "")}K+` : `${totalStars}+`}
              </span>
              <span className="text-xs text-slate-400">GitHub stars</span>
            </div>

            <div className="h-4 w-px bg-violet-500/30" />

            {/* Active indicator */}
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

        {/* Legend */}
        <motion.div
          initial={reducedMotion ? {} : { opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 1 }}
          className="mt-3 text-center"
        >
          <p className="text-xs text-slate-500" aria-live="polite" aria-atomic="true">
            {hoveredNode
              ? `Showing connections for ${coreTools.find((t) => t.id === hoveredNode)?.shortName ?? "tool"}`
              : "Hover a tool to see connections \u00b7 Click to scroll to details"}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default TldrSynergyDiagram;
