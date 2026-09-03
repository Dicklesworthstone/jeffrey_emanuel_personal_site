"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

export type Theme = "dark" | "light";

/** localStorage key read by the pre-paint script in app/layout.tsx. */
export const THEME_STORAGE_KEY = "theme";

/**
 * The site is designed dark-first, so dark is the default for every visitor
 * regardless of OS preference. Light mode is strictly opt-in via the toggle.
 * (Following `prefers-color-scheme` shipped once and put light-OS visitors on
 * an untested surface — keep this explicit.)
 */
export const DEFAULT_THEME: Theme = "dark";

const THEME_COLOR: Record<Theme, string> = {
  dark: "#020617",
  light: "#f8fafc",
};

/** Mirrors the selection logic of the inline script: only a stored "light" wins. */
export function resolveStoredTheme(stored: string | null | undefined): Theme {
  return stored === "light" ? "light" : DEFAULT_THEME;
}

/**
 * The <html> class is the single source of truth. The inline script stamps it
 * before first paint, so reading it back here means React state can never
 * disagree with what is already on screen.
 */
function readDocumentTheme(): Theme {
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

function applyThemeToDocument(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLOR[theme]);
}

// Tiny external store: subscribers re-render when the document theme changes.
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify() {
  listeners.forEach((listener) => listener());
}

function getServerSnapshot(): Theme {
  return DEFAULT_THEME;
}

const noopSubscribe = () => () => {};
const getHydratedSnapshot = () => true;
const getHydratedServerSnapshot = () => false;

interface ThemeContextValue {
  /** Theme currently applied to the document (the server always assumes dark). */
  theme: Theme;
  /**
   * False during SSR and hydration, when `theme` is the server assumption
   * rather than the real document state. Consumers that must be correct on
   * the very first paint should render CSS-driven (`light:` / `dark:`)
   * markup until this flips to true.
   */
  hydrated: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, readDocumentTheme, getServerSnapshot);
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    getHydratedSnapshot,
    getHydratedServerSnapshot
  );

  const setTheme = useCallback((next: Theme) => {
    applyThemeToDocument(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage blocked (private mode, disabled cookies): the choice still
      // applies for this page view.
    }
    notify();
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(readDocumentTheme() === "dark" ? "light" : "dark");
  }, [setTheme]);

  useEffect(() => {
    // Re-apply once on mount so the theme-color meta tag (server-rendered as
    // dark) matches whatever the inline script chose, and so a blocked script
    // still leaves the document explicitly marked dark.
    applyThemeToDocument(readDocumentTheme());

    // Cross-tab sync: another tab changed (or cleared) the stored preference.
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== THEME_STORAGE_KEY) return;
      const next = resolveStoredTheme(event.newValue);
      if (next === readDocumentTheme()) return;
      applyThemeToDocument(next);
      notify();
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, hydrated, setTheme, toggleTheme }),
    [theme, hydrated, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a <ThemeProvider>");
  }
  return context;
}
