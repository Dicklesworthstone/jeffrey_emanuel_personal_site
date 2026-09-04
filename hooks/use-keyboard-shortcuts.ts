"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
// Root-layout hook: import from the small site-config module, not lib/content,
// so every route doesn't ship the full content chunk (see lib/site-config.ts).
import { navItems } from "@/lib/site-config";

interface UseKeyboardShortcutsOptions {
  onOpenCommandPalette?: () => void;
  onOpenHelp?: () => void;
  onToggleTheme?: () => void;
  enabled?: boolean;
  /**
   * Single-key (unmodified) shortcuts can fire from speech input or a tremor,
   * so WCAG 2.1.4 requires a way to switch them off. Cmd/Ctrl+K stays on.
   */
  singleKeyEnabled?: boolean;
}

/** localStorage key holding "off" when the visitor disabled single-key shortcuts. */
export const SINGLE_KEY_SHORTCUTS_STORAGE_KEY = "shortcuts";

/**
 * Hook for global keyboard shortcuts.
 *
 * Default shortcuts:
 * - 1-8: Navigate to sections in navItems order (Home, About, Consulting, Projects, Flywheel, Writing, Media, Contact)
 * - /: Open command palette (search)
 * - ?: Open keyboard shortcuts help
 * - T: Toggle light / dark mode
 * - Cmd/Ctrl+K: Open command palette (always on)
 * - Escape: Close modals
 */
export function useKeyboardShortcuts({
  onOpenCommandPalette,
  onOpenHelp,
  onToggleTheme,
  enabled = true,
  singleKeyEnabled = true,
}: UseKeyboardShortcutsOptions = {}) {
  const router = useRouter();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs, choosing in a
      // <select>, operating an ARIA widget, or while a dialog/sheet is open.
      const target = event.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable ||
        Boolean(
          target.closest?.(
            '[role="dialog"], [role="slider"], [role="listbox"], [role="textbox"], [role="combobox"], [contenteditable="true"], [data-shortcuts-off]'
          )
        );

      // Allow Cmd+K even in inputs
      const isCmdK =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";

      if (isInput && !isCmdK) return;

      // Cmd/Ctrl+K: Open command palette
      if (isCmdK) {
        event.preventDefault();
        onOpenCommandPalette?.();
        return;
      }

      // Don't trigger single-key shortcuts with modifiers (except ?)
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      // Visitor opted out of single-key shortcuts (see the shortcuts modal).
      if (!singleKeyEnabled) return;

      // /: Open command palette (search mode)
      if (event.key === "/" && !event.shiftKey) {
        event.preventDefault();
        onOpenCommandPalette?.();
        return;
      }

      // ?: Open help modal
      if (event.key === "?" || (event.shiftKey && event.key === "/")) {
        event.preventDefault();
        onOpenHelp?.();
        return;
      }

      // T: Toggle light / dark mode
      if (event.key.toLowerCase() === "t" && !event.shiftKey) {
        event.preventDefault();
        onToggleTheme?.();
        return;
      }

      // Number keys 1-9: Navigate to pages based on navItems order
      const keyNum = parseInt(event.key);
      if (keyNum >= 1 && keyNum <= navItems.length) {
        event.preventDefault();
        router.push(navItems[keyNum - 1].href);
        return;
      }

      // G + key combinations for quick navigation
      // (Could add "go to" shortcuts like gh for GitHub, etc.)
    },
    [enabled, singleKeyEnabled, onOpenCommandPalette, onOpenHelp, onToggleTheme, router]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, handleKeyDown]);
}

/**
 * List of all keyboard shortcuts for display in help modal
 */
export const keyboardShortcutsList: Array<{
  keys: string[];
  description: string;
  category: "navigation" | "actions" | "general";
}> = [
  // Navigation
  ...navItems.map((item, index) => ({
    keys: [(index + 1).toString()],
    description: `Go to ${item.label}`,
    category: "navigation" as const,
  })),
  // Actions
  { keys: ["⌘", "K"], description: "Open command palette", category: "actions" },
  { keys: ["/"], description: "Quick search", category: "actions" },
  { keys: ["T"], description: "Toggle light / dark mode", category: "actions" },
  // General
  { keys: ["?"], description: "Show keyboard shortcuts", category: "general" },
  { keys: ["Esc"], description: "Close modals", category: "general" },
];

export default useKeyboardShortcuts;
