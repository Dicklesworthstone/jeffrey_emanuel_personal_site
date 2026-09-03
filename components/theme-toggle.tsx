"use client";

import { useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  /** "compact": icon button for the header bars. "labeled": full-width switch row for the mobile drawer. */
  variant?: "compact" | "labeled";
  className?: string;
}

/*
  Class names below are written in the site's dark vocabulary (`bg-white/5`,
  `text-slate-300`, ...) and flip through the role tokens in globals.css; only
  the accent colours carry explicit `light:` overrides.

  Until hydration the toggle cannot know the real theme (the server assumes
  dark), so it renders BOTH icons and lets the `light:` variant pick one. That
  keeps the first paint correct for a light-mode visitor without a hydration
  mismatch; the animated, state-driven icon takes over once hydrated.
*/

const ICON_CLASS = "h-4 w-4";

function StaticIcon({ className }: { className?: string }) {
  return (
    <>
      <Moon aria-hidden="true" className={cn(ICON_CLASS, "light:hidden", className)} />
      <Sun aria-hidden="true" className={cn(ICON_CLASS, "hidden light:block text-amber-600", className)} />
    </>
  );
}

export default function ThemeToggle({ variant = "compact", className }: ThemeToggleProps) {
  const { theme, hydrated, toggleTheme } = useTheme();
  const { lightTap } = useHapticFeedback();
  const prefersReducedMotion = useReducedMotion();
  const isDark = theme === "dark";

  // `click` only fires for a real tap (never after a scroll gesture), so the
  // haptic needs no pointer-travel guard here.
  const handleClick = useCallback(() => {
    lightTap();
    toggleTheme();
  }, [lightTap, toggleTheme]);

  const actionLabel = !hydrated
    ? "Switch color theme"
    : isDark
      ? "Switch to light mode"
      : "Switch to dark mode";

  if (variant === "labeled") {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label="Dark mode"
        onClick={handleClick}
        className={cn(
          "flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium transition-colors hover:bg-white/10",
          "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500",
          className
        )}
      >
        <div className="flex items-center gap-3">
          {/* slate-900 is the surface token: white in light mode (never write `light:bg-white` — white is ink there). */}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-sky-400 light:bg-slate-900 light:shadow-xs">
            <StaticIcon />
          </div>
          <span className="font-medium text-slate-200">Appearance</span>
        </div>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-300">
          <span className="light:hidden">Dark</span>
          <span className="hidden light:inline">Light</span>
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={actionLabel}
      title={`${actionLabel} (T)`}
      onClick={handleClick}
      className={cn(
        "group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
        "border-white/10 bg-white/5 text-slate-300 backdrop-blur-md hover:border-white/20 hover:bg-white/10 hover:text-white",
        "active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500",
        className
      )}
    >
      {!hydrated ? (
        <StaticIcon />
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span
              key="moon"
              initial={prefersReducedMotion ? { opacity: 1 } : { rotate: -90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { rotate: 90, scale: 0, opacity: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
              className="flex items-center justify-center"
            >
              <Moon
                aria-hidden="true"
                className={cn(ICON_CLASS, "transition-transform duration-300 group-hover:-rotate-12 group-hover:text-sky-400")}
              />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={prefersReducedMotion ? { opacity: 1 } : { rotate: 90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { rotate: -90, scale: 0, opacity: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
              className="flex items-center justify-center"
            >
              <Sun
                aria-hidden="true"
                className={cn(ICON_CLASS, "text-amber-600 transition-transform duration-300 group-hover:rotate-45 group-hover:text-amber-500")}
              />
            </motion.span>
          )}
        </AnimatePresence>
      )}
    </button>
  );
}
