"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useReducedMotion } from "framer-motion";
import type { Stat } from "@/lib/content";
import XStatsCard from "@/components/x-stats-card";

/**
 * Parse a stat value string like "10K+" into animated components.
 * Exported for testing.
 */
export function parseStatValue(value: string): {
  number: number;
  suffix: string;
  isAnimatable: boolean;
} {
  // Match patterns like "10K+", "7", "15+", "20K+"
  const match = value.match(/^([0-9,.]+)(K|M|B)?(\+)?$/i);

  if (!match) {
    return { number: 0, suffix: value, isAnimatable: false };
  }

  const [, numStr, magnitude, plus] = match;
  const num = parseFloat(numStr.replace(/,/g, ""));
  const suffix = `${magnitude || ""}${plus || ""}`;

  return { number: num, suffix, isAnimatable: true };
}

/**
 * Animated stat number component
 */
function AnimatedNumber({
  end,
  suffix,
  duration = 2000,
  isVisible,
}: {
  end: number;
  suffix: string;
  duration?: number;
  isVisible: boolean;
}) {
  // Check for reduced motion preference (SSR-safe via Framer Motion)
  const prefersReducedMotion = useReducedMotion();

  // Initialize with SSR-safe values (always 0/false) to avoid hydration mismatch
  // prefersReducedMotion may differ between server and client
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Handle reduced motion preference after hydration
  useEffect(() => {
    if (prefersReducedMotion && !hasAnimated) {
      setCount(end);
      setHasAnimated(true);
    }
  }, [prefersReducedMotion, end, hasAnimated]);

  // Easing function - smooth deceleration
  const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

  useEffect(() => {
    // Skip animation if reduced motion is preferred, already animated, or not visible
    if (prefersReducedMotion || !isVisible || hasAnimated) return;

    // Animation function defined inside effect to avoid stale closures
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

    // Start animation
    startTimeRef.current = null;
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isVisible, hasAnimated, end, duration, prefersReducedMotion]);

  // Use count directly - reduced motion users will have count set to end via useEffect
  // This avoids hydration mismatch since prefersReducedMotion may differ server vs client
  const currentCount = count;

  // Format number - show integer for whole numbers, one decimal otherwise
  const displayNumber =
    end % 1 === 0 ? Math.round(currentCount).toString() : currentCount.toFixed(1);

  // Final value for screen readers (immediate, no animation)
  const finalValue = end % 1 === 0 ? end.toString() : end.toFixed(1);

  return (
    <>
      {/* Screen reader sees final value immediately */}
      <span className="sr-only">{finalValue}{suffix}</span>
      {/* Visual animated number */}
      <span className="tabular-nums" aria-hidden="true">
        {displayNumber}
        {suffix}
      </span>
    </>
  );
}

export default function StatsGrid({ stats }: { stats: Stat[] }) {
  const containerRef = useRef<HTMLDListElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Memoize parsed stat values to avoid re-parsing on each render
  const parsedStats = useMemo(
    () => stats.map((stat) => ({ stat, parsed: parseStatValue(stat.value) })),
    [stats]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (typeof IntersectionObserver === "undefined") {
      const hydrationId = setTimeout(() => setIsVisible(true), 0);
      return () => clearTimeout(hydrationId);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Disconnect after triggering once
          observer.disconnect();
        }
      },
      { threshold: 0.3, rootMargin: "0px" }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  return (
    <dl
      ref={containerRef}
      className="grid gap-px overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-800/60 text-sm text-slate-200 shadow-xl shadow-slate-950/20 sm:grid-cols-2 lg:grid-cols-4"
    >
      {parsedStats.map(({ stat, parsed }, index) => {
        // Use special X stats card for the Twitter/X stat
        if (stat.label === "Audience on X") {
          return <XStatsCard key={stat.label} />;
        }

        return (
          <div
            key={stat.label}
            className="group relative bg-slate-950/40 px-6 py-6 backdrop-blur transition-colors hover:bg-slate-950/20"
            style={{
              // Stagger the animation slightly for each stat
              animationDelay: `${index * 100}ms`,
            }}
          >
            {/* Subtle inner glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <dt className="text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors group-hover:text-sky-400/70">
              {stat.label}
            </dt>
            <dd className="mt-3 text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
              {parsed.isAnimatable ? (
                <AnimatedNumber
                  end={parsed.number}
                  suffix={parsed.suffix}
                  duration={1800 + index * 200} // Slightly different duration for each
                  isVisible={isVisible}
                />
              ) : (
                stat.value
              )}
            </dd>
            {stat.helper && (
              <p className="mt-2 text-xs font-medium leading-relaxed text-slate-400/80">
                {stat.helper}
              </p>
            )}
          </div>
        );
      })}
    </dl>
  );
}
