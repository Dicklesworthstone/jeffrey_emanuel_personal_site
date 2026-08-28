import { describe, it, expect } from "vitest";
import { parseStatValue } from "@/components/stats-grid";

describe("parseStatValue", () => {
  it("parses simple numbers", () => {
    expect(parseStatValue("100")).toEqual({
      number: 100,
      prefix: "",
      suffix: "",
      isAnimatable: true,
    });
  });

  it("parses numbers with suffixes (K)", () => {
    expect(parseStatValue("10K")).toEqual({
      number: 10,
      prefix: "",
      suffix: "K",
      isAnimatable: true,
    });
  });

  it("parses numbers with decimal points and suffixes (M)", () => {
    expect(parseStatValue("1.5M")).toEqual({
      number: 1.5,
      prefix: "",
      suffix: "M",
      isAnimatable: true,
    });
  });

  it("parses numbers with plus sign", () => {
    expect(parseStatValue("50+")).toEqual({
      number: 50,
      prefix: "",
      suffix: "+",
      isAnimatable: true,
    });
  });

  it("parses numbers with suffix and plus sign", () => {
    expect(parseStatValue("100K+")).toEqual({
      number: 100,
      prefix: "",
      suffix: "K+",
      isAnimatable: true,
    });
  });

  it("parses numbers with commas", () => {
    expect(parseStatValue("1,234")).toEqual({
      number: 1234,
      prefix: "",
      suffix: "",
      isAnimatable: true,
    });
  });

  it("handles non-animatable strings gracefully", () => {
    expect(parseStatValue("~100")).toEqual({
      number: 0,
      prefix: "",
      suffix: "~100",
      isAnimatable: false,
    });
    expect(parseStatValue("TBD")).toEqual({
      number: 0,
      prefix: "",
      suffix: "TBD",
      isAnimatable: false,
    });
  });
});