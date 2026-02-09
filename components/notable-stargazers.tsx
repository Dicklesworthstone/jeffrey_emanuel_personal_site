"use client";

import { memo, useMemo } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Star, Users, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type NotableStargazer,
  type StargazerIntelligence,
  formatReach,
  isDataStale,
  DISPLAY_DEFAULTS,
} from "@/lib/stargazer-types";

// Try to import real data, fall back to sample data if not available
let stargazerData: StargazerIntelligence;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  stargazerData = require("@/lib/data/stargazer-intelligence.json");
} catch {
  // Fall back to sample data during development
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  stargazerData = require("@/lib/data/stargazer-intelligence.sample.json");
}

type ResolvedStargazerData = {
  stargazers: NotableStargazer[];
  totalCount: number;
  companies: { name: string; count: number }[];
  combinedReach: number;
};

const EMPTY_RESOLVED: ResolvedStargazerData = {
  stargazers: [],
  totalCount: 0,
  companies: [],
  combinedReach: 0,
};

const HOMEPAGE_RESOLVED: ResolvedStargazerData = {
  stargazers: stargazerData.topStargazers ?? [],
  totalCount: stargazerData.totalUniqueStargazers ?? 0,
  companies: stargazerData.topCompanies ?? [],
  combinedReach: stargazerData.combinedReach ?? 0,
};

const repoCache = new Map<string, ResolvedStargazerData>();

function resolveRepoData(repoSlug: string): ResolvedStargazerData {
  const cached = repoCache.get(repoSlug);
  if (cached) return cached;

  const repoData = stargazerData.byRepo?.[repoSlug];
  if (!repoData) {
    repoCache.set(repoSlug, EMPTY_RESOLVED);
    return EMPTY_RESOLVED;
  }

  const topStargazers = repoData.topStargazers ?? [];
  const resolved: ResolvedStargazerData = {
    stargazers: topStargazers,
    totalCount: repoData.totalCount ?? repoData.notableCount ?? 0,
    companies: repoData.topCompanies?.map((name) => ({ name, count: 0 })) ?? [],
    combinedReach: topStargazers.reduce((sum, s) => sum + s.followers, 0),
  };

  repoCache.set(repoSlug, resolved);
  return resolved;
}

const isStargazerDataStale = isDataStale(stargazerData.lastUpdated);

interface NotableStargazersProps {
  /** Display mode */
  variant?: "homepage" | "project" | "compact";

  /** For 'project' variant - which repo to show */
  repoSlug?: string;

  /** Maximum stargazers to display */
  maxItems?: number;

  /** Show aggregate stats */
  showStats?: boolean;

  /** Show company mentions */
  showCompanies?: boolean;

  /** Additional CSS classes */
  className?: string;
}

const AVATAR_SIZE_CONFIG = {
  sm: { className: "h-8 w-8", pixels: 32, ring: "ring-2" },
  md: { className: "h-10 w-10", pixels: 40, ring: "ring-2" },
  lg: { className: "h-12 w-12", pixels: 48, ring: "ring-[3px]" },
};

/**
 * Avatar component for a single stargazer with tooltip
 */
