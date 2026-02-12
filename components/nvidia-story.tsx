"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { ArrowRight, FileText, Calendar } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { nvidiaStoryData } from "@/lib/content";
import { MarketCapDrop } from "@/components/market-cap-drop";
import { NvidiaStoryTimeline } from "@/components/nvidia-story-timeline";
import { NvidiaQuoteWall } from "@/components/nvidia-quote-wall";
import { NvidiaPodcastSection } from "@/components/nvidia-podcast-section";

// =============================================================================
// HERO SECTION
// Full-viewport hero with the $600B stat
// =============================================================================

function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section
      ref={ref}
      className="relative flex min-h-[min(90dvh,90vh)] flex-col items-center justify-center overflow-hidden px-4 py-20"
      aria-label="The $600B Drop"
    >
      {/* Animated gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/30 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        {/* Subtle animated glow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: prefersReducedMotion ? 0.3 : [0.1, 0.3, 0.1] }}
          transition={
            prefersReducedMotion
              ? {}
              : { duration: 8, repeat: Infinity, ease: "easeInOut" }
          }
          className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/20 blur-[120px]"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Date badge */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm text-slate-400"
        >
          <Calendar className="h-4 w-4" />
          January 27, 2025
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8 text-5xl font-black tracking-tight text-white sm:text-6xl md:text-7xl"
        >
          {nvidiaStoryData.hero.headline}
        </motion.h1>

        {/* Market cap visualization */}
        <MarketCapDrop showChart={false} className="mb-8" />

        {/* Subheadline */}
        <motion.p
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl"
        >
          {nvidiaStoryData.hero.subheadline}
        </motion.p>

        {/* CTA to read the essay */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 2 }}
          className="mt-10"
        >
          <Link
            href={nvidiaStoryData.hero.essayUrl}
            className="inline-flex items-center gap-2 rounded-full bg-violet-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-violet-400 hover:shadow-lg hover:shadow-violet-500/30"
          >
            <FileText className="h-4 w-4" />
            Read the Essay
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 2.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={prefersReducedMotion ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-slate-500"
        >
          <span className="text-xs uppercase tracking-wider">Scroll</span>
          <div className="h-6 w-4 rounded-full border border-slate-600 p-1">
            <motion.div
              animate={prefersReducedMotion ? {} : { y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="h-1.5 w-1.5 rounded-full bg-slate-500"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// =============================================================================
// ESSAY SECTION
// Quick access to read the full essay
// =============================================================================

function EssaySection() {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden border-y border-slate-800 bg-slate-900/50 px-4 py-20 md:py-28"
      aria-label="The essay"
    >
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 md:p-10"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-10">
            {/* Essay icon */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30">
              <FileText className="h-10 w-10" />
            </div>

            {/* Essay details */}
            <div className="flex-1">
              <span className="text-sm font-medium text-violet-400">
                12,000 words · Markets & AI
              </span>
              <h2 className="mt-1 text-2xl font-bold text-white md:text-3xl">
                The Short Case for Nvidia Stock
              </h2>
              <p className="mt-2 text-slate-400">
                A deep dive into how AI economics, models like DeepSeek, and GPU
                supply can collide with valuation narratives. Explores the
                potential reflexivity of the AI capex cycle.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="rounded-full bg-slate-700/50 px-3 py-1 text-xs text-slate-400">
                  Published January 25, 2025
                </span>
                <span className="rounded-full bg-slate-700/50 px-3 py-1 text-xs text-slate-400">
                  Shared by Chamath & Naval
                </span>
              </div>
            </div>

            {/* CTA */}
            <Link
              href={nvidiaStoryData.hero.essayUrl}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-all hover:bg-slate-100 md:self-start"
            >
              Read Essay
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// =============================================================================
// AFTERMATH SECTION
// Brief note connecting to current relevance
// =============================================================================

function AftermathSection() {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative px-4 py-20 md:py-28"
      aria-label="The story continues"
    >
      <div className="mx-auto max-w-2xl text-center">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">
            The Story Continues
          </h2>
          <p className="text-slate-400">
            The questions raised about AI infrastructure economics, efficiency
            breakthroughs, and competitive dynamics remain relevant as the
            industry evolves. Jeffrey continues to analyze markets and build
            tools for the AI era.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/writing"
              className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-5 py-2.5 text-sm font-semibold text-violet-400 ring-1 ring-inset ring-violet-500/30 transition-all hover:bg-violet-500/20 hover:text-violet-300"
            >
              Read More Essays
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/consulting"
              className="inline-flex items-center gap-2 rounded-full bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-300 ring-1 ring-inset ring-white/10 transition-all hover:bg-white/10 hover:text-white"
            >
              Work with Jeffrey
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// =============================================================================
// SECTION WRAPPER
// Consistent spacing and container for each major section
// =============================================================================

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

function SectionWrapper({ children, className, id }: SectionWrapperProps) {
  return (
    <div id={id} className={cn("px-4 py-20 md:py-28", className)}>
      <div className="mx-auto max-w-5xl">{children}</div>
    </div>
  );
}

// =============================================================================
// MAIN NVIDIA STORY COMPONENT
// =============================================================================

export function NvidiaStory() {
  return (
    <main className="min-h-screen bg-slate-950">
      {/* Hero - The $600B Drop */}
      <HeroSection />

      {/* The Essay - Quick access */}
      <EssaySection />

      {/* Timeline - Sequence of events */}
      <SectionWrapper id="timeline" className="bg-slate-950">
        <NvidiaStoryTimeline />
      </SectionWrapper>

      {/* Quote Wall - What they're saying */}
      <SectionWrapper id="quotes" className="border-y border-slate-800 bg-slate-900/30">
        <NvidiaQuoteWall />
      </SectionWrapper>

      {/* Podcasts - Listen & Learn */}
      <SectionWrapper id="podcasts" className="bg-slate-950">
        <NvidiaPodcastSection />
      </SectionWrapper>

      {/* Aftermath - The story continues */}
      <AftermathSection />
    </main>
  );
}

export default NvidiaStory;
