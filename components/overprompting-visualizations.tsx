"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, AlertTriangle, CheckCircle2, Info, Target, Minimize2, Maximize2, ChevronRight, RotateCcw } from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, PerspectiveCamera, Stars } from "@react-three/drei";
import * as THREE from "three";

// Constraint labels for visualization
const CONSTRAINT_LABELS = [
  "Facial likeness must be instantly recognizable",
  "Pose and orientation must match exactly",
  "Clothing must be identical to reference",
  "No beard if the target is clean-shaven",
  "Skin tone and lighting must be realistic",
  "Background must match the original scene",
];

const CONSTRAINT_IMPACT = [
  "−40% search space",
  "−25% remaining",
  "−20% remaining",
  "−15% remaining",
  "−10% remaining",
  "−5% remaining",
];

const HUD_LABELS = [
  "LIKENESS_LOCK_V2",
  "POSE_MATCH_STRICT",
  "CLOTHING_SYNC_ID",
  "BEARD_LOGIC_CHK",
  "LIGHTING_FIX_REL",
  "BG_MATCH_SCENE"
];

// ============================================================
// 1. CONSTRAINT VISUALIZATION (3D)
// Shows how adding constraints narrows the creative search space
// ============================================================

function ParticleCloud({ level }: { level: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 1500;
  
  const { positions, originalPositions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const orig = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const color = new THREE.Color();
    
    for (let i = 0; i < count; i++) {
      // Create a sphere of particles
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.5 * Math.pow(Math.random(), 1/3);
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      
      orig[i * 3] = x;
      orig[i * 3 + 1] = y;
      orig[i * 3 + 2] = z;
      
      // Warm palette
      const hue = 0.05 + Math.random() * 0.1; // Amber/Orange
      color.setHSL(hue, 0.8, 0.5 + Math.random() * 0.2);
      cols[i * 3] = color.r;
      cols[i * 3 + 1] = color.g;
      cols[i * 3 + 2] = color.b;
    }
    return { positions: pos, originalPositions: orig, colors: cols };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    const posAttr = pointsRef.current.geometry.attributes.position;
    
    // Collapse factor based on level (0 to 6)
    // Level 0: Sphere
    // Level 3: Disk
    // Level 5: Line
    // Level 6: Point
    const collapseX = Math.pow(0.15, level / 6);
    const collapseY = Math.pow(0.05, level / 6);
    const collapseZ = Math.pow(0.1, level / 6);
    
    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;
      
      // Target position
      const tx = originalPositions[ix] * collapseX;
      const ty = originalPositions[iy] * collapseY;
      const tz = originalPositions[iz] * collapseZ;
      
      // Add some "vibration" as they get squeezed
      const noise = level > 0 ? Math.sin(time * 10 + i) * (level * 0.01) : 0;
      
      posAttr.array[ix] += (tx - posAttr.array[ix]) * 0.1;
      posAttr.array[iy] += (ty - posAttr.array[iy]) * 0.1 + noise;
      posAttr.array[iz] += (tz - posAttr.array[iz]) * 0.1;
    }
    
    posAttr.needsUpdate = true;
    pointsRef.current.rotation.y = time * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
      />
    </points>
  );
}

