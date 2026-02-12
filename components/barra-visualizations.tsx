"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Text, MeshWobbleMaterial, Stars } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, TrendingDown, Zap, Terminal, Shield, Activity, Maximize2, Layers } from "lucide-react";
import { BarraJargon } from "./barra-jargon";
import { useDeviceCapabilities } from "@/hooks/use-mobile-optimizations";

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

// ============================================
// 1. RISK TOPOGRAPHY (Hero)
// ============================================
function RiskLandscape() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { capabilities } = useDeviceCapabilities();
  const resolution = capabilities.tier === "low" ? 48 : 96;

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const posAttr = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const t = clock.getElapsedTime();
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      const h = Math.sin(x * 0.1 + t) * Math.cos(z * 0.1 + t * 0.5) * 3 +
                Math.sin(x * 0.05 - t * 0.3) * 5 +
                Math.cos(z * 0.08 + t * 0.2) * 2;
      posAttr.setY(i, h);
    }
    posAttr.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -20, 0]}>
      <planeGeometry args={[200, 200, resolution, resolution]} />
      <meshStandardMaterial 
        color={COLORS.emerald} 
        wireframe 
        transparent 
        opacity={0.1} 
        emissive={COLORS.emerald}
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

function ScanningBeam() {
  const beamRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!beamRef.current) return;
    beamRef.current.position.z = Math.sin(clock.getElapsedTime() * 0.4) * 80;
  });

  return (
    <mesh ref={beamRef} position={[0, -18, 0]}>
      <boxGeometry args={[250, 0.2, 1]} />
      <meshBasicMaterial color={COLORS.cyan} transparent opacity={0.3} />
    </mesh>
  );
}

export function FactorHero() {
  return (
    <div className="absolute inset-0 z-0 opacity-60">
      <Canvas camera={{ position: [0, 30, 90], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[20, 30, 20]} intensity={1} color={COLORS.cyan} />
        <RiskLandscape />
        <ScanningBeam />
        <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.4}>
           <group position={[0, 10, 0]}>
              {[
                { name: "MOMENTUM", pos: [-55, 15, -10], color: COLORS.cyan },
                { name: "VALUE", pos: [55, -5, 20], color: COLORS.amber },
                { name: "GROWTH", pos: [10, 25, -30], color: COLORS.emerald },
                { name: "SIZE", pos: [-35, -20, 45], color: COLORS.purple },
              ].map((f, i) => (
                <Text
                  key={i}
                  position={f.pos as any}
                  fontSize={4}
                  color={f.color}
                  anchorX="center"
                  anchorY="middle"
                  fontStyle="italic"
                  outlineWidth={0.2}
                  outlineColor="#000000"
                >
                  {f.name}
                </Text>
              ))}
           </group>
        </Float>
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      </Canvas>
    </div>
  );
}

// ============================================
// 2. FORENSIC PRISM (Return Decomposition)
// ============================================
function ForensicCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.5;
  });
  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[8, 0]} />
      <meshStandardMaterial color={COLORS.white} transparent opacity={0.05} wireframe />
    </mesh>
  );
}

function PrismSplinter({ factor, index }: { factor: any, index: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const angle = (index / 5) * Math.PI * 2;
  
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.z = t * 0.2 + index;
    const s = 1 + Math.sin(t * 2 + index) * 0.1;
    groupRef.current.scale.set(s, s, s);
  });

  return (
    <group ref={groupRef}>
      <line>
        <bufferGeometry attach="geometry">
          <float32BufferAttribute attach="attributes-position" args={[new Float32Array([0, 0, 0, 15, 0, 0]), 3]} />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color={factor.color} linewidth={2} transparent opacity={0.6} />
      </line>
      <mesh position={[15, 0, 0]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshBasicMaterial color={factor.color} />
      </mesh>
    </group>
  );
}

