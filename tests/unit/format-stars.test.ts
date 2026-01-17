/**
 * Unit tests for star count formatting utilities.
 *
 * Run with: bun test tests/unit/format-stars.test.ts
 * Run with verbose: bun test tests/unit/format-stars.test.ts --verbose
 */

import { describe, test, expect } from "vitest";
import {
  formatStarCount,
  formatStarCountFull,
  parseStarCount,
} from "@/lib/format-stars";

describe("formatStarCount", () => {
  describe("numbers under 1000", () => {
    test("returns '0' for zero", () => {
      console.log("[TEST] formatStarCount(0) should return '0'");
      expect(formatStarCount(0)).toBe("0");
    });

    test("returns small numbers as-is", () => {
      console.log("[TEST] formatStarCount(42) should return '42'");
      expect(formatStarCount(42)).toBe("42");

      console.log("[TEST] formatStarCount(1) should return '1'");
      expect(formatStarCount(1)).toBe("1");

      console.log("[TEST] formatStarCount(500) should return '500'");
      expect(formatStarCount(500)).toBe("500");
    });

    test("returns 999 as-is (boundary)", () => {
      console.log("[TEST] formatStarCount(999) should return '999'");
      expect(formatStarCount(999)).toBe("999");
    });
  });

  describe("thousands (K)", () => {
    test("formats exactly 1000 as '1K'", () => {
      console.log("[TEST] formatStarCount(1000) should return '1K'");
      expect(formatStarCount(1000)).toBe("1K");
    });

    test("formats with one decimal when needed", () => {
      console.log("[TEST] formatStarCount(1400) should return '1.4K'");
      expect(formatStarCount(1400)).toBe("1.4K");

      console.log("[TEST] formatStarCount(1500) should return '1.5K'");
      expect(formatStarCount(1500)).toBe("1.5K");

      console.log("[TEST] formatStarCount(2700) should return '2.7K'");
      expect(formatStarCount(2700)).toBe("2.7K");
    });

    test("rounds decimals correctly", () => {
      // 1450 / 1000 = 1.45, toFixed(1) rounds to "1.4" (banker's rounding)
      console.log("[TEST] formatStarCount(1450) should return '1.4K'");
      expect(formatStarCount(1450)).toBe("1.4K");

      // 1451+ rounds up
      console.log("[TEST] formatStarCount(1451) should return '1.5K'");
      expect(formatStarCount(1451)).toBe("1.5K");

      console.log("[TEST] formatStarCount(1449) should return '1.4K'");
      expect(formatStarCount(1449)).toBe("1.4K");
    });

    test("drops trailing .0", () => {
      console.log("[TEST] formatStarCount(2000) should return '2K' not '2.0K'");
      expect(formatStarCount(2000)).toBe("2K");

      console.log("[TEST] formatStarCount(10000) should return '10K'");
      expect(formatStarCount(10000)).toBe("10K");
    });

    test("handles large thousands", () => {
      console.log("[TEST] formatStarCount(500000) should return '500K'");
      expect(formatStarCount(500000)).toBe("500K");

      console.log("[TEST] formatStarCount(999900) should return '999.9K'");
      expect(formatStarCount(999900)).toBe("999.9K");
    });
  });

  describe("millions (M)", () => {
    test("formats exactly 1 million as '1M'", () => {
      console.log("[TEST] formatStarCount(1000000) should return '1M'");
      expect(formatStarCount(1000000)).toBe("1M");
    });

    test("formats millions with decimals", () => {
      console.log("[TEST] formatStarCount(2300000) should return '2.3M'");
      expect(formatStarCount(2300000)).toBe("2.3M");

      console.log("[TEST] formatStarCount(1500000) should return '1.5M'");
      expect(formatStarCount(1500000)).toBe("1.5M");
    });

    test("drops trailing .0 for millions", () => {
      console.log("[TEST] formatStarCount(5000000) should return '5M'");
      expect(formatStarCount(5000000)).toBe("5M");
    });
  });

  describe("edge cases", () => {
    test("handles negative numbers", () => {
      console.log("[TEST] formatStarCount(-100) should return '-100'");
      expect(formatStarCount(-100)).toBe("-100");
    });

    test("handles NaN", () => {
      console.log("[TEST] formatStarCount(NaN) should return 'NaN'");
      expect(formatStarCount(NaN)).toBe("NaN");
    });

    test("handles Infinity", () => {
      console.log("[TEST] formatStarCount(Infinity) should return 'Infinity'");
      expect(formatStarCount(Infinity)).toBe("Infinity");
    });

    test("handles negative Infinity", () => {
      console.log("[TEST] formatStarCount(-Infinity) should return '-Infinity'");
      expect(formatStarCount(-Infinity)).toBe("-Infinity");
    });
  });
});

