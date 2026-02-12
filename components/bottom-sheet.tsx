"use client";

import { useEffect, useId, useRef, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useDragControls,
  type PanInfo,
} from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";

interface BottomSheetProps {
  /** Whether the sheet is open */
  isOpen: boolean;
  /** Callback when sheet should close */
  onClose: () => void;
  /** Optional title for the sheet header */
  title?: string;
  /** Sheet content */
  children: React.ReactNode;
  /** Maximum height as percentage of viewport (default: 90) */
  maxHeight?: number;
  /** Whether to show drag handle (default: true) */
  showDragHandle?: boolean;
  /** Whether to close on backdrop click (default: true) */
  closeOnBackdrop?: boolean;
  /** Whether to close on Escape key (default: true) */
  closeOnEscape?: boolean;
  /** Callback when open animation completes */
  onOpenComplete?: () => void;
  /** Additional class for the sheet content area */
  contentClassName?: string;
}

/**
 * Mobile-optimized bottom sheet component with swipe-to-dismiss,
 * focus trapping, and native app-like behavior.
 */
export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  maxHeight = 95,
  showDragHandle = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  onOpenComplete,
  contentClassName,
}: BottomSheetProps) {
  const { mediumTap } = useHapticFeedback();
  const titleId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const prefersReducedMotion = useReducedMotion();

  // Lock body scroll when open
  useBodyScrollLock(isOpen);

  // Close on escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Focus trap: cycle Tab within the sheet
  useEffect(() => {
    if (!isOpen || !sheetRef.current) return;

    const sheet = sheetRef.current;

    // Focus the first focusable element on open
    const focusFirst = () => {
      const focusable = sheet.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable[0]?.focus();
    };
    // Small delay so the animation has started and elements are rendered
    const raf = requestAnimationFrame(focusFirst);

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusable = sheet.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    sheet.addEventListener("keydown", handleTab);
    return () => {
      cancelAnimationFrame(raf);
      sheet.removeEventListener("keydown", handleTab);
    };
  }, [isOpen]);

  // Swipe-to-dismiss: close when dragged down past threshold or with velocity
  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.y > 100 || info.velocity.y > 500) {
        onClose();
      }
    },
    [onClose]
  );

  const handleBackdropClick = useCallback(() => {
    if (closeOnBackdrop) {
      onClose();
    }
  }, [closeOnBackdrop, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm md:hidden"
            onClick={handleBackdropClick}
            onTouchStart={mediumTap}
            aria-hidden="true"
          />

          {/* Bottom Sheet */}
          <motion.div
            ref={sheetRef}
            initial={prefersReducedMotion ? { y: 0 } : { y: "100%" }}
            animate={{ y: 0 }}
            exit={prefersReducedMotion ? { y: 0, opacity: 0 } : { y: "100%" }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 400, damping: 40 }
            }
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            onAnimationComplete={() => onOpenComplete?.()}
            className="fixed inset-x-0 bottom-0 z-50 overflow-hidden rounded-t-3xl border-t border-slate-700/80 bg-slate-950 shadow-2xl md:hidden flex flex-col"
            style={{ maxHeight: `${maxHeight}vh` }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            data-testid="bottom-sheet"
          >
            {/* Drag handle */}
            {showDragHandle && (
              <div
                className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => dragControls.start(e)}
                data-testid="drag-handle"
              >
                <div className="h-1 w-12 rounded-full bg-slate-700" />
              </div>
            )}

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between border-b border-slate-800/80 px-4 pb-3 sm:px-6 sm:pb-4">
                <h2 id={titleId} className="text-base font-semibold text-slate-50 sm:text-lg">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  onTouchStart={mediumTap}
                  className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Close button when no title */}
            {!title && (
              <button
                onClick={onClose}
                onTouchStart={mediumTap}
                className="absolute top-4 right-4 z-10 rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {/* Content */}
            <div
              className={cn(
                "flex-1 overflow-y-auto overscroll-contain p-6",
                !title && "pt-4",
                contentClassName
              )}
              style={{
                maxHeight: `calc(${maxHeight}vh - ${title ? 80 : 60}px)`,
              }}
              data-testid="sheet-content"
            >
              {children}
            </div>

            {/* iOS safe area padding */}
            <div className="pb-[env(safe-area-inset-bottom)]" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
