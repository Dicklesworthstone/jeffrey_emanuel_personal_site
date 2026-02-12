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
import { Info, Calculator, BarChart3, Database } from "lucide-react";

// Dynamic import visualizations
const HoeffdingHero = dynamic(
  () => import("./hoeffding-visualizations").then((m) => m.HoeffdingHero),
  { ssr: false }
);
const CorrelationExplorer = dynamic(
  () => import("./hoeffding-visualizations").then((m) => m.CorrelationExplorer),
  { ssr: false }
);
const RankingVisualizer = dynamic(
  () => import("./hoeffding-visualizations").then((m) => m.RankingVisualizer),
  { ssr: false }
);
const QValueViz = dynamic(
  () => import("./hoeffding-visualizations").then((m) => m.QValueViz),
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

// KaTeX helpers
function M({ t }: { t: string }) {
  const html = katex.renderToString(t, {
    throwOnError: false,
    displayMode: false,
  });
  return (
    <span
      className="hd-math-inline"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function MBlock({ t }: { t: string }) {
  const html = katex.renderToString(t, {
    throwOnError: false,
    displayMode: true,
  });
  return (
    <div
      className="hd-math-block"
      dangerouslySetInnerHTML={{ __html: html }}
    />
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

export function HoeffdingArticle() {
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
            entry.target.classList.add("hd-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -60px 0px" }
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
      className={`hoeffding-scope hd-body ${crimsonPro.variable} ${jetbrainsMono.variable} ${bricolageGrotesque.variable}`}
      style={{ background: "#020204", color: "#f8fafc" }}
    >
      {/* Scroll Progress */}
      <div
        className="hd-progress-bar"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      {/* ========== HERO ========== */}
      <section className="min-h-screen flex flex-col justify-center relative overflow-hidden pb-20">
        <HoeffdingHero />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020204]/60 to-[#020204] z-10" />

        <EC>
          <div className="text-center pt-32 relative z-20">
            <div className="inline-flex items-center gap-3 mb-12 px-4 md:px-6 py-2.5 rounded-full border border-white/10 bg-white/5 text-[11px] md:text-[12px] font-mono text-cyan-400 tracking-[0.3em] uppercase backdrop-blur-xl">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              Non-Parametric Analysis / Wassily Hoeffding
            </div>
            <h1 className="hd-display-title mb-6 text-white text-balance">
              My Favorite Statistical Measure:
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                Hoeffding&apos;s D.
              </span>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-slate-400 max-w-3xl mx-auto leading-tight mt-12 font-light">
              Detect complex, non-linear dependencies where Pearson and Spearman fail.
              A powerful, robust, and universal measure of association.
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
          <p className="hd-drop-cap">
            Suppose you have two sequences of numbers that you want to compare so you can measure to what extent they are related or dependent on each other. It&apos;s a quite general setting: the two sequences could represent time series of stock prices and volumes, heights and weights of a population, or even embedding vectors from an LLM representing semantic similarity.
          </p>
          <p>
            In each of these cases, the problem is that, in the most general setting, we might have no clue a priori what the nature of the relationship might be, or if there even <em>is</em> a relationship to speak of. What if the two sequences are totally independent? What if the data contains extreme outliers? You might think, &quot;Isn&apos;t the answer just to look at the correlation?&quot;
          </p>

          <div className="hd-insight-card group">
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
                The Linear Trap
              </h3>
              <p className="text-slate-400 text-base md:text-lg mb-0 leading-relaxed">
                Most people mean <strong>Pearson&apos;s correlation coefficient</strong> when they say &quot;correlation.&quot; It dates back to the 1800s and is essentially a rescaled covariance. While nice and interpretable (ranging from -1.0 to 1.0), it has a fundamental flaw: <strong>it only looks for linear relationships.</strong>
              </p>
              <div className="mt-8 flex items-center gap-4 text-cyan-400">
                <Info className="w-5 h-5" />
                <span className="text-sm font-mono uppercase tracking-widest">Implicit assumption: Y = mX + b</span>
              </div>
            </div>
          </div>

          <p>
            Fitting a line works well for things like height vs. weight, where the relationship is roughly linear. But many real-world associations are <strong>non-linear</strong>. Think about a runner&apos;s weight vs. their top speed. Skinny people might lack muscle; very heavy people might be slowed by their own mass. The relationship might increase and then plunge—a curve that a straight line cannot capture.
          </p>
        </EC>
      </article>

      <Divider />

      {/* ========== VISUAL EXPLORATION ========== */}
      <section>
        <EC>
          <h2 className="hd-section-title mb-8 mt-16 text-white">
            Beyond the Straight Line
          </h2>
          <p>
            Let&apos;s look at how different measures of association react to various data shapes. Traditional measures like Pearson and Spearman often report <strong>zero correlation</strong> for shapes that are clearly not random.
          </p>

          <CorrelationExplorer />

          <p className="mt-12">
            As you can see, for a <strong>Ring</strong> or an <strong>X-shape</strong>, Pearson and Spearman might return values close to zero. To a human observer, these shapes are obviously structured—knowing the X position gives you a very good idea of the possible Y positions. But because the relationship isn&apos;t monotonic (it doesn&apos;t always go up or always go down), standard tools are blind to it.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== OUTLIERS & RANKS ========== */}
      <section>
        <EC>
          <h2 className="hd-section-title mb-8 mt-16 text-white">
            The Outlier Problem
          </h2>
          <p>
            Another drawback of Pearson&apos;s correlation is sensitivity to <strong>outliers</strong>. If one person in your dataset is erroneously recorded as weighing 2 million pounds, it will dramatically distort your measurements.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 mb-16">
             <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 hover:border-blue-500/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6">
                  <BarChart3 className="text-blue-400" />
                </div>
                <h4 className="text-white font-bold mb-3 text-lg">Spearman&apos;s Rho</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Replaces data points with their <strong>ranks</strong>. Robust to outliers, but still limited to monotonic relationships.
                </p>
             </div>
             <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 hover:border-purple-500/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6">
                  <Database className="text-purple-400" />
                </div>
                <h4 className="text-white font-bold mb-3 text-lg">Kendall&apos;s Tau</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Looks at <strong>concordant</strong> and <strong>discordant</strong> pairs. Better for ranks, but still fails on non-monotonic shapes like cycles.
                </p>
             </div>
          </div>

          <p>
            Ranks are the key to robustness. By looking at the <em>order</em> of values rather than their absolute scale, we can ignore the &quot;magnitude&quot; of errors.
          </p>

          <RankingVisualizer />
        </EC>
      </section>

      <Divider />

      {/* ========== HOEFFDING'S D ========== */}
      <section>
        <EC>
          <h2 className="hd-section-title mb-8 mt-16 text-white">
            Enter Hoeffding&apos;s D
          </h2>
          <p>
            Introduced by Wassily Hoeffding in 1948, <strong>D (for dependency)</strong> is a non-parametric measure that makes no assumptions about the nature of the relationship. It can detect cycles, &quot;X&quot; shapes, and complex interactions that rank-based methods usually miss.
          </p>

          <p className="text-xl md:text-2xl font-bold text-center text-white my-10 md:my-14 leading-tight">
            Independent = Joint distribution is a product of marginals.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
              Dependent = The ranks are systematically related.
            </span>
          </p>

          <p>
            Hoeffding&apos;s D evaluates whether the observed <strong>joint distribution</strong> of ranks deviates from what would be expected under independence. It doesn&apos;t just look at pairs; it effectively considers all <strong>quadruples</strong> of points.
          </p>

          <QValueViz />

          <div className="hd-insight-card">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-6">
              The Statistical Engine
            </h3>
            <p className="text-slate-300">
              The measure calculates a sum of terms based on the difference between the observed joint distribution and the product of marginal distributions.
            </p>
            <MBlock t={"D = \\frac{30 \\times ((N-2)(N-3)D_1 + D_2 - 2(N-2)D_3)}{N(N-1)(N-2)(N-3)(N-4)}"} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
               <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                  <div className="text-cyan-400 font-mono text-xs font-bold mb-1">D₁</div>
                  <div className="text-xs text-slate-500">Overall concordance/discordance across quadruples.</div>
               </div>
               <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                  <div className="text-purple-400 font-mono text-xs font-bold mb-1">D₂</div>
                  <div className="text-xs text-slate-500">Internal variability of individual sequences.</div>
               </div>
               <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                  <div className="text-emerald-400 font-mono text-xs font-bold mb-1">D₃</div>
                  <div className="text-xs text-slate-500">Interaction between sequences and internal structures.</div>
               </div>
            </div>
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== COMPUTATION ========== */}
      <section>
        <EC>
          <h2 className="hd-section-title mb-8 mt-16 text-white">
            Computational Depth
          </h2>
          <p>
            Why isn&apos;t Hoeffding&apos;s D everywhere? Because it&apos;s <strong>computationally expensive</strong>. For a dataset of 5,000 points, we aren&apos;t just doing 5,000 comparisons. We are looking at relationships that involve all unique quadruples.
          </p>

          <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-8 my-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Calculator className="w-24 h-24 text-white" />
            </div>
            <div className="relative z-10">
              <div className="text-sm font-mono text-cyan-400 mb-2 uppercase tracking-widest font-bold">The Combinatorial Tax</div>
              <h4 className="text-2xl md:text-3xl text-white font-bold mb-6 italic">&quot;n choose 4&quot;</h4>
              <p className="text-lg text-slate-300 max-w-xl leading-relaxed">
                For <M t="n = 5{,}000" />, there are approximately <strong>6.2 billion</strong> unique quadruples to consider.
              </p>
              <p className="text-slate-500 text-sm mt-4">
                In an era of cheap computing, this is a price worth paying for statistical certainty.
              </p>
            </div>
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== LIVE CODE ========== */}
      <section>
        <EC>
          <h2 className="hd-section-title mb-8 mt-16 text-white">
            Implementation: Live Executing JS
          </h2>
          <p>
            In the original paper, the math is presented in a way that is quite hard to parse. But the implementation can be surprisingly concise. Here is a live-executing JavaScript implementation of the Hoeffding&apos;s D algorithm.
          </p>

          <CodePlayground />

          <p className="mt-12">
            While this JavaScript version is great for pedagogical value, for large-scale production use (millions of vectors), you&apos;d want something more optimized. I&apos;ve implemented a high-performance version in Rust that you can find on my <a href="https://github.com/Dicklesworthstone/fast_vector_similarity" className="text-cyan-400 hover:underline">GitHub</a>.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== SEMANTIC SIMILARITY ========== */}
      <section>
        <EC>
          <h2 className="hd-section-title mb-8 mt-16 text-white">
            A Better Metric for AI
          </h2>
          <p>
            If you&apos;re working with LLMs and embedding vectors, you probably use <strong>Cosine Similarity</strong>. It&apos;s the gold standard for finding the approximate location of a needle in a haystack—quickly eliminating the 99.999% of vectors that point in completely different semantic directions.
          </p>
          <p>
            However, our spatial intuition fails above 3 dimensions. In 2048-dimensional space, geometry behaves counter-intuitively: for instance, the vast majority of a sphere&apos;s volume is concentrated near its surface. This makes cosine similarity something of a blunt instrument for the "final rank" of the top 20 most similar sentences.
          </p>
          <div className="hd-callout">
            Hoeffding&apos;s D allows us to rank these top candidates based on deep dependency rather than just geometric alignment in high-dimensional space.
          </div>
          <p>
            Hoeffding&apos;s D is symmetric, bounded between -0.5 and 1.0, robust to outliers, and universal. It is, in my opinion, the gold standard for quantifying dependency in the modern data age.
          </p>
        </EC>
      </section>

      {/* Footer spacing */}
      <div className="h-32" />
    </div>
  );
}
