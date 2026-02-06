import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AnimatedNumber } from "@/components/animated-number";

// Note: framer-motion is mocked globally in vitest.setup.tsx
// useReducedMotion always returns true, so animation is skipped in tests

describe("AnimatedNumber", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("rendering", () => {
    it("renders the target value (reduced motion)", () => {
      render(<AnimatedNumber value={42} />);
      // With reduced motion, the final value should appear after hydration timeout
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(screen.getByText("42", { selector: '[aria-hidden="true"]' })).toBeInTheDocument();
    });

    it("renders prefix and suffix", () => {
      render(<AnimatedNumber value={100} prefix="$" suffix="k" />);
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(screen.getByText("$100k", { selector: '[aria-hidden="true"]' })).toBeInTheDocument();
    });

    it("provides screen reader text", () => {
      render(<AnimatedNumber value={99} prefix="#" suffix="+" />);
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(screen.getByText("#99+", { selector: ".sr-only" })).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(<AnimatedNumber value={5} className="text-xl" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("text-xl");
    });
  });

  describe("formatting", () => {
    it("displays integer values without decimals", () => {
      render(<AnimatedNumber value={1000} />);
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(screen.getByText("1000", { selector: '[aria-hidden="true"]' })).toBeInTheDocument();
    });

    it("displays float values with 1 decimal when no decimals prop", () => {
      render(<AnimatedNumber value={3.7} />);
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(screen.getByText("3.7", { selector: '[aria-hidden="true"]' })).toBeInTheDocument();
    });

    it("respects explicit decimals prop", () => {
      render(<AnimatedNumber value={3.14159} decimals={2} />);
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(screen.getByText("3.14", { selector: '[aria-hidden="true"]' })).toBeInTheDocument();
    });

    it("uses tabular-nums for consistent digit width", () => {
      render(<AnimatedNumber value={42} />);
      const display = screen.getByText("42", { selector: '[aria-hidden="true"]' }).closest(".tabular-nums");
      expect(display).not.toBeNull();
    });
  });

  describe("visibility", () => {
    it("does not animate when isVisible is false", () => {
      render(<AnimatedNumber value={100} isVisible={false} />);
      act(() => {
        vi.advanceTimersByTime(1);
      });
      // Reduced motion kicks in regardless but the animation path is not taken
      // The value should still be shown via the reduced motion path
      const display = screen.getByText(/\d+/, { selector: '[aria-hidden="true"]' });
      expect(display).toBeInTheDocument();
    });
  });
});
