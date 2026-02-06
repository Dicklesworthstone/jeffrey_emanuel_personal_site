import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TldrSectionNav } from "@/components/tldr-section-nav";

// framer-motion is mocked globally: useReducedMotion returns true

const mockSections = [
  { id: "section-a", label: "Section Alpha", shortLabel: "Alpha", count: 5 },
  { id: "section-b", label: "Section Beta", shortLabel: "Beta", count: 3 },
  { id: "section-c", label: "Section Gamma", shortLabel: "Gamma", count: 8 },
];

/**
 * Helper: install a constructor-compatible IntersectionObserver mock that
 * immediately invokes the callback with `isIntersecting: false` on observe(),
 * simulating the trigger element being out of view (making the nav visible).
 */
function installVisibleObserverMock() {
  global.IntersectionObserver = class MockIO {
    cb: IntersectionObserverCallback;
    root = null;
    rootMargin = "";
    thresholds: number[] = [];
    constructor(cb: IntersectionObserverCallback) {
      this.cb = cb;
    }
    observe() {
      this.cb(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver
      );
    }
    disconnect = vi.fn();
    unobserve = vi.fn();
    takeRecords = vi.fn().mockReturnValue([]);
  } as unknown as typeof IntersectionObserver;
}

describe("TldrSectionNav", () => {
  beforeEach(() => {
    // Create DOM elements that the component will query
    const trigger = document.createElement("div");
    trigger.id = "trigger-el";
    document.body.appendChild(trigger);

    mockSections.forEach((s) => {
      const el = document.createElement("div");
      el.id = s.id;
      document.body.appendChild(el);
    });
  });

  afterEach(() => {
    // Clean up DOM
    document.body.innerHTML = "";
  });

  describe("rendering", () => {
    it("renders nothing when sections is empty", () => {
      const { container } = render(
        <TldrSectionNav sections={[]} triggerElementId="trigger-el" />
      );
      expect(container.innerHTML).toBe("");
    });

    it("renders section buttons with labels and counts", () => {
      installVisibleObserverMock();

      render(
        <TldrSectionNav sections={mockSections} triggerElementId="trigger-el" />
      );

      // Full labels (hidden on mobile via CSS but still in DOM)
      expect(screen.getByText("Section Alpha")).toBeInTheDocument();
      expect(screen.getByText("Section Beta")).toBeInTheDocument();
      expect(screen.getByText("Section Gamma")).toBeInTheDocument();

      // Short labels also in DOM
      expect(screen.getByText("Alpha")).toBeInTheDocument();
      expect(screen.getByText("Beta")).toBeInTheDocument();

      // Counts
      expect(screen.getByText("(5)")).toBeInTheDocument();
      expect(screen.getByText("(3)")).toBeInTheDocument();
      expect(screen.getByText("(8)")).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("scrolls to section on button click", () => {
      installVisibleObserverMock();

      // Add scrollIntoView mock to section elements
      const sectionEl = document.getElementById("section-b");
      if (sectionEl) {
        sectionEl.scrollIntoView = vi.fn();
      }

      render(
        <TldrSectionNav sections={mockSections} triggerElementId="trigger-el" />
      );

      const betaButton = screen.getByText("Section Beta").closest("button")!;
      fireEvent.click(betaButton);

      expect(sectionEl?.scrollIntoView).toHaveBeenCalledWith({
        behavior: "instant", // reduced motion = instant
        block: "start",
      });
    });

    it("marks active section with aria-current", () => {
      installVisibleObserverMock();

      render(
        <TldrSectionNav sections={mockSections} triggerElementId="trigger-el" />
      );

      // First section should be active by default
      const firstButton = screen.getByText("Section Alpha").closest("button")!;
      expect(firstButton).toHaveAttribute("aria-current", "true");

      // Other buttons should not have aria-current
      const secondButton = screen.getByText("Section Beta").closest("button")!;
      expect(secondButton).not.toHaveAttribute("aria-current");
    });
  });

  describe("accessibility", () => {
    it("has navigation role and aria-label", () => {
      installVisibleObserverMock();

      render(
        <TldrSectionNav sections={mockSections} triggerElementId="trigger-el" />
      );

      const nav = screen.getByRole("navigation", { name: /page sections/i });
      expect(nav).toBeInTheDocument();
    });

    it("buttons have focus-visible styles", () => {
      installVisibleObserverMock();

      render(
        <TldrSectionNav sections={mockSections} triggerElementId="trigger-el" />
      );

      const button = screen.getByText("Section Alpha").closest("button")!;
      expect(button.className).toContain("focus-visible:ring-2");
    });

    it("applies custom className to nav wrapper", () => {
      installVisibleObserverMock();

      render(
        <TldrSectionNav
          sections={mockSections}
          triggerElementId="trigger-el"
          className="extra-class"
        />
      );

      const nav = screen.getByRole("navigation");
      expect(nav).toHaveClass("extra-class");
    });
  });
});
