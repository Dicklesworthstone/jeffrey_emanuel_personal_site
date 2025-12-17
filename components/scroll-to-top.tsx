"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { mediumTap } = useHapticFeedback();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    let ticking = false;

    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(toggleVisibility);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
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
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-sky-500/40 bg-sky-500/10 text-sky-300 shadow-lg shadow-sky-500/20 backdrop-blur-xl transition-all active:scale-95 hover:border-sky-500/60 hover:bg-sky-500/20 md:hidden"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
