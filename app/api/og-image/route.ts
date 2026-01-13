import { NextRequest, NextResponse } from "next/server";

// Simple in-memory cache for OG images
const imageCache = new Map<string, { data: ArrayBuffer; contentType: string; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

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

  // Validate the URL domain
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (!ALLOWED_DOMAINS.includes(parsedUrl.hostname)) {
    return NextResponse.json({ error: "Domain not allowed" }, { status: 403 });
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
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; JeffreySiteBot/1.0)",
        "Accept": "image/*",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "image/png";

    // Only cache images
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Not an image" }, { status: 400 });
    }

    const data = await response.arrayBuffer();

    // Cache the result
    imageCache.set(url, {
      data,
      contentType,
      timestamp: Date.now(),
    });

    // Clean up old cache entries (simple LRU-ish cleanup)
    if (imageCache.size > 50) {
      const oldestKey = imageCache.keys().next().value;
      if (oldestKey) imageCache.delete(oldestKey);
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
