/**
 * Unit tests for parseStatValue function from stats-grid.tsx
 *
 * This function parses stat value strings like "10K+", "7", "2.3M" into
 * components for animated display.
 *
 * Run with: bun test tests/unit/stats-parsing.test.ts
 * Run with verbose: bun test tests/unit/stats-parsing.test.ts --verbose
 */

import { describe, test, expect } from "vitest";
import { parseStatValue } from "@/components/stats-grid";

describe("parseStatValue", () => {
  describe("animatable values - simple integers", () => {
    test("parses single digit integer", () => {
      console.log("[TEST] parseStatValue('7') should parse to {number: 7, suffix: '', isAnimatable: true}");
      const result = parseStatValue("7");
      console.log("[TEST] Result:", JSON.stringify(result));
      expect(result).toEqual({ number: 7, suffix: "", isAnimatable: true });
      console.log("[TEST] ✓ Single digit integer parsed correctly");
    });

    test("parses multi-digit integer", () => {
      console.log("[TEST] parseStatValue('123') should parse correctly");
      const result = parseStatValue("123");
      console.log("[TEST] Result:", JSON.stringify(result));
      expect(result).toEqual({ number: 123, suffix: "", isAnimatable: true });
      console.log("[TEST] ✓ Multi-digit integer parsed correctly");
    });

    test("parses zero", () => {
      console.log("[TEST] parseStatValue('0') should parse to {number: 0, suffix: '', isAnimatable: true}");
      const result = parseStatValue("0");
      console.log("[TEST] Result:", JSON.stringify(result));
      expect(result).toEqual({ number: 0, suffix: "", isAnimatable: true });
      console.log("[TEST] ✓ Zero parsed correctly");
    });

    test("handles leading zeros", () => {
      console.log("[TEST] parseStatValue('007') should parse correctly");
      const result = parseStatValue("007");
      console.log("[TEST] Result:", JSON.stringify(result));
      expect(result).toEqual({ number: 7, suffix: "", isAnimatable: true });
      console.log("[TEST] ✓ Leading zeros handled correctly");
    });
  });

  describe("animatable values - with K suffix (thousands)", () => {
    test("parses K suffix", () => {
      console.log("[TEST] parseStatValue('10K') should parse to {number: 10, suffix: 'K', isAnimatable: true}");
      const result = parseStatValue("10K");
      console.log("[TEST] Result:", JSON.stringify(result));
      expect(result).toEqual({ number: 10, suffix: "K", isAnimatable: true });
      console.log("[TEST] ✓ K suffix parsed correctly");
    });

    test("parses K+ suffix", () => {
      console.log("[TEST] parseStatValue('10K+') should parse to {number: 10, suffix: 'K+', isAnimatable: true}");
      const result = parseStatValue("10K+");
      console.log("[TEST] Result:", JSON.stringify(result));
      expect(result).toEqual({ number: 10, suffix: "K+", isAnimatable: true });
      console.log("[TEST] ✓ K+ suffix parsed correctly");
    });

    test("parses lowercase k suffix", () => {
      console.log("[TEST] parseStatValue('10k') lowercase should work");
      const result = parseStatValue("10k");
      console.log("[TEST] Result:", JSON.stringify(result));
      expect(result).toEqual({ number: 10, suffix: "k", isAnimatable: true });
      console.log("[TEST] ✓ Lowercase k suffix parsed correctly");
    });

    test("parses decimal with K suffix", () => {
      console.log("[TEST] parseStatValue('1.5K') should parse correctly");
      const result = parseStatValue("1.5K");
      console.log("[TEST] Result:", JSON.stringify(result));
      expect(result).toEqual({ number: 1.5, suffix: "K", isAnimatable: true });
      console.log("[TEST] ✓ Decimal with K suffix parsed correctly");
    });
  });

  describe("animatable values - with M suffix (millions)", () => {
    test("parses M suffix", () => {
      console.log("[TEST] parseStatValue('2.3M') should parse to {number: 2.3, suffix: 'M', isAnimatable: true}");
      const result = parseStatValue("2.3M");
      console.log("[TEST] Result:", JSON.stringify(result));
      expect(result).toEqual({ number: 2.3, suffix: "M", isAnimatable: true });
      console.log("[TEST] ✓ M suffix parsed correctly");
    });

    test("parses M+ suffix", () => {
      console.log("[TEST] parseStatValue('5M+') should parse correctly");
      const result = parseStatValue("5M+");
      console.log("[TEST] Result:", JSON.stringify(result));
      expect(result).toEqual({ number: 5, suffix: "M+", isAnimatable: true });
      console.log("[TEST] ✓ M+ suffix parsed correctly");
    });

    test("parses lowercase m suffix", () => {
      console.log("[TEST] parseStatValue('10m') lowercase should work");
      const result = parseStatValue("10m");
      console.log("[TEST] Result:", JSON.stringify(result));
      expect(result).toEqual({ number: 10, suffix: "m", isAnimatable: true });
      console.log("[TEST] ✓ Lowercase m suffix parsed correctly");
    });
  });

  describe("animatable values - with B suffix (billions)", () => {
    test("parses B suffix", () => {
      console.log("[TEST] parseStatValue('1.5B') should parse to {number: 1.5, suffix: 'B', isAnimatable: true}");
      const result = parseStatValue("1.5B");
      console.log("[TEST] Result:", JSON.stringify(result));
      expect(result).toEqual({ number: 1.5, suffix: "B", isAnimatable: true });
      console.log("[TEST] ✓ B suffix parsed correctly");
    });

    test("parses B+ suffix", () => {
      console.log("[TEST] parseStatValue('2B+') should parse correctly");
      const result = parseStatValue("2B+");
      console.log("[TEST] Result:", JSON.stringify(result));
      expect(result).toEqual({ number: 2, suffix: "B+", isAnimatable: true });
      console.log("[TEST] ✓ B+ suffix parsed correctly");
    });
  });

  describe("animatable values - with + suffix only", () => {
    test("parses + without magnitude", () => {
      console.log("[TEST] parseStatValue('15+') should parse to {number: 15, suffix: '+', isAnimatable: true}");
      const result = parseStatValue("15+");
      console.log("[TEST] Result:", JSON.stringify(result));
      expect(result).toEqual({ number: 15, suffix: "+", isAnimatable: true });
      console.log("[TEST] ✓ Plus suffix without magnitude parsed correctly");
    });
  });

  describe("animatable values - decimals", () => {
    test("handles decimal numbers", () => {
      console.log("[TEST] parseStatValue('3.14') should parse correctly");
      const result = parseStatValue("3.14");
      console.log("[TEST] Result:", JSON.stringify(result));
      expect(result).toEqual({ number: 3.14, suffix: "", isAnimatable: true });
      console.log("[TEST] ✓ Decimal numbers handled correctly");
    });

    test("handles decimal with trailing zero", () => {
      console.log("[TEST] parseStatValue('5.0') should parse correctly");
      const result = parseStatValue("5.0");
      console.log("[TEST] Result:", JSON.stringify(result));
      expect(result).toEqual({ number: 5, suffix: "", isAnimatable: true });
      console.log("[TEST] ✓ Decimal with trailing zero handled correctly");
    });
  });

  describe("animatable values - comma-formatted numbers", () => {
    test("handles comma-formatted numbers", () => {
      console.log("[TEST] parseStatValue('1,234') should parse to {number: 1234}");
      const result = parseStatValue("1,234");
      console.log("[TEST] Result:", JSON.stringify(result));
      expect(result).toEqual({ number: 1234, suffix: "", isAnimatable: true });
      console.log("[TEST] ✓ Comma-formatted numbers handled correctly");
    });

    test("handles multiple commas", () => {
      console.log("[TEST] parseStatValue('1,234,567') should parse correctly");
      const result = parseStatValue("1,234,567");
      console.log("[TEST] Result:", JSON.stringify(result));
      expect(result).toEqual({ number: 1234567, suffix: "", isAnimatable: true });
      console.log("[TEST] ✓ Multiple commas handled correctly");
    });

    test("handles comma-formatted with suffix", () => {
      console.log("[TEST] parseStatValue('1,234K+') should parse correctly");
      const result = parseStatValue("1,234K+");
      console.log("[TEST] Result:", JSON.stringify(result));
      expect(result).toEqual({ number: 1234, suffix: "K+", isAnimatable: true });
      console.log("[TEST] ✓ Comma-formatted with suffix handled correctly");
    });
  });

  describe("non-animatable values", () => {
    test("returns non-animatable for text prefix", () => {
      console.log("[TEST] parseStatValue('~15M') should be non-animatable");
      const result = parseStatValue("~15M");
      console.log("[TEST] Result:", JSON.stringify(result));
      expect(result).toEqual({ number: 0, suffix: "~15M", isAnimatable: false });
      console.log("[TEST] ✓ Text prefix handled as non-animatable");
    });

    test("returns non-animatable for empty string", () => {
      console.log("[TEST] parseStatValue('') should be non-animatable");
      const result = parseStatValue("");
      console.log("[TEST] Result:", JSON.stringify(result));
      expect(result).toEqual({ number: 0, suffix: "", isAnimatable: false });
      console.log("[TEST] ✓ Empty string handled as non-animatable");
    });

    test("returns non-animatable for pure text", () => {
      console.log("[TEST] parseStatValue('N/A') should be non-animatable");
      const result = parseStatValue("N/A");
      console.log("[TEST] Result:", JSON.stringify(result));
      expect(result).toEqual({ number: 0, suffix: "N/A", isAnimatable: false });
      console.log("[TEST] ✓ Pure text handled as non-animatable");
    });

    test("returns non-animatable for currency format", () => {
      console.log("[TEST] parseStatValue('$100') should be non-animatable");
      const result = parseStatValue("$100");
      console.log("[TEST] Result:", JSON.stringify(result));
      expect(result).toEqual({ number: 0, suffix: "$100", isAnimatable: false });
      console.log("[TEST] ✓ Currency format handled as non-animatable");
    });

    test("returns non-animatable for percentage", () => {
      console.log("[TEST] parseStatValue('50%') should be non-animatable");
      const result = parseStatValue("50%");
      console.log("[TEST] Result:", JSON.stringify(result));
      expect(result).toEqual({ number: 0, suffix: "50%", isAnimatable: false });
      console.log("[TEST] ✓ Percentage handled as non-animatable");
    });

    test("returns non-animatable for text with numbers", () => {
      console.log("[TEST] parseStatValue('Top 10') should be non-animatable");
      const result = parseStatValue("Top 10");
      console.log("[TEST] Result:", JSON.stringify(result));
      expect(result).toEqual({ number: 0, suffix: "Top 10", isAnimatable: false });
      console.log("[TEST] ✓ Text with numbers handled as non-animatable");
    });

    test("returns non-animatable for invalid suffix", () => {
      console.log("[TEST] parseStatValue('10X') should be non-animatable (X is not valid)");
      const result = parseStatValue("10X");
      console.log("[TEST] Result:", JSON.stringify(result));
      expect(result).toEqual({ number: 0, suffix: "10X", isAnimatable: false });
      console.log("[TEST] ✓ Invalid suffix handled as non-animatable");
    });
  });

  describe("edge cases", () => {
    test("handles very large numbers", () => {
      console.log("[TEST] parseStatValue('999999999') should parse correctly");
      const result = parseStatValue("999999999");
      console.log("[TEST] Result:", JSON.stringify(result));
      expect(result.number).toBe(999999999);
      expect(result.isAnimatable).toBe(true);
      console.log("[TEST] ✓ Very large numbers handled correctly");
    });

    test("handles very small decimals", () => {
      console.log("[TEST] parseStatValue('0.001') should parse correctly");
      const result = parseStatValue("0.001");
      console.log("[TEST] Result:", JSON.stringify(result));
      expect(result.number).toBeCloseTo(0.001);
      expect(result.isAnimatable).toBe(true);
      console.log("[TEST] ✓ Very small decimals handled correctly");
    });
  });
});

describe("parseStatValue - real-world examples from site", () => {
  test("parses typical homepage stats", () => {
    console.log("[TEST] Testing real-world stat values from the homepage");

    // These are examples of stat values used on the site
    const testCases = [
      { input: "50+", expected: { number: 50, suffix: "+", isAnimatable: true } },
      { input: "10K+", expected: { number: 10, suffix: "K+", isAnimatable: true } },
      { input: "7", expected: { number: 7, suffix: "", isAnimatable: true } },
      { input: "1,234", expected: { number: 1234, suffix: "", isAnimatable: true } },
    ];

    for (const { input, expected } of testCases) {
      console.log(`[TEST] parseStatValue('${input}')`);
      const result = parseStatValue(input);
      console.log(`[TEST] Result: ${JSON.stringify(result)}`);
      expect(result).toEqual(expected);
    }
    console.log("[TEST] ✓ All real-world examples passed");
  });
});
