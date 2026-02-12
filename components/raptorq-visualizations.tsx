"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useDeviceCapabilities } from "@/hooks/use-mobile-optimizations";
import { RaptorQMathTooltip } from "./raptorq-math-tooltip";

const COLORS = {
  bg: "#020204",
  cyan: "#22d3ee",
  purple: "#a855f7",
  blue: "#3b82f6",
  white: "#f1f5f9",
  slate: "#64748b",
  emerald: "#10b981",
  red: "#ef4444",
  amber: "#f59e0b",
};

// Lazy-init helper using IntersectionObserver
function useIntersectionInit(callback: () => (() => void) | void) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const cleanupRef = useRef<(() => void) | void>(undefined);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !initialized.current) {
          initialized.current = true;
          cleanupRef.current = callback();
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cleanupRef.current?.();
    };
  }, [callback]);

  return containerRef;
}

// ============================================
// 1. HERO PARTICLES (Three.js)
// ============================================
export function HeroParticles() {
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
      camera.position.z = 55;
      camera.position.y = 12;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      const count =
        capabilities.tier === "low"
          ? 1000
          : capabilities.tier === "medium"
            ? 2500
            : 5000;

      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const velocities = new Float32Array(count);

      const colorA = new THREE.Color(COLORS.cyan);
      const colorB = new THREE.Color(COLORS.purple);

      function resetParticle(i: number) {
        positions[i * 3] = (Math.random() - 0.5) * 120;
        positions[i * 3 + 1] = 60 + Math.random() * 40;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
        velocities[i] = 0.3 + Math.random() * 1.4;
        const mix = colorA.clone().lerp(colorB, Math.random());
        colors[i * 3] = mix.r;
        colors[i * 3 + 1] = mix.g;
        colors[i * 3 + 2] = mix.b;
      }

      for (let i = 0; i < count; i++) {
        resetParticle(i);
        positions[i * 3 + 1] = Math.random() * 120 - 60;
      }

      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 0.55,
        vertexColors: true,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });

      const particles = new THREE.Points(geometry, material);
      scene.add(particles);

      const grid = new THREE.GridHelper(250, 50, COLORS.cyan, "#0a0a0a");
      grid.position.y = -45;
      if (Array.isArray(grid.material)) {
        grid.material.forEach((m) => {
          m.opacity = 0.12;
          m.transparent = true;
        });
      } else {
        grid.material.opacity = 0.12;
        grid.material.transparent = true;
      }
      scene.add(grid);

      let mouseX = 0;
      let mouseY = 0;
      const onMouseMove = (e: MouseEvent) => {
        mouseX =
          (e.clientX - window.innerWidth / 2) * 0.015;
        mouseY =
          (e.clientY - window.innerHeight / 2) * 0.015;
      };
      window.addEventListener("mousemove", onMouseMove);

      const onResize = () => {
        if (!renderer) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };
      window.addEventListener("resize", onResize);

      function animate() {
        animationId = requestAnimationFrame(animate);
        const pos = particles.geometry.attributes.position
          .array as Float32Array;
        for (let i = 0; i < count; i++) {
          pos[i * 3 + 1] -= velocities[i];
          pos[i * 3] += (mouseX - pos[i * 3] * 0.01) * 0.05;
          pos[i * 3 + 2] += (mouseY - pos[i * 3 + 2] * 0.01) * 0.05;
          if (pos[i * 3 + 1] < -45) resetParticle(i);
        }
        particles.geometry.attributes.position.needsUpdate = true;
        particles.rotation.y += 0.0006;
        renderer!.render(scene, camera);
      }
      animate();

      // Store cleanup references
      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("resize", onResize);
        cancelAnimationFrame(animationId);
        geometry.dispose();
        material.dispose();
        renderer?.dispose();
        if (renderer?.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    };

    let cleanup: (() => void) | undefined;
    init().then((c) => {
      cleanup = c;
    });

    return () => {
      cancelAnimationFrame(animationId);
      cleanup?.();
    };
  }, [capabilities.tier]);

  return <div ref={containerRef} className="absolute inset-0 z-0" />;
}

// ============================================
// 2. MATRIX VIZ
// ============================================
interface MatrixRow {
  data: number[];
  id: string;
}

