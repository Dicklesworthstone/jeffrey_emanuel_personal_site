"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Workflow } from "lucide-react";
import GlowOrbits from "@/components/glow-orbits";
import StatsGrid from "@/components/stats-grid";
import ErrorBoundary from "@/components/error-boundary";
import ThreeSceneLoading from "@/components/three-scene-loading";
import { heroContent, heroStats, siteConfig } from "@/lib/content";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";
import { cn } from "@/lib/utils";

const ThreeScene = dynamic(() => import("@/components/three-scene"), {
  ssr: false,
  loading: () => <ThreeSceneLoading />,
});

export default function Hero() {
  const { mediumTap } = useHapticFeedback();

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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-5"
          >
            <div className="group relative h-16 w-16 overflow-hidden rounded-full shadow-2xl sm:h-20 sm:w-20">
              <div className="absolute inset-0 animate-pulse bg-sky-500/20 blur-md group-hover:bg-sky-400/30" />
              <Image
                src="/jeff_emanuel_headshot.webp"
                alt={siteConfig.name}
                fill
                sizes="80px"
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
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              Building the <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-sky-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent filter drop-shadow-sm">
                AI Infrastructure
              </span>{" "}
              <br className="hidden sm:block" />
              of the future.
            </motion.h1>

            <motion.div
              className="max-w-2xl space-y-4 text-lg font-medium leading-relaxed text-slate-400/90 md:text-xl md:leading-loose"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              {heroContent.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </motion.div>
          </div>

          <motion.div
            className="flex flex-wrap gap-4 pt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Link
              href={heroContent.primaryCta.href}
              onTouchStart={mediumTap}
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
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 1, delay: 0.8 }}
             className="pt-12 lg:pt-16"
          >
            <StatsGrid stats={heroStats} />
          </motion.div>
        </div>

        {/* 3D Scene - Positioned to be non-intrusive but present */}
        <div className="relative mt-12 h-[400px] w-full lg:absolute lg:-right-[10%] lg:top-1/2 lg:mt-0 lg:h-[900px] lg:w-[1000px] lg:-translate-y-1/2 lg:opacity-100 pointer-events-none">
           <div className="absolute inset-0 z-10 bg-gradient-to-l from-transparent via-[#020617]/20 to-[#020617] lg:via-[#020617]/60" />
           <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#020617] to-transparent lg:hidden" />
           
           <div className="pointer-events-auto h-full w-full">
             <ErrorBoundary fallback={null}>
                <Suspense fallback={<ThreeSceneLoading />}>
                  <ThreeScene />
                </Suspense>
             </ErrorBoundary>
           </div>
        </div>
      </div>
    </section>
  );
}
