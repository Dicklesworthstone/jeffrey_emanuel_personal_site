"use client";

import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ExternalLink, Sparkles, Workflow, Microscope } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeaturedSite } from "@/lib/content";

// =============================================================================
// ICON MAP
// =============================================================================

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Workflow,
  Microscope,
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
  const [imageError, setImageError] = useState(false);

  // Use proxy for OG images to avoid CORS issues and enable caching
  const proxiedImageUrl = site.ogImage
    ? `/api/og-image?url=${encodeURIComponent(site.ogImage)}`
    : null;

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
      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/90 shadow-lg shadow-slate-950/50 backdrop-blur-sm transition-all duration-300 hover:border-slate-600/80 hover:shadow-xl hover:shadow-violet-500/10"
    >
      {/* OG Image Area - Twitter/Discord style */}
      <div className="relative aspect-[1.91/1] w-full overflow-hidden bg-slate-950">
        {proxiedImageUrl && !imageError ? (
          // Actual OG Image via proxy
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={proxiedImageUrl}
            alt={`${site.title} preview`}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          // Fallback: Gradient with icon
          <>
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-40 transition-opacity duration-300 group-hover:opacity-50",
                site.gradient
              )}
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:2rem_2rem]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div
                  className={cn(
                    "absolute -inset-6 rounded-full bg-gradient-to-br opacity-30 blur-3xl transition-opacity duration-300 group-hover:opacity-40",
                    site.gradient
                  )}
                />
                <div
                  className={cn(
                    "relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br shadow-2xl transition-transform duration-300 group-hover:scale-110",
                    site.gradient
                  )}
                >
                  <Icon className="h-12 w-12 text-white drop-shadow-lg" />
                </div>
              </div>
            </div>
          </>
        )}
        {/* Overlay gradient for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
        {/* Decorative corner elements */}
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/[0.02] blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-white/[0.02] blur-3xl" />
      </div>

      {/* Content area - like OG link previews */}
      <div className="flex flex-1 flex-col border-t border-slate-800/50 bg-slate-900/50 p-5">
        {/* Domain with favicon-style icon */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div
            className={cn(
              "flex h-4 w-4 items-center justify-center rounded bg-gradient-to-br",
              site.gradient
            )}
          >
            <Icon className="h-2.5 w-2.5 text-white" />
          </div>
          <span className="font-medium">{domain}</span>
          <ExternalLink className="ml-auto h-3.5 w-3.5 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5" />
        </div>

        {/* Title */}
        <h3 className="mt-3 text-lg font-bold leading-tight text-white transition-colors group-hover:text-violet-200 sm:text-xl">
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
          site.id === "jeffreysprompts" && "ring-amber-500/30",
          site.id === "agent-flywheel" && "ring-violet-500/30",
          site.id === "brennerbot" && "ring-teal-500/30"
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
      className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}
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
