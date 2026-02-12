"use client";

import "katex/dist/katex.min.css";

import { useEffect, useRef, useState, memo } from "react";
import dynamic from "next/dynamic";
import {
  Crimson_Pro,
  JetBrains_Mono,
  Bricolage_Grotesque,
} from "next/font/google";
import katex from "katex";
import { Calculator, ShieldCheck, Layers, ArrowLeft, ChevronDown } from "lucide-react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { MathTooltip, type TooltipVariant } from "./math-tooltip";
import { getHoeffdingMath } from "@/lib/hoeffding-math";
import { getScrollMetrics } from "@/lib/utils";

// Dynamic import visualizations
const HoeffdingHero = dynamic(
  () => import("./hoeffding-visualizations").then((m) => m.HoeffdingHero),
  { ssr: false }
);
const DependencyLab = dynamic(
  () => import("./hoeffding-visualizations").then((m) => m.DependencyLab),
  { ssr: false }
);
const OutlierCrusher = dynamic(
  () => import("./hoeffding-visualizations").then((m) => m.OutlierCrusher),
  { ssr: false }
);
const RankingVisualizer = dynamic(
  () => import("./hoeffding-visualizations").then((m) => m.RankingVisualizer),
  { ssr: false }
);
const CodePlayground = dynamic(
  () => import("./hoeffding-visualizations").then((m) => m.CodePlayground),
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

// Tooltip Wrapper
const MT = ({ mathKey, children, color, simple }: { mathKey: string, children: React.ReactNode, color?: string, simple?: boolean }) => {
  const term = getHoeffdingMath(mathKey);
  const hexToVariant: Record<string, TooltipVariant> = {
    "#22d3ee": "cyan",
    "#a855f7": "purple",
    "#ec4899": "rose",
    "#f59e0b": "amber",
    "#10b981": "emerald",
    "#3b82f6": "blue",
    "#f8fafc": "blue"
  };
  
  const activeColor = color || term?.color || "#a855f7";
  const variant = hexToVariant[activeColor] || "purple";

  return <MathTooltip term={term} variant={variant} simple={simple}>{children}</MathTooltip>;
};

// Memoized KaTeX helpers
const M = memo(function M({ t }: { t: string }) {
  const html = katex.renderToString(t, { throwOnError: false, displayMode: false });
  return <span className="hd-math-inline" dangerouslySetInnerHTML={{ __html: html }} />;
});

// Editorial container
function EC({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`max-w-[800px] mx-auto px-6 md:px-8 relative z-10 ${className}`}>
      {children}
    </div>
  );
}

