"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Lightweight fallback for the Three.js scene on mobile devices.
 * Uses CSS animations and SVG instead of WebGL for better performance.
 * Respects prefers-reduced-motion for accessibility.
 */
export default function ThreeSceneFallback() {
  const prefersReducedMotion = useReducedMotion();

  // Static version for reduced motion - no animations
  if (prefersReducedMotion) {
    return (
      <div className="relative h-full w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-violet-950/30 to-slate-900" />
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-gradient-to-br from-violet-500/20 to-transparent blur-3xl opacity-40" />
        <div className="absolute -bottom-10 -right-10 h-60 w-60 rounded-full bg-gradient-to-tl from-sky-500/20 to-transparent blur-3xl opacity-30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="h-64 w-64 sm:h-80 sm:w-80" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="90" stroke="url(#gradient1-static)" strokeWidth="0.5" strokeDasharray="8 4" fill="none" />
            <circle cx="100" cy="100" r="70" stroke="url(#gradient2-static)" strokeWidth="0.5" strokeDasharray="6 3" fill="none" />
            <circle cx="100" cy="100" r="50" stroke="url(#gradient3-static)" strokeWidth="0.5" strokeDasharray="4 2" fill="none" />
            <circle cx="100" cy="100" r="15" fill="url(#centerGlow-static)" opacity="0.8" />
            <defs>
              <linearGradient id="gradient1-static" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="gradient2-static" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="gradient3-static" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ec4899" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
              </linearGradient>
              <radialGradient id="centerGlow-static">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-violet-950/30 to-slate-900" />

      {/* Animated gradient orbs */}
      <motion.div
        className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-gradient-to-br from-violet-500/20 to-transparent blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -bottom-10 -right-10 h-60 w-60 rounded-full bg-gradient-to-tl from-sky-500/20 to-transparent blur-3xl"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.25, 0.4, 0.25],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-fuchsia-500/15 to-emerald-500/15 blur-2xl"
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Animated orbital rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          className="h-64 w-64 sm:h-80 sm:w-80"
          viewBox="0 0 200 200"
          fill="none"
        >
          {/* Outer ring */}
          <motion.circle
            cx="100"
            cy="100"
            r="90"
            stroke="url(#gradient1)"
            strokeWidth="0.5"
            strokeDasharray="8 4"
            fill="none"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "center" }}
          />
          {/* Middle ring */}
          <motion.circle
            cx="100"
            cy="100"
            r="70"
            stroke="url(#gradient2)"
            strokeWidth="0.5"
            strokeDasharray="6 3"
            fill="none"
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "center" }}
          />
          {/* Inner ring */}
          <motion.circle
            cx="100"
            cy="100"
            r="50"
            stroke="url(#gradient3)"
            strokeWidth="0.5"
            strokeDasharray="4 2"
            fill="none"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "center" }}
          />

          {/* Floating dots */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const angle = (i / 6) * Math.PI * 2;
            const radius = 70;
            const cx = 100 + Math.cos(angle) * radius;
            const cy = 100 + Math.sin(angle) * radius;
            return (
              <motion.circle
                key={i}
                cx={cx}
                cy={cy}
                r="3"
                fill={`url(#dot${i % 3})`}
                animate={{
                  opacity: [0.4, 1, 0.4],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut",
                }}
              />
            );
          })}

          {/* Center glow */}
          <motion.circle
            cx="100"
            cy="100"
            r="15"
            fill="url(#centerGlow)"
            animate={{
              opacity: [0.6, 1, 0.6],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="gradient2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="gradient3" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
            </linearGradient>
            <radialGradient id="centerGlow">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="dot0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.5" />
            </radialGradient>
            <radialGradient id="dot1">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.5" />
            </radialGradient>
            <radialGradient id="dot2">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.5" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Particle-like dots scattered */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-white/30"
          style={{
            left: `${10 + (i * 4.2) % 80}%`,
            top: `${5 + (i * 3.7) % 90}%`,
          }}
          animate={{
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + (i % 3),
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
