"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";

export type Theme = "dark" | "light" | "system";
export type ResolvedTheme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_STORAGE_KEY = "theme";

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyThemeToDocument(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  
  if (resolved === "light") {
    root.classList.add("light");
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
    root.style.colorScheme = "light";
  } else {
    root.classList.add("dark");
    root.classList.remove("light");
    root.setAttribute("data-theme", "dark");
    root.style.colorScheme = "dark";
  }

  // Update meta theme-color for mobile status bar
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", resolved === "light" ? "#f8fafc" : "#020617");
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage or document class set by the anti-FOUC script
  useEffect(() => {
    let initialTheme: Theme = "system";
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (stored === "light" || stored === "dark") {
        initialTheme = stored;
      }
    } catch {
      // Storage access blocked or unavailable
    }

    const system = getSystemTheme();
    const resolved = initialTheme === "system" ? system : initialTheme;

    // Check if inline script already set a class
    const isDocumentLight = document.documentElement.classList.contains("light");
    const activeResolved = isDocumentLight ? "light" : resolved;

    setThemeState(initialTheme);
    setResolvedTheme(activeResolved);
    applyThemeToDocument(activeResolved);
    setMounted(true);
  }, []);

  // Set theme with persistence
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    const resolved = newTheme === "system" ? getSystemTheme() : newTheme;
    setResolvedTheme(resolved);
    applyThemeToDocument(resolved);

    try {
      if (newTheme === "system") {
        localStorage.removeItem(THEME_STORAGE_KEY);
      } else {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      }
    } catch {
      // Storage access blocked
    }
  }, []);

  // Quick toggle between light and dark
  const toggleTheme = useCallback(() => {
    const nextTheme: ResolvedTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  }, [resolvedTheme, setTheme]);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (!stored || stored === "system") {
          const next = e.matches ? "dark" : "light";
          setResolvedTheme(next);
          applyThemeToDocument(next);
        }
      } catch {
        // Ignore
      }
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  // Listen for cross-tab storage changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY) {
        const nextStored = e.newValue as Theme | null;
        if (nextStored === "light" || nextStored === "dark") {
          setThemeState(nextStored);
          setResolvedTheme(nextStored);
          applyThemeToDocument(nextStored);
        } else {
          setThemeState("system");
          const sys = getSystemTheme();
          setResolvedTheme(sys);
          applyThemeToDocument(sys);
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme: mounted ? resolvedTheme : "dark",
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme, mounted, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: "dark" as const,
      resolvedTheme: "dark" as const,
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return context;
}
