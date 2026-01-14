"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// ANIMATED COUNTER
// Counts up to a target number with easing
// =============================================================================

interface AnimatedCounterProps {
  /** Target value to count to */
  target: number;
  /** Duration of animation in seconds */
  duration?: number;
  /** Prefix (e.g., "$") */
  prefix?: string;
  /** Suffix (e.g., "B") */
  suffix?: string;
  /** Number of decimal places */
  decimals?: number;
  /** Additional classes */
  className?: string;
  /** Start animation when in view */
  startOnView?: boolean;
}

export function AnimatedCounter({
  target,
  duration = 2,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
  startOnView = true,
}: AnimatedCounterProps) {
  const prefersReducedMotion = useReducedMotion();
  // Initialize with 0 to avoid hydration mismatch (prefersReducedMotion differs server vs client)
  const [count, setCount] = useState(0);
  const hasStartedRef = useRef(false);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Handle reduced motion preference after hydration
  useEffect(() => {
    if (prefersReducedMotion && !hasStartedRef.current) {
      const hydrationId = setTimeout(() => {
        setCount(target);
        hasStartedRef.current = true;
      }, 0);
      return () => clearTimeout(hydrationId);
    }
    return undefined;
  }, [prefersReducedMotion, target]);

  useEffect(() => {
    // Skip animation entirely if reduced motion preferred
    if (prefersReducedMotion) return;

    // Start immediately if not waiting for view
    const shouldStart = startOnView ? isInView : true;
    if (!shouldStart || hasStartedRef.current) return;

    hasStartedRef.current = true;

    // Animate the counter
    const startTime = performance.now();
    const durationMs = duration * 1000;
    let animationId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);

      // Ease out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [target, duration, isInView, startOnView, prefersReducedMotion]);

  const formattedCount = count.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className} aria-label={`${prefix}${target.toLocaleString()}${suffix}`}>
      {prefix}
      {formattedCount}
      {suffix}
    </span>
  );
}

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
  const prefersReducedMotion = useReducedMotion();
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
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-2 flex items-center justify-center gap-2 text-rose-400"
        >
          <TrendingDown className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-wider">
            Single-Day Market Cap Drop
          </span>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? {} : { scale: 0.8, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4, type: "spring", bounce: 0.3 }}
        >
          <span className="block text-6xl font-black tracking-tight text-white sm:text-7xl md:text-8xl lg:text-9xl">
            <AnimatedCounter
              target={600}
              duration={prefersReducedMotion ? 0 : 2.5}
              prefix="$"
              suffix="B"
              startOnView={false}
            />
          </span>
        </motion.div>

        <motion.p
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-4 text-lg text-slate-400"
        >
          The largest in stock market history
        </motion.p>
      </div>

      {/* Stylized chart visualization */}
      {showChart && (
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.5 }}
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
              initial={prefersReducedMotion ? {} : { pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : {}}
              transition={{ duration: 1, delay: 1.8, ease: "easeOut" }}
            />

            {/* The drop */}
            <motion.path
              d={dropPath}
              fill="none"
              stroke="url(#drop-gradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={prefersReducedMotion ? {} : { pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : {}}
              transition={{ duration: 0.8, delay: 2.8, ease: "easeIn" }}
            />

            {/* Drop point marker */}
            <motion.circle
              cx="200"
              cy="40"
              r="6"
              className="fill-rose-500"
              initial={prefersReducedMotion ? {} : { scale: 0, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.3, delay: 3.2 }}
            />

            {/* End point marker */}
            <motion.circle
              cx="300"
              cy="150"
              r="6"
              className="fill-rose-600"
              initial={prefersReducedMotion ? {} : { scale: 0, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.3, delay: 3.6 }}
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
              initial={prefersReducedMotion ? {} : { opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.3, delay: 3.8 }}
            >
              Jan 26
            </motion.text>
            <motion.text
              x="260"
              y="170"
              className="fill-rose-400 text-[10px] font-semibold"
              textAnchor="middle"
              initial={prefersReducedMotion ? {} : { opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.3, delay: 4 }}
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
