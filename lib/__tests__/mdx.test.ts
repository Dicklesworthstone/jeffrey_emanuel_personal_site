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

  it("treats quoted draft frontmatter as draft in publication filters", async () => {
    const existsSync = vi.fn().mockReturnValue(true);
    const readdirSync = vi.fn().mockReturnValue(["draft-post.md", "live-post.md"]);
    const readFileSync = vi.fn((filePath: string) => {
      if (filePath.endsWith("draft-post.md")) {
        return "draft-post";
      }

      if (filePath.endsWith("live-post.md")) {
        return "live-post";
      }

      return "";
    });

    vi.doMock("fs", () => ({
      default: {
        existsSync,
        readdirSync,
        readFileSync,
      },
      existsSync,
      readdirSync,
      readFileSync,
    }));

    vi.doMock("gray-matter", () => ({
      default: vi.fn((source: string) => {
        if (source === "draft-post") {
          return {
            data: {
              title: "Draft Post",
              date: "2026-04-01",
              draft: " TRUE ",
              description: "Hidden draft",
            },
            content: "hidden",
          };
        }

        return {
          data: {
            title: "Live Post",
            date: "2026-04-02",
            description: "Visible post",
          },
          content: "visible",
        };
      }),
    }));

    const mdx = await import("../mdx");

    expect(mdx.getPostBySlug("draft-post").draft).toBe(true);
    expect(mdx.getPublishedPostsMeta()).toEqual([
      expect.objectContaining({
        slug: "live-post",
        title: "Live Post",
        draft: false,
      }),
    ]);
  });
});
