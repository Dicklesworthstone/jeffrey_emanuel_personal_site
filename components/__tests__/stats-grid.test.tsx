import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import StatsGrid from "../stats-grid";

describe("StatsGrid", () => {
  const mockStats = [
    { label: "Projects", value: "50+", helper: "Open source projects" },
    { label: "Stars", value: "10K", helper: "GitHub stars" },
    { label: "Commits", value: "1,234" },
    { label: "Audience on X", value: "ignored" }, // This triggers XStatsCard
  ];

  beforeEach(() => {
    console.log("[TEST] Setting up StatsGrid test");
  });

  describe("rendering", () => {
    it("renders all stats", () => {
      console.log("[TEST] Testing that all stats render");
      render(<StatsGrid stats={mockStats} />);

      console.log("[TEST] Checking Projects stat");
      expect(screen.getByText("Projects")).toBeInTheDocument();

      console.log("[TEST] Checking Stars stat");
      expect(screen.getByText("Stars")).toBeInTheDocument();

      console.log("[TEST] Checking Commits stat");
      expect(screen.getByText("Commits")).toBeInTheDocument();

      console.log("[TEST] All stats rendered correctly");
    });

    it("renders helper text when provided", () => {
      console.log("[TEST] Testing helper text rendering");
      render(<StatsGrid stats={mockStats} />);

      expect(screen.getByText("Open source projects")).toBeInTheDocument();
      expect(screen.getByText("GitHub stars")).toBeInTheDocument();
      console.log("[TEST] Helper text rendered correctly");
    });

    it("uses XStatsCard for X/Twitter stat", () => {
      console.log("[TEST] Testing XStatsCard integration");
      render(<StatsGrid stats={mockStats} />);

      // The real XStatsCard renders "Audience on X" as a dt
      expect(screen.getAllByText("Audience on X").length).toBeGreaterThan(0);
      console.log("[TEST] XStatsCard rendered for X stat");
    });
  });

  describe("edge cases", () => {
    it("handles empty stats array", () => {
      console.log("[TEST] Testing empty stats array");
      render(<StatsGrid stats={[]} />);

      const container = document.querySelector("dl");
      expect(container).toBeInTheDocument();
      console.log("[TEST] Container rendered even with empty stats");
    });

    it("handles single stat", () => {
      console.log("[TEST] Testing single stat");
      render(<StatsGrid stats={[{ label: "Test", value: "42" }]} />);

      expect(screen.getByText("Test")).toBeInTheDocument();
      console.log("[TEST] Single stat rendered correctly");
    });

    it("handles stats with various formats", () => {
      console.log("[TEST] Testing various value formats");
      const formatStats = [
        { label: "Simple", value: "7" },
        { label: "With K", value: "10K+" },
        { label: "With M", value: "2.3M" },
        { label: "Non-animatable", value: "~15M" },
      ];

      render(<StatsGrid stats={formatStats} />);

      expect(screen.getByText("Simple")).toBeInTheDocument();
      expect(screen.getByText("With K")).toBeInTheDocument();
      expect(screen.getByText("With M")).toBeInTheDocument();
      expect(screen.getByText("Non-animatable")).toBeInTheDocument();
      console.log("[TEST] Various formats handled correctly");
    });
  });

  describe("accessibility", () => {
    it("uses definition list for semantic markup", () => {
      console.log("[TEST] Testing semantic markup");
      render(<StatsGrid stats={mockStats} />);

      const dl = document.querySelector("dl");
      expect(dl).toBeInTheDocument();

      const dts = document.querySelectorAll("dt");
      const dds = document.querySelectorAll("dd");

      console.log(`[TEST] Found ${dts.length} dt elements and ${dds.length} dd elements`);
      expect(dts.length).toBeGreaterThan(0);
      expect(dds.length).toBeGreaterThan(0);
      console.log("[TEST] Semantic markup test passed");
    });
  });
});
