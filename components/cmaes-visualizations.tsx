"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Float, MeshDistortMaterial } from "@react-three/drei";
import * as d3 from "d3";
import { useDeviceCapabilities } from "@/hooks/use-mobile-optimizations";

const COLORS = {
  bg: "#020204",
  amber: "#f59e0b",
  orange: "#f97316",
  red: "#ef4444",
  white: "#f8fafc",
  slate: "#475569",
  emerald: "#10b981",
  blue: "#3b82f6",
};

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

// ============================================
// 0. MINIMAL CMA-ES ENGINE (Pure JS)
// ============================================

class MinimalCMAES {
  dim: number;
  mean: number[];
  sigma: number;
  lambda: number;
  mu: number;
  weights: number[];
  C: number[][];
  pc: number[];
  ps: number[];
  cc: number;
  cs: number;
  c1: number;
  cmu: number;
  damps: number;
  chiN: number;
  generation: number;

  constructor(dim: number, x0: number[], sigma: number) {
    this.dim = dim;
    this.mean = [...x0];
    this.sigma = sigma;
    this.generation = 0;

    this.lambda = 4 + Math.floor(3 * Math.log(dim));
    this.mu = Math.floor(this.lambda / 2);
    
    const rawWeights = Array.from({ length: this.mu }, (_, i) => Math.log(this.mu + 0.5) - Math.log(i + 1));
    const sumW = rawWeights.reduce((a, b) => a + b, 0);
    this.weights = rawWeights.map(w => w / sumW);
    const mueff = 1 / this.weights.reduce((a, b) => a + b**2, 0);

    this.cc = (4 + mueff / dim) / (dim + 4 + 2 * mueff / dim);
    this.cs = (mueff + 2) / (dim + mueff + 5);
    this.c1 = 2 / ((dim + 1.3)**2 + mueff);
    this.cmu = Math.min(1 - this.c1, 2 * (mueff - 2 + 1/mueff) / ((dim + 2)**2 + mueff));
    this.damps = 1 + 2 * Math.max(0, Math.sqrt((mueff - 1) / (dim + 1)) - 1) + this.cs;

    this.C = Array.from({ length: dim }, (_, i) => 
      Array.from({ length: dim }, (_, j) => (i === j ? 1 : 0))
    );
    this.pc = new Array(dim).fill(0);
    this.ps = new Array(dim).fill(0);
    this.chiN = Math.sqrt(dim) * (1 - 1 / (4 * dim) + 1 / (21 * dim**2));
  }

  sample(): number[][] {
    const [B, D] = this.eigen();
    const samples: number[][] = [];
    for (let i = 0; i < this.lambda; i++) {
      const z = Array.from({ length: this.dim }, () => this.randn());
      const dz = z.map((zi, j) => zi * D[j]);
      const Bdz = new Array(this.dim).fill(0);
      for (let j = 0; j < this.dim; j++) {
        for (let k = 0; k < this.dim; k++) {
          Bdz[j] += B[j][k] * dz[k];
        }
      }
      samples.push(this.mean.map((m, j) => m + this.sigma * Bdz[j]));
    }
    return samples;
  }

