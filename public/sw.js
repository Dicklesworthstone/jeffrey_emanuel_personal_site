// Service Worker for Jeffrey Emanuel's site
// Provides offline support and intelligent caching.
//
// Caching contract:
//   - Navigations: network-first, fall back to cache, then /offline.
//   - /_next/static/*: cache-first (content-hashed, immutable).
//   - Other same-origin static assets (public/ images, icons, fonts): stale-while-
//     revalidate — serve the cached copy immediately but refresh it in the
//     background, so an image replaced in place after a deploy is picked up on
//     the next visit instead of being cache-first forever.
//   - /api/*: never intercepted.
// Bump CACHE_VERSION when the caching contract changes OR when precached HTML
// must not survive a deploy (e.g. a global stylesheet/theme change); activate()
// deletes every cache that does not match the current name.
//   v3 — class-driven light/dark theme (2026-09-03): pre-theme HTML/CSS in the
//        v2 precache would render without the theme tokens.

const CACHE_VERSION = "v3";
const CACHE_NAME = `jeffrey-emanuel-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline";
// Bound the asset cache so months of hashed chunks cannot accumulate.
const MAX_ASSET_ENTRIES = 200;

// Assets to cache on install
const PRECACHE_ASSETS = [
  "/",
  "/about",
  "/projects",
  "/writing",
  "/consulting",
  "/contact",
  "/media",
  "/offline",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

// Install event - cache critical assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        // Cache precache assets, but don't fail install if some fail
        await Promise.allSettled(
          PRECACHE_ASSETS.map((url) =>
            cache.add(url).catch((err) => {
              console.warn(`Failed to cache ${url}:`, err);
            })
          )
        );
      } catch (err) {
        // A precache failure must never block installation.
        console.warn("Precache skipped:", err);
      }
      // Skip waiting to activate immediately
      self.skipWaiting();
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        // Delete every cache from a previous CACHE_VERSION
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      } catch (err) {
        console.warn("Old cache cleanup skipped:", err);
      }
      // Take control of all clients
      await self.clients.claim();
    })()
  );
});

// Evict the oldest entries once the cache grows past MAX_ASSET_ENTRIES.
async function trimCache(cache) {
  const keys = await cache.keys();
  if (keys.length <= MAX_ASSET_ENTRIES) return;
  const excess = keys.length - MAX_ASSET_ENTRIES;
  await Promise.all(keys.slice(0, excess).map((request) => cache.delete(request)));
}

const STATIC_ASSET_RE = /\.(js|css|png|jpg|jpeg|gif|webp|avif|svg|ico|woff|woff2)$/;

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip Chrome extension requests and other non-http(s)
  if (!url.protocol.startsWith("http")) return;

  // Only same-origin requests are cached (next/font self-hosts fonts, so
  // there is no third-party font traffic to intercept).
  if (url.origin !== self.location.origin) return;

  // Skip API routes - always go to network
  if (url.pathname.startsWith("/api/")) return;

  // Handle navigation requests (HTML pages)
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          // Try network first for pages
          const networkResponse = await fetch(request);
          // Cache successful responses
          if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch {
          // Network failed, try cache
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return offline page as fallback
          const offlineResponse = await caches.match(OFFLINE_URL);
          if (offlineResponse) {
            return offlineResponse;
          }
          // Last resort - return a basic offline response
          return new Response("You are offline", {
            status: 503,
            statusText: "Service Unavailable",
            headers: { "Content-Type": "text/plain" },
          });
        }
      })()
    );
    return;
  }

  // Content-hashed build output: cache-first is safe forever.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      (async () => {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        try {
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
            trimCache(cache);
          }
          return networkResponse;
        } catch {
          return new Response("", { status: 404 });
        }
      })()
    );
    return;
  }

  // Un-hashed public assets: stale-while-revalidate.
  if (STATIC_ASSET_RE.test(url.pathname)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);
        const networkFetch = fetch(request)
          .then((networkResponse) => {
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone());
              trimCache(cache);
            }
            return networkResponse;
          })
          .catch(() => null);

        if (cachedResponse) {
          // Refresh in the background; the client can keep using the cached copy.
          event.waitUntil(networkFetch);
          return cachedResponse;
        }
        const networkResponse = await networkFetch;
        return networkResponse || new Response("", { status: 404 });
      })()
    );
    return;
  }
});

// Handle messages from the client
self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }
});
