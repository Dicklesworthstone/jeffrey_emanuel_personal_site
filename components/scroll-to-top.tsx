"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";

const CIRCLE_RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const { mediumTap } = useHapticFeedback();
  const prefersReducedMotion = useReducedMotion();

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    setIsVisible(scrollY > 400);
    setProgress(maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0);
  }, []);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Initial scroll position sync on mount
    handleScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
          onClick={scrollToTop}
          onTouchStart={mediumTap}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-sky-500/40 bg-sky-500/10 text-sky-300 shadow-lg shadow-sky-500/20 backdrop-blur-xl transition-all active:scale-95 hover:border-sky-500/60 hover:bg-sky-500/20"
          aria-label="Scroll to top"
        >
          {/* Progress ring */}
          <svg
            className="absolute inset-0 h-12 w-12 -rotate-90"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="scroll-progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
            <circle
              cx="24"
              cy="24"
              r={CIRCLE_RADIUS}
              fill="none"
              stroke="url(#scroll-progress-gradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 0.1s ease-out" }}
            />
          </svg>
          <ArrowUp className="relative h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
