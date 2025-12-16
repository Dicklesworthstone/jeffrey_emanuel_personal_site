/**
 * Fetch GitHub statistics for a user.
 * Aggregates star counts across all public repositories.
 */

export interface GitHubStats {
  totalStars: number;
  repoCount: number;
  followers: number;
  fetchedAt: number;
}

const GITHUB_USERNAME = "Dicklesworthstone";
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

// In-memory cache
let cachedStats: GitHubStats | null = null;
let lastFetchTime = 0;

/**
 * Fetch total star count and other stats from GitHub API.
 * Uses caching to avoid rate limits.
 */
export async function fetchGitHubStats(): Promise<GitHubStats> {
  const now = Date.now();

  // Return cached data if still valid
  if (cachedStats && now - lastFetchTime < CACHE_DURATION) {
    return cachedStats;
  }

  try {
    // Fetch user data for follower count
    const userResponse = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          // Add GitHub token if available in environment
          ...(process.env.GITHUB_TOKEN && {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          }),
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!userResponse.ok) {
      throw new Error(`GitHub API error: ${userResponse.status}`);
    }

    const userData = await userResponse.json();

    // Fetch repositories (paginated, max 100 per page)
    let totalStars = 0;
    let repoCount = 0;
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const reposResponse = await fetch(
        `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&page=${page}&sort=updated`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            ...(process.env.GITHUB_TOKEN && {
              Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            }),
          },
          next: { revalidate: 3600 },
        }
      );

      if (!reposResponse.ok) {
        throw new Error(`GitHub API error: ${reposResponse.status}`);
      }

      const repos = await reposResponse.json();

      if (repos.length === 0) {
        hasMore = false;
      } else {
        for (const repo of repos) {
          totalStars += repo.stargazers_count || 0;
          repoCount++;
        }
        page++;

        // Safety limit to prevent infinite loops
        if (page > 10) {
          hasMore = false;
        }
      }
    }

    const stats: GitHubStats = {
      totalStars,
      repoCount,
      followers: userData.followers || 0,
      fetchedAt: now,
    };

    // Update cache
    cachedStats = stats;
    lastFetchTime = now;

    return stats;
  } catch (error) {
    console.error("Failed to fetch GitHub stats:", error);

    // Return fallback data if available, otherwise return defaults
    if (cachedStats) {
      return cachedStats;
    }

    return {
      totalStars: 10000, // Fallback from static content
      repoCount: 30,
      followers: 500,
      fetchedAt: now,
    };
  }
}

/**
 * Format number with K/M suffix for display.
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}K`;
  }
  return num.toString();
}

/**
 * Get formatted stats string like "10.2K+ stars"
 */
export function formatStarsDisplay(totalStars: number): string {
  return `${formatNumber(totalStars)}+`;
}

export default fetchGitHubStats;
