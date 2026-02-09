"use client";

import { useRef, useState } from "react";
import { ExternalLink, Play, Cpu, GraduationCap, Wrench } from "lucide-react";
import type { LiveDemo, DemoCategory } from "@/lib/content";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";
import { cn } from "@/lib/utils";

// Category-specific styling
const categoryConfig: Record<
  DemoCategory,
  {
    icon: typeof Cpu;
    label: string;
    accentColor: string;
    spotlightColor: string;
    hoverBorder: string;
    bgGradient: string;
  }
> = {
  "ai-tools": {
    icon: Cpu,
    label: "AI Tools",
    accentColor: "text-violet-400",
    spotlightColor: "139, 92, 246",
    hoverBorder: "group-hover:border-violet-500/30",
    bgGradient: "from-violet-500/10 to-purple-600/5",
  },
  education: {
    icon: GraduationCap,
    label: "Education",
    accentColor: "text-emerald-400",
    spotlightColor: "52, 211, 153",
    hoverBorder: "group-hover:border-emerald-500/30",
    bgGradient: "from-emerald-500/10 to-teal-600/5",
  },
  "developer-tools": {
    icon: Wrench,
    label: "Developer Tools",
    accentColor: "text-sky-400",
    spotlightColor: "56, 189, 248",
    hoverBorder: "group-hover:border-sky-500/30",
    bgGradient: "from-sky-500/10 to-blue-600/5",
  },
};

interface DemoCardProps {
  demo: LiveDemo;
  featured?: boolean;
  className?: string;
}

export default function DemoCard({ demo, featured = false, className }: DemoCardProps) {
  const { lightTap } = useHapticFeedback();
  const divRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const [spotlightOpacity, setSpotlightOpacity] = useState(0);

  const config = categoryConfig[demo.category];
  const CategoryIcon = config.icon;

  // Mouse tracking for spotlight effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rectRef.current) return;
    const x = e.clientX - rectRef.current.left;
    const y = e.clientY - rectRef.current.top;

    requestAnimationFrame(() => {
      divRef.current?.style.setProperty("--mouse-x", `${x}px`);
      divRef.current?.style.setProperty("--mouse-y", `${y}px`);
    });
  };

  const handleMouseEnter = () => {
    if (divRef.current) {
      rectRef.current = divRef.current.getBoundingClientRect();
    }
    setSpotlightOpacity(1);
  };

  const handleMouseLeave = () => {
    setSpotlightOpacity(0);
    rectRef.current = null;
  };

  return (
    <a
      href={demo.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("block h-full", className)}
      onTouchStart={lightTap}
    >
      <article
        ref={divRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-white/5 bg-black/20",
          "transition-all duration-300 ease-out",
          "hover:bg-black/40 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/50",
          "focus-within:scale-[1.02] focus-within:shadow-2xl focus-within:shadow-black/50",
          "will-change-transform",
          config.hoverBorder,
          featured ? "p-6 md:p-8" : "p-5 md:p-6"
        )}
      >
        {/* Background gradient */}
        <div
          className={cn(
            "absolute inset-0 opacity-[0.08] transition-opacity duration-500 bg-gradient-to-br group-hover:opacity-[0.15]",
            config.bgGradient
          )}
          aria-hidden="true"
        />

        {/* Dynamic spotlight effect */}
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-500"
          style={{
            opacity: spotlightOpacity,
            background: `radial-gradient(500px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(${config.spotlightColor}, 0.12), transparent 40%)`,
          }}
          aria-hidden="true"
        />

        {/* Subtle top border gradient */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" aria-hidden="true" />

        <div className="relative z-10 flex flex-1 flex-col">
          {/* Preview image placeholder - can be added later */}
          {demo.previewImage && (
            <div className="mb-4 overflow-hidden rounded-lg border border-white/10 bg-slate-900/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={demo.previewImage}
                alt={`${demo.title} preview`}
                className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          )}

          {/* Category badge */}
          <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest">
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10",
                config.accentColor
              )}
            >
              <CategoryIcon className="h-3 w-3" />
            </span>
            <span className="text-slate-500">{config.label}</span>
          </div>

          {/* Title */}
          <h3
            className={cn(
              "font-bold leading-tight text-white transition-colors group-hover:text-white",
              featured ? "mt-4 text-2xl md:text-3xl" : "mt-3 text-xl md:text-2xl"
            )}
          >
            {demo.title}
          </h3>

          {/* Description */}
          <p
            className={cn(
              "leading-relaxed text-slate-300",
              featured ? "mt-4 text-base" : "mt-3 text-sm"
            )}
          >
            {demo.description}
          </p>

          {/* Long description for featured cards */}
          {featured && demo.longDescription && (
            <p className="mt-2 text-sm leading-relaxed text-slate-400 line-clamp-3">
              {demo.longDescription}
            </p>
          )}

          {/* Spacer to push footer to bottom */}
          <div className="flex-1" />

          {/* Footer with technologies and CTA */}
          <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/5 pt-5">
            {/* Technology tags */}
            <div className="flex flex-wrap gap-1.5">
              {demo.technologies.slice(0, featured ? 4 : 3).map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center rounded-md bg-white/5 px-2 py-1 text-xs font-medium uppercase tracking-wider text-slate-400 transition-colors group-hover:bg-white/10 group-hover:text-slate-300"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div
              className={cn(
                "flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors",
                config.accentColor,
                "group-hover:text-white"
              )}
            >
              <Play className="h-3 w-3 fill-current" />
              <span className="hidden sm:inline">Try It</span>
              <ExternalLink className="h-3 w-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </article>
    </a>
  );
}

export { DemoCard };
