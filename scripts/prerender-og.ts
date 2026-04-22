/**
 * Pre-render the bespoke illustration-based OG/Twitter share images to
 * static JPEG files under public/og/.
 *
 * Why: the three illustration-heavy cards (wills-and-estate-planning,
 * overprompting, slack-mattermost-migration) produce ~700KB PNGs with
 * ~4-5s cold render times via next/og. X's Twitterbot times out on
 * fetches that size/slow and silently drops the card (iMessage and
 * Telegram wait longer, so they still render). Serving the same cards
 * as pre-built ~150KB JPEGs from /public eliminates both the size and
 * the cold-start entirely. The dynamic routes stay in place for easy
 * iteration.
 *
 * Run: bun run prerender:og
 *
 * What it does:
 *   1. Starts `bun run start` on PORT (default 3458).
 *   2. Polls until it answers.
 *   3. For each slug and variant, GETs /writing/<slug>/<variant>-image,
 *      pipes the PNG through sharp to JPEG (q=85, progressive),
 *      writes public/og/<slug>-<variant>.jpg.
 *   4. Kills the server.
 *
 * Commit the resulting public/og/*.jpg along with any dynamic-route edits.
 * Article page.tsx metadata points openGraph.images / twitter.images at
 * these static files, overriding the file-convention auto-wiring.
 */

import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

type Variant = "opengraph" | "twitter";

const SLUGS = [
  "wills-and-estate-planning",
  "overprompting",
  "slack-mattermost-migration",
] as const;

const VARIANTS: readonly Variant[] = ["opengraph", "twitter"] as const;

const PORT = Number(process.env.PRERENDER_PORT ?? 3458);
const HOST = `http://127.0.0.1:${PORT}`;
const OUT_DIR = join(process.cwd(), "public", "og");
const JPEG_QUALITY = Number(process.env.PRERENDER_JPEG_QUALITY ?? 85);
const READY_TIMEOUT_MS = 60_000;
// Cold Satori renders for the illustration-heavy cards can take 30s+ on
// the very first hit (route compile + asset fetch + rasterize). Keep the
// budget generous; this script only runs on demand.
const FETCH_TIMEOUT_MS = 120_000;
const FETCH_RETRIES = 2;

function fatal(msg: string): never {
  console.error(`[prerender-og] ${msg}`);
  process.exit(1);
}

async function waitForReady(url: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { method: "GET" });
      if (res.status >= 200 && res.status < 500) {
        return;
      }
      lastError = new Error(`status ${res.status}`);
    } catch (err) {
      lastError = err;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  fatal(`server never became ready at ${url}: ${String(lastError)}`);
}

async function fetchPngOnce(url: string): Promise<Buffer> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) {
      throw new Error(`GET ${url} → ${res.status}`);
    }
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("image/png")) {
      throw new Error(`GET ${url} → unexpected content-type "${ct}"`);
    }
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  } finally {
    clearTimeout(timer);
  }
}

async function fetchPng(url: string): Promise<Buffer> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= FETCH_RETRIES + 1; attempt += 1) {
    try {
      return await fetchPngOnce(url);
    } catch (err) {
      lastError = err;
      const reason = err instanceof Error ? err.message : String(err);
      console.warn(
        `[prerender-og]   attempt ${attempt}/${FETCH_RETRIES + 1} failed for ${url}: ${reason}`
      );
      if (attempt <= FETCH_RETRIES) {
        await new Promise((r) => setTimeout(r, 1_000));
      }
    }
  }
  fatal(`GET ${url} failed after ${FETCH_RETRIES + 1} attempts: ${String(lastError)}`);
}

async function renderAll(): Promise<void> {
  mkdirSync(OUT_DIR, { recursive: true });

  for (const slug of SLUGS) {
    for (const variant of VARIANTS) {
      const url = `${HOST}/writing/${slug}/${variant}-image`;
      const started = Date.now();
      const png = await fetchPng(url);
      const renderMs = Date.now() - started;

      const jpeg = await sharp(png, { failOn: "error" })
        .jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true })
        .toBuffer();

      const outPath = join(OUT_DIR, `${slug}-${variant}.jpg`);
      writeFileSync(outPath, jpeg);

      const pngKB = (png.length / 1024).toFixed(1);
      const jpgKB = (jpeg.length / 1024).toFixed(1);
      console.log(
        `  ${slug}/${variant}  PNG ${pngKB}KB in ${renderMs}ms  →  JPEG ${jpgKB}KB  →  ${outPath}`
      );
    }
  }
}

async function main(): Promise<void> {
  console.log(`[prerender-og] starting next server on port ${PORT}…`);
  const server = spawn("bun", ["run", "start"], {
    env: { ...process.env, PORT: String(PORT), HOST: "127.0.0.1" },
    stdio: ["ignore", "ignore", "inherit"],
    detached: false,
  });

  let shuttingDown = false;
  const shutdown = (code: number): void => {
    if (shuttingDown) return;
    shuttingDown = true;
    try {
      server.kill("SIGTERM");
    } catch {}
    process.exit(code);
  };
  process.on("SIGINT", () => shutdown(130));
  process.on("SIGTERM", () => shutdown(143));
  server.on("exit", (code) => {
    if (!shuttingDown) {
      fatal(`next server exited unexpectedly with code ${code ?? "null"}`);
    }
  });

  try {
    await waitForReady(`${HOST}/`, READY_TIMEOUT_MS);
    console.log("[prerender-og] server ready; rendering cards…");
    await renderAll();
    console.log("[prerender-og] done.");
  } catch (err) {
    console.error(err);
    shutdown(1);
    return;
  }
  shutdown(0);
}

void main();
