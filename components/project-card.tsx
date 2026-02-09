"use client";

import Link from "next/link";
import { ArrowUpRight, Star, GitFork, Box, Beaker, Repeat } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import type { Project } from "@/lib/content";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";
import { cn } from "@/lib/utils";
import { NOISE_SVG_DATA_URI } from "@/lib/constants";
import Magnetic from "@/components/magnetic";
import { memo } from "react";

const KindIcon = ({ kind, className }: { kind: Project["kind"]; className?: string }) => {
  switch (kind) {
    case "product":
      return <Box className={cn("h-3 w-3", className)} />;
    case "oss":
      return <GitFork className={cn("h-3 w-3", className)} />;
    case "research":
      return <Beaker className={cn("h-3 w-3", className)} />;
    case "rust-port":
      return <Repeat className={cn("h-3 w-3", className)} />;
  }
};

export const ProjectCard = memo(function ProjectCard({ project }: { project: Project }) {
  const { lightTap } = useHapticFeedback();
  const cardRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!rectRef.current || isTouchDevice) return;
    
    const { left, top, width, height } = rectRef.current;
    
    const mouseXPos = e.clientX - left;
    const mouseYPos = e.clientY - top;
    
    const xPct = mouseXPos / width - 0.5;
    const yPct = mouseYPos / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
    
    mouseX.set(mouseXPos);
    mouseY.set(mouseYPos);
  }, [isTouchDevice, x, y, mouseX, mouseY]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (cardRef.current) {
      rectRef.current = cardRef.current.getBoundingClientRect();
    }
    if (!isTouchDevice) {
      spotlightOpacity.set(1);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    spotlightOpacity.set(0);
    x.set(0);
    y.set(0);
    rectRef.current = null;
  };

  // Extract star count from badge
  const starMatch = project.badge?.match(/^([\d,]+\.?\d*[KkMm]?\+?)\s+stars?$/);
  const starCount = starMatch ? starMatch[1] : null;
  const displayBadge = starCount ? null : project.badge;

  // Determine base colors
  const isProduct = project.kind === "product";
  const isResearch = project.kind === "research";
  const isRustPort = project.kind === "rust-port";

  let accentColor = "text-emerald-400";
  let spotlightColor = "52, 211, 153"; // Emerald
  let hoverBorder = "group-hover:border-emerald-500/30";

  if (project.gradient) {
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

  const spotlightBackground = useTransform(
    [mouseX, mouseY],
    ([mx, my]) => `radial-gradient(600px circle at ${mx}px ${my}px, rgba(${spotlightColor}, 0.15), transparent 40%)`
  );

  const isLarge = project.size === "large";
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
          "transition-colors duration-500 ease-out",
          "hover:bg-slate-900/60 hover:border-white/10",
          "active:scale-[0.98] active:brightness-110",
          "focus-within:border-white/20",
          "will-change-transform",
          hoverBorder
        )}
      >
        {/* Noise Overlay */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay transition-opacity duration-500 group-hover:opacity-[0.05]"
          style={{ backgroundImage: `url("${NOISE_SVG_DATA_URI}")` }}
        />

        {/* Custom Gradient Background */}
        {project.gradient && (
           <div className={cn("absolute inset-0 opacity-[0.08] transition-opacity duration-700 group-hover:opacity-[0.2] bg-gradient-to-br", project.gradient)} aria-hidden="true" />
        )}

        {/* Scanline Effect */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-[0.02] group-hover:opacity-[0.04]" />

        {/* Dynamic Spotlight Effect */}
        <motion.div
          className="pointer-events-none absolute -inset-px transition-opacity duration-500"
          style={{
            opacity: spotlightOpacity,
            background: spotlightBackground,
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-1 flex-col">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest">
                <div className="relative flex h-5 w-5 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 overflow-hidden">
                   <AnimatePresence>
                     {isHovered && !isTouchDevice && (
                       <>
                         <motion.div 
                           initial={{ opacity: 0, x: 0 }}
                           animate={{ opacity: 0.5, x: -1 }}
                           exit={{ opacity: 0 }}
                           className="absolute inset-0 flex items-center justify-center text-rose-500 mix-blend-screen"
                         >
                           <KindIcon kind={project.kind} />
                         </motion.div>
                         <motion.div 
                           initial={{ opacity: 0, x: 0 }}
                           animate={{ opacity: 0.5, x: 1 }}
                           exit={{ opacity: 0 }}
                           className="absolute inset-0 flex items-center justify-center text-cyan-500 mix-blend-screen"
                         >
                           <KindIcon kind={project.kind} />
                         </motion.div>
                       </>
                     )}
                   </AnimatePresence>
                   <KindIcon kind={project.kind} className={cn("relative z-10", accentColor)} />
                </div>
                <span className="text-slate-500 transition-colors group-hover:text-slate-400">
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
            "font-medium leading-relaxed text-slate-200 transition-colors group-hover:text-white",
            isLarge ? "mt-6 text-xl" : "mt-4 text-base"
          )}>
            {project.short}
          </p>

          <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400 line-clamp-4 transition-colors group-hover:text-slate-300">
            {project.description}
          </p>

          <div className="mt-8 flex items-center justify-between gap-4 border-t border-white/5 pt-6">
            <div className="flex flex-wrap gap-2">
              {project.tags.slice(0, isLarge ? 5 : 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md bg-white/5 px-2 py-1 text-xs font-medium uppercase tracking-wider text-slate-400 transition-all group-hover:bg-white/10 group-hover:text-slate-200"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <Magnetic strength={0.2}>
              <div className={cn("flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors group-hover:text-white", accentColor)}>
                <span className="relative">
                  {isInternalLink ? "Details" : "View"}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-current transition-all duration-300 group-hover:w-full" />
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
            </Magnetic>
          </div>
        </div>
      </motion.article>
    </Link>
  );
});

export default ProjectCard;