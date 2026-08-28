"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, LayoutGroup, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  Lock,
  Unlock,
  ShieldAlert,
  Activity,
  Terminal
} from "lucide-react";
import type * as THREE from "three";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";
import { supportsWebGL } from "@/lib/utils";

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

// Inline SVG noise (feTurbulence) — replaces the third-party texture request.
const NOISE_TEXTURE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E\")";

const MOBILE_BREAKPOINT = 768;

type ProcessState = "IDLE" | "CHOOSING" | "WAITING" | "CRITICAL";

interface TemporalProcess {
  state: ProcessState;
  val: number;
  choosing: boolean;
  color: string;
}

interface DoorwayStep {
  t: number;
  title: string;
  desc: string;
  a: TemporalProcess;
  b: TemporalProcess;
}

interface NexusProcess {
  id: number;
  state: ProcessState;
  number: number;
  choosing: boolean;
}

const DOORWAY_STEPS: DoorwayStep[] = [
  {
    t: 0,
    title: "Quiescent State",
    desc: "Process 0 and 1 are idle. No entries requested.",
    a: { state: "IDLE", val: 0, choosing: false, color: COLORS.slate },
    b: { state: "IDLE", val: 0, choosing: false, color: COLORS.slate },
  },
  {
    t: 0.25,
    title: "The Choosing Guard",
    desc: "Both processes signal intent simultaneously. The 'Choosing' flags go HIGH.",
    a: { state: "CHOOSING", val: 0, choosing: true, color: COLORS.cyan },
    b: { state: "CHOOSING", val: 0, choosing: true, color: COLORS.cyan },
  },
  {
    t: 0.5,
    title: "Concurrent Ticket Read",
    desc: "A race condition! Both read the same current maximum at the same instant, so both pick the same next ticket: 6. Collision state detected.",
    a: { state: "WAITING", val: 6, choosing: false, color: COLORS.amber },
    b: { state: "WAITING", val: 6, choosing: false, color: COLORS.amber },
  },
  {
    t: 0.75,
    title: "Logical Resolution",
    desc: "Process 0 wins the tie-break because its ID is lower. Priority assigned.",
    a: { state: "CRITICAL", val: 6, choosing: false, color: COLORS.emerald },
    b: { state: "WAITING", val: 6, choosing: false, color: COLORS.amber },
  },
  {
    t: 1,
    title: "Starvation-Free Release",
    desc: "P0 exits, P1 inherits the lowest (Ticket, ID) and enters next.",
    a: { state: "IDLE", val: 0, choosing: false, color: COLORS.slate },
    b: { state: "CRITICAL", val: 6, choosing: false, color: COLORS.emerald },
  },
];

// ============================================================
// 1. CHRONOS SUBSTRATE HERO (Three.js)
// Advanced particle system with mouse-parallax depth.
// The render loop only runs while the hero is on screen and the user has not
// asked for reduced motion; the scene is rebuilt when the mobile/desktop
// breakpoint flips so the camera always matches the geometry.
// ============================================================

