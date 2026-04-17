"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRightCircle,
  CheckCircle2,
  CircleDashed,
  Cloud,
  DollarSign,
  FileArchive,
  FileCheck,
  GitBranch,
  HardDrive,
  Layers,
  Lock,
  MailCheck,
  Package,
  PauseCircle,
  PlayCircle,
  Radar,
  ServerCog,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Upload,
  Users,
  Zap,
} from "lucide-react";

// ============================================================
// 1. COST COMPOUNDING VIZ
// Slider for user count + years → Slack vs Mattermost cost curve
// ============================================================

type PlanKey = "pro" | "business";

const SLACK_PLAN_PRICE: Record<PlanKey, number> = {
  pro: 7.25,     // $/user/month
  business: 12.5, // $/user/month
};

const SLACK_PLAN_LABEL: Record<PlanKey, string> = {
  pro: "Slack Pro",
  business: "Slack Business+",
};

// Rough infrastructure costs ($/month) by user bucket
function mattermostMonthly(users: number): number {
  if (users <= 50) return 22;    // VPS M + Postmark + R2
  if (users <= 250) return 72;   // AX42 + Postmark + R2 + backups
  if (users <= 1000) return 92;  // AX52 + Postmark + R2 + backups
  // beyond 1k: add a separate PG and light headroom
  return 180 + Math.max(0, users - 1000) * 0.05;
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return `$${n.toFixed(0)}`;
}

