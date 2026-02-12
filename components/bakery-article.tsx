"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  Crimson_Pro,
  JetBrains_Mono,
  Bricolage_Grotesque,
} from "next/font/google";
import { 
  Users, 
  ShieldCheck, 
  Cpu, 
  Zap,
  Timer,
  Lock,
  Unlock,
  AlertTriangle,
  Clock
} from "lucide-react";
import { calculateReadingTime } from "@/lib/reading-time";
import { formatDate } from "@/lib/utils";

// Dynamic import visualizations
const BakeryHero = dynamic(
  () => import("./bakery-visualizations").then((m) => ({ default: m.BakeryHero })),
  { ssr: false }
);
const ProcessNexus = dynamic(
  () => import("./bakery-visualizations").then((m) => ({ default: m.ProcessNexus })),
  { ssr: false }
);
const TieBreakerViz = dynamic(
  () => import("./bakery-visualizations").then((m) => ({ default: m.TieBreakerViz })),
  { ssr: false }
);
const DoorwayRaceViz = dynamic(
  () => import("./bakery-visualizations").then((m) => ({ default: m.DoorwayRaceViz })),
  { ssr: false }
);
const MemoryResilienceViz = dynamic(
  () => import("./bakery-visualizations").then((m) => ({ default: m.MemoryResilienceViz })),
  { ssr: false }
);

// Fonts
const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  variable: "--font-crimson",
  display: "swap",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});
const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

// Section divider
function Divider() {
  return <div data-section className="w-full h-px my-12 md:my-16 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />;
}

// Editorial container
function EC({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[800px] mx-auto px-4 md:px-6 relative z-10">
      {children}
    </div>
  );
}

