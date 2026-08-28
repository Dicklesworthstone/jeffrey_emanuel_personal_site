import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * `lib/mdx.ts` resolves its posts directory once, at module evaluation time, so
 * every case here has to re-import the module with `fs` already stubbed.
 *
 * These stubs are registered ONCE, hoisted, and re-aimed per test. Registering
 * a fresh `vi.doMock("fs", ...)` inside each test does not work under the
 * jsdom environment this suite runs in: the first registration wins and later
 * ones are silently ignored, so the opening `existsSync -> false` stub leaked
 * into the draft-filter case and made it throw "Content directory missing".
 */
const nodeFs = vi.hoisted(() => ({
  existsSync: vi.fn((_path: string) => false),
  readdirSync: vi.fn((_path: string) => [] as string[]),
  readFileSync: vi.fn((_path: string, _encoding?: string) => ""),
  matter: vi.fn((_source: string) => ({
    data: {} as Record<string, unknown>,
    content: "",
  })),
}));

vi.mock("fs", () => ({
  default: nodeFs,
  existsSync: nodeFs.existsSync,
  readdirSync: nodeFs.readdirSync,
  readFileSync: nodeFs.readFileSync,
}));

vi.mock("gray-matter", () => ({ default: nodeFs.matter }));

describe("mdx library", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("getPostSlugs returns empty array if directory does not exist", async () => {
    nodeFs.existsSync.mockReturnValue(false);

    const mdx = await import("../mdx");
    expect(mdx.getPostSlugs()).toEqual([]);
  });

  it("getPostBySlug throws specific error if directory does not exist", async () => {
    nodeFs.existsSync.mockReturnValue(false);

    const mdx = await import("../mdx");

    // Check that it throws the specific error we added
    expect(() => mdx.getPostBySlug("test-slug")).toThrow(/Content directory missing/);
  });

  it("treats quoted draft frontmatter as draft in publication filters", async () => {
    nodeFs.existsSync.mockReturnValue(true);
    nodeFs.readdirSync.mockReturnValue(["draft-post.md", "live-post.md"]);
    nodeFs.readFileSync.mockImplementation((filePath: string) => {
      if (filePath.endsWith("draft-post.md")) {
        return "draft-post";
      }

      if (filePath.endsWith("live-post.md")) {
        return "live-post";
      }

      return "";
    });
    nodeFs.matter.mockImplementation((source: string) => {
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
    });

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