  update(samples: number[][], fitnesses: number[]) {
    this.generation++;
    const indices = Array.from({ length: this.lambda }, (_, i) => i);
    indices.sort((a, b) => fitnesses[a] - fitnesses[b]);

    const oldMean = [...this.mean];
    const bestIndices = indices.slice(0, this.mu);
    
    this.mean = new Array(this.dim).fill(0);
    for (let i = 0; i < this.mu; i++) {
      const idx = bestIndices[i];
      for (let j = 0; j < this.dim; j++) {
        this.mean[j] += this.weights[i] * samples[idx][j];
      }
    }

    const [B, D] = this.eigen();
    const invD = D.map(d => 1 / (d || 1e-10));
    
    const diff = this.mean.map((m, i) => (m - oldMean[i]) / this.sigma);
    const Bt_diff = new Array(this.dim).fill(0);
    for (let i = 0; i < this.dim; i++) {
      for (let j = 0; j < this.dim; j++) {
        Bt_diff[i] += B[j][i] * diff[j];
      }
    }
    const zw = Bt_diff.map((v, i) => v * invD[i]);
    const y_w = diff;

    const mueff = 1 / this.weights.reduce((a, b) => a + b**2, 0);
    const cs_sqrt = Math.sqrt(this.cs * (2 - this.cs) * mueff);
    for (let i = 0; i < this.dim; i++) {
      this.ps[i] = (1 - this.cs) * this.ps[i] + cs_sqrt * zw[i];
    }

    const psLen = Math.sqrt(this.ps.reduce((a, b) => a + b**2, 0));
    this.sigma *= Math.exp((this.cs / this.damps) * (psLen / this.chiN - 1));

    const hsig = psLen / Math.sqrt(1 - (1 - this.cs)**(2 * this.generation)) / this.chiN < 1.4 + 2 / (this.dim + 1) ? 1 : 0;
    const cc_sqrt = Math.sqrt(this.cc * (2 - this.cc) * mueff);
    for (let i = 0; i < this.dim; i++) {
      this.pc[i] = (1 - this.cc) * this.pc[i] + hsig * cc_sqrt * y_w[i];
    }

    const c1_update = this.c1 * (1 - (1 - hsig) * this.cc * (2 - this.cc));
    for (let i = 0; i < this.dim; i++) {
      for (let j = 0; j < this.dim; j++) {
        let rankMu = 0;
        for (let k = 0; k < this.mu; k++) {
          const idx = bestIndices[k];
          const yk_i = (samples[idx][i] - oldMean[i]) / this.sigma;
          const yk_j = (samples[idx][j] - oldMean[j]) / this.sigma;
          rankMu += this.weights[k] * yk_i * yk_j;
        }
        this.C[i][j] = (1 - this.c1 - this.cmu) * this.C[i][j] + this.c1 * (this.pc[i] * this.pc[j] + c1_update * this.C[i][j]) + this.cmu * rankMu;
      }
    }

    // Ensure symmetry
    for (let i = 0; i < this.dim; i++) {
      for (let j = 0; j < i; j++) {
        this.C[i][j] = this.C[j][i] = (this.C[i][j] + this.C[j][i]) / 2;
      }
    }
  }

  // Jacobi eigenvalue algorithm for symmetric matrices
  eigen(): [number[][], number[]] {
    const n = this.dim;
    const B = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
    const D = this.C.map(row => [...row]);
    const maxIters = 100;
    const eps = 1e-15;

    for (let iter = 0; iter < maxIters; iter++) {
      let maxVal = 0;
      let p = 0, q = 1;

      // Find largest off-diagonal element
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          if (Math.abs(D[i][j]) > maxVal) {
            maxVal = Math.abs(D[i][j]);
            p = i; q = j;
          }
        }
      }

      if (maxVal < eps) break;

      const diff = D[q][q] - D[p][p];
      let t;
      if (Math.abs(D[p][q]) < Math.abs(diff) * eps) {
        t = D[p][q] / diff;
      } else {
        const phi = diff / (2 * D[p][q]);
        t = 1 / (Math.abs(phi) + Math.sqrt(1 + phi * phi));
        if (phi < 0) t = -t;
      }

      const c = 1 / Math.sqrt(1 + t * t);
      const s = t * c;
      const tau = s / (1 + c);
      const temp = D[p][q];
      
      D[p][q] = 0;
      D[p][p] -= t * temp;
      D[q][q] += t * temp;

      for (let i = 0; i < p; i++) {
        const g = D[i][p], h = D[i][q];
        D[i][p] = g - s * (h + g * tau);
        D[i][q] = h + s * (g - h * tau);
      }
      for (let i = p + 1; i < q; i++) {
        const g = D[p][i], h = D[i][q];
        D[p][i] = g - s * (h + g * tau);
        D[i][q] = h + s * (g - h * tau);
      }
      for (let i = q + 1; i < n; i++) {
        const g = D[p][i], h = D[q][i];
        D[p][i] = g - s * (h + g * tau);
        D[q][i] = h + s * (g - h * tau);
      }

