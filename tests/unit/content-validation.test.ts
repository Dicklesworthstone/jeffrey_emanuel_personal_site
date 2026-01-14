/**
 * Comprehensive content validation tests for lib/content.ts
 *
 * Validates the integrity, consistency, and correctness of all data.
 * These tests ensure project additions don't introduce errors and maintain quality standards.
 *
 * Run with: bunx vitest run tests/unit/content-validation.test.ts
 */

import { describe, test, expect, beforeAll, afterAll } from "vitest";
import {
  projects,
  heroStats,
  navItems,
  endorsements,
  liveDemos,
  flywheelTools,
  careerTimeline,
  mediaItems,
  threads,
  writingHighlights,
  tldrFlywheelTools,
  siteConfig,
} from "@/lib/content";
import { testLog } from "@/tests/utils/tldr-test-helpers";

// =============================================================================
// TEST CONFIGURATION
// =============================================================================

const VALIDATION_STATS = {
  projectsChecked: 0,
  urlsValidated: 0,
  tagsChecked: 0,
  tldrToolsChecked: 0,
  synergiesValidated: 0,
};

beforeAll(() => {
  testLog.section("Content Validation Tests Starting");
  testLog.info("Data sources being validated:", {
    projects: projects.length,
    heroStats: heroStats.length,
    navItems: navItems.length,
    endorsements: endorsements.length,
    liveDemos: liveDemos.length,
    flywheelTools: flywheelTools.length,
    tldrFlywheelTools: tldrFlywheelTools.length,
    careerTimeline: careerTimeline.length,
    mediaItems: mediaItems.length,
    threads: threads.length,
    writingHighlights: writingHighlights.length,
  });
});

