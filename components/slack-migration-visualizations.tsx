"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
  type SVGProps,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowDown,
  CheckCircle2,
  CircleDashed,
  DollarSign,
  FileArchive,
  FileCheck,
  Files,
  GitBranch,
  Hash,
  Layers,
  Lock,
  PauseCircle,
  PlayCircle,
  Rocket,
  Server,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Upload,
  Users,
  Zap,
} from "lucide-react";

// ============================================================
// Shared helpers
// ============================================================

function cn(...args: (string | undefined | false | null)[]): string {
  return args.filter(Boolean).join(" ");
}

function formatCurrencyShort(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return `$${n.toFixed(0)}`;
}

function formatCurrencyAxis(n: number): string {
  if (n === 0) return "$0";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 10_000) return `$${Math.round(n / 1_000)}k`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  if (n >= 100) return `$${Math.round(n / 10) * 10}`;
  return `$${Math.round(n)}`;
}

// ============================================================
// 1. COST COMPOUNDER
// A cumulative time-series chart that shows Slack's spend
// compounding against Mattermost's near-flat line, with the
// savings area shaded between them and a horizon marker.
// ============================================================

type PlanKey = "pro" | "business";

const SLACK_PLAN_PRICE: Record<PlanKey, number> = {
  pro: 7.25,
  business: 12.5,
};

const SLACK_PLAN_LABEL: Record<PlanKey, string> = {
  pro: "Slack Pro",
  business: "Slack Business+",
};

function mattermostMonthly(users: number): number {
  if (users <= 50) return 22;
  if (users <= 250) return 72;
  if (users <= 1000) return 92;
  return 180 + Math.max(0, users - 1000) * 0.05;
}

const CHART_MAX_YEARS = 5;

type ChartDims = {
  w: number;
  h: number;
  padL: number;
  padR: number;
  padT: number;
  padB: number;
  plotW: number;
  plotH: number;
};

const CHART_DIMS: ChartDims = {
  w: 640,
  h: 340,
  padL: 68,
  padR: 30,
  padT: 40,
  padB: 48,
  plotW: 640 - 68 - 30,
  plotH: 340 - 40 - 48,
};

export function CostCompoundingViz() {
  const [users, setUsers] = useState(340);
  const [plan, setPlan] = useState<PlanKey>("business");
  const [horizonYears, setHorizonYears] = useState(3);

  const slackMonthly = users * SLACK_PLAN_PRICE[plan];
  const mmMonthly = mattermostMonthly(users);
  const setupFee = users > 50 ? 42 : 0;

  const slackYear = slackMonthly * 12;
  const mmYear = mmMonthly * 12;

  const horizonSlack = slackYear * horizonYears;
  const horizonMm = mmYear * horizonYears + setupFee;
  const horizonSavings = Math.max(0, horizonSlack - horizonMm);
  const horizonSavingsPct = horizonSlack > 0 ? (horizonSavings / horizonSlack) * 100 : 0;

  // "One year of Slack buys N years of Mattermost"
  const fundingRatio = mmYear > 0 ? slackYear / mmYear : 0;
  const fundingRatioDisplay =
    fundingRatio >= 100
      ? `${Math.round(fundingRatio)}`
      : fundingRatio >= 10
        ? fundingRatio.toFixed(0)
        : fundingRatio.toFixed(1);

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
            · cumulative spend over time
          </span>
        </div>
      </div>

      <div className="p-5 md:p-7 space-y-5 md:space-y-6">
        {/* Headline stat */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 md:gap-6">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-emerald-300 mb-1.5">
              One year of {SLACK_PLAN_LABEL[plan]} buys
            </p>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-5xl md:text-6xl font-black text-white tabular-nums tracking-tight leading-none">
                {fundingRatioDisplay}
              </span>
              <span className="text-base md:text-lg text-slate-400 tracking-tight">
                years of self-hosted Mattermost
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] px-4 py-3 md:py-3.5">
            <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-emerald-300 mb-1">
              Savings at horizon
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-black text-white tabular-nums tracking-tight">
                {formatCurrencyShort(horizonSavings)}
              </span>
              <span className="text-xs text-emerald-200 tabular-nums">
                · {horizonSavingsPct.toFixed(1)}% lower
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4 md:gap-5 items-end pb-1">
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">Users</span>
              <span className="text-xl font-black text-white tabular-nums">
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
            <div className="flex justify-between text-[9px] font-mono text-slate-600 uppercase tracking-widest pt-0.5">
              <span>5</span>
              <span>40</span>
              <span>340</span>
              <span>1,000</span>
              <span>2k</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] block">
              Slack plan
            </span>
            <div className="flex gap-1 p-1 bg-black/40 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => setPlan("pro")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-tight uppercase transition-all",
                  plan === "pro"
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                    : "text-slate-500 hover:text-slate-300",
                )}
              >
                Pro
              </button>
              <button
                type="button"
                onClick={() => setPlan("business")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-tight uppercase transition-all",
                  plan === "business"
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                    : "text-slate-500 hover:text-slate-300",
                )}
              >
                Business+
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] block">
              Horizon
            </span>
            <div className="flex gap-1 p-1 bg-black/40 rounded-xl border border-white/5">
              {[1, 3, 5].map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setHorizonYears(y)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-tight uppercase transition-all",
                    horizonYears === y
                      ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                      : "text-slate-500 hover:text-slate-300",
                  )}
                >
                  {y}y
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart */}
        <CostChart
          users={users}
          plan={plan}
          horizonYears={horizonYears}
          slackMonthly={slackMonthly}
          mmMonthly={mmMonthly}
          setupFee={setupFee}
        />

        {/* Legend */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] md:text-xs">
          <LegendPill color="purple" label={SLACK_PLAN_LABEL[plan]} detail={`${formatCurrencyShort(slackMonthly)} / month · ${formatCurrencyShort(slackYear)} / yr`} />
          <LegendPill color="emerald" label="Self-hosted Mattermost" detail={`${formatCurrencyShort(mmMonthly)} / month · ${formatCurrencyShort(mmYear)} / yr`} />
          <LegendPill color="amber" label="Cumulative savings" detail="area between the two lines" striped />
        </div>
      </div>
    </div>
  );
}

function LegendPill({
  color,
  label,
  detail,
  striped,
}: {
  color: "purple" | "emerald" | "amber";
  label: string;
  detail: string;
  striped?: boolean;
}) {
  const bg =
    color === "purple"
      ? "bg-purple-500"
      : color === "emerald"
        ? "bg-emerald-500"
        : "bg-amber-500";
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span
        className={cn(
          "inline-block w-4 h-1.5 rounded-full shrink-0",
          bg,
          striped && "opacity-50 bg-[repeating-linear-gradient(90deg,currentColor_0_3px,transparent_3px_6px)]",
        )}
      />
      <span className="font-semibold text-white truncate">{label}</span>
      <span className="text-slate-500 font-mono text-[10px] md:text-[11px] truncate">{detail}</span>
    </div>
  );
}