export function ConstraintViz() {
  const [level, setLevel] = useState(0);
  const visiblePct = Math.max(5, Math.round(100 * Math.pow(0.2, level / 6)));

  return (
    <div className="relative overflow-hidden group">
      <div className="op-viz-header">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-white tracking-tight m-0 flex items-center gap-2">
              <Minimize2 className="w-5 h-5 text-amber-400" />
              The Constraint Paradox
            </h3>
            <p className="text-sm text-slate-400 m-0 mt-1">
              Adding constraints collapses the model&rsquo;s creative search space.
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end">
             <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Creative Freedom</span>
             <span className="text-xl font-mono font-bold text-amber-400 tabular-nums">{visiblePct}%</span>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 py-6 md:py-8">
        {/* 3D Canvas + HUD */}
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl bg-[#050508] border border-white/5 overflow-hidden shadow-2xl">
          <Canvas gl={{ alpha: true }}>
            <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
              <ParticleCloud level={level} />
            </Float>
          </Canvas>

          {/* HUD Overlay */}
          <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
            {/* Top Bar */}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="h-px w-12 bg-amber-500/50" />
                <span className="text-[10px] font-mono text-amber-500/50 uppercase tracking-tighter">Latent Space Analysis</span>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-mono text-slate-500 uppercase">State</div>
                <div className="text-xs font-bold text-white uppercase tracking-widest">
                  {level === 0 ? "Infinite" : level < 3 ? "Restricted" : level < 5 ? "Compressed" : "Singularity"}
                </div>
              </div>
            </div>

            {/* Center Warning */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <motion.div 
                 animate={{ opacity: level > 4 ? 1 : 0, scale: level > 4 ? 1 : 0.9 }}
                 className="px-4 py-2 bg-rose-500/20 border border-rose-500/40 rounded-full backdrop-blur-md"
               >
                 <span className="text-[10px] font-bold text-rose-400 uppercase tracking-[0.2em] flex items-center gap-2">
                   <AlertTriangle className="w-3 h-3" /> Warning: Creative Singularity
                 </span>
               </motion.div>
            </div>

            {/* Bottom System Log */}
            <div className="flex justify-between items-end">
              <div className="font-mono text-[9px] md:text-[10px] space-y-1.5 max-w-[200px]">
                <div className="text-slate-600 uppercase tracking-widest mb-2">Active Protocols</div>
                <AnimatePresence>
                  {level === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-slate-500 italic"
                    >
                      &gt; System open...
                    </motion.div>
                  ) : (
                    HUD_LABELS.slice(0, level).slice(-3).map((label) => {
                      const idx = HUD_LABELS.indexOf(label);
                      return (
                        <motion.div
                          key={label}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2 text-amber-400/80"
                        >
                          <span>&gt;</span>
                          <span className="opacity-70">{label}</span>
                          <span className="text-rose-400 ml-auto">{CONSTRAINT_IMPACT[idx]}</span>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Unified Controls Toolbar */}
        <div className="mt-6 p-1 bg-white/5 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center gap-6 md:gap-8 pr-2 pl-6 py-2">
          {/* Progress Bar Section */}
          <div className="w-full flex items-center gap-4 py-2 md:py-0">
            <span className="text-xs font-mono text-slate-400 shrink-0 uppercase tracking-wider">Potential</span>
            <div className="h-1.5 flex-grow rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500"
                animate={{ width: `${visiblePct}%` }}
                transition={{ type: "spring", stiffness: 50, damping: 20 }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 tabular-nums shrink-0">{visiblePct}%</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 w-full md:w-auto shrink-0">
            <button
              type="button"
              className="op-btn-action flex-grow md:flex-grow-0 flex items-center justify-center gap-2 group/btn px-6"
              onClick={() => setLevel((l) => Math.min(l + 1, 6))}
              disabled={level >= 6}
            >
              <Minimize2 className="w-3 h-3 group-hover/btn:scale-125 transition-transform" />
              ADD
            </button>
            <button
              type="button"
              className="op-btn-secondary flex-grow md:flex-grow-0 flex items-center justify-center gap-2 px-4"
              onClick={() => setLevel((l) => Math.max(l - 1, 0))}
              disabled={level <= 0}
              aria-label="Remove constraint"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
            <button
              type="button"
              className="op-btn-secondary w-10 flex items-center justify-center"
              onClick={() => setLevel(0)}
              disabled={level === 0}
              aria-label="Reset"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 2. QUALITY CURVE VISUALIZATION
// Shows the inverted-U relationship: prompt detail vs quality
// ============================================================

const CURVE_W = 600;
const CURVE_H = 350;
const CURVE_PAD = { top: 40, right: 40, bottom: 60, left: 60 } as const;
const CURVE_PLOT_W = CURVE_W - CURVE_PAD.left - CURVE_PAD.right;
const CURVE_PLOT_H = CURVE_H - CURVE_PAD.top - CURVE_PAD.bottom;

const ZONE_INFO = {
  vague: {
    title: "Underspecified",
    desc: "The model lacks context and resorts to generic patterns.",
    icon: Info,
    color: "#f59e0b",
  },
  sweet: {
    title: "The Sweet Spot",
    desc: "Perfect balance of intent and creative freedom.",
    icon: CheckCircle2,
    color: "#10b981",
  },
  over: {
    title: "Overprompted",
    desc: "Constraints conflict; the model enters 'Ninja' mode to survive.",
    icon: AlertTriangle,
    color: "#f43f5e",
  }
};

export function QualityCurveViz() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [drawn, setDrawn] = useState(false);
  const [hoverX, setHoverX] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (svgRef.current) observer.observe(svgRef.current);
    return () => observer.disconnect();
  }, []);

  const getQualityAtX = (x: number) => {
    const t = Math.max(0, Math.min(1, x));
    return Math.exp(-((t - 0.3) ** 2) / (2 * 0.06)) * 0.9 + 0.05;
  };

  const curvePoints = useMemo(() => {
    const pts: Array<{ x: number; y: number }> = [];
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      pts.push({ x: t, y: getQualityAtX(t) });
    }
    return pts;
  }, []);

  const toSVG = (x: number, y: number) => ({
    sx: CURVE_PAD.left + x * CURVE_PLOT_W,
    sy: CURVE_PAD.top + (1 - y) * CURVE_PLOT_H,
  });

  const pathD = useMemo(
    () =>
      curvePoints
        .map((p, i) => {
          const { sx, sy } = toSVG(p.x, p.y);
          return `${i === 0 ? "M" : "L"} ${sx} ${sy}`;
        })
        .join(" "),
    [curvePoints]
  );

  const zones = [
    { type: "vague" as const, start: 0, end: 0.15, color: "rgba(245,158,11,0.05)" },
    { type: "sweet" as const, start: 0.15, end: 0.45, color: "rgba(16,185,129,0.05)" },
    { type: "over" as const, start: 0.45, end: 1, color: "rgba(244,63,94,0.05)" },
  ];

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const plotX = (x * CURVE_W - CURVE_PAD.left) / CURVE_PLOT_W;
    if (plotX >= 0 && plotX <= 1) setHoverX(plotX);
    else setHoverX(null);
  };

  const currentZone = hoverX === null ? null : 
    hoverX < 0.15 ? "vague" : hoverX < 0.45 ? "sweet" : "over";

  return (
    <div>
      <div className="op-viz-header">
        <h3 className="text-lg md:text-xl font-bold text-white tracking-tight m-0 flex items-center gap-2">
          <Target className="w-5 h-5 text-amber-400" />
          The Quality Curve
        </h3>
        <p className="text-sm text-slate-400 m-0">
          Output quality peaks with moderate guidance, then drops as constraints pile up.
        </p>
      </div>

      <div className="px-4 md:px-6 py-8">
        <div className="relative bg-[#050508] rounded-2xl border border-white/5 overflow-hidden p-2">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${CURVE_W} ${CURVE_H}`}
            className="w-full h-auto cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverX(null)}
          >
            {/* Zones */}
            {zones.map((z) => {
              const x1 = CURVE_PAD.left + z.start * CURVE_PLOT_W;
              const x2 = CURVE_PAD.left + z.end * CURVE_PLOT_W;
              return (
                <rect
                  key={z.type}
                  x={x1}
                  y={CURVE_PAD.top}
                  width={x2 - x1}
                  height={CURVE_PLOT_H}
                  fill={z.color}
                />
              );
            })}

            {/* Axes */}
            <g stroke="rgba(255,255,255,0.1)" strokeWidth="1">
              <line x1={CURVE_PAD.left} y1={CURVE_H - CURVE_PAD.bottom} x2={CURVE_W - CURVE_PAD.right} y2={CURVE_H - CURVE_PAD.bottom} />
              <line x1={CURVE_PAD.left} y1={CURVE_PAD.top} x2={CURVE_PAD.left} y2={CURVE_H - CURVE_PAD.bottom} />
            </g>

            {/* Labels */}
            <text x={CURVE_PAD.left - 10} y={CURVE_PAD.top} fill="#475569" fontSize="10" textAnchor="end" fontFamily="monospace">HIGH</text>
            <text x={CURVE_PAD.left - 10} y={CURVE_H - CURVE_PAD.bottom} fill="#475569" fontSize="10" textAnchor="end" fontFamily="monospace">LOW</text>
            <text x={CURVE_W / 2} y={CURVE_H - 10} fill="#475569" fontSize="10" textAnchor="middle" fontFamily="monospace" letterSpacing="0.2em">PROMPT SPECIFICITY &rarr;</text>

            <path
              d={pathD}
              fill="none"
              stroke="url(#curveGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              style={{
                strokeDasharray: 2000,
                strokeDashoffset: drawn ? 0 : 2000,
                transition: "stroke-dashoffset 2s ease-out",
              }}
            />

            {/* Dynamic Glow */}
            <AnimatePresence>
              {hoverX !== null && (
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.line 
                    x1={toSVG(hoverX, 0).sx} 
                    y1={CURVE_PAD.top} 
                    x2={toSVG(hoverX, 0).sx} 
                    y2={CURVE_H - CURVE_PAD.bottom} 
                    stroke="rgba(255,255,255,0.1)" 
                    strokeDasharray="4 4" 
                  />
                  <circle 
                    cx={toSVG(hoverX, getQualityAtX(hoverX)).sx} 
                    cy={toSVG(hoverX, getQualityAtX(hoverX)).sy} 
                    r="6" 
                    fill="white" 
                    className="shadow-xl"
                  />
                </motion.g>
              )}
            </AnimatePresence>

            {/* Peak Marker */}
            <g transform={`translate(${toSVG(0.3, getQualityAtX(0.3)).sx}, ${toSVG(0.3, getQualityAtX(0.3)).sy})`} key="peak-marker">
              <circle r="12" fill="#10b981" opacity="0.1" className="animate-pulse" />
              <circle r="4" fill="#10b981" />
            </g>

            <defs>
              <linearGradient id="curveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="30%" stopColor="#10b981" />
                <stop offset="60%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>
          </svg>

          {/* Floating Zone Info */}
          <div className="absolute top-4 right-4 w-48 pointer-events-none">
            <AnimatePresence mode="wait">
              {currentZone ? (
                <motion.div
                  key={currentZone}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-2xl"
                >
                  <div className="flex items-center gap-2 mb-1">
                    {(() => {
                      const Icon = ZONE_INFO[currentZone].icon;
                      return <Icon className="w-3 h-3" style={{ color: ZONE_INFO[currentZone].color }} />;
                    })()}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                      {ZONE_INFO[currentZone].title}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {ZONE_INFO[currentZone].desc}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
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

  return (
    <div>
      <div className="op-viz-header">
        <h3 className="text-lg md:text-xl font-bold text-white tracking-tight m-0 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          The Two-Phase Approach
        </h3>
        <p className="text-sm text-slate-400 m-0">
          Be open during planning, precise during execution.
        </p>
      </div>

      <div className="px-4 md:px-6 py-8">
        {/* Toggle Controls */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-xl">
            <button
              onClick={() => setPhase("plan")}
              className={`relative px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
                phase === "plan" ? "text-amber-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {phase === "plan" && (
                <motion.div layoutId="phase-bg" className="absolute inset-0 bg-amber-500/10 border border-amber-500/20 rounded-xl" />
              )}
              <span className="relative z-10">1. Planning</span>
            </button>
            <button
              onClick={() => setPhase("execute")}
              className={`relative px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
                phase === "execute" ? "text-rose-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {phase === "execute" && (
                <motion.div layoutId="phase-bg" className="absolute inset-0 bg-rose-500/10 border border-rose-500/20 rounded-xl" />
              )}
              <span className="relative z-10">2. Execution</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          {/* Phase Illustration */}
          <div className="lg:col-span-2 relative aspect-square bg-[#050508] rounded-3xl border border-white/5 overflow-hidden flex items-center justify-center p-8">
            <AnimatePresence mode="wait">
              {phase === "plan" ? (
                <motion.div
                  key="plan-viz"
                  initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 1.2, rotate: 10 }}
                  className="relative w-full h-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-3xl" />
                  <div className="relative w-full h-full border-2 border-dashed border-amber-500/20 rounded-full animate-[spin_20s_linear_infinite] flex items-center justify-center">
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                      <div 
                        key={deg} 
                        className="absolute w-2 h-2 bg-amber-400 rounded-full"
                        style={{ transform: `rotate(${deg}deg) translateY(-80px)` }}
                      />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-amber-400 text-center">
                      <Maximize2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <span className="text-[10px] font-mono tracking-widest uppercase">Wide Intent</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="execute-viz"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  className="relative w-full h-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-transparent rounded-full blur-3xl" />
                  <div className="relative w-full h-full grid grid-cols-4 grid-rows-4 gap-2">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="bg-rose-500/20 border border-rose-500/40 rounded-sm"
                      />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-rose-400 text-center bg-[#050508]/80 backdrop-blur-sm p-4 rounded-2xl border border-rose-500/30">
                      <Minimize2 className="w-8 h-8 mx-auto mb-2" />
                      <span className="text-[10px] font-mono tracking-widest uppercase">Precise Steps</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Phase Content */}
          <div className="lg:col-span-3 space-y-6">
            <AnimatePresence mode="wait">
              {phase === "plan" ? (
                <motion.div
                  key="plan-content"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <span className="text-amber-400 font-mono text-[10px] uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">Planning Mode</span>
                    <h4 className="text-2xl font-bold text-white mt-4">Focus on the &ldquo;What&rdquo; and &ldquo;Why&rdquo;</h4>
                    <p className="text-slate-400 mt-2 leading-relaxed">During the planning phase, you want the model to act as a world-class architect. Avoid implementation details to give it maximum degrees of freedom.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { title: "High-level goals", icon: Target },
                      { title: "Purpose and intent", icon: Info },
                      { title: "Target experience", icon: Zap },
                      { title: "Core constraints", icon: Minimize2 },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:bg-amber-500/[0.03] hover:border-amber-500/20 transition-colors">
                        <item.icon className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium text-slate-300">{item.title}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl italic text-xs text-amber-300/60">
                    &ldquo;I want a system that helps me organize my thoughts without being intrusive.&rdquo;
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="execute-content"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <span className="text-rose-400 font-mono text-[10px] uppercase tracking-widest bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">Execution Mode</span>
                    <h4 className="text-2xl font-bold text-white mt-4">Focus on the &ldquo;How&rdquo;</h4>
                    <p className="text-slate-400 mt-2 leading-relaxed">Once the plan is solidified, flip the switch. Provide extremely specific, step-by-step instructions that leave no room for ambiguity.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { title: "Scoped Epics", icon: CheckCircle2 },
                      { title: "Acceptance Criteria", icon: Target },
                      { title: "Tech Stack Rules", icon: Info },
                      { title: "Step-by-step logic", icon: ChevronRight },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:bg-rose-500/[0.03] hover:border-rose-500/20 transition-colors">
                        <item.icon className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium text-slate-300">{item.title}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl italic text-xs text-rose-300/60">
                    &ldquo;Use Framer Motion for the enter transition, with a duration of 0.5s and ease-out easing.&rdquo;
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pro-Tip */}
            <div className="mt-8 p-5 bg-white/[0.03] border border-white/10 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Target className="w-12 h-12 text-amber-400" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">Pro Tip: The Flip</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Start with a <span className="text-amber-200">Phase 1</span> prompt to get the architecture right. Once you approve the plan, ask the model to &ldquo;Transform this plan into a Phase 2 implementation spec&rdquo; and use <em>that</em> for the actual build.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