export function BakeryHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!supportsWebGL()) return;

    let isMounted = true;
    let animationId: number | null = null;
    let renderer: THREE.WebGLRenderer | null = null;
    let visible = false;
    let reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = { x: 0, y: 0 };
    const cleanups: (() => void)[] = [];

    const init = async () => {
      const THREE = await import("three");
      if (!isMounted) return;

      let isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / Math.max(1, container.clientHeight),
        0.1,
        2000
      );
      camera.position.set(0, 0, isMobile ? 140 : 100);

      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        return; // context creation failed — keep the static gradient backdrop
      }
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      type SceneParts = {
        group: THREE.Group;
        core: THREE.Mesh;
        tickets: THREE.Mesh[];
        dispose: () => void;
      };

      // Star/ticket counts and radii depend on the breakpoint, so the scene
      // contents are built by a function and rebuilt on breakpoint change.
      const buildParts = (mobile: boolean): SceneParts => {
        const disposables: { dispose: () => void }[] = [];
        const objects: THREE.Object3D[] = [];

        // Starfield background
        const starCount = mobile ? 800 : 3000;
        const starGeo = new THREE.BufferGeometry();
        const starPos = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i++) {
          starPos[i * 3] = (Math.random() - 0.5) * 1000;
          starPos[i * 3 + 1] = (Math.random() - 0.5) * 1000;
          starPos[i * 3 + 2] = (Math.random() - 0.5) * 1000;
        }
        starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
        const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, transparent: true, opacity: 0.2 });
        const stars = new THREE.Points(starGeo, starMat);
        scene.add(stars);
        objects.push(stars);
        disposables.push(starGeo, starMat);

        // Main Ticket Vortex
        const group = new THREE.Group();
        scene.add(group);
        objects.push(group);

        const ticketCount = mobile ? 20 : 60;
        const tickets: THREE.Mesh[] = [];

        for (let i = 0; i < ticketCount; i++) {
          const geo = new THREE.BoxGeometry(3, 4.5, 0.1);
          const mat = new THREE.MeshBasicMaterial({
            color: i % 10 === 0 ? COLORS.cyan : i % 5 === 0 ? COLORS.amber : COLORS.rose,
            transparent: true,
            opacity: 0.25,
            wireframe: true
          });
          const ticket = new THREE.Mesh(geo, mat);
          disposables.push(geo, mat);

          const angle = (i / ticketCount) * Math.PI * 2 * (mobile ? 4 : 6);
          const radius = (mobile ? 12 : 25) + (i * 0.8);
          ticket.position.set(
            Math.cos(angle) * radius,
            (i - ticketCount / 2) * (mobile ? 4 : 3),
            Math.sin(angle) * radius
          );
          ticket.rotation.y = angle;
          group.add(ticket);
          tickets.push(ticket);
        }

        // Central Logical Core
        const coreGeo = new THREE.OctahedronGeometry(mobile ? 8 : 15, 2);
        const coreMat = new THREE.MeshBasicMaterial({
          color: COLORS.amber,
          wireframe: true,
          transparent: true,
          opacity: 0.1
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        scene.add(core);
        objects.push(core);
        disposables.push(coreGeo, coreMat);

        return {
          group,
          core,
          tickets,
          dispose: () => {
            objects.forEach((o) => scene.remove(o));
            disposables.forEach((d) => d.dispose());
          },
        };
      };

      let parts = buildParts(isMobile);

      const renderOnce = () => {
        camera.lookAt(0, 0, 0);
        renderer?.render(scene, camera);
      };

      const advance = (time: number) => {
        parts.group.rotation.y += 0.0008;
        parts.core.rotation.y -= 0.002;
        parts.core.rotation.x += 0.001;

        // Parallax effect
        camera.position.x += (mouse.x * 15 - camera.position.x) * 0.05;
        camera.position.y += (-mouse.y * 15 - camera.position.y) * 0.05;

        const tickets = parts.tickets;
        for (let i = 0; i < tickets.length; i++) {
          const t = tickets[i];
          t.position.y += Math.sin(time * 0.0004 + i) * 0.04;
          t.rotation.z += 0.004;
        }
      };

      const step = (time: number) => {
        animationId = null;
        if (!isMounted || !visible || reducedMotion) return;
        advance(time);
        renderOnce();
        animationId = requestAnimationFrame(step);
      };
      const start = () => {
        if (animationId === null && isMounted && visible && !reducedMotion) {
          animationId = requestAnimationFrame(step);
        }
      };
      const stop = () => {
        if (animationId !== null) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      };

      // One static frame so the hero is never blank (also the reduced-motion state).
      renderOnce();

      const observer = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
          if (visible) start();
          else stop();
        },
        { rootMargin: "100px" }
      );
      observer.observe(container);
      cleanups.push(() => observer.disconnect());

      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      const onMotionChange = (e: MediaQueryListEvent) => {
        reducedMotion = e.matches;
        if (reducedMotion) {
          stop();
          renderOnce();
        } else {
          start();
        }
      };
      motionQuery.addEventListener("change", onMotionChange);
      cleanups.push(() => motionQuery.removeEventListener("change", onMotionChange));

      const handleResize = () => {
        if (!renderer) return;
        const mobile = window.innerWidth < MOBILE_BREAKPOINT;
        if (mobile !== isMobile) {
          isMobile = mobile;
          parts.dispose();
          parts = buildParts(mobile);
        }
        camera.aspect = container.clientWidth / Math.max(1, container.clientHeight);
        camera.position.z = mobile ? 140 : 100;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
        if (animationId === null) renderOnce();
      };
      window.addEventListener("resize", handleResize);
      cleanups.push(() => window.removeEventListener("resize", handleResize));

      const handleMouseMove = (e: MouseEvent) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      };
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      cleanups.push(() => window.removeEventListener("mousemove", handleMouseMove));

      cleanups.push(() => {
        stop();
        parts.dispose();
      });
    };

    init();

    return () => {
      isMounted = false;
      cleanups.forEach((fn) => fn());
      if (renderer) {
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="w-full h-full min-h-[360px] sm:min-h-[450px] md:min-h-[600px] relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020204]/60 to-[#020204] pointer-events-none z-10" />

      {/* Decorative scene label. Centred in the hero it sat directly behind the
          headline/subtitle text (visibly overlapping on phones); it now lives in
          the lower-right corner of the scene on large screens only. */}
      <div className="absolute z-20 hidden pointer-events-none w-[90%] max-w-sm text-center lg:block lg:bottom-10 lg:right-10 lg:w-auto lg:max-w-xs">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="px-6 py-4 md:px-8 md:py-5 rounded-[2rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl shadow-[0_0_100px_rgba(245,158,11,0.1)]"
         >
            <div className="flex flex-col items-center gap-3">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                  <span className="text-[10px] md:text-[11px] font-mono text-amber-400 uppercase tracking-[0.4em]">Substrate v2.0</span>
               </div>
               <div className="h-px w-16 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
               <p className="text-sm md:text-base font-bold text-white/90 tracking-tight">Decentralized Temporal Logic</p>
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
  const { lightTap } = useHapticFeedback();

  const currentStep = useMemo(() => {
    let best = DOORWAY_STEPS[0];
    for (const s of DOORWAY_STEPS) {
      if (progress >= s.t) best = s;
    }
    return best;
  }, [progress]);

  return (
    <div className="ba-viz-container">
      <div className="p-6 md:p-12 relative overflow-hidden bg-gradient-to-b from-white/[0.02] to-transparent">
        <div className="flex flex-col lg:flex-row gap-8 md:gap-12 relative z-10">
          <div className="lg:w-1/3 space-y-6 md:space-y-8">
            <div className="space-y-3 md:space-y-4">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono text-amber-400 uppercase tracking-widest">
                  Temporal Scrubber
               </div>
               <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight min-h-[3rem] md:min-h-[4rem] flex items-center">
                 {currentStep.title}
               </h3>
               <p className="text-slate-400 leading-relaxed text-sm md:text-lg min-h-[4rem] md:min-h-[6rem]" aria-live="polite">
                 {currentStep.desc}
               </p>
            </div>

            <div className="space-y-4 pt-6 md:pt-8 border-t border-white/5">
               <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">
                  <span id="ba-timeline-label">Timeline Scrubber</span>
                  <span className="text-white tabular-nums">{Math.round(progress * 100)}%</span>
               </div>
               <div className="relative h-10 flex items-center">
                  <div aria-hidden="true" className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-white/10 pointer-events-none" />
                  <input
                    type="range" min="0" max="1" step="0.01"
                    value={progress}
                    aria-labelledby="ba-timeline-label"
                    aria-valuetext={`${Math.round(progress * 100)}%: ${currentStep.title}`}
                    onChange={(e) => {
                      setProgress(parseFloat(e.target.value));
                      lightTap();
                    }}
                    className="relative w-full h-10 bg-transparent appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-full"
                  />
               </div>
                <div className="flex justify-between -mx-2" role="group" aria-label="Jump to step">
                  {DOORWAY_STEPS.map((s, i) => (
                    <button
                      type="button"
                      key={i}
                      aria-label={`Step ${i + 1}: ${s.title}`}
                      aria-current={currentStep === s ? "step" : undefined}
                      onClick={() => { setProgress(s.t); lightTap(); }}
                      className="group/dot flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    >
                      <span
                        aria-hidden="true"
                        className={`block w-2.5 h-2.5 rounded-full transition-all duration-300 group-hover/dot:scale-125 ${progress >= s.t ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'bg-white/10'}`}
                      />
                    </button>
                  ))}
               </div>
            </div>
          </div>

          <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 items-start">
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

function TemporalCard({ label, data, id }: { label: string; data: TemporalProcess; id: number }) {
  return (
    <motion.div
      layout
      className="p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-black/40 border-2 transition-all duration-500 relative overflow-hidden group w-full"
      style={{ borderColor: `${data.color}33`, boxShadow: `0 0 40px ${data.color}05` }}
    >
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
           style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      <div className="relative z-10 flex flex-col gap-6 md:gap-8">
         <div className="flex justify-between items-start">
            <div className="flex items-center gap-3 md:gap-4">
               <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-lg md:text-xl text-white shadow-2xl transition-colors duration-500"
                    style={{ backgroundColor: data.color }}>
                  {id}
               </div>
               <div>
                  <p className="text-[9px] md:text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-0.5">{label}</p>
                  <p className="text-xs md:text-sm font-bold text-white transition-colors duration-500 uppercase tracking-tighter" style={{ color: data.color }}>{data.state}</p>
               </div>
            </div>
            {data.state === 'CRITICAL' && (
              <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <Lock className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" aria-label="Holding the lock" />
              </motion.div>
            )}
         </div>

         <div className="space-y-5 md:space-y-6">
            <div className="space-y-2">
               <div className="flex justify-between text-[9px] md:text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  <span>Logic Guard</span>
                  <span className={data.choosing ? 'text-cyan-400' : 'text-slate-500'}>{data.choosing ? 'ACTIVE' : 'READY'}</span>
               </div>
               <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{ width: data.choosing ? '100%' : '0%', backgroundColor: data.color }}
                    className="h-full shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
               <div className="bg-white/[0.02] border border-white/5 rounded-xl md:rounded-2xl p-3 md:p-4 text-center">
                  <p className="text-[9px] md:text-[10px] text-slate-400 uppercase mb-1 tracking-tight">Ticket</p>
                  <p className="text-base md:text-xl font-black text-white">{data.val ?? '—'}</p>
               </div>
               <div className="bg-white/[0.02] border border-white/5 rounded-xl md:rounded-2xl p-3 md:p-4 text-center">
                  <p className="text-[9px] md:text-[10px] text-slate-400 uppercase mb-1 tracking-tight">Priority</p>
                  <p className="text-base md:text-xl font-black text-white/20 group-hover:text-white/40 transition-colors">#{id}</p>
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
  const numProcesses = 6;
  const initialProcesses = useMemo<NexusProcess[]>(
    () =>
      Array.from({ length: numProcesses }, (_, i) => ({
        id: i,
        state: "IDLE",
        number: 0,
        choosing: false,
      })),
    [numProcesses]
  );
  const [processes, setProcesses] = useState<NexusProcess[]>(initialProcesses);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [checkingId, setCheckingId] = useState<number | null>(null);
  const [targetId, setTargetId] = useState<number | null>(null);
  const [radius, setRadius] = useState(240);
  const isMountedRef = useRef(true);
  const processesRef = useRef<NexusProcess[]>(initialProcesses);
  const { lightTap, mediumTap } = useHapticFeedback();

  useEffect(() => {
    // StrictMode mounts → cleans up → re-mounts; the flag must be re-armed
    // on every effect run or every node click is a no-op in development.
    isMountedRef.current = true;
    const handleResize = () => {
      const isMob = window.innerWidth < MOBILE_BREAKPOINT;
      // Shrink further on mobile to guarantee no overflow on narrow screens
      setRadius(isMob ? Math.min(window.innerWidth * 0.3, 120) : Math.min(window.innerWidth * 0.32, 260));
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('resize', handleResize);
    };
  }, [numProcesses]);

  const updateProcess = (id: number, updates: Partial<NexusProcess>) => {
    if (!isMountedRef.current) return;
    setProcesses(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...updates } : p);
      processesRef.current = next;
      return next;
    });
  };

  const runCycle = async (id: number) => {
    if (!isMountedRef.current || processesRef.current[id]?.state !== 'IDLE') return;
    mediumTap();

    // Phase 1: Choosing (The Doorway)
    updateProcess(id, { state: 'CHOOSING', choosing: true });
    await new Promise(r => setTimeout(r, 800));

    const myNumber = Math.max(...processesRef.current.map(p => p.number)) + 1;
    updateProcess(id, { state: 'WAITING', number: myNumber, choosing: false });

    const waitUntil = async (pred: () => boolean) => {
      while (isMountedRef.current && !pred()) {
        await new Promise(r => setTimeout(r, 150));
      }
    };

    // Phase 2: Verifying Consensus (The Ring) — Lamport's actual wait rule:
    // let each peer finish choosing, then defer to any peer whose
    // (ticket, id) pair precedes ours until it releases its ticket.
    setCheckingId(id);
    for (let j = 0; j < numProcesses; j++) {
      if (id === j) continue;
      if (!isMountedRef.current) return;

      setTargetId(j);
      lightTap();
      await new Promise(r => setTimeout(r, window.innerWidth < MOBILE_BREAKPOINT ? 400 : 600));
      await waitUntil(() => !processesRef.current[j]?.choosing);
      await waitUntil(() => {
        const peer = processesRef.current[j];
        if (!peer || peer.number === 0) return true;
        return peer.number > myNumber || (peer.number === myNumber && j > id);
      });
      if (!isMountedRef.current) return;
    }
    setCheckingId(null);
    setTargetId(null);

    if (!isMountedRef.current) return;

    // Phase 3: Critical Section Entry
    updateProcess(id, { state: 'CRITICAL' });
    setActiveId(id);
    mediumTap();
    await new Promise(r => setTimeout(r, 4000));

    if (!isMountedRef.current) return;

    // Phase 4: Release
    setActiveId(null);
    updateProcess(id, { state: 'IDLE', number: 0 });
    lightTap();
  };

  const waiting = processes.filter((p) => p.state === "WAITING" || p.state === "CHOOSING");
  const statusText =
    activeId !== null
      ? `P${activeId} holds the lock (ticket ${processes[activeId]?.number ?? "?"})${waiting.length ? ` · ${waiting.map((p) => `P${p.id}`).join(", ")} waiting` : ""}`
      : checkingId !== null && targetId !== null
        ? `P${checkingId} (ticket ${processes[checkingId]?.number ?? "?"}) is checking P${targetId}`
        : waiting.length
          ? `${waiting.map((p) => `P${p.id}`).join(", ")} choosing a ticket`
          : "All processes idle — click a node to request entry";

  return (
    <div className="ba-viz-container h-[420px] sm:h-[500px] md:h-[750px] flex items-center justify-center p-0 overflow-hidden relative">
      <div className="absolute inset-0 bg-[#050507] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,transparent_70%)]" />

      {/* Textual state for screen readers and cold readers */}
      <div
        role="status"
        aria-live="polite"
        className="absolute top-3 md:top-6 left-1/2 -translate-x-1/2 z-30 max-w-[calc(100%-1.5rem)] px-3 md:px-4 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-xl text-[10px] md:text-[11px] font-mono text-slate-300 uppercase tracking-widest text-center truncate"
      >
        {statusText}
      </div>

      {/* Central Logical Hub */}
      <div className="relative z-10 w-40 h-40 md:w-64 md:h-64 flex items-center justify-center">
         <div className={`absolute inset-0 rounded-full blur-[40px] md:blur-[100px] transition-all duration-1000 ${activeId !== null ? 'bg-emerald-500/20 scale-125 md:scale-150' : 'bg-blue-500/5 scale-100'}`} />

         <div className={`w-28 h-28 md:w-48 md:h-48 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-1000 ${activeId !== null ? 'border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_60px_rgba(16,185,129,0.1)]' : 'border-white/5 bg-white/[0.02]'}`}>
            <AnimatePresence mode="wait">
              {activeId !== null ? (
                <motion.div key="lock" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                  <div className="relative mb-2 md:mb-4">
                     <Lock className="w-8 h-8 md:w-14 md:h-14 text-emerald-400" />
                     <motion.div
                       animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                       transition={{ duration: 2, repeat: Infinity }}
                       className="absolute inset-0 bg-emerald-400 rounded-full blur-xl"
                     />
                  </div>
                  <p className="text-[9px] md:text-[10px] font-mono text-emerald-500 uppercase tracking-[0.2em] md:tracking-[0.3em]">Exclusive Lock</p>
                  <p className="text-sm md:text-lg font-black text-white mt-0.5 md:mt-1">P{activeId} ACTIVE</p>
                </motion.div>
              ) : (
                <motion.div key="unlock" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center opacity-40">
                  <Unlock className="w-8 h-8 md:w-14 md:h-14 text-slate-600 mb-2 md:mb-4" />
                  <p className="text-[9px] md:text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em]">Open Consensus</p>
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
              type="button"
              onClick={() => runCycle(i)}
              aria-label={`Process ${i}: ${p.state.toLowerCase()}${p.number ? `, ticket ${p.number}` : ""}${p.state === "IDLE" ? ". Request entry" : ""}`}
              aria-disabled={p.state !== "IDLE"}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`w-16 h-16 md:w-28 md:h-28 rounded-2xl md:rounded-[2rem] border-2 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                p.state === 'CRITICAL' ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_50px_rgba(16,185,129,0.3)]' :
                p.state === 'WAITING' ? 'border-amber-500 bg-amber-500/5 shadow-[0_0_30px_rgba(245,158,11,0.15)]' :
                p.state === 'CHOOSING' ? 'border-blue-500 bg-blue-500/5' :
                'border-white/5 bg-white/[0.03] hover:border-white/20'
              } ${isTarget ? 'ring-4 ring-blue-400/30 border-blue-400' : ''}`}
            >
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: NOISE_TEXTURE }} />
              <span className="text-[9px] md:text-[10px] font-mono text-slate-500 uppercase mb-0.5 md:mb-1">P{i}</span>
              <span className="text-lg md:text-2xl font-black text-white tabular-nums">{p.number ?? '—'}</span>

              {p.choosing && <div className="absolute top-1.5 right-1.5 md:top-2 md:right-2 w-1 md:w-1.5 h-1 md:h-1.5 bg-blue-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" />}
            </motion.button>

            {/* Connection beam using SVG. The 600×600 canvas is centred on this
                node (offset −300px, −300px) so (300, 300) is the node centre and
                the target node lands at (300 + Δx, 300 + Δy). */}
            {isChecker && targetId !== null && (
               <div className="absolute top-1/2 left-1/2 pointer-events-none overflow-visible -z-10" aria-hidden="true">
                  <svg width="600" height="600" className="absolute -left-[300px] -top-[300px] pointer-events-none overflow-visible">
                     <defs>
                        <filter id="nexus-glow">
                           <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                           <feMerge>
                              <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
                           </feMerge>
                        </filter>
                     </defs>
                     <motion.line
                       initial={{ pathLength: 0, opacity: 0 }}
                       animate={{ pathLength: 1, opacity: 0.6 }}
                       x1="300" y1="300"
                       x2={300 + (Math.cos((targetId / numProcesses) * Math.PI * 2 - Math.PI / 2) * radius) - x}
                       y2={300 + (Math.sin((targetId / numProcesses) * Math.PI * 2 - Math.PI / 2) * radius) - y}
                       stroke={COLORS.amber}
                       strokeWidth="2"
                       strokeDasharray="8 8"
                       filter="url(#nexus-glow)"
                     />
                  </svg>
               </div>
            )}
          </div>
        );
      })}

      <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 md:gap-6 px-4 md:px-8 py-2 md:py-3 rounded-full bg-black/40 border border-white/10 backdrop-blur-3xl shadow-2xl max-w-[calc(100%-1rem)] md:max-w-none overflow-x-auto no-scrollbar" aria-label="Legend">
         <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-[9px] md:text-[10px] text-slate-400 uppercase font-mono tracking-widest">Doorway</span>
         </div>
         <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-[9px] md:text-[10px] text-slate-400 uppercase font-mono tracking-widest">Queue</span>
         </div>
         <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-[9px] md:text-[10px] text-slate-400 uppercase font-mono tracking-widest">Critical</span>
         </div>
      </div>
    </div>
  );
}

