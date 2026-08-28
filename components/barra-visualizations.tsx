"use client";

import { useRef, useEffect, useState, useMemo, useId, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
// Visibility-gated Canvas: pauses each scene's render loop while offscreen
import Canvas from "@/components/gated-canvas";
import { OrbitControls, Float, Text, MeshWobbleMaterial, Stars } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Shield, Activity, Maximize2, Layers, Rotate3d } from "lucide-react";
import { BarraJargon, getBarraJargon } from "./barra-jargon";
import { useDeviceCapabilities } from "@/hooks/use-mobile-optimizations";
import { cn } from "@/lib/utils";

const COLORS = {
  bg: "#020204",
  cyan: "#22d3ee",
  emerald: "#10b981",
  rose: "#f43f5e",
  amber: "#f59e0b",
  blue: "#3b82f6",
  purple: "#a855f7",
  slate: "#64748b",
  white: "#f8fafc",
};

function deterministicUnit(seed: number) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

interface HeroFactorLabel {
  name: string;
  pos: [number, number, number];
  color: string;
}

interface FactorContribution {
  name: string;
  val: number;
  color: string;
}

// ============================================
// SHARED HELPERS
// ============================================

/** True on touch-first devices, where a one-finger drag must keep scrolling the page. */
function useCoarsePointer() {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setCoarse(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return coarse;
}

/**
 * OrbitControls sets `touch-action: none` on the canvas when it connects, which turns
 * every scene into a vertical-scroll trap on phones. This is rendered *after* the
 * controls so its effect runs later and wins; it hands one-finger drags back to the
 * page (`pan-y`) unless the reader has explicitly switched rotation on.
 */
function CanvasTouchAction({ value }: { value: "none" | "pan-y" }) {
  const get = useThree((s) => s.get);
  // R3F routes pointer events through `events.connected` (the wrapper div by
  // default) and the controls set `touch-action: none` THERE, not on the
  // canvas — so both elements must carry the value, re-applied one frame
  // later so it lands after the controls' own connect().
  useEffect(() => {
    const apply = () => {
      const { gl, events } = get();
      gl.domElement.style.touchAction = value;
      const connected = events.connected as HTMLElement | undefined;
      if (connected && connected.style) connected.style.touchAction = value;
    };
    apply();
    const raf = requestAnimationFrame(apply);
    return () => cancelAnimationFrame(raf);
  }, [get, value]);
  return null;
}

function RotateToggle({ on, onToggle, className }: { on: boolean; onToggle: () => void; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-2 min-h-10 px-3 rounded-full border text-xs font-black uppercase tracking-widest backdrop-blur-md transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400",
        on ? "bg-emerald-500 text-black border-emerald-400" : "bg-black/60 text-slate-200 border-white/20 hover:bg-black/80",
        className
      )}
    >
      <Rotate3d className="w-3.5 h-3.5" aria-hidden="true" />
      {on ? "Rotate: on" : "Rotate"}
    </button>
  );
}

/** One control drives both `enableRotate` on the controls and the canvas touch-action. */
function useRotateGate() {
  const coarse = useCoarsePointer();
  const [rotateOn, setRotateOn] = useState(false);
  const rotateAllowed = !coarse || rotateOn;
  return {
    coarse,
    rotateOn,
    rotateAllowed,
    touchAction: (rotateAllowed ? "none" : "pan-y") as "none" | "pan-y",
    toggle: () => setRotateOn((v) => !v),
  };
}

// Styled native range input: ≥24px tall hit box, visible thumb, visible focus ring.
const RANGE_BASE =
  "w-full h-6 bg-transparent appearance-none cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "[&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/10 " +
  "[&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-white/10 " +
  "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:-mt-2 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#020204] " +
  "[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#020204]";
const RANGE_CYAN =
  "focus-visible:outline-cyan-300 [&::-webkit-slider-thumb]:bg-cyan-400 [&::-moz-range-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:shadow-[0_0_14px_rgba(34,211,238,0.6)]";
const RANGE_ROSE =
  "focus-visible:outline-rose-300 [&::-webkit-slider-thumb]:bg-rose-400 [&::-moz-range-thumb]:bg-rose-400 [&::-webkit-slider-thumb]:shadow-[0_0_14px_rgba(244,63,94,0.6)]";

// ============================================
// 1. RISK TOPOGRAPHY (Hero)
// ============================================

// The plane is rotated -90° about X, so its local (x, y) is the ground (x, -z) and
// local z is world height. Displacing in the vertex shader keeps 9k vertices off the CPU.
const TERRAIN_VERTEX = `
#include <begin_vertex>
{
  float tx = position.x;
  float tz = position.y;
  float t = uTime;
  transformed.z = sin(tx * 0.1 + t) * cos(tz * 0.1 + t * 0.5) * 3.0
                + sin(tx * 0.05 - t * 0.3) * 5.0
                + cos(tz * 0.08 + t * 0.2) * 2.0;
}
`;

function RiskLandscape({ resolution, frozen }: { resolution: number; frozen: boolean }) {
  // The compiled program owns the uniform; we keep a handle to it for the frame loop.
  const timeUniformRef = useRef<{ value: number } | null>(null);

  const onBeforeCompile = useCallback((shader: THREE.WebGLProgramParametersWithUniforms) => {
    shader.uniforms.uTime = { value: 0 };
    timeUniformRef.current = shader.uniforms.uTime as { value: number };
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uTime;")
      .replace("#include <begin_vertex>", TERRAIN_VERTEX);
  }, []);

  useFrame(({ clock }) => {
    if (frozen || !timeUniformRef.current) return;
    timeUniformRef.current.value = clock.getElapsedTime();
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -20, 0]}>
      <planeGeometry args={[200, 200, resolution, resolution]} />
      <meshStandardMaterial
        color={COLORS.emerald}
        wireframe
        transparent
        opacity={0.1}
        emissive={COLORS.emerald}
        emissiveIntensity={0.2}
        onBeforeCompile={onBeforeCompile}
      />
    </mesh>
  );
}

