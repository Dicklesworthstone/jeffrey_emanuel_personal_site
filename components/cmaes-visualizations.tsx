"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Float, 
  MeshTransmissionMaterial,
  Environment
} from "@react-three/drei";
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
  purple: "#a855f7",
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
// 0. ROBUST ENHANCED CMA-ES ENGINE
// ============================================

class ProCMAES {
  dim: number;
  mean: number[];
  sigma: number;
  lambda: number;
  mu: number;
  weights: number[];
  mueff: number;
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
  
  // Cache for viz performance
  lastB: number[][] = [];
  lastD: number[] = [];

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
    this.mueff = 1 / this.weights.reduce((a, b) => a + b**2, 0);

    this.cc = (4 + this.mueff / dim) / (dim + 4 + 2 * this.mueff / dim);
    this.cs = (this.mueff + 2) / (dim + this.mueff + 5);
    this.c1 = 2 / ((dim + 1.3)**2 + this.mueff);
    this.cmu = Math.min(1 - this.c1, 2 * (this.mueff - 2 + 1/this.mueff) / ((dim + 2)**2 + this.mueff));
    this.damps = 1 + 2 * Math.max(0, Math.sqrt((this.mueff - 1) / (dim + 1)) - 1) + this.cs;

    this.C = Array.from({ length: dim }, (_, i) => 
      Array.from({ length: dim }, (_, j) => (i === j ? 1 : 0))
    );
    this.pc = new Array(dim).fill(0);
    this.ps = new Array(dim).fill(0);
    this.chiN = Math.sqrt(dim) * (1 - 1 / (4 * dim) + 1 / (21 * dim**2));
    
