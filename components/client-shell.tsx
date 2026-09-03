"use client";

import { useState, useCallback, Profiler } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
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

  // Next's App Router already scrolls new navigations to the top and restores
  // the previous offset on back/forward; a manual scrollTo here defeated the
  // restoration and sent readers back to the top of /writing after an essay.

  // Article routes own their reading-progress bar and a floating TOC toggle in
  // the same corner ScrollToTop would occupy, so the shell renders neither there.
  const isArticleRoute = /^\/writing\/[^/]+\/?$/.test(pathname ?? "");

  return (
    <ErrorBoundary>
      {/* reducedMotion="user": every framer-motion animation in the tree honours
          prefers-reduced-motion (transforms/layout are zeroed, opacity kept) */}
      <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col relative overflow-x-hidden">
        {/* Global Progress Bar — article pages render their own reading-progress bar instead */}
        {!isArticleRoute && (
          <motion.div
            className="fixed left-0 right-0 z-[95] h-1 origin-left bg-gradient-to-r from-sky-500 via-violet-500 to-emerald-500"
            style={{ scaleX, top: "env(safe-area-inset-top, 0px)" }}
            aria-hidden="true"
          />
        )}

        <SiteHeader onOpenCommandPalette={openCommandPalette} />
        {(() => {
          const pageTransition = (
            // initial={false}: the first paint is never animated in. The
            // transition is opacity + a small rise only: animating `filter` on
            // <main> left `filter: blur(0px)` behind, which turned <main> into
            // the containing block for every position:fixed descendant (the
            // reading-progress bars) and re-rasterised the whole page on phones.
            <AnimatePresence mode="wait" initial={false}>
              <motion.main
                id="main-content"
                key={pathname}
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : {
                  opacity: { duration: 0.22 },
                  y: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                }}
                className="flex-1 min-h-screen"
                tabIndex={-1}
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
        {!isArticleRoute && <ScrollToTop />}
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
      </MotionConfig>
    </ErrorBoundary>
  );
}
