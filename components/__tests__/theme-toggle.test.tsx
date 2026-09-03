import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import {
  ThemeProvider,
  useTheme,
  resolveStoredTheme,
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
} from "../theme-provider";
import ThemeToggle from "../theme-toggle";

// The jsdom environment used here does not expose window.localStorage, so
// install a minimal in-memory Storage on both the window and the test global
// (the provider reads the bare `localStorage` binding, as browser code does).
const memoryStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  } satisfies Storage;
})();

for (const target of [window, globalThis]) {
  Object.defineProperty(target, "localStorage", { value: memoryStorage, configurable: true, writable: true });
}

function ThemeReadout() {
  const { theme, hydrated } = useTheme();
  return (
    <div data-testid="readout" data-hydrated={String(hydrated)}>
      {theme}
    </div>
  );
}

function ensureThemeColorMeta() {
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", "#020617");
  return meta;
}

describe("theme selection", () => {
  it("defaults to dark and only a stored 'light' opts in", () => {
    expect(DEFAULT_THEME).toBe("dark");
    expect(resolveStoredTheme(null)).toBe("dark");
    expect(resolveStoredTheme(undefined)).toBe("dark");
    expect(resolveStoredTheme("dark")).toBe("dark");
    expect(resolveStoredTheme("system")).toBe("dark");
    expect(resolveStoredTheme("garbage")).toBe("dark");
    expect(resolveStoredTheme("light")).toBe("light");
  });

  it("never consults the OS colour scheme", () => {
    // The site is dark-first; prefers-color-scheme must not leak in via the
    // provider (the inline script in app/layout.tsx is covered by the e2e suite).
    const matchMedia = vi.spyOn(window, "matchMedia");
    render(
      <ThemeProvider>
        <ThemeReadout />
      </ThemeProvider>
    );
    expect(screen.getByTestId("readout").textContent).toBe("dark");
    expect(matchMedia).not.toHaveBeenCalledWith("(prefers-color-scheme: dark)");
    expect(matchMedia).not.toHaveBeenCalledWith("(prefers-color-scheme: light)");
    matchMedia.mockRestore();
  });
});

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    ensureThemeColorMeta();
  });

  afterEach(() => {
    cleanup();
  });

  it("reads the class the pre-paint script left on <html>", () => {
    document.documentElement.classList.add("light");
    render(
      <ThemeProvider>
        <ThemeReadout />
      </ThemeProvider>
    );
    expect(screen.getByTestId("readout").textContent).toBe("light");
    expect(screen.getByTestId("readout").dataset.hydrated).toBe("true");
  });

  it("marks the document dark on mount when no class was stamped", () => {
    render(
      <ThemeProvider>
        <ThemeReadout />
      </ThemeProvider>
    );
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("light")).toBe(false);
  });

  it("toggles the document class, persists, and updates theme-color", () => {
    const meta = ensureThemeColorMeta();
    render(
      <ThemeProvider>
        <ThemeToggle variant="compact" />
        <ThemeReadout />
      </ThemeProvider>
    );

    const toggle = screen.getByRole("button", { name: /switch to light mode/i });
    fireEvent.click(toggle);

    expect(screen.getByTestId("readout").textContent).toBe("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(meta.getAttribute("content")).toBe("#f8fafc");

    fireEvent.click(screen.getByRole("button", { name: /switch to dark mode/i }));

    expect(screen.getByTestId("readout").textContent).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("light")).toBe(false);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(meta.getAttribute("content")).toBe("#020617");
  });

  it("follows a preference change made in another tab", () => {
    render(
      <ThemeProvider>
        <ThemeReadout />
      </ThemeProvider>
    );
    expect(screen.getByTestId("readout").textContent).toBe("dark");

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", { key: THEME_STORAGE_KEY, newValue: "light" })
      );
    });
    expect(screen.getByTestId("readout").textContent).toBe("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);

    // Clearing storage elsewhere (key === null) falls back to the default.
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: null, newValue: null }));
    });
    expect(screen.getByTestId("readout").textContent).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("ignores storage events for unrelated keys", () => {
    render(
      <ThemeProvider>
        <ThemeReadout />
      </ThemeProvider>
    );
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: "other", newValue: "light" }));
    });
    expect(screen.getByTestId("readout").textContent).toBe("dark");
  });

  it("throws when useTheme is used outside the provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<ThemeReadout />)).toThrow(/within a <ThemeProvider>/);
    spy.mockRestore();
  });
});

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the compact variant as a labelled button with the keyboard hint", () => {
    render(
      <ThemeProvider>
        <ThemeToggle variant="compact" />
      </ThemeProvider>
    );
    const toggle = screen.getByRole("button", { name: /switch to light mode/i });
    expect(toggle).toHaveAttribute("title", expect.stringContaining("(T)"));
  });

  it("renders the labeled variant as a switch that reports dark mode state", () => {
    render(
      <ThemeProvider>
        <ThemeToggle variant="labeled" />
      </ThemeProvider>
    );
    expect(screen.getByText("Appearance")).toBeInTheDocument();
    const toggle = screen.getByRole("switch", { name: /dark mode/i });
    expect(toggle).toHaveAttribute("aria-checked", "true");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });

  it("server-renders both icons so CSS can pick the right one before hydration", () => {
    // The server assumes dark, but a light-mode visitor's <html> already
    // carries `light` when the HTML paints. Rendering both icons with the
    // `light:` variant deciding visibility avoids a wrong first frame and a
    // hydration mismatch.
    const html = renderToString(
      <ThemeProvider>
        <ThemeToggle variant="compact" />
      </ThemeProvider>
    );
    expect(html).toContain("lucide-moon");
    expect(html).toContain("lucide-sun");
    expect(html).toContain("light:hidden");
    expect(html).toContain("light:block");
    expect(html).toContain('aria-label="Switch color theme"');
  });
});
