"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Play, 
  Pause, 
  RotateCcw,
  Users,
  Lock,
  Unlock,
  Timer,
  Cpu,
  ShieldAlert,
  Fingerprint,
  Activity,
  ChevronRight,
  ChevronLeft,
  MousePointer2,
  Terminal
} from "lucide-react";
import * as THREE from "three";

const COLORS = {
  bg: "#020204",
  amber: "#f59e0b",
  orange: "#f97316",
  rose: "#f43f5e",
  emerald: "#10b981",
  cyan: "#22d3ee",
  blue: "#3b82f6",
  white: "#f1f5f9",
  slate: "#64748b",
};

// ============================================================
// 1. CHRONOS SUBSTRATE HERO (Three.js)
// Advanced particle system with mouse-parallax depth
// ============================================================

export function BakeryHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationId: number;
    let renderer: THREE.WebGLRenderer | null = null;
    let isMounted = true;
    let handleResize: (() => void) | null = null;
    let handleMouseMove: ((e: MouseEvent) => void) | null = null;
    const disposables: { dispose: () => void }[] = [];

    const mouse = new THREE.Vector2(0, 0);

    const init = async () => {
      const THREE = await import("three");
      if (!isMounted || !container) return;

      const scene = new THREE.Scene();
      const isMobile = window.innerWidth < 768;
      const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 2000);
      camera.position.set(0, 0, isMobile ? 120 : 100);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      // Starfield background
      const starCount = isMobile ? 1000 : 3000;
      const starGeo = new THREE.BufferGeometry();
      const starPos = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i++) {
        starPos[i * 3] = (Math.random() - 0.5) * 1000;
        starPos[i * 3 + 1] = (Math.random() - 0.5) * 1000;
        starPos[i * 3 + 2] = (Math.random() - 0.5) * 1000;
      }
      starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
      const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, transparent: true, opacity: 0.3 });
      const stars = new THREE.Points(starGeo, starMat);
      scene.add(stars);
      disposables.push(starGeo, starMat);

      // Main Ticket Vortex
      const group = new THREE.Group();
      scene.add(group);

      const ticketCount = isMobile ? 30 : 60;
      const tickets: THREE.Mesh[] = [];

      for (let i = 0; i < ticketCount; i++) {
        const geo = new THREE.BoxGeometry(3, 4.5, 0.1);
        const mat = new THREE.MeshBasicMaterial({ 
          color: i % 10 === 0 ? COLORS.cyan : i % 5 === 0 ? COLORS.amber : COLORS.rose,
          transparent: true,
          opacity: 0.3,
          wireframe: true
        });
        const ticket = new THREE.Mesh(geo, mat);
        disposables.push(geo, mat);

        const angle = (i / ticketCount) * Math.PI * 2 * 6;
        const radius = (isMobile ? 15 : 25) + (i * 0.8);
        ticket.position.set(
          Math.cos(angle) * radius,
          (i - ticketCount / 2) * 3,
          Math.sin(angle) * radius
        );
        ticket.rotation.y = angle;
        group.add(ticket);
        tickets.push(ticket);
      }

      // Central Logical Core
      const coreGeo = new THREE.OctahedronGeometry(isMobile ? 10 : 15, 2);
      const coreMat = new THREE.MeshBasicMaterial({ 
        color: COLORS.amber, 
        wireframe: true,
        transparent: true,
        opacity: 0.15
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      scene.add(core);
      disposables.push(coreGeo, coreMat);

      const animate = () => {
        if (!isMounted) return;
        animationId = requestAnimationFrame(animate);
        
        group.rotation.y += 0.001;
        core.rotation.y -= 0.003;
        core.rotation.x += 0.002;
        
        // Parallax effect
        camera.position.x += (mouse.x * 20 - camera.position.x) * 0.05;
        camera.position.y += (-mouse.y * 20 - camera.position.y) * 0.05;
        camera.lookAt(0, 0, 0);

        tickets.forEach((t, i) => {
          t.position.y += Math.sin(Date.now() * 0.0005 + i) * 0.05;
          t.rotation.z += 0.005;
        });

        renderer?.render(scene, camera);
      };

      animate();

      handleResize = () => {
        if (!container || !renderer || !camera) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };
      
      handleMouseMove = (e: MouseEvent) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      };

      window.addEventListener("resize", handleResize);
      window.addEventListener("mousemove", handleMouseMove);
    };

    init();

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationId);
      if (handleResize) window.removeEventListener("resize", handleResize);
      if (handleMouseMove) window.removeEventListener("mousemove", handleMouseMove);
      disposables.forEach(d => d.dispose());
      if (renderer) {
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[500px] md:min-h-[600px] relative cursor-none">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020204]/60 to-[#020204] pointer-events-none z-10" />
      
      {/* HUD Elements for Desktop */}
      <div className="absolute inset-0 hidden md:block pointer-events-none z-20">
         <div className="absolute top-1/4 left-12 w-32 h-px bg-white/10" />
         <div className="absolute top-1/4 left-12 p-2 font-mono text-[8px] text-white/20 uppercase">Substrate Density: High</div>
         <div className="absolute bottom-1/4 right-12 w-32 h-px bg-white/10" />
         <div className="absolute bottom-1/4 right-12 p-2 font-mono text-[8px] text-white/20 uppercase text-right">Synchronization: Fair</div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-20 pointer-events-none w-[90%]">
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="px-8 py-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-3xl shadow-[0_0_80px_rgba(245,158,11,0.15)]"
         >
            <div className="flex flex-col items-center gap-2">
               <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
               <p className="text-[10px] md:text-[11px] font-mono text-amber-400 uppercase tracking-[0.5em] mb-1">Bakery Substrate</p>
               <div className="h-px w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
               <p className="text-xs md:text-sm font-bold text-white/80">Decentralized Temporal Logic</p>
            </div>
         </motion.div>
      </div>
    </div>
  );
}

