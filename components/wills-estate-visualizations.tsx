"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Compass,
  FolderTree,
  GitBranch,
  House,
  MapPinned,
  Landmark,
  Layers3,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Wallet,
  FileCheck,
  HeartPulse,
  Waypoints,
} from "lucide-react";

function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function useViewportFlags() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return { isMobile };
}

type VizShellProps = {
  eyebrow: string;
  title: string;
  summary: string;
  accent: "amber" | "emerald" | "rose" | "sky" | "violet";
  icon: ReactNode;
  bullets: string[];
  stage: ReactNode;
};

const ACCENT_STYLES: Record<VizShellProps["accent"], { badge: string; panel: string; ring: string }> = {
  amber: {
    badge: "bg-amber-400/15 text-amber-200 border-amber-300/20",
    panel: "from-amber-400/12 via-amber-300/5 to-transparent",
    ring: "ring-amber-300/15",
  },
  emerald: {
    badge: "bg-emerald-400/15 text-emerald-200 border-emerald-300/20",
    panel: "from-emerald-400/12 via-emerald-300/5 to-transparent",
    ring: "ring-emerald-300/15",
  },
  rose: {
    badge: "bg-rose-400/15 text-rose-200 border-rose-300/20",
    panel: "from-rose-400/12 via-rose-300/5 to-transparent",
    ring: "ring-rose-300/15",
  },
  sky: {
    badge: "bg-sky-400/15 text-sky-200 border-sky-300/20",
    panel: "from-sky-400/12 via-sky-300/5 to-transparent",
    ring: "ring-sky-300/15",
  },
  violet: {
    badge: "bg-violet-400/15 text-violet-200 border-violet-300/20",
    panel: "from-violet-400/12 via-violet-300/5 to-transparent",
    ring: "ring-violet-300/15",
  },
};

