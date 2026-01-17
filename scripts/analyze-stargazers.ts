#!/usr/bin/env bun
/**
 * Multi-repo Stargazer Analysis Script
 *
 * Analyzes stargazers across Jeffrey's repositories and generates
 * aggregated intelligence data for the Notable Stargazers feature.
 *
 * Usage:
 *   GITHUB_TOKEN=xxx bun run scripts/analyze-stargazers.ts
 *
 * Output:
 *   lib/data/stargazer-intelligence.json
 *
 * @see Bead 8mq for requirements
 * @see lib/stargazer-types.ts for type definitions
 */

import { Octokit } from "@octokit/rest";
import * as fs from "fs";
import * as path from "path";
import type {
  NotableStargazer,
  StargazerIntelligence,
  RepoStargazerStats,
  CompanyCount,
} from "../lib/stargazer-types";
import {
  LEGEND_FOLLOWERS_THRESHOLD,
  LEGEND_STARS_THRESHOLD,
} from "../lib/stargazer-types";

// Helper to get username from content.ts without importing (avoiding build/module issues)
function getGitHubUsername(): string {
  try {
    const content = fs.readFileSync(path.join(process.cwd(), "lib/content.ts"), "utf-8");
    const match = content.match(/github:\s*["']https:\/\/github\.com\/([^"']+)["']/);
    return match ? match[1] : "Dicklesworthstone";
  } catch {
    return "Dicklesworthstone";
  }
}

// Configuration
const GITHUB_USERNAME = getGitHubUsername();
const MAX_USERS_TO_PROCESS = 1000;
const CONCURRENCY_LIMIT = 20;
const RATE_LIMIT_DELAY = 15000; // 15 seconds
const CACHE_FILE = ".stargazer-cache.json";
const OUTPUT_FILE = "lib/data/stargazer-intelligence.json";

// Repos to analyze - flywheel tools + other popular projects
const REPOS_TO_ANALYZE = [
  // Flywheel tools (agentic coding)
  "mcp_agent_mail",
  "beads_viewer",
  "cass_memory_system",
  "ultimate_bug_scanner",
  "ntm",
  "simultaneous_launch_button",
  "coding_agent_session_search",
  // Other major projects (high star count)
  "claude_code_agent_farm",
  "llm_aided_ocr",
  "swiss_army_llama",
  "your-source-to-prompt.html",
  "bulk_transcribe_youtube_videos_from_playlist",
  "sqlalchemy_data_model_visualizer",
  "visual_astar_python",
  "mindmap-generator",
  "ultimate_mcp_client",
  "ultimate_mcp_server",
  "fast_vector_similarity",
  "automatic_log_collector_and_analyzer",
  "model_guided_research",
];

// Cache structure
interface CacheData {
  users: Record<string, { data: RawUserData; timestamp: number }>;
  repos: Record<string, { stargazers: string[]; timestamp: number }>;
}

interface RawUserData {
  login: string;
  name: string | null;
  avatar_url: string;
  company: string | null;
  bio: string | null;
  followers: number;
  public_repos: number;
  public_gists: number;
}

interface _RepoData {
  stargazers_count: number;
}

let cache: CacheData = { users: {}, repos: {} };
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

// Load cache from disk
function loadCache(): void {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, "utf-8");
      cache = JSON.parse(data);
      console.log(`Loaded cache with ${Object.keys(cache.users).length} users`);
    }
  } catch (error) {
    console.warn("Could not load cache, starting fresh:", error);
    cache = { users: {}, repos: {} };
  }
}

// Save cache to disk
function saveCache(): void {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
    console.log(`Saved cache with ${Object.keys(cache.users).length} users`);
  } catch (error) {
    console.error("Could not save cache:", error);
  }
}

// Check if cache entry is valid
function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL;
}

// Calculate influence score
function calculateScore(
  totalStars: number,
  followers: number,
  contributions: number,
  recentActivity: number
): number {
  return (
    totalStars * 2.5 +
    followers * 2.0 +
    contributions * 0.1 +
    recentActivity * 0.1
  );
}

// Normalize company name
function normalizeCompany(company: string | null): string | undefined {
  if (!company) return undefined;
  // Strip @ prefix and trim
  return company.replace(/^@/, "").trim() || undefined;
}

// Rate limit handler with retry
async function withRateLimit<T>(
  fn: () => Promise<T>,
  retries: number = 3
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      if (err.status === 403 && err.message?.includes("rate limit")) {
        console.log(
          `Rate limit hit, waiting ${RATE_LIMIT_DELAY / 1000}s... (attempt ${i + 1}/${retries})`
        );
        await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY));
      } else if (err.status === 404) {
        // User not found, skip
        throw error;
      } else {
        throw error;
      }
    }
  }
  throw new Error("Max retries exceeded for rate limit");
}

