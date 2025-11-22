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

const ThreeScene = dynamic(() => import("@/components/three-scene"), {
  ssr: false,
  loading: () => <ThreeSceneLoading />,
});

export default function Hero() {
  return (
    <section
      data-section
      className="relative overflow-hidden border-b border-slate-900/80 bg-gradient-to-b from-slate-950 via-slate-950/90 to-slate-950"
    >
      <GlowOrbits />
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-14 pt-14 sm:px-6 md:gap-10 md:pb-16 md:pt-16 lg:flex-row lg:items-center lg:px-8 lg:pb-20 lg:pt-20">
        <div className="relative z-10 flex-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex items-center gap-4"
          >
            <div className="relative">
              {/* Enhanced blur glow - increased opacity and blur radius */}
              <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-sky-500/30 via-violet-500/30 to-emerald-400/30 blur-2xl" />
              <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-slate-700/60 bg-slate-900/80 shadow-lg shadow-slate-950/70 ring-1 ring-sky-500/20 sm:h-24 sm:w-24">
                <Image
                  src="/jeff_emanuel_headshot.jpg"
                  alt={siteConfig.name}
                  fill
                  sizes="(max-width: 639px) 80px, 96px"
                  className="object-cover object-center"
                  priority
                />
              </div>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-sky-200 floating-chip">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {heroContent.eyebrow}
            </span>
          </motion.div>
          <motion.h1
            className="text-3xl font-semibold leading-tight tracking-tight text-slate-50 sm:text-4xl md:text-5xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 130, damping: 22 }}
          >
            {heroContent.title}
          </motion.h1>
          <div className="space-y-2 text-sm text-slate-300 sm:text-base">
            {heroContent.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2 sm:gap-4">
            <Link
              href={heroContent.primaryCta.href}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/40 transition hover:bg-sky-400 sm:w-auto"
            >
              <Cpu className="h-4 w-4" />
              {heroContent.primaryCta.label}
              <ArrowRight className="h-3 w-3" />
            </Link>
            <Link
              href={heroContent.secondaryCta.href}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-700/80 bg-slate-950/70 px-4 py-2 text-xs font-medium text-slate-200 hover:border-slate-500 hover:bg-slate-900 sm:w-auto sm:text-sm"
            >
              <BookOpen className="h-4 w-4" />
              {heroContent.secondaryCta.label}
            </Link>
          </div>
          <div className="pt-4 text-xs text-slate-400">
            <p>
              Founder & CEO of Lumera Network. Former long/short generalist at
              multi‑manager platforms. Author of the Nvidia short essay that
              helped move the stock.
            </p>
          </div>
          <div className="pt-4 md:pt-6">
            <StatsGrid stats={heroStats} />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.85, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="relative flex items-center gap-3 text-[11px] text-slate-400"
          >
            <div className="h-px w-10 bg-gradient-to-r from-sky-400/80 via-cyan-300/70 to-transparent" />
            <span>Scroll to explore Lumera, projects, writing, and more.</span>
          </motion.div>
        </div>

        <div className="relative z-10 flex-1">
          <div className="overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-950 shadow-[0_40px_120px_rgba(15,23,42,0.95)] ring-1 ring-sky-500/10">
            <ErrorBoundary
              fallback={
                <div className="flex h-[280px] w-full items-center justify-center text-sm text-slate-400 sm:h-[380px] md:h-[420px] lg:h-[460px]">
                  Visualization temporarily unavailable
                </div>
              }
            >
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
