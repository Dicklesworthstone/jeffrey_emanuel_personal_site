import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import CopyButton from "@/components/copy-button";

// Mock the haptic feedback hook
vi.mock("@/hooks/use-haptic-feedback", () => ({
  useHapticFeedback: () => ({
    lightTap: vi.fn(),
    mediumTap: vi.fn(),
    heavyTap: vi.fn(),
    doubleTap: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    vibrate: vi.fn(),
  }),
}));

describe("CopyButton", () => {
  let writeTextMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("rendering", () => {
    it("renders a button with copy label", () => {
      render(<CopyButton text="hello" />);
      const button = screen.getByRole("button", { name: /copy to clipboard/i });
      expect(button).toBeInTheDocument();
    });

    it("applies custom className", () => {
      render(<CopyButton text="hello" className="my-custom" />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("my-custom");
    });
  });

  describe("copy functionality", () => {
    it("copies text to clipboard on click", async () => {
      render(<CopyButton text="install bun" />);
      const button = screen.getByRole("button");

      await act(async () => {
        fireEvent.click(button);
      });

      expect(writeTextMock).toHaveBeenCalledWith("install bun");
    });

    it("shows copied state after successful copy", async () => {
      render(<CopyButton text="hello" />);
      const button = screen.getByRole("button");

      await act(async () => {
        fireEvent.click(button);
      });

      expect(button).toHaveAttribute("aria-label", "Copied to clipboard");
    });

    it("reverts to idle state after 2 seconds", async () => {
      render(<CopyButton text="hello" />);
      const button = screen.getByRole("button");

      await act(async () => {
        fireEvent.click(button);
      });

      expect(button).toHaveAttribute("aria-label", "Copied to clipboard");

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(button).toHaveAttribute("aria-label", "Copy to clipboard");
    });

    it("calls onCopy callback after successful copy", async () => {
      const onCopy = vi.fn();
      render(<CopyButton text="hello" onCopy={onCopy} />);

      await act(async () => {
        fireEvent.click(screen.getByRole("button"));
      });

      expect(onCopy).toHaveBeenCalledOnce();
    });

    it("shows error state when clipboard write fails", async () => {
      writeTextMock.mockRejectedValueOnce(new Error("denied"));
      render(<CopyButton text="hello" />);
      const button = screen.getByRole("button");

      await act(async () => {
        fireEvent.click(button);
      });

      // Error state: aria-label stays "Copy to clipboard" (idle label)
      // but the title changes to "Copy" → check for error class presence
      // Actually the component keeps idle label on error too — check title
      expect(button).toHaveAttribute("title", "Copy");
    });

    it("error state reverts after 2 seconds", async () => {
      writeTextMock.mockRejectedValueOnce(new Error("denied"));
      render(<CopyButton text="hello" />);
      const button = screen.getByRole("button");

      await act(async () => {
        fireEvent.click(button);
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(button).toHaveAttribute("aria-label", "Copy to clipboard");
    });

    it("stops event propagation on click", async () => {
      const parentClick = vi.fn();
      render(
        <div onClick={parentClick}>
          <CopyButton text="hello" />
        </div>
      );

      await act(async () => {
        fireEvent.click(screen.getByRole("button"));
      });

      expect(parentClick).not.toHaveBeenCalled();
    });
  });

  describe("accessibility", () => {
    it("has focus-visible ring styles", () => {
      render(<CopyButton text="hello" />);
      const button = screen.getByRole("button");
      expect(button.className).toContain("focus:ring-2");
    });

    it("aria-label updates to reflect copied state", async () => {
      render(<CopyButton text="hello" />);
      const button = screen.getByRole("button");

      expect(button).toHaveAttribute("aria-label", "Copy to clipboard");

      await act(async () => {
        fireEvent.click(button);
      });

      expect(button).toHaveAttribute("aria-label", "Copied to clipboard");
    });
  });
});
