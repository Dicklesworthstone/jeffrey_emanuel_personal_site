"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { navItems } from "@/lib/content";

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
  ...navItems.map((item, index) => ({
    keys: [(index + 1).toString()],
    description: `Go to ${item.label}`,
    category: "navigation" as const,
  })),
  // Actions
  { keys: ["⌘", "K"], description: "Open command palette", category: "actions" },
  { keys: ["/"], description: "Quick search", category: "actions" },
  // General
  { keys: ["?"], description: "Show keyboard shortcuts", category: "general" },
  { keys: ["Esc"], description: "Close modals", category: "general" },
];

export default useKeyboardShortcuts;