// ============================================================
// 2. THE TEMPORAL DOORWAY RACE (Fluid Scrubber)
// Scrub through time to see how the race is resolved
// ============================================================

export function DoorwayRaceViz() {
  const [progress, setProgress] = useState(0);
  
  const steps = [
    {
      t: 0,
      title: "Quiescent State",
      desc: "Process 0 and 1 are idle. No entries requested.",
      a: { state: 'IDLE', val: 0, choosing: false, color: COLORS.slate },
      b: { state: 'IDLE', val: 0, choosing: false, color: COLORS.slate },
    },
    {
      t: 0.25,
      title: "The Choosing Guard",
      desc: "Both processes signal intent simultaneously. The 'Choosing' flags go HIGH.",
      a: { state: 'CHOOSING', val: 0, choosing: true, color: COLORS.cyan },
      b: { state: 'CHOOSING', val: 0, choosing: true, color: COLORS.cyan },
    },
    {
      t: 0.5,
      title: "Concurrent Ticket Read",
      desc: "A race condition! Both read 'Max=5' and decide on '6'. Collision state detected.",
      a: { state: 'WAITING', val: 6, choosing: false, color: COLORS.amber },
      b: { state: 'WAITING', val: 6, choosing: false, color: COLORS.amber },
    },
    {
      t: 0.75,
      title: "Logical Resolution",
      desc: "Process 0 wins the tie-break because its ID is lower. Priority assigned.",
      a: { state: 'CRITICAL', val: 6, choosing: false, color: COLORS.emerald },
      b: { state: 'WAITING', val: 6, choosing: false, color: COLORS.amber },
    },
    {
      t: 1,
      title: "Starvation-Free Release",
      desc: "P0 exits, P1 inherits the lowest (Ticket, ID) and enters next.",
      a: { state: 'IDLE', val: 0, choosing: false, color: COLORS.slate },
      b: { state: 'CRITICAL', val: 6, choosing: false, color: COLORS.emerald },
    }
  ];

  // Simple interpolation logic for the scrubber
  const currentStep = useMemo(() => {
    let best = steps[0];
    for (const s of steps) {
      if (progress >= s.t) best = s;
    }
    return best;
  }, [progress]);

  return (
    <div className="ba-viz-container">
      <div className="p-8 md:p-12 relative overflow-hidden bg-gradient-to-b from-white/[0.02] to-transparent">
        <div className="flex flex-col lg:flex-row gap-12 relative z-10">
          <div className="lg:w-1/3 space-y-8">
            <div className="space-y-4">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono text-amber-400 uppercase tracking-widest">
                  Temporal Scrubber
               </div>
               <h3 className="text-3xl font-bold text-white tracking-tight leading-none min-h-[4rem] flex items-center">
                 {currentStep.title}
               </h3>
               <p className="text-slate-400 leading-relaxed text-lg min-h-[6rem]">
                 {currentStep.desc}
               </p>
            </div>

            <div className="space-y-4 pt-8 border-t border-white/5">
               <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">
                  <span>Timeline</span>
                  <span>{Math.round(progress * 100)}%</span>
               </div>
               <input 
                 type="range" min="0" max="1" step="0.01" 
                 value={progress}
                 onChange={(e) => setProgress(parseFloat(e.target.value))}
                 className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-amber-500"
               />
               <div className="flex justify-between px-1">
                  {steps.map((s, i) => (
                    <div key={i} className={`w-1 h-1 rounded-full ${progress >= s.t ? 'bg-amber-500' : 'bg-white/10'}`} />
                  ))}
               </div>
            </div>
          </div>

          <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
             <LayoutGroup>
                <TemporalCard label="NODE 0" data={currentStep.a} id={0} />
                <TemporalCard label="NODE 1" data={currentStep.b} id={1} />
             </LayoutGroup>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemporalCard({ label, data, id }: any) {
  return (
    <motion.div 
      layout
      className="p-8 rounded-[2rem] bg-black/40 border-2 transition-colors duration-500 relative overflow-hidden group"
      style={{ borderColor: `${data.color}33` }}
    >
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      
      <div className="relative z-10 flex flex-col gap-8">
         <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-2xl transition-colors duration-500" 
                    style={{ backgroundColor: data.color }}>
                  {id}
               </div>
               <div>
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-0.5">{label}</p>
                  <p className="text-sm font-bold text-white transition-colors duration-500" style={{ color: data.color }}>{data.state}</p>
               </div>
            </div>
            {data.state === 'CRITICAL' && <Lock className="w-5 h-5 text-emerald-400 animate-pulse" />}
         </div>

         <div className="space-y-6">
            <div className="space-y-2">
               <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase">
                  <span>Logic Guard</span>
                  <span className={data.choosing ? 'text-cyan-400' : 'text-slate-700'}>{data.choosing ? 'TRUE' : 'FALSE'}</span>
               </div>
               <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={false}
                    animate={{ width: data.choosing ? '100%' : '0%', backgroundColor: data.color }}
                    className="h-full shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center">
                  <p className="text-[9px] text-slate-600 uppercase mb-1">Ticket</p>
                  <p className="text-3xl font-black text-white">{data.val || '—'}</p>
               </div>
               <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center">
                  <p className="text-[9px] text-slate-600 uppercase mb-1">Priority</p>
                  <p className="text-3xl font-black text-white/20 group-hover:text-white/40 transition-colors">#{id}</p>
               </div>
            </div>
         </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// 3. THE QUANTUM NEXUS (Advanced Simulation)
// Radial ring with energy-beam communication logic
// ============================================================

export function ProcessNexus() {
  const [numProcesses] = useState(6);
  const [processes, setProcesses] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [checkingId, setCheckingId] = useState<number | null>(null);
  const [targetId, setTargetId] = useState<number | null>(null);
  const [radius, setRadius] = useState(240);
  const isMountedRef = useRef(true);
  const processesRef = useRef<any[]>([]);

  useEffect(() => {
    const handleResize = () => {
      setRadius(Math.min(window.innerWidth * 0.32, 260));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    
    const initial = Array.from({ length: numProcesses }, (_, i) => ({
      id: i,
      state: 'IDLE',
      number: 0,
      choosing: false
    }));
    setProcesses(initial);
    processesRef.current = initial;
    
    return () => { 
      isMountedRef.current = false;
      window.removeEventListener('resize', handleResize);
    };
  }, [numProcesses]);

  const updateProcess = (id: number, updates: any) => {
    if (!isMountedRef.current) return;
    setProcesses(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...updates } : p);
      processesRef.current = next;
      return next;
    });
  };

  const runCycle = async (id: number) => {
    if (!isMountedRef.current || processesRef.current[id]?.state !== 'IDLE') return;

    // Phase 1: Choosing (The Doorway)
    updateProcess(id, { state: 'CHOOSING', choosing: true });
    await new Promise(r => setTimeout(r, 800));
    
    const maxNum = Math.max(...processesRef.current.map(p => p.number)) + 1;
    updateProcess(id, { state: 'WAITING', number: maxNum, choosing: false });

    // Phase 2: Verifying Consensus (The Ring)
    setCheckingId(id);
    for (let j = 0; j < numProcesses; j++) {
      if (id === j) continue;
      if (!isMountedRef.current) return;
      
      setTargetId(j);
      await new Promise(r => setTimeout(r, 600)); // Simulate sequential check
    }
    setCheckingId(null);
    setTargetId(null);

    if (!isMountedRef.current) return;

    // Phase 3: Critical Section Entry
    updateProcess(id, { state: 'CRITICAL' });
    setActiveId(id);
    await new Promise(r => setTimeout(r, 4000));
    
    if (!isMountedRef.current) return;

    // Phase 4: Release
    setActiveId(null);
    updateProcess(id, { state: 'IDLE', number: 0 });
  };

  return (
    <div className="ba-viz-container h-[550px] md:h-[750px] flex items-center justify-center p-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#050507] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)]" />
      
      {/* Central Logical Hub */}
      <div className="relative z-10 w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
         <div className={`absolute inset-0 rounded-full blur-[60px] md:blur-[100px] transition-all duration-1000 ${activeId !== null ? 'bg-emerald-500/20 scale-150' : 'bg-blue-500/5 scale-100'}`} />
         
         <div className={`w-32 h-32 md:w-48 md:h-48 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-1000 ${activeId !== null ? 'border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_60px_rgba(16,185,129,0.1)]' : 'border-white/5 bg-white/[0.02]'}`}>
            <AnimatePresence mode="wait">
              {activeId !== null ? (
                <motion.div key="lock" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                  <div className="relative mb-4">
                     <Lock className="w-10 h-10 md:w-14 md:h-14 text-emerald-400" />
                     <motion.div 
                       animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                       transition={{ duration: 2, repeat: Infinity }}
                       className="absolute inset-0 bg-emerald-400 rounded-full blur-xl"
                     />
                  </div>
                  <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.3em]">Exclusive Lock</p>
                  <p className="text-lg font-black text-white mt-1">NODE {activeId}</p>
                </motion.div>
              ) : (
                <motion.div key="unlock" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center opacity-40">
                  <Unlock className="w-10 h-10 md:w-14 md:h-14 text-slate-600 mb-4" />
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em]">Consensus Open</p>
                </motion.div>
              )}
            </AnimatePresence>
         </div>
      </div>

      {/* Process Nodes */}
      {processes.map((p, i) => {
        const angle = (i / numProcesses) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        const isTarget = targetId === i;
        const isChecker = checkingId === i;

        return (
          <div key={i} className="absolute transition-all duration-1000 z-20" style={{ transform: `translate(${x}px, ${y}px)` }}>
            <motion.button
              onClick={() => runCycle(i)}
              disabled={p.state !== 'IDLE'}
              whileHover={p.state === 'IDLE' ? { scale: 1.1 } : {}}
              className={`w-20 h-20 md:w-28 md:h-28 rounded-[2rem] border-2 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-700 ${
                p.state === 'CRITICAL' ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_50px_rgba(16,185,129,0.3)]' :
                p.state === 'WAITING' ? 'border-amber-500 bg-amber-500/5 shadow-[0_0_30px_rgba(245,158,11,0.15)]' :
                p.state === 'CHOOSING' ? 'border-blue-500 bg-blue-500/5' :
                'border-white/5 bg-white/[0.03] hover:border-white/20 disabled:cursor-not-allowed'
              }`}
            >
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
              <span className="text-[9px] font-mono text-slate-500 uppercase mb-1">P{i}</span>
              <span className="text-2xl font-black text-white">{p.number || '—'}</span>
              
              {/* State HUD mini */}
              {p.choosing && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" />}
            </motion.button>

            {/* Connection beam using SVG */}
            {isChecker && targetId !== null && (
               <div className="absolute top-1/2 left-1/2 pointer-events-none overflow-visible -z-10">
                  <svg width="600" height="600" className="absolute -left-300 -top-300 pointer-events-none overflow-visible">
                     <defs>
                        <filter id="glow">
                           <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                           <feMerge>
                              <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
                           </feMerge>
                        </filter>
                     </defs>
                     <motion.line
                       initial={{ pathLength: 0, opacity: 0 }}
                       animate={{ pathLength: 1, opacity: 0.6 }}
                       x1="0" y1="0"
                       x2={Math.cos((targetId / numProcesses) * Math.PI * 2 - Math.PI / 2 - angle) * radius}
                       y2={Math.sin((targetId / numProcesses) * Math.PI * 2 - Math.PI / 2 - angle) * radius}
                       stroke={COLORS.amber}
                       strokeWidth="2"
                       strokeDasharray="8 8"
                       filter="url(#glow)"
                     />
                  </svg>
               </div>
            )}
          </div>
        );
      })}

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 px-8 py-3 rounded-full bg-black/40 border border-white/10 backdrop-blur-3xl shadow-2xl">
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-widest">Doorway</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-widest">Queueing</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-widest">Active</span>
         </div>
      </div>
    </div>
  );
}

// ============================================================
// 4. THE HARDWARE STRESS-TEST
// Terminal-style visualization of torn reads and resilience
// ============================================================

export function MemoryResilienceViz() {
  const [noise, setNoise] = useState(0);
  const [intensity, setNoiseIntensity] = useState(0.4);
  const [activeTab, setActiveTab] = useState<'SIGNAL' | 'MEMORY'>('SIGNAL');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setNoise(Math.random());
    }, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ba-viz-container p-8 md:p-12 relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <div>
          <div className="flex items-center gap-4 mb-8">
             <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-inner">
                <ShieldAlert className="w-6 h-6 text-rose-500" />
             </div>
             <div>
                <h4 className="text-2xl font-bold text-white tracking-tight">Logical vs. Physical Isolation</h4>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Hardware Stress Diagnosis</p>
             </div>
          </div>

          <p className="text-slate-400 leading-relaxed text-lg mb-8">
            Lamport realized that hardware isn&rsquo;t perfect. If two processes access memory at the same instant, the data 
            doesn&rsquo;t just &ldquo;wait&rdquo;&mdash;it physically blurs. The Bakery Algorithm is designed to thrive 
            in this chaos.
          </p>
          
          <div className="space-y-4">
             <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group">
                <div className="flex justify-between items-center mb-3">
                   <div className="flex items-center gap-3">
                      <Activity className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-widest">Bus Contention</span>
                   </div>
                   <span className="text-[10px] font-mono text-rose-500 animate-pulse">CRITICAL</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  A &ldquo;torn read&rdquo; happens when a process reads <code className="text-amber-300">0xFFFF</code> while the bus is 
                  halfway through writing <code className="text-emerald-400">0x0001</code>. Result: undefined garbage.
                </p>
             </div>
             
             <div className="p-5 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/10">
                <div className="flex items-center gap-3 mb-3">
                   <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                   <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Bakery Stabilizer</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  By checking the <code>choosing</code> flag first, every process essentially &ldquo;polls the voltage&rdquo; 
                  until the signal stabilizes. Logic wins where hardware fails.
                </p>
             </div>
          </div>
        </div>

        <div className="relative group">
           {/* Terminal Monitor */}
           <div className="relative aspect-[4/3] w-full bg-[#08080a] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                 <div className="flex items-center gap-2">
                    <Terminal className="w-3 h-3 text-slate-500" />
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Logic Diagnostic v4.2</span>
                 </div>
                 <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500/50" />
                 </div>
              </div>

              <div className="flex-1 p-8 flex flex-col justify-between font-mono">
                 <div className="space-y-4">
                    <div className="flex justify-between items-end text-[10px]">
                       <span className="text-slate-500">SIGNAL_INTEGRITY</span>
                       <span className={intensity > 0.7 ? 'text-rose-500' : 'text-emerald-500'}>{Math.round((1 - intensity) * 100)}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden relative">
                       <motion.div 
                         animate={{ x: ["-100%", "100%"] }}
                         transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                         className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                       />
                       <div className="h-full bg-amber-500/40" style={{ width: `${(1-intensity)*100}%` }} />
                    </div>
                 </div>

                 <div className="relative py-8 text-center overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-[10rem] font-black text-white/[0.02] select-none scale-150">
                       {Math.floor(noise * 99)}
                    </div>
                    
                    <div className="relative">
                       <motion.div 
                         animate={{ 
                           opacity: [1, 0.8, 1],
                           scale: [1, 1.02, 1]
                         }}
                         transition={{ duration: 0.1, repeat: Infinity }}
                         className="text-8xl font-black text-white tracking-tighter" 
                         style={{ 
                           filter: `blur(${noise * 8 * intensity}px)`, 
                           transform: `translateX(${(noise - 0.5) * 20 * intensity}px) skew(${(noise - 0.5) * 15 * intensity}deg)` 
                         }}>
                         42
                       </motion.div>
                       <div className="absolute inset-0 text-8xl font-black text-rose-500/10" 
                            style={{ transform: `translate(${(noise - 0.5) * 40 * intensity}px, 2px)` }}>
                          ??
                       </div>
                    </div>
                 </div>

                 <div className="flex justify-between text-[9px] text-slate-600">
                    <span className="flex items-center gap-2">
                       <span className="w-1 h-1 rounded-full bg-amber-500 animate-ping" />
                       SAMPLING_BUS_0xBA...
                    </span>
                    <span className="text-amber-500/50">TORN_READ_DETECTED</span>
                 </div>
              </div>

              {/* Scanning Laser */}
              <motion.div 
                animate={{ top: ["-5%", "105%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-px bg-cyan-400/30 shadow-[0_0_30px_rgba(34,211,238,0.8)] z-30 pointer-events-none"
              />
           </div>
           
           {/* Precision Control Slider */}
           <div className="mt-10 px-6 py-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
              <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase mb-3">
                 <span>Inject Hardware Noise</span>
                 <span className="text-white font-bold">{Math.round(intensity * 100)}%</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.01" value={intensity}
                onChange={(e) => setNoiseIntensity(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-colors"
              />
           </div>
        </div>
      </div>
    </div>
  );
}
