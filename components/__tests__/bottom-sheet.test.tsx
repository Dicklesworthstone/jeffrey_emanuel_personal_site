import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import BottomSheet from "@/components/bottom-sheet";

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

// Mock the body scroll lock hook
vi.mock("@/hooks/use-body-scroll-lock", () => ({
  useBodyScrollLock: vi.fn(),
}));

describe("BottomSheet", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    children: <p>Sheet content here</p>,
  };

  beforeEach(() => {
    defaultProps.onClose = vi.fn();
  });

  describe("rendering", () => {
    it("renders children when open", () => {
      render(<BottomSheet {...defaultProps} />);
      expect(screen.getByText("Sheet content here")).toBeInTheDocument();
    });

    it("renders nothing when closed", () => {
      render(<BottomSheet {...defaultProps} isOpen={false} />);
      expect(screen.queryByText("Sheet content here")).not.toBeInTheDocument();
    });

    it("renders title when provided", () => {
      render(<BottomSheet {...defaultProps} title="My Sheet" />);
      expect(screen.getByText("My Sheet")).toBeInTheDocument();
    });

    it("renders dialog role with aria-modal", () => {
      render(<BottomSheet {...defaultProps} />);
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
    });

    it("renders drag handle by default", () => {
      render(<BottomSheet {...defaultProps} />);
      expect(screen.getByTestId("drag-handle")).toBeInTheDocument();
    });

    it("hides drag handle when showDragHandle is false", () => {
      render(<BottomSheet {...defaultProps} showDragHandle={false} />);
      expect(screen.queryByTestId("drag-handle")).not.toBeInTheDocument();
    });

    it("applies maxHeight style", () => {
      render(<BottomSheet {...defaultProps} maxHeight={75} />);
      const dialog = screen.getByTestId("bottom-sheet");
      expect(dialog).toHaveStyle({
        maxHeight: "min(75dvh, var(--mobile-viewport-height, 75vh))",
      });
    });

    it("applies contentClassName to content area", () => {
      render(<BottomSheet {...defaultProps} contentClassName="extra-padding" />);
      const content = screen.getByTestId("sheet-content");
      expect(content).toHaveClass("extra-padding");
    });
  });

  describe("close behavior", () => {
    it("calls onClose when close button is clicked (with title)", () => {
      render(<BottomSheet {...defaultProps} title="Test" />);
      const closeBtn = screen.getByRole("button", { name: /close/i });
      fireEvent.click(closeBtn);
      expect(defaultProps.onClose).toHaveBeenCalledOnce();
    });

    it("calls onClose when close button is clicked (without title)", () => {
      render(<BottomSheet {...defaultProps} />);
      const closeBtn = screen.getByRole("button", { name: /close/i });
      fireEvent.click(closeBtn);
      expect(defaultProps.onClose).toHaveBeenCalledOnce();
    });

    it("calls onClose on Escape key", () => {
      render(<BottomSheet {...defaultProps} />);
      fireEvent.keyDown(window, { key: "Escape" });
      expect(defaultProps.onClose).toHaveBeenCalledOnce();
    });

    it("does not call onClose on Escape when closeOnEscape is false", () => {
      render(<BottomSheet {...defaultProps} closeOnEscape={false} />);
      fireEvent.keyDown(window, { key: "Escape" });
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it("calls onClose when backdrop is clicked", () => {
      render(<BottomSheet {...defaultProps} />);
      // The backdrop is the element with aria-hidden="true" that covers the screen
      const backdrop = document.querySelector('[aria-hidden="true"]');
      if (backdrop) fireEvent.click(backdrop);
      expect(defaultProps.onClose).toHaveBeenCalledOnce();
    });

    it("does not call onClose on backdrop click when closeOnBackdrop is false", () => {
      render(<BottomSheet {...defaultProps} closeOnBackdrop={false} />);
      const backdrop = document.querySelector('[aria-hidden="true"]');
      if (backdrop) fireEvent.click(backdrop);
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  describe("accessibility", () => {
    it("has aria-labelledby linked to title", () => {
      render(<BottomSheet {...defaultProps} title="Accessible Sheet" />);
      const dialog = screen.getByRole("dialog");
      const titleId = dialog.getAttribute("aria-labelledby");
      expect(titleId).toBeTruthy();

      const heading = screen.getByText("Accessible Sheet");
      expect(heading.id).toBe(titleId);
    });

    it("does not have aria-labelledby when no title", () => {
      render(<BottomSheet {...defaultProps} />);
      const dialog = screen.getByRole("dialog");
      expect(dialog).not.toHaveAttribute("aria-labelledby");
    });

    it("close button meets minimum touch target size", () => {
      render(<BottomSheet {...defaultProps} title="Touch" />);
      const closeBtn = screen.getByRole("button", { name: /close/i });
      // Check for min-h-[44px] min-w-[44px] classes
      expect(closeBtn.className).toContain("min-h-[44px]");
      expect(closeBtn.className).toContain("min-w-[44px]");
    });
  });
});
