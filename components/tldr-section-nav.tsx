"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

interface SectionDef {
  id: string;
  label: string;
  shortLabel: string;
  count: number;
}

interface TldrSectionNavProps {
  sections: SectionDef[];
  /** ID of the element that, once scrolled past, triggers the nav to appear */
  triggerElementId: string;
  className?: string;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function TldrSectionNav({
  sections,
  triggerElementId,
  className,
}: TldrSectionNavProps) {
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion ?? false;
  const [visible, setVisible] = useState(false);
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? "");
  const observersRef = useRef<IntersectionObserver[]>([]);

  // Show nav after scrolling past the trigger element
  useEffect(() => {
    const trigger = document.getElementById(triggerElementId);
    if (!trigger) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(trigger);
    return () => observer.disconnect();
  }, [triggerElementId]);

  // Track which section is in view
  useEffect(() => {
    // Disconnect previous observers
    observersRef.current.forEach((o) => o.disconnect());
    observersRef.current = [];

    const newObservers = sections.map((section) => {
      const element = document.getElementById(section.id);
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(section.id);
          }
        },
        { rootMargin: "-40% 0px -40% 0px" }
      );
      if (element) observer.observe(element);
      return observer;
    });

    observersRef.current = newObservers;
    return () => newObservers.forEach((o) => o.disconnect());
  }, [sections]);

  // Scroll to section on click
  const handleNavigate = useCallback(
    (sectionId: string) => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: reducedMotion ? "instant" : "smooth",
          block: "start",
        });
      }
    },
    [reducedMotion]
  );

  if (sections.length === 0) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
          transition={{ duration: reducedMotion ? 0 : 0.25 }}
          role="navigation"
          aria-label="Page sections"
          className={cn(
            "sticky top-12 z-40 border-b border-white/5 bg-slate-950/80 backdrop-blur-lg md:top-16",
            className
          )}
        >
          <div className="container mx-auto flex gap-1 overflow-x-auto px-4 py-2 sm:gap-4 sm:px-6 sm:py-3">
            {sections.map((section) => {
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => handleNavigate(section.id)}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "relative whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50",
                    isActive
                      ? "text-white"
                      : "text-slate-400 hover:text-slate-200"
                  )}
                >
                  {/* Active underline indicator */}
                  {isActive && (
                    <motion.span
                      layoutId="section-nav-indicator"
                      className="absolute inset-x-1 -bottom-2 h-0.5 rounded-full bg-violet-500 sm:-bottom-3"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="hidden sm:inline">{section.label}</span>
                  <span className="sm:hidden">{section.shortLabel}</span>
                  <span className="ml-1 text-slate-500">
                    ({section.count})
                  </span>
                </button>
              );
            })}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}

export default TldrSectionNav;
