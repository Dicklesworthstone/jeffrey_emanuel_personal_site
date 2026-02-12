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
import { cn } from "@/lib/utils";
import BottomSheet from "@/components/bottom-sheet";

interface TooltipShellProps {
  /** The content to show as the trigger */
  children: ReactNode;
  /** The content to show inside the tooltip/sheet */
  tooltipContent: ReactNode;
  /** The content to show inside the bottom sheet (mobile) */
  sheetContent: ReactNode;
  /** Optional: title for the mobile sheet */
  title?: string;
  /** Optional: additional class names for the trigger */
  className?: string;
  /** Optional: aria-label for accessibility */
  ariaLabel?: string;
  /** Optional: accent color for the tooltip border/theme */
  accentColor?: string;
}

/**
 * A reusable shell for tooltips (desktop) and bottom sheets (mobile).
 */
export function TooltipShell({
  children,
  tooltipContent,
  sheetContent,
  title,
  className,
  ariaLabel,
  accentColor,
}: TooltipShellProps) {
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

  const canUsePortal = typeof document !== "undefined";

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || isMobile) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const offsetWidth = triggerRef.current.offsetWidth;
    const position: "top" | "bottom" = rect.top < 240 ? "bottom" : "top";
    
    // Center tooltip on trigger but keep within screen bounds
    const tooltipWidth = 320;
    let left = rect.left + offsetWidth / 2 - tooltipWidth / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));

    const verticalStyle =
      position === "top"
        ? { bottom: window.innerHeight - rect.top + 12 }
        : { top: rect.bottom + 12 };

    setTooltipLayout({ position, style: { left, ...verticalStyle } });
  }, [isMobile]);

  useEffect(() => {
    if (isOpen && !isMobile) {
      window.addEventListener("scroll", updatePosition, { passive: true });
      window.addEventListener("resize", updatePosition);
      updatePosition();
    }
    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, isMobile, updatePosition]);

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
    if (isOpen) updatePosition();
  }, [isOpen, updatePosition]);

  const handleMouseEnter = useCallback(() => {
    if (isMobile) return;
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    openTimeoutRef.current = setTimeout(() => setIsOpen(true), 250);
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
          "appearance-none bg-transparent border-none p-0 m-0 text-inherit font-inherit text-left cursor-help inline-block align-baseline",
          className
        )}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
      >
        {children}
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
                  "fixed z-[10000] w-80 max-w-[calc(100vw-2rem)]",
                  "rounded-xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl",
                  "before:absolute before:inset-x-0 before:h-1 before:rounded-t-xl",
                  tooltipLayout.position === "top"
                    ? "before:top-0"
                    : "before:bottom-0 before:rounded-t-none before:rounded-b-xl"
                )}
                style={{
                  ...tooltipLayout.style,
                  // Use inline style for dynamic theme color if provided
                  borderTopColor: tooltipLayout.position === "bottom" ? accentColor : undefined,
                  borderBottomColor: tooltipLayout.position === "top" ? accentColor : undefined,
                }}
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
                {/* Visual Top Bar */}
                <div 
                  className={cn(
                    "absolute inset-x-0 h-1 rounded-t-xl",
                    tooltipLayout.position === "top" ? "top-0" : "bottom-0 rounded-t-none rounded-b-xl"
                  )}
                  style={{ 
                    background: accentColor 
                      ? `linear-gradient(to right, ${accentColor}80, ${accentColor}, ${accentColor}80)` 
                      : "linear-gradient(to right, #22d3ee80, #a855f780, #22d3ee80)" 
                  }}
                />
                {tooltipContent}
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
          title={title}
        >
          {sheetContent}
        </BottomSheet>
      )}
    </>
  );
}
