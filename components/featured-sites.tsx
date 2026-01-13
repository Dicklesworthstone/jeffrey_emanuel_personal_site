"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ExternalLink, Sparkles, Workflow, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeaturedSite } from "@/lib/content";

// =============================================================================
// ICON MAP
// =============================================================================

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Workflow,
};

// =============================================================================
// OG LINK CARD COMPONENT
// =============================================================================

interface OgLinkCardProps {
  site: FeaturedSite;
  index: number;
  reducedMotion: boolean;
  isInView: boolean;
}

function OgLinkCard({ site, index, reducedMotion, isInView }: OgLinkCardProps) {
  const Icon = iconMap[site.icon] || Sparkles;
  const domain = new URL(site.url).hostname;

  return (
    <motion.a
      href={site.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={reducedMotion ? {} : { opacity: 0, y: 24, scale: 0.96 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: reducedMotion ? 0 : 0.5,
        delay: reducedMotion ? 0 : 0.1 + index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950/80 shadow-lg shadow-slate-950/50 backdrop-blur-sm transition-all duration-300 hover:border-slate-700/80 hover:shadow-xl hover:shadow-violet-500/5"
    >
      {/* OG Image Area - Twitter/Discord style */}
      <div className="relative aspect-[1.91/1] w-full overflow-hidden">
        {/* Gradient background */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-30 transition-opacity duration-300 group-hover:opacity-40",
            site.gradient
          )}
        />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:2rem_2rem]" />
        {/* Central icon with glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Glow effect */}
            <div
              className={cn(
                "absolute -inset-4 rounded-full bg-gradient-to-br opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-30",
                site.gradient
              )}
            />
            <div
              className={cn(
                "relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br shadow-2xl transition-transform duration-300 group-hover:scale-105",
                site.gradient
              )}
            >
              <Icon className="h-10 w-10 text-white drop-shadow-lg" />
            </div>
          </div>
        </div>
        {/* Decorative corner elements */}
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/[0.02] blur-2xl" />
        <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/[0.02] blur-2xl" />
      </div>

      {/* Content area - like OG link previews */}
      <div className="flex flex-1 flex-col border-t border-slate-800/50 p-4">
        {/* Domain with favicon-style icon */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <LinkIcon className="h-3 w-3" />
          <span>{domain}</span>
          <ExternalLink className="ml-auto h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>

        {/* Title */}
        <h3 className="mt-2 text-base font-bold leading-tight text-white transition-colors group-hover:text-violet-200 sm:text-lg">
          {site.title}
        </h3>

        {/* Description */}
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">
          {site.tagline}
        </p>
      </div>

      {/* Hover border glow effect */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-xl opacity-0 ring-1 ring-inset transition-opacity duration-300 group-hover:opacity-100",
          site.id === "jeffreysprompts"
            ? "ring-amber-500/20"
            : "ring-violet-500/20"
        )}
      />
    </motion.a>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface FeaturedSitesProps {
  sites: FeaturedSite[];
  className?: string;
}

export default function FeaturedSites({ sites, className }: FeaturedSitesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion ?? false;

  return (
    <div
      ref={containerRef}
      className={cn("grid gap-6 sm:grid-cols-2", className)}
    >
      {sites.map((site, index) => (
        <OgLinkCard
          key={site.id}
          site={site}
          index={index}
          reducedMotion={reducedMotion}
          isInView={isInView}
        />
      ))}
    </div>
  );
}
