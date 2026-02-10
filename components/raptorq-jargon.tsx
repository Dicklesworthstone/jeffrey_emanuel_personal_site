"use client";

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useLayoutEffect,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { getJargon, type JargonTerm } from "@/lib/raptorq-jargon";
import BottomSheet from "@/components/bottom-sheet";

interface RaptorQJargonProps {
  /** The term key to look up in the dictionary */
  term: string;
  /** Optional: override the display text */
  children?: ReactNode;
  /** Optional: additional class names */
  className?: string;
}

/**
 * Jargon component for the RaptorQ article.
 * Desktop: tooltip on hover. Mobile: bottom sheet on tap.
 * Styled with cyan accent to match the article's visual identity.
 */
export function RaptorQJargon({ term, children, className }: RaptorQJargonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [tooltipLayout, setTooltipLayout] = useState<{
    position: "top" | "bottom";
    style: CSSProperties;
  }>({ position: "top", style: {} });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const prefersReducedMotion = useReducedMotion();

  const termKey = term.toLowerCase().replace(/[\s_]+/g, "-");
  const jargonData = getJargon(termKey);

  const canUsePortal = typeof document !== "undefined";

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current || isMobile) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const offsetWidth = triggerRef.current.offsetWidth;
    const position: "top" | "bottom" = rect.top < 200 ? "bottom" : "top";
    const left = Math.min(
      Math.max(16, rect.left - 140 + offsetWidth / 2),
      Math.max(16, window.innerWidth - 336)
    );
    const verticalStyle =
      position === "top"
        ? { bottom: window.innerHeight - rect.top + 8 }
        : { top: rect.bottom + 8 };

    setTooltipLayout({ position, style: { left, ...verticalStyle } });
  }, [isOpen, isMobile]);

  const handleMouseEnter = useCallback(() => {
    if (isMobile) return;
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    openTimeoutRef.current = setTimeout(() => setIsOpen(true), 300);
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (isMobile) return;
    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  }, [isMobile]);

  const handleFocus = useCallback(() => {
    if (isMobile) return;
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    setIsOpen(true);
  }, [isMobile]);

  const handleBlur = useCallback(
    (e: React.FocusEvent) => {
      if (isMobile) return;
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      const relatedTarget = e.relatedTarget as Node | null;
      if (relatedTarget && tooltipRef.current?.contains(relatedTarget)) return;
      closeTimeoutRef.current = setTimeout(() => setIsOpen(false), 150);
    },
    [isMobile]
  );

  const handleClick = useCallback(() => setIsOpen(true), []);
  const handleClose = useCallback(() => setIsOpen(false), []);

  if (!jargonData) {
    return <>{children || term}</>;
  }

  const displayText = children || jargonData.term;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(
          "relative inline cursor-help",
          "decoration-[1.5px] underline underline-offset-[3px]",
          "decoration-cyan-400/30 decoration-dotted",
          "transition-colors duration-150",
          "hover:decoration-cyan-400/60 hover:text-cyan-300",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020204] rounded-sm",
          className
        )}
        aria-label={`Learn about ${jargonData.term}`}
        aria-expanded={isOpen}
      >
        {displayText}
      </button>

      {/* Desktop Tooltip */}
      {canUsePortal &&
        createPortal(
          <AnimatePresence>
            {isOpen && !isMobile && (
              <motion.div
                ref={tooltipRef}
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        y: tooltipLayout.position === "top" ? 8 : -8,
                        scale: 0.95,
                      }
                }
                animate={
                  prefersReducedMotion
                    ? { opacity: 1 }
                    : { opacity: 1, y: 0, scale: 1 }
                }
                exit={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        y: tooltipLayout.position === "top" ? 8 : -8,
                        scale: 0.95,
                      }
                }
                transition={
                  prefersReducedMotion
                    ? { duration: 0.12 }
                    : { type: "spring", stiffness: 400, damping: 30 }
                }
                className={cn(
                  "fixed z-50 w-80 max-w-[calc(100vw-2rem)]",
                  "rounded-xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl",
                  "before:absolute before:inset-x-0 before:h-1 before:rounded-t-xl before:bg-gradient-to-r before:from-cyan-400/50 before:via-purple-500/50 before:to-cyan-400/50",
                  tooltipLayout.position === "top"
                    ? "before:top-0"
                    : "before:bottom-0 before:rounded-t-none before:rounded-b-xl"
                )}
                style={tooltipLayout.style}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onBlur={(e: React.FocusEvent) => {
                  const relatedTarget = e.relatedTarget as Node | null;
                  if (
                    relatedTarget &&
                    triggerRef.current?.contains(relatedTarget)
                  )
                    return;
                  if (
                    relatedTarget &&
                    tooltipRef.current?.contains(relatedTarget)
                  )
                    return;
                  closeTimeoutRef.current = setTimeout(
                    () => setIsOpen(false),
                    150
                  );
                }}
              >
                <TooltipContent term={jargonData} />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Mobile Bottom Sheet */}
      {canUsePortal && (
        <BottomSheet
          isOpen={isOpen && isMobile}
          onClose={handleClose}
          title={jargonData.term}
        >
          <SheetContent term={jargonData} />
        </BottomSheet>
      )}
    </>
  );
}

function TooltipContent({ term }: { term: JargonTerm }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-400/20 text-cyan-400">
          <Lightbulb className="h-3.5 w-3.5" />
        </div>
        <span className="font-semibold text-white">{term.term}</span>
      </div>
      <p className="text-sm leading-relaxed text-slate-400">{term.short}</p>
      {term.analogy && (
        <div className="rounded-lg bg-cyan-400/5 px-3 py-2 text-xs text-slate-400">
          <span className="font-medium text-cyan-400">Think of it like:</span>{" "}
          {term.analogy}
        </div>
      )}
      {term.related && term.related.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {term.related.map((r) => (
            <span
              key={r}
              className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-500"
            >
              {r}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SheetContent({ term }: { term: JargonTerm }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-purple-500/20 shadow-lg">
          <Lightbulb className="h-6 w-6 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{term.term}</h3>
          <p className="text-sm text-slate-400 line-clamp-2">{term.short}</p>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            What is it?
          </h4>
          <p className="text-sm leading-relaxed text-slate-200">{term.long}</p>
        </div>
        {term.why && (
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-cyan-400">
              Why it matters
            </p>
            <p className="text-sm leading-relaxed text-slate-200">
              {term.why}
            </p>
          </div>
        )}
        {term.analogy && (
          <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-purple-400">
              Think of it like...
            </p>
            <p className="text-sm leading-relaxed text-slate-200">
              {term.analogy}
            </p>
          </div>
        )}
        {term.related && term.related.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              Related Terms
            </h4>
            <div className="flex flex-wrap gap-2">
              {term.related.map((r) => (
                <span
                  key={r}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-400"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