describe("formatStarCountFull", () => {
  test("returns localized full number with commas", () => {
    console.log("[TEST] formatStarCountFull(1400) should return '1,400'");
    expect(formatStarCountFull(1400)).toBe("1,400");
  });

  test("handles thousands", () => {
    console.log("[TEST] formatStarCountFull(12345) should return '12,345'");
    expect(formatStarCountFull(12345)).toBe("12,345");
  });

  test("handles millions", () => {
    console.log("[TEST] formatStarCountFull(2300000) should return '2,300,000'");
    expect(formatStarCountFull(2300000)).toBe("2,300,000");
  });

  test("handles small numbers without commas", () => {
    console.log("[TEST] formatStarCountFull(42) should return '42'");
    expect(formatStarCountFull(42)).toBe("42");
  });

  test("handles edge cases", () => {
    console.log("[TEST] formatStarCountFull(NaN) should return 'NaN'");
    expect(formatStarCountFull(NaN)).toBe("NaN");
  });
});

describe("parseStarCount", () => {
  test("parses K suffix", () => {
    console.log("[TEST] parseStarCount('1.4K') should return 1400");
    expect(parseStarCount("1.4K")).toBe(1400);

    console.log("[TEST] parseStarCount('10K') should return 10000");
    expect(parseStarCount("10K")).toBe(10000);

    console.log("[TEST] parseStarCount('1.4k') should return 1400");
    expect(parseStarCount("1.4k")).toBe(1400);
  });

  test("parses M suffix", () => {
    console.log("[TEST] parseStarCount('2.3M') should return 2300000");
    expect(parseStarCount("2.3M")).toBe(2300000);

    console.log("[TEST] parseStarCount('1M') should return 1000000");
    expect(parseStarCount("1M")).toBe(1000000);

    console.log("[TEST] parseStarCount('2.3m') should return 2300000");
    expect(parseStarCount("2.3m")).toBe(2300000);
  });

  test("parses plain numbers", () => {
    console.log("[TEST] parseStarCount('500') should return 500");
    expect(parseStarCount("500")).toBe(500);
  });

  test("parses comma-formatted numbers", () => {
    console.log("[TEST] parseStarCount('1,400') should return 1400");
    expect(parseStarCount("1,400")).toBe(1400);
  });

  test("handles whitespace", () => {
    console.log("[TEST] parseStarCount(' 1.4K ') should return 1400");
    expect(parseStarCount(" 1.4K ")).toBe(1400);
  });

  test("handles trailing text and plus signs", () => {
    console.log("[TEST] parseStarCount('1.2k+ stars') should return 1200");
    expect(parseStarCount("1.2k+ stars")).toBe(1200);
  });
});

describe("round-trip consistency", () => {
  test("formatStarCount -> parseStarCount returns original value", () => {
    const testValues = [0, 42, 500, 999, 1000, 1400, 10000, 500000, 1000000, 2300000];

    for (const value of testValues) {
      console.log(`[TEST] Round-trip for ${value}`);
      const formatted = formatStarCount(value);
      const parsed = parseStarCount(formatted);
      expect(parsed).toBe(value);
    }
  });
});
