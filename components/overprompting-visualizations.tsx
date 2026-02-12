"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ============================================================
// 1. CONSTRAINT VISUALIZATION
// Shows how adding constraints narrows the creative search space
// ============================================================

const CONSTRAINT_LABELS = [
  "\u201CFacial likeness must be instantly recognizable\u201D",
  "\u201CPose and orientation must match exactly\u201D",
  "\u201CClothing must be identical to reference\u201D",
  "\u201CNo beard if the target is clean-shaven\u201D",
  "\u201CSkin tone and lighting must be realistic\u201D",
  "\u201CBackground must match the original scene\u201D",
];

// Deterministic dot grid. Each dot has a "threshold" — the constraint
// count at which it disappears. Lower threshold = eliminated sooner.
interface Dot {
  id: number;
  cx: number;
  cy: number;
  r: number;
  hue: number;
  sat: number;
  light: number;
  threshold: number;
}

function buildDots(cols: number, rows: number, width: number, height: number): Dot[] {
  const dots: Dot[] = [];
  const padX = width / (cols + 1);
  const padY = height / (rows + 1);
  let id = 0;

  // Deterministic distribution of thresholds across the grid
  // We want ~70 dots with a nice falloff
  const thresholds = [
    // Row 0
    6, 3, 5, 1, 4, 2, 6, 3, 5, 1,
    // Row 1
    2, 5, 1, 4, 6, 3, 2, 5, 1, 4,
    // Row 2
    4, 1, 6, 3, 2, 5, 4, 1, 6, 2,
    // Row 3
    3, 6, 2, 5, 1, 4, 3, 6, 2, 5,
    // Row 4
    5, 2, 4, 1, 3, 6, 5, 2, 4, 1,
    // Row 5
    1, 4, 3, 6, 5, 2, 1, 4, 3, 6,
    // Row 6
    6, 3, 5, 2, 4, 1, 6, 3, 5, 2,
  ];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const seed = (c * 7 + r * 13 + 37) % 100;
      dots.push({
        id: id,
        cx: padX * (c + 1) + ((seed % 7) - 3),
        cy: padY * (r + 1) + ((seed % 5) - 2),
        r: 4 + (seed % 5),
        hue: 20 + (seed % 40),          // 20-60: red-orange-gold
        sat: 70 + (seed % 30),           // 70-100%
        light: 50 + (seed % 20),         // 50-70%
        threshold: thresholds[idx] ?? 3,
      });
      id++;
    }
  }
  return dots;
}

