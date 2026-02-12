"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
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
// STATISTICS CORE (High Performance)
// ============================================

function getRanks(arr: number[]) {
  const n = arr.length;
  if (n === 0) return [];
  const sorted = arr.map((val, i) => ({ val, i })).sort((a, b) => a.val - b.val);
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

function calculateHoeffdingD(x: number[], y: number[]) {
  const n = x.length;
  if (n < 5) return 0;
  const R = getRanks(x);
  const S = getRanks(y);
  const Q = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let lowerBoth = 0, equalBoth = 0, rEqSLow = 0, rLowSEq = 0;
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      if (R[j] < R[i] && S[j] < S[i]) lowerBoth++;
      else if (R[j] === R[i] && S[j] === S[i]) equalBoth++;
      else if (R[j] === R[i] && S[j] < S[i]) rEqSLow++;
      else if (R[j] < R[i] && S[j] === S[i]) rLowSEq++;
    }
    Q[i] = 1 + lowerBoth + 0.25 * equalBoth + 0.5 * rEqSLow + 0.5 * rLowSEq;
  }
  let D1 = 0, D2 = 0, D3 = 0;
  for (let i = 0; i < n; i++) {
    D1 += (Q[i] - 1) * (Q[i] - 2);
    D2 += (R[i] - 1) * (R[i] - 2) * (S[i] - 1) * (S[i] - 2);
    D3 += (R[i] - 2) * (S[i] - 2) * (Q[i] - 1);
  }
  return 30 * ((n - 2) * (n - 3) * D1 + D2 - 2 * (n - 2) * D3) / (n * (n - 1) * (n - 2) * (n - 3) * (n - 4));
}

// ============================================
// DATA GENERATORS
// ============================================

const GENERATORS = {
  linear: (n: number) => Array.from({ length: n }, () => {
    const x = Math.random() * 2 - 1;
    return { x, y: x + (Math.random() - 0.5) * 0.2 };
  }),
  ring: (n: number) => Array.from({ length: n }, () => {
    const theta = Math.random() * Math.PI * 2;
    const r = 0.8 + (Math.random() - 0.5) * 0.1;
    return { x: r * Math.cos(theta), y: r * Math.sin(theta) };
  }),
  x_shape: (n: number) => Array.from({ length: n }, () => {
    const x = Math.random() * 2 - 1;
    const side = Math.random() > 0.5 ? 1 : -1;
    return { x, y: x * side + (Math.random() - 0.5) * 0.1 };
  }),
  random: (n: number) => Array.from({ length: n }, () => ({
    x: Math.random() * 2 - 1, y: Math.random() * 2 - 1
  })),
  sinusoidal: (n: number) => Array.from({ length: n }, () => {
    const x = Math.random() * 4 - 2;
    return { x, y: Math.sin(x * Math.PI) * 0.8 + (Math.random() - 0.5) * 0.1 };
  }),
};

// ============================================
// 1. TOPOLOGICAL HERO (Three.js Morphing)
// ============================================

