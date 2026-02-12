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
  Timer
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
// 1. BAKERY HERO (Three.js)
// Shows an abstract representation of processes queuing
// ============================================================

export function BakeryHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationId: number;
    let renderer: THREE.WebGLRenderer;
    let geometries: THREE.BufferGeometry[] = [];
    let materials: THREE.Material[] = [];
    let isMounted = true;
    let currentHandleResize: () => void;

    const init = async () => {
      try {
        const THREE = await import("three");
        if (!isMounted || !container) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          75,
          container.clientWidth / container.clientHeight,
          0.1,
          1000
        );
        camera.position.z = 50;

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const count = 200;
        const geometry = new THREE.BufferGeometry();
        geometries.push(geometry);
        
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        const colorA = new THREE.Color(COLORS.amber);
        const colorB = new THREE.Color(COLORS.rose);

        for (let i = 0; i < count; i++) {
          positions[i * 3] = (Math.random() - 0.5) * 100;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

          const mixedColor = colorA.clone().lerp(colorB, Math.random());
          colors[i * 3] = mixedColor.r;
          colors[i * 3 + 1] = mixedColor.g;
          colors[i * 3 + 2] = mixedColor.b;

          sizes[i] = Math.random() * 2 + 1;
        }

        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
          size: 1.5,
          vertexColors: true,
          transparent: true,
          opacity: 0.6,
          blending: THREE.AdditiveBlending,
        });
        materials.push(material);

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        const lineMaterial = new THREE.LineBasicMaterial({ 
          color: COLORS.amber, 
          transparent: true, 
          opacity: 0.1 
        });
        materials.push(lineMaterial);
        
        for (let i = 0; i < 5; i++) {
          const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-100, (i - 2) * 20, 0),
            new THREE.Vector3(100, (i - 2) * 20, 0),
          ]);
          geometries.push(lineGeometry);
          const line = new THREE.Line(lineGeometry, lineMaterial);
          scene.add(line);
        }

        const animate = () => {
          if (!isMounted) return;
          animationId = requestAnimationFrame(animate);
          points.rotation.y += 0.001;
          points.rotation.x += 0.0005;

          const posAttr = geometry.attributes.position;
          const arr = posAttr.array as Float32Array;
          for (let i = 0; i < count; i++) {
            arr[i * 3] += 0.1;
            if (arr[i * 3] > 50) arr[i * 3] = -50;
          }
          posAttr.needsUpdate = true;

          renderer.render(scene, camera);
        };

        animate();

        currentHandleResize = () => {
          if (!container || !renderer || !camera) return;
          camera.aspect = container.clientWidth / container.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(container.clientWidth, container.clientHeight);
        };
        window.addEventListener("resize", currentHandleResize);
      } catch (e) {
        console.error("BakeryHero init failed", e);
      }
    };

    init();

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationId);
      if (currentHandleResize) window.removeEventListener("resize", currentHandleResize);
      geometries.forEach(g => g.dispose());
      materials.forEach(m => m.dispose());
      if (renderer) {
        renderer.dispose();
        if (container && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[400px] relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020204]/20 to-[#020204] pointer-events-none" />
    </div>
  );
}

// ============================================================
// 2. BAKERY LIVE DEMO (TypeScript Implementation)
// Real-time execution of the algorithm
// ============================================================

type ProcessState = "IDLE" | "CHOOSING" | "WAITING" | "CRITICAL";

interface Process {
  id: number;
  state: ProcessState;
  number: number;
  choosing: boolean;
  progress: number; // 0-100 for waiting/choosing
}