// ============================================================
// 4. THE HARDWARE STRESS-TEST
// Terminal-style visualization of torn reads and resilience.
// The jitter ticker and the two looping framer animations only run while the
// panel is on screen and the user has not asked for reduced motion.
// ============================================================

export function MemoryResilienceViz() {
  const [noise, setNoise] = useState(0.5);
  const [intensity, setNoiseIntensity] = useState(0.4);
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { lightTap } = useHapticFeedback();

  const animating = inView && !prefersReducedMotion;

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "100px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!animating) return;
    // Smoothed random walk (no hard 12 Hz flashes) — sampled while visible only.
    const interval = setInterval(() => {
      setNoise((n) => Math.min(1, Math.max(0, n + (Math.random() - 0.5) * 0.6)));
    }, 80);
    return () => clearInterval(interval);
  }, [animating]);

  // Under reduced motion the display is static but still reflects the slider.
  const sample = prefersReducedMotion ? 0.75 : noise;
  const integrity = Math.round((1 - intensity) * 100);

  return (
    <div ref={containerRef} className="ba-viz-container p-6 md:p-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-rose-500/[0.03] to-cyan-500/[0.03] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">
        <div className="order-2 lg:order-1">
          <div className="flex items-center gap-4 mb-6 md:mb-8">
             <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-inner">
                <ShieldAlert className="w-5 h-5 md:w-6 md:h-6 text-rose-500" />
             </div>
             <div>
                <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-none mb-1 md:mb-2">Logical Resilience</h3>
                <p className="text-[9px] md:text-[10px] font-mono text-slate-500 uppercase tracking-widest">Hardware Reliability Diagnosis</p>
             </div>
          </div>

          <p className="text-slate-400 leading-relaxed text-base md:text-lg mb-6 md:mb-8">
            Lamport realized that hardware isn&rsquo;t perfect. If two processes access memory at the same instant, the data
            physically blurs. The Bakery Algorithm is designed to thrive in this chaos.
          </p>

          <div className="space-y-3 md:space-y-4">
             <div className="p-4 md:p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex justify-between items-center mb-2 md:mb-3">
                   <div className="flex items-center gap-2 md:gap-3">
                      <Activity className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-400" />
                      <span className="text-[10px] md:text-xs font-bold text-white uppercase tracking-widest">Bus Contention</span>
                   </div>
                   {intensity > 0.7 ? (
                     <span className="text-[9px] md:text-[10px] font-mono text-rose-500 animate-pulse font-bold tracking-widest">CRITICAL_OVERLOAD</span>
                   ) : intensity > 0.2 ? (
                     <span className="text-[9px] md:text-[10px] font-mono text-amber-500 font-bold tracking-widest">BUS_DEGRADED</span>
                   ) : (
                     <span className="text-[9px] md:text-[10px] font-mono text-emerald-500 font-bold tracking-widest">BUS_NOMINAL</span>
                   )}
                </div>
                <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                  A &ldquo;torn read&rdquo; happens when a process reads <code className="text-amber-300">0xFFFF</code> while the bus is
                  halfway through writing <code className="text-emerald-400">0x0001</code>.
                </p>
             </div>

             <div className="p-4 md:p-5 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/10 shadow-inner shadow-emerald-500/5">
                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                   <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-400" />
                   <span className="text-[10px] md:text-xs font-bold text-emerald-400 uppercase tracking-widest">Consensus Stabilizer</span>
                </div>
                <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                  Checking the <code>choosing</code> guard first essentially &ldquo;polls the voltage&rdquo;
                  until the signal stabilizes. Logic wins where hardware fails.
                </p>
             </div>
          </div>
        </div>

        <div className="order-1 lg:order-2 relative w-full max-w-sm mx-auto lg:max-w-none">
           {/* Terminal Monitor */}
           <div
             className="relative aspect-[4/3] w-full bg-[#08080a] rounded-[1.5rem] md:rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col"
             role="img"
             aria-label={`Simulated bus monitor: signal integrity ${integrity}% at ${Math.round(intensity * 100)}% injected noise. The value 42 is ${intensity > 0.15 ? "distorted (torn read)" : "read cleanly"}.`}
           >
              <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-white/5 bg-white/[0.02]">
                 <div className="flex items-center gap-2">
                    <Terminal className="w-3 h-3 text-slate-500" />
                    <span className="text-[9px] md:text-[10px] font-mono text-slate-500 uppercase tracking-widest">Logic Diagnostic v4.2.0</span>
                 </div>
                 <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500/50" />
                 </div>
              </div>

              <div className="flex-1 p-6 md:p-8 flex flex-col justify-between font-mono relative">
                 <div className="space-y-3 md:space-y-4 relative z-10">
                    <div className="flex justify-between items-end text-[9px] md:text-[10px]">
                       <span className="text-slate-500 tracking-tighter">SIGNAL_INTEGRITY_INDEX</span>
                       <span className={intensity > 0.7 ? 'text-rose-500' : 'text-emerald-500'}>{integrity}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden relative shadow-inner">
                       <motion.div
                         animate={animating ? { x: ["-100%", "100%"] } : { x: "-100%" }}
                         transition={animating ? { duration: 1.5, repeat: Infinity, ease: "linear" } : { duration: 0 }}
                         className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                       />
                       <div className="h-full origin-left bg-gradient-to-r from-amber-500/20 to-amber-500/60 transition-transform duration-300" style={{ transform: `scaleX(${1 - intensity})` }} />
                    </div>
                 </div>

                 <div className="relative py-6 md:py-8 text-center overflow-hidden flex flex-col items-center justify-center" aria-hidden="true">
                    <div className="absolute inset-0 flex items-center justify-center text-[5rem] md:text-[10rem] font-black text-white/[0.02] select-none pointer-events-none tabular-nums">
                       {Math.floor(sample * 99)}
                    </div>

                    <div className="relative scale-75 md:scale-100">
                       {/* Opacity + transform only: no animated filter, no strobe loop. */}
                       <div
                         className="text-7xl md:text-8xl font-black text-white tracking-tighter tabular-nums drop-shadow-2xl will-change-transform"
                         style={{
                           opacity: 1 - sample * 0.55 * intensity,
                           transform: `translateX(${(sample - 0.5) * 20 * intensity}px) skew(${(sample - 0.5) * 15 * intensity}deg)`
                         }}>
                         42
                       </div>
                       <div className="absolute inset-0 text-7xl md:text-8xl font-black text-rose-500/10 pointer-events-none tabular-nums will-change-transform"
                            style={{ transform: `translate(${(sample - 0.5) * 40 * intensity}px, 2px)`, opacity: Math.min(1, intensity * 2) }}>
                          ??
                       </div>
                    </div>
                 </div>

                 <div className="flex justify-between text-[9px] md:text-[10px] text-slate-400 relative z-10">
                    <span className="flex items-center gap-2">
                       <span className={`w-1 h-1 rounded-full ${intensity > 0 ? "bg-amber-500 animate-ping" : "bg-emerald-500"}`} />
                       SAMPLING_BUS_0xBA...
                    </span>
                    {intensity > 0.15 ? (
                      <span className="text-amber-500/70 uppercase tracking-widest font-bold">Torn Read Detected</span>
                    ) : (
                      <span className="text-emerald-500/70 uppercase tracking-widest font-bold">Signal Clean</span>
                    )}
                 </div>
              </div>

              {/* Scanning Laser */}
              <motion.div
                animate={animating ? { top: ["-5%", "105%"] } : { top: "-5%" }}
                transition={animating ? { duration: 4, repeat: Infinity, ease: "linear" } : { duration: 0 }}
                className="absolute left-0 w-full h-px bg-cyan-400/40 shadow-[0_0_20px_rgba(34,211,238,0.6)] z-30 pointer-events-none"
              />
           </div>

           {/* Precision Control Slider */}
           <div className="mt-6 md:mt-10 px-5 md:px-6 py-4 md:py-5 rounded-2xl md:rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-md shadow-xl group">
              <div className="flex justify-between text-[9px] md:text-[10px] font-mono text-slate-500 uppercase mb-3 tracking-widest">
                 <span id="ba-noise-label">Inject Hardware Noise</span>
                 <span className="text-white font-black tabular-nums">{Math.round(intensity * 100)}%</span>
              </div>
              <div className="relative h-10 flex items-center">
                 <div aria-hidden="true" className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-white/10 pointer-events-none" />
                 <input
                   type="range" min="0" max="1" step="0.01" value={intensity}
                   aria-labelledby="ba-noise-label"
                   aria-valuetext={`${Math.round(intensity * 100)}% noise, signal integrity ${integrity}%`}
                   onChange={(e) => {
                     setNoiseIntensity(parseFloat(e.target.value));
                     lightTap();
                   }}
                   className="relative w-full h-10 bg-transparent appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-full"
                 />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
