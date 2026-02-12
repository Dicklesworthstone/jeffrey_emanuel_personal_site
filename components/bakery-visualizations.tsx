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
  Activity
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
    let renderer: THREE.WebGLRenderer;
    let isMounted = true;

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

      // Create a "Vortex" of tickets
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
        
        // Random spiral positioning
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

      // Central core of "Consensus"
      const coreGeo = new THREE.IcosahedronGeometry(8, 1);
      const coreMat = new THREE.MeshBasicMaterial({ 
        color: COLORS.amber, 
        wireframe: true,
        transparent: true,
        opacity: 0.2
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      scene.add(core);

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

        renderer.render(scene, camera);
      };

      animate();

      const handleResize = () => {
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
      if (renderer) {
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
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
           className="px-6 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-3xl"
         >
            <p className="text-[10px] font-mono text-amber-400 uppercase tracking-[0.4em]">Decentralized Consensus Engine</p>
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
      desc: "Process A and B both decide to enter. They haven't set their 'choosing' flag yet.",
      a: { state: 'IDLE', val: 0, choosing: false },
      b: { state: 'IDLE', val: 0, choosing: false },
    },
    {
      title: "The Doorway Entry",
      desc: "Crucial: They set 'choosing = true'. This warns others: 'I am currently picking a number.'",
      a: { state: 'CHOOSING', val: 0, choosing: true },
      b: { state: 'CHOOSING', val: 0, choosing: true },
    },
    {
      title: "The Race Result",
      desc: "Because of concurrency, they both read 'Max=5' and both take '6'. A collision!",
      a: { state: 'WAITING', val: 6, choosing: false },
      b: { state: 'WAITING', val: 6, choosing: false },
    },
    {
      title: "Process ID Resolution",
      desc: "The algorithm checks: (6, ID:A) vs (6, ID:B). Since A < B, Process A enters first.",
      a: { state: 'CRITICAL', val: 6, choosing: false },
      b: { state: 'WAITING', val: 6, choosing: false },
    }
  ];

  const curr = steps[step];

  return (
    <div className="my-16 p-1 bg-gradient-to-br from-amber-500/20 to-rose-500/20 rounded-[2.5rem] overflow-hidden">
      <div className="bg-[#08080a] rounded-[2.4rem] p-8 md:p-12 relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        <div className="relative z-10 flex flex-col lg:flex-row gap-12">
          <div className="lg:w-1/3 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono text-amber-400 uppercase tracking-widest">
               Step {step + 1} of 4
            </div>
            <h3 className="text-3xl font-bold text-white tracking-tight leading-none">{curr.title}</h3>
            <p className="text-slate-400 leading-relaxed text-lg">{curr.desc}</p>
            
            <div className="flex gap-2 pt-4">
              {steps.map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setStep(i)}
                  className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-amber-500' : 'bg-white/10'}`}
                />
              ))}
            </div>
          </div>

          <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
             <ProcessCard label="Process A" id={0} data={curr.a} color={COLORS.amber} />
             <ProcessCard label="Process B" id={1} data={curr.b} color={COLORS.rose} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProcessCard({ label, id, data, color }: any) {
  return (
    <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10">
         <Fingerprint className="w-12 h-12" style={{ color }} />
      </div>
      
      <div className="flex items-center gap-4 mb-6">
         <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg" style={{ backgroundColor: color }}>
            {id}
         </div>
         <div>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-bold text-white">{data.state}</p>
         </div>
      </div>

      <div className="space-y-4">
         <div className="flex justify-between items-end">
            <span className="text-xs text-slate-500 font-mono">Choosing Flag</span>
            <span className={`text-xs font-bold font-mono ${data.choosing ? 'text-emerald-400' : 'text-slate-600'}`}>
               {data.choosing ? 'TRUE' : 'FALSE'}
            </span>
         </div>
         <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={false}
              animate={{ width: data.choosing ? '100%' : '0%', backgroundColor: color }}
              className="h-full"
            />
         </div>

         <div className="pt-4 flex justify-between items-center">
            <div className="text-center flex-1">
               <p className="text-[9px] text-slate-500 uppercase mb-1">Ticket</p>
               <p className="text-3xl font-black text-white">{data.val === 0 ? '—' : data.val}</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center flex-1">
               <p className="text-[9px] text-slate-500 uppercase mb-1">ID</p>
               <p className="text-3xl font-black text-white">{id}</p>
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
  const isMountedRef = useRef(true);

  useEffect(() => {
    setProcesses(Array.from({ length: numProcesses }, (_, i) => ({
      id: i,
      state: 'IDLE',
      number: 0,
      choosing: false
    })));
    return () => { isMountedRef.current = false; };
  }, [numProcesses]);

  const updateProcess = (id: number, updates: any) => {
    if (!isMountedRef.current) return;
    setProcesses(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const runCycle = async (id: number) => {
    if (processes[id]?.state !== 'IDLE') return;

    // 1. Choosing
    updateProcess(id, { state: 'CHOOSING', choosing: true });
    await new Promise(r => setTimeout(r, 1000));
    
    const maxNum = Math.max(...processes.map(p => p.number)) + 1;
    updateProcess(id, { state: 'WAITING', number: maxNum, choosing: false });

    // 2. Checking Others
    setCheckingId(id);
    for (let j = 0; j < numProcesses; j++) {
      if (id === j) continue;
      if (!isMountedRef.current) return;
      
      setTargetId(j);
      // Simulate the loop checks
      await new Promise(r => setTimeout(r, 400));
    }
    setCheckingId(null);
    setTargetId(null);

    // 3. Enter
    updateProcess(id, { state: 'CRITICAL' });
    setActiveId(id);
    await new Promise(r => setTimeout(r, 3000));
    
    // 4. Exit
    setActiveId(null);
    updateProcess(id, { state: 'IDLE', number: 0 });
  };

  return (
    <div className="my-12 relative h-[600px] w-full flex items-center justify-center bg-black/40 rounded-[3rem] border border-white/5 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)]" />
      
      {/* Central Critical Section */}
      <div className="relative z-10 w-48 h-48 rounded-full flex items-center justify-center">
         <div className={`absolute inset-0 rounded-full blur-3xl transition-all duration-1000 ${activeId !== null ? 'bg-emerald-500/20 scale-150' : 'bg-white/5 scale-100'}`} />
         <div className={`w-32 h-32 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-500 ${activeId !== null ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-white/5'}`}>
            <Lock className={`w-8 h-8 mb-2 transition-colors ${activeId !== null ? 'text-emerald-400 animate-pulse' : 'text-slate-700'}`} />
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">Critical Zone</p>
            {activeId !== null && (
              <motion.p 
                initial={{ opacity: 0, y: 5 }} 
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-bold text-emerald-400 mt-1"
              >
                PROCESS {activeId} ACTIVE
              </motion.p>
            )}
         </div>
      </div>

      {/* Process Ring */}
      {processes.map((p, i) => {
        const angle = (i / numProcesses) * Math.PI * 2 - Math.PI / 2;
        const radius = 220;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <div 
            key={i}
            className="absolute transition-all duration-1000"
            style={{ transform: `translate(${x}px, ${y}px)` }}
          >
            <motion.button
              onClick={() => runCycle(i)}
              whileHover={{ scale: 1.1 }}
              className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 ${
                p.state === 'CRITICAL' ? 'border-emerald-500 bg-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.3)]' :
                p.state === 'WAITING' ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.2)]' :
                p.state === 'CHOOSING' ? 'border-blue-500 bg-blue-500/10' :
                'border-white/10 bg-white/5 hover:border-white/30'
              }`}
            >
              <span className="text-[10px] font-mono text-slate-500 uppercase mb-1">P{i}</span>
              <span className="text-xl font-black text-white">{p.number || '—'}</span>
              
              {/* Pulse check indicator */}
              {checkingId === i && (
                <div className="absolute inset-0 border-4 border-amber-400 rounded-2xl animate-ping opacity-20" />
              )}
            </motion.button>

            {/* Connection line to center when checking */}
            {(checkingId === i || targetId === i) && (
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <div className={`w-1 h-1 rounded-full animate-pulse ${checkingId === i ? 'bg-amber-400' : 'bg-blue-400'}`} />
               </div>
            )}
          </div>
        );
      })}

      {/* Interaction Prompts */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6">
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white/5 border border-white/20" />
            <span className="text-[10px] text-slate-500 uppercase font-mono">Idle</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-[10px] text-slate-500 uppercase font-mono">Queueing</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-slate-500 uppercase font-mono">In Core</span>
         </div>
      </div>
    </div>
  );
}

// ============================================================
// 4. MEMORY RESILIENCE LENS
// Shows "Torn Reads" and logic safety
// ============================================================

export function MemoryResilienceViz() {
  const [noise, setNoise] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setNoise(Math.random());
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="my-12 p-8 bg-white/[0.02] border border-white/10 rounded-[2rem] relative overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            Non-Atomic Resilience
          </h4>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            In standard systems, a &ldquo;torn read&rdquo; (reading a value while it is being written) 
            causes total failure. Lamport&rsquo;s algorithm turns this hardware weakness into 
            software strength.
          </p>
          <div className="space-y-3">
             <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                <Activity className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
                <p className="text-[11px] text-slate-300">A process might read a garbage value like &ldquo;7&rdquo; when it was actually &ldquo;12&rdquo;.</p>
             </div>
             <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                <p className="text-[11px] text-slate-300">The <code>choosing</code> loop forces the reader to wait until the write stabilizes.</p>
             </div>
          </div>
        </div>

        <div className="relative aspect-square max-w-[300px] mx-auto">
           {/* Visual representation of a glitching memory register */}
           <div className="absolute inset-0 flex flex-col justify-between p-4 bg-black/60 rounded-2xl border border-white/10 font-mono overflow-hidden">
              <div className="flex justify-between items-center text-[10px] text-slate-500">
                 <span>SHARED_MEM_0x4F</span>
                 <span className="text-amber-500">WRITING...</span>
              </div>
              
              <div className="relative py-8 text-center">
                 {/* Glitching numbers */}
                 <div className="text-6xl font-black text-white tracking-tighter opacity-20">
                    {Math.floor(Math.random() * 100)}
                 </div>
                 <div className="absolute inset-0 flex items-center justify-center text-6xl font-black text-white" 
                      style={{ filter: `blur(${noise * 4}px)`, transform: `translateX(${(noise - 0.5) * 10}px)` }}>
                    42
                 </div>
              </div>

              <div className="space-y-1">
                 <div className="h-1 bg-amber-500/40 rounded-full w-full" />
                 <div className="h-1 bg-amber-500/20 rounded-full w-[60%]" />
              </div>
           </div>
           
           {/* Holographic scanner */}
           <motion.div 
             animate={{ y: [0, 280, 0] }}
             transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
             className="absolute top-0 left-0 w-full h-1 bg-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.5)] z-20"
           />
        </div>
      </div>
    </div>
  );
}
