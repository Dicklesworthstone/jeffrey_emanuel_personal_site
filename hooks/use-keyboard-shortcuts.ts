"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  description: string;
  action: () => void;
}

interface UseKeyboardShortcutsOptions {
  onOpenCommandPalette?: () => void;
  onOpenHelp?: () => void;
  enabled?: boolean;
}

/**
 * Hook for global keyboard shortcuts.
 *
 * Default shortcuts:
 * - 1-7: Navigate to sections (Home, About, Consulting, Projects, Writing, Media, Contact)
 * - /: Open command palette (search)
 * - ?: Open keyboard shortcuts help
 * - Cmd/Ctrl+K: Open command palette
 * - Escape: Close modals
 */
export function useKeyboardShortcuts({
  onOpenCommandPalette,
  onOpenHelp,
  enabled = true,
}: UseKeyboardShortcutsOptions = {}) {
  const router = useRouter();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

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

      // Number keys 1-7: Navigate to pages
      const routes = [
        "/",           // 1: Home
        "/about",      // 2: About
        "/consulting", // 3: Consulting
        "/projects",   // 4: Projects
        "/writing",    // 5: Writing
        "/media",      // 6: Media
        "/contact",    // 7: Contact
      ];

      const keyNum = parseInt(event.key);
      if (keyNum >= 1 && keyNum <= 7) {
        event.preventDefault();
        router.push(routes[keyNum - 1]);
        return;
      }

      // G + key combinations for quick navigation
      // (Could add "go to" shortcuts like gh for GitHub, etc.)
    },
    [enabled, onOpenCommandPalette, onOpenHelp, router]
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
  { keys: ["1"], description: "Go to Home", category: "navigation" },
  { keys: ["2"], description: "Go to About", category: "navigation" },
  { keys: ["3"], description: "Go to Consulting", category: "navigation" },
  { keys: ["4"], description: "Go to Projects", category: "navigation" },
  { keys: ["5"], description: "Go to Writing", category: "navigation" },
  { keys: ["6"], description: "Go to Media", category: "navigation" },
  { keys: ["7"], description: "Go to Contact", category: "navigation" },
  // Actions
  { keys: ["⌘", "K"], description: "Open command palette", category: "actions" },
  { keys: ["/"], description: "Quick search", category: "actions" },
  // General
  { keys: ["?"], description: "Show keyboard shortcuts", category: "general" },
  { keys: ["Esc"], description: "Close modals", category: "general" },
];

export default useKeyboardShortcuts;
