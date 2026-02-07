"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import { Copy, Check } from "lucide-react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import ErrorBoundary from "@/components/error-boundary";
import { TldrHero } from "@/components/tldr-hero";
import { TldrToolGrid } from "@/components/tldr-tool-grid";
import { TldrSynergyDiagram } from "@/components/tldr-synergy-diagram";
import { TldrSectionNav } from "@/components/tldr-section-nav";
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
      {/* Mesh gradient background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            "radial-gradient(circle at 30% 40%, rgba(139, 92, 246, 0.12), transparent 50%)",
            "radial-gradient(circle at 70% 60%, rgba(52, 211, 153, 0.08), transparent 50%)",
            "radial-gradient(ellipse 100% 60% at 50% 50%, rgba(15, 23, 42, 0.4), transparent 70%)",
          ].join(", "),
        }}
      />

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
              {flywheelExplanation.paragraphs.map((paragraph, index) => (
                <motion.p
                  key={paragraph.slice(0, 50)}
                  initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: reducedMotion ? 0 : 0.4,
                    delay: reducedMotion ? 0 : 0.1 + index * 0.1,
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
// FOOTER CTA WITH COPY BUTTON
// =============================================================================

const INSTALL_COMMAND = `curl -fsSL https://raw.githubusercontent.com/Dicklesworthstone/agentic_coding_flywheel_setup/main/install.sh | bash -s -- --yes --mode vibe`;

function FooterCTA({ id }: { id?: string }) {
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently fail - clipboard API may not be available
    }
  }, []);

  return (
    <section id={id} className="border-t border-white/5 py-12 md:py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
          Get Started
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-slate-400 sm:text-base">
          The fastest way to set up the entire flywheel ecosystem is with ACFS.
          One command, 30 minutes, and you&apos;re ready to go.
        </p>
        <div className="mt-6 flex flex-col items-center gap-4 md:mt-8">
          <div className="group relative w-full max-w-4xl">
            <div className="overflow-x-auto rounded-xl bg-slate-900/80 ring-1 ring-slate-700/50 transition-all duration-200 hover:ring-violet-500/30">
              <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
                <code className="flex-1 whitespace-nowrap font-mono text-xs text-violet-300 sm:text-sm md:text-base">
                  {INSTALL_COMMAND}
                </code>
                <button
                  onClick={handleCopy}
                  className="flex-shrink-0 flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg bg-slate-800 p-2.5 text-slate-400 transition-all duration-200 hover:bg-violet-600 hover:text-white active:scale-95 sm:p-2.5"
                  aria-label={copied ? "Copied!" : "Copy to clipboard"}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-400 sm:h-5 sm:w-5" />
                  ) : (
                    <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </button>
              </div>
            </div>
            <div role="status" aria-live="polite" aria-atomic="true">
              {copied && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white shadow-lg">
                  Copied!
                </div>
              )}
            </div>
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
  );
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function TldrPage() {
  const sectionNavItems = useMemo(() => {
    const core = tldrFlywheelTools.filter((t) => t.category === "core");
    const supporting = tldrFlywheelTools.filter((t) => t.category === "supporting");
    return [
      { id: "core-tools", label: "Core Tools", shortLabel: "Core", count: core.length },
      { id: "supporting-tools", label: "Supporting Tools", shortLabel: "Support", count: supporting.length },
      { id: "get-started", label: "Get Started", shortLabel: "Setup", count: 0 },
    ].filter((s) => s.count > 0 || s.id === "get-started");
  }, []);

  return (
    <ErrorBoundary>
      <main className="min-h-screen overflow-x-hidden">
        {/* Hero Section */}
        <TldrHero id="tldr-hero" />

        {/* Flywheel Explanation with Diagram */}
        <ErrorBoundary
          fallback={
            <section className="py-12 md:py-24">
              <div className="container mx-auto px-4 text-center">
                <p className="text-sm text-slate-500">
                  Unable to load the flywheel diagram. Please refresh the page.
                </p>
              </div>
            </section>
          }
        >
          <FlywheelExplanation />
        </ErrorBoundary>

        {/* Sticky Section Navigation */}
        <TldrSectionNav
          sections={sectionNavItems}
          triggerElementId="tldr-hero"
        />

        {/* Tools Grid */}
        <section className="relative py-12 md:py-24">
          {/* Subtle mesh gradient behind tools */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: [
                "radial-gradient(ellipse 70% 30% at 10% 20%, rgba(139, 92, 246, 0.06), transparent)",
                "radial-gradient(ellipse 50% 40% at 90% 80%, rgba(236, 72, 153, 0.04), transparent)",
              ].join(", "),
            }}
          />
          <div className="container mx-auto px-4 sm:px-6">
            <ErrorBoundary
              fallback={
                <div className="py-16 text-center">
                  <p className="text-sm text-slate-500">
                    Unable to load tools. Please refresh the page.
                  </p>
                </div>
              }
            >
              <TldrToolGrid tools={tldrFlywheelTools} />
            </ErrorBoundary>
          </div>
        </section>

        {/* Footer CTA */}
        <FooterCTA id="get-started" />
      </main>
    </ErrorBoundary>
  );
}
