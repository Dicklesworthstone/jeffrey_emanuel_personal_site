"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, MeshDistortMaterial, Sphere, Text, MeshWobbleMaterial, Instance, InstancedMesh, Instances } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, TrendingDown, Zap, Code2, Terminal, Shield, Activity, Maximize2, Move3d } from "lucide-react";
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
  const resolution = capabilities.tier === "low" ? 64 : 128;

  const positions = useMemo(() => {
    const size = resolution;
    const pos = new Float32Array(size * size * 3);
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const idx = (i * size + j) * 3;
        pos[idx] = (i / size - 0.5) * 100;
        pos[idx + 1] = 0;
        pos[idx + 2] = (j / size - 0.5) * 100;
      }
    }
    return pos;
  }, [resolution]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const posAttr = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const t = clock.getElapsedTime();
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const idx = (i * resolution + j);
        const x = posAttr.getX(idx);
        const z = posAttr.getZ(idx);
        
        // Complex topography: sum of several noise-like waves (factors)
        const h = Math.sin(x * 0.1 + t) * Math.cos(z * 0.1 + t * 0.5) * 5 +
                  Math.sin(x * 0.05 - t * 0.3) * 8 +
                  Math.cos(z * 0.08 + t * 0.2) * 4;
        
        posAttr.setY(idx, h);
      }
    }
    posAttr.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.5, 0, 0]}>
      <planeGeometry args={[150, 150, resolution - 1, resolution - 1]} />
      <meshStandardMaterial 
        color={COLORS.emerald} 
        wireframe 
        transparent 
        opacity={0.15} 
        emissive={COLORS.emerald}
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}

function ScanningBeam() {
  const beamRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!beamRef.current) return;
    beamRef.current.position.z = Math.sin(clock.getElapsedTime() * 0.5) * 60;
  });

  return (
    <mesh ref={beamRef} position={[0, 0, 0]}>
      <boxGeometry args={[200, 0.5, 2]} />
      <meshBasicMaterial color={COLORS.cyan} transparent opacity={0.4} />
    </mesh>
  );
}

