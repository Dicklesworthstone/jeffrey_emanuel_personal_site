"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import ErrorBoundary from "@/components/error-boundary";
import { TldrHero } from "@/components/tldr-hero";
import { TldrToolGrid } from "@/components/tldr-tool-grid";
import { TldrSynergyDiagram } from "@/components/tldr-synergy-diagram";
import { tldrFlywheelTools, tldrPageData } from "@/lib/content";

// =============================================================================
// FLYWHEEL EXPLANATION SECTION
// =============================================================================

function FlywheelExplanation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion ?? false;

  const { flywheelExplanation } = tldrPageData;

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden py-12 md:py-24"
    >
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent" />

      <div className="container relative mx-auto px-4 sm:px-6">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Text content */}
          <motion.div
            initial={reducedMotion ? {} : { opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: reducedMotion ? 0 : 0.5 }}
          >
            <h2 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
              {flywheelExplanation.title}
            </h2>
            <div className="mt-4 space-y-3 sm:mt-6 sm:space-y-4">
              {flywheelExplanation.paragraphs.map((paragraph, i) => (
                <motion.p
                  key={i}
                  initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: reducedMotion ? 0 : 0.4,
                    delay: reducedMotion ? 0 : 0.1 + i * 0.1,
                  }}
                  className="text-sm leading-relaxed text-slate-400 sm:text-base"
                >
                  {paragraph}
                </motion.p>
              ))}
            </div>
          </motion.div>

          {/* Synergy diagram */}
          <motion.div
            initial={reducedMotion ? {} : { opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.2 }}
            className="mx-auto max-w-sm lg:max-w-none"
          >
            <TldrSynergyDiagram tools={tldrFlywheelTools} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function TldrPage() {
  return (
    <ErrorBoundary>
      <main className="min-h-screen overflow-x-hidden">
        {/* Hero Section */}
        <TldrHero />

        {/* Flywheel Explanation with Diagram */}
        <ErrorBoundary>
          <FlywheelExplanation />
        </ErrorBoundary>

        {/* Tools Grid */}
        <section className="py-12 md:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <ErrorBoundary>
              <TldrToolGrid tools={tldrFlywheelTools} />
            </ErrorBoundary>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="border-t border-white/5 py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
              Get Started
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-slate-400 sm:text-base">
              The fastest way to set up the entire flywheel ecosystem is with ACFS.
              One command, 30 minutes, and you&apos;re ready to go.
            </p>
            <div className="mt-6 flex flex-col items-center gap-4 md:mt-8">
              <div className="w-full max-w-2xl overflow-x-auto rounded-lg bg-slate-800/50 ring-1 ring-slate-700/50">
                <code className="block whitespace-nowrap px-4 py-3 font-mono text-xs text-violet-300 sm:text-sm">
                  curl -fsSL https://raw.githubusercontent.com/Dicklesworthstone/agentic_coding_flywheel_setup/main/install.sh | bash -s -- --yes --mode vibe
                </code>
              </div>
              <p className="text-xs text-slate-500">
                Or visit{" "}
                <a
                  href="https://agent-flywheel.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 underline hover:text-violet-300"
                >
                  agent-flywheel.com
                </a>{" "}
                for the step-by-step wizard.
              </p>
            </div>
          </div>
        </section>
      </main>
    </ErrorBoundary>
  );
}
