/**
 * Fetch GitHub star counts for /tldr flywheel tools and cache as JSON.
 * Run with: bun run scripts/fetch-tldr-stars.ts
 *
 * Stars are written to lib/data/tldr-tool-stars.json and merged into
 * tldrFlywheelTools at import time. Hardcoded values in content.ts
 * serve as fallbacks when this data is unavailable.
 *
 * Environment variables:
 * - GITHUB_TOKEN: Optional, increases API rate limit from 60 to 5000/hr
 * - SKIP_STARS_UPDATE: Set to "true" to skip fetching
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";

const OUTPUT_FILE = join(process.cwd(), "lib/data/tldr-tool-stars.json");

// Tool ID → GitHub repo (owner/name)
const TOOL_REPOS: Record<string, string> = {
  mail: "Dicklesworthstone/mcp_agent_mail",
  bv: "Dicklesworthstone/beads_viewer",
  cass: "Dicklesworthstone/coding_agent_session_search",
  acfs: "Dicklesworthstone/agentic_coding_flywheel_setup",
  ubs: "Dicklesworthstone/ultimate_bug_scanner",
  dcg: "Dicklesworthstone/destructive_command_guard",
  ru: "Dicklesworthstone/repo_updater",
  cm: "Dicklesworthstone/cass_memory_system",
  ntm: "Dicklesworthstone/ntm",
  slb: "Dicklesworthstone/slb",
  giil: "Dicklesworthstone/giil",
  xf: "Dicklesworthstone/xf",
  s2p: "Dicklesworthstone/source_to_prompt_tui",
  ms: "Dicklesworthstone/meta_skill",
};

async function fetchRepoStars(repo: string): Promise<number | null> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "jeffreyemanuel.com-tldr-stars",
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(`https://api.github.com/repos/${repo}`, {
      headers,
    });

    if (!response.ok) {
      console.warn(`  [WARN] ${repo}: HTTP ${response.status}`);
      return null;
    }

    const data = (await response.json()) as { stargazers_count: number };
    return data.stargazers_count;
  } catch (error) {
    console.warn(`  [WARN] ${repo}: ${error}`);
    return null;
  }
}

async function main() {
  if (process.env.SKIP_STARS_UPDATE === "true") {
    console.log("[STARS] Skipping (SKIP_STARS_UPDATE=true)");
    return;
  }

  console.log("[STARS] Fetching star counts for /tldr tools...\n");

  // Load existing data as fallback
  let existing: Record<string, number> = {};
  try {
    existing = JSON.parse(readFileSync(OUTPUT_FILE, "utf-8"));
  } catch {
    // No existing file — first run
  }

  const results: Record<string, number> = {};

  for (const [toolId, repo] of Object.entries(TOOL_REPOS)) {
    const stars = await fetchRepoStars(repo);
    if (stars !== null) {
      results[toolId] = stars;
      console.log(`  ${toolId}: ${stars}`);
    } else if (existing[toolId] !== undefined) {
      results[toolId] = existing[toolId];
      console.log(`  ${toolId}: ${existing[toolId]} (cached)`);
    }
  }

  // Ensure output directory exists
  mkdirSync(dirname(OUTPUT_FILE), { recursive: true });
  writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2) + "\n");
  console.log(`\n[STARS] Written ${Object.keys(results).length} entries to ${OUTPUT_FILE}`);
}

main().catch(console.error);
