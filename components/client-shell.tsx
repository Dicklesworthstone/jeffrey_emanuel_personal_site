"use client";

import { useEffect, useState, useCallback, Profiler } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import ErrorBoundary from "@/components/error-boundary";
import ScrollToTop from "@/components/scroll-to-top";
import EasterEggs from "@/components/easter-eggs";
import ServiceWorkerRegistration from "@/components/service-worker-registration";
import { useMobileOptimizations } from "@/hooks/use-mobile-optimizations";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

// Lazy load modals to reduce initial bundle size
const CommandPalette = dynamic(() => import("@/components/command-palette"), {
  ssr: false,
});
const KeyboardShortcutsModal = dynamic(() => import("@/components/keyboard-shortcuts-modal"), {
  ssr: false,
});

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const isDev = process.env.NODE_ENV === "development";

  const handleProfiler = useCallback(
    (
      id: string,
      phase: "mount" | "update" | "nested-update",
      actualDuration: number,
      baseDuration: number,
      startTime: number,
      commitTime: number,
    ) => {
      if (!isDev || typeof window === "undefined") return;
      const entry = {
        id,
        phase,
        actualDuration,
        baseDuration,
        startTime,
        commitTime,
        ts: Date.now(),
      };
      const win = window as Window & { __reactProfile?: typeof entry[] };
      if (!win.__reactProfile) {
        win.__reactProfile = [];
      }
      win.__reactProfile.push(entry);
      if (win.__reactProfile.length > 2000) {
        win.__reactProfile.shift();
      }
    },
    [isDev],
  );

  // Enable mobile-specific optimizations
  useMobileOptimizations();

  // Global keyboard shortcuts
  const openCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(true);
  }, []);

  const openShortcutsModal = useCallback(() => {
    setIsShortcutsModalOpen(true);
  }, []);

  const closeCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(false);
  }, []);

  const closeShortcutsModal = useCallback(() => {
    setIsShortcutsModalOpen(false);
  }, []);

  useKeyboardShortcuts({
    onOpenCommandPalette: openCommandPalette,
    onOpenHelp: openShortcutsModal,
    enabled: !isCommandPaletteOpen && !isShortcutsModalOpen,
  });

  useEffect(() => {
    // Instant scroll on navigation
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen flex-col">
        <SiteHeader onOpenCommandPalette={openCommandPalette} />
        {isDev ? (
          <Profiler id="route" onRender={handleProfiler}>
            <AnimatePresence mode="wait">
              <motion.main
                id="main-content"
                key={pathname}
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }}
                className="flex-1"
                tabIndex={-1}
                role="main"
              >
                {children}
              </motion.main>
            </AnimatePresence>
          </Profiler>
        ) : (
          <AnimatePresence mode="wait">
            <motion.main
              id="main-content"
              key={pathname}
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }}
              className="flex-1"
              tabIndex={-1}
              role="main"
            >
              {children}
            </motion.main>
          </AnimatePresence>
        )}
        <SiteFooter />
        <ScrollToTop />
        <EasterEggs />

        {/* Global modals */}
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={closeCommandPalette}
        />
        <KeyboardShortcutsModal
          isOpen={isShortcutsModalOpen}
          onClose={closeShortcutsModal}
        />

        {/* PWA Service Worker Registration */}
        <ServiceWorkerRegistration />
      </div>
    </ErrorBoundary>
  );
}
