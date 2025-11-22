"use client";

import { useEffect, useState } from "react";
import { X, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      return; // Already installed as PWA
    }

    // Check if user previously dismissed
    const dismissed = localStorage.getItem("pwa-prompt-dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSince = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSince < 30) return; // Don't show again for 30 days
    }

    let timeoutId: NodeJS.Timeout | null = null;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Clear any existing timeout to prevent race conditions
      if (timeoutId) clearTimeout(timeoutId);
      // Show prompt after 5 seconds of browsing
      timeoutId = setTimeout(() => setShowPrompt(true), 5000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("PWA installed");
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && deferredPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-6 left-4 right-4 z-50 mx-auto max-w-md md:left-auto md:right-6 md:bottom-6"
        >
        <div className="relative overflow-hidden rounded-2xl border border-sky-500/40 bg-slate-900/95 p-4 shadow-2xl shadow-sky-500/20 backdrop-blur-xl">
          <button
            onClick={handleDismiss}
            className="absolute right-2 top-2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-3 pr-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-violet-500">
              <Download className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-50">Install App</h3>
              <p className="mt-1 text-xs text-slate-400">
                Add to your home screen for quick access and offline reading.
              </p>
              <button
                onClick={handleInstall}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/40 transition hover:bg-sky-400"
              >
                Install Now
              </button>
            </div>
          </div>
        </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
