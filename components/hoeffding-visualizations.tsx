"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "framer-motion";
import { useDeviceCapabilities } from "@/hooks/use-mobile-optimizations";
import { supportsWebGL } from "@/lib/utils";
import { Activity, Zap, Compass, Info, X, Settings2, ShieldCheck } from "lucide-react";

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
// STATISTICS CORE
// ============================================

function getRanks(arr: number[]) {
  const n = arr.length;
  if (n === 0) return [];
  const sorted = arr.map((val, i) => ({ val, i })).sort((a, b) => a.val - b.val);
  const ranks = new Array(n);
  let i = 0;
  while (i < n) {
    let j = i;
    while (j < n && Math.abs(sorted[j].val - sorted[i].val) <= 1e-12 * Math.max(1, Math.abs(sorted[j].val), Math.abs(sorted[i].val))) j++;
    const rank = (i + 1 + j) / 2;
    for (let k = i; k < j; k++) ranks[sorted[k].i] = rank;
    i = j;
  }
  return ranks;
}

function tieEqual(a: number, b: number, tol = 1e-12) {
  return Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
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
      else if (tieEqual(R[j], R[i]) && tieEqual(S[j], S[i])) equalBoth++;
      else if (tieEqual(R[j], R[i]) && S[j] < S[i]) rEqSLow++;
      else if (R[j] < R[i] && tieEqual(S[j], S[i])) rLowSEq++;
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
  sinusoidal: (n: number) => Array.from({ length: n }, () => {
    const x = Math.random() * 4 - 2;
    return { x, y: Math.sin(x * Math.PI) * 0.8 + (Math.random() - 0.5) * 0.1 };
  }),
  noise: (n: number) => Array.from({ length: n }, () => ({
    x: Math.random() * 2 - 1, y: Math.random() * 2 - 1
  })),
};

// Button labels match the words the prose uses ("select Ring", "for the Ring").
const GEN_LABELS: Record<string, string> = {
  linear: "Line",
  ring: "Ring",
  x_shape: "X",
  sinusoidal: "Sine",
  noise: "Noise",
};

const GEN_DESCRIPTIONS: Record<string, string> = {
  linear: "a straight line with light noise",
  ring: "a ring",
  x_shape: "two crossing lines (an X)",
  sinusoidal: "a sine wave",
  noise: "independent random noise",
};

// ============================================
// 1. INSTRUMENT HERO (Optimized Three.js)
// ============================================