export function ConstraintViz() {
  const [level, setLevel] = useState(0);
  const dots = useMemo(() => buildDots(10, 7, 560, 280), []);

  const visible = dots.filter((d) => d.threshold > level);
  const pct = Math.round((visible.length / dots.length) * 100);

  return (
    <div>
      <div className="op-viz-header">
        <h3 className="text-lg md:text-xl font-bold text-white tracking-tight m-0">
          The Constraint Paradox
        </h3>
        <p className="text-sm text-slate-400 m-0">
          Each dot is a creative direction the model could take. Add constraints to see how the search space shrinks.
        </p>
      </div>

      <div className="px-4 md:px-6 py-4 md:py-6">
        {/* SVG dot grid */}
        <div className="w-full overflow-hidden rounded-xl bg-black/40 border border-white/5">
          <svg
            viewBox="0 0 560 280"
            className="w-full h-auto"
            aria-label={`Creative space visualization: ${pct}% of directions remain with ${level} constraints`}
          >
            {dots.map((dot) => {
              const alive = dot.threshold > level;
              return (
                <circle
                  key={dot.id}
                  cx={dot.cx}
                  cy={dot.cy}
                  r={alive ? dot.r : 2}
                  fill={
                    alive
                      ? `hsla(${dot.hue}, ${dot.sat}%, ${dot.light}%, 0.85)`
                      : "rgba(100,116,139,0.12)"
                  }
                  style={{
                    transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                    filter: alive
                      ? `drop-shadow(0 0 ${dot.r * 1.5}px hsla(${dot.hue}, ${dot.sat}%, ${dot.light}%, 0.4))`
                      : "none",
                  }}
                />
              );
            })}
          </svg>
        </div>

        {/* Creative freedom meter */}
        <div className="mt-5 mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-400 font-medium">Creative Freedom</span>
            <span
              className="font-mono font-bold tabular-nums"
              style={{
                color: pct > 60 ? "#f59e0b" : pct > 30 ? "#f97316" : "#f43f5e",
              }}
            >
              {pct}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                background:
                  pct > 60
                    ? "linear-gradient(90deg, #f59e0b, #f97316)"
                    : pct > 30
                      ? "linear-gradient(90deg, #f97316, #f43f5e)"
                      : "linear-gradient(90deg, #f43f5e, #e11d48)",
                transition: "width 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <button
            type="button"
            className="op-btn-action"
            onClick={() => setLevel((l) => Math.min(l + 1, 6))}
            disabled={level >= 6}
          >
            + ADD CONSTRAINT
          </button>
          <button
            type="button"
            className="op-btn-secondary"
            onClick={() => setLevel((l) => Math.max(l - 1, 0))}
            disabled={level <= 0}
          >
            &minus; REMOVE
          </button>
          <button
            type="button"
            className="op-btn-secondary"
            onClick={() => setLevel(0)}
            disabled={level === 0}
          >
            RESET
          </button>
          <span className="text-xs text-slate-500 font-mono ml-auto">
            {level}/6 constraints
          </span>
        </div>

        {/* Active constraints list */}
        {level > 0 && (
          <div className="mt-5 space-y-2">
            {CONSTRAINT_LABELS.slice(0, level).map((label, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm"
                style={{
                  animation: "opFadeIn 0.4s ease-out",
                }}
              >
                <span className="text-rose-400 mt-0.5 shrink-0">&#x2715;</span>
                <span className="text-slate-400 italic">{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 2. QUALITY CURVE VISUALIZATION
// Shows the inverted-U relationship: prompt detail vs quality
// ============================================================

// Quality curve chart constants (hoisted for stable references)
const CURVE_W = 600;
const CURVE_H = 300;
const CURVE_PAD = { top: 30, right: 30, bottom: 60, left: 50 } as const;
const CURVE_PLOT_W = CURVE_W - CURVE_PAD.left - CURVE_PAD.right;
const CURVE_PLOT_H = CURVE_H - CURVE_PAD.top - CURVE_PAD.bottom;

export function QualityCurveViz() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [drawn, setDrawn] = useState(false);
  const [hoverX, setHoverX] = useState<number | null>(null);

  // Animate curve drawing on scroll
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);

  // Curve: quality as a function of prompt detail (0-1 → 0-1)
  // Peaks around x=0.3, then falls
  const curvePoints = useMemo(() => {
    const pts: Array<{ x: number; y: number }> = [];
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      // Skewed bell: peaks around 0.3
      const y = Math.exp(-((t - 0.3) ** 2) / (2 * 0.06)) * 0.9 + 0.05;
      pts.push({ x: t, y });
    }
    return pts;
  }, []);

  const toSVG = useCallback(
    (x: number, y: number) => ({
      sx: CURVE_PAD.left + x * CURVE_PLOT_W,
      sy: CURVE_PAD.top + (1 - y) * CURVE_PLOT_H,
    }),
    []
  );

  // Build SVG path (memoized since curvePoints and toSVG are stable)
  const pathD = useMemo(
    () =>
      curvePoints
        .map((p, i) => {
          const { sx, sy } = toSVG(p.x, p.y);
          return `${i === 0 ? "M" : "L"} ${sx} ${sy}`;
        })
        .join(" "),
    [curvePoints, toSVG]
  );

  // Zone boundaries
  const zones = [
    { start: 0, end: 0.15, label: "Too Vague", color: "rgba(245,158,11,0.08)" },
    { start: 0.15, end: 0.45, label: "Sweet Spot", color: "rgba(34,197,94,0.08)" },
    { start: 0.45, end: 1, label: "Overprompted", color: "rgba(244,63,94,0.08)" },
  ];

  // Hover info
  const getQualityAtX = (x: number) => {
    const t = Math.max(0, Math.min(1, x));
    return Math.exp(-((t - 0.3) ** 2) / (2 * 0.06)) * 0.9 + 0.05;
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = CURVE_W / rect.width;
    const mx = (e.clientX - rect.left) * scaleX;
    const x = (mx - CURVE_PAD.left) / CURVE_PLOT_W;
    if (x >= 0 && x <= 1) setHoverX(x);
    else setHoverX(null);
  };

  return (
    <div>
      <div className="op-viz-header">
        <h3 className="text-lg md:text-xl font-bold text-white tracking-tight m-0">
          The Quality Curve
        </h3>
        <p className="text-sm text-slate-400 m-0">
          Output quality peaks with moderate guidance, then drops as constraints accumulate.
        </p>
      </div>

      <div className="px-4 md:px-6 py-4 md:py-6">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${CURVE_W} ${CURVE_H}`}
          className="w-full h-auto"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverX(null)}
          aria-label="Chart showing output quality peaking with moderate prompt detail then declining with excessive detail"
        >
          {/* Zone backgrounds */}
          {zones.map((z) => {
            const x1 = CURVE_PAD.left + z.start * CURVE_PLOT_W;
            const x2 = CURVE_PAD.left + z.end * CURVE_PLOT_W;
            return (
              <rect
                key={z.label}
                x={x1}
                y={CURVE_PAD.top}
                width={x2 - x1}
                height={CURVE_PLOT_H}
                fill={z.color}
              />
            );
          })}

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((y) => {
            const { sy } = toSVG(0, y);
            return (
              <line
                key={y}
                x1={CURVE_PAD.left}
                y1={sy}
                x2={CURVE_PAD.left + CURVE_PLOT_W}
                y2={sy}
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Axes */}
          <line
            x1={CURVE_PAD.left}
            y1={CURVE_PAD.top + CURVE_PLOT_H}
            x2={CURVE_PAD.left + CURVE_PLOT_W}
            y2={CURVE_PAD.top + CURVE_PLOT_H}
            stroke="rgba(255,255,255,0.15)"
          />
          <line
            x1={CURVE_PAD.left}
            y1={CURVE_PAD.top}
            x2={CURVE_PAD.left}
            y2={CURVE_PAD.top + CURVE_PLOT_H}
            stroke="rgba(255,255,255,0.15)"
          />

          {/* Y-axis label */}
          <text
            x={14}
            y={CURVE_PAD.top + CURVE_PLOT_H / 2}
            fill="#94a3b8"
            fontSize="11"
            textAnchor="middle"
            transform={`rotate(-90, 14, ${CURVE_PAD.top + CURVE_PLOT_H / 2})`}
          >
            Output Quality
          </text>

          {/* X-axis label */}
          <text
            x={CURVE_PAD.left + CURVE_PLOT_W / 2}
            y={CURVE_H - 8}
            fill="#94a3b8"
            fontSize="11"
            textAnchor="middle"
          >
            Prompt Specificity
          </text>

          {/* Zone labels */}
          {zones.map((z) => {
            const cx = CURVE_PAD.left + ((z.start + z.end) / 2) * CURVE_PLOT_W;
            return (
              <text
                key={z.label}
                x={cx}
                y={CURVE_H - 28}
                fill={
                  z.label === "Sweet Spot"
                    ? "#4ade80"
                    : z.label === "Too Vague"
                      ? "#fbbf24"
                      : "#fb7185"
                }
                fontSize="10"
                fontWeight="600"
                textAnchor="middle"
                letterSpacing="0.08em"
              >
                {z.label.toUpperCase()}
              </text>
            );
          })}

          {/* The curve */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#opCurveGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: drawn ? "none" : "2000",
              strokeDashoffset: drawn ? 0 : 2000,
              transition: "stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />

          {/* Glow under curve */}
          {drawn && (
            <path
              d={pathD + ` L ${CURVE_PAD.left + CURVE_PLOT_W} ${CURVE_PAD.top + CURVE_PLOT_H} L ${CURVE_PAD.left} ${CURVE_PAD.top + CURVE_PLOT_H} Z`}
              fill="url(#opAreaGrad)"
              opacity="0.15"
            />
          )}

          {/* Peak marker */}
          {drawn && (() => {
            const { sx, sy } = toSVG(0.3, getQualityAtX(0.3));
            return (
              <>
                <circle cx={sx} cy={sy} r="5" fill="#f59e0b" />
                <circle cx={sx} cy={sy} r="10" fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.4" />
              </>
            );
          })()}

          {/* Hover indicator */}
          {hoverX !== null && drawn && (() => {
            const y = getQualityAtX(hoverX);
            const { sx, sy } = toSVG(hoverX, y);
            return (
              <>
                <line
                  x1={sx}
                  y1={CURVE_PAD.top}
                  x2={sx}
                  y2={CURVE_PAD.top + CURVE_PLOT_H}
                  stroke="rgba(255,255,255,0.1)"
                  strokeDasharray="3 3"
                />
                <circle cx={sx} cy={sy} r="4" fill="#f8fafc" stroke="#f59e0b" strokeWidth="2" />
                <text x={sx} y={sy - 12} fill="#f8fafc" fontSize="11" textAnchor="middle" fontWeight="600">
                  {Math.round(y * 100)}%
                </text>
              </>
            );
          })()}

          {/* Gradients */}
          <defs>
            <linearGradient id="opCurveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="30%" stopColor="#f59e0b" />
              <stop offset="60%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
            <linearGradient id="opAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

// ============================================================
// 3. PLAN / EXECUTE VISUALIZATION
// Shows the two-phase approach: open planning → specific execution
// ============================================================

export function PlanExecuteViz() {
  const [phase, setPhase] = useState<"plan" | "execute">("plan");
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef}>
      <div className="op-viz-header">
        <h3 className="text-lg md:text-xl font-bold text-white tracking-tight m-0">
          The Two-Phase Approach
        </h3>
        <p className="text-sm text-slate-400 m-0">
          Be open during planning, precise during execution.
        </p>
      </div>

      <div className="px-4 md:px-6 py-4 md:py-6">
        {/* Toggle */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-white/5 rounded-xl w-fit">
          <button
            type="button"
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
              phase === "plan"
                ? "bg-amber-500/20 text-amber-400 shadow-lg shadow-amber-500/10"
                : "text-slate-500 hover:text-slate-300"
            }`}
            onClick={() => setPhase("plan")}
          >
            Planning
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
              phase === "execute"
                ? "bg-rose-500/20 text-rose-400 shadow-lg shadow-rose-500/10"
                : "text-slate-500 hover:text-slate-300"
            }`}
            onClick={() => setPhase("execute")}
          >
            Execution
          </button>
        </div>

        {/* Two-phase panels */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
          style={{
            opacity: revealed ? 1 : 0,
            transform: revealed ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Planning phase */}
          <div
            className="rounded-2xl p-5 md:p-7 border transition-all duration-500"
            style={{
              borderColor:
                phase === "plan"
                  ? "rgba(245,158,11,0.3)"
                  : "rgba(255,255,255,0.05)",
              background:
                phase === "plan"
                  ? "rgba(245,158,11,0.06)"
                  : "rgba(255,255,255,0.02)",
              transform: phase === "plan" ? "scale(1.02)" : "scale(0.98)",
              opacity: phase === "plan" ? 1 : 0.5,
            }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  background: "#f59e0b",
                  boxShadow: "0 0 12px rgba(245,158,11,0.5)",
                }}
              />
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-amber-400">
                Planning Phase
              </span>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-5">
              Give the model maximum creative freedom. Focus on <em>what</em> and <em>why</em>, not <em>how</em>.
            </p>

            <ul className="space-y-3">
              {[
                "High-level goals",
                "Purpose and intent",
                "Desired end state",
                "Target user experience",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-400">
                  <span className="text-amber-400 mt-0.5">&#x25CB;</span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-5 pt-4 border-t border-white/5 text-xs text-slate-500 italic">
              &ldquo;Less seafood, lots of veggies&rdquo;
            </div>
          </div>

          {/* Execution phase */}
          <div
            className="rounded-2xl p-5 md:p-7 border transition-all duration-500"
            style={{
              borderColor:
                phase === "execute"
                  ? "rgba(244,63,94,0.3)"
                  : "rgba(255,255,255,0.05)",
              background:
                phase === "execute"
                  ? "rgba(244,63,94,0.06)"
                  : "rgba(255,255,255,0.02)",
              transform: phase === "execute" ? "scale(1.02)" : "scale(0.98)",
              opacity: phase === "execute" ? 1 : 0.5,
            }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  background: "#f43f5e",
                  boxShadow: "0 0 12px rgba(244,63,94,0.5)",
                }}
              />
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-rose-400">
                Execution Phase
              </span>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-5">
              Now get extremely specific. Turn the plan into detailed marching orders.
            </p>

            <ul className="space-y-3">
              {[
                "Epics with clear scope",
                "Tasks with acceptance criteria",
                "Subtasks for each step",
                "Specific implementation details",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-400">
                  <span className="text-rose-400 mt-0.5">&#x25A0;</span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-5 pt-4 border-t border-white/5 text-xs text-slate-500 italic">
              &ldquo;Make a good pastrami sandwich&rdquo;
            </div>
          </div>
        </div>

        {/* Arrow / flow */}
        <div className="flex items-center justify-center gap-3 mt-6 text-xs text-slate-500">
          <span className="font-mono text-amber-400/60">WIDE &amp; OPEN</span>
          <svg width="60" height="12" viewBox="0 0 60 12" className="text-slate-600">
            <line x1="0" y1="6" x2="50" y2="6" stroke="currentColor" strokeWidth="1" />
            <path d="M48 2 L56 6 L48 10" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
          <span className="font-mono text-rose-400/60">NARROW &amp; PRECISE</span>
        </div>
      </div>
    </div>
  );
}
