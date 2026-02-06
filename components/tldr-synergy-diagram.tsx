"use client";

import { useRef, useMemo, useState, useCallback } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
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

  // Interactive state
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Filter to core tools only for the diagram
  const coreTools = useMemo(
    () => tools.filter((t) => t.category === "core"),
    [tools]
  );

  // Calculate node positions in a circle - adjust radius based on tool count
  const nodePositions = useMemo(() => {
    const positions: Record<string, NodePosition> = {};
    const centerX = 200;
    const centerY = 200;
    // Scale radius based on number of tools to prevent overlap
    const radius = coreTools.length > 8 ? 155 : 140;

    coreTools.forEach((tool, index) => {
      // Start from top and go clockwise
      const angle = (index / coreTools.length) * 2 * Math.PI - Math.PI / 2;
      positions[tool.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });

    return positions;
  }, [coreTools]);

  // Generate connection lines
  const connections = useMemo(() => {
    const lines: Array<{
      from: string;
      to: string;
      fromPos: NodePosition;
      toPos: NodePosition;
      sourceRgb: string;
    }> = [];

    coreTools.forEach((tool) => {
      tool.synergies.forEach((synergy) => {
        const targetTool = coreTools.find((t) => t.id === synergy.toolId);
        if (targetTool && nodePositions[tool.id] && nodePositions[synergy.toolId]) {
          // Avoid duplicate lines (A->B and B->A)
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

    // Direct synergies from hovered tool
    const tool = coreTools.find((t) => t.id === hoveredNode);
    if (tool) {
      tool.synergies.forEach((s) => {
        if (coreTools.some((t) => t.id === s.toolId)) {
          connected.add(s.toolId);
        }
      });
    }

    // Reverse connections: other tools that list hoveredNode as a synergy
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
      // Brief highlight effect via a CSS class
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
        className="mx-auto max-w-md"
      >
        <svg
          viewBox="0 0 400 400"
          className="h-auto w-full"
          aria-label="Flywheel tool synergy diagram showing connections between core tools. Click a tool to scroll to its details."
          role="img"
        >
          {/* All gradient definitions */}
          <defs>
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.5" />
              <stop offset="50%" stopColor="rgb(139, 92, 246)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="lineGradientHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.8" />
              <stop offset="50%" stopColor="rgb(167, 139, 250)" stopOpacity="1" />
              <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0.8" />
            </linearGradient>
            {/* Particle glow filter */}
            <filter id="particleGlow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Tool-specific gradients */}
            {coreTools.map((tool) => (
              <linearGradient
                key={`gradient-${tool.id}`}
                id={`gradient-${tool.id}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor={getColorDefinition(tool.color).from}
                />
                <stop
                  offset="100%"
                  stopColor={getColorDefinition(tool.color).to}
                />
              </linearGradient>
            ))}
          </defs>

          {/* Center glow */}
          <circle cx="200" cy="200" r="180" fill="url(#centerGlow)" />

          {/* Connection lines */}
          <g className="connections">
            {connections.map((conn, index) => {
              const highlighted = isConnectionHighlighted(conn.from, conn.to);
              const dimmed = hoveredNode && !highlighted;

              return (
                <motion.line
                  key={`${conn.from}-${conn.to}`}
                  x1={conn.fromPos.x}
                  y1={conn.fromPos.y}
                  x2={conn.toPos.x}
                  y2={conn.toPos.y}
                  stroke={highlighted ? "url(#lineGradientHighlight)" : "url(#lineGradient)"}
                  strokeWidth={highlighted ? 2.5 : 1.5}
                  strokeLinecap="round"
                  initial={reducedMotion ? {} : { opacity: 0 }}
                  animate={isInView ? { opacity: dimmed ? 0.15 : 1 } : {}}
                  transition={{
                    duration: reducedMotion ? 0 : 0.8,
                    delay: reducedMotion ? 0 : 0.3 + index * 0.05,
                  }}
                  style={{ transition: "stroke-width 200ms, opacity 200ms" }}
                />
              );
            })}

            {/* Animated flow particles (SMIL-based to avoid re-render restarts) */}
            {!reducedMotion && isInView && connections.map((conn, index) => {
              const delay1 = ((index * 0.7) % 3).toFixed(1);
              const delay2 = (((index * 0.7) + 1.8) % 3.5).toFixed(1);

              return (
                <g key={`particles-${conn.from}-${conn.to}`} className="pointer-events-none">
                  {/* Primary particle - source → target */}
                  <circle r="3" fill={`rgb(${conn.sourceRgb})`} filter="url(#particleGlow)" opacity="0">
                    <animate attributeName="cx" values={`${conn.fromPos.x};${conn.toPos.x}`} dur="3s" repeatCount="indefinite" begin={`${delay1}s`} />
                    <animate attributeName="cy" values={`${conn.fromPos.y};${conn.toPos.y}`} dur="3s" repeatCount="indefinite" begin={`${delay1}s`} />
                    <animate attributeName="opacity" values="0;0.8;0.8;0" dur="3s" repeatCount="indefinite" begin={`${delay1}s`} />
                  </circle>
                  {/* Secondary particle - target → source (smaller, offset) */}
                  <circle r="2" fill={`rgb(${conn.sourceRgb})`} opacity="0">
                    <animate attributeName="cx" values={`${conn.toPos.x};${conn.fromPos.x}`} dur="3.5s" repeatCount="indefinite" begin={`${delay2}s`} />
                    <animate attributeName="cy" values={`${conn.toPos.y};${conn.fromPos.y}`} dur="3.5s" repeatCount="indefinite" begin={`${delay2}s`} />
                    <animate attributeName="opacity" values="0;0.5;0.5;0" dur="3.5s" repeatCount="indefinite" begin={`${delay2}s`} />
                  </circle>
                </g>
              );
            })}
          </g>

          {/* Center "Flywheel" label */}
          <motion.g
            initial={reducedMotion ? {} : { opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.2 }}
          >
            {/* Subtle breathing glow behind center node */}
            {!reducedMotion && isInView && (
              <motion.circle
                cx="200"
                cy="200"
                r="42"
                fill="none"
                stroke="rgba(139, 92, 246, 0.15)"
                strokeWidth="1"
                animate={{ r: [42, 48, 42], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="pointer-events-none"
              />
            )}
            <circle
              cx="200"
              cy="200"
              r="35"
              fill="rgba(15, 23, 42, 0.9)"
              stroke="rgba(139, 92, 246, 0.3)"
              strokeWidth="2"
            />
            <text
              x="200"
              y="196"
              textAnchor="middle"
              className="fill-violet-400 text-xs font-bold uppercase tracking-wider"
            >
              Flywheel
            </text>
            <text
              x="200"
              y="210"
              textAnchor="middle"
              className="fill-slate-500 text-[9px]"
            >
              {coreTools.length} Core Tools
            </text>
          </motion.g>

          {/* Tool nodes - smaller when more tools */}
          {coreTools.map((tool, index) => {
            const pos = nodePositions[tool.id];
            if (!pos) return null;
            // Smaller nodes when we have more tools
            const nodeRadius = coreTools.length > 8 ? 22 : 28;
            const ringRadius = coreTools.length > 8 ? 20 : 26;
            const fontSize = coreTools.length > 8 ? "9px" : "11px";
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
                  stroke={`url(#gradient-${tool.id})`}
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

        {/* Legend */}
        <motion.div
          initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.8 }}
          className="mt-6 text-center"
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
