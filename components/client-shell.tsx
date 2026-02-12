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
import { useScroll, useSpring } from "framer-motion";
import { NOISE_SVG_DATA_URI } from "@/lib/constants";

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

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

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
      <div className="flex min-h-screen flex-col relative overflow-x-hidden">
        {/* Global Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 z-40 h-1 origin-left bg-gradient-to-r from-sky-500 via-violet-500 to-emerald-500"
          style={{ scaleX }}
        />

        {/* Global Texture Overlay (GPU Accelerated) */}
        <div 
          className="pointer-events-none fixed inset-0 z-[9999] opacity-[0.03] mix-blend-overlay will-change-transform"
          style={{ backgroundImage: `url("${NOISE_SVG_DATA_URI}")` }}
        />

        <SiteHeader onOpenCommandPalette={openCommandPalette} />
        {(() => {
          const pageTransition = (
            <AnimatePresence mode="wait">
              <motion.main
                id="main-content"
                key={pathname}
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98, y: 10, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.02, y: -10, filter: "blur(10px)" }}
                transition={prefersReducedMotion ? { duration: 0 } : { 
                  opacity: { duration: 0.4 },
                  scale: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                  y: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                  filter: { duration: 0.4 }
                }}
                className="flex-1 min-h-screen"
                tabIndex={-1}
                role="main"
              >
                {children}
              </motion.main>
            </AnimatePresence>
          );
          return isDev ? (
            <Profiler id="route" onRender={handleProfiler}>
              {pageTransition}
            </Profiler>
          ) : pageTransition;
        })()}
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
