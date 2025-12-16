"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    let ticking = false;

    const calculateProgress = () => {
      const article = document.querySelector("article");
      if (!article) return;

      const articleTop = article.offsetTop;
      const articleHeight = article.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;

      // Calculate how far through the article we've scrolled
      const start = articleTop;
      const end = articleTop + articleHeight - windowHeight;
      const scrollRange = end - start;

      if (scrollRange <= 0) {
        progress.set(1);
        return;
      }

      const currentProgress = Math.min(
        1,
        Math.max(0, (scrollY - start) / scrollRange)
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

    // Calculate on mount and scroll
    calculateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    // Use ResizeObserver to detect layout changes (e.g. images loading)
    const article = document.querySelector("article");
    let resizeObserver: ResizeObserver | null = null;
    
    if (article) {
      resizeObserver = new ResizeObserver(() => {
        onScroll();
      });
      resizeObserver.observe(article);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
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
