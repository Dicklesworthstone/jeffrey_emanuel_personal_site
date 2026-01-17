"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Device capability tiers for adaptive rendering
 */
export type DeviceTier = "low" | "medium" | "high";

/**
 * Comprehensive device capabilities for adaptive rendering
 */
export interface DeviceCapabilities {
  tier: DeviceTier;
  isMobile: boolean;
  isSlowConnection: boolean;
  hardwareConcurrency: number;
  devicePixelRatio: number;
  prefersReducedMotion: boolean;
  hasLowMemory: boolean;
  isLowPowerMode: boolean;
  maxTextureSize: number;
  supportsWebGL2: boolean;
}

/**
 * Quality settings derived from device capabilities
 */
export interface QualitySettings {
  particleMultiplier: number;      // 0.25 - 1.0
  geometryDetail: number;          // 0.5 - 1.0 (segment multiplier)
  maxDpr: number;                  // 1 - 2
  enableShadows: boolean;
  enablePostProcessing: boolean;
  maxParticles: number;            // Absolute cap
  targetFps: number;               // 30 or 60
}

// Cache WebGL capabilities to avoid expensive context creation
let cachedWebGLCaps: { maxTextureSize: number; supportsWebGL2: boolean } | null = null;

function getWebGLCapabilities() {
  if (cachedWebGLCaps) return cachedWebGLCaps;

  let maxTextureSize = 4096;
  let supportsWebGL2 = false;

  try {
    const canvas = document.createElement("canvas");
    const gl2 = canvas.getContext("webgl2");
    if (gl2) {
      supportsWebGL2 = true;
      maxTextureSize = gl2.getParameter(gl2.MAX_TEXTURE_SIZE);
    } else {
      const gl1 = canvas.getContext("webgl");
      if (gl1) {
        maxTextureSize = gl1.getParameter(gl1.MAX_TEXTURE_SIZE);
      }
    }
    // Context loss to free resources
    const ext = (gl2 || canvas.getContext("webgl"))?.getExtension('WEBGL_lose_context');
    if (ext) ext.loseContext();
  } catch {
    // WebGL not available
  }

  cachedWebGLCaps = { maxTextureSize, supportsWebGL2 };
  return cachedWebGLCaps;
}

/**
 * Detect device capabilities for adaptive rendering
 */
function detectCapabilities(): DeviceCapabilities {
  if (typeof window === "undefined") {
    return {
      tier: "medium",
      isMobile: false,
      isSlowConnection: false,
      hardwareConcurrency: 4,
      devicePixelRatio: 1,
      prefersReducedMotion: false,
      hasLowMemory: false,
      isLowPowerMode: false,
      maxTextureSize: 4096,
      supportsWebGL2: true,
    };
  }

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Check connection speed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conn = (navigator as any).connection;
  const isSlowConnection = conn
    ? conn.effectiveType === "slow-2g" ||
      conn.effectiveType === "2g" ||
      conn.saveData === true
    : false;

  // Hardware concurrency (CPU cores)
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;

  // Device pixel ratio
  const devicePixelRatio = window.devicePixelRatio || 1;

  // Reduced motion preference
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Low memory detection (Chrome only)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasLowMemory = (navigator as any).deviceMemory
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? (navigator as any).deviceMemory <= 4
    : isMobile;

  // Low power mode detection (heuristic: iOS low power mode reduces CPU frequency)
  const isLowPowerMode = isSlowConnection || hasLowMemory;

  // WebGL capabilities (cached)
  const { maxTextureSize, supportsWebGL2 } = getWebGLCapabilities();

  // Determine tier based on capabilities
  let tier: DeviceTier = "high";

  // Downgrade based on indicators
  let score = 0;
  if (isMobile) score += 2;
  if (isSlowConnection) score += 3;
  if (hardwareConcurrency <= 2) score += 2;
  if (hardwareConcurrency <= 4) score += 1;
  if (hasLowMemory) score += 2;
  if (devicePixelRatio > 2.5) score += 1; // High DPR = more GPU work
  if (!supportsWebGL2) score += 1;
  if (maxTextureSize < 4096) score += 1;
  if (prefersReducedMotion) score += 2;

  if (score >= 6) tier = "low";
  else if (score >= 3) tier = "medium";

  return {
    tier,
    isMobile,
    isSlowConnection,
    hardwareConcurrency,
    devicePixelRatio,
    prefersReducedMotion,
    hasLowMemory,
    isLowPowerMode,
    maxTextureSize,
    supportsWebGL2,
  };
}

/**
 * Generate quality settings from device capabilities
 */
