"use client";

import { useEffect, useState } from "react";

export default function ServiceWorkerRegistration() {
  // sw.js calls skipWaiting() in install and clients.claim() in activate, so a
  // freshly installed worker already controls this page without a reload. That
  // controller swap does not re-fetch the already-loaded JS/CSS chunks, so the
  // page can keep running old chunks against a cache the new worker has just
  // rebuilt (activate() deletes every cache from a previous CACHE_VERSION). The
  // toast lets the visitor opt into a reload; we deliberately never auto-reload
  // on `controllerchange` because that would yank the page out from under them.
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      const registerServiceWorker = () => {
        navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .then((registration) => {
            // Check for updates
            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (
                    newWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    // New content available: an older worker was controlling
                    // the page, so the chunks in memory may predate this build.
                    setUpdateReady(true);
                  }
                });
              }
            });
          })
          .catch(() => {
            // Silently fail if SW registration fails (e.g. Firefox private mode)
          });
      };

      // Register immediately if the page already loaded
      if (document.readyState === "complete") {
        registerServiceWorker();
      } else {
        // Register service worker after page load
        window.addEventListener("load", registerServiceWorker);
      }

      // Handle controller change (when a new SW takes over). Intentionally a
      // no-op: no auto-reload (see the note on `updateReady` above).
      const handleControllerChange = () => {
        // New service worker activated
      };
      navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

      return () => {
        window.removeEventListener("load", registerServiceWorker);
        navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
      };
    }
    return;
  }, []);

  if (!updateReady) return null;

  return (
    <div
      role="status"
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-1/2 z-[80] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-slate-900/95 px-4 py-2 text-sm text-slate-200 shadow-lg backdrop-blur"
    >
      <span>A newer version of this site is ready.</span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="min-h-11 rounded-full px-3 font-medium text-cyan-300 transition-colors hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
      >
        Refresh
      </button>
      <button
        type="button"
        onClick={() => setUpdateReady(false)}
        className="min-h-11 rounded-full px-3 text-slate-400 transition-colors hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
      >
        Later
      </button>
    </div>
  );
}