// Fetch stargazers for a repo
async function fetchStargazers(
  octokit: Octokit,
  repo: string
): Promise<string[]> {
  const cacheKey = `${GITHUB_USERNAME}/${repo}`;

  // Check cache
  if (cache.repos[cacheKey] && isCacheValid(cache.repos[cacheKey].timestamp)) {
    console.log(`Using cached stargazers for ${repo}`);
    return cache.repos[cacheKey].stargazers;
  }

  console.log(`Fetching stargazers for ${repo}...`);
  const stargazers: string[] = [];

  try {
    const iterator = octokit.paginate.iterator(
      octokit.rest.activity.listStargazersForRepo,
      {
        owner: GITHUB_USERNAME,
        repo,
        per_page: 100,
      }
    );

    for await (const response of iterator) {
      for (const stargazer of response.data) {
        if (typeof stargazer === "object" && "login" in stargazer) {
          stargazers.push(stargazer.login);
        }
      }
      // Limit to prevent API exhaustion
      if (stargazers.length >= MAX_USERS_TO_PROCESS) {
        console.log(`Reached max users limit for ${repo}`);
        break;
      }
    }

    // Cache the result
    cache.repos[cacheKey] = {
      stargazers,
      timestamp: Date.now(),
    };

    console.log(`Found ${stargazers.length} stargazers for ${repo}`);
  } catch (error) {
    console.error(`Error fetching stargazers for ${repo}:`, error);
  }

  return stargazers;
}

// Fetch user details
async function fetchUserDetails(
  octokit: Octokit,
  login: string
): Promise<RawUserData | null> {
  // Check cache
  if (cache.users[login] && isCacheValid(cache.users[login].timestamp)) {
    return cache.users[login].data;
  }

  try {
    const [userResponse, reposResponse] = await Promise.all([
      withRateLimit(() => octokit.rest.users.getByUsername({ username: login })),
      withRateLimit(() =>
        octokit.rest.repos.listForUser({
          username: login,
          sort: "updated",
          direction: "desc",
          per_page: 100,
        })
      ),
    ]);

    // Calculate total stars across their repos
    const totalStars = reposResponse.data.reduce(
      (sum, repo) => sum + (repo.stargazers_count || 0),
      0
    );

    const userData: RawUserData = {
      login: userResponse.data.login,
      name: userResponse.data.name,
      avatar_url: userResponse.data.avatar_url,
      company: userResponse.data.company,
      bio: userResponse.data.bio,
      followers: userResponse.data.followers || 0,
      public_repos: userResponse.data.public_repos || 0,
      public_gists: userResponse.data.public_gists || 0,
    };

    // Store total stars in cache for score calculation
    (userData as RawUserData & { totalStars: number }).totalStars = totalStars;

    // Cache the result
    cache.users[login] = {
      data: userData,
      timestamp: Date.now(),
    };

    return userData;
  } catch (error) {
    console.error(`Error fetching user ${login}:`, error);
    return null;
  }
}

// Process user and create NotableStargazer object
function processUser(
  userData: RawUserData & { totalStars?: number },
  reposStarred: string[]
): NotableStargazer | null {
  const totalStars = userData.totalStars || 0;
  const followers = userData.followers || 0;
  const contributions = userData.public_repos + userData.public_gists;
  const recentActivity = 50; // Placeholder - would need events API for real value

  const score = calculateScore(
    totalStars,
    followers,
    contributions,
    recentActivity
  );

  // Only include "legends" - truly notable developers
  // Must have 5K+ followers OR 30K+ total stars
  const isLegend =
    followers >= LEGEND_FOLLOWERS_THRESHOLD ||
    totalStars >= LEGEND_STARS_THRESHOLD;

  if (!isLegend) {
    return null;
  }

  return {
    login: userData.login,
    name: userData.name || userData.login,
    avatarUrl: userData.avatar_url,
    company: normalizeCompany(userData.company),
    bio: userData.bio || undefined,
    score,
    followers: userData.followers,
    totalStars,
    reposStarred,
  };
}