afterAll(() => {
  testLog.section("Content Validation Summary");
  testLog.info("Validation Statistics:", VALIDATION_STATS);
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const isValidUrl = (urlString: string): boolean => {
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
};

const isGitHubUrl = (url: string): boolean => {
  return url.startsWith("https://github.com/");
};

// =============================================================================
// PROJECT SCHEMA VALIDATION
// =============================================================================

describe("Project Schema Validation", () => {
  test("all projects have required fields", () => {
    testLog.testStart("Project required fields validation");

    projects.forEach((project) => {
      testLog.debug(`Checking project: ${project.name}`);
      VALIDATION_STATS.projectsChecked++;

      expect(project.name).toBeDefined();
      expect(project.name.length).toBeGreaterThan(0);
      expect(["product", "oss", "research"]).toContain(project.kind);
      expect(project.href).toBeDefined();
      expect(project.short).toBeDefined();
      expect(project.description).toBeDefined();
      expect(Array.isArray(project.tags)).toBe(true);
      expect(project.tags.length).toBeGreaterThanOrEqual(1);
    });

    testLog.testEnd("Project required fields validation", projects.length * 7);
  });

  test("optional fields have correct types when present", () => {
    testLog.testStart("Project optional fields validation");

    projects.forEach((project) => {
      if (project.badge !== undefined) {
        expect(typeof project.badge).toBe("string");
        expect(project.badge.length).toBeGreaterThan(0);
      }

      if (project.size !== undefined) {
        expect(["wide", "tall", "large", "normal"]).toContain(project.size);
      }

      if (project.gradient !== undefined) {
        expect(typeof project.gradient).toBe("string");
        expect(project.gradient.length).toBeGreaterThan(0);
      }

      if (project.slug !== undefined) {
        expect(typeof project.slug).toBe("string");
        expect(project.slug).toMatch(/^[a-z0-9-]+$/); // URL-safe slug format
      }
    });

    testLog.testEnd("Project optional fields validation");
  });
});

// =============================================================================
// URL VALIDATION
// =============================================================================

describe("URL Validation", () => {
  test("all project hrefs are valid URLs", () => {
    testLog.testStart("Project URL validation");

    projects.forEach((project) => {
      testLog.debug(`Validating URL for: ${project.name}`);
      VALIDATION_STATS.urlsValidated++;

      expect(isValidUrl(project.href)).toBe(true);
      expect(project.href).toMatch(/^https?:\/\//);
    });

    testLog.testEnd("Project URL validation", projects.length * 2);
  });

  test("no duplicate hrefs exist", () => {
    testLog.testStart("Duplicate href check");

    const hrefs = projects.map((p) => p.href);
    const uniqueHrefs = new Set(hrefs);

    expect(uniqueHrefs.size).toBe(hrefs.length);

    testLog.testEnd("Duplicate href check", 1);
  });

  test("GitHub URLs use correct format", () => {
    testLog.testStart("GitHub URL format validation");

    const githubProjects = projects.filter((p) => isGitHubUrl(p.href));

    testLog.info(`Found ${githubProjects.length} GitHub projects`);

    githubProjects.forEach((project) => {
      // Allow repo names with dots (e.g., your-source-to-prompt.html)
      expect(project.href).toMatch(
        /^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+\/?$/
      );
    });

    testLog.testEnd("GitHub URL format validation", githubProjects.length);
  });

  test("TLDR tool hrefs are valid GitHub URLs", () => {
    testLog.testStart("TLDR tool URL validation");

    tldrFlywheelTools.forEach((tool) => {
      testLog.debug(`Validating TLDR tool URL: ${tool.name}`);

      expect(isValidUrl(tool.href)).toBe(true);
      expect(isGitHubUrl(tool.href)).toBe(true);
    });

    testLog.testEnd("TLDR tool URL validation", tldrFlywheelTools.length * 2);
  });
});

// =============================================================================
// CONTENT QUALITY
// =============================================================================

describe("Content Quality", () => {
  test("short descriptions are actually short (< 200 chars)", () => {
    testLog.testStart("Short description length validation");

    projects.forEach((project) => {
      expect(project.short.length).toBeLessThanOrEqual(200);
      expect(project.short.length).toBeGreaterThanOrEqual(10);
    });

    testLog.testEnd("Short description length validation", projects.length * 2);
  });

  test("descriptions are substantive (30-1000 chars)", () => {
    testLog.testStart("Description length validation");

    projects.forEach((project) => {
      testLog.debug(
        `Project "${project.name}" description length: ${project.description.length}`
      );

      expect(project.description.length).toBeGreaterThanOrEqual(30);
      expect(project.description.length).toBeLessThanOrEqual(1000);
    });

    testLog.testEnd("Description length validation", projects.length * 2);
  });

  test("no duplicate project names", () => {
    testLog.testStart("Duplicate project name check");

    const names = projects.map((p) => p.name.toLowerCase());
    const uniqueNames = new Set(names);

    expect(uniqueNames.size).toBe(names.length);

    testLog.testEnd("Duplicate project name check", 1);
  });

  test("TLDR tools have substantive content", () => {
    testLog.testStart("TLDR tool content validation");

    tldrFlywheelTools.forEach((tool) => {
      VALIDATION_STATS.tldrToolsChecked++;

      expect(tool.whatItDoes.length).toBeGreaterThan(50);
      expect(tool.whyItsUseful.length).toBeGreaterThan(50);
      expect(tool.implementationHighlights.length).toBeGreaterThanOrEqual(1);
      expect(tool.techStack.length).toBeGreaterThanOrEqual(1);
      expect(tool.keyFeatures.length).toBeGreaterThanOrEqual(1);
      expect(tool.useCases.length).toBeGreaterThanOrEqual(1);
    });

    testLog.testEnd(
      "TLDR tool content validation",
      tldrFlywheelTools.length * 6
    );
  });
});

// =============================================================================
// TAG CONSISTENCY
// =============================================================================

describe("Tag Consistency", () => {
  test("no overly long tags (max 25 chars)", () => {
    testLog.testStart("Tag length validation");

    projects.forEach((project) => {
      project.tags.forEach((tag) => {
        VALIDATION_STATS.tagsChecked++;
        expect(tag.length).toBeLessThanOrEqual(25);
      });
    });

    testLog.testEnd("Tag length validation");
  });

  test("tags are not empty strings", () => {
    testLog.testStart("Empty tag validation");

    projects.forEach((project) => {
      project.tags.forEach((tag) => {
        expect(tag.trim().length).toBeGreaterThan(0);
      });
    });

    testLog.testEnd("Empty tag validation");
  });

  test("TLDR tool techStack items are valid", () => {
    testLog.testStart("TLDR techStack validation");

    tldrFlywheelTools.forEach((tool) => {
      tool.techStack.forEach((tech) => {
        expect(tech.trim().length).toBeGreaterThan(0);
        expect(tech.length).toBeLessThanOrEqual(30);
      });
    });

    testLog.testEnd("TLDR techStack validation");
  });
});

// =============================================================================
// TLDR FLYWHEEL TOOLS VALIDATION
// =============================================================================

describe("TLDR Flywheel Tools Validation", () => {
  test("all TLDR tools have required fields", () => {
    testLog.testStart("TLDR required fields validation");

    tldrFlywheelTools.forEach((tool) => {
      expect(tool.id).toBeDefined();
      expect(tool.id.length).toBeGreaterThan(0);
      expect(tool.name).toBeDefined();
      expect(tool.shortName).toBeDefined();
      expect(tool.href).toBeDefined();
      expect(tool.icon).toBeDefined();
      expect(tool.color).toBeDefined();
      expect(["core", "supporting"]).toContain(tool.category);
    });

    testLog.testEnd(
      "TLDR required fields validation",
      tldrFlywheelTools.length * 8
    );
  });

  test("all TLDR tool IDs are unique", () => {
    testLog.testStart("TLDR ID uniqueness check");

    const ids = tldrFlywheelTools.map((t) => t.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);

    testLog.testEnd("TLDR ID uniqueness check", 1);
  });

  test("all TLDR tool synergies reference existing tools", () => {
    testLog.testStart("TLDR synergy reference validation");

    const allIds = new Set(tldrFlywheelTools.map((t) => t.id));

    tldrFlywheelTools.forEach((tool) => {
      tool.synergies.forEach((synergy) => {
        VALIDATION_STATS.synergiesValidated++;
        testLog.debug(`Validating synergy: ${tool.id} -> ${synergy.toolId}`);

        expect(allIds.has(synergy.toolId)).toBe(true);
        expect(synergy.description.length).toBeGreaterThan(10);
      });
    });

    testLog.testEnd("TLDR synergy reference validation");
  });

  test("TLDR tools have balanced category distribution", () => {
    testLog.testStart("TLDR category distribution check");

    const coreTools = tldrFlywheelTools.filter((t) => t.category === "core");
    const supportingTools = tldrFlywheelTools.filter(
      (t) => t.category === "supporting"
    );

    testLog.info("Category distribution:", {
      core: coreTools.length,
      supporting: supportingTools.length,
    });

    // Expect at least some tools in each category
    expect(coreTools.length).toBeGreaterThan(0);
    expect(supportingTools.length).toBeGreaterThan(0);

    testLog.testEnd("TLDR category distribution check", 2);
  });

  test("TLDR tools with stars have valid star counts", () => {
    testLog.testStart("TLDR star count validation");

    tldrFlywheelTools.forEach((tool) => {
      if (tool.stars !== undefined) {
        expect(tool.stars).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(tool.stars)).toBe(true);
      }
    });

    testLog.testEnd("TLDR star count validation");
  });
});

// =============================================================================
// HERO STATS VALIDATION
// =============================================================================

describe("Hero Stats Validation", () => {
  test("hero stats have required fields", () => {
    testLog.testStart("Hero stats required fields");

    heroStats.forEach((stat) => {
      expect(stat.label).toBeDefined();
      expect(stat.label.length).toBeGreaterThan(0);
      expect(stat.value).toBeDefined();
      expect(stat.value.length).toBeGreaterThan(0);
    });

    testLog.testEnd("Hero stats required fields", heroStats.length * 4);
  });

  test("hero stats values are reasonable", () => {
    testLog.testStart("Hero stats value validation");

    heroStats.forEach((stat) => {
      testLog.debug(`Stat: ${stat.label} = ${stat.value}`);
      // Values should not be obviously wrong (e.g., empty or extremely long)
      expect(stat.value.length).toBeLessThan(50);
    });

    testLog.testEnd("Hero stats value validation", heroStats.length);
  });
});

// =============================================================================
// NAV ITEMS VALIDATION
// =============================================================================

describe("Navigation Items Validation", () => {
  test("all nav items have href and label", () => {
    testLog.testStart("Nav items validation");

    navItems.forEach((item) => {
      expect(item.href).toBeDefined();
      expect(item.href).toMatch(/^\//); // Should start with /
      expect(item.label).toBeDefined();
      expect(item.label.length).toBeGreaterThan(0);
    });

    testLog.testEnd("Nav items validation", navItems.length * 4);
  });

  test("no duplicate nav hrefs", () => {
    testLog.testStart("Duplicate nav href check");

    const hrefs = navItems.map((n) => n.href);
    const uniqueHrefs = new Set(hrefs);

    expect(uniqueHrefs.size).toBe(hrefs.length);

    testLog.testEnd("Duplicate nav href check", 1);
  });
});

// =============================================================================
// ENDORSEMENTS VALIDATION
// =============================================================================

describe("Endorsements Validation", () => {
  test("all endorsements have required fields", () => {
    testLog.testStart("Endorsements validation");

    endorsements.forEach((endorsement) => {
      expect(endorsement.id).toBeDefined();
      expect(endorsement.quote).toBeDefined();
      expect(endorsement.quote.length).toBeGreaterThan(20);
      expect(endorsement.author).toBeDefined();
      expect(endorsement.author.name).toBeDefined();
      expect(endorsement.author.name.length).toBeGreaterThan(0);
      expect(endorsement.source).toBeDefined();
      expect(endorsement.source.type).toBeDefined();
      expect(["linkedin", "twitter", "podcast", "email", "other"]).toContain(
        endorsement.source.type
      );
      expect(Array.isArray(endorsement.tags)).toBe(true);
      expect(typeof endorsement.featured).toBe("boolean");
    });

    testLog.testEnd("Endorsements validation", endorsements.length * 11);
  });
});

// =============================================================================
// SITE CONFIG VALIDATION
// =============================================================================

describe("Site Config Validation", () => {
  test("site config has required fields", () => {
    testLog.testStart("Site config validation");

    expect(siteConfig.name).toBeDefined();
    expect(siteConfig.name.length).toBeGreaterThan(0);
    expect(siteConfig.title).toBeDefined();
    expect(siteConfig.description).toBeDefined();
    expect(siteConfig.email).toBeDefined();
    expect(siteConfig.email).toMatch(/@/);
    expect(siteConfig.social).toBeDefined();
    expect(siteConfig.social.github).toBeDefined();
    expect(isValidUrl(siteConfig.social.github)).toBe(true);
    expect(siteConfig.social.x).toBeDefined();
    expect(isValidUrl(siteConfig.social.x)).toBe(true);
    expect(siteConfig.social.linkedin).toBeDefined();
    expect(isValidUrl(siteConfig.social.linkedin)).toBe(true);

    testLog.testEnd("Site config validation", 14);
  });
});

// =============================================================================
// LIVE DEMOS VALIDATION
// =============================================================================

describe("Live Demos Validation", () => {
  test("all live demos have required fields", () => {
    testLog.testStart("Live demos validation");

    liveDemos.forEach((demo) => {
      expect(demo.id).toBeDefined();
      expect(demo.title).toBeDefined();
      expect(demo.title.length).toBeGreaterThan(0);
      expect(demo.description).toBeDefined();
      expect(demo.url).toBeDefined();
      expect(isValidUrl(demo.url)).toBe(true);
      expect(demo.category).toBeDefined();
      expect(["ai-tools", "education", "developer-tools"]).toContain(
        demo.category
      );
      expect(Array.isArray(demo.technologies)).toBe(true);
      expect(typeof demo.featured).toBe("boolean");
    });

    testLog.testEnd("Live demos validation", liveDemos.length * 10);
  });

  test("no duplicate demo IDs", () => {
    testLog.testStart("Duplicate demo ID check");

    const ids = liveDemos.map((d) => d.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);

    testLog.testEnd("Duplicate demo ID check", 1);
  });
});

// =============================================================================
// CAREER TIMELINE VALIDATION
// =============================================================================

describe("Career Timeline Validation", () => {
  test("all timeline items have required fields", () => {
    testLog.testStart("Timeline validation");

    careerTimeline.forEach((item) => {
      expect(item.title).toBeDefined();
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.org).toBeDefined();
      expect(item.org.length).toBeGreaterThan(0);
      expect(item.period).toBeDefined();
      expect(item.location).toBeDefined();
      expect(item.body).toBeDefined();
    });

    testLog.testEnd("Timeline validation", careerTimeline.length * 7);
  });
});

// =============================================================================
// MEDIA ITEMS VALIDATION
// =============================================================================

describe("Media Items Validation", () => {
  test("all media items have required fields", () => {
    testLog.testStart("Media items validation");

    mediaItems.forEach((item) => {
      expect(item.title).toBeDefined();
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.outlet).toBeDefined();
      expect(item.href).toBeDefined();
      expect(isValidUrl(item.href)).toBe(true);
      expect(item.kind).toBeDefined();
      expect(["Podcast", "Article", "Blog", "Profile"]).toContain(item.kind);
      expect(item.blurb).toBeDefined();
    });

    testLog.testEnd("Media items validation", mediaItems.length * 7);
  });
});

// =============================================================================
// THREADS VALIDATION
// =============================================================================

describe("Threads Validation", () => {
  test("all threads have required fields", () => {
    testLog.testStart("Threads validation");

    threads.forEach((thread) => {
      expect(thread.title).toBeDefined();
      expect(thread.title.length).toBeGreaterThan(0);
      expect(thread.href).toBeDefined();
      expect(isValidUrl(thread.href)).toBe(true);
      expect(thread.blurb).toBeDefined();
      expect(thread.blurb.length).toBeGreaterThan(0);
    });

    testLog.testEnd("Threads validation", threads.length * 5);
  });

  test("thread hrefs are Twitter/X URLs", () => {
    testLog.testStart("Thread URL format validation");

    threads.forEach((thread) => {
      expect(thread.href).toMatch(/twitter\.com|x\.com/);
    });

    testLog.testEnd("Thread URL format validation", threads.length);
  });
});

// =============================================================================
// WRITING HIGHLIGHTS VALIDATION
// =============================================================================

describe("Writing Highlights Validation", () => {
  test("all writing items have required fields", () => {
    testLog.testStart("Writing items validation");

    writingHighlights.forEach((item) => {
      expect(item.title).toBeDefined();
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.blurb).toBeDefined();
      expect(item.href).toBeDefined();
      expect(item.date).toBeDefined();
      expect(item.source).toBeDefined();
      expect(["YTO", "FMD", "GitHub", "Blog"]).toContain(item.source);
    });

    testLog.testEnd("Writing items validation", writingHighlights.length * 7);
  });
});

