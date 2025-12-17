/**
 * Build-time stats updater
 *
 * This script fetches live stats and updates them at build time.
 * Run with: bun run scripts/update-stats.ts
 *
 * Stats sources:
 * - GitHub stars: Fetched from GitHub API (free, no auth needed for public repos)
 * - Twitter followers: Read from TWITTER_FOLLOWERS env var (API requires paid access)
 *
 * Environment variables:
 * - TWITTER_FOLLOWERS: Override Twitter follower count (e.g., "29K+")
 * - GITHUB_STARS: Override GitHub stars count (e.g., "10K+")
 * - SKIP_STATS_UPDATE: Set to "true" to skip stats fetching
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const GITHUB_USERNAME = "Dicklesworthstone";
const CONTENT_FILE = join(process.cwd(), "lib/content.ts");

interface RepoData {
  stargazers_count: number;
  fork: boolean;
}

async function fetchGitHubStars(): Promise<string | null> {
  try {
    console.log("Fetching GitHub stars...");

    // Fetch all repos (paginated)
    let page = 1;
    let totalStars = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(
        `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&page=${page}`,
        {
          headers: {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "jeffreyemanuel.com-stats-updater",
          },
        }
      );

      if (!response.ok) {
        console.error(`GitHub API error: ${response.status}`);
        return null;
      }

      const repos: RepoData[] = await response.json();

      if (repos.length === 0) {
        hasMore = false;
      } else {
        // Only count non-forked repos
        const pageStars = repos
          .filter((repo) => !repo.fork)
          .reduce((sum, repo) => sum + repo.stargazers_count, 0);
        totalStars += pageStars;
        page++;
      }
    }

    console.log(`Total GitHub stars: ${totalStars}`);

    // Format the number
    if (totalStars >= 1000) {
      const k = Math.floor(totalStars / 1000);
      return `${k}K+`;
    }
    return `${totalStars}+`;
  } catch (error) {
    console.error("Error fetching GitHub stars:", error);
    return null;
  }
}

function updateContentFile(stats: { githubStars?: string; twitterFollowers?: string }) {
  let content = readFileSync(CONTENT_FILE, "utf-8");
  let updated = false;

  if (stats.githubStars) {
    const githubRegex = /(label:\s*"GitHub Stars",\s*\n\s*value:\s*)"[^"]+"/;
    if (githubRegex.test(content)) {
      content = content.replace(githubRegex, `$1"${stats.githubStars}"`);
      console.log(`Updated GitHub Stars to: ${stats.githubStars}`);
      updated = true;
    }
  }

  if (stats.twitterFollowers) {
    const twitterRegex = /(label:\s*"Audience on X",\s*\n\s*value:\s*)"[^"]+"/;
    if (twitterRegex.test(content)) {
      content = content.replace(twitterRegex, `$1"${stats.twitterFollowers}"`);
      console.log(`Updated Twitter followers to: ${stats.twitterFollowers}`);
      updated = true;
    }
  }

  if (updated) {
    writeFileSync(CONTENT_FILE, content);
    console.log("Content file updated successfully!");
  } else {
    console.log("No updates made to content file.");
  }
}

async function main() {
  if (process.env.SKIP_STATS_UPDATE === "true") {
    console.log("Skipping stats update (SKIP_STATS_UPDATE=true)");
    return;
  }

  console.log("Starting stats update...\n");

  const stats: { githubStars?: string; twitterFollowers?: string } = {};

  // GitHub stars - fetch from API or use env var
  if (process.env.GITHUB_STARS) {
    stats.githubStars = process.env.GITHUB_STARS;
    console.log(`Using GITHUB_STARS env var: ${stats.githubStars}`);
  } else {
    const fetchedStars = await fetchGitHubStars();
    if (fetchedStars) {
      stats.githubStars = fetchedStars;
    }
  }

  // Twitter followers - env var only (API requires paid access)
  if (process.env.TWITTER_FOLLOWERS) {
    stats.twitterFollowers = process.env.TWITTER_FOLLOWERS;
    console.log(`Using TWITTER_FOLLOWERS env var: ${stats.twitterFollowers}`);
  }

  // Update the content file
  if (stats.githubStars || stats.twitterFollowers) {
    updateContentFile(stats);
  } else {
    console.log("No stats to update.");
  }

  console.log("\nStats update complete!");
}

main().catch(console.error);
