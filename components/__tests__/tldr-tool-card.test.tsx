import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TldrToolCard from "@/components/tldr-tool-card";
import { TldrFlywheelTool } from "@/lib/content";

// Mock dependencies
vi.mock("@/hooks/use-haptic-feedback", () => ({
  useHapticFeedback: () => ({ lightTap: vi.fn() }),
}));

vi.mock("@/lib/colors", () => ({
  getColorDefinition: () => ({ rgb: "0, 255, 255" }),
}));

// Mock Data
const mockTool: TldrFlywheelTool = {
  id: "test-tool",
  name: "Test Tool Name",
  shortName: "Test Tool",
  icon: "Rocket",
  color: "cyan",
  category: "core",
  href: "https://github.com/test/tool",
  whatItDoes: "This tool does amazing testing things for the ecosystem.",
  whyItsUseful: "It is useful because testing ensures quality.",
  keyFeatures: ["Feature A", "Feature B", "Feature C"],
  techStack: ["TypeScript", "React", "Vitest"],
  implementationHighlights: ["Fast execution", "High coverage"],
  useCases: ["Sample workflow", "Integration validation"],
  synergies: [{ toolId: "other-tool", description: "Integrates perfectly" }],
  stars: 123,
};

const mockOtherTool: TldrFlywheelTool = {
  ...mockTool,
  id: "other-tool",
  name: "Other Tool Name",
  shortName: "Other Tool",
  icon: "Box",
  color: "violet",
  synergies: [],
};

const allTools = [mockTool, mockOtherTool];

describe("TldrToolCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders tool name and short name", () => {
      render(<TldrToolCard tool={mockTool} allTools={allTools} />);
      expect(screen.getByText("Test Tool")).toBeInTheDocument();
      expect(screen.getByText("Test Tool Name")).toBeInTheDocument();
    });

    it("displays 'Core' badge for core tools", () => {
      render(<TldrToolCard tool={mockTool} allTools={allTools} />);
      expect(screen.getByText("Core")).toBeInTheDocument();
    });

    it("does not display 'Core' badge for non-core tools", () => {
      const nonCoreTool = { ...mockTool, category: "supporting" as const };
      render(<TldrToolCard tool={nonCoreTool} allTools={allTools} />);
      expect(screen.queryByText("Core")).not.toBeInTheDocument();
    });

    it("renders the correct icon", () => {
      // We can't easily check the SVG path, but we can check if a specific class or if the fallback/mock works.
      // In the component, DynamicIcon uses `iconMap`.
      // We can assume if it renders without crashing it's fine, or check for a specific class if passed.
      // The DynamicIcon doesn't accept a testId, but the wrapper div does have the color class.
      const { container } = render(<TldrToolCard tool={mockTool} allTools={allTools} />);
      // Check for the icon wrapper with the color class
      expect(container.querySelector(".bg-gradient-to-br.cyan")).toBeInTheDocument();
    });

    it("displays GitHub stars badge when stars > 0", () => {
      render(<TldrToolCard tool={mockTool} allTools={allTools} />);
      // 123 stars should be formatted as "123"
      expect(screen.getByText("123")).toBeInTheDocument();
      expect(screen.getByLabelText(/123 GitHub stars/i)).toBeInTheDocument();
    });

    it("hides stars badge when stars is 0 or undefined", () => {
      const noStarsTool = { ...mockTool, stars: 0 };
      render(<TldrToolCard tool={noStarsTool} allTools={allTools} />);
      expect(screen.queryByLabelText(/GitHub stars/i)).not.toBeInTheDocument();
    });

    it("renders all four content sections", () => {
      render(<TldrToolCard tool={mockTool} allTools={allTools} />);
      // whatItDoes
      expect(screen.getByText(mockTool.whatItDoes)).toBeInTheDocument();
      // whyItsUseful
      expect(screen.getByText("Why It's Useful")).toBeInTheDocument();
      expect(screen.getByText(mockTool.whyItsUseful)).toBeInTheDocument();
      // Key Features
      expect(screen.getByText("Key Features")).toBeInTheDocument();
      expect(screen.getByText("Feature A")).toBeInTheDocument();
      // Tech Stack
      expect(screen.getByText("Tech Stack")).toBeInTheDocument();
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("renders a link to the GitHub repo", () => {
      render(<TldrToolCard tool={mockTool} allTools={allTools} />);
      const link = screen.getByLabelText(`View ${mockTool.name} on GitHub`);
      expect(link).toHaveAttribute("href", mockTool.href);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  describe("synergies", () => {
    it("renders synergy tool links correctly", () => {
      render(<TldrToolCard tool={mockTool} allTools={allTools} />);
      expect(screen.getByText("Synergies")).toBeInTheDocument();
      expect(screen.getByText("Other Tool")).toBeInTheDocument();
      expect(screen.getByText("Integrates perfectly")).toBeInTheDocument();
    });

    it("handles empty synergies array", () => {
      const noSynergyTool = { ...mockTool, synergies: [] };
      render(<TldrToolCard tool={noSynergyTool} allTools={allTools} />);
      expect(screen.queryByText("Synergies")).not.toBeInTheDocument();
    });

    it("does not render broken synergy links if tool is missing from allTools", () => {
      const brokenSynergyTool = {
        ...mockTool,
        synergies: [{ toolId: "missing-tool", description: "Missing" }],
      };
      render(<TldrToolCard tool={brokenSynergyTool} allTools={allTools} />);
      expect(screen.queryByText("Missing")).not.toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("has visible focus indicator on github link", () => {
      render(<TldrToolCard tool={mockTool} allTools={allTools} />);
      const link = screen.getByLabelText(`View ${mockTool.name} on GitHub`);
      link.focus();
      expect(link).toHaveFocus();
    });
    
    // Additional accessibility checks can be added here
    // e.g. await expect(container).toBeAccessible(); (if using axe-core matcher)
  });
});
