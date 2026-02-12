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
import { MathTooltip } from "./math-tooltip";
import { getJargon } from "@/lib/cmaes-jargon";
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
    return <MathTooltip term={getJargon(explanation)} variant="orange">{content}</MathTooltip>;
  }
  return content;
}

function MBlock({ t, explanation }: { t: string; explanation?: string }) {
  const html = katex.renderToString(t, {
    throwOnError: false,
    displayMode: true,
  });
  const content = (
    <div
      className="rq-math-block"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );

  if (explanation) {
    return <MathTooltip term={getJargon(explanation)} variant="orange">{content}</MathTooltip>;
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
  const termData = getJargon(t);
  if (!termData) return <>{children}</>;

  return (
    <MathTooltip term={termData} variant="orange" mode="text">
      {children || termData.term}
    </MathTooltip>
  );
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
      <section className="min-h-screen flex flex-col justify-center relative overflow-hidden pb-20">
        <HeroCMAES />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020204]/60 to-[#020204] z-10" />

        <EC>
          <div className="text-center pt-32 relative z-20">
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
            If you live anywhere near modern machine learning, <J t="objective-function">optimization</J> almost automatically means <strong className="text-white">gradients</strong>. Adam, Adafactor, Lion, SGD with warm restarts—pick your favorite flavor, they&rsquo;re all dancing to the same tune: move parameters downhill along a gradient you can compute cheaply.
          </p>
          <p>
            But there&rsquo;s a big category of problems where the gradient either doesn&rsquo;t exist, is meaningless, or is so expensive to approximate that you might as well not bother. In that world—what people call <J t="black-box-optimization">black-box optimization</J>—my favorite tool by a wide margin is <J t="cma-es">CMA-ES</J>, the Covariance Matrix Adaptation Evolution Strategy.
          </p>
          <p>
            CMA-ES is a <J t="zero-order">Zero-Order</J> optimizer. It doesn&rsquo;t need to know the slope of the hill; it just needs to know the height at different points. It gives you a principled way to turn &quot;I can only evaluate this thing&quot; into &quot;I can reliably walk toward a good solution.&quot;
          </p>
          <p>
            This is an essay about why I like CMA-ES so much, how it works at an intuitive level, where it came from, and why I think it&rsquo;s still wildly underused in the neural-net world.
          </p>
        </EC>
      </article>

      <Divider />

      {/* ========== 1. WHAT IT IS ========== */}
      <section>
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white">
            1. What CMA-ES Is (And Why You Should Care)
          </h2>
          <p>
            At the highest possible level, CMA-ES does this:
          </p>
          <div className="rq-callout border-amber-500/30 bg-amber-500/5 my-10">
            <p className="text-xl text-slate-200 leading-relaxed mb-0">
              It keeps a <J t="multivariate-normal">Gaussian search distribution</J> over your parameter space and iteratively morphs that Gaussian—its mean and its covariance—to concentrate probability mass where the objective looks good.
            </p>
          </div>
          <p>
            Concretely, suppose you have some unknown function <M t="f:\mathbb{R}^n \to \mathbb{R}" /> that you want to <em>minimize</em>. You tell CMA-ES:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4 mb-8">
            <li>the dimension <M t="n" /></li>
            <li>an initial guess for the parameters (or just &quot;center me in the middle of the search box&quot;)</li>
            <li>an initial overall step scale</li>
          </ul>
          <p>Then, repeatedly:</p>
          <ol className="space-y-6 text-slate-300 my-10">
            <li className="flex gap-4">
              <span className="text-amber-500 font-mono font-bold">1.</span>
              <div>
                <strong>Sampling:</strong> It samples a small population of candidate points from a multivariate normal:
                
                <GranularMath 
                  block
                  parts={[
                    { tex: "x_i", key: "candidate-point", color: "blue" },
                    { tex: "\\sim", key: "operator", color: "slate" },
                    { tex: "\\mathcal{N}", key: "normal-symbol", color: "purple" },
                    { tex: "(", key: "normal-symbol", color: "slate" },
                    { tex: "m", key: "mean-vector", color: "amber" },
                    { tex: ",", key: "operator", color: "slate" },
                    { tex: "\\sigma^2", key: "sigma-sq", color: "orange" },
                    { tex: "C", key: "covariance-matrix", color: "red" },
                    { tex: ")", key: "normal-symbol", color: "slate" },
                  ]}
                />

                where <GranularMath parts={[{ tex: "m", key: "mean-vector", color: "amber" }]} /> is the current mean, <GranularMath parts={[{ tex: "\\sigma", key: "step-size", color: "orange" }]} /> is a scalar step-size, and <GranularMath parts={[{ tex: "C", key: "covariance-matrix", color: "red" }]} /> is a full covariance matrix encoding the current &quot;shape&quot; of promising directions.
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-amber-500 font-mono font-bold">2.</span>
              <div>
                <strong>Evaluation:</strong> It evaluates your expensive black-box <M t="f(x_i)" /> at each point.
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-amber-500 font-mono font-bold">3.</span>
              <div>
                <strong>Ranking:</strong> It ranks the samples by how good they were.
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-amber-500 font-mono font-bold">4.</span>
              <div>
                <strong>Adaptation:</strong> It nudges <M t="m" />, <M t="\sigma" />, and <M t="C" /> so that the next Gaussian puts more probability mass where the good samples came from and less where the bad ones came from.
              </div>
            </li>
          </ol>
          
          <SelectionWalkthrough />

          <p className="mt-12">
            Over time, the initially spherical Gaussian turns into a rotated, stretched <J t="covariance-matrix">ellipsoid</J> that lines up with the valleys and ridges of your objective function. It&rsquo;s implicitly learning something like the local <J t="hessian">Hessian</J> without ever seeing a derivative.
          </p>
          <p>
            Early on, samples are spread out, the covariance is mostly spherical, and the algorithm is &quot;groping in the dark.&quot; As evidence accumulates about which directions lead to better values, the ellipsoid tilts, stretches, and shrinks, zooming in on promising regions.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== 2. NO GRADIENT ========== */}
      <section>
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white text-balance">
            2. What It Means <em>Not</em> to Have a Gradient
          </h2>
          <p className="mb-16">
            When you first learn optimization, &quot;no gradient&quot; sounds like a minor annoyance. Just finite-difference it, right? Wrong. In the real world, the mapping from parameters to outcome is often a jagged, discontinuous landscape where derivatives are meaningless.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 my-16">
            <div className="md:col-span-3 rq-insight-card !m-0 !p-10 border-amber-500/20 group hover:border-amber-500/40 transition-all duration-500">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6">
                <Box className="w-6 h-6 text-amber-400" />
              </div>
              <h4 className="text-2xl font-black text-white mb-4 group-hover:text-amber-400 transition-colors tracking-tight">Airplane Wings</h4>
              <p className="text-base text-slate-400 leading-relaxed mb-0 font-light">
                Computational Fluid Dynamics (CFD) simulations take hours on a cluster. Meshing and turbulence model switching create sharp discontinuities. One gradient step could take days of compute.
              </p>
            </div>
            
            <div className="md:col-span-3 rq-insight-card !m-0 !p-10 border-orange-500/20 group hover:border-orange-500/40 transition-all duration-500">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-6">
                <Activity className="w-6 h-6 text-orange-400" />
              </div>
              <h4 className="text-2xl font-black text-white mb-4 group-hover:text-orange-400 transition-colors tracking-tight">Suspension Bridges</h4>
              <p className="text-base text-slate-400 leading-relaxed mb-0 font-light">
                Finite element models with mode-crossing and discrete material choices. Sharp changes when constraints flip from satisfied to violated. Gradient descent is helpless against brittle constraints.
              </p>
            </div>

            <div className="md:col-span-6 rq-insight-card !m-0 !p-10 border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent group hover:border-red-500/40 transition-all duration-500">
              <div className="flex flex-col md:flex-row gap-10 items-center">
                <div className="flex-1">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-6">
                    <Cpu className="w-6 h-6 text-red-400" />
                  </div>
                  <h4 className="text-3xl font-black text-white mb-4 group-hover:text-red-400 transition-colors tracking-tight">Transformer Hyperparameters</h4>
                  <p className="text-lg text-slate-400 leading-relaxed mb-0 font-light">
                    Layer counts, attention heads, and activation choices are inherently discrete. Training runs are ruinously expensive. Your evaluation budget is maybe a couple hundred points total.
                  </p>
                </div>
                <div className="hidden md:block w-px h-32 bg-white/5" />
                <div className="md:w-1/3 text-center">
                  <div className="text-5xl font-black text-white mb-2 tracking-tighter">200</div>
                  <div className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500">Max Simulations</div>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-16">
            You absolutely cannot afford to do &quot;naive&quot; grid search either. A modest grid with 10 values per dimension and 10 dimensions is <M t="10^{10}" /> simulations—ludicrous. But you <em>can</em> afford something like a few thousand simulations, if each one moves you in an intelligently chosen direction.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== 3. SLOW MOTION WALKTHROUGH ========== */}
      <section>
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white">
            3. CMA-ES in Slow Motion: Designing a Wing in 3D
          </h2>
          <p>
            Let&rsquo;s go back to the wing, but drastically simplify to keep things concrete. Suppose we compress all our design freedom into just three scalars:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-slate-300 ml-4 mb-8">
            <li><M t="x_1" />: normalized aspect ratio in <M t="[0,1]" /></li>
            <li><M t="x_2" />: normalized sweep angle in <M t="[0,1]" /></li>
            <li><M t="x_3" />: normalized airfoil family index in <M t="[0,1]" /></li>
          </ol>
          <p>
            Normalizing everything to roughly comparable ranges is important because CMA-ES&rsquo;s initial Gaussian is isotropic. If one variable lives on a scale of 0.001 and another on 10, you&rsquo;re already telling the algorithm that some directions are &quot;long&quot; and some &quot;short&quot; before it has seen any data. I like my ignorance to be symmetric.
          </p>

          <h3 className="text-2xl font-bold text-white mt-12 mb-6 text-balance">The Gradient Hierarchy</h3>
          <p className="mb-8">
            Let&rsquo;s be clear: <strong>If you have a clean, cheap gradient, you should almost always use it.</strong> <J t="first-order">First-order</J> methods like Adam or SGD are incredibly efficient because they know exactly which way is downhill.
          </p>
          <p className="mb-12">
            CMA-ES is for the world where the gradient is <strong>missing, expensive, or fake</strong> (numerical noise). The comparison below isn&rsquo;t about replacing gradients; it&rsquo;s about showing how CMA-ES provides a robust fallback when local slopes are too deceptive to trust.
          </p>
          
          <ComparisonViz />

          <p className="mt-12">
            By <strong>Generation 5</strong>, something interesting happens. The covariance <M t="C" /> is no longer the identity. Its eigenvectors roughly align with directions in which the objective varies gently vs sharply.
          </p>
          <p>
            In the wing case, you might find that changing aspect ratio and sweep together along some diagonal barely changes performance, but moving orthogonally is catastrophic. CMA-ES captures that by turning the sampling ellipsoid into a <strong>rotated cigar</strong> aligned with the benign direction.
          </p>
          <div className="rq-callout border-purple-500/30 bg-purple-500/5 my-10">
            <p className="text-lg text-slate-200 leading-relaxed mb-0 font-light">
              It&rsquo;s approximating the <strong>local curvature</strong> of your objective without ever forming a Hessian and without relying on gradients.
            </p>
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== INVARIANCES ========== */}
      <section>
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white">
            The Invariance Superpower
          </h2>
          <p>
            One reason CMA-ES is so robust is its <J t="invariance">Invariance</J> properties. It is designed to be &quot;coordinate-free.&quot;
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
            <div className="rq-insight-card !m-0 border-amber-500/20">
              <h4 className="text-white font-bold mb-3">Translation & Rotation</h4>
              <p className="text-sm text-slate-400 mb-0">
                If you rotate your entire search space or move your starting point, CMA-ES will find the exact same path. It doesn&rsquo;t care about the labels on your axes.
              </p>
            </div>
            <div className="rq-insight-card !m-0 border-orange-500/20">
              <h4 className="text-white font-bold mb-3">Rank-Based Scaling</h4>
              <p className="text-sm text-slate-400 mb-0">
                Because it only uses the <strong>rank</strong> of samples, it is invariant to any strictly increasing transform of the objective. Optimizing <M t="f(x)" /> is the same as <M t="\log(f(x))" /> or <M t="\sqrt{f(x)}" />.
              </p>
            </div>
          </div>
          <p>
            This makes it one of the few &quot;set and forget&quot; optimizers. You don&rsquo;t need to spend hours tuning the scales of your parameters or preprocessing your objective values.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== NOISE ========== */}
      <section>
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white">
            Filtering the Noise
          </h2>
          <p className="mb-12">
            In many engineering problems, your black-box isn&rsquo;t a perfect math function. It&rsquo;s a simulation with rounding errors, or a physical experiment with sensors. It is <J t="stochastic-optimization">Stochastic</J>—jittery and noisy.
          </p>
          
          <NoiseRobustnessViz />

          <p className="mt-12">
            Gradient-based methods often choke on noise because they rely on a single local estimate. CMA-ES uses its entire population to average out the jitter, seeing through the &quot;fog&quot; to find the underlying global structure.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== MULTIMODALITY ========== */}
      <section>
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white text-balance">
            Escaping the Local Trap
          </h2>
          <p className="mb-12">
            Most real-world landscapes aren&rsquo;t simple bowls. They are <J t="multimodality">Multimodal</J>—full of jagged peaks and deceptive <J t="local-minima">Local Minima</J> that can trap a small population. CMA-ES solves this with a &quot;Restart with Increasing Population&quot; strategy (<J t="ipop-cma-es">IPOP</J>).
          </p>
          
          <RestartViz />

          <p className="mt-12">
            If progress stalls, the algorithm &quot;explodes&quot; its search radius and sends out a much larger army of scouts. This transition from local exploitation to global exploration is what allows CMA-ES to find the deepest valley in a massive mountain range.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== 4. ORIGINS ========== */}
      <section>
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white">
            4. Where CMA-ES Came From
          </h2>
          <p>
            CMA-ES didn&rsquo;t appear out of nowhere. It&rsquo;s the product of several converging lines of thought.
          </p>
          
          <div className="space-y-12 my-12">
            <div>
              <h4 className="text-amber-400 font-mono uppercase tracking-widest text-xs mb-4">Evolution Strategies</h4>
              <p className="text-slate-300">
                While classical genetic algorithms focused on bitstrings and crossover, the <strong>evolution strategies</strong> community in Germany emphasized continuous search spaces and Gaussian mutations. CMA-ES, introduced by Hansen &amp; Ostermeier in the mid-1990s, pushed this to its logical conclusion: adapt a <em>full covariance matrix</em>.
              </p>
            </div>
            
            <div>
              <h4 className="text-amber-400 font-mono uppercase tracking-widest text-xs mb-4">Information Geometry</h4>
              <p className="text-slate-300">
                If you think of CMA-ES as moving a distribution in the manifold of Gaussians, the right answer is the <strong>natural gradient</strong>: perform steepest ascent with respect to the Fisher information metric. Akimoto et al. showed that the core CMA-ES update is exactly a <em>sampled natural-gradient step</em>.
              </p>
            </div>

            <div>
              <h4 className="text-amber-400 font-mono uppercase tracking-widest text-xs mb-4">Kriging &amp; Gaussian Processes</h4>
              <p className="text-slate-300">
                CMA-ES shares a &quot;Gaussian + covariance + unbiasedness&quot; mindset with <strong>Kriging</strong> (GP regression). While Kriging models the function itself, CMA-ES uses the Gaussian as a <strong>proposal distribution</strong> to sample points with low objective values.
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
            5. Two Optimization Worlds That Barely Talk
          </h2>
          <p>
            One of the weird sociological facts about CMA-ES is that it lives, culturally, in a different universe from most deep-learning folks.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
            <div className="bg-slate-900/40 p-8 rounded-2xl border border-white/5">
              <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> GECCO World
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed mb-0">
                The evolutionary computation community. They talk about EDAs, surrogate models, and CMA-ES as the primary language of optimization.
              </p>
            </div>
            <div className="bg-slate-900/40 p-8 rounded-2xl border border-white/5">
              <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> NeurIPS World
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed mb-0">
                Deep learning practitioners. They know backprop and SGD. They know Bayesian optimization, but evolutionary computation feels like a different discipline.
              </p>
            </div>
          </div>
          <p>
            This siloing is mostly historical accident. There&rsquo;s an interesting overlap between how CMA-ES thinks about learning a distribution and how LeCun&rsquo;s <strong>Joint-Embedding Predictive Architectures (JEPA)</strong> think about predicting missing parts of an image.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== 6. DEEP LEARNING HYBRIDS ========== */}
      <section>
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white">
            6. CMA-ES + Deep Learning + Creative Systems
          </h2>
          <p>
            The irony is that CMA-ES is an incredibly natural companion to modern DL systems once you stop insisting that <em>everything</em> be end-to-end differentiable.
          </p>
          
          <h3 className="text-xl font-bold text-white mt-10 mb-4">Tuning Continuous Cellular Automata</h3>
          <p>
            Imagine designing a continuous CA with interesting visual dynamics. You want to score patterns along dimensions like complexity, persistence, or &quot;aesthetic interest.&quot;
          </p>
          <p>
            There are no gradients that connect these high-level properties to underlying parameters. But you can map the parameters into a unit hypercube and let CMA-ES search. It doesn&rsquo;t understand &quot;visual interest&quot;; it just knows which vectors yield higher scores and deforms its Gaussian to find more of them.
          </p>
          
          <div className="rq-insight-card border-amber-500/30">
            <h4 className="text-white font-bold mb-4">The Automated Experimental Collaborator</h4>
            <p className="text-slate-400 text-sm mb-0">
              You write the simulator and the scoring function; CMA-ES does the boring part of exploring the parameter space. It ends up with settings you&rsquo;d never have guessed by hand-tuning.
            </p>
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== LIVE BENCHMARKS ========== */}
      <section>
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white">
            7. Live Benchmarks &amp; Implementations
          </h2>
          <p className="mb-12">
            Watch the algorithm crawl its way through different landscapes while adapting its own notion of &quot;where the promising valleys live.&quot;
          </p>
          
          <BenchmarkRunner />

          <h3 className="text-2xl font-bold text-white mt-20 mb-8">Two Implementations I Built</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="rq-insight-card !m-0 !p-8 bg-black/40">
              <h4 className="text-amber-400 font-bold mb-4">wasm_cmaes</h4>
              <p className="text-sm text-slate-300 mb-6">Rust CMA-ES compiled to WebAssembly, wrapped in a clean JS/TS API. Features SIMD-accelerated vector ops and Rayon parallelism inside the WASM module.</p>
              <a href="https://github.com/Dicklesworthstone/wasm_cmaes" className="rq-btn-secondary !inline-flex items-center">GitHub Repo</a>
            </div>
            <div className="rq-insight-card !m-0 !p-8 bg-black/40">
              <h4 className="text-orange-400 font-bold mb-4">fast_cmaes</h4>
              <p className="text-sm text-slate-300 mb-6">Hyper-optimized Rust core with a first-class Python experience. SIMD, Rayon, deterministic seeds, and a Rich-powered TUI for terminal monitoring.</p>
              <a href="https://github.com/Dicklesworthstone/fast_cmaes" className="rq-btn-secondary !inline-flex items-center">GitHub Repo</a>
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
            Based on Nikolaus Hansen&rsquo;s 2024 tutorial.
          </p>
          
          <div className="space-y-10 text-slate-300">
            <div>
              <h4 className="text-white font-bold mb-3"><J t="multivariate-normal">The Search Distribution as Central Object</J></h4>
              <p className="text-sm leading-relaxed">
                You&rsquo;re not optimizing <M t="f(x)" /> directly; you&rsquo;re optimizing <strong>a probability distribution over <M t="x" /></strong>. All adaptation happens in distribution space <M t="\theta = (m, \sigma, C)" />.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-3"><J t="ranking">Invariance as Design Principle</J></h4>
              <p className="text-sm leading-relaxed">
                CMA-ES is designed for <strong>rank-based invariance</strong>: it only uses the ordering of fitness values, making it invariant to any strictly increasing transform of <M t="f" />. It is also invariant under rigid linear transforms of the search space.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3"><J t="step-size">Step-size Control (CSA)</J></h4>
              <p className="text-sm leading-relaxed">
                The Cumulative Step-size Adaptation compares the <J t="evolution-path">evolution path</J> length to what you&rsquo;d expect from a random walk. If the path is &quot;too long,&quot; it means we&rsquo;re consistently moving in a correlated direction → increase <M t="\sigma" />.
              </p>
            </div>

            <div className="bg-black/50 border border-white/5 rounded-2xl p-8 flex justify-center">
              <GranularMath 
                parts={[
                  { tex: "p_\\sigma", key: "evolution-path", color: "purple" },
                  { tex: "=", key: "operator", color: "slate" },
                  { tex: "(1 - c_s)", key: "learning-rate-cs", color: "blue" },
                  { tex: "p_\\sigma", key: "evolution-path", color: "purple" },
                  { tex: "+", key: "operator", color: "slate" },
                  { tex: "\\sqrt{c_s(2-c_s)\\mu_{eff}}", key: "selection-mass", color: "emerald" },
                  { tex: "C^{-1/2}", key: "whitening", color: "red" },
                  { tex: "\\frac{m_{new} - m_{old}}{\\sigma}", key: "mean-vector", color: "amber" },
                ]}
              />
            </div>
          </div>
        </EC>
      </section>

      {/* Floating Scroll to Top */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 opacity-0 animate-fade-in"
        style={{ opacity: scrollProgress > 0.2 ? 1 : 0, pointerEvents: scrollProgress > 0.2 ? 'auto' : 'none' }}
      >
        <RotateCcw className="w-6 h-6" />
      </button>

      {/* ========== FOOTER SPACING ========== */}
      <div className="h-48" />
    </div>
  );
}
