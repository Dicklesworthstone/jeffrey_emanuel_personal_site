"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      // Register service worker after page load
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .then((registration) => {
            console.log("SW registered:", registration.scope);

            // Check for updates
            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (
                    newWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    // New content available, show refresh prompt if desired
                    console.log("New content available, refresh to update");
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.error("SW registration failed:", error);
          });
      });

      // Handle controller change (when a new SW takes over)
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("New service worker activated");
      });
    }
    return;
  }, []);

  return null;
}
