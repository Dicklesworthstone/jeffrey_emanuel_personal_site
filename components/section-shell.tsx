"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { cn } from "@/lib/utils";

type Props = {
  id?: string;
  icon?: LucideIcon;
  iconNode?: React.ReactNode;
  eyebrow?: string;
  title: string;
  kicker?: string;
  children: React.ReactNode;
  className?: string;
  /** Use headingLevel={1} for the first section on a page to ensure proper h1 hierarchy */
  headingLevel?: 1 | 2;
};

export default function SectionShell({
  id,
  icon: Icon,
  iconNode,
  eyebrow,
  title,
  kicker,
  children,
  className,
  headingLevel = 2,
}: Props) {
  const HeadingTag = `h${headingLevel}` as const;
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });
  const prefersReducedMotion = useReducedMotion();

  // Track if we've mounted on client to avoid hydration mismatch
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Standard hydration detection pattern
    setHasMounted(true);
  }, []);

  // Generate a unique heading ID for aria-labelledby
  const headingId = id ? `${id}-heading` : undefined;

  // Always start visible to prevent flash of invisible content
  // Only animate from slightly offset position when intersection triggers
  // Content is NEVER hidden - we just animate from a subtle offset
  const animateIn = hasMounted && isIntersecting && !prefersReducedMotion;

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      data-section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        "relative mx-auto max-w-7xl px-4 py-28 sm:px-6 md:py-36 lg:px-8 lg:py-44",
        className
      )}
    >
      <motion.div
        initial={false}
        animate={{
          opacity: 1,
          y: animateIn ? 0 : (hasMounted ? 20 : 0)
        }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10"
        style={{ opacity: 1 }}
      >
        <div className="mb-16 max-w-3xl md:mb-24">
          {eyebrow && (
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px w-6 bg-gradient-to-r from-sky-500/80 to-transparent" />
              <p className="text-xs font-bold uppercase tracking-widest text-sky-400/90 shadow-sky-500/20 drop-shadow-sm">
                {eyebrow}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-5 md:items-center">
              {(Icon || iconNode) && (
                <motion.div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-800/50 text-sky-400 shadow-lg shadow-sky-900/10 backdrop-blur-sm"
                  initial={false}
                  animate={animateIn ? {
                    boxShadow: "0 0 20px -5px rgba(56, 189, 248, 0.3), 0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                  } : {
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                  }}
                  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, delay: 0.2 }}
                  aria-hidden="true"
                >
                  {iconNode || (Icon && <Icon className="h-5 w-5" />)}
                </motion.div>
              )}
              <HeadingTag
                id={headingId}
                className="text-balance-pro font-bold tracking-tighter text-white"
                style={{ fontSize: "clamp(1.875rem, 5vw, 3.75rem)" }}
              >
                {title}
              </HeadingTag>
            </div>
            
            {kicker && (
              <p className="text-pretty-pro max-w-2xl text-lg font-normal leading-relaxed text-slate-400/90 md:ml-1 md:text-xl md:leading-relaxed">
                {kicker}
              </p>
            )}
          </div>
        </div>

        <motion.div
          className="relative"
          initial={false}
          animate={{
            opacity: 1,
            y: animateIn ? 0 : (hasMounted ? 12 : 0)
          }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          style={{ opacity: 1 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </section>
  );
}
