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
  /** Optional: color theme (default: cyan) */
  variant?: "cyan" | "purple" | "emerald" | "amber" | "orange" | "rose" | "blue";
  /** Optional: accent color for dynamic theme */
  accentColor?: string;
  /** Optional: class name for the portal wrapper to preserve scoped styles */
  portalClassName?: string;
}

/**
 * A robust, reusable shell for tooltips (desktop) and bottom sheets (mobile).
 * Standardized across all articles to prevent "UI traps" and layout inconsistencies.
 */
export function TooltipShell({
  children,
  tooltipContent,
  sheetContent,
  title,
  className,
  ariaLabel,
  variant = "cyan",
  accentColor,
  portalClassName,
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

  const handleClick = useCallback(() => {
    if (isMobile) {
      setIsOpen(true);
    }
  }, [isMobile]);

  const handleClose = useCallback(() => setIsOpen(false), []);

  const variantStyles = {
    cyan: "#22d3ee",
    purple: "#a855f7",
    emerald: "#10b981",
    amber: "#f59e0b",
    orange: "#f97316",
    rose: "#f43f5e",
    blue: "#3b82f6",
  };

  const themeColor = accentColor || variantStyles[variant];

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
          "appearance-none bg-transparent border-none p-0 m-0 text-inherit font-inherit text-left cursor-help inline focus:outline-none",
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
                  "rounded-2xl border border-white/10 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-2xl",
                  portalClassName
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
                {/* Theme Bar */}
                <div 
                  className={cn(
                    "absolute inset-x-0 h-1",
                    tooltipLayout.position === "top" ? "top-0 rounded-t-2xl" : "bottom-0 rounded-b-2xl"
                  )}
                  style={{ 
                    background: `linear-gradient(to right, ${themeColor}40, ${themeColor}, ${themeColor}40)` 
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
          <div className={cn("pb-4", portalClassName)}>
            {sheetContent}
          </div>
        </BottomSheet>
      )}
    </>
  );
}
