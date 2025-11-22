"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { navItems, siteConfig } from "@/lib/content";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { lightTap, mediumTap } = useHapticFeedback();

  // Shrink header on scroll (mobile only)
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header 
        className={`sticky top-0 z-40 border-b border-slate-900/50 bg-slate-950/70 backdrop-blur-xl transition-all duration-300 safe-top ${
          scrolled ? "shadow-lg shadow-slate-950/50" : ""
        }`}
      >
        <div className={`mx-auto flex max-w-6xl items-center justify-between px-4 transition-all duration-300 sm:px-6 lg:px-8 ${scrolled ? "py-3" : "py-4 sm:py-5"}`}>
          <Link href="/" className="group flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 via-violet-500 to-emerald-400 shadow-lg shadow-slate-900/50 transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5 text-white" />
              <div className="absolute inset-0 rounded-xl bg-white/20 mix-blend-overlay" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 transition-colors group-hover:text-sky-400">
                {siteConfig.location.split(",")[0]}
              </span>
              <span className="mt-0.5 text-base font-bold text-slate-100">
                {siteConfig.name}
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className="relative px-3 py-2 text-sm font-medium transition-colors hover:text-slate-100">
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-slate-800/50"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 ${active ? "text-sky-100" : "text-slate-400"}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/contact"
              onTouchStart={mediumTap}
              className="hidden md:inline-flex items-center justify-center rounded-full border border-slate-700/60 bg-slate-800/40 px-4 py-2 text-sm font-semibold text-slate-200 shadow-sm shadow-slate-950/50 ring-1 ring-inset ring-white/5 transition-all hover:bg-slate-800 hover:text-white hover:ring-white/10 active:scale-95"
            >
              Let&apos;s talk
            </Link>

            <button
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-slate-800/50 hover:text-white md:hidden"
              onClick={() => setOpen((v) => !v)}
              onTouchStart={lightTap}
              aria-label="Toggle navigation"
              aria-expanded={open}
            >
              <AnimatePresence mode="wait" initial={false}>
                {open ? (
                  <motion.div
                    key="close"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed top-[60px] left-0 right-0 z-30 overflow-hidden border-b border-slate-800/50 bg-slate-950/95 backdrop-blur-xl md:hidden"
            style={{ position: "absolute", top: "100%" }} // Position relative to the sticky header
          >
            <nav className="flex flex-col px-4 py-6">
              {navItems.map((item, index) => {
                const active = pathname === item.href;
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center justify-between border-b border-slate-800/30 py-4 text-lg font-medium transition-colors ${
                        active ? "text-sky-400" : "text-slate-300"
                      }`}
                      onClick={() => setOpen(false)}
                      onTouchStart={lightTap}
                    >
                      {item.label}
                      {active && <div className="h-1.5 w-1.5 rounded-full bg-sky-400" />}
                    </Link>
                  </motion.div>
                );
              })}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6"
              >
                <Link
                  href="/contact"
                  className="flex w-full items-center justify-center rounded-xl bg-sky-500 py-3 text-base font-bold text-slate-950 shadow-lg shadow-sky-500/25 transition-transform active:scale-[0.98]"
                  onClick={() => setOpen(false)}
                >
                  Get in touch
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
