"use client";

import Link from "next/link";
import { ArrowUpRight, Star, Github } from "lucide-react";
import { useRef, useState } from "react";
import type { Project } from "@/lib/content";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";

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

  // Extract star count from badge if it contains "stars" (e.g., "2.8K stars", "100 stars")
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
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/40 p-6 shadow-lg shadow-slate-950/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/50 md:p-8"
      >
        {/* Spotlight Effect - Optimized with CSS variables */}
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300"
          style={{
            opacity,
            background: `radial-gradient(600px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(56, 189, 248, 0.08), transparent 40%)`,
          }}
        />
        
        {/* Subtle Border Highlight on Hover */}
        <div 
           className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-1 ring-inset ring-sky-500/20 transition duration-300 group-hover:opacity-100" 
        />

        <div className="relative z-10 flex flex-1 flex-col">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <span className={project.kind === "product" ? "text-sky-400/90" : "text-emerald-400/90"}>
                  {project.kind === "product" ? "Product" : "Open Source"}
                </span>
                {isGitHub && (
                  <>
                    <span className="text-slate-700">•</span>
                    <Github className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                  </>
                )}
              </div>
              <h3 className="mt-3 text-lg font-bold leading-snug text-slate-100 transition-colors group-hover:text-sky-100 md:text-xl">
                {project.name}
              </h3>
            </div>
            <div className="flex flex-col items-end gap-2">
              {starCount && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[0.65rem] font-bold text-amber-200 ring-1 ring-inset ring-amber-500/20 transition-colors group-hover:bg-amber-500/20">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
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

          <p className="mt-4 font-medium leading-relaxed text-slate-300 md:text-lg">
            {project.short}
          </p>

          <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400/90 md:text-base">
            {project.description}
          </p>

          <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-800/50 pt-6">
            <div className="flex flex-wrap gap-2">
              {project.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md bg-slate-800/40 px-2 py-1 text-xs font-medium text-slate-400 ring-1 ring-inset ring-slate-700/40 transition-colors group-hover:bg-slate-800/60 group-hover:text-slate-300"
                >
                  {tag}
                </span>
              ))}
              {project.tags.length > 3 && (
                <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition-colors group-hover:text-slate-400">
                  +{project.tags.length - 3}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-sky-400 transition-colors group-hover:text-sky-300">
              View
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
