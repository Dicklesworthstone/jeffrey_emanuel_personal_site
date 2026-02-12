"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Keyboard } from "lucide-react";
import { keyboardShortcutsList } from "@/hooks/use-keyboard-shortcuts";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal displaying all available keyboard shortcuts.
 * Accessible, animated, and keyboard-navigable.
 */
export default function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastActiveElement = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Initialize with Mac default to match SSR, update after hydration
  const [modifier, setModifier] = useState("⌘");

  // Focus management
  useEffect(() => {
    if (isOpen) {
      lastActiveElement.current = document.activeElement as HTMLElement;
      closeButtonRef.current?.focus();
    } else {
      lastActiveElement.current?.focus();
    }
  }, [isOpen]);

  // Detect OS for modifier key - must run after hydration to avoid mismatch
  useEffect(() => {
    if (typeof navigator !== "undefined" && !/Mac|iPod|iPhone|iPad/.test(navigator.platform)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Required for SSR hydration safety
      setModifier("Ctrl");
    }
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useBodyScrollLock(isOpen);

  // Trap focus inside the modal while open
  useEffect(() => {
    if (!isOpen) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const container = modalRef.current;
      if (!container) return;

      const focusable = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (active === first || !container.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleTab);
    return () => window.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  const navigationShortcuts = keyboardShortcutsList.filter(
    (s) => s.category === "navigation"
  );
  const actionShortcuts = keyboardShortcutsList.filter(
    (s) => s.category === "actions"
  );
  const generalShortcuts = keyboardShortcutsList.filter(
    (s) => s.category === "general"
  );

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
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-4 top-[max(4rem,7dvh)] z-[101] mx-auto max-w-lg sm:inset-x-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcuts-title"
          >
            <div
              ref={modalRef}
              className="rounded-2xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl"
            >
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600">
                    <Keyboard className="h-5 w-5 text-white" />
                  </div>
                  <h2
                    id="shortcuts-title"
                    className="text-lg font-bold text-white"
                  >
                    Keyboard Shortcuts
                  </h2>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close shortcuts modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Shortcuts List */}
              <div className="space-y-6">
                {/* Navigation */}
                <ShortcutSection title="Navigation" shortcuts={navigationShortcuts} modifier={modifier} />

                {/* Actions */}
                <ShortcutSection title="Actions" shortcuts={actionShortcuts} modifier={modifier} />

                {/* General */}
                <ShortcutSection title="General" shortcuts={generalShortcuts} modifier={modifier} />
              </div>

              {/* Footer hint */}
              <p className="mt-6 text-center text-xs text-slate-500">
                Press <Kbd>?</Kbd> anytime to show this help
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ShortcutSection({
  title,
  shortcuts,
  modifier,
}: {
  title: string;
  shortcuts: typeof keyboardShortcutsList;
  modifier: string;
}) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
        {title}
      </h3>
      <div className="space-y-2">
        {shortcuts.map((shortcut) => (
          <div
            key={shortcut.description}
            className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-white/5"
          >
            <span className="text-sm text-slate-300">{shortcut.description}</span>
            <div className="flex items-center gap-1">
              {shortcut.keys.map((key) => (
                <Kbd key={key}>{key === "⌘" ? modifier : key}</Kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex min-w-[24px] items-center justify-center rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300">
      {children}
    </kbd>
  );
}