function ScanningBeam({ frozen }: { frozen: boolean }) {
  const beamRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!beamRef.current || frozen) return;
    beamRef.current.position.z = Math.sin(clock.getElapsedTime() * 0.4) * 80;
  });

  return (
    <mesh ref={beamRef} position={[0, -18, 0]}>
      <boxGeometry args={[250, 0.2, 1]} />
      <meshBasicMaterial color={COLORS.cyan} transparent opacity={0.3} />
    </mesh>
  );
}

const HERO_LABELS: HeroFactorLabel[] = [
  { name: "MOMENTUM", pos: [-55, 15, -10], color: COLORS.cyan },
  { name: "VALUE", pos: [55, -5, 20], color: COLORS.amber },
  { name: "GROWTH", pos: [10, 25, -30], color: COLORS.emerald },
  { name: "SIZE", pos: [-35, -20, 45], color: COLORS.purple },
];

export function FactorHero() {
  const { capabilities, quality } = useDeviceCapabilities();
  const frozen = capabilities.prefersReducedMotion;
  const resolution = capabilities.tier === "low" ? 48 : 96;
  const starCount = Math.max(500, Math.round(5000 * quality.particleMultiplier));

  return (
    <div className="absolute inset-0 z-0 opacity-60" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 30, 90], fov: 45 }}
        dpr={[1, quality.maxDpr]}
        frameloop={frozen ? "demand" : undefined}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[20, 30, 20]} intensity={1} color={COLORS.cyan} />
        <RiskLandscape resolution={resolution} frozen={frozen} />
        <ScanningBeam frozen={frozen} />
        <Float speed={frozen ? 0 : 1.5} rotationIntensity={0.4} floatIntensity={0.4}>
           <group position={[0, 10, 0]}>
              {HERO_LABELS.map((f) => (
                <Text
                  key={f.name}
                  position={f.pos}
                  fontSize={4}
                  color={f.color}
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.2}
                  outlineColor="#000000"
                >
                  {f.name}
                </Text>
              ))}
           </group>
        </Float>
        <Stars radius={100} depth={50} count={starCount} factor={4} saturation={0} fade speed={frozen ? 0 : 1} />
      </Canvas>
    </div>
  );
}

// ============================================
// 2. FORENSIC PRISM (Return Decomposition)
// ============================================
function ForensicCore({ frozen }: { frozen: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!meshRef.current || frozen) return;
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.5;
  });
  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[8, 0]} />
      <meshStandardMaterial color={COLORS.white} transparent opacity={0.05} wireframe />
    </mesh>
  );
}

