"use client";

import { Info, HelpCircle } from "lucide-react";
import { TooltipShell } from "./tooltip-shell";
import { cn } from "@/lib/utils";

const JARGON: Record<string, { title: string; def: string }> = {
  "alpha": {
    title: "Alpha (\u03b1)",
    def: "The excess return of an investment relative to the return of a benchmark index. It is often used as a measure of a manager's skill."
  },
  "beta": {
    title: "Beta (\u03b2)",
    def: "A measure of a stock's volatility in relation to the overall market. A beta of 1.0 indicates that the stock moves with the market."
  },
  "factor-exposure": {
    title: "Factor Exposure",
    def: "The degree to which a portfolio's returns are driven by a specific systematic risk factor like Momentum or Value."
  },
  "idiosyncratic-risk": {
    title: "Idiosyncratic Risk",
    def: "Risk that is specific to an individual asset, such as a company-specific news event, which can be diversified away."
  },
  "pod-shop": {
    title: "Pod Shop",
    def: "A multi-manager hedge fund platform (like Millennium or Citadel) where capital is allocated to independent teams ('pods') with strict risk limits."
  },
  "z-score": {
    title: "Z-Score",
    def: "A statistical measurement that describes a value's relationship to the mean of a group of values, measured in terms of standard deviations."
  },
  "information-ratio": {
    title: "Information Ratio (IR)",
    def: "A measure of portfolio returns above the returns of a benchmark, to the volatility of those returns. Higher is better."
  },
  "leverage": {
    title: "Leverage",
    def: "The use of borrowed capital to increase the potential return of an investment. It also amplifies losses."
  },
  "wls": {
    title: "Weighted Least Squares",
    def: "A regression technique used when some observations are more reliable than others. In Barra, weights are often proportional to square root of market cap."
  },
  "orthogonalization": {
    title: "Orthogonalization",
    def: "A mathematical process that ensures factors are independent of each other, preventing 'double counting' of risks."
  },
  "momentum": {
    title: "Momentum",
    def: "The empirical tendency for stocks that have performed well in the recent past to continue performing well in the near future."
  },
  "value": {
    title: "Value",
    def: "An investment strategy that involves picking stocks that appear to be trading for less than their intrinsic or book value."
  },
  "growth": {
    title: "Growth",
    def: "A strategy focused on companies that are expected to grow at an above-average rate compared to other companies."
  },
  "size": {
    title: "Size Factor",
    def: "The observation that smaller companies tend to behave differently than mega-caps, often captured via the log of market capitalization."
  },
  "volatility": {
    title: "Volatility",
    def: "The degree of variation of a trading price series over time as measured by the standard deviation of returns."
  },
  "vol": {
    title: "Volatility",
    def: "The degree of variation of a trading price series over time as measured by the standard deviation of returns."
  }
};

export function BarraJargon({ term, children }: { term: string; children?: React.ReactNode }) {
  const info = JARGON[term.toLowerCase()];

  if (!info) return <>{children || term}</>;

  return (
    <TooltipShell
      title={info.title}
      ariaLabel={`Explain term: ${info.title}`}
      variant="emerald"
      portalClassName="barra-scope"
      className={cn(
        "relative inline-block cursor-help transition-all duration-200 group/jargon",
        "underline decoration-emerald-500/30 decoration-2 underline-offset-4 rounded-md hover:text-emerald-400"
      )}
      tooltipContent={<JargonTooltipContent info={info} />}
      sheetContent={<JargonSheetContent info={info} />}
    >
      {children || term}
    </TooltipShell>
  );
}

function JargonTooltipContent({ info }: { info: any }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-400/20 text-emerald-400">
          <HelpCircle className="h-3.5 w-3.5" />
        </div>
        <span className="font-bold text-white tracking-tight uppercase text-[10px]">{info.title}</span>
      </div>
      <p className="text-xs leading-relaxed text-slate-300 font-serif italic">
        {info.def}
      </p>
    </div>
  );
}

function JargonSheetContent({ info }: { info: any }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/20 to-cyan-500/20 shadow-xl border border-emerald-500/20">
          <Info className="h-7 w-7 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-white tracking-tight uppercase">{info.title}</h3>
          <p className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em] mt-1">Financial Glossary</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 shadow-inner">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Definition</h4>
          <p className="text-lg leading-relaxed text-slate-200 font-serif italic">{info.def}</p>
        </div>
      </div>
    </div>
  );
}
