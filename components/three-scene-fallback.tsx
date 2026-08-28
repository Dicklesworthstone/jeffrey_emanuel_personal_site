"use client";

import { useId, useRef } from "react";
import { useReducedMotion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

// Fixed-precision dot coordinates: raw trig floats serialize differently on
// the server and client, which caused a React hydration mismatch.
const FLOATING_DOTS = [0, 1, 2, 3, 4, 5].map((i) => {
  const angle = (i / 6) * Math.PI * 2;
  const radius = 70;
  return {
    cx: (100 + Math.cos(angle) * radius).toFixed(2),
    cy: (100 + Math.sin(angle) * radius).toFixed(2),
  };
});

/**
 * Lightweight fallback for the Three.js scene: no WebGL, reduced motion, the
 * strict GPU probe failed, or the context was lost.
 *
 * Deliberately a static composition plus ONE slow CSS keyframe rotation of
 * the ring group. The devices that land here are exactly the ones that
 * cannot afford JS-driven animations on blurred layers, so the glow orbs
 * never animate and nothing runs through Framer. The rotation is only
 * applied while on screen and when motion is allowed; SSR and offscreen
 * render the static markup (which also keeps server and client identical).
 */
export default function ThreeSceneFallback({ className }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { margin: "100px" });
  // Gradient ids must be unique per instance (React ids contain colons,
  // which are awkward inside url(#...) references).
  const uid = useId().replace(/:/g, "");

  const rotating = !prefersReducedMotion && isInView;

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full w-full overflow-hidden", className)}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-violet-950/30 to-slate-900" />
      {/* Static glow orbs - blurred surfaces are never animated here */}
      <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-gradient-to-br from-violet-500/20 to-transparent blur-3xl opacity-40" />
      <div className="absolute -bottom-10 -right-10 h-60 w-60 rounded-full bg-gradient-to-tl from-sky-500/20 to-transparent blur-3xl opacity-30" />
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          className="h-64 w-64 sm:h-80 sm:w-80"
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          {/* Ring group: the single animated element (CSS transform on the compositor) */}
          <g
            className={cn(rotating && "animate-[spin_90s_linear_infinite]")}
            style={{ transformOrigin: "100px 100px" }}
          >
            <circle cx="100" cy="100" r="90" stroke={`url(#g1-${uid})`} strokeWidth="0.5" strokeDasharray="8 4" fill="none" />
            <circle cx="100" cy="100" r="70" stroke={`url(#g2-${uid})`} strokeWidth="0.5" strokeDasharray="6 3" fill="none" />
            <circle cx="100" cy="100" r="50" stroke={`url(#g3-${uid})`} strokeWidth="0.5" strokeDasharray="4 2" fill="none" />
            {FLOATING_DOTS.map((dot, i) => (
              <circle key={i} cx={dot.cx} cy={dot.cy} r="3" fill={`url(#dot${i % 3}-${uid})`} opacity="0.85" />
            ))}
          </g>
          <circle cx="100" cy="100" r="15" fill={`url(#center-${uid})`} opacity="0.8" />
          <defs>
            <linearGradient id={`g1-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id={`g2-${uid}`} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id={`g3-${uid}`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
            </linearGradient>
            <radialGradient id={`center-${uid}`}>
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`dot0-${uid}`}>
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.5" />
            </radialGradient>
            <radialGradient id={`dot1-${uid}`}>
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.5" />
            </radialGradient>
            <radialGradient id={`dot2-${uid}`}>
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.5" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
