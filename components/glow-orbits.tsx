"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function GlowOrbits() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;

    const ctx = gsap.context(() => {
      const rings = gsap.utils.toArray<HTMLElement>(".glow-ring");

      if (rings.length === 0) return;

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
    }, rootRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="glow-ring absolute -top-32 -left-10 h-72 w-72 rounded-[999px] bg-gradient-to-tr from-sky-500/40 via-violet-500/20 to-transparent blur-3xl" />
      <div className="glow-ring absolute -bottom-40 -right-4 h-80 w-80 rounded-[999px] bg-gradient-to-tr from-emerald-400/40 via-sky-500/20 to-transparent blur-3xl" />
      <div className="glow-ring absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-[999px] bg-gradient-to-tr from-fuchsia-500/35 via-indigo-500/15 to-transparent blur-3xl" />
    </div>
  );
}
