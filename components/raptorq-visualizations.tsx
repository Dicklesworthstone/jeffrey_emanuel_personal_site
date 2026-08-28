"use client";

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type RefObject,
} from "react";
import type { Simulation } from "d3";
import { useDeviceCapabilities } from "@/hooks/use-mobile-optimizations";
import { supportsWebGL } from "@/lib/utils";
import { RaptorQMathTooltip } from "./raptorq-math-tooltip";

type D3 = typeof import("d3");

const COLORS = {
  bg: "#020204",
  cyan: "#22d3ee",
  purple: "#a855f7",
  blue: "#3b82f6",
  white: "#f1f5f9",
  slate: "#64748b",
  emerald: "#10b981",
  red: "#ef4444",
  amber: "#f59e0b",
};

const AXIS_COLOR = "#64748b";
const AXIS_FONT = 12;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Lazy-init helper using IntersectionObserver
function useIntersectionInit(callback: () => (() => void) | void) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const cleanupRef = useRef<(() => void) | void>(undefined);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !initialized.current) {
          initialized.current = true;
          cleanupRef.current = callback();
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cleanupRef.current?.();
    };
  }, [callback]);

  return containerRef;
}

// rAF-coalesced ResizeObserver; fires only when the box size actually changes.
function useElementResize(
  ref: RefObject<HTMLElement | null>,
  onResize: () => void
) {
  const callbackRef = useRef(onResize);
  useEffect(() => {
    callbackRef.current = onResize;
  }, [onResize]);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    let raf: number | null = null;
    let last = { w: el.clientWidth, h: el.clientHeight };
    const observer = new ResizeObserver(() => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w === last.w && h === last.h) return;
      last = { w, h };
      if (raf !== null) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = null;
        callbackRef.current();
      });
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [ref]);
}

// ============================================
// 1. HERO PARTICLES (Three.js)
// ============================================
export function HeroParticles() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { capabilities } = useDeviceCapabilities();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!supportsWebGL()) return;

    let mounted = true;
    let animationId: number | null = null;
    let visible = false;
    let reducedMotion = prefersReducedMotion();
    const tier = capabilities.tier;
    type HeroApi = { dispose: () => void };
    let api: HeroApi | null = null;

    const init = async (): Promise<HeroApi | undefined> => {
      const THREE = await import("three");
      if (!mounted) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / Math.max(1, container.clientHeight),
        0.1,
        1000
      );
      camera.position.z = 55;
      camera.position.y = 12;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
      } catch {
        return; // context creation failed — leave the static backdrop
      }
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      const count = tier === "low" ? 1000 : tier === "medium" ? 2500 : 5000;

      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const velocities = new Float32Array(count);

      const colorA = new THREE.Color(COLORS.cyan);
      const colorB = new THREE.Color(COLORS.purple);
      const mix = new THREE.Color();

      function resetParticle(i: number) {
        positions[i * 3] = (Math.random() - 0.5) * 120;
        positions[i * 3 + 1] = 60 + Math.random() * 40;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
        velocities[i] = 0.3 + Math.random() * 1.4;
        mix.copy(colorA).lerp(colorB, Math.random());
        colors[i * 3] = mix.r;
        colors[i * 3 + 1] = mix.g;
        colors[i * 3 + 2] = mix.b;
      }

      for (let i = 0; i < count; i++) {
        resetParticle(i);
        positions[i * 3 + 1] = Math.random() * 120 - 60;
      }

      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 0.55,
        vertexColors: true,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });

      const particles = new THREE.Points(geometry, material);
      scene.add(particles);

      const grid = new THREE.GridHelper(250, 50, COLORS.cyan, "#0a0a0a");
      grid.position.y = -45;
      const gridMaterials = Array.isArray(grid.material) ? grid.material : [grid.material];
      gridMaterials.forEach((m) => {
        m.opacity = 0.12;
        m.transparent = true;
      });
      scene.add(grid);

      let mouseX = 0;
      let mouseY = 0;
      const onMouseMove = (e: MouseEvent) => {
        mouseX = (e.clientX - window.innerWidth / 2) * 0.015;
        mouseY = (e.clientY - window.innerHeight / 2) * 0.015;
      };
      window.addEventListener("mousemove", onMouseMove, { passive: true });

      const renderOnce = () => renderer.render(scene, camera);

      const advance = () => {
        const pos = particles.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < count; i++) {
          pos[i * 3 + 1] -= velocities[i];
          pos[i * 3] += (mouseX - pos[i * 3] * 0.01) * 0.05;
          pos[i * 3 + 2] += (mouseY - pos[i * 3 + 2] * 0.01) * 0.05;
          if (pos[i * 3 + 1] < -45) resetParticle(i);
        }
        particles.geometry.attributes.position.needsUpdate = true;
        particles.rotation.y += 0.0006;
      };

      const step = () => {
        animationId = null;
        if (!mounted || !visible || reducedMotion) return;
        advance();
        renderOnce();
        animationId = requestAnimationFrame(step);
      };
      const start = () => {
        if (animationId === null && mounted && visible && !reducedMotion) {
          animationId = requestAnimationFrame(step);
        }
      };
      const stop = () => {
        if (animationId !== null) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      };

      // One static frame so the hero is never blank (also the reduced-motion state).
      renderOnce();

      const observer = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
          if (visible) start();
          else stop();
        },
        { rootMargin: "100px" }
      );
      observer.observe(container);

      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      const onMotionChange = (e: MediaQueryListEvent) => {
        reducedMotion = e.matches;
        if (reducedMotion) {
          stop();
          renderOnce();
        } else {
          start();
        }
      };
      motionQuery.addEventListener("change", onMotionChange);

      const onResize = () => {
        camera.aspect = container.clientWidth / Math.max(1, container.clientHeight);
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
        if (animationId === null) renderOnce();
      };
      window.addEventListener("resize", onResize);

      return {
        dispose: () => {
          stop();
          observer.disconnect();
          motionQuery.removeEventListener("change", onMotionChange);
          window.removeEventListener("mousemove", onMouseMove);
          window.removeEventListener("resize", onResize);
          geometry.dispose();
          material.dispose();
          grid.geometry.dispose();
          gridMaterials.forEach((m) => m.dispose());
          renderer.dispose();
          if (container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
        },
      };
    };

    init().then((res) => {
      if (!res) return;
      if (!mounted) {
        // The effect was cleaned up while `three` was still loading (tier
        // flip after hydration, fast back-navigation, StrictMode): dispose
        // immediately instead of leaking a second renderer and rAF loop.
        res.dispose();
        return;
      }
      api = res;
    });

    return () => {
      mounted = false;
      api?.dispose();
      api = null;
    };
  }, [capabilities.tier]);

  return <div ref={containerRef} className="absolute inset-0 z-0" aria-hidden="true" />;
}

// ============================================
// 2. MATRIX VIZ
// ============================================
interface MatrixRow {
  data: number[];
  id: string;
}

const MAX_MATRIX_ROWS = 8;