    this.syncEigen();
  }

  private syncEigen() {
    const [B, D] = this.eigen();
    this.lastB = B;
    this.lastD = D;
  }

  sample(): number[][] {
    const samples: number[][] = [];
    const B = this.lastB;
    const D = this.lastD;
    
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
    
    // Update mean
    this.mean = new Array(this.dim).fill(0);
    for (let i = 0; i < this.mu; i++) {
      const idx = bestIndices[i];
      for (let j = 0; j < this.dim; j++) {
        this.mean[j] += this.weights[i] * samples[idx][j];
      }
    }

    const B = this.lastB;
    const invD = this.lastD.map(d => 1 / (d || 1e-10));
    
    // Step in mean space
    const diff = this.mean.map((m, i) => (m - oldMean[i]) / (this.sigma || 1e-10));
    const Bt_diff = new Array(this.dim).fill(0);
    for (let i = 0; i < this.dim; i++) {
      for (let j = 0; j < this.dim; j++) {
        Bt_diff[i] += B[j][i] * diff[j];
      }
    }
    const zw = Bt_diff.map((v, i) => v * invD[i]);
    const y_w = diff;

    // Update ps (conjugate evolution path)
    const cs_sqrt = Math.sqrt(this.cs * (2 - this.cs) * this.mueff);
    for (let i = 0; i < this.dim; i++) {
      this.ps[i] = (1 - this.cs) * this.ps[i] + cs_sqrt * zw[i];
    }

    // Update sigma
    const psLen = Math.sqrt(this.ps.reduce((a, b) => a + b**2, 0));
    this.sigma *= Math.exp((this.cs / this.damps) * (psLen / this.chiN - 1));
    this.sigma = Math.min(Math.max(this.sigma, 1e-12), 1e6); // Safety clamp

    // Update pc (evolution path)
    const hsig = psLen / Math.sqrt(1 - (1 - this.cs)**(2 * this.generation)) / this.chiN < 1.4 + 2 / (this.dim + 1) ? 1 : 0;
    const cc_sqrt = Math.sqrt(this.cc * (2 - this.cc) * this.mueff);
    for (let i = 0; i < this.dim; i++) {
      this.pc[i] = (1 - this.cc) * this.pc[i] + hsig * cc_sqrt * y_w[i];
    }

    // Corrected Covariance update
    const hsig_delta = (1 - hsig) * this.cc * (2 - this.cc);
    const c1_coeff = this.c1;
    const cmu_coeff = this.cmu;
    const decay_coeff = 1 - c1_coeff - cmu_coeff;

    for (let i = 0; i < this.dim; i++) {
      for (let j = 0; j < this.dim; j++) {
        let rankMu = 0;
        for (let k = 0; k < this.mu; k++) {
          const idx = bestIndices[k];
          const yk_i = (samples[idx][i] - oldMean[i]) / (this.sigma || 1e-10);
          const yk_j = (samples[idx][j] - oldMean[j]) / (this.sigma || 1e-10);
          rankMu += this.weights[k] * yk_i * yk_j;
        }
        
        this.C[i][j] = decay_coeff * this.C[i][j] + 
                       c1_coeff * (this.pc[i] * this.pc[j] + hsig_delta * this.C[i][j]) + 
                       cmu_coeff * rankMu;
      }
    }

    // Stability: Ensure symmetry and add tiny regularization
    for (let i = 0; i < this.dim; i++) {
      for (let j = 0; j <= i; j++) {
        const val = (this.C[i][j] + this.C[j][i]) / 2;
        this.C[i][j] = this.C[j][i] = val;
        if (i === j) this.C[i][i] += 1e-16;
      }
    }
    
    this.syncEigen();
  }

  eigen(): [number[][], number[]] {
    const n = this.dim;
    const B = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
    const D_mat = this.C.map(row => [...row]);
    const maxIters = 100;
    const eps = 1e-15;

    for (let iter = 0; iter < maxIters; iter++) {
      let maxVal = 0;
      let p = 0, q = 1;
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          if (Math.abs(D_mat[i][j]) > maxVal) {
            maxVal = Math.abs(D_mat[i][j]);
            p = i; q = j;
          }
        }
      }
      if (maxVal < eps) break;
      const diff = D_mat[q][q] - D_mat[p][p];
      let t;
      if (Math.abs(D_mat[p][q]) < Math.abs(diff) * eps) {
        t = D_mat[p][q] / (diff || 1e-20);
      } else {
        const phi = diff / (2 * D_mat[p][q]);
        t = 1 / (Math.abs(phi) + Math.sqrt(1 + phi * phi));
        if (phi < 0) t = -t;
      }
      const c = 1 / Math.sqrt(1 + t * t);
      const s = t * c;
      const tau = s / (1 + c);
      const temp = D_mat[p][q];
      D_mat[p][q] = 0;
      D_mat[p][p] -= t * temp;
      D_mat[q][q] += t * temp;
      for (let i = 0; i < p; i++) {
        const g = D_mat[i][p], h = D_mat[i][q];
        D_mat[i][p] = g - s * (h + g * tau);
        D_mat[i][q] = h + s * (g - h * tau);
      }
      for (let i = p + 1; i < q; i++) {
        const g = D_mat[p][i], h = D_mat[i][q];
        D_mat[p][i] = g - s * (h + g * tau);
        D_mat[i][q] = h + s * (g - h * tau);
      }
      for (let i = q + 1; i < n; i++) {
        const g = D_mat[p][i], h = D_mat[q][i];
        D_mat[p][i] = g - s * (h + g * tau);
        D_mat[q][i] = h + s * (g - h * tau);
      }
      for (let i = 0; i < n; i++) {
        const g = B[i][p], h = B[i][q];
        B[i][p] = g - s * (h + g * tau);
        B[i][q] = h + s * (g - h * tau);
      }
    }
    const eigenvalues = D_mat.map((_, i) => Math.sqrt(Math.max(0, D_mat[i][i])));
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
// 1. HERO: THE LIVING DISTRIBUTION (Three.js)
// ============================================

