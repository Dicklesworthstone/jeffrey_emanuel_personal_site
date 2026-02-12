"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { useDeviceCapabilities } from "@/hooks/use-mobile-optimizations";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, TrendingDown, Zap, Code2, Terminal } from "lucide-react";
import { BarraJargon } from "./barra-jargon";

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
// 1. FACTOR HERO (Three.js)
// ============================================
export function FactorHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { capabilities } = useDeviceCapabilities();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationId: number;
    let renderer: import("three").WebGLRenderer | undefined;

    const init = async () => {
      const THREE = await import("three");

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      camera.position.z = 120;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      // Create a network of "factors" and "stocks"
      const factorCount = 12;
      const stockCount = capabilities.tier === "low" ? 60 : 200;
      
      const factorNodes: { pos: import("three").Vector3; color: string; label: string }[] = [];
      const colors = [COLORS.cyan, COLORS.purple, COLORS.blue, COLORS.emerald, COLORS.amber];
      const factorNames = ["MOM", "VAL", "GRW", "SIZ", "VOL", "LEV", "LIQ", "YLD", "BTA", "IND", "QLT", "RES"];

      for (let i = 0; i < factorCount; i++) {
        const theta = (i / factorCount) * Math.PI * 2;
        const r = 70;
        factorNodes.push({
          pos: new THREE.Vector3(
            r * Math.cos(theta),
            Math.sin(i * 0.5) * 20,
            r * Math.sin(theta)
          ),
          color: colors[i % colors.length],
          label: factorNames[i]
        });
      }

      const stockGroup = new THREE.Group();
      scene.add(stockGroup);

      const stockMaterial = new THREE.MeshBasicMaterial({ color: COLORS.white, transparent: true, opacity: 0.3 });
      const lineMaterial = new THREE.LineBasicMaterial({ color: COLORS.emerald, transparent: true, opacity: 0.03 });
      
      for (let i = 0; i < stockCount; i++) {
        const geom = new THREE.BoxGeometry(0.6, 0.6, 0.6);
        const mesh = new THREE.Mesh(geom, stockMaterial.clone());
        const pos = new THREE.Vector3(
          (Math.random() - 0.5) * 250,
          (Math.random() - 0.5) * 250,
          (Math.random() - 0.5) * 200
        );
        mesh.position.copy(pos);
        stockGroup.add(mesh);
        
        const fIdx = Math.floor(Math.random() * factorCount);
        const lineGeom = new THREE.BufferGeometry().setFromPoints([
          mesh.position,
          factorNodes[fIdx].pos
        ]);
        const line = new THREE.Line(lineGeom, lineMaterial);
        stockGroup.add(line);
      }

      // Add factor "Beacons"
      factorNodes.forEach((node, i) => {
        const beaconGroup = new THREE.Group();
        beaconGroup.position.copy(node.pos);
        scene.add(beaconGroup);

        const coreGeom = new THREE.SphereGeometry(1.5, 16, 16);
        const coreMat = new THREE.MeshBasicMaterial({ color: node.color });
        const core = new THREE.Mesh(coreGeom, coreMat);
        beaconGroup.add(core);

        const glowGeom = new THREE.SphereGeometry(6, 16, 16);
        const glowMat = new THREE.MeshBasicMaterial({ color: node.color, transparent: true, opacity: 0.15 });
        const glow = new THREE.Mesh(glowGeom, glowMat);
        beaconGroup.add(glow);

        // Vertical beam
        const beamGeom = new THREE.CylinderGeometry(0.1, 0.1, 400, 8);
        const beamMat = new THREE.MeshBasicMaterial({ color: node.color, transparent: true, opacity: 0.05 });
        const beam = new THREE.Mesh(beamGeom, beamMat);
        beaconGroup.add(beam);
      });

      // Ticker particles
      const tickerCount = 1000;
      const tickerGeom = new THREE.BufferGeometry();
      const tickerPos = new Float32Array(tickerCount * 3);
      for(let i=0; i<tickerCount; i++) {
        tickerPos[i*3] = (Math.random()-0.5)*400;
        tickerPos[i*3+1] = (Math.random()-0.5)*400;
        tickerPos[i*3+2] = (Math.random()-0.5)*400;
      }
      tickerGeom.setAttribute("position", new THREE.BufferAttribute(tickerPos, 3));
      const tickerMat = new THREE.PointsMaterial({ size: 0.5, color: COLORS.emerald, transparent: true, opacity: 0.2 });
      const tickerPoints = new THREE.Points(tickerGeom, tickerMat);
      scene.add(tickerPoints);

      let mouseX = 0;
      let mouseY = 0;
      const handleMouseMove = (e: MouseEvent) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 20;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 20;
      };
      window.addEventListener("mousemove", handleMouseMove);

      const onResize = () => {
        if (!renderer) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };
      window.addEventListener("resize", onResize);

      function animate() {
        animationId = requestAnimationFrame(animate);
        const time = Date.now() * 0.001;
        
        stockGroup.rotation.y += 0.0003;
        stockGroup.rotation.z += 0.0001;
        
        tickerPoints.rotation.y -= 0.0001;
        const positions = tickerPoints.geometry.attributes.position.array as Float32Array;
        for(let i=0; i<tickerCount; i++) {
          positions[i*3+1] += Math.sin(time + i*0.1) * 0.05;
        }
        tickerPoints.geometry.attributes.position.needsUpdate = true;

        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += (-mouseY - camera.position.y) * 0.05;
        camera.lookAt(0, 0, 0);

        scene.children.forEach((child, i) => {
           if (child instanceof THREE.Group && child.children.length > 0) {
              child.scale.setScalar(1 + Math.sin(time * 2 + i) * 0.05);
           }
        });

        renderer!.render(scene, camera);
      }
      animate();

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("resize", onResize);
        cancelAnimationFrame(animationId);
        renderer?.dispose();
        if (renderer?.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    };

    let cleanup: (() => void) | undefined;
    init().then(c => { cleanup = c; });

    return () => {
      cleanup?.();
    };
  }, [capabilities.tier]);

  return <div ref={containerRef} className="absolute inset-0 z-0" />;
}

