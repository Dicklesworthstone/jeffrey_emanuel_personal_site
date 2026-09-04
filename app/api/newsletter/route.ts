import { NextResponse } from "next/server";

/**
 * Same-origin newsletter subscribe proxy.
 *
 * The client used to POST straight to Buttondown's embed endpoint, which is
 * designed for a full-page form submission and never answers XHR with CORS
 * headers — so the fetch rejected and the UI reported a network failure even
 * when the subscription had gone through. Routing through this handler gives
 * the browser a same-origin response with an honest status code.
 *
 * Requires BUTTONDOWN_API_KEY (Buttondown → Settings → API). Without it the
 * route answers 503 so the UI can point visitors at direct email instead of
 * pretending a signup happened.
 */

export const runtime = "nodejs";

const BUTTONDOWN_SUBSCRIBERS_URL = "https://api.buttondown.com/v1/subscribers";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UPSTREAM_TIMEOUT_MS = 10_000;

interface SubscribeBody {
  email?: unknown;
}

export async function POST(request: Request) {
  const apiKey = process.env.BUTTONDOWN_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "newsletter_not_configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  let body: SubscribeBody;
  try {
    body = (await request.json()) as SubscribeBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "invalid_email" }, { status: 422 });
  }

  try {
    const upstream = await fetch(BUTTONDOWN_SUBSCRIBERS_URL, {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email_address: email, tags: ["site"] }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      cache: "no-store",
    });

    if (upstream.ok) {
      return NextResponse.json({ ok: true }, { status: 200, headers: { "Cache-Control": "no-store" } });
    }

    // Buttondown reports validation problems as 400 with a `code` field.
    const detail = (await upstream.json().catch(() => null)) as { code?: string } | null;
    const code = detail?.code ?? "";
    if (upstream.status === 400 && /already|exists|subscribed/i.test(code)) {
      return NextResponse.json({ error: "already_subscribed" }, { status: 409 });
    }
    if (upstream.status === 400 || upstream.status === 422) {
      return NextResponse.json({ error: "invalid_email" }, { status: 422 });
    }
    if (upstream.status === 429) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
    return NextResponse.json({ error: "upstream_error" }, { status: 502 });
  } catch {
    return NextResponse.json({ error: "upstream_unreachable" }, { status: 502 });
  }
}
