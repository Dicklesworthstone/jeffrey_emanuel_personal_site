"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { Headphones, Play, Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { nvidiaStoryData } from "@/lib/content";

const ISO_DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const PODCAST_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

function formatPodcastDate(dateValue: string): string {
  const isoDateMatch = ISO_DATE_ONLY_RE.exec(dateValue);
  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;
    const utcDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    return PODCAST_DATE_FORMATTER.format(utcDate);
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return PODCAST_DATE_FORMATTER.format(parsedDate);
}

// =============================================================================
// SPOTIFY EMBED
// Lazy-loaded Spotify iframe for episodes with direct Spotify URLs
// =============================================================================

interface SpotifyEmbedProps {
  episodeId: string;
  /** Where to send the listener if the embed never loads */
  fallbackUrl: string;
  className?: string;
}

const EMBED_TIMEOUT_MS = 6000;

function SpotifyEmbed({ episodeId, fallbackUrl, className }: SpotifyEmbedProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  // The iframe is lazy-loaded, so only start the clock once it is near the viewport.
  const isNearViewport = useInView(wrapperRef, { once: true, margin: "200px" });
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const handleLoad = useCallback(() => setIsLoaded(true), []);
  const handleError = useCallback(() => setHasError(true), []);

  // iframes never fire `error` for HTTP failures or tracker blocking, so a
  // timeout is the only reliable way to notice that Spotify was blocked.
  useEffect(() => {
    if (!isNearViewport || isLoaded) return;
    const timer = window.setTimeout(() => setTimedOut(true), EMBED_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [isNearViewport, isLoaded]);

  const showFallback = hasError || (timedOut && !isLoaded);

  if (showFallback) {
    return (
      <div
        ref={wrapperRef}
        role="status"
        className={cn(
          "flex h-[152px] flex-col items-center justify-center gap-3 rounded-lg bg-slate-800/50 px-4 text-center",
          className
        )}
      >
        <span className="text-sm text-slate-400">
          The Spotify player didn&apos;t load (it may be blocked in your browser).
        </span>
        <a
          href={fallbackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-violet-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-400"
        >
          <Play className="h-4 w-4" aria-hidden="true" />
          Listen on Spotify
          <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
        </a>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className={cn("relative overflow-hidden rounded-lg", className)}>
      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-slate-800/50" />
      )}
      <iframe
        src={`https://open.spotify.com/embed/episode/${episodeId}?utm_source=generator&theme=0`}
        width="100%"
        height="152"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        title="Spotify podcast player"
      />
    </div>
  );
}

// =============================================================================
// PODCAST CARD
// Styled link card for podcast episodes
// =============================================================================

interface PodcastCardProps {
  podcast: {
    id: string;
    title: string;
    outlet: string;
    date?: string;
    duration?: string;
    description: string;
    spotifyUrl: string;
  };
  featured?: boolean;
  showEmbed?: boolean;
}

function PodcastCard({ podcast, featured = false, showEmbed = false }: PodcastCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  // Extract Spotify episode ID if it's a direct Spotify URL
  const spotifyEpisodeId = podcast.spotifyUrl.match(/spotify\.com\/episode\/([a-zA-Z0-9]+)/)?.[1];
  const canEmbed = showEmbed && spotifyEpisodeId;

  return (
    <motion.article
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-slate-900/50 transition-all duration-300",
        featured
          ? "border-violet-500/30 shadow-lg shadow-violet-500/10"
          : "border-slate-800 hover:border-slate-700",
        "hover:bg-slate-900/80"
      )}
    >
      {/* Background gradient on hover */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.1 : 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600"
      />

      <div className="relative z-10 p-5 md:p-6">
        {/* Header with outlet and duration */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/20 text-violet-400">
              <Headphones className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-slate-300">
              {podcast.outlet}
            </span>
          </div>
          {podcast.duration && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              {podcast.duration}
            </div>
          )}
        </div>

        {/* Title */}
        <h3
          className={cn(
            "mb-2 font-semibold leading-tight",
            featured ? "text-lg text-white md:text-xl" : "text-base text-slate-200"
          )}
        >
          {podcast.title}
        </h3>

        {/* Description */}
        <p className="mb-4 text-sm leading-relaxed text-slate-400">
          {podcast.description}
        </p>

        {/* Date */}
        {podcast.date && (
          <p className="mb-4 text-xs text-slate-500">
            {formatPodcastDate(podcast.date)}
          </p>
        )}

        {/* Spotify embed (always followed by a plain link) or listen link */}
        {canEmbed ? (
          <>
            <SpotifyEmbed
              episodeId={spotifyEpisodeId}
              fallbackUrl={podcast.spotifyUrl}
              className="mt-4"
            />
            <a
              href={podcast.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-xs font-medium text-violet-400 transition-colors hover:text-violet-300"
            >
              Open this episode on Spotify
              <ExternalLink className="h-3 w-3 opacity-70" aria-hidden="true" />
            </a>
          </>
        ) : (
          <a
            href={podcast.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
              featured
                ? "bg-violet-500 text-white hover:bg-violet-400"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
            )}
          >
            <Play className="h-4 w-4" />
            Listen Now
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        )}
      </div>
    </motion.article>
  );
}

// =============================================================================
// MAIN PODCAST SECTION
// =============================================================================

interface NvidiaPodcastSectionProps {
  /** Additional CSS classes */
  className?: string;
  /** Show section heading */
  showHeading?: boolean;
  /** Enable Spotify embeds where available */
  enableEmbeds?: boolean;
}

export function NvidiaPodcastSection({
  className,
  showHeading = true,
  enableEmbeds = true,
}: NvidiaPodcastSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const podcasts = nvidiaStoryData.podcasts ?? [];
  const [featuredPodcast, ...otherPodcasts] = podcasts;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0 : 0.5 },
    },
  };

  return (
    <section
      ref={ref}
      className={cn("relative", className)}
      aria-label="Podcast appearances"
    >
      {/* Section heading */}
      {showHeading && (
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
          className="mb-12 text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-2 text-violet-400">
            <Headphones className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wider">
              Listen & Learn
            </span>
          </div>
          <h2 className="mb-3 text-3xl font-bold text-white md:text-4xl">
            Podcast Appearances
          </h2>
          <p className="mx-auto max-w-2xl text-slate-400">
            Deep dives into the analysis and its implications for AI infrastructure.
          </p>
        </motion.div>
      )}

      {/* Podcasts grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="grid gap-6 lg:grid-cols-2"
      >
        {/* Featured podcast - takes full width on mobile, left column on desktop */}
        {featuredPodcast && (
          <motion.div variants={itemVariants} className="lg:row-span-2">
            <PodcastCard
              podcast={featuredPodcast}
              featured
              showEmbed={enableEmbeds}
            />
          </motion.div>
        )}

        {/* Other podcasts */}
        {otherPodcasts.map((podcast) => (
          <motion.div key={podcast.id} variants={itemVariants}>
            <PodcastCard
              podcast={podcast}
              showEmbed={enableEmbeds}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export default NvidiaPodcastSection;
