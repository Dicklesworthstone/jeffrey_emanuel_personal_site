"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";

interface NavItemProps {
  href: string;
  label: string;
  active: boolean;
  prefersReducedMotion: boolean;
}

export default function NavItem({ href, label, active, prefersReducedMotion }: NavItemProps) {
  const { lightTap } = useHapticFeedback();

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative rounded-full px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap group",
        active
          ? "text-slate-900 font-semibold dark:text-white"
          : "text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
      )}
      onClick={() => lightTap()}
    >
      {/* Background glow on hover */}
      <motion.div
        className="absolute inset-0 rounded-full bg-slate-900/0 opacity-0 group-hover:bg-slate-900/[0.05] group-hover:opacity-100 dark:group-hover:bg-white/[0.03] transition-all duration-300"
        aria-hidden="true"
      />

      {/* Active Indicator (Pill) */}
      {active && (
        <motion.div
          layoutId={prefersReducedMotion ? undefined : "nav-pill"}
          className="absolute inset-0 rounded-full bg-slate-900/10 ring-1 ring-slate-900/15 shadow-xs dark:bg-white/[0.08] dark:ring-white/15 dark:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 350, damping: 25 }}
        />
      )}

      {/* Subtle bottom line indicator on hover (non-active items) */}
      {!active && (
        <motion.div 
          className="absolute bottom-1.5 left-1/2 h-px w-0 -translate-x-1/2 bg-sky-400/50 transition-all duration-300 group-hover:w-4"
          aria-hidden="true"
        />
      )}

      <span className="relative z-10">{label}</span>
    </Link>
  );
}