function DistributionCloud() {
  const meshRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const { capabilities } = useDeviceCapabilities();
  
  const count = useMemo(() => capabilities.tier === "low" ? 300 : 800, [capabilities.tier]);
  const positions = useMemo(() => new Float32Array(count * 3), [count]);

  useFrame((state) => {
    if (!meshRef.current || !pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    
    const scaleX = 1 + 0.8 * Math.sin(t * 0.4);
    const scaleY = 1 + 0.4 * Math.cos(t * 0.6);
    const scaleZ = 0.5 + 0.2 * Math.sin(t * 0.8);
    
    meshRef.current.scale.set(scaleX * 4, scaleY * 4, scaleZ * 4);
    meshRef.current.rotation.y = t * 0.2;
    meshRef.current.rotation.z = Math.sin(t * 0.1) * 0.5;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = (2 + Math.sin(t + i * 0.5) * 0.5) * 5;
      const phi = Math.acos(2 * ((i * 1.618) % 1) - 1);
      const theta = 2 * Math.PI * ((i * 2.718) % 1);
      
      positions[i3] = r * Math.sin(phi) * Math.cos(theta) * scaleX;
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * scaleY;
      positions[i3 + 2] = r * Math.cos(phi) * scaleZ;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={1}
          roughness={0.1}
          chromaticAberration={0.5}
          anisotropy={0.3}
          distortion={0.5}
          distortionScale={0.5}
          temporalDistortion={0.1}
          color={COLORS.amber}
          emissive={COLORS.orange}
          emissiveIntensity={0.2}
        />
      </mesh>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          color={COLORS.amber}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export function HeroCMAES() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 30]} fov={40} />
        <Environment preset="night" />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color={COLORS.amber} />
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <DistributionCloud />
        </Float>
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}

// ============================================
// 2. INTERACTIVE WALKTHROUGH
// ============================================

const STEPS = [
  { id: "sample", title: "1. Isotropic Sampling", desc: "Initially, the algorithm knows nothing. It samples points from a spherical Gaussian distribution.", color: COLORS.blue },
  { id: "rank", title: "2. Selection & Ranking", desc: "Each point is evaluated. The 'Elite' (top 50%) are chosen to drive the next generation.", color: COLORS.emerald },
  { id: "adapt-mean", title: "3. Mean Shift", desc: "The center of the search moves toward the weighted average of the survivors.", color: COLORS.amber },
  { id: "adapt-cov", title: "4. Covariance Stretch", desc: "The ellipsoid elongates along successful directions, learning the objective's geometry.", color: COLORS.orange }
];

export function SelectionWalkthrough() {
  const [stepIdx, setStepIdx] = useState(0);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  const solver = useMemo(() => new ProCMAES(2, [0, 0], 2), []);
  const [data, setData] = useState<any>(null);

  const objective = useCallback((x: number[]) => {
    const x_rot = x[0] * Math.cos(0.4) - x[1] * Math.sin(0.4);
    const y_rot = x[0] * Math.sin(0.4) + x[1] * Math.cos(0.4);
    return x_rot**2 + (y_rot / 4)**2;
  }, []);

  const nextStep = useCallback(() => {
    if (stepIdx === 0) {
      const samples = solver.sample();
      const fitnesses = samples.map(objective);
      const indices = Array.from({ length: solver.lambda }, (_, i) => i);
      indices.sort((a, b) => fitnesses[a] - fitnesses[b]);
      
      setData({
        samples: indices.map((idx, rank) => ({
          x: samples[idx],
          f: fitnesses[idx],
          rank,
          isElite: rank < solver.mu
        })),
        oldMean: [...solver.mean],
        oldB: solver.lastB.map(r => [...r]),
        oldD: [...solver.lastD]
      });
      setStepIdx(1);
    } else if (stepIdx === 1) {
      setStepIdx(2);
    } else if (stepIdx === 2) {
      setStepIdx(3);
    } else {
      const fitnesses = data.samples.map((s: any) => s.f);
      const rawSamples = data.samples.map((s: any) => s.x);
      solver.update(rawSamples, fitnesses);
      setStepIdx(0);
      setData(null);
    }
  }, [stepIdx, data, solver, objective]);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const container = d3.select(chartContainerRef.current);
    container.selectAll("svg").remove();
    
    const w = chartContainerRef.current.clientWidth;
    const h = 400;
    const svg = container.append("svg").attr("width", w).attr("height", h);
    const g = svg.append("g");
    
    const x = d3.scaleLinear().domain([-8, 8]).range([0, w]);
    const y = d3.scaleLinear().domain([-8, 8]).range([h, 0]);

    // Draw background contours
    const grid = new Array(40 * 40);
    for (let i = 0; i < 40; i++) {
      for (let j = 0; j < 40; j++) {
        grid[i * 40 + j] = objective([-8 + (j/39)*16, -8 + (i/39)*16]);
      }
    }
    const contours = d3.contours().size([40, 40]);
    g.selectAll("path.contour")
      .data(contours(grid))
      .enter().append("path")
      .attr("d", d3.geoPath(d3.geoIdentity().scale(w / 40)))
      .attr("fill", "none")
      .attr("stroke", "rgba(255,255,255,0.05)");

    if (data) {
      const [B, D] = stepIdx >= 3 ? solver.eigen() : [data.oldB, data.oldD];
      const currentMean = stepIdx >= 2 ? solver.mean : data.oldMean;
      const angle = Math.atan2(B[1][0], B[0][0]) * 180 / Math.PI;
      
      g.append("ellipse")
        .attr("cx", x(currentMean[0]))
        .attr("cy", y(currentMean[1]))
        .attr("rx", (D[0] * solver.sigma) * (w / 16))
        .attr("ry", (D[1] * solver.sigma) * (w / 16))
        .attr("transform", `rotate(${-angle}, ${x(currentMean[0])}, ${y(currentMean[1])})`)
        .attr("fill", "none")
        .attr("stroke", stepIdx >= 3 ? COLORS.orange : COLORS.slate)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", stepIdx >= 3 ? "none" : "4,4")
        .style("opacity", 0.6);

      g.selectAll("circle.sample")
        .data(data.samples)
        .enter().append("circle")
        .attr("cx", (d: any) => x(d.x[0]))
        .attr("cy", (d: any) => y(d.x[1]))
        .attr("r", (d: any) => d.isElite ? 5 : 3)
        .attr("fill", (d: any) => {
          if (stepIdx === 0) return COLORS.blue;
          return d.isElite ? COLORS.emerald : COLORS.red;
        })
        .style("opacity", (d: any) => {
          if (stepIdx === 1) return 1;
          if (stepIdx >= 2) return d.isElite ? 1 : 0.1;
          return 0.6;
        });

      if (stepIdx >= 2) {
        g.append("line")
          .attr("x1", x(data.oldMean[0]))
          .attr("y1", y(data.oldMean[1]))
          .attr("x2", x(solver.mean[0]))
          .attr("y2", y(solver.mean[1]))
          .attr("stroke", COLORS.amber)
          .attr("stroke-width", 2);
      }
    } else {
      g.append("circle")
        .attr("cx", x(solver.mean[0]))
        .attr("cy", y(solver.mean[1]))
        .attr("r", 6)
        .attr("fill", COLORS.amber)
        .attr("stroke", "white");
    }
  }, [data, stepIdx, solver, objective]);

  return (
    <div className="rq-viz-container">
      <div className="rq-viz-header">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-white text-base uppercase tracking-widest">Interactive 01</h4>
            <div className="text-[11px] text-slate-400 uppercase tracking-[0.2em] font-mono">The Selection Loop</div>
          </div>
        </div>
        <button onClick={nextStep} className="rq-btn-action">
          {stepIdx === 3 ? "Commit Update" : "Next Phase"}
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-px bg-white/5">
        {STEPS.map((s, i) => (
          <div key={s.id} className={`p-4 transition-colors duration-500 ${stepIdx === i ? "bg-white/10" : "bg-transparent opacity-40"}`}>
            <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: s.color }}>{s.title}</div>
            <p className="text-xs text-slate-400 leading-tight mb-0">{s.desc}</p>
          </div>
        ))}
      </div>

      <div ref={chartContainerRef} className="relative w-full h-[400px] bg-black/40 overflow-hidden" />
    </div>
  );
}