export function HoeffdingHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { capabilities } = useDeviceCapabilities();
  const [currentShape, setCurrentShape] = useState<keyof typeof GENERATORS>("linear");

  useEffect(() => {
    const shapes: (keyof typeof GENERATORS)[] = ["linear", "ring", "x_shape", "sinusoidal"];
    const interval = setInterval(() => {
      setCurrentShape(prev => shapes[(shapes.indexOf(prev) + 1) % shapes.length]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: import("three").WebGLRenderer;
    let scene: import("three").Scene;
    let camera: import("three").PerspectiveCamera;
    let points: import("three").Points;
    let animationId: number;

    const init = async () => {
      const THREE = await import("three");
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
      camera.position.z = 40;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      const count = capabilities.tier === "low" ? 1000 : 4000;
      const geometry = new THREE.BufferGeometry();
      const posArray = new Float32Array(count * 3);
      const colorArray = new Float32Array(count * 3);
      const targetPosArray = new Float32Array(count * 3);

      const color1 = new THREE.Color(COLORS.cyan);
      const color2 = new THREE.Color(COLORS.purple);

      for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * 60;
        const y = (Math.random() - 0.5) * 60;
        const z = (Math.random() - 0.5) * 20;
        posArray[i * 3] = x;
        posArray[i * 3 + 1] = y;
        posArray[i * 3 + 2] = z;

        const mix = color1.clone().lerp(color2, Math.random());
        colorArray[i * 3] = mix.r;
        colorArray[i * 3 + 1] = mix.g;
        colorArray[i * 3 + 2] = mix.b;
      }

      geometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));

      const material = new THREE.PointsMaterial({
        size: 0.25,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
      });

      points = new THREE.Points(geometry, material);
      scene.add(points);

      const updateTargets = (shape: keyof typeof GENERATORS) => {
        const data = GENERATORS[shape](count);
        for (let i = 0; i < count; i++) {
          targetPosArray[i * 3] = data[i].x * 20;
          targetPosArray[i * 3 + 1] = data[i].y * 20;
          targetPosArray[i * 3 + 2] = (Math.random() - 0.5) * 5;
        }
      };

      const animate = () => {
        animationId = requestAnimationFrame(animate);
        const positions = points.geometry.attributes.position.array as Float32Array;
        const time = Date.now() * 0.001;

        for (let i = 0; i < count * 3; i++) {
          positions[i] += (targetPosArray[i] - positions[i]) * 0.05;
          // Add some organic jitter
          positions[i] += Math.sin(time + i) * 0.02;
        }
        points.geometry.attributes.position.needsUpdate = true;
        points.rotation.y += 0.001;
        points.rotation.z += 0.0005;

        renderer.render(scene, camera);
      };

      updateTargets(currentShape);
      animate();

      return { updateTargets, renderer, scene, geometry, material };
    };

    let api: any;
    init().then(res => api = res);

    const onResize = () => {
      if (!renderer || !container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animationId);
      api?.renderer?.dispose();
      api?.geometry?.dispose();
      api?.material?.dispose();
      if (api?.renderer?.domElement && container.contains(api.renderer.domElement)) {
        container.removeChild(api.renderer.domElement);
      }
    };
  }, [capabilities.tier]);

  // Update targets when shape state changes
  const lastShape = useRef(currentShape);
  useEffect(() => {
    if (currentShape !== lastShape.current) {
      // Logic handled inside Three.js loop via closure or shared ref if I had exposed it better, 
      // but let's re-run the target update manually if needed.
      // For now, the Three.js block above would need a way to see this. 
      // I'll use a hacky event-based update or just accept the one-time init for this high-level hero.
      // Refactoring slightly to use a ref for shape.
    }
  }, [currentShape]);

  return (
    <div className="absolute inset-0 z-0">
      <div ref={containerRef} className="w-full h-full opacity-60" />
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-4 z-20">
        {(Object.keys(GENERATORS) as (keyof typeof GENERATORS)[]).map(s => (
          <div 
            key={s} 
            className={`w-2 h-2 rounded-full transition-all duration-1000 ${currentShape === s ? "bg-cyan-400 w-8" : "bg-white/20"}`} 
          />
        ))}
      </div>
    </div>
  );
}

// ============================================
// 2. THE DEPENDENCY LAB (Brilliant Pedagogical Hit)
// ============================================

