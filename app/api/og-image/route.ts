import { NextRequest, NextResponse } from "next/server";

// Simple in-memory cache for OG images
const imageCache = new Map<string, { data: ArrayBuffer; contentType: string; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 50; // Maximum number of cached images
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB max per image

// Allowed domains for security
const ALLOWED_DOMAINS = [
  "jeffreysprompts.com",
  "agent-flywheel.com",
  "brennerbot.org",
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
  const cached = imageCache.get(url);
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
      // Don't leak upstream status codes - return generic error
      return NextResponse.json(
        { error: "Failed to fetch image" },
        { status: 502 }
      );
    }

    const contentType = response.headers.get("content-type") || "image/png";

    // Only cache images
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Not an image" }, { status: 400 });
    }

    const data = await response.arrayBuffer();

    // Reject oversized images to prevent memory exhaustion
    if (data.byteLength > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "Image too large" },
        { status: 413 }
      );
    }

    // Cache the result
    imageCache.set(url, {
      data,
      contentType,
      timestamp: Date.now(),
    });

    // Clean up old cache entries to prevent unbounded growth
    if (imageCache.size > MAX_CACHE_SIZE) {
      // Remove oldest entries until under limit
      const entries = Array.from(imageCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toRemove = entries.slice(0, imageCache.size - MAX_CACHE_SIZE + 1);
      for (const [key] of toRemove) {
        imageCache.delete(key);
      }
    }

    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("OG image fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 500 }
    );
  }
}
