"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Baby,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Compass,
  Eye,
  Feather,
  FileText,
  FileWarning,
  FolderTree,
  GitFork,
  Globe,
  GitBranch,
  HandCoins,
  House,
  Inbox,
  MapPinned,
  Landmark,
  Layers3,
  Lock,
  Shield,
  ShieldAlert,
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
    <section aria-label="Wealth tier triage: five-tier ladder with complexity overlays" className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#07111f] shadow-[0_24px_90px_rgba(0,0,0,0.25)] ring-1 ring-sky-300/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.12),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(244,63,94,0.08),transparent_38%)]" />
      <div className="relative space-y-6 p-5 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-100">
              <Layers3 className="h-3.5 w-3.5" aria-hidden="true" />
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
          <div role="group" aria-label="Wealth tier triage ladder" className="grid gap-3 md:grid-cols-5">
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
                    <ArrowRight className={cn("h-3.5 w-3.5 transition", isExpanded && "rotate-90")} aria-hidden="true" />
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
                        <CheckCircle2 className={cn("mt-0.5 h-4 w-4 shrink-0", expandedStyles.detailAccent)} aria-hidden="true" />
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
              <ArrowRight className="h-4 w-4 text-slate-500" aria-hidden="true" />
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
      incoherentNarrative: "The house is jointly titled with the wrong sibling, so survivorship overrides the will and the wrong person takes the property automatically.",
      subagent: "funding-checklist-generator",
      mismatch: {
        title: "Joint tenancy with the wrong sibling",
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
      incoherentNarrative: "The crypto wallet and seed-location pointer were never inventoried, so the asset may be practically unrecoverable even if everyone agrees who should inherit it.",
      subagent: "anti-pattern-scanner",
      mismatch: {
        title: "Crypto seed not inventoried",
        axiom: "Axiom 0 adjacent",
        impact: "Unrecoverable digital assets do not care what the will intended.",
      },
    },
  ];

  const selectedSpoke = spokes.find((spoke) => spoke.id === selectedSpokeId) ?? spokes[0];
  const isIncoherent = mode === "incoherent";
  const selectedHasMismatch = isIncoherent && Boolean(selectedSpoke.mismatch);
  const selectedStyles = TIER_LADDER_STYLES[selectedHasMismatch ? "rose" : selectedSpoke.accent];

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
    <section aria-label="Axiom coherence: eight-spoke diagram showing plan coherence vs incoherence" className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#07111f] shadow-[0_24px_90px_rgba(0,0,0,0.25)] ring-1 ring-emerald-300/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(244,63,94,0.08),transparent_38%)]" />
      <div className="relative space-y-6 p-5 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-100">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
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
                  "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07111f]",
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
                      <circle
                        cx={spoke.x}
                        cy={spoke.y}
                        r={mismatched ? 2.5 : 2}
                        fill={mismatched ? "rgba(251, 113, 133, 0.95)" : "rgba(52, 211, 153, 0.9)"}
                      />
                    </motion.g>
                  );
                })}
              </svg>

              <div className="absolute left-1/2 top-1/2 z-10 w-36 -translate-x-1/2 -translate-y-1/2 rounded-[24px] border border-white/12 bg-[#081525] px-4 py-5 text-center shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white">
                  <Users className="h-5 w-5" aria-hidden="true" />
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
  const transition = prefersReducedMotion ? { duration: 0 } : { type: "spring" as const, stiffness: 280, damping: 28 };

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
    <section aria-label="Intake phases: nine-phase adaptive workflow" className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#07111f] shadow-[0_24px_90px_rgba(0,0,0,0.25)] ring-1 ring-sky-300/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_38%)]" />
      <div className="relative space-y-6 p-5 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-100">
              <Waypoints className="h-3.5 w-3.5" aria-hidden="true" />
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
              <div className="flex flex-wrap gap-3 pt-1">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                  <span className="text-sky-400">9</span> phases
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                  <span className="text-emerald-400">~85</span> min total
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                  <span className="text-amber-400">9</span> artifacts
                </span>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/45">
              Narrative sync
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex gap-0.5" aria-hidden="true">
                {intakePhases.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 w-3 rounded-full transition-colors duration-200",
                      i === activeIndex ? "bg-sky-400" : i <= activeIndex ? "bg-sky-400/30" : "bg-white/10",
                    )}
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-white">
                {scrollSyncReady && scrollActiveIndex !== null
                  ? `Phase ${activePhase.number}`
                  : "Manual mode"}
              </p>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-400" role="status" aria-live="polite">
              {scrollSyncReady
                ? "Scroll-linked to the Maya narrative below."
                : "Click or arrow-key into any phase node."}
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute left-12 right-12 top-[2.15rem] hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent xl:block" />
          <div role="tablist" aria-label="Intake phases" aria-orientation="horizontal" className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
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
                  role="tab"
                  aria-selected={isDrilled}
                  aria-controls="intake-drill-panel"
                  aria-label={`Phase ${phase.number}: ${phase.name} — ${phase.minutes}`}
                  tabIndex={isFocused ? 0 : -1}
                  aria-current={isActive ? "step" : undefined}
                  onClick={() => {
                    setFocusedIndex(index);
                    setDrilledIndex(index);
                  }}
                  onFocus={() => setFocusedIndex(index)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  className={cn(
                    "relative min-h-[3rem] cursor-pointer rounded-[22px] border p-4 text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07111f]",
                    isActive
                      ? cn(styles.activeCard, "focus-visible:ring-white/80")
                      : isDrilled
                        ? "border-white/20 bg-white/[0.08] focus-visible:ring-white/60"
                        : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06] hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-white/60",
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
            id="intake-drill-panel"
            role="tabpanel"
            aria-label={`Phase ${drilledPhase.number}: ${drilledPhase.name}`}
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
                  <p className="mt-2 text-base font-medium italic leading-7 text-slate-50">&ldquo;{drilledPhase.question}&rdquo;</p>
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

const DELIVERABLE_FOLDERS = ["intake", "analyses", "deliverables"] as const;

type DeliverableFolder = (typeof DELIVERABLE_FOLDERS)[number];
type DeliverableMode =
  | "core"
  | "new-plan"
  | "existing-plan-audit"
  | "life-event-delta"
  | "urgent-bedside-signing"
  | "executor-activation"
  | "business-owner-succession"
  | "uhnw-restructure"
  | "maintenance-review";

type DeliverableLeaf = {
  folder: DeliverableFolder;
  file: string;
  label: string;
  description: string;
  snippet: string;
  modes: DeliverableMode[];
  owner: string;
  spotlight?: boolean;
};

const DELIVERABLE_FOLDER_META: Record<
  DeliverableFolder,
  {
    label: string;
    title: string;
    accent: string;
    badge: string;
    active: string;
    inactive: string;
    dependent: string;
    detail: string;
  }
> = {
  intake: {
    label: "Intake",
    title: "intake/",
    accent: "text-slate-200",
    badge: "border-white/10 bg-white/[0.06] text-slate-200",
    active: "border-white/25 bg-white/[0.10] shadow-[0_18px_44px_rgba(148,163,184,0.12)]",
    inactive: "border-white/10 bg-white/[0.03] hover:border-white/20",
    dependent: "border-white/15 bg-white/[0.06]",
    detail: "border-white/15 bg-white/[0.06]",
  },
  analyses: {
    label: "Analyses",
    title: "analyses/",
    accent: "text-sky-200",
    badge: "border-sky-300/20 bg-sky-400/10 text-sky-100",
    active: "border-sky-300/35 bg-sky-400/[0.12] shadow-[0_18px_44px_rgba(14,165,233,0.16)]",
    inactive: "border-white/10 bg-white/[0.03] hover:border-sky-300/25",
    dependent: "border-sky-300/25 bg-sky-400/[0.08]",
    detail: "border-sky-300/20 bg-sky-400/[0.08]",
  },
  deliverables: {
    label: "Deliverables",
    title: "deliverables/",
    accent: "text-emerald-200",
    badge: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
    active: "border-emerald-300/35 bg-emerald-400/[0.12] shadow-[0_18px_44px_rgba(16,185,129,0.16)]",
    inactive: "border-white/10 bg-white/[0.03] hover:border-emerald-300/25",
    dependent: "border-emerald-300/25 bg-emerald-400/[0.08]",
    detail: "border-emerald-300/20 bg-emerald-400/[0.08]",
  },
};

const DELIVERABLE_MODE_LABELS: Record<DeliverableMode, string> = {
  core: "Core",
  "new-plan": "New plan",
  "existing-plan-audit": "Existing audit",
  "life-event-delta": "Life event",
  "urgent-bedside-signing": "Urgent signing",
  "executor-activation": "Executor activation",
  "business-owner-succession": "Business owner",
  "uhnw-restructure": "UHNW restructure",
  "maintenance-review": "Maintenance",
};

const DELIVERABLE_MODE_FILTERS: Array<{ id: "all" | DeliverableMode; label: string }> = [
  { id: "all", label: "All modes" },
  { id: "core", label: "Core" },
  { id: "new-plan", label: "New plan" },
  { id: "existing-plan-audit", label: "Existing audit" },
  { id: "life-event-delta", label: "Life event" },
  { id: "urgent-bedside-signing", label: "Urgent" },
  { id: "executor-activation", label: "Executor" },
  { id: "business-owner-succession", label: "Business" },
  { id: "uhnw-restructure", label: "UHNW" },
  { id: "maintenance-review", label: "Maintenance" },
];

const DELIVERABLE_SKILL_CATALOG_HREF =
  "https://jeffreys-skills.md/skills/wills-and-estate-planning-skill";

function summarizeDeliverableModes(modes: DeliverableMode[]) {
  const specificModes = modes.filter((mode) => mode !== "core");

  if (specificModes.length === 0) {
    return null;
  }

  const [firstMode, ...otherModes] = specificModes;

  return {
    label:
      otherModes.length === 0
        ? `Mode: ${DELIVERABLE_MODE_LABELS[firstMode]}`
        : `Mode: ${DELIVERABLE_MODE_LABELS[firstMode]} +${otherModes.length}`,
    title: specificModes.map((mode) => DELIVERABLE_MODE_LABELS[mode]).join(", "),
  };
}

const deliverableTreeLeaves: DeliverableLeaf[] = [
  {
    folder: "intake",
    file: "intake-record.md",
    label: "Intake record",
    description: "The running source of truth for household facts, goals, constraints, uploaded documents, and unresolved questions. Every later artifact points back to this record when a recommendation depends on a stated fact.",
    snippet: "Client goal: keep Maya's home out of probate while preserving a protected remainder for Theo and Julia.",
    modes: ["core"],
    owner: "intake-conductor",
  },
  {
    folder: "intake",
    file: "session-NN-summary.md",
    label: "Session summary",
    description: "A checkpoint summary written after each work session so the plan can resume cleanly. It records what changed, what evidence arrived, and what the next pass should ask first.",
    snippet: "Next session: verify Karl's MetLife beneficiary form and upload the 2018 trust PDF for gap analysis.",
    modes: ["core", "maintenance-review"],
    owner: "intake-conductor",
  },
  {
    folder: "analyses",
    file: "current-document-audit.md",
    label: "Current document audit",
    description: "An inventory of existing wills, trusts, POAs, healthcare directives, beneficiary forms, and deeds. It separates signed documents from drafts so stale paperwork does not masquerade as the current plan.",
    snippet: "2018 revocable trust exists, but Schedule A is blank and the deed still lists Maya individually.",
    modes: ["existing-plan-audit", "maintenance-review"],
    owner: "document-organizer",
  },
  {
    folder: "analyses",
    file: "beneficiary-form-audit.md",
    label: "Beneficiary form audit",
    description: "A line-by-line check of retirement plans, life insurance, bank TOD/POD forms, and transfer-on-death registrations. It catches the documents that override a will before they cause a real transfer failure.",
    snippet: "Karl 401(k): current primary beneficiary is ex-spouse; recommended update is spouse 100%, children contingent.",
    modes: ["core", "life-event-delta", "maintenance-review"],
    owner: "beneficiary-audit",
  },
  {
    folder: "analyses",
    file: "titling-audit.md",
    label: "Titling audit",
    description: "A review of how each major asset is legally titled today. It highlights joint tenancy, tenancy by the entirety, trust ownership, TOD deeds, and mismatches between title and intended distribution.",
    snippet: "Primary residence: joint tenants with right of survivorship; does not follow dispositive split in draft will.",
    modes: ["core", "existing-plan-audit", "life-event-delta"],
    owner: "asset-discovery-auditor",
  },
  {
    folder: "analyses",
    file: "coherence-audit.md",
    label: "Coherence audit",
    description: "A cross-document consistency pass across wills, trusts, titles, beneficiary forms, POAs, letters, and tax assumptions. It asks whether the whole plan tells one enforceable story.",
    snippet: "Mismatch: trust says equal shares, IRA form names one child outright, and letter of wishes assumes trustee control.",
    modes: ["core"],
    owner: "anti-pattern-scanner",
  },
  {
    folder: "analyses",
    file: "tax-exposure-analysis.md",
    label: "Tax exposure analysis",
    description: "A plain-English estimate of federal estate, state estate, inheritance, GST, capital-gains, and portability concerns. It flags every live-law assumption that must be verified from primary sources.",
    snippet: "Projected federal taxable estate below 2026 exemption; state estate tax exposure remains live because domicile is uncertain.",
    modes: ["core", "uhnw-restructure", "business-owner-succession"],
    owner: "tax-analyzer",
  },
  {
    folder: "analyses",
    file: "liquidity-analysis.md",
    label: "Liquidity analysis",
    description: "A death-time cash-flow map for taxes, debts, funeral costs, buyouts, property upkeep, and executor expenses. It prevents a technically correct plan from forcing a fire sale.",
    snippet: "Estate has $82k liquid against projected first-year obligations of $146k; bridge source required.",
    modes: ["core", "business-owner-succession", "uhnw-restructure"],
    owner: "implementation-ops-planner",
  },
  {
    folder: "analyses",
    file: "prior-plan-gap-analysis.md",
    label: "Prior plan gap analysis",
    description: "A focused delta between an old plan and the desired current plan. It identifies what can be reused, what must be revoked, and what changed because family, assets, or law moved.",
    snippet: "Gap: 2018 plan predates second marriage, out-of-state condo, and Secure Act beneficiary rules.",
    modes: ["existing-plan-audit", "life-event-delta", "maintenance-review"],
    owner: "document-organizer",
  },
  {
    folder: "analyses",
    file: "decision-ledger.md",
    label: "Decision ledger",
    description: "A chronological record of important design choices and the facts behind them. It keeps later reviewers from guessing why the plan chose a QTIP trust, a backup fiduciary, or a funding sequence.",
    snippet: "Decision 014: choose independent trustee for children's trust because co-trustee siblings have active conflict.",
    modes: ["core"],
    owner: "deliverables-generator",
  },
  {
    folder: "analyses",
    file: "official-source-log.md",
    label: "Official source log",
    description: "The verification ledger for volatile legal claims. Federal thresholds, state execution formalities, elective-share rules, and transfer rules get a dated source entry before they influence advice.",
    snippet: "2026-04-18 · IRS estate tax exemption page checked for federal threshold used in tax-exposure-analysis.md.",
    modes: ["core"],
    owner: "state-law-verifier",
  },
  {
    folder: "analyses",
    file: "red-flag-triage.md",
    label: "Red-flag triage",
    description: "A compact list of urgent risks that should interrupt the normal workflow. It separates true blockers from items that can wait for attorney review.",
    snippet: "RED: unsigned healthcare proxy and no HIPAA release; incapacity scenario would leave spouse unable to coordinate care.",
    modes: ["core", "urgent-bedside-signing", "executor-activation"],
    owner: "anti-pattern-scanner",
  },
  {
    folder: "analyses",
    file: "document-acquisition-plan.md",
    label: "Document acquisition plan",
    description: "A checklist of missing statements, deeds, beneficiary screenshots, entity agreements, policies, and IDs needed to complete the plan. It turns vague homework into institution-by-institution collection tasks.",
    snippet: "Pull latest Schwab beneficiary confirmation; upload LLC operating agreement; request recorded deed from county portal.",
    modes: ["core", "existing-plan-audit"],
    owner: "document-organizer",
  },
  {
    folder: "analyses",
    file: "evidence-confidence-map.md",
    label: "Evidence confidence map",
    description: "A confidence score for each material fact used by the plan. It marks whether a fact came from a signed document, an uploaded statement, a memory, or an unresolved assumption.",
    snippet: "Asset value: medium confidence from client estimate; beneficiary designation: low confidence until PDF confirmation arrives.",
    modes: ["core"],
    owner: "multi-model-validator",
  },
  {
    folder: "analyses",
    file: "stress-test-scenarios.md",
    label: "Stress-test scenarios",
    description: "A set of what-if cases run against the plan before handoff. It tests simultaneous death, incapacity, remarriage, creditor pressure, contested fiduciaries, and assets discovered late.",
    snippet: "Scenario: Maya dies first, Karl remarries within two years, and one child contests trustee discretion.",
    modes: ["core", "executor-activation", "uhnw-restructure"],
    owner: "multi-model-validator",
  },
  {
    folder: "analyses",
    file: "plan-coverage-matrix.md",
    label: "Plan coverage matrix",
    description: "The contract that proves every required topic has a corresponding artifact. The validator uses it to catch untouched starter outputs and missing overlay entries.",
    snippet: "Axiom 3 beneficiary-title coherence: covered by beneficiary-map.md, titling-audit.md, and coherence-audit.md.",
    modes: ["core"],
    owner: "deliverables-generator",
  },
  {
    folder: "analyses",
    file: "document-quality-triage.md",
    label: "Document quality triage",
    description: "A quality screen for existing documents before the skill relies on them. It flags unsigned drafts, scanned pages missing signatures, obsolete notarizations, and documents that conflict with current facts.",
    snippet: "Healthcare directive upload lacks signature page; treat as non-operative until a complete copy is produced.",
    modes: ["existing-plan-audit", "urgent-bedside-signing", "maintenance-review"],
    owner: "document-organizer",
  },
  {
    folder: "analyses",
    file: "recommendation-confidence-register.md",
    label: "Recommendation confidence register",
    description: "A confidence score and caveat list for each recommendation the skill makes. Anything that depends on law, missing documents, or attorney judgment is marked for review.",
    snippet: "Recommendation: TOD deed for residence · confidence medium · attorney must verify state availability and mortgage implications.",
    modes: ["core"],
    owner: "multi-model-validator",
  },
  {
    folder: "analyses",
    file: "fiduciary-bench-scorecard.md",
    label: "Fiduciary bench scorecard",
    description: "A structured evaluation of executors, trustees, agents, guardians, and backups. It scores proximity, judgment, conflict risk, logistics, age, and willingness to serve.",
    snippet: "Primary executor: sister has high trust, medium logistics risk, low conflict risk; backup professional fiduciary recommended.",
    modes: ["core", "life-event-delta"],
    owner: "fiduciary-bench-builder",
  },
  {
    folder: "analyses",
    file: "litigation-risk-memo.md",
    label: "Litigation risk memo",
    description: "A memo naming the facts that could invite contests, family conflict, fiduciary fights, or undue-influence claims. It is especially important when the plan disinherits someone or changes near death.",
    snippet: "Risk: late-life beneficiary change favors caregiver; mitigation requires capacity documentation and independent counsel notes.",
    modes: ["core", "urgent-bedside-signing", "life-event-delta"],
    owner: "litigation-defense-reviewer",
  },
  {
    folder: "analyses",
    file: "attorney-handoff-readiness.md",
    label: "Attorney handoff readiness",
    description: "A self-audit that grades whether counsel can draft efficiently from the packet. Red or yellow items send the workflow back to fill missing facts before the client pays attorney time.",
    snippet: "Readiness: yellow. Missing deed copy and final guardian backup confirmation before first attorney meeting.",
    modes: ["core"],
    owner: "deliverables-generator",
  },
  {
    folder: "analyses",
    file: "foreign-and-conflict-of-laws-review.md",
    label: "Foreign and conflict-of-laws review",
    description: "A jurisdictional screen for non-U.S. assets, non-citizen spouses, cross-border heirs, multiple domiciles, and conflict-of-laws traps. It routes the plan toward specialist counsel when domestic templates are not enough.",
    snippet: "Spanish apartment and Canadian beneficiary introduce forced-heirship and tax-residency questions for counsel.",
    modes: ["uhnw-restructure", "business-owner-succession"],
    owner: "state-law-verifier",
  },
  {
    folder: "deliverables",
    file: "asset-inventory.md",
    label: "Asset inventory",
    description: "A practical inventory of assets, debts, titles, approximate values, account locations, and evidence status. It is the map everyone uses when the plan becomes operational.",
    snippet: "Primary residence · $1.2M estimate · deed uploaded · title: Maya individually · action: trust funding review.",
    modes: ["core"],
    owner: "asset-discovery-auditor",
  },
  {
    folder: "deliverables",
    file: "beneficiary-map.md",
    label: "Beneficiary map",
    description: "A table of every beneficiary-controlled asset, current named beneficiary, intended beneficiary, and required change. It catches the quiet overrides that defeat wills and trusts.",
    snippet: "MetLife policy · current: Karl's estate · intended: Maya 100%, children contingent · action: update form.",
    modes: ["core", "life-event-delta", "maintenance-review"],
    owner: "beneficiary-audit",
    spotlight: true,
  },
  {
    folder: "deliverables",
    file: "plan-report.md",
    label: "Plan report",
    description: "The comprehensive explanation of the plan design in plain English. It ties facts, risks, chosen structures, excluded options, and attorney-review items into one coherent narrative.",
    snippet: "Recommended structure: revocable trust plus pour-over will, QTIP review, updated beneficiary designations, and incapacity packet.",
    modes: ["core"],
    owner: "deliverables-generator",
  },
  {
    folder: "deliverables",
    file: "implementation-ledger.md",
    label: "Implementation ledger",
    description: "The action list that turns recommendations into completed institution-level work. It tracks owner, sequence, deadline, dependency, and proof of completion.",
    snippet: "Task 08 · retitle Vanguard brokerage to trust · owner: Maya · proof: confirmation letter upload.",
    modes: ["core", "maintenance-review"],
    owner: "implementation-ops-planner",
  },
  {
    folder: "deliverables",
    file: "letter-of-instruction.md",
    label: "Letter of instruction",
    description: "A practical letter for executors and family members that explains where to find things and who to contact. It does not replace legal documents, but it saves survivors from detective work.",
    snippet: "Password manager emergency access is held by Karl; do not write passwords or seed phrases in this letter.",
    modes: ["core", "executor-activation"],
    owner: "deliverables-generator",
  },
  {
    folder: "deliverables",
    file: "digital-inventory.md",
    label: "Digital inventory",
    description: "A safe map of digital accounts, crypto custody locations, device access, and password-manager instructions. It stores pointers, not secrets.",
    snippet: "Crypto: hardware wallet in home safe; seed phrase pointer in sealed envelope with attorney; never paste seed phrase here.",
    modes: ["core"],
    owner: "anti-pattern-scanner",
  },
  {
    folder: "deliverables",
    file: "personal-property-memorandum.md",
    label: "Personal property memorandum",
    description: "A plain list of tangible personal property gifts and the intended recipients. It keeps sentimental items from turning into expensive family fights.",
    snippet: "Grandmother's ring: Julia. Workshop tools: Theo. Photo albums: scan first, originals to Maya's sister.",
    modes: ["core", "life-event-delta"],
    owner: "conflict-prevention-planner",
  },
  {
    folder: "deliverables",
    file: "letter-of-wishes.md",
    label: "Letter of wishes",
    description: "A nonbinding explanation of values, hopes, trustee guidance, and family context. It helps fiduciaries exercise discretion without guessing what the client meant.",
    snippet: "Education support should include trade school, graduate school, and gap-year programs with a concrete plan.",
    modes: ["core"],
    owner: "deliverables-generator",
  },
  {
    folder: "deliverables",
    file: "ethical-will.md",
    label: "Ethical will",
    description: "A values document for family meaning rather than legal transfer. It captures messages, stories, apologies, gratitude, and principles the legal documents cannot carry.",
    snippet: "What I hope you remember: use the money to buy freedom, education, and time with each other.",
    modes: ["new-plan", "maintenance-review"],
    owner: "deliverables-generator",
  },
  {
    folder: "deliverables",
    file: "family-meeting-agenda.md",
    label: "Family meeting agenda",
    description: "A structured agenda for discussing the plan with spouse, adult children, fiduciaries, or caregivers. It keeps the meeting focused on roles, expectations, and known sensitivities.",
    snippet: "Agenda item 3: explain why a professional trustee is backup, not a vote of no confidence in the children.",
    modes: ["core", "life-event-delta"],
    owner: "conflict-prevention-planner",
  },
  {
    folder: "deliverables",
    file: "conflict-prevention-plan.md",
    label: "Conflict prevention plan",
    description: "A targeted plan for foreseeable family disputes and fiduciary friction. It names communication rules, tie-breakers, no-contest risks, and documentation steps.",
    snippet: "Known conflict: Theo distrusts Karl. Mitigation: independent trustee for children's share and written explanation in letter of wishes.",
    modes: ["core", "life-event-delta", "uhnw-restructure"],
    owner: "conflict-prevention-planner",
  },
  {
    folder: "deliverables",
    file: "if-i-die-tomorrow.md",
    label: "If I die tomorrow",
    description: "A one-page first-48-hours guide for a spouse, executor, or trusted family member. It says who to call, where the real documents are, and what not to do in panic.",
    snippet: "Call first: estate attorney, CPA, life-insurance contact. Do not close accounts or distribute property before counsel reviews.",
    modes: ["core", "executor-activation"],
    owner: "deliverables-generator",
    spotlight: true,
  },
  {
    folder: "deliverables",
    file: "disposition-of-remains.md",
    label: "Disposition of remains",
    description: "A clear record of burial, cremation, funeral, donation, memorial, and religious preferences. It reduces decision load at the worst possible moment.",
    snippet: "Preference: cremation, no open casket, memorial at home; prepaid plot information stored with document package.",
    modes: ["core", "urgent-bedside-signing"],
    owner: "deliverables-generator",
  },
  {
    folder: "deliverables",
    file: "executor-checklist.md",
    label: "Executor checklist",
    description: "A stepwise checklist for what the executor does in the first days, weeks, and months. It translates the legal role into operational tasks.",
    snippet: "Week 1: secure residence, locate originals, order death certificates, notify attorney, preserve mail.",
    modes: ["core", "executor-activation"],
    owner: "implementation-ops-planner",
  },
  {
    folder: "deliverables",
    file: "attorney-interview-questions.md",
    label: "Attorney interview questions",
    description: "Questions to ask prospective estate-planning counsel before hiring them. They test state-specific competence, familiarity with edge cases, and willingness to work from the packet.",
    snippet: "How do you handle beneficiary-designation conflicts with trust funding in this state?",
    modes: ["core"],
    owner: "deliverables-generator",
  },
  {
    folder: "deliverables",
    file: "attorney-engagement-brief.md",
    label: "Attorney engagement brief",
    description: "The four-page handoff memo built for counsel. It summarizes facts, goals, recommendations, open questions, and state-law items so the first meeting starts at drafting depth.",
    snippet: "Open question for counsel: confirm QTIP design, deed transfer mechanics, and self-proving affidavit requirements.",
    modes: ["core"],
    owner: "deliverables-generator",
    spotlight: true,
  },
  {
    folder: "deliverables",
    file: "document-package-index.md",
    label: "Document package index",
    description: "An index of every artifact, source document, and evidence file in the packet. It keeps the attorney, client, and future reviewer oriented.",
    snippet: "01 intake-record.md · 02 asset-inventory.md · 03 beneficiary-map.md · source/deed-2021.pdf.",
    modes: ["core"],
    owner: "document-organizer",
  },
  {
    folder: "deliverables",
    file: "review-schedule.md",
    label: "Review schedule",
    description: "A maintenance calendar for annual reviews and event-triggered updates. It names what should be revisited after marriage, divorce, birth, death, relocation, business sale, or tax-law change.",
    snippet: "Annual: beneficiary forms and account titles. Event-driven: move states, new child, sale of business, material tax change.",
    modes: ["core", "maintenance-review"],
    owner: "implementation-ops-planner",
  },
  {
    folder: "deliverables",
    file: "signing-readiness-checklist.md",
    label: "Signing readiness checklist",
    description: "A pre-execution checklist for witnesses, notaries, IDs, final names, dates, originals, copies, and state formalities. It prevents the plan from failing at the signing table.",
    snippet: "Before signing: two disinterested witnesses present, notary booked, IDs ready, final PDFs printed single-sided.",
    modes: ["core", "urgent-bedside-signing"],
    owner: "execution-formalities-router",
  },
  {
    folder: "deliverables",
    file: "funding-proof-log.md",
    label: "Funding proof log",
    description: "A proof ledger for trust funding, beneficiary updates, title transfers, TOD registrations, and institution confirmations. It distinguishes intended work from completed work.",
    snippet: "Schwab brokerage retitled to trust · confirmation uploaded 2026-04-18 · next review 2027-04-18.",
    modes: ["core", "maintenance-review"],
    owner: "funding-checklist-generator",
  },
  {
    folder: "deliverables",
    file: "institution-contact-matrix.md",
    label: "Institution contact matrix",
    description: "A list of banks, brokerages, insurers, custodians, benefit administrators, accountants, and advisors with contact routes. Survivors need this more than they need prose.",
    snippet: "Fidelity 401(k): benefits portal URL, plan administrator phone, beneficiary-form request path, evidence status.",
    modes: ["core", "executor-activation"],
    owner: "implementation-ops-planner",
  },
  {
    folder: "deliverables",
    file: "beneficiary-change-packet.md",
    label: "Beneficiary change packet",
    description: "A packet of account-by-account beneficiary changes the client must request or submit. It pairs each change with the reason, intended beneficiary, and proof needed afterward.",
    snippet: "MetLife: replace estate beneficiary with spouse primary and children contingent; upload confirmation after processing.",
    modes: ["core", "life-event-delta", "maintenance-review"],
    owner: "beneficiary-audit",
  },
  {
    folder: "deliverables",
    file: "business-continuity-activation.md",
    label: "Business continuity activation",
    description: "A business-owner packet for immediate continuity after incapacity or death. It names signing authority, payroll continuity, client notifications, buy-sell triggers, and operating-control handoff.",
    snippet: "If owner is incapacitated: CFO can run payroll, COO can sign vendor contracts, attorney reviews buy-sell trigger.",
    modes: ["business-owner-succession"],
    owner: "implementation-ops-planner",
  },
];

function deliverablePath(leaf: DeliverableLeaf) {
  return `${leaf.folder}/${leaf.file}`;
}

export function DeliverablesTreeViz() {
  const prefersReducedMotion = useReducedMotion();
  const [categoryFilter, setCategoryFilter] = useState<"all" | DeliverableFolder>("all");
  const [modeFilter, setModeFilter] = useState<"all" | DeliverableMode>("all");
  const [query, setQuery] = useState("");
  const [selectedPath, setSelectedPath] = useState("deliverables/if-i-die-tomorrow.md");
  const [expandedFolders, setExpandedFolders] = useState<Record<DeliverableFolder, boolean>>({
    intake: true,
    analyses: true,
    deliverables: true,
  });
  const treeItemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const transition = prefersReducedMotion ? { duration: 0 } : { duration: 0.24, ease: "easeOut" as const };

  const normalizedQuery = query.trim().toLowerCase();
  const filteredLeaves = useMemo(
    () =>
      deliverableTreeLeaves.filter((leaf) => {
        const matchesCategory = categoryFilter === "all" || leaf.folder === categoryFilter;
        const matchesMode =
          modeFilter === "all" ||
          leaf.modes.includes("core") ||
          leaf.modes.includes(modeFilter);
        const searchText = [
          deliverablePath(leaf),
          leaf.label,
          leaf.description,
          leaf.snippet,
          leaf.owner,
          leaf.modes.map((mode) => DELIVERABLE_MODE_LABELS[mode]).join(" "),
        ]
          .join(" ")
          .toLowerCase();
        const matchesSearch = normalizedQuery.length === 0 || searchText.includes(normalizedQuery);

        return matchesCategory && matchesMode && matchesSearch;
      }),
    [categoryFilter, modeFilter, normalizedQuery],
  );

  const selectedLeaf = filteredLeaves.find((leaf) => deliverablePath(leaf) === selectedPath) ?? filteredLeaves[0] ?? null;
  const selectedStyles = selectedLeaf ? DELIVERABLE_FOLDER_META[selectedLeaf.folder] : DELIVERABLE_FOLDER_META.deliverables;
  const groupedLeaves = DELIVERABLE_FOLDERS.map((folder) => ({
    folder,
    leaves: filteredLeaves.filter((leaf) => leaf.folder === folder),
  })).filter((group) => group.leaves.length > 0);
  const spotlightLeaves = deliverableTreeLeaves.filter((leaf) => leaf.spotlight);
  const visibleTreeIds = useMemo(
    () =>
      groupedLeaves.flatMap(({ folder, leaves }) => [
        `folder:${folder}`,
        ...(expandedFolders[folder]
          ? leaves.map((leaf) => `leaf:${deliverablePath(leaf)}`)
          : []),
      ]),
    [expandedFolders, groupedLeaves],
  );

  const focusTreeItem = (itemId: string) => {
    treeItemRefs.current[itemId]?.focus();
  };

  const moveTreeFocus = (itemId: string, delta: number) => {
    if (visibleTreeIds.length === 0) {
      return;
    }

    const currentIndex = visibleTreeIds.indexOf(itemId);

    if (currentIndex === -1) {
      return;
    }

    const nextIndex =
      (currentIndex + delta + visibleTreeIds.length) % visibleTreeIds.length;
    focusTreeItem(visibleTreeIds[nextIndex]);
  };

  const setFolderExpanded = (
    folder: DeliverableFolder,
    nextExpanded?: boolean,
  ) => {
    setExpandedFolders((current) => ({
      ...current,
      [folder]:
        nextExpanded === undefined ? !current[folder] : nextExpanded,
    }));
  };

  const handleFolderKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    folder: DeliverableFolder,
    leaves: DeliverableLeaf[],
  ) => {
    const itemId = `folder:${folder}`;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveTreeFocus(itemId, 1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveTreeFocus(itemId, -1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      focusTreeItem(visibleTreeIds[0] ?? itemId);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      focusTreeItem(visibleTreeIds[visibleTreeIds.length - 1] ?? itemId);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      if (!expandedFolders[folder]) {
        setFolderExpanded(folder, true);
        return;
      }

      const firstLeaf = leaves[0];
      if (firstLeaf) {
        focusTreeItem(`leaf:${deliverablePath(firstLeaf)}`);
      }
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (expandedFolders[folder]) {
        setFolderExpanded(folder, false);
      }
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setFolderExpanded(folder);
    }
  };

  const handleLeafKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    path: string,
    folder: DeliverableFolder,
  ) => {
    const itemId = `leaf:${path}`;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveTreeFocus(itemId, 1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveTreeFocus(itemId, -1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      focusTreeItem(visibleTreeIds[0] ?? itemId);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      focusTreeItem(visibleTreeIds[visibleTreeIds.length - 1] ?? itemId);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusTreeItem(`folder:${folder}`);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedPath(path);
    }
  };

  return (
    <section aria-label="Deliverables tree: 45-artifact folder structure with filtering" className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#07111f] shadow-[0_24px_90px_rgba(0,0,0,0.25)] ring-1 ring-violet-300/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.12),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_38%)]" />
      <div className="relative space-y-6 p-5 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-violet-100">
              <FolderTree className="h-3.5 w-3.5" aria-hidden="true" />
              Deliverables Tree
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold tracking-tight text-white md:text-[2rem]">
                Forty-five artifacts, organized like a real project directory
              </h3>
              <p className="max-w-3xl text-sm leading-7 text-slate-300 md:text-[15px]">
                Filter the packet by folder, operating mode, or text search. Every file reveals
                its purpose, a representative snippet, and the subagent responsible for producing it.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-[8px] border border-white/10 bg-black/25 p-2 text-center">
            {DELIVERABLE_FOLDERS.map((folder) => (
              <div key={folder} className="rounded-[8px] bg-white/[0.04] px-3 py-2">
                <p className={cn("text-lg font-semibold", DELIVERABLE_FOLDER_META[folder].accent)}>
                  {deliverableTreeLeaves.filter((leaf) => leaf.folder === folder).length}
                </p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  {DELIVERABLE_FOLDER_META[folder].label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 rounded-[8px] border border-white/10 bg-black/20 p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Search artifacts
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search files, snippets, modes, or subagents"
                className="mt-2 w-full rounded-[8px] border border-white/10 bg-[#081525] px-3 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-300/40 focus:ring-2 focus:ring-violet-300/20"
              />
            </label>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Category
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["all", ...DELIVERABLE_FOLDERS] as const).map((filter) => {
                  const active = categoryFilter === filter;
                  const label = filter === "all" ? "All" : DELIVERABLE_FOLDER_META[filter].label;
                  const count =
                    filter === "all"
                      ? deliverableTreeLeaves.length
                      : deliverableTreeLeaves.filter((leaf) => leaf.folder === filter).length;

                  return (
                    <button
                      key={filter}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setCategoryFilter(filter)}
                      className={cn(
                        "rounded-[8px] border px-3 py-2 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
                        active
                          ? "border-violet-300/35 bg-violet-400/15 text-violet-50"
                          : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-slate-200",
                      )}
                    >
                      {label} <span className="text-slate-500">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Operating mode
            </p>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {DELIVERABLE_MODE_FILTERS.map((filter) => {
                const active = modeFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setModeFilter(filter.id)}
                    className={cn(
                      "shrink-0 rounded-[8px] border px-3 py-2 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
                      active
                        ? "border-emerald-300/35 bg-emerald-400/15 text-emerald-50"
                        : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-slate-200",
                    )}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Mode filters include core files plus artifacts triggered by the selected mode.
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.78fr)]">
          <div className="rounded-[8px] border border-white/10 bg-black/20 p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  my-estate-plan/
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Showing <span className="font-semibold text-white">{filteredLeaves.length}</span> of{" "}
                  <span className="font-semibold text-white">{deliverableTreeLeaves.length}</span> files
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
                2 + 20 + 23 = 45
              </div>
            </div>

            {groupedLeaves.length > 0 ? (
              <div role="tree" aria-label="Estate planning deliverables folder tree" className="space-y-4">
                {groupedLeaves.map(({ folder, leaves }) => {
                  const meta = DELIVERABLE_FOLDER_META[folder];
                  return (
                    <div key={folder} className="rounded-[8px] border border-white/10 bg-white/[0.025] p-3">
                      <button
                        type="button"
                        role="treeitem"
                        aria-expanded={expandedFolders[folder]}
                        aria-level={1}
                        aria-selected={selectedLeaf?.folder === folder}
                        ref={(node) => {
                          treeItemRefs.current[`folder:${folder}`] = node;
                        }}
                        onClick={() => setFolderExpanded(folder)}
                        onKeyDown={(event) => handleFolderKeyDown(event, folder, leaves)}
                        className="flex w-full items-center justify-between gap-3 rounded-[8px] border border-transparent px-2 py-1 text-left transition focus:outline-none focus-visible:border-white/15 focus-visible:ring-2 focus-visible:ring-white/60"
                      >
                        <div className="flex min-w-0 items-center gap-2 text-white">
                          <ArrowRight
                            className={cn(
                              "h-4 w-4 shrink-0 text-slate-400",
                              prefersReducedMotion ? "" : "transition-transform",
                              expandedFolders[folder] ? "rotate-90" : "",
                            )}
                            aria-hidden="true"
                          />
                          <FolderTree className={cn("h-4 w-4 shrink-0", meta.accent)} />
                          <span className="font-mono text-sm">{meta.title}</span>
                        </div>
                        <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-semibold", meta.badge)}>
                          {leaves.length} shown
                        </span>
                      </button>

                      {expandedFolders[folder] ? (
                        <div role="group" className="mt-3 space-y-2 border-l border-white/10 pl-3">
                          {leaves.map((leaf) => {
                            const path = deliverablePath(leaf);
                            const selected = selectedLeaf ? deliverablePath(selectedLeaf) === path : false;
                            const modeSummary = summarizeDeliverableModes(leaf.modes);
                            return (
                              <button
                                key={path}
                                type="button"
                                role="treeitem"
                                aria-level={2}
                                aria-selected={selected}
                                ref={(node) => {
                                  treeItemRefs.current[`leaf:${path}`] = node;
                                }}
                                onClick={() => setSelectedPath(path)}
                                onKeyDown={(event) => handleLeafKeyDown(event, path, leaf.folder)}
                                className={cn(
                                  "w-full rounded-[8px] border p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
                                  selected
                                    ? meta.active
                                    : modeSummary
                                      ? meta.dependent
                                      : meta.inactive,
                                )}
                              >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="font-mono text-sm font-semibold text-white">{leaf.file}</p>
                                    <p className="mt-1 text-xs leading-5 text-slate-400">{leaf.label}</p>
                                  </div>
                                  {modeSummary ? (
                                    <span
                                      title={modeSummary.title}
                                      className="rounded-full border border-amber-300/20 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-100"
                                    >
                                      {modeSummary.label}
                                    </span>
                                  ) : null}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[8px] border border-white/10 bg-white/[0.03] p-6 text-center">
                <p className="text-sm font-semibold text-white">No files match those filters.</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Clear the search or switch back to All categories and All modes.
                </p>
              </div>
            )}
          </div>

          <AnimatePresence initial={false} mode="wait">
            {selectedLeaf ? (
              <motion.div
                key={deliverablePath(selectedLeaf)}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
                transition={transition}
                className={cn("rounded-[8px] border p-5", selectedStyles.detail)}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className={cn("rounded-full border px-3 py-1 text-[11px] font-semibold", selectedStyles.badge)}>
                    {selectedStyles.label}
                  </span>
                  <span className="font-mono text-sm text-slate-300">{deliverablePath(selectedLeaf)}</span>
                  <a
                    href={DELIVERABLE_SKILL_CATALOG_HREF}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold text-cyan-100 transition hover:border-cyan-300/30 hover:text-cyan-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07111f]"
                  >
                    View in skill catalog
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>

                <h4 className="mt-4 text-2xl font-semibold tracking-tight text-white">{selectedLeaf.label}</h4>
                <p className="mt-3 text-sm leading-7 text-slate-200">{selectedLeaf.description}</p>

                <div className="mt-5 rounded-[8px] border border-white/10 bg-black/25 p-4">
                  <p className={cn("text-[11px] font-semibold uppercase tracking-[0.22em]", selectedStyles.accent)}>
                    Representative snippet
                  </p>
                  <p className="mt-2 font-mono text-sm leading-7 text-slate-100">{selectedLeaf.snippet}</p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[8px] border border-white/10 bg-black/20 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                      Producing subagent
                    </p>
                    <p className="mt-2 font-mono text-sm text-cyan-200">{selectedLeaf.owner}</p>
                  </div>
                  <div className="rounded-[8px] border border-white/10 bg-black/20 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                      Mode coverage
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedLeaf.modes.map((mode) => (
                        <span
                          key={mode}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold text-slate-200"
                        >
                          {DELIVERABLE_MODE_LABELS[mode]}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {spotlightLeaves.map((leaf) => {
            const meta = DELIVERABLE_FOLDER_META[leaf.folder];
            return (
              <button
                key={deliverablePath(leaf)}
                type="button"
                onClick={() => {
                  setCategoryFilter("all");
                  setModeFilter("all");
                  setQuery("");
                  setExpandedFolders((current) => ({ ...current, [leaf.folder]: true }));
                  setSelectedPath(deliverablePath(leaf));
                }}
                className={cn(
                  "rounded-[8px] border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07111f]",
                  meta.inactive,
                )}
              >
                <p className={cn("text-[11px] font-semibold uppercase tracking-[0.22em]", meta.accent)}>
                  Spotlight
                </p>
                <p className="mt-2 font-mono text-sm font-semibold text-white">{leaf.file}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{leaf.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const antiPatterns = [
  {
    name: "The ex-spouse still on the 401(k)",
    hook: "The will says everything to the kids. The plan administrator disagrees.",
    explanation: "ERISA retirement plans follow the beneficiary designation on file. Your will does not override it. Plan administrators have a federal duty to pay whoever is named.",
    worstCase: "Your grieving spouse watches $400k leave the family and go to your ex.",
    subagent: "beneficiary-audit",
    icon: "AlertCircle",
  },
  {
    name: "The revocable trust that owns nothing",
    hook: "A $5,000 trust document. Zero assets actually titled into it.",
    explanation: "Signing a revocable trust does not fund it. You have to re-title every asset you want the trust to own — deed transfers, brokerage retitlings, beneficiary updates naming the trust. A pour-over will can catch what you missed, but those assets still go through probate.",
    worstCase: "The plan your attorney wrote does nothing because the funding homework was never done.",
    subagent: "funding-checklist-generator",
    icon: "Inbox",
  },
  {
    name: "The seed phrase in the will",
    hook: "Wills become public record at probate. Crypto seed phrases should not.",
    explanation: "Anyone with access to the probate filing can see the will. Seed phrases, account passwords, and two-factor backup codes written into the will expose the assets they protect the moment the will is filed.",
    worstCase: "Your Bitcoin is drained by a diligent paralegal or a court-records scraper.",
    subagent: "anti-pattern-scanner",
    icon: "Eye",
  },
  {
    name: "The springing POA the bank will not honor",
    hook: "A POA that activates only after two doctors certify incapacity sounds careful. Banks hate it.",
    explanation: "Banks and brokerages are risk-averse about 'is this person legally incapacitated' — they do not want to be sued. Many refuse to honor springing POAs even when the documentation arrives, which is precisely when you cannot push back.",
    worstCase: "Your agent cannot pay your bills while your POA is tied up in bank-approval limbo.",
    subagent: "anti-pattern-scanner",
    icon: "Lock",
  },
  {
    name: "Co-executors in a conflicted family",
    hook: "Naming both adult children as co-executors so neither feels excluded is a famous bad idea.",
    explanation: "Co-executors must agree to act. In a family with any real friction — money tension, political disagreement, old grudge — this guarantees deadlock, legal fees, and a relationship that does not recover.",
    worstCase: "Your estate spends 18 months in partition litigation between your kids.",
    subagent: "fiduciary-bench-builder",
    icon: "Users",
  },
  {
    name: "Minors named directly as beneficiaries",
    hook: "Naming your 12-year-old as the beneficiary on the 529 or the life insurance.",
    explanation: "Minors cannot receive inheritances directly. The money lands in court-supervised property management, or gets paid out to them outright the minute they hit the applicable release age. Neither outcome is what you meant.",
    worstCase: "Your 18-year-old inherits $400k the month of their freshman year. Results vary.",
    subagent: "beneficiary-audit",
    icon: "Baby",
  },
  {
    name: "\"Everything to my spouse, trust them with our kids\" in a blended family",
    hook: "Your spouse can rewrite their will after you die. Your first-marriage kids are then at their discretion.",
    explanation: "Without a protected-remainder structure — typically a QTIP trust — your surviving spouse inherits everything and can leave it entirely to their own children, their next spouse, or anyone else. Your kids from your first marriage rely on the honor system.",
    worstCase: "The money you meant for your first-marriage children goes to your widow's second husband's kids.",
    subagent: "overlay-resolver",
    icon: "GitFork",
  },
  {
    name: "The pet trust you forgot about",
    hook: "Your Congo African Grey outlives you. You never named a caretaker.",
    explanation: "Parrots live fifty-plus years. Tortoises, a hundred. Even a cat outlives a plan written at age 40. Without a pet trust with a named caretaker and a funded trustee, the animal ends up in a shelter, with a reluctant relative, or worse.",
    worstCase: "Your beloved pet is rehomed by a county animal-services clerk.",
    subagent: "overlay-resolver",
    icon: "Feather",
  },
  {
    name: "Form 706 portability filing skipped",
    hook: "The surviving spouse's executor never files Form 706 after the first spouse's death.",
    explanation: "DSUE — the deceased spouse's unused federal exemption — transfers to the surviving spouse only if Form 706 is filed, usually within 9 months of death. Skip it and you lose millions of potential exemption when the second spouse dies.",
    worstCase: "Your family pays federal estate tax on assets that would have sheltered for free.",
    subagent: "tax-analyzer",
    icon: "FileText",
  },
  {
    name: "A will signed in the wrong formality",
    hook: "Two witnesses required; you had one. Notarization needed; you skipped it.",
    explanation: "Every state has precise execution formalities — number of witnesses, whether the witnesses must be disinterested, whether a self-proving affidavit requires a notary. Miss one and the will may be invalidated in probate, sending everything to intestate succession.",
    worstCase: "Your will is thrown out. State law, not you, decides who inherits.",
    subagent: "execution-formalities-router",
    icon: "FileWarning",
  },
  {
    name: "An outright distribution to a vulnerable heir",
    hook: "Your adult child is in recovery. A $400k lump sum could destabilize them.",
    explanation: "A large inheritance to an heir with addiction, mental-health concerns, a pattern of creditor trouble, or means-tested benefit eligibility is often the worst thing you can do for them. An incentive trust with clear release triggers and a responsible trustee preserves both the money and the person.",
    worstCase: "A child in long-term recovery relapses and does not make it.",
    subagent: "overlay-resolver",
    icon: "Shield",
  },
  {
    name: "The non-citizen spouse hole",
    hook: "If your spouse is not a U.S. citizen, the unlimited marital deduction does not apply. There is a $60,000 threshold instead.",
    explanation: "A U.S. estate can pass unlimited property to a U.S.-citizen spouse tax-free. To a non-citizen spouse, only the first $60,000 passes without tax. A QDOT trust solves it — but only if you set one up. Otherwise the math is brutal.",
    worstCase: "A surviving non-citizen spouse pays six-figure estate tax on the family home.",
    subagent: "overlay-resolver",
    icon: "Globe",
  },
  {
    name: "A plan updated a week before death",
    hook: "A dying patient, a new caregiver, a fresh will. Every judge has seen this case.",
    explanation: "Updates made in the final weeks under pressure from a new beneficiary are the textbook scenario for undue-influence litigation. Even if the update was legitimate, the optics will cost the estate hundreds of thousands in litigation defense.",
    worstCase: "The kids who were disinherited contest and win, and the 'new beneficiary' walks away with legal fees on the other side.",
    subagent: "litigation-defense-reviewer",
    icon: "ShieldAlert",
  },
]

const antiPatternIconMap: Record<string, ReactNode> = {
  AlertCircle: <AlertCircle className="h-4 w-4" aria-hidden="true" />,
  Inbox: <Inbox className="h-4 w-4" aria-hidden="true" />,
  Eye: <Eye className="h-4 w-4" aria-hidden="true" />,
  Lock: <Lock className="h-4 w-4" aria-hidden="true" />,
  Users: <Users className="h-4 w-4" aria-hidden="true" />,
  Baby: <Baby className="h-4 w-4" aria-hidden="true" />,
  GitFork: <GitFork className="h-4 w-4" aria-hidden="true" />,
  Feather: <Feather className="h-4 w-4" aria-hidden="true" />,
  FileText: <FileText className="h-4 w-4" aria-hidden="true" />,
  FileWarning: <FileWarning className="h-4 w-4" aria-hidden="true" />,
  Shield: <Shield className="h-4 w-4" aria-hidden="true" />,
  Globe: <Globe className="h-4 w-4" aria-hidden="true" />,
  ShieldAlert: <ShieldAlert className="h-4 w-4" aria-hidden="true" />,
};

type AntiPatternCardData = (typeof antiPatterns)[number];

function AntiPatternCardFront({
  pattern,
  index,
  icon,
  hintText,
  className,
  style,
  hidden,
}: {
  pattern: AntiPatternCardData;
  index: number;
  icon: ReactNode;
  hintText: string;
  className: string;
  style?: React.CSSProperties;
  hidden?: boolean;
}) {
  return (
    <div className={className} style={style} aria-hidden={hidden}>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-rose-300/20 bg-rose-400/12 text-rose-100">
            {icon}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <div>
          <h4 className="text-lg font-semibold leading-6 text-white">{pattern.name}</h4>
          <p className="mt-3 text-sm leading-7 text-slate-300">{pattern.hook}</p>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between gap-3 text-xs text-slate-400">
        <span>{hintText}</span>
        <ArrowRight className="h-4 w-4 text-rose-200 transition group-hover:translate-x-0.5" aria-hidden="true" />
      </div>
    </div>
  );
}

function AntiPatternCardBack({
  pattern,
  icon,
  className,
  style,
  hidden,
}: {
  pattern: AntiPatternCardData;
  icon: ReactNode;
  className: string;
  style?: React.CSSProperties;
  hidden?: boolean;
}) {
  return (
    <div className={className} style={style} aria-hidden={hidden}>
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-rose-300/25 bg-black/20 text-rose-100">
          {icon}
        </span>
        <span className="rounded-full border border-rose-300/20 bg-black/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-100">
          Catch
        </span>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-200">
            What actually goes wrong
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-100">{pattern.explanation}</p>
        </div>
        <div className="rounded-[8px] border border-rose-300/15 bg-black/20 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-200">
            Worst case
          </p>
          <p className="mt-2 text-sm leading-6 text-rose-50">{pattern.worstCase}</p>
        </div>
        <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Catching subagent
          </p>
          <p className="mt-2 font-mono text-sm text-cyan-200">{pattern.subagent}</p>
        </div>
      </div>
    </div>
  );
}

export function AntiPatternCardsViz() {
  const prefersReducedMotion = useReducedMotion();
  const [flippedCards, setFlippedCards] = useState<string[]>([antiPatterns[0].name]);
  const [hasFinePointer, setHasFinePointer] = useState(false);
  const cardButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pointerFocusRef = useRef(false);
  const hoverOnlyRef = useRef(new Set<string>());
  const transition = prefersReducedMotion ? { duration: 0 } : { duration: 0.32, ease: "easeOut" as const };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const syncPointerCapability = () => {
      setHasFinePointer(mediaQuery.matches);
    };

    syncPointerCapability();
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncPointerCapability);
      return () => mediaQuery.removeEventListener("change", syncPointerCapability);
    }

    mediaQuery.addListener(syncPointerCapability);
    return () => mediaQuery.removeListener(syncPointerCapability);
  }, []);

  const hoverFlip = (name: string) => {
    if (!hasFinePointer) return;
    setFlippedCards((current) => {
      if (current.includes(name)) return current;
      hoverOnlyRef.current.add(name);
      return [...current, name];
    });
  };

  const hoverUnflip = (name: string) => {
    if (!hoverOnlyRef.current.has(name)) return;
    hoverOnlyRef.current.delete(name);
    setFlippedCards((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : current,
    );
  };

  const toggleCard = (name: string) => {
    if (!hasFinePointer) {
      navigator.vibrate?.(12);
    }
    setFlippedCards((current) => {
      const isHoverPreview = hoverOnlyRef.current.has(name);
      if (isHoverPreview) {
        hoverOnlyRef.current.delete(name);
        return current;
      }

      return current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name];
    });
  };

  const focusCardByIndex = (index: number) => {
    cardButtonRefs.current[index]?.focus();
  };

  const handleCardKeyDown = (
    index: number,
    event: ReactKeyboardEvent<HTMLButtonElement>,
  ) => {
    const lastIndex = antiPatterns.length - 1;
    const columns =
      typeof window === "undefined"
        ? 1
        : window.innerWidth >= 1280
          ? 4
          : window.innerWidth >= 640
            ? 2
            : 1;

    let nextIndex = index;
    switch (event.key) {
      case "ArrowRight":
        nextIndex = Math.min(lastIndex, index + 1);
        break;
      case "ArrowLeft":
        nextIndex = Math.max(0, index - 1);
        break;
      case "ArrowDown":
        nextIndex = Math.min(lastIndex, index + columns);
        break;
      case "ArrowUp":
        nextIndex = Math.max(0, index - columns);
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = lastIndex;
        break;
      default:
        return;
    }

    event.preventDefault();
    focusCardByIndex(nextIndex);
  };

  const hintText = hasFinePointer
    ? "Hover to preview, click to pin, or press Space"
    : "Tap to flip, tap again to close, or press Space";

  return (
    <section aria-label="Anti-pattern cards: common estate planning failures" className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#07111f] shadow-[0_24px_90px_rgba(0,0,0,0.25)] ring-1 ring-rose-300/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.12),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.08),transparent_38%)]" />
      <div className="relative space-y-6 p-5 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-300/20 bg-rose-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-rose-100">
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
              Anti-Patterns
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold tracking-tight text-white md:text-[2rem]">
                The patterns the skill is designed to catch
              </h3>
              <p className="max-w-3xl text-sm leading-7 text-slate-300 md:text-[15px]">
                Flip each card to see what actually goes wrong, the worst case, and
                which internal subagent catches the failure before the plan leaves draft mode.
              </p>
              <div
                id="anti-pattern-interaction-help"
                className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-400"
              >
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                  {hasFinePointer
                    ? "Desktop: hover previews, click pins"
                    : "Touch: tap flips, tap again closes"}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                  Keyboard: arrows move, Home/End jump, Space flips
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-[8px] border border-white/10 bg-black/25 px-4 py-3 text-sm text-slate-300">
            <span className="font-semibold text-white">{antiPatterns.length}</span> cards ·{" "}
            <span className="font-semibold text-rose-100">{flippedCards.length}</span> open
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {antiPatterns.map((pattern, index) => {
            const flipped = flippedCards.includes(pattern.name);
            const icon = antiPatternIconMap[pattern.icon] ?? <AlertTriangle className="h-4 w-4" aria-hidden="true" />;

            return (
              <button
                key={pattern.name}
                ref={(node) => {
                  cardButtonRefs.current[index] = node;
                }}
                type="button"
                aria-pressed={flipped}
                aria-describedby={`anti-pattern-interaction-help anti-pattern-card-status-${index}`}
                aria-label={`${flipped ? "Show front of" : "Show back of"} anti-pattern card: ${pattern.name}`}
                onPointerDown={(event) => {
                  pointerFocusRef.current = event.pointerType !== "touch";
                }}
                onMouseEnter={() => {
                  if (hasFinePointer) hoverFlip(pattern.name);
                }}
                onMouseLeave={() => {
                  pointerFocusRef.current = false;
                  if (hasFinePointer) hoverUnflip(pattern.name);
                }}
                onKeyDown={(event) => handleCardKeyDown(index, event)}
                onClick={() => toggleCard(pattern.name)}
                onFocus={() => {
                  if (pointerFocusRef.current) {
                    pointerFocusRef.current = false;
                  }
                }}
                onBlur={() => {
                  pointerFocusRef.current = false;
                }}
                className="group relative min-h-[26rem] rounded-[8px] text-left outline-none [perspective:1200px] focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07111f]"
              >
                {prefersReducedMotion ? (
                  <div className="absolute inset-0 rounded-[8px]">
                    <AntiPatternCardFront
                      pattern={pattern}
                      index={index}
                      icon={icon}
                      hintText={hintText}
                      hidden={flipped}
                      className={cn(
                        "absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[8px] border border-white/10 bg-[#081525] p-5 shadow-[0_18px_44px_rgba(0,0,0,0.18)] transition-opacity duration-200 group-hover:border-rose-300/25",
                        flipped ? "pointer-events-none opacity-0" : "opacity-100",
                      )}
                    />
                    <AntiPatternCardBack
                      pattern={pattern}
                      icon={icon}
                      hidden={!flipped}
                      className={cn(
                        "absolute inset-0 flex flex-col overflow-y-auto rounded-[8px] border border-rose-300/20 bg-rose-400/[0.09] p-5 shadow-[0_18px_44px_rgba(244,63,94,0.12)] transition-opacity duration-200",
                        flipped ? "opacity-100" : "pointer-events-none opacity-0",
                      )}
                    />
                  </div>
                ) : (
                  <motion.div
                    animate={{ rotateY: flipped ? 180 : 0 }}
                    transition={transition}
                    className="absolute inset-0 rounded-[8px]"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <AntiPatternCardFront
                      pattern={pattern}
                      index={index}
                      icon={icon}
                      hintText={hintText}
                      hidden={flipped}
                      className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[8px] border border-white/10 bg-[#081525] p-5 shadow-[0_18px_44px_rgba(0,0,0,0.18)] transition group-hover:border-rose-300/25"
                      style={{ backfaceVisibility: "hidden" }}
                    />
                    <AntiPatternCardBack
                      pattern={pattern}
                      icon={icon}
                      hidden={!flipped}
                      className="absolute inset-0 flex flex-col overflow-y-auto rounded-[8px] border border-rose-300/20 bg-rose-400/[0.09] p-5 shadow-[0_18px_44px_rgba(244,63,94,0.12)]"
                      style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                    />
                  </motion.div>
                )}
                <span id={`anti-pattern-card-status-${index}`} className="sr-only">
                  {flipped
                    ? "Back of card open. Press Space to return to the front summary."
                    : "Front of card visible. Press Space to reveal what goes wrong."}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   PricingComparisonViz — interactive cost comparison widget (hgjp.41)
   ================================================================ */

type PricingComplexityChip = {
  id: string;
  label: string;
};

const PRICING_COMPLEXITY_CHIPS: PricingComplexityChip[] = [
  { id: "blended-family", label: "Blended family" },
  { id: "minor-children", label: "Minor children / dependents" },
  { id: "business-interest", label: "Business / partnership interest" },
  { id: "multi-state-property", label: "Vacation home / multi-state property" },
  { id: "vulnerable-heir", label: "Vulnerable heir" },
  { id: "non-citizen-spouse", label: "Non-citizen spouse" },
  { id: "crypto", label: "Crypto self-custody" },
  { id: "concentrated-stock", label: "Concentrated stock / pre-IPO" },
];

const PRICING_SLIDER_MIN = 100_000;
const PRICING_SLIDER_MAX = 100_000_000;
const PRICING_JSM_MONTHLY_PRICE = 20;
const PRICING_ATTORNEY_MIN = 3_000;
const PRICING_ATTORNEY_MAX = 40_000;

function priceCalcValueFromSlider(sliderValue: number) {
  const logMin = Math.log10(PRICING_SLIDER_MIN);
  const logMax = Math.log10(PRICING_SLIDER_MAX);
  const exponent = logMin + (sliderValue / 100) * (logMax - logMin);
  const rawValue = 10 ** exponent;
  if (rawValue < 1_000_000) return Math.round(rawValue / 5_000) * 5_000;
  if (rawValue < 10_000_000) return Math.round(rawValue / 25_000) * 25_000;
  return Math.round(rawValue / 100_000) * 100_000;
}

function priceCalcSliderFromValue(value: number) {
  const logMin = Math.log10(PRICING_SLIDER_MIN);
  const logMax = Math.log10(PRICING_SLIDER_MAX);
  return ((Math.log10(value) - logMin) / (logMax - logMin)) * 100;
}

function clampAttorneyEstimate(value: number) {
  return Math.min(PRICING_ATTORNEY_MAX, Math.max(PRICING_ATTORNEY_MIN, value));
}

function roundAttorneyEstimate(value: number) {
  return Math.round(value / 250) * 250;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: value >= 1_000_000 ? 1 : 0,
  }).format(value);
}

function getNetWorthBucket(value: number) {
  if (value < 250_000) return "100k-250k";
  if (value < 500_000) return "250k-500k";
  if (value < 1_000_000) return "500k-1m";
  if (value < 3_000_000) return "1m-3m";
  if (value < 10_000_000) return "3m-10m";
  if (value < 30_000_000) return "10m-30m";
  return "30m-100m";
}

function emitPricingCalcChanged(netWorth: number, numChips: number) {
  if (typeof window === "undefined") return;
  if (navigator.doNotTrack === "1") return;
  const payload = {
    net_worth_bucket: getNetWorthBucket(netWorth),
    num_chips: numChips,
  };
  if (process.env.NODE_ENV !== "production") {
    console.info("[pricing_calc_changed]", payload);
    return;
  }
  if (typeof window.gtag === "function") {
    window.gtag("event", "pricing_calc_changed", payload);
  }
}

export function PricingComparisonViz() {
  const prefersReducedMotion = useReducedMotion();
  const [sliderValue, setSliderValue] = useState(() =>
    priceCalcSliderFromValue(1_000_000),
  );
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const hasInteractedRef = useRef(false);
  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: "easeOut" as const };

  const netWorth = useMemo(
    () => priceCalcValueFromSlider(sliderValue),
    [sliderValue],
  );
  const numChips = selectedChips.length;

  const attorneyEstimate = useMemo(() => {
    const complexityPremium = numChips * 2_000;
    const netWorthPremium = Math.max(0, netWorth - 1_000_000) * 0.00005;
    return roundAttorneyEstimate(
      clampAttorneyEstimate(PRICING_ATTORNEY_MIN + netWorthPremium + complexityPremium),
    );
  }, [netWorth, numChips]);

  const savingsVsAttorney = Math.max(0, attorneyEstimate - PRICING_JSM_MONTHLY_PRICE);

  useEffect(() => {
    if (!hasInteractedRef.current) return;
    emitPricingCalcChanged(netWorth, numChips);
  }, [netWorth, numChips]);

  const toggleChip = (chipId: string) => {
    hasInteractedRef.current = true;
    setSelectedChips((current) =>
      current.includes(chipId)
        ? current.filter((v) => v !== chipId)
        : [...current, chipId],
    );
  };

  return (
    <section
      aria-label="Interactive pricing calculator comparing attorney, form-based, and jeffreys-skills.md costs"
      className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#07111f] shadow-[0_24px_90px_rgba(0,0,0,0.25)] ring-1 ring-amber-300/10"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.12),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.08),transparent_38%)]" />
      <div className="relative grid gap-6 p-5 md:grid-cols-[1.1fr_0.9fr] md:p-7">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-100">
              <HandCoins className="h-3.5 w-3.5" aria-hidden="true" />
              Pricing Reality Check
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold tracking-tight text-white md:text-[2rem]">
                See how complexity changes the economics
              </h3>
              <p className="max-w-3xl text-sm leading-7 text-slate-300 md:text-[15px]">
                This is deliberately a rough guide. The point is the order of
                magnitude: once you have real family complexity, the expensive
                part of a lawyer&apos;s first meeting is usually the intake and
                issue-spotting work.
              </p>
            </div>
          </div>

          <div className="rounded-[20px] border border-white/10 bg-black/20 p-4 md:p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/45">
                  Net worth estimate
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
                  {formatCompactCurrency(netWorth)}
                </p>
              </div>
              <div className="rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold text-amber-100">
                {getNetWorthBucket(netWorth)}
              </div>
            </div>

            <label className="mt-5 block">
              <span className="sr-only">
                Estimated net worth from one hundred thousand dollars to one hundred million dollars
              </span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={sliderValue}
                aria-label="Estimated net worth"
                aria-valuetext={formatCurrency(netWorth)}
                className="sm-range w-full"
                onChange={(event) => {
                  hasInteractedRef.current = true;
                  setSliderValue(Number(event.currentTarget.value));
                }}
              />
            </label>

            <div className="mt-3 flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
              <span>$100K</span>
              <span>$1M</span>
              <span>$10M</span>
              <span>$100M</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/45">
                  Complexity overlays
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Toggle the facts that make a cheap form bundle stop being the
                  real comparison.
                </p>
              </div>
              <div className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold text-cyan-100">
                {numChips} active
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {PRICING_COMPLEXITY_CHIPS.map((chip) => {
                const active = selectedChips.includes(chip.id);
                return (
                  <button
                    key={chip.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleChip(chip.id)}
                    className={cn(
                      "rounded-[16px] border px-4 py-3 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07111f]",
                      active
                        ? "border-cyan-300/35 bg-cyan-400/[0.12] text-cyan-50 shadow-[0_14px_34px_rgba(34,211,238,0.12)]"
                        : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-cyan-300/20 hover:bg-cyan-400/[0.04]",
                    )}
                  >
                    <span className="block font-medium">{chip.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div
            aria-live="polite"
            className="rounded-[22px] border border-white/10 bg-black/20 p-4 md:p-5"
          >
            <div className="grid gap-3">
              <div className="rounded-[18px] border border-amber-300/20 bg-amber-400/[0.08] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-200">
                  Attorney consult estimate
                </p>
                <motion.p
                  key={`attorney-${attorneyEstimate}`}
                  initial={prefersReducedMotion ? false : { opacity: 0.65, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={transition}
                  className="mt-2 text-4xl font-semibold tracking-tight text-white"
                >
                  {formatCurrency(attorneyEstimate)}
                </motion.p>
                <p className="mt-2 text-sm leading-6 text-amber-50/80">
                  Roughly modeled as a base intake + complexity premium, then
                  soft-clamped so the widget stays in plausible territory.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[18px] border border-sky-300/20 bg-sky-400/[0.08] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-200">
                    LegalZoom / Trust &amp; Will
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
                    $199–$499
                  </p>
                  <p className="mt-2 text-sm leading-6 text-sky-50/80">
                    Flat consumer-template pricing. It usually does not move
                    with complexity, which is the whole point of the comparison.
                  </p>
                </div>

                <div className="rounded-[18px] border border-emerald-300/20 bg-emerald-400/[0.08] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-200">
                    Jeffreys Skills.md
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
                    $20/mo
                  </p>
                  <p className="mt-2 text-sm leading-6 text-emerald-50/80">
                    Month-to-month. Cancel when the packet is done and your
                    attorney handoff is organized.
                  </p>
                </div>
              </div>
            </div>

            <motion.div
              key={`savings-${savingsVsAttorney}`}
              initial={prefersReducedMotion ? false : { opacity: 0.7, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={transition}
              className="mt-4 rounded-[18px] border border-emerald-300/25 bg-emerald-400/[0.10] p-4"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-200">
                Projected savings vs attorney consult
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
                {formatCurrency(savingsVsAttorney)}
              </p>
            </motion.div>

            <p className="mt-4 text-sm font-medium leading-6 text-slate-200">
              This calculator is a rough guide, not a legal fee quote. Actual
              attorneys quote based on actual facts. Your real skill
              subscription is {formatCurrency(PRICING_JSM_MONTHLY_PRICE)} per
              month; the attorney number is here so you can understand the
              order of magnitude.
            </p>

            <p className="mt-3 text-xs leading-5 text-slate-400">
              Sources: public consumer pricing pages for LegalZoom and Trust
              &amp; Will, plus public estate-planning billing-rate surveys and
              fee schedules. This widget turns those public ranges into a
              deliberately simple comparison, not a quote.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
