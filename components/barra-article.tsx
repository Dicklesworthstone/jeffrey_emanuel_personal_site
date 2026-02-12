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
import { Briefcase, Shield, BarChart3, TrendingUp, TrendingDown, Layers, Zap, AlertCircle } from "lucide-react";
import { BarraJargon } from "./barra-jargon";

// Dynamic import visualizations (no SSR - they use browser APIs)
const FactorHero = dynamic(
  () => import("./barra-visualizations").then((m) => ({ default: m.FactorHero })),
  { ssr: false }
);
const ReturnDecomposition = dynamic(
  () => import("./barra-visualizations").then((m) => ({ default: m.ReturnDecomposition })),
  { ssr: false }
);
const PodSimulator = dynamic(
  () => import("./barra-visualizations").then((m) => ({ default: m.PodSimulator })),
  { ssr: false }
);
const FactorCorrelationMatrix = dynamic(
  () => import("./barra-visualizations").then((m) => ({ default: m.FactorCorrelationMatrix })),
  { ssr: false }
);
const LiveRegression = dynamic(
  () => import("./barra-visualizations").then((m) => ({ default: m.LiveRegression })),
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
      className="barra-math-inline"
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
      className="barra-math-block"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// Shorthand for jargon
function J({ t, children }: { t: string; children?: React.ReactNode }) {
  return <BarraJargon term={t}>{children}</BarraJargon>;
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

export function BarraArticle() {
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
            entry.target.classList.add("barra-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -60px 0px" }
    );
    targets.forEach((el) => {
      el.classList.add("barra-fade-section");
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={articleRef}
      role="main"
      id="main-content"
      className={`barra-scope barra-body ${crimsonPro.variable} ${jetbrainsMono.variable} ${bricolageGrotesque.variable}`}
      style={{ background: "#020204", color: "#f8fafc" }}
    >
      {/* Scroll Progress */}
      <div
        className="barra-progress-bar"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      {/* ========== HERO ========== */}
      <section data-section="hero" className="min-h-screen flex flex-col justify-start relative overflow-hidden pb-20 pt-24 md:pt-32">
        <FactorHero />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020204]/60 to-[#020204] z-10" />

        <EC>
          <div className="text-center relative z-20">
            <div className="inline-flex items-center gap-3 mb-12 px-4 md:px-6 py-2.5 rounded-full border border-white/10 bg-white/5 text-[11px] md:text-[12px] font-mono text-emerald-400 tracking-[0.3em] uppercase backdrop-blur-xl">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Quantitative Finance / Risk Architecture
            </div>
            <h1 className="barra-display-title mb-6 text-white text-balance">
              The Central Nervous System
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                of Wall Street.
              </span>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-slate-400 max-w-3xl mx-auto leading-tight mt-12 font-light">
              An insider&rsquo;s look at how &ldquo;smart&rdquo; risk models like Barra define the multi-manager hedge fund industry, and the hidden risks they create.
            </p>
          </div>
        </EC>

        <div
          className="absolute bottom-16 left-0 w-full flex flex-col items-center gap-4 z-20 transition-opacity duration-500"
          style={{ opacity: Math.max(0, 0.5 - scrollProgress * 5) }}
        >
          <span className="text-[11px] uppercase tracking-[0.4em] text-white/40 font-black">
            Scroll to Explore
          </span>
          <div className="w-px h-16 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </section>

      {/* ========== THE BIRTH OF AN INDUSTRY STANDARD ========== */}
      <article data-section="intro">
        <EC>
          <h2 className="barra-section-title mb-8 mt-16 text-white text-center">
            The Birth of an Industry Standard
          </h2>
          <p className="barra-drop-cap">
            In the mid-1970s, a Berkeley economics professor named <strong>Barr Rosenberg</strong> fundamentally changed how institutional investors think about risk. Rosenberg founded Barra Inc. in 1975, introducing the concept of multi-factor risk models that would become the industry standard for portfolio risk management.
          </p>
          <p>
            His core insight was that stocks with similar fundamental characteristics tend to move together, and these common movements can be systematically measured and predicted. While it might sound simplistic, following the chain of logic to its mathematical conclusion transforms it into a fabulously useful tool for understanding risk and performance.
          </p>
          <p>
            The company&rsquo;s first model, the USE1 (US Equity Model 1), launched in 1975, followed by USE2 in 1985 and USE3 in 1997. These models gained traction through the 1980s and early 1990s, initially among quantitative institutional investors. By the late 1990s, as hedge funds exploded into a trillion-dollar industry, Barra models became essential infrastructure.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
             <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 transition-all hover:border-emerald-500/30 group">
                <Briefcase className="w-8 h-8 text-emerald-400 mb-6 group-hover:scale-110 transition-transform" />
                <h4 className="text-white font-bold mb-2 text-xl">Market Dominance</h4>
                <p className="text-slate-400 text-sm leading-relaxed mb-0">
                  MSCI commands a $44B market cap, with total annual revenues nearly $2.9B in 2024. The Analytics segment, housing Barra, generated $675M at an adjusted EBITDA margin of nearly 50%.
                </p>
             </div>
             <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 transition-all hover:border-cyan-500/30 group">
                <Shield className="w-8 h-8 text-cyan-400 mb-6 group-hover:scale-110 transition-transform" />
                <h4 className="text-white font-bold mb-2 text-xl">Critical Infrastructure</h4>
                <p className="text-slate-400 text-sm leading-relaxed mb-0">
                  Accessed by over 1,200 financial institutions. Enterprise licenses for multi-strategy platforms can exceed $1M annually. For Millennium or Citadel, these costs are trivial.
                </p>
             </div>
          </div>

          <p>
            Today, MSCI&rsquo;s Barra models are accessed by over 1,200 financial institutions worldwide. The models have evolved from an academic curiosity to table stakes for any serious institutional investor. They are the daily machinery that governs capital allocation at the highest levels of finance.
          </p>
        </EC>
      </article>

      <Divider />

      {/* ========== WHERE DO RETURNS COME FROM ========== */}
      <section data-section="returns">
        <EC>
          <h2 className="barra-section-title mb-8 mt-16 text-white">
            Where Do Returns Actually Come From?
          </h2>
          <p>
            Imagine you have your own <J t="pod-shop">&ldquo;pod&rdquo;</J> at one of the pod-shops. Suppose you&rsquo;re running a $500 million long/short equity book at Millennium. Your portfolio is up 12% year-to-date, crushing your benchmark.
          </p>
          <p>
            The risk team sends you a report showing that 8% of your return came from being accidentally overweight momentum stocks, 3% came from your intentional stock picks, and 1% from random noise. Suddenly, your <J t="alpha">&ldquo;alpha&rdquo;</J> doesn&rsquo;t look so impressive!
          </p>
          <p>
            This is the daily reality. Every morning, PMs wake up to factor exposure reports showing exactly what risks they&rsquo;re taking. When you buy a stock, you&rsquo;re not just buying a company; you&rsquo;re buying a bundle of characteristics: its <J t="size">size</J>, <J t="leverage">leverage</J>, <J t="momentum">momentum</J>, and volatility profile.
          </p>
          
          <ReturnDecomposition />

          <div className="barra-callout mt-12">
            Beyond risk management, factor models are tools for disentangling skill from luck. Has a manager achieved returns through a rigorous, repeatable alpha, or just by being long the market at the right time?
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== THE MATHEMATICAL ARCHITECTURE ========== */}
      <section data-section="math">
        <EC>
          <h2 className="barra-section-title mb-8 mt-16 text-white">
            The Mathematical Architecture
          </h2>
          <p>
            Factor models slash through complexity with a powerful insight: most stocks move together because they share common characteristics, not because of unique pairwise relationships.
          </p>
          <p>
            The math starts with decomposing each stock&rsquo;s return into what matters and what&rsquo;s noise. For any stock <M t="i" /> at time <M t="t" />, the return breaks down as:
          </p>
          <MBlock t="r_{i,t} = x_{i,t}^{\top} f_t + \varepsilon_{i,t}" />
          <p className="text-slate-400 text-sm italic mt-4 mb-10 text-center">
            Where <M t="x_{i,t}" /> is <J t="factor-exposure">exposure</J>, <M t="f_t" /> is factor return, and <M t="\varepsilon_{i,t}" /> is <J t="idiosyncratic-risk">idiosyncratic noise</J>.
          </p>
          
          <p>
            But attribution is just the warm-up. The real value comes from using this structure to forecast risk across the entire covariance matrix:
          </p>
          <MBlock t="\Sigma_t = B_t \Omega_t B_t^{\top} + \Delta_t" />
          
          <p>
            This formula encodes a crucial assumption: stocks only correlate through shared factor exposures. Once you control for the fact that Microsoft and Apple are both large-cap tech stocks, their remaining risks should be independent. It&rsquo;s an elegant simplification that makes an intractable problem solvable.
          </p>

          <LiveRegression />

          <p className="mt-12">
            Each day, the system estimates factor returns using <J t="wls"><strong>weighted least squares regression</strong></J>. The weights, typically proportional to the square root of market cap, ensure mega-caps don&rsquo;t dominate while preventing micro-caps from adding too much noise.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== LIFE INSIDE A POD ========== */}
      <section data-section="pod-life">
        <EC>
          <h2 className="barra-section-title mb-8 mt-16 text-white">
            Life Inside a Pod: The Daily Workflow
          </h2>
          <p>
            A typical morning for a pod PM at Citadel or Millennium starts at 6:30 AM. The first check: <strong>are you within limits?</strong>
          </p>
          <p>
            The platform provides strict boundaries. Market <J t="beta">beta</J> must stay between -5% and +5%. Style factor exposure can&rsquo;t exceed 0.5 standard deviations. Industry tilts are capped at 3% net. If you&rsquo;re outside, you can&rsquo;t trade until you hedge.
          </p>
          
          <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 md:p-12 my-12 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <Shield className="w-32 h-32 text-emerald-400" />
             </div>
             <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 relative z-10">The Pre-Trade Optimizer</h3>
             <p className="text-slate-300 leading-relaxed mb-8 relative z-10">
                You feed new trade ideas into the optimizer. It solves a constrained optimization problem, calculating the exact sizes that maximize expected alpha while staying within risk limits. It might suggest a hedge basket of ETFs to neutralize unintended industry tilts.
             </p>
             <div className="flex flex-wrap gap-4 relative z-10">
                <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-xs font-mono text-emerald-400">LEAST-SQUARES SOLVER</div>
                <div className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-xs font-mono text-cyan-400">CONSTRAINED HEDGING</div>
             </div>
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== THE MULTI-STRATEGY ECOSYSTEM ========== */}
      <section data-section="ecosystem">
        <EC>
          <h2 className="barra-section-title mb-8 mt-16 text-white">
            The Multi-Strategy Ecosystem
          </h2>
          <p>
            Factor models are the central nervous system. A platform might have 50 pods, each running $200M to $2B. Without these models, the risk team would have no idea if all 50 pods were making the same bet.
          </p>
          <p>
            The dirty secret? It&rsquo;s only possible through <J t="leverage"><strong>leverage</strong></J>. Firms borrow 5x to 7x their LP capital. This leverage is what allows 20/20 fee structures (20% to firm, 20% to PM), but it makes the arithmetic brutal.
          </p>

          <PodSimulator />

          <p className="mt-12">
            A 5% gross loss on 6x leverage is a 30% loss on LP capital. This is why firms are infamous for the <strong>&ldquo;shoulder tap,&rdquo;</strong> slashing a pod&rsquo;s capital overnight during a drawdown.
          </p>
          <div className="barra-insight-card group my-12">
             <h4 className="text-white font-bold mb-4 flex items-center gap-3">
                <Zap className="w-5 h-5 text-amber-400" />
                The 360 View
             </h4>
             <p className="text-sm text-slate-400 mb-0">
                Consolidated firm view: $500M long momentum, $300M short value. If momentum crashes 3% in a day, the system identifies which pods are exposed. Those who drifted into it accidentally get the call to hedge immediately.
             </p>
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== STYLE FACTORS DECODED ========== */}
      <section data-section="factors">
        <EC>
          <h2 className="barra-section-title mb-8 mt-16 text-white text-center">
            The Factors Decoded
          </h2>
          <p className="text-center text-slate-400 mb-16">
            When you see &ldquo;ZS&rdquo; on a risk screen, it means <J t="z-score"><strong>Z-Score</strong></J>: the factor has been standardized to have mean zero and unit standard deviation.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
             <div className="barra-insight-card !my-0 !bg-blue-500/5 hover:!bg-blue-500/10 transition-colors group cursor-default flex flex-col h-full">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shrink-0">
                   <BarChart3 className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-white font-bold text-xl mb-4 shrink-0">RESVOL</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-0 flex-1">
                  <J t="idiosyncratic-risk">Residual Volatility</J> captures moves beyond market beta. Combines GARCH estimates and price ranges to flag stock-specific blow-up risk.
                </p>
             </div>

             <div className="barra-insight-card !my-0 !bg-amber-500/5 hover:!bg-amber-500/10 transition-colors group cursor-default flex flex-col h-full">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shrink-0">
                   <TrendingUp className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-white font-bold text-xl mb-4 shrink-0">MOM11M</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-0 flex-1">
                  Classic <J t="momentum">Medium-term Momentum</J>. Uses a critical one-month skip to avoid reversal effects, identifying persistent performance trends.
                </p>
             </div>

             <div className="barra-insight-card !my-0 !bg-cyan-500/5 hover:!bg-cyan-500/10 transition-colors group cursor-default flex flex-col h-full">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shrink-0">
                   <Layers className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-white font-bold text-xl mb-4 shrink-0">SIZE</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-0 flex-1">
                  Log-transformed market cap. Prevents mega-caps from overwhelming the model while capturing the structural risk difference between giants and mid-caps.
                </p>
             </div>
          </div>
          
          <Divider />
          
          <FactorCorrelationMatrix />
          
          <div className="mt-12 space-y-8">
             <h3 className="text-white font-bold text-2xl mb-6">Ownership &amp; Crowding</h3>
             <p>
               <strong>Hedge Fund Ownership (HFOWN)</strong> tracks shares held by funds via 13F filings. High ownership creates &ldquo;Hedge Fund Hotels&rdquo;&mdash;stocks that momentum strongly but crash violently when everyone rushes for the exit.
             </p>
             <p>
               <strong>Passive Ownership (PASSOWN)</strong> measures ETF and index fund holdings. As passive hits 50% of market cap, it predicts lower volatility and predictable flows around rebalances.
             </p>
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== COMMON FAILURE MODES ========== */}
      <section data-section="failures">
        <EC>
          <h2 className="barra-section-title mb-8 mt-16 text-white">
            Common Failure Modes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
             <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-3xl group hover:bg-rose-500/10 transition-colors">
                <h4 className="text-rose-400 font-bold mb-3 flex items-center gap-2">
                   <AlertCircle className="w-4 h-4" />
                   Hidden Factor Bets
                </h4>
                <p className="text-sm text-slate-400 mb-0">
                   You think you&rsquo;ve found alpha in companies with high insider ownership, but really you&rsquo;ve just rediscovered the Value factor with extra steps.
                </p>
             </div>
             <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl group hover:bg-amber-500/10 transition-colors">
                <h4 className="text-amber-400 font-bold mb-3 flex items-center gap-2">
                   <TrendingDown className="w-4 h-4" />
                   Microstructure Traps
                </h4>
                <p className="text-sm text-slate-400 mb-0">
                   Capture &ldquo;alpha&rdquo; from last-trade prices ping-ponging between bid and ask. In production, you can&rsquo;t capture this without paying the spread.
                </p>
             </div>
          </div>
          <p>
            Winners understand that factor models are tools, not oracles. They focus relentlessly on <strong>stock-specific alpha</strong> while keeping factor exposures near zero. Losers become slaves to the model or ignore it entirely, only to blow up in the next factor rotation.
          </p>
        </EC>
      </section>

      {/* ========== THE FUTURE ========== */}
      <section data-section="future" className="pb-32">
        <EC>
          <h2 className="barra-section-title mb-8 mt-16 text-white">
            The Future of Risk
          </h2>
          <p>
             Alternative data creates new factors: satellite imagery, credit card spending, social media sentiment. Machine learning identifies non-linear combinations that traditional models miss.
          </p>
          <p>
             The downside? Barra charges an insane amount for its tools. But because they publish the details of their factors, it is now possible to replicate &ldquo;close enough&rdquo; models using LLMs and affordable data APIs. 
          </p>
          <div className="barra-insight-card !bg-emerald-500/10 !border-emerald-500/20 mt-12">
             <p className="text-emerald-400 font-bold mb-2 uppercase tracking-widest text-[10px]">Final Thought</p>
             <p className="text-slate-300 mb-0 italic">
                &ldquo;Sorry Mr. Rosenberg, but I won&rsquo;t be paying your company six figures for some linear algebra code! The democratization of quantitative risk management is here.&rdquo;
             </p>
          </div>
        </EC>
      </section>

      {/* Footer spacing */}
      <div className="h-32" />
    </div>
  );
}