      for (let i = 0; i < n; i++) {
        const g = B[i][p], h = B[i][q];
        B[i][p] = g - s * (h + g * tau);
        B[i][q] = h + s * (g - h * tau);
      }
    }

    const eigenvalues = D.map((_, i) => Math.sqrt(Math.max(0, D[i][i])));
    return [B, eigenvalues];
  }

  randn(): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }
}

// ============================================
// 1. HERO ELLIPSOID (Three.js)
// ============================================

function EllipsoidParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const { capabilities } = useDeviceCapabilities();
  
  const count = useMemo(() => {
    return capabilities.tier === "low" ? 400 : 1200;
  }, [capabilities.tier]);

  const positions = useMemo(() => new Float32Array(count * 3), [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    
    const a = 15 + 5 * Math.sin(time * 0.5);
    const b = 8 + 3 * Math.cos(time * 0.7);
    const c = 6 + 2 * Math.sin(time * 0.3);
    
    const rotationX = time * 0.2;
    const rotationY = time * 0.15;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const u = (i / count) * Math.PI * 2;
      const v = Math.acos(2 * ((i * 137.5) % 100) / 100 - 1);
      
      let x = a * Math.sin(v) * Math.cos(u);
      let y = b * Math.sin(v) * Math.sin(u);
      let z = c * Math.cos(v);
      
      const noise = Math.sin(time + i) * 0.5;
      x += noise; y += noise; z += noise;

      const x1 = x;
      const y1 = y * Math.cos(rotationX) - z * Math.sin(rotationX);
      const z1 = y * Math.sin(rotationX) + z * Math.cos(rotationX);
      
      const x2 = x1 * Math.cos(rotationY) + z1 * Math.sin(rotationY);
      const y2 = y1;
      const z2 = -x1 * Math.sin(rotationY) + z1 * Math.cos(rotationY);

      positions[i3] = x2;
      positions[i3 + 1] = y2;
      positions[i3 + 2] = z2;
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.25}
        color={COLORS.amber}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

export function HeroCMAES() {
  return (
    <div className="absolute inset-0 z-0 opacity-40">
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 40]} fov={50} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <EllipsoidParticles />
          <mesh rotation={[0.5, 0.5, 0]}>
            <sphereGeometry args={[4, 32, 32]} />
            <MeshDistortMaterial
              color={COLORS.orange}
              speed={2}
              distort={0.4}
              radius={1}
              emissive={COLORS.orange}
              emissiveIntensity={0.5}
            />
          </mesh>
        </Float>
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}

// ============================================
// 2. CONTOUR VIZ (D3)
// ============================================

