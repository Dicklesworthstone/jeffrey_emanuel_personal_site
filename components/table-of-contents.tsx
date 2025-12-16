"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { List, ChevronRight, X } from "lucide-react";
import type { TocHeading } from "@/lib/extract-headings";
import { cn } from "@/lib/utils";

interface TableOfContentsProps {
  headings: TocHeading[];
}

/**
 * Floating table of contents with scroll-spy functionality.
 * Shows current section and provides quick navigation.
 */
export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Scroll-spy: track which heading is currently in view
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first heading that's intersecting
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      {
        rootMargin: "-100px 0px -70% 0px",
        threshold: 0,
      }
    );

    // Observe all headings
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  // Smooth scroll to heading
  const scrollToHeading = useCallback(
    (id: string) => {
      const element = document.getElementById(id);
      if (element) {
        const offset = 120; // Account for fixed header
        const top = element.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({
          top,
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
        setIsOpen(false);
      }
    },
    [prefersReducedMotion]
  );

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Don't render if no headings
  if (headings.length === 0) return null;

  const activeHeading = headings.find((h) => h.id === activeId);

  return (
    <>
      {/* Mobile/Tablet: Floating toggle button */}
      <div className="fixed bottom-24 right-4 z-40 xl:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-md transition-all",
            isOpen
              ? "bg-violet-500 text-white"
              : "border border-white/10 bg-slate-900/90 text-slate-300 hover:bg-slate-800"
          )}
          aria-label="Toggle table of contents"
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <>
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Contents</span>
            </>
          )}
        </button>
      </div>

      {/* Mobile/Tablet: Dropdown panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm xl:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-40 right-4 z-40 w-72 rounded-2xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl xl:hidden"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Contents
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav className="max-h-[50vh] overflow-y-auto">
                <ul className="space-y-1">
                  {headings.map((heading) => (
                    <li key={heading.id}>
                      <button
                        onClick={() => scrollToHeading(heading.id)}
                        className={cn(
                          "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                          heading.level === 3 && "pl-6",
                          activeId === heading.id
                            ? "bg-violet-500/20 text-violet-300"
                            : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                        )}
                      >
                        <span className="line-clamp-2">{heading.text}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop: Sidebar TOC */}
      <aside className="hidden xl:block fixed top-32 right-8 w-64 max-h-[calc(100vh-160px)] overflow-y-auto">
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-md">
          <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
            <List className="h-4 w-4" />
            On this page
          </h3>
          <nav>
            <ul className="space-y-1">
              {headings.map((heading) => (
                <li key={heading.id}>
                  <button
                    onClick={() => scrollToHeading(heading.id)}
                    className={cn(
                      "group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all",
                      heading.level === 3 && "pl-5",
                      activeId === heading.id
                        ? "bg-violet-500/20 text-violet-300"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    )}
                  >
                    <ChevronRight
                      className={cn(
                        "h-3 w-3 transition-transform",
                        activeId === heading.id
                          ? "text-violet-400"
                          : "text-slate-600 group-hover:text-slate-400"
                      )}
                    />
                    <span className="line-clamp-2">{heading.text}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Current section indicator */}
        {activeHeading && (
          <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400">
              Reading
            </p>
            <p className="mt-1 text-sm font-medium text-slate-300 line-clamp-2">
              {activeHeading.text}
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
