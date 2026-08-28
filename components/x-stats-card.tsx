"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Eye, Heart, Bookmark, TrendingUp, ChevronDown } from "lucide-react";
import { AnimatedNumber } from "@/components/animated-number";
import { heroStats, siteConfig } from "@/lib/content";
import { cn } from "@/lib/utils";

// Single source of truth: the follower count shown here must match the
// "Audience on X" stat maintained in lib/content.ts.
const audienceStat = heroStats.find((s) => s.label === "Audience on X");
const audienceThousands = Number.parseInt(audienceStat?.value ?? "", 10) || 0;

interface XEngagementStat {
  icon: typeof Eye;
  label: string;
  value: string;
  numericValue: number;
}

// Calendar-year 2025 figures from X Analytics (rounded). Keep the year label
// and the source note next to them: these are dated snapshots, not live data.
const ENGAGEMENT_YEAR = "2025";
const X_HANDLE = siteConfig.social.x.split("/").filter(Boolean).pop() ?? "";
const ENGAGEMENT_SOURCE = `Impressions, likes and bookmarks as reported by X Analytics for @${X_HANDLE}, calendar year ${ENGAGEMENT_YEAR} (rounded).`;

const engagementStats: XEngagementStat[] = [
  { icon: Eye, label: "Impressions", value: "25.7M", numericValue: 25.7 },
  { icon: Heart, label: "Likes", value: "154.8K", numericValue: 154.8 },
  { icon: Bookmark, label: "Bookmarks", value: "62.8K", numericValue: 62.8 },
];

export function XStatsCard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [pinnedOpen, setPinnedOpen] = useState(false);
  const [hoverOpen, setHoverOpen] = useState(false);
  const [hasExpandedOnce, setHasExpandedOnce] = useState(false);
  const [supportsHover, setSupportsHover] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const panelId = useId();

  const isExpanded = pinnedOpen || (supportsHover && hoverOpen);

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
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Hover-to-peek is an enhancement on hover-capable devices only; the
  // button below is the real (keyboard/touch/AT) control.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(hover: hover)");
    const updateHoverSupport = () => {
      setSupportsHover(mediaQuery.matches);
    };
    const hydrationId = setTimeout(updateHoverSupport, 0);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updateHoverSupport);
      return () => {
        clearTimeout(hydrationId);
        mediaQuery.removeEventListener("change", updateHoverSupport);
      };
    }

    mediaQuery.addListener(updateHoverSupport);
    return () => {
      clearTimeout(hydrationId);
      mediaQuery.removeListener(updateHoverSupport);
    };
  }, []);

  // Track if we've ever expanded (the inner counters run once, on first reveal)
  useEffect(() => {
    if (isExpanded && !hasExpandedOnce) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- One-time flag, not a sync loop
      setHasExpandedOnce(true);
    }
  }, [isExpanded, hasExpandedOnce]);

  return (
    <div
      ref={containerRef}
      className="group relative bg-slate-950/40 px-6 py-6 transition-colors pointer-fine:backdrop-blur pointer-coarse:bg-slate-950/70 hover:bg-slate-950/20"
      onMouseEnter={() => setHoverOpen(true)}
      onMouseLeave={() => setHoverOpen(false)}
    >
      {/* Subtle inner glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden="true" />

      {/* Main stat - a real definition, exposed to AT like its sibling cells */}
      <dt className="relative text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors group-hover:text-sky-400/70">
        Audience on X
      </dt>
      <dd className="relative mt-3 text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
        <AnimatedNumber
          value={audienceThousands}
          suffix="K+"
          duration={1800}
          isVisible={isVisible}
          decimals={0}
        />
        <p className="mt-2 text-xs font-medium leading-relaxed tracking-normal text-slate-400/80">
          Analysts, founders, researchers, and engineers.
        </p>

        {/* Disclosure control for the dated engagement figures */}
        <button
          type="button"
          onClick={() => setPinnedOpen((prev) => !prev)}
          aria-expanded={isExpanded}
          aria-controls={panelId}
          className="mt-2 inline-flex min-h-10 items-center gap-1.5 rounded-md text-xs font-semibold tracking-normal text-slate-400 transition-colors hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
        >
          <TrendingUp className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
          <span>{ENGAGEMENT_YEAR} highlights</span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform motion-reduce:transition-none",
              isExpanded && "rotate-180"
            )}
            aria-hidden="true"
          />
        </button>

        {/* Engagement figures - always mounted so the counters keep their state */}
        <motion.div
          id={panelId}
          initial={false}
          animate={{
            opacity: isExpanded ? 1 : 0,
            height: isExpanded ? "auto" : 0,
          }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
          className="overflow-hidden"
          inert={!isExpanded}
        >
          <dl
            className="mt-2 space-y-1.5 border-t border-slate-700/50 pt-3"
            title={ENGAGEMENT_SOURCE}
          >
            {engagementStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex items-center justify-between gap-3 rounded-lg bg-slate-800/50 px-2.5 py-1.5"
                >
                  <dt className="flex items-center gap-1.5 text-xs font-medium tracking-normal text-slate-400">
                    <Icon className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                    {stat.label}
                  </dt>
                  <dd className="text-sm font-bold tracking-normal text-slate-200">
                    <AnimatedNumber
                      value={stat.numericValue}
                      suffix={stat.value.includes("M") ? "M" : "K"}
                      duration={1200 + index * 150}
                      isVisible={hasExpandedOnce}
                      decimals={stat.value.includes(".") ? 1 : 0}
                    />
                  </dd>
                </div>
              );
            })}
          </dl>
          <p className="mt-2 text-xs font-medium tracking-normal text-slate-500">
            X Analytics, calendar year {ENGAGEMENT_YEAR}, rounded.
          </p>
        </motion.div>
      </dd>
    </div>
  );
}
