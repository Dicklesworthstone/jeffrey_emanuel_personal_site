"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionStyle } from "framer-motion";
import type { WritingItem } from "@/lib/content";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";
import { cn } from "@/lib/utils";
import Magnetic from "@/components/magnetic";
import { memo } from "react";

// A touch that travels further than this before lifting is a scroll, not a tap.
const TAP_MOVE_THRESHOLD_PX = 8;

// Readable names for the source codes used in lib/content.ts.
const SOURCE_LABELS: Record<WritingItem["source"], string> = {
  YTO: "YouTube Transcript Optimizer",
  FMD: "Fix My Documents",
  GitHub: "GitHub",
  Blog: "Blog",
};

function formatWritingDate(iso: string): string {
  const parsed = new Date(iso.includes("T") ? iso : `${iso}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export const WritingCard = memo(function WritingCard({
  item,
  headingLevel = 3,
}: {
  item: WritingItem;
  /** h2 on index pages whose only heading above the cards is the h1; h3 inside sections */
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const { lightTap } = useHapticFeedback();
  const cardRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

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
    if (cardRef.current) {
      rectRef.current = cardRef.current.getBoundingClientRect();
    }
    if (!isTouchDevice) spotlightOpacity.set(1);
  };

  const handleMouseLeave = () => {
    spotlightOpacity.set(0);
    rectRef.current = null;
  };

  // Haptics fire on a completed tap (pointerup with < 8px travel), never on
  // touchstart, so a scroll that begins on the card does not buzz.
  const tapStartRef = useRef<{ x: number; y: number } | null>(null);
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLAnchorElement>) => {
    tapStartRef.current = e.pointerType === "touch" ? { x: e.clientX, y: e.clientY } : null;
  }, []);
  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLAnchorElement>) => {
    const start = tapStartRef.current;
    tapStartRef.current = null;
    if (!start) return;
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) < TAP_MOVE_THRESHOLD_PX) lightTap();
  }, [lightTap]);
  const handlePointerCancel = useCallback(() => {
    tapStartRef.current = null;
  }, []);

  const isFeatured = item.featured;
  // Static gradient string; only the two custom properties move on mousemove.
  // The wash reads the ink token so it stays a 6% tint in light mode too.
  // (useTransform rather than useMotionTemplate: the tagged template makes the
  // React Compiler bail on this component, which silently drops lint coverage.)
  const mouseXPx = useTransform(mouseX, (v) => `${v}px`);
  const mouseYPx = useTransform(mouseY, (v) => `${v}px`);
  const spotlightBackground =
    "radial-gradient(600px circle at var(--mx) var(--my), color-mix(in srgb, var(--site-ink) 6%, transparent), transparent 40%)";

  return (
    <Link 
      href={item.href} 
      className={cn(
        "block h-full", 
        isFeatured ? "md:col-span-2" : "col-span-1"
      )}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <motion.article
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          // card-flat owns radius, tint, border, shadow and the hover lift
          "card-flat group relative flex h-full flex-col overflow-hidden p-6 md:p-8"
        )}
      >
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
            "--mx": mouseXPx,
            "--my": mouseYPx,
          } as MotionStyle}
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-1 flex-col">
          <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-bold uppercase tracking-wider">
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-white ring-1 ring-white/10 transition-colors group-hover:bg-white/10 group-hover:ring-white/20">
              {SOURCE_LABELS[item.source] ?? item.source}
            </span>
            <span className="text-slate-600" aria-hidden="true">•</span>
            <span className={cn("text-slate-500 transition-colors group-hover:text-slate-400")}>
              {item.category}
            </span>
            {item.date && (
              <time
                dateTime={item.date}
                className="ml-auto whitespace-nowrap font-medium normal-case tracking-normal text-slate-500"
              >
                {formatWritingDate(item.date)}
              </time>
            )}
          </div>

          <Heading className={cn(
            "font-bold leading-tight text-white transition-colors group-hover:text-white",
            isFeatured ? "text-2xl md:text-4xl mb-4" : "text-lg md:text-xl mb-3"
          )}>
            {item.title}
          </Heading>

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
                  <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 group-hover:scale-x-100" />
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </div>
            </Magnetic>
          </div>
        </div>
      </motion.article>
    </Link>
  );
});

export default WritingCard;
