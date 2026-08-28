"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
// Visibility-gated Canvas: pauses each scene's render loop while offscreen
import Canvas from "@/components/gated-canvas";
import {
  PerspectiveCamera,
  Float,
  MeshTransmissionMaterial,
  Environment,
  ContactShadows,
  PresentationControls,
  Line
} from "@react-three/drei";
import * as d3 from "d3";
import { motion } from "framer-motion";
import { useDeviceCapabilities } from "@/hooks/use-mobile-optimizations";
import { cn } from "@/lib/utils";
import { Play, RotateCcw, ChevronRight, Activity, Cpu, Box, Zap, Target } from "lucide-react";

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

// Axis colours that clear 3:1 against the #020204 chart background.
const AXIS_COLOR = "#64748b";
const AXIS_TEXT = "#94a3b8";

interface SelectionSample {
  x: number[];
  f: number;
  rank: number;
  isElite: boolean;
}

interface SelectionData {
  samples: SelectionSample[];
  oldMean: number[];
  oldB: number[][];
  oldD: number[];
  oldSigma: number;
  /** Solver state after applying this generation's update (committed on "Complete Loop"). */
  preview: ProCMAES;
}

interface BenchmarkPoint {
  gen: number;
  /** Running (monotone) best fitness seen so far. */
  best: number;
  /** Best fitness within this generation only. */
  genBest: number;
  sigma: number;
}

interface NoisePoint {
  gen: number;
  /** Lowest *noisy* sample value observed in this generation. */
  val: number;
  /** Noise-free objective evaluated at the distribution mean. */
  trueVal: number;
}

