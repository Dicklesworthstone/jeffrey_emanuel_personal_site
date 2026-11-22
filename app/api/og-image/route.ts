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

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MiB max per image
const UPSTREAM_TIMEOUT_MS = 8000; // Don't let a slow upstream hold the lambda open

const FETCH_HEADERS: HeadersInit = {
  "User-Agent": "OpenAI File Downloader, XaiImageApiFetch/1.0",
  "Accept": "image/*",
};

class ImageTooLargeError extends Error {
  constructor() {
    super("Image exceeds maximum allowed size");
    this.name = "ImageTooLargeError";
  }
}

function parseContentLength(headerValue: string | null): number | null {
  if (headerValue === null) {
    return null;
  }
  const trimmed = headerValue.trim();
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
}

async function cancelResponseBody(response: Response): Promise<void> {
  if (!response.body) {
    return;
  }
  try {
    await response.body.cancel();
  } catch {
    // Ignore cancellation failures so the caller's HTTP status is preserved.
  }
}

async function readBoundedImageBody(
  response: Response,
  maxBytes: number
): Promise<Uint8Array<ArrayBuffer>> {
  if (!response.body) {
    return new Uint8Array(0);
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      if (!value || value.byteLength === 0) {
        continue;
      }
      if (value.byteLength > maxBytes - totalBytes) {
        try {
          await reader.cancel("Image exceeds maximum allowed size");
        } catch {
          // Preserve 413 response even if stream cancellation rejects.
        }
        throw new ImageTooLargeError();
      }
      chunks.push(value);
      totalBytes += value.byteLength;
    }
  } finally {
    reader.releaseLock();
  }

  if (totalBytes === 0) {
    return new Uint8Array(0);
  }

  if (
    chunks.length === 1 &&
    chunks[0].buffer instanceof ArrayBuffer &&
    chunks[0].byteOffset === 0 &&
    chunks[0].byteLength === chunks[0].buffer.byteLength
  ) {
    return chunks[0] as Uint8Array<ArrayBuffer>;
  }

  const combined = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return combined;
}

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
      await cancelResponseBody(response);
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
      await cancelResponseBody(response);
      return NextResponse.json({ error: "Upstream image fetch failed" }, { status: 502 });
    }

    // Verify final URL after redirects
    const finalUrl = new URL(response.url);
    if (!["https:", "http:"].includes(finalUrl.protocol) || !isAllowedOgHost(finalUrl.hostname)) {
      await cancelResponseBody(response);
      return NextResponse.json({ error: "Final redirect domain not allowed" }, { status: 403 });
    }

    const contentType = response.headers.get("content-type") || "image/png";

    // Only cache actual images
    if (!contentType.startsWith("image/")) {
      await cancelResponseBody(response);
      return NextResponse.json({ error: "Content is not an image" }, { status: 400 });
    }

    const declaredLength = parseContentLength(response.headers.get("content-length"));
    if (declaredLength !== null && declaredLength > MAX_IMAGE_SIZE) {
      await cancelResponseBody(response);
      throw new ImageTooLargeError();
    }

    const imageBytes = await readBoundedImageBody(response, MAX_IMAGE_SIZE);

    return new NextResponse(imageBytes, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    if (error instanceof ImageTooLargeError) {
      return NextResponse.json({ error: "Image too large" }, { status: 413 });
    }
    // Log the detail server-side; never echo upstream error text to the client.
    console.error("OG image fetch error:", error);
    const timedOut =
      (error instanceof Error || error instanceof DOMException) && error.name === "TimeoutError";
    return NextResponse.json(
      { error: timedOut ? "Upstream image fetch timed out" : "Failed to fetch image" },
      { status: timedOut ? 504 : 502 }
    );
  }
}