export function HoeffdingHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { capabilities } = useDeviceCapabilities();
  const shapeRef = useRef<keyof typeof GENERATORS>("linear");
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    type HeroApi = {
      renderer: import("three").WebGLRenderer;
      camera: import("three").PerspectiveCamera;
      geometry: import("three").BufferGeometry;
      material: import("three").PointsMaterial;
    };

    let renderer: import("three").WebGLRenderer;
    let scene: import("three").Scene;
    let camera: import("three").PerspectiveCamera;
    let points: import("three").Points;
    let animationId = 0;
    let mounted = true;
    let api: HeroApi | null = null;
    // Visibility + motion gating for the 5 000-point loop.
    let visible = false;
    let running = false;
    let renderFrame: (() => void) | null = null;
    let startLoop: (() => void) | null = null;

    const reducedMotion =
      capabilities.prefersReducedMotion ||
      (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true);

    const count = capabilities.tier === "low" ? 1000 : 5000;
    const targetPosArray = new Float32Array(count * 3);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };
    let mouseBound = false;
    const bindMouse = () => {
      if (mouseBound || reducedMotion) return;
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      mouseBound = true;
    };
    const unbindMouse = () => {
      if (!mouseBound) return;
      window.removeEventListener("mousemove", handleMouseMove);
      mouseBound = false;
    };

    const init = async () => {
      const THREE = await import("three");
      if (!mounted) return;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
      camera.position.z = 45;

      if (!supportsWebGL()) return;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      } catch {
        return; // context creation failed — leave the static backdrop
      }
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      const geometry = new THREE.BufferGeometry();
      const posArray = new Float32Array(count * 3);
      const colorArray = new Float32Array(count * 3);

      const color1 = new THREE.Color(COLORS.cyan);
      const color2 = new THREE.Color(COLORS.purple);

      for (let i = 0; i < count; i++) {
        posArray[i * 3] = (Math.random() - 0.5) * 100;
        posArray[i * 3 + 1] = (Math.random() - 0.5) * 100;
        posArray[i * 3 + 2] = (Math.random() - 0.5) * 50;
        const mix = color1.clone().lerp(color2, Math.random());
        colorArray[i * 3] = mix.r;
        colorArray[i * 3 + 1] = mix.g;
        colorArray[i * 3 + 2] = mix.b;
      }

      geometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));

      const material = new THREE.PointsMaterial({
        size: 0.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.4,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
      });

      points = new THREE.Points(geometry, material);
      scene.add(points);

      const updateTargets = (currentShape: keyof typeof GENERATORS) => {
        const data = GENERATORS[currentShape](count);
        for (let i = 0; i < count; i++) {
          targetPosArray[i * 3] = data[i].x * 25;
          targetPosArray[i * 3 + 1] = data[i].y * 25;
          targetPosArray[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
      };

      let lastShape = "";
      const syncTargets = () => {
        if (shapeRef.current !== lastShape) {
          updateTargets(shapeRef.current);
          lastShape = shapeRef.current;
        }
      };

      // Reduced motion: snap straight to the target shape and render once.
      renderFrame = () => {
        if (!mounted) return;
        syncTargets();
        const positions = points.geometry.attributes.position.array as Float32Array;
        positions.set(targetPosArray);
        points.geometry.attributes.position.needsUpdate = true;
        renderer.render(scene, camera);
      };

      const animate = () => {
        if (!mounted || !visible) {
          running = false;
          return;
        }
        animationId = requestAnimationFrame(animate);
        syncTargets();

        const positions = points.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < count * 3; i++) {
          positions[i] += (targetPosArray[i] - positions[i]) * 0.03;
        }

        points.geometry.attributes.position.needsUpdate = true;
        points.rotation.y += 0.001 + mouseRef.current.x * 0.002;
        points.rotation.x += mouseRef.current.y * 0.001;

        renderer.render(scene, camera);
      };

      startLoop = () => {
        if (!mounted) return;
        if (reducedMotion) {
          renderFrame?.();
          return;
        }
        if (running) return;
        running = true;
        animate();
      };

      if (visible) {
        bindMouse();
        startLoop();
      }
      return { renderer, camera, geometry, material };
    };

    init().then(res => {
      if (!mounted) {
        res?.renderer?.dispose();
        res?.geometry?.dispose();
        res?.material?.dispose();
      } else if (res) {
        api = res;
      }
    });

    // Cycle the target shape every 5 s. Only the ref changes — nothing here
    // needs a React re-render.
    const shapes: (keyof typeof GENERATORS)[] = ["linear", "ring", "x_shape", "sinusoidal"];
    let shapeIndex = 0;
    const shapeInterval = setInterval(() => {
      shapeIndex = (shapeIndex + 1) % shapes.length;
      shapeRef.current = shapes[shapeIndex];
      if (reducedMotion && visible) renderFrame?.();
    }, 5000);

    // Start/stop the loop (and the global mousemove listener) with visibility.
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          visible = !!entry?.isIntersecting;
          if (visible) {
            bindMouse();
            startLoop?.();
          } else {
            unbindMouse();
            cancelAnimationFrame(animationId);
            running = false;
          }
        },
        { threshold: 0 }
      );
      observer.observe(container);
    } else {
      visible = true;
      bindMouse();
    }

    const onResize = () => {
      if (!api?.renderer || !container) return;
      api.camera.aspect = container.clientWidth / container.clientHeight;
      api.camera.updateProjectionMatrix();
      api.renderer.setSize(container.clientWidth, container.clientHeight);
      if (reducedMotion) renderFrame?.();
    };
    window.addEventListener("resize", onResize);

    return () => {
      mounted = false;
      clearInterval(shapeInterval);
      observer?.disconnect();
      unbindMouse();
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animationId);
      if (api?.renderer) {
        api.renderer.dispose();
        api.geometry.dispose();
        api.material.dispose();
        if (api.renderer.domElement && container.contains(api.renderer.domElement)) {
          container.removeChild(api.renderer.domElement);
        }
      }
    };
  }, [capabilities.tier, capabilities.prefersReducedMotion]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#020204] pointer-events-none" />
    </div>
  );
}

