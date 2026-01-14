import { NextResponse } from "next/server";

const GITHUB_USERNAME = "Dicklesworthstone";

// Cache for 5 minutes
export const revalidate = 300;

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
      { headers }
    );

    if (!response.ok) {
      // If rate limited or error, try to return valid error
      return NextResponse.json(
        { error: `GitHub API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Heartbeat fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch GitHub events" },
      { status: 500 }
    );
  }
}
