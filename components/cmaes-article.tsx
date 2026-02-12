"use client";

import "katex/dist/katex.min.css";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  Crimson_Pro,
  JetBrains_Mono,
  Bricolage_Grotesque,
} from "next/font/google";
import { RotateCcw, Activity, Cpu, Box } from "lucide-react";
import katex from "katex";
import { CMAESJargon } from "./cmaes-jargon";
import { CMAESMathTooltip } from "./cmaes-math-tooltip";
import { GranularMath } from "./granular-math";

// Dynamic import visualizations (no SSR)
const HeroCMAES = dynamic(
  () => import("./cmaes-visualizations").then((m) => ({ default: m.HeroCMAES })),
  { ssr: false }
);
const SelectionWalkthrough = dynamic(
  () => import("./cmaes-visualizations").then((m) => ({ default: m.SelectionWalkthrough })),
  { ssr: false }
);
const ComparisonViz = dynamic(
  () => import("./cmaes-visualizations").then((m) => ({ default: m.ComparisonViz })),
  { ssr: false }
);
const BenchmarkRunner = dynamic(
  () => import("./cmaes-visualizations").then((m) => ({ default: m.BenchmarkRunner })),
  { ssr: false }
);
const NoiseRobustnessViz = dynamic(
  () => import("./cmaes-visualizations").then((m) => ({ default: m.NoiseRobustnessViz })),
  { ssr: false }
);
const RestartViz = dynamic(
  () => import("./cmaes-visualizations").then((m) => ({ default: m.RestartViz })),
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

// KaTeX helpers
function M({ t, explanation }: { t: string; explanation?: string }) {
  const html = katex.renderToString(t, {
    throwOnError: false,
    displayMode: false,
  });
  const content = (
    <span
      className="rq-math-inline"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );

  if (explanation) {
    return <CMAESMathTooltip mathKey={explanation}>{content}</CMAESMathTooltip>;
  }
  return content;
}

// Shorthand for jargon
function J({
  t,
  children,
}: {
  t: string;
  children?: React.ReactNode;
}) {
  return <CMAESJargon term={t}>{children}</CMAESJargon>;
}

// Section divider
function Divider() {
  return <div className="w-full h-px my-12 md:my-16 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />;
}

// Editorial container
function EC({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[800px] mx-auto px-4 md:px-6 relative z-10">
      {children}
    </div>
  );
}

export function CMAESArticle() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const articleRef = useRef<HTMLDivElement>(null);

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
      ":scope > section:not(:first-child), :scope > article"
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("rq-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -60px 0px" }
    );
    targets.forEach((el) => {
      el.classList.add("rq-fade-section");
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={articleRef}
      className={`cmaes-scope rq-body ${crimsonPro.variable} ${jetbrainsMono.variable} ${bricolageGrotesque.variable}`}
      style={{ background: "#020204", color: "#f8fafc" }}
    >
      {/* Scroll Progress */}
      <div
        className="rq-progress-bar !bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      {/* ========== HERO ========== */}
      <section data-section="hero" className="min-h-screen flex flex-col justify-start relative overflow-hidden pb-20 pt-24 md:pt-32">
        <HeroCMAES />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020204]/60 to-[#020204] z-10" />

        <EC>
          <div className="text-center relative z-20">
            <div className="inline-flex items-center gap-3 mb-12 px-4 md:px-6 py-2.5 rounded-full border border-white/10 bg-white/5 text-[11px] md:text-[12px] font-mono text-amber-400 tracking-[0.3em] uppercase backdrop-blur-xl">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              Non-Convex Intelligence / Adaptive Search
            </div>
            <h1 className="rq-display-title mb-6 text-white">
              The Incredible Magic of
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 drop-shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                CMA-ES.
              </span>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-slate-400 max-w-3xl mx-auto leading-tight mt-12 font-light">
              Designing wings, bridges, and neural networks when you have{" "}
              <span className="text-white font-medium italic underline decoration-amber-500/50 underline-offset-8">no gradients</span> and no time to waste.
            </p>
          </div>
        </EC>

        <div
          className="absolute bottom-16 left-0 w-full flex flex-col items-center gap-4 z-20 transition-opacity duration-500"
          style={{ opacity: Math.max(0, 0.5 - scrollProgress * 5) }}
        >
          <span className="text-[11px] uppercase tracking-[0.4em] text-white/40">
            Scroll to Optimize
          </span>
          <div className="w-px h-16 bg-gradient-to-b from-amber-500/20 to-transparent" />
        </div>
      </section>

      {/* ========== INTRO ========== */}
      <article>
        <EC>
          <p className="rq-drop-cap !text-amber-500/90">
            In modern machine learning, <J t="objective-function">optimization</J> almost automatically implies <strong className="text-white">gradients</strong>. Adam, Adafactor, Lion, and SGD are all variants of the same concept: moving parameters downhill along a cheaply computed gradient.
          </p>
          <p>
            However, many important problems exist where the gradient is either absent, meaningless, or too expensive to approximate. For these <J t="black-box-optimization">black-box optimization</J> scenarios, <J t="cma-es">CMA-ES</J> (Covariance Matrix Adaptation Evolution Strategy) is a remarkably effective tool.
          </p>
          <p>
            CMA-ES is a <J t="zero-order">Zero-Order</J> optimizer. It operates without knowing the local slope of the landscape, relying instead on the height of the objective at various points. This approach provides a principled method for navigating toward optimal solutions using only function evaluations.
          </p>
        </EC>
      </article>

      <Divider />

      {/* ========== 1. WHAT IT IS ========== */}
      <section>
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white">
            1. The Search Mechanism
          </h2>
          <p>
            CMA-ES maintains a <J t="multivariate-normal">Gaussian search distribution</J> over the parameter space. It iteratively adapts the mean and covariance of this Gaussian to concentrate probability mass in regions where the objective performs well.
          </p>
          <p>
            Consider an unknown function <M t="f:\mathbb{R}^n \to \mathbb{R}" /> that requires minimization. The algorithm is initialized with the dimension <M t="n" />, an initial parameter guess, and a starting step scale.
          </p>
          <p>The process then repeats through four primary phases:</p>
          <ol className="space-y-6 text-slate-300 my-10">
            <li className="flex gap-4">
              <span className="text-amber-500 font-mono font-bold">1.</span>
              <div>
                <strong>Sampling:</strong> Candidate points are drawn from a multivariate normal distribution:
                
                <GranularMath 
                  block
                  parts={[
                    { tex: "x_i", key: "candidate-point", color: "blue" },
                    { tex: "\\sim", key: "operator", color: "slate" },
                    { tex: "\\mathcal{N}", key: "normal-symbol", color: "purple" },
                    { tex: "(", key: "operator", color: "slate" },
                    { tex: "m", key: "mean-vector", color: "amber" },
                    { tex: ",", key: "operator", color: "slate" },
                    { tex: "\\sigma^2", key: "sigma-sq", color: "orange" },
                    { tex: "C", key: "covariance-matrix", color: "red" },
                    { tex: ")", key: "operator", color: "slate" },
                  ]}
                />

                where <GranularMath parts={[{ tex: "m", key: "mean-vector", color: "amber" }]} /> is the current mean, <GranularMath parts={[{ tex: "\\sigma", key: "step-size", color: "orange" }]} /> is a scalar step-size, and <GranularMath parts={[{ tex: "C", key: "covariance-matrix", color: "red" }]} /> is a covariance matrix defining the current search shape.
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-amber-500 font-mono font-bold">2.</span>
              <div><strong>Evaluation:</strong> The black-box function <M t="f(x_i)" /> is evaluated at each point.</div>
            </li>
            <li className="flex gap-4">
              <span className="text-amber-500 font-mono font-bold">3.</span>
              <div><strong>Ranking:</strong> Samples are sorted by their objective performance.</div>
            </li>
            <li className="flex gap-4">
              <span className="text-amber-500 font-mono font-bold">4.</span>
              <div><strong>Adaptation:</strong> The parameters <M t="m" />, <M t="\sigma" />, and <M t="C" /> are adjusted to increase the likelihood of sampling from high-performance regions in the next generation.</div>
            </li>
          </ol>
          
          <SelectionWalkthrough />

          <p className="mt-12 text-pretty">
            The initially spherical Gaussian gradually transforms into a rotated and stretched <J t="covariance-matrix">ellipsoid</J>. This shape aligns with the valleys and ridges of the objective function, implicitly learning the local <J t="hessian">Hessian</J> without calculating derivatives.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== 2. NO GRADIENT ========== */}
      <section>
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white text-balance">
            2. The Differentiability Gap
          </h2>
          <p className="mb-16">
            In many practical engineering settings, the mapping from parameters to outcomes is a jagged and discontinuous landscape. Traditional derivatives in these environments are often meaningless.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 my-16">
            <div className="md:col-span-3 rq-insight-card !m-0 !p-10 border-amber-500/20 group hover:border-amber-500/40 transition-all duration-500">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6">
                <Box className="w-6 h-6 text-amber-400" />
              </div>
              <h4 className="text-2xl font-black text-white mb-4 group-hover:text-amber-400 transition-colors tracking-tight">Airplane Wings</h4>
              <p className="text-base text-slate-400 leading-relaxed mb-0 font-light">
                CFD simulations can take hours per run. Discontinuities arising from meshing and turbulence models make finite differences unreliable. A single gradient step might require days of computation.
              </p>
            </div>
            
            <div className="md:col-span-3 rq-insight-card !m-0 !p-10 border-orange-500/20 group hover:border-orange-500/40 transition-all duration-500">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-6">
                <Activity className="w-6 h-6 text-orange-400" />
              </div>
              <h4 className="text-2xl font-black text-white mb-4 group-hover:text-orange-400 transition-colors tracking-tight">Suspension Bridges</h4>
              <p className="text-base text-slate-400 leading-relaxed mb-0 font-light">
                Finite element models involve sharp changes as constraints flip between satisfied and violated states. Brittle constraints and mode-crossing make standard gradient descent ineffective.
              </p>
            </div>

            <div className="md:col-span-6 rq-insight-card !m-0 !p-10 border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent group hover:border-red-500/40 transition-all duration-500">
              <div className="flex flex-col md:flex-row gap-10 items-center">
                <div className="flex-1">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-6">
                    <Cpu className="w-6 h-6 text-red-400" />
                  </div>
                  <h4 className="text-3xl font-black text-white mb-4 group-hover:text-red-400 transition-colors tracking-tight">Transformer Hyperparameters</h4>
                  <p className="text-lg text-slate-400 leading-relaxed mb-0 font-light text-pretty">
                    Architecture choices such as layer counts and attention heads are inherently discrete. The extreme cost of training runs often limits the total evaluation budget to a few hundred points.
                  </p>
                </div>
                <div className="hidden md:block w-px h-32 bg-white/5" />
                <div className="md:w-1/3 text-center">
                  <div className="text-5xl font-black text-white mb-2 tracking-tighter">200</div>
                  <div className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500">Typical Eval Budget</div>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-16">
            Naive grid search is equally impractical; a simple 10-dimensional grid with 10 values per axis requires <M t="10^{10}" /> simulations. CMA-ES provides a solution by efficiently moving through the search space using a manageable number of samples.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== 3. GRADIENT HIERARCHY ========== */}
      <section>
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white text-balance">
            3. The Gradient Hierarchy
          </h2>
          <p className="mb-8">
            Clear and inexpensive gradients should almost always be leveraged. <J t="first-order">First-order</J> methods like Adam or SGD are highly efficient because they utilize the exact local slope.
          </p>
          <p className="mb-12">
            CMA-ES is intended for scenarios where gradients are unavailable, computationally prohibitive, or obscured by numerical noise. It serves as a robust alternative when local slopes are too deceptive for reliable optimization.
          </p>
          
          <ComparisonViz />

          <p className="mt-12 text-pretty">
            By the fifth generation, the covariance <M t="C" /> typically evolves beyond its initial state. Its eigenvectors align with directions where the objective varies gently, allowing the distribution to navigate narrow valleys effectively. This process approximates the local curvature without requiring a formal Hessian or explicit gradients.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== INVARIANCES ========== */}
      <section>
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white">
            The Invariance Property
          </h2>
          <p>
            CMA-ES maintains robustness through its <J t="invariance">Invariance</J> properties, making it essentially &quot;coordinate-free.&quot;
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
            <div className="rq-insight-card !m-0 border-amber-500/20 p-8">
              <h4 className="text-white font-bold mb-3">Translation & Rotation</h4>
              <p className="text-sm text-slate-400 mb-0">
                Rotating the search space or shifting the starting point does not alter the algorithm&rsquo;s trajectory. It is independent of the axis orientation.
              </p>
            </div>
            <div className="rq-insight-card !m-0 border-orange-500/20 p-8">
              <h4 className="text-white font-bold mb-3">Rank-Based Scaling</h4>
              <p className="text-sm text-slate-400 mb-0">
                Because selection relies solely on the <strong>rank</strong> of samples, the algorithm is invariant to monotonic transforms of the objective. Optimizing <M t="f(x)" /> yields identical results to optimizing <M t="\log(f(x))" />.
              </p>
            </div>
          </div>
          <p>
            This design minimizes the need for precise parameter scaling or objective preprocessing, making it a reliable default for diverse problems.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== NOISE ========== */}
      <section>
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white">
            Stochastic Robustness
          </h2>
          <p className="mb-12">
            Many engineering black-boxes are <J t="stochastic-optimization">Stochastic</J>, producing noisy feedback due to rounding errors or sensor jitter.
          </p>
          
          <NoiseRobustnessViz />

          <p className="mt-12 text-pretty">
            Gradient-based methods often struggle with noise because they depend on single-point estimates. CMA-ES leverages its entire population to filter out jitter, identifying the underlying global structure through the noise.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== MULTIMODALITY ========== */}
      <section>
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white text-balance">
            Escaping Local Minima
          </h2>
          <p className="mb-12">
            Real-world landscapes are frequently <J t="multimodality">Multimodal</J>, containing deceptive <J t="local-minima">Local Minima</J>. CMA-ES addresses this through a &quot;Restart with Increasing Population&quot; strategy (<J t="ipop-cma-es">IPOP</J>).
          </p>
          
          <RestartViz />

          <p className="mt-12">
            When progress stalls, the algorithm increases its search radius and expands the population size. This shift from local refinement to global exploration enables CMA-ES to locate the global optimum in vast and complex search spaces.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== 4. ORIGINS ========== */}
      <section>
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white">
            4. Historical Context
          </h2>
          <p>
            CMA-ES is the culmination of several historical lines of optimization research.
          </p>
          
          <div className="space-y-12 my-12">
            <div>
              <h4 className="text-amber-400 font-mono uppercase tracking-widest text-xs mb-4">Evolution Strategies</h4>
              <p className="text-slate-300">
                In contrast to genetic algorithms that emphasized bitstrings and crossover, the German <strong>evolution strategies</strong> community focused on continuous search spaces and Gaussian mutations. CMA-ES, introduced in the mid-1990s, extended this by adapting a <em>full covariance matrix</em>.
              </p>
            </div>
            
            <div>
              <h4 className="text-amber-400 font-mono uppercase tracking-widest text-xs mb-4">Information Geometry</h4>
              <p className="text-slate-300">
                Viewed through the lens of information geometry, the core CMA-ES update is a <strong>natural gradient</strong> step on the manifold of multivariate normals. This provides a rigorous mathematical foundation for its adaptive behavior.
              </p>
            </div>

            <div>
              <h4 className="text-amber-400 font-mono uppercase tracking-widest text-xs mb-4">Kriging &amp; Gaussian Processes</h4>
              <p className="text-slate-300">
                CMA-ES shares a common philosophical basis with <strong>Kriging</strong> (Gaussian-process regression). While Kriging models the unknown function itself, CMA-ES uses its Gaussian model as a <strong>proposal distribution</strong> to explore regions of low objective values.
              </p>
            </div>
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== 5. TWO WORLDS ========== */}
      <section>
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white">
            5. Disciplinary Silos
          </h2>
          <p>
            Optimization research is often divided into distinct communities that rarely interact.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
            <div className="bg-slate-900/40 p-10 rounded-2xl border border-white/5">
              <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> GECCO
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed mb-0">
                The evolutionary computation community focuses on EDAs, surrogate models, and derivative-free methods as the primary language of optimization.
              </p>
            </div>
            <div className="bg-slate-900/40 p-10 rounded-2xl border border-white/5">
              <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> NeurIPS
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed mb-0 text-pretty">
                The deep learning community primarily relies on backpropagation and SGD variants. While they utilize Bayesian optimization, evolutionary computation is often treated as a separate discipline.
              </p>
            </div>
          </div>
          <p>
            Bridging these worlds reveals conceptual overlaps, such as the relationship between CMA-ES and architectures like LeCun&rsquo;s <strong>Joint-Embedding Predictive Architectures (JEPA)</strong>.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== 6. CREATIVE SYSTEMS ========== */}
      <section>
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white">
            6. Creative System Optimization
          </h2>
          <p>
            CMA-ES is particularly useful for tuning systems where end-to-end differentiability is not feasible.
          </p>
          
          <h3 className="text-xl font-bold text-white mt-10 mb-4">Continuous Cellular Automata</h3>
          <p>
            Designing a continuous CA with specific visual dynamics—such as complexity or coherence—requires a scalar fitness function. Because gradients between these high-level properties and kernel weights do not exist, CMA-ES serves as an automated experimental collaborator, identifying parameter settings that produce intended dynamics.
          </p>
          
          <div className="rq-insight-card border-amber-500/30 p-10">
            <h4 className="text-white font-bold mb-4">Automated Collaboration</h4>
            <p className="text-slate-400 text-sm mb-0">
              By deforming its search distribution based on empirical results, the algorithm identifies configurations that would be difficult to discover through manual tuning.
            </p>
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== IMPLEMENTATIONS ========== */}
      <section>
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white">
            7. Implementations
          </h2>
          <p className="mb-16">
            Watch the algorithm navigate different landscapes in real-time below.
          </p>
          
          <BenchmarkRunner />

          <h3 className="text-2xl font-bold text-white mt-20 mb-8 tracking-tight">Personal Rust Implementations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="rq-insight-card !m-0 !p-8 bg-black/40 border-amber-500/10">
              <h4 className="text-amber-400 font-bold mb-4 uppercase tracking-widest text-xs font-mono">wasm_cmaes</h4>
              <p className="text-sm text-slate-300 mb-6">Rust CMA-ES compiled to WebAssembly, featuring SIMD-accelerated vector operations and internal Rayon parallelism.</p>
              <a href="https://github.com/Dicklesworthstone/wasm_cmaes" className="rq-btn-secondary !inline-flex items-center">Source Code</a>
            </div>
            <div className="rq-insight-card !m-0 !p-8 bg-black/40 border-orange-500/10">
              <h4 className="text-orange-400 font-bold mb-4 uppercase tracking-widest text-xs font-mono">fast_cmaes</h4>
              <p className="text-sm text-slate-300 mb-6">A high-performance Rust core with Python bindings, featuring vectorized objectives and a Rich-powered TUI.</p>
              <a href="https://github.com/Dicklesworthstone/fast_cmaes" className="rq-btn-secondary !inline-flex items-center">Source Code</a>
            </div>
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== TECHNICAL ADDENDUM ========== */}
      <section>
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white">
            Technical Addendum
          </h2>
          <p className="text-slate-400 italic mb-10">
            Notes derived from Nikolaus Hansen&rsquo;s 2024 tutorial.
          </p>
          
          <div className="space-y-10 text-slate-300">
            <div>
              <h4 className="text-white font-bold mb-3"><J t="multivariate-normal">The Search Distribution</J></h4>
              <p className="text-sm leading-relaxed">
                Optimization is conducted over a probability distribution <M t="\theta = (m, \sigma, C)" />, rather than directly in the parameter space.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-3"><J t="ranking">Invariance Properties</J></h4>
              <p className="text-sm leading-relaxed text-pretty">
                The algorithm is designed for rank-based invariance, ensuring consistent behavior under strictly increasing transforms of the objective function and rigid linear transforms of the search space.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3"><J t="step-size">Adaptive Step-size Control</J></h4>
              <p className="text-sm leading-relaxed">
                Cumulative Step-size Adaptation (CSA) increases the step scale when the evolution path indicates consistent directional progress.
              </p>
            </div>

            <div className="bg-black/50 border border-white/5 rounded-2xl p-4 md:p-10 flex justify-center overflow-x-auto">
              <GranularMath 
                parts={[
                  { tex: "p_\\sigma", key: "evolution-path", color: "purple" },
                  { tex: "=", key: "operator", color: "slate" },
                  { tex: "(1 - c_s)", key: "learning-rate-cs", color: "blue" },
                  { tex: "p_\\sigma", key: "evolution-path", color: "purple" },
                  { tex: "+", key: "operator", color: "slate" },
                  { tex: "\\sqrt{c_s(2-c_s)\\mu_{eff}}", key: "selection-mass", color: "emerald" },
                  { tex: "C^{-1/2}", key: "whitening", color: "red" },
                  { tex: "\\frac{m_{new} - m_{old}}{\\sigma}", key: "mean-shift", color: "amber" },
                ]}
              />
            </div>
          </div>
        </EC>
      </section>

      {/* Floating Scroll to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-4 md:right-8 md:bottom-8 w-12 h-12 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 opacity-0"
        style={{ opacity: scrollProgress > 0.2 ? 1 : 0, pointerEvents: scrollProgress > 0.2 ? 'auto' : 'none' }}
      >
        <RotateCcw className="w-6 h-6" />
      </button>

    </div>
  );
}
