import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TldrToolGrid from "@/components/tldr-tool-grid";
import { TldrFlywheelTool } from "@/lib/content";

// Mock ToolCard to simplify output
vi.mock("@/components/tldr-tool-card", () => ({
  TldrToolCard: ({ tool }: { tool: TldrFlywheelTool }) => (
    <div data-testid="tool-card">{tool.name}</div>
  ),
}));

// Mock Data
const mockTools: TldrFlywheelTool[] = [
  {
    id: "tool-1",
    name: "Alpha Tool",
    shortName: "Alpha",
    category: "core",
    whatItDoes: "Does core things",
    whyItsUseful: "Useful for core",
    techStack: ["TS"],
    keyFeatures: ["A"],
    synergies: [],
    icon: "Box",
    color: "cyan",
    href: "#",
    implementationHighlights: [],
    useCases: []
  },
  {
    id: "tool-2",
    name: "Beta Tool",
    shortName: "Beta",
    category: "core",
    whatItDoes: "Does other core things",
    whyItsUseful: "Useful also",
    techStack: ["Rust"],
    keyFeatures: ["B"],
    synergies: [],
    icon: "Rocket",
    color: "violet",
    href: "#",
    implementationHighlights: [],
    useCases: []
  },
  {
    id: "tool-3",
    name: "Gamma Tool",
    shortName: "Gamma",
    category: "supporting",
    whatItDoes: "Helps core",
    whyItsUseful: "Helper",
    techStack: ["Go"],
    keyFeatures: ["C"],
    synergies: [],
    icon: "Wrench",
    color: "amber",
    href: "#",
    implementationHighlights: [],
    useCases: []
  },
];

describe("TldrToolGrid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("layout", () => {
    it("renders all provided tools", () => {
      render(<TldrToolGrid tools={mockTools} />);
      expect(screen.getAllByTestId("tool-card")).toHaveLength(3);
    });

    it("renders category headers with counts", () => {
      render(<TldrToolGrid tools={mockTools} />);
      expect(screen.getByText("Core Flywheel Tools")).toBeInTheDocument();
      expect(screen.getByText("(2)")).toBeInTheDocument();
      expect(screen.getByText("Supporting Tools")).toBeInTheDocument();
      expect(screen.getByText("(1)")).toBeInTheDocument();
    });
  });

  describe("search filtering", () => {
    it("filters tools based on search query", async () => {
      render(<TldrToolGrid tools={mockTools} />);
      const searchInput = screen.getByPlaceholderText("Search tools...");
      
      fireEvent.change(searchInput, { target: { value: "Alpha" } });
      
      // Should show only Alpha
      expect(screen.getByText("Alpha Tool")).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.queryByText("Beta Tool")).not.toBeInTheDocument();
        expect(screen.queryByText("Gamma Tool")).not.toBeInTheDocument();
      });
      
      // Count update
      const status = screen.getByRole("status");
      expect(status).toHaveTextContent(/Showing\s+1\s+of\s+3\s+tools/);
    });

    it("searches by tech stack", async () => {
        render(<TldrToolGrid tools={mockTools} />);
        const searchInput = screen.getByPlaceholderText("Search tools...");
        
        fireEvent.change(searchInput, { target: { value: "Rust" } });
        
        expect(screen.getByText("Beta Tool")).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.queryByText("Alpha Tool")).not.toBeInTheDocument();
        });
    });

    it("shows empty state when no matches found", async () => {
        render(<TldrToolGrid tools={mockTools} />);
        const searchInput = screen.getByPlaceholderText("Search tools...");
        
        fireEvent.change(searchInput, { target: { value: "NonExistent" } });
        
        // Use a more specific query for the heading in the empty state
        expect(screen.getByRole("heading", { name: /No tools match "NonExistent"/i })).toBeInTheDocument();
        expect(screen.queryByTestId("tool-card")).not.toBeInTheDocument();
    });

    it("clears search when clear button clicked", async () => {
        render(<TldrToolGrid tools={mockTools} />);
        const searchInput = screen.getByPlaceholderText("Search tools...");
        
        fireEvent.change(searchInput, { target: { value: "Alpha" } });
        expect(searchInput).toHaveValue("Alpha");
        
        // The clear button in the search bar
        const clearButton = screen.getByLabelText("Clear search");
        fireEvent.click(clearButton);
        
        expect(searchInput).toHaveValue("");
        expect(screen.getAllByTestId("tool-card")).toHaveLength(3);
    });
    
    it("clears search when clear button in empty state clicked", async () => {
        render(<TldrToolGrid tools={mockTools} />);
        const searchInput = screen.getByPlaceholderText("Search tools...");
        
        fireEvent.change(searchInput, { target: { value: "NonExistent" } });
        
        // Click the "Clear search" text which is inside the big button
        fireEvent.click(screen.getByText("Clear search"));
        
        expect(searchInput).toHaveValue("");
        expect(screen.getAllByTestId("tool-card")).toHaveLength(3);
    });
  });

  describe("keyboard interaction", () => {
      it("focuses search input when '/' is pressed", () => {
          render(<TldrToolGrid tools={mockTools} />);
          const searchInput = screen.getByPlaceholderText("Search tools...");
          
          fireEvent.keyDown(window, { key: "/" });
          expect(searchInput).toHaveFocus();
      });

      it("clears search on Escape", () => {
          render(<TldrToolGrid tools={mockTools} />);
          const searchInput = screen.getByPlaceholderText("Search tools...");
          
          fireEvent.change(searchInput, { target: { value: "Test" } });
          fireEvent.keyDown(window, { key: "Escape" });
          
          expect(searchInput).toHaveValue("");
      });
  });
});
