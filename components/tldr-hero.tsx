"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useReducedMotion, useInView, AnimatePresence } from "framer-motion";
import { Cog, Zap, GitBranch, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { tldrPageData } from "@/lib/content";

// =============================================================================
// TYPES
// =============================================================================

interface TldrHeroProps {
  className?: string;
  id?: string;
}

// =============================================================================
// ANIMATED STAT COMPONENT
// =============================================================================

/** Parse a stat value like "14", "16K+", "5" into numeric + suffix parts */
function parseStatValue(value: string): { numeric: number; suffix: string } {
  const match = value.match(/^([\d,]+)(.*)/);
  if (!match) return { numeric: 0, suffix: value };
  return {
    numeric: parseInt(match[1].replace(/,/g, ""), 10),
    suffix: match[2], // e.g. "K+", "+", ""
  };
}

function AnimatedStat({
  label,
  value,
  index,
  reducedMotion,
  isInView,
}: {
  label: string;
  value: string;
  index: number;
  reducedMotion: boolean;
  isInView: boolean;
}) {
  const { numeric, suffix } = parseStatValue(value);
  const [displayCount, setDisplayCount] = useState(numeric);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current || reducedMotion) return;
    hasAnimated.current = true;

    const delay = index * 150;
    const timer = setTimeout(() => {
      setDisplayCount(0);
      const duration = Math.min(1200 + numeric * 5, 2000);
      let startTime: number;

      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayCount(Math.round(eased * numeric));
        if (progress < 1) requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    }, delay);

    return () => clearTimeout(timer);
  }, [isInView, numeric, index, reducedMotion]);

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: reducedMotion ? 0 : 0.5,
        delay: reducedMotion ? 0 : 0.3 + index * 0.1,
      }}
      className="text-center"
    >
      <div className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">
        <span className="tabular-nums">{displayCount.toLocaleString()}</span>
        {suffix}
      </div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
      </div>
    </motion.div>
  );
}

// =============================================================================
// FLOATING ICON COMPONENT
// =============================================================================

function FloatingIcon({
  icon: Icon,
  className,
  delay = 0,
  reducedMotion,
}: {
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  delay?: number;
  reducedMotion: boolean;
}) {
  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: reducedMotion ? 0 : 0.6,
        delay: reducedMotion ? 0 : delay,
      }}
      className={cn(
        "absolute flex items-center justify-center rounded-2xl bg-gradient-to-br p-3 shadow-lg",
        className
      )}
    >
      <Icon className="h-6 w-6 text-white" />
    </motion.div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function TldrHero({ className, id }: TldrHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion ?? false;
  const [hasScrolled, setHasScrolled] = useState(false);

  // Hide scroll indicator after user scrolls
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 50) {
            setHasScrolled(true);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { hero } = tldrPageData;

  return (
    <section
      id={id}
      ref={containerRef}
      className={cn("relative overflow-hidden py-16 md:py-32", className)}
    >
      {/* Mesh gradient background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 80% 50% at 20% 40%, rgba(139, 92, 246, 0.15), transparent)",
            "radial-gradient(ellipse 60% 40% at 80% 30%, rgba(236, 72, 153, 0.08), transparent)",
            "radial-gradient(ellipse 50% 60% at 50% 80%, rgba(56, 189, 248, 0.06), transparent)",
          ].join(", "),
        }}
      />

      {/* Decorative grid - hidden on mobile for cleaner look */}
      <div className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] sm:block" />

      {/* Floating icons - hidden on mobile to prevent overflow */}
      <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true">
        <FloatingIcon
          icon={Cog}
          className="left-[10%] top-[20%] from-violet-500 to-purple-600"
          delay={0.8}
          reducedMotion={reducedMotion}
        />
        <FloatingIcon
          icon={Zap}
          className="right-[15%] top-[30%] from-amber-500 to-orange-600"
          delay={1.0}
          reducedMotion={reducedMotion}
        />
        <FloatingIcon
          icon={GitBranch}
          className="bottom-[25%] left-[15%] from-emerald-500 to-teal-600"
          delay={1.2}
          reducedMotion={reducedMotion}
        />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <motion.div
            initial={reducedMotion ? {} : { opacity: 0, y: -10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: reducedMotion ? 0 : 0.4 }}
            className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-300 ring-1 ring-inset ring-violet-500/20"
          >
            <Cog className="h-4 w-4" />
            <span>Open Source Ecosystem</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.1 }}
            className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-6xl"
          >
            {hero.title}
            <span className="block bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {hero.subtitle}
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.2 }}
            className="mt-4 text-base leading-relaxed text-slate-400 sm:mt-6 sm:text-lg md:text-xl"
          >
            {hero.description}
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={reducedMotion ? {} : { opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.3 }}
            className="mt-8 flex items-center justify-center gap-4 sm:mt-12 sm:gap-6 md:gap-8 lg:gap-16"
          >
            {hero.stats.map((stat, i) => (
              <AnimatedStat
                key={stat.label}
                label={stat.label}
                value={stat.value}
                index={i}
                reducedMotion={reducedMotion}
                isInView={isInView}
              />
            ))}
          </motion.div>

          {/* Scroll indicator - hides after user scrolls */}
          <AnimatePresence>
            {!hasScrolled && (
              <motion.div
                initial={reducedMotion ? {} : { opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                exit={reducedMotion ? {} : { opacity: 0, y: 20 }}
                transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.6 }}
                className="mt-16 flex justify-center"
              >
                <motion.div
                  animate={reducedMotion ? {} : { y: [0, 8, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="flex flex-col items-center gap-2 text-slate-500"
                >
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Scroll to explore
                  </span>
                  <ArrowDown className="h-5 w-5" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default TldrHero;