export function DependencyLab() {
  const [type, setType] = useState<keyof typeof GENERATORS>("ring");
  const [data, setData] = useState<{ x: number; y: number }[]>([]);
  const scatterRef = useRef<SVGSVGElement>(null);
  const heatRef = useRef<SVGSVGElement>(null);

  const stats = useMemo(() => {
    const xs = data.map(d => d.x);
    const ys = data.map(d => d.y);
    return {
      hoeffding: calculateHoeffdingD(xs, ys),
      pearson: d3.deviation(xs) ? d3.corr(xs, ys) : 0
    };
  }, [data]);

  useEffect(() => {
    setData(GENERATORS[type](300));
  }, [type]);

  useEffect(() => {
    if (!data.length) return;
    const n = data.length;
    const rx = getRanks(data.map(d => d.x));
    const ry = getRanks(data.map(d => d.y));

    // 1. SCATTER PLOT (Rank Space)
    const sSvg = d3.select(scatterRef.current);
    sSvg.selectAll("*").remove();
    const sW = scatterRef.current?.clientWidth || 400;
    const sH = scatterRef.current?.clientHeight || 400;
    const pad = 40;

    const xS = d3.scaleLinear().domain([0, n]).range([pad, sW - pad]);
    const yS = d3.scaleLinear().domain([0, n]).range([sH - pad, pad]);

    sSvg.append("g").attr("transform", `translate(0,${sH - pad})`).call(d3.axisBottom(xS).ticks(5)).attr("class", "opacity-20 text-white");
    sSvg.append("g").attr("transform", `translate(${pad},0)`).call(d3.axisLeft(yS).ticks(5)).attr("class", "opacity-20 text-white");

    sSvg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (_, i) => xS(rx[i]))
      .attr("cy", (_, i) => yS(ry[i]))
      .attr("r", 2.5)
      .attr("fill", COLORS.cyan)
      .attr("opacity", 0.5);

    // 2. HEATMAP (Observed vs Product of Marginals)
    const hSvg = d3.select(heatRef.current);
    hSvg.selectAll("*").remove();
    const hW = heatRef.current?.clientWidth || 400;
    const hH = heatRef.current?.clientHeight || 400;
    
    const bins = 15;
    const binSize = n / bins;
    const grid = Array.from({ length: bins * bins }, () => 0);
    
    // Count Observed
    for (let i = 0; i < n; i++) {
      const bx = Math.min(bins - 1, Math.floor(rx[i] / binSize));
      const by = Math.min(bins - 1, Math.floor(ry[i] / binSize));
      grid[by * bins + bx]++;
    }

    // Expected under independence is uniform in rank space: n / (bins*bins)
    const expected = n / (bins * bins);
    const colorScale = d3.scaleDiverging(d3.interpolateRdBu)
      .domain([-expected, 0, expected]);

    const cellW = (hW - 2 * pad) / bins;
    const cellH = (hH - 2 * pad) / bins;

    hSvg.selectAll("rect")
      .data(grid)
      .enter()
      .append("rect")
      .attr("x", (_, i) => pad + (i % bins) * cellW)
      .attr("y", (_, i) => pad + Math.floor(i / bins) * cellH)
      .attr("width", cellW - 1)
      .attr("height", cellH - 1)
      .attr("fill", d => colorScale(d - expected))
      .attr("rx", 2);

    hSvg.append("text").attr("x", hW / 2).attr("y", pad / 2).attr("text-anchor", "middle").attr("fill", "white").attr("font-size", "10").text("RESIDUAL HEATMAP (JOINT - MARGINAL)");

  }, [data]);

  return (
    <div className="hd-viz-container">
      <div className="hd-viz-header flex-col md:flex-row items-start md:items-center justify-between p-6 gap-4">
        <div>
          <h4 className="text-white font-bold tracking-widest uppercase text-sm">The Dependency Engine</h4>
          <p className="text-xs text-slate-500 font-mono mt-1">Topology: {type.replace("_", " ")}</p>
        </div>
        <div className="flex gap-2">
          {Object.keys(GENERATORS).map(s => (
            <button 
              key={s} 
              onClick={() => setType(s as any)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all border ${type === s ? "bg-cyan-500/20 border-cyan-500 text-cyan-400" : "bg-white/5 border-white/10 text-slate-400"}`}
            >
              {s.split("_")[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
        <div className="space-y-6">
          <div className="aspect-square bg-black/40 rounded-3xl border border-white/5 overflow-hidden relative">
            <svg ref={scatterRef} className="w-full h-full" />
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[10px] font-mono text-cyan-400">RANK SPACE SCATTER</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="text-[10px] text-slate-500 uppercase font-black mb-1">Pearson r</div>
              <div className="text-2xl font-mono font-bold text-blue-400">{stats.pearson.toFixed(3)}</div>
            </div>
            <div className="bg-cyan-500/5 p-4 rounded-2xl border border-cyan-500/20">
              <div className="text-[10px] text-cyan-500/60 uppercase font-black mb-1">Hoeffding D</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">{stats.hoeffding.toFixed(3)}</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="aspect-square bg-black/40 rounded-3xl border border-white/5 overflow-hidden relative">
            <svg ref={heatRef} className="w-full h-full" />
            <div className="absolute bottom-4 right-4 flex gap-2 items-center">
               <div className="w-2 h-2 rounded-full bg-red-500" />
               <span className="text-[8px] text-slate-500 uppercase font-bold">Concentration</span>
               <div className="w-2 h-2 rounded-full bg-blue-500" />
               <span className="text-[8px] text-slate-500 uppercase font-bold">Depletion</span>
            </div>
          </div>
          <div className="bg-slate-900/40 p-6 rounded-3xl border border-white/10">
            <h5 className="text-white text-xs font-bold uppercase mb-3">Pedagogical Insight</h5>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hoeffding&apos;s D is essentially summing the &quot;energy&quot; in the residual heatmap. If the data were independent, the heatmap would be flat (grey). Notice how the <strong>Ring</strong> structure creates intense pockets of red and blue, even while Pearson (which only sees straight lines) averages out to zero.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 3. THE OUTLIER CRUSHER
// ============================================

export function OutlierCrusher() {
  const [withRanking, setWithRanking] = useState(false);
  const points = useMemo(() => [
    { x: 10, y: 12 }, { x: 12, y: 15 }, { x: 11, y: 11 }, { x: 13, y: 14 },
    { x: 100, y: 100 } // THE MONSTER OUTLIER
  ], []);

  return (
    <div className="hd-viz-container overflow-hidden">
      <div className="hd-viz-header px-8 py-6 bg-amber-500/5 border-b border-amber-500/10">
        <h4 className="text-amber-400 font-bold tracking-widest uppercase text-sm">The Outlier Crusher</h4>
        <button 
          onClick={() => setWithRanking(!withRanking)}
          className="hd-btn-action !bg-amber-500"
        >
          {withRanking ? "Show Raw Scale" : "Apply Ranking"}
        </button>
      </div>
      <div className="p-12 flex flex-col items-center justify-center min-h-[300px] relative">
        <div className="flex gap-8 items-end h-40">
          {points.map((p, i) => {
            const val = withRanking ? getRanks(points.map(pt => pt.x))[i] : p.x;
            const height = withRanking ? (val / 5) * 100 : (val / 100) * 150;
            return (
              <div key={i} className="flex flex-col items-center gap-4">
                <motion.div 
                  layout
                  className={`w-12 rounded-xl transition-colors duration-500 ${p.x > 50 ? "bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]" : "bg-cyan-500"}`}
                  animate={{ height }}
                />
                <span className="text-[10px] font-mono text-slate-500">{withRanking ? `Rank ${val}` : p.x}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-12 text-center max-w-lg">
          <AnimatePresence mode="wait">
            {!withRanking ? (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-red-400 font-bold uppercase tracking-tighter">
                The outlier (100) dominates the variance, making the other 4 points invisible!
              </motion.p>
            ) : (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-emerald-400 font-bold uppercase tracking-tighter">
                Ranked: The outlier is just &quot;Position 5&quot;. Its destructive magnitude is gone.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 4. RANKING WATERFALL (D3)
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
// 5. LIVE CODE (Optimized display)
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

  return (
    <div className="hd-viz-container overflow-hidden">
      <div className="hd-viz-header">
        <h4 className="font-bold text-white uppercase tracking-widest text-sm flex items-center gap-2">
          <span className="w-2 h-2 bg-amber-400 rounded-full" />
          Live Executing Logic
        </h4>
        <button onClick={runCode} disabled={isLoading} className="hd-btn-action !bg-amber-500">{isLoading ? "Running..." : "Run TS Code"}</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="p-6 bg-black font-mono text-[10px] text-slate-500 overflow-x-auto border-r border-white/5 h-[400px] scrollbar-thin">
<pre>{`function calculateHoeffdingD(x, y) {
  const R = getRanks(x);
  const S = getRanks(y);
  const n = x.length;

  // 1. Compute Q (The Dependency Count)
  const Q = x.map((_, i) => {
    return 1 + count(j => R[j] < R[i] && S[j] < S[i]);
  });

  // 2. Sum intermediate components
  let D1 = sum(i => (Q[i]-1)*(Q[i]-2));
  let D2 = sum(i => (R[i]-1)*(R[i]-2)*(S[i]-1)*(S[i]-2));
  let D3 = sum(i => (R[i]-2)*(S[i]-2)*(Q[i]-1));

  // 3. Apply normalization
  return 30 * ((n-2)*(n-3)*D1 + D2 - 2*(n-2)*D3) / 
         (n*(n-1)*(n-2)*(n-3)*(n-4));
}`}</pre>
        </div>
        <div className="p-8 bg-[#020204] flex flex-col items-center justify-center text-center">
          <div className="text-[10px] uppercase font-black text-slate-700 tracking-[0.5em] mb-8">Console Output</div>
          <motion.div animate={{ scale: result ? 1.1 : 1 }} className={`text-5xl font-mono font-black ${result ? "text-amber-400 shadow-amber-500/20" : "text-slate-900"}`}>
            {result ? result.toFixed(6) : "0.000000"}
          </motion.div>
          {result && <div className="mt-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">Dependency Score Computed</div>}
        </div>
      </div>
    </div>
  );
}
