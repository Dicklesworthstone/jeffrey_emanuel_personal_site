"use client";

import Link from "next/link";
import { useRef, useState, useCallback, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Star,
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
  ShieldCheck,
  GitPullRequest,
  Archive,
  FileCode,
  RefreshCw,
  Cog,
  Image,
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
  ShieldCheck,
  GitPullRequest,
  Archive,
  FileCode,
  RefreshCw,
  Cog,
  Image,
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
    <div className="group/synergy relative flex items-center gap-2 rounded-lg bg-white/5 px-2 py-1.5 transition-colors hover:bg-white/10 sm:px-3 sm:py-2">
      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-gradient-to-br sm:h-6 sm:w-6",
          linkedTool.color
        )}
      >
        <DynamicIcon name={linkedTool.icon} className="h-2.5 w-2.5 text-white sm:h-3 sm:w-3" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="block text-xs font-semibold text-white sm:text-xs">
          {linkedTool.shortName}
        </span>
        <span className="block truncate text-xs text-slate-400 group-hover/synergy:text-slate-300 sm:text-xs">
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
}: TldrToolCardProps) {
  const { lightTap } = useHapticFeedback();
  const cardRef = useRef<HTMLDivElement>(null);
  const [spotlightOpacity, setSpotlightOpacity] = useState(0);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion ?? false;

  // Detect touch device to disable spotlight effect (better mobile performance)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional one-time browser feature detection
    setIsTouchDevice(window.matchMedia("(hover: none)").matches);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || reducedMotion || isTouchDevice) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      requestAnimationFrame(() => {
        cardRef.current?.style.setProperty("--mouse-x", `${x}px`);
        cardRef.current?.style.setProperty("--mouse-y", `${y}px`);
      });
    },
    [reducedMotion, isTouchDevice]
  );

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
      className="group h-full"
      initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.4 }}
      data-testid="tool-card"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setSpotlightOpacity(1)}
        onMouseLeave={() => setSpotlightOpacity(0)}
        className={cn(
          "relative h-full flex flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm",
          "transition-all duration-300",
          "hover:border-white/20 hover:bg-slate-900/70",
          "active:scale-[0.98] active:border-white/25"
        )}
      >
        {/* Gradient background */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-[0.05] transition-opacity duration-300 group-hover:opacity-[0.1]",
            tool.color
          )}
          aria-hidden="true"
        />

        {/* Spotlight effect */}
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-500"
          style={{
            opacity: spotlightOpacity,
            background: `radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(${spotlightRgb}, 0.15), transparent 40%)`,
          }}
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative z-10 flex flex-1 flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              {/* Icon and title */}
              <div className="flex items-start gap-3 sm:gap-4">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg sm:h-12 sm:w-12",
                    tool.color
                  )}
                >
                  <DynamicIcon name={tool.icon} className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-white sm:text-lg">
                      {tool.shortName}
                    </h3>
                    {tool.category === "core" && (
                      <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-violet-300 sm:text-xs">
                        Core
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-slate-400 sm:text-sm">{tool.name}</p>
                </div>
              </div>

              {/* Stars and link */}
              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                {tool.stars && (
                  <span
                    className="relative inline-flex items-center gap-1 overflow-hidden rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 px-2 py-1 text-xs font-bold text-amber-100 shadow-lg shadow-amber-500/10 ring-1 ring-inset ring-amber-400/30 transition-all duration-300 hover:ring-amber-400/50 hover:shadow-amber-500/20 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs"
                    aria-label={`${formatStarCountFull(tool.stars)} GitHub stars`}
                    title={`${formatStarCountFull(tool.stars)} stars`}
                  >
                    {/* Shimmer effect - slower for smoother feel */}
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-[1500ms] ease-in-out motion-reduce:transition-none motion-safe:group-hover:translate-x-full" aria-hidden="true" />
                    <Star className="relative h-3 w-3 fill-amber-400 text-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.5)] sm:h-3.5 sm:w-3.5" aria-hidden="true" />
                    <span className="relative font-mono tracking-tight">{formatStarCount(tool.stars)}</span>
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
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white sm:h-11 sm:w-11"
                  aria-label={`View ${tool.name} on GitHub`}
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* What it does */}
            <p className="mt-3 text-xs leading-relaxed text-slate-300 sm:mt-4 sm:text-sm">
              {tool.whatItDoes}
            </p>
          </div>

          {/* Full content - always visible */}
          <div className="flex-1 border-t border-white/10">
            <div className="space-y-4 p-4 sm:space-y-5 sm:p-5">
              {/* Why it's useful */}
              <div>
                <h4 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 sm:mb-2 sm:text-xs">
                  Why It&apos;s Useful
                </h4>
                <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
                  {tool.whyItsUseful}
                </p>
              </div>

              {/* Key features */}
              <div>
                <h4 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 sm:mb-2 sm:text-xs">
                  Key Features
                </h4>
                <ul className="space-y-1 sm:space-y-1.5">
                  {tool.keyFeatures.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-xs text-slate-300 sm:text-sm"
                    >
                      <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500 sm:h-4 sm:w-4" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tech stack */}
              <div>
                <h4 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 sm:mb-2 sm:text-xs">
                  Tech Stack
                </h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {tool.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-md bg-white/5 px-1.5 py-0.5 text-xs font-medium text-slate-400 sm:px-2 sm:py-1 sm:text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Synergies */}
              {tool.synergies.length > 0 && (
                <div>
                  <h4 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 sm:mb-2 sm:text-xs">
                    Synergies
                  </h4>
                  <div className="grid gap-1.5 sm:gap-2 sm:grid-cols-2">
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
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default TldrToolCard;
