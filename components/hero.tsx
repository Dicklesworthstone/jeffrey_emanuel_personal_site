"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Briefcase, Workflow, ChevronDown } from "lucide-react";
import StatsGrid from "@/components/stats-grid";
import ErrorBoundary from "@/components/error-boundary";
import ThreeSceneLoading from "@/components/three-scene-loading";
import ThreeSceneFallback from "@/components/three-scene-fallback";
import { heroContent, heroStats, siteConfig, tldrFlywheelTools, type Stat } from "@/lib/content";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";
import { useClickParticles } from "@/hooks/use-click-particles";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { cn, supportsWebGL } from "@/lib/utils";
import { NOISE_SVG_DATA_URI } from "@/lib/constants";
import headshot from "@/assets/jeff_emanuel_headshot.webp";
import Magnetic from "@/components/magnetic";

// Lazy-load Three.js to keep initial load lightweight across devices
const ThreeScene = dynamic(() => import("@/components/three-scene"), {
  ssr: false,
  loading: () => <ThreeSceneLoading />,
});

// GlowOrbits is the only GSAP consumer; keep it off the eager homepage bundle.
const GlowOrbits = dynamic(() => import("@/components/glow-orbits"), { ssr: false });

// Shared by the loading placeholder, the fallback and the canvas so the
// `ssr: false` boundary never shifts layout.
const SCENE_HEIGHT_CLASSES = "h-[280px] w-full sm:h-[380px] md:h-[420px] lg:h-[460px]";

// Hero tool chips link to the matching TLDR card. Matching is by full name,
// by id, or by tagline (the chips use short names like "BV" for "Beads Viewer").
function resolveHeroToolHref(tool: { name: string; tagline?: string }): string {
  const lowerName = tool.name.toLowerCase();
  const match = tldrFlywheelTools.find(
    (t) =>
      t.name === tool.name ||
      t.id === lowerName ||
      (tool.tagline !== undefined && t.name === tool.tagline)
  );
  return match ? `/tldr#tool-card-${match.id}` : "/tldr";
}

const HERO_TOOL_HREFS: Record<string, string> = Object.fromEntries(
  heroContent.tools.map((tool) => [tool.name, resolveHeroToolHref(tool)])
);