// ============================================
// 2. DEPENDENCY LAB
// ============================================

export function DependencyLab() {
  const [type, setType] = useState<keyof typeof GENERATORS>("ring");
  const [data, setData] = useState<{ x: number; y: number }[]>([]);
  const scatterRef = useRef<SVGSVGElement>(null);
  const heatRef = useRef<SVGSVGElement>(null);

  const stats = useMemo(() => {
    if (!data.length) return { hoeffding: 0, pearson: 0 };
    const xs = data.map(d => d.x);
    const ys = data.map(d => d.y);
    return {
      hoeffding: calculateHoeffdingD(xs, ys),
      pearson: calculatePearson(xs, ys)
    };
  }, [data]);

  useEffect(() => {
    setData(GENERATORS[type](400));
  }, [type]);

  useEffect(() => {
    if (!data.length) return;
    const n = data.length;
    const rx = getRanks(data.map(d => d.x));
    const ry = getRanks(data.map(d => d.y));

    const size = 400;
    const pad = 40;

    // SCATTER PLOT
    const sSvg = d3.select(scatterRef.current);
    sSvg.selectAll("*").remove();
    sSvg.attr("viewBox", `0 0 ${size} ${size}`);
    const scale = d3.scaleLinear().domain([0, n]).range([pad, size - pad]);

    sSvg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (_, i) => scale(rx[i]))
      .attr("cy", (_, i) => size - scale(ry[i]))
      .attr("r", 2)
      .attr("fill", COLORS.cyan)
      .attr("opacity", 0)
      .transition()
      .duration(800)
      .delay((_, i) => i * 1)
      .attr("opacity", 0.6);

    // HEATMAP
    const hSvg = d3.select(heatRef.current);
    hSvg.selectAll("*").remove();
    hSvg.attr("viewBox", `0 0 ${size} ${size}`);

    const bins = 20;
    const binSize = n / bins;
    const grid = Array.from({ length: bins * bins }, () => 0);
    for (let i = 0; i < n; i++) {
      const bx = Math.min(bins - 1, Math.floor(rx[i] / binSize));
      const by = Math.min(bins - 1, Math.floor(ry[i] / binSize));
      grid[by * bins + bx]++;
    }

    const expected = n / (bins * bins);
    // RdBu runs red -> blue as t goes 0 -> 1. We flip it so a positive
    // residual (more points than independence predicts, "excess") is red and
    // a deficit is blue, matching the legend below the map.
    const colorScale = d3.scaleDiverging((t: number) => d3.interpolateRdBu(1 - t))
      .domain([-expected * 2.5, 0, expected * 2.5]);

    const cell = (size - 2 * pad) / bins;

    hSvg.selectAll("rect")
      .data(grid)
      .enter()
      .append("rect")
      .attr("x", (_, i) => pad + (i % bins) * cell)
      .attr("y", (_, i) => size - pad - (Math.floor(i / bins) + 1) * cell)
      .attr("width", cell - 0.5)
      .attr("height", cell - 0.5)
      .attr("fill", COLORS.bg)
      .transition()
      .duration(1000)
      .delay((_, i) => i * 2)
      .attr("fill", d => colorScale(d - expected))
      .attr("rx", 1);

  }, [data]);

  const shapeDesc = GEN_DESCRIPTIONS[type];
  const scatterLabel = `Rank-space scatter plot of 400 points shaped like ${shapeDesc}. Pearson correlation ${stats.pearson.toFixed(3)}.`;
  const heatLabel = `Residual heatmap (observed minus expected counts in a 20 by 20 rank grid) for ${shapeDesc}. Red cells hold more points than independence predicts, blue cells fewer. Hoeffding's D ${stats.hoeffding.toFixed(3)}.`;

  return (
    <div className="hd-viz-container hd-glass-panel">
      <div className="flex flex-col md:flex-row border-b border-white/5 divide-y md:divide-y-0 md:divide-x divide-white/5">
        <div className="p-6 flex-1 flex items-center gap-4 border-b md:border-b-0 border-white/5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center animate-pulse">
            <Activity className="text-cyan-400 w-6 h-6" />
          </div>
          <div>
            <div className="hd-instrument-label mb-1">Signal Processing</div>
            <h3 className="text-white font-black text-lg uppercase tracking-tighter">Dependency Lab v2.0</h3>
          </div>
        </div>
        <div className="p-6 flex flex-wrap gap-2 bg-black/20" role="group" aria-label="Data shape">
          {(Object.keys(GENERATORS) as (keyof typeof GENERATORS)[]).map(s => (
            <button
              type="button"
              key={s}
              onClick={() => setType(s)}
              aria-pressed={type === s}
              className={`min-h-10 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap border focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${type === s ? "bg-cyan-400 text-black border-cyan-400" : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"}`}
            >
              {GEN_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/5">
        <div className="bg-[#020204] p-8 md:p-12 space-y-8 border-b lg:border-b-0 lg:border-r border-white/5">
          <div className="flex justify-between items-end gap-4">
            <div>
              <div className="hd-instrument-label mb-2">Workspace A</div>
              <h4 className="text-white font-bold text-xl uppercase tracking-tight italic text-balance">Linear Projection</h4>
            </div>
            <div className="text-right">
              <div className="hd-instrument-label mb-1">Pearson Correlation</div>
              <div className={`text-3xl font-mono font-black ${Math.abs(stats.pearson) > 0.5 ? "text-blue-400" : "text-slate-400"}`} aria-live="polite">
                {stats.pearson.toFixed(3)}
              </div>
            </div>
          </div>
          <div className="aspect-square hd-glass-panel rounded-[2rem] p-4 relative">
            <svg ref={scatterRef} className="w-full h-full" role="img" aria-label={scatterLabel} />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
               <div className="bg-black/80 backdrop-blur-xl px-4 py-1.5 rounded-full border border-cyan-500/30 text-[10px] text-cyan-400 font-mono tracking-widest uppercase whitespace-nowrap">Rank space (x rank vs y rank)</div>
            </div>
          </div>
        </div>

        <div className="bg-[#020204] p-8 md:p-12 space-y-8">
          <div className="flex justify-between items-end gap-4">
            <div>
              <div className="hd-instrument-label mb-2">Workspace B</div>
              <h4 className="text-white font-bold text-xl uppercase tracking-tight italic text-balance">Topological Density</h4>
            </div>
            <div className="text-right">
              <div className="hd-instrument-label mb-1 text-cyan-400">Hoeffding Dependency</div>
              <div className={`text-3xl font-mono font-black ${stats.hoeffding > 0.1 ? "text-cyan-400" : "text-slate-400"} drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]`} aria-live="polite">
                {stats.hoeffding.toFixed(3)}
              </div>
            </div>
          </div>
          <div className="aspect-square hd-glass-panel rounded-[2rem] p-4 relative overflow-hidden">
            <svg ref={heatRef} className="w-full h-full" role="img" aria-label={heatLabel} />
            {/* Heatmap legend — always visible (touch devices have no hover) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-[#b2182b] shadow-[0_0_10px_rgba(178,24,43,0.5)]" />
                 <span className="text-[10px] text-white font-black uppercase tracking-tight">Excess</span>
               </div>
               <div className="w-px h-3 bg-white/10" />
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-[#2166ac] shadow-[0_0_10px_rgba(33,102,172,0.5)]" />
                 <span className="text-[10px] text-white font-black uppercase tracking-tight">Deficit</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 bg-black/40 border-t border-white/5">
        <div className="flex items-start gap-4 max-w-3xl">
          <Zap className="text-amber-400 shrink-0 w-5 h-5 mt-1" />
          <p className="text-sm text-slate-400 leading-relaxed italic font-medium">
            <strong className="text-white not-italic font-black uppercase mr-2">Technician&apos;s Note:</strong>
            Hoeffding&apos;s D identifies dependency by integrating the &quot;energy&quot; within the residual heatmap. Pearson (Workspace A) only sees the average slope. If you select <span className="text-cyan-400 font-bold uppercase">Ring</span>, Pearson reports zero because the line averages out, but Workspace B shows intense pockets of structure.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 3. THE OUTLIER CRUSHER
// ============================================

export function OutlierCrusher() {
  const [mode, setMode] = useState<"raw" | "ranked">("raw");
  const points = useMemo(() => [
    { x: 10, y: 12 }, { x: 12, y: 15 }, { x: 11, y: 11 }, { x: 13, y: 14 },
    { x: 100, y: 100 }
  ], []);

  const ranks = useMemo(() => getRanks(points.map(p => p.x)), [points]);

  return (
    <div className="hd-viz-container hd-glass-panel">
      <div className="p-4 md:p-8 flex flex-wrap items-center justify-between gap-3 border-b border-white/5">
        <div>
          <div className="hd-instrument-label mb-1">Stress Test</div>
          <h3 className="text-white font-black text-lg uppercase tracking-tight italic">Magnitude Sanitization</h3>
        </div>
        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 w-full sm:w-auto justify-center" role="group" aria-label="View mode">
          {(["raw", "ranked"] as const).map(m => (
            <button
              type="button"
              key={m}
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={`min-h-10 px-3 md:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${mode === m ? "bg-amber-500 text-black shadow-lg" : "text-slate-500 hover:text-white"}`}
            >
              {m} View
            </button>
          ))}
        </div>
      </div>

      <div
        className="p-12 md:p-20 flex justify-center items-end h-[400px] gap-4 md:gap-12 relative"
        role="img"
        aria-label={mode === "raw"
          ? "Bar chart of five raw x values: 10, 12, 11, 13 and an outlier at 100 that towers over the rest."
          : "Bar chart of the same five values as ranks 1 to 5; the outlier is simply rank 5 and the bars are evenly stepped."}
      >
        <AnimatePresence mode="popLayout">
          {points.map((p, i) => {
            const val = mode === "ranked" ? ranks[i] : p.x;
            const h = mode === "ranked" ? (val / 5) * 200 : (val / 100) * 250;
            const isOutlier = p.x > 50;

            return (
              <motion.div
                key={i}
                layout
                className="flex flex-col items-center gap-6"
              >
                <motion.div
                  initial={false}
                  animate={{
                    height: h,
                    backgroundColor: isOutlier ? (mode === "raw" ? COLORS.red : COLORS.emerald) : COLORS.cyan,
                    boxShadow: isOutlier && mode === "raw" ? "0 0 40px rgba(239,68,68,0.4)" : "none"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-12 md:w-16 rounded-2xl md:rounded-[1.5rem]"
                />
                <motion.span
                  animate={{ opacity: 1 }}
                  className="text-xs font-mono font-black text-slate-400"
                >
                  {mode === "ranked" ? `Rank ${val}` : p.x}
                </motion.span>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden" aria-hidden="true">
           <div className="text-[12rem] font-black tracking-tighter uppercase leading-none">{mode}</div>
        </div>
      </div>

      <div className="p-10 bg-amber-500/5 border-t border-amber-500/10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex gap-4">
          <Compass className="text-amber-400 shrink-0 mt-1" />
          <p className="text-xs text-slate-400 leading-relaxed text-pretty">
            In <strong className="text-white uppercase tracking-widest font-black text-balance">Raw View</strong>, the outlier at 100 consumes 90% of the vertical space. To a linear correlation, the other 4 points effectively vanish into noise.
          </p>
        </div>
        <div className="flex gap-4">
          <ShieldCheck className="text-emerald-400 shrink-0 mt-1" />
          <p className="text-xs text-slate-400 leading-relaxed text-pretty">
            In <strong className="text-white uppercase tracking-widest font-black text-balance">Ranked View</strong>, the outlier is just &quot;Position 5&quot;. Magnitude is neutralized, and the intrinsic relationship between the remaining points is preserved.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 4. RANKING WATERFALL
// ============================================

export function RankingVisualizer() {
  const [items, setItems] = useState(() => [
    { id: "1", val: 12 },
    { id: "2", val: 45 },
    { id: "3", val: 23 },
    { id: "4", val: 89 },
    { id: "5", val: 45 },
    { id: "6", val: 34 },
  ]);

  const ranks = useMemo(() => getRanks(items.map(i => i.val)), [items]);

  const addVal = () => {
    if (items.length >= 10) return;
    setItems([...items, { id: Math.random().toString(), val: Math.floor(Math.random() * 100) }]);
  };

  const removeVal = (id: string) => {
    if (items.length <= 2) return;
    setItems(items.filter((i) => i.id !== id));
  };

  const canRemove = items.length > 2;

  return (
    <div className="hd-viz-container hd-glass-panel">
      <div className="hd-viz-header p-4 md:p-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="hd-instrument-label mb-1">Data Pipeline</div>
          <h3 className="text-white font-black text-lg uppercase tracking-tighter italic">Linear Compression</h3>
        </div>
        <button
          type="button"
          onClick={addVal}
          disabled={items.length >= 10}
          className="hd-btn-action !px-4 md:!px-10 !bg-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.3)] disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
        >
          {items.length >= 10 ? "Pipeline Full (10)" : "Inject Data"}
        </button>
      </div>
      <div className="p-8 md:p-16">
        <ul className="flex gap-4 md:gap-6 items-center flex-wrap justify-center list-none m-0 p-0" aria-label="Values and their ranks">
          <AnimatePresence mode="popLayout">
            {items.map((item, i) => (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.5, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.2, y: 40 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="flex flex-col items-center gap-6"
              >
                <button
                  type="button"
                  onClick={() => removeVal(item.id)}
                  disabled={!canRemove}
                  aria-label={`Remove value ${item.val} (rank ${ranks[i]})`}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-[2.5rem] hd-glass-panel flex items-center justify-center text-2xl md:text-3xl font-black text-white cursor-pointer hover:border-red-500/50 transition-all group relative hd-glow-cyan disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                >
                  <span className="group-hover:opacity-20 group-focus-visible:opacity-20 transition-opacity">{item.val}</span>
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity" aria-hidden="true">
                    <X className="w-6 h-6 text-red-500" />
                  </span>
                  {/* Persistent affordance so touch users know the node is removable */}
                  <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-black/80 border border-white/15 flex items-center justify-center text-slate-300" aria-hidden="true">
                    <X className="w-3 h-3" />
                  </span>
                </button>

                <motion.div
                  className="w-px h-12 bg-gradient-to-b from-cyan-500 to-purple-500"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  aria-hidden="true"
                />

                <div className="w-20 h-20 md:w-24 md:h-24 rounded-[2.5rem] hd-glass-panel border-purple-500/30 bg-purple-500/10 flex flex-col items-center justify-center hd-glow-purple">
                   <div className="hd-instrument-label text-purple-400 opacity-100 scale-75 mb-1">Rank</div>
                   <div className="text-2xl md:text-3xl font-mono font-black text-purple-400">
                    {ranks[i]}
                   </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
      <div className="p-8 bg-black/40 border-t border-white/5">
         <div className="flex gap-4">
            <Info className="text-slate-500 shrink-0 w-5 h-5 mt-1" />
            <p className="text-xs text-slate-400 leading-relaxed font-medium italic text-pretty">
              Tap a node to remove it from the pipeline (at least two stay). Ranking ensures that the <strong className="text-white uppercase tracking-widest font-black not-italic text-balance">relative ordinality</strong> remains static even if the numeric values are wildly disparate. This is the cornerstone of non-parametric robustness.
            </p>
         </div>
      </div>
    </div>
  );
}

// ============================================
// 5. LIVE CODE (TypeScript Runtime)
// ============================================

const PLAYGROUND_X = [55, 62, 68, 70, 72, 65, 67, 78, 78, 78];
const PLAYGROUND_Y = [125, 145, 160, 156, 190, 150, 165, 250, 250, 250];

// The code shown is the tie-aware implementation this page actually runs
// (see calculateHoeffdingD above), so the printed number is reproducible.
const CODE_STR = `// Hoeffding's D with average ranks and tie-aware Q (as executed here)
function rankdata(arr) {           // average ranks, ties share a rank
  const s = arr.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
  const ranks = new Array(arr.length);
  for (let i = 0; i < s.length; ) {
    let j = i;
    while (j < s.length && s[j].v === s[i].v) j++;
    const rank = (i + 1 + j) / 2;
    for (let k = i; k < j; k++) ranks[s[k].i] = rank;
    i = j;
  }
  return ranks;
}

function hoeffdingD(x, y) {
  const n = x.length;
  const R = rankdata(x), S = rankdata(y);
  const Q = new Array(n);
  for (let i = 0; i < n; i++) {
    let both = 0, eqBoth = 0, rEq = 0, sEq = 0;
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      if (R[j] < R[i] && S[j] < S[i]) both++;
      else if (R[j] === R[i] && S[j] === S[i]) eqBoth++;
      else if (R[j] === R[i] && S[j] < S[i]) rEq++;
      else if (R[j] < R[i] && S[j] === S[i]) sEq++;
    }
    Q[i] = 1 + both + 0.25 * eqBoth + 0.5 * rEq + 0.5 * sEq;
  }
  let D1 = 0, D2 = 0, D3 = 0;
  for (let i = 0; i < n; i++) {
    D1 += (Q[i] - 1) * (Q[i] - 2);
    D2 += (R[i] - 1) * (R[i] - 2) * (S[i] - 1) * (S[i] - 2);
    D3 += (R[i] - 2) * (S[i] - 2) * (Q[i] - 1);
  }
  return 30 * ((n - 2) * (n - 3) * D1 + D2 - 2 * (n - 2) * D3)
           / (n * (n - 1) * (n - 2) * (n - 3) * (n - 4));
}

const x = [${PLAYGROUND_X.join(", ")}];
const y = [${PLAYGROUND_Y.join(", ")}];
hoeffdingD(x, y);`;

export function CodePlayground() {
  const [result, setResult] = useState<number | null>(null);

  const runCode = () => {
    setResult(calculateHoeffdingD(PLAYGROUND_X, PLAYGROUND_Y));
  };

  return (
    <div className="hd-viz-container hd-glass-panel">
      <div className="hd-viz-header p-4 md:p-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="hd-instrument-label mb-1">Runtime Environment</div>
          <h3 className="text-white font-black text-lg uppercase tracking-tighter italic">TypeScript Kernel</h3>
        </div>
        <button
          type="button"
          onClick={runCode}
          className="hd-btn-action !bg-amber-500 !px-4 md:!px-12 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(245,158,11,0.2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        >
          {result === null ? "Execute Logic" : "Run Again"}
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/5 bg-black/40">
        {/* tabIndex: this pane scrolls in both axes and must be keyboard-scrollable. */}
        <div tabIndex={0} className="p-8 font-mono text-xs leading-relaxed text-slate-400 overflow-auto max-h-[450px] scrollbar-thin">
          <pre className="m-0"><code>{CODE_STR}</code></pre>
        </div>
        <div className="p-12 md:p-20 flex flex-col items-center justify-center text-center">
          <div className="hd-instrument-label mb-12 tracking-[0.5em]">Output</div>
          <AnimatePresence mode="wait">
            {result === null ? (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/10 animate-spin flex items-center justify-center" aria-hidden="true">
                   <Settings2 className="text-white/10 w-8 h-8" />
                </div>
                <span className="mt-8 text-slate-400 font-mono text-xs uppercase tracking-widest">Ready — press Execute Logic</span>
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
                aria-live="polite"
              >
                <div className="text-6xl md:text-8xl font-mono font-black text-amber-400 drop-shadow-[0_0_40px_rgba(245,158,11,0.4)]">
                  {result.toFixed(6)}
                </div>
                <div className="text-[10px] text-amber-500/80 font-black uppercase tracking-widest font-mono">Hoeffding&apos;s D for the 10-point toy dataset</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
