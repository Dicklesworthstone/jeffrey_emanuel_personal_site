"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Float, 
  MeshTransmissionMaterial,
  Environment,
  Text,
  ContactShadows,
  PresentationControls,
  Html,
  Line
} from "@react-three/drei";
import * as d3 from "d3";
import { motion, AnimatePresence } from "framer-motion";
import { useDeviceCapabilities } from "@/hooks/use-mobile-optimizations";
import { cn } from "@/lib/utils";
import { Play, RotateCcw, ChevronRight, Activity, Cpu, Box, Zap, Target, Sliders } from "lucide-react";

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
}

interface BenchmarkPoint {
  gen: number;
  best: number;
  sigma: number;
}

interface NoisePoint {
  gen: number;
  val: number;
}

// ============================================
// 0. ENGINE (Stability & Precision)
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

  useFrame((state) => {
    if (!meshRef.current || !pointsRef.current) return;
    const t = state.clock.getElapsedTime();
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
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 35]} fov={45} />
        <Environment preset="night" />
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} intensity={2} color={COLORS.amber} />
        <spotLight position={[-15, 20, 15]} angle={0.25} penumbra={1} intensity={3} color={COLORS.orange} />
        <Float speed={2.5} rotationIntensity={0.4} floatIntensity={1}>
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

export function SelectionWalkthrough() {
  const [stepIdx, setStepIdx] = useState(0);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const solver = useMemo(() => new ProCMAES(2, [0, 0], 2), []);
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
      setData({
        samples: indices.map((idx, rank) => ({ x: samples[idx], f: fitnesses[idx], rank, isElite: rank < solver.mu })),
        oldMean: [...solver.mean],
        oldB: solver.lastB.map(r => [...r]),
        oldD: [...solver.lastD]
      });
      setStepIdx(1);
    } else if (stepIdx === 1) setStepIdx(2);
    else if (stepIdx === 2) setStepIdx(3);
    else {
      if (!data) return;
      solver.update(data.samples.map((s) => s.x), data.samples.map((s) => s.f));
      setStepIdx(0);
      setData(null);
    }
  }, [stepIdx, data, solver, objective]);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const render = () => {
      const container = d3.select(chartContainerRef.current);
      container.selectAll("svg").remove();
      const w = chartContainerRef.current!.clientWidth;
      const h = 400;
      const svg = container.append("svg").attr("width", w).attr("height", h);
      const g = svg.append("g");
      const x = d3.scaleLinear().domain([-8, 8]).range([0, w]);
      const y = d3.scaleLinear().domain([-8, 8]).range([h, 0]);
      const grid = new Array(40 * 40);
      for (let i = 0; i < 40; i++) for (let j = 0; j < 40; j++) grid[i * 40 + j] = objective([-8 + (j/39)*16, -8 + (i/39)*16]);
      const contours = d3.contours().size([40, 40]);
      g.selectAll("path.contour").data(contours(grid)).enter().append("path")
        .attr("d", d3.geoPath(d3.geoIdentity().scale(w / 40))).attr("fill", "none")
        .attr("stroke", "rgba(255,255,255,0.04)").attr("stroke-width", 1);
      if (data) {
        const [B, D] = stepIdx >= 3 ? solver.eigen() : [data.oldB, data.oldD];
        const currentMean = stepIdx >= 2 ? solver.mean : data.oldMean;
        const angle = Math.atan2(B[1][0], B[0][0]) * 180 / Math.PI;
        g.append("ellipse").attr("cx", x(currentMean[0])).attr("cy", y(currentMean[1]))
          .attr("rx", (D[0] * solver.sigma) * (w / 16)).attr("ry", (D[1] * solver.sigma) * (w / 16))
          .attr("transform", `rotate(${-angle}, ${x(currentMean[0])}, ${y(currentMean[1])})`)
          .attr("fill", "rgba(245, 158, 11, 0.05)").attr("stroke", stepIdx >= 3 ? COLORS.amber : COLORS.slate)
          .attr("stroke-width", 2).attr("stroke-dasharray", stepIdx >= 3 ? "none" : "4,4");
        g.selectAll("circle.sample").data(data.samples).enter().append("circle")
          .attr("cx", (d: SelectionSample) => x(d.x[0])).attr("cy", (d: SelectionSample) => y(d.x[1]))
          .attr("r", (d: SelectionSample) => d.isElite ? 6 : 3.5).attr("fill", (d: SelectionSample) => stepIdx === 0 ? COLORS.blue : (d.isElite ? COLORS.emerald : COLORS.red))
          .style("opacity", (d: SelectionSample) => stepIdx === 1 ? 1 : (stepIdx >= 2 ? (d.isElite ? 1 : 0.1) : 0.6))
          .style("filter", (d: SelectionSample) => d.isElite ? `drop-shadow(0 0 10px ${COLORS.emerald})` : "none");
        if (stepIdx >= 2) g.append("line").attr("x1", x(data.oldMean[0])).attr("y1", y(data.oldMean[1])).attr("x2", x(solver.mean[0])).attr("y2", y(solver.mean[1])).attr("stroke", "#fff").attr("stroke-width", 2);
      } else {
        g.append("circle").attr("cx", x(solver.mean[0])).attr("cy", y(solver.mean[1])).attr("r", 8).attr("fill", COLORS.amber).style("filter", `drop-shadow(0 0 15px ${COLORS.amber})`);
      }
    };
    render();
    window.addEventListener("resize", render);
    return () => window.removeEventListener("resize", render);
  }, [data, stepIdx, solver, objective]);

  return (
    <div className="rq-viz-container !p-0">
      <div className="rq-viz-header flex-col md:flex-row gap-6 p-4 md:p-8 border-b-0">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-inner">
            <Zap className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <h4 className="text-2xl font-black text-white tracking-tighter">Loop Discovery</h4>
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
        <button onClick={nextStep} className="rq-btn-action !py-3.5 !px-4 md:!px-10 flex items-center gap-3 group md:ml-auto">
          {stepIdx === 3 ? `Complete Loop ${currentLoop}` : "Next Phase"}
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-white/[0.02] border-y border-white/5">
        {STEPS.map((s, i) => (
          <div key={s.id} className={cn("p-6 transition-all duration-700 flex flex-col gap-3", stepIdx === i ? "bg-white/5" : "opacity-20 grayscale")}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/5 text-white" style={{ color: s.color }}>{s.icon}</div>
              <div className="text-[11px] font-black uppercase tracking-widest">{s.title}</div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-0">{s.desc}</p>
          </div>
        ))}
      </div>
      <div ref={chartContainerRef} className="relative w-full h-[400px] bg-black/20 overflow-hidden" />
    </div>
  );
}