function useCoarsePointer() {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setCoarse(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return coarse;
}

function formatFitness(v: number) {
  if (!Number.isFinite(v)) return "n/a";
  if (Math.abs(v) >= 1000 || (Math.abs(v) < 1e-2 && v !== 0)) return v.toExponential(2);
  return v.toFixed(4);
}

// ============================================
// 0. ENGINE (Stability & Precision)
// ============================================

class ProCMAES {
  dim: number;
  mean: number[];
  sigma: number;
  // `!` — assigned in the constructor via setLambda()
  lambda!: number;
  mu!: number;
  weights!: number[];
  mueff!: number;
  C: number[][];
  pc: number[];
  ps: number[];
  cc!: number;
  cs!: number;
  c1!: number;
  cmu!: number;
  damps!: number;
  chiN: number;
  generation: number;

  lastB: number[][] = [];
  lastD: number[] = [];

  constructor(dim: number, x0: number[], sigma: number) {
    this.dim = dim;
    this.mean = [...x0];
    this.sigma = sigma;
    this.generation = 0;

    this.setLambda(4 + Math.floor(3 * Math.log(dim)));

    this.C = Array.from({ length: dim }, (_, i) =>
      Array.from({ length: dim }, (_, j) => (i === j ? 1 : 0))
    );
    this.pc = new Array(dim).fill(0);
    this.ps = new Array(dim).fill(0);
    this.chiN = Math.sqrt(dim) * (1 - 1 / (4 * dim) + 1 / (21 * dim**2));

    this.syncEigen();
  }

  /** Deep copy of the full solver state (used to preview an update before committing it). */
  clone(): ProCMAES {
    const c = new ProCMAES(this.dim, this.mean, this.sigma);
    c.setLambda(this.lambda);
    c.generation = this.generation;
    c.C = this.C.map(r => [...r]);
    c.pc = [...this.pc];
    c.ps = [...this.ps];
    c.lastB = this.lastB.map(r => [...r]);
    c.lastD = [...this.lastD];
    return c;
  }

  // Set population size and re-derive every parameter that depends on it —
  // mutating `lambda` alone leaves mu/weights/mueff/cc/cs/c1/cmu/damps stale.
  setLambda(lambda: number) {
    const dim = this.dim;
    this.lambda = lambda;
    this.mu = Math.floor(lambda / 2);

    const rawWeights = Array.from({ length: this.mu }, (_, i) => Math.log(this.mu + 0.5) - Math.log(i + 1));
    const sumW = rawWeights.reduce((a, b) => a + b, 0);
    this.weights = rawWeights.map(w => w / sumW);
    this.mueff = 1 / this.weights.reduce((a, b) => a + b**2, 0);

    this.cc = (4 + this.mueff / dim) / (dim + 4 + 2 * this.mueff / dim);
    this.cs = (this.mueff + 2) / (dim + this.mueff + 5);
    this.c1 = 2 / ((dim + 1.3)**2 + this.mueff);
    this.cmu = Math.min(1 - this.c1, 2 * (this.mueff - 2 + 1/this.mueff) / ((dim + 2)**2 + this.mueff));
    this.damps = 1 + 2 * Math.max(0, Math.sqrt((this.mueff - 1) / (dim + 1)) - 1) + this.cs;
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
    this.mean = new Array(this.dim).fill(0);
    for (let i = 0; i < this.mu; i++) {
      const idx = bestIndices[i];
      for (let j = 0; j < this.dim; j++) this.mean[j] += this.weights[i] * samples[idx][j];
    }
    const B = this.lastB;
    const invD = this.lastD.map(d => 1 / (d || 1e-10));
    const diff = this.mean.map((m, i) => (m - oldMean[i]) / (this.sigma || 1e-10));
    const Bt_diff = new Array(this.dim).fill(0);
    for (let i = 0; i < this.dim; i++) for (let j = 0; j < this.dim; j++) Bt_diff[i] += B[j][i] * diff[j];
    const zw = Bt_diff.map((v, i) => v * invD[i]);
    const y_w = diff;
    const cs_sqrt = Math.sqrt(this.cs * (2 - this.cs) * this.mueff);
    for (let i = 0; i < this.dim; i++) this.ps[i] = (1 - this.cs) * this.ps[i] + cs_sqrt * zw[i];
    const psLen = Math.sqrt(this.ps.reduce((a, b) => a + b**2, 0));
    this.sigma *= Math.exp((this.cs / this.damps) * (psLen / this.chiN - 1));
    this.sigma = Math.min(Math.max(this.sigma, 1e-12), 1e6);
    const hsig = psLen / Math.sqrt(1 - (1 - this.cs)**(2 * this.generation)) / this.chiN < 1.4 + 2 / (this.dim + 1) ? 1 : 0;
    const cc_sqrt = Math.sqrt(this.cc * (2 - this.cc) * this.mueff);
    for (let i = 0; i < this.dim; i++) this.pc[i] = (1 - this.cc) * this.pc[i] + hsig * cc_sqrt * y_w[i];
    const hsig_delta = (1 - hsig) * this.cc * (2 - this.cc);
    const decay_coeff = 1 - this.c1 - this.cmu;
    for (let i = 0; i < this.dim; i++) {
      for (let j = 0; j < this.dim; j++) {
        let rankMu = 0;
        for (let k = 0; k < this.mu; k++) {
          const idx = bestIndices[k];
          const yk_i = (samples[idx][i] - oldMean[i]) / (this.sigma || 1e-10);
          const yk_j = (samples[idx][j] - oldMean[j]) / (this.sigma || 1e-10);
          rankMu += this.weights[k] * yk_i * yk_j;
        }
        this.C[i][j] = decay_coeff * this.C[i][j] + this.c1 * (this.pc[i] * this.pc[j] + hsig_delta * this.C[i][j]) + this.cmu * rankMu;
      }
    }
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
    const B: number[][] = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
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
      if (Math.abs(D_mat[p][q]) < Math.abs(diff) * eps) t = D_mat[p][q] / (diff || 1e-20);
      else {
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
// 1. HERO: LIQUID GLASS (Three.js)
// ============================================

function LiquidGlassDistribution() {
  const meshRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const { capabilities } = useDeviceCapabilities();
  const count = useMemo(() => capabilities.tier === "low" ? 600 : 2000, [capabilities.tier]);
  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const reducedMotion = capabilities.prefersReducedMotion;

  useFrame((state) => {
    if (!meshRef.current || !pointsRef.current) return;
    // Under reduced motion the scene holds a fixed pose instead of breathing.
    const t = reducedMotion ? 1.2 : state.clock.getElapsedTime();
    const positionArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const scaleX = 1 + 0.6 * Math.sin(t * 0.4);
    const scaleY = 1 + 0.3 * Math.cos(t * 0.6);
    const scaleZ = 0.4 + 0.2 * Math.sin(t * 0.8);
    meshRef.current.scale.set(scaleX * 5, scaleY * 5, scaleZ * 5);
    meshRef.current.rotation.y = t * 0.15;
    meshRef.current.rotation.z = Math.sin(t * 0.1) * 0.3;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = (2 + Math.sin(t * 0.5 + i * 0.1) * 0.3) * 6;
      const phi = Math.acos(2 * ((i * 1.618) % 1) - 1);
      const theta = 2 * Math.PI * ((i * 2.718) % 1);
      positionArray[i3] = r * Math.sin(phi) * Math.cos(theta) * scaleX;
      positionArray[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * scaleY;
      positionArray[i3 + 2] = r * Math.cos(phi) * scaleZ;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshTransmissionMaterial
          backside
          samples={12}
          thickness={1.5}
          roughness={0.02}
          chromaticAberration={1.2}
          anisotropy={0.8}
          distortion={0.3}
          distortionScale={0.5}
          temporalDistortion={0.1}
          color={COLORS.amber}
          emissive={COLORS.orange}
          emissiveIntensity={0.15}
        />
      </mesh>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color={COLORS.white}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export function HeroCMAES() {
  const { capabilities } = useDeviceCapabilities();
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        frameloop={capabilities.prefersReducedMotion ? "demand" : "always"}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 35]} fov={45} />
        <Environment preset="night" />
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} intensity={2} color={COLORS.amber} />
        <spotLight position={[-15, 20, 15]} angle={0.25} penumbra={1} intensity={3} color={COLORS.orange} />
        <Float
          speed={capabilities.prefersReducedMotion ? 0 : 2.5}
          rotationIntensity={capabilities.prefersReducedMotion ? 0 : 0.4}
          floatIntensity={capabilities.prefersReducedMotion ? 0 : 1}
        >
          <LiquidGlassDistribution />
        </Float>
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020204]/40 to-[#020204]" />
    </div>
  );
}

// ============================================
// 2. LOOP DISCOVERY (UI/UX Optimized)
// ============================================

const STEPS = [
  { id: "sample", title: "Sampling", desc: "Draw a batch from the Gaussian.", icon: <Box className="w-4 h-4" />, color: COLORS.blue },
  { id: "rank", title: "Ranking", desc: "Select the elite survivors.", icon: <Target className="w-4 h-4" />, color: COLORS.emerald },
  { id: "mean", title: "Mean Shift", desc: "Move toward the weighted center.", icon: <Activity className="w-4 h-4" />, color: COLORS.amber },
  { id: "cov", title: "Covariance", desc: "Stretch the belief ellipsoid.", icon: <Cpu className="w-4 h-4" />, color: COLORS.orange }
];

const WALKTHROUGH_SIGMA0 = 2;

export function SelectionWalkthrough() {
  const [stepIdx, setStepIdx] = useState(0);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  // Solver lives in state so "Reset" can replace it with a fresh instance.
  const [solver, setSolver] = useState(() => new ProCMAES(2, [0, 0], WALKTHROUGH_SIGMA0));
  const [data, setData] = useState<SelectionData | null>(null);
  const completedLoops = solver.generation;
  const currentLoop = solver.generation + 1;
  const currentPhase = stepIdx + 1;

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
      // Preview the update now so phases 3 and 4 can show the *new* mean and
      // ellipse; the preview becomes the live solver on "Complete Loop".
      const preview = solver.clone();
      preview.update(samples, fitnesses);
      setData({
        samples: indices.map((idx, rank) => ({ x: samples[idx], f: fitnesses[idx], rank, isElite: rank < solver.mu })),
        oldMean: [...solver.mean],
        oldB: solver.lastB.map(r => [...r]),
        oldD: [...solver.lastD],
        oldSigma: solver.sigma,
        preview,
      });
      setStepIdx(1);
    } else if (stepIdx === 1) setStepIdx(2);
    else if (stepIdx === 2) setStepIdx(3);
    else {
      if (!data) return;
      setSolver(data.preview);
      setStepIdx(0);
      setData(null);
    }
  }, [stepIdx, data, solver, objective]);

  const reset = useCallback(() => {
    setSolver(new ProCMAES(2, [0, 0], WALKTHROUGH_SIGMA0));
    setStepIdx(0);
    setData(null);
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const render = () => {
      const container = d3.select(chartContainerRef.current);
      container.selectAll("svg").remove();
      const w = chartContainerRef.current!.clientWidth;
      const h = 400;
      // Uniform pixels-per-unit on both axes (h / 16) so the rotated ellipse
      // and the contour field keep their true aspect; the x domain widens or
      // narrows with the container instead of stretching the picture.
      const half = 8 * (w / h);
      const x = d3.scaleLinear().domain([-half, half]).range([0, w]);
      const y = d3.scaleLinear().domain([-8, 8]).range([h, 0]);
      const pxPerUnit = h / 16;
      const svg = container.append("svg").attr("width", w).attr("height", h).attr("aria-hidden", "true");
      const defs = svg.append("defs");
      defs.append("marker")
        .attr("id", "cmaes-mean-arrow")
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 9).attr("refY", 5)
        .attr("markerWidth", 6).attr("markerHeight", 6)
        .attr("orient", "auto-start-reverse")
        .append("path").attr("d", "M 0 0 L 10 5 L 0 10 z").attr("fill", "#fff");
      const g = svg.append("g");

      // Contour field over the same domain as the samples. Grid cell (i, j)
      // sits at domain (-8 + j/39*16, -8 + i/39*16); d3.contours returns
      // coordinates in grid units, which we push through the x/y scales so the
      // field is neither flipped nor stretched relative to the samples.
      const N = 40;
      const grid = new Array(N * N);
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) grid[i * N + j] = objective([-8 + (j / (N - 1)) * 16, -8 + (i / (N - 1)) * 16]);
      const toDomain = (v: number) => -8 + ((v - 0.5) / (N - 1)) * 16;
      const projection = d3.geoTransform({
        point(px, py) {
          this.stream.point(x(toDomain(px)), y(toDomain(py)));
        },
      });
      const contours = d3.contours().size([N, N]).thresholds(14);
      g.selectAll("path.contour").data(contours(grid)).enter().append("path")
        .attr("class", "contour")
        .attr("d", d3.geoPath(projection)).attr("fill", "none")
        .attr("stroke", "rgba(255,255,255,0.08)").attr("stroke-width", 1);

      const drawEllipse = (mean: number[], B: number[][], D: number[], sigma: number, stroke: string, dashed: boolean, fill: string) => {
        const angle = Math.atan2(B[1][0], B[0][0]) * 180 / Math.PI;
        g.append("ellipse").attr("cx", x(mean[0])).attr("cy", y(mean[1]))
          .attr("rx", Math.max(1, D[0] * sigma * pxPerUnit)).attr("ry", Math.max(1, D[1] * sigma * pxPerUnit))
          .attr("transform", `rotate(${-angle}, ${x(mean[0])}, ${y(mean[1])})`)
          .attr("fill", fill).attr("stroke", stroke)
          .attr("stroke-width", 2).attr("stroke-dasharray", dashed ? "4,4" : "none");
      };

      if (data) {
        const { preview } = data;
        // Phase 1–2: the old (sampling) ellipse. Phase 3: same shape, moved to
        // the new mean. Phase 4: the adapted ellipse, with the old one ghosted.
        if (stepIdx >= 3) {
          drawEllipse(data.oldMean, data.oldB, data.oldD, data.oldSigma, "rgba(148,163,184,0.5)", true, "none");
          drawEllipse(preview.mean, preview.lastB, preview.lastD, preview.sigma, COLORS.amber, false, "rgba(245, 158, 11, 0.08)");
        } else if (stepIdx === 2) {
          drawEllipse(preview.mean, data.oldB, data.oldD, data.oldSigma, COLORS.slate, true, "rgba(245, 158, 11, 0.05)");
        } else {
          drawEllipse(data.oldMean, data.oldB, data.oldD, data.oldSigma, COLORS.slate, true, "rgba(245, 158, 11, 0.05)");
        }

        g.selectAll("circle.sample").data(data.samples).enter().append("circle")
          .attr("class", "sample")
          .attr("cx", (d: SelectionSample) => x(d.x[0])).attr("cy", (d: SelectionSample) => y(d.x[1]))
          .attr("r", (d: SelectionSample) => d.isElite ? 6 : 3.5).attr("fill", (d: SelectionSample) => stepIdx === 0 ? COLORS.blue : (d.isElite ? COLORS.emerald : COLORS.red))
          .style("opacity", (d: SelectionSample) => stepIdx === 1 ? 1 : (stepIdx >= 2 ? (d.isElite ? 1 : 0.1) : 0.6))
          .style("filter", (d: SelectionSample) => d.isElite ? `drop-shadow(0 0 10px ${COLORS.emerald})` : "none");

        if (stepIdx >= 2) {
          g.append("line")
            .attr("x1", x(data.oldMean[0])).attr("y1", y(data.oldMean[1]))
            .attr("x2", x(preview.mean[0])).attr("y2", y(preview.mean[1]))
            .attr("stroke", "#fff").attr("stroke-width", 2)
            .attr("marker-end", "url(#cmaes-mean-arrow)");
          g.append("circle").attr("cx", x(data.oldMean[0])).attr("cy", y(data.oldMean[1])).attr("r", 4).attr("fill", "rgba(255,255,255,0.4)");
          g.append("circle").attr("cx", x(preview.mean[0])).attr("cy", y(preview.mean[1])).attr("r", 6).attr("fill", COLORS.amber).style("filter", `drop-shadow(0 0 12px ${COLORS.amber})`);
        } else {
          g.append("circle").attr("cx", x(data.oldMean[0])).attr("cy", y(data.oldMean[1])).attr("r", 5).attr("fill", COLORS.amber);
        }
      } else {
        drawEllipse(solver.mean, solver.lastB, solver.lastD, solver.sigma, "rgba(148,163,184,0.35)", true, "none");
        g.append("circle").attr("cx", x(solver.mean[0])).attr("cy", y(solver.mean[1])).attr("r", 8).attr("fill", COLORS.amber).style("filter", `drop-shadow(0 0 15px ${COLORS.amber})`);
      }
    };
    render();
    window.addEventListener("resize", render);
    return () => window.removeEventListener("resize", render);
  }, [data, stepIdx, solver, objective]);

  const meanText = data && stepIdx >= 2 ? data.preview.mean : solver.mean;
  const sigmaText = data && stepIdx >= 3 ? data.preview.sigma : (data ? data.oldSigma : solver.sigma);
  const chartLabel = data
    ? `Phase ${currentPhase} of loop ${currentLoop}: ${data.samples.length} samples, ${data.samples.filter(s => s.isElite).length} elite. Mean (${meanText[0].toFixed(2)}, ${meanText[1].toFixed(2)}), step-size ${sigmaText.toFixed(3)}.`
    : `Loop ${currentLoop} ready. Mean (${solver.mean[0].toFixed(2)}, ${solver.mean[1].toFixed(2)}), step-size ${solver.sigma.toFixed(3)}.`;

  return (
    <div className="rq-viz-container !p-0">
      <div className="rq-viz-header flex-col md:flex-row gap-6 p-4 md:p-8 border-b-0">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-inner">
            <Zap className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white tracking-tighter">Loop Discovery</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">Step-by-Step Adaptation</p>
            <div className="mt-2 inline-flex items-center gap-3 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-amber-300">
              <span>Loop {currentLoop}</span>
              <span className="text-amber-500/70">|</span>
              <span>Completed {completedLoops}</span>
              <span className="text-amber-500/70">|</span>
              <span>Phase {currentPhase}/4</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 md:ml-auto w-full md:w-auto">
          <button
            type="button"
            onClick={reset}
            disabled={completedLoops === 0 && stepIdx === 0}
            className="rq-btn-secondary min-h-11 !px-4 md:!px-6 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Reset
          </button>
          <button
            type="button"
            onClick={nextStep}
            className="rq-btn-action min-h-11 !py-3.5 !px-4 md:!px-10 flex items-center gap-3 group flex-1 md:flex-none justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020204]"
          >
            {stepIdx === 3 ? `Complete Loop ${currentLoop}` : "Next Phase"}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-white/[0.02] border-y border-white/5">
        {STEPS.map((s, i) => (
          <div key={s.id} className={cn("p-6 transition-all duration-700 flex flex-col gap-3", stepIdx === i ? "bg-white/5" : "opacity-20 grayscale")} aria-current={stepIdx === i ? "step" : undefined}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/5 text-white" style={{ color: s.color }}>{s.icon}</div>
              <div className="text-[11px] font-black uppercase tracking-widest">{s.title}</div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-0">{s.desc}</p>
          </div>
        ))}
      </div>
      <div ref={chartContainerRef} role="img" aria-label={chartLabel} className="relative w-full h-[400px] bg-black/20 overflow-hidden" />
      <div className="px-4 md:px-8 py-3 border-t border-white/5 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-slate-400" aria-live="polite">
        <span>mean = ({meanText[0].toFixed(2)}, {meanText[1].toFixed(2)})</span>
        <span>σ = {sigmaText.toFixed(3)}</span>
        {data && <span>elite = {data.samples.filter(s => s.isElite).length} / {data.samples.length}</span>}
      </div>
    </div>
  );
}

