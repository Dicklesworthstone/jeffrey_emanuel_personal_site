import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../theme-provider";
import ThemeToggle from "../theme-toggle";

const storageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: storageMock,
  writable: true,
});

describe("Theme System & ThemeToggle", () => {
  beforeEach(() => {
    storageMock.clear();
    document.documentElement.className = "";
    document.documentElement.removeAttribute("data-theme");
  });

  it("renders compact theme toggle button with accessible switch role", () => {
    render(
      <ThemeProvider>
        <ThemeToggle variant="compact" />
      </ThemeProvider>
    );

    const toggle = screen.getByRole("switch");
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-label");
  });

  it("toggles between dark and light mode on click", () => {
    function TestConsumer() {
      const { resolvedTheme } = useTheme();
      return <div data-testid="theme-val">{resolvedTheme}</div>;
    }

    storageMock.setItem("theme", "dark");

    render(
      <ThemeProvider>
        <ThemeToggle variant="compact" />
        <TestConsumer />
      </ThemeProvider>
    );

    const toggle = screen.getByRole("switch");
    const themeVal = screen.getByTestId("theme-val");

    // Initial state is dark
    expect(themeVal.textContent).toBe("dark");

    // Click to switch to light mode
    fireEvent.click(toggle);
    expect(themeVal.textContent).toBe("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem("theme")).toBe("light");

    // Click again to switch back to dark mode
    fireEvent.click(toggle);
    expect(themeVal.textContent).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("renders labeled variant with Appearance text and theme badge", () => {
    render(
      <ThemeProvider>
        <ThemeToggle variant="labeled" />
      </ThemeProvider>
    );

    expect(screen.getByText("Appearance")).toBeInTheDocument();
    const toggle = screen.getByRole("switch");
    expect(toggle).toBeInTheDocument();
  });
});
