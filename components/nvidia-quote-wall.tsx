"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { EndorsementShowcase } from "@/components/endorsement-showcase";

// =============================================================================
// NVIDIA QUOTE WALL
// Displays endorsements related to the Nvidia essay using the reusable showcase
// =============================================================================

interface NvidiaQuoteWallProps {
  /** Additional CSS classes */
  className?: string;
  /** Show section heading */
  showHeading?: boolean;
  /** Layout style for the quotes */
  layout?: "featured" | "grid" | "carousel";
}

export function NvidiaQuoteWall({
  className,
  showHeading = true,
  layout = "featured",
}: NvidiaQuoteWallProps) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className={cn("relative", className)} aria-label="Quotes about the essay">
      {/* Section heading */}
      {showHeading && (
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
          className="mb-12 text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-2 text-amber-400">
            <Quote className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wider">
              In Their Words
            </span>
          </div>
          <h2 className="mb-3 text-3xl font-bold text-white md:text-4xl">
            What They&apos;re Saying
          </h2>
          <p className="mx-auto max-w-2xl text-slate-400">
            Reactions from industry leaders, media outlets, and the tech community.
          </p>
        </motion.div>
      )}

      {/* Endorsements filtered to nvidia tag */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: 0.2 }}
      >
        <EndorsementShowcase
          filterTags={["nvidia"]}
          layout={layout}
          heading=""
          maxItems={0}
        />
      </motion.div>
    </section>
  );
}

export default NvidiaQuoteWall;