// Aggregate company statistics
function aggregateCompanies(stargazers: NotableStargazer[]): CompanyCount[] {
  const companyCounts: Record<string, number> = {};

  for (const stargazer of stargazers) {
    if (stargazer.company) {
      companyCounts[stargazer.company] =
        (companyCounts[stargazer.company] || 0) + 1;
    }
  }

  return Object.entries(companyCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// Main analysis function
async function analyzeStargazers(): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error("Error: GITHUB_TOKEN environment variable is required");
    console.log("Usage: GITHUB_TOKEN=xxx bun run scripts/analyze-stargazers.ts");
    process.exit(1);
  }

  const octokit = new Octokit({ auth: token });
  loadCache();

  console.log(`\nAnalyzing stargazers for ${REPOS_TO_ANALYZE.length} repos...`);
  console.log(`Max users to process: ${MAX_USERS_TO_PROCESS}`);
  console.log(`Legend thresholds: ${LEGEND_FOLLOWERS_THRESHOLD}+ followers OR ${LEGEND_STARS_THRESHOLD}+ total stars\n`);

  // Collect all stargazers by repo
  const stargazersByRepo: Record<string, string[]> = {};
  const userToRepos: Record<string, string[]> = {};

  for (const repo of REPOS_TO_ANALYZE) {
    const stargazers = await fetchStargazers(octokit, repo);
    stargazersByRepo[repo] = stargazers;

    // Track which repos each user starred
    for (const login of stargazers) {
      if (!userToRepos[login]) {
        userToRepos[login] = [];
      }
      userToRepos[login].push(repo);
    }

    // Small delay between repos
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Get unique users
  const uniqueUsers = Object.keys(userToRepos);
  console.log(`\nFound ${uniqueUsers.length} unique stargazers across all repos`);

  // Fetch user details in batches
  const allStargazers: NotableStargazer[] = [];
  const usersToProcess = uniqueUsers.slice(0, MAX_USERS_TO_PROCESS);

  console.log(`Processing ${usersToProcess.length} users...\n`);

  for (let i = 0; i < usersToProcess.length; i += CONCURRENCY_LIMIT) {
    const batch = usersToProcess.slice(i, i + CONCURRENCY_LIMIT);
    const progress = Math.round((i / usersToProcess.length) * 100);
    console.log(
      `Processing batch ${Math.floor(i / CONCURRENCY_LIMIT) + 1}/${Math.ceil(usersToProcess.length / CONCURRENCY_LIMIT)} (${progress}%)`
    );

    const batchResults = await Promise.all(
      batch.map(async (login) => {
        const userData = await fetchUserDetails(octokit, login);
        if (!userData) return null;

        return processUser(
          userData as RawUserData & { totalStars: number },
          userToRepos[login]
        );
      })
    );

    allStargazers.push(...batchResults.filter((s): s is NotableStargazer => s !== null));

    // Save cache periodically
    if (i % (CONCURRENCY_LIMIT * 5) === 0) {
      saveCache();
    }

    // Delay between batches
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Sort by score
  allStargazers.sort((a, b) => b.score - a.score);

  console.log(`\nFound ${allStargazers.length} notable stargazers`);

  // Build per-repo stats
  const byRepo: Record<string, RepoStargazerStats> = {};

  for (const repo of REPOS_TO_ANALYZE) {
    const repoStargazers = allStargazers.filter((s) =>
      s.reposStarred.includes(repo)
    );
    const topCompanies = aggregateCompanies(repoStargazers)
      .slice(0, 5)
      .map((c) => c.name);

    byRepo[repo] = {
      totalCount: stargazersByRepo[repo].length,
      notableCount: repoStargazers.length,
      topStargazers: repoStargazers.slice(0, 10),
      topCompanies,
    };
  }

  // Build final intelligence object
  const intelligence: StargazerIntelligence = {
    totalUniqueStargazers: uniqueUsers.length,
    combinedReach: allStargazers.reduce((sum, s) => sum + s.followers, 0),
    topStargazers: allStargazers.slice(0, 100),
    topCompanies: aggregateCompanies(allStargazers).slice(0, 20),
    byRepo,
    lastUpdated: new Date().toISOString(),
  };

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write output
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(intelligence, null, 2));
  console.log(`\nWrote results to ${OUTPUT_FILE}`);

  // Save final cache
  saveCache();

  // Print summary
  console.log("\n=== Summary ===");
  console.log(`Total unique stargazers: ${intelligence.totalUniqueStargazers}`);
  console.log(`Notable stargazers: ${allStargazers.length}`);
  console.log(`Combined reach: ${intelligence.combinedReach.toLocaleString()}`);
  console.log(`Top companies: ${intelligence.topCompanies.slice(0, 5).map((c) => c.name).join(", ")}`);
  if (allStargazers.length > 0) {
    console.log(`Top stargazer: ${allStargazers[0].name} (score: ${Math.round(allStargazers[0].score).toLocaleString()})`);
  }
}

// Run the analysis
analyzeStargazers().catch((error) => {
  console.error("Analysis failed:", error);
  process.exit(1);
});
