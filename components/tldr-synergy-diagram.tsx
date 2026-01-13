"use client";

import { useRef, useMemo } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
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

  // Filter to core tools only for the diagram
  const coreTools = useMemo(
    () => tools.filter((t) => t.category === "core"),
    [tools]
  );

  // Calculate node positions in a circle
  const nodePositions = useMemo(() => {
    const positions: Record<string, NodePosition> = {};
    const centerX = 200;
    const centerY = 200;
    const radius = 140;

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
            });
          }
        }
      });
    });

    return lines;
  }, [coreTools, nodePositions]);

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
          aria-label="Flywheel tool synergy diagram showing connections between core tools"
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
                  stopColor={getGradientColor(tool.color, "from")}
                />
                <stop
                  offset="100%"
                  stopColor={getGradientColor(tool.color, "to")}
                />
              </linearGradient>
            ))}
          </defs>

          {/* Center glow */}
          <circle cx="200" cy="200" r="180" fill="url(#centerGlow)" />

          {/* Connection lines */}
          <g className="connections">
            {connections.map((conn, index) => (
              <motion.line
                key={`${conn.from}-${conn.to}`}
                x1={conn.fromPos.x}
                y1={conn.fromPos.y}
                x2={conn.toPos.x}
                y2={conn.toPos.y}
                stroke="url(#lineGradient)"
                strokeWidth="1.5"
                strokeLinecap="round"
                initial={reducedMotion ? {} : { opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{
                  duration: reducedMotion ? 0 : 0.8,
                  delay: reducedMotion ? 0 : 0.3 + index * 0.05,
                }}
              />
            ))}
          </g>

          {/* Center "Flywheel" label */}
          <motion.g
            initial={reducedMotion ? {} : { opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.2 }}
          >
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
              className="fill-violet-400 text-[10px] font-bold uppercase tracking-wider"
            >
              Flywheel
            </text>
            <text
              x="200"
              y="210"
              textAnchor="middle"
              className="fill-slate-500 text-[8px]"
            >
              {coreTools.length} Core Tools
            </text>
          </motion.g>

          {/* Tool nodes */}
          {coreTools.map((tool, index) => {
            const pos = nodePositions[tool.id];
            if (!pos) return null;

            return (
              <motion.g
                key={tool.id}
                initial={reducedMotion ? {} : { opacity: 0, scale: 0 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{
                  duration: reducedMotion ? 0 : 0.4,
                  delay: reducedMotion ? 0 : 0.4 + index * 0.08,
                  type: "spring",
                  stiffness: 200,
                }}
              >
                {/* Node background */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="28"
                  fill="rgba(15, 23, 42, 0.95)"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="1"
                  className="transition-all duration-300 hover:stroke-white/30"
                />

                {/* Gradient ring */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="26"
                  fill="none"
                  stroke={`url(#gradient-${tool.id})`}
                  strokeWidth="2"
                  opacity="0.6"
                />

                {/* Tool label */}
                <text
                  x={pos.x}
                  y={pos.y + 4}
                  textAnchor="middle"
                  className="fill-white text-[11px] font-bold"
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
          <p className="text-xs text-slate-500">
            Lines represent data flow and integration between tools
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Helper to extract colors from Tailwind gradient classes
function getGradientColor(colorClass: string, type: "from" | "to"): string {
  const colorMap: Record<string, { from: string; to: string }> = {
    "from-sky-500 to-blue-600": { from: "#0ea5e9", to: "#2563eb" },
    "from-amber-500 to-orange-600": { from: "#f59e0b", to: "#ea580c" },
    "from-violet-500 to-purple-600": { from: "#8b5cf6", to: "#9333ea" },
    "from-emerald-500 to-teal-600": { from: "#10b981", to: "#0d9488" },
    "from-rose-500 to-red-600": { from: "#f43f5e", to: "#dc2626" },
    "from-pink-500 to-fuchsia-600": { from: "#ec4899", to: "#c026d3" },
    "from-cyan-500 to-sky-600": { from: "#06b6d4", to: "#0284c7" },
  };

  const colors = colorMap[colorClass];
  if (colors) {
    return colors[type];
  }
  return type === "from" ? "#8b5cf6" : "#9333ea";
}

export default TldrSynergyDiagram;