export function MatrixViz() {
  const [rows, setRows] = useState<MatrixRow[]>([]);
  const [rank, setRank] = useState(0);
  const [pivots, setPivots] = useState<{ row: number; col: number }[]>([]);
  const unknowns = 4;

  const analyzeRank = useCallback(
    (currentRows: MatrixRow[]) => {
      // Each working row remembers the packet it came from, so pivot labels
      // still land on the right packet after elimination swaps rows around.
      const matrix = currentRows.map((r, i) => ({ id: i, v: [...r.data] }));
      let pivotRow = 0;
      const foundPivots: { row: number; col: number }[] = [];
      for (
        let col = 0;
        col < unknowns && pivotRow < matrix.length;
        col++
      ) {
        let sel = pivotRow;
        while (sel < matrix.length && matrix[sel].v[col] === 0) sel++;
        if (sel < matrix.length) {
          [matrix[sel], matrix[pivotRow]] = [matrix[pivotRow], matrix[sel]];
          foundPivots.push({ row: matrix[pivotRow].id, col });
          for (let i = 0; i < matrix.length; i++) {
            if (i !== pivotRow && matrix[i].v[col] === 1) {
              for (let j = col; j < unknowns; j++)
                matrix[i].v[j] ^= matrix[pivotRow].v[j];
            }
          }
          pivotRow++;
        }
      }
      setRank(pivotRow);
      setPivots(foundPivots);
    },
    [unknowns]
  );

  const addEquation = useCallback(() => {
    if (rows.length >= MAX_MATRIX_ROWS) return;
    const rowData: number[] = Array.from({ length: unknowns }, () =>
      Math.random() > 0.65 ? 1 : 0
    );
    if (rowData.reduce((s, v) => s + v, 0) === 0)
      rowData[Math.floor(Math.random() * unknowns)] = 1;
    const newRow: MatrixRow = { data: rowData, id: `row-${Date.now()}-${rows.length}` };
    const newRows = [...rows, newRow];
    setRows(newRows);
    analyzeRank(newRows);
  }, [rows, unknowns, analyzeRank]);

  const reset = useCallback(() => {
    setRows([]);
    setRank(0);
    setPivots([]);
  }, []);

  const full = rows.length >= MAX_MATRIX_ROWS;

  return (
    <div className="rq-viz-container" id="viz-matrix">
      <div className="rq-viz-header">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 flex items-center justify-center" aria-hidden="true">
            <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-white text-base uppercase tracking-widest">Interactive 01</h3>
            <div className="text-[11px] text-slate-400 uppercase tracking-[0.2em] font-mono">The Matrix View</div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={addEquation}
            disabled={full}
            className="rq-btn-action disabled:opacity-40 disabled:cursor-not-allowed"
            title={full ? `Maximum of ${MAX_MATRIX_ROWS} packets` : undefined}
          >
            Add Equation
          </button>
          <button type="button" onClick={reset} className="rq-btn-secondary">Reset</button>
        </div>
      </div>
      <div className="flex-1 p-6 md:p-10 flex flex-col xl:flex-row gap-10 xl:gap-14 items-start overflow-hidden">
        <div className="font-mono text-sm leading-relaxed overflow-x-auto w-full xl:flex-1 xl:min-w-0 min-h-[200px] md:min-h-[300px] pb-4 scrollbar-thin scrollbar-thumb-white/10">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 md:py-36 opacity-20 border-2 border-dashed border-white/5 rounded-3xl w-full">
              <div className="text-sm font-mono uppercase tracking-[0.5em] font-black text-slate-500">
                Waiting for Stream
              </div>
            </div>
          ) : (
            <div className="inline-flex flex-col" role="list" aria-label="Received packets as GF(2) equations">
              {rows.map((row, rIdx) => {
                const pivot = pivots.find((p) => p.row === rIdx);
                return (
                  <div key={row.id} role="listitem" className="flex items-center gap-4 md:gap-8 mb-4 md:mb-6 group relative whitespace-nowrap">
                    <div className="flex gap-2 md:gap-3 p-2 md:p-3 bg-white/[0.02] rounded-2xl md:rounded-[1.25rem] border border-white/5 shadow-2xl backdrop-blur-xl transition-all group-hover:border-white/10 group-hover:bg-white/[0.04]" aria-label={`Packet ${rIdx + 1}: [${row.data.join(", ")}]`}>
                      {row.data.map((val, cIdx) => {
                        // Highlight the pivot column only where this packet
                        // actually has a 1 (after reduction the pivot may sit
                        // on a column the original row does not touch).
                        const isPivot = pivot?.col === cIdx && val === 1;
                        return (
                          <div
                            key={cIdx}
                            className={`rq-data-grid-cell ${val ? "rq-cell-1" : "rq-cell-0"} ${isPivot ? "rq-cell-pivot" : ""}`}
                          >
                            {val}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[9px] md:text-[10px] font-mono text-slate-500 font-black uppercase tracking-[0.3em]">
                        Packet {rIdx + 1}
                      </span>
                      <span
                        className={`text-[9px] md:text-[10px] font-mono uppercase tracking-[0.15em] ${pivot ? "text-cyan-400 font-bold" : "text-red-400"}`}
                      >
                        {pivot ? `Information Pivot · x${pivot.col + 1}` : "Linear Dependency"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="space-y-8 w-full xl:flex-1">
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-bold mb-3">
              System Solvability
            </div>
            <div
              role="status"
              aria-live="polite"
              className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter transition-all duration-700 ${
                rank >= unknowns
                  ? "text-cyan-400 drop-shadow-[0_0_40px_rgba(34,211,238,0.5)]"
                  : "text-slate-600"
              }`}
            >
              RANK: {rank} / {unknowns}
            </div>
            <p className="text-xs text-slate-500 mt-3 mb-0 font-mono">
              {rows.length === 0
                ? "No packets yet."
                : rank >= unknowns
                  ? `${rows.length} packets, ${rank} independent: solvable.`
                  : `${rows.length} packets, ${rank} independent: ${unknowns - rank} more needed.`}
            </p>
          </div>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed font-light max-w-xl">
            We are solving{" "}
            <RaptorQMathTooltip mathKey="linear-system">
              <em className="text-slate-200 font-mono italic">Ax = b</em>
            </RaptorQMathTooltip>{" "}
            over GF(2). In this field, addition is XOR. In the real RFC 6330
            scheme, most work stays XOR-cheap, but a small &quot;insurance&quot;
            component uses GF(256) to improve rank.
          </p>
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6 md:p-8 rounded-2xl border border-white/10 text-sm text-blue-200/80 backdrop-blur-xl relative overflow-hidden group max-w-xl">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all duration-500" />
            <strong className="block mb-2 text-blue-300 text-base md:text-lg relative z-10 font-bold">
              Rank-Nullity Theorem
            </strong>
            <span className="relative z-10">
              Every new <em>linearly independent</em> packet reduces the
              uncertainty of the system. When Rank equals K, the solution space
              collapses to a single point: your file.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 3. DEGREE RIPPLE VIZ
// ============================================

// RFC 6330 §5.3.5.2, Table 1: cumulative degree table f[0..30] out of 2^20.
// Degree d is chosen when f[d-1] <= v < f[d].
const RFC6330_DEGREE_CDF = [
  0, 5243, 529531, 704294, 791675, 844104, 879057, 904023, 922747, 937311,
  948962, 958494, 966438, 973160, 978921, 983914, 988283, 992138, 995565,
  998631, 1001391, 1003887, 1006157, 1008229, 1010129, 1011876, 1013490,
  1014983, 1016370, 1017662, 1048576,
];

function rfc6330Pmf(): number[] {
  const p: number[] = [];
  for (let d = 1; d <= 30; d++) {
    p.push((RFC6330_DEGREE_CDF[d] - RFC6330_DEGREE_CDF[d - 1]) / 1048576);
  }
  return p;
}

// Ideal Soliton: ρ(1) = 1/K, ρ(d) = 1/(d(d−1)) for d = 2..K. Sums to 1.
function idealSolitonPmf(K: number): number[] {
  const p = new Array<number>(K).fill(0);
  p[0] = 1 / K;
  for (let d = 2; d <= K; d++) p[d - 1] = 1 / (d * (d - 1));
  return p;
}

// Robust Soliton (Luby 2002): μ(d) ∝ ρ(d) + τ(d) with
// R = c·ln(K/δ)·√K, τ(d) = R/(dK) for d < K/R, τ(K/R) = R·ln(R/δ)/K.
function robustSolitonPmf(K: number, c: number, delta: number) {
  const rho = idealSolitonPmf(K);
  const R = Math.max(1e-9, c * Math.log(K / delta) * Math.sqrt(K));
  const spike = Math.max(1, Math.min(K, Math.round(K / R)));
  const tau = new Array<number>(K).fill(0);
  for (let d = 1; d < spike; d++) tau[d - 1] = R / (d * K);
  tau[spike - 1] = Math.max(0, (R * Math.log(R / delta)) / K);
  const mu = rho.map((v, i) => v + tau[i]);
  const Z = mu.reduce((a, b) => a + b, 0);
  return { pmf: mu.map((v) => v / Z), spike, R };
}

type DistKey = "rfc6330" | "robust" | "ideal";

interface DegreeModel {
  key: DistKey;
  name: string;
  pmf: number[];
  showMax: number;
  spike?: number;
  meanDegree: number;
}

function buildDegreeModel(key: DistKey, K: number, c: number, delta: number): DegreeModel {
  let pmf: number[];
  let showMax = 30;
  let spike: number | undefined;
  let name: string;
  if (key === "rfc6330") {
    pmf = rfc6330Pmf();
    name = "RFC 6330 degree table";
  } else if (key === "robust") {
    const r = robustSolitonPmf(K, c, delta);
    pmf = r.pmf;
    spike = r.spike;
    showMax = Math.min(60, Math.max(30, spike + 3));
    name = `Robust Soliton (c=${c.toFixed(2)}, δ=${delta.toFixed(2)})`;
  } else {
    pmf = idealSolitonPmf(K);
    name = "Ideal Soliton";
  }
  const meanDegree = pmf.reduce((s, p, i) => s + (i + 1) * p, 0);
  return { key, name, pmf, showMax, spike, meanDegree };
}

interface PeelResult {
  K: number;
  M: number;
  decoded: number;
  stalled: boolean;
  peakRipple: number;
  series: { decoded: number; ripple: number }[];
}

/**
 * Toy LT peeling decoder: draw M packets whose degrees follow `pmf`, each
 * XOR-ing that many distinct source symbols, then peel: while some packet has
 * exactly one unresolved source, solve it and reduce every packet that
 * contains it. The ripple is the number of degree-1 packets at each step.
 * No precode, no inactivation — this is the layer RaptorQ builds on.
 */
function simulatePeeling(K: number, M: number, pmf: number[]): PeelResult {
  const cdf: number[] = [];
  let acc = 0;
  for (const p of pmf) {
    acc += p;
    cdf.push(acc);
  }
  const sampleDegree = () => {
    const u = Math.random() * acc;
    let lo = 0;
    let hi = cdf.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cdf[mid] > u) hi = mid;
      else lo = mid + 1;
    }
    return Math.max(1, Math.min(K, lo + 1));
  };

  const perm = new Int32Array(K);
  for (let i = 0; i < K; i++) perm[i] = i;

  const pktSources: Int32Array[] = new Array(M);
  const remaining = new Int32Array(M);
  const bySource: number[][] = Array.from({ length: K }, () => []);

  for (let m = 0; m < M; m++) {
    const d = sampleDegree();
    // Partial Fisher–Yates on a persistent permutation: d distinct indices in O(d).
    for (let t = 0; t < d; t++) {
      const j = t + Math.floor(Math.random() * (K - t));
      const tmp = perm[t];
      perm[t] = perm[j];
      perm[j] = tmp;
    }
    const srcs = perm.slice(0, d);
    pktSources[m] = srcs;
    remaining[m] = d;
    for (let t = 0; t < d; t++) bySource[srcs[t]].push(m);
  }

  const decodedFlag = new Uint8Array(K);
  const inRipple = new Uint8Array(M);
  const ripple: number[] = [];
  let rippleSize = 0;
  for (let m = 0; m < M; m++) {
    if (remaining[m] === 1) {
      ripple.push(m);
      inRipple[m] = 1;
      rippleSize++;
    }
  }

  const series: { decoded: number; ripple: number }[] = [{ decoded: 0, ripple: rippleSize }];
  let decoded = 0;
  let peakRipple = rippleSize;

  while (ripple.length > 0) {
    const m = ripple.pop() as number;
    inRipple[m] = 0;
    if (remaining[m] !== 1) continue;
    const srcs = pktSources[m];
    let s = -1;
    for (let t = 0; t < srcs.length; t++) {
      if (!decodedFlag[srcs[t]]) {
        s = srcs[t];
        break;
      }
    }
    if (s < 0) continue;
    decodedFlag[s] = 1;
    decoded++;
    const touching = bySource[s];
    for (let t = 0; t < touching.length; t++) {
      const pm = touching[t];
      const before = remaining[pm];
      remaining[pm] = before - 1;
      if (before === 2) {
        rippleSize++;
        if (!inRipple[pm]) {
          ripple.push(pm);
          inRipple[pm] = 1;
        }
      } else if (before === 1) {
        rippleSize--;
      }
    }
    if (rippleSize > peakRipple) peakRipple = rippleSize;
    series.push({ decoded, ripple: rippleSize });
  }

  return { K, M, decoded, stalled: decoded < K, peakRipple, series };
}

function renderDegreeCharts(
  d3: D3,
  hosts: { bar: HTMLDivElement | null; line: HTMLDivElement | null },
  model: DegreeModel,
  result: PeelResult,
  animate: boolean
) {
  const reduced = prefersReducedMotion();

  // ---- Bar chart: degree distribution ----
  const b = hosts.bar;
  if (b) {
    b.innerHTML = "";
    const w = b.clientWidth || 300;
    const h = b.clientHeight || 240;
    const m = { top: 18, right: 12, bottom: 36, left: 46 };

    const bars = model.pmf
      .slice(0, model.showMax)
      .map((p, i) => ({ label: String(i + 1), p, d: i + 1 }));
    const tail = model.pmf.slice(model.showMax).reduce((s, v) => s + v, 0);
    if (tail > 0.0005) bars.push({ label: `${model.showMax + 1}+`, p: tail, d: -1 });

    const svg = d3
      .select(b)
      .append("svg")
      .attr("width", w)
      .attr("height", h)
      .attr("aria-hidden", "true");
    const x = d3
      .scaleBand<string>()
      .domain(bars.map((d) => d.label))
      .range([m.left, w - m.right])
      .padding(bars.length > 32 ? 0.15 : 0.3);
    const y = d3
      .scaleLinear()
      .domain([0, Math.max(0.05, d3.max(bars, (d) => d.p) ?? 0.5)])
      .nice()
      .range([h - m.bottom, m.top]);

    const grad = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "rq-bar-grad")
      .attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%");
    grad.append("stop").attr("offset", "0%").attr("stop-color", COLORS.cyan);
    grad.append("stop").attr("offset", "100%").attr("stop-color", COLORS.blue);

    const tickEvery = bars.length > 32 ? 10 : 5;
    const tickValues = bars
      .map((d) => d.label)
      .filter((l, i) => i === 0 || (i + 1) % tickEvery === 0 || l.endsWith("+"));

    const xAxis = svg
      .append("g")
      .attr("transform", `translate(0, ${h - m.bottom})`)
      .call(d3.axisBottom(x).tickValues(tickValues).tickSizeOuter(0));
    xAxis.selectAll("text").attr("fill", AXIS_COLOR).attr("font-size", AXIS_FONT);
    xAxis.selectAll("line, path").attr("stroke", AXIS_COLOR);

    const yAxis = svg
      .append("g")
      .attr("transform", `translate(${m.left}, 0)`)
      .call(d3.axisLeft(y).ticks(4).tickFormat((v) => `${Math.round(Number(v) * 100)}%`).tickSizeOuter(0));
    yAxis.selectAll("text").attr("fill", AXIS_COLOR).attr("font-size", AXIS_FONT);
    yAxis.selectAll("line, path").attr("stroke", AXIS_COLOR);

    svg
      .append("text")
      .attr("x", w - m.right)
      .attr("y", h - 6)
      .attr("text-anchor", "end")
      .attr("fill", AXIS_COLOR)
      .attr("font-size", AXIS_FONT)
      .text("degree d");
    svg
      .append("text")
      .attr("x", m.left)
      .attr("y", 11)
      .attr("text-anchor", "start")
      .attr("fill", AXIS_COLOR)
      .attr("font-size", AXIS_FONT)
      .text("p(d)");

    svg
      .selectAll("rect.bar")
      .data(bars)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.label) ?? 0)
      .attr("y", (d) => y(d.p))
      .attr("width", x.bandwidth())
      .attr("height", (d) => Math.max(0, h - m.bottom - y(d.p)))
      .attr("fill", (d) => (model.spike !== undefined && d.d === model.spike ? COLORS.amber : "url(#rq-bar-grad)"))
      .attr("rx", 3)
      .attr("opacity", 0.85);

    if (model.spike !== undefined && model.spike <= model.showMax) {
      const sx = (x(String(model.spike)) ?? 0) + x.bandwidth() / 2;
      svg
        .append("text")
        .attr("x", Math.min(sx, w - m.right - 4))
        .attr("y", m.top + 12)
        .attr("text-anchor", sx > w - 80 ? "end" : "middle")
        .attr("fill", COLORS.amber)
        .attr("font-size", AXIS_FONT)
        .text(`spike at K/R = ${model.spike}`);
    }
  }

  // ---- Line chart: ripple during peeling ----
  const l = hosts.line;
  if (l) {
    l.innerHTML = "";
    const w = l.clientWidth || 300;
    const h = l.clientHeight || 240;
    const m = { top: 18, right: 14, bottom: 36, left: 46 };

    const stride = Math.max(1, Math.ceil(result.series.length / 500));
    const series = result.series.filter(
      (_, i) => i % stride === 0 || i === result.series.length - 1
    );

    const svg = d3
      .select(l)
      .append("svg")
      .attr("width", w)
      .attr("height", h)
      .attr("aria-hidden", "true");
    const x = d3.scaleLinear().domain([0, result.K]).range([m.left, w - m.right]);
    const y = d3
      .scaleLinear()
      .domain([0, Math.max(5, result.peakRipple)])
      .nice()
      .range([h - m.bottom, m.top]);

    const xAxis = svg
      .append("g")
      .attr("transform", `translate(0, ${h - m.bottom})`)
      .call(d3.axisBottom(x).ticks(w < 360 ? 4 : 6).tickSizeOuter(0));
    xAxis.selectAll("text").attr("fill", AXIS_COLOR).attr("font-size", AXIS_FONT);
    xAxis.selectAll("line, path").attr("stroke", AXIS_COLOR);
    const yAxis = svg
      .append("g")
      .attr("transform", `translate(${m.left}, 0)`)
      .call(d3.axisLeft(y).ticks(4).tickSizeOuter(0));
    yAxis.selectAll("text").attr("fill", AXIS_COLOR).attr("font-size", AXIS_FONT);
    yAxis.selectAll("line, path").attr("stroke", AXIS_COLOR);

    svg
      .append("text")
      .attr("x", w - m.right)
      .attr("y", h - 6)
      .attr("text-anchor", "end")
      .attr("fill", AXIS_COLOR)
      .attr("font-size", AXIS_FONT)
      .text("source symbols decoded");
    svg
      .append("text")
      .attr("x", m.left)
      .attr("y", 11)
      .attr("text-anchor", "start")
      .attr("fill", AXIS_COLOR)
      .attr("font-size", AXIS_FONT)
      .text("ripple (degree-1 packets)");

    const line = d3
      .line<{ decoded: number; ripple: number }>()
      .x((d) => x(d.decoded))
      .y((d) => y(d.ripple))
      .curve(d3.curveMonotoneX);

    const path = svg
      .append("path")
      .datum(series)
      .attr("fill", "none")
      .attr("stroke", COLORS.purple)
      .attr("stroke-width", 2.5)
      .attr("stroke-linecap", "round")
      .attr("d", line);

    const endX = x(result.decoded);
    if (result.stalled) {
      svg
        .append("line")
        .attr("x1", endX).attr("x2", endX)
        .attr("y1", m.top).attr("y2", h - m.bottom)
        .attr("stroke", COLORS.red)
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4 4");
      svg
        .append("text")
        .attr("x", endX > w / 2 ? endX - 6 : endX + 6)
        .attr("y", m.top + 26)
        .attr("text-anchor", endX > w / 2 ? "end" : "start")
        .attr("fill", COLORS.red)
        .attr("font-size", AXIS_FONT)
        .text(`ripple = 0 at ${result.decoded}/${result.K}`);
    } else {
      svg
        .append("circle")
        .attr("cx", endX)
        .attr("cy", y(0))
        .attr("r", 4)
        .attr("fill", COLORS.emerald);
      svg
        .append("text")
        .attr("x", endX - 6)
        .attr("y", h - m.bottom - 8)
        .attr("text-anchor", "end")
        .attr("fill", COLORS.emerald)
        .attr("font-size", AXIS_FONT)
        .text("all K decoded");
    }

    if (animate && !reduced) {
      const totalLen = path.node()?.getTotalLength() || 0;
      if (totalLen > 0) {
        path
          .attr("stroke-dasharray", totalLen)
          .attr("stroke-dashoffset", totalLen)
          .transition()
          .duration(1200)
          .ease(d3.easeCubicInOut)
          .attr("stroke-dashoffset", 0);
      }
    }
  }
}

export function DegreeRippleViz() {
  const barRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const d3Ref = useRef<D3 | null>(null);
  const lastRef = useRef<{ model: DegreeModel; result: PeelResult } | null>(null);
  const initializedRef = useRef(false);
  const [dist, setDist] = useState<DistKey>("rfc6330");
  const [K, setK] = useState(800);
  const [overheadPct, setOverheadPct] = useState(5);
  const [c, setC] = useState(0.1);
  const [delta, setDelta] = useState(0.5);
  const [result, setResult] = useState<PeelResult | null>(null);

  const model = useMemo(() => buildDegreeModel(dist, K, c, delta), [dist, K, c, delta]);

  const runSimulation = useCallback(
    (animate: boolean) => {
      const M = Math.ceil(K * (1 + overheadPct / 100));
      const res = simulatePeeling(K, M, model.pmf);
      lastRef.current = { model, result: res };
      setResult(res);
      const draw = (d3: D3) =>
        renderDegreeCharts(d3, { bar: barRef.current, line: lineRef.current }, model, res, animate);
      if (d3Ref.current) draw(d3Ref.current);
      else
        import("d3").then((d3) => {
          d3Ref.current = d3;
          if (lastRef.current?.result === res) draw(d3);
        });
    },
    [K, overheadPct, model]
  );

  const runRef = useRef(runSimulation);
  useEffect(() => {
    runRef.current = runSimulation;
  }, [runSimulation]);

  const containerRef = useIntersectionInit(
    useCallback(() => {
      initializedRef.current = true;
      runRef.current(true);
    }, [])
  );

  // Sliders and the distribution select re-run the trial live (no path
  // animation) so the curve visibly depends on K, overhead, and the law.
  useEffect(() => {
    if (!initializedRef.current) return;
    const id = setTimeout(() => runSimulation(false), 120);
    return () => clearTimeout(id);
  }, [runSimulation]);

  useElementResize(
    containerRef,
    useCallback(() => {
      const last = lastRef.current;
      if (!last || !d3Ref.current) return;
      renderDegreeCharts(
        d3Ref.current,
        { bar: barRef.current, line: lineRef.current },
        last.model,
        last.result,
        false
      );
    }, [])
  );

  const M = Math.ceil(K * (1 + overheadPct / 100));
  const successPct = result ? (result.decoded / result.K) * 100 : null;
  const summary = result
    ? `${result.decoded} of ${result.K} source symbols decoded (${successPct?.toFixed(1)}%) from ${result.M} packets; ` +
      (result.stalled
        ? `the ripple emptied after ${result.decoded} peels (stopping set).`
        : "the ripple never emptied.")
    : "Simulation pending.";

  return (
    <div ref={containerRef} className="rq-viz-container" id="viz-degree-ripple">
      <div className="rq-viz-header">
        <h3 className="font-bold text-white uppercase tracking-widest text-sm flex items-center gap-2">
          <span className="w-2 h-2 bg-purple-400 rounded-full" aria-hidden="true" />
          Interactive 02: Degrees &amp; Ripple
        </h3>
        <div className="flex gap-2">
          <button type="button" onClick={() => runSimulation(true)} className="rq-btn-action">
            Simulate
          </button>
        </div>
      </div>
      <div className="p-4 md:p-6 border-b border-white/5 bg-white/[0.01]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="rq-dist" className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">
                Distribution
              </label>
              <select
                id="rq-dist"
                value={dist}
                onChange={(e) => setDist(e.target.value as DistKey)}
                className="w-full min-h-11 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              >
                <option value="rfc6330">RFC 6330 Degree Table (RaptorQ)</option>
                <option value="robust">Robust Soliton (LT)</option>
                <option value="ideal">Ideal Soliton</option>
              </select>
            </div>
            {dist === "robust" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">c</span>
                    <span className="text-[10px] font-mono text-slate-400">{c.toFixed(2)}</span>
                  </div>
                  <input
                    type="range" min="0.02" max="0.5" step="0.01" value={c}
                    aria-label="Robust Soliton constant c"
                    aria-valuetext={c.toFixed(2)}
                    onChange={(e) => setC(parseFloat(e.target.value))}
                    className="w-full h-10 accent-amber-400 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">δ (failure prob.)</span>
                    <span className="text-[10px] font-mono text-slate-400">{delta.toFixed(2)}</span>
                  </div>
                  <input
                    type="range" min="0.05" max="0.9" step="0.05" value={delta}
                    aria-label="Robust Soliton failure probability delta"
                    aria-valuetext={delta.toFixed(2)}
                    onChange={(e) => setDelta(parseFloat(e.target.value))}
                    className="w-full h-10 accent-amber-400 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">K (source symbols)</span>
                <span className="text-[10px] font-mono text-slate-400">{K}</span>
              </div>
              <input
                type="range" min="200" max="2000" step="100" value={K}
                aria-label="K, number of source symbols"
                aria-valuetext={`${K} source symbols`}
                onChange={(e) => setK(parseInt(e.target.value, 10))}
                className="w-full h-10 accent-cyan-400 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Reception overhead</span>
                <span className="text-[10px] font-mono text-slate-400">{overheadPct}% → M = {M}</span>
              </div>
              <input
                type="range" min="0" max="20" step="1" value={overheadPct}
                aria-label="Reception overhead percent"
                aria-valuetext={`${overheadPct} percent, ${M} packets received`}
                onChange={(e) => setOverheadPct(parseInt(e.target.value, 10))}
                className="w-full h-10 accent-purple-400 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
          <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-3">
            Degree Distribution · mean {model.meanDegree.toFixed(1)}
          </div>
          <div
            ref={barRef}
            className="h-[220px] md:h-[260px]"
            role="img"
            aria-label={`${model.name}: probability of each packet degree. Mean degree ${model.meanDegree.toFixed(1)}; degree 2 has ${(model.pmf[1] * 100).toFixed(0)}% of the mass.${model.spike ? ` Robust spike at degree ${model.spike}.` : ""}`}
          />
        </div>
        <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
          <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-3">
            Ripple During Peeling · one random trial
          </div>
          <div
            ref={lineRef}
            className="h-[220px] md:h-[260px]"
            role="img"
            aria-label={`Ripple size versus symbols decoded. ${summary}`}
          />
        </div>
      </div>
      <div className="p-4 md:p-6 border-t border-white/5 text-center space-y-2">
        <p className="text-sm text-slate-300 mb-0 font-mono" role="status" aria-live="polite">
          {result
            ? `K = ${result.K} · received M = ${result.M} (+${overheadPct}%) · decoded ${result.decoded}/${result.K} (${successPct?.toFixed(1)}%) · peak ripple ${result.peakRipple} · ${result.stalled ? "stalled: stopping set" : "complete"}`
            : "Simulation pending…"}
        </p>
        <p className="text-xs text-slate-500 mb-0 leading-relaxed max-w-2xl mx-auto">
          A plain LT peeling decoder on one random draw: no precode, no
          inactivation. RaptorQ layers both on top of this, which is why it can
          finish the last few percent that peeling alone leaves stranded.
        </p>
      </div>
    </div>
  );
}

// ============================================
// 4. PEELING VIZ
// ============================================

interface PeelingNode {
  id: string;
  type: "src" | "pkt";
  solved: boolean;
  deg: number;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
}

interface PeelingLink {
  source: PeelingNode | string;
  target: PeelingNode | string;
}

type PeelPhase = "loading" | "ready" | "stalled" | "done";

function layoutStatic(nodes: PeelingNode[], w: number, h: number) {
  const srcs = nodes.filter((n) => n.type === "src");
  const pkts = nodes.filter((n) => n.type === "pkt");
  srcs.forEach((n, i) => {
    n.x = w * 0.28;
    n.y = (h * (i + 1)) / (srcs.length + 1);
  });
  pkts.forEach((n, i) => {
    n.x = w * 0.72;
    n.y = (h * (i + 1)) / (pkts.length + 1);
  });
}

export function PeelingViz() {
  const svgRef = useRef<SVGSVGElement>(null);
  const nodesRef = useRef<PeelingNode[]>([]);
  const linksRef = useRef<PeelingLink[]>([]);
  const simRef = useRef<Simulation<PeelingNode, PeelingLink> | null>(null);
  const d3Ref = useRef<D3 | null>(null);
  const [, forceRender] = useState(0);
  const [phase, setPhase] = useState<PeelPhase>("loading");
  const { capabilities } = useDeviceCapabilities();
  const staticRef = useRef(capabilities.tier === "low");
  useEffect(() => {
    staticRef.current = capabilities.tier === "low";
  }, [capabilities.tier]);

  const evaluatePhase = useCallback(() => {
    const nodes = nodesRef.current;
    const srcs = nodes.filter((n) => n.type === "src");
    const allSolved = srcs.length > 0 && srcs.every((n) => n.solved);
    const hasPivot = nodes.some((n) => n.type === "pkt" && n.deg === 1);
    setPhase(allSolved ? "done" : hasPivot ? "ready" : "stalled");
  }, []);

  const initGraph = useCallback(() => {
    import("d3").then((d3) => {
      d3Ref.current = d3;
      const svg = svgRef.current;
      if (!svg) return;
      const w = svg.clientWidth || 600;
      const h = svg.clientHeight || 400;
      const isStatic = staticRef.current;

      const K = isStatic ? 8 : 12;
      const M = isStatic ? 12 : 18;

      const nodes: PeelingNode[] = [];
      const links: PeelingLink[] = [];

      for (let i = 0; i < K; i++) {
        nodes.push({ id: `s${i}`, type: "src", solved: false, deg: 0, x: w * 0.3, y: Math.random() * h });
      }
      for (let i = 0; i < M; i++) {
        const d = Math.random() > 0.8 ? 1 : Math.random() > 0.5 ? 2 : 3;
        const n: PeelingNode = { id: `p${i}`, type: "pkt", solved: false, deg: d, x: w * 0.7, y: Math.random() * h };
        nodes.push(n);
        const indices = d3.shuffle(d3.range(K)).slice(0, d);
        indices.forEach((s) => links.push({ source: `s${s}`, target: n.id }));
      }

      nodesRef.current = nodes;
      linksRef.current = links;

      if (isStatic) {
        // Low tier: fixed two-column layout, no force simulation.
        layoutStatic(nodes, w, h);
        simRef.current = null;
        forceRender((c) => c + 1);
      } else {
        simRef.current = d3
          .forceSimulation<PeelingNode>(nodes)
          .force(
            "link",
            d3.forceLink<PeelingNode, PeelingLink>(links).id((d) => d.id).distance(110)
          )
          .force("charge", d3.forceManyBody().strength(-500))
          .force("center", d3.forceCenter(w / 2, h / 2))
          .on("tick", () => forceRender((c) => c + 1));
      }
      evaluatePhase();
    });
  }, [evaluatePhase]);

  const containerRef = useIntersectionInit(
    useCallback(() => {
      initGraph();
      return () => {
        simRef.current?.stop();
      };
    }, [initGraph])
  );

  useElementResize(
    containerRef,
    useCallback(() => {
      const svg = svgRef.current;
      const d3 = d3Ref.current;
      if (!svg || !d3 || nodesRef.current.length === 0) return;
      const w = svg.clientWidth || 600;
      const h = svg.clientHeight || 400;
      if (simRef.current) {
        simRef.current.force("center", d3.forceCenter(w / 2, h / 2)).alpha(0.3).restart();
      } else {
        layoutStatic(nodesRef.current, w, h);
        forceRender((c) => c + 1);
      }
    }, [])
  );

  const step = useCallback(() => {
    const nodes = nodesRef.current;
    const links = linksRef.current;
    const pivot = nodes.find((n) => n.type === "pkt" && n.deg === 1);
    if (!pivot) {
      evaluatePhase();
      return;
    }
    const edge = links.find(
      (l) =>
        (typeof l.target === "string" ? l.target : l.target.id) === pivot.id
    );
    if (!edge) return;
    const sourceNode =
      typeof edge.source === "string"
        ? nodes.find((n) => n.id === edge.source)
        : edge.source;
    if (sourceNode) sourceNode.solved = true;

    const sourceId = typeof edge.source === "string" ? edge.source : edge.source.id;

    links
      .filter((l) => {
        const sid = typeof l.source === "string" ? l.source : l.source.id;
        return sid === sourceId;
      })
      .forEach((l) => {
        const target =
          typeof l.target === "string"
            ? nodes.find((n) => n.id === l.target)
            : l.target;
        if (target) target.deg--;
      });

    linksRef.current = links.filter((l) => {
      const sid = typeof l.source === "string" ? l.source : l.source.id;
      return sid !== sourceId;
    });
    pivot.deg = 0;
    simRef.current?.alpha(0.5).restart();
    forceRender((c) => c + 1);
    evaluatePhase();
  }, [evaluatePhase]);

  const resetViz = useCallback(() => {
    simRef.current?.stop();
    setPhase("loading");
    initGraph();
  }, [initGraph]);

  const nodes = nodesRef.current;
  const links = linksRef.current;
  const solvedCount = nodes.filter((n) => n.type === "src" && n.solved).length;
  const srcCount = nodes.filter((n) => n.type === "src").length;
  const rippleCount = nodes.filter((n) => n.type === "pkt" && n.deg === 1).length;
  const remainingPkts = nodes.filter((n) => n.type === "pkt" && n.deg > 0).length;

  const statusText =
    phase === "loading"
      ? "Building a random bipartite graph…"
      : phase === "done"
        ? `All ${srcCount} source symbols recovered. Peeling finished.`
        : phase === "stalled"
          ? solvedCount === 0
            ? "Ripple is empty before the first peel: no degree-1 packet arrived. This is a stopping set (2-core). Reset to draw a new graph."
            : `Ripple is empty: ${solvedCount}/${srcCount} solved, every remaining packet has degree ≥ 2. This is a stopping set (2-core) — pure peeling is stuck; RaptorQ would inactivate a symbol here.`
          : `${solvedCount}/${srcCount} solved · ${rippleCount} degree-1 packet${rippleCount === 1 ? "" : "s"} in the ripple · ${remainingPkts} packets left. Click "Peel Step".`;

  return (
    <div ref={containerRef} className="rq-viz-container" id="viz-peeling">
      <div className="rq-viz-header">
        <h3 className="font-bold text-white uppercase tracking-widest text-sm flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-400 rounded-full" aria-hidden="true" />
          Interactive 05: The Peeling Cascade
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={step}
            disabled={phase !== "ready"}
            className="rq-btn-action disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Peel Step
          </button>
          <button type="button" onClick={resetViz} className="rq-btn-secondary">Reset</button>
        </div>
      </div>
      <div className="flex-1 w-full h-[300px] md:h-[400px] relative">
        <svg
          ref={svgRef}
          className="w-full h-full"
          role="img"
          aria-label={`Bipartite peeling graph: ${srcCount} source symbols on the left, ${nodes.length - srcCount} packets on the right. ${solvedCount} solved, ${rippleCount} in the ripple.`}
        >
          {links.map((l, i) => {
            const s = typeof l.source === "string" ? nodes.find((n) => n.id === l.source) : l.source;
            const t = typeof l.target === "string" ? nodes.find((n) => n.id === l.target) : l.target;
            if (!s || !t) return null;
            return (
              <line
                key={i}
                x1={s.x}
                y1={s.y}
                x2={t.x}
                y2={t.y}
                stroke="#334155"
                strokeWidth={2}
                opacity={0.6}
              />
            );
          })}
          {nodes.map((n) => (
            <g key={n.id} transform={`translate(${n.x}, ${n.y})`}>
              <circle
                r={n.type === "src" ? 20 : 14}
                fill={
                  n.type === "src"
                    ? n.solved
                      ? COLORS.emerald
                      : COLORS.bg
                    : n.deg === 1
                      ? COLORS.cyan
                      : n.deg === 0
                        ? "transparent"
                        : COLORS.blue
                }
                stroke={n.deg === 1 || n.solved ? COLORS.white : "#475569"}
                strokeWidth={3}
                opacity={n.type === "pkt" && n.deg === 0 ? 0 : 1}
              />
              {n.type === "pkt" && n.deg > 0 && (
                <text
                  dy="0.35em"
                  textAnchor="middle"
                  fill={COLORS.white}
                  fontSize="12"
                  fontWeight="900"
                >
                  {n.deg}
                </text>
              )}
            </g>
          ))}
        </svg>
        {phase === "stalled" && (
          <div className="absolute inset-x-4 bottom-3 md:inset-x-8 md:bottom-4 pointer-events-none">
            <div className="mx-auto max-w-md rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-center text-xs font-mono uppercase tracking-widest text-red-300 backdrop-blur-md">
              Ripple empty — stopping set (2-core)
            </div>
          </div>
        )}
      </div>
      <div className="p-4 md:p-6 border-t border-white/5 text-center text-sm text-slate-400 space-y-2">
        <p className="mb-0" role="status" aria-live="polite">{statusText}</p>
        <p className="mb-0 text-xs text-slate-500">
          Cyan = degree-1 packet (ripple). Green = resolved source block. Blue = packet still waiting on 2+ unknowns.
        </p>
      </div>
    </div>
  );
}

// ============================================
// 5. PRECODE VIZ
// ============================================
const PRECODE_K = 24;
const PRECODE_P = 6;
const PRECODE_L = PRECODE_K + PRECODE_P;
const PRECODE_ERASED = [12, 20];
const PRECODE_ROW_STEP = 14;
const PRECODE_TOP = 48;
const PRECODE_HEIGHT = PRECODE_TOP + PRECODE_L * PRECODE_ROW_STEP + 28;

type PrecodePhase = "idle" | "running" | "done";

export function PrecodeViz() {
  const svgRef = useRef<SVGSVGElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const d3Ref = useRef<D3 | null>(null);
  const mountedRef = useRef(true);
  const phaseRef = useRef<PrecodePhase>("idle");
  const [phase, setPhaseState] = useState<PrecodePhase>("idle");
  const setPhase = useCallback((p: PrecodePhase) => {
    phaseRef.current = p;
    if (mountedRef.current) setPhaseState(p);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const draw = useCallback(
    (animated: boolean) => {
      const run = (d3: D3) => {
        const svgEl = svgRef.current;
        if (!svgEl) return;
        const svg = d3.select(svgEl);
        // Interrupting cancels every pending transition from a previous run,
        // so re-running or resizing can never draw duplicate rects/paths.
        svg.selectAll("*").interrupt().remove();

        const anim = animated && !prefersReducedMotion();
        const w = Math.max(280, hostRef.current?.clientWidth ?? 560);
        const narrow = w < 480;
        const size = 10;
        const step = PRECODE_ROW_STEP;
        const marginX = narrow ? 20 : 40;
        const leftX = marginX;
        const rightX = w - marginX - size;

        const g = svg.append("g").attr("transform", `translate(0, ${PRECODE_TOP})`);

        const head = (x: number, anchor: "start" | "end", title: string, sub: string) => {
          g.append("text")
            .attr("x", x)
            .attr("y", -30)
            .attr("fill", "#cbd5e1")
            .attr("text-anchor", anchor)
            .attr("font-size", narrow ? 12 : 13)
            .attr("font-weight", "900")
            .attr("letter-spacing", "0.12em")
            .text(title);
          g.append("text")
            .attr("x", x)
            .attr("y", -14)
            .attr("fill", AXIS_COLOR)
            .attr("text-anchor", anchor)
            .attr("font-size", 12)
            .text(sub);
        };
        head(leftX, "start", narrow ? "INTERMEDIATE" : "INTERMEDIATE (L = 30)", `${PRECODE_K} source + ${PRECODE_P} parity`);
        head(rightX + size, "end", narrow ? "RECEIVED" : "RECEIVED → REPAIRED", `${PRECODE_L - PRECODE_ERASED.length} arrive, ${PRECODE_ERASED.length} erased`);

        const data = d3.range(PRECODE_L).map((i) => ({ i, type: i < PRECODE_K ? "src" : "par" }));

        const base = g
          .selectAll<SVGRectElement, { i: number; type: string }>(".base")
          .data(data)
          .enter()
          .append("rect")
          .attr("class", "base")
          .attr("x", leftX)
          .attr("y", (d) => d.i * step)
          .attr("width", size)
          .attr("height", size)
          .attr("fill", (d) => (d.type === "src" ? COLORS.blue : COLORS.purple))
          .attr("rx", 3)
          .attr("opacity", anim ? 0 : 1);
        if (anim) base.transition().duration(500).delay((d) => d.i * 20).attr("opacity", 1);

        const received = data.filter((d) => !PRECODE_ERASED.includes(d.i));
        const rx = g
          .selectAll<SVGRectElement, { i: number; type: string }>(".rx")
          .data(received)
          .enter()
          .append("rect")
          .attr("class", "rx")
          .attr("x", rightX)
          .attr("y", (d) => d.i * step)
          .attr("width", size)
          .attr("height", size)
          .attr("fill", (d) => (d.type === "src" ? COLORS.blue : COLORS.purple))
          .attr("rx", 3)
          .attr("opacity", anim ? 0 : 1);
        if (anim) rx.transition().duration(700).delay((d) => 1600 + d.i * 15).attr("opacity", 1);

        PRECODE_ERASED.forEach((i) => {
          const r = g
            .append("rect")
            .attr("x", rightX)
            .attr("y", i * step)
            .attr("width", size)
            .attr("height", size)
            .attr("fill", "none")
            .attr("stroke", COLORS.red)
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "4,2")
            .attr("opacity", anim ? 0 : 0.7);
          if (anim) r.transition().delay(1600).duration(400).attr("opacity", 0.7);
        });

        // Each parity symbol on the left repairs one erased symbol on the right.
        const midX = (leftX + rightX) / 2;
        const repairs = PRECODE_ERASED.map((erasedRow, k) => ({
          erasedRow,
          parityRow: PRECODE_K + k,
          delay: 3200 + k * 900,
        }));
        let finished = 0;
        repairs.forEach(({ erasedRow, parityRow, delay }) => {
          const y0 = parityRow * step + size / 2;
          const y1 = erasedRow * step + size / 2;
          const path = g
            .append("path")
            .attr("d", `M ${leftX + size} ${y0} C ${midX} ${y0}, ${midX} ${y1}, ${rightX} ${y1}`)
            .attr("fill", "none")
            .attr("stroke", COLORS.emerald)
            .attr("stroke-width", 3)
            .attr("stroke-dasharray", "8,4")
            .attr("opacity", anim ? 0 : 1);
          const fill = g
            .append("rect")
            .attr("x", rightX)
            .attr("y", erasedRow * step)
            .attr("width", size)
            .attr("height", size)
            .attr("fill", COLORS.emerald)
            .attr("rx", 3)
            .attr("opacity", anim ? 0 : 1);
          if (anim) {
            path.transition().delay(delay).duration(800).attr("opacity", 1);
            fill
              .transition()
              .delay(delay + 600)
              .duration(500)
              .attr("opacity", 1)
              .on("end", () => {
                finished++;
                if (finished === repairs.length) setPhase("done");
              });
          }
        });

        if (!anim) setPhase("done");
      };

      if (d3Ref.current) run(d3Ref.current);
      else
        import("d3").then((d3) => {
          d3Ref.current = d3;
          if (mountedRef.current) run(d3);
        });
    },
    [setPhase]
  );

  const run = useCallback(() => {
    setPhase("running");
    draw(true);
  }, [draw, setPhase]);

  const containerRef = useIntersectionInit(
    useCallback(() => {
      run();
      return () => {
        const svgEl = svgRef.current;
        if (svgEl && d3Ref.current) d3Ref.current.select(svgEl).selectAll("*").interrupt();
      };
    }, [run])
  );

  useElementResize(
    containerRef,
    useCallback(() => {
      if (phaseRef.current === "idle") return;
      // Redraw the final state at the new width; no replay on rotate.
      draw(false);
    }, [draw])
  );

  return (
    <div ref={containerRef} className="rq-viz-container" id="viz-precode">
      <div className="rq-viz-header">
        <h3 className="font-bold text-white uppercase tracking-widest text-sm flex items-center gap-2">
          <span className="w-2 h-2 bg-purple-400 rounded-full" aria-hidden="true" />
          Interactive 03: The Precode Repair
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={run}
            disabled={phase === "running"}
            className="rq-btn-action disabled:opacity-40 disabled:cursor-not-allowed"
            aria-live="polite"
          >
            {phase === "idle" ? "Run Simulation" : phase === "running" ? "Running…" : "Replay"}
          </button>
        </div>
      </div>
      <div ref={hostRef} className="flex-1 relative p-4 md:p-8 bg-gradient-to-b from-[#0a0a0c] to-[#050507]">
        <svg
          ref={svgRef}
          width="100%"
          height={PRECODE_HEIGHT}
          className="overflow-visible block"
          role="img"
          aria-label={`Precode repair: ${PRECODE_K} source symbols plus ${PRECODE_P} parity symbols form ${PRECODE_L} intermediate symbols. ${PRECODE_L - PRECODE_ERASED.length} arrive; rows ${PRECODE_ERASED.map((i) => i + 1).join(" and ")} are erased and recovered from the parity relations.`}
        />
      </div>
      <div className="p-4 md:p-6 border-t border-white/5 text-center text-sm text-slate-400 space-y-2">
        <p className="mb-0" role="status">
          {phase === "done"
            ? `${PRECODE_L - PRECODE_ERASED.length} of ${PRECODE_L} intermediate symbols arrived; the ${PRECODE_ERASED.length} erased ones (rows ${PRECODE_ERASED.map((i) => i + 1).join(", ")}) were rebuilt from parity.`
            : phase === "running"
              ? "Encoding, transmitting, then repairing the erased rows…"
              : "Scroll into view or press Run Simulation."}
        </p>
        <p className="mb-0 text-xs text-slate-500">
          Blue = source, purple = parity, green = repaired. Illustrative: the real
          RFC 6330 precode uses LDPC + HDPC constraints, not one parity per erasure.
        </p>
      </div>
    </div>
  );
}

// ============================================
// 6. TOY DECODE VIZ
// ============================================

interface ToyStep {
  text: string;
  known: Record<string, number>;
  active?: string;
  equations: string[];
}

const TOY_STEPS: ToyStep[] = [
  {
    text: "K=4 block initialized. Precode generates insurance parity P = A ⊕ C = 0x02.",
    known: {},
    equations: [],
  },
  {
    text: "Packet 1 arrives: Systematic symbol B = 0x42 is added to memory.",
    known: { B: 0x42 },
    active: "B",
    equations: ["B = 0x42"],
  },
  {
    text: "Packet 2 arrives: Systematic symbol D = 0x44 is added to memory.",
    known: { B: 0x42, D: 0x44 },
    active: "D",
    equations: ["B = 0x42", "D = 0x44"],
  },
  {
    text: "Packet 3 (Repair) arrives: y3 = P ⊕ D = 0x46. Since D is known, we solve P = y3 ⊕ D = 0x02.",
    known: { B: 0x42, D: 0x44, P: 0x02 },
    active: "P",
    equations: ["B = 0x42", "D = 0x44", "y3 = P ⊕ D = 0x46"],
  },
  {
    text: "Packet 4 (Repair) arrives: y4 = A ⊕ B = 0x03. Since B is known, we solve A = y4 ⊕ B = 0x41.",
    known: { A: 0x41, B: 0x42, D: 0x44, P: 0x02 },
    active: "A",
    equations: ["B = 0x42", "D = 0x44", "y3 = P ⊕ D = 0x46", "y4 = A ⊕ B = 0x03"],
  },
  {
    text: "DECODE FINAL: Using Precode P = A ⊕ C, we solve C = A ⊕ P = 0x43. File reconstructed!",
    known: { A: 0x41, B: 0x42, C: 0x43, D: 0x44, P: 0x02 },
    active: "C",
    equations: [
      "B = 0x42",
      "D = 0x44",
      "y3 = P ⊕ D = 0x46",
      "y4 = A ⊕ B = 0x03",
      "P = A ⊕ C = 0x02",
    ],
  },
];

export function ToyDecodeViz() {
  const [stepIdx, setStepIdx] = useState(0);
  const [isAuto, setIsAuto] = useState(false);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const step = TOY_STEPS[stepIdx];
  const symbols = ["A", "B", "C", "D", "P"];

  const stopAuto = useCallback(() => {
    if (autoRef.current) {
      clearInterval(autoRef.current);
      autoRef.current = null;
    }
    setIsAuto(false);
  }, []);

  const next = useCallback(() => {
    setStepIdx((i) => Math.min(i + 1, TOY_STEPS.length - 1));
  }, []);

  const prev = useCallback(() => {
    setStepIdx((i) => Math.max(i - 1, 0));
  }, []);

  const reset = useCallback(() => {
    stopAuto();
    setStepIdx(0);
  }, [stopAuto]);

  const autoPlay = useCallback(() => {
    if (autoRef.current) {
      stopAuto();
      return;
    }
    setIsAuto(true);
    autoRef.current = setInterval(() => {
      setStepIdx((i) => {
        if (i >= TOY_STEPS.length - 1) {
          if (autoRef.current) clearInterval(autoRef.current);
          autoRef.current = null;
          setIsAuto(false);
          return i;
        }
        return i + 1;
      });
    }, 2200);
  }, [stopAuto]);

  useEffect(() => {
    return () => {
      if (autoRef.current) clearInterval(autoRef.current);
    };
  }, []);

  const atStart = stepIdx === 0;
  const atEnd = stepIdx === TOY_STEPS.length - 1;

  return (
    <div className="rq-viz-container" id="viz-toy-decode">
      <div className="rq-viz-header flex-wrap gap-3">
        <h3 className="font-bold text-white uppercase tracking-widest text-sm flex items-center gap-2">
          <span className="w-2 h-2 bg-cyan-400 rounded-full" aria-hidden="true" />
          Interactive 04: End-to-End Toy Decode
        </h3>
        <div className="flex gap-2 flex-wrap">
          <button type="button" onClick={prev} disabled={atStart} className="rq-btn-secondary disabled:opacity-40 disabled:cursor-not-allowed">Back</button>
          <button type="button" onClick={next} disabled={atEnd} className="rq-btn-action disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
          <button type="button" onClick={reset} className="rq-btn-secondary">Reset</button>
          <button
            type="button"
            onClick={autoPlay}
            aria-pressed={isAuto}
            disabled={atEnd && !isAuto}
            className="rq-btn-action disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isAuto ? "Stop" : "Auto"}
          </button>
        </div>
      </div>
      <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="lg:col-span-2 bg-black/40 border border-white/5 rounded-2xl p-4">
          <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Step</div>
          <div className="text-slate-200 text-sm leading-relaxed" role="status" aria-live="polite">{step.text}</div>
        </div>
        <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
          <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-4">Symbols</div>
          <div className="grid grid-cols-5 gap-2 md:gap-4">
            {symbols.map((k) => {
              const v = step.known[k];
              const isActive = step.active === k;
              const isKnown = v !== undefined;
              return (
                <div
                  key={k}
                  className={`p-3 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all duration-500 flex flex-col items-center justify-center ${
                    isActive
                      ? "bg-cyan-400/15 border-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.3)] scale-105"
                      : isKnown
                        ? "bg-emerald-500/5 border-emerald-500/30"
                        : "bg-white/[0.02] border-white/5"
                  }`}
                >
                  <div className="text-[10px] md:text-[12px] text-slate-500 font-[950] tracking-[0.3em] md:tracking-[0.6em] mb-2 md:mb-4 uppercase">
                    {k}
                  </div>
                  <div
                    className={`font-mono text-lg md:text-3xl font-[1000] ${isKnown ? "text-white" : "text-slate-600"}`}
                    aria-label={isKnown ? undefined : `${k} unknown`}
                  >
                    {isKnown ? `0x${v.toString(16).toUpperCase().padStart(2, "0")}` : "??"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
          <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-4">Equations</div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {step.equations.map((eq, i) => (
              <div
                key={i}
                className="px-3 md:px-5 py-2 md:py-3 rounded-full bg-white/[0.03] border border-white/10 text-xs md:text-sm text-slate-400 font-mono font-bold tracking-wider uppercase"
              >
                {eq}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="p-4 md:p-6 border-t border-white/5 text-sm text-slate-500 text-center">
        TRACE LOG: CYCLE {stepIdx + 1} / {TOY_STEPS.length}
      </div>
    </div>
  );
}
