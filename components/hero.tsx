"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Cpu } from "lucide-react";
import GlowOrbits from "@/components/glow-orbits";
import StatsGrid from "@/components/stats-grid";
import ErrorBoundary from "@/components/error-boundary";
import ThreeSceneLoading from "@/components/three-scene-loading";
import { heroContent, heroStats, siteConfig } from "@/lib/content";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";

const ThreeScene = dynamic(() => import("@/components/three-scene"), {
  ssr: false,
  loading: () => <ThreeSceneLoading />,
});

export default function Hero() {
  const { mediumTap } = useHapticFeedback();

  return (
    <section
      data-section
      className="relative min-h-[90vh] w-full overflow-hidden bg-[#020617]"
    >
      <GlowOrbits />
      
      <div className="relative mx-auto flex h-full max-w-7xl flex-col px-4 pb-20 pt-32 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:pt-40">
        
        {/* Text Content */}
        <div className="relative z-20 flex max-w-3xl flex-col gap-8 lg:max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-4"
          >
            <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-slate-800/50 bg-slate-900 shadow-2xl ring-2 ring-slate-900/50 sm:h-20 sm:w-20">
              <Image
                src="/jeff_emanuel_headshot.webp"
                alt={siteConfig.name}
                fill
                sizes="80px"
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wide text-slate-200">
                {siteConfig.name}
              </span>
              <span className="text-xs font-medium uppercase tracking-widest text-sky-400">
                Founder & CEO
              </span>
            </div>
          </motion.div>

          <div className="space-y-6">
            <motion.h1
              className="text-5xl font-bold leading-[0.95] tracking-tighter text-white sm:text-7xl lg:text-8xl"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              Building the <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-sky-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
                AI Infrastructure
              </span>{" "}
              <br className="hidden sm:block" />
              of the future.
            </motion.h1>

            <motion.div
              className="max-w-xl space-y-4 text-lg leading-relaxed text-slate-400 md:text-xl"
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
            className="flex flex-wrap gap-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Link
              href={heroContent.primaryCta.href}
              onTouchStart={mediumTap}
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-white px-8 text-sm font-bold text-slate-950 transition-transform hover:scale-105 active:scale-95"
            >
              <Cpu className="h-4 w-4" />
              {heroContent.primaryCta.label}
            </Link>
            <Link
              href={heroContent.secondaryCta.href}
              target="_blank"
              className="group inline-flex h-12 items-center gap-2 rounded-full border border-slate-800 bg-slate-950/50 px-8 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:border-slate-600 hover:bg-slate-900"
            >
              <BookOpen className="h-4 w-4 text-slate-400 group-hover:text-white" />
              {heroContent.secondaryCta.label}
            </Link>
          </motion.div>

          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 1, delay: 0.8 }}
             className="pt-12"
          >
            <StatsGrid stats={heroStats} />
          </motion.div>
        </div>

        {/* 3D Scene - Positioned absolutely on desktop for layered feel */}
        <div className="relative mt-12 h-[400px] w-full lg:absolute lg:right-0 lg:top-1/2 lg:mt-0 lg:h-[800px] lg:w-[900px] lg:-translate-y-1/2 lg:opacity-100">
           <div className="absolute inset-0 z-10 bg-gradient-to-l from-transparent via-[#020617]/10 to-[#020617] lg:via-[#020617]/50" />
           <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#020617] to-transparent lg:hidden" />
           
           <ErrorBoundary
              fallback={null}
            >
              <Suspense fallback={<ThreeSceneLoading />}>
                <ThreeScene />
              </Suspense>
            </ErrorBoundary>
        </div>
      </div>
    </section>
  );
}
