"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import ErrorBoundary from "@/components/error-boundary";
import { AlertTriangle } from "lucide-react";

function VizFallback() {
  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-slate-800/60 bg-slate-900/40 px-6 py-8 text-center">
      <div className="flex flex-col items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-400/70" />
        <p className="text-sm text-slate-500">
          Visualization failed to load.
        </p>
      </div>
    </div>
  );
}

function VizSkeleton() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[300px] items-center justify-center rounded-xl border border-slate-800/40 bg-slate-900/20 px-6 py-8"
    >
      <span className="sr-only">Loading visualization</span>
      <div
        aria-hidden="true"
        className={`h-5 w-5 rounded-full border-2 border-slate-600 border-t-cyan-400 ${
          prefersReducedMotion ? "" : "animate-spin"
        }`}
      />
    </div>
  );
}

const fallback = <VizFallback />;

function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  vizId: string,
) {
  function Wrapped(props: P) {
    return (
      <div data-viz={vizId}>
        <ErrorBoundary fallback={fallback}>
          <Component {...props} />
        </ErrorBoundary>
      </div>
    );
  }
  Wrapped.displayName = `Safe(${Component.displayName || Component.name || "Component"})`;
  return Wrapped;
}

export const TierTriageViz = withErrorBoundary(
  dynamic(
    () =>
      import("./wills-estate-visualizations").then((m) => ({
        default: m.TierTriageViz,
      })),
    { ssr: false, loading: () => <VizSkeleton /> },
  ),
  "tier-triage",
);

export const AxiomCoherenceViz = withErrorBoundary(
  dynamic(
    () =>
      import("./wills-estate-visualizations").then((m) => ({
        default: m.AxiomCoherenceViz,
      })),
    { ssr: false, loading: () => <VizSkeleton /> },
  ),
  "axiom-coherence",
);

export const IntakePhasesViz = withErrorBoundary(
  dynamic(
    () =>
      import("./wills-estate-visualizations").then((m) => ({
        default: m.IntakePhasesViz,
      })),
    { ssr: false, loading: () => <VizSkeleton /> },
  ),
  "intake-phases",
);

export const DeliverablesTreeViz = withErrorBoundary(
  dynamic(
    () =>
      import("./wills-estate-visualizations").then((m) => ({
        default: m.DeliverablesTreeViz,
      })),
    { ssr: false, loading: () => <VizSkeleton /> },
  ),
  "deliverables-tree",
);

export const AntiPatternCardsViz = withErrorBoundary(
  dynamic(
    () =>
      import("./wills-estate-visualizations").then((m) => ({
        default: m.AntiPatternCardsViz,
      })),
    { ssr: false, loading: () => <VizSkeleton /> },
  ),
  "anti-pattern-cards",
);
