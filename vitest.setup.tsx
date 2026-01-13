import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, afterAll, beforeEach, vi, expect } from "vitest";
import { tldrMatchers, testLog, resetMockIdCounter } from "@/tests/utils/tldr-test-helpers";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  return {
    ...actual,
    useReducedMotion: () => true, // Always prefer reduced motion in tests
  };
});

// Mock matchMedia for responsive tests
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  root = null;
  rootMargin = "";
  thresholds = [];
  disconnect = vi.fn();
  observe = vi.fn();
  takeRecords = vi.fn();
  unobserve = vi.fn();
};

// =============================================================================
// TLDR TEST UTILITIES
// =============================================================================

// Extend Vitest with custom matchers
expect.extend(tldrMatchers);

// Test suite lifecycle logging
beforeAll(() => {
  testLog.section("Starting Test Suite");
});

afterAll(() => {
  testLog.section("Test Suite Complete");
});

// Reset mock factories before each test
beforeEach(() => {
  resetMockIdCounter();
});

// =============================================================================
// CUSTOM MATCHER TYPE DECLARATIONS
// =============================================================================

declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> {
    toBeAccessible(): T;
    toMeetTouchTargetSize(minSize?: number): T;
    toHaveValidSynergies(allTools: import("@/lib/content").TldrFlywheelTool[]): T;
  }
  interface AsymmetricMatchersContaining {
    toBeAccessible(): unknown;
    toMeetTouchTargetSize(minSize?: number): unknown;
    toHaveValidSynergies(allTools: import("@/lib/content").TldrFlywheelTool[]): unknown;
  }
}