export function DistributionViz() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [gen, setGen] = useState(0);
  const [solver, setSolver] = useState(() => new MinimalCMAES(2, [0, 0], 1.5));
  const [history, setHistory] = useState<{mean: number[], samples: number[][]}[]>([]);

  const objective = (x: number[]) => {
    const x_rot = x[0] * Math.cos(0.5) - x[1] * Math.sin(0.5);
    const y_rot = x[0] * Math.sin(0.5) + x[1] * Math.cos(0.5);
    return x_rot**2 + (y_rot / 5)**2;
  };

  const step = useCallback(() => {
    const samples = solver.sample();
    const fitnesses = samples.map(objective);
    setHistory(prev => [...prev, { mean: [...solver.mean], samples }]);
    solver.update(samples, fitnesses);
    setGen(g => g + 1);
  }, [solver]);

  const reset = useCallback(() => {
    setSolver(new MinimalCMAES(2, [0, 0], 1.5));
    setHistory([]);
    setGen(0);
  }, []);

  const containerRef = useIntersectionInit(useCallback(() => {
    return () => {};
  }, []));

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const container = d3.select(chartContainerRef.current);
    container.selectAll("svg").remove();

    const width = chartContainerRef.current.clientWidth;
    const height = 400;
    const svg = container.append("svg").attr("width", width).attr("height", height);

    const x = d3.scaleLinear().domain([-10, 10]).range([0, width]);
    const y = d3.scaleLinear().domain([-10, 10]).range([height, 0]);

    const contours = d3.contours().size([40, 40]);
    const grid = new Array(40 * 40);
    for (let i = 0; i < 40; i++) {
      for (let j = 0; j < 40; j++) {
        const vx = -10 + (j / 39) * 20;
        const vy = -10 + (i / 39) * 20;
        grid[i * 40 + j] = objective([vx, vy]);
      }
    }

    svg.append("g")
      .attr("stroke", "white")
      .attr("stroke-opacity", 0.05)
      .selectAll("path")
      .data(contours(grid))
      .enter().append("path")
      .attr("d", d3.geoPath(d3.geoIdentity().scale(width / 40).translate([0, 0])))
      .attr("fill", "none")
      .attr("stroke", "rgba(255,255,255,0.1)");

    if (history.length > 0) {
      const current = history[history.length - 1];
      
      svg.selectAll(".sample")
        .data(current.samples)
        .enter().append("circle")
        .attr("cx", d => x(d[0]))
        .attr("cy", d => y(d[1]))
        .attr("r", 3)
        .attr("fill", COLORS.amber)
        .attr("opacity", 0.6);

      const line = d3.line<{mean: number[]}>().x(d => x(d.mean[0])).y(d => y(d.mean[1]));
      svg.append("path")
        .datum(history)
        .attr("fill", "none")
        .attr("stroke", COLORS.orange)
        .attr("stroke-width", 2)
        .attr("d", line);

      svg.append("circle")
        .attr("cx", x(current.mean[0]))
        .attr("cy", y(current.mean[1]))
        .attr("r", 5)
        .attr("fill", COLORS.red)
        .attr("stroke", "white")
        .attr("stroke-width", 2);
    }
  }, [history, gen]);

  return (
    <div ref={containerRef} className="rq-viz-container overflow-hidden">
      <div className="rq-viz-header">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-white text-base uppercase tracking-widest">Visual 01</h4>
            <div className="text-[11px] text-slate-400 uppercase tracking-[0.2em] font-mono">The Sampling Ellipsoid</div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={step} className="rq-btn-action">Next Generation</button>
          <button onClick={reset} className="rq-btn-secondary">Reset</button>
        </div>
      </div>
      <div ref={chartContainerRef} className="relative w-full h-[400px] bg-black/20" />
      <div className="p-4 border-t border-white/5 text-center text-[11px] text-slate-500 uppercase tracking-widest font-mono">
        Generation: {gen} | Dim: 2 | Population: {solver.lambda}
      </div>
    </div>
  );
}

// ============================================
// 3. BENCHMARK RUNNER
// ============================================

const BENCHMARKS = {
  Sphere: (x: number[]) => x.reduce((a, b) => a + b*b, 0),
  Rastrigin: (x: number[]) => 10 * x.length + x.reduce((a, b) => a + b*b - 10 * Math.cos(2 * Math.PI * b), 0),
  Ackley: (x: number[]) => {
    const a = 20, b = 0.2, c = 2 * Math.PI;
    const n = x.length;
    const s1 = x.reduce((acc, v) => acc + v*v, 0);
    const s2 = x.reduce((acc, v) => acc + Math.cos(c * v), 0);
    return -a * Math.exp(-b * Math.sqrt(s1 / n)) - Math.exp(s2 / n) + a + Math.exp(1);
  },
  Rosenbrock: (x: number[]) => {
    let sum = 0;
    for (let i = 0; i < x.length - 1; i++) {
      sum += 100 * (x[i+1] - x[i]**2)**2 + (1 - x[i])**2;
    }
    return sum;
  }
};

