"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Eye, Heart, Bookmark, TrendingUp } from "lucide-react";

interface XEngagementStat {
  icon: typeof Eye;
  label: string;
  value: string;
  numericValue: number;
}

const engagementStats: XEngagementStat[] = [
  { icon: Eye, label: "Impressions", value: "25.7M", numericValue: 25.7 },
  { icon: Heart, label: "Likes", value: "154.8K", numericValue: 154.8 },
  { icon: Bookmark, label: "Bookmarks", value: "62.8K", numericValue: 62.8 },
];

function AnimatedNumber({
  end,
  suffix,
  duration = 1500,
  isVisible,
  decimals = 1,
}: {
  end: number;
  suffix: string;
  duration?: number;
  isVisible: boolean;
  decimals?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  // Initialize with 0/false to avoid hydration mismatch (prefersReducedMotion differs server vs client)
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

  // Handle reduced motion preference after hydration
  useEffect(() => {
    if (prefersReducedMotion && !hasAnimated) {
      const hydrationId = setTimeout(() => {
        setCount(end);
        setHasAnimated(true);
      }, 0);
      return () => clearTimeout(hydrationId);
    }
    return undefined;
  }, [prefersReducedMotion, end, hasAnimated]);

  useEffect(() => {
    if (prefersReducedMotion || !isVisible || hasAnimated) return;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - (startTimeRef.current ?? timestamp);
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const currentCount = easedProgress * end;

      setCount(currentCount);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end);
        setHasAnimated(true);
      }
    };

    startTimeRef.current = null;
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isVisible, hasAnimated, end, duration, prefersReducedMotion]);

  const currentCount = prefersReducedMotion ? end : count;
  const displayNumber = currentCount.toFixed(decimals);

  return (
    <span className="tabular-nums">
      {displayNumber}
      {suffix}
    </span>
  );
}

export default function XStatsCard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasExpandedOnce, setHasExpandedOnce] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Track if we've ever expanded (for animation purposes)
  useEffect(() => {
    if (isExpanded && !hasExpandedOnce) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- One-time animation trigger based on user interaction
      setHasExpandedOnce(true);
    }
  }, [isExpanded, hasExpandedOnce]);

  return (
    <div
      ref={containerRef}
      className="group relative bg-slate-950/40 px-6 py-6 backdrop-blur transition-colors hover:bg-slate-950/20"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      onFocus={() => setIsExpanded(true)}
      onBlur={() => setIsExpanded(false)}
      tabIndex={0}
      role="button"
      aria-expanded={isExpanded}
      aria-label="X/Twitter audience statistics. Hover or focus to see 2025 engagement highlights."
    >
      {/* Subtle inner glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Main stat - matching other stats grid items */}
      <dt className="text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors group-hover:text-sky-400/70">
        Audience on X
      </dt>
      <dd className="mt-3 text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
        <AnimatedNumber
          end={29}
          suffix="K+"
          duration={1800}
          isVisible={isVisible}
          decimals={0}
        />
      </dd>
      <p className="mt-2 text-xs font-medium leading-relaxed text-slate-400/80">
        Analysts, founders, researchers, and engineers.
      </p>

      {/* 2025 Engagement Stats - Expandable (always mounted to preserve animation state) */}
      <motion.div
        initial={false}
        animate={{
          opacity: isExpanded ? 1 : 0,
          height: isExpanded ? "auto" : 0,
        }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
        className="overflow-hidden"
        style={{ pointerEvents: isExpanded ? "auto" : "none" }}
      >
            <div className="mt-4 border-t border-slate-700/50 pt-4">
              <div className="mb-2 flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400/90">
                  2025 Highlights
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {engagementStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="flex flex-col items-center rounded-lg bg-slate-800/50 px-1.5 py-1.5"
                    >
                      <Icon className="mb-0.5 h-2.5 w-2.5 text-slate-400" />
                      <span className="text-xs font-bold text-slate-200">
                        <AnimatedNumber
                          end={stat.numericValue}
                          suffix={stat.value.includes("M") ? "M" : "K"}
                          duration={1200 + index * 150}
                          isVisible={hasExpandedOnce}
                          decimals={stat.value.includes(".") ? 1 : 0}
                        />
                      </span>
                      <span className="text-[7px] font-medium uppercase tracking-wider text-slate-500">
                        {stat.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
      </motion.div>

      {/* Hint to expand */}
      <motion.div
        className="mt-3 flex items-center gap-1 text-[9px] font-medium text-slate-600"
        animate={{ opacity: isExpanded ? 0 : 1 }}
        transition={{ duration: 0.15 }}
      >
        <span className="hidden sm:inline">Hover for 2025 stats</span>
        <span className="sm:hidden">Tap for 2025 stats</span>
      </motion.div>
    </div>
  );
}