// ============================================
// 3. COMPARISON: 3D LANDSCAPE
// ============================================

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
      pos.setZ(i, objective(x, y) * 0.1);
    }
    geo.computeVertexNormals();
    return geo;
  }, [objective]);

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
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
  const linePoints = useMemo(
    () =>
      points
        .filter((p) => p.length >= 2 && Number.isFinite(p[0]) && Number.isFinite(p[1]))
        .map((p) => new THREE.Vector3(p[0], p[1], 0.1 + objective(p[0], p[1]) * 0.1)),
    [points, objective]
  );

  // drei/Line requires at least two points; otherwise it can throw in LineGeometry.setPositions.
  if (linePoints.length < 2) {
    return null;
  }

  return <Line points={linePoints} color={color} lineWidth={3} transparent opacity={0.8} />;
}

export function ComparisonViz() {
  const [active, setActive] = useState<"cma" | "gd">("cma");
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState<number[][]>([]);
  const objective = useCallback((x: number, y: number) => {
    const x_rot = x * Math.cos(0.5) - y * Math.sin(0.5);
    const y_rot = x * Math.sin(0.5) + y * Math.cos(0.5);
    return x_rot**2 + (y_rot * 10)**2;
  }, []);

  const run = useCallback(async () => {
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
      }
    } else {
      const cur = [...start];
      const h = [[...cur]];
      const lr = 0.005;
      for (let i = 0; i < 100; i++) {
        const eps = 1e-5;
        const gx = (objective(cur[0] + eps, cur[1]) - objective(cur[0] - eps, cur[1])) / (2 * eps);
        const gy = (objective(cur[0], cur[1] + eps) - objective(cur[0], cur[1] - eps)) / (2 * eps);
        cur[0] -= lr * gx; cur[1] -= lr * gy;
        h.push([...cur]); setHistory([...h]);
        await new Promise(r => setTimeout(r, 20));
      }
    }
    setIsRunning(false);
  }, [active, objective]);

  useEffect(() => {
    const render = () => {
      // Logic for resize or other needs if any
    };
    window.addEventListener("resize", render);
    return () => window.removeEventListener("resize", render);
  }, []);

  return (
    <div className="rq-viz-container !p-0">
      <div className="rq-viz-header border-b-0 p-4 md:p-8">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shadow-inner">
            <Activity className="w-7 h-7 text-orange-400" />
          </div>
          <div>
            <h4 className="text-2xl font-black text-white tracking-tighter">The Geometry War</h4>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">CMA-ES vs Traditional Gradient</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 bg-black/40 p-1.5 rounded-2xl border border-white/10 md:ml-auto">
          <button onClick={() => setActive("cma")} className={cn("px-4 md:px-6 py-2.5 rounded-full text-[11px] font-black uppercase transition-all", 
            active === "cma" ? "bg-amber-500 text-black shadow-xl scale-105" : "text-slate-500 hover:text-white")}>CMA-ES</button>
          <button onClick={() => setActive("gd")} className={cn("px-4 md:px-6 py-2.5 rounded-full text-[11px] font-black uppercase transition-all", 
            active === "gd" ? "bg-blue-500 text-black shadow-xl scale-105" : "text-slate-500 hover:text-white")}>Gradient</button>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row">
        <div className="lg:w-1/3 p-6 md:p-10 border-r border-white/5 bg-white/[0.01]">
          <p className="text-base text-slate-300 leading-relaxed italic mb-10">
            In a <strong>narrow, rotated valley</strong>, standard Gradient Descent often oscillates wildly because its steps aren&apos;t aligned with the curvature. 
            <span className="text-amber-400 font-bold block mt-4 px-4 py-3 bg-amber-500/5 border border-amber-500/10 rounded-xl not-italic">CMA-ES learns the valley&apos;s very shape, stretching its distribution to glide straight to the global minimum.</span>
          </p>
          <button onClick={run} disabled={isRunning} className="w-full rq-btn-action !py-4 flex items-center justify-center gap-3 group">
            {isRunning ? "Running Analysis..." : "Execute Simulation"}
            <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
          </button>
        </div>
        <div className="lg:w-2/3 h-[380px] sm:h-[500px] relative">
          <Canvas dpr={[1, 2]} camera={{ position: [8, 8, 8], fov: 40 }}>
            <color attach="background" args={["#020204"]} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <PresentationControls speed={1.5} global zoom={0.8} polar={[-0.1, Math.PI / 4]}>
              <group position={[0, -1, 0]}>
                <Landscape objective={objective} />
                <PathLine points={history} color={active === "cma" ? COLORS.amber : COLORS.blue} objective={objective} />
              </group>
            </PresentationControls>
            <Environment preset="night" />
            <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
          </Canvas>
          <div className="absolute bottom-6 right-6 p-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl text-[10px] font-black uppercase text-slate-500 tracking-widest pointer-events-none">
            3D View: Orbit Enabled
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

export function BenchmarkRunner() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<keyof typeof BENCHMARKS>("Rastrigin");
  const [dim, setDim] = useState(8);
  const [results, setResults] = useState<BenchmarkPoint[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentC, setCurrentC] = useState<number[][]>([]);

  const run = useCallback(async () => {
    setIsRunning(true);
    const solver = new ProCMAES(dim, new Array(dim).fill(3), 1.0);
    const h: BenchmarkPoint[] = [];
    for (let i = 0; i < 100; i++) {
      const samples = solver.sample();
      const fitnesses = samples.map(BENCHMARKS[selected]);
      solver.update(samples, fitnesses);
      h.push({ gen: i, best: Math.min(...fitnesses), sigma: solver.sigma });
      setResults([...h]);
      if (i % 2 === 0) setCurrentC(solver.C.slice(0, 3).map(r => r.slice(0, 3)));
      if (Math.min(...fitnesses) < 1e-10) break;
      await new Promise(r => setTimeout(r, 10));
    }
    setIsRunning(false);
  }, [dim, selected]);

  useEffect(() => {
    if (!chartRef.current || results.length === 0) return;
    const render = () => {
      const container = d3.select(chartRef.current); container.selectAll("svg").remove();
      const w = chartRef.current!.clientWidth; const h = 300;
      const svg = container.append("svg").attr("width", w).attr("height", h);
      const x = d3.scaleLinear().domain([0, results.length]).range([70, w - 30]);
      const y = d3.scaleLog().domain([1e-10, 100]).range([h - 50, 30]);
      svg.append("g").attr("transform", `translate(0, ${h - 50})`).call(d3.axisBottom(x).ticks(5)).attr("color", "#222");
      svg.append("g").attr("transform", `translate(70, 0)`).call(d3.axisLeft(y).ticks(5, "~e")).attr("color", "#222");
      svg.append("path").datum(results).attr("fill", "none").attr("stroke", COLORS.amber).attr("stroke-width", 3).attr("d", d3.line<BenchmarkPoint>().x(d => x(d.gen)).y(d => y(Math.max(1e-10, d.best))));
      svg.append("path").datum(results).attr("fill", "none").attr("stroke", COLORS.purple).attr("stroke-width", 1.5).attr("stroke-dasharray", "4,2").attr("d", d3.line<BenchmarkPoint>().x(d => x(d.gen)).y(d => y(Math.max(1e-10, d.sigma))));
    };
    render(); window.addEventListener("resize", render);
    return () => window.removeEventListener("resize", render);
  }, [results]);

  return (
    <div className="rq-viz-container !p-0">
      <div className="rq-viz-header flex-col md:flex-row p-4 md:p-10 gap-8 border-b-0">
        <div className="flex items-center gap-6">
          <div className="w-16 h-14 rounded-2xl bg-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.4)] flex items-center justify-center">
            <Cpu className="w-9 h-9 text-black" />
          </div>
          <div>
            <h4 className="text-3xl font-black text-white tracking-tighter">Live Telemetry</h4>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-black">High-Performance Black-Box Solver</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 bg-white/5 p-2.5 rounded-2xl border border-white/10 w-full md:w-auto md:ml-auto">
          <select value={selected} onChange={e => setSelected(e.target.value as keyof typeof BENCHMARKS)} className="bg-transparent border-none text-[12px] font-black uppercase text-white outline-none px-3 md:px-6 min-w-[9rem]">
            {Object.keys(BENCHMARKS).map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <button onClick={run} disabled={isRunning} className="rq-btn-action !shadow-none !py-3.5 !px-4 md:!px-8 w-full sm:w-auto">Execute Optimization</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-white/5 border-t border-white/10">
        <div className="lg:col-span-4 p-6 md:p-10 flex flex-col gap-12 bg-white/[0.01]">
          <div className="space-y-6">
            <div className="flex justify-between items-center text-xs font-black uppercase text-slate-500 tracking-widest">
              <span>Hypercube Dimension</span>
              <span className="text-amber-400 font-mono text-base">{dim}D</span>
            </div>
            <input type="range" min="2" max="20" value={dim} onChange={e => setDim(parseInt(e.target.value))} className="w-full h-1.5 bg-white/10 rounded-full appearance-none accent-amber-500" />
          </div>
          
          <div className="space-y-6">
            <div className="text-xs font-black uppercase text-slate-500 tracking-widest">Internal State Snapshot</div>
            <div className="grid grid-cols-3 gap-3">
              {(currentC.length > 0 ? currentC : Array(3).fill(new Array(3).fill(0))).map((row: number[], i: number) =>
                row.map((val: number, j: number) => (
                  <div key={`${i}-${j}`} className={cn("h-12 flex items-center justify-center font-mono text-xs rounded-xl border transition-all duration-500 shadow-sm", 
                    Math.abs(val) > 0.1 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-white/5 text-slate-700 border-transparent")}>
                    {val.toFixed(2)}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 p-6 md:p-10 bg-black/40 flex flex-col gap-10">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 rounded-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)]" />
              <div className="text-xs font-black uppercase text-white tracking-[0.2em]">Global Best Fitness</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 rounded-full bg-purple-500 opacity-50 border-2 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]" />
              <div className="text-xs font-black uppercase text-slate-500 tracking-[0.2em]">Scale Momentum (\u03c3)</div>
            </div>
          </div>
          <div ref={chartRef} className="w-full h-[300px] opacity-80" />
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

  const objective = useCallback((x: number[]) => {
    const base = x.reduce((a, b) => a + b*b, 0);
    return base + (Math.random() - 0.5) * noiseLevel * 10;
  }, [noiseLevel]);

  const run = useCallback(async () => {
    setIsRunning(true);
    setHistory([]);
    const solver = new ProCMAES(2, [3, 3], 1.0);
    const h: NoisePoint[] = [];
    for (let i = 0; i < 50; i++) {
      const samples = solver.sample();
      const fitnesses = samples.map(objective);
      solver.update(samples, fitnesses);
      h.push({ gen: i, val: Math.min(...fitnesses) });
      setHistory([...h]);
      if (h[h.length-1].val < 1e-3) break;
      await new Promise(r => setTimeout(r, 30));
    }
    setIsRunning(false);
  }, [objective]);

  useEffect(() => {
    if (!chartRef.current || history.length === 0) return;
    const render = () => {
      const container = d3.select(chartRef.current);
      container.selectAll("svg").remove();
      const w = chartRef.current!.clientWidth;
      const h = 240;
      const svg = container.append("svg").attr("width", w).attr("height", h);
      const x = d3.scaleLinear().domain([0, 50]).range([50, w - 20]);
      const y = d3.scaleLinear().domain([d3.min(history, d => d.val) || 0, 10]).range([h - 40, 20]);

      svg.append("g").attr("transform", `translate(0, ${h - 40})`).call(d3.axisBottom(x).ticks(5)).attr("color", "#444");
      svg.append("g").attr("transform", `translate(50, 0)`).call(d3.axisLeft(y).ticks(5, "~e")).attr("color", "#444");

      svg.append("path").datum(history).attr("fill", "none").attr("stroke", COLORS.emerald).attr("stroke-width", 2).attr("d", d3.line<NoisePoint>().x(d => x(d.gen)).y(d => y(d.val)));
    };
    render();
    window.addEventListener("resize", render);
    return () => window.removeEventListener("resize", render);
  }, [history]);

  return (
    <div className="rq-viz-container !p-8 bg-emerald-500/5 border-emerald-500/20">
      <div className="flex flex-col md:flex-row gap-10 items-center">
        <div className="md:w-1/3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6">
            <Zap className="w-6 h-6 text-emerald-400" />
          </div>
          <h4 className="text-xl font-black text-white mb-2 tracking-tight">The Noise Filter</h4>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            Real-world simulators are &quot;jittery.&quot; Because CMA-ES uses a population, it naturally averages out the noise, finding the true signal of the landscape.
          </p>
          <div className="space-y-4">
            <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest">
              <span>Feedback Jitter</span>
              <span className="text-emerald-400">{Math.round(noiseLevel * 100)}%</span>
            </div>
            <input type="range" min="0" max="1" step="0.1" value={noiseLevel} onChange={e => setNoiseLevel(parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-full appearance-none accent-emerald-500" />
            <button onClick={run} disabled={isRunning} className="w-full rq-btn-action !bg-emerald-500 !text-black flex items-center justify-center gap-2 !shadow-none !py-3">
              <Play className="w-4 h-4 fill-current" /> Play Simulation
            </button>
          </div>
        </div>
        <div ref={chartRef} className="flex-1 min-h-[240px] bg-black/20 rounded-2xl p-4 border border-white/5" />
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
  const [bestVal, setBestVal] = useState(10);

  const objective = useCallback((x: number[]) => {
    return 10 + x.reduce((a, b) => a + b*b - 10 * Math.cos(2 * Math.PI * b), 0);
  }, []);

  const run = useCallback(async () => {
    setIsRunning(true);
    let currentPopSize = 6;
    setPopSize(currentPopSize);
    setGeneration(0);
    
    for (let restart = 0; restart < 3; restart++) {
      const solver = new ProCMAES(2, [4, 4], 1.0);
      solver.lambda = currentPopSize;
      
      for (let i = 0; i < 30; i++) {
        const samples = solver.sample();
        const fitnesses = samples.map(objective);
        solver.update(samples, fitnesses);
        const best = Math.min(...fitnesses);
        setBestVal(best);
        setGeneration(g => g + 1);
        if (best < 1e-6) break;
        await new Promise(r => setTimeout(r, 40));
      }
      
      if (bestVal < 1e-6) break;
      currentPopSize *= 2;
      setPopSize(currentPopSize);
    }
    setIsRunning(false);
  }, [objective, bestVal]);

  return (
    <div className="rq-viz-container !p-8 bg-purple-500/5 border-purple-500/20">
      <div className="flex flex-col md:flex-row gap-10 items-center">
        <div className="md:w-1/3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6">
            <RotateCcw className="w-6 h-6 text-purple-400" />
          </div>
          <h4 className="text-xl font-black text-white mb-2 tracking-tight">Escaping Local Traps</h4>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            Complex landscapes have many &quot;traps&quot; (local minima). CMA-ES handles this with <strong>IPOP</strong>: if it gets stuck, it restarts with a larger, more exploratory population.
          </p>
          <div className="p-5 rounded-xl bg-black/40 border border-white/5 space-y-4 mb-6">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs md:text-sm font-black uppercase tracking-[0.18em]">Current Population</span>
              <span className="text-base md:text-xl font-mono font-bold text-purple-300">λ = {popSize}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs md:text-sm font-black uppercase tracking-[0.18em]">Best Objective</span>
              <span className="text-base md:text-xl font-mono font-bold text-white">{bestVal.toFixed(4)}</span>
            </div>
          </div>
          <button onClick={run} disabled={isRunning} className="w-full rq-btn-action !bg-purple-500 !text-white flex items-center justify-center gap-2 !shadow-none !py-3">
            <Play className="w-4 h-4 fill-current" /> {isRunning ? "Optimizing..." : "Execute IPOP-CMA-ES"}
          </button>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-4 h-full">
          <div className="bg-black/40 rounded-2xl border border-white/5 p-6 flex flex-col items-center justify-center relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="text-4xl font-black text-white mb-2 tracking-tighter">{generation}</div>
             <div className="text-[9px] uppercase font-black text-slate-500 tracking-[0.2em]">Generations</div>
          </div>
          <div className="bg-black/40 rounded-2xl border border-white/5 p-6 flex flex-col items-center justify-center relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="text-4xl font-black text-white mb-2 tracking-tighter">{popSize}</div>
             <div className="text-[9px] uppercase font-black text-slate-500 tracking-[0.2em]">Population size</div>
          </div>
          <div className="col-span-2 bg-black/40 rounded-2xl border border-white/5 p-6 relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <div className="text-[9px] uppercase font-black text-slate-500 tracking-[0.2em]">Convergence Path</div>
              <div className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest", bestVal < 1e-3 ? "bg-emerald-500/20 text-emerald-400" : "bg-purple-500/20 text-purple-400")}>
                {bestVal < 1e-3 ? "Global Minimum Found" : "Searching..."}
              </div>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-purple-500 to-amber-500"
                initial={{ width: "0%" }}
                animate={{ width: `${Math.max(0, Math.min(100, (1 - bestVal / 10) * 100))}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