function VizShell({
  eyebrow,
  title,
  summary,
  accent,
  icon,
  bullets,
  stage,
}: VizShellProps) {
  const prefersReducedMotion = useReducedMotion();
  const { isMobile } = useViewportFlags();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-80px 0px" });
  const [showNotesOverride, setShowNotesOverride] = useState<boolean | null>(null);
  const showNotes = showNotesOverride ?? (prefersReducedMotion || (isInView && !isMobile));

  const visibleBullets = useMemo(
    () => (isMobile && !showNotes ? bullets.slice(0, 2) : bullets),
    [bullets, isMobile, showNotes],
  );

  const accentStyles = ACCENT_STYLES[accent];

  return (
    <motion.div
      ref={containerRef}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
      animate={isInView || prefersReducedMotion ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-white/10 bg-[#07111f] shadow-[0_24px_90px_rgba(0,0,0,0.25)] ring-1",
        accentStyles.ring,
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br", accentStyles.panel)} />
      <div className="relative grid gap-6 p-5 md:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)] md:p-7">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em]",
                accentStyles.badge,
              )}
            >
              <span className="flex h-4 w-4 items-center justify-center">{icon}</span>
              {eyebrow}
            </div>
            <span className="text-[10px] uppercase tracking-[0.24em] text-white/35">
              Scaffold placeholder
            </span>
          </div>

          <div className="space-y-3">
            <h3 className="max-w-xl text-2xl font-semibold tracking-tight text-white md:text-[2rem]">
              {title}
            </h3>
            <p className="max-w-2xl text-sm leading-7 text-slate-300 md:text-[15px]">
              {summary}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {visibleBullets.map((bullet) => (
              <span
                key={bullet}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-200"
              >
                {bullet}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowNotesOverride((value) => !(value ?? showNotes))}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-xs font-medium text-slate-100 transition hover:border-white/20 hover:bg-white/10"
            >
              {showNotes ? "Hide scaffold notes" : "Show scaffold notes"}
              <ArrowRight className={cn("h-3.5 w-3.5 transition", showNotes && "rotate-90")} />
            </button>
            <p className="text-xs text-slate-400">
              Downstream beads can replace the stage panel without changing imports.
            </p>
          </div>

          <AnimatePresence initial={false}>
            {showNotes ? (
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="overflow-hidden rounded-2xl border border-white/10 bg-black/20"
              >
                <div className="space-y-3 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">
                    Module contract
                  </p>
                  <ul className="space-y-2 text-sm leading-6 text-slate-300">
                    <li>Exports are named and stable for `next/dynamic` article imports.</li>
                    <li>Shared motion/mobile guards already exist, so richer interactivity can land in place.</li>
                    <li>Each scaffold has semantic copy instead of an empty box, avoiding dead-air in previews.</li>
                  </ul>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="relative">{stage}</div>
      </div>
    </motion.div>
  );
}

type TierAccentKey = "amber" | "sky" | "emerald" | "violet" | "rose";

type TierTriageItem = {
  id: string;
  tier: string;
  label: string;
  band: string;
  archetype: string;
  goal: string;
  deliverables: string;
  rungSummary: string;
  complications: string[];
  accent: TierAccentKey;
  icon: ReactNode;
};

type ComplexityOverlay = {
  id: string;
  label: string;
  impact: string;
  delta?: number;
  specialty?: string;
};

const TIER_TRIAGE_ITEMS: TierTriageItem[] = [
  {
    id: "tier-1",
    tier: "Tier 1",
    label: "Modest",
    band: "< $500K",
    archetype: "Young family, no business",
    goal: "Guardianship, basic will",
    deliverables: "Will, POA, healthcare directive, beneficiary audit",
    rungSummary: "Lock in guardianship, incapacity coverage, and clean beneficiary designations early.",
    complications: [
      "Minor children without named backups still create real chaos.",
      "Beneficiary forms can quietly override the simple will.",
      "No POA or healthcare directive means no one can act during incapacity.",
    ],
    accent: "amber",
    icon: <House className="h-5 w-5" aria-hidden="true" />,
  },
  {
    id: "tier-2",
    tier: "Tier 2",
    label: "Middle-Class",
    band: "$500K-$3M",
    archetype: "Home + 401k + kids",
    goal: "Probate avoidance",
    deliverables: "+ Revocable trust, TOD deed, pour-over will, 529 continuity",
    rungSummary: "This is the modal household: keep the house, retirement accounts, and kid logistics out of probate friction.",
    complications: [
      "The home title and the revocable trust often drift apart.",
      "Retirement and 529 beneficiary continuity needs explicit cleanup.",
      "Parents usually need stronger incapacity routing than they expect.",
    ],
    accent: "sky",
    icon: <Wallet className="h-5 w-5" aria-hidden="true" />,
  },
  {
    id: "tier-3",
    tier: "Tier 3",
    label: "HNW",
    band: "$3M-$15M",
    archetype: "Home + investments + business + state-tax exposure",
    goal: "State estate tax, blended family, business succession",
    deliverables: "+ QTIP/CST, ILIT, buy-sell, domicile planning",
    rungSummary: "Here the estate plan becomes a coordination system for taxes, family fairness, and ownership transitions.",
    complications: [
      "Blended families make remainder control and fairness much harder.",
      "Private-company equity needs succession and buy-sell discipline.",
      "Domicile planning starts to matter once state estate taxes appear.",
    ],
    accent: "emerald",
    icon: <BriefcaseBusiness className="h-5 w-5" aria-hidden="true" />,
  },
  {
    id: "tier-4",
    tier: "Tier 4",
    label: "UHNW",
    band: "$15M-$100M",
    archetype: "Multi-asset, multi-state",
    goal: "Federal estate tax, GST, asset protection",
    deliverables: "+ GRAT, IDGT, SLAT, dynasty trust, §6166, FLP",
    rungSummary: "Once federal transfer tax is live, the plan shifts toward structured transfers, GST discipline, and protection layers.",
    complications: [
      "Federal estate tax and GST allocation need deliberate timing.",
      "Non-citizen spouse and cross-state holdings complicate the map quickly.",
      "Liquidity planning matters if a concentrated business drives the estate.",
    ],
    accent: "violet",
    icon: <Landmark className="h-5 w-5" aria-hidden="true" />,
  },
  {
    id: "tier-5",
    tier: "Tier 5",
    label: "Industrialist",
    band: "$100M+",
    archetype: "Operating empire, multi-generation, philanthropy",
    goal: "Multi-gen transfer, governance, cross-border",
    deliverables: "+ Family office, private foundation, CLT/CRT, offshore, family constitution",
    rungSummary: "At this level the estate plan becomes family governance, philanthropic architecture, and cross-border operating control.",
    complications: [
      "Governance failure can matter more than tax math alone.",
      "Cross-border entities and philanthropy require coordinated counsel.",
      "Vulnerable heirs and dynastic control structures become central design constraints.",
    ],
    accent: "rose",
    icon: <Building2 className="h-5 w-5" aria-hidden="true" />,
  },
];

const COMPLEXITY_OVERLAYS: ComplexityOverlay[] = [
  { id: "blended-family", label: "Blended family", impact: "+1 tier", delta: 1 },
  { id: "non-citizen-spouse", label: "Non-citizen spouse", impact: "+1 tier", delta: 1 },
  { id: "private-business", label: "Private business", impact: "+1 tier", delta: 1 },
  { id: "vulnerable-heir", label: "Vulnerable heir", impact: "+1 tier", delta: 1 },
  { id: "multi-state", label: "Multi-state/country", impact: "+1 tier", delta: 1 },
  { id: "nfa-firearms", label: "NFA firearms", impact: "Specialty", specialty: "Specialty counsel" },
  { id: "self-custody-crypto", label: "Self-custody crypto", impact: "Specialty", specialty: "Specialty custody plan" },
];

const TIER_LADDER_STYLES: Record<
  TierAccentKey,
  {
    badge: string;
    activeCard: string;
    inactiveCard: string;
    iconWrap: string;
    detailPanel: string;
    detailAccent: string;
    overlayBadge: string;
  }
> = {
  amber: {
    badge: "border-amber-300/20 bg-amber-400/10 text-amber-100",
    activeCard: "border-amber-300/40 bg-amber-400/[0.12] shadow-[0_18px_44px_rgba(245,158,11,0.18)]",
    inactiveCard: "border-white/10 hover:border-amber-300/25 hover:bg-amber-400/[0.04]",
    iconWrap: "border-amber-300/20 bg-amber-400/12 text-amber-100",
    detailPanel: "border-amber-300/20 bg-amber-400/[0.08]",
    detailAccent: "text-amber-200",
    overlayBadge: "border-amber-300/20 bg-amber-400/10 text-amber-50",
  },
  sky: {
    badge: "border-sky-300/20 bg-sky-400/10 text-sky-100",
    activeCard: "border-sky-300/40 bg-sky-400/[0.12] shadow-[0_18px_44px_rgba(14,165,233,0.18)]",
    inactiveCard: "border-white/10 hover:border-sky-300/25 hover:bg-sky-400/[0.04]",
    iconWrap: "border-sky-300/20 bg-sky-400/12 text-sky-100",
    detailPanel: "border-sky-300/20 bg-sky-400/[0.08]",
    detailAccent: "text-sky-200",
    overlayBadge: "border-sky-300/20 bg-sky-400/10 text-sky-50",
  },
  emerald: {
    badge: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
    activeCard: "border-emerald-300/40 bg-emerald-400/[0.12] shadow-[0_18px_44px_rgba(16,185,129,0.18)]",
    inactiveCard: "border-white/10 hover:border-emerald-300/25 hover:bg-emerald-400/[0.04]",
    iconWrap: "border-emerald-300/20 bg-emerald-400/12 text-emerald-100",
    detailPanel: "border-emerald-300/20 bg-emerald-400/[0.08]",
    detailAccent: "text-emerald-200",
    overlayBadge: "border-emerald-300/20 bg-emerald-400/10 text-emerald-50",
  },
  violet: {
    badge: "border-violet-300/20 bg-violet-400/10 text-violet-100",
    activeCard: "border-violet-300/40 bg-violet-400/[0.12] shadow-[0_18px_44px_rgba(139,92,246,0.2)]",
    inactiveCard: "border-white/10 hover:border-violet-300/25 hover:bg-violet-400/[0.04]",
    iconWrap: "border-violet-300/20 bg-violet-400/12 text-violet-100",
    detailPanel: "border-violet-300/20 bg-violet-400/[0.08]",
    detailAccent: "text-violet-200",
    overlayBadge: "border-violet-300/20 bg-violet-400/10 text-violet-50",
  },
  rose: {
    badge: "border-rose-300/20 bg-rose-400/10 text-rose-100",
    activeCard: "border-rose-300/40 bg-rose-400/[0.12] shadow-[0_18px_44px_rgba(244,63,94,0.18)]",
    inactiveCard: "border-white/10 hover:border-rose-300/25 hover:bg-rose-400/[0.04]",
    iconWrap: "border-rose-300/20 bg-rose-400/12 text-rose-100",
    detailPanel: "border-rose-300/20 bg-rose-400/[0.08]",
    detailAccent: "text-rose-200",
    overlayBadge: "border-rose-300/20 bg-rose-400/10 text-rose-50",
  },
};

export function TierTriageViz() {
  const prefersReducedMotion = useReducedMotion();
  const [selectedIndex, setSelectedIndex] = useState(1);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(1);
  const [enabledOverlays, setEnabledOverlays] = useState<string[]>([]);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectedTier = TIER_TRIAGE_ITEMS[selectedIndex];
  const expandedTier = expandedIndex === null ? null : TIER_TRIAGE_ITEMS[expandedIndex];
  const selectedStyles = TIER_LADDER_STYLES[selectedTier.accent];
  const expandedStyles = expandedTier ? TIER_LADDER_STYLES[expandedTier.accent] : selectedStyles;
  const transition = prefersReducedMotion ? { duration: 0 } : { duration: 0.24, ease: "easeOut" as const };

  const activeOverlayEntries = COMPLEXITY_OVERLAYS.filter((overlay) => enabledOverlays.includes(overlay.id));
  const bumpCount = activeOverlayEntries.reduce((sum, overlay) => sum + (overlay.delta ?? 0), 0);
  const specialtyFlags = activeOverlayEntries.filter((overlay) => overlay.specialty);
  const suggestedIndex = Math.min(TIER_TRIAGE_ITEMS.length - 1, selectedIndex + bumpCount);
  const suggestedTier = TIER_TRIAGE_ITEMS[suggestedIndex];
  const suggestedStyles = TIER_LADDER_STYLES[suggestedTier.accent];
  const detailPanelId = "tier-triage-detail-panel";

  const moveSelection = (nextIndex: number) => {
    setSelectedIndex(nextIndex);
    if (expandedIndex !== null) {
      setExpandedIndex(nextIndex);
    }
    buttonRefs.current[nextIndex]?.focus();
  };

  const toggleExpanded = (index: number) => {
    setSelectedIndex(index);
    setExpandedIndex((current) => (current === index ? null : index));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      moveSelection((index + 1) % TIER_TRIAGE_ITEMS.length);
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      moveSelection((index - 1 + TIER_TRIAGE_ITEMS.length) % TIER_TRIAGE_ITEMS.length);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      moveSelection(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      moveSelection(TIER_TRIAGE_ITEMS.length - 1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleExpanded(index);
    }
  };

  const toggleOverlay = (overlayId: string) => {
    setEnabledOverlays((current) =>
      current.includes(overlayId)
        ? current.filter((value) => value !== overlayId)
        : [...current, overlayId],
    );
  };

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#07111f] shadow-[0_24px_90px_rgba(0,0,0,0.25)] ring-1 ring-sky-300/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.12),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(244,63,94,0.08),transparent_38%)]" />
      <div className="relative space-y-6 p-5 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-100">
              <Layers3 className="h-3.5 w-3.5" />
              Tier Triage
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold tracking-tight text-white md:text-[2rem]">
                Five wealth tiers, with complexity layered on top
              </h3>
              <p className="max-w-3xl text-sm leading-7 text-slate-300 md:text-[15px]">
                Start with rough net worth, then adjust upward when family structure, businesses,
                cross-border facts, or specialty assets make the plan behave like a richer tier.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/45">
              Default focus
            </p>
            <p className="mt-1 text-sm text-white">
              <span className="font-semibold">{TIER_TRIAGE_ITEMS[1].tier}</span> ·{" "}
              {TIER_TRIAGE_ITEMS[1].label}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              The modal reader: home, retirement accounts, kids, and probate avoidance.
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute left-[10%] right-[10%] top-8 hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent md:block" />
          <div role="list" aria-label="Wealth tier triage ladder" className="grid gap-3 md:grid-cols-5">
            {TIER_TRIAGE_ITEMS.map((tier, index) => {
              const isSelected = index === selectedIndex;
              const isExpanded = index === expandedIndex;
              const styles = TIER_LADDER_STYLES[tier.accent];

              return (
                <button
                  key={tier.id}
                  ref={(node) => {
                    buttonRefs.current[index] = node;
                  }}
                  type="button"
                  tabIndex={isSelected ? 0 : -1}
                  aria-pressed={isSelected}
                  aria-expanded={isExpanded}
                  aria-controls={detailPanelId}
                  onClick={() => toggleExpanded(index)}
                  onFocus={() => setSelectedIndex(index)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  className={cn(
                    "group relative rounded-[24px] border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07111f]",
                    isSelected ? styles.activeCard : styles.inactiveCard,
                  )}
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-semibold", styles.badge)}>
                      {tier.tier}
                    </span>
                    <span className={cn("flex h-10 w-10 items-center justify-center rounded-2xl border", styles.iconWrap)}>
                      {tier.icon}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-white">
                      {tier.label}
                    </p>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                      {tier.band}
                    </p>
                    <p className="text-sm leading-6 text-slate-200">{tier.archetype}</p>
                    <p className="text-sm leading-6 text-slate-400">{tier.goal}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                    <span>{isExpanded ? "Tap again to collapse" : "Enter to expand"}</span>
                    <ArrowRight className={cn("h-3.5 w-3.5 transition", isExpanded && "rotate-90")} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence initial={false} mode="wait">
          {expandedTier ? (
            <motion.div
              key={expandedTier.id}
              id={detailPanelId}
              role="region"
              aria-label={`${expandedTier.tier} detail panel`}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
              transition={transition}
              className={cn("rounded-[26px] border p-5 md:p-6", expandedStyles.detailPanel)}
            >
              <div className="grid gap-5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={cn("rounded-full border px-3 py-1 text-[11px] font-semibold", expandedStyles.badge)}>
                      {expandedTier.tier} · {expandedTier.label}
                    </span>
                    <span className="text-sm text-slate-300">{expandedTier.band}</span>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xl font-semibold text-white">{expandedTier.archetype}</p>
                    <p className="text-sm leading-7 text-slate-200">{expandedTier.rungSummary}</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className={cn("text-[11px] font-semibold uppercase tracking-[0.25em]", expandedStyles.detailAccent)}>
                        Primary goals
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-200">{expandedTier.goal}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className={cn("text-[11px] font-semibold uppercase tracking-[0.25em]", expandedStyles.detailAccent)}>
                        Core deliverables
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-200">{expandedTier.deliverables}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className={cn("text-[11px] font-semibold uppercase tracking-[0.25em]", expandedStyles.detailAccent)}>
                    Typical complications
                  </p>
                  <ul className="mt-3 space-y-3">
                    {expandedTier.complications.map((complication) => (
                      <li key={complication} className="flex gap-3">
                        <CheckCircle2 className={cn("mt-0.5 h-4 w-4 shrink-0", expandedStyles.detailAccent)} />
                        <span className="text-sm leading-6 text-slate-200">{complication}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">
                Complexity overlay
              </p>
              <p className="max-w-3xl text-sm leading-6 text-slate-300">
                Some households behave like a richer tier than their raw net worth suggests. Toggle the facts below to
                see what bumps the planning posture upward.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className={cn("rounded-full border px-3 py-1 font-medium", selectedStyles.overlayBadge)}>
                Base: {selectedTier.tier}
              </span>
              <ArrowRight className="h-4 w-4 text-slate-500" />
              <span className={cn("rounded-full border px-3 py-1 font-medium", suggestedStyles.overlayBadge)}>
                Overlay result: {suggestedTier.tier}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {COMPLEXITY_OVERLAYS.map((overlay) => {
              const active = enabledOverlays.includes(overlay.id);
              return (
                <button
                  key={overlay.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleOverlay(overlay.id)}
                  className={cn(
                    "rounded-full border px-3 py-2 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07111f]",
                    active
                      ? "border-white/20 bg-white/12 text-white"
                      : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]",
                  )}
                >
                  {overlay.label} · {overlay.impact}
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm leading-6 text-slate-200">
                {bumpCount > 0 ? (
                  <>
                    With {bumpCount} step{bumpCount === 1 ? "" : "s"} of added complexity, this{" "}
                    <span className="font-semibold text-white">{selectedTier.tier}</span> household starts behaving more
                    like <span className="font-semibold text-white">{suggestedTier.tier}</span>.
                  </>
                ) : (
                  <>
                    No tier-bump toggles are active, so this household stays in{" "}
                    <span className="font-semibold text-white">{selectedTier.tier}</span>.
                  </>
                )}
              </p>
              {specialtyFlags.length > 0 ? (
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Specialty routing still matters for {specialtyFlags.map((item) => item.label).join(" and ")}.
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              {specialtyFlags.map((item) => (
                <span
                  key={item.id}
                  className="rounded-full border border-rose-300/20 bg-rose-400/10 px-3 py-1 text-xs font-medium text-rose-50"
                >
                  {item.label} → {item.specialty}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AxiomCoherenceViz() {
  const prefersReducedMotion = useReducedMotion();
  const transition = prefersReducedMotion ? { duration: 0 } : { duration: 0.28, ease: "easeOut" as const };
  const [mode, setMode] = useState<"coherent" | "incoherent">("coherent");
  const [selectedSpokeId, setSelectedSpokeId] = useState("primary-residence");

  type CoherenceSpoke = {
    id: string;
    label: string;
    shortLabel: string;
    control: string;
    x: number;
    y: number;
    accent: TierAccentKey;
    icon: ReactNode;
    coherentNarrative: string;
    incoherentNarrative: string;
    subagent: string;
    mismatch?: {
      title: string;
      axiom: string;
      impact: string;
    };
  };

  const spokes: CoherenceSpoke[] = [
    {
      id: "primary-residence",
      label: "Primary residence",
      shortLabel: "House",
      control: "Titling / deed / trust ownership",
      x: 50,
      y: 15,
      accent: "amber",
      icon: <House className="h-4 w-4" aria-hidden="true" />,
      coherentNarrative: "The house deed, the trust-funding plan, and the dispositive documents all point to the same survivor and the same backup path.",
      incoherentNarrative: "The house is jointly titled with an ex-sibling, so survivorship overrides the will and the wrong person takes the property automatically.",
      subagent: "funding-checklist-generator",
      mismatch: {
        title: "Joint tenancy with an ex-sibling",
        axiom: "Axiom 7",
        impact: "Titling overrides the will at death.",
      },
    },
    {
      id: "employer-retirement",
      label: "401(k) / employer retirement",
      shortLabel: "401(k)",
      control: "Beneficiary form",
      x: 75,
      y: 25,
      accent: "rose",
      icon: <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />,
      coherentNarrative: "The employer plan’s beneficiary form matches the rest of the plan, so the administrator and the will tell the same story.",
      incoherentNarrative: "The 401(k) still names an ex-spouse, so the plan administrator pays the wrong person before the will ever enters the conversation.",
      subagent: "beneficiary-audit",
      mismatch: {
        title: "Ex-spouse still on the plan",
        axiom: "Axiom 3",
        impact: "Beneficiary designations override wills and trusts.",
      },
    },
    {
      id: "iras",
      label: "IRAs",
      shortLabel: "IRAs",
      control: "Beneficiary form",
      x: 82,
      y: 50,
      accent: "emerald",
      icon: <Landmark className="h-4 w-4" aria-hidden="true" />,
      coherentNarrative: "Each IRA uses the intended primary and contingent beneficiaries, so the retirement stack stays aligned.",
      incoherentNarrative: "These IRAs stay coherent even in the broken preset, which makes the mismatched accounts easier to isolate and fix.",
      subagent: "beneficiary-audit",
    },
    {
      id: "life-insurance",
      label: "Life insurance",
      shortLabel: "Insurance",
      control: "Beneficiary form",
      x: 75,
      y: 75,
      accent: "sky",
      icon: <ShieldCheck className="h-4 w-4" aria-hidden="true" />,
      coherentNarrative: "Policy owner, beneficiary, and contingent beneficiary all line up with the intended household outcome.",
      incoherentNarrative: "This spoke remains coherent in the broken preset, illustrating that one good policy cannot rescue a contradictory overall plan.",
      subagent: "beneficiary-audit",
    },
    {
      id: "taxable-brokerage",
      label: "Taxable brokerage",
      shortLabel: "Brokerage",
      control: "Titling / TOD / trust",
      x: 50,
      y: 85,
      accent: "violet",
      icon: <Wallet className="h-4 w-4" aria-hidden="true" />,
      coherentNarrative: "The brokerage is titled the way the rest of the plan expects, so transfer mechanics and tax assumptions stay consistent.",
      incoherentNarrative: "The brokerage remains coherent here, which is the point: not every spoke breaks, but the broken ones can still wreck the whole story.",
      subagent: "beneficiary-audit",
    },
    {
      id: "financial-poas",
      label: "Financial POAs",
      shortLabel: "Financial POA",
      control: "Durable financial POA",
      x: 25,
      y: 75,
      accent: "emerald",
      icon: <FileCheck className="h-4 w-4" aria-hidden="true" />,
      coherentNarrative: "The financial POA names the same decision-makers the rest of the incapacity package expects, with backups in the right order.",
      incoherentNarrative: "The durable POA still works in the broken preset, which is why incoherence is dangerous: some documents look fine while others quietly override them.",
      subagent: "anti-pattern-scanner",
    },
    {
      id: "healthcare-poas",
      label: "Healthcare POAs + living will + HIPAA",
      shortLabel: "Healthcare",
      control: "Healthcare proxy / living will / HIPAA",
      x: 18,
      y: 50,
      accent: "sky",
      icon: <HeartPulse className="h-4 w-4" aria-hidden="true" />,
      coherentNarrative: "Healthcare authority, living-will instructions, and HIPAA permissions all route to the same people and the same backups.",
      incoherentNarrative: "This healthcare spoke is still aligned, highlighting that a coherent incapacity package can coexist with a broken asset-transfer plan unless someone checks all of it together.",
      subagent: "anti-pattern-scanner",
    },
    {
      id: "digital-inventory",
      label: "Digital inventory",
      shortLabel: "Digital",
      control: "Letter of instruction + digital-inventory.md",
      x: 25,
      y: 25,
      accent: "rose",
      icon: <Sparkles className="h-4 w-4" aria-hidden="true" />,
      coherentNarrative: "The digital inventory points executors to email, password-manager, and crypto recovery locations without exposing any secret directly.",
      incoherentNarrative: "The crypto wallet has no seed-phrase pointer in the digital inventory, so the asset may be practically unrecoverable even if everyone agrees who should inherit it.",
      subagent: "anti-pattern-scanner",
      mismatch: {
        title: "No seed-location pointer",
        axiom: "Axiom 0 adjacent",
        impact: "Unrecoverable digital assets do not care what the will intended.",
      },
    },
  ];

  const selectedSpoke = spokes.find((spoke) => spoke.id === selectedSpokeId) ?? spokes[0];
  const selectedStyles = TIER_LADDER_STYLES[selectedSpoke.accent];
  const isIncoherent = mode === "incoherent";

  const setModeAndSelection = (nextMode: "coherent" | "incoherent") => {
    setMode(nextMode);

    if (
      nextMode === "incoherent" &&
      !spokes.find((spoke) => spoke.id === selectedSpokeId)?.mismatch
    ) {
      setSelectedSpokeId("employer-retirement");
    }
  };

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#07111f] shadow-[0_24px_90px_rgba(0,0,0,0.25)] ring-1 ring-emerald-300/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(244,63,94,0.08),transparent_38%)]" />
      <div className="relative space-y-6 p-5 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-100">
              <ShieldCheck className="h-3.5 w-3.5" />
              Axiom Coherence
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold tracking-tight text-white md:text-[2rem]">
                One story across every document, or a plan that quietly breaks
              </h3>
              <p className="max-w-3xl text-sm leading-7 text-slate-300 md:text-[15px]">
                Toggle between a coherent plan and an incoherent one. The legal
                documents do not fail because a sentence was ugly. They fail because
                the controlling instruments point in different directions.
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/25 p-1">
            {(["coherent", "incoherent"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={mode === value}
                onClick={() => setModeAndSelection(value)}
                className={cn(
                  "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
                  mode === value
                    ? value === "coherent"
                      ? "bg-emerald-400/20 text-emerald-50"
                      : "bg-rose-400/20 text-rose-50"
                    : "text-slate-400 hover:text-slate-200",
                )}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="rounded-[26px] border border-white/10 bg-black/20 p-4 md:p-5">
            <div className="relative mx-auto aspect-square w-full max-w-[32rem]">
              <svg
                viewBox="0 0 100 100"
                className="absolute inset-0 h-full w-full"
                aria-hidden="true"
              >
                {spokes.map((spoke) => {
                  const mismatched = isIncoherent && Boolean(spoke.mismatch);
                  return (
                    <motion.g key={spoke.id}>
                      <motion.line
                        x1="50"
                        y1="50"
                        x2={spoke.x}
                        y2={spoke.y}
                        stroke={mismatched ? "rgba(251, 113, 133, 0.9)" : "rgba(52, 211, 153, 0.55)"}
                        strokeWidth={mismatched ? 1.6 : 1.25}
                        strokeLinecap="round"
                        animate={{
                          strokeOpacity: mismatched ? 1 : 0.7,
                          strokeWidth: mismatched ? 1.9 : 1.25,
                        }}
                        transition={transition}
                      />
                      <motion.circle
                        cx={spoke.x}
                        cy={spoke.y}
                        r={mismatched ? 2.5 : 2}
                        fill={mismatched ? "rgba(251, 113, 133, 0.95)" : "rgba(52, 211, 153, 0.9)"}
                        animate={{ r: mismatched ? 2.6 : 2 }}
                        transition={transition}
                      />
                    </motion.g>
                  );
                })}
              </svg>

              <div className="absolute left-1/2 top-1/2 z-10 w-36 -translate-x-1/2 -translate-y-1/2 rounded-[24px] border border-white/12 bg-[#081525] px-4 py-5 text-center shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white">
                  <Users className="h-5 w-5" />
                </div>
                <p className="mt-3 text-lg font-semibold text-white">You</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Your domicile, your intended recipients, your plan story.
                </p>
              </div>

              {spokes.map((spoke) => {
                const mismatched = isIncoherent && Boolean(spoke.mismatch);
                const selected = selectedSpoke.id === spoke.id;
                const styles = TIER_LADDER_STYLES[mismatched ? "rose" : spoke.accent];

                return (
                  <button
                    key={spoke.id}
                    type="button"
                    onClick={() => setSelectedSpokeId(spoke.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedSpokeId(spoke.id);
                      }
                    }}
                    style={{ left: `${spoke.x}%`, top: `${spoke.y}%` }}
                    className={cn(
                      "absolute z-20 w-28 -translate-x-1/2 -translate-y-1/2 rounded-[20px] border p-3 text-left shadow-[0_14px_32px_rgba(0,0,0,0.18)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07111f] sm:w-32 md:w-36",
                      selected
                        ? styles.activeCard
                        : mismatched
                          ? "border-rose-300/30 bg-rose-400/[0.08] hover:border-rose-300/45"
                          : "border-white/10 bg-[#081525] hover:border-white/20 hover:bg-white/[0.04]",
                    )}
                  >
                    {mismatched ? (
                      <motion.div
                        className="absolute inset-0 -z-10 rounded-[20px] bg-rose-500/18 blur-xl"
                        animate={{ opacity: selected ? 1 : 0.75 }}
                        transition={transition}
                      />
                    ) : null}
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className={cn("flex h-8 w-8 items-center justify-center rounded-2xl border", styles.iconWrap)}>
                        {spoke.icon}
                      </span>
                      <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]", styles.badge)}>
                        {mismatched ? "Break" : "Aligned"}
                      </span>
                    </div>
                    <p className="text-sm font-semibold leading-5 text-white">{spoke.shortLabel}</p>
                    <p className="mt-1 text-[11px] leading-4 text-slate-400">{spoke.control}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[26px] border border-white/10 bg-black/20 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">
              Preset state
            </p>
            <p className="mt-2 text-xl font-semibold text-white">
              {mode === "coherent" ? "Coherent" : "Incoherent"}
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              {mode === "coherent"
                ? "Every controlling document points to the same people, in the same shares, under the same contingencies."
                : "Three spokes now break the story: beneficiary override, titling override, and digital unrecoverability."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {spokes
                .filter((spoke) => !isIncoherent || spoke.mismatch)
                .slice(0, isIncoherent ? 8 : 4)
                .map((spoke) => {
                  const mismatched = isIncoherent && Boolean(spoke.mismatch);
                  const styles = TIER_LADDER_STYLES[mismatched ? "rose" : spoke.accent];
                  return (
                    <span
                      key={spoke.id}
                      className={cn("rounded-full border px-3 py-1 text-xs font-medium", styles.overlayBadge)}
                    >
                      {mismatched ? `${spoke.shortLabel} mismatch` : `${spoke.shortLabel} aligned`}
                    </span>
                  );
                })}
            </div>
          </div>
        </div>

        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={`${mode}-${selectedSpoke.id}`}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
            transition={transition}
            className={cn("rounded-[26px] border p-5 md:p-6", selectedStyles.detailPanel)}
          >
            <div className="grid gap-5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={cn("rounded-full border px-3 py-1 text-[11px] font-semibold", selectedStyles.badge)}>
                    {selectedSpoke.label}
                  </span>
                  <span className="text-sm text-slate-300">{selectedSpoke.control}</span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className={cn("text-[11px] font-semibold uppercase tracking-[0.25em]", selectedStyles.detailAccent)}>
                    What this spoke is showing
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-100">
                    {isIncoherent
                      ? selectedSpoke.incoherentNarrative
                      : selectedSpoke.coherentNarrative}
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className={cn("text-[11px] font-semibold uppercase tracking-[0.25em]", selectedStyles.detailAccent)}>
                      Catching subagent
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-200">
                      <span className="font-mono text-cyan-200">{selectedSpoke.subagent}</span>
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className={cn("text-[11px] font-semibold uppercase tracking-[0.25em]", selectedStyles.detailAccent)}>
                      Controlling document
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-200">{selectedSpoke.control}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className={cn("text-[11px] font-semibold uppercase tracking-[0.25em]", selectedStyles.detailAccent)}>
                  Failure mode
                </p>
                {isIncoherent && selectedSpoke.mismatch ? (
                  <div className="mt-3 space-y-3">
                    <div className="rounded-2xl border border-rose-300/15 bg-rose-400/[0.08] p-3">
                      <p className="text-sm font-semibold text-rose-50">{selectedSpoke.mismatch.title}</p>
                      <p className="mt-1 text-sm leading-6 text-rose-100/85">{selectedSpoke.mismatch.impact}</p>
                    </div>
                    <p className="text-sm leading-6 text-slate-200">
                      <span className="font-semibold text-white">{selectedSpoke.mismatch.axiom}</span> is the reason this breaks: the legally controlling instrument beats the story the will was trying to tell.
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 rounded-2xl border border-emerald-300/15 bg-emerald-400/[0.08] p-3">
                    <p className="text-sm font-semibold text-emerald-50">No mismatch in this preset</p>
                    <p className="mt-1 text-sm leading-6 text-slate-200">
                      This spoke remains aligned, which is exactly why plan failure is hard to spot casually. One or two silent overrides are enough.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

export function IntakePhasesViz() {
  const prefersReducedMotion = useReducedMotion();
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [drilledIndex, setDrilledIndex] = useState(0);
  const [scrollActiveIndex, setScrollActiveIndex] = useState<number | null>(null);
  const [scrollSyncReady, setScrollSyncReady] = useState(false);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  type IntakePhaseItem = {
    id: string;
    number: number;
    name: string;
    minutes: "5 min" | "10 min" | "15 min";
    question: string;
    artifact: string;
    branch: string;
    icon: ReactNode;
    accent: TierAccentKey;
  };

  const intakePhases: IntakePhaseItem[] = [
    {
      id: "orientation",
      number: 1,
      name: "Orientation",
      minutes: "5 min",
      question: "Why are you doing this now, and what triggered it?",
      artifact: "Orientation notes + disclaimer acknowledgment in intake-record.md",
      branch: "If prior documents exist, route into existing-plan-audit; if timing is acute, escalate to urgent-bedside-signing.",
      icon: <Compass className="h-4.5 w-4.5" aria-hidden="true" />,
      accent: "sky",
    },
    {
      id: "people",
      number: 2,
      name: "People",
      minutes: "10 min",
      question: "Who are all the people the plan has to protect, exclude, or coordinate around?",
      artifact: "People map appended to intake-record.md",
      branch: "If minors, addiction, disability, estrangement, or non-citizen family facts appear, raise complexity overlays early.",
      icon: <Users className="h-4.5 w-4.5" aria-hidden="true" />,
      accent: "amber",
    },
    {
      id: "assets-liabilities",
      number: 3,
      name: "Assets & Liabilities",
      minutes: "15 min",
      question: "What do you own, what do you owe, and how is every meaningful asset titled?",
      artifact: "Asset Inventory with titling notes, plus red-flag-triage.md if a critical mismatch appears",
      branch: "If business interests, concentrated equity, crypto, or out-of-state real estate appear, bump later routing and specialty checks.",
      icon: <Wallet className="h-4.5 w-4.5" aria-hidden="true" />,
      accent: "emerald",
    },
    {
      id: "beneficiary-audit",
      number: 4,
      name: "Beneficiary Audit",
      minutes: "10 min",
      question: "What do the beneficiary forms, deeds, and contracts actually say right now?",
      artifact: "beneficiary-form-audit.md, or a document-acquisition plan if the forms are missing",
      branch: "If any account owner cannot produce the actual form, stop designing and queue document acquisition first.",
      icon: <FileCheck className="h-4.5 w-4.5" aria-hidden="true" />,
      accent: "violet",
    },
    {
      id: "family-dynamics",
      number: 5,
      name: "Family Dynamics",
      minutes: "10 min",
      question: "Where will the human conflict, contest risk, or vulnerability come from if nothing is clarified now?",
      artifact: "red-flag-triage.md plus Letter of Wishes / Litigation Risk memo notes in the user’s own words",
      branch: "If blended family, vulnerable heir, government-benefit exposure, or likely contest risk appears, load those overlays immediately.",
      icon: <GitBranch className="h-4.5 w-4.5" aria-hidden="true" />,
      accent: "rose",
    },
    {
      id: "goals-values",
      number: 6,
      name: "Goals & Values",
      minutes: "15 min",
      question: "What outcome would feel fair to you, even if the documents never used that exact wording?",
      artifact: "Goals statement + Decision Ledger explaining why the plan choices were made",
      branch: "If lumpy assets, charitable intent, behavior incentives, or fairness-not-equality themes appear, flag design-phase branch points.",
      icon: <Target className="h-4.5 w-4.5" aria-hidden="true" />,
      accent: "amber",
    },
    {
      id: "incapacity",
      number: 7,
      name: "Incapacity",
      minutes: "10 min",
      question: "Who decides when you cannot, and what instructions should bind them?",
      artifact: "Incapacity package design + POA agent instructions",
      branch: "If dementia fears, Ulysses-clause requests, or medical-agent disagreement appear, flag for state-specific attorney review.",
      icon: <HeartPulse className="h-4.5 w-4.5" aria-hidden="true" />,
      accent: "sky",
    },
    {
      id: "jurisdiction",
      number: 8,
      name: "Jurisdiction",
      minutes: "5 min",
      question: "Which state or country actually governs this plan, these assets, and these execution formalities?",
      artifact: "Domicile Audit with ancillary-probate and situs notes",
      branch: "If multiple states, recent moves, or foreign assets show up, trigger cross-state domicile and local-formality checks.",
      icon: <MapPinned className="h-4.5 w-4.5" aria-hidden="true" />,
      accent: "emerald",
    },
    {
      id: "wealth-tier-routing",
      number: 9,
      name: "Wealth-Tier Routing",
      minutes: "5 min",
      question: "Given the net worth and complexity overlays, what tier of planning does this household really need?",
      artifact: "Tier-routing note feeding the Plan Report, Tax Exposure Analysis, and attorney handoff queue",
      branch: "If the overlay stack bumps the client into a higher tier, upgrade the toolset before design starts.",
      icon: <Waypoints className="h-4.5 w-4.5" aria-hidden="true" />,
      accent: "violet",
    },
  ];

  const activeIndex = scrollActiveIndex ?? focusedIndex;
  const activePhase = intakePhases[activeIndex];
  const drilledPhase = intakePhases[drilledIndex];
  const activeStyles = TIER_LADDER_STYLES[activePhase.accent];
  const drilledStyles = TIER_LADDER_STYLES[drilledPhase.accent];
  const transition = prefersReducedMotion ? { duration: 0 } : { duration: 0.24, ease: "easeOut" as const };

  useEffect(() => {
    if (typeof document === "undefined" || typeof IntersectionObserver === "undefined") {
      return;
    }

    const phaseRatios = new Map<number, number>();
    let observer: IntersectionObserver | null = null;
    let mutationObserver: MutationObserver | null = null;

    const updateFromRatios = () => {
      if (phaseRatios.size === 0) {
        setScrollActiveIndex(null);
        return;
      }

      const [bestPhase] = [...phaseRatios.entries()].sort(
        (a, b) => b[1] - a[1] || b[0] - a[0],
      )[0];

      setScrollActiveIndex(bestPhase - 1);
    };

    const attachMarkers = () => {
      const markers = [...document.querySelectorAll<HTMLElement>("[data-intake-phase]")].filter(
        (node) => Number.isFinite(Number(node.dataset.intakePhase)),
      );

      if (markers.length === 0) {
        return false;
      }

      observer?.disconnect();
      phaseRatios.clear();

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const phaseNumber = Number(
              (entry.target as HTMLElement).dataset.intakePhase,
            );
            if (!Number.isFinite(phaseNumber)) return;

            if (entry.isIntersecting) {
              phaseRatios.set(phaseNumber, entry.intersectionRatio || 0.01);
            } else {
              phaseRatios.delete(phaseNumber);
            }
          });

          updateFromRatios();
        },
        {
          rootMargin: "-34% 0px -44% 0px",
          threshold: [0, 0.2, 0.35, 0.55, 0.8],
        },
      );

      markers.forEach((marker) => observer?.observe(marker));
      setScrollSyncReady(true);
      return true;
    };

    if (!attachMarkers() && document.body) {
      mutationObserver = new MutationObserver(() => {
        if (attachMarkers()) {
          mutationObserver?.disconnect();
          mutationObserver = null;
        }
      });

      mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      observer?.disconnect();
      mutationObserver?.disconnect();
    };
  }, []);

  const moveFocus = (nextIndex: number) => {
    setFocusedIndex(nextIndex);
    buttonRefs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      moveFocus((index + 1) % intakePhases.length);
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      moveFocus((index - 1 + intakePhases.length) % intakePhases.length);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      moveFocus(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      moveFocus(intakePhases.length - 1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setDrilledIndex(index);
      setFocusedIndex(index);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#07111f] shadow-[0_24px_90px_rgba(0,0,0,0.25)] ring-1 ring-sky-300/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_38%)]" />
      <div className="relative space-y-6 p-5 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-100">
              <Waypoints className="h-3.5 w-3.5" />
              Intake Phases
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold tracking-tight text-white md:text-[2rem]">
                The nine-phase intake flow, synced to the Maya walkthrough
              </h3>
              <p className="max-w-3xl text-sm leading-7 text-slate-300 md:text-[15px]">
                The skill does not jump straight to drafting. It moves through nine
                phases in order, writing artifacts as facts harden and only escalating
                tier or specialty logic when the earlier evidence actually supports it.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/45">
              Narrative sync
            </p>
            <p className="mt-1 text-sm text-white">
              {scrollSyncReady && scrollActiveIndex !== null
                ? `Following Phase ${activePhase.number}`
                : "Fallback to manual drill mode"}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-400" role="status" aria-live="polite">
              {scrollSyncReady
                ? "As you scroll the Maya narrative, the active node highlights automatically."
                : "If no phase markers are visible, the highlighted node follows your keyboard or click selection."}
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute left-12 right-12 top-[2.15rem] hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent lg:block" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-9">
            {intakePhases.map((phase, index) => {
              const isFocused = index === focusedIndex;
              const isActive = index === activeIndex;
              const isDrilled = index === drilledIndex;
              const styles = TIER_LADDER_STYLES[phase.accent];

              return (
                <button
                  key={phase.id}
                  ref={(node) => {
                    buttonRefs.current[index] = node;
                  }}
                  type="button"
                  tabIndex={isFocused ? 0 : -1}
                  aria-pressed={isDrilled}
                  aria-current={isActive ? "step" : undefined}
                  onClick={() => {
                    setFocusedIndex(index);
                    setDrilledIndex(index);
                  }}
                  onFocus={() => setFocusedIndex(index)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  className={cn(
                    "relative rounded-[22px] border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07111f]",
                    isActive
                      ? styles.activeCard
                      : isDrilled
                        ? "border-white/20 bg-white/[0.08]"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]",
                  )}
                >
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-semibold", styles.badge)}>
                      {phase.number}
                    </span>
                    <span className={cn("flex h-9 w-9 items-center justify-center rounded-2xl border", styles.iconWrap)}>
                      {phase.icon}
                    </span>
                  </div>
                  <p className="text-sm font-semibold leading-5 text-white">{phase.name}</p>
                  <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                    {phase.minutes}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {isActive ? (
                      <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                        In view
                      </span>
                    ) : null}
                    {isDrilled ? (
                      <span className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                        Drill open
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={drilledPhase.id}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
            transition={transition}
            className={cn("rounded-[26px] border p-5 md:p-6", drilledStyles.detailPanel)}
          >
            <div className="grid gap-5 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={cn("rounded-full border px-3 py-1 text-[11px] font-semibold", drilledStyles.badge)}>
                    Phase {drilledPhase.number}
                  </span>
                  <span className="text-sm text-slate-300">{drilledPhase.name}</span>
                  <span className="text-sm text-slate-500">·</span>
                  <span className="text-sm text-slate-300">{drilledPhase.minutes}</span>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className={cn("text-[11px] font-semibold uppercase tracking-[0.25em]", drilledStyles.detailAccent)}>
                    Opening question
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-100">{drilledPhase.question}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className={cn("text-[11px] font-semibold uppercase tracking-[0.25em]", drilledStyles.detailAccent)}>
                      Typical artifact
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-200">{drilledPhase.artifact}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className={cn("text-[11px] font-semibold uppercase tracking-[0.25em]", drilledStyles.detailAccent)}>
                      Branch point
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-200">{drilledPhase.branch}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className={cn("text-[11px] font-semibold uppercase tracking-[0.25em]", activeStyles.detailAccent)}>
                  What the scroll-linked highlighter is seeing
                </p>
                <div className="mt-3 space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Narrative phase</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      Phase {activePhase.number} · {activePhase.name}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      {scrollActiveIndex !== null
                        ? "This node is following the currently visible Maya marker in the article body."
                        : "No intake-phase markers are currently visible, so the highlight falls back to your local selection."}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Drill panel</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      Phase {drilledPhase.number} · {drilledPhase.name}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      Click or keyboard into any node to inspect its opening question, artifact, and branch logic without losing the scroll sync.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

export function DeliverablesTreeViz() {
  return (
    <VizShell
      eyebrow="Deliverables Tree"
      title="A placeholder tree for the 45-document output surface"
      summary="The final version can expand into folders and leaves, but the article can already import a stable component that hints at the deliverable breadth without runtime errors."
      accent="violet"
      icon={<FolderTree className="h-3.5 w-3.5" />}
      bullets={["Intake files", "Analyses", "Draft docs", "Execution checklist", "Attorney packet"]}
      stage={
        <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
          <div className="space-y-3">
            {[
              ["intake/", "household facts, assets, titling, beneficiary snapshots"],
              ["analyses/", "tax exposure, risk notes, state-law verification checklist"],
              ["deliverables/", "will, trust, incapacity packet, letters of instruction"],
              ["handoff/", "attorney summary memo and open-questions list"],
            ].map(([folder, detail]) => (
              <div key={folder} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-center gap-2 text-white">
                  <FolderTree className="h-4 w-4 text-violet-200" />
                  <span className="font-medium">{folder}</span>
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-400">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}

export function AntiPatternCardsViz() {
  return (
    <VizShell
      eyebrow="Anti-Patterns"
      title="A card grid slot for the mistakes the skill is designed to catch"
      summary="This scaffold gives the article a working placeholder for the future flip-card grid that will call out failure modes like stale beneficiaries, broken titling, and unsigned incapacity documents."
      accent="rose"
      icon={<AlertTriangle className="h-3.5 w-3.5" />}
      bullets={["Stale beneficiaries", "Joint account drift", "Unsigned docs", "Cross-state surprises"]}
      stage={
        <div className="grid gap-3 rounded-[24px] border border-white/10 bg-black/20 p-4 sm:grid-cols-2">
          {[
            "Will says one thing, beneficiary form says another",
            "Revocable trust exists, but assets were never retitled",
            "POA missing or rejected by the bank",
            "Kids named, but no guardian backups",
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-rose-300/15 bg-rose-400/[0.08] p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 text-rose-200" />
                <p className="text-sm leading-6 text-rose-50">{item}</p>
              </div>
            </div>
          ))}
        </div>
      }
    />
  );
}