// ============================================
// 3. COMPARISON VIZ
// ============================================

export function ComparisonViz() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<"cma" | "gd">("cma");
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState<{x: number[]}[]>([]);

  const objective = useCallback((x: number[]) => {
    const x_rot = x[0] * Math.cos(0.5) - x[1] * Math.sin(0.5);
    const y_rot = x[0] * Math.sin(0.5) + x[1] * Math.cos(0.5);
    return x_rot**2 + (y_rot * 10)**2;
  }, []);

  const run = useCallback(async () => {
    setIsRunning(true);
    setHistory([]);
    const start = [4, 4];
    
    if (active === "cma") {
      const solver = new ProCMAES(2, start, 0.5);
      const h = [{ x: [...start] }];
      for (let i = 0; i < 40; i++) {
        const samples = solver.sample();
        const fitnesses = samples.map(objective);
        solver.update(samples, fitnesses);
        h.push({ x: [...solver.mean] });
        setHistory([...h]);
        if (Math.min(...fitnesses) < 1e-4) break;
        await new Promise(r => setTimeout(r, 50));
      }
    } else {
      let cur = [...start];
      const h = [{ x: [...cur] }];
      const lr = 0.005;
      for (let i = 0; i < 100; i++) {
        const eps = 1e-5;
        const gx = (objective([cur[0] + eps, cur[1]]) - objective([cur[0] - eps, cur[1]])) / (2 * eps);
        const gy = (objective([cur[0], cur[1] + eps]) - objective([cur[0], cur[1] - eps])) / (2 * eps);
        cur[0] -= lr * gx;
        cur[1] -= lr * gy;
        h.push({ x: [...cur] });
        setHistory([...h]);
        if (objective(cur) < 1e-4) break;
        await new Promise(r => setTimeout(r, 20));
      }
    }
    setIsRunning(false);
  }, [active, objective]);

  useEffect(() => {
    if (!chartRef.current) return;
    const container = d3.select(chartRef.current);
    container.selectAll("svg").remove();
    const w = chartRef.current.clientWidth;
    const h = 400;
    const svg = container.append("svg").attr("width", w).attr("height", h);
    const x = d3.scaleLinear().domain([-5, 5]).range([0, w]);
    const y = d3.scaleLinear().domain([-5, 5]).range([h, 0]);

    const grid = new Array(40 * 40);
    for (let i = 0; i < 40; i++) {
      for (let j = 0; j < 40; j++) {
        grid[i * 40 + j] = objective([-5 + (j/39)*10, -5 + (i/39)*10]);
      }
    }
    const contours = d3.contours().size([40, 40]);
    svg.selectAll("path.contour")
      .data(contours(grid))
      .enter().append("path")
      .attr("d", d3.geoPath(d3.geoIdentity().scale(w / 40)))
      .attr("fill", "none")
      .attr("stroke", "rgba(255,255,255,0.08)");

    if (history.length > 0) {
      const line = d3.line<any>().x(d => x(d.x[0])).y(d => y(d.x[1]));
      svg.append("path")
        .datum(history)
        .attr("fill", "none")
        .attr("stroke", active === "cma" ? COLORS.orange : COLORS.blue)
        .attr("stroke-width", 3)
        .attr("d", line);
      
      svg.append("circle")
        .attr("cx", x(history[history.length - 1].x[0]))
        .attr("cy", y(history[history.length - 1].x[1]))
        .attr("r", 5)
        .attr("fill", "white");
    }
  }, [history, active, objective]);

  return (
    <div className="rq-viz-container overflow-hidden">
      <div className="rq-viz-header">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-white text-base uppercase tracking-widest">Interactive 02</h4>
            <div className="text-[11px] text-slate-400 uppercase tracking-[0.2em] font-mono">CMA-ES vs Gradient Descent</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActive("cma")} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all ${active === "cma" ? "bg-orange-500 text-black" : "bg-white/5 text-slate-400"}`}>CMA-ES</button>
          <button onClick={() => setActive("gd")} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all ${active === "gd" ? "bg-blue-500 text-black" : "bg-white/5 text-slate-400"}`}>Gradient Descent</button>
          <button onClick={run} disabled={isRunning} className="rq-btn-action ml-4">Play</button>
        </div>
      </div>
      <div className="p-6 bg-white/[0.02] border-b border-white/5">
        <p className="text-sm text-slate-400 mb-0">
          In a <strong>narrow, rotated valley</strong>, standard Gradient Descent often oscillates wildly because its steps aren't aligned with the curvature. 
          <span className="text-orange-400 font-bold ml-1">CMA-ES</span> learns the "Cigar" shape, stretching its distribution to slide smoothly down the spine.
        </p>
      </div>
      <div ref={chartRef} className="relative w-full h-[400px] bg-black/20" />
    </div>
  );
}

