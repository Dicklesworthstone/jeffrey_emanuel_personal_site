"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ArrowUpRight,
  Sparkles,
  Workflow,
  Microscope,
  BookOpen,
  Mail,
  Terminal,
  Database,
  Zap,
  ChevronDown,
  FileText,
  ScanText,
  GraduationCap,
  Network,
  Activity,
  Music,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeaturedSite } from "@/lib/content";

// =============================================================================
// ICON MAP
// =============================================================================

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Workflow,
  Microscope,
  BookOpen,
  Mail,
  Terminal,
  Database,
  Zap,
  FileText,
  ScanText,
  GraduationCap,
  Network,
  Activity,
  Music,
};

// On phones the single-column grid of eight OG cards is ~2.6k px tall, so
// only the first few render until the visitor asks for the rest.
const MOBILE_VISIBLE_COUNT = 4;

// =============================================================================
// OG LINK CARD COMPONENT
// =============================================================================

interface OgLinkCardProps {
  site: FeaturedSite;
  className?: string;
}

function OgLinkCard({ site, className }: OgLinkCardProps) {
  const Icon = iconMap[site.icon] || Sparkles;
  const domain = new URL(site.url).hostname;
  const [imageError, setImageError] = useState(false);

  // Use proxy for OG images to avoid CORS issues and enable caching
  const proxiedImageUrl = site.ogImage
    ? `/api/og-image?url=${encodeURIComponent(site.ogImage)}`
    : null;

  return (
    <a
      href={site.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        // card-raised owns radius, tint, border, shadow and the hover lift/scale
        "card-raised group relative flex flex-col overflow-hidden pointer-fine:backdrop-blur-sm",
        // Skip rendering work while offscreen; hint = median height (351px @1280, 332px @390)
        "cv-auto [--cv-height:350px]",
        className
      )}
    >
      {/* OG Image Area - Twitter/Discord style */}
      <div className="relative aspect-[1.91/1] w-full overflow-hidden bg-slate-950">
        {proxiedImageUrl && !imageError ? (
          // Actual OG Image via proxy. next/image resizes the 1200x630 source
          // down to the card width and negotiates AVIF/WebP; the raw <img> was
          // shipping fifteen full-size PNGs into ~380px slots.
          <Image
            src={proxiedImageUrl}
            alt={`${site.title} preview`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
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
            {/* Only when a real preview failed to load, not when the site has no ogImage. */}
            {imageError && (
              <span className="absolute bottom-2 right-2 rounded-md bg-slate-950/70 px-1.5 py-0.5 text-[11px] text-slate-400">
                Preview unavailable
              </span>
            )}
          </>
        )}
        {/* Overlay gradient for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
        {/* The two 2%-white blurred corner glows that used to sit here were
            invisible on both themes and cost a blur pass per card; removed. */}
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
          <ArrowUpRight className="ml-auto h-3.5 w-3.5 opacity-0 transition-[opacity,transform] duration-200 pointer-coarse:opacity-100 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </div>

        {/* Title */}
        <h3 className="mt-3 text-lg font-bold leading-tight text-white transition-colors group-hover:text-violet-200 sm:text-xl">
          {site.title}
        </h3>

        {/* Description */}
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">
          {site.tagline}
        </p>
        <span className="sr-only"> (opens in a new tab)</span>
      </div>

      {/* Hover border glow effect */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-1 ring-inset transition-opacity duration-300 group-hover:opacity-100",
          site.id === "jeffreysprompts" && "ring-amber-500/30",
          site.id === "agent-flywheel" && "ring-violet-500/30",
          site.id === "brennerbot" && "ring-teal-500/30",
          site.id === "jeffreys-skills" && "ring-indigo-500/30",
          site.id === "mcpagentmail" && "ring-fuchsia-500/30",
          site.id === "frankentui" && "ring-red-500/30",
          site.id === "frankensqlite" && "ring-blue-500/30",
          site.id === "asupersync" && "ring-emerald-500/30"
        )}
      />
    </a>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface FeaturedSitesProps {
  sites: FeaturedSite[];
  className?: string;
}

/**
 * Cards render settled (no entrance animation): this section sits well below
 * the fold, and only the hero and the first section animate in.
 */
export default function FeaturedSites({ sites, className }: FeaturedSitesProps) {
  const [showAll, setShowAll] = useState(false);
  const hiddenOnMobile = Math.max(0, sites.length - MOBILE_VISIBLE_COUNT);

  return (
    <div className={className}>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sites.map((site, index) => (
          <OgLinkCard
            key={site.id}
            site={site}
            className={cn(!showAll && index >= MOBILE_VISIBLE_COUNT && "hidden sm:flex")}
          />
        ))}
      </div>

      {hiddenOnMobile > 0 && !showAll && (
        <div className="mt-6 flex justify-center sm:hidden">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/70 px-5 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            See all {sites.length} sites
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
