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
import { Calculator, ShieldCheck, Layers, ArrowLeft, ChevronDown, Sigma } from "lucide-react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { HoeffdingMathTooltip as MT } from "./hoeffding-math-tooltip";

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
    const targets = root.querySelectorAll(":scope > section, :scope > article");
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
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={articleRef}
      className={`hoeffding-scope hd-body ${crimsonPro.variable} ${jetbrainsMono.variable} ${bricolageGrotesque.variable} selection:bg-cyan-500/30`}
      style={{ background: "#020204", color: "#f8fafc" }}
    >
      {/* HUD Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[100] bg-white/5">
        <motion.div 
          className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-blue-500"
          style={{ scaleX: scrollProgress, transformOrigin: "0%" }}
        />
      </div>

      {/* Floating Navigation */}
      <nav className="fixed top-8 left-8 z-[100] hidden lg:block">
        <Link 
          href="/writing"
          className="hd-glass-panel px-6 py-3 rounded-full flex items-center gap-3 hover:scale-105 transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-cyan-400" />
          <span className="hd-instrument-label opacity-100 text-white/60">Library</span>
        </Link>
      </nav>

      {/* ========== HERO ========== */}
      <section className="min-h-screen flex flex-col justify-center relative overflow-hidden">
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="absolute inset-0">
          <HoeffdingHero />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020204]/40 to-[#020204] z-10" />

        <EC>
          <div className="text-center relative z-20 pt-20">
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
              Hoeffding&apos;s <MT mathKey="d1-term"><M t="D" /></MT> provides a robust method for quantifying dependencies that standard correlation often misses.
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
              Switch between topologies to see how standard correlation (<M t="r" />) fails while Hoeffding&apos;s <M t="D" /> identifies the latent structure.
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
              Outliers are the nemesis of variance-based measures. Watch how <MT mathKey="rank-space"><strong>Ranking</strong></MT> transforms destructive magnitudes into manageable ordinal data.
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
              Hoeffding&apos;s <M t="D" /> is an information-theoretic independence test disguised as a correlation measure.
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
                    Evaluating quadruples (<MT mathKey="n-choose-4"><M t="n \text{ choose } 4" /></MT>) is brutal. For <M t="N=5{,}000" />, the engine must process <span className="text-white font-bold underline decoration-amber-500/50">6.2 billion</span> combinations.
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
              Hoeffding&apos;s <M t="D" /> is notable for its ability to perform sophisticated topological analysis through relatively straightforward logic.
            </p>
          </div>

          <CodePlayground />
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
              In the world of LLMs and RAG, <strong>Cosine Similarity</strong> is the workhorse. It is excellent for filtering millions of vectors down to a manageable &quot;needle in a haystack.&quot;
            </p>
            
            <p className="bg-white/5 p-12 rounded-[3rem] border border-white/10 italic text-white/90 text-pretty">
              &quot;But geometric intuition fails in high dimensions. In 2048-dimensional embedding space, nearly all of a sphere&apos;s volume is concentrated near its surface. This makes cosine similarity a blunt instrument for final ranking.&quot;
            </p>
            
            <div className="hd-callout hd-glass-panel !border-l-purple-500 !bg-purple-500/[0.02]">
              Hoeffding&apos;s <MT mathKey="d1-term"><M t="D" /></MT> enables ranking candidates based on deep, non-linear dependencies rather than simple geometric alignment. It provides a robust measure for quantifying true association in complex modern datasets.
            </div>
          </div>
        </EC>
      </section>

      <footer className="py-20 border-t border-white/5 bg-black/40">
        <EC className="text-center space-y-8">
          <div className="hd-instrument-label tracking-[1em]">Conclusion</div>
          <p className="text-slate-500 max-w-lg mx-auto text-pretty">
            Universal, robust, and topologically aware. Hoeffding&apos;s <M t="D" /> remains a sophisticated solution for identifying relationships in diverse datasets.
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