export function BakeryArticle() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const articleRef = useRef<HTMLDivElement>(null);
  
  // Real content-based reading time calculation
  const readingTime = calculateReadingTime(`
    The Bakery Algorithm was invented by Leslie Lamport in 1974. 
    It's a locking mechanism used in concurrent programming to prevent 
    multiple processes from entering their critical sections simultaneously, 
    which could cause data corruption or inconsistencies.
    It's named after the numbering system used in bakeries, where each customer 
    gets a number and waits for their turn to be served. 
    But unlike a physical bakery where a shopkeeper hands out tickets, 
    Lamport's algorithm works in a world where there is no central authority.
    What makes it truly legendary is that it achieves mutual exclusion 
    without requiring any special atomic hardware instructions like 
    Compare-and-Swap or Test-and-Set.
    In most synchronization algorithms, ensuring mutual exclusion typically 
    requires operations to be atomic.
    The Bakery Algorithm is designed to work even when reads and writes 
    to shared variables are not atomic.
  `);

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) setScrollProgress(window.scrollY / total);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Section reveal on scroll
  useEffect(() => {
    const root = articleRef.current;
    if (!root) return;
    const targets = root.querySelectorAll(
      ":scope > section:not(:first-child), :scope > article, [data-section]"
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("ba-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -60px 0px" }
    );
    targets.forEach((el) => {
      el.classList.add("ba-fade-section");
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={articleRef}
      className={`bakery-scope ba-body ${crimsonPro.variable} ${jetbrainsMono.variable} ${bricolageGrotesque.variable}`}
      style={{ background: "#020204", color: "#f8fafc" }}
    >
      {/* Scroll Progress */}
      <div
        className="ba-progress-bar"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      {/* ========== HERO ========== */}
      <section className="min-h-screen flex flex-col justify-center relative overflow-hidden pb-20">
        <div className="absolute inset-0 z-0">
          <BakeryHero />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020204]/60 to-[#020204] z-10" />

        <EC>
          <div className="text-center pt-32 relative z-20">
            <div className="inline-flex flex-wrap items-center justify-center gap-4 mb-10 md:mb-12">
               <div className="inline-flex items-center gap-3 px-4 md:px-6 py-2.5 rounded-full border border-white/10 bg-white/5 text-[11px] md:text-[12px] font-mono text-amber-400 tracking-[0.3em] uppercase backdrop-blur-xl">
                 <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                 Distributed Systems / Leslie Lamport
               </div>
               
               <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  <Clock className="w-3 h-3" />
                  {readingTime.text}
                  <span className="mx-2 h-1 w-1 rounded-full bg-slate-700" />
                  {formatDate("2025-11-22")}
               </div>
            </div>

            <h1 className="ba-display-title mb-6 text-white">
              The Bakery
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 drop-shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                Algorithm.
              </span>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-slate-400 max-w-3xl mx-auto leading-tight mt-12 font-light">
              Mutual exclusion without atomic hardware primitives. A masterclass in 
              <span className="text-white font-medium italic"> fair concurrency </span> 
              designed by the pioneer of distributed computing.
            </p>
          </div>
        </EC>

        <div
          className="absolute bottom-16 left-0 w-full flex flex-col items-center gap-4 z-20 transition-opacity duration-500"
          style={{ opacity: Math.max(0, 0.5 - scrollProgress * 5) }}
        >
          <span className="text-[11px] uppercase tracking-[0.4em] text-white/40">
            Scroll to Explore
          </span>
          <div className="w-px h-16 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </section>

      {/* ========== INTRO ========== */}
      <article>
        <EC>
          <p className="ba-drop-cap">
            The Bakery Algorithm was invented by Leslie Lamport in 1974. 
            It&rsquo;s a locking mechanism used in concurrent programming to prevent 
            multiple processes from entering their critical sections simultaneously, 
            which could cause data corruption or inconsistencies.
          </p>
          <p>
            It&rsquo;s named after the numbering system used in bakeries, where 
            each customer gets a number and waits for their turn to be served. 
            But unlike a physical bakery where a shopkeeper hands out tickets, 
            Lamport&rsquo;s algorithm works in a world where there is no central 
            authority&mdash;only individual processes communicating through shared memory.
          </p>
          <p>
            What makes it truly legendary is that it achieves <strong>mutual exclusion</strong> 
            without requiring any special atomic hardware instructions like 
            <code>Compare-and-Swap</code> or <code>Test-and-Set</code>. 
            It assumes nothing more than simple reads and writes to memory, 
            even when those operations themselves are not atomic.
          </p>

          <div className="ba-insight-card group">
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-amber-400" />
                The First Correct Solution
              </h3>
              <p className="text-slate-400 text-base md:text-lg mb-0 leading-relaxed">
                In the early 1970s, the <strong>Mutual Exclusion Problem</strong> was 
                THE foundational challenge in concurrency research. While others 
                proposed solutions that relied on hardware tricks, Lamport proved 
                it could be solved through pure logic. The Bakery Algorithm was the 
                first correct published solution that didn&rsquo;t assume atomic 
                hardware primitives.
              </p>
            </div>
          </div>
        </EC>
      </article>

      <Divider />

      {/* ========== HOW IT WORKS ========== */}
      <section>
        <EC>
          <h2 className="ba-section-title mb-8 mt-16 text-white">
            How It Works
          </h2>
          <p>
            The algorithm proceeds in four distinct phases for every process that 
            wishes to access a shared resource:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mt-12 mb-16">
            {[
              {
                title: "Number Assignment",
                icon: <Zap className="w-6 h-6 text-amber-400" />,
                text: "A process picks a number one greater than the maximum current number. It's like taking a ticket in a bakery."
              },
              {
                title: "Waiting for Turn",
                icon: <Timer className="w-6 h-6 text-orange-400" />,
                text: "The process waits until no other process has a lower number. Lower numbers go first."
              },
              {
                title: "Critical Section",
                icon: <Lock className="w-6 h-6 text-rose-500" />,
                text: "The process safely performs its work, knowing it has exclusive access to the resource."
              },
              {
                title: "Exiting & Release",
                icon: <Unlock className="w-6 h-6 text-emerald-400" />,
                text: "After finishing, the process sets its number to zero, allowing the next person in line to proceed."
              }
            ].map((item, i) => (
              <div key={i} className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-[2rem] p-6 md:p-10 transition-all duration-500 hover:border-amber-500/30 group">
                <div className="mb-4 p-3 bg-white/5 rounded-xl w-fit group-hover:bg-amber-500/10 transition-colors">
                  {item.icon}
                </div>
                <h4 className="text-white font-bold mb-3 text-lg md:text-xl group-hover:text-amber-400 transition-colors">
                  {item.title}
                </h4>
                <p className="text-lg text-slate-300 leading-relaxed mb-0 font-light">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== TIE BREAKING ========== */}
      <section>
        <EC>
          <h2 className="ba-section-title mb-8 mt-16 text-white">
            The Tie-Breaker
          </h2>
          <p>
            In a distributed system, it is entirely possible for two processes to 
            read the state of the system at the same time and decide on the same 
            &quot;next number.&quot; If both Process 1 and Process 2 see that 5 is 
            the current max, they might both take number 6.
          </p>
          <p>
            Lamport solves this by introducing a <strong>total ordering</strong> 
            using the process IDs. If numbers are equal, the lower ID wins. 
            This ensures that no two processes ever have the same priority.
          </p>

          <DoorwayRaceViz />
        </EC>
      </section>

      <Divider />

      {/* ========== LIVE DEMO ========== */}
      <section>
        <EC>
          <h2 className="ba-section-title mb-8 mt-16 text-white">
            The Process Nexus
          </h2>
          <p>
            Below is a live-executing implementation of the Bakery Algorithm arranged 
            in a <strong>radial communication ring</strong>. You can click any process 
            node to trigger its entry request.
          </p>
          
          <div className="my-12">
            <ProcessNexus />
          </div>

          <p>
            Notice how the system remains fair: no process can be &quot;skipped&quot; 
            indefinitely. Because numbers are assigned sequentially, every 
            process that enters the queue is guaranteed to reach the front 
            in a finite number of steps. This property is known as 
            <strong>freedom from starvation</strong>.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== NON-ATOMICITY ========== */}
      <section>
        <EC>
          <h2 className="ba-section-title mb-8 mt-16 text-white">
            The Magic of Non-Atomicity
          </h2>
          <p>
            The Bakery Algorithm&rsquo;s most stunning feature is its ability 
            to ensure mutual exclusion without requiring <strong>atomic reads 
            and writes</strong>. This makes it incredibly robust against 
            hardware limitations.
          </p>

          <div className="ba-callout">
             &quot;The algorithm is correct even if reading a memory location 
             that is being written yields any value whatsoever.&quot; 
             &mdash; Leslie Lamport
          </div>

          <MemoryResilienceViz />

          <p>
            In most synchronization algorithms, updating a flag or counter 
            must be atomic. If one process is halfway through writing a 
            value when another process reads it, the second process might 
            see a &quot;torn&quot; or garbage value, leading to a crash 
            or a security breach.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
             <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
                <h4 className="text-rose-400 font-bold mb-3 flex items-center gap-2">
                   <AlertTriangle className="w-4 h-4" />
                   Traditional Risk
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                   Relying on atomicity means if the hardware fails to lock 
                   the bus during a write, the entire mutual exclusion 
                   guarantee collapses.
                </p>
             </div>
             <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                <h4 className="text-emerald-400 font-bold mb-3 flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4" />
                   Bakery Resilience
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                   Because the algorithm uses a loop to check other processes, 
                   an inconsistent view only results in a process waiting 
                   slightly longer&mdash;it never lets two processes into the 
                   Critical Section at once.
                </p>
             </div>
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== THE CODE ========== */}
      <section>
        <EC>
          <h2 className="ba-section-title mb-8 mt-16 text-white">
            The Implementation
          </h2>
          <p>
            Here is the core logic of the algorithm in TypeScript. While 
            modern languages provide higher-level primitives, understanding 
            the Bakery logic is essential for anyone interested in how 
            distributed systems actually reach consensus.
          </p>

          <div className="bg-black/50 border border-white/5 rounded-2xl p-4 md:p-8 my-12 font-mono text-sm overflow-x-auto">
            <pre className="text-slate-300 leading-relaxed">
{`class BakeryLock {
  entering: boolean[];
  tickets: number[];

  lock(i: number) {
    // 1. Take a ticket
    this.entering[i] = true;
    this.tickets[i] = Math.max(...this.tickets) + 1;
    this.entering[i] = false;

    // 2. Wait for your turn
    for (let j = 0; j < this.numProcesses; j++) {
      // Wait while process j is picking its ticket
      while (this.entering[j]) { /* busy wait */ }

      // Wait while process j has a smaller ticket,
      // or same ticket but smaller process ID
      while (
        this.tickets[j] !== 0 && 
        (this.tickets[j] < this.tickets[i] || 
        (this.tickets[j] === this.tickets[i] && j < i))
      ) { 
        /* busy wait */ 
      }
    }
  }

  unlock(i: number) {
    this.tickets[i] = 0;
  }
}`}
            </pre>
          </div>
        </EC>
      </section>

      {/* ========== KEY TAKEAWAYS ========== */}
      <section className="pb-24">
        <EC>
          <div className="rounded-3xl p-8 md:p-12 border border-white/10 bg-white/[0.02] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Cpu className="w-32 h-32 text-amber-400" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 tracking-tight">Key Takeaways</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-4">
                <h3 className="text-amber-400 font-mono text-xs uppercase tracking-widest">Hardware Agnostic</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  The Bakery Algorithm doesn&rsquo;t need atomic operations. 
                  It works on the simplest shared-memory hardware imaginable.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-emerald-400 font-mono text-xs uppercase tracking-widest">Perfect Fairness</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  First-come, first-served (FCFS) logic ensures no process 
                  is ever starved, provided every process eventually leaves 
                  the critical section.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-blue-400 font-mono text-xs uppercase tracking-widest">Total Ordering</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Tie-breaking via Process IDs ensures a strict hierarchy 
                  that resolves any race condition during number assignment.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-rose-400 font-mono text-xs uppercase tracking-widest">Busy Waiting</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  The main drawback is CPU usage during the wait phase, 
                  making it more suitable for low-latency or dedicated hardware.
                </p>
              </div>
            </div>
          </div>
        </EC>
      </section>

      {/* Footer spacing */}
      <div className="h-32" />
    </div>
  );
}
