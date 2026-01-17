import { describe, it, expect } from "vitest";
import { parseStatValue } from "@/components/stats-grid";

describe("parseStatValue", () => {
  it("parses simple numbers", () => {
    expect(parseStatValue("100")).toEqual({
      number: 100,
      suffix: "",
      isAnimatable: true,
    });
  });

  it("parses numbers with suffixes (K)", () => {
    expect(parseStatValue("10K")).toEqual({
      number: 10,
      suffix: "K",
      isAnimatable: true,
    });
  });

  it("parses numbers with decimal points and suffixes (M)", () => {
    expect(parseStatValue("1.5M")).toEqual({
      number: 1.5,
      suffix: "M",
      isAnimatable: true,
    });
  });

  it("parses numbers with plus sign", () => {
    expect(parseStatValue("50+")).toEqual({
      number: 50,
      suffix: "+",
      isAnimatable: true,
    });
  });

  it("parses numbers with suffix and plus sign", () => {
    expect(parseStatValue("100K+")).toEqual({
      number: 100,
      suffix: "K+",
      isAnimatable: true,
    });
  });

  it("parses numbers with commas", () => {
    expect(parseStatValue("1,234")).toEqual({
      number: 1234,
      suffix: "",
      isAnimatable: true,
    });
  });

  it("handles non-animatable strings gracefully", () => {
    expect(parseStatValue("~100")).toEqual({
      number: 0,
      suffix: "~100",
      isAnimatable: false,
    });
    expect(parseStatValue("TBD")).toEqual({
      number: 0,
      suffix: "TBD",
      isAnimatable: false,
    });
  });
});