import { createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/og-image/route";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_URL = "https://jeffreysprompts.com/opengraph-image.png";

function makeRequest(targetUrl: string): NextRequest {
  const reqUrl = new URL("https://jeffreyemanuel.com/api/og-image");
  reqUrl.searchParams.set("url", targetUrl);
  return new NextRequest(reqUrl);
}

function withResponseUrl(response: Response, url: string): Response {
  Object.defineProperty(response, "url", { value: url, configurable: true });
  return response;
}

function makeStreamingResponse(options: {
  url?: string;
  status?: number;
  contentType?: string;
  contentLength?: string | null;
  chunkSize: number;
  totalChunks: number;
  cancelRejects?: boolean;
  onPull?: (pullIndex: number, bytesProduced: number) => void;
  onCancel?: (reason?: unknown) => void;
}): {
  response: Response;
  getBytesProduced: () => number;
  getPullCount: () => number;
  wasCancelled: () => boolean;
} {
  let pulls = 0;
  let bytesProduced = 0;
  let cancelled = false;

  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (pulls >= options.totalChunks) {
        controller.close();
        return;
      }
      const chunk = new Uint8Array(options.chunkSize);
      chunk.fill((pulls + 1) & 0xff);
      pulls += 1;
      bytesProduced += chunk.byteLength;
      options.onPull?.(pulls, bytesProduced);
      controller.enqueue(chunk);
    },
    cancel(reason) {
      cancelled = true;
      options.onCancel?.(reason);
      if (options.cancelRejects) {
        return Promise.reject(new Error("simulated cancel rejection"));
      }
      return undefined;
    },
  });

  const headers = new Headers();
  if (options.contentType !== undefined) {
    headers.set("content-type", options.contentType);
  } else {
    headers.set("content-type", "image/png");
  }
  if (options.contentLength !== undefined && options.contentLength !== null) {
    headers.set("content-length", options.contentLength);
  }

  const response = withResponseUrl(
    new Response(stream, {
      status: options.status ?? 200,
      headers,
    }),
    options.url ?? ALLOWED_URL
  );

  return {
    response,
    getBytesProduced: () => bytesProduced,
    getPullCount: () => pulls,
    wasCancelled: () => cancelled,
  };
}