// ============================================
// 3. COMPARISON: 3D LANDSCAPE
// ============================================

/**
 * Compresses raw objective values (which reach into the thousands on this
 * valley) into a display height that fits a 10-unit plane. The optimizer
 * still sees the raw objective; only the rendering is compressed.
 */
function displayHeight(f: number) {
  return Math.log1p(Math.max(0, f)) * 0.45;
}

function Landscape({ objective }: { objective: (x: number, y: number) => number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const size = 10;
  const segments = 100;
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setZ(i, displayHeight(objective(x, y)));
    }
    geo.computeVertexNormals();
    return geo;
  }, [objective]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh ref={meshRef} geometry={geometry} receiveShadow>
      <meshStandardMaterial
        color="#111"
        wireframe={false}
        flatShading={false}
        roughness={0.8}
        metalness={0.2}
      />
      <gridHelper args={[size, 20, COLORS.slate, "rgba(255,255,255,0.05)"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.01]} />
    </mesh>
  );
}

function PathLine({ points, color, objective }: { points: number[][], color: string, objective: (x: number, y: number) => number }) {
  // Points are expressed in the landscape's local frame (x, y, height) and the
  // parent group applies the same -90° X rotation as the terrain, so the path
  // lies on the surface instead of in a perpendicular plane.
  const linePoints = useMemo(
    () =>
      points
        .filter((p) => p.length >= 2 && Number.isFinite(p[0]) && Number.isFinite(p[1]))
        .map((p) => new THREE.Vector3(p[0], p[1], 0.05 + displayHeight(objective(p[0], p[1])))),
    [points, objective]
  );

  // drei/Line requires at least two points; otherwise it can throw in LineGeometry.setPositions.
  if (linePoints.length < 2) {
    return null;
  }

  return <Line points={linePoints} color={color} lineWidth={3} transparent opacity={0.9} />;
}

