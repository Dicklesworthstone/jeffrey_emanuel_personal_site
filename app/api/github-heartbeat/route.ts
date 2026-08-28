import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/content";

const GITHUB_USERNAME = siteConfig.social.github.split("/").filter(Boolean).pop() || "Dicklesworthstone";

// The route itself is never ISR-cached: a cached error would otherwise be
// served to every visitor for the whole revalidate window. Successful
// upstream responses are cached by the fetch data cache instead (below), so
// GitHub is still hit at most once per 5 minutes.
export const dynamic = "force-dynamic";

const UPSTREAM_REVALIDATE_SECONDS = 300;

const ERROR_HEADERS = { "Cache-Control": "no-store" } as const;

function errorResponse(message: string, status: number, extraHeaders?: Record<string, string>) {
  return NextResponse.json(
    { error: message },
    { status, headers: { ...ERROR_HEADERS, ...extraHeaders } }
  );
}

/**
 * GitHub signals rate limiting with 403 + `x-ratelimit-remaining: 0`
 * (secondary limits use 429). Both map to a 429 with a Retry-After derived
 * from `x-ratelimit-reset` (epoch seconds) so the client can back off.
 */
function rateLimitRetryAfterSeconds(response: Response): number | null {
  const remaining = response.headers.get("x-ratelimit-remaining");
  const isRateLimited =
    response.status === 429 || (response.status === 403 && remaining === "0");
  if (!isRateLimited) return null;

  const explicit = Number.parseInt(response.headers.get("retry-after") ?? "", 10);
  if (Number.isFinite(explicit) && explicit > 0) return explicit;

  const reset = Number.parseInt(response.headers.get("x-ratelimit-reset") ?? "", 10);
  if (Number.isFinite(reset) && reset > 0) {
    return Math.max(1, reset - Math.floor(Date.now() / 1000));
  }
  return 60;
}

export async function GET() {
  try {
    const headers: HeadersInit = {
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "jeffreyemanuel.com-heartbeat",
    };

    if (process.env.GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=30`,
      {
        headers,
        // Only 2xx responses enter the data cache, so an upstream failure
        // is retried on the next request instead of being pinned for 5 min.
        next: { revalidate: UPSTREAM_REVALIDATE_SECONDS },
        signal: AbortSignal.timeout(10_000),
      }
    );

    if (!response.ok) {
      const retryAfter = rateLimitRetryAfterSeconds(response);
      if (retryAfter !== null) {
        return errorResponse("Rate limited", 429, { "Retry-After": String(retryAfter) });
      }
      // Don't leak upstream status codes - return generic error
      return errorResponse("GitHub API unavailable", 502);
    }

    const events = await response.json();
    if (!Array.isArray(events)) {
      return errorResponse("GitHub API unavailable", 502);
    }

    // The upstream Date header survives the data cache, so it reflects when
    // GitHub actually served this payload rather than when we re-served it.
    const upstreamDate = Date.parse(response.headers.get("date") ?? "");
    const fetchedAt = new Date(Number.isFinite(upstreamDate) ? upstreamDate : Date.now()).toISOString();

    return NextResponse.json(
      { events, fetchedAt },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${UPSTREAM_REVALIDATE_SECONDS}, stale-while-revalidate=600`,
        },
      }
    );
  } catch (error) {
    console.error("Heartbeat fetch error:", error);
    return errorResponse("Failed to fetch GitHub events", 500);
  }
}