function getQualitySettings(caps: DeviceCapabilities): QualitySettings {
  switch (caps.tier) {
    case "low":
      return {
        particleMultiplier: 0.2,
        geometryDetail: 0.5,
        maxDpr: 1,
        enableShadows: false,
        enablePostProcessing: false,
        maxParticles: 180,
        targetFps: 60,
      };
    case "medium":
      return {
        particleMultiplier: 0.45,
        geometryDetail: 0.7,
        maxDpr: 1.5,
        enableShadows: false,
        enablePostProcessing: false,
        maxParticles: 500,
        targetFps: 60,
      };
    case "high":
    default:
      return {
        particleMultiplier: 1.0,
        geometryDetail: 1.0,
        maxDpr: 2,
        enableShadows: true,
        enablePostProcessing: true,
        maxParticles: 2000,
        targetFps: 60,
      };
  }
}

// Default SSR-safe capabilities (used for initial render to avoid hydration mismatch)
const defaultCapabilities: DeviceCapabilities = {
  tier: "medium",
  isMobile: false,
  isSlowConnection: false,
  hardwareConcurrency: 4,
  devicePixelRatio: 1,
  prefersReducedMotion: false,
  hasLowMemory: false,
  isLowPowerMode: false,
  maxTextureSize: 4096,
  supportsWebGL2: true,
};

/**
 * Hook to get device capabilities and quality settings for Three.js rendering.
 * Re-evaluates on visibility change and orientation change.
 */
export function useDeviceCapabilities() {
  // Initialize with SSR-safe defaults to avoid hydration mismatch
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>(defaultCapabilities);
  const [isHydrated, setIsHydrated] = useState(false);

  // Detect actual capabilities after hydration
  useEffect(() => {
    const hydrationId = setTimeout(() => {
      setCapabilities(detectCapabilities());
      setIsHydrated(true);
    }, 0);
    return () => clearTimeout(hydrationId);
  }, []);

  useEffect(() => {
    // Re-detect on visibility change (user might have changed power settings)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setCapabilities(detectCapabilities());
      }
    };

    let orientationTimeout: ReturnType<typeof setTimeout> | null = null;

    // Re-detect on orientation change
    const handleOrientationChange = () => {
      if (orientationTimeout) clearTimeout(orientationTimeout);
      orientationTimeout = setTimeout(() => setCapabilities(detectCapabilities()), 100);
    };

    // Listen for reduced motion preference changes
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionChange = () => {
      setCapabilities(detectCapabilities());
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("orientationchange", handleOrientationChange);
    if (motionQuery.addEventListener) {
      motionQuery.addEventListener("change", handleMotionChange);
    } else {
      motionQuery.addListener(handleMotionChange);
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("orientationchange", handleOrientationChange);
      if (orientationTimeout) {
        clearTimeout(orientationTimeout);
        orientationTimeout = null;
      }
      if (motionQuery.removeEventListener) {
        motionQuery.removeEventListener("change", handleMotionChange);
      } else {
        motionQuery.removeListener(handleMotionChange);
      }
    };
  }, []);

  const quality = useMemo(
    () => getQualitySettings(capabilities),
    [capabilities]
  );

  return { capabilities, quality, isHydrated };
}

/**
 * Mobile-specific optimizations and enhancements
 * Handles iOS-specific quirks, touch interactions, and performance
 */
export function useMobileOptimizations() {
  useEffect(() => {
    // Only run on mobile devices
    if (typeof window === "undefined") return;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) return;

    // NOTE: Removed preventBounce touchmove handler as it was blocking scroll
    // CSS overscroll-behavior-y: none on body already handles iOS bounce

    // Add orientation change listener for better UX
    let orientationTimeout: ReturnType<typeof setTimeout> | null = null;
    const handleOrientationChange = () => {
      // Trigger resize to recalculate viewport and fix any layout issues
      // Small delay to ensure orientation change is complete
      if (orientationTimeout) clearTimeout(orientationTimeout);
      orientationTimeout = setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 100);
    };

    window.addEventListener("orientationchange", handleOrientationChange);

    // Cleanup
    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
      if (orientationTimeout) {
        clearTimeout(orientationTimeout);
        orientationTimeout = null;
      }
    };
  }, []);
}

/**
 * Utility function to detect if user is on mobile device.
 * This is NOT a React hook - it's a simple detection function.
 */
export function checkIsMobile(): boolean {
  if (typeof window === "undefined") return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

/**
 * Alias for checkIsMobile for convenience
 */
export const isMobile = checkIsMobile;

/**
 * Get static device capabilities (non-reactive, for use in non-component contexts)
 */
export function getDeviceCapabilities(): DeviceCapabilities {
  return detectCapabilities();
}

/**
 * Get static quality settings (non-reactive, for use in non-component contexts)
 */
export function getStaticQualitySettings(): QualitySettings {
  return getQualitySettings(detectCapabilities());
}
