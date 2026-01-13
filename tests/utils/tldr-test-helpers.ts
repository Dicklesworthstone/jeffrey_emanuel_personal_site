/**
 * Test utilities and logging infrastructure for /tldr tests.
 *
 * Provides:
 * - Structured logging with levels
 * - Mock data factories for TldrFlywheelTool
 * - Render utilities with logging
 * - Custom matchers for Vitest
 * - Wait utilities for animations
 *
 * @module tests/utils/tldr-test-helpers
 */

import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import type { ReactElement } from "react";
import { vi } from "vitest";
import type { TldrFlywheelTool, TldrToolCategory } from "@/lib/content";

// =============================================================================
// LOGGING UTILITIES
// =============================================================================

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SILENT: 4,
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

let currentLogLevel: number = LOG_LEVELS.DEBUG;

/**
 * Set the current log level for test output.
 * @param level - The log level to set
 */
export const setLogLevel = (level: LogLevel): void => {
  currentLogLevel = LOG_LEVELS[level];
};

/**
 * Get the current log level.
 */
export const getLogLevel = (): LogLevel => {
  const entries = Object.entries(LOG_LEVELS);
  const match = entries.find(([, value]) => value === currentLogLevel);
  return (match?.[0] as LogLevel) ?? "DEBUG";
};

/**
 * Structured test logging with levels and formatting.
 */
export const testLog = {
  /**
   * Debug-level log - most verbose, for detailed tracing.
   */
  debug: (msg: string, data?: unknown): void => {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
      console.log(`[DEBUG] ${msg}`, data !== undefined ? data : "");
    }
  },

  /**
   * Info-level log - general test progress.
   */
  info: (msg: string, data?: unknown): void => {
    if (currentLogLevel <= LOG_LEVELS.INFO) {
      console.log(`[INFO] ${msg}`, data !== undefined ? data : "");
    }
  },

  /**
   * Warning-level log - potential issues.
   */
  warn: (msg: string, data?: unknown): void => {
    if (currentLogLevel <= LOG_LEVELS.WARN) {
      console.warn(`[WARN] ${msg}`, data !== undefined ? data : "");
    }
  },

  /**
   * Error-level log - always shown.
   */
  error: (msg: string, data?: unknown): void => {
    if (currentLogLevel <= LOG_LEVELS.ERROR) {
      console.error(`[ERROR] ${msg}`, data !== undefined ? data : "");
    }
  },

  /**
   * Log timing information.
   * @param label - Description of what was timed
   * @param startTime - Start time from performance.now()
   * @returns The duration in milliseconds
   */
  timing: (label: string, startTime: number): number => {
    const duration = performance.now() - startTime;
    if (currentLogLevel <= LOG_LEVELS.INFO) {
      console.log(`[TIMING] ${label}: ${duration.toFixed(2)}ms`);
    }
    return duration;
  },

  /**
   * Log DOM state (truncated for readability).
   * @param element - Element to log
   * @param maxLength - Maximum characters to show (default 500)
   */
  dom: (element: HTMLElement, maxLength = 500): void => {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
      const html = element.outerHTML.substring(0, maxLength);
      const truncated = element.outerHTML.length > maxLength ? "..." : "";
      console.log(`[DOM] ${html}${truncated}`);
    }
  },

  /**
   * Log test section header.
   */
  section: (name: string): void => {
    if (currentLogLevel <= LOG_LEVELS.INFO) {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`[SECTION] ${name}`);
      console.log("=".repeat(60));
    }
  },

  /**
   * Log test case start.
   */
  testStart: (name: string): void => {
    if (currentLogLevel <= LOG_LEVELS.INFO) {
      console.log(`[TEST] Starting: ${name}`);
    }
  },

  /**
   * Log test case completion.
   */
  testEnd: (name: string, assertionCount?: number): void => {
    if (currentLogLevel <= LOG_LEVELS.INFO) {
      const assertions = assertionCount !== undefined ? ` (${assertionCount} assertions)` : "";
      console.log(`[TEST] Completed: ${name}${assertions}`);
    }
  },
};

// =============================================================================
// MOCK DATA FACTORIES
// =============================================================================

let mockIdCounter = 0;

/**
 * Create a mock TldrFlywheelTool with sensible defaults.
 * All fields can be overridden.
 *
 * @param overrides - Partial tool to override defaults
 * @returns A complete TldrFlywheelTool object
 */
export const createMockTool = (
  overrides?: Partial<TldrFlywheelTool>
): TldrFlywheelTool => {
  const id = overrides?.id ?? `mock-tool-${++mockIdCounter}`;
  return {
    id,
    name: `Mock Tool ${mockIdCounter}`,
    shortName: `MT${mockIdCounter}`,
    href: `https://github.com/test/${id}`,
    icon: "Box",
    color: "from-blue-500 to-cyan-500",
    category: "core",
    stars: 100,
    whatItDoes: "This is a mock tool for testing purposes. It simulates the behavior of a real flywheel tool.",
    whyItsUseful: "It helps test other components effectively without requiring the real implementation.",
    implementationHighlights: ["TypeScript", "React", "Testing Library"],
    synergies: [],
    techStack: ["TypeScript", "Node.js"],
    keyFeatures: ["Feature 1", "Feature 2"],
    useCases: ["Testing", "Development"],
    ...overrides,
  };
};