export function ReturnDecomposition() {
  const [activeStock, setActiveStock] = useState("NVDA");
  
  const stocks = {
    NVDA: { market: 0.15, momentum: 0.65, value: -0.1, growth: 0.4, specific: 0.25, total: 1.35, desc: "Factor-driven explosive growth profile." },
    JPM: { market: 0.25, momentum: 0.05, value: 0.4, growth: -0.05, specific: 0.1, total: 0.75, desc: "Stable value core with market sensitivity." },
    TSLA: { market: 0.2, momentum: 0.3, value: -0.2, growth: 0.5, specific: 0.65, total: 1.45, desc: "High idiosyncratic 'story stock' volatility." },
    WMT: { market: 0.1, momentum: 0.15, value: 0.2, growth: 0.05, specific: 0.05, total: 0.55, desc: "Defensive giant, low factor sensitivity." },
  };

  const data = stocks[activeStock as keyof typeof stocks];
  const factors = [
    { name: "Market", val: data.market, color: COLORS.blue },
    { name: "Momentum", val: data.momentum, color: COLORS.cyan },
    { name: "Value", val: data.value, color: COLORS.amber },
    { name: "Growth", val: data.growth, color: COLORS.emerald },
    { name: "Idiosyncratic", val: data.specific, color: COLORS.purple },
  ];

  return (
    <div className="barra-viz-container overflow-hidden">
      <div className="barra-viz-header flex flex-wrap justify-between items-center bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h4 className="font-black text-white uppercase tracking-widest text-[10px]">Forensic Return Prism</h4>
        </div>
        <div className="flex gap-1">
          {Object.keys(stocks).map(s => (
            <button 
              key={s} onClick={() => setActiveStock(s)}
              className={`px-3 py-1 rounded-md text-[9px] font-black transition-all ${activeStock === s ? "bg-emerald-500 text-black" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[450px]">
        <div className="relative bg-black/20 border-r border-white/5 h-[300px] lg:h-auto">
           <Canvas camera={{ position: [0, 0, 40], fov: 40 }}>
              <ambientLight intensity={0.5} />
              <ForensicCore />
              <group>
                 {factors.map((f, i) => (
                   <PrismSplinter key={f.name} factor={f} index={i} />
                 ))}
              </group>
              <OrbitControls enableZoom={false} />
           </Canvas>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <Zap className="w-6 h-6 text-white/20 animate-pulse" />
           </div>
        </div>

        <div className="p-8 md:p-12 space-y-8 flex flex-col justify-center bg-gradient-to-br from-transparent to-emerald-500/5">
          <AnimatePresence mode="wait">
            <motion.div key={activeStock} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="flex items-end gap-4 mb-2">
                 <div className="text-6xl font-black text-white tracking-tighter">{(data.total * 100).toFixed(0)}%</div>
                 <div className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold mb-3">Net Return</div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed border-l-2 border-emerald-500/30 pl-6 italic">&ldquo;{data.desc}&rdquo;</p>
              
              <div className="space-y-4 pt-4">
                {factors.map((f) => (
                  <div key={f.name} className="group">
                    <div className="flex justify-between text-[10px] font-mono uppercase mb-2">
                      <BarraJargon term={f.name === "Idiosyncratic" ? "idiosyncratic-risk" : f.name.toLowerCase()}>
                        <span className="text-slate-500 group-hover:text-slate-300 transition-colors">{f.name} Contribution</span>
                      </BarraJargon>
                      <span className={f.val >= 0 ? "text-emerald-400" : "text-rose-400"}>{(f.val * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(5, Math.abs(f.val / 1.5) * 100)}%` }}
                        className="h-full relative" style={{ backgroundColor: f.color, marginLeft: f.val < 0 ? "auto" : "0", marginRight: f.val > 0 ? "auto" : "0" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
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
function LeverageTower({ leverage, loss }: { leverage: number, loss: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const segments = Math.max(1, Math.ceil(leverage));
  
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const stress = (leverage * loss) / 50;
    groupRef.current.children.forEach((child, i) => {
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
          <meshStandardMaterial color={COLORS.cyan} emissive={leverage * loss > 25 ? COLORS.rose : COLORS.cyan} emissiveIntensity={Math.min(2, (leverage * loss) / 25)} transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

export function PodSimulator() {
  const [leverage, setLeverage] = useState(6);
  const [loss, setLoss] = useState(5);
  const lpLoss = Math.round(leverage * loss);
  const status = lpLoss >= 50 ? "CRITICAL" : lpLoss >= 25 ? "WARNING" : "STABLE";

  return (
    <div className="barra-viz-container overflow-hidden bg-slate-950">
       <div className="barra-viz-header flex justify-between items-center bg-black/60">
          <div className="flex items-center gap-3">
             <Shield className={`w-5 h-5 ${lpLoss > 25 ? "text-rose-500 animate-pulse" : "text-emerald-500"}`} />
             <h4 className="font-black text-white uppercase tracking-[0.2em] text-[10px]">Structural Integrity Test</h4>
          </div>
          <div className={`px-4 py-1 rounded-full border text-[9px] font-black tracking-widest ${lpLoss >= 50 ? "bg-rose-500/20 border-rose-500 text-rose-500" : lpLoss >= 25 ? "bg-amber-500/20 border-amber-500 text-amber-500" : "bg-emerald-500/20 border-emerald-500 text-emerald-500"}`}>
             {status}
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[400px]">
          <div className="lg:col-span-2 relative bg-black/40 h-[300px] lg:h-auto">
             <Canvas camera={{ position: [40, 20, 60], fov: 45 }}>
                <ambientLight intensity={0.4} />
                <pointLight position={[20, 20, 20]} intensity={1} color={lpLoss > 25 ? COLORS.rose : COLORS.white} />
                <LeverageTower leverage={leverage} loss={loss} />
                <OrbitControls enableZoom={false} />
                <gridHelper args={[100, 20, COLORS.slate, COLORS.bg]} position={[0, -15, 0]} />
             </Canvas>
             {lpLoss >= 50 && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center bg-rose-950/40 backdrop-blur-md">
                  <div className="text-center">
                     <div className="text-6xl font-black text-rose-500 drop-shadow-2xl">TERMINATED</div>
                     <div className="text-[10px] font-mono text-rose-200 mt-2 uppercase tracking-[0.5em]">Capital Wiped Out</div>
                  </div>
               </motion.div>
             )}
          </div>

          <div className="p-8 md:p-10 space-y-10 bg-black/60 border-l border-white/5 flex flex-col justify-center">
             <div className="space-y-6">
                <div className="flex justify-between items-end">
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Gross Leverage</span>
                   <span className="text-2xl font-black font-mono text-cyan-400">{leverage}x</span>
                </div>
                <input type="range" min="1" max="10" step="0.5" value={leverage} onChange={(e) => setLeverage(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-cyan-400"
                />
             </div>
             <div className="space-y-6">
                <div className="flex justify-between items-end">
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Pod Drawdown</span>
                   <span className="text-2xl font-black font-mono text-rose-400">-{loss}%</span>
                </div>
                <input type="range" min="0.5" max="15" step="0.5" value={loss} onChange={(e) => setLoss(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-rose-400"
                />
             </div>
             <div className="pt-8 border-t border-white/5">
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Capital Impact</div>
                <div className={`text-7xl font-black tracking-tighter ${lpLoss >= 50 ? "text-rose-500" : lpLoss >= 25 ? "text-amber-500" : "text-emerald-500"}`}>-{lpLoss}%</div>
             </div>
          </div>
       </div>
    </div>
  );
}

// ============================================
// 4. FACTOR COSMOS (Correlation)
// ============================================
function FactorPlanet({ name, color, index, active, onSelect }: { name: string, color: string, index: number, active: boolean, onSelect: any }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const angle = (index / 6) * Math.PI * 2;
  
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    if (!active) {
      meshRef.current.position.x = Math.cos(angle + t * 0.1) * 20;
      meshRef.current.position.z = Math.sin(angle + t * 0.1) * 20;
      meshRef.current.position.y = Math.sin(t * 0.5 + index) * 2;
    } else {
      meshRef.current.position.lerp(new THREE.Vector3(0, 0, 0), 0.1);
    }
  });

  return (
    <mesh ref={meshRef} onClick={onSelect}>
      <sphereGeometry args={[active ? 5 : 2.5, 32, 32]} />
      <MeshWobbleMaterial color={color} factor={active ? 0.3 : 0.1} speed={2} emissive={color} emissiveIntensity={0.4} />
      <Text position={[0, active ? 7 : 4, 0]} fontSize={active ? 2.5 : 1.8} color="white" fontStyle="italic">{name}</Text>
    </mesh>
  );
}

export function FactorCorrelationMatrix() {
  const [selected, setSelected] = useState<string | null>(null);
  const factors = [
    { name: "MARKET", color: COLORS.blue }, { name: "VALUE", color: COLORS.amber }, { name: "MOMENTUM", color: COLORS.cyan },
    { name: "GROWTH", color: COLORS.emerald }, { name: "SIZE", color: COLORS.purple }, { name: "VOL", color: COLORS.rose },
  ];

  return (
    <div className="barra-viz-container min-h-[500px] relative bg-black">
       <div className="barra-viz-header flex justify-between items-center bg-white/[0.02] border-b border-white/5 relative z-10 px-6">
          <div className="flex items-center gap-3">
             <Layers className="w-4 h-4 text-cyan-400" />
             <h4 className="font-black text-white uppercase tracking-[0.2em] text-[10px]">The Factor Cosmos</h4>
          </div>
          <div className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.3em] animate-pulse">Select Orbit to Analyze</div>
       </div>

       <div className="absolute inset-0">
          <Canvas camera={{ position: [0, 25, 55], fov: 45 }}>
             <ambientLight intensity={0.3} />
             <pointLight position={[0, 0, 0]} intensity={2} color={COLORS.white} />
             <group>
                {factors.map((f, i) => (
                  <FactorPlanet key={f.name} name={f.name} color={f.color} index={i} active={selected === f.name} onSelect={() => setSelected(selected === f.name ? null : f.name)} />
                ))}
             </group>
             <OrbitControls enableZoom={false} autoRotate={!selected} autoRotateSpeed={0.5} />
             <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
          </Canvas>
       </div>

       <AnimatePresence>
          {selected && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="absolute bottom-8 left-8 p-6 rounded-[2rem] bg-black/60 border border-white/10 backdrop-blur-xl max-w-xs pointer-events-auto shadow-2xl"
            >
               <h5 className="font-black text-white uppercase tracking-widest text-[10px] mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: factors.find(f => f.name === selected)?.color }} />
                  {selected} CORE
               </h5>
               <p className="text-[11px] text-slate-400 leading-relaxed font-serif italic mb-4">Analyzing cross-sectional dependencies. {selected} core shows persistent structural stability under current regime.</p>
               <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                     <div className="text-[7px] text-slate-500 uppercase font-black mb-1">Density</div>
                     <div className="text-sm font-mono text-emerald-400">0.92</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                     <div className="text-[7px] text-slate-500 uppercase font-black mb-1">Crowding</div>
                     <div className="text-sm font-mono text-rose-400">MED</div>
                  </div>
               </div>
            </motion.div>
          )}
       </AnimatePresence>
    </div>
  );
}

// ============================================
// 5. VISUAL REGRESSION ENGINE
// ============================================
function RegressionPlot() {
  const points = useMemo(() => Array.from({ length: 80 }).map(() => ({
    x: (Math.random() - 0.5) * 30, z: (Math.random() - 0.5) * 30, size: 0.2 + Math.random() * 0.6,
  })), []);
  return (
    <group position={[0, -5, 0]}>
       <mesh rotation={[-Math.PI / 4, 0, 0]}>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color={COLORS.emerald} transparent opacity={0.15} side={THREE.DoubleSide} />
       </mesh>
       {points.map((p, i) => (
         <mesh key={i} position={[p.x, (p.x * 0.3 + p.z * 0.1), p.z]}>
            <sphereGeometry args={[p.size, 16, 16]} />
            <meshStandardMaterial color={COLORS.cyan} emissive={COLORS.cyan} emissiveIntensity={0.5} />
         </mesh>
       ))}
       <gridHelper args={[50, 10, COLORS.slate, COLORS.bg]} position={[0, -10, 0]} />
    </group>
  );
}

export function LiveRegression() {
  const [activeTab, setActiveTab] = useState<"code" | "console" | "visual">("code");
  const [isExecuting, setIsExecuting] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runCode = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsExecuting(true); 
    setActiveTab("console"); 
    setProgress(0);
    
    intervalRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { 
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsExecuting(false); 
          setActiveTab("visual"); 
          return 100; 
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

  return (
    <div className="barra-viz-container !bg-[#050508] border-emerald-500/20 overflow-hidden min-h-[450px]">
       <div className="barra-viz-header !bg-black/60 border-b border-white/10 flex justify-between items-center px-6 h-14">
         <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
               <div className="w-2 h-2 rounded-full bg-rose-500/50" />
               <div className="w-2 h-2 rounded-full bg-amber-500/50" />
               <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
            </div>
            <h4 className="font-mono text-[9px] text-slate-400 uppercase tracking-widest font-black">wls_optimizer.exe</h4>
         </div>
         <div className="flex gap-3 items-center">
            <div className="flex p-1 bg-white/5 rounded-lg h-8">
               {(["code", "console", "visual"] as const).map((t) => (
                 <button key={t} onClick={() => setActiveTab(t)}
                   className={`px-3 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${activeTab === t ? "bg-emerald-500 text-black shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
                 >{t}</button>
               ))}
            </div>
            <button onClick={runCode} disabled={isExecuting}
              className="px-4 h-8 rounded-lg bg-emerald-500 text-black text-[8px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {isExecuting ? <Activity className="w-3 h-3 animate-spin" /> : <Maximize2 className="w-3 h-3" />}
              {isExecuting ? "SOLVING" : "OPTIMIZE"}
            </button>
         </div>
       </div>

       <div className="relative h-[400px]">
          <AnimatePresence mode="wait">
             {activeTab === "code" && (
               <motion.div key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8 font-mono text-xs leading-relaxed overflow-x-auto h-full">
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
               <motion.div key="console" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-10 font-mono text-[10px] space-y-4 h-full bg-black/40">
                  <div className="flex gap-2 text-slate-500">
                     <span className="text-emerald-500 font-black">❯</span>
                     <span>Allocating cross-sectional variance matrices...</span>
                  </div>
                  <div className="flex gap-2 text-slate-500">
                     <span className="text-emerald-500 font-black">❯</span>
                     <span>Applying square-root market cap weights...</span>
                  </div>
                  <div className="mt-8 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                     <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.6)]" />
                  </div>
                  {progress === 100 && (
                    <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mt-6 text-emerald-400 font-black tracking-widest uppercase">
                       <Shield className="w-3 h-3" /> SOLVER CONVERGED
                    </div>
                  )}
               </motion.div>
             )}
             {activeTab === "visual" && (
               <motion.div key="visual" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                  <Canvas camera={{ position: [30, 20, 30], fov: 40 }}>
                     <ambientLight intensity={0.5} />
                     <pointLight position={[10, 10, 10]} />
                     <RegressionPlot />
                     <OrbitControls enableZoom={false} />
                  </Canvas>
                  <div className="absolute top-6 right-6 flex flex-col gap-2">
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 rounded-lg border border-white/5 backdrop-blur-md">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[7px] font-black text-white uppercase tracking-widest">WLS Fit Plane</span>
                     </div>
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 rounded-lg border border-white/5 backdrop-blur-md">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        <span className="text-[7px] font-black text-white uppercase tracking-widest">Stock Data</span>
                     </div>
                  </div>
               </motion.div>
             )}
          </AnimatePresence>
       </div>
    </div>
  );
}
