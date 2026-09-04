"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
 *
 * Layout: the article column is `max-w-3xl` centered inside `max-w-5xl`, so
 * its right edge sits at `50% + 24rem`. The fixed sidebar is anchored to
 * `50% + 26rem` and only shown from the 2xl breakpoint (1536px), where
 * `50% + 26rem + 16rem = 1440px` still fits inside the viewport. Between
 * 1280px and 1535px a right-anchored sidebar would overlap the text, so those
 * widths use the floating toggle + panel instead.
 */
export default function TableOfContents({ headings }: TableOfContentsProps) {
  const defaultHeadingId = headings[0]?.id ?? "";
  const [activeId, setActiveId] = useState<string>(defaultHeadingId);
  const [isOpen, setIsOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Scroll-spy: track which heading is currently in view
  const visibleIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (headings.length === 0) return;
    if (typeof IntersectionObserver === "undefined") return;

    visibleIds.current.clear();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleIds.current.add(entry.target.id);
          } else {
            visibleIds.current.delete(entry.target.id);
          }
        });

        // Find the first heading that is currently visible
        const visibleHeading = headings.find((h) => visibleIds.current.has(h.id));
        if (visibleHeading) {
          setActiveId(visibleHeading.id);
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

  // Smooth scroll to heading (offset by the fixed header) and sync the URL hash
  const scrollToHeading = useCallback(
    (id: string) => {
      const element = document.getElementById(id);
      if (!element) return;

      const headerElement = document.querySelector("header");
      const headerHeight = headerElement
        ? headerElement.getBoundingClientRect().height
        : 88;
      const offset = headerHeight + 12;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({
        top,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
      if (window.location.hash !== `#${id}`) {
        window.history.pushState(null, "", `#${id}`);
      }
      setIsOpen(false);
    },
    [prefersReducedMotion]
  );

  const handleHeadingClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      // Let modified clicks (open in new tab, etc.) behave like a normal link.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      scrollToHeading(id);
    },
    [scrollToHeading]
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

  // Dialog focus management: move focus into the panel on open and hand it
  // back to whatever opened it (the toggle button) on close.
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      closeButtonRef.current?.focus();
      return;
    }
    const previous = previousFocusRef.current;
    previousFocusRef.current = null;
    if (previous && previous.isConnected) previous.focus();
  }, [isOpen]);

  // Don't render if no headings
  if (headings.length === 0) return null;

  const resolvedActiveId = headings.some((h) => h.id === activeId)
    ? activeId
    : defaultHeadingId;
  const activeHeading = headings.find((h) => h.id === resolvedActiveId);

  return (
    <>
      {/* Mobile/Tablet/Desktop < 2xl: Floating toggle button */}
      <div className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-4 z-40 2xl:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-md transition-all",
            isOpen
              ? "bg-violet-500 text-white"
              : "border border-white/10 bg-slate-900/90 text-slate-300 hover:bg-slate-800"
          )}
          aria-label="Toggle table of contents"
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <X className="h-4 w-4" aria-hidden="true" />
          ) : (
            <>
              <List className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Contents</span>
            </>
          )}
        </button>
      </div>

      {/* Floating panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm 2xl:hidden cursor-pointer"
              aria-hidden="true"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-[calc(3rem+env(safe-area-inset-bottom))] right-4 z-40 w-72 rounded-2xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl 2xl:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Table of contents"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Contents
                </h3>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="-m-2 inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:text-white"
                  aria-label="Close table of contents"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <nav
                aria-label="Table of contents"
                className="max-h-[min(50dvh,var(--mobile-viewport-height,50vh))] overflow-y-auto"
              >
                <ul className="space-y-1">
                  {headings.map((heading) => {
                    const isActive = resolvedActiveId === heading.id;
                    return (
                      <li key={heading.id}>
                        <a
                          href={`#${heading.id}`}
                          onClick={(event) => handleHeadingClick(event, heading.id)}
                          aria-current={isActive ? "location" : undefined}
                          className={cn(
                            "block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                            heading.level === 3 && "pl-6",
                            isActive
                              ? "bg-violet-500/20 text-violet-300"
                              : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                          )}
                        >
                          <span className="line-clamp-2">{heading.text}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Wide desktop (2xl+): sidebar anchored beside the reading column */}
      <aside className="hidden 2xl:block fixed top-32 left-[calc(50%+26rem)] w-64 max-h-[min(calc(100vh-160px),calc(100dvh-160px))] overflow-y-auto">
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-md">
          <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
            <List className="h-4 w-4" aria-hidden="true" />
            On this page
          </h3>
          <nav aria-label="Table of contents">
            <ul className="space-y-1">
              {headings.map((heading) => {
                const isActive = resolvedActiveId === heading.id;
                return (
                  <li key={heading.id}>
                    <a
                      href={`#${heading.id}`}
                      onClick={(event) => handleHeadingClick(event, heading.id)}
                      aria-current={isActive ? "location" : undefined}
                      className={cn(
                        "group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all",
                        heading.level === 3 && "pl-5",
                        isActive
                          ? "bg-violet-500/20 text-violet-300"
                          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      )}
                    >
                      <ChevronRight
                        aria-hidden="true"
                        className={cn(
                          "h-3 w-3 shrink-0 transition-transform",
                          isActive
                            ? "text-violet-400"
                            : "text-slate-500 group-hover:text-slate-400"
                        )}
                      />
                      <span className="line-clamp-2">{heading.text}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Current section indicator (visual only; aria-current on the link carries the state) */}
        {activeHeading && (
          <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-3" aria-hidden="true">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-400">
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