describe("OG image proxy (/api/og-image) streaming size bound (#3)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("preserves exact bytes, content-type, and cache headers for normal PNG/JPEG images", async () => {
    const payload = new Uint8Array(4096);
    for (let i = 0; i < payload.length; i += 1) {
      payload[i] = (i * 31 + 7) & 0xff;
    }
    const expectedSha = createHash("sha256").update(payload).digest("hex");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      withResponseUrl(
        new Response(payload, {
          status: 200,
          headers: {
            "content-type": "image/jpeg",
            "content-length": String(payload.byteLength),
          },
        }),
        ALLOWED_URL
      )
    );

    const res = await GET(makeRequest(ALLOWED_URL));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/jpeg");
    expect(res.headers.get("cache-control")).toBe(
      "public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400"
    );

    const body = new Uint8Array(await res.arrayBuffer());
    expect(body.byteLength).toBe(payload.byteLength);
    expect(createHash("sha256").update(body).digest("hex")).toBe(expectedSha);
  });

  it("accepts a streamed image of exactly 5 MiB (boundary)", async () => {
    const chunkSize = 256 * 1024;
    const totalChunks = MAX_IMAGE_SIZE / chunkSize; // exact 5 MiB
    const fixture = makeStreamingResponse({
      chunkSize,
      totalChunks,
    });

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(fixture.response);

    const res = await GET(makeRequest(ALLOWED_URL));
    expect(res.status).toBe(200);
    const body = new Uint8Array(await res.arrayBuffer());
    expect(body.byteLength).toBe(MAX_IMAGE_SIZE);
    expect(fixture.wasCancelled()).toBe(false);
  });

  it("rejects early with 413 and cancels body when Content-Length exceeds 5 MiB", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const fixture = makeStreamingResponse({
      chunkSize: 256 * 1024,
      totalChunks: 40, // 10 MiB if pulled
      contentLength: String(MAX_IMAGE_SIZE + 1),
    });

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(fixture.response);

    const res = await GET(makeRequest(ALLOWED_URL));
    expect(res.status).toBe(413);
    expect(await res.json()).toEqual({ error: "Image too large" });
    expect(fixture.wasCancelled()).toBe(true);
    // Must reject before pulling the 10 MiB body
    expect(fixture.getBytesProduced()).toBeLessThanOrEqual(256 * 1024);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("aborts and cancels chunked/unknown-length streams as soon as cumulative bytes exceed 5 MiB", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const chunkSize = 256 * 1024; // 256 KiB chunks
    const fixture = makeStreamingResponse({
      chunkSize,
      totalChunks: 128, // 32 MiB if fully buffered
      contentLength: null,
    });

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(fixture.response);

    const res = await GET(makeRequest(ALLOWED_URL));
    expect(res.status).toBe(413);
    expect(await res.json()).toEqual({ error: "Image too large" });
    expect(fixture.wasCancelled()).toBe(true);
    // Should stop right after crossing 5 MiB (allow at most 2 buffered chunks from ReadableStream queue)
    expect(fixture.getBytesProduced()).toBeLessThanOrEqual(MAX_IMAGE_SIZE + chunkSize * 2);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("enforces actual byte limit even when Content-Length lies and claims a tiny size", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const chunkSize = 256 * 1024;
    const fixture = makeStreamingResponse({
      chunkSize,
      totalChunks: 128, // 32 MiB actual stream
      contentLength: "1024", // Deceptively small declared length
    });

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(fixture.response);

    const res = await GET(makeRequest(ALLOWED_URL));
    expect(res.status).toBe(413);
    expect(await res.json()).toEqual({ error: "Image too large" });
    expect(fixture.wasCancelled()).toBe(true);
    expect(fixture.getBytesProduced()).toBeLessThanOrEqual(MAX_IMAGE_SIZE + chunkSize * 2);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("falls back to byte counting for invalid Content-Length values", async () => {
    for (const invalidHeader of ["-1", "abc", "1024, 1024", "1024bytes", ""]) {
      const payload = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        withResponseUrl(
          new Response(payload, {
            status: 200,
            headers: {
              "content-type": "image/png",
              "content-length": invalidHeader,
            },
          }),
          ALLOWED_URL
        )
      );

      const res = await GET(makeRequest(ALLOWED_URL));
      expect(res.status).toBe(200);
      expect(new Uint8Array(await res.arrayBuffer())).toEqual(payload);
    }
  });

  it("preserves 413 response even if stream cancellation rejects on overflow", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const chunkSize = 512 * 1024;
    const fixture = makeStreamingResponse({
      chunkSize,
      totalChunks: 32,
      cancelRejects: true,
    });

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(fixture.response);

    const res = await GET(makeRequest(ALLOWED_URL));
    expect(res.status).toBe(413);
    expect(await res.json()).toEqual({ error: "Image too large" });
    expect(fixture.wasCancelled()).toBe(true);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("preserves empty-body behavior without error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      withResponseUrl(
        new Response(null, {
          status: 200,
          headers: { "content-type": "image/png" },
        }),
        ALLOWED_URL
      )
    );

    const res = await GET(makeRequest(ALLOWED_URL));
    expect(res.status).toBe(200);
    expect((await res.arrayBuffer()).byteLength).toBe(0);
  });

  it("preserves 504 timeout and 502 upstream/stream error distinctions", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const timeoutErr = new Error("The operation was aborted due to timeout");
    timeoutErr.name = "TimeoutError";
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(timeoutErr);

    const timeoutRes = await GET(makeRequest(ALLOWED_URL));
    expect(timeoutRes.status).toBe(504);
    expect(await timeoutRes.json()).toEqual({ error: "Upstream image fetch timed out" });

    const brokenStream = new ReadableStream<Uint8Array>({
      pull(controller) {
        controller.error(new Error("upstream reset"));
      },
    });
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      withResponseUrl(
        new Response(brokenStream, {
          status: 200,
          headers: { "content-type": "image/png" },
        }),
        ALLOWED_URL
      )
    );

    const streamErrRes = await GET(makeRequest(ALLOWED_URL));
    expect(streamErrRes.status).toBe(502);
    expect(await streamErrRes.json()).toEqual({ error: "Failed to fetch image" });
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("preserves host allowlist, redirect checks, and non-image rejection", async () => {
    const forbidden = await GET(makeRequest("https://evil.example/og.png"));
    expect(forbidden.status).toBe(403);

    const nonImage = makeStreamingResponse({
      chunkSize: 64,
      totalChunks: 4,
      contentType: "text/html",
    });
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(nonImage.response);
    const nonImageRes = await GET(makeRequest(ALLOWED_URL));
    expect(nonImageRes.status).toBe(400);
    expect(nonImage.wasCancelled()).toBe(true);

    // Allowed redirect hop -> 200
    const redirectRes = new Response(null, {
      status: 302,
      headers: { location: "https://www.jeffreysprompts.com/og-final.png" },
    });
    const finalPayload = new Uint8Array([1, 2, 3, 4]);
    const finalRes = withResponseUrl(
      new Response(finalPayload, {
        status: 200,
        headers: { "content-type": "image/png" },
      }),
      "https://www.jeffreysprompts.com/og-final.png"
    );
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(redirectRes)
      .mockResolvedValueOnce(finalRes);

    const okRedirect = await GET(makeRequest(ALLOWED_URL));
    expect(okRedirect.status).toBe(200);
    expect(new Uint8Array(await okRedirect.arrayBuffer())).toEqual(finalPayload);

    // Forbidden redirect destination -> 502 (rejected)
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(null, {
        status: 302,
        headers: { location: "https://evil.example/steal.png" },
      })
    );
    const badRedirect = await GET(makeRequest(ALLOWED_URL));
    expect(badRedirect.status).toBe(502);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("bounds accumulated reads across concurrent oversized requests", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const chunkSize = 256 * 1024;
    const fixtures = Array.from({ length: 6 }, () =>
      makeStreamingResponse({
        chunkSize,
        totalChunks: 128, // 32 MiB each = 192 MiB total if unbounded
      })
    );
    const fetchMock = vi.spyOn(globalThis, "fetch");
    for (const f of fixtures) {
      fetchMock.mockResolvedValueOnce(f.response);
    }

    const responses = await Promise.all(fixtures.map(() => GET(makeRequest(ALLOWED_URL))));
    for (let i = 0; i < responses.length; i += 1) {
      expect(responses[i].status).toBe(413);
      expect(fixtures[i].wasCancelled()).toBe(true);
      expect(fixtures[i].getBytesProduced()).toBeLessThanOrEqual(MAX_IMAGE_SIZE + chunkSize * 2);
    }
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
