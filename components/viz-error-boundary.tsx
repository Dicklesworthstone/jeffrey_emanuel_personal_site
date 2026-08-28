"use client";

import dynamic from "next/dynamic";
import { memo, type CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";
import ErrorBoundary from "@/components/error-boundary";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { AlertTriangle } from "lucide-react";

/*
  Skeleton heights are derived from the same data counts the visualizations
  render (see `wills-estate-visualizations.tsx`). They are estimates of the
  mounted height per Tailwind breakpoint so the document does not grow by
  thousands of pixels when the chunk lands (progress bar jumping backwards,
  TOC anchors drifting). Keep the counts in sync with the data arrays; the
  per-item heights are rough measurements of the rendered rows/cards.
*/
const VIZ_COUNTS = {
  tierCards: 5,
  complexityOverlays: 7,
  antiPatternCards: 13,
  deliverableLeaves: 45,
  deliverableFolders: 3,
  deliverableSpotlights: 3,
  pricingChips: 8,
  installSteps: 4,
  workingFolderInputs: 8,
  workingFolderOutputs: 3,
  stackCards: 3,
} as const;

type BreakpointHeights = { base: number; md: number; lg: number; xl: number };

function px(value: number) {
  return `${Math.round(value)}px`;
}

function estimateVizHeights(vizId: string): BreakpointHeights {
  const c = VIZ_COUNTS;
  switch (vizId) {
    case "tier-triage": {
      // header + card grid (1 / 3 / 5 columns) + detail panel + overlay box
      const cards = (cols: number) => Math.ceil(c.tierCards / cols) * 236;
      const overlay = (rows: number) => 180 + rows * 48;
      return {
        base: 300 + cards(1) + 520 + overlay(4),
        md: 260 + cards(3) + 380 + overlay(2),
        lg: 240 + cards(5) + 320 + overlay(1),
        xl: 240 + cards(5) + 320 + overlay(1),
      };
    }
    case "anti-pattern-cards": {
      // < sm: inline-expand cards (front only, ~340px); >= sm: flip cards
      // sized to the taller back face (~560-600px) in 2 / 2 / 4 columns.
      const compact = c.antiPatternCards * 340 + (c.antiPatternCards - 1) * 12;
      const stacked = (cols: number, cardHeight: number) =>
        Math.ceil(c.antiPatternCards / cols) * cardHeight +
        (Math.ceil(c.antiPatternCards / cols) - 1) * 16;
      return {
        base: 330 + compact,
        md: 290 + stacked(2, 560),
        lg: 250 + stacked(2, 540),
        xl: 230 + stacked(4, 600),
      };
    }
    case "deliverables-tree": {
      // header + filters + tree (collapsed/capped below lg, expanded at lg+)
      // + detail panel (inline below lg, side column at lg+) + spotlights
      const filters = (rows: number) => 150 + rows * 44;
      const leafRow = 72;
      const compactTree =
        c.deliverableFolders * 64 + Math.min(9, c.deliverableLeaves) * leafRow + 60;
      const fullTree =
        c.deliverableFolders * 64 + c.deliverableLeaves * leafRow + 60;
      const spotlights = (cols: number) =>
        Math.ceil(c.deliverableSpotlights / cols) * 170;
      return {
        base: 420 + filters(5) + compactTree + 520 + spotlights(1),
        md: 340 + filters(3) + compactTree + 460 + spotlights(2),
        lg: 300 + filters(2) + fullTree + spotlights(3),
        xl: 300 + filters(2) + fullTree + spotlights(3),
      };
    }
    case "pricing-comparison": {
      // controls column (slider box + chip grid) + results column
      const chips = (cols: number) => Math.ceil(c.pricingChips / cols) * 80;
      const controls = (chipCols: number) => 260 + 360 + 140 + chips(chipCols);
      const results = 760;
      return {
        base: controls(1) + results + 80,
        md: Math.max(controls(1), results) + 120,
        lg: Math.max(controls(2), results) + 100,
        xl: Math.max(controls(2), results) + 100,
      };
    }
    case "install-flow": {
      const steps = (cols: number) => Math.ceil(c.installSteps / cols) * 200;
      return {
        base: 300 + steps(1) + 120,
        md: 260 + steps(2) + 110,
        lg: 240 + steps(4) + 140,
        xl: 240 + steps(4) + 140,
      };
    }
    case "working-folder": {
      const inputs = (cols: number) => Math.ceil(c.workingFolderInputs / cols) * 84;
      const inputColumn = (cols: number) => 150 + inputs(cols) + 150;
      const sessionColumn = 520;
      const outputColumn = 150 + c.workingFolderOutputs * 92 + 220;
      const stacked = (cols: number) =>
        inputColumn(cols) + 60 + sessionColumn + 60 + outputColumn;
      return {
        base: 300 + stacked(1),
        md: 260 + stacked(2),
        lg: 240 + stacked(2),
        xl: 240 + Math.max(inputColumn(2), sessionColumn, outputColumn),
      };
    }
    case "stack": {
      const cards = (cols: number) => Math.ceil(c.stackCards / cols) * 340;
      return {
        base: 300 + cards(1) + 120 + 260,
        md: 260 + cards(3) + 64 + 200,
        lg: 240 + cards(3) + 64 + 180,
        xl: 240 + cards(3) + 64 + 180,
      };
    }
    default:
      return { base: 300, md: 300, lg: 300, xl: 300 };
  }
}

const VIZ_HEIGHT_CLASS =
  "min-h-[var(--viz-h-base)] md:min-h-[var(--viz-h-md)] lg:min-h-[var(--viz-h-lg)] xl:min-h-[var(--viz-h-xl)]";

function getVizHeightStyle(vizId: string): CSSProperties {
  const heights = estimateVizHeights(vizId);
  return {
    "--viz-h-base": px(heights.base),
    "--viz-h-md": px(heights.md),
    "--viz-h-lg": px(heights.lg),
    "--viz-h-xl": px(heights.xl),
  } as CSSProperties;
}

function VizFallback({ vizId }: { vizId: string }) {
  return (
    <div
      style={getVizHeightStyle(vizId)}
      className={`flex ${VIZ_HEIGHT_CLASS} items-center justify-center rounded-xl border border-slate-800/60 bg-slate-900/40 px-6 py-8 text-center`}
    >
      <div className="flex flex-col items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-400/70" aria-hidden="true" />
        <p className="text-sm text-slate-500">
          Visualization failed to load.
        </p>
      </div>
    </div>
  );
}

/*
  The skeleton is deliberately not a live region. Seven simultaneous
  `role="status"` regions announced "Loading visualization" on every page
  load; the article now carries one shared status line instead.
*/
function VizSkeleton({ vizId }: { vizId: string }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      data-viz-skeleton={vizId}
      style={getVizHeightStyle(vizId)}
      className={`flex ${VIZ_HEIGHT_CLASS} items-center justify-center rounded-xl border border-slate-800/40 bg-slate-900/20 px-6 py-8`}
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

/*
  Viewport gate: the visualization chunk is only requested (and the component
  only mounted) once the wrapper is within ~600px of the viewport. Until then
  the skeleton reserves the estimated height. The wrapper is memoized so the
  article's own re-renders do not reconcile seven visualization trees.
*/
const VIZ_MOUNT_ROOT_MARGIN = "600px 0px 600px 0px";

function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  vizId: string,
) {
  const fallback = <VizFallback vizId={vizId} />;

  function Wrapped(props: P) {
    const { ref, hasEverIntersected } = useIntersectionObserver<HTMLDivElement>({
      threshold: 0,
      rootMargin: VIZ_MOUNT_ROOT_MARGIN,
      triggerOnce: true,
    });

    return (
      <div ref={ref} data-viz={vizId} data-viz-mounted={hasEverIntersected ? "true" : "false"}>
        {hasEverIntersected ? (
          <ErrorBoundary fallback={fallback}>
            <Component {...props} />
          </ErrorBoundary>
        ) : (
          <VizSkeleton vizId={vizId} />
        )}
      </div>
    );
  }
  Wrapped.displayName = `Safe(${Component.displayName || Component.name || "Component"})`;
  return memo(Wrapped);
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
