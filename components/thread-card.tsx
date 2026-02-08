"use client";

import { HapticExternalLink } from "@/components/haptic-link";
import { ArrowRight } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { NOISE_SVG_DATA_URI } from "@/lib/constants";
import Magnetic from "@/components/magnetic";

export default function ThreadCard({ 
  thread 
}: { 
  thread: { href: string; title: string; blurb: string } 
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spotlightOpacity = useSpring(0, { stiffness: 300, damping: 30 });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional one-time browser feature detection
    setIsTouchDevice(window.matchMedia("(hover: none)").matches);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isTouchDevice) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }, [isTouchDevice, mouseX, mouseY]);

  const handleMouseEnter = () => {
    if (!isTouchDevice) spotlightOpacity.set(1);
  };

  const handleMouseLeave = () => {
    spotlightOpacity.set(0);
  };

  const spotlightBackground = useTransform(
    [mouseX, mouseY],
    ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(56, 189, 248, 0.06), transparent 40%)`
  );

  return (
    <HapticExternalLink
      href={thread.href}
      target="_blank"
      rel="noreferrer noopener"
      className="snap-center shrink-0 w-[85vw] sm:w-[60vw] md:w-auto h-full block"
    >
      <motion.article
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        whileHover={isTouchDevice ? {} : { y: -4 }}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/5 bg-slate-900/40 p-8 backdrop-blur-sm",
          "transition-colors duration-500 ease-out",
          "hover:bg-slate-900/60 hover:border-sky-500/30",
          "will-change-transform"
        )}
      >
        {/* Noise Overlay */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay transition-opacity duration-500 group-hover:opacity-[0.05]"
          style={{ backgroundImage: `url("${NOISE_SVG_DATA_URI}")` }}
        />

        {/* Dynamic Spotlight Effect */}
        <motion.div
          className="pointer-events-none absolute -inset-px transition-opacity duration-500"
          style={{
            opacity: spotlightOpacity,
            background: spotlightBackground,
          }}
          aria-hidden="true"
        />

        <p className="relative z-10 text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors group-hover:text-slate-400">
          Thread on X
        </p>
        
        <h3 className="relative z-10 mt-4 text-lg font-bold leading-snug text-slate-50 transition-colors group-hover:text-white">
          {thread.title}
        </h3>
        
        <p className="relative z-10 mt-4 flex-1 text-sm leading-relaxed text-slate-400 transition-colors group-hover:text-slate-300">
          {thread.blurb}
        </p>
        
        <div className="relative z-10 mt-6">
          <Magnetic strength={0.2}>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400 transition-colors group-hover:text-sky-300">
              <span className="relative">
                Open thread
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-current transition-all duration-300 group-hover:w-full" />
              </span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Magnetic>
        </div>
      </motion.article>
    </HapticExternalLink>
  );
}
