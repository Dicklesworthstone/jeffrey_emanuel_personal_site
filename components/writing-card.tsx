"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useRef, useState } from "react";
import type { WritingItem } from "@/lib/content";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";
import { cn } from "@/lib/utils";

export default function WritingCard({ item }: { item: WritingItem }) {
  const { lightTap } = useHapticFeedback();
  const divRef = useRef<HTMLDivElement>(null);
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const div = divRef.current;
    const rect = div.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    div.style.setProperty("--mouse-x", `${x}px`);
    div.style.setProperty("--mouse-y", `${y}px`);
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  const isFeatured = item.featured;
  
  // Use gradient if provided, otherwise fallback to default logic
  const gradientClass = item.gradient 
    ? `bg-gradient-to-br ${item.gradient}` 
    : "bg-white/[0.02]";

  const borderClass = item.featured
    ? "border-white/10 group-hover:border-white/20"
    : "border-white/5 group-hover:border-white/10";

  return (
    <Link 
      href={item.href} 
      className={cn(
        "block h-full", 
        isFeatured ? "md:col-span-2" : "col-span-1"
      )}
      onTouchStart={lightTap}
    >
      <article
        ref={divRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-3xl border p-6 md:p-8",
          "transition-all duration-300 ease-out",
          "hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/50",
          "focus-within:scale-[1.02] focus-within:shadow-2xl focus-within:shadow-black/50",
          "will-change-transform",
          borderClass,
          item.featured ? "bg-black/40 hover:bg-black/50" : "bg-black/20 hover:bg-black/30"
        )}
      >
        {/* Featured Gradient Background */}
        {isFeatured && item.gradient && (
          <div className={cn("absolute inset-0 opacity-[0.15] transition-opacity duration-500 group-hover:opacity-[0.25]", gradientClass)} />
        )}

        {/* Dynamic Spotlight Effect */}
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-500"
          style={{
            opacity,
            background: `radial-gradient(600px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(255, 255, 255, 0.06), transparent 40%)`,
          }}
        />
        
        {/* Subtle gradient stroke on top border */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />

        <div className="relative z-10 flex flex-1 flex-col">
          <div className="mb-4 flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">
            <span className={cn(
              "inline-block px-2 py-0.5 rounded-full bg-white/5",
              isFeatured ? "text-white ring-1 ring-white/10" : "text-slate-400"
            )}>
              {item.source}
            </span>
            <span>•</span>
            <span className={isFeatured ? "text-slate-300" : ""}>
              {item.category}
            </span>
          </div>

          <h3 className={cn(
            "font-bold leading-tight text-white transition-colors group-hover:text-sky-100",
            isFeatured ? "text-2xl md:text-4xl mb-4" : "text-lg md:text-xl mb-3"
          )}>
            {item.title}
          </h3>

          <p className={cn(
            "leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors",
            isFeatured ? "text-lg md:text-xl max-w-3xl" : "text-sm flex-1"
          )}>
            {item.blurb}
          </p>

          <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400 opacity-80 transition-all group-hover:translate-x-1 group-hover:text-sky-300 group-hover:opacity-100">
            Read Article
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </article>
    </Link>
  );
}
