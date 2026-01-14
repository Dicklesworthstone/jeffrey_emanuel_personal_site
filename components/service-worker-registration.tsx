"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
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
                    // New content available
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

      // Handle controller change (when a new SW takes over)
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

  return null;
}