function CostChart({
  users,
  plan,
  horizonYears,
  slackMonthly,
  mmMonthly,
  setupFee,
}: {
  users: number;
  plan: PlanKey;
  horizonYears: number;
  slackMonthly: number;
  mmMonthly: number;
  setupFee: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const gradientId = useId();
  const chartYears = CHART_MAX_YEARS;

  const slackYear = slackMonthly * 12;
  const mmYear = mmMonthly * 12;

  // Domain
  const xMax = chartYears;
  const yMax = Math.max(slackYear * chartYears, mmYear * chartYears + setupFee, 1);

  const { w, h, padL, padT, plotW, plotH } = CHART_DIMS;

  const xOf = (t: number) => padL + (t / xMax) * plotW;
  const yOf = (v: number) => padT + plotH - (v / yMax) * plotH;

  // Points for each year, 0..chartYears
  const years = useMemo(() => Array.from({ length: chartYears + 1 }, (_, i) => i), [chartYears]);

  const slackPoints = years.map((t) => ({ x: xOf(t), y: yOf(slackYear * t) }));
  const mmPoints = years.map((t) => ({ x: xOf(t), y: yOf(mmYear * t + setupFee) }));

  const slackPath = pointsToPath(slackPoints);
  const mmPath = pointsToPath(mmPoints);

  // Savings area: slack path forward, then mm path reversed
  const savingsArea = `${slackPath} L${mmPoints[mmPoints.length - 1].x},${mmPoints[mmPoints.length - 1].y} ${mmPoints.slice().reverse().slice(1).map((p) => `L${p.x},${p.y}`).join(" ")} Z`;

  const horizonX = xOf(horizonYears);
  const horizonSlackY = yOf(slackYear * horizonYears);
  const horizonMmY = yOf(mmYear * horizonYears + setupFee);

  // Y-axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    y: padT + plotH - f * plotH,
    value: f * yMax,
  }));

  const initialAnim = prefersReducedMotion ? {} : { initial: { pathLength: 0 }, animate: { pathLength: 1 } };

  return (
    <div className="relative rounded-xl border border-white/10 bg-black/40 overflow-hidden">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="block w-full h-auto text-slate-500"
        role="img"
        aria-label={`Cumulative spend over ${chartYears} years for ${users} users`}
      >
        <defs>
          <linearGradient id={`${gradientId}-slack`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
          <linearGradient id={`${gradientId}-mm`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <linearGradient id={`${gradientId}-savings`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
            <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
          </linearGradient>
          <pattern id={`${gradientId}-stripe`} x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect x="0" y="0" width="6" height="6" fill="transparent" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="#10b981" strokeOpacity="0.18" strokeWidth="2" />
          </pattern>
        </defs>

        {/* Y gridlines */}
        {yTicks.map((tick, i) => (
          <g key={`y-${i}`}>
            <line
              x1={padL}
              x2={padL + plotW}
              y1={tick.y}
              y2={tick.y}
              stroke="currentColor"
              strokeOpacity="0.08"
              strokeDasharray={i === 0 ? undefined : "3 4"}
            />
            <text
              x={padL - 10}
              y={tick.y + 4}
              textAnchor="end"
              className="fill-slate-500"
              style={{ fontSize: 10, fontFamily: "ui-monospace, monospace" }}
            >
              {formatCurrencyAxis(tick.value)}
            </text>
          </g>
        ))}

        {/* X ticks */}
        {years.map((t) => (
          <g key={`x-${t}`}>
            <line
              x1={xOf(t)}
              x2={xOf(t)}
              y1={padT + plotH}
              y2={padT + plotH + 4}
              stroke="currentColor"
              strokeOpacity="0.25"
            />
            <text
              x={xOf(t)}
              y={padT + plotH + 20}
              textAnchor="middle"
              className="fill-slate-500"
              style={{ fontSize: 10, fontFamily: "ui-monospace, monospace" }}
            >
              {t === 0 ? "0" : `${t}y`}
            </text>
          </g>
        ))}

        {/* Savings fill */}
        <path d={savingsArea} fill={`url(#${gradientId}-savings)`} />
        <path d={savingsArea} fill={`url(#${gradientId}-stripe)`} />

        {/* Horizon marker (vertical line + band behind lines) */}
        <line
          x1={horizonX}
          x2={horizonX}
          y1={padT}
          y2={padT + plotH}
          stroke="#f59e0b"
          strokeOpacity="0.35"
          strokeDasharray="4 4"
        />
        <rect
          x={horizonX - 1}
          y={padT}
          width={2}
          height={plotH}
          fill="#f59e0b"
          fillOpacity="0.08"
        />

        {/* Slack line */}
        <motion.path
          d={slackPath}
          fill="none"
          stroke={`url(#${gradientId}-slack)`}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          {...initialAnim}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* MM line */}
        <motion.path
          d={mmPath}
          fill="none"
          stroke={`url(#${gradientId}-mm)`}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          {...initialAnim}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
        />

        {/* Dots on integer years */}
        {slackPoints.map((p, i) => (
          <circle
            key={`sd-${i}`}
            cx={p.x}
            cy={p.y}
            r={i === 0 ? 0 : 2.5}
            fill="#a855f7"
            stroke="#020204"
            strokeWidth="1.5"
          />
        ))}
        {mmPoints.map((p, i) => (
          <circle
            key={`md-${i}`}
            cx={p.x}
            cy={p.y}
            r={i === 0 ? 0 : 2.5}
            fill="#10b981"
            stroke="#020204"
            strokeWidth="1.5"
          />
        ))}

        {/* Horizon highlights */}
        <circle cx={horizonX} cy={horizonSlackY} r={5} fill="#f59e0b" stroke="#020204" strokeWidth="2" />
        <circle cx={horizonX} cy={horizonMmY} r={5} fill="#f59e0b" stroke="#020204" strokeWidth="2" />

        {/* Horizon labels — flip to the left of the marker when near the right edge */}
        {(() => {
          const LABEL_W = 118;
          const LABEL_H = 24;
          const flip = horizonX + 8 + LABEL_W > padL + plotW;
          const rectX = flip ? horizonX - 8 - LABEL_W : horizonX + 8;
          const textX = flip ? horizonX - LABEL_W + 4 : horizonX + 16;
          const slackLabelY = Math.max(padT + 4, horizonSlackY - 30);
          const slackTextY = slackLabelY + 16;
          const mmLabelY = Math.min(padT + plotH - 4 - LABEL_H, horizonMmY - 12);
          const mmTextY = mmLabelY + 16;
          return (
            <>
              <g>
                <rect
                  x={rectX}
                  y={slackLabelY}
                  width={LABEL_W}
                  height={LABEL_H}
                  rx={6}
                  fill="#1a0b22"
                  stroke="#a855f7"
                  strokeOpacity="0.5"
                />
                <text
                  x={textX}
                  y={slackTextY}
                  className="fill-purple-200"
                  style={{ fontSize: 11, fontFamily: "ui-monospace, monospace", fontWeight: 600 }}
                >
                  {`${formatCurrencyShort(slackYear * horizonYears)} · ${horizonYears}y`}
                </text>
              </g>
              <g>
                <rect
                  x={rectX}
                  y={mmLabelY}
                  width={LABEL_W}
                  height={LABEL_H}
                  rx={6}
                  fill="#06232b"
                  stroke="#10b981"
                  strokeOpacity="0.5"
                />
                <text
                  x={textX}
                  y={mmTextY}
                  className="fill-emerald-200"
                  style={{ fontSize: 11, fontFamily: "ui-monospace, monospace", fontWeight: 600 }}
                >
                  {`${formatCurrencyShort(mmYear * horizonYears + setupFee)} · ${horizonYears}y`}
                </text>
              </g>
            </>
          );
        })()}

        {/* "One year of Slack" reference line */}
        {slackYear < yMax && (
          <g opacity="0.7">
            <line
              x1={padL}
              x2={padL + plotW}
              y1={yOf(slackYear)}
              y2={yOf(slackYear)}
              stroke="#f43f5e"
              strokeOpacity="0.35"
              strokeDasharray="2 5"
            />
            <text
              x={padL + plotW - 6}
              y={yOf(slackYear) - 6}
              textAnchor="end"
              className="fill-rose-300"
              style={{ fontSize: 10, fontFamily: "ui-monospace, monospace", letterSpacing: "0.08em", textTransform: "uppercase" }}
            >
              {`1 yr ${plan === "business" ? "Business+" : "Pro"} = ${formatCurrencyShort(slackYear)}`}
            </text>
          </g>
        )}

        {/* Axis baseline */}
        <line
          x1={padL}
          x2={padL + plotW}
          y1={padT + plotH}
          y2={padT + plotH}
          stroke="currentColor"
          strokeOpacity="0.25"
        />
        {/* Y axis */}
        <line
          x1={padL}
          x2={padL}
          y1={padT}
          y2={padT + plotH}
          stroke="currentColor"
          strokeOpacity="0.15"
        />

        {/* X-axis title */}
        <text
          x={padL + plotW / 2}
          y={h - 6}
          textAnchor="middle"
          className="fill-slate-500"
          style={{ fontSize: 10, fontFamily: "ui-monospace, monospace", letterSpacing: "0.15em", textTransform: "uppercase" }}
        >
          cumulative spend · years from launch
        </text>
      </svg>
    </div>
  );
}

function pointsToPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");
}

// ============================================================
// 2. PHASE PIPELINE — artifact-evolution diagram
// Vertical chain of artifacts with stage edges between.
// Click any node or edge for details.
// ============================================================

type PipelineAccent = "purple" | "cyan" | "emerald" | "amber";

type PipelineNode = {
  kind: "artifact" | "system" | "gate";
  id: string;
  label: string;
  sub: string;
  size?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  accent: PipelineAccent;
  description: string;
  details: string[];
  hashSealed?: boolean;
  emphasis?: "normal" | "critical";
};

type PipelineEdge = {
  id: string; // edge id
  from: string;
  to: string;
  stages: string[];
  accent: PipelineAccent;
  description: string;
  /** Shell entry-point prefix for each stage; omit for human / post-cutover processes. */
  cmd?: "./migrate.sh" | "./operate.sh";
};