export function FactorHero() {
  return (
    <div className="absolute inset-0 z-0 opacity-60">
      <Canvas camera={{ position: [0, 40, 100], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color={COLORS.cyan} />
        <RiskLandscape />
        <ScanningBeam />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
           <group position={[0, 10, 0]}>
              {[
                { name: "MOM", pos: [-40, 5, 0], color: COLORS.cyan },
                { name: "VAL", pos: [40, -5, 10], color: COLORS.amber },
                { name: "GRW", pos: [0, 15, -20], color: COLORS.emerald },
                { name: "SIZ", pos: [-20, -10, 30], color: COLORS.purple },
              ].map((f, i) => (
                <Text
                  key={i}
                  position={f.pos as any}
                  fontSize={4}
                  color={f.color}
                  font="/fonts/Inter-Black.woff" // Fallback to system if not found
                  anchorX="center"
                  anchorY="middle"
                >
                  {f.name}
                </Text>
              ))}
           </group>
        </Float>
      </Canvas>
    </div>
  );
}

// ============================================
// 2. FORENSIC PRISM (Return Decomposition)
// ============================================
function PrismSplinter({ factor, index }: { factor: any, index: number }) {
  const lineRef = useRef<THREE.Line>(null);
  
  useFrame(({ clock }) => {
    if (!lineRef.current) return;
    const t = clock.getElapsedTime();
    lineRef.current.rotation.z = Math.sin(t * 0.5 + index) * 0.1;
    lineRef.current.scale.setScalar(1 + Math.sin(t * 2 + index) * 0.05);
  });

  const points = useMemo(() => [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(
      Math.cos(index * 0.8 - 0.5) * 20, 
      Math.sin(index * 0.8 - 0.5) * 20, 
      0
    )
  ], [index]);

  return (
    <group>
      <line ref={lineRef}>
        <bufferGeometry attach="geometry" setFromPoints={points} />
        <lineBasicMaterial attach="material" color={factor.color} linewidth={2} transparent opacity={0.8} />
      </line>
      <mesh position={[points[1].x, points[1].y, points[1].z]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color={factor.color} />
      </mesh>
    </group>
  );
}

export function ReturnDecomposition() {
  const [activeStock, setActiveStock] = useState("NVDA");
  
  const stocks = {
    NVDA: { market: 0.15, momentum: 0.65, value: -0.1, growth: 0.4, specific: 0.25, total: 1.35, desc: "Factor-driven explosive growth." },
    JPM: { market: 0.25, momentum: 0.05, value: 0.4, growth: -0.05, specific: 0.1, total: 0.75, desc: "Stable value core with market sensitivity." },
    TSLA: { market: 0.2, momentum: 0.3, value: -0.2, growth: 0.5, specific: 0.65, total: 1.45, desc: "High idiosyncratic 'story stock' volatility." },
    WMT: { market: 0.1, momentum: 0.15, value: 0.2, growth: 0.05, specific: 0.05, total: 0.55, desc: "Defensive profile, low factor sensitivity." },
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
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
             <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h4 className="font-black text-white uppercase tracking-widest text-[10px] md:text-xs">Forensic Return Prism</h4>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest">Decomposing Skill vs. Luck</p>
          </div>
        </div>
        <div className="flex gap-1">
          {Object.keys(stocks).map(s => (
            <button 
              key={s} 
              onClick={() => setActiveStock(s)}
              className={`px-3 py-1.5 rounded-md text-[9px] font-black transition-all ${activeStock === s ? "bg-emerald-500 text-black shadow-lg" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
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
              <Prism activeStock={activeStock} />
              <group position={[0, 0, 0]}>
                 {factors.map((f, i) => (
                   <PrismSplinter key={f.name} factor={f} index={i} />
                 ))}
              </group>
              <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
           </Canvas>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-3xl flex items-center justify-center border border-white/20">
                 <Zap className="w-6 h-6 text-white animate-pulse" />
              </div>
           </div>
        </div>

        <div className="p-8 md:p-12 space-y-8 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeStock}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-end gap-4 mb-2">
                 <div className="text-6xl font-black text-white tracking-tighter">{(data.total * 100).toFixed(0)}%</div>
                 <div className="text-xs text-slate-500 uppercase tracking-[0.3em] font-bold mb-3">Total Return</div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed border-l-2 border-emerald-500/30 pl-6 italic">
                &ldquo;{data.desc}&rdquo;
              </p>
              
              <div className="space-y-4 pt-4">
                {factors.map((f, i) => (
                  <div key={f.name} className="group">
                    <div className="flex justify-between text-[10px] font-mono uppercase mb-2">
                      <BarraJargon term={f.name === "Idiosyncratic" ? "idiosyncratic-risk" : f.name.toLowerCase()}>
                        <span className="text-slate-500 group-hover:text-slate-300 transition-colors">{f.name} Contribution</span>
                      </BarraJargon>
                      <span className={f.val >= 0 ? "text-emerald-400" : "text-rose-400"}>
                        {(f.val * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.abs(f.val / 1.5) * 100}%` }}
                        className="h-full relative"
                        style={{ 
                          backgroundColor: f.color,
                          marginLeft: f.val < 0 ? "auto" : "0",
                          marginRight: f.val > 0 ? "auto" : "0"
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                      </motion.div>
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

function Prism({ activeStock }: { activeStock: string }) {
  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={1}>
      <mesh>
        <octahedronGeometry args={[6, 0]} />
        <meshStandardMaterial 
          color={COLORS.white} 
          transparent 
          opacity={0.1} 
          wireframe 
        />
      </mesh>
    </Float>
  );
}

// ============================================
// 3. STRESS COCKPIT (Leverage)
// ============================================
function LeverageTower({ leverage, loss }: { leverage: number, loss: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const segments = Math.ceil(leverage);
  
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const stress = (leverage * loss) / 50; // normalized stress
    
    groupRef.current.children.forEach((child, i) => {
      // Each segment sways more than the one below
      const sway = Math.sin(t * 2 + i * 0.5) * stress * (i / segments) * 2;
      child.rotation.z = sway;
      child.rotation.x = Math.cos(t * 1.5 + i * 0.3) * stress * (i / segments);
    });
  });

  return (
    <group ref={groupRef} position={[0, -15, 0]}>
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} position={[0, i * 4, 0]} visible={i < leverage}>
          <boxGeometry args={[10 - i * 0.5, 3.8, 10 - i * 0.5]} />
          <meshStandardMaterial 
            color={COLORS.cyan} 
            emissive={leverage * loss > 25 ? COLORS.rose : COLORS.cyan}
            emissiveIntensity={leverage * loss / 25}
            transparent 
            opacity={0.6} 
          />
        </mesh>
      ))}
    </group>
  );
}

export function PodSimulator() {
  const [leverage, setLeverage] = useState(6);
  const [loss, setLoss] = useState(5);

  const lpLoss = leverage * loss;
  const status = lpLoss >= 50 ? "CRITICAL" : lpLoss >= 25 ? "WARNING" : "STABLE";

  return (
    <div className="barra-viz-container overflow-hidden bg-slate-950">
       <div className="barra-viz-header flex justify-between items-center bg-black/60">
          <div className="flex items-center gap-3">
             <Shield className={`w-5 h-5 ${lpLoss > 25 ? "text-rose-500 animate-pulse" : "text-emerald-500"}`} />
             <div>
                <h4 className="font-black text-white uppercase tracking-[0.2em] text-xs">Structural Integrity Test</h4>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Leverage vs. Liquidation</p>
             </div>
          </div>
          <div className={`px-4 py-1 rounded-full border text-[10px] font-black tracking-widest ${lpLoss >= 50 ? "bg-rose-500/20 border-rose-500 text-rose-500" : lpLoss >= 25 ? "bg-amber-500/20 border-amber-500 text-amber-500" : "bg-emerald-500/20 border-emerald-500 text-emerald-500"}`}>
             {status}
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[400px]">
          <div className="lg:col-span-2 relative bg-black/40">
             <Canvas camera={{ position: [30, 20, 50], fov: 45 }}>
                <ambientLight intensity={0.4} />
                <pointLight position={[20, 20, 20]} intensity={1} color={lpLoss > 25 ? COLORS.rose : COLORS.white} />
                <LeverageTower leverage={leverage} loss={loss} />
                <OrbitControls enableZoom={false} />
                <gridHelper args={[100, 20, COLORS.slate, COLORS.bg]} position={[0, -15, 0]} />
             </Canvas>
             
             {lpLoss >= 50 && (
               <motion.div 
                 initial={{ opacity: 0, scale: 2 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="absolute inset-0 flex items-center justify-center bg-rose-950/40 backdrop-blur-md pointer-events-none"
               >
                  <div className="text-center">
                     <div className="text-8xl font-black text-rose-500 drop-shadow-[0_0_50px_rgba(244,63,94,0.8)]">TERMINATED</div>
                     <div className="text-sm font-mono text-rose-200 mt-4 uppercase tracking-[0.5em]">Shoulder Tap Initiated</div>
                  </div>
               </motion.div>
             )}
          </div>

          <div className="p-8 md:p-12 space-y-12 bg-black/60 border-l border-white/5 flex flex-col justify-center">
             <div className="space-y-6">
                <div className="flex justify-between items-end">
                   <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gross Leverage</div>
                   <div className="text-3xl font-black font-mono text-cyan-400">{leverage}x</div>
                </div>
                <input 
                  type="range" min="1" max="10" step="0.5" value={leverage} 
                  onChange={(e) => setLeverage(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-cyan-400"
                />
             </div>

             <div className="space-y-6">
                <div className="flex justify-between items-end">
                   <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Market Stress</div>
                   <div className="text-3xl font-black font-mono text-rose-400">-{loss}%</div>
                </div>
                <input 
                  type="range" min="0.5" max="15" step="0.5" value={loss} 
                  onChange={(e) => setLoss(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-rose-400"
                />
             </div>

             <div className="pt-8 border-t border-white/5">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Capital Impact</div>
                <div className={`text-7xl font-black tracking-tighter ${lpLoss >= 50 ? "text-rose-500" : lpLoss >= 25 ? "text-amber-500" : "text-emerald-500"}`}>
                   -{lpLoss}%
                </div>
                <p className="text-xs text-slate-400 mt-4 leading-relaxed font-serif italic">
                   {lpLoss >= 50 ? "The pod's equity is wiped out. Portfolio is being liquidated by the central risk desk." : 
                    lpLoss >= 25 ? "Automatic risk budget cut. You are now in a 'managed drawdown' phase." :
                    "Standard volatility envelope. No intervention required."}
                </p>
             </div>
          </div>
       </div>
    </div>
  );
}

// ============================================
// 4. FACTOR COSMOS (Correlation Heatmap)
// ============================================
function FactorPlanet({ name, color, index, active, onSelect, correlation }: { name: string, color: string, index: number, active: boolean, onSelect: any, correlation: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const angle = (index / 6) * Math.PI * 2;
  const dist = active ? 0 : 15;
  
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    if (!active) {
      meshRef.current.position.x = Math.cos(angle + t * 0.2) * 18;
      meshRef.current.position.z = Math.sin(angle + t * 0.2) * 18;
    } else {
      meshRef.current.position.set(0, 0, 0);
    }
  });

  return (
    <group>
      <mesh ref={meshRef} onClick={onSelect}>
        <sphereGeometry args={[active ? 4 : 2, 32, 32]} />
        <MeshWobbleMaterial color={color} factor={active ? 0.2 : 0.1} speed={active ? 2 : 1} emissive={color} emissiveIntensity={0.5} />
        <Text
          position={[0, active ? 6 : 4, 0]}
          fontSize={active ? 2 : 1.5}
          color="white"
          font="/fonts/Inter-Bold.woff"
        >
          {name}
        </Text>
      </mesh>
    </group>
  );
}

export function FactorCorrelationMatrix() {
  const [selected, setSelected] = useState<string | null>(null);
  const factors = [
    { name: "Market", color: COLORS.blue },
    { name: "Value", color: COLORS.amber },
    { name: "Momentum", color: COLORS.cyan },
    { name: "Growth", color: COLORS.emerald },
    { name: "Size", color: COLORS.purple },
    { name: "Volatility", color: COLORS.rose },
  ];

  return (
    <div className="barra-viz-container min-h-[500px] relative bg-black">
       <div className="barra-viz-header flex justify-between items-center bg-white/[0.02] border-b border-white/5 relative z-10">
          <div>
             <h4 className="font-black text-white uppercase tracking-[0.2em] text-xs">The Factor Cosmos</h4>
             <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Multidimensional Inter-factor Dynamics</p>
          </div>
          <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest animate-pulse">
             Click a Factor to Analyze Gravity
          </div>
       </div>

       <div className="absolute inset-0 pt-16">
          <Canvas camera={{ position: [0, 20, 40], fov: 45 }}>
             <ambientLight intensity={0.2} />
             <pointLight position={[0, 0, 0]} intensity={2} color={COLORS.white} />
             <group>
                {factors.map((f, i) => (
                  <FactorPlanet 
                    key={f.name} 
                    name={f.name} 
                    color={f.color} 
                    index={i} 
                    active={selected === f.name}
                    onSelect={() => setSelected(selected === f.name ? null : f.name)}
                    correlation={0.5}
                  />
                ))}
             </group>
             <OrbitControls enableZoom={false} />
             <Stars />
          </Canvas>
       </div>

       <div className="absolute bottom-8 left-8 right-8 pointer-events-none">
          <AnimatePresence>
             {selected && (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: 20 }}
                 className="p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-3xl max-w-md pointer-events-auto"
               >
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-3 h-3 rounded-full" style={{ backgroundColor: factors.find(f => f.name === selected)?.color }} />
                     <h5 className="font-black text-white uppercase tracking-widest text-sm">{selected} Core</h5>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-serif italic mb-4">
                     Analyzing cross-sectional dependencies. {selected} exhibits high inverse correlation with cyclical factors during market corrections.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                        <div className="text-[8px] text-slate-500 uppercase font-black mb-1">Stability Coefficient</div>
                        <div className="text-lg font-mono text-emerald-400">0.92</div>
                     </div>
                     <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                        <div className="text-[8px] text-slate-500 uppercase font-black mb-1">Factor Crowding</div>
                        <div className="text-lg font-mono text-rose-400">HIGH</div>
                     </div>
                  </div>
               </motion.div>
             )}
          </AnimatePresence>
       </div>
    </div>
  );
}

function Stars() {
  const points = useMemo(() => {
    const p = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      p[i * 3] = (Math.random() - 0.5) * 200;
      p[i * 3 + 1] = (Math.random() - 0.5) * 200;
      p[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    return p;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="position" count={points.length / 3} array={points} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.1} color={COLORS.white} transparent opacity={0.5} />
    </points>
  );
}

// ============================================
// 5. VISUAL REGRESSION ENGINE
// ============================================
export function LiveRegression() {
  const [activeTab, setActiveTab] = useState<"code" | "console" | "visual">("code");
  const [isExecuting, setIsExecuting] = useState(false);
  const [progress, setProgress] = useState(0);

  const runCode = () => {
    setIsExecuting(true);
    setActiveTab("console");
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setIsExecuting(false);
          setActiveTab("visual");
          return 100;
        }
        return p + 5;
      });
    }, 50);
  };

  return (
    <div className="barra-viz-container !bg-[#050508] border-emerald-500/20 overflow-hidden">
       <div className="barra-viz-header !bg-black/60 border-b border-white/10 flex justify-between items-center px-6">
         <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
               <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
               <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
            </div>
            <div className="h-4 w-px bg-white/10 mx-2" />
            <h4 className="font-mono text-[10px] text-slate-400 uppercase tracking-[0.3em] font-black flex items-center gap-2">
               <Terminal className="w-3.5 h-3.5 text-emerald-400" />
               wls_optimizer.exe
            </h4>
         </div>
         <div className="flex gap-4 items-center">
            <div className="flex p-1 bg-white/5 rounded-lg">
               {(["code", "console", "visual"] as const).map((t) => (
                 <button 
                   key={t}
                   onClick={() => setActiveTab(t)}
                   className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === t ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "text-slate-500 hover:text-slate-300"}`}
                 >
                   {t}
                 </button>
               ))}
            </div>
            <button 
              onClick={runCode}
              disabled={isExecuting}
              className="px-6 py-2 rounded-xl bg-emerald-500 text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {isExecuting ? <Activity className="w-3 h-3 animate-spin" /> : <Maximize2 className="w-3 h-3" />}
              {isExecuting ? "Executing" : "Optimize"}
            </button>
         </div>
       </div>

       <div className="grid grid-cols-1 min-h-[400px] relative">
          <AnimatePresence mode="wait">
             {activeTab === "code" && (
               <motion.div 
                 key="code" 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="p-8 font-mono text-sm leading-relaxed overflow-x-auto"
               >
                  <pre className="text-emerald-400/80">
                     <code className="block">
{`// Estimating Factor Returns via WLS
async function solveSystem(R, X, W) {
  const XT = Matrix.transpose(X);
  const XTW = Matrix.multiply(XT, W);
  
  // Normal Equations: (X'WX)f = X'WR
  const LHS = Matrix.multiply(XTW, X);
  const RHS = Matrix.multiply(XTW, R);
  
  const f = Matrix.solve(LHS, RHS);
  
  return {
    returns: f,
    residuals: R.minus(X.multiply(f))
  };
}`}
                     </code>
                  </pre>
               </motion.div>
             )}

             {activeTab === "console" && (
               <motion.div 
                 key="console"
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="p-10 bg-black/40 font-mono text-xs md:text-sm space-y-4"
               >
                  <div className="flex gap-3 text-slate-500">
                     <span className="text-emerald-500 font-black">❯</span>
                     <span className="text-slate-300">Allocating cross-sectional variance matrices...</span>
                  </div>
                  <div className="flex gap-3 text-slate-500">
                     <span className="text-emerald-500 font-black">❯</span>
                     <span className="text-slate-300">Applying square-root market cap weights...</span>
                  </div>
                  <div className="mt-8 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${progress}%` }}
                       className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.6)]"
                     />
                  </div>
                  {progress === 100 && (
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mt-8"
                    >
                       <Shield className="w-4 h-4 text-emerald-400" />
                       <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-black">Optimization Converged (Residual Error: 1.2e-7)</span>
                    </motion.div>
                  )}
               </motion.div>
             )}

             {activeTab === "visual" && (
               <motion.div 
                 key="visual"
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="absolute inset-0"
               >
                  <Canvas camera={{ position: [20, 20, 20], fov: 45 }}>
                     <ambientLight intensity={0.5} />
                     <pointLight position={[10, 10, 10]} />
                     <RegressionPlot />
                     <OrbitControls enableZoom={false} />
                  </Canvas>
                  <div className="absolute top-8 right-8 flex flex-col gap-2">
                     <div className="flex items-center gap-2 px-4 py-2 bg-black/60 rounded-xl border border-white/10 backdrop-blur-md">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">WLS Fit Plane</span>
                     </div>
                     <div className="flex items-center gap-2 px-4 py-2 bg-black/60 rounded-xl border border-white/10 backdrop-blur-md">
                        <div className="w-2 h-2 rounded-full bg-cyan-500" />
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Stock Data Points</span>
                     </div>
                  </div>
               </motion.div>
             )}
          </AnimatePresence>
       </div>
    </div>
  );
}

function RegressionPlot() {
  const points = useMemo(() => {
    return Array.from({ length: 100 }).map(() => ({
      x: (Math.random() - 0.5) * 20,
      z: (Math.random() - 0.5) * 20,
      size: 0.1 + Math.random() * 0.5,
    }));
  }, []);

  return (
    <group>
       <mesh rotation={[-Math.PI / 4, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[25, 25]} />
          <meshStandardMaterial color={COLORS.emerald} transparent opacity={0.2} side={THREE.DoubleSide} />
       </mesh>
       {points.map((p, i) => (
         <mesh key={i} position={[p.x, (p.x * 0.5 + p.z * 0.2), p.z]}>
            <sphereGeometry args={[p.size, 16, 16]} />
            <meshStandardMaterial color={COLORS.cyan} emissive={COLORS.cyan} emissiveIntensity={0.5} />
         </mesh>
       ))}
       <gridHelper args={[30, 10, COLORS.slate, COLORS.bg]} position={[0, -10, 0]} />
    </group>
  );
}
