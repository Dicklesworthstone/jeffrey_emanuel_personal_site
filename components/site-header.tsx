"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
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
  const [scrolled, setScrolled] = useState(false);
  // Initialize with Mac default to match SSR, update after hydration
  const [metaKey, setMetaKey] = useState("⌘");
  const { lightTap, mediumTap } = useHapticFeedback();
  const prefersReducedMotion = useReducedMotion();
  const resolvedPath = pathname ?? "";

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

  // Shrink header on scroll (mobile only)
  useEffect(() => {
    let ticking = false;
    let lastScrolled = false;

    const update = () => {
      const next = window.scrollY > 20;
      if (next !== lastScrolled) {
        lastScrolled = next;
        setScrolled(next);
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    // Set initial state in case page loads mid-scroll
    update();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when menu is open
  useBodyScrollLock(open);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300",
          scrolled
            ? "border-slate-950/50 bg-slate-950/80 backdrop-blur-xl py-3"
            : "border-transparent bg-transparent py-5"
        )}
        style={{ paddingRight: "var(--scrollbar-width, 0px)" }}
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
                    "text-sm font-medium transition-all hover:text-white whitespace-nowrap",
                    active ? "text-white" : "text-slate-400"
                  )}
                >
                  {item.label}
                  {active && (
                    <motion.div
                      layoutId={prefersReducedMotion ? undefined : "nav-dot"}
                      className="mx-auto mt-1 h-1 w-1 rounded-full bg-sky-400"
                      transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
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
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-40 flex flex-col bg-slate-950/98 backdrop-blur-lg md:hidden overflow-y-auto will-change-[opacity] pt-24"
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
                className="flex flex-col gap-6"
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
              >
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
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
                  );
                })}
              </motion.div>

              <div className="mt-10">
                <Link
                  href="/contact"
                  className="flex w-full items-center justify-center rounded-full bg-white py-4 text-lg font-bold text-slate-950 shadow-lg shadow-white/10 transition-transform active:scale-95"
                  onClick={() => setOpen(false)}
                >
                  Get in touch
                </Link>
              </div>
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