// ============================================
// 2. RETURN DECOMPOSITION
// ============================================
export function ReturnDecomposition() {
  const [activeStock, setActiveStock] = useState("NVDA");
  
  const stocks = {
    NVDA: { market: 0.15, momentum: 0.65, value: -0.1, growth: 0.4, specific: 0.25, total: 1.35, desc: "AI-driven momentum monster." },
    JPM: { market: 0.25, momentum: 0.05, value: 0.4, growth: -0.05, specific: 0.1, total: 0.75, desc: "Classic value with high beta." },
    TSLA: { market: 0.2, momentum: 0.3, value: -0.2, growth: 0.5, specific: 0.65, total: 1.45, desc: "High idiosyncratic volatility." },
    WMT: { market: 0.1, momentum: 0.15, value: 0.2, growth: 0.05, specific: 0.05, total: 0.55, desc: "Defensive giant, low specific risk." },
  };

  const data = stocks[activeStock as keyof typeof stocks];
  const factors = [
    { name: "Market Beta", val: data.market, color: COLORS.blue },
    { name: "Momentum", val: data.momentum, color: COLORS.cyan },
    { name: "Value", val: data.value, color: COLORS.amber },
    { name: "Growth", val: data.growth, color: COLORS.emerald },
    { name: "Idiosyncratic", val: data.specific, color: COLORS.purple },
  ];

  return (
    <div className="barra-viz-container">
      <div className="barra-viz-header flex justify-between items-center bg-black/20 backdrop-blur-md">
        <div>
          <h4 className="font-bold text-white uppercase tracking-widest text-sm flex items-center gap-2">
             <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
             Return Decomposition
          </h4>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Alpha vs Beta Analysis</p>
        </div>
        <div className="flex gap-1 md:gap-2">
          {Object.keys(stocks).map(s => (
            <button 
              key={s} 
              onClick={() => setActiveStock(s)}
              className={`px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-black transition-all ${activeStock === s ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-6 md:p-12 flex flex-col lg:flex-row gap-12 items-center">
        <div className="flex-1 w-full space-y-8">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeStock}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="text-sm text-slate-400 italic mb-8 border-l-2 border-emerald-500/30 pl-4"
            >
              {data.desc}
            </motion.div>
          </AnimatePresence>

          {factors.map((f, i) => (
            <div key={f.name} className="space-y-2.5">
              <div className="flex justify-between text-[10px] font-mono uppercase tracking-[0.2em]">
                <BarraJargon term={f.name === "Idiosyncratic" ? "idiosyncratic-risk" : f.name.split(" ")[0].toLowerCase()}>
                   <span className="text-slate-500 font-bold">{f.name}</span>
                </BarraJargon>
                <span className={f.val >= 0 ? "text-emerald-400" : "text-rose-400"}>
                  {(f.val * 100).toPrecision(3)}%
                </span>
              </div>
              <div className="h-3 bg-white/[0.03] rounded-full overflow-hidden flex relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.abs(f.val / 1.5) * 100}%` }}
                  transition={{ duration: 1, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full relative z-10"
                  style={{ 
                    backgroundColor: f.color,
                    marginLeft: f.val < 0 ? "auto" : "0",
                    marginRight: f.val > 0 ? "auto" : "0"
                  }}
                >
                   <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                </motion.div>
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 z-0" />
              </div>
            </div>
          ))}
        </div>
        
        <div className="w-full lg:w-72 flex flex-col items-center justify-center p-10 bg-gradient-to-br from-white/[0.05] to-transparent rounded-[3rem] border border-white/10 backdrop-blur-2xl relative overflow-hidden group">
           <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
           <div className="text-[10px] text-slate-500 uppercase tracking-[0.4em] mb-4 font-black">Total Return</div>
           <motion.div 
             key={activeStock}
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
           >
             {(data.total * 100).toFixed(0)}%
           </motion.div>
           <div className="mt-8 pt-8 border-t border-white/5 w-full text-center">
              <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-2 font-bold">Specific Risk Factor</div>
              <div className="text-2xl font-mono text-emerald-400 font-black">
                {((data.specific / data.total) * 100).toFixed(1)}%
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 3. LEVERAGE / POD SIMULATOR
// ============================================
export function PodSimulator() {
  const [leverage, setLeverage] = useState(6);
  const [loss, setLoss] = useState(5);

  const lpLoss = leverage * loss;
  const isDead = lpLoss >= 50;
  const isDanger = lpLoss >= 25;

  return (
    <div className="barra-viz-container">
       <div className="barra-viz-header flex items-center gap-4 bg-black/40">
         <div className="w-10 h-10 rounded-2xl bg-rose-500/20 flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-rose-400" />
         </div>
         <div>
            <h4 className="font-bold text-white uppercase tracking-widest text-sm">Leverage Amplification</h4>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">The Pod-Shop Arithmetic</p>
         </div>
       </div>
       
       <div className="p-6 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-12">
             <div className="space-y-6">
               <div className="flex justify-between items-end">
                 <div>
                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] block mb-1">Gross Leverage</span>
                    <span className="text-sm text-slate-400 font-light">Typical pod range: 4x - 8x</span>
                 </div>
                 <span className="text-3xl font-black font-mono text-cyan-400">{leverage}x</span>
               </div>
               <input 
                 type="range" min="1" max="10" step="0.5" 
                 value={leverage} 
                 onChange={(e) => setLeverage(parseFloat(e.target.value))}
                 className="w-full accent-cyan-400 h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer"
               />
             </div>

             <div className="space-y-6">
               <div className="flex justify-between items-end">
                 <div>
                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] block mb-1">Pod Drawdown</span>
                    <span className="text-sm text-slate-400 font-light">Gross P&L impact</span>
                 </div>
                 <span className="text-3xl font-black font-mono text-rose-400">-{loss}%</span>
               </div>
               <input 
                 type="range" min="0.5" max="15" step="0.5" 
                 value={loss} 
                 onChange={(e) => setLoss(parseFloat(e.target.value))}
                 className="w-full accent-rose-400 h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer"
               />
             </div>
          </div>

          <div className="relative">
             <motion.div 
               animate={{ 
                 backgroundColor: isDead ? "rgba(244, 63, 94, 0.15)" : isDanger ? "rgba(245, 158, 11, 0.1)" : "rgba(16, 185, 129, 0.05)",
                 borderColor: isDead ? "rgba(244, 63, 94, 0.4)" : isDanger ? "rgba(245, 158, 11, 0.3)" : "rgba(16, 185, 129, 0.2)"
               }}
               className="p-10 rounded-[3.5rem] border-2 transition-all duration-700 flex flex-col items-center text-center backdrop-blur-3xl relative z-10"
             >
                <div className="text-[11px] uppercase font-black tracking-[0.5em] mb-6 text-slate-500">Loss of LP Capital</div>
                <div className={`text-8xl font-black tracking-tighter mb-6 transition-colors duration-700 ${isDead ? "text-rose-500" : isDanger ? "text-amber-500" : "text-emerald-500"}`}>
                   -{lpLoss.toFixed(0)}%
                </div>
                
                <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-black/40 border border-white/5 shadow-2xl">
                   {isDead ? <AlertCircle className="w-5 h-5 text-rose-500" /> : isDanger ? <Zap className="w-5 h-5 text-amber-500" /> : <Zap className="w-5 h-5 text-emerald-500" />}
                   <span className={`text-[11px] font-black uppercase tracking-widest ${isDead ? "text-rose-400" : isDanger ? "text-amber-400" : "text-emerald-400"}`}>
                      {isDead ? "Immediate Termination" : isDanger ? "Capital Slashed 50%" : "Within Risk Tolerance"}
                   </span>
                </div>
             </motion.div>
             
             {/* Decorative Background Elements */}
             <div className={`absolute -inset-4 rounded-[4rem] blur-3xl opacity-20 transition-colors duration-700 -z-0 ${isDead ? "bg-rose-500" : isDanger ? "bg-amber-500" : "bg-emerald-500"}`} />
          </div>
       </div>
    </div>
  );
}

// ============================================
// 4. FACTOR CORRELATION MATRIX
// ============================================
export function FactorCorrelationMatrix() {
  const factors = ["Market", "Value", "Momentum", "Growth", "Size", "Vol"];
  
  const getCorr = (a: string, b: string) => {
    if (a === b) return 1;
    // Known inverse relationships
    if ((a === "Value" && b === "Momentum") || (a === "Momentum" && b === "Value")) return -0.42;
    if ((a === "Growth" && b === "Value") || (a === "Value" && b === "Growth")) return -0.35;
    if ((a === "Size" && b === "Vol") || (a === "Vol" && b === "Size")) return -0.28;
    // Random noise for the rest
    const hash = (a.length * b.length) % 10;
    return (hash / 20) - 0.1;
  };

  const matrix = useMemo(() => {
    return factors.map(f1 => factors.map(f2 => getCorr(f1, f2)));
  }, []);

  return (
    <div className="barra-viz-container overflow-hidden">
       <div className="barra-viz-header flex items-center justify-between bg-white/[0.02]">
         <div>
            <h4 className="font-bold text-white uppercase tracking-widest text-sm flex items-center gap-2">
               <Layers className="w-4 h-4 text-cyan-400" />
               Cross-Factor Dynamics
            </h4>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Correlation Heatmap</p>
         </div>
         <div className="flex gap-6 items-center">
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-sm bg-rose-500/60" />
               <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Inverse</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-sm bg-cyan-500/60" />
               <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Positive</span>
            </div>
         </div>
       </div>
       
       <div className="p-6 md:p-12 overflow-x-auto bg-gradient-to-b from-transparent to-black/40">
          <div className="min-w-[600px] mx-auto max-w-2xl">
             <div className="flex mb-6">
                <div className="w-28 h-8" />
                {factors.map(f => (
                  <div key={f} className="flex-1 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">{f}</div>
                ))}
             </div>
             {factors.map((f1, i) => (
               <div key={f1} className="flex items-center mb-3">
                  <div className="w-28 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right pr-6">{f1}</div>
                  {matrix[i].map((val, j) => {
                    const opacity = Math.abs(val) === 1 ? 1 : 0.1 + Math.abs(val) * 0.8;
                    const color = val === 1 ? "rgba(255,255,255,0.1)" : val > 0 ? `rgba(34, 211, 238, ${opacity})` : `rgba(244, 63, 94, ${opacity})`;
                    return (
                      <motion.div 
                        key={j} 
                        initial={{ opacity: 0, scale: 0.5 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (i + j) * 0.02 }}
                        className="flex-1 aspect-square rounded-xl m-1 border border-white/5 flex items-center justify-center relative group cursor-help"
                        style={{ backgroundColor: color }}
                      >
                         <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                         <span className="text-[10px] font-black font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 drop-shadow-md">
                           {val.toFixed(2)}
                         </span>
                      </motion.div>
                    );
                  })}
               </div>
             ))}
          </div>
       </div>
    </div>
  );
}

// ============================================
// 5. LIVE REGRESSION CODE
// ============================================
export function LiveRegression() {
  const [activeTab, setActiveTab] = useState<"code" | "output" | "result">("code");
  const [isExecuting, setIsExecuting] = useState(false);
  const [hasExecuted, setHasExecuted] = useState(false);
  const [code, setCode] = useState(`/**
 * MULTI-FACTOR RISK ENGINE v4.2
 * Decomposing portfolio returns via 
 * Cross-Sectional Weighted Least Squares
 */

async function estimateFactors(returns, exposures, weights) {
  // r = Xf + e
  // Solve for f using normal equations:
  // f = (X'WX)^-1 X'Wr
  
  console.log("Initializing WLS Regression...");
  
  const XT = transpose(exposures);
  const XTW = multiply(XT, weights);
  const A = multiply(XTW, exposures);
  const B = multiply(XTW, returns);
  
  const factorReturns = solve(A, B);
  
  return {
    market: factorReturns[0],
    style: factorReturns[1],
    residual_variance: computeResiduals(returns, exposures, factorReturns)
  };
}

// Executing daily batch...`);

  const runCode = () => {
    setIsExecuting(true);
    setHasExecuted(false);
    setActiveTab("output");
    setTimeout(() => {
      setIsExecuting(false);
      setHasExecuted(true);
      setActiveTab("result");
    }, 1500);
  };

  return (
    <div className="barra-viz-container !bg-[#050508] border-emerald-500/20">
       <div className="barra-viz-header !bg-black/60 border-b border-white/10 flex justify-between items-center px-6">
         <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
               <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
               <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
            </div>
            <div className="h-4 w-px bg-white/10 mx-2" />
            <h4 className="font-mono text-[10px] text-slate-400 uppercase tracking-[0.3em] font-black flex items-center gap-2">
               <Code2 className="w-3.5 h-3.5 text-emerald-400" />
               risk_engine.ts
            </h4>
         </div>
         <div className="flex gap-3 items-center">
            <div className="flex p-1 bg-white/5 rounded-lg" role="tablist">
               {(["code", "output", "result"] as const).map((t) => (
                 <button 
                   key={t}
                   role="tab"
                   aria-selected={activeTab === t}
                   aria-label={`View ${t}`}
                   onClick={() => setActiveTab(t)}
                   className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === t ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "text-slate-500 hover:text-slate-300"}`}
                 >
                   {t}
                 </button>
               ))}
            </div>
            <button 
              onClick={runCode}
              disabled={isExecuting}
              aria-label={isExecuting ? "Executing code" : "Run regression code"}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50"
            >
              {isExecuting ? "Executing..." : "Run Code"}
            </button>
         </div>
       </div>
       
       <div className="grid grid-cols-1 min-h-[360px]">
          {activeTab === "code" && (
            <div className="p-6 font-mono text-xs md:text-sm leading-relaxed overflow-x-auto relative" role="tabpanel">
               <textarea 
                 value={code}
                 onChange={(e) => setCode(e.target.value)}
                 aria-label="Code editor"
                 className="w-full h-72 bg-transparent text-emerald-400/90 focus:outline-none resize-none scrollbar-thin scrollbar-thumb-white/10"
                 spellCheck={false}
               />
               <div className="absolute bottom-4 right-6 text-[10px] text-slate-600 font-mono italic select-none">
                  // Built-in Linear Algebra Library v2.0
               </div>
            </div>
          )}
          
          {activeTab === "output" && (
            <div className="p-8 bg-black/40 font-mono text-xs md:text-sm space-y-4" role="tabpanel">
               <div className="flex gap-3 text-slate-500">
                  <span className="shrink-0">14:02:01</span>
                  <span className="text-emerald-500">❯</span>
                  <span className="text-slate-300 animate-pulse">Spawning regression worker pool...</span>
               </div>
               {hasExecuted && (
                 <>
                   <div className="flex gap-3 text-slate-500">
                      <span className="shrink-0">14:02:02</span>
                      <span className="text-emerald-500">❯</span>
                      <span className="text-white font-bold">[SUCCESS]</span>
                      <span className="text-slate-300 underline underline-offset-4 decoration-emerald-500/30">Batch Estimation Complete</span>
                   </div>
                   <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl mt-4">
                      <Terminal className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold">WLS Solver Converged in 12ms</span>
                   </div>
                 </>
               )}
            </div>
          )}

          {activeTab === "result" && (
            <div className="p-10 flex flex-col items-center justify-center space-y-8 bg-gradient-to-b from-transparent to-emerald-500/5" role="tabpanel">
               {!hasExecuted && (
                 <div className="text-slate-500 font-mono text-sm italic">Run code to see factor results...</div>
               )}
               {hasExecuted && (
                 <>
                   <div className="text-center space-y-2">
                      <div className="text-[10px] text-slate-500 uppercase tracking-[0.4em] font-black">Estimated Factor Returns</div>
                      <div className="text-xs text-slate-600 italic">Confidence Interval: 99.7% (3&sigma;)</div>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-lg">
                      <div className="p-6 rounded-[2rem] bg-black/60 border border-white/5 shadow-2xl group hover:border-emerald-500/30 transition-all">
                         <div className="text-[9px] uppercase font-black text-slate-500 mb-2 tracking-widest">Market Beta</div>
                         <div className="text-4xl text-white font-black tracking-tighter">+0.423%</div>
                         <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: "65%" }} className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                         </div>
                      </div>
                      <div className="p-6 rounded-[2rem] bg-black/60 border border-white/5 shadow-2xl group hover:border-cyan-500/30 transition-all">
                         <div className="text-[9px] uppercase font-black text-slate-500 mb-2 tracking-widest">Momentum</div>
                         <div className="text-4xl text-white font-black tracking-tighter">+0.187%</div>
                         <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: "40%" }} className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                         </div>
                      </div>
                   </div>
                   
                   <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest border-t border-white/5 pt-6 w-full text-center">
                      Alpha Extraction Efficiency: 94.2%
                   </div>
                 </>
               )}
            </div>
          )}
       </div>
    </div>
  );
}
