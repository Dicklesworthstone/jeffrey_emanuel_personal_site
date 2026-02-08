"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Suspense, useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Briefcase, Workflow, ChevronDown } from "lucide-react";
import GlowOrbits from "@/components/glow-orbits";
import StatsGrid from "@/components/stats-grid";
import ErrorBoundary from "@/components/error-boundary";
import ThreeSceneLoading from "@/components/three-scene-loading";
import ThreeSceneFallback from "@/components/three-scene-fallback";
import { heroContent, heroStats, siteConfig, type Stat } from "@/lib/content";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";
import { useClickParticles } from "@/hooks/use-click-particles";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { cn } from "@/lib/utils";
import headshot from "@/assets/jeff_emanuel_headshot.webp";
import Magnetic from "@/components/magnetic";

// Lazy-load Three.js to keep initial load lightweight across devices
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
  const [hasScrolled, setHasScrolled] = useState(false);
  const idleHandleRef = useRef<{ id: number; type: "idle" | "timeout" } | null>(null);
  const { ref: sceneRef, isIntersecting: isSceneVisible } =
    useIntersectionObserver<HTMLDivElement>({
    threshold: 0.15,
    rootMargin: "200px",
    triggerOnce: false,
  });

  useEffect(() => {
    const cancelPending = () => {
      if (!idleHandleRef.current) return;
      if (idleHandleRef.current.type === "idle" && "cancelIdleCallback" in window) {
        window.cancelIdleCallback?.(idleHandleRef.current.id);
      } else {
        clearTimeout(idleHandleRef.current.id);
      }
      idleHandleRef.current = null;
    };

    const scheduleEnable = () => {
      if (shouldRenderScene) return;

      const enable = () => {
        setShouldRenderScene(true);
        idleHandleRef.current = null;
      };

      if ("requestIdleCallback" in window) {
        const id = window.requestIdleCallback(enable, { timeout: 300 });
        idleHandleRef.current = { id, type: "idle" };
      } else {
        const id = setTimeout(enable, 200) as unknown as number;
        idleHandleRef.current = { id, type: "timeout" };
      }
    };

    scheduleEnable();

    return () => {
      cancelPending();
    };
  }, [shouldRenderScene]);

  // Hide scroll indicator after user scrolls (also check initial position)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setHasScrolled(true);
      }
    };
    // Check initial scroll position (e.g., page refresh while scrolled)
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isSceneActive = shouldRenderScene && isSceneVisible;

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
              <div className="absolute inset-0 motion-safe:animate-pulse bg-sky-500/20 blur-md group-hover:bg-sky-400/30" aria-hidden="true" />
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
                <span className="flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-2 w-2 motion-safe:animate-ping rounded-full bg-emerald-400 opacity-75"></span>
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
              className="text-balance-pro font-bold leading-[0.9] tracking-[-0.04em] text-white"
              style={{ fontSize: "clamp(2.5rem, 8vw, 6rem)" }}
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.12, delayChildren: 0.2 }
                }
              }}
            >
              {"Building the".split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  className="inline-block mr-[0.2em]"
                  variants={{
                    hidden: { opacity: 0, y: 40, filter: "blur(10px)", scale: 0.9 },
                    visible: { 
                      opacity: 1, 
                      y: 0, 
                      filter: "blur(0px)", 
                      scale: 1,
                      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
                    }
                  }}
                >
                  {word}
                </motion.span>
              ))}
              <br className="hidden sm:block" />
              <motion.span 
                className="bg-gradient-to-r from-sky-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent filter drop-shadow-sm inline-block"
                variants={{
                  hidden: { opacity: 0, y: 40, filter: "blur(10px)", scale: 0.9 },
                  visible: { 
                    opacity: 1, 
                    y: 0, 
                    filter: "blur(0px)", 
                    scale: 1,
                    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
                  }
                }}
              >
                AI Infrastructure
              </motion.span>{" "}
              <br className="hidden sm:block" />
              {"of the future.".split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  className="inline-block mr-[0.2em]"
                  variants={{
                    hidden: { opacity: 0, y: 40, filter: "blur(10px)", scale: 0.9 },
                    visible: { 
                      opacity: 1, 
                      y: 0, 
                      filter: "blur(0px)", 
                      scale: 1,
                      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
                    }
                  }}
                >
                  {word}
                </motion.span>
              ))}
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

              {/* Tools grid - horizontal scroll on mobile, grid on desktop */}
              <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar sm:grid sm:grid-cols-2 lg:grid-cols-3">
                {heroContent.tools.map((tool) => (
                  <Magnetic key={tool.name} strength={0.15}>
                    <motion.div
                      whileHover={{ y: -4, scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="snap-start shrink-0 w-[70vw] sm:w-auto group h-full relative overflow-hidden rounded-xl border border-slate-700/40 bg-slate-800/40 p-3 backdrop-blur-sm transition-all hover:border-slate-600/60 hover:bg-slate-800/60"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200">
                              {tool.name}
                            </span>
                            {"highlight" in tool && tool.highlight && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-200 ring-1 ring-inset ring-amber-400/30">
                                <svg className="h-3 w-3 fill-amber-400 text-amber-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
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
                    </motion.div>
                  </Magnetic>
                ))}
                {/* Explore ecosystem link */}
                <Magnetic strength={0.2}>
                  <Link
                    href="/tldr"
                    className="snap-start shrink-0 w-[70vw] sm:w-auto h-full group flex items-center justify-center gap-2 rounded-xl border border-slate-700/40 bg-gradient-to-br from-slate-800/40 to-slate-900/40 p-3 text-sm font-medium text-slate-400 transition-colors hover:border-violet-500/30 hover:bg-slate-800/60 hover:text-violet-300"
                  >
                    <span>Explore all tools</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform motion-reduce:transition-none group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </Magnetic>
              </div>

              {/* Achievement highlight callout */}
              <motion.div 
                whileHover="hover"
                className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 p-5 backdrop-blur-sm group"
              >
                <motion.div 
                  className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-violet-500/20 blur-2xl"
                  variants={{
                    hover: { scale: 1.5, opacity: 0.8, x: -20, y: 20 }
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                <motion.div 
                  className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-emerald-500/20 blur-2xl"
                  variants={{
                    hover: { scale: 1.5, opacity: 0.8, x: 20, y: -20 }
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
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
              </motion.div>

              {/* Body paragraphs */}
              <div className="space-y-4">
                {heroContent.body.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 50)}
                    className="text-base font-medium leading-relaxed text-slate-400/90 md:text-lg md:leading-loose"
                  >
                    {paragraph}
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
            <Magnetic strength={0.25}>
              <Link
                href={heroContent.primaryCta.href}
                onTouchStart={mediumTap}
                onClick={spawnParticles}
                className={cn(
                  "btn-glow-primary group relative inline-flex h-14 items-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 text-sm font-bold tracking-wide text-white transition-all active:scale-95",
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 transition-opacity motion-reduce:transition-none group-hover:opacity-100" aria-hidden="true" />
                <Workflow className="relative z-10 h-4 w-4 transition-transform motion-reduce:transition-none group-hover:rotate-12" aria-hidden="true" />
                <span className="relative z-10">{heroContent.primaryCta.label}</span>
                <ArrowRight className="relative z-10 h-4 w-4 transition-transform motion-reduce:transition-none group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </Magnetic>

            <Magnetic strength={0.15}>
              <Link
                href={heroContent.secondaryCta.href}
                className="btn-glow-secondary group inline-flex h-14 items-center gap-2.5 rounded-full border border-slate-700/50 bg-slate-900/40 px-8 text-sm font-bold tracking-wide text-white backdrop-blur-md transition-all hover:border-slate-600 hover:bg-slate-800/60 hover:shadow-[0_0_20px_rgba(56,189,248,0.15)] active:scale-95"
              >
                <Briefcase className="h-4 w-4 text-slate-400 transition-colors motion-reduce:transition-none group-hover:text-sky-300" aria-hidden="true" />
                <span>{heroContent.secondaryCta.label}</span>
              </Link>
            </Magnetic>
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

        {/* 3D Scene - Full Three.js on all devices (adaptive quality + gradients for legibility) */}
        <div
          ref={sceneRef}
          className="relative mt-12 h-[400px] w-full pointer-events-none lg:absolute lg:-right-[10%] lg:top-1/2 lg:mt-0 lg:h-[900px] lg:w-[1000px] lg:-translate-y-1/2 lg:opacity-100 lg:pointer-events-auto"
        >
           <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-l from-transparent via-[#020617]/20 to-[#020617] lg:via-[#020617]/60" />
           <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#020617] to-transparent lg:hidden" />

           <div className="h-full w-full pointer-events-none lg:pointer-events-auto">
             <ErrorBoundary fallback={<ThreeSceneFallback className="h-[280px] w-full sm:h-[380px] md:h-[420px] lg:h-[460px]" />}>
               {shouldRenderScene ? (
                 <Suspense fallback={<ThreeSceneLoading />}>
                   <ThreeScene isActive={isSceneActive} />
                 </Suspense>
               ) : (
                 <ThreeSceneFallback className="h-[280px] w-full sm:h-[380px] md:h-[420px] lg:h-[460px]" />
               )}
             </ErrorBoundary>
           </div>
        </div>
      </div>

      {/* Scroll indicator - fades out after scrolling */}
      <motion.div
        className="pointer-events-none absolute bottom-8 left-1/2 z-20 -translate-x-1/2"
        initial={{ opacity: hasScrolled ? 0 : 1 }}
        animate={{ opacity: hasScrolled ? 0 : 1 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
        aria-hidden="true"
      >
        <motion.div
          className="flex flex-col items-center gap-2"
          animate={prefersReducedMotion ? {} : { y: [0, 6, 0] }}
          transition={prefersReducedMotion ? {} : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-xs font-medium uppercase tracking-widest text-slate-500">
            Scroll
          </span>
          <ChevronDown className="h-5 w-5 text-slate-500" />
        </motion.div>
      </motion.div>
    </section>
  );
}
