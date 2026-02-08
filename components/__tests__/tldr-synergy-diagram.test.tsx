import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TldrSynergyDiagram from "@/components/tldr-synergy-diagram";
import { TldrFlywheelTool } from "@/lib/content";

// Mock dependencies
vi.mock("@/lib/colors", () => ({
  getColorDefinition: () => ({ from: "red", to: "blue", rgb: "255,0,0" }),
}));

// Mock Data
const mockTools: TldrFlywheelTool[] = [
  {
    id: "tool-a",
    name: "Tool Alpha",
    shortName: "Alpha",
    category: "core",
    whatItDoes: "Core stuff",
    whyItsUseful: "Useful",
    techStack: ["TS"],
    keyFeatures: [],
    synergies: [{ toolId: "tool-b", description: "Connects to B" }],
    icon: "Box",
    color: "cyan",
    href: "#",
    implementationHighlights: [],
    useCases: []
  },
  {
    id: "tool-b",
    name: "Tool Beta",
    shortName: "Beta",
    category: "core",
    whatItDoes: "Core stuff",
    whyItsUseful: "Useful",
    techStack: ["Rust"],
    keyFeatures: [],
    synergies: [{ toolId: "tool-a", description: "Connects to A" }],
    icon: "Rocket",
    color: "violet",
    href: "#",
    implementationHighlights: [],
    useCases: []
  },
  {
    id: "tool-c",
    name: "Tool Gamma",
    shortName: "Gamma",
    category: "supporting",
    whatItDoes: "Support stuff",
    whyItsUseful: "Useful",
    techStack: ["Go"],
    keyFeatures: [],
    synergies: [{ toolId: "tool-a", description: "Connects to A" }],
    icon: "Wrench",
    color: "amber",
    href: "#",
    implementationHighlights: [],
    useCases: []
  },
];

describe("TldrSynergyDiagram", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders core tool nodes only", () => {
      render(<TldrSynergyDiagram tools={mockTools} />);
      
      // Should find Alpha and Beta text
      expect(screen.getByText("Alpha")).toBeInTheDocument();
      expect(screen.getByText("Beta")).toBeInTheDocument();
      
      // Should NOT find Gamma (supporting)
      expect(screen.queryByText("Gamma")).not.toBeInTheDocument();
      
      // Verify node count (circles for nodes)
      // Note: There are other circles (center glow, ring, label bg).
      // We can rely on the text presence for nodes.
    });

    it("renders center label correctly", () => {
      render(<TldrSynergyDiagram tools={mockTools} />);
      expect(screen.getByText("Flywheel")).toBeInTheDocument();
      expect(screen.getByText("2 Core Tools")).toBeInTheDocument();
    });

    it("renders connection lines", () => {
      const { container } = render(<TldrSynergyDiagram tools={mockTools} />);
      // The component uses motion.path for connection lines, which renders as <path>
      // We expect at least 1 path for the connection between A and B (deduped)
      const svg = container.querySelector("svg");
      const paths = svg?.querySelectorAll("path") ?? [];
      expect(paths.length).toBeGreaterThan(0);
    });
    
    it("renders correct ARIA label", () => {
        render(<TldrSynergyDiagram tools={mockTools} />);
        const svg = screen.getByLabelText("Flywheel tool synergy diagram showing connections between core tools. Click a tool to scroll to its details.");
        expect(svg).toBeInTheDocument();
    });
  });

  describe("responsiveness", () => {
     // Checking if the SVG has viewBox set for scaling
     it("has viewBox attribute for scaling", () => {
         render(<TldrSynergyDiagram tools={mockTools} />);
         const svg = screen.getByLabelText("Flywheel tool synergy diagram showing connections between core tools. Click a tool to scroll to its details.");
         expect(svg).toHaveAttribute("viewBox", "0 0 460 460");
     });
  });
});
