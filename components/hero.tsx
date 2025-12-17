"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Suspense, useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Briefcase, Workflow } from "lucide-react";
import GlowOrbits from "@/components/glow-orbits";
import StatsGrid from "@/components/stats-grid";
import ErrorBoundary from "@/components/error-boundary";
import ThreeSceneLoading from "@/components/three-scene-loading";
import ThreeSceneFallback from "@/components/three-scene-fallback";
import { heroContent, heroStats, siteConfig, type Stat } from "@/lib/content";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";
import { useClickParticles } from "@/hooks/use-click-particles";
import { cn } from "@/lib/utils";
import headshot from "@/assets/jeff_emanuel_headshot.webp";

// Only load Three.js on larger screens to save mobile bandwidth/battery
const ThreeScene = dynamic(() => import("@/components/three-scene"), {
  ssr: false,
  loading: () => <ThreeSceneLoading />,
});

interface HeroProps {
  stats?: Stat[];
}

export default function Hero({ stats = heroStats }: HeroProps) {
  const { mediumTap } = useHapticFeedback();
  const spawnParticles = useClickParticles({
    colors: ["#8b5cf6", "#d946ef", "#a855f7", "#38bdf8", "#22c55e"],
    count: 16,
  });
  const prefersReducedMotion = useReducedMotion();

  const [shouldRenderScene, setShouldRenderScene] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      // Match Tailwind 'lg' breakpoint (1024px)
      setShouldRenderScene(window.matchMedia("(min-width: 1024px)").matches);
    };
    
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  return (
    <section
      data-section
      className="relative min-h-[95vh] w-full overflow-hidden bg-[#020617]"
    >
      <GlowOrbits />
      
      {/* Ambient light source for depth */}
      <div className="pointer-events-none absolute -top-[20%] left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-sky-500/5 blur-[120px]" />

      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4 pb-20 pt-32 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:pt-32">
        
        {/* Text Content */}
        <div className="relative z-20 flex max-w-4xl flex-col gap-10 lg:max-w-3xl lg:pr-10">
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-5"
          >
            <div className="group relative h-16 w-16 overflow-hidden rounded-full shadow-2xl sm:h-20 sm:w-20">
              <div className="absolute inset-0 animate-pulse bg-sky-500/20 blur-md group-hover:bg-sky-400/30" />
              <Image
                src={headshot}
                alt={`Headshot photo of ${siteConfig.name}`}
                fill
                sizes="80px"
                placeholder="blur"
                className="relative z-10 object-cover ring-2 ring-slate-800/50 transition-transform duration-500 group-hover:scale-110"
                priority
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-base font-bold tracking-wide text-slate-100">
                {siteConfig.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2">
                  <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-sky-400/90">
                  Founder & CEO
                </span>
              </div>
            </div>
          </motion.div>

          <div className="space-y-8">
            <motion.h1
              className="text-balance-pro text-5xl font-bold leading-[0.9] tracking-[-0.04em] text-white sm:text-7xl lg:text-[5.5rem] xl:text-[6rem]"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              Building the <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-sky-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent filter drop-shadow-sm">
                AI Infrastructure
              </span>{" "}
              <br className="hidden sm:block" />
              of the future.
            </motion.h1>

            <motion.div
              className="max-w-2xl space-y-6"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 1, delay: 0.4 }}
            >
              {/* Lead intro */}
              <p className="text-lg font-medium leading-relaxed text-slate-300 md:text-xl md:leading-relaxed">
                {heroContent.intro}
              </p>

              {/* Tools grid */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {heroContent.tools.map((tool) => (
                  <div
                    key={tool.name}
                    className="group relative overflow-hidden rounded-xl border border-slate-700/40 bg-slate-800/40 p-3 backdrop-blur-sm transition-all hover:border-slate-600/60 hover:bg-slate-800/60"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200">
                            {tool.name}
                          </span>
                          {"highlight" in tool && tool.highlight && (
                            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                              {tool.highlight}
                            </span>
                          )}
                        </div>
                        {"tagline" in tool && tool.tagline && (
                          <p className="mt-0.5 text-xs font-medium text-sky-400/80">
                            {tool.tagline}
                          </p>
                        )}
                        {"description" in tool && tool.description && (
                          <p className="mt-1 text-xs leading-relaxed text-slate-400/80">
                            {tool.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {/* "And more" card */}
                <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-700/40 bg-slate-800/20 p-3 text-sm font-medium text-slate-500">
                  + several others
                </div>
              </div>

              {/* Achievement highlight callout */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 p-5 backdrop-blur-sm">
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl" />
                <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
                <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                  <div className="flex items-baseline gap-2">
                    <span className="bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
                      {heroContent.highlight.metric}
                    </span>
                    <span className="text-sm font-medium text-slate-400 sm:text-base">
                      {heroContent.highlight.label}
                    </span>
                  </div>
                  <div className="h-px w-full bg-gradient-to-r from-slate-700 via-slate-600 to-transparent sm:h-12 sm:w-px sm:bg-gradient-to-b" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-slate-300 sm:text-base">
                      {heroContent.highlight.context}
                    </span>
                    <span className="text-xs font-medium text-emerald-400/80 sm:text-sm">
                      {heroContent.highlight.subtext}
                    </span>
                  </div>
                </div>
              </div>

              {/* Body paragraphs */}
              <div className="space-y-4">
                {heroContent.body.map((p, i) => (
                  <p
                    key={i}
                    className="text-base font-medium leading-relaxed text-slate-400/90 md:text-lg md:leading-loose"
                  >
                    {p}
                  </p>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            className="flex flex-wrap gap-4 pt-2"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.6 }}
          >
            <Link
              href={heroContent.primaryCta.href}
              onTouchStart={mediumTap}
              onClick={spawnParticles}
              className={cn(
                "group relative inline-flex h-14 items-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 text-sm font-bold tracking-wide text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-[0_0_40px_-10px_rgba(139,92,246,0.5)] active:scale-95",
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 transition-opacity group-hover:opacity-100" />
              <Workflow className="relative z-10 h-4 w-4 transition-transform group-hover:rotate-12" />
              <span className="relative z-10">{heroContent.primaryCta.label}</span>
              <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href={heroContent.secondaryCta.href}
              className="group inline-flex h-14 items-center gap-2.5 rounded-full border border-slate-700/50 bg-slate-900/40 px-8 text-sm font-bold tracking-wide text-white backdrop-blur-md transition-all hover:border-slate-600 hover:bg-slate-800/60 active:scale-95"
            >
              <Briefcase className="h-4 w-4 text-slate-400 transition-colors group-hover:text-sky-300" />
              <span>{heroContent.secondaryCta.label}</span>
            </Link>
          </motion.div>

          <motion.div
             initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={prefersReducedMotion ? { duration: 0 } : { duration: 1, delay: 0.8 }}
             className="pt-12 lg:pt-16"
          >
            <StatsGrid stats={stats} />
          </motion.div>
        </div>

        {/* 3D Scene - Full Three.js on desktop, lightweight fallback on mobile */}
        <div className="relative mt-12 h-[400px] w-full lg:absolute lg:-right-[10%] lg:top-1/2 lg:mt-0 lg:h-[900px] lg:w-[1000px] lg:-translate-y-1/2 lg:opacity-100 pointer-events-none">
           <div className="absolute inset-0 z-10 bg-gradient-to-l from-transparent via-[#020617]/20 to-[#020617] lg:via-[#020617]/60" />
           <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#020617] to-transparent lg:hidden" />

           {/* Mobile: Lightweight CSS/SVG animation fallback */}
           <div className="h-full w-full lg:hidden">
             <ThreeSceneFallback />
           </div>

           {/* Desktop: Full Three.js WebGL scene - Only rendered if screen is large enough */}
           <div className="pointer-events-auto hidden h-full w-full lg:block">
             <ErrorBoundary fallback={<ThreeSceneFallback />}>
                {shouldRenderScene ? (
                  <Suspense fallback={<ThreeSceneLoading />}>
                    <ThreeScene />
                  </Suspense>
                ) : (
                  <ThreeSceneFallback />
                )}
             </ErrorBoundary>
           </div>
        </div>
      </div>
    </section>
  );
}
