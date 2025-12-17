// Service Worker for Jeffrey Emanuel's site
// Provides offline support and intelligent caching

const CACHE_NAME = "jeffrey-emanuel-v1";
const OFFLINE_URL = "/_offline";

// Assets to cache on install
const PRECACHE_ASSETS = [
  "/",
  "/about",
  "/projects",
  "/writing",
  "/consulting",
  "/contact",
  "/media",
  "/_offline",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

// Install event - cache critical assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Cache precache assets, but don't fail install if some fail
      await Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`Failed to cache ${url}:`, err);
          })
        )
      );
      // Skip waiting to activate immediately
      self.skipWaiting();
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Delete old caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
      // Take control of all clients
      await self.clients.claim();
    })()
  );
});

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip Chrome extension requests and other non-http(s)
  if (!url.protocol.startsWith("http")) return;

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

  // Handle static assets (JS, CSS, images, fonts)
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2)$/)
  ) {
    event.respondWith(
      (async () => {
        // Cache first for static assets
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // Fetch from network and cache
        try {
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch {
          // Return empty response for failed asset requests
          return new Response("", { status: 404 });
        }
      })()
    );
    return;
  }

  // Handle Google Fonts
  if (
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com"
  ) {
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
          }
          return networkResponse;
        } catch {
          return new Response("", { status: 404 });
        }
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
