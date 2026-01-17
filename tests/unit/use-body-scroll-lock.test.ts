import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";

describe("useBodyScrollLock", () => {
  // Mock window.innerWidth and document.documentElement.clientWidth
  // to simulate a scrollbar width of 15px
  const originalInnerWidth = window.innerWidth;
  const originalClientWidth = document.documentElement.clientWidth;

  beforeEach(() => {
    // Reset body styles
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
    document.documentElement.style.removeProperty("--scrollbar-width");

    // Mock dimensions for scrollbar calculation
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(document.documentElement, "clientWidth", {
      writable: true,
      configurable: true,
      value: 1009, // 1024 - 15px scrollbar
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(document.documentElement, "clientWidth", {
      writable: true,
      configurable: true,
      value: originalClientWidth,
    });
  });

  it("should lock body scroll when isLocked is true", () => {
    renderHook(() => useBodyScrollLock(true));

    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.paddingRight).toBe("15px");
    expect(document.documentElement.style.getPropertyValue("--scrollbar-width")).toBe("15px");
  });

  it("should not lock body scroll when isLocked is false", () => {
    renderHook(() => useBodyScrollLock(false));

    expect(document.body.style.overflow).toBe("");
    expect(document.body.style.paddingRight).toBe("");
  });

  it("should restore body scroll when unmounted", () => {
    const { unmount } = renderHook(() => useBodyScrollLock(true));

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("");
    expect(document.body.style.paddingRight).toBe("");
    expect(document.documentElement.style.getPropertyValue("--scrollbar-width")).toBe("");
  });

  it("should handle nested locks (reference counting)", () => {
    // Mount first hook
    const hook1 = renderHook(() => useBodyScrollLock(true));
    expect(document.body.style.overflow).toBe("hidden");

    // Mount second hook
    const hook2 = renderHook(() => useBodyScrollLock(true));
    expect(document.body.style.overflow).toBe("hidden");

    // Unmount first hook - should stay locked
    hook1.unmount();
    expect(document.body.style.overflow).toBe("hidden");

    // Unmount second hook - should unlock
    hook2.unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("should update when isLocked changes", () => {
    const { rerender } = renderHook(({ locked }) => useBodyScrollLock(locked), {
      initialProps: { locked: false },
    });

    expect(document.body.style.overflow).toBe("");

    // Enable lock
    rerender({ locked: true });
    expect(document.body.style.overflow).toBe("hidden");

    // Disable lock
    rerender({ locked: false });
    expect(document.body.style.overflow).toBe("");
  });
});
