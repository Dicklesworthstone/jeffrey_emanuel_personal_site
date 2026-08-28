"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";
import { getScrollMetrics } from "@/lib/utils";

const CIRCLE_RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  // Progress lives in a motion value so the ring updates without re-rendering
  // React on every scroll frame; only the coarse visibility boolean is state.
  const progress = useMotionValue(0);
  const dashOffset = useTransform(progress, (p) => CIRCUMFERENCE * (1 - p));
  const { mediumTap } = useHapticFeedback();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    let ticking = false;

    const measure = () => {
      const { scrollTop, progress: scrollProgress } = getScrollMetrics();
      progress.set(scrollProgress);
      const next = scrollTop > 400;
      setIsVisible((prev) => (prev === next ? prev : next));
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          measure();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    measure();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [progress]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

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
          className="fixed bottom-[max(1.5rem,calc(1.5rem+env(safe-area-inset-bottom)))] right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-sky-500/40 bg-sky-500/10 text-sky-300 shadow-lg shadow-sky-500/20 backdrop-blur-xl transition-[border-color,background-color,transform] active:scale-95 hover:border-sky-500/60 hover:bg-sky-500/20"
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
            <motion.circle
              cx="24"
              cy="24"
              r={CIRCLE_RADIUS}
              fill="none"
              stroke="url(#scroll-progress-gradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              style={{ strokeDashoffset: dashOffset }}
            />
          </svg>
          <ArrowUp className="relative h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