/** Splinter length and tip size scale with |contribution|; negative contributions point the other way. */
function PrismSplinter({ factor, index, frozen }: { factor: FactorContribution; index: number; frozen: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const magnitude = Math.abs(factor.val);
  const length = 4 + magnitude * 16;
  const tip = factor.val < 0 ? -length : length;
  const points = useMemo(() => new Float32Array([0, 0, 0, tip, 0, 0]), [tip]);
  const radius = 0.35 + magnitude * 0.8;

  useFrame(({ clock }) => {
    if (!groupRef.current || frozen) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.z = t * 0.2 + index;
    const s = 1 + Math.sin(t * 2 + index) * 0.1;
    groupRef.current.scale.set(s, s, s);
  });

  return (
    <group ref={groupRef} rotation={[0, 0, index]}>
      <line key={tip}>
        <bufferGeometry attach="geometry">
          <bufferAttribute attach="attributes-position" args={[points, 3]} />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color={factor.color} transparent opacity={0.6} />
      </line>
      <mesh position={[tip, 0, 0]}>
        <sphereGeometry args={[radius, 16, 16]} />
        <meshBasicMaterial color={factor.color} />
      </mesh>
    </group>
  );
}

// Illustrative decompositions: stylised contribution mixes, not reported returns.
// Contributions sum exactly to `total` (e.g. 0.15 + 0.65 - 0.10 + 0.40 + 0.25 = 1.35).
const STOCKS = {
  NVDA: { market: 0.15, momentum: 0.65, value: -0.1, growth: 0.4, specific: 0.25, total: 1.35, desc: "Factor-driven explosive growth profile." },
  JPM: { market: 0.25, momentum: 0.05, value: 0.4, growth: -0.05, specific: 0.1, total: 0.75, desc: "Stable value core with market sensitivity." },
  TSLA: { market: 0.2, momentum: 0.3, value: -0.2, growth: 0.5, specific: 0.65, total: 1.45, desc: "High idiosyncratic 'story stock' volatility." },
  WMT: { market: 0.1, momentum: 0.15, value: 0.2, growth: 0.05, specific: 0.05, total: 0.55, desc: "Defensive giant, low factor sensitivity." },
} as const;
type StockKey = keyof typeof STOCKS;
const STOCK_KEYS = Object.keys(STOCKS) as StockKey[];

export function ReturnDecomposition() {
  const [activeStock, setActiveStock] = useState<StockKey>("NVDA");
  const { capabilities } = useDeviceCapabilities();
  const frozen = capabilities.prefersReducedMotion;
  const rotate = useRotateGate();

  const data = STOCKS[activeStock];
  const factors = useMemo<FactorContribution[]>(
    () => [
      { name: "Market", val: data.market, color: COLORS.blue },
      { name: "Momentum", val: data.momentum, color: COLORS.cyan },
      { name: "Value", val: data.value, color: COLORS.amber },
      { name: "Growth", val: data.growth, color: COLORS.emerald },
      { name: "Idiosyncratic", val: data.specific, color: COLORS.purple },
    ],
    [data]
  );

  return (
    <div className="barra-viz-container overflow-hidden">
      <div className="barra-viz-header flex flex-wrap justify-between items-center bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <Activity className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          <h3 className="font-black text-white uppercase tracking-widest text-xs m-0">Forensic Return Prism</h3>
        </div>
        <div className="flex gap-1.5 flex-wrap justify-end" role="group" aria-label="Choose a stock">
          {STOCK_KEYS.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setActiveStock(s)}
              aria-pressed={activeStock === s}
              className={cn(
                "min-h-11 px-4 rounded-md text-xs font-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400",
                activeStock === s ? "bg-emerald-500 text-black shadow-lg" : "bg-white/5 text-slate-400 hover:bg-white/10"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[450px]">
        <div className="relative bg-black/20 border-r border-white/5 h-[300px] lg:h-auto">
           <div className="absolute inset-0" aria-hidden="true">
             <Canvas camera={{ position: [0, 0, 40], fov: 40 }} frameloop={frozen ? "demand" : undefined}>
                <ambientLight intensity={0.5} />
                <ForensicCore frozen={frozen} />
                <group>
                   {factors.map((f, i) => (
                     <PrismSplinter key={f.name} factor={f} index={i} frozen={frozen} />
                   ))}
                </group>
                <OrbitControls enableZoom={false} enablePan={false} enableRotate={rotate.rotateAllowed} />
                <CanvasTouchAction value={rotate.touchAction} />
             </Canvas>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <Zap className="w-6 h-6 text-white/20 animate-pulse" />
             </div>
           </div>
           {rotate.coarse && (
             <RotateToggle on={rotate.rotateOn} onToggle={rotate.toggle} className="absolute bottom-3 right-3 z-10" />
           )}
        </div>

        <div className="p-8 md:p-12 space-y-8 flex flex-col justify-center bg-gradient-to-br from-transparent to-emerald-500/5">
          <AnimatePresence mode="wait">
            <motion.div key={activeStock} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="flex items-end gap-4 mb-2">
                 <div className="text-6xl font-black text-white tracking-tighter">{(data.total * 100).toFixed(0)}%</div>
                 <div className="text-xs text-slate-500 uppercase tracking-[0.3em] font-bold mb-3">Net Return</div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed border-l-2 border-emerald-500/30 pl-6 italic">&ldquo;{data.desc}&rdquo;</p>

              <div className="space-y-4 pt-4">
                {factors.map((f) => (
                  <div key={f.name} className="group">
                    <div className="flex justify-between text-xs font-mono uppercase mb-2">
                      <BarraJargon term={f.name === "Idiosyncratic" ? "idiosyncratic-risk" : f.name.toLowerCase()}>
                        <span className="text-slate-500 group-hover:text-slate-300 transition-colors">{f.name} Contribution</span>
                      </BarraJargon>
                      <span className={f.val >= 0 ? "text-emerald-400" : "text-rose-400"}>{(f.val * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(5, Math.abs(f.val / 1.5) * 100)}%` }}
                        className="h-full relative" style={{ backgroundColor: f.color, marginLeft: f.val < 0 ? "auto" : "0", marginRight: f.val > 0 ? "auto" : "0" }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mb-0 pt-2 border-t border-white/5">
                Illustrative decomposition: stylised contribution mixes, not reported returns. Splinter length scales with each contribution&rsquo;s size; negative contributions point the other way.
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 3. STRESS COCKPIT (Leverage)
// ============================================
type Severity = "stable" | "warning" | "critical";

// One severity drives every colour and label in the cockpit.
const SEVERITY = {
  stable: { label: "STABLE", towerEmissive: COLORS.cyan, light: COLORS.white, icon: "text-emerald-500", chip: "bg-emerald-500/20 border-emerald-500 text-emerald-500", impact: "text-emerald-500" },
  warning: { label: "WARNING", towerEmissive: COLORS.amber, light: COLORS.amber, icon: "text-amber-500", chip: "bg-amber-500/20 border-amber-500 text-amber-500", impact: "text-amber-500" },
  critical: { label: "CRITICAL", towerEmissive: COLORS.rose, light: COLORS.rose, icon: "text-rose-500 animate-pulse", chip: "bg-rose-500/20 border-rose-500 text-rose-500", impact: "text-rose-500" },
} as const;

function severityFor(lpLoss: number): Severity {
  return lpLoss >= 50 ? "critical" : lpLoss >= 25 ? "warning" : "stable";
}

function LeverageTower({ leverage, loss, severity, frozen }: { leverage: number; loss: number; severity: Severity; frozen: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const segments = Math.max(1, Math.ceil(leverage));
  const stress = (leverage * loss) / 50;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = frozen ? 0 : clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      if (frozen) {
        child.rotation.z = 0;
        child.rotation.x = 0;
        return;
      }
      const sway = Math.sin(t * 2 + i * 0.5) * stress * (i / segments) * 1.5;
      child.rotation.z = sway;
      child.rotation.x = Math.cos(t * 1.5 + i * 0.3) * stress * (i / segments) * 0.5;
    });
  });

  return (
    <group ref={groupRef} position={[0, -15, 0]}>
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} position={[0, i * 4, 0]} visible={i < leverage}>
          <boxGeometry args={[12 - i * 0.8, 3.8, 12 - i * 0.8]} />
          <meshStandardMaterial color={COLORS.cyan} emissive={SEVERITY[severity].towerEmissive} emissiveIntensity={Math.min(2, (leverage * loss) / 25)} transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

export function PodSimulator() {
  const [leverage, setLeverage] = useState(6);
  const [loss, setLoss] = useState(5);
  const lpLoss = Math.round(leverage * loss);
  const severity = severityFor(lpLoss);
  const sev = SEVERITY[severity];
  const { capabilities } = useDeviceCapabilities();
  const frozen = capabilities.prefersReducedMotion;
  const rotate = useRotateGate();
  const leverageId = useId();
  const lossId = useId();

  return (
    <div className="barra-viz-container overflow-hidden bg-slate-950">
       <div className="barra-viz-header flex flex-wrap justify-between items-center gap-3 bg-black/60">
          <div className="flex items-center gap-3">
             <Shield className={cn("w-5 h-5", sev.icon)} aria-hidden="true" />
             <h3 className="font-black text-white uppercase tracking-[0.2em] text-xs m-0">Structural Integrity Test</h3>
          </div>
          <div role="status" className={cn("px-4 py-1.5 rounded-full border text-xs font-black tracking-widest", sev.chip)}>
             {sev.label}
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[400px]">
          <div className="lg:col-span-2 relative bg-black/40 h-[300px] lg:h-auto">
             <div className="absolute inset-0" aria-hidden="true">
               <Canvas camera={{ position: [40, 20, 60], fov: 45 }} frameloop={frozen ? "demand" : undefined}>
                  <ambientLight intensity={0.4} />
                  <pointLight position={[20, 20, 20]} intensity={1} color={sev.light} />
                  <LeverageTower leverage={leverage} loss={loss} severity={severity} frozen={frozen} />
                  <OrbitControls enableZoom={false} enablePan={false} enableRotate={rotate.rotateAllowed} />
                  <CanvasTouchAction value={rotate.touchAction} />
                  <gridHelper args={[100, 20, COLORS.slate, COLORS.bg]} position={[0, -15, 0]} />
               </Canvas>
             </div>
             {rotate.coarse && (
               <RotateToggle on={rotate.rotateOn} onToggle={rotate.toggle} className="absolute bottom-3 right-3 z-10" />
             )}
             {severity === "critical" && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center bg-rose-950/40 backdrop-blur-md px-4 pointer-events-none">
                  <div className="text-center max-w-full">
                     <div className="text-4xl sm:text-6xl font-black text-rose-500 drop-shadow-2xl break-words">TERMINATED</div>
                     <div className="text-xs font-mono text-rose-200 mt-2 uppercase tracking-[0.3em] sm:tracking-[0.5em]">Capital Wiped Out</div>
                  </div>
               </motion.div>
             )}
          </div>

          <div className="p-8 md:p-10 space-y-10 bg-black/60 border-l border-white/5 flex flex-col justify-center">
             <div className="space-y-4">
                <div className="flex justify-between items-end">
                   <label htmlFor={leverageId} className="text-xs font-black text-slate-500 uppercase tracking-widest">Gross Leverage</label>
                   <span className="text-2xl font-black font-mono text-cyan-400">{leverage}x</span>
                </div>
                <input
                  id={leverageId}
                  type="range" min="1" max="10" step="0.5" value={leverage}
                  onChange={(e) => setLeverage(parseFloat(e.target.value))}
                  className={cn(RANGE_BASE, RANGE_CYAN)}
                />
             </div>
             <div className="space-y-4">
                <div className="flex justify-between items-end">
                   <label htmlFor={lossId} className="text-xs font-black text-slate-500 uppercase tracking-widest">Pod Drawdown</label>
                   <span className="text-2xl font-black font-mono text-rose-400">-{loss}%</span>
                </div>
                <input
                  id={lossId}
                  type="range" min="0.5" max="15" step="0.5" value={loss}
                  onChange={(e) => setLoss(parseFloat(e.target.value))}
                  className={cn(RANGE_BASE, RANGE_ROSE)}
                />
             </div>
             <div className="pt-8 border-t border-white/5">
                <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Capital Impact</div>
                <div className={cn("text-5xl md:text-7xl font-black tracking-tighter", sev.impact)}>-{lpLoss}%</div>
             </div>
          </div>
       </div>
    </div>
  );
}

// ============================================
// 4. FACTOR COSMOS (Correlation)
// ============================================
const COSMOS_FACTORS = [
  { name: "MARKET", color: COLORS.blue, jargon: "beta" },
  { name: "VALUE", color: COLORS.amber, jargon: "value" },
  { name: "MOMENTUM", color: COLORS.cyan, jargon: "momentum" },
  { name: "GROWTH", color: COLORS.emerald, jargon: "growth" },
  { name: "SIZE", color: COLORS.purple, jargon: "size" },
  { name: "VOL", color: COLORS.rose, jargon: "volatility" },
] as const;

/**
 * Hand-authored, stylised factor-return correlations (symmetric).
 * ILLUSTRATIVE ONLY: chosen to show the classic textbook relationships
 * (value vs momentum/growth negative, vol vs market positive), not estimated from data.
 */
const ILLUSTRATIVE_CORR: number[][] = [
  // MARKET  VALUE  MOM    GROWTH SIZE   VOL
  [ 1.00,   0.15, -0.10,  0.25,  0.30,  0.45], // MARKET
  [ 0.15,   1.00, -0.35, -0.50,  0.10, -0.20], // VALUE
  [-0.10,  -0.35,  1.00,  0.30,  0.05,  0.20], // MOMENTUM
  [ 0.25,  -0.50,  0.30,  1.00, -0.05,  0.35], // GROWTH
  [ 0.30,   0.10,  0.05, -0.05,  1.00, -0.30], // SIZE
  [ 0.45,  -0.20,  0.20,  0.35, -0.30,  1.00], // VOL
];

const CORR_PAIRS: { a: number; b: number; rho: number }[] = [];
for (let a = 0; a < COSMOS_FACTORS.length; a++) {
  for (let b = a + 1; b < COSMOS_FACTORS.length; b++) {
    CORR_PAIRS.push({ a, b, rho: ILLUSTRATIVE_CORR[a][b] });
  }
}

const ORIGIN = new THREE.Vector3(0, 0, 0);
const UP = new THREE.Vector3(0, 1, 0);
const _edgeDir = new THREE.Vector3();
const _edgeMid = new THREE.Vector3();

function FactorPlanet({
  name, color, index, active, frozen, positions, onSelect,
}: {
  name: string; color: string; index: number; active: boolean; frozen: boolean;
  positions: THREE.Vector3[]; onSelect: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const angle = (index / 6) * Math.PI * 2;

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = frozen ? 0 : clock.getElapsedTime();
    if (active) {
      if (frozen) mesh.position.set(0, 0, 0);
      else mesh.position.lerp(ORIGIN, 0.1);
    } else {
      mesh.position.set(
        Math.cos(angle + t * 0.1) * 20,
        Math.sin(t * 0.5 + index) * 2,
        Math.sin(angle + t * 0.1) * 20
      );
    }
    positions[index].copy(mesh.position);
  });

  return (
      <mesh ref={meshRef} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
        <sphereGeometry args={[active ? 5 : 2.5, 32, 32]} />
        <MeshWobbleMaterial color={color} factor={active ? 0.3 : 0.1} speed={frozen ? 0 : 2} emissive={color} emissiveIntensity={0.4} />
        <Text position={[0, active ? 7 : 4, 0]} fontSize={active ? 2.5 : 1.8} color="white" fontStyle="italic">{name}</Text>
      </mesh>
  );
}

/** Edges between planets: radius ∝ |ρ|, emerald for positive, rose for negative. No per-frame allocations. */
function CorrelationEdges({ positions, selectedIndex }: { positions: THREE.Vector3[]; selectedIndex: number | null }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    for (let k = 0; k < CORR_PAIRS.length; k++) {
      const pair = CORR_PAIRS[k];
      const mesh = group.children[k] as THREE.Mesh | undefined;
      if (!mesh) continue;
      const a = positions[pair.a];
      const b = positions[pair.b];
      _edgeDir.subVectors(b, a);
      const len = _edgeDir.length();
      if (len < 1e-3) { mesh.visible = false; continue; }
      mesh.visible = true;
      _edgeMid.addVectors(a, b).multiplyScalar(0.5);
      mesh.position.copy(_edgeMid);
      mesh.quaternion.setFromUnitVectors(UP, _edgeDir.multiplyScalar(1 / len));
      mesh.scale.set(1, len, 1);
      const material = mesh.material as THREE.MeshBasicMaterial;
      const strength = Math.abs(pair.rho);
      if (selectedIndex === null) material.opacity = 0.12 + strength * 0.4;
      else if (pair.a === selectedIndex || pair.b === selectedIndex) material.opacity = 0.3 + strength * 0.65;
      else material.opacity = 0.04;
    }
  });

  return (
    <group ref={groupRef}>
      {CORR_PAIRS.map((pair) => {
        const radius = 0.08 + Math.abs(pair.rho) * 0.7;
        return (
          <mesh key={`${pair.a}-${pair.b}`}>
            <cylinderGeometry args={[radius, radius, 1, 6, 1]} />
            <meshBasicMaterial color={pair.rho >= 0 ? COLORS.emerald : COLORS.rose} transparent opacity={0.3} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
}

function CosmosStars() {
  const points = useMemo(() => {
    const p = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      p[i * 3] = (deterministicUnit(i * 3 + 11) - 0.5) * 200;
      p[i * 3 + 1] = (deterministicUnit(i * 3 + 17) - 0.5) * 200;
      p[i * 3 + 2] = (deterministicUnit(i * 3 + 23) - 0.5) * 200;
    }
    return p;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.1} color={COLORS.white} transparent opacity={0.5} />
    </points>
  );
}

export function FactorCorrelationMatrix() {
  const [selected, setSelected] = useState<number | null>(null);
  const { capabilities } = useDeviceCapabilities();
  const frozen = capabilities.prefersReducedMotion;
  const rotate = useRotateGate();
  const positions = useMemo(() => COSMOS_FACTORS.map(() => new THREE.Vector3()), []);
  const selectedFactor = selected === null ? null : COSMOS_FACTORS[selected];
  const definition = selectedFactor ? getBarraJargon(selectedFactor.jargon) : null;

  return (
    <div className="barra-viz-container bg-black">
       <div className="barra-viz-header flex flex-wrap justify-between items-center gap-3 bg-white/[0.02] border-b border-white/5 px-6">
          <div className="flex items-center gap-3">
             <Layers className="w-4 h-4 text-cyan-400" aria-hidden="true" />
             <h3 className="font-black text-white uppercase tracking-[0.2em] text-xs m-0">The Factor Cosmos</h3>
          </div>
          <div className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em]">Select a factor</div>
       </div>

       <div className="flex flex-wrap gap-2 px-4 md:px-6 py-3 border-b border-white/5" role="group" aria-label="Choose a factor">
          {COSMOS_FACTORS.map((f, i) => (
            <button
              key={f.name}
              type="button"
              aria-pressed={selected === i}
              onClick={() => setSelected(selected === i ? null : i)}
              className={cn(
                "inline-flex items-center gap-2 min-h-11 px-4 rounded-full border text-xs font-black tracking-widest transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400",
                selected === i ? "bg-white/10 border-white/40 text-white" : "bg-transparent border-white/10 text-slate-400 hover:text-white hover:border-white/30"
              )}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: f.color }} aria-hidden="true" />
              {f.name}
            </button>
          ))}
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="relative h-[320px] md:h-[400px] lg:h-[460px]">
             <div className="absolute inset-0" aria-hidden="true">
               <Canvas camera={{ position: [0, 25, 55], fov: 45 }} frameloop={frozen ? "demand" : undefined}>
                  <ambientLight intensity={0.3} />
                  <pointLight position={[0, 0, 0]} intensity={2} color={COLORS.white} />
                  <group>
                     {COSMOS_FACTORS.map((f, i) => (
                       <FactorPlanet
                         key={f.name}
                         name={f.name}
                         color={f.color}
                         index={i}
                         active={selected === i}
                         frozen={frozen}
                         positions={positions}
                         onSelect={() => setSelected(selected === i ? null : i)}
                       />
                     ))}
                  </group>
                  <CorrelationEdges positions={positions} selectedIndex={selected} />
                  <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    enableRotate={rotate.rotateAllowed}
                    autoRotate={selected === null && !frozen}
                    autoRotateSpeed={0.5}
                  />
                  <CanvasTouchAction value={rotate.touchAction} />
                  <CosmosStars />
               </Canvas>
             </div>
             {rotate.coarse && (
               <RotateToggle on={rotate.rotateOn} onToggle={rotate.toggle} className="absolute bottom-3 right-3 z-10" />
             )}
          </div>

          <div className="p-5 md:p-6 border-t lg:border-t-0 lg:border-l border-white/5 bg-black/40 flex flex-col gap-4 min-h-[220px]">
             <p className="text-xs text-slate-500 mb-0 leading-relaxed">
                Illustrative correlations, stylised to show textbook relationships; not model output.
                Edge thickness scales with |&rho;|; <span className="text-emerald-400">emerald</span> is positive, <span className="text-rose-400">rose</span> is negative.
             </p>
             <AnimatePresence mode="wait">
                {selectedFactor ? (
                  <motion.div key={selectedFactor.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                     <h4 className="font-black text-white uppercase tracking-widest text-xs m-0 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedFactor.color }} aria-hidden="true" />
                        {selectedFactor.name}
                     </h4>
                     {definition && (
                       <p className="text-sm text-slate-300 leading-relaxed font-serif italic mb-0">{definition.def}</p>
                     )}
                     <ul className="space-y-2 m-0 p-0 list-none">
                        {COSMOS_FACTORS.map((other, j) => {
                          if (j === selected) return null;
                          const rho = ILLUSTRATIVE_CORR[selected as number][j];
                          return (
                            <li key={other.name} className="grid grid-cols-[6rem_1fr_3rem] items-center gap-2 text-xs font-mono">
                               <span className="text-slate-400 truncate">{other.name}</span>
                               <span className="relative h-1.5 rounded-full bg-white/5 overflow-hidden" aria-hidden="true">
                                  <span
                                    className={cn("absolute top-0 bottom-0 rounded-full", rho >= 0 ? "bg-emerald-500 left-1/2" : "bg-rose-500 right-1/2")}
                                    style={{ width: `${Math.abs(rho) * 50}%` }}
                                  />
                               </span>
                               <span className={cn("text-right tabular-nums", rho >= 0 ? "text-emerald-400" : "text-rose-400")}>
                                  {rho > 0 ? "+" : ""}{rho.toFixed(2)}
                               </span>
                            </li>
                          );
                        })}
                     </ul>
                  </motion.div>
                ) : (
                  <p key="empty" className="text-sm text-slate-400 mb-0 leading-relaxed">
                     Pick a factor above (or tap a planet) to read its definition and see how it co-moves with the other five.
                  </p>
                )}
             </AnimatePresence>
          </div>
       </div>
    </div>
  );
}

// ============================================
// 5. VISUAL REGRESSION ENGINE
// ============================================
interface RegressionPoint { x: number; y: number; z: number; weight: number }

// Deterministic illustrative observations scattered around y = 0.3x + 0.1z.
// `weight` doubles as the WLS weight (∝ √market cap) and the sphere radius.
const REGRESSION_POINTS: RegressionPoint[] = Array.from({ length: 80 }, (_, i) => {
  const x = (deterministicUnit(i * 5 + 101) - 0.5) * 30;
  const z = (deterministicUnit(i * 5 + 131) - 0.5) * 30;
  const weight = 0.2 + deterministicUnit(i * 5 + 167) * 0.6;
  const y = 0.3 * x + 0.1 * z + (deterministicUnit(i * 5 + 193) - 0.5) * 6;
  return { x, y, z, weight };
});

function det3(m: number[]) {
  return (
    m[0] * (m[4] * m[8] - m[5] * m[7]) -
    m[1] * (m[3] * m[8] - m[5] * m[6]) +
    m[2] * (m[3] * m[7] - m[4] * m[6])
  );
}

/** Weighted least squares for y = a·x + b·z + c via the 3×3 normal equations. */
function fitPlaneWLS(points: RegressionPoint[]) {
  let Sw = 0, Sx = 0, Sz = 0, Sxx = 0, Sxz = 0, Szz = 0, Sy = 0, Sxy = 0, Szy = 0;
  for (const p of points) {
    const w = p.weight;
    Sw += w; Sx += w * p.x; Sz += w * p.z;
    Sxx += w * p.x * p.x; Sxz += w * p.x * p.z; Szz += w * p.z * p.z;
    Sy += w * p.y; Sxy += w * p.x * p.y; Szy += w * p.z * p.y;
  }
  const D = det3([Sxx, Sxz, Sx, Sxz, Szz, Sz, Sx, Sz, Sw]);
  const a = det3([Sxy, Sxz, Sx, Szy, Szz, Sz, Sy, Sz, Sw]) / D;
  const b = det3([Sxx, Sxy, Sx, Sxz, Szy, Sz, Sx, Sy, Sw]) / D;
  const c = det3([Sxx, Sxz, Sxy, Sxz, Szz, Szy, Sx, Sz, Sy]) / D;
  const ybar = Sy / Sw;
  let ssRes = 0, ssTot = 0;
  for (const p of points) {
    const f = a * p.x + b * p.z + c;
    ssRes += p.weight * (p.y - f) ** 2;
    ssTot += p.weight * (p.y - ybar) ** 2;
  }
  return { a, b, c, r2: 1 - ssRes / ssTot, cx: Sx / Sw, cz: Sz / Sw, n: points.length };
}

const REGRESSION_FIT = fitPlaneWLS(REGRESSION_POINTS);
// PlaneGeometry faces +z; rotate it so its normal matches the fitted surface's normal (-a, 1, -b).
const FIT_PLANE_QUATERNION = new THREE.Quaternion().setFromUnitVectors(
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(-REGRESSION_FIT.a, 1, -REGRESSION_FIT.b).normalize()
);
const FIT_PLANE_CENTER: [number, number, number] = [
  REGRESSION_FIT.cx,
  REGRESSION_FIT.a * REGRESSION_FIT.cx + REGRESSION_FIT.b * REGRESSION_FIT.cz + REGRESSION_FIT.c,
  REGRESSION_FIT.cz,
];

function RegressionPlot() {
  return (
    <group position={[0, -5, 0]}>
       <mesh position={FIT_PLANE_CENTER} quaternion={FIT_PLANE_QUATERNION}>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color={COLORS.emerald} transparent opacity={0.15} side={THREE.DoubleSide} />
       </mesh>
       {REGRESSION_POINTS.map((p, i) => (
         <mesh key={i} position={[p.x, p.y, p.z]}>
            <sphereGeometry args={[p.weight, 16, 16]} />
            <meshStandardMaterial color={COLORS.cyan} emissive={COLORS.cyan} emissiveIntensity={0.5} />
         </mesh>
       ))}
       <gridHelper args={[50, 10, COLORS.slate, COLORS.bg]} position={[0, -10, 0]} />
    </group>
  );
}

const REGRESSION_TABS = ["code", "console", "visual"] as const;
type RegressionTab = (typeof REGRESSION_TABS)[number];

export function LiveRegression() {
  const [activeTab, setActiveTab] = useState<RegressionTab>("code");
  const [isExecuting, setIsExecuting] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();
  const rotate = useRotateGate();
  const fit = REGRESSION_FIT;

  const runCode = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsExecuting(true); setActiveTab("console"); setProgress(0);
    intervalRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsExecuting(false); setActiveTab("visual"); return 100;
        }
        return p + 10;
      });
    }, 80);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const onTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = REGRESSION_TABS.indexOf(activeTab);
    let next: number | null = null;
    if (e.key === "ArrowRight") next = (idx + 1) % REGRESSION_TABS.length;
    else if (e.key === "ArrowLeft") next = (idx - 1 + REGRESSION_TABS.length) % REGRESSION_TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = REGRESSION_TABS.length - 1;
    if (next === null) return;
    e.preventDefault();
    setActiveTab(REGRESSION_TABS[next]);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="barra-viz-container !bg-[#050508] border-emerald-500/20 overflow-hidden min-h-[450px]">
       <div className="barra-viz-header !bg-black/60 border-b border-white/10 flex flex-wrap justify-between items-center gap-3 px-4 md:px-6 py-3">
         <div className="flex items-center gap-3">
            <div className="flex gap-1.5" aria-hidden="true">
               <div className="w-2 h-2 rounded-full bg-rose-500/50" />
               <div className="w-2 h-2 rounded-full bg-amber-500/50" />
               <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
            </div>
            <h3 className="font-mono text-xs text-slate-400 uppercase tracking-widest font-black m-0">wls_optimizer.exe</h3>
         </div>
         <div className="flex gap-3 items-center flex-wrap justify-end">
            <div
              role="tablist"
              aria-label="Regression views"
              onKeyDown={onTabKeyDown}
              className="flex p-1 bg-white/5 rounded-lg max-w-full overflow-x-auto no-scrollbar"
            >
               {REGRESSION_TABS.map((t, i) => (
                 <button
                   type="button"
                   role="tab"
                   key={t}
                   id={`${baseId}-tab-${t}`}
                   aria-selected={activeTab === t}
                   aria-controls={`${baseId}-panel-${t}`}
                   tabIndex={activeTab === t ? 0 : -1}
                   ref={(el) => { tabRefs.current[i] = el; }}
                   onClick={() => setActiveTab(t)}
                   className={cn(
                     "min-h-10 px-3 rounded-md text-xs font-black uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400",
                     activeTab === t ? "bg-emerald-500 text-black shadow-lg" : "text-slate-500 hover:text-slate-300"
                   )}
                 >{t}</button>
               ))}
            </div>
            <button
              type="button"
              onClick={runCode}
              disabled={isExecuting}
              className="min-h-11 px-4 rounded-lg bg-emerald-500 text-black text-xs font-black uppercase tracking-widest hover:bg-emerald-400 transition-colors active:scale-95 disabled:opacity-50 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            >
              {isExecuting ? <Activity className="w-3 h-3 animate-spin" aria-hidden="true" /> : <Maximize2 className="w-3 h-3" aria-hidden="true" />}
              {isExecuting ? "FITTING" : "RUN FIT"}
            </button>
         </div>
       </div>

       <div className="relative h-[400px]">
          <AnimatePresence mode="wait">
             {activeTab === "code" && (
               <motion.div
                 key="code"
                 role="tabpanel"
                 id={`${baseId}-panel-code`}
                 aria-labelledby={`${baseId}-tab-code`}
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="p-8 font-mono text-xs leading-relaxed overflow-x-auto h-full"
               >
                  <pre className="text-emerald-400/70"><code>{`// Weighted Least Squares Factor Regression
async function solveFactorReturns(R, X, W) {
  const XT = Matrix.transpose(X);
  const XTW = Matrix.multiply(XT, W);
  
  // Normal Equations: (X'WX)f = X'WR
  const LHS = Matrix.multiply(XTW, X);
  const RHS = Matrix.multiply(XTW, R);
  
  return Matrix.solve(LHS, RHS);
}`}</code></pre>
               </motion.div>
             )}
             {activeTab === "console" && (
               <motion.div
                 key="console"
                 role="tabpanel"
                 id={`${baseId}-panel-console`}
                 aria-labelledby={`${baseId}-tab-console`}
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="p-6 md:p-10 font-mono text-xs space-y-4 h-full bg-black/40 overflow-y-auto"
               >
                  <div className="flex gap-2 text-slate-500">
                     <span className="text-emerald-500 font-black" aria-hidden="true">❯</span>
                     <span>Loading {fit.n} illustrative observations (weights ∝ √market cap)...</span>
                  </div>
                  <div className="flex gap-2 text-slate-500">
                     <span className="text-emerald-500 font-black" aria-hidden="true">❯</span>
                     <span>Solving normal equations (X&apos;WX) f = X&apos;WR for f = [a, b, c]...</span>
                  </div>
                  <div className="mt-8">
                     <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.6)]" />
                     </div>
                     <div className="text-xs text-slate-600 mt-2">Progress bar is illustrative timing; the fit itself is computed once from the points.</div>
                  </div>
                  {progress === 100 && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mt-6 text-emerald-400 space-y-1">
                       <div className="flex items-center gap-2 font-black tracking-widest uppercase"><Shield className="w-3 h-3" aria-hidden="true" /> Fit complete</div>
                       <div className="text-emerald-300/90">y = {fit.a.toFixed(3)}·x + {fit.b.toFixed(3)}·z {fit.c >= 0 ? "+" : "−"} {Math.abs(fit.c).toFixed(3)}</div>
                       <div className="text-emerald-300/70">weighted R² = {fit.r2.toFixed(3)} · n = {fit.n}</div>
                    </div>
                  )}
               </motion.div>
             )}
             {activeTab === "visual" && (
               <motion.div
                 key="visual"
                 role="tabpanel"
                 id={`${baseId}-panel-visual`}
                 aria-labelledby={`${baseId}-tab-visual`}
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="absolute inset-0"
               >
                  <div className="absolute inset-0" aria-hidden="true">
                    <Canvas camera={{ position: [30, 20, 30], fov: 40 }} frameloop="demand">
                       <ambientLight intensity={0.5} />
                       <pointLight position={[10, 10, 10]} />
                       <RegressionPlot />
                       <OrbitControls enableZoom={false} enablePan={false} enableRotate={rotate.rotateAllowed} />
                       <CanvasTouchAction value={rotate.touchAction} />
                    </Canvas>
                  </div>
                  <div className="absolute top-4 right-4 md:top-6 md:right-6 flex flex-col gap-2 pointer-events-none">
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 rounded-lg border border-white/5 backdrop-blur-md">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                        <span className="text-xs font-black text-white uppercase tracking-widest">WLS fit plane · y = {fit.a.toFixed(2)}x + {fit.b.toFixed(2)}z</span>
                     </div>
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 rounded-lg border border-white/5 backdrop-blur-md">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" aria-hidden="true" />
                        <span className="text-xs font-black text-white uppercase tracking-widest">Illustrative observations · size ∝ weight</span>
                     </div>
                  </div>
                  {rotate.coarse && (
                    <RotateToggle on={rotate.rotateOn} onToggle={rotate.toggle} className="absolute bottom-3 right-3 z-10" />
                  )}
               </motion.div>
             )}
          </AnimatePresence>
       </div>
    </div>
  );
}
