import { siteConfig } from "@/lib/content";
import { formatStarCount } from "@/lib/format-stars";

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

interface GitHubUser {
  public_repos: number;
  followers: number;
}

interface GitHubRepo {
  stargazers_count: number;
  fork?: boolean;
}

const GITHUB_USERNAME = siteConfig.social.github.split("/").filter(Boolean).pop() || "Dicklesworthstone";

/**
 * Fetch total star count and other stats from GitHub API.
 * Uses caching to avoid rate limits.
 */
export async function fetchGitHubStats(): Promise<GitHubStats | null> {
  const now = Date.now();

  if (!process.env.GITHUB_TOKEN) {
    console.warn("GITHUB_TOKEN not found. Skipping live GitHub stats fetch.");
    return null;
  }

  try {
    // Fetch user data for follower count and repo count
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

    const userData = (await userResponse.json()) as GitHubUser;
    const publicRepos = userData.public_repos || 0;
    
    // Fetch repositories using Search API which is more efficient for star counting
    // We fetch non-fork repos for the user, up to 1000 repos (10 pages)
    const pages = Math.min(Math.ceil(publicRepos / 100), 10);
    const results = [];

    for (let i = 1; i <= pages; i++) {
      // Use search API which is more efficient
      const response = await fetch(
        `https://api.github.com/search/repositories?q=user:${GITHUB_USERNAME}+fork:false&per_page=100&page=${i}&sort=stars`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            ...(process.env.GITHUB_TOKEN && {
              Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            }),
          },
          next: { revalidate: 3600 },
          signal: AbortSignal.timeout(10000), // 10s timeout
        }
      );

      if (!response.ok) {
        const body = await response.text();
        console.warn(`[github-stats] Search API error on page ${i}: ${response.status} ${body}`);
        break; // Stop fetching more pages if we hit an error (likely rate limit)
      }

      const data = await response.json();
      results.push(data);

      // If we have more than one page, add a tiny delay to be nice to the Search API rate limit (30/min authenticated)
      if (pages > 1 && i < pages) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    let totalStars = 0;
    let repoCount = 0;

    for (const result of results) {
      if (!result.items) continue;
      for (const repo of result.items) {
        if (repo.fork) continue;
        totalStars += repo.stargazers_count || 0;
        repoCount++;
      }
    }

    return {
      totalStars,
      repoCount,
      followers: userData.followers || 0,
      fetchedAt: now,
    };
  } catch (error) {
    console.error("Failed to fetch GitHub stats:", error);
    return null;
  }
}

/**
 * Format number with K/M suffix for display.
 */
export function formatNumber(num: number): string {
  return formatStarCount(num);
}

/**
 * Get formatted stats string like "10.2K+ stars"
 */
export function formatStarsDisplay(totalStars: number): string {
  return `${formatStarCount(totalStars)}+`;
}

export default fetchGitHubStats;
