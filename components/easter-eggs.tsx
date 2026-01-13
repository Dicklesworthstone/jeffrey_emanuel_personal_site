"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useKonamiCode } from "@/hooks/use-konami";

/**
 * Easter egg component that provides hidden delights for explorers.
 *
 * Features:
 * - Console message for developers who inspect the site
 * - Konami code (↑↑↓↓←→←→BA) triggers a celebration
 */
export default function EasterEggs() {
  const [showCelebration, setShowCelebration] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoggedRef = useRef(false);

  // Console message for developers
  useEffect(() => {
    if (hasLoggedRef.current) return;
    if (typeof window === "undefined") return;
    hasLoggedRef.current = true;

    // Defer the console message to avoid any hydration issues
    requestAnimationFrame(() => {
      try {
        // Simple console.group approach avoids %c parsing issues
        console.group("%cJeffrey Emanuel", "color: #38bdf8; font-weight: bold; font-size: 14px;");
        console.log("%cHey, fellow developer!", "color: #38bdf8; font-size: 12px;");
        console.log("%cThanks for inspecting the code.", "color: #94a3b8; font-size: 11px;");
        console.log("");
        console.log("%cThis site is built with:", "color: #e2e8f0; font-size: 11px;");
        console.log("%c  - Next.js 16 + React 19", "color: #94a3b8; font-size: 11px;");
        console.log("%c  - Tailwind CSS v4", "color: #94a3b8; font-size: 11px;");
        console.log("%c  - Three.js for 3D visualizations", "color: #94a3b8; font-size: 11px;");
        console.log("%c  - Framer Motion for animations", "color: #94a3b8; font-size: 11px;");
        console.log("");
        console.log("%cTry the Konami code!", "color: #fbbf24; font-weight: bold; font-size: 12px;");
        console.log("%cgithub.com/Dicklesworthstone", "color: #60a5fa; font-size: 11px;");
        console.groupEnd();
      } catch {
        // Silently ignore any console errors
      }
    });
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Konami code handler with proper cleanup
  const handleKonamiCode = useCallback(() => {
    setShowCelebration(true);
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Hide after 3 seconds
    timeoutRef.current = setTimeout(() => setShowCelebration(false), 3000);
  }, []);

  useKonamiCode(handleKonamiCode);

  return (
    <AnimatePresence>
      {showCelebration && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setShowCelebration(false)}
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
              className="mb-4 text-8xl"
            >
              🎉
            </motion.div>
            <h2 className="mb-2 text-4xl font-bold text-white">
              You found the easter egg!
            </h2>
            <p className="text-xl text-slate-400">
              The Konami Code still works in 2025
            </p>
            <p className="mt-4 text-sm text-slate-500">
              Click anywhere to dismiss
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