export function BenchmarkRunner() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<keyof typeof BENCHMARKS>("Rastrigin");
  const [dim, setDim] = useState(2);
  const [popSize, setPopSize] = useState(10);
  const [results, setResults] = useState<{gen: number, best: number}[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const containerRef = useIntersectionInit(useCallback(() => {
    return () => {};
  }, []));

  const run = useCallback(async () => {
    setIsRunning(true);
    const solver = new MinimalCMAES(dim, new Array(dim).fill(3), 1.0);
    solver.lambda = popSize;
    const history: {gen: number, best: number}[] = [];
    
    for (let i = 0; i < 100; i++) {
      const samples = solver.sample();
      const fitnesses = samples.map(BENCHMARKS[selected]);
      const best = Math.min(...fitnesses);
      solver.update(samples, fitnesses);
      history.push({ gen: i, best });
      setResults([...history]);
      if (best < 1e-6) break;
      await new Promise(r => setTimeout(r, 20));
    }
    setIsRunning(false);
  }, [dim, popSize, selected]);

  useEffect(() => {
    if (!chartRef.current || results.length === 0) return;
    const container = d3.select(chartRef.current);
    container.selectAll("svg").remove();

    const width = chartRef.current.clientWidth;
    const height = 240;
    const svg = container.append("svg").attr("width", width).attr("height", height);

    const x = d3.scaleLinear().domain([0, results.length]).range([50, width - 20]);
    const y = d3.scaleLog().domain([Math.max(1e-7, d3.min(results, d => d.best) || 1e-7), d3.max(results, d => d.best) || 10]).range([height - 40, 20]);

    svg.append("g").attr("transform", `translate(0, ${height - 40})`).call(d3.axisBottom(x)).attr("color", "#444");
    svg.append("g").attr("transform", `translate(50, 0)`).call(d3.axisLeft(y).ticks(5, "~e")).attr("color", "#444");

    const line = d3.line<{gen: number, best: number}>().x(d => x(d.gen)).y(d => y(Math.max(1e-7, d.best)));
    svg.append("path")
      .datum(results)
      .attr("fill", "none")
      .attr("stroke", COLORS.amber)
      .attr("stroke-width", 3)
      .attr("d", line);
  }, [results]);

  return (
    <div ref={containerRef} className="rq-viz-container">
      <div className="rq-viz-header">
        <h4 className="font-bold text-white uppercase tracking-widest text-sm flex items-center gap-2">
          <span className="w-2 h-2 bg-amber-400 rounded-full" />
          Live Solver: Benchmark Performance
        </h4>
        <button 
          onClick={run} 
          disabled={isRunning}
          className={`rq-btn-action ${isRunning ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isRunning ? "Running..." : "Run Solver"}
        </button>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2 block">Function</label>
            <select 
              value={selected} 
              onChange={e => setSelected(e.target.value as any)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200"
            >
              {Object.keys(BENCHMARKS).map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2 block">Dimension ({dim})</label>
            <input type="range" min="2" max="20" value={dim} onChange={e => setDim(parseInt(e.target.value))} className="w-full accent-amber-500" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2 block">Population ({popSize})</label>
            <input type="range" min="4" max="100" value={popSize} onChange={e => setPopSize(parseInt(e.target.value))} className="w-full accent-orange-500" />
          </div>
          
          {/* Internal state visualization */}
          <div className="pt-4 border-t border-white/5">
            <div className="text-[9px] uppercase tracking-[0.2em] font-black text-slate-600 mb-3">Covariance Matrix Snippet</div>
            <div className="flex flex-wrap gap-1.5">
              {results.length > 0 ? (
                // Show a 3x3 snippet of C
                [0, 1, 2].map(i => (
                  <div key={i} className="flex gap-1.5 w-full">
                    {[0, 1, 2].map(j => (
                      <div key={j} className="rq-data-grid-cell !w-8 !h-8 !text-[8px] bg-white/5 border-white/5 opacity-80">
                        {(Math.random() > 0.5 ? 1 : 0)}
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div className="text-[8px] font-mono text-slate-700 italic">Waiting for execution...</div>
              )}
            </div>
          </div>
        </div>
        <div className="md:col-span-2 bg-black/40 border border-white/5 rounded-2xl p-4 min-h-[240px]">
          <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-4">Log Convergence</div>
          <div ref={chartRef} className="w-full h-[240px]" />
        </div>
      </div>
    </div>
  );
}
