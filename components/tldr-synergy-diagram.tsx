"use client";

import { useRef, useMemo, useState, useCallback, useId } from "react";
import { useReducedMotion } from "framer-motion";
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
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion ?? false;
  const scopeId = useId();
  const shouldAnimateDiagram =
    typeof window !== "undefined" &&
    !reducedMotion &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

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
      const previousScroll = window.scrollY;
      const targetScroll =
        element.getBoundingClientRect().top +
        window.scrollY -
        Math.round(window.innerHeight * 0.35);

      window.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: shouldAnimateDiagram ? "smooth" : "auto",
      });

      window.setTimeout(() => {
        if (Math.abs(window.scrollY - previousScroll) < 2) {
          window.scrollTo({
            top: Math.max(0, Math.min(document.body.scrollHeight - 1, previousScroll + 2)),
            behavior: "auto",
          });
        }
      }, 100);

      const targetCard = element.querySelector('[data-testid="tool-card"]') ?? element;
      targetCard.classList.add("ring-2", "ring-violet-400/60", "rounded-2xl");
      setTimeout(() => {
        targetCard.classList.remove("ring-2", "ring-violet-400/60", "rounded-2xl");
      }, 1500);
    }
  }, [shouldAnimateDiagram]);

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
      <div className="mx-auto max-w-lg">
        <svg
          viewBox={`0 0 ${VB_SIZE} ${VB_SIZE}`}
          className="h-auto w-full"
          aria-label="Flywheel tool synergy diagram showing connections between core tools. Click a tool to scroll to its details."
          tabIndex={-1}
          focusable="false"
        >
          {/* All gradient definitions */}
          <defs>
            <radialGradient id={`${scopeId}-centerGlow`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0" />
            </radialGradient>

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
              return (
                <linearGradient
                  key={`defs-${conn.from}-${conn.to}`}
                  id={gradId}
                  gradientUnits="userSpaceOnUse"
                  x1={conn.fromPos.x}
                  y1={conn.fromPos.y}
                  x2={conn.toPos.x}
                  y2={conn.toPos.y}
                >
                  <stop offset="0%" stopColor={color1} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={color2} stopOpacity="0.35" />
                </linearGradient>
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

          {/* Connection lines */}
          <g className="connections">
            {connections.map((conn) => {
              const highlighted = isConnectionHighlighted(conn.from, conn.to);
              const dimmed = hoveredNode && !highlighted;
              const path = getCurvedPath(conn.fromPos, conn.toPos);
              const gradId = `${scopeId}-conn-${conn.from}-${conn.to}`;

              return (
                <g key={`${conn.from}-${conn.to}`}>
                  {/* Base curved connection line */}
                  <line
                    x1={conn.fromPos.x}
                    y1={conn.fromPos.y}
                    x2={conn.toPos.x}
                    y2={conn.toPos.y}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="0"
                  />

                  <path
                    d={path}
                    fill="none"
                    stroke={`url(#${gradId})`}
                    strokeWidth={highlighted ? 2.5 : 1.5}
                    strokeLinecap="round"
                    opacity={dimmed ? 0.15 : highlighted ? 1 : 0.4}
                  />
                </g>
              );
            })}
          </g>

          {/* Center hub */}
          <g>
            <circle
              cx={VB_CENTER}
              cy={VB_CENTER}
              r="35"
              fill="rgba(15, 23, 42, 0.9)"
              stroke="rgba(139, 92, 246, 0.4)"
              strokeWidth="2"
            />
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
          </g>

          {/* Tool nodes */}
          {coreTools.map((tool) => {
            const pos = nodePositions[tool.id];
            if (!pos) return null;
            const nodeRadius = coreTools.length > 10 ? 20 : coreTools.length > 8 ? 22 : 28;
            const ringRadius = coreTools.length > 10 ? 18 : coreTools.length > 8 ? 20 : 26;
            const fontSize = coreTools.length > 10 ? "8px" : coreTools.length > 8 ? "9px" : "11px";
            const nodeOpacity = getNodeOpacity(tool.id);
            const isHovered = hoveredNode === tool.id;

            return (
              <g
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
                className="cursor-pointer outline-none"
                style={{
                  opacity: nodeOpacity,
                  transformOrigin: `${pos.x}px ${pos.y}px`,
                  transform: isHovered ? "scale(1.05)" : "scale(1)",
                  transition:
                    shouldAnimateDiagram ? "opacity 120ms linear, transform 120ms linear" : "none",
                  pointerEvents: shouldAnimateDiagram || hoveredNode === tool.id ? "auto" : "auto",
                }}
              >
                {/* Glow behind node on hover */}
                {isHovered && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeRadius + 6}
                    fill={getColorDefinition(tool.color).primary}
                    opacity={0.22}
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
                  opacity={isHovered ? 0.6 : 0}
                />

                {/* Node background */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={nodeRadius}
                  fill="rgba(15, 23, 42, 0.95)"
                  stroke={isHovered ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.1)"}
                  strokeWidth={isHovered ? 1.5 : 1}
                  style={{ transition: "stroke 120ms linear, stroke-width 120ms linear" }}
                />

                {/* Gradient ring */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={ringRadius}
                  fill="none"
                  stroke={`url(#${scopeId}-gradient-${tool.id}`)}
                  strokeWidth={isHovered ? 3 : 2}
                  opacity={isHovered ? 0.9 : 0.6}
                  style={{ transition: "stroke-width 120ms linear, opacity 120ms linear" }}
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
              </g>
            );
          })}
        </svg>

        {/* Ecosystem vitality badge */}
        <div className="mt-6 flex justify-center">
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
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-emerald-400">Active</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 text-center">
          <p className="text-xs text-slate-500" aria-live="polite" aria-atomic="true">
            {hoveredNode
              ? `Showing connections for ${coreTools.find((t) => t.id === hoveredNode)?.shortName ?? "tool"}`
              : "Hover a tool to see connections · Click to scroll to details"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default TldrSynergyDiagram;
