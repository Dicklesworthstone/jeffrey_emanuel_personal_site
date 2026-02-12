"use client";

import { type ReactNode } from "react";
import { Sigma, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import type { JargonTerm } from "@/lib/jargon-types";
import { TooltipShell } from "./tooltip-shell";

export type TooltipVariant = "cyan" | "purple" | "emerald" | "amber" | "orange" | "rose" | "blue";
export type TooltipMode = "math" | "text";

interface MathTooltipProps {
  /** The jargon term data object */
  term: JargonTerm | undefined;
  /** The rendered trigger element (e.g., the math formula) */
  children: ReactNode;
  /** Color theme for the tooltip */
  variant?: TooltipVariant;
  /** Display mode: 'math' (formula) or 'text' (jargon term) */
  mode?: TooltipMode;
  /** Optional: additional class names */
  className?: string;
  /** Optional: hide the icon indicator */
  simple?: boolean;
}

const VARIANT_STYLES = {
  cyan: {
    iconBg: "bg-cyan-500",
    iconText: "text-white",
    headerIconBg: "bg-cyan-400/20",
    headerIconText: "text-cyan-400",
    borderColor: "border-cyan-500/10",
    ringColor: "focus-visible:ring-cyan-400",
    analogyBg: "bg-cyan-400/5",
    analogyText: "text-cyan-400",
    sheetGradient: "from-cyan-400/20 to-blue-500/20",
    sheetBorder: "border-cyan-500/20",
    underline: "decoration-cyan-400/30 hover:decoration-cyan-400/60 hover:text-cyan-300",
  },
  purple: {
    iconBg: "bg-purple-500",
    iconText: "text-white",
    headerIconBg: "bg-purple-400/20",
    headerIconText: "text-purple-400",
    borderColor: "border-purple-500/10",
    ringColor: "focus-visible:ring-purple-400",
    analogyBg: "bg-purple-400/5",
    analogyText: "text-purple-400",
    sheetGradient: "from-purple-400/20 to-pink-500/20",
    sheetBorder: "border-purple-500/20",
    underline: "decoration-purple-400/30 hover:decoration-purple-400/60 hover:text-purple-300",
  },
  emerald: {
    iconBg: "bg-emerald-500",
    iconText: "text-white",
    headerIconBg: "bg-emerald-400/20",
    headerIconText: "text-emerald-400",
    borderColor: "border-emerald-500/10",
    ringColor: "focus-visible:ring-emerald-400",
    analogyBg: "bg-emerald-400/5",
    analogyText: "text-emerald-400",
    sheetGradient: "from-emerald-400/20 to-teal-500/20",
    sheetBorder: "border-emerald-500/20",
    underline: "decoration-emerald-400/30 hover:decoration-emerald-400/60 hover:text-emerald-300",
  },
  amber: {
    iconBg: "bg-amber-500",
    iconText: "text-white",
    headerIconBg: "bg-amber-400/20",
    headerIconText: "text-amber-400",
    borderColor: "border-amber-500/10",
    ringColor: "focus-visible:ring-amber-400",
    analogyBg: "bg-amber-400/5",
    analogyText: "text-amber-400",
    sheetGradient: "from-amber-400/20 to-orange-500/20",
    sheetBorder: "border-amber-500/20",
    underline: "decoration-amber-400/30 hover:decoration-amber-400/60 hover:text-amber-300",
  },
  orange: {
    iconBg: "bg-orange-500",
    iconText: "text-white",
    headerIconBg: "bg-orange-400/20",
    headerIconText: "text-orange-400",
    borderColor: "border-orange-500/10",
    ringColor: "focus-visible:ring-orange-400",
    analogyBg: "bg-orange-400/5",
    analogyText: "text-orange-400",
    sheetGradient: "from-orange-400/20 to-red-500/20",
    sheetBorder: "border-orange-500/20",
    underline: "decoration-orange-400/30 hover:decoration-orange-400/60 hover:text-orange-300",
  },
  rose: {
    iconBg: "bg-rose-500",
    iconText: "text-white",
    headerIconBg: "bg-rose-400/20",
    headerIconText: "text-rose-400",
    borderColor: "border-rose-500/10",
    ringColor: "focus-visible:ring-rose-400",
    analogyBg: "bg-rose-400/5",
    analogyText: "text-rose-400",
    sheetGradient: "from-rose-400/20 to-red-500/20",
    sheetBorder: "border-rose-500/20",
    underline: "decoration-rose-400/30 hover:decoration-rose-400/60 hover:text-rose-300",
  },
  blue: {
    iconBg: "bg-blue-500",
    iconText: "text-white",
    headerIconBg: "bg-blue-400/20",
    headerIconText: "text-blue-400",
    borderColor: "border-blue-500/10",
    ringColor: "focus-visible:ring-blue-400",
    analogyBg: "bg-blue-400/5",
    analogyText: "text-blue-400",
    sheetGradient: "from-blue-400/20 to-indigo-500/20",
    sheetBorder: "border-blue-500/20",
    underline: "decoration-blue-400/30 hover:decoration-blue-400/60 hover:text-blue-300",
  },
};

/**
 * Canonical Tooltip Component.
 * Unified implementation for all interactive articles.
 * Handles both Math (Sigma) and Jargon (Lightbulb) modes.
 */
export function MathTooltip({ term, children, variant = "cyan", mode = "math", simple = false, className }: MathTooltipProps) {
  if (!term) {
    return <>{children}</>;
  }

  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.cyan;
  const Icon = mode === "math" ? Sigma : Lightbulb;

  return (
    <TooltipShell
      title={term.term}
      ariaLabel={`Explain ${mode === "math" ? "math" : "term"}: ${term.term}`}
      variant={variant}
      className={cn(
        "relative inline-block cursor-help transition-all duration-200 group/math focus:outline-none focus-visible:ring-2 rounded-lg",
        styles.ringColor,
        mode === "text" && [
          "decoration-[1.5px] underline underline-offset-[3px] decoration-dotted",
          styles.underline
        ],
        mode === "math" && "hover:scale-[1.02]",
        className
      )}
      tooltipContent={<MathTooltipContent term={term} styles={styles} Icon={Icon} />}
      sheetContent={<MathSheetContent term={term} styles={styles} Icon={Icon} />}
    >
      <div className={mode === "math" ? "relative" : ""}>
        {children}
        {mode === "math" && !simple && (
          <div className="absolute -right-1 -top-1 opacity-0 group-hover/math:opacity-100 transition-opacity">
            <div className={cn("flex h-3.5 w-3.5 items-center justify-center rounded-full shadow-lg border border-white/10", styles.iconBg)}>
              <Icon className={cn("h-2 w-2", styles.iconText)} />
            </div>
          </div>
        )}
      </div>
    </TooltipShell>
  );
}

function MathTooltipContent({ term, styles, Icon }: { term: JargonTerm; styles: any; Icon: any }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <div className={cn("flex h-6 w-6 items-center justify-center rounded-lg", styles.headerIconBg, styles.headerIconText)}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="font-bold text-white tracking-tight">{term.term}</span>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-200 leading-snug">
          {term.short}
        </p>
        <p className="text-xs leading-relaxed text-slate-400 italic">
          {term.long}
        </p>
      </div>
      {term.analogy && (
        <div className={cn("rounded-lg border px-3 py-2 text-[11px] text-slate-300 leading-relaxed", styles.analogyBg, styles.borderColor)}>
          <span className={cn("font-bold uppercase text-[9px] tracking-widest block mb-1", styles.analogyText)}>The Intuition:</span>
          {term.analogy}
        </div>
      )}
    </div>
  );
}

