"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function GlowOrbits() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;

    // Detect mobile device (server-safe)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Check if user prefers reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    const ctx = gsap.context(() => {
      const rings = gsap.utils.toArray<HTMLElement>(".glow-ring");

      if (rings.length === 0) return;

      // Reduce animation complexity on mobile
      if (isMobile) {
        // Only rotate, no scaling on mobile for better performance
        gsap.to(rings, {
          rotate: 360,
          duration: 60, // Slower on mobile to reduce repaints
          repeat: -1,
          ease: "none",
          transformOrigin: "50% 50%",
          stagger: 0.3,
        });
      } else {
        // Full animations on desktop
        gsap.to(rings, {
          rotate: 360,
          duration: 48,
          repeat: -1,
          ease: "none",
          transformOrigin: "50% 50%",
          stagger: 0.2,
        });

        gsap.to(rings, {
          yoyo: true,
          repeat: -1,
          duration: 9,
          ease: "sine.inOut",
          scale: 1.06,
          stagger: 0.28,
        });

        // Mouse interaction for parallax effect
        const handleMouseMove = (e: MouseEvent) => {
          const { clientX, clientY } = e;
          const xPos = (clientX / window.innerWidth - 0.5) * 60;
          const yPos = (clientY / window.innerHeight - 0.5) * 60;
          
          gsap.to(rootRef.current, {
            x: xPos,
            y: yPos,
            duration: 1.5,
            ease: "power2.out",
          });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
      }
    }, rootRef);

    // Listen for changes to prefers-reduced-motion
    const handleMotionPreferenceChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        // User enabled reduced motion - stop animations
        ctx.revert();
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMotionPreferenceChange);
    } else {
      mediaQuery.addListener(handleMotionPreferenceChange);
    }

    return () => {
      ctx.revert();
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleMotionPreferenceChange);
      } else {
        mediaQuery.removeListener(handleMotionPreferenceChange);
      }
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Reduced blur on mobile for better performance */}
      <div className="glow-ring absolute -top-32 -left-10 h-72 w-72 rounded-[999px] bg-gradient-to-tr from-sky-500/40 via-violet-500/20 to-transparent blur-2xl md:blur-3xl" />
      <div className="glow-ring absolute -bottom-40 -right-4 h-80 w-80 rounded-[999px] bg-gradient-to-tr from-emerald-400/40 via-sky-500/20 to-transparent blur-2xl md:blur-3xl" />
      <div className="glow-ring absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-[999px] bg-gradient-to-tr from-fuchsia-500/35 via-indigo-500/15 to-transparent blur-2xl md:blur-3xl" />
    </div>
  );
}
