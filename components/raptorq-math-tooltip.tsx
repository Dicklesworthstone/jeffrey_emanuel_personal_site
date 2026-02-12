"use client";

import { type ReactNode } from "react";
import { Sigma, HelpCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { getJargon, type JargonTerm } from "@/lib/raptorq-jargon";
import { TooltipShell } from "./tooltip-shell";

interface RaptorQMathTooltipProps {
  /** The math key to look up in the dictionary */
  mathKey: string;
  /** The rendered math component */
  children: ReactNode;
  /** Optional: additional class names */
  className?: string;
}

/**
 * Math tooltip component for the RaptorQ article.
 * Wraps math expressions with an intuitive explanation on hover/tap.
 */
export function RaptorQMathTooltip({ mathKey, children, className }: RaptorQMathTooltipProps) {
  const mathData = getJargon(mathKey);

  if (!mathData) {
    return <>{children}</>;
  }

  return (
    <TooltipShell
      title={mathData.term}
      ariaLabel={`Explain math: ${mathData.term}`}
      className={cn(
        "relative inline-block cursor-help transition-all duration-200 group/math",
        "hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-lg px-1",
        className
      )}
      tooltipContent={<MathTooltipContent math={mathData} />}
      sheetContent={<MathSheetContent math={mathData} />}
    >
      <div className="relative">
        {children}
        <div className="absolute -right-1 -top-1 opacity-0 group-hover/math:opacity-100 transition-opacity">
          <div className="flex h-3 w-3 items-center justify-center rounded-full bg-purple-500 shadow-lg">
            <Sigma className="h-2 w-2 text-white" />
          </div>
        </div>
      </div>
    </TooltipShell>
  );
}

function MathTooltipContent({ math }: { math: JargonTerm }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-400/20 text-purple-400">
          <Sigma className="h-3.5 w-3.5" />
        </div>
        <span className="font-bold text-white tracking-tight uppercase text-[10px]">{math.term}</span>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-200 leading-snug italic">
          {math.short}
        </p>
      </div>
      {math.analogy && (
        <div className="rounded-lg bg-purple-400/5 border border-purple-500/10 px-3 py-2 text-[10px] text-slate-400 leading-relaxed">
          <span className="font-bold text-purple-400 uppercase text-[8px] tracking-widest block mb-1">The Intuition:</span>
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
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400/20 to-pink-500/20 shadow-xl border border-purple-500/20">
          <Sigma className="h-7 w-7 text-purple-400" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-white tracking-tight uppercase">{math.term}</h3>
          <p className="text-xs font-black text-purple-400 uppercase tracking-[0.2em] mt-1">Mathematical Context</p>
        </div>
      </div>
      
      <div className="space-y-5">
        <div className="p-6 rounded-2xl border border-purple-500/20 bg-purple-500/5 shadow-inner">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Core Concept</h4>
          <p className="text-lg leading-relaxed text-slate-200 font-serif italic">{math.long}</p>
        </div>

        {math.analogy && (
          <div className="rounded-2xl border border-white/5 bg-white/5 p-5">
            <h4 className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Intuitive Analogy</h4>
            <p className="text-base leading-relaxed text-slate-300 italic font-serif">
              {math.analogy}
            </p>
          </div>
        )}

        {math.why && (
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
            <h4 className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-400">Why it matters</h4>
            <p className="text-base leading-relaxed text-slate-200">
              {math.why}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
