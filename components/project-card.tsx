"use client";

import Link from "next/link";
import { ArrowUpRight, Star, GitFork, Box, Beaker } from "lucide-react";
import { useRef, useState } from "react";
import type { Project } from "@/lib/content";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";
import { cn } from "@/lib/utils";

const KindIcon = ({ kind }: { kind: Project["kind"] }) => {
  switch (kind) {
    case "product":
      return <Box className="h-3 w-3" />;
    case "oss":
      return <GitFork className="h-3 w-3" />;
    case "research":
      return <Beaker className="h-3 w-3" />;
  }
};

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

    requestAnimationFrame(() => {
      div.style.setProperty("--mouse-x", `${x}px`);
      div.style.setProperty("--mouse-y", `${y}px`);
    });
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  // Extract star count from badge (handles formats like "123 stars", "1,001 stars", "2.8K stars", "10K+ stars")
  const starMatch = project.badge?.match(/^([\d,]+\.?\d*[KkMm]?\+?)\s+stars?$/);
  const starCount = starMatch ? starMatch[1] : null;
  const displayBadge = starCount ? null : project.badge;

  // Determine base colors based on kind or custom gradient
  const isProduct = project.kind === "product";
  const isResearch = project.kind === "research";

  let accentColor = "text-emerald-400";
  let spotlightColor = "52, 211, 153"; // Emerald
  let hoverBorder = "group-hover:border-emerald-500/30";

  if (project.gradient) {
     // If a custom gradient is provided, we use a neutral white/slate base and let the gradient do the work
     accentColor = "text-white";
     spotlightColor = "255, 255, 255";
     hoverBorder = "group-hover:border-white/30";
  } else if (isProduct) {
    accentColor = "text-sky-400";
    spotlightColor = "56, 189, 248"; // Sky
    hoverBorder = "group-hover:border-sky-500/30";
  } else if (isResearch) {
    accentColor = "text-purple-400";
    spotlightColor = "192, 132, 252"; // Purple
    hoverBorder = "group-hover:border-purple-500/30";
  }

  const isLarge = project.size === "large";

  // Determine if this is an internal link (has detail page) or external link
  const isInternalLink = Boolean(project.slug);
  const linkHref = isInternalLink ? `/projects/${project.slug}` : project.href;

  return (
    <Link
      href={linkHref}
      {...(isInternalLink ? {} : { target: "_blank", rel: "noopener noreferrer" })}
      className="block h-full"
      onTouchStart={lightTap}
    >
      <article
        ref={divRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/5 bg-black/20 p-6 md:p-8",
          "transition-all duration-300 ease-out",
          "hover:bg-black/40 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/50",
          "focus-within:scale-[1.02] focus-within:shadow-2xl focus-within:shadow-black/50",
          "will-change-transform",
          hoverBorder
        )}
      >
        {/* Custom Gradient Background */}
        {project.gradient && (
           <div className={cn("absolute inset-0 opacity-[0.08] transition-opacity duration-500 group-hover:opacity-[0.15] bg-gradient-to-br", project.gradient)} />
        )}

        {/* Dynamic Spotlight Effect */}
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-500"
          style={{
            opacity,
            background: `radial-gradient(600px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(${spotlightColor}, 0.12), transparent 40%)`,
          }}
        />
        
        {/* Subtle gradient stroke on top border */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />

        <div className="relative z-10 flex flex-1 flex-col">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-widest">
                <span className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10",
                  accentColor
                )}>
                  <KindIcon kind={project.kind} />
                </span>
                <span className="text-slate-500">
                  {project.kind}
                </span>
              </div>
              <h3 className={cn(
                "font-bold leading-tight text-white transition-colors group-hover:text-white",
                isLarge ? "mt-4 text-3xl md:text-4xl" : "mt-4 text-xl md:text-2xl"
              )}>
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

          <p className={cn(
            "font-medium leading-relaxed text-slate-200",
            isLarge ? "mt-6 text-xl" : "mt-4 text-base"
          )}>
            {project.short}
          </p>

          {/* Only show full description on large cards or if there's space (visual logic) */}
          <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400 line-clamp-4">
            {project.description}
          </p>

          <div className="mt-8 flex items-center justify-between gap-4 border-t border-white/5 pt-6">
            <div className="flex flex-wrap gap-2">
              {project.tags.slice(0, isLarge ? 5 : 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md bg-white/5 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-400 transition-colors group-hover:bg-white/10 group-hover:text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className={cn("flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors group-hover:text-white", accentColor)}>
              {isInternalLink ? "Details" : "View"}
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}