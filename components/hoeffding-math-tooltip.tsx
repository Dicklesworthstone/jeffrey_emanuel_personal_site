"use client";

import { type ReactNode } from "react";
import { Sigma, HelpCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { getHoeffdingMath, type MathTerm } from "@/lib/hoeffding-math";
import { TooltipShell } from "./tooltip-shell";

interface HoeffdingMathTooltipProps {
  /** The math key to look up in the dictionary */
  mathKey: string;
  /** The rendered math component */
  children: ReactNode;
  /** Optional: additional class names */
  className?: string;
  /** Optional: override default color */
  color?: string;
  /** Optional: simplified version for inline text */
  simple?: boolean;
}

export function HoeffdingMathTooltip({ mathKey, children, className, color, simple = false }: HoeffdingMathTooltipProps) {
  const mathData = getHoeffdingMath(mathKey);

  if (!mathData) {
    return <>{children}</>;
  }

  const activeColor = color || mathData.color || "#a855f7";

  return (
    <TooltipShell
      title={mathData.term}
      ariaLabel={`Explain: ${mathData.term}`}
      variant="purple"
      className={cn(
        "relative inline-block cursor-help transition-all duration-300 group/math",
        "hover:scale-[1.05] focus:outline-none rounded-lg p-0.5",
        className
      )}
      tooltipContent={<MathTooltipContent math={mathData} activeColor={activeColor} />}
      sheetContent={<MathSheetContent math={mathData} activeColor={activeColor} />}
    >
      <span className="relative inline-flex items-center gap-1.5 px-1">
        <span 
          className="transition-all duration-300 font-bold"
          style={{ 
            color: activeColor,
            textShadow: `0 0 25px ${activeColor}60`
          }}
        >
          {children}
        </span>
        {!simple && (
          <Sigma 
            className="w-3.5 h-3.5 opacity-30 group-hover/math:opacity-100 transition-opacity transform group-hover/math:rotate-12"
            style={{ color: activeColor }}
          />
        )}
        {/* Animated underline */}
        <span 
          className="absolute -bottom-1 left-0 h-0.5 w-full scale-x-0 group-hover/math:scale-x-100 transition-transform duration-500 origin-left"
          style={{ backgroundColor: activeColor }}
        />
      </span>
    </TooltipShell>
  );
}

function MathTooltipContent({ math, activeColor }: { math: MathTerm; activeColor: string }) {
  return (
    <div className="space-y-4 max-w-[280px]">
      <div className="flex items-center gap-3 border-b border-white/10 pb-3">
        <div 
          className="flex h-8 w-8 items-center justify-center rounded-xl shadow-lg shadow-black/40 border border-white/5"
          style={{ backgroundColor: `${activeColor}20`, color: activeColor }}
        >
          <Sigma className="h-4 w-4" />
        </div>
        <div>
          <span className="font-black text-white text-xs uppercase tracking-widest block">{math.term}</span>
          <span className="text-[10px] text-slate-500 font-mono italic">{math.short}</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-300 leading-relaxed">
          {math.long}
        </p>
        {math.analogy && (
          <div 
            className="rounded-xl border bg-opacity-5 p-3 text-[11px] text-slate-400 leading-relaxed italic"
            style={{ borderColor: `${activeColor}20`, backgroundColor: `${activeColor}05` }}
          >
            <span 
              className="font-black uppercase text-[9px] tracking-widest block mb-1 not-italic"
              style={{ color: activeColor }}
            >
              Intuition
            </span>
            {math.analogy}
          </div>
        )}
      </div>
    </div>
  );
}

function MathSheetContent({ math, activeColor }: { math: MathTerm; activeColor: string }) {
  return (
    <div className="space-y-8 p-2">
      <div className="flex items-center gap-6">
        <div 
          className="flex h-20 w-20 items-center justify-center rounded-[2rem] shadow-2xl border border-white/5"
          style={{ 
            background: `linear-gradient(135deg, ${activeColor}40, #00000000)`,
            color: activeColor
          }}
        >
          <Sigma className="h-10 w-10" />
        </div>
        <div>
          <h3 className="text-3xl font-black text-white tracking-tighter mb-1 uppercase italic">{math.term}</h3>
          <p className="text-base font-bold uppercase tracking-[0.2em]" style={{ color: activeColor }}>{math.short}</p>
        </div>
      </div>
      
      <div className="space-y-8">
        <div className="space-y-3">
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Statistical Context</h4>
          <p className="text-lg leading-relaxed text-slate-200 font-light">{math.long}</p>
        </div>

        {math.analogy && (
          <div 
            className="rounded-[2rem] border bg-opacity-5 p-8 shadow-inner"
            style={{ borderColor: `${activeColor}20`, backgroundColor: `${activeColor}05` }}
          >
            <h4 className="mb-4 text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: activeColor }}>Intuitive Analogy</h4>
            <p className="text-lg leading-relaxed text-slate-300 italic font-serif">
              &ldquo;{math.analogy}&rdquo;
            </p>
          </div>
        )}

        {math.why && (
          <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-8">
            <h4 className="mb-4 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Why it matters</h4>
            <p className="text-lg leading-relaxed text-slate-200">
              {math.why}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
