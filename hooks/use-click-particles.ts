"use client";

import { useCallback, useRef } from "react";

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

/**
 * Hook that creates particle burst effects on click.
 * Call the returned function with a click event to spawn particles.
 */
export function useClickParticles({
  count = 12,
  colors = defaultColors,
  duration = 600,
  enabled = true,
}: UseClickParticlesOptions = {}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  const resizeHandlerRef = useRef<(() => void) | null>(null);

  // Get or create the canvas element
  const getCanvas = useCallback(() => {
    if (canvasRef.current) return canvasRef.current;

    // Check for reduced motion preference
    if (typeof window !== "undefined") {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReducedMotion) return null;
    }

    const canvas = document.createElement("canvas");
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
    canvasRef.current = canvas;

    // Handle resize
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    resizeHandlerRef.current = handleResize;
    window.addEventListener("resize", handleResize);

    return canvas;
  }, []);

  // Animate particles
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const particles = particlesRef.current;
    const aliveParticles: Particle[] = [];

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // gravity
      p.life -= 1 / 60;

      if (p.life > 0) {
        aliveParticles.push(p);
        const alpha = Math.max(0, p.life);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(")", `, ${alpha})`).replace("rgb", "rgba");
        ctx.fill();
      }
    }

    particlesRef.current = aliveParticles;

    if (aliveParticles.length > 0) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      // Clean up canvas and event listener when no particles
      if (resizeHandlerRef.current) {
        window.removeEventListener("resize", resizeHandlerRef.current);
        resizeHandlerRef.current = null;
      }
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      canvasRef.current = null;
      animationRef.current = null;
    }
  }, []);

  // Spawn particles at click position
  const spawnParticles = useCallback(
    (event: React.MouseEvent | { clientX: number; clientY: number }) => {
      if (!enabled) return;

      // Check for reduced motion
      if (typeof window !== "undefined") {
        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;
        if (prefersReducedMotion) return;
      }

      const canvas = getCanvas();
      if (!canvas) return;

      const x = event.clientX;
      const y = event.clientY;
      const lifespan = duration / 1000;

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        const speed = 3 + Math.random() * 4;
        const color = colors[Math.floor(Math.random() * colors.length)];

        // Convert hex to RGB for alpha support
        const rgbColor = hexToRgb(color);

        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2, // slight upward bias
          life: lifespan,
          size: 3 + Math.random() * 3,
          color: rgbColor,
        });
      }

      // Start animation if not already running
      if (animationRef.current === null) {
        animationRef.current = requestAnimationFrame(animate);
      }
    },
    [enabled, count, colors, duration, getCanvas, animate]
  );

  return spawnParticles;
}

// Helper to convert hex to RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgb(${r}, ${g}, ${b})`;
  }
  return "rgb(255, 255, 255)";
}

export default useClickParticles;
