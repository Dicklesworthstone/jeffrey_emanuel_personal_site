"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import type { Stat } from "@/lib/content";
import { XStatsCard } from "@/components/x-stats-card";
import { AnimatedNumber } from "@/components/animated-number";

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
                  value={parsed.number}
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