/**
 * Create an array of mock tools.
 *
 * @param count - Number of tools to create
 * @param categoryDistribution - Optional ratio of core to supporting (default: all core)
 * @returns Array of TldrFlywheelTool objects
 */
export const createMockTools = (
  count: number,
  categoryDistribution?: { core: number; supporting: number }
): TldrFlywheelTool[] => {
  const tools: TldrFlywheelTool[] = [];

  if (categoryDistribution) {
    const coreCount = Math.floor(count * (categoryDistribution.core / (categoryDistribution.core + categoryDistribution.supporting)));
    const supportingCount = count - coreCount;

    for (let i = 0; i < coreCount; i++) {
      tools.push(createMockTool({ category: "core" }));
    }
    for (let i = 0; i < supportingCount; i++) {
      tools.push(createMockTool({ category: "supporting" }));
    }
  } else {
    for (let i = 0; i < count; i++) {
      tools.push(createMockTool());
    }
  }

  return tools;
};

/**
 * Create a realistic set of tools with synergies.
 * Useful for testing the synergy diagram.
 *
 * @param count - Number of tools (default 6)
 * @returns Array of interconnected tools
 */
export const createMockToolsWithSynergies = (count = 6): TldrFlywheelTool[] => {
  const tools: TldrFlywheelTool[] = [];

  // Create base tools first
  for (let i = 0; i < count; i++) {
    tools.push(
      createMockTool({
        id: `synergy-tool-${i}`,
        name: `Synergy Tool ${i}`,
        shortName: `ST${i}`,
        category: i < count / 2 ? "core" : "supporting",
      })
    );
  }

  // Add synergies between tools
  for (let i = 0; i < tools.length; i++) {
    const synergyCount = Math.min(2, tools.length - 1);
    const synergies: TldrFlywheelTool["synergies"] = [];

    for (let j = 0; j < synergyCount; j++) {
      const targetIndex = (i + j + 1) % tools.length;
      synergies.push({
        toolId: tools[targetIndex].id,
        description: `Synergy between ${tools[i].shortName} and ${tools[targetIndex].shortName}`,
      });
    }

    tools[i].synergies = synergies;
  }

  return tools;
};

/**
 * Reset the mock ID counter.
 * Call this in beforeEach to get consistent IDs.
 */
export const resetMockIdCounter = (): void => {
  mockIdCounter = 0;
};

// =============================================================================
// RENDER UTILITIES
// =============================================================================

interface ExtendedRenderOptions extends RenderOptions {
  /** Test name for logging */
  testName?: string;
  /** Log DOM after render */
  logDom?: boolean;
  /** Log timing information */
  logTiming?: boolean;
}

interface ExtendedRenderResult extends RenderResult {
  /** Log the current DOM state */
  logDom: () => void;
  /** Get render duration in ms */
  renderDuration: number;
}

/**
 * Render a component with logging capabilities.
 *
 * @param ui - React element to render
 * @param options - Extended render options with logging
 * @returns Extended render result with logging utilities
 */
export const renderWithLogging = (
  ui: ReactElement,
  options: ExtendedRenderOptions = {}
): ExtendedRenderResult => {
  const {
    testName = "Unknown Test",
    logDom = false,
    logTiming = true,
    ...renderOptions
  } = options;

  testLog.debug(`Rendering component for: ${testName}`);
  const startTime = performance.now();

  const result = render(ui, renderOptions);

  const renderDuration = performance.now() - startTime;

  if (logTiming) {
    testLog.timing(`Render complete: ${testName}`, startTime);
  }

  if (logDom) {
    testLog.dom(result.container as HTMLElement);
  }

  return {
    ...result,
    logDom: () => testLog.dom(result.container as HTMLElement),
    renderDuration,
  };
};

// =============================================================================
// WAIT UTILITIES
// =============================================================================

/**
 * Wait for a specified duration.
 * Useful for animation tests.
 *
 * @param ms - Milliseconds to wait (default 300 for standard animation)
 */
