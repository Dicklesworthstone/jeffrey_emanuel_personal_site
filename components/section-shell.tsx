"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

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
  return (
    <motion.section
      data-section
      id={id}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ type: "spring", stiffness: 120, damping: 22 }}
      className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-14 lg:px-8"
    >
      <div className="mb-6 max-w-3xl md:mb-8">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.23em] text-sky-300/80">
            {eyebrow}
          </p>
        )}
        <div className="mt-2 flex items-center gap-2 md:gap-3">
          {Icon && (
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800/80 bg-slate-900/70 text-sky-300">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <h2 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
            {title}
          </h2>
        </div>
        {kicker && (
          <p className="mt-3 text-sm text-slate-400 sm:text-base">{kicker}</p>
        )}
      </div>
      <div className="space-y-5 text-sm leading-relaxed text-slate-300 sm:text-[0.95rem] md:space-y-6">
        {children}
      </div>
    </motion.section>
  );
}
