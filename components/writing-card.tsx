"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import type { WritingItem } from "@/lib/content";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";
import { cn } from "@/lib/utils";
import { NOISE_SVG_DATA_URI } from "@/lib/constants";
import Magnetic from "@/components/magnetic";
import { memo } from "react";

export const WritingCard = memo(function WritingCard({ item }: { item: WritingItem }) {
  const { lightTap } = useHapticFeedback();
  const cardRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spotlightOpacity = useSpring(0, { stiffness: 300, damping: 30 });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional one-time browser feature detection
    setIsTouchDevice(window.matchMedia("(hover: none)").matches);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!rectRef.current || isTouchDevice) return;
    mouseX.set(e.clientX - rectRef.current.left);
    mouseY.set(e.clientY - rectRef.current.top);
  }, [isTouchDevice, mouseX, mouseY]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (cardRef.current) {
      rectRef.current = cardRef.current.getBoundingClientRect();
    }
    if (!isTouchDevice) spotlightOpacity.set(1);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    spotlightOpacity.set(0);
    rectRef.current = null;
  };

  const isFeatured = item.featured;
  const spotlightBackground = useTransform(
    [mouseX, mouseY],
    ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(255, 255, 255, 0.06), transparent 40%)`
  );

  const borderClass = item.featured
    ? "border-white/10 group-hover:border-white/20"
    : "border-white/5 group-hover:border-white/10";

  return (
    <Link 
      href={item.href} 
      className={cn(
        "block h-full", 
        isFeatured ? "md:col-span-2" : "col-span-1"
      )}
      onTouchStart={lightTap}
    >
      <motion.article
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        whileHover={isTouchDevice ? {} : { y: -4 }}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-2xl sm:rounded-3xl border p-6 md:p-8",
          "transition-colors duration-500 ease-out",
          "will-change-transform",
          borderClass,
          item.featured ? "bg-slate-900/40 hover:bg-slate-900/60" : "bg-slate-950/40 hover:bg-slate-950/60"
        )}
      >
        {/* Noise Overlay */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay transition-opacity duration-500 group-hover:opacity-[0.05]"
          style={{ backgroundImage: `url("${NOISE_SVG_DATA_URI}")` }}
        />

        {/* Scanline Effect */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-[0.01] group-hover:opacity-[0.03]" />

        {/* Featured Gradient Background */}
        {isFeatured && item.gradient && (
          <div className={cn("absolute inset-0 opacity-[0.08] transition-opacity duration-700 group-hover:opacity-[0.15] bg-gradient-to-br", item.gradient)} aria-hidden="true" />
        )}

        {/* Dynamic Spotlight Effect */}
        <motion.div
          className="pointer-events-none absolute -inset-px transition-opacity duration-500"
          style={{
            opacity: spotlightOpacity,
            background: spotlightBackground,
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-1 flex-col">
          <div className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-widest">
            <div className="relative overflow-hidden rounded-full bg-white/5 px-2 py-0.5 ring-1 ring-white/10 transition-colors group-hover:bg-white/10 group-hover:ring-white/20">
               <AnimatePresence>
                 {isHovered && !isTouchDevice && (
                   <>
                     <motion.span 
                       initial={{ opacity: 0, x: 0 }}
                       animate={{ opacity: 0.5, x: -1 }}
                       exit={{ opacity: 0 }}
                       className="absolute inset-0 flex items-center justify-center text-rose-500 mix-blend-screen px-2 py-0.5"
                     >
                       {item.source}
                     </motion.span>
                     <motion.span 
                       initial={{ opacity: 0, x: 0 }}
                       animate={{ opacity: 0.5, x: 1 }}
                       exit={{ opacity: 0 }}
                       className="absolute inset-0 flex items-center justify-center text-cyan-500 mix-blend-screen px-2 py-0.5"
                     >
                       {item.source}
                     </motion.span>
                   </>
                 )}
               </AnimatePresence>
               <span className="relative z-10 text-white">{item.source}</span>
            </div>
            <span className="text-slate-600">•</span>
            <span className={cn("text-slate-500 transition-colors group-hover:text-slate-400")}>
              {item.category}
            </span>
          </div>

          <h3 className={cn(
            "font-bold leading-tight text-white transition-colors group-hover:text-white",
            isFeatured ? "text-2xl md:text-4xl mb-4" : "text-lg md:text-xl mb-3"
          )}>
            {item.title}
          </h3>

          <p className={cn(
            "leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors",
            isFeatured ? "text-lg md:text-xl max-w-3xl" : "text-sm flex-1"
          )}>
            {item.blurb}
          </p>

          <div className="mt-8">
            <Magnetic strength={0.2}>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400 transition-all group-hover:text-sky-300">
                <span className="relative">
                  Read Article
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-current transition-all duration-300 group-hover:w-full" />
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
            </Magnetic>
          </div>
        </div>
      </motion.article>
    </Link>
  );
});

export default WritingCard;
