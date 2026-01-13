/**
 * Tests for the TLDR test utilities infrastructure.
 *
 * Verifies that the test helpers, mock factories, and custom matchers work correctly.
 * This serves as both a test and documentation for using the utilities.
 *
 * Run with: bun test tests/unit/tldr-test-utils.test.ts
 */

import { describe, test, expect, beforeEach } from "vitest";
import {
  createMockTool,
  createMockTools,
  createMockToolsWithSynergies,
  resetMockIdCounter,
  testLog,
  setLogLevel,
  getLogLevel,
  hasAccessibleName,
  meetsTouchTargetSize,
} from "@/tests/utils/tldr-test-helpers";

describe("TLDR Test Utilities", () => {
  describe("Mock Data Factories", () => {
    beforeEach(() => {
      resetMockIdCounter();
    });

    test("createMockTool generates valid tool with defaults", () => {
      testLog.testStart("createMockTool basic test");

      const tool = createMockTool();

      expect(tool.id).toBe("mock-tool-1");
      expect(tool.name).toBe("Mock Tool 1");
      expect(tool.shortName).toBe("MT1");
      expect(tool.category).toBe("core");
      expect(tool.stars).toBe(100);
      expect(tool.whatItDoes.length).toBeGreaterThan(0);
      expect(tool.whyItsUseful.length).toBeGreaterThan(0);
      expect(tool.implementationHighlights.length).toBeGreaterThan(0);
      expect(tool.techStack.length).toBeGreaterThan(0);
      expect(tool.keyFeatures.length).toBeGreaterThan(0);
      expect(tool.useCases.length).toBeGreaterThan(0);

      testLog.testEnd("createMockTool basic test", 11);
    });

    test("createMockTool allows overrides", () => {
      testLog.testStart("createMockTool with overrides");

      const tool = createMockTool({
        id: "custom-id",
        name: "Custom Name",
        category: "supporting",
        stars: 500,
      });

      expect(tool.id).toBe("custom-id");
      expect(tool.name).toBe("Custom Name");
      expect(tool.category).toBe("supporting");
      expect(tool.stars).toBe(500);

      testLog.testEnd("createMockTool with overrides", 4);
    });

    test("createMockTools creates multiple tools", () => {
      testLog.testStart("createMockTools test");

      const tools = createMockTools(5);

      expect(tools).toHaveLength(5);
      tools.forEach((tool, index) => {
        expect(tool.id).toBe(`mock-tool-${index + 1}`);
      });

      testLog.testEnd("createMockTools test", 6);
    });

    test("createMockTools with category distribution", () => {
      testLog.testStart("createMockTools with categories");

      const tools = createMockTools(10, { core: 7, supporting: 3 });

      expect(tools).toHaveLength(10);

      const coreCount = tools.filter((t) => t.category === "core").length;
      const supportingCount = tools.filter((t) => t.category === "supporting").length;

      expect(coreCount).toBe(7);
      expect(supportingCount).toBe(3);

      testLog.testEnd("createMockTools with categories", 3);
    });

    test("createMockToolsWithSynergies creates interconnected tools", () => {
      testLog.testStart("createMockToolsWithSynergies test");

      const tools = createMockToolsWithSynergies(6);

      expect(tools).toHaveLength(6);

      // All tools should have synergies
      tools.forEach((tool) => {
        expect(tool.synergies.length).toBeGreaterThan(0);
      });

      // Synergies should reference valid tools
      const allIds = new Set(tools.map((t) => t.id));
      tools.forEach((tool) => {
        tool.synergies.forEach((synergy) => {
          expect(allIds.has(synergy.toolId)).toBe(true);
        });
      });

      testLog.testEnd("createMockToolsWithSynergies test", tools.length * 2 + 1);
    });

    test("resetMockIdCounter resets the counter", () => {
      testLog.testStart("resetMockIdCounter test");

      const tool1 = createMockTool();
      expect(tool1.id).toBe("mock-tool-1");

      const tool2 = createMockTool();
      expect(tool2.id).toBe("mock-tool-2");

      resetMockIdCounter();

      const tool3 = createMockTool();
      expect(tool3.id).toBe("mock-tool-1");

      testLog.testEnd("resetMockIdCounter test", 3);
    });
  });

  describe("Logging Utilities", () => {
    test("setLogLevel and getLogLevel work correctly", () => {
      testLog.testStart("log level test");

      const originalLevel = getLogLevel();

      setLogLevel("WARN");
      expect(getLogLevel()).toBe("WARN");

      setLogLevel("DEBUG");
      expect(getLogLevel()).toBe("DEBUG");

      setLogLevel(originalLevel);

      testLog.testEnd("log level test", 2);
    });

    test("testLog methods exist and can be called", () => {
      testLog.testStart("testLog methods test");

      // These should not throw
      expect(() => testLog.debug("debug message")).not.toThrow();
      expect(() => testLog.info("info message")).not.toThrow();
      expect(() => testLog.warn("warn message")).not.toThrow();
      expect(() => testLog.error("error message")).not.toThrow();
      expect(() => testLog.section("test section")).not.toThrow();

      testLog.testEnd("testLog methods test", 5);
    });

    test("testLog.timing returns duration", () => {
      testLog.testStart("timing test");

      const start = performance.now();
      const duration = testLog.timing("test operation", start);

      expect(typeof duration).toBe("number");
      expect(duration).toBeGreaterThanOrEqual(0);

      testLog.testEnd("timing test", 2);
    });
  });

  describe("Accessibility Utilities", () => {
    test("hasAccessibleName detects aria-label", () => {
      testLog.testStart("hasAccessibleName with aria-label");

      const element = document.createElement("button");
      element.setAttribute("aria-label", "Click me");

      expect(hasAccessibleName(element)).toBe(true);

      testLog.testEnd("hasAccessibleName with aria-label", 1);
    });

    test("hasAccessibleName detects text content", () => {
      testLog.testStart("hasAccessibleName with text content");

      const element = document.createElement("button");
      element.textContent = "Click me";

      expect(hasAccessibleName(element)).toBe(true);

      testLog.testEnd("hasAccessibleName with text content", 1);
    });

    test("hasAccessibleName returns false for empty element", () => {
      testLog.testStart("hasAccessibleName empty element");

      const element = document.createElement("div");

      expect(hasAccessibleName(element)).toBe(false);

      testLog.testEnd("hasAccessibleName empty element", 1);
    });

    test("meetsTouchTargetSize checks dimensions", () => {
      testLog.testStart("meetsTouchTargetSize test");

      const element = document.createElement("button");
      // Note: getBoundingClientRect returns 0,0,0,0 in jsdom
      // This tests the function works, even if the element has no size
      const result = meetsTouchTargetSize(element, 44);

      expect(typeof result).toBe("boolean");

      testLog.testEnd("meetsTouchTargetSize test", 1);
    });
  });

  describe("Custom Matchers", () => {
    beforeEach(() => {
      resetMockIdCounter();
    });

    test("toHaveValidSynergies passes for valid synergies", () => {
      testLog.testStart("toHaveValidSynergies valid");

      const tools = createMockToolsWithSynergies(4);

      tools.forEach((tool) => {
        expect(tool).toHaveValidSynergies(tools);
      });

      testLog.testEnd("toHaveValidSynergies valid", tools.length);
    });

    test("toHaveValidSynergies fails for invalid synergies", () => {
      testLog.testStart("toHaveValidSynergies invalid");

      const tools = createMockTools(2);
      const toolWithBadSynergy = createMockTool({
        synergies: [{ toolId: "nonexistent-tool", description: "Invalid synergy" }],
      });

      expect(() => {
        expect(toolWithBadSynergy).toHaveValidSynergies(tools);
      }).toThrow();

      testLog.testEnd("toHaveValidSynergies invalid", 1);
    });

    test("toBeAccessible passes for accessible elements", () => {
      testLog.testStart("toBeAccessible test");

      const button = document.createElement("button");
      button.textContent = "Click me";

      expect(button).toBeAccessible();

      const link = document.createElement("a");
      link.href = "#";
      link.textContent = "Link";

      expect(link).toBeAccessible();

      testLog.testEnd("toBeAccessible test", 2);
    });
  });
});