const PIPELINE_NODES: PipelineNode[] = [
  {
    kind: "system",
    id: "slack",
    label: "Your Slack Workspace",
    sub: "source of truth",
    icon: Hash,
    accent: "purple",
    description: "The live Slack workspace, untouched by the migration except for credentialed reads.",
    details: [
      "Phase 1 only reads; it never writes.",
      "Stays the source of truth until the operator flips it to read-only on cutover day.",
      "Downgraded to the cheapest read-only tier after T+7 days as an archive.",
    ],
  },
  {
    kind: "artifact",
    id: "raw-zip",
    label: "slack-export.zip",
    sub: "raw export + CSVs",
    size: "~12 GB",
    icon: FileArchive,
    accent: "purple",
    description: "Whatever Slack hands back when you kick off an admin export, plus the channel-audit and member-list CSVs.",
    details: [
      "Business+ → full workspace via Track A.",
      "Pro → slackdump's authenticated view via Track B (private channels and DMs blind-spot).",
      "manifest.raw.json records SHA-256 of every file.",
    ],
  },
  {
    kind: "artifact",
    id: "enriched-zip",
    label: "slack-export.enriched.zip",
    sub: "files baked in, emails resolved",
    size: "~20 GB",
    icon: Sparkles,
    accent: "purple",
    description: "The raw export with every file actually downloaded before Slack's links expired, user IDs resolved to emails, custom emoji repackaged, and sidecar content (canvases, lists, admin CSVs) extracted.",
    details: [
      "__uploads/F<id>/<filename> for every referenced file.",
      "users.json rewritten with real email addresses.",
      "Custom emoji pulled with aliases preserved.",
      "Sidecar bundle: canvases, lists, integration_logs.json.",
    ],
  },
  {
    kind: "artifact",
    id: "jsonl",
    label: "mattermost_import.jsonl",
    sub: "Mattermost's native import format",
    size: "~500 MB + 8 GB attachments",
    icon: Files,
    accent: "purple",
    description: "mmetl's output: one JSON object per line in a strict order (version, emoji, team, channel, user, post, direct_channel, direct_post).",
    details: [
      "thread_ts preserved for every reply.",
      "MaxPostSize bumped to 16,383 so long Slack messages don't truncate.",
      "--skip-empty-emails drops users with no address; MMETL_DEFAULT_EMAIL_DOMAIN fabricates one when you need to keep them.",
    ],
  },
  {
    kind: "artifact",
    id: "import-zip",
    label: "mattermost-bulk-import.zip",
    sub: "ready for mmctl",
    size: "~22 GB",
    icon: Layers,
    accent: "purple",
    description: "The canonical bundle: JSONL + attachments tree + emoji images + sidecar HTML/JSON, zipped.",
    details: [
      "Emoji objects patched to appear before the team line (mmctl requires this).",
      "Sidecar channels populated with their archive posts.",
      "Archive-channel memberships injected so everyone can see them.",
    ],
  },
  {
    kind: "gate",
    id: "handoff",
    label: "handoff.json",
    sub: "hash-sealed Phase 1 → Phase 2 contract",
    icon: FileCheck,
    accent: "emerald",
    hashSealed: true,
    description: "The evidence pack: final ZIP's SHA-256, manifests, counts of users/channels/posts, sidecar_channels[], and unresolved-gaps.md with every documented not-migrated item.",
    details: [
      "Phase 2 intake refuses any bundle whose hash does not match this.",
      "Generated by ./migrate.sh handoff; never hand-edited.",
      "What compliance reviewers read alongside the exported legal-approval email.",
    ],
  },
  {
    kind: "system",
    id: "staging",
    label: "Staging Mattermost",
    sub: "throwaway VPS, full-scale rehearsal",
    icon: PlayCircle,
    accent: "cyan",
    description: "A cheap second VPS that mirrors production. Runs the entire provision → deploy → import pipeline against a scratch target so you can watch counts match the handoff before you touch production.",
    details: [
      "Typically €4–10/mo Hetzner CX22 or Contabo VPS S — kept alive only during the rehearsal window.",
      "Proves the SSH + mmctl + DB plumbing works end-to-end.",
      "Cancelled after cutover is green; total cost under $10.",
    ],
  },
  {
    kind: "gate",
    id: "ready",
    label: "Fail-Closed Ready Gate",
    sub: "status: ready | blocked",
    icon: Lock,
    accent: "emerald",
    emphasis: "critical",
    description: "The only thing between every prior stage and the production import. Reads intake, config, live, staging, smoke, reconciliation, restore reports — plus ROLLBACK_OWNER. If any input is missing or stale, status is blocked. There is no yellow.",
    details: [
      "ROLLBACK_OWNER must be a named human (not a role, not an alias).",
      "Re-running the gate without fixing every blocker is a no-op.",
      "cutover-readiness.json + readiness-score.md are the evidence it emits.",
    ],
  },
  {
    kind: "system",
    id: "production",
    label: "Production Mattermost",
    sub: "chat.yourdomain.com",
    icon: ServerCog,
    accent: "cyan",
    description: "Mattermost 10.11+ behind Cloudflare, with Nginx doing WebSocket upgrades, Postgres local or managed, and SMTP wired to Postmark for password-reset emails.",
    details: [
      "Auto-rollback wraps every apt-install update.",
      "pg_dump → gzip → R2 / Storage Box nightly.",
      "Quarterly restore drill into SCRATCH_DB_URL keeps the backup loop tested.",
    ],
  },
  {
    kind: "system",
    id: "users",
    label: "Activated Users",
    sub: "/reset_password, one link each",
    icon: Users,
    accent: "emerald",
    description: "Users hit chat.yourdomain.com/reset_password, enter their Slack email, and their history is already waiting. No bulk-onboarding; no seat activation; no new passwords to remember.",
    details: [
      "Activation rate tracked via mmctl user list --all --json.",
      "T+48h sweep: temp passwords for anyone who didn't activate.",
      "T+7d: revoke Slack tokens, delete migration app, archive the workdir.",
    ],
  },
];

const PIPELINE_EDGES: PipelineEdge[] = [
  {
    id: "e-setup-export",
    from: "slack",
    to: "raw-zip",
    stages: ["setup", "export"],
    accent: "purple",
    cmd: "./migrate.sh",
    description: "Validate the workstation, kick off the Slack admin export (or slackdump's walk), hash every artifact as it lands.",
  },
  {
    id: "e-enrich",
    from: "raw-zip",
    to: "enriched-zip",
    stages: ["enrich"],
    accent: "purple",
    cmd: "./migrate.sh",
    description: "Download every referenced file before its Slack URL expires. Resolve user IDs to emails via users:read.email. Pull custom emoji. Extract canvases, lists, and the integration logs as sidecars.",
  },
  {
    id: "e-transform",
    from: "enriched-zip",
    to: "jsonl",
    stages: ["transform"],
    accent: "purple",
    cmd: "./migrate.sh",
    description: "mmetl maps users by email, preserves thread_ts, and emits Mattermost's JSONL + attachments tree in strict order.",
  },
  {
    id: "e-package",
    from: "jsonl",
    to: "import-zip",
    stages: ["package"],
    accent: "purple",
    cmd: "./migrate.sh",
    description: "Patch emoji objects before the team line, add sidecar archive channels with memberships, zip the bundle, hash it.",
  },
  {
    id: "e-verify-handoff",
    from: "import-zip",
    to: "handoff",
    stages: ["verify", "handoff"],
    accent: "emerald",
    cmd: "./migrate.sh",
    description: "Five validators (manifest, JSONL ordering, enrichment, reconciliation, integration inventory), a secret scanner, and the hash-sealed handoff.json contract.",
  },
  {
    id: "e-phase2-setup",
    from: "handoff",
    to: "staging",
    stages: ["intake", "render-config", "edge", "provision", "deploy", "verify-live", "staging"],
    accent: "cyan",
    cmd: "./operate.sh",
    description: "Phase 2 intake confirms the hash, renders Mattermost config + Nginx, wires Cloudflare, SSHes in to provision/deploy, probes the live stack, then does the full import against the staging VPS.",
  },
  {
    id: "e-restore-ready",
    from: "staging",
    to: "ready",
    stages: ["restore", "ready"],
    accent: "emerald",
    cmd: "./operate.sh",
    description: "Restore drill into SCRATCH_DB_URL proves backups actually restore. Readiness gate then reads every prior report + ROLLBACK_OWNER.",
  },
  {
    id: "e-cutover",
    from: "ready",
    to: "production",
    stages: ["cutover"],
    accent: "cyan",
    cmd: "./operate.sh",
    description: "Upload the 22 GB ZIP, kick off the import, tail progress, smoke-test counts, reconcile against the handoff, confirm a real password-reset email arrives. Idempotent.",
  },
  {
    id: "e-activate",
    from: "production",
    to: "users",
    stages: ["activation email", "T+48h nudge", "T+7d Slack-app revoke"],
    accent: "emerald",
    description: "No command runs here — the activation period is a week-long human process. SMTP delivers password-reset links; users activate with their Slack email; the admin nudges stragglers and eventually revokes the Slack migration app.",
  },
];

