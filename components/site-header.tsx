"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform, useSpring } from "framer-motion";
import { Menu, X, Sparkles, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { navItems, siteConfig } from "@/lib/content";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { cn } from "@/lib/utils";
import { NOISE_SVG_DATA_URI } from "@/lib/constants";

// Dynamically import 3D header icon to avoid SSR issues
const HeaderIcon3D = dynamic(() => import("@/components/header-icon-3d"), {
  ssr: false,
  loading: () => (
    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 via-violet-500 to-emerald-400 shadow-lg shadow-sky-500/20">
      <Sparkles className="h-5 w-5 text-white" />
      <div className="absolute inset-0 rounded-xl bg-white/20 mix-blend-overlay" />
    </div>
  ),
});

interface SiteHeaderProps {
  onOpenCommandPalette?: () => void;
}

export default function SiteHeader({ onOpenCommandPalette }: SiteHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Initialize with Mac default to match SSR, update after hydration
  const [metaKey, setMetaKey] = useState("⌘");
  const { lightTap, mediumTap } = useHapticFeedback();
  const prefersReducedMotion = useReducedMotion();
  const resolvedPath = pathname ?? "";

  const { scrollY } = useScroll();
  
  // Smoothly interpolate header styles based on scroll position
  // Starts at 0, fully "scrolled" at 50px
  const headerOpacity = useTransform(scrollY, [0, 50], [0, 0.8]);
  const headerBlur = useTransform(scrollY, [0, 50], [0, 12]);
  const headerPadding = useTransform(scrollY, [0, 50], ["20px", "12px"]);
  const headerBorderOpacity = useTransform(scrollY, [0, 50], [0, 0.5]);
  
  // Spring-smoothed values for buttery performance
  const smoothOpacity = useSpring(headerOpacity, { stiffness: 300, damping: 30 });
  const smoothBorderOpacity = useSpring(headerBorderOpacity, { stiffness: 300, damping: 30 });

  // Detect OS for meta key - must run after hydration to avoid mismatch
  useEffect(() => {
    if (typeof navigator !== "undefined" && !/Mac|iPod|iPhone|iPad/.test(navigator.platform)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Required for SSR hydration safety
      setMetaKey("Ctrl+");
    }
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return resolvedPath === "/";
    return resolvedPath.startsWith(href);
  };

  // Lock body scroll when menu is open
  useBodyScrollLock(open);

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-300"
        style={{ 
          paddingTop: headerPadding,
          paddingBottom: headerPadding,
          backgroundColor: useTransform(smoothOpacity, (v) => `rgba(2, 6, 23, ${v})`),
          backdropFilter: useTransform(headerBlur, (v) => `blur(${v}px)`),
          WebkitBackdropFilter: useTransform(headerBlur, (v) => `blur(${v}px)`),
          borderColor: useTransform(smoothBorderOpacity, (v) => `rgba(15, 23, 42, ${v})`),
          paddingRight: "var(--scrollbar-width, 0px)",
          willChange: "padding, background-color, backdrop-filter, border-color"
        }}
        role="banner"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group flex items-center gap-3"
            onClick={() => setOpen(false)}
          >
            <div className="transition-transform group-hover:scale-105">
              <HeaderIcon3D />
            </div>
            <div className="flex flex-col leading-none">
              {siteConfig.location && (
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 transition-colors group-hover:text-sky-400">
                  {siteConfig.location.split(",")[0]}
                </span>
              )}
              <span className="mt-0.5 text-lg font-bold tracking-tight text-slate-100">
                {siteConfig.name}
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav
            className="hidden items-center gap-4 md:flex lg:gap-8"
            aria-label="Main navigation"
          >
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative rounded-full px-3 py-1.5 text-sm font-medium transition-all whitespace-nowrap",
                    active ? "text-white" : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId={prefersReducedMotion ? undefined : "nav-pill"}
                      className="absolute inset-0 rounded-full bg-white/[0.07] ring-1 ring-white/10"
                      transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}

            {/* Search Button */}
            <button
              onClick={onOpenCommandPalette}
              className="group flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Search site (Cmd+K)"
            >
              <Search className="h-4 w-4" />
              <span className="hidden lg:inline">Search</span>
              <kbd 
                className="hidden rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-xs font-bold text-slate-300 lg:inline-block"
                suppressHydrationWarning
              >
                {metaKey}K
              </kbd>
            </button>

            <Link
              href="/contact"
              onTouchStart={mediumTap}
              className="ml-2 lg:ml-4 inline-flex shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 lg:px-5 py-2 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:scale-105 active:scale-95"
            >
              Let&apos;s talk
            </Link>
          </nav>

          {/* Mobile Menu Toggle & Search */}
          <div className="flex items-center gap-4 md:hidden">
            <button
              onClick={() => {
                setOpen(false);
                onOpenCommandPalette?.();
              }}
              className="text-slate-400 hover:text-white"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              className="relative z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition-all active:scale-95"
              onClick={() => setOpen((v) => !v)}
              onTouchStart={lightTap}
              aria-label={open ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={open}
            >
               {/* Simple crossfade to avoid animation glitches */}
              <span className="relative h-5 w-5">
                <X
                  className={cn(
                    "absolute inset-0 h-5 w-5 transition-opacity duration-200",
                    open ? "opacity-100" : "opacity-0"
                  )}
                />
                <Menu
                  className={cn(
                    "absolute inset-0 h-5 w-5 transition-opacity duration-200",
                    open ? "opacity-0" : "opacity-100"
                  )}
                />
              </span>
          </button>
        </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-40 flex flex-col bg-slate-950/98 backdrop-blur-lg md:hidden overflow-y-auto will-change-[opacity]"
            style={{ transform: "translateZ(0)" }}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            {/* Background Noise */}
            <div className="absolute inset-0 pointer-events-none opacity-20" 
                 style={{ backgroundImage: `url("${NOISE_SVG_DATA_URI}")` }} 
            />
            
            <nav className="relative flex flex-1 flex-col justify-center px-8">
              <motion.div
                className="flex flex-col gap-8"
                initial="hidden"
                animate="visible"
                variants={prefersReducedMotion ? undefined : {
                  hidden: { opacity: 1 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
                  },
                }}
              >
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <motion.div
                      key={item.href}
                      variants={prefersReducedMotion ? undefined : {
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.33, 1, 0.68, 1] } },
                      }}
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          "text-4xl font-bold tracking-tight transition-colors",
                          active ? "text-white" : "text-slate-500 active:text-slate-300"
                        )}
                        onClick={() => setOpen(false)}
                        onTouchStart={lightTap}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>

              <motion.div
                className="mt-16"
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: [0.33, 1, 0.68, 1], delay: 0.1 + navItems.length * 0.06 }}
              >
                <Link
                  href="/contact"
                  className="flex w-full items-center justify-center rounded-full bg-white py-4 text-lg font-bold text-slate-950 shadow-lg shadow-white/10 transition-transform active:scale-95"
                  onClick={() => setOpen(false)}
                >
                  Get in touch
                </Link>
              </motion.div>
            </nav>

            {/* Footer info in menu */}
            {siteConfig.location && (
              <div className="relative p-8 text-xs font-medium uppercase tracking-widest text-slate-500">
                {siteConfig.location}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
