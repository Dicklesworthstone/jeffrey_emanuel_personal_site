"use client";

import "katex/dist/katex.min.css";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  Crimson_Pro,
  JetBrains_Mono,
  Bricolage_Grotesque,
} from "next/font/google";
import katex from "katex";
import { CMAESJargon } from "./cmaes-jargon";
import { CMAESMathTooltip } from "./cmaes-math-tooltip";

// Dynamic import visualizations (no SSR)
const HeroCMAES = dynamic(
  () => import("./cmaes-visualizations").then((m) => ({ default: m.HeroCMAES })),
  { ssr: false }
);
const DistributionViz = dynamic(
  () => import("./cmaes-visualizations").then((m) => ({ default: m.DistributionViz })),
  { ssr: false }
);
const BenchmarkRunner = dynamic(
  () => import("./cmaes-visualizations").then((m) => ({ default: m.BenchmarkRunner })),
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
            Roughly speaking, CMA-ES does for nasty, opaque objective functions what gradient descent does for nice smooth ones: it gives you a principled way to turn &quot;I can only evaluate this thing&quot; into &quot;I can reliably walk toward a good solution.&quot;
          </p>
          
          <div className="rq-insight-card group border-amber-500/20 hover:border-amber-500/40">
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-amber-500">01.</span> The Search Logic
              </h3>
              <p className="text-slate-400 text-base md:text-lg mb-6 leading-relaxed">
                At the highest possible level, CMA-ES keeps a <J t="multivariate-normal">Gaussian search distribution</J> over your parameter space and iteratively morphs that Gaussian—its mean and its covariance—to concentrate probability mass where the objective looks good.
              </p>
              <ul className="space-y-4 text-slate-300">
                <li className="flex gap-4">
                  <span className="text-amber-500 font-mono">1.</span>
                  <span>Sample a small <strong>population</strong> of candidate points.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-amber-500 font-mono">2.</span>
                  <span>Evaluate your expensive black-box at each point.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-amber-500 font-mono">3.</span>
                  <span><J t="ranking">Rank</J> the samples by how good they were.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-amber-500 font-mono">4.</span>
                  <span>Nudge the distribution to follow the &quot;best&quot; survivors.</span>
                </li>
              </ul>
            </div>
          </div>

          <p className="mt-12">
            Over time, the initially spherical Gaussian turns into a rotated, stretched <J t="covariance-matrix">ellipsoid</J> that lines up with the valleys and ridges of your objective function. It&rsquo;s implicitly learning something like the local <J t="hessian">Hessian</J> without ever seeing a derivative.
          </p>
        </EC>
      </article>

      <Divider />

      {/* ========== VISUAL 01 ========== */}
      <section>
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white">
            Visualizing the Adaptation
          </h2>
          <p className="mb-12">
            Early on, samples are spread out, the covariance is mostly spherical, and the algorithm is &quot;groping in the dark.&quot; As evidence accumulates about which directions lead to better values, the ellipsoid tilts, stretches, and shrinks, zooming in on promising regions.
          </p>
          
          <DistributionViz />

          <p className="mt-12">
            The crucial thing is: <strong>CMA-ES only needs function evaluations.</strong> It never asks you for gradients, Jacobians, or any structural information about your model or simulator. That makes it an excellent default whenever evaluations are expensive or the landscape is ugly.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== THREE EXAMPLES ========== */}
      <section>
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white">
            Where Gradients Go to Die
          </h2>
          <p>
            When you first learn optimization, &quot;no gradient&quot; sounds like a minor annoyance. Just finite-difference it, right? Wrong. In many real-world problems, finite differences are mostly lies.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 mb-16">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 transition-all duration-500 hover:border-amber-500/30 group">
              <h4 className="text-white font-bold mb-4 text-xl group-hover:text-amber-400 transition-colors">Airplane Wings</h4>
              <p className="text-sm text-slate-400 leading-relaxed mb-0 font-light">
                CFD simulations take hours. Meshing and turbulence models create discontinuities. Finite differences are drowned in numerical noise.
              </p>
            </div>
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 transition-all duration-500 hover:border-orange-500/30 group">
              <h4 className="text-white font-bold mb-4 text-xl group-hover:text-orange-400 transition-colors">Suspension Bridges</h4>
              <p className="text-sm text-slate-400 leading-relaxed mb-0 font-light">
                Finite element models with mode-crossing and discrete material choices. Sharp changes when constraints flip from satisfied to violated.
              </p>
            </div>
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 transition-all duration-500 hover:border-red-500/30 group">
              <h4 className="text-white font-bold mb-4 text-xl group-hover:text-red-400 transition-colors">Transformers</h4>
              <p className="text-sm text-slate-400 leading-relaxed mb-0 font-light">
                Hyperparameters like layer counts and attention heads are inherently discrete. Training runs are ruinously expensive.
              </p>
            </div>
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== THE MECHANICS ========== */}
      <section>
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white">
            The Mechanics of Adaptation
          </h2>
          <p>
            For any concrete choice of parameters, we sample candidate points from a distribution:
          </p>
          
          <MBlock 
            t="x_i \sim \mathcal{N}(m, \sigma^2 C)" 
            explanation="multivariate-normal"
          />

          <p className="mt-8">
            Where <M t="m" /> is the current mean, <M t="\sigma" explanation="step-size" /> is a scalar step-size, and <M t="C" explanation="covariance-matrix" /> is a full covariance matrix encoding the current &quot;shape&quot; of promising directions.
          </p>

          <div className="rq-callout border-amber-500/30 bg-amber-500/5 mt-12 mb-12">
            <h4 className="text-amber-400 font-bold mb-2 uppercase tracking-widest text-[11px]">Core Philosophy</h4>
            <p className="text-lg text-slate-200 leading-relaxed italic">
              &quot;Encode everything as continuous real numbers in a normalized box, and push all the weirdness into your encode/decode procedure.&quot;
            </p>
          </div>

          <p>
            CMA-ES doesn&rsquo;t care if you&rsquo;re optimizing integers, categories, or continuous bounds. As long as you can map them into a unit hypercube, the algorithm treats it as a smooth-ish landscape of likelihood.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== LIVE SOLVER ========== */}
      <section>
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white">
            Live Benchmarks
          </h2>
          <p className="mb-12">
            Watch the algorithm in action across different benchmark landscapes. From the perfectly smooth <strong>Sphere</strong> to the deceptive <strong>Rastrigin</strong>, notice how the covariance matrix learns to navigate valleys and avoid local traps.
          </p>
          
          <BenchmarkRunner />

          <div className="mt-16 bg-black/50 border border-white/5 rounded-2xl p-6 font-mono text-sm text-slate-300 leading-relaxed">
            <span className="text-amber-500">// Evolution Path Momentum</span><br />
            p\u03c3 = (1-cs) * p\u03c3 + sqrt(cs*(2-cs)*mueff) * C^{-1/2} * (m_new - m_old) / \u03c3
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== WHY IT FEELS OPTIMAL ========== */}
      <section>
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white">
            Why It Feels &quot;Optimal&quot;
          </h2>
          <p>
            CMA-ES isn&rsquo;t just a clever heuristic; it&rsquo;s performing the canonical invariant gradient update in distribution space. Akimoto et al. showed that the core CMA-ES update is exactly a <strong>sampled natural-gradient step</strong> on the manifold of multivariate normals.
          </p>
          
          <div className="rq-insight-card !bg-slate-900/40">
            <h3 className="text-xl font-bold text-white mb-4">Information Geometry</h3>
            <p className="text-slate-400 leading-relaxed">
              If you want to minimize your worst-case regret under near-total ignorance about the objective&rsquo;s geometry, starting with an isotropic Gaussian and nudging it via <J t="natural-gradient">natural gradients</J> is about as clean and assumption-free as it gets.
            </p>
          </div>

          <p className="mt-12">
            It&rsquo;s also closely related to the <strong>cross-entropy method</strong> for optimization, where you iteratively fit a parametric distribution to elite samples by minimizing KL divergence.
          </p>
        </EC>
      </section>

      {/* ========== FOOTER SPACING ========== */}
      <div className="h-48" />
    </div>
  );
}
