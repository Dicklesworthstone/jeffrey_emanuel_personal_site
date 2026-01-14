"use client";

import { useEffect, useRef } from "react";
import { motion, useSpring, useReducedMotion, useMotionValue } from "framer-motion";

/**
 * Reading progress indicator that shows scroll progress through an article.
 * Displays as a thin bar at the top of the viewport.
 */
export default function ArticleProgress() {
  const progress = useMotionValue(0);
  // Use spring for smooth animation derived from the motion value
  const scaleX = useSpring(progress, { stiffness: 100, damping: 30 });
  const prefersReducedMotion = useReducedMotion();
  const metricsRef = useRef({ start: 0, end: 0 });

  useEffect(() => {
    let ticking = false;

    const measure = () => {
      const article = document.querySelector("article");
      if (!article) return null;

      const rect = article.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const end = top + rect.height - window.innerHeight;
      metricsRef.current = { start: top, end };
      return article;
    };

    const calculateProgress = () => {
      const { start, end } = metricsRef.current;
      const scrollRange = end - start;

      if (!Number.isFinite(scrollRange) || scrollRange <= 0) {
        progress.set(1);
        return;
      }

      const currentProgress = Math.min(
        1,
        Math.max(0, (window.scrollY - start) / scrollRange)
      );

      progress.set(currentProgress);
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          calculateProgress();
          ticking = false;
        });
        ticking = true;
      }
    };
    const onResize = () => {
      measure();
      onScroll();
    };

    // Measure and calculate on mount
    const article = measure();
    calculateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    // Use ResizeObserver to detect layout changes (e.g. images loading)
    let resizeObserver: ResizeObserver | null = null;
    
    if (article) {
      resizeObserver = new ResizeObserver(() => {
        measure();
        onScroll();
      });
      resizeObserver.observe(article);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [progress]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-900/50">
      <motion.div
        className="h-full bg-gradient-to-r from-sky-500 to-violet-500 origin-left"
        style={{ scaleX: prefersReducedMotion ? progress : scaleX }}
        initial={{ scaleX: 0 }}
      />
    </div>
  );
}
