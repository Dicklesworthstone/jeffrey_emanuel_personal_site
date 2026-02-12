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
import { Info, Calculator, BarChart3, Database, Layers, ShieldCheck } from "lucide-react";

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
              Statistical Topology / Dependency Lab
            </div>
            <h1 className="hd-display-title mb-6 text-white text-balance">
              My Favorite Statistical Measure:
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                Hoeffding&apos;s D.
              </span>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-slate-400 max-w-3xl mx-auto leading-tight mt-12 font-light">
              Pearson misses curves. Spearman misses cycles. 
              Hoeffding&apos;s D captures the <strong>latent geometry</strong> of any dependency.
            </p>
          </div>
        </EC>

        <div
          className="absolute bottom-16 left-0 w-full flex flex-col items-center gap-4 z-20 transition-opacity duration-500"
          style={{ opacity: Math.max(0, 0.5 - scrollProgress * 5) }}
        >
          <span className="text-[11px] uppercase tracking-[0.4em] text-white/40">
            Scroll to Enter the Lab
          </span>
          <div className="w-px h-16 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </section>

      {/* ========== INTRO ========== */}
      <article>
        <EC>
          <p className="hd-drop-cap">
            Suppose you have two sequences of numbers. You want to know if they are related. In most settings, we have no clue <em>a priori</em> what the nature of that relationship might be. Are they linear? Cyclical? Sinusoidal? 
          </p>
          <p>
            Standard correlation measures—Pearson and Spearman—make assumptions. They look for straight lines or monotonic trends. If your data forms a ring or an &quot;X&quot; shape, these measures will often report <strong>zero correlation</strong>, even though the dependency is obvious to any human eye.
          </p>

          <div className="hd-insight-card group">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6">
                <Layers className="text-cyan-400" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
                The Dependency Engine
              </h3>
              <p className="text-slate-400 text-base md:text-lg mb-0 leading-relaxed">
                The &quot;brilliant&quot; insight behind Hoeffding&apos;s D is comparing the <strong>Joint Distribution</strong> of your data to the <strong>Product of Marginals</strong>. If $X$ and $Y$ are independent, the product of their individual behaviors should perfectly predict their joint behavior. Any deviation from this &quot;independent prediction&quot; is dependency.
              </p>
            </div>
          </div>
        </EC>
      </article>

      <Divider />

      {/* ========== THE LAB ========== */}
      <section>
        <EC>
          <h2 className="hd-section-title mb-8 mt-16 text-white">
            Visualizing the Residuals
          </h2>
          <p>
            Traditional measures are blind to non-monotonic shapes. Below, notice how Pearson fails on the <strong>Ring</strong> or the <strong>X-Shape</strong>, while Hoeffding&apos;s D identifies the structure by summing the &quot;residual energy&quot; in the heatmap.
          </p>

          <DependencyLab />

          <p className="mt-12">
            The heatmap on the right represents the <strong>Residuals</strong> ($P(X,Y) - P(X)P(Y)$). Intense color pockets indicate that certain combinations of $X$ and $Y$ happen far more (or less) frequently than random chance would allow. Hoeffding&apos;s D effectively quantifies the volume of these deviations.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== THE OUTLIER CRUSHER ========== */}
      <section>
        <EC>
          <h2 className="hd-section-title mb-8 mt-16 text-white">
            Taming the Outliers
          </h2>
          <p>
            Outliers are the nemesis of Pearson correlation. A single point with an extreme value can dominate the variance, making perfectly related points look uncorrelated. Hoeffding&apos;s D solves this by operating in <strong>Rank Space</strong>.
          </p>

          <OutlierCrusher />

          <p className="mt-12">
            By applying <strong>ranking</strong>, we strip away the destructive magnitude of outliers. A value of 1,000,000 becomes just &quot;Position 5&quot; if there are only 5 points. This transformation is what makes Hoeffding&apos;s D so robust in real-world data pipelines.
          </p>

          <RankingVisualizer />
        </EC>
      </section>

      <Divider />

      {/* ========== THE MATH ========== */}
      <section>
        <EC>
          <h2 className="hd-section-title mb-8 mt-16 text-white">
            The Statistical Engine
          </h2>
          <p>
            Wassily Hoeffding&apos;s 1948 paper defines $D$ through a series of intermediate terms that evaluate every possible <strong>quadruple</strong> of points in your dataset.
          </p>

          <div className="hd-insight-card">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-6">
              The Normalization Logic
            </h3>
            <MBlock t={"D = \\frac{30 \\times ((N-2)(N-3)D_1 + D_2 - 2(N-2)D_3)}{N(N-1)(N-2)(N-3)(N-4)}"} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
               <div className="p-6 bg-black/40 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span className="text-white font-bold text-sm">Universal Consistency</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">As $N$ grows, $D$ is guaranteed to identify <em>any</em> non-independent distribution, regardless of its shape.</p>
               </div>
               <div className="p-6 bg-black/40 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Calculator className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className="text-white font-bold text-sm">Computational Cost</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">Evaluating quadruples ($n \text{ choose } 4$) is expensive. For $N=5{,}000$, we evaluate ~6.2 billion combinations.</p>
               </div>
            </div>
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== LIVE CODE ========== */}
      <section>
        <EC>
          <h2 className="hd-section-title mb-8 mt-16 text-white">
            Live Executing Logic
          </h2>
          <p>
            The implementation can be surprisingly concise. This live TypeScript console computes Hoeffding&apos;s D for the height/weight dataset mentioned earlier.
          </p>

          <CodePlayground />

          <p className="mt-12">
            Pedagogically, this demonstrates that statistical complexity doesn&apos;t always mean complex code. The "magic" is in the ranking and the triple-summation. For large-scale production (millions of vectors), I&apos;ve written a high-performance Rust implementation available on my <a href="https://github.com/Dicklesworthstone/fast_vector_similarity" className="text-cyan-400 hover:underline font-bold">GitHub</a>.
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
            In the world of LLMs and RAG, <strong>Cosine Similarity</strong> is the workhorse. It is excellent for filtering millions of vectors down to a manageable &quot;needle in a haystack.&quot;
          </p>
          <p>
            But geometric intuition fails in high dimensions. In 2048-dimensional embedding space, nearly all of a sphere&apos;s volume is concentrated near its surface. This makes cosine similarity a blunt instrument for the final ranking.
          </p>
          <div className="hd-callout">
            Hoeffding&apos;s D allows us to rank the final candidates based on deep, non-linear dependency rather than just geometric alignment.
          </div>
          <p>
            It is symmetric, bounded between -0.5 and 1.0, and universal. It is the gold standard for quantifying dependency in the modern data age.
          </p>
        </EC>
      </section>

      {/* Footer spacing */}
      <div className="h-32" />
    </div>
  );
}