// ============================================
// 4. BENCHMARK RUNNER
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
  const [dim, setDim] = useState(4);
  const [results, setResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentC, setCurrentC] = useState<number[][]>([]);

  const run = useCallback(async () => {
    setIsRunning(true);
    const solver = new ProCMAES(dim, new Array(dim).fill(3), 1.0);
    const history: any[] = [];
    
    for (let i = 0; i < 100; i++) {
      const samples = solver.sample();
      const fitnesses = samples.map(BENCHMARKS[selected]);
      const best = Math.min(...fitnesses);
      solver.update(samples, fitnesses);
      
      history.push({ gen: i, best, sigma: solver.sigma });
      setResults([...history]);
      
      if (i % 2 === 0) {
        setCurrentC(solver.C.slice(0, 3).map(r => r.slice(0, 3)));
      }

      if (best < 1e-10) break;
      await new Promise(r => setTimeout(r, 10));
    }
    setIsRunning(false);
  }, [dim, selected]);

  useEffect(() => {
    if (!chartRef.current || results.length === 0) return;
    const container = d3.select(chartRef.current);
    container.selectAll("svg").remove();
    const w = chartRef.current.clientWidth;
    const h = 240;
    const svg = container.append("svg").attr("width", w).attr("height", h);
    
    const x = d3.scaleLinear().domain([0, results.length]).range([60, w - 20]);
    const y = d3.scaleLog().domain([1e-10, 100]).range([h - 40, 20]);

    svg.append("g").attr("transform", `translate(0, ${h - 40})`).call(d3.axisBottom(x).ticks(5)).attr("color", "#444");
    svg.append("g").attr("transform", `translate(60, 0)`).call(d3.axisLeft(y).ticks(5, "~e")).attr("color", "#444");

    const line = d3.line<any>().x(d => x(d.gen)).y(d => y(Math.max(1e-10, d.best))).curve(d3.curveMonotoneX);
    svg.append("path")
      .datum(results)
      .attr("fill", "none")
      .attr("stroke", COLORS.amber)
      .attr("stroke-width", 3)
      .attr("d", line);

    const sigmaLine = d3.line<any>().x(d => x(d.gen)).y(d => y(Math.max(1e-10, d.sigma))).curve(d3.curveMonotoneX);
    svg.append("path")
      .datum(results)
      .attr("fill", "none")
      .attr("stroke", COLORS.purple)
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4,2")
      .attr("d", sigmaLine);
  }, [results]);

  return (
    <div className="rq-viz-container">
      <div className="rq-viz-header flex-wrap gap-4">
        <h4 className="font-bold text-white uppercase tracking-widest text-sm flex items-center gap-2">
          <span className="w-2 h-2 bg-amber-400 rounded-full" />
          Interactive 03: Live Benchmark Solver
        </h4>
        <div className="flex gap-2 ml-auto">
          <select value={selected} onChange={e => setSelected(e.target.value as any)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] uppercase font-black text-slate-300">
            {Object.keys(BENCHMARKS).map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <button onClick={run} disabled={isRunning} className="rq-btn-action">Run Algorithm</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        <div className="space-y-6">
          <div>
            <label className="text-[9px] uppercase tracking-widest font-black text-slate-500 mb-3 block">Dimensionality ({dim}D)</label>
            <input type="range" min="2" max="20" value={dim} onChange={e => setDim(parseInt(e.target.value))} className="w-full accent-amber-500" />
          </div>
          
          <div className="bg-black/40 border border-white/5 rounded-xl p-4">
            <div className="text-[9px] uppercase tracking-widest font-black text-slate-500 mb-3">Covariance Snippet (Top 3x3)</div>
            <div className="grid grid-cols-3 gap-1.5">
              {(currentC.length > 0 ? currentC : Array(3).fill(new Array(3).fill(0))).map((row, i) => 
                row.map((val, j) => (
                  <div key={`${i}-${j}`} className={`h-8 flex items-center justify-center font-mono text-[8px] rounded-lg transition-all duration-300 ${Math.abs(val) > 0.1 ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-white/5 text-slate-600 border border-transparent"}`}>
                    {val.toFixed(2)}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest">
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-amber-400 rounded-full" /> Best Fitness</div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-purple-400 rounded-full opacity-50" /> Step Size (\u03c3)</div>
          </div>
        </div>

        <div className="md:col-span-2 bg-black/40 border border-white/5 rounded-2xl p-4 min-h-[240px]">
          <div ref={chartRef} className="w-full h-[240px]" />
        </div>
      </div>
    </div>
  );
}
