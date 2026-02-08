"use client";

import Link from "next/link";
import { ArrowUpRight, Star, GitFork, Box, Beaker, Repeat } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
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
    case "rust-port":
      return <Repeat className="h-3 w-3" />;
  }
};

export default function ProjectCard({ project }: { project: Project }) {
  const { lightTap } = useHapticFeedback();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 20 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [7, -7]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-7, 7]), springConfig);

  const spotlightOpacity = useSpring(0, { stiffness: 300, damping: 30 });

  // Detect touch device to disable spotlight effect (better mobile performance)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional one-time browser feature detection
    setIsTouchDevice(window.matchMedia("(hover: none)").matches);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isTouchDevice) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    
    const xPct = mouseXPos / width - 0.5;
    const yPct = mouseYPos / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
    
    mouseX.set(mouseXPos);
    mouseY.set(mouseYPos);
  };

  const handleMouseEnter = () => {
    if (!isTouchDevice) {
      spotlightOpacity.set(1);
    }
  };

  const handleMouseLeave = () => {
    spotlightOpacity.set(0);
    x.set(0);
    y.set(0);
  };

  // Extract star count from badge (handles formats like "123 stars", "1,001 stars", "2.8K stars", "10K+ stars")
  const starMatch = project.badge?.match(/^([\d,]+\.?\d*[KkMm]?\+?)\s+stars?$/);
  const starCount = starMatch ? starMatch[1] : null;
  const displayBadge = starCount ? null : project.badge;

  // Determine base colors based on kind or custom gradient
  const isProduct = project.kind === "product";
  const isResearch = project.kind === "research";
  const isRustPort = project.kind === "rust-port";

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
  } else if (isRustPort) {
    accentColor = "text-orange-400";
    spotlightColor = "251, 146, 60"; // Orange
    hoverBorder = "group-hover:border-orange-500/30";
  }

  const isLarge = project.size === "large";

  // Determine if this is an internal link (has detail page) or external link
  const isInternalLink = Boolean(project.slug);
  const linkHref = isInternalLink ? `/projects/${project.slug}` : project.href;

  return (
    <Link
      href={linkHref}
      {...(isInternalLink ? {} : { target: "_blank", rel: "noopener noreferrer" })}
      className="block h-full perspective-1000"
      onTouchStart={lightTap}
    >
      <motion.article
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: isTouchDevice ? 0 : rotateX,
          rotateY: isTouchDevice ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-white/5 bg-slate-900/40 p-4 sm:p-6 md:p-8 backdrop-blur-sm",
          "transition-colors duration-300 ease-out",
          "hover:bg-slate-900/60 hover:border-white/10",
          "active:scale-[0.98] active:brightness-110",
          "focus-within:border-white/20",
          "will-change-transform",
          hoverBorder
        )}
      >
        {/* Custom Gradient Background */}
        {project.gradient && (
           <div className={cn("absolute inset-0 opacity-[0.08] transition-opacity duration-500 group-hover:opacity-[0.2] bg-gradient-to-br", project.gradient)} aria-hidden="true" />
        )}

        {/* Dynamic Spotlight Effect */}
        <motion.div
          className="pointer-events-none absolute -inset-px transition-opacity duration-500"
          style={{
            opacity: spotlightOpacity,
            background: useTransform(
              [mouseX, mouseY],
              ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(${spotlightColor}, 0.15), transparent 40%)`
            ),
          }}
          aria-hidden="true"
        />

        {/* Subtle glass reflection effect on top border */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" aria-hidden="true" />

        <div className="relative z-10 flex flex-1 flex-col">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest">
                <span className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10",
                  accentColor
                )}>
                  <KindIcon kind={project.kind} />
                </span>
                <span className="text-slate-500">
                  {project.kind.replace("-", " ")}
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
                <span className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-100 shadow-lg shadow-amber-500/10 ring-1 ring-inset ring-amber-400/30 transition-all duration-300 group-hover:ring-amber-400/50 group-hover:shadow-amber-500/20">
                  {/* Shimmer effect - slower for smoother feel */}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-[1500ms] ease-in-out motion-reduce:transition-none motion-safe:group-hover:translate-x-full" aria-hidden="true" />
                  <Star className="relative h-3.5 w-3.5 fill-amber-400 text-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.5)]" />
                  <span className="relative font-mono tracking-tight">{starCount}</span>
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
                  className="inline-flex items-center rounded-md bg-white/5 px-2 py-1 text-xs font-medium uppercase tracking-wider text-slate-400 transition-colors group-hover:bg-white/10 group-hover:text-slate-300"
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
      </motion.article>
    </Link>
  );
}