"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "framer-motion";
import { useDeviceCapabilities } from "@/hooks/use-mobile-optimizations";

const COLORS = {
  bg: "#020204",
  cyan: "#22d3ee",
  purple: "#a855f7",
  blue: "#3b82f6",
  white: "#f8fafc",
  slate: "#64748b",
  emerald: "#10b981",
  red: "#ef4444",
  amber: "#f59e0b",
  pink: "#ec4899",
};

// ============================================
// STATISTICS HELPERS
// ============================================

function getRanks(arr: number[]) {
  const n = arr.length;
  if (n === 0) return [];
  const sorted = arr.map((val, i) => ({ val, i }))
    .sort((a, b) => a.val - b.val);
  const ranks = new Array(n);
  let i = 0;
  while (i < n) {
    let j = i;
    while (j < n && sorted[j].val === sorted[i].val) j++;
    const rank = (i + 1 + j) / 2;
    for (let k = i; k < j; k++) ranks[sorted[k].i] = rank;
    i = j;
  }
  return ranks;
}

function calculatePearson(x: number[], y: number[]) {
  const n = x.length;
  if (n === 0) return 0;
  const muX = d3.mean(x) || 0;
  const muY = d3.mean(y) || 0;
  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - muX;
    const dy = y[i] - muY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  if (denX === 0 || denY === 0) return 0;
  return num / Math.sqrt(denX * denY);
}

function calculateSpearman(x: number[], y: number[]) {
  const rx = getRanks(x);
  const ry = getRanks(y);
  return calculatePearson(rx, ry);
}

function calculateHoeffdingD(x: number[], y: number[]) {
  const n = x.length;
  if (n < 5) return 0;

  const R = getRanks(x);
  const S = getRanks(y);

  const Q = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let countBothLower = 0;
    let countBothEqual = 0;
    let countREqualSLower = 0;
    let countRLowerSEqual = 0;

    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      if (R[j] < R[i] && S[j] < S[i]) countBothLower++;
      else if (R[j] === R[i] && S[j] === S[i]) countBothEqual++;
      else if (R[j] === R[i] && S[j] < S[i]) countREqualSLower++;
      else if (R[j] < R[i] && S[j] === S[i]) countRLowerSEqual++;
    }
    Q[i] = 1 + countBothLower + 0.25 * countBothEqual + 0.5 * countREqualSLower + 0.5 * countRLowerSEqual;
  }

  let D1 = 0, D2 = 0, D3 = 0;
  for (let i = 0; i < n; i++) {
    D1 += (Q[i] - 1) * (Q[i] - 2);
    D2 += (R[i] - 1) * (R[i] - 2) * (S[i] - 1) * (S[i] - 2);
    D3 += (R[i] - 2) * (S[i] - 2) * (Q[i] - 1);
  }

  const D = 30 * ((n - 2) * (n - 3) * D1 + D2 - 2 * (n - 2) * D3) / (n * (n - 1) * (n - 2) * (n - 3) * (n - 4));
  return D;
}

// ============================================
// 1. DATASET GENERATORS
// ============================================

const GENERATORS = {
  linear: (n: number) => {
    return Array.from({ length: n }, () => {
      const x = Math.random() * 2 - 1;
      return { x, y: x + (Math.random() - 0.5) * 0.2 };
    });
  },
  quadratic: (n: number) => {
    return Array.from({ length: n }, () => {
      const x = Math.random() * 2 - 1;
      return { x, y: x * x + (Math.random() - 0.5) * 0.2 - 0.5 };
    });
  },
  ring: (n: number) => {
    return Array.from({ length: n }, () => {
      const theta = Math.random() * Math.PI * 2;
      const r = 0.7 + (Math.random() - 0.5) * 0.1;
      return { x: r * Math.cos(theta), y: r * Math.sin(theta) };
    });
  },
  x_shape: (n: number) => {
    return Array.from({ length: n }, () => {
      const x = Math.random() * 2 - 1;
      const side = Math.random() > 0.5 ? 1 : -1;
      return { x, y: x * side + (Math.random() - 0.5) * 0.1 };
    });
  },
  random: (n: number) => {
    return Array.from({ length: n }, () => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
    }));
  },
  sin: (n: number) => {
    return Array.from({ length: n }, () => {
      const x = Math.random() * 4 - 2;
      return { x, y: Math.sin(x * Math.PI) + (Math.random() - 0.5) * 0.2 };
    });
  }
};

