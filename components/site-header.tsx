"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { navItems, siteConfig } from "@/lib/content";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";
import { cn } from "@/lib/utils";

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

  // Lock body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300",
          scrolled 
            ? "border-slate-950/50 bg-slate-950/80 backdrop-blur-xl py-3" 
            : "border-transparent bg-transparent py-5"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link 
            href="/" 
            className="group flex items-center gap-3" 
            onClick={() => setOpen(false)}
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 via-violet-500 to-emerald-400 shadow-lg shadow-sky-500/20 transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5 text-white" />
              <div className="absolute inset-0 rounded-xl bg-white/20 mix-blend-overlay" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 transition-colors group-hover:text-sky-400">
                {siteConfig.location.split(",")[0]}
              </span>
              <span className="mt-0.5 text-lg font-bold tracking-tight text-slate-100">
                {siteConfig.name}
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={cn(
                    "text-sm font-medium transition-all hover:text-white",
                    active ? "text-white" : "text-slate-400"
                  )}
                >
                  {item.label}
                  {active && (
                    <motion.div
                      layoutId="nav-dot"
                      className="mx-auto mt-1 h-1 w-1 rounded-full bg-sky-400"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
            
            <Link
              href="/contact"
              onTouchStart={mediumTap}
              className="ml-4 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:scale-105 active:scale-95"
            >
              Let&apos;s talk
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="relative z-50 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition-colors md:hidden"
            onClick={() => setOpen((v) => !v)}
            onTouchStart={lightTap}
            aria-label="Toggle navigation"
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
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-40 flex flex-col bg-slate-950/95 backdrop-blur-2xl md:hidden overflow-y-auto"
          >
             {/* Background Noise */}
            <div className="absolute inset-0 pointer-events-none opacity-20" 
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }} 
            />
            
            <nav className="relative flex flex-1 flex-col justify-center px-8">
              <div className="flex flex-col gap-8">
                {navItems.map((item, index) => {
                  const active = pathname === item.href;
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.05, duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
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
              </div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-16"
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
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="relative p-8 text-xs font-medium uppercase tracking-widest text-slate-600"
            >
               {siteConfig.location}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
