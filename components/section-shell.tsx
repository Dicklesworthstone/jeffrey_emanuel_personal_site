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
      className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32 lg:px-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }} // Custom ease for "slick" feel
        className="relative z-10"
      >
        <div className="mb-16 max-w-3xl md:mb-24">
          {eyebrow && (
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-sky-500/50"></span>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
                {eyebrow}
              </p>
            </div>
          )}
          
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              {Icon && (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50 text-sky-400 shadow-lg shadow-sky-900/10 backdrop-blur-sm">
                  <Icon className="h-6 w-6" />
                </div>
              )}
              <h2 className="text-balance-pro text-3xl font-bold tracking-tighter text-slate-50 sm:text-4xl md:text-5xl">
                {title}
              </h2>
            </div>
            
            {kicker && (
              <p className="text-pretty-pro max-w-2xl text-lg font-light leading-relaxed text-slate-400 md:text-xl md:leading-relaxed">
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
