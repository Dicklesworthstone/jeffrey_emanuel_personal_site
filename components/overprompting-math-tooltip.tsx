"use client";

import { type ReactNode } from "react";
import { Sigma } from "lucide-react";
import { cn } from "@/lib/utils";
import { getJargon, type JargonTerm } from "@/lib/overprompting-jargon";
import { TooltipShell } from "./tooltip-shell";

interface OverpromptingMathTooltipProps {
  /** The math key to look up in the dictionary */
  mathKey: string;
  /** The rendered math component */
  children: ReactNode;
  /** Optional: additional class names */
  className?: string;
}

/**
 * Math tooltip component for the Overprompting article.
 * Wraps math expressions with an intuitive explanation on hover/tap.
 * Uses Amber/Rose theme.
 */
export function OverpromptingMathTooltip({ mathKey, children, className }: OverpromptingMathTooltipProps) {
  const mathData = getJargon(mathKey);

  if (!mathData) {
    return <>{children}</>;
  }

  return (
    <TooltipShell
      title={mathData.term}
      ariaLabel={`Explain math: ${mathData.term}`}
      variant="amber"
      className={cn(
        "relative inline-block cursor-help transition-all duration-200 group/math",
        "hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg",
        className
      )}
      tooltipContent={<MathTooltipContent math={mathData} />}
      sheetContent={<MathSheetContent math={mathData} />}
    >
      <span className="relative inline-block">
        {children}
        <span className="absolute -right-1 -top-1 opacity-0 group-hover/math:opacity-100 transition-opacity">
          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 shadow-lg">
            <Sigma className="h-2 w-2 text-white" />
          </span>
        </span>
      </span>
    </TooltipShell>
  );
}

function MathTooltipContent({ math }: { math: JargonTerm }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-400/20 text-amber-400">
          <Sigma className="h-3.5 w-3.5" />
        </div>
        <span className="font-bold text-white tracking-tight">{math.term}</span>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-200 leading-snug">
          {math.short}
        </p>
        <p className="text-xs leading-relaxed text-slate-400 italic">
          {math.long}
        </p>
      </div>
      {math.analogy && (
        <div className="rounded-lg bg-amber-400/5 border border-amber-500/10 px-3 py-2 text-[11px] text-slate-300 leading-relaxed">
          <span className="font-bold text-amber-400 uppercase text-[9px] tracking-widest block mb-1">The Intuition:</span>
          {math.analogy}
        </div>
      )}
    </div>
  );
}

function MathSheetContent({ math }: { math: JargonTerm }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/20 to-rose-500/20 shadow-xl border border-amber-500/20">
          <Sigma className="h-7 w-7 text-amber-400" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-white tracking-tight">{math.term}</h3>
          <p className="text-sm font-medium text-amber-400 uppercase tracking-widest">{math.short}</p>
        </div>
      </div>
      
      <div className="space-y-5">
        <div className="space-y-2">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">The Mathematics</h4>
          <p className="text-base leading-relaxed text-slate-200">{math.long}</p>
        </div>

        {math.analogy && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 shadow-inner">
            <h4 className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-amber-400">Intuitive Analogy</h4>
            <p className="text-base leading-relaxed text-slate-200">
              {math.analogy}
            </p>
          </div>
        )}

        {math.why && (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5">
            <h4 className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-rose-400">Why it matters</h4>
            <p className="text-base leading-relaxed text-slate-200">
              {math.why}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
