import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("mdx library", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("getPostSlugs returns empty array if directory does not exist", async () => {
    // Mock fs to simulate missing directory
    vi.doMock("fs", () => ({
      default: {
        existsSync: vi.fn().mockReturnValue(false),
        readdirSync: vi.fn(),
      },
      existsSync: vi.fn().mockReturnValue(false),
      readdirSync: vi.fn(),
      readFileSync: vi.fn(),
    }));

    // Re-import module
    const mdx = await import("../mdx");
    expect(mdx.getPostSlugs()).toEqual([]);
  });

  it("getPostBySlug throws specific error if directory does not exist", async () => {
    // Mock fs to simulate missing directory
    vi.doMock("fs", () => ({
      default: {
        existsSync: vi.fn().mockReturnValue(false),
        readdirSync: vi.fn(),
      },
      existsSync: vi.fn().mockReturnValue(false),
      readdirSync: vi.fn(),
      readFileSync: vi.fn(),
    }));

    // Re-import module
    const mdx = await import("../mdx");
    
    // Check that it throws the specific error we added
    expect(() => mdx.getPostBySlug("test-slug")).toThrow(/Content directory missing/);
  });
});
