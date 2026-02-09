import { NextRequest, NextResponse } from "next/server";

// Simple in-memory cache for OG images
const imageCache = new Map<string, { data: ArrayBuffer; contentType: string; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 20; // Reduced to 20 to prevent memory pressure in lambda
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB max per image

// Allowed domains for security (including www subdomains)
const ALLOWED_DOMAINS = [
  "jeffreysprompts.com",
  "www.jeffreysprompts.com",
  "agent-flywheel.com",
  "www.agent-flywheel.com",
  "brennerbot.org",
  "www.brennerbot.org",
];

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

  if (!ALLOWED_DOMAINS.includes(parsedUrl.hostname)) {
    return NextResponse.json({ error: "Domain not allowed" }, { status: 403 });
  }

  const headers: HeadersInit = {
    "User-Agent": "Mozilla/5.0 (compatible; JeffreySiteBot/1.0)",
    "Accept": "image/*",
  };

  async function fetchAllowedImage(initialUrl: string) {
    let currentUrl = initialUrl;
    const maxRedirects = 3;

    for (let i = 0; i <= maxRedirects; i += 1) {
      const response = await fetch(currentUrl, {
        headers,
        redirect: "manual",
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
        if (!ALLOWED_DOMAINS.includes(nextUrl.hostname)) {
          throw new Error("Redirect domain not allowed");
        }

        currentUrl = nextUrl.toString();
        continue;
      }

      return response;
    }

    throw new Error("Too many redirects");
  }

// Check cache
  const cacheKey = url;
  const cached = imageCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return new NextResponse(cached.data, {
      headers: {
        "Content-Type": cached.contentType,
        "Cache-Control": "public, max-age=86400, immutable",
        "X-Cache": "HIT",
      },
    });
  }

  // Fetch the image
  try {
    const response = await fetchAllowedImage(url);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.statusText}` },
        { status: 502 }
      );
    }

    // Verify final URL after redirects
    const finalUrl = new URL(response.url);
    if (!["https:", "http:"].includes(finalUrl.protocol) || !ALLOWED_DOMAINS.includes(finalUrl.hostname)) {
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

    // Cache the result
    imageCache.set(cacheKey, {
      data: arrayBuffer,
      contentType,
      timestamp: Date.now(),
    });

    // Clean up old cache entries to prevent unbounded growth
    if (imageCache.size > MAX_CACHE_SIZE) {
      const firstKey = imageCache.keys().next().value;
      if (firstKey) {
        imageCache.delete(firstKey);
      }
    }

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("OG image fetch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch image" },
      { status: 500 }
    );
  }
}
