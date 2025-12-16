"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useReducedMotion } from "framer-motion";

/**
 * Reading progress indicator that shows scroll progress through an article.
 * Displays as a thin bar at the top of the viewport.
 */
export default function ArticleProgress() {
  const [progress, setProgress] = useState(0);

  // Use spring for smooth animation
  const scaleX = useSpring(0, { stiffness: 100, damping: 30 });

  useEffect(() => {
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
        setProgress(100);
        scaleX.set(1);
        return;
      }

      const currentProgress = Math.min(
        100,
        Math.max(0, ((scrollY - start) / scrollRange) * 100)
      );

      setProgress(currentProgress);
      scaleX.set(currentProgress / 100);
    };

    // Calculate on mount and scroll
    calculateProgress();
    window.addEventListener("scroll", calculateProgress, { passive: true });
    window.addEventListener("resize", calculateProgress, { passive: true });

    return () => {
      window.removeEventListener("scroll", calculateProgress);
      window.removeEventListener("resize", calculateProgress);
    };
  }, [scaleX]);

  // Check for reduced motion preference (SSR-safe via Framer Motion)
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-900/50">
      <motion.div
        className="h-full bg-gradient-to-r from-sky-500 to-violet-500 origin-left"
        style={{ scaleX: prefersReducedMotion ? progress / 100 : scaleX }}
        initial={{ scaleX: 0 }}
      />
    </div>
  );
}