export function MatrixViz() {
  const [rows, setRows] = useState<MatrixRow[]>([]);
  const [rank, setRank] = useState(0);
  const [pivots, setPivots] = useState<{ row: number; col: number }[]>([]);
  const unknowns = 4;

  const analyzeRank = useCallback(
    (currentRows: MatrixRow[]) => {
      const matrix = currentRows.map((r) => [...r.data]);
      let pivotRow = 0;
      const foundPivots: { row: number; col: number }[] = [];
      for (
        let col = 0;
        col < unknowns && pivotRow < matrix.length;
        col++
      ) {
        let sel = pivotRow;
        while (sel < matrix.length && matrix[sel][col] === 0) sel++;
        if (sel < matrix.length) {
          [matrix[sel], matrix[pivotRow]] = [matrix[pivotRow], matrix[sel]];
          foundPivots.push({ row: pivotRow, col });
          for (let i = 0; i < matrix.length; i++) {
            if (i !== pivotRow && matrix[i][col] === 1) {
              for (let j = col; j < unknowns; j++)
                matrix[i][j] ^= matrix[pivotRow][j];
            }
          }
          pivotRow++;
        }
      }
      setRank(pivotRow);
      setPivots(foundPivots);
    },
    [unknowns]
  );

  const addEquation = useCallback(() => {
    if (rows.length >= 8) return;
    const rowData: number[] = Array.from({ length: unknowns }, () =>
      Math.random() > 0.65 ? 1 : 0
    );
    if (rowData.reduce((s, v) => s + v, 0) === 0)
      rowData[Math.floor(Math.random() * unknowns)] = 1;
    const newRow: MatrixRow = { data: rowData, id: `row-${Date.now()}` };
    const newRows = [...rows, newRow];
    setRows(newRows);
    analyzeRank(newRows);
  }, [rows, unknowns, analyzeRank]);

  const reset = useCallback(() => {
    setRows([]);
    setRank(0);
    setPivots([]);
  }, []);

  return (
    <div className="rq-viz-container" id="viz-matrix">
      <div className="rq-viz-header">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-white text-base uppercase tracking-widest">Interactive 01</h4>
            <div className="text-[11px] text-slate-400 uppercase tracking-[0.2em] font-mono">The Matrix View</div>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={addEquation} className="rq-btn-action">Add Equation</button>
          <button type="button" onClick={reset} className="rq-btn-secondary">Reset</button>
        </div>
      </div>
      <div className="flex-1 p-6 md:p-10 flex flex-col xl:flex-row gap-10 xl:gap-14 items-start overflow-hidden">
        <div className="font-mono text-sm leading-relaxed overflow-x-auto w-full xl:flex-1 xl:min-w-0 min-h-[200px] md:min-h-[300px] pb-4 scrollbar-thin scrollbar-thumb-white/10">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 md:py-36 opacity-20 border-2 border-dashed border-white/5 rounded-3xl w-full">
              <div className="text-sm font-mono uppercase tracking-[0.5em] font-black text-slate-500">
                Waiting for Stream
              </div>
            </div>
          ) : (
            <div className="inline-flex flex-col">
              {rows.map((row, rIdx) => {
                const hasPivot = pivots.some((p) => p.row === rIdx);
                return (
                  <div key={row.id} className="flex items-center gap-4 md:gap-8 mb-4 md:mb-6 group relative whitespace-nowrap">
                    <div className="flex gap-2 md:gap-3 p-2 md:p-3 bg-white/[0.02] rounded-2xl md:rounded-[1.25rem] border border-white/5 shadow-2xl backdrop-blur-xl transition-all group-hover:border-white/10 group-hover:bg-white/[0.04]">
                      {row.data.map((val, cIdx) => {
                        const isPivot = pivots.some(
                          (p) => p.row === rIdx && p.col === cIdx
                        );
                        return (
                          <div
                            key={cIdx}
                            className={`rq-data-grid-cell ${val ? "rq-cell-1" : "rq-cell-0"} ${isPivot ? "rq-cell-pivot" : ""}`}
                          >
                            {val}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[9px] md:text-[10px] font-mono text-slate-500 font-black uppercase tracking-[0.3em]">
                        Packet {rIdx + 1}
                      </span>
                      <span
                        className={`text-[8px] md:text-[9px] font-mono uppercase tracking-[0.15em] ${hasPivot ? "text-cyan-400 font-bold" : "text-red-500/70"}`}
                      >
                        {hasPivot ? "Information Pivot" : "Linear Dependency"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="space-y-8 w-full xl:flex-1">
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-bold mb-3">
              System Solvability
            </div>
            <div
              className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter transition-all duration-700 ${
                rank >= unknowns
                  ? "text-cyan-400 drop-shadow-[0_0_40px_rgba(34,211,238,0.5)]"
                  : "text-slate-800"
              }`}
            >
              RANK: {rank} / {unknowns}
            </div>
          </div>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed font-light max-w-xl">
            We are solving{" "}
            <RaptorQMathTooltip mathKey="linear-system">
              <em className="text-slate-200 font-mono italic">Ax = b</em>
            </RaptorQMathTooltip>{" "}
            over GF(2). In this field, addition is XOR. In the real RFC 6330
            scheme, most work stays XOR-cheap, but a small &quot;insurance&quot;
            component uses GF(256) to improve rank.
          </p>
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6 md:p-8 rounded-2xl border border-white/10 text-sm text-blue-200/80 backdrop-blur-xl relative overflow-hidden group max-w-xl">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all duration-500" />
            <strong className="block mb-2 text-blue-300 text-base md:text-lg relative z-10 font-bold">
              Rank-Nullity Theorem
            </strong>
            <span className="relative z-10">
              Every new <em>linearly independent</em> packet reduces the
              uncertainty of the system. When Rank equals K, the solution space
              collapses to a single point: your file.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 3. DEGREE RIPPLE VIZ
// ============================================
export function DegreeRippleViz() {
  const barRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState("rfc6330");
  const [K, setK] = useState(800);
  const [overheadPct, setOverheadPct] = useState(5);
  const [stats, setStats] = useState("");

  const containerRef = useIntersectionInit(
    useCallback(() => {
      runSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const getDistribution = useCallback(
    (currentDist: string) => {
      const labels = Array.from({ length: 15 }, (_, i) => String(i + 1));
      let p: number[];
      if (currentDist === "rfc6330") {
        p = [0.005, 0.49, 0.16, 0.08, 0.05, 0.04, 0.03, 0.02, 0.015, 0.01, 0.01, 0.01, 0.01, 0.01, 0.06];
      } else if (currentDist === "robust") {
        p = labels.map((_, i) => (1 / (i + 1)) * Math.exp(-(i + 1) / 7));
        const s = p.reduce((a, b) => a + b, 0);
        p = p.map((v) => v / s);
      } else {
        p = labels.map((d, i) =>
          d === "1" ? 1 / K : 1 / ((i + 1) * Math.max(1, i))
        );
        const s = p.reduce((a, b) => a + b, 0);
        p = p.map((v) => v / s);
      }
      return { p, labels };
    },
    [K]
  );

  const renderCharts = useCallback(
    (
      distribution: { p: number[]; labels: string[] },
      rippleSeries: { step: number; ripple: number }[]
    ) => {
      import("d3").then((d3) => {
        // Bar chart
        const b = barRef.current;
        if (b) {
          b.innerHTML = "";
          const wB = b.clientWidth || 300;
          const hB = b.clientHeight || 260;
          const svgB = d3.select(b).append("svg").attr("width", wB).attr("height", hB);
          const xB = d3.scaleBand().domain(distribution.labels).range([60, wB - 20]).padding(0.4);
          const yB = d3.scaleLinear().domain([0, d3.max(distribution.p) || 0.5]).range([hB - 60, 30]);

          const grad = svgB.append("defs").append("linearGradient").attr("id", "rq-bar-grad").attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%");
          grad.append("stop").attr("offset", "0%").attr("stop-color", COLORS.cyan);
          grad.append("stop").attr("offset", "100%").attr("stop-color", COLORS.blue);

          svgB.append("g").attr("transform", `translate(0, ${hB - 60})`).call(d3.axisBottom(xB)).attr("color", "#222");
          svgB.selectAll("rect.bar").data(distribution.p).enter().append("rect").attr("class", "bar")
            .attr("x", (_, i) => xB(distribution.labels[i]) || 0)
            .attr("y", (d) => yB(d))
            .attr("width", xB.bandwidth())
            .attr("height", (d) => Math.max(0, hB - 60 - yB(d)))
            .attr("fill", "url(#rq-bar-grad)").attr("rx", 4).attr("opacity", 0.85);
        }

        // Line chart
        const l = lineRef.current;
        if (l) {
          l.innerHTML = "";
          const wL = l.clientWidth || 300;
          const hL = l.clientHeight || 260;
          const svgL = d3.select(l).append("svg").attr("width", wL).attr("height", hL);
          const xL = d3.scaleLinear().domain([0, K]).range([60, wL - 20]);
          const yL = d3.scaleLinear().domain([0, d3.max(rippleSeries, (d) => d.ripple) || 100]).range([hL - 60, 30]);
          const line = d3.line<{ step: number; ripple: number }>().x((d) => xL(d.step)).y((d) => yL(d.ripple)).curve(d3.curveBasis);

          const path = svgL.append("path").datum(rippleSeries).attr("fill", "none").attr("stroke", COLORS.purple).attr("stroke-width", 3).attr("d", line).attr("stroke-linecap", "round");

          const totalLen = path.node()?.getTotalLength() || 0;
          if (totalLen > 0) {
            path.attr("stroke-dasharray", totalLen).attr("stroke-dashoffset", totalLen).transition().duration(2000).ease(d3.easeCubicInOut).attr("stroke-dashoffset", 0);
          }
        }
      });
    },
    [K]
  );

  const runSimulation = useCallback(() => {
    const distribution = getDistribution(dist);
    const steps = 100;
    const rippleSeries: { step: number; ripple: number }[] = [];
    let currentRipple = Math.ceil(K * distribution.p[0] * 2.0);
    let solved = 0;
    for (let i = 0; i < steps; i++) {
      const progress = i / steps;
      if (progress < 0.88) {
        currentRipple += (Math.random() - 0.48) * (K / 30);
      } else {
        currentRipple *= 0.7;
      }
      if (currentRipple < 0) currentRipple = 0;
      rippleSeries.push({ step: i * (K / steps), ripple: currentRipple });
      if (currentRipple > 0) solved += K / steps;
    }
    const recoveredPct = Math.min(100, (solved / K) * 100);
    const mCount = Math.ceil(K * (1 + overheadPct / 100));
    setStats(
      `Variables: ${K} | Equations: ${mCount} | Overhead: ${overheadPct}% | Success: ${recoveredPct.toFixed(1)}%`
    );

    // Render using D3
    renderCharts(distribution, rippleSeries);
  }, [dist, K, overheadPct, getDistribution, renderCharts]);

  return (
    <div ref={containerRef} className="rq-viz-container" id="viz-degree-ripple">
      <div className="rq-viz-header">
        <h4 className="font-bold text-white uppercase tracking-widest text-sm flex items-center gap-2">
          <span className="w-2 h-2 bg-purple-400 rounded-full" />
          Interactive 02: Degrees &amp; Ripple
        </h4>
        <div className="flex gap-2">
          <button type="button" onClick={runSimulation} className="rq-btn-action">Simulate</button>
        </div>
      </div>
      <div className="p-4 md:p-6 border-b border-white/5 bg-white/[0.01]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Distribution</div>
            <select
              value={dist}
              onChange={(e) => { setDist(e.target.value); }}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            >
              <option value="rfc6330">RFC 6330 Degree Table (RaptorQ)</option>
              <option value="robust">Robust Soliton (LT)</option>
              <option value="ideal">Ideal Soliton</option>
            </select>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500">K (variables)</div>
                <div className="text-[10px] font-mono text-slate-400">{K}</div>
              </div>
              <input type="range" min="200" max="2000" step="100" value={K} onChange={(e) => setK(parseInt(e.target.value, 10))} className="w-full accent-cyan-400" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Overhead</div>
                <div className="text-[10px] font-mono text-slate-400">{overheadPct}%</div>
              </div>
              <input type="range" min="0" max="20" step="1" value={overheadPct} onChange={(e) => setOverheadPct(parseInt(e.target.value, 10))} className="w-full accent-purple-400" />
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
          <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-3">Degree Distribution</div>
          <div ref={barRef} className="h-[200px] md:h-[260px]" />
        </div>
        <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
          <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-3">Ripple During Peeling</div>
          <div ref={lineRef} className="h-[200px] md:h-[260px]" />
        </div>
      </div>
      <div className="p-4 md:p-6 border-t border-white/5 text-sm text-slate-500 text-center">
        {stats}
      </div>
    </div>
  );
}

// ============================================
// 4. PEELING VIZ
// ============================================

interface PeelingNode {
  id: string;
  type: "src" | "pkt";
  solved: boolean;
  deg: number;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
}

interface PeelingLink {
  source: PeelingNode | string;
  target: PeelingNode | string;
}

export function PeelingViz() {
  const svgRef = useRef<SVGSVGElement>(null);
  const nodesRef = useRef<PeelingNode[]>([]);
  const linksRef = useRef<PeelingLink[]>([]);
  const simRef = useRef<d3.Simulation<PeelingNode, PeelingLink> | null>(null);
  const [, forceRender] = useState(0);
  const { capabilities } = useDeviceCapabilities();

  const initGraph = useCallback(() => {
    import("d3").then((d3) => {
      const svg = svgRef.current;
      if (!svg) return;
      const w = svg.clientWidth || 600;
      const h = svg.clientHeight || 400;

      const K = capabilities.tier === "low" ? 8 : 12;
      const M = capabilities.tier === "low" ? 12 : 18;

      const nodes: PeelingNode[] = [];
      const links: PeelingLink[] = [];

      for (let i = 0; i < K; i++) {
        nodes.push({ id: `s${i}`, type: "src", solved: false, deg: 0, x: 200, y: Math.random() * h });
      }
      for (let i = 0; i < M; i++) {
        const d = Math.random() > 0.8 ? 1 : Math.random() > 0.5 ? 2 : 3;
        const n: PeelingNode = { id: `p${i}`, type: "pkt", solved: false, deg: d, x: w - 200, y: Math.random() * h };
        nodes.push(n);
        const indices = d3.shuffle(d3.range(K)).slice(0, d);
        indices.forEach((s) => links.push({ source: `s${s}`, target: n.id }));
      }

      nodesRef.current = nodes;
      linksRef.current = links;

      simRef.current = d3
        .forceSimulation<PeelingNode>(nodes)
        .force(
          "link",
          d3.forceLink<PeelingNode, PeelingLink>(links).id((d) => d.id).distance(110)
        )
        .force("charge", d3.forceManyBody().strength(-500))
        .force("center", d3.forceCenter(w / 2, h / 2))
        .on("tick", () => forceRender((c) => c + 1));
    });
  }, [capabilities.tier]);

  const containerRef = useIntersectionInit(
    useCallback(() => {
      if (capabilities.tier === "low") return; // skip force sim on low-tier
      initGraph();
      return () => {
        simRef.current?.stop();
      };
    }, [capabilities.tier, initGraph])
  );

  const step = useCallback(() => {
    const nodes = nodesRef.current;
    const links = linksRef.current;
    const pivot = nodes.find((n) => n.type === "pkt" && n.deg === 1);
    if (!pivot) return;
    const edge = links.find(
      (l) =>
        (typeof l.target === "string" ? l.target : l.target.id) === pivot.id
    );
    if (!edge) return;
    const sourceNode =
      typeof edge.source === "string"
        ? nodes.find((n) => n.id === edge.source)
        : edge.source;
    if (sourceNode) sourceNode.solved = true;

    const sourceId = typeof edge.source === "string" ? edge.source : edge.source.id;

    links
      .filter((l) => {
        const sid = typeof l.source === "string" ? l.source : l.source.id;
        return sid === sourceId;
      })
      .forEach((l) => {
        const target =
          typeof l.target === "string"
            ? nodes.find((n) => n.id === l.target)
            : l.target;
        if (target) target.deg--;
      });

    linksRef.current = links.filter((l) => {
      const sid = typeof l.source === "string" ? l.source : l.source.id;
      return sid !== sourceId;
    });
    pivot.deg = 0;
    simRef.current?.alpha(0.5).restart();
    forceRender((c) => c + 1);
  }, []);

  const resetViz = useCallback(() => {
    simRef.current?.stop();
    initGraph();
  }, [initGraph]);

  const nodes = nodesRef.current;
  const links = linksRef.current;

  return (
    <div ref={containerRef} className="rq-viz-container" id="viz-peeling">
      <div className="rq-viz-header">
        <h4 className="font-bold text-white uppercase tracking-widest text-sm flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-400 rounded-full" />
          Interactive 05: The Peeling Cascade
        </h4>
        <div className="flex gap-2">
          <button type="button" onClick={step} className="rq-btn-action">Peel Step</button>
          <button type="button" onClick={resetViz} className="rq-btn-secondary">Reset</button>
        </div>
      </div>
      <div className="flex-1 w-full h-[300px] md:h-[400px] relative">
        <svg ref={svgRef} className="w-full h-full">
          {links.map((l, i) => {
            const s = typeof l.source === "string" ? nodes.find((n) => n.id === l.source) : l.source;
            const t = typeof l.target === "string" ? nodes.find((n) => n.id === l.target) : l.target;
            if (!s || !t) return null;
            return (
              <line
                key={i}
                x1={s.x}
                y1={s.y}
                x2={t.x}
                y2={t.y}
                stroke="#1e293b"
                strokeWidth={2}
                opacity={0.4}
              />
            );
          })}
          {nodes.map((n) => (
            <g key={n.id} transform={`translate(${n.x}, ${n.y})`}>
              <circle
                r={n.type === "src" ? 20 : 14}
                fill={
                  n.type === "src"
                    ? n.solved
                      ? COLORS.emerald
                      : COLORS.bg
                    : n.deg === 1
                      ? COLORS.cyan
                      : n.deg === 0
                        ? "transparent"
                        : COLORS.blue
                }
                stroke={n.deg === 1 || n.solved ? COLORS.white : "#334155"}
                strokeWidth={3}
                opacity={n.type === "pkt" && n.deg === 0 ? 0 : 1}
              />
              {n.type === "pkt" && n.deg > 0 && (
                <text
                  dy="0.35em"
                  textAnchor="middle"
                  fill={COLORS.white}
                  fontSize="10"
                  fontWeight="900"
                >
                  {n.deg}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
      <div className="p-4 md:p-6 border-t border-white/5 text-center text-sm text-slate-500">
        Click &quot;Peel Step&quot; to find degree-1 packets (cyan) and resolve their source blocks (green).
      </div>
    </div>
  );
}

// ============================================
// 5. PRECODE VIZ
// ============================================
export function PrecodeViz() {
  const svgRef = useRef<SVGSVGElement>(null);

  const animate = useCallback(() => {
    import("d3").then((d3) => {
      const svg = d3.select(svgRef.current);
      if (!svg.node()) return;
      svg.selectAll("*").remove();

      const K = 24;
      const P = 6;
      const L = K + P;
      const size = 10;
      const step = 14;

      const g = svg.append("g").attr("transform", "translate(80, 40)");

      const heads = ["SOURCE (K)", "INTERMEDIATE (L)", "RECOVERED"];
      g.selectAll(".head")
        .data(heads)
        .enter()
        .append("text")
        .attr("x", (_, i) => i * 220 + size / 2)
        .attr("y", -20)
        .attr("fill", "#94a3b8") // Slate-400 for better contrast
        .attr("text-anchor", "middle")
        .attr("font-size", "12") // Increased from 10
        .attr("font-weight", "900")
        .attr("letter-spacing", "0.2em")
        .text((d) => d);

      const data = d3.range(L).map((i) => ({
        i,
        type: i < K ? "src" : "par",
      }));

      const rects = g
        .selectAll(".base")
        .data(data)
        .enter()
        .append("rect")
        .attr("y", (d) => d.i * step)
        .attr("width", size)
        .attr("height", size)
        .attr("fill", (d) => (d.type === "src" ? COLORS.blue : COLORS.purple))
        .attr("rx", 3)
        .attr("opacity", 0);

      rects.transition().duration(500).delay((d) => d.i * 20).attr("opacity", 1);

      setTimeout(() => {
        const received = data.filter((d) => d.i !== 12 && d.i !== 20);
        g.selectAll(".rx")
          .data(received)
          .enter()
          .append("rect")
          .attr("class", "rx")
          .attr("x", 440)
          .attr("y", (d) => d.i * step)
          .attr("width", size)
          .attr("height", size)
          .attr("fill", (d) => (d.type === "src" ? COLORS.blue : COLORS.purple))
          .attr("rx", 3)
          .attr("opacity", 0)
          .transition()
          .duration(700)
          .delay((d) => d.i * 15)
          .attr("opacity", 1);

        [12, 20].forEach((i) => {
          g.append("rect")
            .attr("x", 440)
            .attr("y", i * step)
            .attr("width", size)
            .attr("height", size)
            .attr("fill", "none")
            .attr("stroke", COLORS.red)
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "4,2")
            .attr("opacity", 0.6);
        });
      }, 1600);

      setTimeout(() => {
        g.append("path")
          .attr("d", `M 15 ${K * step} C 220 ${K * step}, 220 ${12 * step}, 440 ${12 * step + size / 2}`)
          .attr("fill", "none")
          .attr("stroke", COLORS.emerald)
          .attr("stroke-width", 3)
          .attr("stroke-dasharray", "8,4")
          .attr("opacity", 0)
          .transition()
          .duration(800)
          .attr("opacity", 1);

        g.append("rect")
          .attr("x", 440)
          .attr("y", 12 * step)
          .attr("width", size)
          .attr("height", size)
          .attr("fill", COLORS.emerald)
          .attr("rx", 3)
          .attr("opacity", 0)
          .transition()
          .delay(600)
          .duration(500)
          .attr("opacity", 1);

        g.append("path")
          .attr("d", `M 15 ${(K + 1) * step} C 220 ${(K + 1) * step}, 220 ${20 * step}, 440 ${20 * step + size / 2}`)
          .attr("fill", "none")
          .attr("stroke", COLORS.emerald)
          .attr("stroke-width", 3)
          .attr("stroke-dasharray", "8,4")
          .attr("opacity", 0)
          .transition()
          .delay(900)
          .duration(800)
          .attr("opacity", 1);

        g.append("rect")
          .attr("x", 440)
          .attr("y", 20 * step)
          .attr("width", size)
          .attr("height", size)
          .attr("fill", COLORS.emerald)
          .attr("rx", 3)
          .attr("opacity", 0)
          .transition()
          .delay(1500)
          .duration(500)
          .attr("opacity", 1);
      }, 3200);
    });
  }, []);

  return (
    <div className="rq-viz-container" id="viz-precode">
      <div className="rq-viz-header">
        <h4 className="font-bold text-white uppercase tracking-widest text-sm flex items-center gap-2">
          <span className="w-2 h-2 bg-purple-400 rounded-full" />
          Interactive 03: The Precode Repair
        </h4>
      </div>
      <div className="flex-1 relative p-4 md:p-8 bg-gradient-to-b from-[#0a0a0c] to-[#050507] overflow-x-auto">
        <svg
          ref={svgRef}
          width="100%"
          height="460"
          viewBox="0 0 700 460"
          className="overflow-visible min-w-[280px] sm:min-w-[340px]"
        />
        <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6">
          <button type="button" onClick={animate} className="rq-btn-action">
            Run Simulation
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 6. TOY DECODE VIZ
// ============================================

interface ToyStep {
  text: string;
  known: Record<string, number>;
  active?: string;
  equations: string[];
}

const TOY_STEPS: ToyStep[] = [
  {
    text: "K=4 block initialized. Precode generates insurance parity P = A \u2295 C = 0x02.",
    known: {},
    equations: [],
  },
  {
    text: "Packet 1 arrives: Systematic symbol B = 0x42 is added to memory.",
    known: { B: 0x42 },
    active: "B",
    equations: ["B = 0x42"],
  },
  {
    text: "Packet 2 arrives: Systematic symbol D = 0x44 is added to memory.",
    known: { B: 0x42, D: 0x44 },
    active: "D",
    equations: ["B = 0x42", "D = 0x44"],
  },
  {
    text: "Packet 3 (Repair) arrives: y3 = P \u2295 D = 0x46. Since D is known, we solve P = y3 \u2295 D = 0x02.",
    known: { B: 0x42, D: 0x44, P: 0x02 },
    active: "P",
    equations: ["B = 0x42", "D = 0x44", "y3 = P \u2295 D = 0x46"],
  },
  {
    text: "Packet 4 (Repair) arrives: y4 = A \u2295 B = 0x03. Since B is known, we solve A = y4 \u2295 B = 0x41.",
    known: { A: 0x41, B: 0x42, D: 0x44, P: 0x02 },
    active: "A",
    equations: ["B = 0x42", "D = 0x44", "y3 = P \u2295 D = 0x46", "y4 = A \u2295 B = 0x03"],
  },
  {
    text: "DECODE FINAL: Using Precode P = A \u2295 C, we solve C = A \u2295 P = 0x43. File reconstructed!",
    known: { A: 0x41, B: 0x42, C: 0x43, D: 0x44, P: 0x02 },
    active: "C",
    equations: [
      "B = 0x42",
      "D = 0x44",
      "y3 = P \u2295 D = 0x46",
      "y4 = A \u2295 B = 0x03",
      "P = A \u2295 C = 0x02",
    ],
  },
];

export function ToyDecodeViz() {
  const [stepIdx, setStepIdx] = useState(0);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const step = TOY_STEPS[stepIdx];
  const symbols = ["A", "B", "C", "D", "P"];

  const next = useCallback(() => {
    setStepIdx((i) => Math.min(i + 1, TOY_STEPS.length - 1));
  }, []);

  const prev = useCallback(() => {
    setStepIdx((i) => Math.max(i - 1, 0));
  }, []);

  const reset = useCallback(() => {
    if (autoRef.current) {
      clearInterval(autoRef.current);
      autoRef.current = null;
    }
    setStepIdx(0);
  }, []);

  const autoPlay = useCallback(() => {
    if (autoRef.current) {
      clearInterval(autoRef.current);
      autoRef.current = null;
      return;
    }
    autoRef.current = setInterval(() => {
      setStepIdx((i) => {
        if (i >= TOY_STEPS.length - 1) {
          if (autoRef.current) clearInterval(autoRef.current);
          autoRef.current = null;
          return i;
        }
        return i + 1;
      });
    }, 2200);
  }, []);

  useEffect(() => {
    return () => {
      if (autoRef.current) clearInterval(autoRef.current);
    };
  }, []);

  return (
    <div className="rq-viz-container" id="viz-toy-decode">
      <div className="rq-viz-header flex-wrap gap-3">
        <h4 className="font-bold text-white uppercase tracking-widest text-sm flex items-center gap-2">
          <span className="w-2 h-2 bg-cyan-400 rounded-full" />
          Interactive 04: End-to-End Toy Decode
        </h4>
        <div className="flex gap-2 flex-wrap">
          <button type="button" onClick={prev} className="rq-btn-secondary">Back</button>
          <button type="button" onClick={next} className="rq-btn-action">Next</button>
          <button type="button" onClick={reset} className="rq-btn-secondary">Reset</button>
          <button type="button" onClick={autoPlay} className="rq-btn-action">Auto</button>
        </div>
      </div>
      <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="lg:col-span-2 bg-black/40 border border-white/5 rounded-2xl p-4">
          <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Step</div>
          <div className="text-slate-200 text-sm leading-relaxed">{step.text}</div>
        </div>
        <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
          <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-4">Symbols</div>
          <div className="grid grid-cols-5 gap-2 md:gap-4">
            {symbols.map((k) => {
              const v = step.known[k];
              const isActive = step.active === k;
              const isKnown = v !== undefined;
              return (
                <div
                  key={k}
                  className={`p-3 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all duration-500 flex flex-col items-center justify-center ${
                    isActive
                      ? "bg-cyan-400/15 border-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.3)] scale-105"
                      : isKnown
                        ? "bg-emerald-500/5 border-emerald-500/30"
                        : "bg-white/[0.02] border-white/5"
                  }`}
                >
                  <div className="text-[10px] md:text-[12px] text-slate-500 font-[950] tracking-[0.3em] md:tracking-[0.6em] mb-2 md:mb-4 uppercase">
                    {k}
                  </div>
                  <div
                    className={`font-mono text-lg md:text-3xl font-[1000] ${isKnown ? "text-white" : "text-slate-800"}`}
                  >
                    {isKnown ? `0x${v.toString(16).toUpperCase().padStart(2, "0")}` : "??"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
          <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-4">Equations</div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {step.equations.map((eq, i) => (
              <div
                key={i}
                className="px-3 md:px-5 py-2 md:py-3 rounded-full bg-white/[0.03] border border-white/10 text-xs md:text-sm text-slate-400 font-mono font-bold tracking-wider uppercase"
              >
                {eq}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="p-4 md:p-6 border-t border-white/5 text-sm text-slate-500 text-center">
        TRACE LOG: CYCLE {stepIdx + 1} / {TOY_STEPS.length}
      </div>
    </div>
  );
}
