"use client";

import { type ReactNode } from "react";
import { Sigma, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { getJargon, type JargonTerm } from "@/lib/bakery-jargon";
import { TooltipShell } from "./tooltip-shell";

interface BakeryMathTooltipProps {
  /** The math key to look up in the dictionary */
  mathKey: string;
  /** The rendered math component */
  children: ReactNode;
  /** Optional: additional class names */
  className?: string;
  /** Optional: Use amber theme (default) or cyan theme */
  theme?: "amber" | "cyan";
}

/**
 * Math tooltip component for the Bakery Algorithm article.
 * Wraps logic snippets with an intuitive explanation on hover/tap.
 */
export function BakeryMathTooltip({ mathKey, children, className, theme = "amber" }: BakeryMathTooltipProps) {
  const mathData = getJargon(mathKey);

  if (!mathData) {
    return <>{children}</>;
  }

  const themeColors = {
    amber: "bg-amber-500 ring-amber-400 text-amber-400 bg-amber-400/20 border-amber-500/10",
    cyan: "bg-cyan-500 ring-cyan-400 text-cyan-400 bg-cyan-400/20 border-cyan-500/10"
  };

  return (
    <TooltipShell
      title={mathData.term}
      ariaLabel={`Explain: ${mathData.term}`}
      variant={theme === "amber" ? "amber" : "cyan"}
      className={cn(
        "hover:bg-white/5",
        className
      )}
      tooltipContent={<MathTooltipContent math={mathData} theme={theme} />}
      sheetContent={<MathSheetContent math={mathData} theme={theme} />}
    >
      <span className="relative inline-block">
        {children}
        <span className="absolute -right-2 -top-2 opacity-0 group-hover/math:opacity-100 transition-opacity">
          <span className={cn(
            "flex h-4 w-4 items-center justify-center rounded-full shadow-lg",
            theme === "amber" ? "bg-amber-500" : "bg-cyan-500"
          )}>
            <Info className="h-2.5 w-2.5 text-black" />
          </span>
        </span>
      </span>
    </TooltipShell>
  );
}

function MathTooltipContent({ math, theme }: { math: JargonTerm, theme: "amber" | "cyan" }) {
  const accentColor = theme === "amber" ? "text-amber-400" : "text-cyan-400";
  const bgColor = theme === "amber" ? "bg-amber-400/20" : "bg-cyan-400/20";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <div className={cn("flex h-6 w-6 items-center justify-center rounded-lg", bgColor, accentColor)}>
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
        <div className={cn("rounded-lg border px-3 py-2 text-[11px] text-slate-300 leading-relaxed", theme === "amber" ? "bg-amber-400/5 border-amber-500/10" : "bg-cyan-400/5 border-cyan-500/10")}>
          <span className={cn("font-bold uppercase text-[9px] tracking-widest block mb-1", accentColor)}>The Intuition:</span>
          {math.analogy}
        </div>
      )}
    </div>
  );
}

function MathSheetContent({ math, theme }: { math: JargonTerm, theme: "amber" | "cyan" }) {
  const accentColor = theme === "amber" ? "text-amber-400" : "text-cyan-400";
  const gradient = theme === "amber" ? "from-amber-400/20 to-orange-500/20" : "from-cyan-400/20 to-blue-500/20";
  const borderColor = theme === "amber" ? "border-amber-500/20" : "border-cyan-500/20";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-xl border", gradient, borderColor)}>
          <Sigma className={cn("h-7 w-7", accentColor)} />
        </div>
        <div>
          <h3 className="text-2xl font-black text-white tracking-tight">{math.term}</h3>
          <p className={cn("text-sm font-medium uppercase tracking-widest", accentColor)}>{math.short}</p>
        </div>
      </div>
      
      <div className="space-y-5">
        <div className="space-y-2">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">The Explanation</h4>
          <p className="text-base leading-relaxed text-slate-200">{math.long}</p>
        </div>

        {math.analogy && (
          <div className={cn("rounded-2xl border bg-opacity-5 p-5 shadow-inner", borderColor, theme === "amber" ? "bg-amber-500" : "bg-cyan-500")}>
            <h4 className={cn("mb-2 text-xs font-black uppercase tracking-[0.2em]", accentColor)}>Intuitive Analogy</h4>
            <p className="text-base leading-relaxed text-slate-200">
              {math.analogy}
            </p>
          </div>
        )}

        {math.why && (
          <div className={cn("rounded-2xl border bg-opacity-5 p-5", theme === "cyan" ? "border-amber-500/20 bg-amber-500" : "border-cyan-500/20 bg-cyan-500")}>
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
