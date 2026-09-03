"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
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

type CopyState = "idle" | "copied" | "manual";

function FooterCTA({ id }: { id?: string }) {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
      setCopyState("copied");
      copyTimeoutRef.current = setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      // Clipboard API unavailable (insecure context, denied permission, old
      // browser): select the command so a keyboard copy works, and say so.
      const selection = window.getSelection();
      if (codeRef.current && selection) {
        const range = document.createRange();
        range.selectNodeContents(codeRef.current);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      setCopyState("manual");
      copyTimeoutRef.current = setTimeout(() => setCopyState("idle"), 6000);
    }
  }, []);

  return (
    <section id={id} className="scroll-mt-32 border-t border-white/5 py-12 md:py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
          Get Started
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-slate-400 sm:text-base">
          The fastest way to set up the entire flywheel ecosystem is with ACFS.
          One command, 30 minutes, and you&apos;re ready to go.
        </p>
        <div className="mt-6 flex flex-col items-center gap-4 md:mt-8">
          <div className="w-full max-w-4xl">
            {/* The copy button lives outside the horizontal scroll container so it
                stays on screen on phones even though the command is ~150 chars. */}
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl bg-slate-900/80 p-2 ring-1 ring-slate-700/50 transition-[box-shadow] duration-200 hover:ring-violet-500/30 sm:gap-3">
              {/* Focusable so keyboard and switch users can scroll the command
                  horizontally; a scroll container with no focusable content is
                  unreachable without a pointer (axe: scrollable-region-focusable). */}
              <div
                className="min-w-0 overflow-x-auto px-2 py-2 sm:px-4 rounded-lg"
                tabIndex={0}
                role="region"
                aria-label="Install command"
              >
                <code
                  ref={codeRef}
                  className="whitespace-nowrap font-mono text-xs text-violet-300 sm:text-sm md:text-base"
                >
                  {INSTALL_COMMAND}
                </code>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg bg-slate-800 p-2.5 text-slate-400 transition-[background-color,color,transform] duration-200 hover:bg-violet-600 hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                aria-label={copyState === "copied" ? "Copied install command" : "Copy install command"}
              >
                {copyState === "copied" ? (
                  <Check className="h-4 w-4 text-emerald-400 sm:h-5 sm:w-5" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                )}
              </button>
            </div>
            <p role="status" aria-live="polite" aria-atomic="true" className="mt-2 min-h-5 text-xs">
              {copyState === "copied" && (
                <span className="text-emerald-400">Copied to clipboard</span>
              )}
              {copyState === "manual" && (
                <span className="text-amber-300">
                  Couldn&apos;t access the clipboard. The command is selected; press Ctrl+C (⌘C on Mac) to copy it.
                </span>
              )}
            </p>
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
      {/* ClientShell already renders the page's single <main id="main-content"> */}
      <div className="min-h-screen overflow-x-hidden">
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
      </div>
    </ErrorBoundary>
  );
}
