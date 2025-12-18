/**
 * TypeScript interfaces for Notable Stargazers Intelligence feature.
 *
 * These types define the data model for analyzing and displaying
 * influential GitHub users who have starred Jeffrey's repositories.
 *
 * @see Bead w3q for design decisions
 * @see scripts/analyze-stargazers.ts for data generation
 */

/**
 * Represents a notable GitHub user who has starred one or more repositories.
 *
 * "Notable" is determined by the influence score, which weighs:
 * - Total stars across their repos (proxy for code quality/impact)
 * - Follower count (proxy for influence/reach)
 * - Contributions (proxy for activity level)
 * - Recent activity (proxy for current engagement)
 *
 * Formula: score = totalStars * 2.5 + followers * 2.0 + contributions * 0.1 + recentActivity * 0.1
 *
 * Threshold for "notable": score > 500 (adjust based on real data)
 */
export interface NotableStargazer {
  /** GitHub username (e.g., "octocat") */
  login: string;

  /** Display name (falls back to login if not set) */
  name: string;

  /** URL to user's GitHub avatar */
  avatarUrl: string;

  /** Company from GitHub profile (normalized: "@google" -> "Google") */
  company?: string;

  /** Bio from GitHub profile */
  bio?: string;

  /** Calculated influence score */
  score: number;

  /** Number of GitHub followers */
  followers: number;

  /** Total stars across all their public repositories */
  totalStars: number;

  /** Which of our repos they starred (repo slugs) */
  reposStarred: string[];
}

/**
 * Per-repository stargazer statistics.
 * Used for project detail pages to show who starred each specific repo.
 */
export interface RepoStargazerStats {
  /** Total number of stargazers for this repo */
  totalCount: number;

  /** Number of "notable" stargazers (score > threshold) */
  notableCount: number;

  /** Top notable stargazers for this specific repo */
  topStargazers: NotableStargazer[];

  /** Top companies represented among stargazers */
  topCompanies?: string[];
}

/**
 * Aggregated stargazer intelligence across all analyzed repositories.
 * This is the top-level data structure output by the analysis script.
 *
 * @example
 * ```json
 * {
 *   "totalUniqueStargazers": 5432,
 *   "combinedReach": 2500000,
 *   "topStargazers": [...],
 *   "topCompanies": [{"name": "Google", "count": 42}],
 *   "byRepo": {"mcp-agent-mail": {...}},
 *   "lastUpdated": "2025-12-18T00:00:00Z"
 * }
 * ```
 */
export interface StargazerIntelligence {
  /** Total unique users who starred any analyzed repo */
  totalUniqueStargazers: number;

  /** Sum of all notable stargazers' followers (reach/influence metric) */
  combinedReach: number;

  /** Top 50-100 most influential stargazers across all repos */
  topStargazers: NotableStargazer[];

  /** Companies most represented among notable stargazers */
  topCompanies: CompanyCount[];

  /** Per-repo breakdown of stargazer data */
  byRepo: Record<string, RepoStargazerStats>;

  /** ISO timestamp of when this data was generated */
  lastUpdated: string;
}

/**
 * Company count for the top companies display.
 */
export interface CompanyCount {
  /** Normalized company name (e.g., "Google", "Anthropic") */
  name: string;

  /** Number of notable stargazers from this company */
  count: number;
}

/**
 * Configuration for the NotableStargazers component display.
 */
export interface NotableStargazersDisplayConfig {
  /**
   * Display variant:
   * - "homepage": Aggregate stats + top avatars in flywheel section
   * - "project": Per-repo top stargazers on project pages
   * - "compact": Minimal avatar strip only
   */
  variant: 'homepage' | 'project' | 'compact';

  /** Maximum number of avatars to display */
  maxAvatars: number;

  /** Maximum number of companies to mention */
  maxCompanies: number;

  /** Show the stats line ("Starred by X developers...") */
  showStats: boolean;

  /** Show the company mentions line */
  showCompanies: boolean;
}

/**
 * Default display configurations for each variant.
 */
export const DISPLAY_DEFAULTS: Record<NotableStargazersDisplayConfig['variant'], Omit<NotableStargazersDisplayConfig, 'variant'>> = {
  homepage: {
    maxAvatars: 8,
    maxCompanies: 3,
    showStats: true,
    showCompanies: true,
  },
  project: {
    maxAvatars: 5,
    maxCompanies: 2,
    showStats: true,
    showCompanies: false,
  },
  compact: {
    maxAvatars: 5,
    maxCompanies: 0,
    showStats: false,
    showCompanies: false,
  },
};

/**
 * Thresholds for considering a stargazer a "legend" worth highlighting.
 * We only show truly notable developers - not just active GitHub users.
 *
 * A stargazer qualifies if they meet EITHER threshold:
 * - 5,000+ followers (significant personal brand/recognition)
 * - 30,000+ total stars across repos (created something massive)
 *
 * This is intentionally strict - better to show nobody than to show
 * random people as if they're famous.
 */
export const LEGEND_FOLLOWERS_THRESHOLD = 5000;
export const LEGEND_STARS_THRESHOLD = 30000;

/**
 * @deprecated Use LEGEND_FOLLOWERS_THRESHOLD and LEGEND_STARS_THRESHOLD instead
 */
export const NOTABLE_SCORE_THRESHOLD = 500;

/**
 * Type guard to check if data is valid StargazerIntelligence.
 */
export function isValidStargazerIntelligence(data: unknown): data is StargazerIntelligence {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.totalUniqueStargazers === 'number' &&
    typeof d.combinedReach === 'number' &&
    Array.isArray(d.topStargazers) &&
    Array.isArray(d.topCompanies) &&
    typeof d.byRepo === 'object' &&
    typeof d.lastUpdated === 'string'
  );
}

/**
 * Check if the stargazer data is stale (older than specified days).
 * Used to show "Updated X ago" warning.
 */
export function isDataStale(lastUpdated: string, maxAgeDays: number = 7): boolean {
  const updateDate = new Date(lastUpdated);
  const now = new Date();
  const diffMs = now.getTime() - updateDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays > maxAgeDays;
}

/**
 * Format a number for display (e.g., 1234567 -> "1.2M").
 * Re-exported from github-stats for convenience.
 */
export function formatReach(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(num >= 10_000 ? 0 : 1)}K`;
  }
  return num.toString();
}
