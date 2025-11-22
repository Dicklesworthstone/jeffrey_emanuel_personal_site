"use client";

import Link from "next/link";
import { ArrowUpRight, Star, Github } from "lucide-react";
import { useRef, useState } from "react";
import type { Project } from "@/lib/content";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";
import { cn } from "@/lib/utils";

export default function ProjectCard({ project }: { project: Project }) {
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

  // Extract star count from badge
  const starMatch = project.badge?.match(/^([\d.]+[KkMm]?)\s+stars?$/);
  const starCount = starMatch ? starMatch[1] : null;
  const displayBadge = starCount ? null : project.badge;
  const isGitHub = project.href.includes("github.com/");

  return (
    <Link 
      href={project.href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="block h-full" 
      onTouchStart={lightTap}
    >
      <article
        ref={divRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "glass-card group relative flex h-full flex-col overflow-hidden rounded-3xl p-6 md:p-8"
        )}
      >
        {/* Dynamic Spotlight Effect */}
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-500"
          style={{
            opacity,
            background: `radial-gradient(600px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(56, 189, 248, 0.12), transparent 40%)`,
          }}
        />
        
        {/* Subtle gradient stroke on top border for "light hitting top" feel */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />

        <div className="relative z-10 flex flex-1 flex-col">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-widest">
                <span className={cn(
                  "inline-block h-2 w-2 rounded-full shadow-[0_0_8px_currentColor]",
                  project.kind === "product" ? "bg-sky-400 text-sky-400" : "bg-emerald-400 text-emerald-400"
                )} />
                <span className="text-slate-500">
                  {project.kind === "product" ? "Product" : "Open Source"}
                </span>
              </div>
              <h3 className="mt-4 text-2xl font-bold leading-tight text-white transition-colors group-hover:text-sky-200">
                {project.name}
              </h3>
            </div>
            <div className="flex flex-col items-end gap-2">
              {starCount && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-200 ring-1 ring-inset ring-amber-500/20 transition-colors group-hover:bg-amber-500/20">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {starCount}
                </span>
              )}
              {displayBadge && (
                <span className="inline-flex items-center rounded-full bg-slate-800/50 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-slate-300 ring-1 ring-inset ring-slate-700/50">
                  {displayBadge}
                </span>
              )}
            </div>
          </div>

          <p className="mt-4 text-lg font-medium leading-relaxed text-slate-200">
            {project.short}
          </p>

          <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">
            {project.description}
          </p>

          <div className="mt-8 flex items-center justify-between gap-4 border-t border-white/5 pt-6">
            <div className="flex flex-wrap gap-2">
              {project.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md bg-white/5 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-400 transition-colors group-hover:bg-white/10 group-hover:text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-400 transition-colors group-hover:text-sky-300">
              View
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
