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
}

const GITHUB_USERNAME = "Dicklesworthstone";

/**
 * Fetch total star count and other stats from GitHub API.
 * Uses caching to avoid rate limits.
 */
export async function fetchGitHubStats(): Promise<GitHubStats> {
  const now = Date.now();

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
    // Cap at 5 pages (500 repos) to avoid rate limits and timeouts
    const pages = Math.min(Math.ceil(publicRepos / 100), 5);

    // Fetch repositories in parallel
    const pagePromises = [];
    for (let i = 1; i <= pages; i++) {
      pagePromises.push(
        fetch(
          `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&page=${i}&sort=updated`,
          {
            headers: {
              Accept: "application/vnd.github.v3+json",
              ...(process.env.GITHUB_TOKEN && {
                Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
              }),
            },
            next: { revalidate: 3600 },
          }
        ).then((res) => {
          if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
          return res.json() as Promise<GitHubRepo[]>;
        })
      );
    }

    const results = await Promise.all(pagePromises);
    
    let totalStars = 0;
    let repoCount = 0;

    for (const repos of results) {
      for (const repo of repos) {
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
