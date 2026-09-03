"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/animated-number";

// =============================================================================
// MARKET CAP DROP VISUALIZATION
// Stylized SVG showing the dramatic cliff-drop shape
// =============================================================================

interface MarketCapDropProps {
  /** Show the full visualization with chart */
  showChart?: boolean;
  /** Additional classes for the container */
  className?: string;
}

export function MarketCapDrop({ showChart = true, className }: MarketCapDropProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  // SVG path for the cliff drop
  // Represents a steady line that suddenly plunges
  const steadyPath = "M 0 40 L 180 40"; // Flat line before drop
  const dropPath = "M 180 40 L 200 40 L 220 150 L 300 150"; // The dramatic drop

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* Main stat display */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-2 flex items-center justify-center gap-2 text-rose-400"
        >
          <TrendingDown className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-widest">
            Single-Day Market Cap Drop
          </span>
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.1, type: "spring", bounce: 0.3 }}
        >
          <span className="block text-6xl font-black tracking-tight text-white sm:text-7xl md:text-8xl lg:text-9xl">
            <AnimatedNumber
              value={600}
              duration={2500}
              prefix="$"
              suffix="B"
              isVisible={isInView}
            />
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-4 text-lg text-slate-400"
        >
          The largest in stock market history
        </motion.p>
      </div>

      {/* Stylized chart visualization. The line is drawn as a short sequence
          (steady → drop → markers/labels) that starts within 0.6s and finishes
          in ~1.4s instead of the previous 4s choreography. */}
      {showChart && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12"
        >
          <svg
            viewBox="0 0 300 180"
            className="mx-auto w-full max-w-md"
            aria-label="Stylized chart showing Nvidia stock price drop"
            role="img"
          >
            {/* Grid lines */}
            <g className="stroke-slate-800" strokeWidth="1">
              <line x1="0" y1="40" x2="300" y2="40" strokeDasharray="4 4" />
              <line x1="0" y1="90" x2="300" y2="90" strokeDasharray="4 4" />
              <line x1="0" y1="150" x2="300" y2="150" strokeDasharray="4 4" />
            </g>

            {/* Steady line (before drop) */}
            <motion.path
              d={steadyPath}
              fill="none"
              stroke="url(#steady-gradient)"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
            />

            {/* The drop */}
            <motion.path
              d={dropPath}
              fill="none"
              stroke="url(#drop-gradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.9, ease: "easeIn" }}
            />

            {/* Drop point marker */}
            <motion.circle
              cx="200"
              cy="40"
              r="6"
              className="fill-rose-500"
              initial={{ scale: 0, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.3, delay: 0.9 }}
            />

            {/* End point marker */}
            <motion.circle
              cx="300"
              cy="150"
              r="6"
              className="fill-rose-600"
              initial={{ scale: 0, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.3, delay: 1.3 }}
            />

            {/* Gradients */}
            <defs>
              <linearGradient id="steady-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
              <linearGradient id="drop-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
            </defs>

            {/* Labels */}
            <motion.text
              x="100"
              y="30"
              className="fill-slate-500 text-[10px]"
              textAnchor="middle"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              Jan 26
            </motion.text>
            <motion.text
              x="260"
              y="170"
              className="fill-rose-400 text-[10px] font-semibold"
              textAnchor="middle"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.3, delay: 1.3 }}
            >
              Jan 27
            </motion.text>
          </svg>
        </motion.div>
      )}
    </div>
  );
}

// =============================================================================
// COMPACT STAT BADGE
// For use in smaller contexts
// =============================================================================

export function MarketCapStatBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-4 py-2",
        className
      )}
    >
      <TrendingDown className="h-4 w-4 text-rose-400" />
      <span className="text-sm font-semibold text-rose-300">$600B drop</span>
    </div>
  );
}

export default MarketCapDrop;