// =============================================================================
// FLYWHEEL TOOLS VALIDATION
// =============================================================================

describe("Flywheel Tools Validation", () => {
  test("all flywheel tools have required fields", () => {
    testLog.testStart("Flywheel tools validation");

    flywheelTools.forEach((tool) => {
      expect(tool.name).toBeDefined();
      expect(tool.name.length).toBeGreaterThan(0);
      expect(tool.tagline).toBeDefined();
      expect(tool.tagline.length).toBeGreaterThan(0);
      expect(tool.icon).toBeDefined();
      expect(tool.color).toBeDefined();
      expect(tool.href).toBeDefined();
      expect(isValidUrl(tool.href)).toBe(true);
    });

    testLog.testEnd("Flywheel tools validation", flywheelTools.length * 8);
  });
});

// =============================================================================
// CROSS-REFERENCE VALIDATION
// =============================================================================

describe("Cross-Reference Validation", () => {
  test("project slugs are unique when defined", () => {
    testLog.testStart("Project slug uniqueness");

    const slugs = projects.filter((p) => p.slug).map((p) => p.slug);
    const uniqueSlugs = new Set(slugs);

    expect(uniqueSlugs.size).toBe(slugs.length);

    testLog.testEnd("Project slug uniqueness", 1);
  });

  test("TLDR shortNames are unique", () => {
    testLog.testStart("TLDR shortName uniqueness");

    const shortNames = tldrFlywheelTools.map((t) => t.shortName);
    const uniqueShortNames = new Set(shortNames);

    expect(uniqueShortNames.size).toBe(shortNames.length);

    testLog.testEnd("TLDR shortName uniqueness", 1);
  });

  test("endorsement authors are not duplicated", () => {
    testLog.testStart("Endorsement author uniqueness");

    const authors = endorsements.map((e) => e.author);
    const uniqueAuthors = new Set(authors);

    // Allow some duplicates but flag if too many
    const duplicateRatio = 1 - uniqueAuthors.size / authors.length;
    expect(duplicateRatio).toBeLessThan(0.3); // Less than 30% duplicates

    testLog.testEnd("Endorsement author uniqueness", 1);
  });
});
