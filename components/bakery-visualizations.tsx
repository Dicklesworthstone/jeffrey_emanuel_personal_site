"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronLeft
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
// 1. CHRONOS QUEUE HERO (Three.js)
// Cinematic visualization of decentralized ordering
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
    const disposables: { dispose: () => void }[] = [];

    const init = async () => {
      const THREE = await import("three");
      if (!isMounted || !container) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
      camera.position.set(0, 20, 60);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      const group = new THREE.Group();
      scene.add(group);

      const ticketCount = 40;
      const tickets: THREE.Mesh[] = [];

      for (let i = 0; i < ticketCount; i++) {
        const geo = new THREE.BoxGeometry(2, 3, 0.1);
        const mat = new THREE.MeshBasicMaterial({ 
          color: i % 5 === 0 ? COLORS.amber : COLORS.rose,
          transparent: true,
          opacity: 0.4,
          wireframe: true
        });
        const ticket = new THREE.Mesh(geo, mat);
        
        disposables.push(geo, mat);

        const angle = (i / ticketCount) * Math.PI * 2 * 4;
        const radius = 10 + (i * 0.5);
        ticket.position.set(
          Math.cos(angle) * radius,
          (i - ticketCount / 2) * 2,
          Math.sin(angle) * radius
        );
        ticket.rotation.y = angle;
        group.add(ticket);
        tickets.push(ticket);
      }

      const coreGeo = new THREE.IcosahedronGeometry(8, 1);
      const coreMat = new THREE.MeshBasicMaterial({ 
        color: COLORS.amber, 
        wireframe: true,
        transparent: true,
        opacity: 0.2
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      scene.add(core);
      disposables.push(coreGeo, coreMat);

      const animate = () => {
        if (!isMounted) return;
        animationId = requestAnimationFrame(animate);
        
        group.rotation.y += 0.002;
        core.rotation.y -= 0.005;
        core.rotation.x += 0.003;

        tickets.forEach((t, i) => {
          t.position.y += Math.sin(Date.now() * 0.001 + i) * 0.02;
          t.rotation.z += 0.01;
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
      window.addEventListener("resize", handleResize);
    };

    init();

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationId);
      if (handleResize) window.removeEventListener("resize", handleResize);
      disposables.forEach(d => d.dispose());
      if (renderer) {
        renderer.dispose();
        if (container && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[500px] relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020204]/40 to-[#020204] pointer-events-none z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-20 pointer-events-none">
         <motion.div 
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="px-6 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-3xl shadow-[0_0_50px_rgba(245,158,11,0.1)]"
         >
            <p className="text-[10px] font-mono text-amber-400 uppercase tracking-[0.4em] mb-1">Bakery Substrate</p>
            <p className="text-xs font-bold text-white/60">Distributed Determinism</p>
         </motion.div>
      </div>
    </div>
  );
}

// ============================================================
// 2. THE DOORWAY VISUALIZER
// Explains the race condition and choosing[i] logic
// ============================================================

export function DoorwayRaceViz() {
  const [step, setStep] = useState(0);
  
  const steps = [
    {
      title: "The Parallel Intent",
      desc: "Process A and B both decide to enter. In a non-atomic world, they haven't communicated their intent yet.",
      a: { state: 'IDLE', val: 0, choosing: false },
      b: { state: 'IDLE', val: 0, choosing: false },
    },
    {
      title: "The Choosing Guard",
      desc: "Crucial: They set 'choosing[i] = true'. This warns others: 'Wait for me, I am in the middle of picking a number.'",
      a: { state: 'CHOOSING', val: 0, choosing: true },
      b: { state: 'CHOOSING', val: 0, choosing: true },
    },
    {
      title: "The Collision",
      desc: "Both read 'Max=5' and take '6'. Without the Choosing flag, a reader might see a 'half-written' number here.",
      a: { state: 'WAITING', val: 6, choosing: false },
      b: { state: 'WAITING', val: 6, choosing: false },
    },
    {
      title: "The Strict Ordering",
      desc: "Tie resolved! (Ticket: 6, ID: 0) < (Ticket: 6, ID: 1). ID 0 enters the critical section first.",
      a: { state: 'CRITICAL', val: 6, choosing: false },
      b: { state: 'WAITING', val: 6, choosing: false },
    }
  ];

  const curr = steps[step];

  return (
    <div className="my-16 p-1 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-rose-500/20 rounded-[2.5rem] overflow-hidden shadow-2xl">
      <div className="bg-[#08080a] rounded-[2.4rem] p-8 md:p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/3 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono text-amber-400 uppercase tracking-widest">
                 Scenario: Doorway Race
              </div>
              <h3 className="text-3xl font-bold text-white tracking-tight leading-none h-20 flex items-center">
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={curr.title}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                  >
                    {curr.title}
                  </motion.span>
                </AnimatePresence>
              </h3>
              <p className="text-slate-400 leading-relaxed text-lg min-h-[100px]">
                {curr.desc}
              </p>
              
              <div className="flex items-center gap-4 pt-4">
                <button 
                  disabled={step === 0}
                  onClick={() => setStep(s => s - 1)}
                  className="p-2 rounded-full border border-white/10 hover:bg-white/5 disabled:opacity-30 transition-all"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <div className="flex-1 flex gap-2">
                  {steps.map((_, i) => (
                    <div 
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-white/10'}`}
                    />
                  ))}
                </div>
                <button 
                  disabled={step === steps.length - 1}
                  onClick={() => setStep(s => s + 1)}
                  className="p-2 rounded-full border border-white/10 hover:bg-white/5 disabled:opacity-30 transition-all"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
               <AnimatePresence mode="wait">
                 <motion.div 
                   key={step + 'a'}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.1 }}
                 >
                   <ProcessCard label="Process A" id={0} data={curr.a} color={COLORS.amber} />
                 </motion.div>
                 <motion.div 
                   key={step + 'b'}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.2 }}
                 >
                   <ProcessCard label="Process B" id={1} data={curr.b} color={COLORS.rose} />
                 </motion.div>
               </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProcessCard({ label, id, data, color }: any) {
  return (
    <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 relative overflow-hidden group hover:border-white/20 transition-colors">
      <div className="absolute top-0 right-0 p-4 opacity-10">
         <Fingerprint className="w-12 h-12" style={{ color }} />
      </div>
      
      <div className="flex items-center gap-4 mb-6">
         <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg" style={{ backgroundColor: color }}>
            {id}
         </div>
         <div>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{label}</p>
            <p className={`text-sm font-bold ${data.state === 'CRITICAL' ? 'text-emerald-400' : 'text-white'}`}>
              {data.state}
            </p>
         </div>
      </div>

      <div className="space-y-4">
         <div className="flex justify-between items-end">
            <span className="text-xs text-slate-500 font-mono">Intent (choosing)</span>
            <span className={`text-xs font-bold font-mono ${data.choosing ? 'text-emerald-400 animate-pulse' : 'text-slate-600'}`}>
               {data.choosing ? 'GUARDED' : 'IDLE'}
            </span>
         </div>
         <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={false}
              animate={{ width: data.choosing ? '100%' : '0%', backgroundColor: color }}
              className="h-full shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            />
         </div>

         <div className="pt-4 grid grid-cols-2 gap-4">
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-center">
               <p className="text-[9px] text-slate-500 uppercase mb-1">Ticket</p>
               <p className="text-2xl font-black text-white">{data.val === 0 ? '—' : data.val}</p>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-center">
               <p className="text-[9px] text-slate-500 uppercase mb-1">Node ID</p>
               <p className="text-2xl font-black text-white">{id}</p>
            </div>
         </div>
      </div>
    </div>
  );
}

// ============================================================
// 3. PROCESS NEXUS (Radial Simulation)
// High-energy visualization of mutual exclusion
// ============================================================

export function ProcessNexus() {
  const [numProcesses] = useState(6);
  const [processes, setProcesses] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [checkingId, setCheckingId] = useState<number | null>(null);
  const [targetId, setTargetId] = useState<number | null>(null);
  const [checkType, setCheckType] = useState<'CHOOSING' | 'NUMBER' | null>(null);
  const isMountedRef = useRef(true);
  const processesRef = useRef<any[]>([]);

  useEffect(() => {
    const initial = Array.from({ length: numProcesses }, (_, i) => ({
      id: i,
      state: 'IDLE',
      number: 0,
      choosing: false
    }));
    setProcesses(initial);
    processesRef.current = initial;
    return () => { isMountedRef.current = false; };
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

    // 1. Choosing
    updateProcess(id, { state: 'CHOOSING', choosing: true });
    await new Promise(r => setTimeout(r, 800));
    
    // In Bakery, we pick max + 1. 
    // We use the latest ref to avoid race conditions in the simulation itself.
    const maxNum = Math.max(...processesRef.current.map(p => p.number)) + 1;
    updateProcess(id, { state: 'WAITING', number: maxNum, choosing: false });

    // 2. Checking Others
    setCheckingId(id);
    for (let j = 0; j < numProcesses; j++) {
      if (id === j) continue;
      if (!isMountedRef.current) return;
      
      setTargetId(j);
      
      // Step A: Wait while choosing[j] is true
      setCheckType('CHOOSING');
      await new Promise(r => setTimeout(r, 400));
      
      // Step B: Wait while number[j] is smaller
      setCheckType('NUMBER');
      await new Promise(r => setTimeout(r, 400));
    }
    setCheckingId(null);
    setTargetId(null);
    setCheckType(null);

    if (!isMountedRef.current) return;

    // 3. Enter
    updateProcess(id, { state: 'CRITICAL' });
    setActiveId(id);
    await new Promise(r => setTimeout(r, 3000));
    
    if (!isMountedRef.current) return;

    // 4. Exit
    setActiveId(null);
    updateProcess(id, { state: 'IDLE', number: 0 });
  };

  return (
    <div className="my-12 relative h-[650px] w-full flex items-center justify-center bg-[#050507] rounded-[3rem] border border-white/5 overflow-hidden shadow-inner">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,transparent_70%)]" />
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <div className="relative z-10 w-56 h-56 rounded-full flex items-center justify-center">
         <div className={`absolute inset-0 rounded-full blur-[80px] transition-all duration-1000 ${activeId !== null ? 'bg-emerald-500/30 scale-150' : 'bg-blue-500/5 scale-100'}`} />
         
         <div className={`w-40 h-40 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-700 ${activeId !== null ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_40px_rgba(16,185,129,0.2)]' : 'border-white/10 bg-white/5'}`}>
            <AnimatePresence mode="wait">
              {activeId !== null ? (
                <motion.div 
                  key="lock"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center"
                >
                  <Lock className="w-10 h-10 text-emerald-400 mb-2 animate-pulse" />
                  <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">Exclusive Access</p>
                  <p className="text-sm font-black text-emerald-400 mt-1">P{activeId} ACTIVE</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="unlock"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center"
                >
                  <Unlock className="w-10 h-10 text-slate-700 mb-2" />
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Resource Free</p>
                </motion.div>
              )}
            </AnimatePresence>
         </div>
      </div>

      {/* Check Status HUD */}
      {checkingId !== null && targetId !== null && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl z-20 flex items-center gap-4 shadow-2xl">
           <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
           <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="text-amber-400">P{checkingId}</span>
              <span className="text-slate-500">verifying</span>
              <span className="text-blue-400">P{targetId}</span>
              <div className="w-px h-3 bg-white/10 mx-1" />
              <span className="text-white font-bold">{checkType === 'CHOOSING' ? 'Intent Check' : 'Priority Check'}</span>
           </div>
        </div>
      )}

      {processes.map((p, i) => {
        const angle = (i / numProcesses) * Math.PI * 2 - Math.PI / 2;
        const radius = 240;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        const isTarget = targetId === i;
        const isChecker = checkingId === i;

        return (
          <div 
            key={i}
            className="absolute transition-all duration-1000 z-10"
            style={{ transform: `translate(${x}px, ${y}px)` }}
          >
            <motion.button
              onClick={() => runCycle(i)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-24 h-24 rounded-3xl border-2 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 ${
                p.state === 'CRITICAL' ? 'border-emerald-500 bg-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.4)]' :
                p.state === 'WAITING' ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_25px_rgba(245,158,11,0.2)]' :
                p.state === 'CHOOSING' ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]' :
                'border-white/10 bg-white/5 hover:border-white/30'
              } ${isTarget ? 'ring-4 ring-blue-400/30 border-blue-400' : ''}`}
            >
              <div className="absolute top-0 left-0 w-full h-1 opacity-20 bg-gradient-to-r from-transparent via-white to-transparent" />
              <span className="text-[10px] font-mono text-slate-500 uppercase mb-1">NODE {i}</span>
              <span className="text-2xl font-black text-white">{p.number || '—'}</span>
              
              {isChecker && (
                <motion.div 
                  layoutId="checker-aura"
                  className="absolute inset-0 border-2 border-amber-400 rounded-3xl animate-pulse" 
                />
              )}
            </motion.button>

            {/* Connection beam */}
            {isChecker && targetId !== null && (
               <svg className="absolute top-1/2 left-1/2 pointer-events-none overflow-visible" style={{ width: 0, height: 0 }}>
                  <motion.line
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    x1="0" y1="0"
                    x2={Math.cos((targetId / numProcesses) * Math.PI * 2 - Math.PI / 2 - angle) * radius}
                    y2={Math.sin((targetId / numProcesses) * Math.PI * 2 - Math.PI / 2 - angle) * radius}
                    stroke={COLORS.amber}
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    className="opacity-40"
                  />
               </svg>
            )}
          </div>
        );
      })}

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-8 px-8 py-3 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-md">
         <LegendItem color="bg-slate-800" label="Idle" />
         <LegendItem color="bg-blue-500" label="Choosing" />
         <LegendItem color="bg-amber-500" label="Waiting" />
         <LegendItem color="bg-emerald-500" label="Critical" />
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-[10px] text-slate-400 uppercase font-mono tracking-widest">{label}</span>
    </div>
  );
}

// ============================================================
// 4. MEMORY RESILIENCE LENS
// Shows "Torn Reads" and logic safety
// ============================================================

export function MemoryResilienceViz() {
  const [noise, setNoise] = useState(0);
  const [intensity, setNoiseIntensity] = useState(0.5);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setNoise(Math.random());
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="my-12 p-8 bg-[#0a0a0c] border border-white/10 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-rose-500/5" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
        <div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-6 border border-rose-500/20">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
          </div>
          <h4 className="text-2xl font-bold text-white mb-4 tracking-tight">
            Non-Atomic Hardware Resilience
          </h4>
          <p className="text-slate-400 leading-relaxed mb-8">
            In standard systems, a &ldquo;torn read&rdquo; (reading while a write is in progress) 
            is catastrophic. Lamport&rsquo;s algorithm achieves safety through <strong>logical sequence</strong> 
            rather than physical isolation.
          </p>
          
          <div className="space-y-4">
             <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors group">
                <div className="flex items-center gap-3 mb-2">
                   <Activity className="w-4 h-4 text-amber-400" />
                   <span className="text-xs font-bold text-white uppercase tracking-widest">The Glitch</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  A process might read <code className="text-rose-400">0xFFFF</code> while 
                  the hardware is halfway through writing <code className="text-emerald-400">0x0001</code>.
                </p>
             </div>
             
             <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 group">
                <div className="flex items-center gap-3 mb-2">
                   <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                   <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">The Solution</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  The <code className="text-emerald-300">choosing</code> loop ensures that no process 
                  checks priorities until all concurrent ticket-selections have stabilized.
                </p>
             </div>
          </div>
        </div>

        <div className="relative group">
           {/* Visual representation of a glitching memory register */}
           <div className="relative aspect-square max-w-[320px] mx-auto p-6 bg-black rounded-[2rem] border-2 border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col justify-between font-mono overflow-hidden">
              <div className="flex justify-between items-center text-[10px] text-slate-500">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <span>UNSTABLE_BUS_0xBA</span>
                 </div>
                 <span className="text-amber-500 font-bold">DIRTY READ</span>
              </div>
              
              <div className="relative py-12 text-center">
                 {/* Glitching background digits */}
                 <div className="absolute inset-0 flex items-center justify-center text-8xl font-black text-white/5 select-none">
                    {Math.floor(Math.random() * 1000)}
                 </div>
                 
                 {/* The "Torn" value */}
                 <div className="relative">
                    <div className="text-7xl font-black text-white tracking-tighter" 
                         style={{ 
                           filter: `blur(${noise * 6 * intensity}px)`, 
                           transform: `translateX(${(noise - 0.5) * 20 * intensity}px) skew(${(noise - 0.5) * 10}deg)` 
                         }}>
                       42
                    </div>
                    {/* Ghost values */}
                    <div className="absolute inset-0 text-7xl font-black text-rose-500/20" 
                         style={{ transform: `translate(${(noise - 0.5) * 40}px, 2px)` }}>
                       ??
                    </div>
                 </div>
              </div>

              <div className="space-y-3">
                 <div className="flex justify-between text-[9px] text-slate-600">
                    <span>VOLTAGE_SIG</span>
                    <span>{Math.floor(noise * 100)}%</span>
                 </div>
                 <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ width: [ "40%", "90%", "60%", "100%", "30%" ] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="h-full bg-amber-500/50"
                    />
                 </div>
              </div>
           </div>
           
           {/* Interactive Slider */}
           <div className="mt-8 px-4">
              <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase mb-2">
                 <span>Hardware Noise</span>
                 <span>{Math.round(intensity * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="1" step="0.01" 
                value={intensity}
                onChange={(e) => setNoiseIntensity(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-amber-500"
              />
           </div>

           {/* Scanning Line */}
           <motion.div 
             animate={{ y: [0, 320, 0] }}
             transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
             className="absolute top-0 left-0 w-full h-0.5 bg-cyan-400/40 shadow-[0_0_20px_rgba(34,211,238,0.6)] z-20 pointer-events-none"
           />
        </div>
      </div>
    </div>
  );
}
