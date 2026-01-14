import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SiteHeader from "../site-header";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      div: ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => <div {...props}>{children}</div>,
    },
    useReducedMotion: () => false,
  };
});

// Mock hooks
vi.mock("@/hooks/use-haptic-feedback", () => ({
  useHapticFeedback: () => ({
    lightTap: vi.fn(),
    mediumTap: vi.fn(),
  }),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("SiteHeader", () => {
  it("closes mobile menu when search is clicked", async () => {
    const onOpenCommandPalette = vi.fn();
    render(<SiteHeader onOpenCommandPalette={onOpenCommandPalette} />);

    // 1. Open mobile menu
    const menuToggle = screen.getByLabelText(/Open navigation menu/i);
    fireEvent.click(menuToggle);

    // Verify menu is open (check for a menu item)
    expect(screen.getByText("Get in touch")).toBeInTheDocument();

    // 2. Click mobile search button
    // Note: There are two search buttons (desktop and mobile). 
    // The mobile one is in the div with md:hidden.
    // We can select by aria-label "Search" which the mobile button has.
    // The desktop button has "Search site (Cmd+K)".
    const mobileSearchBtn = screen.getByLabelText("Search");
    fireEvent.click(mobileSearchBtn);

    // 3. Verify callback called
    expect(onOpenCommandPalette).toHaveBeenCalled();

    // 4. Verify menu is closed
    await waitFor(() => {
      expect(screen.queryByText("Get in touch")).not.toBeInTheDocument();
    });
  });
});
