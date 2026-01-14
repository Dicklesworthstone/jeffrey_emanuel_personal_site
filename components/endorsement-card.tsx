"use client";

import { useRef, useState } from "react";
import { Linkedin, Twitter, Mic, Mail, Quote, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

// Source type determines the visual styling and icon
type EndorsementSource = "linkedin" | "twitter" | "podcast" | "email" | "other";

// Variant determines the overall card size and detail level
type EndorsementVariant = "standard" | "compact" | "featured";

export interface EndorsementCardProps {
  quote: string;
  author: string;
  authorTitle?: string;
  authorCompany?: string;
  authorAvatar?: string;
  source: EndorsementSource;
  sourceUrl?: string;
  date?: string;
  highlight?: boolean;
  variant?: EndorsementVariant;
  className?: string;
}

// Source-specific styling configuration
const sourceConfig: Record<
  EndorsementSource,
  {
    icon: typeof Linkedin;
    label: string;
    accentColor: string;
    spotlightColor: string;
    hoverBorder: string;
    bgGradient: string;
  }
> = {
  linkedin: {
    icon: Linkedin,
    label: "LinkedIn",
    accentColor: "text-sky-400",
    spotlightColor: "56, 189, 248",
    hoverBorder: "group-hover:border-sky-500/30",
    bgGradient: "from-sky-500/10 to-blue-600/5",
  },
  twitter: {
    icon: Twitter,
    label: "X/Twitter",
    accentColor: "text-slate-300",
    spotlightColor: "148, 163, 184",
    hoverBorder: "group-hover:border-slate-400/30",
    bgGradient: "from-slate-500/10 to-slate-600/5",
  },
  podcast: {
    icon: Mic,
    label: "Podcast",
    accentColor: "text-purple-400",
    spotlightColor: "192, 132, 252",
    hoverBorder: "group-hover:border-purple-500/30",
    bgGradient: "from-purple-500/10 to-violet-600/5",
  },
  email: {
    icon: Mail,
    label: "Email",
    accentColor: "text-emerald-400",
    spotlightColor: "52, 211, 153",
    hoverBorder: "group-hover:border-emerald-500/30",
    bgGradient: "from-emerald-500/10 to-teal-600/5",
  },
  other: {
    icon: Quote,
    label: "Quote",
    accentColor: "text-amber-400",
    spotlightColor: "251, 191, 36",
    hoverBorder: "group-hover:border-amber-500/30",
    bgGradient: "from-amber-500/10 to-orange-600/5",
  },
};

// Generate initials from author name for avatar fallback
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function EndorsementCard({
  quote,
  author,
  authorTitle,
  authorCompany,
  authorAvatar,
  source,
  sourceUrl,
  date,
  highlight = false,
  variant = "standard",
  className,
}: EndorsementCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [spotlightOpacity, setSpotlightOpacity] = useState(0);

  const config = sourceConfig[source];
  const SourceIcon = config.icon;

  // Mouse tracking for spotlight effect (same pattern as project-card)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    requestAnimationFrame(() => {
      divRef.current?.style.setProperty("--mouse-x", `${x}px`);
      divRef.current?.style.setProperty("--mouse-y", `${y}px`);
    });
  };

  const handleMouseEnter = () => setSpotlightOpacity(1);
  const handleMouseLeave = () => setSpotlightOpacity(0);

  // Variant-specific sizing
  const isCompact = variant === "compact";
  const isFeatured = variant === "featured";

  // Truncate quote for compact variant
  const displayQuote = isCompact && quote.length > 120
    ? quote.slice(0, 117) + "..."
    : quote;

  const cardContent = (
    <article
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-white/5 bg-black/20",
        "transition-all duration-300 ease-out",
        "hover:bg-black/40 hover:scale-[1.01] hover:shadow-xl hover:shadow-black/40",
        "focus-within:scale-[1.01] focus-within:shadow-xl focus-within:shadow-black/40",
        config.hoverBorder,
        // Variant-specific padding and sizing
        isCompact && "p-4",
        !isCompact && !isFeatured && "p-5 md:p-6",
        isFeatured && "p-6 md:p-8",
        // Highlight styling
        highlight && "ring-1 ring-amber-500/30",
        className
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
          background: `radial-gradient(400px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(${config.spotlightColor}, 0.1), transparent 40%)`,
        }}
        aria-hidden="true"
      />

      {/* Subtle top border gradient */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" aria-hidden="true" />

      <div className="relative z-10 flex flex-1 flex-col">
        {/* Source badge and date */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10",
                config.accentColor
              )}
            >
              <SourceIcon className="h-2.5 w-2.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
              {config.label}
            </span>
          </div>
          {date && !isCompact && (
            <span className="text-xs text-slate-600">{date}</span>
          )}
        </div>

        {/* Quote - using proper blockquote for accessibility */}
        <blockquote
          className={cn(
            "flex-1",
            isCompact && "text-sm leading-relaxed text-slate-300",
            !isCompact && !isFeatured && "text-base leading-relaxed text-slate-200",
            isFeatured && "text-lg md:text-xl leading-relaxed text-slate-100 font-medium"
          )}
        >
          <span className={cn("text-slate-500", isFeatured && "text-slate-400")}>
            &ldquo;
          </span>
          {displayQuote}
          <span className={cn("text-slate-500", isFeatured && "text-slate-400")}>
            &rdquo;
          </span>
        </blockquote>

        {/* Author attribution */}
        <footer
          className={cn(
            "flex items-center gap-3 border-t border-white/5 pt-4",
            isCompact && "mt-3 pt-3",
            !isCompact && "mt-4",
            isFeatured && "mt-6"
          )}
        >
          {/* Avatar */}
          {!isCompact && (
            <div
              className={cn(
                "flex items-center justify-center rounded-full bg-slate-800 text-slate-400 font-bold ring-1 ring-white/10",
                isFeatured ? "h-12 w-12 text-sm" : "h-10 w-10 text-xs"
              )}
            >
              {authorAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={authorAvatar}
                  alt={author}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                getInitials(author)
              )}
            </div>
          )}

          {/* Author details */}
          <div className="flex-1 min-w-0">
            <cite
              className={cn(
                "not-italic font-semibold text-slate-200 block truncate",
                isCompact && "text-sm",
                isFeatured && "text-lg"
              )}
            >
              {author}
            </cite>
            {(authorTitle || authorCompany) && !isCompact && (
              <p className="text-xs text-slate-500 truncate">
                {authorTitle}
                {authorTitle && authorCompany && " at "}
                {authorCompany}
              </p>
            )}
          </div>

          {/* Source link indicator */}
          {sourceUrl && (
            <ExternalLink
              className={cn(
                "h-3.5 w-3.5 text-slate-600 transition-colors group-hover:text-slate-400",
                isFeatured && "h-4 w-4"
              )}
              aria-hidden="true"
            />
          )}
        </footer>
      </div>
    </article>
  );

  // Wrap in link if sourceUrl is provided
  if (sourceUrl) {
    return (
      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 rounded-2xl sm:rounded-3xl"
        aria-label={`View ${author}'s endorsement on ${config.label}`}
      >
        {cardContent}
      </a>
    );
  }

  return cardContent;
}

export default EndorsementCard;