function MathSheetContent({ term, styles, Icon }: { term: JargonTerm; styles: any; Icon: any }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-xl border", styles.sheetGradient, styles.sheetBorder)}>
          <Icon className={cn("h-7 w-7", styles.headerIconText)} />
        </div>
        <div>
          <h3 className="text-2xl font-black text-white tracking-tight">{term.term}</h3>
          <p className={cn("text-sm font-medium uppercase tracking-widest", styles.headerIconText)}>{term.short}</p>
        </div>
      </div>
      
      <div className="space-y-5">
        <div className="space-y-2">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">The Definition</h4>
          <p className="text-base leading-relaxed text-slate-200">{term.long}</p>
        </div>

        {term.analogy && (
          <div className={cn("rounded-2xl border p-5 shadow-inner", styles.sheetBorder, styles.analogyBg)}>
            <h4 className={cn("mb-2 text-xs font-black uppercase tracking-[0.2em]", styles.headerIconText)}>Intuitive Analogy</h4>
            <p className="text-base leading-relaxed text-slate-200">
              {term.analogy}
            </p>
          </div>
        )}

        {term.why && (
          <div className="rounded-2xl border border-white/5 bg-white/5 p-5">
            <h4 className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Why it matters</h4>
            <p className="text-base leading-relaxed text-slate-200">
              {term.why}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
