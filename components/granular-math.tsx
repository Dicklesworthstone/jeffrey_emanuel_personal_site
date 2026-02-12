"use client";

import "katex/dist/katex.min.css";
import katex from "katex";
import { CMAESMathTooltip } from "./cmaes-math-tooltip";
import { cn } from "@/lib/utils";

interface MathPart {
  tex: string;
  key: string;
  color: "amber" | "orange" | "red" | "emerald" | "blue" | "purple" | "slate" | "white";
}

interface GranularMathProps {
  parts: MathPart[];
  block?: boolean;
  className?: string;
}

const COLOR_MAP = {
  amber: "#f59e0b",
  orange: "#f97316",
  red: "#ef4444",
  emerald: "#10b981",
  blue: "#3b82f6",
  purple: "#a855f7",
  slate: "#64748b",
  white: "#f8fafc"
};

const TEXT_COLOR_MAP = {
  amber: "text-amber-400",
  orange: "text-orange-400",
  red: "text-red-400",
  emerald: "text-emerald-400",
  blue: "text-blue-400",
  purple: "text-purple-400",
  slate: "text-slate-400",
  white: "text-white"
};

/**
 * GranularMath component for "BetterExplained" style math.
 * Breaks an equation into color-coded interactive parts.
 */
export function GranularMath({ parts, block = false, className }: GranularMathProps) {
  return (
    <div className={cn(
      "granular-math-container font-serif",
      block ? "my-10 flex justify-center flex-wrap gap-y-4" : "inline-flex items-center flex-wrap",
      className
    )}>
      {parts.map((part, i) => {
        const html = katex.renderToString(part.tex, {
          throwOnError: false,
          displayMode: false,
        });

        return (
          <CMAESMathTooltip key={`${part.key}-${i}`} mathKey={part.key}>
            <span 
              className={cn(
                "inline-block transition-all duration-200 hover:scale-110 px-0.5",
                TEXT_COLOR_MAP[part.color]
              )}
              dangerouslySetInnerHTML={{ __html: html }}
              style={{ color: COLOR_MAP[part.color] }}
            />
          </CMAESMathTooltip>
        );
      })}
    </div>
  );
}
