"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import ErrorBoundary from "@/components/error-boundary";
import { AlertTriangle } from "lucide-react";

const VIZ_SKELETON_HEIGHTS = {
  "tier-triage": "min-h-[46rem] md:min-h-[40rem]",
  "axiom-coherence": "min-h-[42rem] md:min-h-[38rem]",
  "intake-phases": "min-h-[44rem] md:min-h-[38rem]",
  "deliverables-tree": "min-h-[48rem] md:min-h-[42rem]",
  "anti-pattern-cards": "min-h-[32rem] md:min-h-[34rem]",
  "pricing-comparison": "min-h-[56rem] md:min-h-[44rem]",
  "install-flow": "min-h-[36rem] md:min-h-[32rem]",
  "working-folder": "min-h-[48rem] md:min-h-[44rem]",
  stack: "min-h-[26rem] md:min-h-[24rem]",
} as const;

function getVizHeightClass(vizId: string) {
  return VIZ_SKELETON_HEIGHTS[vizId as keyof typeof VIZ_SKELETON_HEIGHTS] ?? "min-h-[300px]";
}

function VizFallback({ vizId }: { vizId: string }) {
  return (
    <div
      className={`flex ${getVizHeightClass(vizId)} items-center justify-center rounded-xl border border-slate-800/60 bg-slate-900/40 px-6 py-8 text-center`}
    >
      <div className="flex flex-col items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-400/70" />
        <p className="text-sm text-slate-500">
          Visualization failed to load.
        </p>
      </div>
    </div>
  );
}

function VizSkeleton({ vizId }: { vizId: string }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex ${getVizHeightClass(vizId)} items-center justify-center rounded-xl border border-slate-800/40 bg-slate-900/20 px-6 py-8`}
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

function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  vizId: string,
) {
  const fallback = <VizFallback vizId={vizId} />;

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
    { ssr: false, loading: () => <VizSkeleton vizId="tier-triage" /> },
  ),
  "tier-triage",
);

export const AxiomCoherenceViz = withErrorBoundary(
  dynamic(
    () =>
      import("./wills-estate-visualizations").then((m) => ({
        default: m.AxiomCoherenceViz,
      })),
    { ssr: false, loading: () => <VizSkeleton vizId="axiom-coherence" /> },
  ),
  "axiom-coherence",
);

export const IntakePhasesViz = withErrorBoundary(
  dynamic(
    () =>
      import("./wills-estate-visualizations").then((m) => ({
        default: m.IntakePhasesViz,
      })),
    { ssr: false, loading: () => <VizSkeleton vizId="intake-phases" /> },
  ),
  "intake-phases",
);

export const DeliverablesTreeViz = withErrorBoundary(
  dynamic(
    () =>
      import("./wills-estate-visualizations").then((m) => ({
        default: m.DeliverablesTreeViz,
      })),
    { ssr: false, loading: () => <VizSkeleton vizId="deliverables-tree" /> },
  ),
  "deliverables-tree",
);

export const AntiPatternCardsViz = withErrorBoundary(
  dynamic(
    () =>
      import("./wills-estate-visualizations").then((m) => ({
        default: m.AntiPatternCardsViz,
      })),
    { ssr: false, loading: () => <VizSkeleton vizId="anti-pattern-cards" /> },
  ),
  "anti-pattern-cards",
);

export const PricingComparisonViz = withErrorBoundary(
  dynamic(
    () =>
      import("./wills-estate-visualizations").then((m) => ({
        default: m.PricingComparisonViz,
      })),
    { ssr: false, loading: () => <VizSkeleton vizId="pricing-comparison" /> },
  ),
  "pricing-comparison",
);

export const InstallFlowViz = withErrorBoundary(
  dynamic(
    () =>
      import("./wills-estate-visualizations").then((m) => ({
        default: m.InstallFlowViz,
      })),
    { ssr: false, loading: () => <VizSkeleton vizId="install-flow" /> },
  ),
  "install-flow",
);

export const WorkingFolderViz = withErrorBoundary(
  dynamic(
    () =>
      import("./wills-estate-visualizations").then((m) => ({
        default: m.WorkingFolderViz,
      })),
    { ssr: false, loading: () => <VizSkeleton vizId="working-folder" /> },
  ),
  "working-folder",
);

export const StackViz = withErrorBoundary(
  dynamic(
    () =>
      import("./wills-estate-visualizations").then((m) => ({
        default: m.StackViz,
      })),
    { ssr: false, loading: () => <VizSkeleton vizId="stack" /> },
  ),
  "stack",
);
