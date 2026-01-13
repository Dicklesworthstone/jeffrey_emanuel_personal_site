"use client";

import Link from "next/link";
import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Star,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Box,
  LayoutGrid,
  Rocket,
  Mail,
  GitBranch,
  Bug,
  Brain,
  Search,
  ShieldAlert,
  GitPullRequest,
  Archive,
  FileCode,
  RefreshCw,
  Cog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatStarCount, formatStarCountFull } from "@/lib/format-stars";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";
import type { TldrFlywheelTool } from "@/lib/content";

// =============================================================================
// TYPES
// =============================================================================

interface TldrToolCardProps {
  tool: TldrFlywheelTool;
  allTools: TldrFlywheelTool[];
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

// =============================================================================
// ICON MAP
// =============================================================================

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutGrid,
  Rocket,
  Mail,
  GitBranch,
  Bug,
  Brain,
  Search,
  ShieldAlert,
  GitPullRequest,
  Archive,
  FileCode,
  RefreshCw,
  Cog,
  Box,
};

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function DynamicIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const IconComponent = iconMap[name] || Box;
  return <IconComponent className={className} />;
}

function SynergyPill({
  synergy,
  allTools,
}: {
  synergy: { toolId: string; description: string };
  allTools: TldrFlywheelTool[];
}) {
  const linkedTool = allTools.find((t) => t.id === synergy.toolId);
  if (!linkedTool) return null;

  return (
    <div className="group/synergy relative flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 transition-colors hover:bg-white/10">
      <div
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br",
          linkedTool.color
        )}
      >
        <DynamicIcon name={linkedTool.icon} className="h-3 w-3 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="block text-xs font-semibold text-white">
          {linkedTool.shortName}
        </span>
        <span className="block truncate text-[10px] text-slate-400 group-hover/synergy:text-slate-300">
          {synergy.description}
        </span>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function TldrToolCard({
  tool,
  allTools,
  isExpanded = false,
  onToggleExpand,
}: TldrToolCardProps) {
  const { lightTap, mediumTap } = useHapticFeedback();
  const cardRef = useRef<HTMLDivElement>(null);
  const [spotlightOpacity, setSpotlightOpacity] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion ?? false;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || reducedMotion) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      requestAnimationFrame(() => {
        cardRef.current?.style.setProperty("--mouse-x", `${x}px`);
        cardRef.current?.style.setProperty("--mouse-y", `${y}px`);
      });
    },
    [reducedMotion]
  );

  const handleToggle = useCallback(() => {
    mediumTap();
    onToggleExpand?.();
  }, [mediumTap, onToggleExpand]);

  // Extract RGB values from gradient for spotlight
  const gradientToRgb: Record<string, string> = {
    "from-sky-500 to-blue-600": "56, 189, 248",
    "from-amber-500 to-orange-600": "251, 191, 36",
    "from-violet-500 to-purple-600": "139, 92, 246",
    "from-emerald-500 to-teal-600": "52, 211, 153",
    "from-rose-500 to-red-600": "244, 63, 94",
    "from-pink-500 to-fuchsia-600": "236, 72, 153",
    "from-cyan-500 to-sky-600": "34, 211, 238",
    "from-red-500 to-rose-600": "239, 68, 68",
    "from-slate-500 to-gray-600": "100, 116, 139",
    "from-blue-500 to-indigo-600": "59, 130, 246",
    "from-green-500 to-emerald-600": "34, 197, 94",
    "from-orange-500 to-amber-600": "249, 115, 22",
    "from-purple-500 to-violet-600": "168, 85, 247",
  };

  const spotlightRgb = gradientToRgb[tool.color] || "255, 255, 255";

  return (
    <motion.div
      layout={!reducedMotion}
      className="group"
      initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.4 }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setSpotlightOpacity(1)}
        onMouseLeave={() => setSpotlightOpacity(0)}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm",
          "transition-all duration-300",
          "hover:border-white/20 hover:bg-slate-900/70",
          isExpanded && "ring-2 ring-white/20"
        )}
      >
        {/* Gradient background */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-[0.05] transition-opacity duration-300 group-hover:opacity-[0.1]",
            tool.color
          )}
        />

        {/* Spotlight effect */}
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-500"
          style={{
            opacity: spotlightOpacity,
            background: `radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(${spotlightRgb}, 0.15), transparent 40%)`,
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Header - always visible */}
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              {/* Icon and title */}
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg",
                    tool.color
                  )}
                >
                  <DynamicIcon name={tool.icon} className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">
                      {tool.shortName}
                    </h3>
                    {tool.category === "core" && (
                      <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-300">
                        Core
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-slate-400">{tool.name}</p>
                </div>
              </div>

              {/* Stars and link */}
              <div className="flex items-center gap-2">
                {tool.stars && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-xs font-bold text-amber-200 ring-1 ring-inset ring-amber-500/20"
                    aria-label={`${formatStarCountFull(tool.stars)} GitHub stars`}
                    title={`${formatStarCountFull(tool.stars)} stars`}
                  >
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                    {formatStarCount(tool.stars)}
                  </span>
                )}
                <Link
                  href={tool.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                    lightTap();
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label={`View ${tool.name} on GitHub`}
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* What it does - always visible */}
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              {tool.whatItDoes}
            </p>

            {/* Expand button - minimum 44px height for touch targets */}
            <button
              onClick={handleToggle}
              className="mt-4 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-white/5 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-expanded={isExpanded}
              aria-controls={`tool-details-${tool.id}`}
            >
              {isExpanded ? (
                <>
                  <span>Show Less</span>
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span>Show More</span>
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {/* Expanded content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                id={`tool-details-${tool.id}`}
                initial={reducedMotion ? {} : { height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={reducedMotion ? {} : { height: 0, opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.3 }}
                className="overflow-hidden border-t border-white/10"
              >
                <div className="space-y-6 p-5">
                  {/* Why it's useful */}
                  <div>
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Why It&apos;s Useful
                    </h4>
                    <p className="text-sm leading-relaxed text-slate-300">
                      {tool.whyItsUseful}
                    </p>
                  </div>

                  {/* Key features */}
                  <div>
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Key Features
                    </h4>
                    <ul className="space-y-2">
                      {tool.keyFeatures.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-slate-300"
                        >
                          <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Implementation highlights */}
                  <div>
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Implementation Highlights
                    </h4>
                    <ul className="space-y-2">
                      {tool.implementationHighlights.map((highlight, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-slate-400"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tech stack */}
                  <div>
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Tech Stack
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {tool.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-md bg-white/5 px-2 py-1 text-xs font-medium text-slate-400"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Synergies */}
                  {tool.synergies.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Synergies
                      </h4>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {tool.synergies.map((synergy) => (
                          <SynergyPill
                            key={synergy.toolId}
                            synergy={synergy}
                            allTools={allTools}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Use cases */}
                  <div>
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Use Cases
                    </h4>
                    <ul className="space-y-2">
                      {tool.useCases.map((useCase, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-slate-400"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600" />
                          {useCase}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default TldrToolCard;