// Gradient-descent step size for the rotated valley below. The stiff
// direction has curvature 200 (Hessian eigenvalue), so the per-step factor is
// 1 - 200*lr = -0.9: the iterate jumps across the valley floor on every step
// while it crawls along the soft direction (factor 1 - 2*lr = 0.981).
const GD_LR = 0.0095;

export function ComparisonViz() {
  const [active, setActive] = useState<"cma" | "gd">("cma");
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState<number[][]>([]);
  // `true` while mounted: async loops check it after every await so they stop
  // touching state once the component has gone away.
  const aliveRef = useRef(true);
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);
  const runId = useRef(0);
  const coarse = useCoarsePointer();
  const { capabilities } = useDeviceCapabilities();
  const orbitEnabled = !coarse;

  const objective = useCallback((x: number, y: number) => {
    const x_rot = x * Math.cos(0.5) - y * Math.sin(0.5);
    const y_rot = x * Math.sin(0.5) + y * Math.cos(0.5);
    return x_rot**2 + (y_rot * 10)**2;
  }, []);

  const run = useCallback(async () => {
    const id = ++runId.current;
    const stillCurrent = () => aliveRef.current && runId.current === id;
    setIsRunning(true); setHistory([]);
    const start = [4, 4];
    if (active === "cma") {
      const solver = new ProCMAES(2, start, 0.5);
      const h = [[...start]];
      for (let i = 0; i < 40; i++) {
        const samples = solver.sample();
        solver.update(samples, samples.map(s => objective(s[0], s[1])));
        h.push([...solver.mean]); setHistory([...h]);
        if (i > 5 && solver.sigma < 1e-4) break;
        await new Promise(r => setTimeout(r, 50));
        if (!stillCurrent()) return;
      }
    } else {
      const cur = [...start];
      const h = [[...cur]];
      for (let i = 0; i < 100; i++) {
        const eps = 1e-5;
        const gx = (objective(cur[0] + eps, cur[1]) - objective(cur[0] - eps, cur[1])) / (2 * eps);
        const gy = (objective(cur[0], cur[1] + eps) - objective(cur[0], cur[1] - eps)) / (2 * eps);
        cur[0] -= GD_LR * gx; cur[1] -= GD_LR * gy;
        h.push([...cur]); setHistory([...h]);
        await new Promise(r => setTimeout(r, 20));
        if (!stillCurrent()) return;
      }
    }
    setIsRunning(false);
  }, [active, objective]);

  const last = history[history.length - 1];
  const resultText = last
    ? `${active === "cma" ? "CMA-ES" : "Gradient descent"}: ${history.length - 1} steps, final f = ${formatFitness(objective(last[0], last[1]))} at (${last[0].toFixed(2)}, ${last[1].toFixed(2)}).`
    : "No run yet. Press Execute Simulation to trace a path.";

  return (
    <div className="rq-viz-container !p-0">
      <div className="rq-viz-header border-b-0 p-4 md:p-8">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shadow-inner">
            <Activity className="w-7 h-7 text-orange-400" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white tracking-tighter">The Geometry War</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">CMA-ES vs Traditional Gradient</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 bg-black/40 p-1.5 rounded-2xl border border-white/10 md:ml-auto" role="group" aria-label="Optimizer">
          <button
            type="button"
            onClick={() => setActive("cma")}
            aria-pressed={active === "cma"}
            className={cn("min-h-10 px-4 md:px-6 py-2.5 rounded-full text-[11px] font-black uppercase transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
            active === "cma" ? "bg-amber-500 text-black shadow-xl scale-105" : "text-slate-500 hover:text-white")}
          >CMA-ES</button>
          <button
            type="button"
            onClick={() => setActive("gd")}
            aria-pressed={active === "gd"}
            className={cn("min-h-10 px-4 md:px-6 py-2.5 rounded-full text-[11px] font-black uppercase transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
            active === "gd" ? "bg-blue-500 text-black shadow-xl scale-105" : "text-slate-500 hover:text-white")}
          >Gradient</button>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row">
        <div className="lg:w-1/3 p-6 md:p-10 border-r border-white/5 bg-white/[0.01]">
          <p className="text-base text-slate-300 leading-relaxed italic mb-10">
            In a <strong>narrow, rotated valley</strong>, standard Gradient Descent bounces from wall to wall: its steps follow the steep sides, not the gentle floor, so it zig-zags across the valley while creeping along it.
            <span className="text-amber-400 font-bold block mt-4 px-4 py-3 bg-amber-500/5 border border-amber-500/10 rounded-xl not-italic">CMA-ES learns the valley&apos;s very shape, stretching its distribution to glide straight to the global minimum.</span>
          </p>
          <button
            type="button"
            onClick={run}
            disabled={isRunning}
            className="w-full rq-btn-action min-h-11 !py-4 flex items-center justify-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020204]"
          >
            {isRunning ? "Running Analysis..." : "Execute Simulation"}
            <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" aria-hidden="true" />
          </button>
          <p className="mt-6 text-xs font-mono text-slate-400 leading-relaxed mb-0" aria-live="polite">{resultText}</p>
        </div>
        <div className="lg:w-2/3 h-[380px] sm:h-[500px] relative" role="img" aria-label={`3D landscape of the rotated valley with the ${active === "cma" ? "CMA-ES" : "gradient descent"} path. ${resultText}`}>
          <Canvas
            dpr={[1, 2]}
            camera={{ position: [8, 8, 8], fov: 40 }}
            // Vertical swipes keep scrolling the page; only horizontal drags orbit.
            style={{ touchAction: "pan-y" }}
            onCreated={({ gl }) => { gl.domElement.style.touchAction = "pan-y"; }}
            frameloop={capabilities.prefersReducedMotion && !orbitEnabled ? "demand" : "always"}
          >
            <color attach="background" args={["#020204"]} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <PresentationControls enabled={orbitEnabled} cursor={orbitEnabled} speed={1.5} global zoom={0.8} polar={[-0.1, Math.PI / 4]}>
              <group position={[0, -1, 0]}>
                {/* Terrain and path share one rotated frame: local z (height) becomes world up. */}
                <group rotation={[-Math.PI / 2, 0, 0]}>
                  <Landscape objective={objective} />
                  <PathLine points={history} color={active === "cma" ? COLORS.amber : COLORS.blue} objective={objective} />
                </group>
              </group>
            </PresentationControls>
            <Environment preset="night" />
            <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
          </Canvas>
          <div className="absolute bottom-6 right-6 p-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl text-[10px] font-black uppercase text-slate-400 tracking-widest pointer-events-none">
            {orbitEnabled ? "3D view: drag to orbit" : "3D view: fixed angle on touch"}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// BENCHMARKS
// ============================================

const BENCHMARKS = {
  Rastrigin: (x: number[]) => 10 * x.length + x.reduce((a, b) => a + b * b - 10 * Math.cos(2 * Math.PI * b), 0),
  Rosenbrock: (x: number[]) => x.slice(0, -1).reduce((a, _, i) => a + 100 * (x[i + 1] - x[i] ** 2) ** 2 + (1 - x[i]) ** 2, 0),
  Sphere: (x: number[]) => x.reduce((a, b) => a + b * b, 0),
  Ackley: (x: number[]) => {
    const n = x.length;
    const sum1 = x.reduce((a, b) => a + b * b, 0);
    const sum2 = x.reduce((a, b) => a + Math.cos(2 * Math.PI * b), 0);
    return -20 * Math.exp(-0.2 * Math.sqrt(sum1 / n)) - Math.exp(sum2 / n) + 20 + Math.E;
  },
};

// ============================================
// 4. TELEMETRY DASHBOARD
// ============================================

const RANGE_CLASS =
  "w-full h-11 cursor-pointer appearance-none bg-transparent bg-[linear-gradient(rgba(255,255,255,0.12),rgba(255,255,255,0.12))] bg-[length:100%_6px] bg-center bg-no-repeat rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020204]";

export function BenchmarkRunner() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<keyof typeof BENCHMARKS>("Rastrigin");
  const [dim, setDim] = useState(8);
  const [results, setResults] = useState<BenchmarkPoint[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentC, setCurrentC] = useState<number[][]>([]);
  // `true` while mounted: async loops check it after every await so they stop
  // touching state once the component has gone away.
  const aliveRef = useRef(true);
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);
  const runId = useRef(0);

  const run = useCallback(async () => {
    const id = ++runId.current;
    const stillCurrent = () => aliveRef.current && runId.current === id;
    setIsRunning(true);
    const solver = new ProCMAES(dim, new Array(dim).fill(3), 1.0);
    const h: BenchmarkPoint[] = [];
    let runningBest = Infinity;
    for (let i = 0; i < 100; i++) {
      const samples = solver.sample();
      const fitnesses = samples.map(BENCHMARKS[selected]);
      solver.update(samples, fitnesses);
      const genBest = Math.min(...fitnesses);
      runningBest = Math.min(runningBest, genBest);
      h.push({ gen: i, best: runningBest, genBest, sigma: solver.sigma });
      setResults([...h]);
      if (i % 2 === 0) setCurrentC(solver.C.slice(0, 3).map(r => r.slice(0, 3)));
      if (genBest < 1e-10) break;
      await new Promise(r => setTimeout(r, 10));
      if (!stillCurrent()) return;
    }
    setIsRunning(false);
  }, [dim, selected]);

  useEffect(() => {
    if (!chartRef.current || results.length === 0) return;
    const render = () => {
      const container = d3.select(chartRef.current); container.selectAll("svg").remove();
      const w = chartRef.current!.clientWidth; const h = 300;
      const svg = container.append("svg").attr("width", w).attr("height", h).attr("aria-hidden", "true");
      const margin = { left: 70, right: 24, top: 24, bottom: 54 };
      const x = d3.scaleLinear().domain([0, Math.max(1, results.length - 1)]).range([margin.left, w - margin.right]);
      const values = results.flatMap(d => [d.best, d.sigma]).filter(v => Number.isFinite(v) && v > 0);
      const lo = Math.max(1e-10, d3.min(values) ?? 1e-10);
      const hi = Math.max(lo * 10, d3.max(values) ?? 100);
      // Domain follows the data (Rosenbrock starts in the tens of thousands)
      // and clamps so nothing is drawn above the chart.
      const y = d3.scaleLog().domain([lo, hi]).range([h - margin.bottom, margin.top]).nice().clamp(true);
      const styleAxis = (sel: d3.Selection<SVGGElement, unknown, null, undefined>) => {
        sel.attr("color", AXIS_COLOR);
        sel.selectAll("text").attr("fill", AXIS_TEXT).attr("font-size", 11);
      };
      svg.append("g").attr("transform", `translate(0, ${h - margin.bottom})`).call(d3.axisBottom(x).ticks(5)).call(styleAxis);
      svg.append("g").attr("transform", `translate(${margin.left}, 0)`).call(d3.axisLeft(y).ticks(5, "~e")).call(styleAxis);
      svg.append("text").attr("x", (margin.left + w - margin.right) / 2).attr("y", h - 14).attr("text-anchor", "middle")
        .attr("fill", AXIS_TEXT).attr("font-size", 11).attr("font-weight", 700).attr("letter-spacing", "0.15em").text("GENERATION");
      svg.append("text").attr("transform", `translate(16, ${(margin.top + h - margin.bottom) / 2}) rotate(-90)`).attr("text-anchor", "middle")
        .attr("fill", AXIS_TEXT).attr("font-size", 11).attr("font-weight", 700).attr("letter-spacing", "0.15em").text("VALUE (LOG)");
      svg.append("path").datum(results).attr("fill", "none").attr("stroke", COLORS.amber).attr("stroke-width", 3).attr("d", d3.line<BenchmarkPoint>().x(d => x(d.gen)).y(d => y(Math.max(1e-10, d.best))));
      svg.append("path").datum(results).attr("fill", "none").attr("stroke", COLORS.purple).attr("stroke-width", 1.5).attr("stroke-dasharray", "4,2").attr("d", d3.line<BenchmarkPoint>().x(d => x(d.gen)).y(d => y(Math.max(1e-10, d.sigma))));
    };
    render(); window.addEventListener("resize", render);
    return () => window.removeEventListener("resize", render);
  }, [results]);

  const lastPoint = results[results.length - 1];
  const resultText = lastPoint
    ? `${selected} in ${dim}D: best fitness ${formatFitness(lastPoint.best)} after ${results.length} generations, step-size σ = ${formatFitness(lastPoint.sigma)}.`
    : "No run yet. Pick a benchmark and press Execute Optimization.";

  return (
    <div className="rq-viz-container !p-0">
      <div className="rq-viz-header flex-col md:flex-row p-4 md:p-10 gap-8 border-b-0">
        <div className="flex items-center gap-6">
          <div className="w-16 h-14 rounded-2xl bg-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.4)] flex items-center justify-center">
            <Cpu className="w-9 h-9 text-black" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-white tracking-tighter">Live Telemetry</h3>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-black">High-Performance Black-Box Solver</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 bg-white/5 p-2.5 rounded-2xl border border-white/10 w-full md:w-auto md:ml-auto">
          <label htmlFor="cmaes-benchmark-select" className="sr-only">Benchmark function</label>
          <select
            id="cmaes-benchmark-select"
            value={selected}
            onChange={e => setSelected(e.target.value as keyof typeof BENCHMARKS)}
            className="min-h-11 bg-transparent border-none text-[12px] font-black uppercase text-white px-3 md:px-6 min-w-[9rem] rounded-xl cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            {Object.keys(BENCHMARKS).map(b => <option key={b} value={b} className="bg-[#0b0b10] text-white">{b}</option>)}
          </select>
          <button
            type="button"
            onClick={run}
            disabled={isRunning}
            className="rq-btn-action min-h-11 !shadow-none !py-3.5 !px-4 md:!px-8 w-full sm:w-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020204]"
          >
            {isRunning ? "Optimizing..." : "Execute Optimization"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-white/5 border-t border-white/10">
        <div className="lg:col-span-4 p-6 md:p-10 flex flex-col gap-12 bg-white/[0.01]">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-black uppercase text-slate-500 tracking-widest">
              <label htmlFor="cmaes-dim-range">Hypercube Dimension</label>
              <span className="text-amber-400 font-mono text-base">{dim}D</span>
            </div>
            <input
              id="cmaes-dim-range"
              type="range"
              min="2"
              max="20"
              value={dim}
              onChange={e => setDim(parseInt(e.target.value))}
              aria-label="Hypercube dimension"
              aria-valuetext={`${dim} dimensions`}
              disabled={isRunning}
              className={cn(RANGE_CLASS, "accent-amber-500 focus-visible:ring-amber-400")}
            />
          </div>

          <div className="space-y-6">
            <div className="text-xs font-black uppercase text-slate-500 tracking-widest">Internal State Snapshot</div>
            <p className="text-xs text-slate-400 mb-0 leading-relaxed">Top-left 3×3 block of the covariance matrix <span className="font-mono">C</span>.</p>
            <div className="grid grid-cols-3 gap-3" role="img" aria-label={currentC.length ? `Covariance block: ${currentC.map(r => r.map(v => v.toFixed(2)).join(" ")).join("; ")}` : "Covariance block not yet computed"}>
              {(currentC.length > 0 ? currentC : Array(3).fill(new Array(3).fill(0))).map((row: number[], i: number) =>
                row.map((val: number, j: number) => (
                  <div key={`${i}-${j}`} className={cn("h-12 flex items-center justify-center font-mono text-xs rounded-xl border transition-all duration-500 shadow-sm",
                    Math.abs(val) > 0.1 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-white/5 text-slate-400 border-transparent")}>
                    {val.toFixed(2)}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 p-6 md:p-10 bg-black/40 flex flex-col gap-10">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 rounded-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)]" />
              <div className="text-xs font-black uppercase text-white tracking-[0.2em]">Global Best Fitness</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 rounded-full bg-purple-500 opacity-50 border-2 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]" />
              <div className="text-xs font-black uppercase text-slate-500 tracking-[0.2em]">Step-size (σ)</div>
            </div>
          </div>
          <div ref={chartRef} role="img" aria-label={resultText} className="w-full h-[300px] opacity-80" />
          <p className="text-xs font-mono text-slate-400 mb-0" aria-live="polite">{resultText}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 5. NOISE ROBUSTNESS VIZ
// ============================================

export function NoiseRobustnessViz() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [noiseLevel, setNoiseLevel] = useState(0.2);
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState<NoisePoint[]>([]);
  // `true` while mounted: async loops check it after every await so they stop
  // touching state once the component has gone away.
  const aliveRef = useRef(true);
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);
  const runId = useRef(0);

  const trueObjective = useCallback((x: number[]) => x.reduce((a, b) => a + b*b, 0), []);
  const objective = useCallback((x: number[]) => {
    return trueObjective(x) + (Math.random() - 0.5) * noiseLevel * 10;
  }, [noiseLevel, trueObjective]);

  const run = useCallback(async () => {
    const id = ++runId.current;
    const stillCurrent = () => aliveRef.current && runId.current === id;
    setIsRunning(true);
    setHistory([]);
    const solver = new ProCMAES(2, [3, 3], 1.0);
    const h: NoisePoint[] = [];
    for (let i = 0; i < 50; i++) {
      const samples = solver.sample();
      const fitnesses = samples.map(objective);
      solver.update(samples, fitnesses);
      const trueVal = trueObjective(solver.mean);
      h.push({ gen: i, val: Math.min(...fitnesses), trueVal });
      setHistory([...h]);
      // Convergence is judged on the noise-free objective of the mean, never
      // on a lucky noisy draw.
      if (trueVal < 1e-3) break;
      await new Promise(r => setTimeout(r, 30));
      if (!stillCurrent()) return;
    }
    setIsRunning(false);
  }, [objective, trueObjective]);

  useEffect(() => {
    if (!chartRef.current || history.length === 0) return;
    const render = () => {
      const container = d3.select(chartRef.current);
      container.selectAll("svg").remove();
      const w = chartRef.current!.clientWidth;
      const h = 260;
      const margin = { left: 56, right: 20, top: 20, bottom: 48 };
      const svg = container.append("svg").attr("width", w).attr("height", h).attr("aria-hidden", "true");
      const x = d3.scaleLinear().domain([0, 50]).range([margin.left, w - margin.right]);
      const yMin = Math.min(0, d3.min(history, d => d.val) ?? 0);
      const yMax = Math.max(10, d3.max(history, d => Math.max(d.val, d.trueVal)) ?? 10);
      const y = d3.scaleLinear().domain([yMin, yMax]).range([h - margin.bottom, margin.top]).nice();
      const styleAxis = (sel: d3.Selection<SVGGElement, unknown, null, undefined>) => {
        sel.attr("color", AXIS_COLOR);
        sel.selectAll("text").attr("fill", AXIS_TEXT).attr("font-size", 11);
      };

      svg.append("g").attr("transform", `translate(0, ${h - margin.bottom})`).call(d3.axisBottom(x).ticks(5)).call(styleAxis);
      svg.append("g").attr("transform", `translate(${margin.left}, 0)`).call(d3.axisLeft(y).ticks(5, "~s")).call(styleAxis);
      svg.append("text").attr("x", (margin.left + w - margin.right) / 2).attr("y", h - 10).attr("text-anchor", "middle")
        .attr("fill", AXIS_TEXT).attr("font-size", 11).attr("font-weight", 700).attr("letter-spacing", "0.15em").text("GENERATION");
      svg.append("text").attr("transform", `translate(14, ${(margin.top + h - margin.bottom) / 2}) rotate(-90)`).attr("text-anchor", "middle")
        .attr("fill", AXIS_TEXT).attr("font-size", 11).attr("font-weight", 700).attr("letter-spacing", "0.15em").text("OBJECTIVE");

      svg.append("line").attr("x1", x(0)).attr("x2", x(50)).attr("y1", y(0)).attr("y2", y(0)).attr("stroke", "rgba(255,255,255,0.15)").attr("stroke-dasharray", "2,3");
      svg.append("path").datum(history).attr("fill", "none").attr("stroke", "rgba(148,163,184,0.7)").attr("stroke-width", 1.5).attr("stroke-dasharray", "3,3").attr("d", d3.line<NoisePoint>().x(d => x(d.gen)).y(d => y(d.val)));
      svg.append("path").datum(history).attr("fill", "none").attr("stroke", COLORS.emerald).attr("stroke-width", 2.5).attr("d", d3.line<NoisePoint>().x(d => x(d.gen)).y(d => y(d.trueVal)));
    };
    render();
    window.addEventListener("resize", render);
    return () => window.removeEventListener("resize", render);
  }, [history]);

  const lastPoint = history[history.length - 1];
  const resultText = lastPoint
    ? `At ${Math.round(noiseLevel * 100)}% jitter the true objective of the mean reached ${formatFitness(lastPoint.trueVal)} after ${history.length} generations (noisy sample minimum ${formatFitness(lastPoint.val)}).`
    : "No run yet. Set the jitter and press Play Simulation.";

  return (
    <div className="rq-viz-container !p-8 bg-emerald-500/5 border-emerald-500/20">
      <div className="flex flex-col md:flex-row gap-10 items-center">
        <div className="md:w-1/3 w-full">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6">
            <Zap className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-xl font-black text-white mb-2 tracking-tight">The Noise Filter</h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            Real-world simulators are &quot;jittery.&quot; Because CMA-ES uses a population, it naturally averages out the noise, finding the true signal of the landscape.
          </p>
          <div className="space-y-4">
            <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest">
              <label htmlFor="cmaes-noise-range">Feedback Jitter</label>
              <span className="text-emerald-400">{Math.round(noiseLevel * 100)}%</span>
            </div>
            <input
              id="cmaes-noise-range"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={noiseLevel}
              onChange={e => setNoiseLevel(parseFloat(e.target.value))}
              aria-label="Feedback jitter"
              aria-valuetext={`${Math.round(noiseLevel * 100)} percent jitter`}
              disabled={isRunning}
              className={cn(RANGE_CLASS, "accent-emerald-500 focus-visible:ring-emerald-400")}
            />
            <button
              type="button"
              onClick={run}
              disabled={isRunning}
              className="w-full rq-btn-action min-h-11 !bg-emerald-500 !text-black flex items-center justify-center gap-2 !shadow-none !py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020204]"
            >
              <Play className="w-4 h-4 fill-current" aria-hidden="true" />
              {isRunning ? "Running..." : "Play Simulation"}
            </button>
          </div>
        </div>
        <div className="flex-1 w-full min-w-0">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-3 text-[10px] font-black uppercase tracking-widest">
            <span className="flex items-center gap-2 text-emerald-300"><span className="inline-block w-5 h-0.5 bg-emerald-400" aria-hidden="true" /> True f(mean)</span>
            <span className="flex items-center gap-2 text-slate-400"><span className="inline-block w-5 border-t border-dashed border-slate-400" aria-hidden="true" /> Noisy sample min</span>
          </div>
          <div ref={chartRef} role="img" aria-label={resultText} className="min-h-[260px] bg-black/20 rounded-2xl border border-white/5" />
          <p className="mt-3 text-xs font-mono text-slate-400 mb-0" aria-live="polite">{resultText}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 6. RESTART / MULTIMODALITY VIZ
// ============================================

export function RestartViz() {
  const [isRunning, setIsRunning] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [popSize, setPopSize] = useState(6);
  const [restarts, setRestarts] = useState(0);
  // Running best across all restarts — monotone, so the "found" badge never flips back.
  const [bestVal, setBestVal] = useState<number | null>(null);
  // `true` while mounted: async loops check it after every await so they stop
  // touching state once the component has gone away.
  const aliveRef = useRef(true);
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);
  const runId = useRef(0);

  const objective = useCallback((x: number[]) => {
    return 10 + x.reduce((a, b) => a + b*b - 10 * Math.cos(2 * Math.PI * b), 0);
  }, []);

  const run = useCallback(async () => {
    const id = ++runId.current;
    const stillCurrent = () => aliveRef.current && runId.current === id;
    setIsRunning(true);
    let currentPopSize = 6;
    setPopSize(currentPopSize);
    setGeneration(0);
    setRestarts(0);
    setBestVal(null);

    // Track the live best value locally — reading the `bestVal` state here
    // would see the stale value captured when the callback was created.
    let liveBest = Infinity;

    for (let restart = 0; restart < 3; restart++) {
      const solver = new ProCMAES(2, [4, 4], 1.0);
      solver.setLambda(currentPopSize);

      for (let i = 0; i < 30; i++) {
        const samples = solver.sample();
        const fitnesses = samples.map(objective);
        solver.update(samples, fitnesses);
        const best = Math.min(...fitnesses);
        liveBest = Math.min(liveBest, best);
        setBestVal(liveBest);
        setGeneration(g => g + 1);
        if (best < 1e-6) break;
        await new Promise(r => setTimeout(r, 40));
        if (!stillCurrent()) return;
      }

      if (liveBest < 1e-6) break;
      currentPopSize *= 2;
      setPopSize(currentPopSize);
      setRestarts(restart + 1);
    }
    setIsRunning(false);
  }, [objective]);

  const found = bestVal !== null && bestVal < 1e-3;
  const progressPct = bestVal === null ? 0 : Math.max(0, Math.min(100, (1 - bestVal / 10) * 100));

  return (
    <div className="rq-viz-container !p-8 bg-purple-500/5 border-purple-500/20">
      <div className="flex flex-col md:flex-row gap-10 items-center">
        <div className="md:w-1/3 w-full">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6">
            <RotateCcw className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-xl font-black text-white mb-2 tracking-tight">Escaping Local Traps</h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            Complex landscapes have many &quot;traps&quot; (local minima). CMA-ES handles this with <strong>IPOP</strong>: if it gets stuck, it restarts with a larger, more exploratory population.
          </p>
          <div className="p-5 rounded-xl bg-black/40 border border-white/5 space-y-4 mb-6">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs md:text-sm font-black uppercase tracking-[0.18em]">Current Population</span>
              <span className="text-base md:text-xl font-mono font-bold text-purple-300">λ = {popSize}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs md:text-sm font-black uppercase tracking-[0.18em]">Best So Far</span>
              <span className="text-base md:text-xl font-mono font-bold text-white">{bestVal === null ? "—" : bestVal.toFixed(4)}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={run}
            disabled={isRunning}
            className="w-full rq-btn-action min-h-11 !bg-purple-500 !text-white flex items-center justify-center gap-2 !shadow-none !py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020204]"
          >
            <Play className="w-4 h-4 fill-current" aria-hidden="true" />
            {isRunning ? "Optimizing..." : "Execute IPOP-CMA-ES"}
          </button>
        </div>
        <div className="flex-1 w-full grid grid-cols-2 gap-4 h-full">
          <div className="bg-black/40 rounded-2xl border border-white/5 p-6 flex flex-col items-center justify-center relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="text-4xl font-black text-white mb-2 tracking-tighter">{generation}</div>
             <div className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em]">Generations</div>
          </div>
          <div className="bg-black/40 rounded-2xl border border-white/5 p-6 flex flex-col items-center justify-center relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="text-4xl font-black text-white mb-2 tracking-tighter">{popSize}</div>
             <div className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em]">Population size</div>
          </div>
          <div className="col-span-2 bg-black/40 rounded-2xl border border-white/5 p-6 relative overflow-hidden">
            <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
              <div className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em]">Convergence Path · {restarts} restart{restarts === 1 ? "" : "s"}</div>
              <div className={cn("px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest", found ? "bg-emerald-500/20 text-emerald-400" : "bg-purple-500/20 text-purple-400")} aria-live="polite">
                {found ? "Global Minimum Found" : (bestVal === null ? "Idle" : "Searching...")}
              </div>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progressPct)} aria-label="Progress toward the global minimum">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-amber-500"
                initial={{ width: "0%" }}
                animate={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