export const waitForAnimation = async (ms = 300): Promise<void> => {
  testLog.debug(`Waiting ${ms}ms for animation`);
  await new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Wait for next animation frame.
 */
export const waitForAnimationFrame = (): Promise<void> => {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
};

// =============================================================================
// REDUCED MOTION UTILITIES
// =============================================================================

/**
 * Mock the prefers-reduced-motion media query.
 *
 * @param reduced - Whether to prefer reduced motion
 */
export const mockReducedMotion = (reduced: boolean): void => {
  testLog.info(`Mocking prefers-reduced-motion: ${reduced}`);

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)" ? reduced : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

// =============================================================================
// ACCESSIBILITY UTILITIES
// =============================================================================

/**
 * Check if an element has accessible name.
 *
 * @param element - Element to check
 * @returns Whether the element has an accessible name
 */
export const hasAccessibleName = (element: HTMLElement): boolean => {
  return !!(
    element.getAttribute("aria-label") ||
    element.getAttribute("aria-labelledby") ||
    element.textContent?.trim() ||
    element.getAttribute("title")
  );
};

/**
 * Get all focusable elements within a container.
 *
 * @param container - Container to search within
 * @returns Array of focusable elements
 */
export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const selector =
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  return Array.from(container.querySelectorAll<HTMLElement>(selector));
};

/**
 * Check minimum touch target size (WCAG 2.5.5).
 *
 * @param element - Element to check
 * @param minSize - Minimum size in pixels (default 44)
 * @returns Whether the element meets touch target requirements
 */
export const meetsTouchTargetSize = (
  element: HTMLElement,
  minSize = 44
): boolean => {
  const rect = element.getBoundingClientRect();
  return rect.width >= minSize && rect.height >= minSize;
};

// =============================================================================
// CUSTOM MATCHERS
// =============================================================================

/**
 * Custom Vitest matchers for TLDR tests.
 * Import and extend in vitest.setup.tsx with:
 * expect.extend(tldrMatchers);
 */
export const tldrMatchers = {
  /**
   * Check if element has accessible attributes.
   */
  toBeAccessible(received: HTMLElement) {
    const hasRole = received.hasAttribute("role");
    const hasAriaLabel =
      received.hasAttribute("aria-label") ||
      received.hasAttribute("aria-labelledby");
    const isNativeAccessible = ["BUTTON", "A", "INPUT", "SELECT", "TEXTAREA"].includes(
      received.tagName
    );

    testLog.debug("Accessibility check", { hasRole, hasAriaLabel, isNativeAccessible });

    const pass = hasRole || hasAriaLabel || isNativeAccessible;

    return {
      pass,
      message: () =>
        pass
          ? `Expected element not to be accessible`
          : `Expected element to have ARIA attributes or be natively accessible. Element: ${received.outerHTML.substring(0, 100)}`,
    };
  },

  /**
   * Check if element meets touch target size requirements.
   */
  toMeetTouchTargetSize(received: HTMLElement, minSize = 44) {
    const rect = received.getBoundingClientRect();
    const pass = rect.width >= minSize && rect.height >= minSize;

    testLog.debug("Touch target check", {
      width: rect.width,
      height: rect.height,
      minSize,
      pass,
    });

    return {
      pass,
      message: () =>
        pass
          ? `Expected element not to meet ${minSize}px touch target size`
          : `Expected element to be at least ${minSize}x${minSize}px, but was ${rect.width}x${rect.height}px`,
    };
  },

  /**
   * Check if a tool has valid synergies (references existing tools).
   */
  toHaveValidSynergies(received: TldrFlywheelTool, allTools: TldrFlywheelTool[]) {
    const allIds = new Set(allTools.map((t) => t.id));
    const invalidSynergies = received.synergies.filter(
      (s) => !allIds.has(s.toolId)
    );

    const pass = invalidSynergies.length === 0;

    testLog.debug("Synergy validation", {
      toolId: received.id,
      synergyCount: received.synergies.length,
      invalidCount: invalidSynergies.length,
    });

    return {
      pass,
      message: () =>
        pass
          ? `Expected tool ${received.id} to have invalid synergies`
          : `Tool ${received.id} has invalid synergy references: ${invalidSynergies.map((s) => s.toolId).join(", ")}`,
    };
  },
};

// =============================================================================
// PERFORMANCE UTILITIES
// =============================================================================

/**
 * Measure and log render performance.
 *
 * @param renderFn - Function that performs rendering
 * @param label - Label for the measurement
 * @returns Duration in milliseconds
 */
export const measureRender = async (
  renderFn: () => void | Promise<void>,
  label: string
): Promise<number> => {
  const start = performance.now();
  await renderFn();
  const duration = performance.now() - start;

  testLog.timing(label, start);

  return duration;
};

/**
 * Assert that an operation completes within a time budget.
 *
 * @param operation - Async operation to measure
 * @param budgetMs - Maximum allowed time in milliseconds
 * @param label - Description for logging
 */
export const assertWithinTimeBudget = async (
  operation: () => void | Promise<void>,
  budgetMs: number,
  label: string
): Promise<void> => {
  const duration = await measureRender(operation, label);

  if (duration > budgetMs) {
    testLog.warn(`Performance budget exceeded: ${label}`, {
      actual: duration.toFixed(2),
      budget: budgetMs,
    });
  }
};

// =============================================================================
// EXPORTS
// =============================================================================

export type { ExtendedRenderOptions, ExtendedRenderResult, LogLevel };