type GeneratorType = keyof typeof GENERATORS;

// ============================================
// 2. CORRELATION EXPLORER
// ============================================

export function CorrelationExplorer() {
  const [type, setType] = useState<GeneratorType>("linear");
  const [data, setData] = useState<{ x: number; y: number }[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  const stats = useMemo(() => {
    if (data.length === 0) return { pearson: 0, spearman: 0, hoeffding: 0 };
    const xs = data.map(d => d.x);
    const ys = data.map(d => d.y);
    return {
      pearson: calculatePearson(xs, ys),
      spearman: calculateSpearman(xs, ys),
      hoeffding: calculateHoeffdingD(xs, ys),
    };
  }, [data]);

  const generate = useCallback(() => {
    setData(GENERATORS[type](200));
  }, [type]);

  useEffect(() => {
    generate();
  }, [generate]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    if (!svg.node()) return;
    svg.selectAll("*").remove();

    const width = svgRef.current?.clientWidth || 400;
    const height = svgRef.current?.clientHeight || 400;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    const x = d3.scaleLinear().domain([-1.2, 1.2]).range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain([-1.2, 1.2]).range([height - margin.bottom, margin.top]);

    svg.append("g")
      .attr("transform", `translate(0,${height / 2})`)
      .attr("class", "axis text-slate-800 opacity-20")
      .call(d3.axisBottom(x).ticks(0).tickSize(0));

    svg.append("g")
      .attr("transform", `translate(${width / 2},0)`)
      .attr("class", "axis text-slate-800 opacity-20")
      .call(d3.axisLeft(y).ticks(0).tickSize(0));

    svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.x))
      .attr("cy", d => y(d.y))
      .attr("r", 0)
      .attr("fill", COLORS.cyan)
      .attr("opacity", 0.6)
      .transition()
      .duration(500)
      .delay((_, i) => i * 2)
      .attr("r", 3);

  }, [data]);

  return (
    <div className="hd-viz-container">
      <div className="hd-viz-header">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-white text-base uppercase tracking-widest">Correlation Explorer</h4>
            <div className="text-[11px] text-slate-400 uppercase tracking-[0.2em] font-mono">Comparing Measures</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 md:p-10">
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(Object.keys(GENERATORS) as GeneratorType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                  type === t
                    ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                    : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                {t.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="bg-black/40 border border-white/5 rounded-3xl p-6 space-y-6">
             <StatBox label="Pearson Correlation" value={stats.pearson} color={COLORS.blue} description="Detects linear relationships." />
             <StatBox label="Spearman's Rho" value={stats.spearman} color={COLORS.purple} description="Detects monotonic relationships." />
             <StatBox label="Hoeffding's D" value={stats.hoeffding} color={COLORS.cyan} description="Detects any complex dependency." />
          </div>
        </div>

        <div className="relative aspect-square bg-black/20 rounded-3xl border border-white/5 overflow-hidden">
          <svg ref={svgRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color, description }: { label: string; value: number; color: string; description: string }) {
  return (
    <div className="group">
      <div className="flex justify-between items-end mb-2">
        <div>
          <div className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-1">{label}</div>
          <div className="text-xs text-slate-400 font-light">{description}</div>
        </div>
        <div className="text-2xl font-mono font-bold" style={{ color }}>
          {value.toFixed(3)}
        </div>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.abs(value) * 100}%` }}
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ============================================
// 3. RANKING VISUALIZER
// ============================================

export function RankingVisualizer() {
  const [items, setItems] = useState(() => [
    { id: Math.random(), val: 12 },
    { id: Math.random(), val: 45 },
    { id: Math.random(), val: 23 },
    { id: Math.random(), val: 89 },
    { id: Math.random(), val: 45 },
    { id: Math.random(), val: 34 },
  ]);

  const ranks = useMemo(() => getRanks(items.map(i => i.val)), [items]);

  const addVal = () => {
    if (items.length >= 10) return;
    setItems([...items, { id: Math.random(), val: Math.floor(Math.random() * 100) }]);
  };

  const removeVal = (id: number) => {
    setItems(items.filter((i) => i.id !== id));
  };

  return (
    <div className="hd-viz-container">
       <div className="hd-viz-header">
        <h4 className="font-bold text-white uppercase tracking-widest text-sm flex items-center gap-2">
          <span className="w-2 h-2 bg-purple-400 rounded-full" />
          Interactive: From Values to Ranks
        </h4>
        <button onClick={addVal} className="hd-btn-action">Add Value</button>
      </div>
      <div className="p-8 md:p-12 overflow-x-auto scrollbar-thin scrollbar-thumb-white/10">
        <div className="flex gap-4 min-w-max">
          <AnimatePresence mode="popLayout">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="flex flex-col items-center gap-4"
              >
                <div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl border-2 border-white/10 bg-white/5 flex items-center justify-center text-xl md:text-2xl font-black text-white cursor-pointer hover:border-red-500/50 hover:bg-red-500/10 transition-all group relative"
                  onClick={() => removeVal(item.id)}
                >
                  {item.val}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>

                <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />

                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl border-2 border-cyan-500/30 bg-cyan-500/10 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                   <div className="text-[10px] text-cyan-400/60 uppercase font-black tracking-widest mb-1">Rank</div>
                   <div className="text-xl md:text-2xl font-mono font-black text-cyan-400">
                    {ranks[i]}
                   </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      <div className="p-6 bg-white/[0.02] border-t border-white/5 text-sm text-slate-500 leading-relaxed">
        Ranks ignore the absolute scale of numbers. If we have ties (like 45 above), they both get the average of the ranks they would have occupied. This makes the measure <strong>robust to outliers</strong>.
      </div>
    </div>
  );
}

// ============================================
// 4. Q-VALUE CALCULATION
// ============================================

export function QValueViz() {
  const [points, setPoints] = useState(() => GENERATORS.ring(12));
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const ranks = useMemo(() => ({
    x: getRanks(points.map(p => p.x)),
    y: getRanks(points.map(p => p.y)),
  }), [points]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    if (!svg.node()) return;
    svg.selectAll("*").remove();

    const width = svgRef.current?.clientWidth || 600;
    const height = svgRef.current?.clientHeight || 400;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };

    const x = d3.scaleLinear().domain([0.5, points.length + 0.5]).range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain([0.5, points.length + 0.5]).range([height - margin.bottom, margin.top]);

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .attr("class", "text-slate-800 opacity-30")
      .call(d3.axisBottom(x).ticks(points.length));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .attr("class", "text-slate-800 opacity-30")
      .call(d3.axisLeft(y).ticks(points.length));

    if (hoveredIdx !== null) {
      const hX = x(ranks.x[hoveredIdx]);
      const hY = y(ranks.y[hoveredIdx]);

      // Quadrants
      svg.append("rect")
        .attr("x", margin.left)
        .attr("y", hY)
        .attr("width", hX - margin.left)
        .attr("height", height - margin.bottom - hY)
        .attr("fill", COLORS.emerald)
        .attr("opacity", 0.1);

      svg.append("line")
        .attr("x1", hX)
        .attr("y1", margin.top)
        .attr("x2", hX)
        .attr("y2", height - margin.bottom)
        .attr("stroke", COLORS.white)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4,4")
        .attr("opacity", 0.3);

      svg.append("line")
        .attr("x1", margin.left)
        .attr("y1", hY)
        .attr("x2", width - margin.right)
        .attr("y2", hY)
        .attr("stroke", COLORS.white)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4,4")
        .attr("opacity", 0.3);
    }

    svg.selectAll("circle")
      .data(points)
      .enter()
      .append("circle")
      .attr("cx", (_, i) => x(ranks.x[i]))
      .attr("cy", (_, i) => y(ranks.y[i]))
      .attr("r", (d, i) => i === hoveredIdx ? 8 : 5)
      .attr("fill", (d, i) => i === hoveredIdx ? COLORS.white : (hoveredIdx !== null && ranks.x[i] < ranks.x[hoveredIdx] && ranks.y[i] < ranks.y[hoveredIdx]) ? COLORS.emerald : COLORS.cyan)
      .attr("class", "cursor-pointer transition-all duration-300")
      .on("mouseenter", (_, d) => setHoveredIdx(points.indexOf(d)))
      .on("mouseleave", () => setHoveredIdx(null));

  }, [points, ranks, hoveredIdx]);

  return (
    <div className="hd-viz-container">
      <div className="hd-viz-header">
        <h4 className="font-bold text-white uppercase tracking-widest text-sm flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-400 rounded-full" />
          The Q-Value: Counting Concordance
        </h4>
        <button onClick={() => setPoints(GENERATORS.ring(12))} className="hd-btn-secondary">New Sample</button>
      </div>
      <div className="p-4 md:p-8 flex flex-col md:flex-row gap-8">
        <div className="flex-1 aspect-video md:aspect-square bg-black/40 rounded-3xl border border-white/5 relative overflow-hidden">
           <svg ref={svgRef} className="w-full h-full overflow-visible" />
           {hoveredIdx === null && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/80 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-2xl text-slate-300 text-sm animate-pulse">
                  Hover over a point to see its Q-calculation
                </div>
             </div>
           )}
        </div>
        <div className="w-full md:w-64 space-y-4">
           <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2">How it works</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                For each point, we count how many <em>other</em> points are below it in both X and Y ranks. This is the core of "joint distribution" comparison.
              </p>
           </div>
           {hoveredIdx !== null && (
             <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
             >
                <div className="text-[10px] uppercase font-black text-emerald-400 tracking-widest mb-2">Point Analysis</div>
                <div className="text-sm text-emerald-200 mb-1">Rank X: {ranks.x[hoveredIdx]}</div>
                <div className="text-sm text-emerald-200 mb-1">Rank Y: {ranks.y[hoveredIdx]}</div>
                <div className="text-xl font-mono font-black text-emerald-400 mt-4">
                  Q = {1 + points.filter((_, i) => ranks.x[i] < ranks.x[hoveredIdx] && ranks.y[i] < ranks.y[hoveredIdx]).length}
                </div>
             </motion.div>
           )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// 5. LIVE EXECUTING CODE
// ============================================

export function CodePlayground() {
  const [result, setResult] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runCode = () => {
    setIsLoading(true);
    setTimeout(() => {
      const x = [55, 62, 68, 70, 72, 65, 67, 78, 78, 78];
      const y = [125, 145, 160, 156, 190, 150, 165, 250, 250, 250];
      setResult(calculateHoeffdingD(x, y));
      setIsLoading(false);
    }, 800);
  };

  const codeString = `// Hoeffding's D Implementation
function calculateHoeffdingD(x: number[], y: number[]) {
  const n = x.length;
  const R = getRanks(x); // Average ranks helper
  const S = getRanks(y);

  const Q = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let lowerBoth = 0, equalBoth = 0;
    let rEqSLow = 0, rLowSEq = 0;

    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      if (R[j] < R[i] && S[j] < S[i]) lowerBoth++;
      else if (R[j] === R[i] && S[j] === S[i]) equalBoth++;
      else if (R[j] === R[i] && S[j] < S[i]) rEqSLow++;
      else if (R[j] < R[i] && S[j] === S[i]) rLowSEq++;
    }
    // Weighted handling for ties
    Q[i] = 1 + lowerBoth + 0.25*equalBoth + 0.5*rEqSLow + 0.5*rLowSEq;
  }

  // Calculate D1, D2, D3 components
  let D1 = 0, D2 = 0, D3 = 0;
  for (let i = 0; i < n; i++) {
    D1 += (Q[i] - 1) * (Q[i] - 2);
    D2 += (R[i] - 1) * (R[i] - 2) * (S[i] - 1) * (S[i] - 2);
    D3 += (R[i] - 2) * (S[i] - 2) * (Q[i] - 1);
  }

  // Final D calculation
  return 30 * ((n-2)*(n-3)*D1 + D2 - 2*(n-2)*D3) /
         (n*(n-1)*(n-2)*(n-3)*(n-4));
}

function getRanks(arr: number[]) {
  const sorted = arr.map((v, i) => ({ v, i })).sort((a,b) => a.v - b.v);
  const ranks = new Array(arr.length);
  let i = 0;
  while (i < arr.length) {
    let j = i;
    while (j < arr.length && sorted[j].v === sorted[i].v) j++;
    const rank = (i + 1 + j) / 2;
    for (let k = i; k < j; k++) ranks[sorted[k].i] = rank;
    i = j;
  }
  return ranks;
}`;

  return (
    <div className="hd-viz-container overflow-hidden">
      <div className="hd-viz-header">
        <h4 className="font-bold text-white uppercase tracking-widest text-sm flex items-center gap-2">
          <span className="w-2 h-2 bg-amber-400 rounded-full" />
          Live Implementation
        </h4>
        <button
          onClick={runCode}
          disabled={isLoading}
          className="hd-btn-action disabled:opacity-50"
        >
          {isLoading ? "Executing..." : "Run Code"}
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="p-6 md:p-8 bg-[#0a0a0c] font-mono text-[10px] md:text-xs text-slate-400 overflow-x-auto border-r border-white/5 max-h-[500px] scrollbar-thin scrollbar-thumb-white/10">
          <pre>{codeString}</pre>
        </div>
        <div className="p-8 md:p-12 bg-black flex flex-col items-center justify-center text-center">
          <div className="text-[10px] uppercase font-black text-slate-500 tracking-[0.5em] mb-8">Output Console</div>
          <div className={`text-5xl md:text-7xl font-mono font-black transition-all duration-700 ${result ? "text-amber-400 drop-shadow-[0_0_40px_rgba(245,158,11,0.3)]" : "text-slate-800"}`}>
            {result ? result.toFixed(6) : "0.000000"}
          </div>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-slate-400 text-sm max-w-xs"
            >
              Result for the 10-point height/weight sample from the article.
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// 6. HERO VISUALIZATION (Three.js)
// ============================================

export function HoeffdingHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { capabilities } = useDeviceCapabilities();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationId: number;
    let renderer: import("three").WebGLRenderer | undefined;

    const init = async () => {
      const THREE = await import("three");
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
      camera.position.z = 50;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      const count = capabilities.tier === "low" ? 800 : 3000;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const initialPositions = new Float32Array(count * 3);

      const color1 = new THREE.Color(COLORS.cyan);
      const color2 = new THREE.Color(COLORS.purple);

      for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const r = 20 + Math.random() * 5;
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        const z = (Math.random() - 0.5) * 10;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        initialPositions[i * 3] = x;
        initialPositions[i * 3 + 1] = y;
        initialPositions[i * 3 + 2] = z;

        const mix = color1.clone().lerp(color2, Math.random());
        colors[i * 3] = mix.r;
        colors[i * 3 + 1] = mix.g;
        colors[i * 3 + 2] = mix.b;
      }

      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 0.4,
        vertexColors: true,
        transparent: true,
        opacity: 0.5,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
      });

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      const animate = () => {
        animationId = requestAnimationFrame(animate);
        const time = Date.now() * 0.001;
        const pos = points.geometry.attributes.position.array as Float32Array;

        for (let i = 0; i < count; i++) {
          const ix = initialPositions[i * 3];
          const iy = initialPositions[i * 3 + 1];
          const iz = initialPositions[i * 3 + 2];

          pos[i * 3] = ix + Math.sin(time + iy * 0.1) * 3;
          pos[i * 3 + 1] = iy + Math.cos(time + ix * 0.1) * 3;
          pos[i * 3 + 2] = iz + Math.sin(time * 0.5 + ix * 0.05) * 5;
        }
        points.geometry.attributes.position.needsUpdate = true;
        points.rotation.z += 0.001;

        renderer?.render(scene, camera);
      };
      animate();

      const onResize = () => {
        if (!container || !renderer) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        cancelAnimationFrame(animationId);
        geometry.dispose();
        material.dispose();
        renderer?.dispose();
        if (renderer?.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    };

    let cleanup: (() => void) | undefined;
    init().then(c => cleanup = c);
    return () => cleanup?.();
  }, [capabilities.tier]);

  return <div ref={containerRef} className="absolute inset-0 z-0 opacity-60" />;
}
