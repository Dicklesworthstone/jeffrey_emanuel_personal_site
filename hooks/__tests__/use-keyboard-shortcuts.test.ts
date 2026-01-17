import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useRouter } from "next/navigation";

// Mock router
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

describe("useKeyboardShortcuts", () => {
  const pushMock = vi.fn();
  const onOpenCommandPaletteMock = vi.fn();
  const onOpenHelpMock = vi.fn();
  const mockedUseRouter = vi.mocked(useRouter);
  const routerMock: ReturnType<typeof useRouter> = {
    push: pushMock,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  };

  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    mockedUseRouter.mockReturnValue(routerMock);
  });

  afterEach(() => {
    // Restore window listener
    vi.restoreAllMocks();
  });

  it("triggers command palette on Cmd+K", () => {
    renderHook(() =>
      useKeyboardShortcuts({ onOpenCommandPalette: onOpenCommandPaletteMock })
    );

    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
    });
    
    // Prevent default must be mocked since jsdom doesn't fully support it for some events
    Object.defineProperty(event, "preventDefault", { value: vi.fn() });
    
    window.dispatchEvent(event);

    expect(onOpenCommandPaletteMock).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("triggers command palette on Ctrl+K", () => {
    renderHook(() =>
      useKeyboardShortcuts({ onOpenCommandPalette: onOpenCommandPaletteMock })
    );

    const event = new KeyboardEvent("keydown", {
      key: "k",
      ctrlKey: true,
      bubbles: true,
    });
    Object.defineProperty(event, "preventDefault", { value: vi.fn() });
    window.dispatchEvent(event);

    expect(onOpenCommandPaletteMock).toHaveBeenCalled();
  });

  it("triggers command palette on '/'", () => {
    renderHook(() =>
      useKeyboardShortcuts({ onOpenCommandPalette: onOpenCommandPaletteMock })
    );

    const event = new KeyboardEvent("keydown", { key: "/", bubbles: true });
    Object.defineProperty(event, "preventDefault", { value: vi.fn() });
    window.dispatchEvent(event);

    expect(onOpenCommandPaletteMock).toHaveBeenCalled();
  });

  it("does NOT trigger command palette on '/' if in an input", () => {
    renderHook(() =>
      useKeyboardShortcuts({ onOpenCommandPalette: onOpenCommandPaletteMock })
    );

    // Create and focus an input
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    const event = new KeyboardEvent("keydown", { key: "/", bubbles: true });
    input.dispatchEvent(event); // Dispatch from the input element

    expect(onOpenCommandPaletteMock).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it("triggers help modal on '?'", () => {
    renderHook(() =>
      useKeyboardShortcuts({ onOpenHelp: onOpenHelpMock })
    );

    // ? is usually shift + /
    const event = new KeyboardEvent("keydown", { key: "?", bubbles: true });
    Object.defineProperty(event, "preventDefault", { value: vi.fn() });
    window.dispatchEvent(event);

    expect(onOpenHelpMock).toHaveBeenCalled();
  });

  it("navigates on number keys (1-9)", () => {
    renderHook(() => useKeyboardShortcuts({}));

    // Test key '1'
    const event = new KeyboardEvent("keydown", { key: "1", bubbles: true });
    Object.defineProperty(event, "preventDefault", { value: vi.fn() });
    window.dispatchEvent(event);

    expect(pushMock).toHaveBeenCalledWith("/"); // Home page is index 0
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("does nothing when enabled is false", () => {
    renderHook(() =>
      useKeyboardShortcuts({
        onOpenCommandPalette: onOpenCommandPaletteMock,
        enabled: false,
      })
    );

    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
    });
    window.dispatchEvent(event);

    expect(onOpenCommandPaletteMock).not.toHaveBeenCalled();
  });
});
