"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useInView, useScroll, useTransform } from "framer-motion";
import {
  Cpu,
  FileText,
  Share2,
  TrendingUp,
  TrendingDown,
  Quote,
  Newspaper,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { nvidiaStoryData, type NvidiaStoryTimelineEvent } from "@/lib/content";

// =============================================================================
// ICON MAPPING
// Maps string icon names from content.ts to Lucide components
// =============================================================================

const iconMap: Record<string, LucideIcon> = {
  Cpu,
  FileText,
  Share2,
  TrendingUp,
  TrendingDown,
  Quote,
  Newspaper,
};

// =============================================================================
// TIMELINE EVENT CARD
// Individual event on the timeline
// =============================================================================

interface TimelineEventProps {
  event: NvidiaStoryTimelineEvent;
  index: number;
  isLast: boolean;
}

function TimelineEvent({ event, index, isLast }: TimelineEventProps) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const Icon = iconMap[event.icon] || FileText;
  const isEven = index % 2 === 0;

  // Animation variants
  const cardVariants = {
    hidden: {
      opacity: 0,
      x: prefersReducedMotion ? 0 : isEven ? -30 : 30,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.5,
        delay: prefersReducedMotion ? 0 : index * 0.1,
      },
    },
  };

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex items-start gap-4 md:gap-8",
        // Alternating layout on larger screens
        isEven ? "md:flex-row" : "md:flex-row-reverse"
      )}
    >
      {/* Event card */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className={cn(
          "flex-1 rounded-lg border bg-slate-900/50 p-4",
          event.featured
            ? "border-violet-500/30 shadow-lg shadow-violet-500/10"
            : "border-slate-800",
          // Align text based on position
          isEven ? "md:text-right" : "md:text-left"
        )}
      >
        {/* Date badge */}
        <span className="mb-2 inline-block rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-400">
          {event.displayDate}
        </span>

        {/* Title */}
        <h3
          className={cn(
            "mb-1 text-lg font-semibold",
            event.featured ? "text-white" : "text-slate-200"
          )}
        >
          {event.title}
        </h3>

        {/* Description */}
        <p className="text-sm leading-relaxed text-slate-400">
          {event.description}
        </p>

        {/* Source link */}
        {event.sourceUrl && (
          <a
            href={event.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "mt-3 inline-flex items-center gap-1 text-xs font-medium text-violet-400 transition-colors hover:text-violet-300",
              isEven ? "md:flex-row-reverse" : ""
            )}
          >
            <ExternalLink className="h-3 w-3" />
            View source
          </a>
        )}
      </motion.div>

      {/* Center node (timeline dot) */}
      <div className="relative flex flex-col items-center">
        {/* Icon circle */}
        <motion.div
          initial={prefersReducedMotion ? {} : { scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.3,
            delay: prefersReducedMotion ? 0 : index * 0.1,
            type: "spring",
            bounce: 0.4,
          }}
          className={cn(
            "relative z-10 flex h-10 w-10 items-center justify-center rounded-full",
            event.featured
              ? "bg-violet-500 text-white shadow-lg shadow-violet-500/30"
              : "bg-slate-800 text-slate-400"
          )}
        >
          <Icon className="h-5 w-5" />
        </motion.div>

        {/* Connecting line (not for last item) */}
        {!isLast && (
          <motion.div
            initial={prefersReducedMotion ? { scaleY: 1 } : { scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : {}}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.5,
              delay: prefersReducedMotion ? 0 : index * 0.1 + 0.2,
            }}
            style={{ originY: 0 }}
            className="w-0.5 flex-1 bg-gradient-to-b from-slate-700 to-slate-800"
          />
        )}
      </div>

      {/* Spacer for alternating layout (hidden on mobile) */}
      <div className="hidden flex-1 md:block" />
    </div>
  );
}

// =============================================================================
// TIMELINE PROGRESS LINE
// Animated line that fills as user scrolls
// =============================================================================

function TimelineProgressLine() {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  if (prefersReducedMotion) {
    return (
      <div
        ref={containerRef}
        className="absolute left-[19px] top-0 h-full w-0.5 bg-slate-800 md:left-1/2 md:-translate-x-1/2"
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute left-[19px] top-0 h-full w-0.5 md:left-1/2 md:-translate-x-1/2"
      aria-hidden="true"
    >
      {/* Background line */}
      <div className="absolute inset-0 bg-slate-800" />
      {/* Animated progress */}
      <motion.div
        style={{ scaleY, originY: 0 }}
        className="absolute inset-0 bg-gradient-to-b from-violet-500 to-violet-600"
      />
    </div>
  );
}

// =============================================================================
// MAIN TIMELINE COMPONENT
// =============================================================================

interface NvidiaStoryTimelineProps {
  /** Additional classes */
  className?: string;
  /** Show section heading */
  showHeading?: boolean;
}

export function NvidiaStoryTimeline({
  className,
  showHeading = true,
}: NvidiaStoryTimelineProps) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const events = nvidiaStoryData.timeline;

  return (
    <section
      ref={ref}
      className={cn("relative", className)}
      aria-label="Timeline of events"
    >
      {/* Section heading */}
      {showHeading && (
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-3 text-3xl font-bold text-white md:text-4xl">
            The Timeline
          </h2>
          <p className="mx-auto max-w-2xl text-slate-400">
            From essay publication to historic market impact — the sequence of events
            that made financial history.
          </p>
        </motion.div>
      )}

      {/* Narrative insight callout */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: 0.2 }}
        className="mb-12 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-center md:p-6"
      >
        <p className="text-sm leading-relaxed text-amber-200/80 md:text-base">
          <span className="font-semibold text-amber-300">Key insight: </span>
          {nvidiaStoryData.narrativeInsight}
        </p>
      </motion.div>

      {/* Timeline container */}
      <div className="relative pl-14 md:pl-0">
        {/* Progress line */}
        <TimelineProgressLine />

        {/* Events */}
        <div className="space-y-8 md:space-y-12">
          {events.map((event, index) => (
            <TimelineEvent
              key={event.id}
              event={event}
              index={index}
              isLast={index === events.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default NvidiaStoryTimeline;
