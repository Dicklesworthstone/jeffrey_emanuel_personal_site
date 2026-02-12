"use client";

import { type ReactNode } from "react";
import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { getJargon, type JargonTerm } from "@/lib/cmaes-jargon";
import { TooltipShell } from "./raptorq-tooltip-shell";

interface CMAESJargonProps {
  /** The term key to look up in the dictionary */
  term: string;
  /** Optional: override the display text */
  children?: ReactNode;
  /** Optional: additional class names */
  className?: string;
}

/**
 * Jargon component for the CMA-ES article.
 * Desktop: tooltip on hover. Mobile: bottom sheet on tap.
 * Styled with amber/orange accent to match the CMA-ES visual identity (evolution/fire).
 */
export function CMAESJargon({ term, children, className }: CMAESJargonProps) {
  const termKey = term.toLowerCase().replace(/[\s_]+/g, "-");
  const jargonData = getJargon(termKey);

  if (!jargonData) {
    return <>{children || term}</>;
  }

  const displayText = children || jargonData.term;

  return (
    <TooltipShell
      title={jargonData.term}
      ariaLabel={`Learn about ${jargonData.term}`}
      className={cn(
        "relative inline cursor-help text-left font-medium",
        "decoration-[1.5px] underline underline-offset-[3px]",
        "decoration-amber-400/30 decoration-dotted",
        "transition-colors duration-150",
        "hover:decoration-amber-400/60 hover:text-amber-300",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020204] rounded-sm",
        className
      )}
      tooltipContent={<TooltipContent term={jargonData} />}
      sheetContent={<SheetContent term={jargonData} />}
    >
      {displayText}
    </TooltipShell>
  );
}

function TooltipContent({ term }: { term: JargonTerm }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-400/20 text-amber-400">
          <Lightbulb className="h-3.5 w-3.5" />
        </div>
        <span className="font-semibold text-white">{term.term}</span>
      </div>
      <p className="text-sm leading-relaxed text-slate-400">{term.short}</p>
      {term.analogy && (
        <div className="rounded-lg bg-amber-400/5 px-3 py-2 text-xs text-slate-400">
          <span className="font-medium text-amber-400">Think of it like:</span>{" "}
          {term.analogy}
        </div>
      )}
      {term.related && term.related.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {term.related.map((r) => (
            <span
              key={r}
              className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-500"
            >
              {r}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SheetContent({ term }: { term: JargonTerm }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 shadow-lg">
          <Lightbulb className="h-6 w-6 text-amber-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{term.term}</h3>
          <p className="text-sm text-slate-400 line-clamp-2">{term.short}</p>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            What is it?
          </h4>
          <p className="text-sm leading-relaxed text-slate-200">{term.long}</p>
        </div>
        {term.why && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-amber-400">
              Why it matters
            </p>
            <p className="text-sm leading-relaxed text-slate-200">
              {term.why}
            </p>
          </div>
        )}
        {term.analogy && (
          <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-orange-400">
              Think of it like...
            </p>
            <p className="text-sm leading-relaxed text-slate-200">
              {term.analogy}
            </p>
          </div>
        )}
        {term.related && term.related.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              Related Terms
            </h4>
            <div className="flex flex-wrap gap-2">
              {term.related.map((r) => (
                <span
                  key={r}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-400"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
