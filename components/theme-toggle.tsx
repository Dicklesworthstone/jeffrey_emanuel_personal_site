"use client";

import { useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";
import { cn } from "@/lib/utils";

const TAP_MOVE_THRESHOLD_PX = 8;

interface ThemeToggleProps {
  variant?: "compact" | "labeled";
  className?: string;
}

export default function ThemeToggle({
  variant = "compact",
  className,
}: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { lightTap } = useHapticFeedback();
  const isDark = resolvedTheme === "dark";

  const tapStartRef = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    tapStartRef.current = e.pointerType === "touch" ? { x: e.clientX, y: e.clientY } : null;
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      const start = tapStartRef.current;
      tapStartRef.current = null;
      if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) < TAP_MOVE_THRESHOLD_PX) {
        lightTap();
      }
    },
    [lightTap]
  );

  const handleClick = useCallback(() => {
    lightTap();
    toggleTheme();
  }, [lightTap, toggleTheme]);

  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  if (variant === "labeled") {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={!isDark}
        aria-label={label}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className={cn(
          "flex w-full items-center justify-between rounded-xl border border-slate-200/80 bg-slate-100/80 px-4 py-3 text-sm font-medium transition-colors hover:bg-slate-200/60 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-xs text-amber-500 dark:bg-slate-800 dark:text-sky-400">
            {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </div>
          <span className="font-medium text-slate-800 dark:text-slate-200">
            Appearance
          </span>
        </div>
        <span className="rounded-full bg-slate-200/70 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700 dark:bg-white/10 dark:text-slate-300">
          {resolvedTheme}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={!isDark}
      aria-label={label}
      title={`${label} (Press T)`}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className={cn(
        "group relative flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300",
        "border-slate-300/80 bg-white/80 text-amber-600 shadow-xs backdrop-blur-md hover:border-slate-400 hover:bg-white",
        "dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:shadow-none dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-white",
        "active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500",
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
            className="flex items-center justify-center"
          >
            <Moon className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12 group-hover:text-sky-400" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
            className="flex items-center justify-center"
          >
            <Sun className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45 group-hover:text-amber-500" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