export function HoeffdingArticle() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const articleRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  useEffect(() => {
    const handleScroll = () => {
      const { progress } = getScrollMetrics();
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Section reveal on scroll
  useEffect(() => {
    const root = articleRef.current;
    if (!root) return;
    const readyClass = "hd-reveal-ready";
    root.classList.add(readyClass);

    const targets = root.querySelectorAll(":scope > section, :scope > article");

    if (typeof IntersectionObserver === "undefined") {
      targets.forEach((el) => el.classList.add("hd-visible"));
      return () => {
        root.classList.remove(readyClass);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("hd-visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
    );
    targets.forEach((el) => {
      el.classList.add("hd-fade-section");
      observer.observe(el);
    });
    return () => {
      observer.disconnect();
      root.classList.remove(readyClass);
    };
  }, []);

  return (
    <div
      ref={articleRef}
      className={`hoeffding-scope hd-body ${crimsonPro.variable} ${jetbrainsMono.variable} ${bricolageGrotesque.variable} selection:bg-cyan-500/30`}
      style={{ background: "#020204", color: "#f8fafc" }}
    >
      {/* HUD Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-40 bg-white/5 pointer-events-none">
        <motion.div 
          className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-blue-500"
          style={{ scaleX: scrollProgress, transformOrigin: "0%" }}
        />
      </div>

      {/* Floating Navigation */}
      <nav className="fixed top-24 left-8 z-40 hidden lg:block">
        <Link 
          href="/writing"
          className="hd-glass-panel px-6 py-3 rounded-full flex items-center gap-3 hover:scale-105 transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-cyan-400" />
          <span className="hd-instrument-label opacity-100 text-white/60">Library</span>
        </Link>
      </nav>

      {/* ========== HERO ========== */}
      <section data-section="hero" className="min-h-screen flex flex-col justify-start relative overflow-hidden pt-24 md:pt-32 pb-20">
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="absolute inset-0">
          <HoeffdingHero />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020204]/40 to-[#020204] z-10" />

        <EC>
          <div className="text-center relative z-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 mb-16 px-6 py-3 rounded-full hd-glass-panel"
            >
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <span className="hd-instrument-label opacity-100 tracking-[0.4em]">RESEARCH NOTE / 2026.02.12</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="hd-display-title mb-12 text-white"
            >
              The Latent<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 drop-shadow-[0_0_40px_rgba(34,211,238,0.4)] italic text-balance">
                Geometry
              </span>
              <br />of Data.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-3xl text-slate-400 max-w-2xl mx-auto leading-tight font-light"
            >
              Hoeffding&apos;s <MT mathKey="d1-term"><M t="D" /></MT> measures dependence patterns that standard correlation often misses.
            </motion.p>
          </div>
        </EC>

        <motion.div 
          style={{ opacity: heroOpacity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-20"
        >
          <span className="hd-instrument-label tracking-[0.5em]">Initialization</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent" />
          <ChevronDown className="w-4 h-4 text-white/20 animate-bounce" />
        </motion.div>
      </section>

      {/* ========== NARRATIVE START ========== */}
      <article className="pt-20">
        <EC>
          <p className="hd-drop-cap text-2xl md:text-3xl leading-relaxed text-white font-medium mb-16 text-pretty">
            Determining the connection between two datasets is often difficult without knowing the underlying structure. Most measures look for a specific <em>type</em> of relationship, such as a straight line. Hoeffding&apos;s <M t="D" /> takes a broader approach by measuring the <strong>Independence Gap</strong>.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
            <div className="space-y-4">
              <h4 className="text-white font-black uppercase tracking-widest text-sm">The Detection Limit</h4>
              <p className="text-slate-400 leading-relaxed">
                Standard measures like Pearson and Spearman rely on the assumption of directionality. They ask: &quot;As X goes up, does Y go up?&quot; This logic fails completely if the data forms a circle, a cross, or a sine wave. In these cases, the &quot;average&quot; direction is zero, making the relationship invisible to traditional tools.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-white font-black uppercase tracking-widest text-sm">The Independence Gap</h4>
              <p className="text-slate-400 leading-relaxed">
                Hoeffding&apos;s <M t="D" /> ignores direction entirely. It asks a more fundamental question: &quot;Is the joint behavior of X and Y different from what we would expect if they were purely random?&quot; It quantifies the distance between the observed data and a state of total independence.
              </p>
            </div>
          </div>

          <div className="hd-callout hd-glass-panel !border-l-cyan-400">
            <div className="flex gap-6 items-start">
              <Layers className="text-cyan-400 w-10 h-10 shrink-0 mt-2" />
              <div>
                <h3 className="text-white font-black text-2xl mb-4 uppercase tracking-tighter italic">Why Quadruples Matter</h3>
                <p className="text-lg text-slate-300 leading-relaxed m-0">
                  To detect a line, you only need two points. To detect a monotonic curve, you need three. But to detect a non-monotonic relationship (like a turn or a crossing), you need at least <strong>four points</strong>. Hoeffding&apos;s <M t="D" /> uses <MT mathKey="combinatorial-probing"><strong>Combinatorial Probing</strong></MT> to evaluate sets of quadruples, allowing it to see shapes that pairwise measures miss.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-20 space-y-8 text-lg leading-relaxed text-slate-300">
            <h3 className="text-3xl md:text-4xl text-white font-black tracking-tight">Where Correlation Falls Short</h3>
            <p>
              Suppose you have two sequences of numbers and need to quantify their dependence. Sometimes this is time-series data
              (price vs. volume, or stock A returns vs. stock B returns). Sometimes there is no timeline at all (height vs. weight across
              people). In modern AI workflows, those sequences can also be embedding vectors from two sentence strings.
            </p>
            <p>
              In many cases, we do not know the relationship shape in advance. It might be linear, monotonic, cyclical, clustered,
              multi-modal, or absent. That uncertainty is where common measures start to break down.
            </p>
            <p>
              Pearson correlation is the default because it is fast, familiar, and bounded between -1 and 1. But Pearson is fundamentally
              a linear-association measure. It works when the relationship is close to a line and outliers are limited. It becomes
              unreliable when geometry is non-linear or data quality is noisy.
            </p>
            <p>
              Outliers are especially destructive in variance-based statistics. A single impossible entry can skew means and variances enough
              to hide the signal from the rest of the dataset.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="hd-glass-panel rounded-3xl p-8">
              <h4 className="text-white font-black uppercase tracking-widest text-xs mb-4">Spearman&apos;s Rho</h4>
              <p className="text-slate-300 mb-0">
                Spearman improves robustness by replacing each raw value with its within-sequence rank. Extreme magnitudes become bounded
                ordinal positions, which helps with outliers, but the method still focuses on monotonic trends.
              </p>
            </div>
            <div className="hd-glass-panel rounded-3xl p-8">
              <h4 className="text-white font-black uppercase tracking-widest text-xs mb-4">Kendall&apos;s Tau</h4>
              <p className="text-slate-300 mb-0">
                Kendall compares concordant vs. discordant pairs (including tie handling) and is also rank-based and robust. However, it still
                misses many complex shapes because pairwise monotonic logic is not expressive enough.
              </p>
            </div>
          </div>

          <div className="mt-14 space-y-8 text-lg leading-relaxed text-slate-300">
            <p>
              The failure mode is easiest to see visually: ring-shaped, X-shaped, or other non-monotonic scatter plots can carry obvious
              structure, while Pearson/Spearman/Kendall stay close to zero. A human can often look at the cloud and infer plausible regions
              for a missing point, while pairwise directional metrics report &quot;no relationship.&quot;
            </p>
            <p>
              If you want concrete geometric examples, Wolfram has a clear visual gallery showing cases where Hoeffding&apos;s D catches patterns
              that common measures miss:{" "}
              <a
                href="https://www.wolfram.com/mathematica/new-in-9/enhanced-probability-and-statistics/use-hoeffdings-d-to-quantify-and-test-non-monotoni.html"
                target="_blank"
                rel="noreferrer noopener"
                className="text-cyan-300 underline decoration-cyan-400/40 hover:text-cyan-200"
              >
                Use Hoeffding&apos;s D to quantify non-monotonic associations
              </a>
              .
            </p>
          </div>

          <div className="mt-16 hd-callout hd-glass-panel !border-l-purple-500 !bg-purple-500/[0.03]">
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-3">Embeddings and Retrieval</h4>
            <p className="text-slate-200 mb-0">
              Cosine similarity is excellent for coarse retrieval over large vector sets: it quickly removes most irrelevant candidates. For
              fine-grained ranking near the top of a shortlist, high-dimensional geometry can be unintuitive and brittle. Hoeffding&apos;s{" "}
              <M t="D" /> works well as a second-stage dependency metric because it does not assume linearity or monotonicity.
            </p>
          </div>

          <div className="mt-16 space-y-8 text-lg leading-relaxed text-slate-300">
            <h3 className="text-3xl md:text-4xl text-white font-black tracking-tight">How Hoeffding&apos;s D Differs</h3>
            <p>
              Hoeffding introduced this statistic in his 1948 paper, <em>A Non-Parametric Test of Independence</em>. Like Spearman and Kendall,
              we first move into rank space (with average-rank handling for ties). Hoeffding&apos;s method then compares the observed
              joint rank distribution against the product of the two marginal rank distributions.
            </p>
            <p>
              Under independence, the joint should look like the product of marginals. Any systematic deviation is the signal. This is the
              Independence Gap. That shift in viewpoint is why Hoeffding&apos;s <M t="D" /> can detect rich, non-functional, non-monotonic
              dependencies that directional measures ignore.
            </p>
            <p>
              The cost is computational load. For <M t="N=5{,}000" /> points, the relevant combinatorial scale includes roughly{" "}
              <span className="text-white font-semibold">6.2 billion quadruples</span> (<MT mathKey="n-choose-4"><M t="n \text{ choose } 4" /></MT>).
              That extra work buys much broader detection power.
            </p>
          </div>
        </EC>
      </article>

      <div className="w-full h-px my-12 md:my-16 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* ========== THE LAB ========== */}
      <section>
        <EC className="!max-w-[1200px]">
          <div className="mb-16 text-center lg:text-left">
            <div className="hd-instrument-label mb-4 text-cyan-400">Interactivity 01</div>
            <h2 className="hd-section-title !mt-0 !mb-6">Visualizing the Residuals</h2>
            <p className="text-xl text-slate-400 max-w-2xl">
              Switch between data shapes to see where standard correlation (<M t="r" />) fails and where Hoeffding&apos;s <M t="D" /> still detects structure.
            </p>
          </div>
          
          <DependencyLab />
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 text-slate-400">
            <p className="leading-relaxed">
              The heatmap on the right represents the <MT mathKey="residuals"><strong>Residuals</strong></MT> (<MT mathKey="residuals"><M t="P(X,Y) - P(X)P(Y)" /></MT>). Intense color pockets indicate that certain combinations of <M t="X" /> and <M t="Y" /> happen far more (or less) frequently than random chance would allow.
            </p>
            <p className="leading-relaxed">
              Hoeffding&apos;s <M t="D" /> effectively quantifies the &quot;energy&quot; or volume of these deviations. Notice that even for the <span className="text-white font-bold italic">Ring</span>, where the average slope is zero, the residual energy is massive.
            </p>
          </div>
        </EC>
      </section>

      <div className="w-full h-px my-12 md:my-16 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* ========== THE OUTLIER CRUSHER ========== */}
      <section>
        <EC className="!max-w-[1000px]">
          <div className="mb-16">
            <div className="hd-instrument-label mb-4 text-amber-500">Robustness Module</div>
            <h2 className="hd-section-title !mt-0 !mb-6">Taming the Outliers</h2>
            <p className="text-xl text-slate-400">
              Outliers are a weak spot for variance-based measures. Watch how <MT mathKey="rank-space"><strong>Ranking</strong></MT> turns extreme magnitudes into manageable ordinal data.
            </p>
          </div>

          <OutlierCrusher />

          <div className="mt-20">
            <RankingVisualizer />
          </div>
        </EC>
      </section>

      <div className="w-full h-px my-12 md:my-16 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* ========== THE MATHEMATICAL ENGINE ========== */}
      <section className="relative">
        <div className="absolute inset-0 bg-cyan-500/[0.02] pointer-events-none" />
        <EC>
          <div className="mb-16">
            <div className="hd-instrument-label mb-4 text-purple-400">The Formalism</div>
            <h2 className="hd-section-title !mt-0 !mb-6 text-balance">The Statistical Engine</h2>
            <p className="text-xl text-slate-200 font-medium mb-6">
              You can think of Hoeffding&apos;s <M t="D" /> as an independence test often used like a correlation metric.
            </p>
            <p className="text-lg text-slate-400 text-pretty">
              Instead of fitting a line, it evaluates the <MT mathKey="independence-gap"><strong>Independence Gap</strong></MT> by processing every possible <MT mathKey="combinatorial-probing"><strong>quadruple</strong></MT> of points. This combinatorial approach is the key to its universal detection capability.
            </p>
          </div>

          <div className="mb-20 overflow-x-auto hd-glass-panel rounded-3xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5">
                  <th className="p-6 text-[10px] uppercase tracking-widest font-black text-slate-500">Measure</th>
                  <th className="p-6 text-[10px] uppercase tracking-widest font-black text-slate-500">Geometric Focus</th>
                  <th className="p-6 text-[10px] uppercase tracking-widest font-black text-slate-500">Detectable Topologies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="p-6 font-bold text-blue-400">Pearson</td>
                  <td className="p-6 text-slate-300">Linearity</td>
                  <td className="p-6 text-slate-400 text-sm">Straight lines only.</td>
                </tr>
                <tr>
                  <td className="p-6 font-bold text-purple-400">Spearman</td>
                  <td className="p-6 text-slate-300">Monotonicity</td>
                  <td className="p-6 text-slate-400 text-sm">Any curve that only moves in one direction.</td>
                </tr>
                <tr>
                  <td className="p-6 font-bold text-cyan-400">Hoeffding&apos;s D</td>
                  <td className="p-6 text-slate-300">Independence Gap</td>
                  <td className="p-6 text-white font-medium text-sm italic">Universal: Rings, Crosses, Waves, and Complex Patterns.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="hd-glass-panel rounded-[3rem] p-8 md:p-16 mb-16 relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] group-hover:bg-purple-500/20 transition-all duration-1000" />
            
            <div className="hd-instrument-label mb-12">Colorized Formula Instrument</div>
            
            {/* COLORIZED FORMULA START */}
            <div className="hd-glass-panel rounded-3xl p-10 md:p-16 bg-black/40 border-white/5 relative mb-16">
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-2xl md:text-4xl lg:text-5xl font-mono leading-none tracking-tighter">
                <div className="flex items-center gap-4">
                  <span className="text-white/40 italic">D = </span>
                  <MT mathKey="normalization" color="#f8fafc">30</MT>
                  <span className="text-white/20">&times;</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 pb-4">
                    <span className="text-white/20">(</span>
                    <MT mathKey="d1-term" color="#22d3ee">D_1</MT>
                    <span className="text-white/20">+</span>
                    <MT mathKey="d2-term" color="#a855f7">D_2</MT>
                    <span className="text-white/20">-</span>
                    <MT mathKey="d3-term" color="#10b981">2D_3</MT>
                    <span className="text-white/20">)</span>
                  </div>
                  <div className="h-0.5 bg-white/10 w-full rounded-full" />
                  <div className="pt-4">
                    <MT mathKey="normalization" color="#f8fafc">
                      <M t="N(N-1)(N-2)(N-3)(N-4)" />
                    </MT>
                  </div>
                </div>
              </div>
              
              {/* Legend Helper */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                 {[
                   { k: "d1-term", c: "#22d3ee" },
                   { k: "d2-term", c: "#a855f7" },
                   { k: "d3-term", c: "#10b981" }
                 ].map(item => (
                   <MT key={item.k} mathKey={item.k} color={item.c} simple>
                     <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]" style={{ backgroundColor: item.c }} />
                   </MT>
                 ))}
              </div>
            </div>
            {/* COLORIZED FORMULA END */}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                      <ShieldCheck className="w-5 h-5 text-cyan-400" />
                    </div>
                    <span className="text-white font-black uppercase tracking-widest text-sm">Universal Logic</span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    As <M t="N" /> grows, <M t="D" /> is mathematically guaranteed to identify <em>any</em> non-independent distribution, regardless of its topological complexity.
                  </p>
               </div>
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                      <Calculator className="w-5 h-5 text-amber-400" />
                    </div>
                    <span className="text-white font-black uppercase tracking-widest text-sm">Complexity Tax</span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed text-pretty">
                    Evaluating quadruples (<MT mathKey="n-choose-4"><M t="n \text{ choose } 4" /></MT>) is expensive. For <M t="N=5{,}000" />, the engine must process <span className="text-white font-bold underline decoration-amber-500/50">6.2 billion</span> combinations.
                  </p>
               </div>
            </div>
          </div>

          <div className="hd-glass-panel rounded-3xl p-8 bg-black/60 backdrop-blur-xl">
            <div className="hd-instrument-label mb-6">Mental Model</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MT mathKey="d1-term">
                <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 text-center transition-all hover:bg-cyan-500/10">
                  <div className="font-mono font-bold text-cyan-400 mb-1">D1</div>
                  <div className="text-[10px] uppercase text-slate-500 font-black tracking-widest">Residual Energy</div>
                </div>
              </MT>
              <MT mathKey="d2-term">
                <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 text-center transition-all hover:bg-purple-500/10">
                  <div className="font-mono font-bold text-purple-400 mb-1">D2</div>
                  <div className="text-[10px] uppercase text-slate-500 font-black tracking-widest">Internal Variation</div>
                </div>
              </MT>
              <MT mathKey="d3-term">
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-center transition-all hover:bg-emerald-500/10">
                  <div className="font-mono font-bold text-emerald-400 mb-1">D3</div>
                  <div className="text-[10px] uppercase text-slate-500 font-black tracking-widest">Interaction</div>
                </div>
              </MT>
            </div>
          </div>

          <div className="mt-16 hd-glass-panel rounded-3xl p-8 md:p-12">
            <div className="hd-instrument-label mb-6 text-cyan-400">Step-by-Step Breakdown</div>
            <div className="space-y-8 text-slate-300 leading-relaxed">
              <p>
                Once the high-level idea is clear, the mechanics are systematic. We rank both sequences (with tie averaging), compute weighted
                concordance-style counts, and then combine three intermediate sums through a normalization term that scales correctly with{" "}
                <M t="N" />.
              </p>
              <ol className="list-decimal pl-6 space-y-4 marker:text-cyan-400">
                <li>
                  <strong className="text-white">Ranking and pairwise structure:</strong> replace raw values with ranks and account for ties.
                </li>
                <li>
                  <strong className="text-white">Quadruple-aware aggregation:</strong> fold higher-order ordering information into per-point
                  weighted counts, often denoted by <strong>Q</strong>.
                </li>
                <li>
                  <strong className="text-white">Summation:</strong> build <M t="D_1" />, <M t="D_2" />, and <M t="D_3" /> from those ranks and
                  weighted counts.
                </li>
                <li>
                  <strong className="text-white">Normalization:</strong> combine all terms into the final bounded statistic.
                </li>
              </ol>
              <div className="rounded-2xl border border-white/10 bg-black/40 p-6 md:p-8 font-mono text-sm md:text-base text-slate-200 overflow-x-auto">
                D = 30 * ((N-2)(N-3)D1 + D2 - 2(N-2)D3) / [N(N-1)(N-2)(N-3)(N-4)]
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="hd-glass-panel rounded-2xl p-6">
              <h4 className="text-white font-black uppercase tracking-widest text-[10px] mb-3">D1</h4>
              <p className="text-slate-300 text-sm mb-0">
                Captures aggregate concordance/discordance energy beyond what independence predicts.
              </p>
            </div>
            <div className="hd-glass-panel rounded-2xl p-6">
              <h4 className="text-white font-black uppercase tracking-widest text-[10px] mb-3">D2</h4>
              <p className="text-slate-300 text-sm mb-0">
                Measures internal rank variability in each sequence, independent of cross-sequence coupling.
              </p>
            </div>
            <div className="hd-glass-panel rounded-2xl p-6">
              <h4 className="text-white font-black uppercase tracking-widest text-[10px] mb-3">D3</h4>
              <p className="text-slate-300 text-sm mb-0">
                Interaction term blending concordance structure with each sequence&apos;s internal rank geometry.
              </p>
            </div>
          </div>
        </EC>
      </section>

      <div className="w-full h-px my-12 md:my-16 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* ========== LIVE RUNTIME ========== */}
      <section>
        <EC className="!max-w-[1000px]">
          <div className="mb-16">
            <div className="hd-instrument-label mb-4 text-emerald-400">Implementation</div>
            <h2 className="hd-section-title !mt-0 !mb-6">The TypeScript Kernel</h2>
            <p className="text-lg text-slate-400">
              Hoeffding&apos;s <M t="D" /> can capture complex dependence patterns with surprisingly direct logic.
            </p>
          </div>

          <CodePlayground />

          <div className="mt-16 space-y-8 text-slate-300 leading-relaxed">
            <p>
              To make the mechanics concrete, the original explainer also walked through a tiny 10-point toy dataset (heights and weights),
              showing ranked vectors, <strong>Q</strong> values, and the final scalar output. The purpose was pedagogical: demonstrate that
              the method can be implemented clearly before moving to optimized production code.
            </p>
            <div className="rounded-3xl border border-white/10 bg-black/40 p-6 md:p-8">
              <div className="hd-instrument-label mb-4 text-cyan-400">Example Output</div>
              <pre className="overflow-x-auto text-sm md:text-base text-slate-200 font-mono leading-relaxed">
{`Ranks of Heights (X): [1. 2. 5. 6. 7. 3. 4. 9. 9. 9.]
Ranks of Weights (Y): [1. 2. 5. 4. 7. 3. 6. 9. 9. 9.]
Q values: [1.  2.  4.  4.  7.  3.  4.  8.5 8.5 8.5]
Hoeffding's D for data: 0.4107142857142857`}
              </pre>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/40 p-6 md:p-8">
              <div className="hd-instrument-label mb-4 text-cyan-400">Reference Python Walkthrough</div>
              <pre className="overflow-x-auto text-xs md:text-sm text-slate-200 font-mono leading-relaxed">
{`import numpy as np
from scipy.stats import rankdata

def hoeffd_example():
    X = np.array([55, 62, 68, 70, 72, 65, 67, 78, 78, 78])
    Y = np.array([125, 145, 160, 156, 190, 150, 165, 250, 250, 250])

    R = rankdata(X, method='average')
    S = rankdata(Y, method='average')
    N = len(X)
    Q = np.zeros(N)

    for i in range(N):
        Q[i] = 1 + sum(np.logical_and(R < R[i], S < S[i]))
        Q[i] += (1/4) * (sum(np.logical_and(R == R[i], S == S[i])) - 1)
        Q[i] += (1/2) * sum(np.logical_and(R == R[i], S < S[i]))
        Q[i] += (1/2) * sum(np.logical_and(R < R[i], S == S[i]))

    D1 = sum((Q - 1) * (Q - 2))
    D2 = sum((R - 1) * (R - 2) * (S - 1) * (S - 2))
    D3 = sum((R - 2) * (S - 2) * (Q - 1))

    D = 30 * ((N - 2) * (N - 3) * D1 + D2 - 2 * (N - 2) * D3) / (
        N * (N - 1) * (N - 2) * (N - 3) * (N - 4)
    )
    return D`}
              </pre>
            </div>
            <p>
              The pure-Python approach is clear but slow at larger <M t="N" />. For practical workloads, the original article points to an
              optimized Rust implementation distributed for Python:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <a
                  href="https://colab.research.google.com/drive/1MO_iheKH3syDgoYcWYzDuYKjaK8zyIi9?usp=sharing"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-cyan-300 underline decoration-cyan-400/40 hover:text-cyan-200"
                >
                  Colab notebook walkthrough
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Dicklesworthstone/fast_vector_similarity"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-cyan-300 underline decoration-cyan-400/40 hover:text-cyan-200"
                >
                  fast_vector_similarity (Rust/Python)
                </a>
              </li>
              <li>
                <a
                  href="https://news.ycombinator.com/item?id=37234887"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-cyan-300 underline decoration-cyan-400/40 hover:text-cyan-200"
                >
                  Hacker News discussion
                </a>
              </li>
            </ul>
          </div>
        </EC>
      </section>

      <div className="w-full h-px my-12 md:my-16 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* ========== AI SECTION ========== */}
      <section className="py-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/[0.03] to-transparent pointer-events-none" />
        <EC>
          <h2 className="hd-section-title !mt-0 text-center mb-20">A Better Metric for AI</h2>
          
          <div className="space-y-12 text-xl md:text-2xl text-slate-300 leading-relaxed font-light">
            <p className="text-pretty">
              In LLM and RAG systems, <strong>Cosine Similarity</strong> is the standard first-pass filter. It works well for narrowing millions of vectors to a manageable shortlist.
            </p>
            
            <p className="bg-white/5 p-12 rounded-[3rem] border border-white/10 italic text-white/90 text-pretty">
              &quot;Geometric intuition fails in high dimensions. In 2048-dimensional embedding space, nearly all of a sphere&apos;s volume is concentrated near its surface. That makes cosine similarity less precise for final ranking.&quot;
            </p>
            
            <div className="hd-callout hd-glass-panel !border-l-purple-500 !bg-purple-500/[0.02]">
              Hoeffding&apos;s <MT mathKey="d1-term"><M t="D" /></MT> supports ranking based on deeper, non-linear dependence rather than simple geometric alignment.
            </div>

            <div className="pt-8 space-y-8 text-base md:text-lg text-slate-300 leading-relaxed font-normal">
              <h3 className="text-2xl md:text-3xl text-white font-black tracking-tight">Joint vs. Marginal, and Why It Matters</h3>
              <p>
                The key step in Hoeffding&apos;s method is to compare the observed <strong>joint distribution</strong> of ranked pairs
                against what would be expected under independence, namely the product of each sequence&apos;s <strong>marginal distribution</strong>.
                If the two variables are independent, pairing should look random once marginals are fixed. If pairing is systematically
                structured, the joint distribution departs from that product and the statistic rises.
              </p>
              <p>
                One way to picture this is a rank-vs-rank scatter plot. The x-axis is rank in sequence <M t="X" />, and the y-axis is rank in
                sequence <M t="Y" />. Marginals describe how points spread along each axis in isolation. The joint distribution describes the
                full 2D arrangement of pairings. Hoeffding&apos;s <M t="D" /> asks whether that 2D arrangement is more organized than independence
                would allow.
              </p>
              <p>
                This is also why the method is more computationally expensive than pairwise rank correlation. Pair counting at{" "}
                <M t="N=5{,}000" /> is already ~12.5 million comparisons (<M t="N \text{ choose } 2" />), but quadruple-level structure scales
                to roughly 6.2 billion (<MT mathKey="n-choose-4"><M t="N \text{ choose } 4" /></MT>) before the internal arithmetic inside each
                step. The cost is substantial, but it buys much broader pattern sensitivity.
              </p>
              <p>
                The intermediate <strong>Q</strong> terms are the per-point weighted concordance summaries that make this feasible. They account
                for how many ranked points sit below a given point in both dimensions, with partial weights for tie cases. Those values then feed
                the aggregated <M t="D_1" />, <M t="D_2" />, and <M t="D_3" /> terms used in the normalized final formula.
              </p>
              <p>
                Several practical properties from the original explainer are worth keeping explicit: Hoeffding&apos;s <M t="D" /> is symmetric
                (<M t="D(X,Y)=D(Y,X)" />), bounded (in the classical form, within approximately -0.5 to 1), robust to outliers due to rank
                transformation, and returns zero when one sequence is constant.
              </p>
              <p>
                The main implementation advice remains unchanged: use cosine (or another fast geometric metric) for broad candidate filtering,
                then apply Hoeffding-style dependence scoring where finer discrimination matters and runtime budget allows it.
              </p>
            </div>
          </div>
        </EC>
      </section>

      <footer className="py-20 border-t border-white/5 bg-black/40">
        <EC className="text-center space-y-8">
          <div className="hd-instrument-label tracking-[1em]">Conclusion</div>
          <p className="text-slate-500 max-w-lg mx-auto text-pretty">
            Hoeffding&apos;s <M t="D" /> is a practical way to detect relationships in datasets where simpler measures miss structure.
          </p>
          <Link 
            href="/writing"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-white transition-colors font-bold uppercase tracking-widest text-[10px]"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Library
          </Link>
        </EC>
      </footer>
    </div>
  );
}
