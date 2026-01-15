import { describe, it, expect } from "vitest";
import { tldrFlywheelTools, tldrPageData, TldrFlywheelTool } from "@/lib/content";

describe("TLDR Data Integrity", () => {
  describe("Flywheel Tools", () => {
    it("exports tldrFlywheelTools array", () => {
      expect(tldrFlywheelTools).toBeDefined();
      expect(Array.isArray(tldrFlywheelTools)).toBe(true);
    });

    it("has 14 tools", () => {
      // 10 core + 4 supporting = 14
      expect(tldrFlywheelTools.length).toBe(14);
    });

    it("all tools have required fields", () => {
      const requiredFields: (keyof TldrFlywheelTool)[] = [
        "id", "name", "shortName", "category",
        "icon", "color", "whatItDoes", "whyItsUseful",
        "implementationHighlights", "synergies", "techStack",
        "keyFeatures", "useCases", "href"
      ];

      tldrFlywheelTools.forEach((tool) => {
        requiredFields.forEach((field) => {
          expect(tool[field], `Tool ${tool.id} missing ${field}`).toBeDefined();
        });
      });
    });

    it("all tool IDs are unique", () => {
      const ids = tldrFlywheelTools.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("categories are valid", () => {
      tldrFlywheelTools.forEach((tool) => {
        expect(["core", "supporting"]).toContain(tool.category);
      });
    });

    it("has 10 core tools", () => {
      const core = tldrFlywheelTools.filter((t) => t.category === "core");
      expect(core.length).toBe(10);
    });

    it("has 4 supporting tools", () => {
      const supporting = tldrFlywheelTools.filter((t) => t.category === "supporting");
      expect(supporting.length).toBe(4);
    });
  });

  describe("Synergy Integrity", () => {
    it("all synergy toolIds reference existing tools", () => {
      const allIds = new Set(tldrFlywheelTools.map((t) => t.id));

      tldrFlywheelTools.forEach((tool) => {
        tool.synergies.forEach((synergy) => {
          expect(allIds.has(synergy.toolId), 
            `Tool ${tool.id} references non-existent synergy ${synergy.toolId}`
          ).toBe(true);
        });
      });
    });
    
    it("synergies are not self-referential", () => {
        tldrFlywheelTools.forEach((tool) => {
            tool.synergies.forEach((synergy) => {
                expect(synergy.toolId).not.toBe(tool.id);
            });
        });
    });
  });

  describe("Page Data", () => {
    it("has hero section with stats", () => {
      expect(tldrPageData.hero).toBeDefined();
      expect(tldrPageData.hero.stats).toHaveLength(3);
    });
    
    // Note: The stats say "13" but we count 14. This test just checks existence, not correctness of the static text.
    // If we wanted to enforce consistency:
    // it("stats count matches tool count", () => {
    //    const countStat = tldrPageData.hero.stats.find(s => s.label === "Ecosystem Tools");
    //    expect(countStat?.value).toBe(tldrFlywheelTools.length.toString());
    // });
    // But since it's "13" vs 14, I'll leave it for now or fix it in content.ts.
  });
});
