import { describe, it, expect } from "vitest";
import { cn, formatDate } from "../utils";

describe("cn (className utility)", () => {
  it("merges class names", () => {
    const result = cn("text-red-500", "bg-blue-500");
    expect(result).toBe("text-red-500 bg-blue-500");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    const result = cn("base-class", isActive && "active-class");
    expect(result).toBe("base-class active-class");
  });

  it("filters out falsy values", () => {
    const result = cn("base", false && "hidden", null, undefined, "visible");
    expect(result).toBe("base visible");
  });

  it("deduplicates tailwind classes correctly", () => {
    const result = cn("px-4", "px-8");
    expect(result).toBe("px-8");
  });

  it("handles conflicting tailwind utilities", () => {
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-blue-500");
  });

  it("returns empty string with no inputs", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("handles arrays of classes", () => {
    const result = cn(["class-a", "class-b"], "class-c");
    expect(result).toBe("class-a class-b class-c");
  });
});

describe("formatDate", () => {
  it("formats YYYY-MM-DD date string correctly", () => {
    const result = formatDate("2024-01-15");
    expect(result).toBe("January 15, 2024");
  });

  it("handles end of month dates", () => {
    const result = formatDate("2024-12-31");
    expect(result).toBe("December 31, 2024");
  });

  it("handles beginning of month dates", () => {
    const result = formatDate("2024-06-01");
    expect(result).toBe("June 1, 2024");
  });

  it("returns empty string for empty input", () => {
    const result = formatDate("");
    expect(result).toBe("");
  });

  it("handles ISO 8601 format with time", () => {
    const result = formatDate("2024-03-20T14:30:00Z");
    expect(result).toBe("March 20, 2024");
  });

  it("handles dates in different months", () => {
    expect(formatDate("2024-02-14")).toBe("February 14, 2024");
    expect(formatDate("2024-07-04")).toBe("July 4, 2024");
    expect(formatDate("2024-11-28")).toBe("November 28, 2024");
  });

  it("consistently formats dates regardless of local timezone", () => {
    // This tests the UTC behavior - the date should always be the same
    // regardless of the local timezone where the test runs
    const result = formatDate("2024-01-01");
    expect(result).toBe("January 1, 2024");
  });
});