type PipelineSelection =
  | { kind: "node"; id: string }
  | { kind: "edge"; id: string };

function accentClasses(accent: PipelineAccent, active = false) {
  const palette = {
    purple: {
      ring: "border-purple-400/60",
      ringIdle: "border-purple-500/20",
      bg: "bg-purple-500/10",
      bgIdle: "bg-purple-500/5",
      text: "text-purple-200",
      textStrong: "text-purple-100",
      icon: "text-purple-300",
      glow: "shadow-[0_0_24px_rgba(168,85,247,0.22)]",
      pillBg: "bg-purple-500/15",
      pillBorder: "border-purple-500/30",
    },
    cyan: {
      ring: "border-cyan-400/60",
      ringIdle: "border-cyan-500/20",
      bg: "bg-cyan-500/10",
      bgIdle: "bg-cyan-500/5",
      text: "text-cyan-200",
      textStrong: "text-cyan-100",
      icon: "text-cyan-300",
      glow: "shadow-[0_0_24px_rgba(6,182,212,0.22)]",
      pillBg: "bg-cyan-500/15",
      pillBorder: "border-cyan-500/30",
    },
    emerald: {
      ring: "border-emerald-400/60",
      ringIdle: "border-emerald-500/20",
      bg: "bg-emerald-500/10",
      bgIdle: "bg-emerald-500/5",
      text: "text-emerald-200",
      textStrong: "text-emerald-100",
      icon: "text-emerald-300",
      glow: "shadow-[0_0_24px_rgba(16,185,129,0.22)]",
      pillBg: "bg-emerald-500/15",
      pillBorder: "border-emerald-500/30",
    },
    amber: {
      ring: "border-amber-400/60",
      ringIdle: "border-amber-500/20",
      bg: "bg-amber-500/10",
      bgIdle: "bg-amber-500/5",
      text: "text-amber-200",
      textStrong: "text-amber-100",
      icon: "text-amber-300",
      glow: "shadow-[0_0_24px_rgba(245,158,11,0.22)]",
      pillBg: "bg-amber-500/15",
      pillBorder: "border-amber-500/30",
    },
  } as const;
  const p = palette[accent];
  return {
    cardBorder: active ? p.ring : p.ringIdle,
    cardBg: active ? p.bg : p.bgIdle,
    text: p.text,
    textStrong: p.textStrong,
    icon: p.icon,
    glow: active ? p.glow : "",
    pillBg: p.pillBg,
    pillBorder: p.pillBorder,
  };
}

