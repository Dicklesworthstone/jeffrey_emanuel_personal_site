"use client";

import dynamic from "next/dynamic";
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

const fallback = <VizFallback />;

function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
) {
  function Wrapped(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
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
    { ssr: false },
  ),
);

export const AxiomCoherenceViz = withErrorBoundary(
  dynamic(
    () =>
      import("./wills-estate-visualizations").then((m) => ({
        default: m.AxiomCoherenceViz,
      })),
    { ssr: false },
  ),
);

export const IntakePhasesViz = withErrorBoundary(
  dynamic(
    () =>
      import("./wills-estate-visualizations").then((m) => ({
        default: m.IntakePhasesViz,
      })),
    { ssr: false },
  ),
);

export const DeliverablesTreeViz = withErrorBoundary(
  dynamic(
    () =>
      import("./wills-estate-visualizations").then((m) => ({
        default: m.DeliverablesTreeViz,
      })),
    { ssr: false },
  ),
);

export const AntiPatternCardsViz = withErrorBoundary(
  dynamic(
    () =>
      import("./wills-estate-visualizations").then((m) => ({
        default: m.AntiPatternCardsViz,
      })),
    { ssr: false },
  ),
);