// A touch that travels further than this before lifting is a scroll, not a tap.
const TAP_MOVE_THRESHOLD_PX = 8;

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
  const [sceneContextLost, setSceneContextLost] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const idleHandleRef = useRef<{ id: number; type: "idle" | "timeout" } | null>(null);
  const tapStartRef = useRef<{ x: number; y: number } | null>(null);
  const {
    ref: sceneRef,
    isIntersecting: isSceneVisible,
    hasEverIntersected: hasSceneEverBeenVisible,
  } =
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
      if (prefersReducedMotion) {
        setShouldRenderScene(false);
        return;
      }
      if (shouldRenderScene) return;

      const enable = () => {
        // Without WebGL, keep the static fallback instead of letting the
        // Canvas throw an uncatchable async context-creation error.
        setShouldRenderScene(supportsWebGL());
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
  }, [shouldRenderScene, prefersReducedMotion]);

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

  // A lost WebGL context (Safari backgrounding, GPU reset, context eviction)
  // is a DOM event, not a render error, so the ErrorBoundary never sees it.
  // Swap to the static fallback for the rest of the session instead of
  // leaving a blank rectangle.
  const handleSceneContextLost = useCallback(() => {
    setSceneContextLost(true);
  }, []);

  const shouldMountScene =
    shouldRenderScene && hasSceneEverBeenVisible && !prefersReducedMotion && !sceneContextLost;
  const isSceneActive = shouldMountScene && isSceneVisible;

  const handlePrimaryCtaClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    const { clientX, clientY, currentTarget } = event;

    if (clientX !== 0 || clientY !== 0) {
      spawnParticles({ clientX, clientY });
      return;
    }

    const rect = currentTarget.getBoundingClientRect();
    spawnParticles({
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2,
    });
  }, [spawnParticles]);

  // Haptics fire on a completed tap (pointerup with < 8px travel), never on
  // touchstart, so a scroll that begins on the button does not buzz.
  const handleCtaPointerDown = useCallback((event: React.PointerEvent<HTMLAnchorElement>) => {
    tapStartRef.current =
      event.pointerType === "touch" ? { x: event.clientX, y: event.clientY } : null;
  }, []);
  const handleCtaPointerUp = useCallback((event: React.PointerEvent<HTMLAnchorElement>) => {
    const start = tapStartRef.current;
    tapStartRef.current = null;
    if (!start) return;
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) < TAP_MOVE_THRESHOLD_PX) {
      mediumTap();
    }
  }, [mediumTap]);
  const handleCtaPointerCancel = useCallback(() => {
    tapStartRef.current = null;
  }, []);

  return (
    <section
      data-section
      // `dark` makes the hero a theme island: the 3D scene clears to #020617
      // and the glow/orbit layers are composed against it, so the hero keeps
      // its dark tokens in light mode instead of a light band around a dark
      // canvas. The fades below resolve to that same dark canvas.
      className="dark relative min-h-[min(95dvh,95vh)] w-full overflow-hidden bg-slate-950"
    >
      <GlowOrbits />

      {/* Ambient light source for depth */}
      <div className="pointer-events-none absolute -top-[20%] left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-sky-500/5 blur-[120px]" aria-hidden="true" />

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
              <div className="absolute inset-0 bg-sky-500/20 blur-md transition-colors group-hover:bg-sky-400/30" aria-hidden="true" />
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
              <span className="text-xs font-bold uppercase tracking-widest text-sky-400/90">
                Founder & CEO
              </span>
            </div>
          </motion.div>

          <div className="space-y-8">
            {/*
              The heading is the LCP candidate: it ships fully painted
              (initial={false}, no opacity/blur on the words). Only the
              gradient phrase gets a short transform/opacity entrance, and
              none under reduced motion.
            */}
            <motion.h1
              className="text-balance-pro font-bold leading-[0.9] tracking-[-0.04em] text-white"
              style={{ fontSize: "clamp(2.5rem, 8vw, 6rem)" }}
              initial={false}
            >
              {"Building the".split(" ").map((word, i) => (
                <span key={i} className="inline-block mr-[0.2em]">
                  {word}
                </span>
              ))}
              <br className="hidden sm:block" />
              <motion.span
                className="text-gradient inline-block"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }
                }
              >
                AI Infrastructure
              </motion.span>{" "}
              <br className="hidden sm:block" />
              {"of the future.".split(" ").map((word, i) => (
                <span key={i} className="inline-block mr-[0.2em]">
                  {word}
                </span>
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

              {/* Tools grid - horizontal scroll on mobile, grid on desktop. Each chip is a real link to its TLDR card. */}
              <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar sm:grid sm:grid-cols-2 lg:grid-cols-3">
                {heroContent.tools.map((tool) => (
                  <Magnetic key={tool.name} strength={0.15}>
                    <motion.div
                      whileHover={prefersReducedMotion ? undefined : { y: -4, scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="snap-start shrink-0 w-[70vw] sm:w-auto h-full"
                    >
                      <Link
                        href={HERO_TOOL_HREFS[tool.name] ?? "/tldr"}
                        className="group relative block h-full overflow-hidden rounded-xl border border-slate-700/40 bg-slate-800/40 p-3 transition-colors pointer-fine:backdrop-blur-sm pointer-coarse:bg-slate-800/70 hover:border-slate-600/60 hover:bg-slate-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            {/* Wraps rather than competing for one row: a long
                                name like "MCP Agent Mail" used to break mid-
                                phrase around the badge. Now the badge drops to
                                its own line and the name keeps the full width. */}
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span className="font-bold text-slate-200">
                                {tool.name}
                              </span>
                              {"highlight" in tool && tool.highlight && (
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-200 ring-1 ring-inset ring-amber-400/30">
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
                          <ArrowUpRight
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500 transition-colors motion-reduce:transition-none group-hover:text-sky-300"
                            aria-hidden="true"
                          />
                        </div>
                      </Link>
                    </motion.div>
                  </Magnetic>
                ))}
                {/* Explore ecosystem link */}
                <Magnetic strength={0.2}>
                  <Link
                    href="/tldr"
                    className="snap-start shrink-0 w-[70vw] sm:w-auto h-full group flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-700/40 bg-gradient-to-br from-slate-800/40 to-slate-900/40 p-3 text-sm font-medium text-slate-400 transition-colors hover:border-violet-500/30 hover:bg-slate-800/60 hover:text-violet-300"
                  >
                    <span>Explore all tools</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform motion-reduce:transition-none group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </Magnetic>
              </div>

              {/* Achievement highlight callout - the one surface that keeps the noise texture */}
              <motion.div
                whileHover="hover"
                className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 p-5 pointer-fine:backdrop-blur-sm group"
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
                  style={{ backgroundImage: `url("${NOISE_SVG_DATA_URI}")` }}
                  aria-hidden="true"
                />
                <motion.div
                  className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-violet-500/20 blur-2xl"
                  variants={prefersReducedMotion ? undefined : {
                    hover: { scale: 1.5, opacity: 0.8, x: -20, y: 20 }
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  aria-hidden="true"
                />
                <motion.div
                  className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-emerald-500/20 blur-2xl"
                  variants={prefersReducedMotion ? undefined : {
                    hover: { scale: 1.5, opacity: 0.8, x: 20, y: -20 }
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  aria-hidden="true"
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
                  <div className="h-px w-full bg-gradient-to-r from-slate-700 via-slate-600 to-transparent sm:h-12 sm:w-px sm:bg-gradient-to-b" aria-hidden="true" />
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
                onPointerDown={handleCtaPointerDown}
                onPointerUp={handleCtaPointerUp}
                onPointerCancel={handleCtaPointerCancel}
                onClick={handlePrimaryCtaClick}
                className={cn(
                  "btn-glow-primary group relative inline-flex h-14 items-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 text-sm font-bold tracking-wide text-white transition-[transform,box-shadow] active:scale-95",
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
                className="btn-glow-secondary group inline-flex h-14 items-center gap-2.5 rounded-full border border-slate-700/50 bg-slate-900/40 px-8 text-sm font-bold tracking-wide text-white pointer-fine:backdrop-blur-md pointer-coarse:bg-slate-900/70 transition-[background-color,border-color,box-shadow,transform] hover:border-slate-600 hover:bg-slate-800/60 hover:shadow-[0_0_20px_rgba(56,189,248,0.15)] active:scale-95"
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

        {/*
          3D Scene - decorative. The box is exactly the canvas height (no dead
          space on phones) and never takes pointer events itself; the scene
          enables them on the canvas only for fine pointers, so a finger drag
          anywhere here scrolls the page. On lg the top edge sits where the
          old 900px box put it (centre - 450px) so the placement is unchanged.
        */}
        <div
          ref={sceneRef}
          aria-hidden="true"
          className="pointer-events-none relative mt-12 h-[280px] w-full sm:h-[380px] md:h-[420px] lg:absolute lg:-right-[10%] lg:top-1/2 lg:mt-0 lg:h-[460px] lg:w-[1000px] lg:-translate-y-[450px]"
        >
           <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-l from-transparent via-slate-950/20 to-slate-950 lg:via-slate-950/60" />
           <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-slate-950 to-transparent lg:hidden" />

           <div className="h-full w-full">
             <ErrorBoundary fallback={<ThreeSceneFallback className={SCENE_HEIGHT_CLASSES} />}>
               {shouldMountScene ? (
                 <Suspense fallback={<ThreeSceneLoading />}>
                   <ThreeScene isActive={isSceneActive} onContextLost={handleSceneContextLost} />
                 </Suspense>
               ) : (
                 <ThreeSceneFallback className={SCENE_HEIGHT_CLASSES} />
               )}
             </ErrorBoundary>
           </div>
        </div>
      </div>

      {/* Scroll indicator - unmounts after scrolling so its loop stops running */}
      <AnimatePresence>
        {!hasScrolled && (
          <motion.div
            className="pointer-events-none absolute bottom-8 left-1/2 z-20 -translate-x-1/2"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
        )}
      </AnimatePresence>
    </section>
  );
}