export function PhasePipelineViz() {
  const [selected, setSelected] = useState<PipelineSelection>({ kind: "node", id: "ready" });

  const flow = useMemo<Array<{ node: PipelineNode; edgeIn?: PipelineEdge }>>(() => {
    const byId = new Map(PIPELINE_NODES.map((n) => [n.id, n]));
    const edgesByTo = new Map(PIPELINE_EDGES.map((e) => [e.to, e]));
    return PIPELINE_NODES.map((n) => ({
      node: n,
      edgeIn: edgesByTo.get(n.id),
    })).filter((f) => byId.has(f.node.id));
  }, []);

  return (
    <div className="sm-viz-container">
      <div className="sm-viz-header">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-400/20 text-cyan-400">
            <GitBranch className="h-3.5 w-3.5" />
          </div>
          <span className="text-[10px] md:text-[11px] font-mono text-cyan-400 tracking-widest uppercase">
            Artifact Flow
          </span>
          <span className="text-[10px] md:text-[11px] text-slate-500 font-mono">
            · Slack → bytes on disk → Mattermost · tap to expand
          </span>
        </div>
      </div>

      <div className="p-5 md:p-7 relative">
        {/* Background rail */}
        <div className="absolute top-5 bottom-5 md:top-7 md:bottom-7 left-[38px] md:left-[60px] w-px bg-gradient-to-b from-purple-500/40 via-cyan-500/40 to-emerald-500/40 pointer-events-none" />

        <div className="flex flex-col gap-2.5">
          {flow.map(({ node, edgeIn }, idx) => (
            <div key={node.id} className="flex flex-col">
              {edgeIn && (
                <PipelineEdgeRow
                  edge={edgeIn}
                  active={selected.kind === "edge" && selected.id === edgeIn.id}
                  onSelect={() =>
                    setSelected((prev) =>
                      prev.kind === "edge" && prev.id === edgeIn.id
                        ? { kind: "node", id: node.id }
                        : { kind: "edge", id: edgeIn.id },
                    )
                  }
                  detail={
                    selected.kind === "edge" && selected.id === edgeIn.id ? (
                      <PipelineEdgeDetail edge={edgeIn} />
                    ) : undefined
                  }
                />
              )}
              <PipelineNodeRow
                node={node}
                active={selected.kind === "node" && selected.id === node.id}
                onSelect={() =>
                  setSelected((prev) =>
                    prev.kind === "node" && prev.id === node.id
                      ? prev
                      : { kind: "node", id: node.id },
                  )
                }
                isFirst={idx === 0}
                isLast={idx === flow.length - 1}
                detail={
                  selected.kind === "node" && selected.id === node.id ? (
                    <PipelineNodeDetail node={node} />
                  ) : undefined
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PipelineNodeRow({
  node,
  active,
  onSelect,
  isFirst,
  isLast,
  detail,
}: {
  node: PipelineNode;
  active: boolean;
  onSelect: () => void;
  isFirst: boolean;
  isLast: boolean;
  detail?: ReactNode;
}) {
  const cls = accentClasses(node.accent, active);
  const Icon = node.icon;

  const nodeKindLabel =
    node.kind === "artifact" ? "artifact" : node.kind === "system" ? "system" : "gate";

  return (
    <div className="relative flex items-stretch gap-3 md:gap-4 z-[1]">
      {/* Rail marker */}
      <div className="relative shrink-0 w-12 md:w-16 flex items-start justify-center pt-4">
        <motion.div
          layout
          className={cn(
            "relative z-[2] flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-full border-2 backdrop-blur-md transition-all",
            cls.cardBorder,
            cls.cardBg,
            active ? cls.glow : "",
            node.emphasis === "critical" && "ring-2 ring-emerald-400/20 ring-offset-2 ring-offset-[#020204]",
          )}
        >
          <Icon className={cn("w-5 h-5 md:w-5 md:h-5", cls.icon)} />
          {node.hashSealed && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 border border-[#020204] shadow-sm">
              <Lock className="w-2.5 h-2.5 text-[#020204]" />
            </span>
          )}
        </motion.div>
        {isFirst && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-mono uppercase tracking-[0.25em] text-purple-300 whitespace-nowrap">
            start
          </span>
        )}
        {isLast && (
          <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[9px] font-mono uppercase tracking-[0.25em] text-emerald-300 whitespace-nowrap">
            done
          </span>
        )}
      </div>

      {/* Card (+ expanding detail) */}
      <div className="flex-1 min-w-0 flex flex-col">
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={active}
          aria-expanded={active}
          className={cn(
            "text-left rounded-xl md:rounded-2xl border backdrop-blur-md px-4 py-3.5 md:px-5 md:py-4 transition-all group",
            cls.cardBg,
            cls.cardBorder,
            active ? cls.glow : "hover:bg-white/[0.04]",
            node.emphasis === "critical" && !active && "ring-1 ring-emerald-400/20",
            detail ? "rounded-b-none md:rounded-b-none border-b-0" : "",
          )}
        >
          <div className="flex items-start justify-between gap-3 mb-1.5 flex-wrap">
            <div className="min-w-0">
              <p className={cn("text-[9px] font-mono uppercase tracking-[0.22em] mb-0.5", cls.text)}>
                {nodeKindLabel}
                {node.emphasis === "critical" ? " · fail-closed" : ""}
              </p>
              <p className={cn("text-sm md:text-[15px] font-bold tracking-tight text-white")}>
                {node.label}
              </p>
            </div>
            {node.size && (
              <span className={cn(
                "shrink-0 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-mono tabular-nums",
                cls.pillBg,
                cls.pillBorder,
                cls.text,
              )}>
                {node.size}
              </span>
            )}
          </div>
          <p className="text-xs md:text-[13px] text-slate-400 leading-snug">{node.sub}</p>
        </button>

        <AnimatePresence initial={false}>
          {detail && (
            <motion.div
              key="detail"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "overflow-hidden rounded-b-xl md:rounded-b-2xl border border-t-0",
                cls.cardBorder,
                cls.cardBg,
              )}
            >
              <div className="px-4 py-4 md:px-5 md:py-5 border-t border-white/5">{detail}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PipelineEdgeRow({
  edge,
  active,
  onSelect,
  detail,
}: {
  edge: PipelineEdge;
  active: boolean;
  onSelect: () => void;
  detail?: ReactNode;
}) {
  const cls = accentClasses(edge.accent, active);
  return (
    <div className="relative flex items-start gap-3 md:gap-4 z-[1] py-1">
      <div className="relative shrink-0 w-12 md:w-16 flex items-start justify-center pt-2">
        <ArrowDown className={cn("w-4 h-4", cls.icon)} />
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={active}
          aria-expanded={active}
          className={cn(
            "text-left rounded-xl border px-3 py-2 md:px-3.5 md:py-2 transition-all group backdrop-blur-md",
            cls.cardBg,
            cls.cardBorder,
            active ? cls.glow : "hover:bg-white/[0.04]",
            detail ? "rounded-b-none border-b-0" : "",
          )}
        >
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={cn("text-[9px] font-mono uppercase tracking-[0.22em]", cls.text)}>
              {!edge.cmd
                ? "post-cutover"
                : edge.stages.length === 1
                  ? "stage"
                  : "stages"}
            </span>
            {edge.stages.map((s, i) => (
              <span key={s} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] md:text-[11px] font-mono tracking-tight border",
                    cls.pillBg,
                    cls.pillBorder,
                    cls.textStrong,
                  )}
                >
                  {s}
                </span>
                {i < edge.stages.length - 1 && (
                  <span className="text-slate-600 text-[10px]">›</span>
                )}
              </span>
            ))}
          </div>
        </button>
        <AnimatePresence initial={false}>
          {detail && (
            <motion.div
              key="edge-detail"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={cn("overflow-hidden rounded-b-xl border border-t-0", cls.cardBorder, cls.cardBg)}
            >
              <div className="px-3 py-3.5 md:px-4 md:py-4 border-t border-white/5">{detail}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PipelineNodeDetail({ node }: { node: PipelineNode }) {
  const Icon = node.icon;
  const cls = accentClasses(node.accent, true);
  const nodeKindLabel =
    node.kind === "artifact" ? "Artifact" : node.kind === "system" ? "System" : "Gate";

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
          cls.cardBg,
          cls.cardBorder,
        )}>
          <Icon className={cn("w-5 h-5", cls.icon)} />
        </div>
        <div className="min-w-0">
          <p className={cn("text-[9px] font-mono uppercase tracking-[0.25em] mb-0.5", cls.text)}>
            {nodeKindLabel}
            {node.emphasis === "critical" ? " · fail-closed" : ""}
            {node.size ? ` · ${node.size}` : ""}
          </p>
          <h4 className="text-lg font-bold text-white tracking-tight">{node.label}</h4>
          <p className="text-[11px] text-slate-400 font-mono">{node.sub}</p>
        </div>
      </div>
      <p className="text-sm md:text-[15px] text-slate-200 leading-relaxed">{node.description}</p>
      <ul className="space-y-1.5">
        {node.details.map((d, i) => (
          <li key={i} className="flex items-start gap-2 text-[13px] text-slate-300 leading-relaxed">
            <CheckCircle2 className={cn("mt-0.5 shrink-0 w-3.5 h-3.5", cls.icon)} />
            <span>{d}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PipelineEdgeDetail({ edge }: { edge: PipelineEdge }) {
  const cls = accentClasses(edge.accent, true);
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
          cls.cardBg,
          cls.cardBorder,
        )}>
          <Zap className={cn("w-5 h-5", cls.icon)} />
        </div>
        <div className="min-w-0">
          <p className={cn("text-[9px] font-mono uppercase tracking-[0.25em] mb-0.5", cls.text)}>
            {!edge.cmd
              ? "Post-cutover · no command"
              : `Transition · ${edge.stages.length} ${edge.stages.length === 1 ? "stage" : "stages"}`}
          </p>
          <h4 className="text-lg font-bold text-white tracking-tight">
            {edge.stages.join(" → ")}
          </h4>
        </div>
      </div>
      <p className="text-sm md:text-[15px] text-slate-200 leading-relaxed">
        {edge.description}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {edge.stages.map((s) => (
          <span
            key={s}
            className={cn(
              "inline-flex items-center rounded-md px-2 py-1 text-[11px] font-mono border",
              cls.pillBg,
              cls.pillBorder,
              cls.textStrong,
            )}
          >
            {edge.cmd ? `${edge.cmd} ${s}` : s}
          </span>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 3. DATA PRESERVATION MATRIX
// Animated stacked-bar summary above a filterable list.
// ============================================================

type Disposition = "native" | "sidecar" | "unrecoverable";

type Feature = {
  name: string;
  disposition: Disposition;
  pro?: Disposition;
  note: string;
};

const FEATURES: Feature[] = [
  { name: "Public channel messages", disposition: "native", note: "Every supported plan." },
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

const DISPOSITION_META: Record<
  Disposition,
  {
    label: string;
    color: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    badgeBg: string;
    badgeBorder: string;
    barFill: string;
    barBg: string;
    dot: string;
  }
> = {
  native: {
    label: "Native",
    color: "text-emerald-200",
    icon: CheckCircle2,
    badgeBg: "bg-emerald-500/10",
    badgeBorder: "border-emerald-500/30",
    barFill: "bg-gradient-to-r from-emerald-400 to-emerald-500",
    barBg: "bg-emerald-500/20",
    dot: "bg-emerald-400",
  },
  sidecar: {
    label: "Sidecar",
    color: "text-cyan-200",
    icon: FileArchive,
    badgeBg: "bg-cyan-500/10",
    badgeBorder: "border-cyan-500/30",
    barFill: "bg-gradient-to-r from-cyan-400 to-cyan-500",
    barBg: "bg-cyan-500/20",
    dot: "bg-cyan-400",
  },
  unrecoverable: {
    label: "Unrecoverable",
    color: "text-amber-200",
    icon: AlertTriangle,
    badgeBg: "bg-amber-500/10",
    badgeBorder: "border-amber-500/30",
    barFill: "bg-gradient-to-r from-amber-400 to-amber-500",
    barBg: "bg-amber-500/20",
    dot: "bg-amber-400",
  },
};

export function DataPreservationMatrixViz() {
  const [planTier, setPlanTier] = useState<"business" | "pro">("business");
  const [filter, setFilter] = useState<Disposition | "all">("all");

  const effective = useMemo(
    () =>
      FEATURES.map((f) => ({
        ...f,
        effective: planTier === "pro" && f.pro ? f.pro : f.disposition,
        downgraded: planTier === "pro" && !!f.pro && f.pro !== f.disposition,
      })),
    [planTier],
  );

  const counts = useMemo(() => {
    const native = effective.filter((f) => f.effective === "native").length;
    const sidecar = effective.filter((f) => f.effective === "sidecar").length;
    const unrecoverable = effective.filter((f) => f.effective === "unrecoverable").length;
    return { native, sidecar, unrecoverable, total: effective.length };
  }, [effective]);

  const downgradedList = effective.filter((f) => f.downgraded);

  const rows = effective.filter((f) => (filter === "all" ? true : f.effective === filter));

  return (
    <div className="sm-viz-container">
      <div className="sm-viz-header">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-400/20 text-cyan-400">
            <Layers className="h-3.5 w-3.5" />
          </div>
          <span className="text-[10px] md:text-[11px] font-mono text-cyan-400 tracking-widest uppercase">
            Data Preservation Matrix
          </span>
          <span className="text-[10px] md:text-[11px] text-slate-500 font-mono">
            · what survives · what becomes a sidecar · what you rebuild
          </span>
        </div>
      </div>

      <div className="p-5 md:p-7 space-y-5 md:space-y-6">
        {/* Plan toggle */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex p-1 bg-black/40 rounded-xl border border-white/5 text-[10px] font-bold uppercase tracking-tight self-start md:self-auto">
            <button
              type="button"
              onClick={() => setPlanTier("business")}
              className={cn(
                "px-3 py-2 rounded-lg transition-all",
                planTier === "business"
                  ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                  : "text-slate-500 hover:text-slate-300",
              )}
            >
              Business+ · Track A
            </button>
            <button
              type="button"
              onClick={() => setPlanTier("pro")}
              className={cn(
                "px-3 py-2 rounded-lg transition-all",
                planTier === "pro"
                  ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                  : "text-slate-500 hover:text-slate-300",
              )}
            >
              Pro · Track B (slackdump)
            </button>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">
            {counts.total} Slack features · disposition recomputes on plan toggle
          </p>
        </div>

        {/* Ratio summary bar */}
        <DispositionBar counts={counts} downgradedList={downgradedList} />

        {/* Filter chips */}
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">Filter</span>
          {(["all", "native", "sidecar", "unrecoverable"] as const).map((f) => {
            const active = filter === f;
            const count = f === "all" ? counts.total : counts[f];
            const color = f === "all" ? "slate" : f === "native" ? "emerald" : f === "sidecar" ? "cyan" : "amber";
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-full border text-[10px] font-mono uppercase tracking-widest transition-all",
                  active
                    ? color === "slate"
                      ? "bg-white/10 border-white/20 text-white"
                      : color === "emerald"
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
                        : color === "cyan"
                          ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-200"
                          : "bg-amber-500/15 border-amber-500/40 text-amber-200"
                    : "bg-transparent border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20",
                )}
              >
                {f === "all" ? "All" : DISPOSITION_META[f].label} · {count}
              </button>
            );
          })}
        </div>

        {/* Rows */}
        <div className="grid grid-cols-1 gap-2">
          <AnimatePresence initial={false}>
            {rows.map((f) => {
              const meta = DISPOSITION_META[f.effective];
              const Icon = meta.icon;
              return (
                <motion.div
                  key={f.name}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className={cn(
                    "group flex items-start gap-3 px-3 py-3 rounded-xl border transition-all",
                    meta.badgeBorder,
                    meta.badgeBg,
                    "hover:brightness-110",
                  )}
                >
                  <div className={cn("shrink-0 mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg border", meta.badgeBorder, meta.badgeBg)}>
                    <Icon className={cn("w-3.5 h-3.5", meta.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <p className="text-sm font-semibold text-white">{f.name}</p>
                      <span className={cn("text-[9px] font-mono uppercase tracking-widest", meta.color)}>
                        {meta.label}
                      </span>
                      {f.downgraded && (
                        <span className="text-[9px] font-mono uppercase tracking-widest text-amber-300/80">
                          · downgraded on Pro
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-slate-400 leading-relaxed mt-1">{f.note}</p>
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

function DispositionBar({
  counts,
  downgradedList,
}: {
  counts: { native: number; sidecar: number; unrecoverable: number; total: number };
  downgradedList: { name: string; downgraded: boolean }[];
}) {
  const prefersReducedMotion = useReducedMotion();
  const pct = (n: number) => (counts.total > 0 ? (n / counts.total) * 100 : 0);
  const parts = [
    { key: "native" as const, count: counts.native, meta: DISPOSITION_META.native },
    { key: "sidecar" as const, count: counts.sidecar, meta: DISPOSITION_META.sidecar },
    { key: "unrecoverable" as const, count: counts.unrecoverable, meta: DISPOSITION_META.unrecoverable },
  ];

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-baseline text-[10px] font-mono uppercase tracking-[0.2em]">
        <span className="text-slate-500">Disposition · what happens to each feature</span>
        <span className="text-slate-500 tabular-nums">
          {counts.total} features
        </span>
      </div>
      <div className="relative h-10 md:h-12 rounded-xl overflow-hidden border border-white/10 bg-black/40 flex">
        {parts.map((p, i) => (
          <motion.div
            key={p.key}
            className={cn(
              "relative flex items-center justify-center overflow-hidden",
              p.meta.barFill,
              i < parts.length - 1 && "border-r border-[#020204]/40",
            )}
            initial={prefersReducedMotion ? false : { width: 0 }}
            animate={{ width: `${pct(p.count)}%` }}
            transition={{ type: "spring", stiffness: 90, damping: 20 }}
          >
            {pct(p.count) > 7 && (
              <div className="flex items-center gap-1.5 text-[10px] md:text-[11px] font-black text-[#020204] px-2">
                <span className="uppercase tracking-wider">{p.meta.label}</span>
                <span className="tabular-nums">{p.count}</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-mono">
        {parts.map((p) => (
          <div key={p.key} className="flex items-center gap-2">
            <span className={cn("inline-block w-2.5 h-2.5 rounded-full", p.meta.dot)} />
            <span className="text-white font-bold tabular-nums">{p.count}</span>
            <span className="text-slate-500 uppercase tracking-widest text-[10px]">
              {p.meta.label} · {pct(p.count).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {downgradedList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-300 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-300 mb-1">
                  Pro plan blind-spot · {downgradedList.length} {downgradedList.length === 1 ? "feature" : "features"} downgraded
                </p>
                <p className="text-[12px] text-slate-300 leading-relaxed">
                  {downgradedList.map((d) => d.name).join(" · ")}. The export token only sees what its owner participates in; written to <span className="font-mono text-amber-200">unresolved-gaps.md</span> in advance.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// 4. CUTOVER SIMULATOR
// Slack ↔ Mattermost split panels. System states animate.
// Import progress ring climbs, user activation grid lights up.
// Approval log below.
// ============================================================

type SlackState = "live" | "read-only" | "archived";
type MmState = "offline" | "importing" | "live" | "activated";

const USER_GRID_SIZE = 24; // dots shown
const TARGET_POSTS = 1_284_903;

type CutoverEventBase = {
  t: string;
  slack?: SlackState;
  mm?: MmState;
  importProgress?: number;
  postsImported?: number;
  activatedUsers?: number;
};

type CutoverEvent = CutoverEventBase &
  (
    | { kind: "narration"; body: string }
    | { kind: "approval"; cmd: string; why: string; verdict: "approve" | "deny"; tone?: "normal" | "destructive" }
    | { kind: "log"; body: string }
    | { kind: "status"; body: string; tone: "neutral" | "success" | "warn" | "danger" }
  );

const CUTOVER_SCRIPT: CutoverEvent[] = [
  {
    t: "T −60m",
    kind: "narration",
    body: "You paste: “Run Phase 2 stage ready against production and show me the readiness score.”",
    slack: "live",
    mm: "offline",
    importProgress: 0,
    postsImported: 0,
    activatedUsers: 0,
  },
  {
    t: "T −60m",
    kind: "log",
    body: "ready: intake…ok live…ok staging…ok smoke…ok reconciliation…ok restore…ok ROLLBACK_OWNER…Jane Admin <jane@acme.com>",
  },
  {
    t: "T −60m",
    kind: "status",
    body: "cutover-readiness.json → status: ready",
    tone: "success",
  },
  {
    t: "T −15m",
    kind: "narration",
    body: "Flip Slack to read-only in the admin UI. Post the freeze notice from the comms kit into #general.",
    slack: "read-only",
  },
  {
    t: "T = 0",
    kind: "narration",
    body: "You paste: “Run Phase 2 stage cutover against production. Pause before any destructive step and explain it.”",
  },
  {
    t: "T +0",
    kind: "approval",
    cmd: "ssh deploy@chat.acme.com 'sudo systemctl status mattermost'",
    why: "Sanity-check Mattermost is up on the target.",
    verdict: "approve",
  },
  {
    t: "T +1",
    kind: "approval",
    cmd: "mmctl auth login --url https://chat.acme.com --username admin",
    why: "Authenticate as the Mattermost sysadmin.",
    verdict: "approve",
  },
  {
    t: "T +2",
    kind: "approval",
    cmd: "mmctl import upload mattermost-bulk-import.zip",
    why: "Stream the 22 GB bundle to the server's import directory.",
    verdict: "approve",
  },
  {
    t: "T +5",
    kind: "approval",
    cmd: "mmctl import process <uploaded-filename>",
    why: "Kick off the idempotent import job. This is the moment of commit.",
    verdict: "approve",
    tone: "destructive",
    mm: "importing",
    importProgress: 0,
  },
  {
    t: "T +6",
    kind: "log",
    body: "{ state: pending, progress: 0.00 }",
    importProgress: 0,
  },
  {
    t: "T +9",
    kind: "log",
    body: "{ state: running, progress: 0.12, posts_imported: 154_000 }",
    importProgress: 0.12,
    postsImported: 154_000,
  },
  {
    t: "T +14",
    kind: "log",
    body: "{ state: running, progress: 0.45, posts_imported: 578_000 }",
    importProgress: 0.45,
    postsImported: 578_000,
  },
  {
    t: "T +21",
    kind: "log",
    body: "{ state: running, progress: 0.86, posts_imported: 1_105_000 }",
    importProgress: 0.86,
    postsImported: 1_105_000,
  },
  {
    t: "T +26",
    kind: "log",
    body: "{ state: success, progress: 1.00, posts_imported: 1_284_903 }",
    importProgress: 1,
    postsImported: TARGET_POSTS,
    mm: "live",
  },
  {
    t: "T +27",
    kind: "approval",
    cmd: "psql \"$POSTGRES_DSN\" -c 'SELECT COUNT(*) FROM Users'",
    why: "Count imported users for the reconciliation.",
    verdict: "approve",
  },
  {
    t: "T +28",
    kind: "log",
    body: "reconcile-handoff-vs-import.py → 337 / 142 / 1_284_903 · diffs: []",
  },
  {
    t: "T +29",
    kind: "log",
    body: "activation: password-reset for admin@acme.com → reset link received",
    activatedUsers: 1,
  },
  {
    t: "T +30",
    kind: "status",
    body: "cutover-status.<ts>.json → status: success",
    tone: "success",
    mm: "activated",
    activatedUsers: 2,
  },
  {
    t: "T +31",
    kind: "narration",
    body: "Send the activation comms template. Monitor the help-desk channel.",
    activatedUsers: 4,
  },
  {
    t: "T +1h",
    kind: "log",
    body: "mmctl user list --all | jq length → 147 activated · 190 pending",
    activatedUsers: 10,
  },
  {
    t: "T +4h",
    kind: "log",
    body: "mmctl user list --all | jq length → 289 activated · 48 pending",
    activatedUsers: 20,
  },
  {
    t: "T +1d",
    kind: "status",
    body: "activation sweep sent · 334 / 337 active (99%)",
    tone: "success",
    slack: "archived",
    activatedUsers: 24,
  },
];

type CutoverState = {
  slack: SlackState;
  mm: MmState;
  importProgress: number;
  postsImported: number;
  activatedUsers: number;
};

const INITIAL_CUTOVER_STATE: CutoverState = {
  slack: "live",
  mm: "offline",
  importProgress: 0,
  postsImported: 0,
  activatedUsers: 0,
};

function computeState(events: CutoverEvent[], uptoIndex: number): CutoverState {
  let state = { ...INITIAL_CUTOVER_STATE };
  for (let i = 0; i < uptoIndex; i += 1) {
    const e = events[i];
    if (e.slack !== undefined) state = { ...state, slack: e.slack };
    if (e.mm !== undefined) state = { ...state, mm: e.mm };
    if (e.importProgress !== undefined) state = { ...state, importProgress: e.importProgress };
    if (e.postsImported !== undefined) state = { ...state, postsImported: e.postsImported };
    if (e.activatedUsers !== undefined) state = { ...state, activatedUsers: e.activatedUsers };
  }
  return state;
}

export function CutoverSimulatorViz() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const events = CUTOVER_SCRIPT;
  const atEnd = index >= events.length;
  const visible = events.slice(0, index);
  const state = useMemo(() => computeState(events, index), [events, index]);
  const progress = events.length === 0 ? 0 : index / events.length;

  useEffect(() => {
    if (!playing || atEnd) return;
    const id = setTimeout(() => setIndex((i) => i + 1), 1400);
    return () => clearTimeout(id);
  }, [playing, index, atEnd]);

  const reset = useCallback(() => {
    setIndex(0);
    setPlaying(false);
  }, []);

  return (
    <div className="sm-viz-container">
      <div className="sm-viz-header flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-400/20 text-emerald-400">
            <Zap className="h-3.5 w-3.5" />
          </div>
          <span className="text-[10px] md:text-[11px] font-mono text-emerald-400 tracking-widest uppercase">
            Cutover Simulator
          </span>
          <span className="text-[10px] md:text-[11px] text-slate-500 font-mono">
            · both systems, live · T −60m → T +1d
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

      <div className="px-5 md:px-7 pt-4">
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={prefersReducedMotion ? false : { width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.4 }}
            className="h-full bg-gradient-to-r from-purple-500 via-cyan-500 to-emerald-500"
          />
        </div>
      </div>

      <div className="p-5 md:p-7 pt-5 space-y-5 md:space-y-6">
        {/* Split panels */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 md:gap-4 items-stretch">
          <SlackPanel state={state} />
          <TransferBridge state={state} />
          <MattermostPanel state={state} />
        </div>

        {/* Log + rules */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4 md:gap-5">
          <div className="bg-black/50 rounded-2xl border border-white/10 p-4 md:p-5 min-h-[240px] md:min-h-[300px] max-h-[380px] overflow-y-auto">
            <AnimatePresence initial={false}>
              {visible.length === 0 ? (
                <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-500 text-sm font-mono">
                  Press <span className="text-white">play</span> to watch Slack dim as Mattermost fills. Approval log lines show here.
                </motion.p>
              ) : (
                visible.map((evt, i) => <CutoverEventRow key={i} evt={evt} />)
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-3">
            <CutoverRule tone="normal" title="Approval rule" body={<>Use <span className="text-white font-semibold">Approve once</span>, not <span className="text-amber-300">Approve for the session</span>, during cutover.</>} />
            <CutoverRule tone="emerald" title="Idempotent" body={<>Interrupted? Re-run <span className="font-mono text-white">cutover</span>. Mattermost de-dupes on message ID.</>} />
            <CutoverRule tone="amber" title="If it fails" body={<>Mechanical → fix, re-run. Data loss → <span className="font-mono text-white">ROLLBACK_CONFIRMATION=I_UNDERSTAND_THIS_RESTORES_BACKUPS</span>.</>} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CutoverRule({ tone, title, body }: { tone: "normal" | "emerald" | "amber"; title: string; body: ReactNode }) {
  const cls =
    tone === "emerald"
      ? "border-emerald-500/20 bg-emerald-500/5"
      : tone === "amber"
        ? "border-amber-500/20 bg-amber-500/5"
        : "border-white/10 bg-white/[0.02]";
  const titleCls =
    tone === "emerald"
      ? "text-emerald-300"
      : tone === "amber"
        ? "text-amber-300"
        : "text-slate-400";
  return (
    <div className={cn("rounded-xl border p-3", cls)}>
      <p className={cn("text-[10px] font-mono uppercase tracking-[0.2em] mb-1.5", titleCls)}>
        {title}
      </p>
      <p className="text-xs text-slate-300 leading-relaxed">{body}</p>
    </div>
  );
}

function CutoverEventRow({ evt }: { evt: CutoverEvent }) {
  let body: ReactNode;
  if (evt.kind === "narration") {
    body = <p className="text-slate-300 leading-relaxed">{evt.body}</p>;
  } else if (evt.kind === "approval") {
    const destructive = evt.tone === "destructive";
    body = (
      <div className={cn("rounded-lg border p-3", destructive ? "border-amber-500/30 bg-amber-500/5" : "border-white/10 bg-white/[0.02]")}>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-[0.2em]", destructive ? "bg-amber-500/15 border border-amber-500/40 text-amber-200" : "bg-purple-500/15 border border-purple-500/30 text-purple-200")}>
            {destructive ? <AlertTriangle className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
            {destructive ? "destructive" : "approval"}
          </span>
          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-[0.2em]", evt.verdict === "approve" ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-200" : "bg-rose-500/15 border border-rose-500/30 text-rose-200")}>
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
    body = (
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
    body = (
      <div className={cn("inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-[11px] md:text-[12px] font-mono", toneClass)}>
        <CheckCircle2 className="w-3.5 h-3.5" />
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
      <div className="min-w-0 flex-1 text-sm">{body}</div>
    </motion.div>
  );
}

// ====== System panels ======

const SLACK_STATE_META: Record<SlackState, { label: string; color: string; dot: string; glow: string; border: string; bg: string }> = {
  live: {
    label: "Live",
    color: "text-emerald-300",
    dot: "bg-emerald-400",
    glow: "shadow-[0_0_16px_rgba(16,185,129,0.35)]",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
  },
  "read-only": {
    label: "Read-only",
    color: "text-amber-300",
    dot: "bg-amber-400",
    glow: "shadow-[0_0_16px_rgba(245,158,11,0.3)]",
    border: "border-amber-500/30",
    bg: "bg-amber-500/10",
  },
  archived: {
    label: "Archived",
    color: "text-slate-400",
    dot: "bg-slate-500",
    glow: "",
    border: "border-slate-600/40",
    bg: "bg-slate-700/20",
  },
};

const MM_STATE_META: Record<MmState, { label: string; color: string; dot: string; glow: string; border: string; bg: string }> = {
  offline: {
    label: "Offline",
    color: "text-slate-400",
    dot: "bg-slate-600",
    glow: "",
    border: "border-slate-600/40",
    bg: "bg-slate-700/20",
  },
  importing: {
    label: "Importing",
    color: "text-cyan-300",
    dot: "bg-cyan-400",
    glow: "shadow-[0_0_16px_rgba(6,182,212,0.35)]",
    border: "border-cyan-500/30",
    bg: "bg-cyan-500/10",
  },
  live: {
    label: "Live",
    color: "text-emerald-300",
    dot: "bg-emerald-400",
    glow: "shadow-[0_0_16px_rgba(16,185,129,0.35)]",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
  },
  activated: {
    label: "Activated",
    color: "text-emerald-300",
    dot: "bg-emerald-400",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.45)]",
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/15",
  },
};

function SlackPanel({ state }: { state: CutoverState }) {
  const meta = SLACK_STATE_META[state.slack];
  const fadeOut = state.slack === "archived" ? 0.6 : state.slack === "read-only" ? 0.8 : 1;

  return (
    <motion.div
      className={cn("relative rounded-2xl border overflow-hidden", meta.border)}
      animate={{ opacity: fadeOut }}
      transition={{ duration: 0.5 }}
    >
      <div className={cn("absolute inset-0 opacity-40", meta.bg)} />

      <div className="relative p-4 md:p-5 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/15 border border-purple-500/30">
              <Hash className="w-4 h-4 text-purple-300" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-purple-300">Slack</p>
              <p className="text-sm font-bold text-white">acme.slack.com</p>
            </div>
          </div>
          <motion.div
            layout
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border",
              meta.border,
              meta.bg,
              meta.glow,
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", meta.dot, state.slack === "live" && "animate-pulse")} />
            <span className={cn("text-[10px] font-mono uppercase tracking-widest", meta.color)}>
              {meta.label}
            </span>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
          <StatRow icon={Users} label="users" value="337" />
          <StatRow icon={Hash} label="channels" value="142" />
          <StatRow icon={Files} label="messages" value="1.28M" />
          <StatRow icon={FileArchive} label="files" value="8 GB" />
        </div>

        {/* Fake channel list */}
        <div className="space-y-1 border-t border-white/5 pt-3">
          {["# general", "# engineering", "# design", "# random"].map((c) => (
            <div key={c} className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="text-slate-600">#</span>
              <span className="truncate">{c.slice(2)}</span>
            </div>
          ))}
        </div>

        {/* Write arrow indicator */}
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest">
          {state.slack === "live" ? (
            <span className="text-emerald-300 inline-flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              accepting posts
            </span>
          ) : state.slack === "read-only" ? (
            <span className="text-amber-300 inline-flex items-center gap-1">
              <Lock className="w-3 h-3" />
              posting disabled · admins only
            </span>
          ) : (
            <span className="text-slate-500 inline-flex items-center gap-1">
              <FileArchive className="w-3 h-3" />
              read-only archive · downgraded
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function MattermostPanel({ state }: { state: CutoverState }) {
  const meta = MM_STATE_META[state.mm];
  const postsPct = state.postsImported / TARGET_POSTS;
  const activatedPct = state.activatedUsers / USER_GRID_SIZE;

  return (
    <motion.div
      className={cn("relative rounded-2xl border overflow-hidden", meta.border)}
      animate={{ opacity: 1 }}
    >
      <div className={cn("absolute inset-0 opacity-40", meta.bg)} />

      <div className="relative p-4 md:p-5 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/15 border border-cyan-500/30">
              <Server className="w-4 h-4 text-cyan-300" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-300">Mattermost</p>
              <p className="text-sm font-bold text-white">chat.acme.com</p>
            </div>
          </div>
          <motion.div
            layout
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border",
              meta.border,
              meta.bg,
              meta.glow,
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", meta.dot, (state.mm === "importing" || state.mm === "live" || state.mm === "activated") && "animate-pulse")} />
            <span className={cn("text-[10px] font-mono uppercase tracking-widest", meta.color)}>
              {state.mm === "importing" ? `Importing · ${Math.round(postsPct * 100)}%` : meta.label}
            </span>
          </motion.div>
        </div>

        {/* Progress ring + counter */}
        <div className="flex items-center gap-4">
          <ImportProgressRing progress={state.importProgress} active={state.mm === "importing"} />
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-slate-400 mb-0.5">
              Posts imported
            </p>
            <p className="text-xl md:text-2xl font-black text-white tabular-nums leading-none">
              {state.postsImported.toLocaleString()}
              <span className="text-xs text-slate-500 font-normal">
                {" "}/ {TARGET_POSTS.toLocaleString()}
              </span>
            </p>
            <p className="text-[10px] font-mono text-slate-500 mt-1">
              {state.mm === "offline" ? "waiting for import job"
                : state.mm === "importing" ? "streaming from mattermost-bulk-import.zip"
                  : state.mm === "live" ? "reconciled · observed == handoff"
                    : "activation in progress"}
            </p>
          </div>
        </div>

        {/* User activation grid */}
        <div className="space-y-2 border-t border-white/5 pt-3">
          <div className="flex items-baseline justify-between">
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-400">
              Activation
            </p>
            <p className="text-[10px] font-mono text-slate-400 tabular-nums">
              {state.activatedUsers} / {USER_GRID_SIZE}
              <span className="text-slate-600"> · {Math.round(activatedPct * 100)}%</span>
            </p>
          </div>
          <div className="grid grid-cols-12 gap-1">
            {Array.from({ length: USER_GRID_SIZE }).map((_, i) => {
              const activated = i < state.activatedUsers;
              return (
                <motion.div
                  key={i}
                  initial={false}
                  animate={{
                    backgroundColor: activated ? "rgba(16,185,129,0.9)" : "rgba(255,255,255,0.06)",
                    scale: activated ? 1 : 0.9,
                    boxShadow: activated ? "0 0 10px rgba(16,185,129,0.5)" : "0 0 0 rgba(0,0,0,0)",
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: activated ? i * 0.02 : 0 }}
                  className="aspect-square rounded-[4px] border border-white/10"
                  title={activated ? "activated" : "pending"}
                />
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatRow({ icon: Icon, label, value }: { icon: ComponentType<SVGProps<SVGSVGElement>>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
      <Icon className="w-3 h-3 text-slate-500" />
      <span className="text-slate-500 uppercase tracking-widest text-[9px]">{label}</span>
      <span className="text-white font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function ImportProgressRing({ progress, active }: { progress: number; active: boolean }) {
  const size = 72;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - progress);
  const gradId = useId();

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("text-sm font-black tabular-nums", active ? "text-cyan-200" : progress >= 1 ? "text-emerald-200" : "text-slate-400")}>
          {Math.round(progress * 100)}%
        </span>
      </div>
    </div>
  );
}

function TransferBridge({ state }: { state: CutoverState }) {
  const active = state.mm === "importing";
  return (
    <div className="hidden md:flex flex-col items-center justify-center py-6 w-14 relative">
      {/* Vertical baseline */}
      <div className="absolute inset-y-8 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

      {/* Static stem */}
      <div className="relative w-px h-20 overflow-hidden">
        <motion.div
          initial={false}
          animate={{ backgroundPositionY: active ? ["0%", "100%"] : "0%" }}
          transition={{ duration: 1.4, repeat: active ? Infinity : 0, ease: "linear" }}
          style={{
            backgroundImage: active
              ? "repeating-linear-gradient(0deg, #06b6d4 0 8px, transparent 8px 16px)"
              : "linear-gradient(to bottom, transparent, rgba(255,255,255,0.15), transparent)",
            backgroundSize: "100% 16px",
            height: "100%",
            width: "100%",
          }}
        />
      </div>

      {/* Packets flowing */}
      {active && (
        <div className="absolute inset-0 pointer-events-none">
          {[0, 0.4, 0.8].map((delay) => (
            <motion.div
              key={delay}
              initial={{ y: -28, opacity: 0 }}
              animate={{ y: 72, opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, delay, ease: "linear" }}
              className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
            />
          ))}
        </div>
      )}

      {/* Label */}
      <div className={cn(
        "mt-2 px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-widest border",
        active
          ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-200"
          : state.mm === "live" || state.mm === "activated"
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
            : "border-white/10 bg-white/5 text-slate-500",
      )}>
        {active ? (
          <span className="inline-flex items-center gap-1">
            <Upload className="w-3 h-3" />
            import
          </span>
        ) : state.mm === "offline" ? (
          <span>idle</span>
        ) : (
          <span className="inline-flex items-center gap-1">
            <Rocket className="w-3 h-3" />
            live
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Namespace export
// ============================================================

export const SlackMigrationViz = {
  CostCompoundingViz,
  PhasePipelineViz,
  DataPreservationMatrixViz,
  CutoverSimulatorViz,
};