export function CostCompoundingViz() {
  const [users, setUsers] = useState(340);
  const [plan, setPlan] = useState<PlanKey>("business");
  const [years, setYears] = useState(3);
  const prefersReducedMotion = useReducedMotion();

  const slackMonthly = users * SLACK_PLAN_PRICE[plan];
  const mmMonthly = mattermostMonthly(users);
  const slackTotal = slackMonthly * 12 * years;
  const mmTotal = mmMonthly * 12 * years + (users > 50 ? 42 : 0); // one-time Hetzner setup
  const savings = Math.max(0, slackTotal - mmTotal);
  const savingsPct = slackTotal > 0 ? (savings / slackTotal) * 100 : 0;

  // Build bar heights relative to slack monthly (max ~12.5 * users scales slackMonthly;
  // mm rarely above ~200). We chart annualized spend side-by-side.
  const slackYear = slackMonthly * 12;
  const mmYear = mmMonthly * 12;
  const maxYear = Math.max(slackYear, mmYear, 1);

  const slackBarPct = (slackYear / maxYear) * 100;
  const mmBarPct = (mmYear / maxYear) * 100;

  return (
    <div className="sm-viz-container">
      <div className="sm-viz-header">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-400/20 text-emerald-400">
            <DollarSign className="h-3.5 w-3.5" />
          </div>
          <span className="text-[10px] md:text-[11px] font-mono text-emerald-400 tracking-widest uppercase">
            Cost Compounder
          </span>
          <span className="text-[10px] md:text-[11px] text-slate-500 font-mono">
            · Slack vs self-hosted Mattermost
          </span>
        </div>
      </div>

      <div className="p-5 md:p-8 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 md:gap-10">
        {/* LEFT: controls */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">Users</span>
              <span className="text-2xl md:text-3xl font-black text-white tabular-nums">
                {users.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={2000}
              step={5}
              value={users}
              onChange={(e) => setUsers(parseInt(e.target.value, 10))}
              className="sm-range w-full"
              aria-label="User count"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-600 uppercase tracking-widest pt-1">
              <span>5</span>
              <span>40</span>
              <span>340</span>
              <span>1,000</span>
              <span>2k</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">Slack plan</span>
            <div className="flex gap-1 p-1 bg-black/40 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => setPlan("pro")}
                className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-bold tracking-tight uppercase transition-all ${plan === "pro" ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" : "text-slate-500 hover:text-slate-300"}`}
              >
                Pro
              </button>
              <button
                type="button"
                onClick={() => setPlan("business")}
                className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-bold tracking-tight uppercase transition-all ${plan === "business" ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" : "text-slate-500 hover:text-slate-300"}`}
              >
                Business+
              </button>
            </div>
            <p className="text-[10px] font-mono text-slate-600">
              ${SLACK_PLAN_PRICE[plan].toFixed(2)}/user/month list
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">Horizon</span>
              <span className="text-lg font-black text-white tabular-nums">{years} {years === 1 ? "year" : "years"}</span>
            </div>
            <div className="flex gap-1 p-1 bg-black/40 rounded-xl border border-white/5">
              {[1, 3, 5].map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYears(y)}
                  className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-bold tracking-tight uppercase transition-all ${years === y ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" : "text-slate-500 hover:text-slate-300"}`}
                >
                  {y}y
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: bars + savings */}
        <div className="space-y-6">
          <div className="space-y-5">
            <CostBar
              label={SLACK_PLAN_LABEL[plan]}
              sub={`${formatCurrency(slackMonthly)} / month`}
              total={slackYear}
              pct={slackBarPct}
              color="from-purple-500 via-fuchsia-500 to-rose-500"
              tone="purple"
            />
            <CostBar
              label="Self-Hosted Mattermost"
              sub={`${formatCurrency(mmMonthly)} / month (Hetzner + Cloudflare + Postmark + R2)`}
              total={mmYear}
              pct={mmBarPct}
              color="from-cyan-500 via-teal-500 to-emerald-500"
              tone="emerald"
            />
          </div>

          <motion.div
            layout={!prefersReducedMotion}
            className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/5 p-5"
          >
            <div className="absolute top-3 right-3 opacity-10">
              <Sparkles className="w-16 h-16 text-emerald-300" />
            </div>
            <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-[0.2em] mb-1">
              {years}-year savings
            </p>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-4xl md:text-5xl font-black text-white tabular-nums tracking-tight">
                {formatCurrency(savings)}
              </span>
              <span className="text-sm font-bold text-emerald-300 tabular-nums">
                {savingsPct.toFixed(1)}% lower
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {users < 50
                ? "Under 50 users the gap is modest. The migration makes sense mainly for compliance, ownership, or to avoid the next price hike."
                : users < 250
                  ? "Around this scale the savings start covering real payroll. The agent does the work; you read reports."
                  : users < 1000
                    ? "At this scale Slack is a five-figure annual line item. Self-hosting drops it to a rounding error on the infra bill."
                    : "Past 1,000 users the absolute savings are so large that one focused migration week pays for several engineering headcount."}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function CostBar({
  label,
  sub,
  total,
  pct,
  color,
  tone,
}: {
  label: string;
  sub: string;
  total: number;
  pct: number;
  color: string;
  tone: "purple" | "emerald";
}) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline gap-4">
        <div className="min-w-0">
          <p className={`text-[11px] font-mono uppercase tracking-[0.2em] ${tone === "purple" ? "text-purple-300" : "text-emerald-300"}`}>
            {label}
          </p>
          <p className="text-[10px] text-slate-500 font-mono truncate">{sub}</p>
        </div>
        <span className="text-xl md:text-2xl font-black text-white tabular-nums whitespace-nowrap">
          {formatCurrency(total)}
          <span className="text-xs text-slate-500 font-normal">/yr</span>
        </span>
      </div>
      <div className="relative h-3 bg-white/[0.04] rounded-full overflow-hidden border border-white/5">
        <motion.div
          className={`h-full bg-gradient-to-r ${color} rounded-full shadow-[0_0_16px_rgba(255,255,255,0.12)]`}
          initial={prefersReducedMotion ? false : { width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
        />
      </div>
    </div>
  );
}

// ============================================================
// 2. PHASE PIPELINE MAP
// Two-row interactive stage chart; click a stage for details
// ============================================================

type StageKey = string;

type Stage = {
  key: StageKey;
  label: string;
  title: string;
  summary: string;
  icon: typeof Package;
  accent: "purple" | "cyan" | "emerald";
  destructive?: boolean;
};

const PHASE1_STAGES: Stage[] = [
  { key: "p1-setup", label: "setup", title: "setup", summary: "Materialize the workdir tree, validate config, run doctor.sh, confirm every required tool resolves.", icon: TerminalSquare, accent: "purple" },
  { key: "p1-export", label: "export", title: "export", summary: "Pull the Slack workspace content: either drive the admin UI via Playwright (Track A) or walk the authenticated view with slackdump (Track B). Every artifact is SHA-256 hashed.", icon: FileArchive, accent: "purple" },
  { key: "p1-enrich", label: "enrich", title: "enrich", summary: "Download every referenced file before its Slack link expires, resolve Slack user IDs to emails, pull custom emoji, and extract sidecar content (canvases, lists, admin CSVs).", icon: Sparkles, accent: "purple" },
  { key: "p1-transform", label: "transform", title: "transform", summary: "mmetl converts the enriched ZIP into Mattermost's JSONL bulk-import format, mapping users by email and preserving thread structure.", icon: GitBranch, accent: "purple" },
  { key: "p1-package", label: "package", title: "package", summary: "Patch the JSONL (emoji objects first, sidecar archive channels, archive-channel memberships), then zip the JSONL + attachments + emoji into the canonical mattermost-bulk-import.zip.", icon: Package, accent: "purple" },
  { key: "p1-verify", label: "verify", title: "verify", summary: "Five validators: manifest hashes, JSONL ordering, enrichment completeness, message-count reconciliation, integration inventory. Plus a secret scanner over all reports.", icon: ShieldCheck, accent: "purple" },
  { key: "p1-handoff", label: "handoff", title: "handoff", summary: "Emit handoff.md, handoff.json, and unresolved-gaps.md. The final ZIP's SHA-256 is baked into the handoff — Phase 2 will refuse a bundle whose hash doesn't match.", icon: FileCheck, accent: "purple" },
];

const PHASE2_STAGES: Stage[] = [
  { key: "p2-intake", label: "intake", title: "intake", summary: "Snapshot Phase 1's handoff + final ZIP into Phase 2's workdir, verify the claimed hash matches the ZIP on disk, confirm sidecar channels are declared.", icon: FileCheck, accent: "cyan" },
  { key: "p2-render", label: "render-config", title: "render-config", summary: "Emit a Mattermost config.json (MaxPostSize 16383, EnableOpenServer true, SMTP block), an Nginx vhost with proper WebSocket upgrade, and a validation report.", icon: Layers, accent: "cyan" },
  { key: "p2-edge", label: "edge", title: "edge", summary: "Talk to Cloudflare's API: create an orange-clouded A record, generate a 15-year Origin CA cert, optionally add a grey-clouded record for the Calls plugin's UDP traffic.", icon: Cloud, accent: "cyan" },
  { key: "p2-provision", label: "provision", title: "provision", summary: "SSH to the target and install Nginx, UFW, fail2ban, unattended-upgrades, optionally Postgres. Harden SSH, open only 22/80/443/8443.", icon: ServerCog, accent: "cyan" },
  { key: "p2-deploy", label: "deploy", title: "deploy", summary: "Install Mattermost via apt (or Docker for staging), drop in the rendered config, install the TLS cert, enable and start the service.", icon: Upload, accent: "cyan" },
  { key: "p2-verifylive", label: "verify-live", title: "verify-live", summary: "Three probes with retries: /api/v4/system/ping returns 200, WebSocket upgrades with 101, and STARTTLS to the configured SMTP server succeeds.", icon: Radar, accent: "cyan" },
  { key: "p2-staging", label: "staging", title: "staging", summary: "Full import on a throwaway staging target. Upload the ZIP, kick off the import job, tail progress, compare observed counts against the handoff. Fails-closed if anything drifts.", icon: PlayCircle, accent: "cyan" },
  { key: "p2-restore", label: "restore", title: "restore", summary: "Optional drill: pg_restore the backup into a scratch DB and confirm tables populate. An unrestored backup is wishful thinking, not a backup.", icon: HardDrive, accent: "cyan" },
  { key: "p2-ready", label: "ready", title: "ready", summary: "The fail-closed gate. Reads every prior report plus ROLLBACK_OWNER. Emits cutover-readiness.json with status: ready or status: blocked. No 'yellow' state.", icon: Lock, accent: "emerald" },
  { key: "p2-cutover", label: "cutover", title: "cutover", summary: "Production import, smoke test, reconciliation, and activation proof (triggers a real password-reset, confirms the link arrives). Idempotent — safe to re-run.", icon: Zap, accent: "emerald", destructive: true },
];

function stageToneClasses(accent: Stage["accent"], active: boolean) {
  const base = {
    purple: {
      bg: active ? "bg-purple-500/15" : "bg-purple-500/5",
      border: active ? "border-purple-400/60" : "border-purple-500/20",
      text: "text-purple-200",
      icon: "text-purple-300",
      glow: active ? "shadow-[0_0_24px_rgba(168,85,247,0.25)]" : "",
    },
    cyan: {
      bg: active ? "bg-cyan-500/15" : "bg-cyan-500/5",
      border: active ? "border-cyan-400/60" : "border-cyan-500/20",
      text: "text-cyan-200",
      icon: "text-cyan-300",
      glow: active ? "shadow-[0_0_24px_rgba(6,182,212,0.25)]" : "",
    },
    emerald: {
      bg: active ? "bg-emerald-500/15" : "bg-emerald-500/5",
      border: active ? "border-emerald-400/60" : "border-emerald-500/20",
      text: "text-emerald-200",
      icon: "text-emerald-300",
      glow: active ? "shadow-[0_0_24px_rgba(16,185,129,0.25)]" : "",
    },
  } as const;
  return base[accent];
}

export function PhasePipelineViz() {
  const [selected, setSelected] = useState<StageKey>("p2-ready");

  const stage = useMemo(() => {
    const all = [...PHASE1_STAGES, ...PHASE2_STAGES];
    return all.find((s) => s.key === selected) ?? all[0];
  }, [selected]);

  const StageIcon = stage.icon;
  const stageTone = stageToneClasses(stage.accent, true);

  return (
    <div className="sm-viz-container">
      <div className="sm-viz-header">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-400/20 text-cyan-400">
            <GitBranch className="h-3.5 w-3.5" />
          </div>
          <span className="text-[10px] md:text-[11px] font-mono text-cyan-400 tracking-widest uppercase">
            Two-Phase Pipeline
          </span>
          <span className="text-[10px] md:text-[11px] text-slate-500 font-mono">
            · tap a stage
          </span>
        </div>
      </div>

      <div className="p-5 md:p-8 space-y-6 md:space-y-8">
        <StageRow
          title="Phase 1 · extraction"
          subtitle="workstation · reads Slack, writes a hashed bundle"
          stages={PHASE1_STAGES}
          selected={selected}
          onSelect={setSelected}
        />

        <div className="flex items-center gap-3 justify-center text-slate-600">
          <div className="h-px w-10 md:w-20 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
          <ArrowRightCircle className="w-5 h-5 text-slate-500" />
          <div className="h-px w-10 md:w-20 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
        </div>

        <StageRow
          title="Phase 2 · setup, rehearse, cut over"
          subtitle="same workstation, SSH to target · provisions Mattermost, imports, validates, flips the switch"
          stages={PHASE2_STAGES}
          selected={selected}
          onSelect={setSelected}
        />

        {/* Detail panel */}
        <motion.div
          layout
          className={`rounded-2xl border p-5 md:p-6 transition-all ${stageTone.bg} ${stageTone.border} ${stageTone.glow}`}
        >
          <div className="flex items-start gap-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${stageTone.border} ${stageTone.bg}`}>
              <StageIcon className={`w-5 h-5 ${stageTone.icon}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1.5">
                <h4 className="text-base md:text-lg font-bold text-white tracking-tight">
                  <span className="font-mono text-[13px] md:text-[14px]">{stage.title}</span>
                </h4>
                {stage.destructive && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[9px] font-mono uppercase tracking-[0.2em] text-amber-300">
                    <AlertTriangle className="w-3 h-3" />
                    destructive · approval-gated
                  </span>
                )}
              </div>
              <p className="text-sm md:text-[15px] text-slate-300 leading-relaxed">
                {stage.summary}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StageRow({
  title,
  subtitle,
  stages,
  selected,
  onSelect,
}: {
  title: string;
  subtitle: string;
  stages: Stage[];
  selected: StageKey;
  onSelect: (k: StageKey) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">{title}</p>
        <p className="text-[10px] text-slate-600 font-mono">{subtitle}</p>
      </div>
      <div className="relative">
        {/* Connector line */}
        <div className="absolute top-1/2 left-3 right-3 h-px bg-gradient-to-r from-white/5 via-white/15 to-white/5 pointer-events-none" />
        <div className="relative flex gap-1.5 md:gap-2 overflow-x-auto sm-scroller snap-x snap-mandatory pb-2 -mx-1 px-1">
          {stages.map((s) => {
            const isActive = s.key === selected;
            const tone = stageToneClasses(s.accent, isActive);
            const Icon = s.icon;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => onSelect(s.key)}
                className={`relative shrink-0 snap-start min-w-[96px] md:min-w-[108px] flex flex-col items-center gap-1.5 rounded-xl border px-2.5 py-2.5 transition-all ${tone.bg} ${tone.border} ${tone.glow} ${isActive ? "scale-[1.04]" : "hover:scale-[1.02]"}`}
                aria-pressed={isActive}
              >
                <Icon className={`w-4 h-4 ${tone.icon}`} />
                <span className={`text-[10px] md:text-[11px] font-mono uppercase tracking-tight ${tone.text}`}>
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 3. DATA PRESERVATION MATRIX
// Filterable grid of Slack features + disposition on Mattermost
// ============================================================

type Disposition = "native" | "sidecar" | "unrecoverable";

type Feature = {
  name: string;
  disposition: Disposition;
  pro?: Disposition; // overridden disposition on Pro plan (partial view)
  note: string;
};

const FEATURES: Feature[] = [
  { name: "Public channel messages", disposition: "native", note: "Every plan." },
  { name: "Private channel messages", disposition: "native", pro: "sidecar", note: "Business+: native. Pro: only if the token's account is a member." },
  { name: "Direct messages", disposition: "native", pro: "sidecar", note: "Business+: native. Pro: only DMs the token's user participates in." },
  { name: "Group DMs (mpim)", disposition: "native", pro: "sidecar", note: "Same as DMs." },
  { name: "Threads & thread replies", disposition: "native", note: "thread_ts preserved; JSONL validator blocks orphans." },
  { name: "Reactions (unicode)", disposition: "native", note: "Fully preserved." },
  { name: "Reactions (custom emoji)", disposition: "native", note: "Depends on mmetl mapping the custom name; drops listed in the reconciliation report." },
  { name: "File attachments", disposition: "native", note: "Enrich stage downloads bytes before Slack's links expire." },
  { name: "Pinned messages", disposition: "native", note: "Carried over." },
  { name: "Channel topic + purpose", disposition: "native", note: "Applied at import time." },
  { name: "Custom emoji images", disposition: "native", note: "export-custom-emoji.py pulls and repackages, including aliases." },
  { name: "Channel bookmarks (bar)", disposition: "unrecoverable", note: "Rebuild in Mattermost's channel header." },
  { name: "Canvases", disposition: "sidecar", note: "slack-canvases-archive channel; one post per canvas with HTML attachment." },
  { name: "Lists", disposition: "sidecar", note: "slack-lists-archive channel; JSON attachment." },
  { name: "Channel-audit CSV", disposition: "sidecar", note: "slack-export-admin channel." },
  { name: "Workflow Builder automations", disposition: "unrecoverable", note: "JSON preserved as sidecar; rebuild as Playbooks or slash commands." },
  { name: "Slackbot replies", disposition: "unrecoverable", note: "Rebuild as Mattermost bot with keyword triggers." },
  { name: "Saved / Later items", disposition: "unrecoverable", note: "Per-user; ask users to re-save after activation." },
  { name: "Scheduled messages", disposition: "unrecoverable", note: "Not in Slack's export. Tell users to re-schedule." },
  { name: "Huddle recordings", disposition: "unrecoverable", note: "Huddles don't export." },
  { name: "Slack Connect (partner msgs)", disposition: "unrecoverable", note: "Only your org's side of the conversation moves." },
  { name: "Message edit history", disposition: "unrecoverable", note: "Slack exports final text only." },
  { name: "Bot / app messages", disposition: "native", note: "As System user unless Integrations Override Usernames is enabled." },
];

const DISPOSITION_META: Record<Disposition, { label: string; color: string; icon: typeof CheckCircle2; badgeBg: string; badgeBorder: string; dotColor: string }> = {
  native: {
    label: "Native",
    color: "text-emerald-300",
    icon: CheckCircle2,
    badgeBg: "bg-emerald-500/10",
    badgeBorder: "border-emerald-500/30",
    dotColor: "bg-emerald-400",
  },
  sidecar: {
    label: "Sidecar",
    color: "text-cyan-300",
    icon: FileArchive,
    badgeBg: "bg-cyan-500/10",
    badgeBorder: "border-cyan-500/30",
    dotColor: "bg-cyan-400",
  },
  unrecoverable: {
    label: "Unrecoverable",
    color: "text-amber-300",
    icon: AlertTriangle,
    badgeBg: "bg-amber-500/10",
    badgeBorder: "border-amber-500/30",
    dotColor: "bg-amber-400",
  },
};

export function DataPreservationMatrixViz() {
  const [planTier, setPlanTier] = useState<"business" | "pro">("business");
  const [filter, setFilter] = useState<Disposition | "all">("all");

  const rows = useMemo(() => {
    return FEATURES.map((f) => ({
      ...f,
      effective: planTier === "pro" && f.pro ? f.pro : f.disposition,
    })).filter((f) => (filter === "all" ? true : f.effective === filter));
  }, [planTier, filter]);

  const counts = useMemo(() => {
    const base = FEATURES.map((f) => (planTier === "pro" && f.pro ? f.pro : f.disposition));
    return {
      native: base.filter((d) => d === "native").length,
      sidecar: base.filter((d) => d === "sidecar").length,
      unrecoverable: base.filter((d) => d === "unrecoverable").length,
    };
  }, [planTier]);

  return (
    <div className="sm-viz-container">
      <div className="sm-viz-header">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-400/20 text-cyan-400">
            <Layers className="h-3.5 w-3.5" />
          </div>
          <span className="text-[10px] md:text-[11px] font-mono text-cyan-400 tracking-widest uppercase">
            Data Preservation Matrix
          </span>
          <span className="text-[10px] md:text-[11px] text-slate-500 font-mono">
            · what survives, what becomes a sidecar, what you rebuild
          </span>
        </div>
      </div>

      <div className="p-5 md:p-8 space-y-5">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex p-1 bg-black/40 rounded-xl border border-white/5 text-[10px] font-bold uppercase tracking-tight">
            <button
              type="button"
              onClick={() => setPlanTier("business")}
              className={`px-3 py-2 rounded-lg transition-all ${planTier === "business" ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" : "text-slate-500 hover:text-slate-300"}`}
            >
              Business+
            </button>
            <button
              type="button"
              onClick={() => setPlanTier("pro")}
              className={`px-3 py-2 rounded-lg transition-all ${planTier === "pro" ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" : "text-slate-500 hover:text-slate-300"}`}
            >
              Pro (slackdump)
            </button>
          </div>

          <div className="flex gap-2 flex-wrap">
            {(["all", "native", "sidecar", "unrecoverable"] as const).map((f) => {
              const active = filter === f;
              const count = f === "all" ? FEATURES.length : counts[f];
              const color = f === "all" ? "slate" : f === "native" ? "emerald" : f === "sidecar" ? "cyan" : "amber";
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full border text-[10px] font-mono uppercase tracking-widest transition-all ${active
                    ? color === "slate"
                      ? "bg-white/10 border-white/20 text-white"
                      : color === "emerald"
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
                        : color === "cyan"
                          ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-200"
                          : "bg-amber-500/15 border-amber-500/40 text-amber-200"
                    : "bg-transparent border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20"
                    }`}
                >
                  {f === "all" ? "All" : DISPOSITION_META[f].label} · {count}
                </button>
              );
            })}
          </div>
        </div>

        {/* Rows */}
        <div className="grid grid-cols-1 gap-2">
          <AnimatePresence initial={false}>
            {rows.map((f) => {
              const disposition = f.effective;
              const meta = DISPOSITION_META[disposition];
              const Icon = meta.icon;
              const downgraded = planTier === "pro" && !!f.pro && f.pro !== f.disposition;
              return (
                <motion.div
                  key={f.name}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className={`group flex items-start gap-3 px-3 py-3 md:py-3.5 rounded-xl border ${meta.badgeBorder} ${meta.badgeBg} hover:brightness-110 transition-all`}
                >
                  <div className={`shrink-0 mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg border ${meta.badgeBorder} ${meta.badgeBg}`}>
                    <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <p className="text-sm font-semibold text-white">{f.name}</p>
                      <span className={`text-[9px] font-mono uppercase tracking-widest ${meta.color}`}>
                        {meta.label}
                      </span>
                      {downgraded && (
                        <span className="text-[9px] font-mono uppercase tracking-widest text-amber-300/80">
                          · downgraded on Pro
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-slate-400 leading-relaxed mt-1">
                      {f.note}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 4. CUTOVER APPROVAL STREAM
// Play / pause a simulated minute-by-minute cutover, see the agent
// ask for approvals and the import progress stream
// ============================================================

type CutoverEvent =
  | { t: string; kind: "narration"; body: string }
  | { t: string; kind: "approval"; cmd: string; why: string; verdict: "approve" | "deny"; tone?: "normal" | "destructive" }
  | { t: string; kind: "log"; body: string }
  | { t: string; kind: "status"; body: string; tone: "neutral" | "success" | "warn" | "danger" };

const CUTOVER_SCRIPT: CutoverEvent[] = [
  { t: "T −60m", kind: "narration", body: "You paste: “Run Phase 2 stage ready against production and show me the readiness score.”" },
  { t: "T −60m", kind: "log", body: "ready: intake…ok  live…ok  staging…ok  smoke…ok  reconciliation…ok  restore…ok  ROLLBACK_OWNER…“Jane Admin <jane@acme.com>”" },
  { t: "T −60m", kind: "status", body: "cutover-readiness.json → status: ready", tone: "success" },
  { t: "T −15m", kind: "narration", body: "You flip Slack to read-only in the admin UI. Post the freeze notice from the comms kit into #general." },
  { t: "T = 0",  kind: "narration", body: "You paste: “Run Phase 2 stage cutover against production. Pause before any destructive step and explain it.”" },
  { t: "T +0",   kind: "approval", cmd: "ssh deploy@chat.acme.com 'sudo systemctl status mattermost'", why: "Sanity-check the service on the target.", verdict: "approve" },
  { t: "T +1",   kind: "approval", cmd: "mmctl auth login --url https://chat.acme.com --username admin", why: "Authenticate as the Mattermost sysadmin.", verdict: "approve" },
  { t: "T +2",   kind: "approval", cmd: "mmctl import upload mattermost-bulk-import.zip", why: "Stream the 22 GB bundle to the server's import directory.", verdict: "approve" },
  { t: "T +5",   kind: "approval", cmd: "mmctl import process <uploaded-filename>", why: "Kick off the idempotent import job. Moment of commit.", verdict: "approve", tone: "destructive" },
  { t: "T +6",   kind: "log", body: "{ \"state\": \"pending\", \"progress\": 0.00 }" },
  { t: "T +9",   kind: "log", body: "{ \"state\": \"running\", \"progress\": 0.12, \"posts_imported\": 154000 }" },
  { t: "T +14",  kind: "log", body: "{ \"state\": \"running\", \"progress\": 0.45, \"posts_imported\": 578000 }" },
  { t: "T +21",  kind: "log", body: "{ \"state\": \"running\", \"progress\": 0.86, \"posts_imported\": 1105000 }" },
  { t: "T +26",  kind: "log", body: "{ \"state\": \"success\", \"progress\": 1.00, \"posts_imported\": 1284903 }" },
  { t: "T +27",  kind: "approval", cmd: "psql \"$POSTGRES_DSN\" -c 'SELECT COUNT(*) FROM Users'", why: "Count imported users for the reconciliation.", verdict: "approve" },
  { t: "T +28",  kind: "log", body: "reconcile-handoff-vs-import.py → 337 users / 142 channels / 1,284,903 posts · diffs: []" },
  { t: "T +29",  kind: "log", body: "activation: sending password-reset to admin@acme.com · link received: true" },
  { t: "T +30",  kind: "status", body: "cutover-status.2026-04-22T14-31-04Z.json → status: success", tone: "success" },
  { t: "T +31",  kind: "narration", body: "Send the activation comms template. Monitor the help desk. You're done." },
];

export function CutoverSimulatorViz() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const events = CUTOVER_SCRIPT;
  const visible = events.slice(0, index);
  const atEnd = index >= events.length;

  useEffect(() => {
    if (!playing || atEnd) return;
    const id = setTimeout(() => setIndex((i) => i + 1), 1200);
    return () => clearTimeout(id);
  }, [playing, index, atEnd]);

  const reset = useCallback(() => {
    setIndex(0);
    setPlaying(false);
  }, []);

  const progress = events.length === 0 ? 0 : index / events.length;

  return (
    <div className="sm-viz-container">
      <div className="sm-viz-header flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-400/20 text-emerald-400">
            <Zap className="h-3.5 w-3.5" />
          </div>
          <span className="text-[10px] md:text-[11px] font-mono text-emerald-400 tracking-widest uppercase">
            Cutover Simulator
          </span>
          <span className="text-[10px] md:text-[11px] text-slate-500 font-mono">
            · T −60m to T +30m, compressed
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (atEnd) reset();
              else setPlaying((p) => !p);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-widest text-white hover:bg-white/10 transition-colors"
          >
            {atEnd ? (
              <>
                <CircleDashed className="w-3.5 h-3.5" />
                Restart
              </>
            ) : playing ? (
              <>
                <PauseCircle className="w-3.5 h-3.5" />
                Pause
              </>
            ) : (
              <>
                <PlayCircle className="w-3.5 h-3.5" />
                Play
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => Math.min(events.length, i + 1))}
            disabled={atEnd}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-widest text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Step
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="px-5 md:px-8 pt-4">
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={prefersReducedMotion ? false : { width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.4 }}
            className="h-full bg-gradient-to-r from-purple-500 via-cyan-500 to-emerald-500"
          />
        </div>
      </div>

      <div className="p-5 md:p-8 pt-4 grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">
        {/* Event log */}
        <div className="bg-black/50 rounded-2xl border border-white/10 p-4 md:p-5 min-h-[260px] md:min-h-[340px]">
          <AnimatePresence initial={false}>
            {visible.length === 0 ? (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-slate-500 text-sm font-mono"
              >
                Press <span className="text-white">play</span> to watch a compressed cutover stream — the agent narrates, asks approvals, and tails the import job.
              </motion.p>
            ) : (
              visible.map((evt, i) => <EventRow key={i} evt={evt} />)
            )}
          </AnimatePresence>
        </div>

        {/* Rules panel */}
        <div className="space-y-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 mb-1.5">
              Approval rule
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              Use <span className="text-white font-semibold">Approve once</span>, not <span className="text-amber-300">Approve for the session</span>, during cutover. You want to read each destructive command.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-300 mb-1.5">
              Idempotent
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              If the import gets interrupted, re-run <span className="font-mono text-white">cutover</span>. Mattermost de-dupes on message ID; no double posts.
            </p>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-300 mb-1.5">
              If a step fails
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              Fixable in place → fix and re-run. Data loss or state corruption → pass <span className="font-mono text-white">ROLLBACK_CONFIRMATION=I_UNDERSTAND_THIS_RESTORES_BACKUPS</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventRow({ evt }: { evt: CutoverEvent }) {
  const base: Record<string, ReactNode> = {};
  if (evt.kind === "narration") {
    base.body = (
      <p className="text-slate-300 leading-relaxed">{evt.body}</p>
    );
  } else if (evt.kind === "approval") {
    const destructive = evt.tone === "destructive";
    base.body = (
      <div className={`rounded-lg border p-3 ${destructive ? "border-amber-500/30 bg-amber-500/5" : "border-white/10 bg-white/[0.02]"}`}>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-[0.2em] ${destructive ? "bg-amber-500/15 border border-amber-500/40 text-amber-200" : "bg-purple-500/15 border border-purple-500/30 text-purple-200"}`}>
            {destructive ? <AlertTriangle className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
            {destructive ? "destructive" : "approval"}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-[0.2em] ${evt.verdict === "approve" ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-200" : "bg-rose-500/15 border border-rose-500/30 text-rose-200"}`}>
            {evt.verdict === "approve" ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
            {evt.verdict}
          </span>
        </div>
        <pre className="text-[11px] md:text-[12px] font-mono text-white/90 whitespace-pre-wrap break-all leading-relaxed mb-1">
          $ {evt.cmd}
        </pre>
        <p className="text-[11px] text-slate-400 leading-relaxed">{evt.why}</p>
      </div>
    );
  } else if (evt.kind === "log") {
    base.body = (
      <pre className="text-[11px] md:text-[12px] font-mono text-cyan-200/90 bg-cyan-500/[0.04] border border-cyan-500/10 rounded-md px-2.5 py-1.5 whitespace-pre-wrap break-all">
        {evt.body}
      </pre>
    );
  } else {
    const toneClass =
      evt.tone === "success"
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
        : evt.tone === "warn"
          ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
          : evt.tone === "danger"
            ? "border-rose-500/30 bg-rose-500/10 text-rose-200"
            : "border-white/10 bg-white/5 text-slate-200";
    base.body = (
      <div className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-[11px] md:text-[12px] font-mono ${toneClass}`}>
        {evt.tone === "success" ? <MailCheck className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
        {evt.body}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="flex gap-3 py-1.5"
    >
      <span className="shrink-0 w-12 text-[10px] font-mono text-slate-500 tabular-nums pt-0.5">
        {evt.t}
      </span>
      <div className="min-w-0 flex-1 text-sm">
        {base.body}
      </div>
    </motion.div>
  );
}

// Re-export a convenient default grouping
export const SlackMigrationViz = {
  CostCompoundingViz,
  PhasePipelineViz,
  DataPreservationMatrixViz,
  CutoverSimulatorViz,
};
