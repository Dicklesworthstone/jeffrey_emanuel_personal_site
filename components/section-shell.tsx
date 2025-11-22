"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

type Props = {
  id?: string;
  icon?: LucideIcon;
  eyebrow?: string;
  title: string;
  kicker?: string;
  children: React.ReactNode;
};

export default function SectionShell({
  id,
  icon: Icon,
  eyebrow,
  title,
  kicker,
  children,
}: Props) {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      data-section
      id={id}
      className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20 lg:px-8 lg:py-24"
    >
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
        transition={{ type: "spring", stiffness: 120, damping: 22 }}
      >
      <div className="mb-8 max-w-3xl md:mb-12">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300/90 md:text-sm">
            {eyebrow}
          </p>
        )}
        <div className="mt-3 flex items-center gap-3 md:mt-4 md:gap-4">
          {Icon && (
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800/80 bg-slate-900/70 text-sky-300 md:h-11 md:w-11">
              <Icon className="h-5 w-5 md:h-5 md:w-5" />
            </div>
          )}
          <h2 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl md:text-4xl">
            {title}
          </h2>
        </div>
        {kicker && (
          <p className="mt-4 text-base leading-relaxed text-slate-400 md:mt-5 md:text-lg md:leading-relaxed">{kicker}</p>
        )}
      </div>
        <div className="space-y-6 md:space-y-8">
          {children}
        </div>
      </motion.div>
    </section>
  );
}
