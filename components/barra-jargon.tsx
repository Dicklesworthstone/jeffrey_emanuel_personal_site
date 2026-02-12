"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle } from "lucide-react";

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
  }
};

export function BarraJargon({ term, children }: { term: string; children?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const info = JARGON[term.toLowerCase()];

  if (!info) return <>{children || term}</>;

  return (
    <span className="relative inline-block group">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="underline decoration-emerald-500/30 decoration-2 underline-offset-4 cursor-help hover:text-emerald-400 transition-colors"
      >
        {children || term}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 bg-slate-900 border border-emerald-500/20 rounded-2xl shadow-2xl z-50 pointer-events-none backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 mb-2 text-emerald-400">
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">{info.title}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-serif italic">
              {info.def}
            </p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