const StargazerAvatar = memo(function StargazerAvatar({
  stargazer,
  size = "md",
  index = 0,
  prefersReducedMotion,
}: {
  stargazer: NotableStargazer;
  size?: "sm" | "md" | "lg";
  index?: number;
  prefersReducedMotion: boolean | null;
}) {
  const config = AVATAR_SIZE_CONFIG[size];

  return (
    <motion.a
      href={`https://github.com/${stargazer.login}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: prefersReducedMotion ? 0 : index * 0.05,
        duration: prefersReducedMotion ? 0 : 0.3,
      }}
      whileHover={prefersReducedMotion ? {} : { scale: 1.1, zIndex: 10 }}
      aria-label={`${stargazer.name} from ${stargazer.company || "GitHub"} - view profile`}
    >
      {/* Avatar image */}
      <Image
        src={stargazer.avatarUrl}
        alt={`${stargazer.name}'s avatar`}
        width={config.pixels}
        height={config.pixels}
        className={cn(
          config.className,
          config.ring,
          "rounded-full ring-slate-900 transition-all duration-200",
          "group-hover:ring-violet-500/50"
        )}
      />

      {/* Tooltip - shows on hover */}
      <div
        className={cn(
          "pointer-events-none absolute -top-2 left-1/2 z-20 -translate-x-1/2 -translate-y-full",
          "rounded-lg bg-slate-800 px-3 py-2 shadow-xl",
          "opacity-0 transition-opacity duration-200 group-hover:opacity-100",
          "min-w-max max-w-[200px]"
        )}
        role="tooltip"
      >
        <div className="text-sm font-medium text-slate-100">{stargazer.name}</div>
        {stargazer.company && (
          <div className="text-xs text-slate-400">{stargazer.company}</div>
        )}
        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {formatReach(stargazer.followers)}
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            {formatReach(stargazer.totalStars)}
          </span>
        </div>
        {/* Tooltip arrow */}
        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
      </div>
    </motion.a>
  );
});

/**
 * Avatar strip showing multiple stargazers
 */
const AvatarStrip = memo(function AvatarStrip({
  stargazers,
  maxItems,
  size = "md",
  totalCount,
  prefersReducedMotion,
}: {
  stargazers: NotableStargazer[];
  maxItems: number;
  size?: "sm" | "md" | "lg";
  totalCount: number;
  prefersReducedMotion: boolean | null;
}) {
  const displayStargazers = useMemo(
    () => stargazers.slice(0, maxItems),
    [stargazers, maxItems],
  );
  // Ensure remainingCount doesn't go negative (defensive against bad data)
  const remainingCount = Math.max(0, totalCount - displayStargazers.length);

  const overlapClasses = {
    sm: "-space-x-2",
    md: "-space-x-3",
    lg: "-space-x-4",
  };

  return (
    <div className="flex items-center gap-3">
      <div className={cn("flex", overlapClasses[size])}>
        {displayStargazers.map((stargazer, index) => (
          <StargazerAvatar
            key={stargazer.login}
            stargazer={stargazer}
            size={size}
            index={index}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}
      </div>
      {remainingCount > 0 && (
        <motion.span
          className="text-sm text-slate-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: prefersReducedMotion ? 0 : maxItems * 0.05 + 0.2 }}
        >
          +{formatReach(remainingCount)} more
        </motion.span>
      )}
    </div>
  );
});

/**
 * Stats line showing reach and counts
 */
const StatsLine = memo(function StatsLine({
  totalCount,
  combinedReach,
  prefersReducedMotion,
}: {
  totalCount: number;
  combinedReach: number;
  prefersReducedMotion: boolean | null;
}) {
  return (
    <motion.div
      className="text-sm text-slate-300"
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
    >
      Starred by{" "}
      <span className="font-medium text-slate-100">{formatReach(totalCount)}+</span>{" "}
      developers with{" "}
      <span className="font-medium text-violet-400">{formatReach(combinedReach)}</span>{" "}
      combined reach
    </motion.div>
  );
});

/**
 * Company mentions line
 */
const CompanyMentions = memo(function CompanyMentions({
  companies,
  maxCompanies,
  prefersReducedMotion,
}: {
  companies: { name: string; count: number }[];
  maxCompanies: number;
  prefersReducedMotion: boolean | null;
}) {
  const topCompanies = companies.slice(0, maxCompanies);

  if (topCompanies.length === 0) return null;

  return (
    <motion.div
      className="text-sm text-slate-400"
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: prefersReducedMotion ? 0 : 0.1, duration: prefersReducedMotion ? 0 : 0.4 }}
    >
      Including engineers from{" "}
      {topCompanies.map((company, index) => (
        <span key={company.name}>
          <span className="font-medium text-violet-400">{company.name}</span>
          {index < topCompanies.length - 2 && ", "}
          {index === topCompanies.length - 2 && " and "}
        </span>
      ))}
    </motion.div>
  );
});

/**
 * Notable Stargazers display component.
 *
 * Shows influential GitHub users who have starred Jeffrey's repositories.
 * Displays avatar strip with tooltips, stats, and company mentions.
 *
 * @example
 * ```tsx
 * // Homepage variant - shows aggregate stats
 * <NotableStargazers variant="homepage" />
 *
 * // Project variant - shows per-repo stargazers
 * <NotableStargazers variant="project" repoSlug="mcp-agent-mail" />
 *
 * // Compact variant - just avatars
 * <NotableStargazers variant="compact" maxItems={5} />
 * ```
 */
export function NotableStargazers({
  variant = "homepage",
  repoSlug,
  maxItems,
  showStats,
  showCompanies,
  className,
}: NotableStargazersProps) {
  const prefersReducedMotion = useReducedMotion();

  // Get display config defaults for this variant
  const defaults = DISPLAY_DEFAULTS[variant];
  const finalMaxItems = maxItems ?? defaults.maxAvatars;
  const finalShowStats = showStats ?? defaults.showStats;
  const finalShowCompanies = showCompanies ?? defaults.showCompanies;

  // Resolve stargazer data without re-computing on every render
  const resolvedData =
    variant === "project" && repoSlug ? resolveRepoData(repoSlug) : HOMEPAGE_RESOLVED;
  const { stargazers, totalCount, companies, combinedReach } = resolvedData;
  const isStale = isStargazerDataStale;

  // Don't render if no data
  if (stargazers.length === 0) {
    return null;
  }

  // Compact variant - just avatars
  if (variant === "compact") {
    return (
      <div className={cn("", className)}>
        <AvatarStrip
          stargazers={stargazers}
          maxItems={finalMaxItems}
          size="sm"
          totalCount={totalCount}
          prefersReducedMotion={prefersReducedMotion}
        />
      </div>
    );
  }

  // Project variant - per-repo display
  if (variant === "project") {
    return (
      <div
        className={cn(
          "rounded-lg border border-slate-800/50 bg-slate-900/30 p-4",
          className
        )}
      >
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-300">
          <Star className="h-4 w-4 text-violet-400" />
          Notable developers using this
        </div>

        <AvatarStrip
          stargazers={stargazers}
          maxItems={finalMaxItems}
          size="md"
          totalCount={totalCount}
          prefersReducedMotion={prefersReducedMotion}
        />

        {finalShowCompanies && companies.length > 0 && (
          <div className="mt-3">
            <CompanyMentions
              companies={companies}
              maxCompanies={defaults.maxCompanies}
              prefersReducedMotion={prefersReducedMotion}
            />
          </div>
        )}
      </div>
    );
  }

  // Homepage variant - full display with stats
  return (
    <motion.div
      className={cn(
        "rounded-xl border border-violet-500/20 bg-slate-900/50 p-6",
        "backdrop-blur-sm",
        className
      )}
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
    >
      {/* Stats line */}
      {finalShowStats && (
        <div className="mb-4">
          <StatsLine
            totalCount={totalCount}
            combinedReach={combinedReach}
            prefersReducedMotion={prefersReducedMotion}
          />
        </div>
      )}

      {/* Company mentions */}
      {finalShowCompanies && companies.length > 0 && (
        <div className="mb-4">
          <CompanyMentions
            companies={companies}
            maxCompanies={defaults.maxCompanies}
            prefersReducedMotion={prefersReducedMotion}
          />
        </div>
      )}

      {/* Avatar strip */}
      <AvatarStrip
        stargazers={stargazers}
        maxItems={finalMaxItems}
        size="lg"
        totalCount={totalCount}
        prefersReducedMotion={prefersReducedMotion}
      />

      {/* Stale data warning */}
      {isStale && (
        <motion.div
          className="mt-4 flex items-center gap-1 text-xs text-slate-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <ExternalLink className="h-3 w-3" />
          Data last updated{" "}
          <time dateTime={stargazerData.lastUpdated} suppressHydrationWarning>
            {new Date(stargazerData.lastUpdated).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </time>
        </motion.div>
      )}
    </motion.div>
  );
}

export default NotableStargazers;