export function BakeryLiveDemo() {
  const [numProcesses, setNumProcesses] = useState(5);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [criticalSectionOccupiedBy, setCriticalSectionOccupiedBy] = useState<number | null>(null);
  const [logs, setLogs] = useState<{msg: string, type: 'info' | 'success' | 'warn'}[]>([]);
  const isMountedRef = useRef(true);

  // Ref for latest processes to avoid stale closures in interval
  const processesRef = useRef<Process[]>([]);
  useEffect(() => {
    processesRef.current = processes;
  }, [processes]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Initialize processes
  useEffect(() => {
    const p = Array.from({ length: numProcesses }, (_, i) => ({
      id: i,
      state: "IDLE" as ProcessState,
      number: 0,
      choosing: false,
      progress: 0,
    }));
    setProcesses(p);
  }, [numProcesses]);

  const addLog = (msg: string, type: 'info' | 'success' | 'warn' = 'info') => {
    if (!isMountedRef.current) return;
    setLogs(prev => [{ msg, type }, ...prev].slice(0, 5));
  };

  const updateProcess = (id: number, updates: Partial<Process>) => {
    if (!isMountedRef.current) return;
    setProcesses(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const simulateProcess = async (id: number) => {
    if (!isMountedRef.current) return;

    // 1. Choosing a number
    updateProcess(id, { state: "CHOOSING", choosing: true, progress: 0 });
    addLog(`Process ${id} is choosing a number...`);
    
    // Simulate non-atomic read of all numbers
    for (let i = 0; i <= 100; i += 20) {
      if (!isMountedRef.current) return;
      updateProcess(id, { progress: i });
      await new Promise(r => setTimeout(r, 100 + Math.random() * 200));
    }

    if (!isMountedRef.current) return;

    // Use ref to get truly latest state for number calculation
    const maxNum = Math.max(...processesRef.current.map(p => p.number));
    const myNum = maxNum + 1;

    setProcesses(prev => prev.map(p => p.id === id ? { 
      ...p, 
      number: myNum, 
      choosing: false, 
      state: "WAITING" as ProcessState, 
      progress: 0 
    } : p));
    
    addLog(`Process ${id} took number ${myNum}`, 'info');

    // 2. Waiting turn
    let turnReady = false;
    while (turnReady === false) {
      if (!isMountedRef.current) return;

      const currentProcesses = processesRef.current;
      const myProcess = currentProcesses.find(p => p.id === id)!;
      let conflict = false;

      for (const other of currentProcesses) {
        if (other.id === id) continue;
        
        // Wait if other is choosing
        if (other.choosing) {
          conflict = true;
          break;
        }

        // Wait if other has a smaller number, or same number but smaller ID
        if (other.number !== 0) {
          if (other.number < myProcess.number || (other.number === myProcess.number && other.id < id)) {
            conflict = true;
            break;
          }
        }
      }

      if (!conflict) {
        turnReady = true;
      } else {
        await new Promise(r => setTimeout(r, 400));
      }
    }

    if (!isMountedRef.current) return;

    // 3. Enter Critical Section
    updateProcess(id, { state: "CRITICAL", progress: 100 });
    setCriticalSectionOccupiedBy(id);
    addLog(`Process ${id} entered Critical Section!`, 'success');
    
    await new Promise(r => setTimeout(r, 2000 + Math.random() * 1000));

    if (!isMountedRef.current) return;

    // 4. Exit
    setCriticalSectionOccupiedBy(null);
    updateProcess(id, { state: "IDLE", number: 0, progress: 0 });
    addLog(`Process ${id} exited Critical Section.`, 'info');
  };

  const triggerProcess = (id: number) => {
    // Check ref instead of state to avoid stale closure if called rapidly
    if (processesRef.current[id].state === "IDLE") {
      simulateProcess(id);
    }
  };

  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => {
      const idleProcesses = processesRef.current.filter(p => p.state === "IDLE");
      if (idleProcesses.length > 0 && Math.random() > 0.7) {
        const p = idleProcesses[Math.floor(Math.random() * idleProcesses.length)];
        simulateProcess(p.id);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-sm">
      <div className="p-6 md:p-8 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Timer className="w-5 h-5 text-amber-400" />
            Bakery Live Simulator
          </h3>
          <p className="text-xs text-slate-400 font-mono uppercase tracking-widest mt-1">
            Visualizing RFC-level Determinism in JS
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-tighter transition-all ${isRunning ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}
          >
            {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {isRunning ? 'Stop Auto' : 'Start Auto'}
          </button>
          <button 
            onClick={() => {
              setProcesses(processes.map(p => ({ ...p, state: "IDLE", number: 0, choosing: false, progress: 0 })));
              setCriticalSectionOccupiedBy(null);
              setLogs([]);
            }}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
        {/* Processes List */}
        <div className="lg:col-span-2 p-6 md:p-8 space-y-4">
          {processes.map((p) => (
            <div 
              key={p.id}
              className={`relative group p-4 rounded-2xl border transition-all duration-500 ${
                p.state === 'CRITICAL' ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.1)]' :
                p.state === 'WAITING' ? 'bg-amber-500/5 border-amber-500/20' :
                p.state === 'CHOOSING' ? 'bg-blue-500/5 border-blue-500/20' :
                'bg-white/[0.02] border-white/5'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                    p.state === 'CRITICAL' ? 'bg-emerald-500 text-white' :
                    p.state === 'WAITING' ? 'bg-amber-500 text-white' :
                    p.state === 'CHOOSING' ? 'bg-blue-500 text-white' :
                    'bg-white/10 text-slate-400'
                  }`}>
                    P{p.id}
                  </div>
                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-slate-500">Status</span>
                    <p className={`text-sm font-bold ${
                       p.state === 'CRITICAL' ? 'text-emerald-400' :
                       p.state === 'WAITING' ? 'text-amber-400' :
                       p.state === 'CHOOSING' ? 'text-blue-400' :
                       'text-slate-400'
                    }`}>
                      {p.state}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono uppercase tracking-widest text-slate-500">Ticket</span>
                  <p className="text-xl font-black text-white leading-none mt-1">
                    {p.number === 0 ? "—" : `#${p.number}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={false}
                    animate={{ 
                      width: `${p.progress}%`,
                      backgroundColor: p.state === 'CRITICAL' ? COLORS.emerald : p.state === 'WAITING' ? COLORS.amber : COLORS.blue
                    }}
                    className="h-full"
                  />
                </div>
                {p.state === 'IDLE' && (
                  <button 
                    onClick={() => triggerProcess(p.id)}
                    className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-400 transition-all"
                  >
                    Request
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Info & Logs */}
        <div className="p-6 md:p-8 space-y-8 bg-black/20">
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-4">Critical Section</h4>
            <div className={`h-24 rounded-2xl border flex flex-col items-center justify-center transition-all duration-500 ${
              criticalSectionOccupiedBy !== null ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/5 border-white/5 opacity-50'
            }`}>
              {criticalSectionOccupiedBy !== null ? (
                <>
                  <Lock className="w-6 h-6 text-emerald-500 mb-2 animate-pulse" />
                  <p className="text-xs font-bold text-emerald-400">P{criticalSectionOccupiedBy} is working</p>
                </>
              ) : (
                <>
                  <Unlock className="w-6 h-6 text-slate-600 mb-2" />
                  <p className="text-xs font-bold text-slate-600">Available</p>
                </>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-4">Event Log</h4>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {logs.map((log, i) => (
                  <motion.div 
                    key={log.msg + i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`text-[11px] leading-relaxed p-2 rounded-lg border ${
                      log.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' :
                      log.type === 'warn' ? 'bg-rose-500/5 border-rose-500/10 text-rose-400' :
                      'bg-white/5 border-white/5 text-slate-400'
                    }`}
                  >
                    {log.msg}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 3. TIE BREAKER VISUALIZATION
// Explains (Number, ID) < (Number, ID)
// ============================================================

export function TieBreakerViz() {
  const [val1, setVal1] = useState({ num: 5, id: 2 });
  const [val2, setVal2] = useState({ num: 5, id: 4 });

  const isSmaller = (v1: {num: number, id: number}, v2: {num: number, id: number}) => {
    if (v1.num < v2.num) return true;
    if (v1.num === v2.num && v1.id < v2.id) return true;
    return false;
  };

  const result = isSmaller(val1, val2);

  return (
    <div className="my-12 p-8 bg-white/[0.02] border border-white/10 rounded-[2rem] relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Users className="w-24 h-24 text-blue-400" />
      </div>

      <div className="relative z-10">
        <h4 className="text-xl font-bold text-white mb-2">Lexicographical Tie-Breaking</h4>
        <p className="text-sm text-slate-400 mb-8 max-w-xl">
          When two processes take the same number simultaneously, the algorithm breaks the tie using their unique Process IDs.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          {/* Process 1 */}
          <div className="space-y-4 text-center">
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Process A</div>
            <div className="flex gap-2">
              <div className="space-y-1">
                <button onClick={() => setVal1(v => ({ ...v, num: Math.max(1, v.num - 1) }))} className="w-8 h-8 bg-white/5 rounded border border-white/10 text-white">-</button>
                <div className="w-16 h-16 bg-blue-500/20 border-2 border-blue-500/40 rounded-xl flex items-center justify-center text-2xl font-black text-white">{val1.num}</div>
                <button onClick={() => setVal1(v => ({ ...v, num: v.num + 1 }))} className="w-8 h-8 bg-white/5 rounded border border-white/10 text-white">+</button>
                <div className="text-[9px] font-mono text-slate-500 uppercase">Number</div>
              </div>
              <div className="space-y-1">
                <button onClick={() => setVal1(v => ({ ...v, id: Math.max(0, v.id - 1) }))} className="w-8 h-8 bg-white/5 rounded border border-white/10 text-white">-</button>
                <div className="w-16 h-16 bg-slate-800 border-2 border-white/10 rounded-xl flex items-center justify-center text-2xl font-black text-white">{val1.id}</div>
                <button onClick={() => setVal1(v => ({ ...v, id: v.id + 1 }))} className="w-8 h-8 bg-white/5 rounded border border-white/10 text-white">+</button>
                <div className="text-[9px] font-mono text-slate-500 uppercase">ID</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-4xl font-black text-white mb-2">{result ? "<" : ">"}</div>
            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-500">
               Comparison
            </div>
          </div>

          {/* Process 2 */}
          <div className="space-y-4 text-center">
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Process B</div>
            <div className="flex gap-2">
              <div className="space-y-1">
                <button onClick={() => setVal2(v => ({ ...v, num: Math.max(1, v.num - 1) }))} className="w-8 h-8 bg-white/5 rounded border border-white/10 text-white">-</button>
                <div className="w-16 h-16 bg-blue-500/20 border-2 border-blue-500/40 rounded-xl flex items-center justify-center text-2xl font-black text-white">{val2.num}</div>
                <button onClick={() => setVal2(v => ({ ...v, num: v.num + 1 }))} className="w-8 h-8 bg-white/5 rounded border border-white/10 text-white">+</button>
                <div className="text-[9px] font-mono text-slate-500 uppercase">Number</div>
              </div>
              <div className="space-y-1">
                <button onClick={() => setVal2(v => ({ ...v, id: Math.max(0, v.id - 1) }))} className="w-8 h-8 bg-white/5 rounded border border-white/10 text-white">-</button>
                <div className="w-16 h-16 bg-slate-800 border-2 border-white/10 rounded-xl flex items-center justify-center text-2xl font-black text-white">{val2.id}</div>
                <button onClick={() => setVal2(v => ({ ...v, id: v.id + 1 }))} className="w-8 h-8 bg-white/5 rounded border border-white/10 text-white">+</button>
                <div className="text-[9px] font-mono text-slate-500 uppercase">ID</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 p-4 bg-black/40 rounded-2xl border border-white/5 backdrop-blur-md">
           <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-400 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed">
                 Logic: <code className="text-blue-300 font-mono">(numA, idA) &lt; (numB, idB)</code> is true if 
                 <code className="text-white"> numA &lt; numB </code> OR if 
                 <code className="text-white"> numA == numB </code> AND <code className="text-white"> idA &lt; idB </code>.
                 This ensures a total ordering even when numbers are identical.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
