"use client";

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

  // Generate a unique heading ID for aria-labelledby
  const headingId = id ? `${id}-heading` : undefined;

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
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
        animate={prefersReducedMotion ? { opacity: 1, y: 0 } : (isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 })}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="relative z-10"
      >
        <div className="mb-16 max-w-3xl md:mb-24">
          {eyebrow && (
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px w-6 bg-gradient-to-r from-sky-500/80 to-transparent" />
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-sky-400/90 shadow-sky-500/20 drop-shadow-sm">
                {eyebrow}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-5 md:items-center">
              {(Icon || iconNode) && (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50 text-sky-400 shadow-lg shadow-sky-900/10 backdrop-blur-sm">
                  {iconNode || (Icon && <Icon className="h-5 w-5" />)}
                </div>
              )}
              <HeadingTag
                id={headingId}
                className="text-balance-pro text-3xl font-bold tracking-tighter text-white sm:text-4xl md:text-5xl lg:text-6xl"
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

        <div className="relative">
          {children}
        </div>
      </motion.div>
    </section>
  );
}
