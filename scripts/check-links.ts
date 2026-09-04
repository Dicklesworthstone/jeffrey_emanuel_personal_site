/**
 * Link-rot check for the outbound URLs the site vouches for.
 * Run with: bun run check:links
 *
 * Checks every liveDemos / featuredSites URL and every endorsement source URL
 * from lib/content.ts with a HEAD request (falling back to GET when a host
 * answers 405), prints a table, and exits 1 if any link returns 4xx/5xx or
 * fails at the network level. Runs weekly via .github/workflows/link-check.yml.
 *
 * Environment variables:
 * - LINK_CHECK_TIMEOUT_MS: Per-request timeout (default 10000)
 */

import { endorsements, featuredSites, liveDemos } from "../lib/content";

const TIMEOUT_MS = Number(process.env.LINK_CHECK_TIMEOUT_MS) || 10_000;
const USER_AGENT = "OpenAI File Downloader, XaiImageApiFetch/1.0";

/**
 * Hosts that answer automated requests with 403 regardless of whether the
 * page exists (X, Bloomberg, Medium all front-door bots). A 403 from one of
 * these is reported as WARN — "could not verify" — rather than a failure, so
 * the weekly run only goes red for links that are actually dead.
 */
const BOT_BLOCKED_HOSTS = ["x.com", "twitter.com", "bloomberg.com", "medium.com"];

function isBotBlockedHost(url: string): boolean {
  const host = new URL(url).hostname.replace(/^www\./, "");
  return BOT_BLOCKED_HOSTS.some((blocked) => host === blocked || host.endsWith(`.${blocked}`));
}

interface LinkTarget {
  source: string;
  label: string;
  url: string;
}

interface LinkResult extends LinkTarget {
  status: number | null;
  method: "HEAD" | "GET";
  ok: boolean;
  /** 403 from a known bot-blocking host: unverifiable, not a failure. */
  unverified: boolean;
  note: string;
  ms: number;
}

function collectTargets(): LinkTarget[] {
  const targets: LinkTarget[] = [
    ...liveDemos.map((demo) => ({ source: "liveDemos", label: demo.id, url: demo.url })),
    ...featuredSites.map((site) => ({ source: "featuredSites", label: site.id, url: site.url })),
    ...endorsements.flatMap((endorsement) =>
      endorsement.source.url
        ? [{ source: "endorsements", label: endorsement.id, url: endorsement.source.url }]
        : []
    ),
  ];

  // De-duplicate by URL so a site listed twice is only fetched once.
  const seen = new Set<string>();
  return targets.filter((target) => {
    if (seen.has(target.url)) return false;
    seen.add(target.url);
    return true;
  });
}

async function request(url: string, method: "HEAD" | "GET"): Promise<Response> {
  return fetch(url, {
    method,
    redirect: "follow",
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}

async function checkLink(target: LinkTarget): Promise<LinkResult> {
  const started = performance.now();
  let method: "HEAD" | "GET" = "HEAD";
  try {
    let response = await request(target.url, "HEAD");
    if (response.status === 405) {
      method = "GET";
      response = await request(target.url, "GET");
    }
    // Drain the body so the socket is released (GET fallback in particular).
    await response.arrayBuffer().catch(() => undefined);
    const ok = response.status < 400;
    const unverified = !ok && response.status === 403 && isBotBlockedHost(target.url);
    return {
      ...target,
      status: response.status,
      method,
      ok,
      unverified,
      note: ok
        ? ""
        : unverified
          ? "403 from a bot-blocking host; verify by hand"
          : response.statusText || "HTTP error",
      ms: Math.round(performance.now() - started),
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.name === "TimeoutError"
          ? `timeout after ${TIMEOUT_MS}ms`
          : error.message
        : String(error);
    return {
      ...target,
      status: null,
      method,
      ok: false,
      unverified: false,
      note: message,
      ms: Math.round(performance.now() - started),
    };
  }
}

function printTable(results: LinkResult[]) {
  const rows = results.map((r) => ({
    status: r.ok ? "OK" : r.unverified ? "WARN" : "FAIL",
    code: r.status === null ? "---" : String(r.status),
    method: r.method,
    ms: `${r.ms}ms`,
    source: r.source,
    label: r.label,
    url: r.url,
    note: r.note,
  }));
  const columns: (keyof (typeof rows)[number])[] = [
    "status",
    "code",
    "method",
    "ms",
    "source",
    "label",
    "url",
    "note",
  ];
  const widths = columns.map((column) =>
    Math.max(column.length, ...rows.map((row) => row[column].length))
  );
  const line = (cells: string[]) =>
    cells.map((cell, i) => cell.padEnd(widths[i])).join("  ").trimEnd();

  console.log(line(columns.map((c) => c.toUpperCase())));
  console.log(line(widths.map((w) => "-".repeat(w))));
  for (const row of rows) {
    console.log(line(columns.map((column) => row[column])));
  }
}

async function main() {
  const targets = collectTargets();
  console.log(`[LINKS] Checking ${targets.length} URLs (timeout ${TIMEOUT_MS}ms each)...\n`);

  // Modest concurrency: enough to finish quickly, low enough not to trip rate limits.
  const CONCURRENCY = 6;
  const results: LinkResult[] = new Array(targets.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, targets.length) }, async () => {
      while (next < targets.length) {
        const index = next++;
        results[index] = await checkLink(targets[index]);
      }
    })
  );

  printTable(results);

  const failures = results.filter((r) => !r.ok && !r.unverified);
  const warnings = results.filter((r) => r.unverified);
  console.log(
    `\n[LINKS] ${results.length - failures.length - warnings.length}/${results.length} OK` +
      (warnings.length ? `, ${warnings.length} unverified (bot-blocked 403)` : "") +
      (failures.length ? `, ${failures.length} failed` : "")
  );
  if (failures.length > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("[LINKS] Unexpected error:", error);
  process.exit(1);
});
