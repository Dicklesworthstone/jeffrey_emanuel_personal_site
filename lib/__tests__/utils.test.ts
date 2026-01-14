import { describe, it, expect } from "vitest";
import { formatDate, cn } from "../utils";

describe("formatDate", () => {
  it("formats date correctly", () => {
    // 2023-01-01 should be January 1, 2023
    expect(formatDate("2023-01-01")).toBe("January 1, 2023");
  });

  it("handles different months", () => {
    expect(formatDate("2023-12-31")).toBe("December 31, 2023");
  });
  
  it("handles date with time", () => {
    // Should ignore time part if we treat it as UTC day?
    // The function appends T00:00:00Z if T is missing.
    // If input is "2023-01-01T12:00:00Z", it uses that.
    // But it forces UTC display.
    // "2023-01-01T12:00:00Z" in UTC is Jan 1.
    // "2023-01-01T23:00:00Z" in UTC is Jan 1.
    expect(formatDate("2023-01-01T12:00:00Z")).toBe("January 1, 2023");
  });
});

describe("cn", () => {
  it("merges classes", () => {
    expect(cn("px-2 py-1", "bg-red-500")).toBe("px-2 py-1 bg-red-500");
  });
  
  it("handles conditionals", () => {
    expect(cn("px-2", false && "hidden", "py-1")).toBe("px-2 py-1");
  });
  
  it("merges tailwind conflicts", () => {
    expect(cn("px-2 bg-red-500", "bg-blue-500")).toBe("px-2 bg-blue-500");
  });
});