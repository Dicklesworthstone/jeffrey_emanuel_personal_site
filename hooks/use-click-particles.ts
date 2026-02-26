"use client";

import { useCallback, useRef, useEffect } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
}

interface UseClickParticlesOptions {
  /** Number of particles to spawn per click */
  count?: number;
  /** Colors to use for particles */
  colors?: string[];
  /** Duration of the animation in ms */
  duration?: number;
  /** Whether particles are enabled */
  enabled?: boolean;
}

const defaultColors = [
  "#38bdf8", // sky-400
  "#a78bfa", // violet-400
  "#34d399", // emerald-400
  "#f472b6", // pink-400
  "#fbbf24", // amber-400
];

// Singleton canvas to avoid DOM thrashing
let globalCanvas: HTMLCanvasElement | null = null;
let globalParticles: Particle[] = [];
let animationId: number | null = null;
let globalResizeHandler: (() => void) | null = null;
let _activeHookCount = 0;

function cleanupGlobalResources(): void {
  if (typeof window !== "undefined" && globalResizeHandler) {
    window.removeEventListener("resize", globalResizeHandler);
    globalResizeHandler = null;
  }

  if (typeof window !== "undefined" && animationId !== null) {
    window.cancelAnimationFrame(animationId);
  }
  animationId = null;
  globalParticles = [];

  if (globalCanvas) {
    globalCanvas.remove();
    globalCanvas = null;
  }
}

/**
 * Hook that creates particle burst effects on click.
 * Call the returned function with a click event to spawn particles.
 * Uses a global singleton canvas for efficiency across multiple component usages.
 */
export function useClickParticles({
  count = 12,
  colors = defaultColors,
  duration = 600,
  enabled = true,
}: UseClickParticlesOptions = {}) {
  // Check for reduced motion preference
  const prefersReducedMotionRef = useRef(false);

  useEffect(() => {
    _activeHookCount++;

    if (typeof window === "undefined") {
      return () => {
        _activeHookCount = Math.max(0, _activeHookCount - 1);
      };
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotionRef.current = mediaQuery.matches;

    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler);
    } else {
      mediaQuery.addListener(handler);
    }

    return () => {
      _activeHookCount = Math.max(0, _activeHookCount - 1);

      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handler);
      } else {
        mediaQuery.removeListener(handler);
      }

      if (_activeHookCount === 0) {
        cleanupGlobalResources();
      }
    };
  }, []);

  const getCanvas = useCallback(() => {
    if (globalCanvas) return globalCanvas;
    if (typeof window === "undefined" || prefersReducedMotionRef.current) return null;

    const canvas = document.createElement("canvas");
    canvas.id = "global-click-particles";
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
    `;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    globalCanvas = canvas;

    if (!globalResizeHandler) {
      globalResizeHandler = () => {
        if (globalCanvas) {
          globalCanvas.width = window.innerWidth;
          globalCanvas.height = window.innerHeight;
        }
      };
      window.addEventListener("resize", globalResizeHandler);
    }

    return canvas;
  }, []);

  const animate = useCallback(() => {
    const canvas = globalCanvas;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const loop = () => {
      if (!globalCanvas || globalCanvas !== canvas) {
        animationId = null;
        return;
      }

      if (globalParticles.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        animationId = null;
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const aliveParticles: Particle[] = [];
      const gravity = 0.18;
      const friction = 0.98;

      for (let i = 0; i < globalParticles.length; i++) {
        const p = globalParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= friction;
        p.vy *= friction;
        p.vy += gravity;
        p.life -= 0.016; // Approx 1/60th of a second

        if (p.life > 0) {
          aliveParticles.push(p);
          const alpha = Math.min(1, p.life * 2); // Quick fade at end
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * Math.sqrt(alpha), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
          ctx.fill();
        }
      }

      globalParticles = aliveParticles;
      animationId = requestAnimationFrame(loop);
    };

    if (animationId === null) {
      animationId = requestAnimationFrame(loop);
    }
  }, []);

  const spawnParticles = useCallback(
    (event: React.MouseEvent | { clientX: number; clientY: number }) => {
      if (!enabled || prefersReducedMotionRef.current) return;

      const canvas = getCanvas();
      if (!canvas) return;

      const x = event.clientX;
      const y = event.clientY;
      const lifespan = duration / 1000;
      const palette = colors.length > 0 ? colors : defaultColors;

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        const speed = 2 + Math.random() * 5;
        const colorHex = palette[Math.floor(Math.random() * palette.length)] ?? defaultColors[0];
        const rgb = hexToRgbRaw(colorHex);

        globalParticles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          life: lifespan * (0.8 + Math.random() * 0.4),
          size: 2 + Math.random() * 3,
          color: rgb,
        });
      }

      animate();
    },
    [enabled, count, colors, duration, getCanvas, animate]
  );

  return spawnParticles;
}

/**
 * Fast hex to RGB string conversion (returning "R, G, B" for rgba usage)
 */
function hexToRgbRaw(hex: string): string {
  let r = 255, g = 255, b = 255;
  const h = hex.replace("#", "");
  
  if (h.length === 3) {
    r = parseInt(h[0] + h[0], 16);
    g = parseInt(h[1] + h[1], 16);
    b = parseInt(h[2] + h[2], 16);
  } else if (h.length === 6) {
    r = parseInt(h.substring(0, 2), 16);
    g = parseInt(h.substring(2, 4), 16);
    b = parseInt(h.substring(4, 6), 16);
  }
  
  return `${r}, ${g}, ${b}`;
}

export default useClickParticles;
