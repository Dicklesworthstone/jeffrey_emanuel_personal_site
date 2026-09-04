import { NextRequest, NextResponse } from "next/server";
import { featuredSites } from "@/lib/content";

// Allowed domains for security (including www subdomains)
const STATIC_ALLOWED_DOMAINS = [
  "jeffreysprompts.com",
  "www.jeffreysprompts.com",
  "agent-flywheel.com",
  "www.agent-flywheel.com",
  "brennerbot.org",
  "www.brennerbot.org",
  "jeffreys-skills.md",
  "www.jeffreys-skills.md",
  "mcpagentmail.com",
  "www.mcpagentmail.com",
  "frankentui.com",
  "www.frankentui.com",
  "frankensqlite.com",
  "www.frankensqlite.com",
  "asupersync.com",
  "www.asupersync.com",
];

// Every featuredSites ogImage host is allowed too (plus its www/bare twin, matching
// the literal list above), so adding a site in lib/content.ts can't 403 its preview.
const ALLOWED_DOMAINS = new Set<string>(STATIC_ALLOWED_DOMAINS);
for (const site of featuredSites) {
  if (!site.ogImage) continue;
  try {
    const { hostname } = new URL(site.ogImage);
    ALLOWED_DOMAINS.add(hostname);
    ALLOWED_DOMAINS.add(hostname.startsWith("www.") ? hostname.slice(4) : `www.${hostname}`);
  } catch {
    // Malformed ogImage URLs are caught by the content validation tests.
  }
}

/** Exact-hostname allowlist check shared by the initial URL and every redirect hop. */
export function isAllowedOgHost(hostname: string): boolean {
  return ALLOWED_DOMAINS.has(hostname);
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB max per image
const UPSTREAM_TIMEOUT_MS = 8000; // Don't let a slow upstream hold the lambda open

const FETCH_HEADERS: HeadersInit = {
  "User-Agent": "OpenAI File Downloader, XaiImageApiFetch/1.0",
  "Accept": "image/*",
};

async function fetchAllowedImage(initialUrl: string) {
  let currentUrl = initialUrl;
  const maxRedirects = 3;

  for (let i = 0; i <= maxRedirects; i += 1) {
    const response = await fetch(currentUrl, {
      headers: FETCH_HEADERS,
      redirect: "manual",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) {
        throw new Error("Redirect without location");
      }

      const nextUrl = new URL(location, currentUrl);
      if (!["https:", "http:"].includes(nextUrl.protocol)) {
        throw new Error("Redirect protocol not allowed");
      }
      if (!isAllowedOgHost(nextUrl.hostname)) {
        throw new Error("Redirect domain not allowed");
      }

      currentUrl = nextUrl.toString();
      continue;
    }

    return response;
  }

  throw new Error("Too many redirects");
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  // Validate the URL domain and protocol
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (!["https:", "http:"].includes(parsedUrl.protocol)) {
    return NextResponse.json({ error: "Invalid URL protocol" }, { status: 400 });
  }

  if (!isAllowedOgHost(parsedUrl.hostname)) {
    return NextResponse.json({ error: "Domain not allowed" }, { status: 403 });
  }

  // Fetch the image
  try {
    const response = await fetchAllowedImage(url);

    if (!response.ok) {
      return NextResponse.json({ error: "Upstream image fetch failed" }, { status: 502 });
    }

    // Verify final URL after redirects
    const finalUrl = new URL(response.url);
    if (!["https:", "http:"].includes(finalUrl.protocol) || !isAllowedOgHost(finalUrl.hostname)) {
      return NextResponse.json({ error: "Final redirect domain not allowed" }, { status: 403 });
    }

    const contentType = response.headers.get("content-type") || "image/png";

    // Only cache actual images
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Content is not an image" }, { status: 400 });
    }

    const arrayBuffer = await response.arrayBuffer();
    
    if (arrayBuffer.byteLength > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "Image too large" }, { status: 413 });
    }

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    // Log the detail server-side; never echo upstream error text to the client.
    console.error("OG image fetch error:", error);
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    return NextResponse.json(
      { error: timedOut ? "Upstream image fetch timed out" : "Failed to fetch image" },
      { status: timedOut ? 504 : 502 }
    );
  }
}
