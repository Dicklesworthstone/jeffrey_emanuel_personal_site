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
import { RaptorQJargon } from "./raptorq-jargon";
import { RaptorQMathTooltip } from "./raptorq-math-tooltip";

// Dynamic import visualizations (no SSR - they use browser APIs)
const HeroParticles = dynamic(
  () => import("./raptorq-visualizations").then((m) => ({ default: m.HeroParticles })),
  { ssr: false }
);
const MatrixViz = dynamic(
  () => import("./raptorq-visualizations").then((m) => ({ default: m.MatrixViz })),
  { ssr: false }
);
const DegreeRippleViz = dynamic(
  () => import("./raptorq-visualizations").then((m) => ({ default: m.DegreeRippleViz })),
  { ssr: false }
);
const PrecodeViz = dynamic(
  () => import("./raptorq-visualizations").then((m) => ({ default: m.PrecodeViz })),
  { ssr: false }
);
const PeelingViz = dynamic(
  () => import("./raptorq-visualizations").then((m) => ({ default: m.PeelingViz })),
  { ssr: false }
);
const ToyDecodeViz = dynamic(
  () => import("./raptorq-visualizations").then((m) => ({ default: m.ToyDecodeViz })),
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
    return <RaptorQMathTooltip mathKey={explanation}>{content}</RaptorQMathTooltip>;
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
    return <RaptorQMathTooltip mathKey={explanation}>{content}</RaptorQMathTooltip>;
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
  return <RaptorQJargon term={t}>{children}</RaptorQJargon>;
}

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

export function RaptorQArticle() {
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
      ":scope > section:not(:first-child), :scope > article, [data-section]"
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
      role="main"
      id="main-content"
      className={`raptorq-scope rq-body ${crimsonPro.variable} ${jetbrainsMono.variable} ${bricolageGrotesque.variable}`}
      style={{ background: "#020204", color: "#f8fafc" }}
    >
      {/* Scroll Progress */}
      <div
        className="rq-progress-bar"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      {/* ========== HERO ========== */}
      <section data-section="hero" className="min-h-screen flex flex-col justify-center relative overflow-hidden pb-20">
        <HeroParticles />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020204]/60 to-[#020204] z-10" />

        <EC>
          <div className="text-center pt-48 md:pt-32 relative z-20">
            <div className="inline-flex items-center gap-3 mb-12 px-4 md:px-6 py-2.5 rounded-full border border-white/10 bg-white/5 text-[11px] md:text-[12px] font-mono text-cyan-400 tracking-[0.3em] uppercase backdrop-blur-xl">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              Protocol Intelligence / RFC 6330
            </div>
            <h1 className="rq-display-title mb-6 text-white text-balance">
              The Black Magic of
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                Liquid Data.
              </span>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-slate-400 max-w-3xl mx-auto leading-tight mt-12 font-light">
              Turn any file into an infinite stream of interchangeable packets.
              Collect any K of them, in any order, and recover the original. The
              total overhead: under{" "}
              <span className="text-white font-medium italic">5%</span>.
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

      {/* ========== INTRO ========== */}
      <article data-section="intro">
        <EC>
          <p className="rq-drop-cap">
            I have to admit that I find the existence of{" "}
            <J t="raptorq">RaptorQ</J> genuinely shocking.
            The idea that you can take some arbitrary file, turn it into a stream of
            fungible blobs, receive those blobs in literally any order, and have each
            new one help you reconstruct the original already seems pretty
            impressive. But then you learn that the total overhead for all of
            this is under 5%, and that the receiver often needs just two extra
            symbols beyond the bare minimum to decode with near-certainty.
            That seems both magical and frankly improbable.
          </p>
          <p>
            To see why this matters, think about how we normally move data around.
            TCP is fundamentally a conversation: &quot;I sent packet 4.&quot; &quot;I didn&rsquo;t get
            packet 4.&quot; &quot;Okay, resending packet 4.&quot; &quot;Got it.&quot; That works fine for
            loading a webpage, but it falls apart when latency is high (try a
            40-minute round trip to Mars) or when you&rsquo;re broadcasting to a million
            receivers at once over lossy cellular. TCP requires a feedback loop.
            The sender has to know exactly what the receiver is missing. Scale that
            to a million receivers, each losing different packets, all sending
            retransmission requests at once. That&rsquo;s{" "}
            <strong>
              <J t="feedback-implosion">feedback implosion</J>
            </strong>
            . The sender drowns.
          </p>
          <p>
            RaptorQ does something completely different. You turn your file into a{" "}
            <strong className="text-cyan-300">mathematical liquid</strong> and just
            spray packets at the receiver. The receiver is basically just a bucket.
            It doesn&rsquo;t matter which drops land in it, and it doesn&rsquo;t matter if half
            the spray blows away in the wind. As soon as the bucket has roughly{" "}
            <M t="K+\epsilon" /> drops (not any <em>particular</em> drops, just
            enough of them), the receiver reconstructs the original data.
          </p>

          <div className="rq-insight-card group">
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
                How Good Is It, Really?
              </h3>
              <p className="text-slate-400 text-base md:text-lg mb-0 leading-relaxed font-serif italic">
                This is all codified in <strong>RaptorQ (RFC 6330)</strong>.
                The RFC actually has a SHALL-level decoder requirement: if you
                receive encoding symbols whose IDs are chosen uniformly at random,
                the <em>average</em> decode failure rate must be at most 1 in 100
                when receiving <M t="K'" /> symbols, 1 in 10,000 at{" "}
                <M t="K'+1" />, and 1 in 1,000,000 at <M t="K'+2" />.
                The receiver almost never needs more than{" "}
                <span className="text-cyan-400 font-mono font-bold">K + 2</span>{" "}
                symbols to decode perfectly.
              </p>
              <p className="text-slate-500 text-sm mt-4 mb-0 leading-relaxed">
                But &quot;+2 symbols&quot; is only the <em>reception</em> overhead&mdash;the
                extra packets the receiver must collect. The full picture includes
                the precode&rsquo;s internal expansion from <M t="K" /> source symbols
                to <M t="L \approx 1.025K" /> intermediate symbols. That ~2.5%
                structural redundancy is what makes the &quot;+2 symbols&quot; trick
                possible. Combined with the LT layer, total system overhead is
                under 5%&mdash;still remarkably small.
              </p>
            </div>
          </div>
        </EC>
      </article>

      <Divider />

      {/* ========== WHAT YOU MAY ALREADY KNOW ========== */}
      <section data-section="pre-knowledge">
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white">
            What You May Already Know
          </h2>
          <p>
            If you&rsquo;ve ever used <strong>PAR2 files</strong> to repair a corrupted
            download, or relied on RAID 5 to survive a dead drive, you&rsquo;ve already
            seen the seed of this idea. PAR2 uses{" "}
            <J t="reed-solomon">Reed-Solomon codes</J> to generate repair blocks
            from your original data. Lose a few files? Throw in some{" "}
            <code>.par2</code> recovery blocks, and the repair tool reconstructs the
            missing pieces.
          </p>
          <p>
            Reed-Solomon is pretty powerful. It achieves what coding theorists call{" "}
            <strong>
              <J t="mds">MDS</J>
            </strong>{" "}
            (Maximum Distance Separable) behavior: any <M t="K" explanation="k-plus-epsilon" /> of{" "}
            <M t="K+R" /> encoded symbols perfectly reconstruct <M t="K" /> source
            symbols. Zero overhead. Mathematically optimal.
          </p>
          <p>So why isn&rsquo;t this the end of the story? Two problems:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mt-12 mb-16 items-stretch">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-[2rem] p-6 md:p-10 transition-all duration-500 hover:border-cyan-500/30 group flex flex-col h-full">
              <h4 className="text-white font-bold mb-5 text-lg md:text-xl group-hover:text-cyan-400 transition-colors shrink-0">
                You must choose <M t="R" /> in advance
              </h4>
              <p className="text-lg text-slate-300 leading-relaxed mb-0 font-light flex-1">
                Reed-Solomon is <strong>fixed-rate</strong>. You pick your
                redundancy budget before you send anything. If the channel is
                worse than expected, you&rsquo;re dead. If it&rsquo;s better, you wasted
                bandwidth.
              </p>
            </div>
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-[2rem] p-6 md:p-10 transition-all duration-500 hover:border-purple-500/30 group flex flex-col h-full">
              <h4 className="text-white font-bold mb-5 text-lg md:text-xl group-hover:text-purple-400 transition-colors shrink-0">
                It gets slow at scale
              </h4>
              <p className="text-lg text-slate-300 leading-relaxed mb-0 font-light flex-1">
                Reed-Solomon encoding and decoding cost grows with block size.
                Standard implementations are <M t="O(n \cdot K)" explanation="complexity-quadratic" /> for encoding
                and <M t="O(K^2)" explanation="complexity-quadratic" /> for decoding.
              </p>
            </div>
          </div>
          <p>
            The{" "}
            <strong>
              <J t="fountain-code">fountain code</J>
            </strong>{" "}
            dream was to fix both problems at once: don&rsquo;t choose a rate. Don&rsquo;t
            negotiate. Just open a valve and spray encoded packets. Each receiver
            collects whichever drops happen to arrive and stops when it has enough.
          </p>
          <p>
            Reed-Solomon gave us the &quot;any <M t="K" /> of <M t="N" />&quot; property.
            Fountain codes ask: what if <M t="N" /> could be <em>infinity</em>?
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== PACKETS ARE EQUATIONS ========== */}
      <section data-section="equations">
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white">
            Packets Are Equations
          </h2>
          <p>
            Everything in this article rests on one mental shift: stop thinking of
            packets as &quot;chunks of a file&quot; and start thinking of them as{" "}
            <strong>
              <J t="linear-independence">linear equations</J>
            </strong>
            . Once you do that, a lot of things click into place.
          </p>
          <p>
            Suppose your file is four bytes: <code>A=5</code>, <code>B=3</code>,{" "}
            <code>C=7</code>, <code>D=2</code>. Instead of sending those four
            values directly, you generate encoded packets by{" "}
            <J t="xor">XORing</J> subsets:
          </p>
          <div className="bg-black/50 border border-white/5 rounded-2xl p-4 md:p-6 my-12 font-mono text-sm text-slate-300 leading-relaxed overflow-x-auto">
            <span className="text-slate-500">Packet 1:</span> A ⊕ C = 5 ⊕ 7 ={" "}
            <span className="text-cyan-400">2</span>{" "}
            <span className="text-slate-600">[1,0,1,0]</span>
            <br />
            <span className="text-slate-500">Packet 2:</span> B ⊕ C ⊕ D = 3 ⊕ 7 ⊕
            2 = <span className="text-cyan-400">6</span>{" "}
            <span className="text-slate-600">[0,1,1,1]</span>
            <br />
            <span className="text-slate-500">Packet 3:</span> A ⊕ B = 5 ⊕ 3 ={" "}
            <span className="text-cyan-400">6</span>{" "}
            <span className="text-slate-600">[1,1,0,0]</span>
            <br />
            <span className="text-slate-500">Packet 4:</span> A ⊕ B ⊕ C ⊕ D = 5 ⊕
            3 ⊕ 7 ⊕ 2 = <span className="text-cyan-400">3</span>{" "}
            <span className="text-slate-600">[1,1,1,1]</span>
          </div>
          <p>
            Each packet is a linear equation over the unknowns{" "}
            <code>[A,B,C,D]</code>, and the binary vector says which symbols
            participate. The receiver who collects any four independent packets can
            solve the system by{" "}
            <J t="gaussian-elimination">Gaussian elimination</J>, XOR-ing rows
            until each unknown is isolated.
          </p>
          <p>
            In RaptorQ, we treat the source data as a vector of unknowns{" "}
            <M t="[x_1, x_2, ..., x_K]" /> and generate an infinite stream of
            encoded packets, each one the XOR of a random subset of source symbols.
          </p>

          <MatrixViz />

          <p>
            This explains the <strong>fungibility</strong>. Order doesn&rsquo;t matter
            because the order in which you write down equations doesn&rsquo;t change the
            solution. Every new packet provides a bit more information, constraining
            the possible values of the source symbols.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== WHAT RAPTORQ PROMISES ========== */}
      <section data-section="promises">
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white">
            What RaptorQ Promises
          </h2>
          <p>
            RFC 6330 makes three promises, and they&rsquo;re worth stating precisely:{" "}
            <strong><J t="rateless">rateless</J></strong>,{" "}
            <strong><J t="systematic-encoding">systematic</J></strong>, and{" "}
            <strong>near-<J t="mds">MDS</J></strong>.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 items-stretch">
            <div className="rq-insight-card !my-0 !p-6 md:!p-8 !bg-slate-900/50 hover:bg-slate-900 transition-colors flex flex-col h-full">
              <h4 className="text-white font-bold mb-3 text-lg shrink-0">Rateless</h4>
              <p className="text-sm text-slate-400 leading-relaxed mb-0 flex-1">
                The sender can generate as many repair packets as needed. No
                fixed <M t="n" />. No negotiation loop.
              </p>
            </div>
            <div className="rq-insight-card !my-0 !p-6 md:!p-8 !bg-slate-900/50 hover:bg-slate-900 transition-colors flex flex-col h-full">
              <h4 className="text-white font-bold mb-3 text-lg shrink-0">Systematic</h4>
              <p className="text-sm text-slate-400 leading-relaxed mb-0 flex-1">
                The original data symbols are part of the encoding stream. In the
                common case of low loss, the receiver just gets the source symbols
                and never runs a decoder.
              </p>
            </div>
            <div className="rq-insight-card !my-0 !p-6 md:!p-8 !bg-slate-900/50 hover:bg-slate-900 transition-colors flex flex-col h-full">
              <h4 className="text-white font-bold mb-3 text-lg shrink-0">Near-MDS</h4>
              <p className="text-sm text-slate-400 leading-relaxed mb-0 flex-1">
                It behaves almost like an optimal erasure code: you need only
                slightly more than the block size. The RFC pins down a steep
                reliability curve: <M t="\le 1\%" /> failure at <M t="K'" />,{" "}
                <M t="\le 0.01\%" /> at <M t="K'+1" />,{" "}
                <M t="\le 10^{-6}" /> at <M t="K'+2" />.
              </p>
            </div>
          </div>
        </EC>
      </section>

      {/* ========== COUPON COLLECTOR ========== */}
      <section data-section="coupon">
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white">
            The Coupon Collector&rsquo;s Tax
          </h2>
          <p>
            If the idea is just &quot;send random linear equations,&quot; why didn&rsquo;t we do
            this 50 years ago? It&rsquo;s called <strong>Random Linear Network Coding</strong>,
            and it works perfectly. But there is a catch:
          </p>
          <p className="text-xl md:text-2xl font-bold text-center text-white my-10 md:my-14 leading-tight text-balance">
            Dense equations = solvable but slow.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 font-black">
              Sparse equations = fast but broken.
            </span>
          </p>
          <p>
            Dense: solving a system of <M t="K" /> random linear equations takes{" "}
            <M t="O(K^3)" /> time. If your file has 50,000 blocks, that&rsquo;s 125
            trillion operations.
          </p>
          <p>
            So we make the equations <strong>sparse</strong>: instead of XORing 50%
            of the symbols, we XOR only a few (say, 5 or 10). This makes solving
            fast. But sparsity introduces a new villain: the{" "}
            <strong>
              <J t="coupon-collector">Coupon Collector Problem</J>
            </strong>
            .
          </p>

          <div className="bg-black/50 border border-white/5 rounded-2xl p-4 md:p-6 my-12">
            <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-4">
              The Core Probability
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              Suppose each encoded packet touches exactly <M t="d" /> randomly
              chosen source symbols. After receiving <M t="n" /> packets, the
              probability a specific symbol was <em>never</em> touched is:
            </p>
            <MBlock t="P(x_i \text{ untouched}) \approx \left(1 - \frac{1}{K}\right)^{dn} \approx e^{-dn/K}" explanation="untouched-probability" />
            <p className="text-slate-300 text-sm leading-relaxed mb-0">
              With <M t="d = 5" />, you should expect about{" "}
              <M t="e^{-5} \approx 0.7\%" /> of your symbols to have{" "}
              <strong>zero appearances</strong>. That&rsquo;s ~70 symbols in a block of
              10,000 that are <em>information-theoretically unrecoverable</em>.
            </p>
          </div>

          <div className="rq-callout">
            With constant-degree random mixing, you need <M t="O(K \log K)" />{" "}
            packets to cover every symbol with high probability.
          </div>

          <p>
            The whole story of{" "}
            <J t="fountain-code">fountain code</J> design is threading this
            needle. Dense equations give you solvability but{" "}
            <M t="O(K^3)" /> decoding. Sparse equations give you speed but the{" "}
            <J t="coupon-collector">coupon collector&rsquo;s</J> log tax on overhead.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== LT CODES ========== */}
      <section data-section="lt-codes">
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white">
            LT Codes: The Ripple
          </h2>
          <p>
            <J t="lt-codes">LT codes</J> (Luby, 2002) were the first practical
            fountain codes. The core move is simple:{" "}
            <strong>don&rsquo;t pick a fixed degree</strong>. For each packet, you choose
            a degree <M t="d" /> from a carefully shaped distribution, then XOR
            those <M t="d" /> symbols.
          </p>

          <div className="rq-insight-card">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-6">
              The Soliton Intuition
            </h3>
            <p className="text-slate-300">
              A degree-<M t="d" /> equation becomes <em>useful</em> when
              exactly <M t="d-1" /> of its neighbors are already known, because
              then it collapses to a single unknown. The idealized version is
              the{" "}
              <strong>
                <J t="soliton-distribution">Ideal Soliton</J>
              </strong>{" "}
              degree law:
            </p>
            <div className="bg-black/50 border border-white/5 rounded-2xl p-4 md:p-6 font-mono text-sm text-slate-300 leading-relaxed overflow-x-auto mt-4">
              <MBlock
                t="\begin{aligned} \rho(1) &= 1/K \\ \rho(d) &= 1/(d(d-1)) \text{ for } d = 2,3,\dots,K \end{aligned}"
                explanation="soliton-formula"
              />
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mt-6 mb-0">
              In practice the Ideal Soliton is too fragile. It maintains an
              expected <J t="ripple">ripple</J> of exactly one degree-1 check
              at each step. One unlucky dry spell and the ripple hits zero: the
              cascade stalls. LT codes fix this with a{" "}
              <strong>Robust Soliton</strong> distribution that adds a deliberate
              buffer.
            </p>
          </div>

          <DegreeRippleViz />

          <p>
            The decoding picture is graph-theoretic. Draw a bipartite graph:
            variables on the left (unknown symbols), checks on the right (received
            packets), and edges for &quot;this packet touches that symbol.&quot; The{" "}
            <strong><J t="ripple">ripple</J></strong> is the set of degree-1 check
            nodes at any moment.
          </p>
          <p>
            Peeling succeeds as long as the ripple never hits zero. If it does,
            you&rsquo;re in a{" "}
            <strong>
              <J t="stopping-set">stopping set</J>
            </strong>{" "}
            (a <strong>2-core</strong>): every remaining packet has degree{" "}
            <M t="\ge 2" />, so nothing is directly solvable.
          </p>
        </EC>
      </section>

      {/* ========== THE ONE CLEVER IDEA ========== */}
      <section data-section="clever-idea">
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white">
            The One Clever Idea
          </h2>
          <p>
            This is the part I find most interesting. The idea is simple once you
            see it:
          </p>
          <p className="text-lg md:text-xl font-bold text-center text-white my-12 md:my-16 leading-tight text-balance">
            Don&rsquo;t make the fountain code perfect.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-black">
              Let it be sloppy. Clean up with a second code.
            </span>
          </p>
          <p>
            Instead of trying to recover 100% of the symbols from the sparse
            fountain code, you only ask it to recover about{" "}
            <strong>97%</strong> of symbols.
          </p>
          <p>
            Getting to 97% is easy and costs <M t="O(K)" /> time. It&rsquo;s only the
            tail, the last few stubborn symbols, that gets expensive. So you
            just... don&rsquo;t bother with the tail.
          </p>
          <p>
            Obviously you still need 100% of the file. So <em>before</em> the
            fountain process starts, you take the source file and apply a{" "}
            <strong>
              <J t="precode">precode</J>
            </strong>
            : you expand it by a tiny amount (say, 3%) using a high-density
            erasure code.
          </p>
          <p>
            In RaptorQ, that precode is layered: a sparse{" "}
            <J t="ldpc">LDPC</J>-style part (cheap XOR constraints) plus a
            small, denser <J t="hdpc">HDPC</J> &quot;insurance&quot; part (where the
            spec leans on <J t="gf256">GF(256)</J> to crush{" "}
            <J t="rank">rank</J> failures).
          </p>

          <PrecodeViz />

          <p>The workflow becomes two stages:</p>
          <ol className="list-decimal list-inside space-y-6 text-slate-200 text-lg md:text-xl lg:text-2xl ml-4 mb-16 border-l border-white/10 pl-8 font-light">
            <li>
              <strong>The Precode (Insurance):</strong> Expand source{" "}
              <M t="K" explanation="k-plus-epsilon" /> to Intermediate <M t="L" /> (adding ~3% structured
              redundancy).
            </li>
            <li>
              <strong>The Fountain (Delivery):</strong> Spray packets generated
              from <M t="L" /> using a fast, sparse code (LT Code).
            </li>
            <li>
              <strong>Decoding Phase 1:</strong> The receiver collects packets
              and uses the fast sparse decoder. It stalls at roughly 97%.
            </li>
            <li>
              <strong>Decoding Phase 2:</strong> The Precode kicks in. Because
              the <J t="intermediate-symbols">Intermediate</J> file has internal
              structure, we can mathematically deduce the missing 3%.
            </li>
          </ol>
          <p>
            We moved the &quot;hard work&quot; from the probabilistic layer (where it costs
            overhead) to a deterministic layer (where it is cheap because the
            missing count is small).
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== INTERMEDIATE SYMBOLS ========== */}
      <section data-section="intermediates">
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white">
            What&rsquo;s Actually Being Solved
          </h2>
          <p>
            One detail that&rsquo;s easy to miss: RaptorQ doesn&rsquo;t directly solve for
            your raw source symbols. It first defines a slightly larger set of{" "}
            <strong>
              <J t="intermediate-symbols">intermediate symbols</J>
            </strong>{" "}
            <M t="C[0],\dots,C[L-1]" />, then constructs equations that let the
            decoder recover those <M t="L" /> unknowns.
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4 mb-10">
            <li>
              <strong>LT constraints (sparse):</strong> the fountain layer
              equations (peel-friendly).
            </li>
            <li>
              <strong><J t="ldpc">LDPC</J> constraints (sparse):</strong> a web
              of cheap &quot;insurance&quot; equations.
            </li>
            <li>
              <strong><J t="hdpc">HDPC</J> constraints (denser):</strong> a
              small set of heavy-hitting equations where{" "}
              <J t="gf256">GF(256)</J> improves rank.
            </li>
          </ul>
          <div className="bg-black/50 border border-white/5 rounded-2xl p-4 md:p-6 overflow-x-auto">
            <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-4">
              A Mental Model (Not Exact RFC Layout)
            </div>
            <pre className="font-mono text-sm text-slate-300 leading-relaxed mb-0">
{`+------------------------------------+
| HDPC constraints (H rows, GF(256))  |
| LDPC constraints (S rows, GF(2))    |
| LT   constraints (~K rows, GF(2))   |
+------------------------------------+
                L unknowns`}
            </pre>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed mt-8">
            Most operations stay XOR-cheap (<J t="gf2">GF(2)</J>). The{" "}
            <J t="gf256">GF(256)</J> part is deliberately isolated: it costs more
            per operation, but it buys you a dramatic reduction in &quot;unlucky&quot; rank
            deficiency.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== TOY WALKTHROUGH ========== */}
      <section data-section="walkthrough">
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white">
            Walkthrough: A Toy Decode
          </h2>
          <p>
            Let&rsquo;s do a complete end-to-end decode in miniature. We&rsquo;ll use{" "}
            <M t="K=4" /> one-byte source symbols <M t="A,B,C,D" />, plus one
            precode parity symbol <M t="P" />. The receiver will <em>never</em>{" "}
            receive <M t="C" /> directly, yet will still reconstruct it.
          </p>
          <p className="rq-sidebar-note">
            This is not the exact RFC 6330 matrix layout. It&rsquo;s the same algebra
            (XOR over <J t="gf2">GF(2)</J>) with small numbers so you can see
            every step.
          </p>

          <ToyDecodeViz />
        </EC>
      </section>

      {/* ========== PEELING & INACTIVATION ========== */}
      <section data-section="peeling">
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white">
            Peeling &amp; Inactivation
          </h2>
          <p>
            We&rsquo;ve solved the overhead problem. Now, how do we solve 50,000
            equations in milliseconds? We use a{" "}
            <strong>
              <J t="peeling-decoder">Peeling Decoder</J>
            </strong>{" "}
            (also known as Belief Propagation). It works like Sudoku.
          </p>
          <p>
            You look for an equation with only <strong>one unknown</strong>. You
            solve it instantly. Then you &quot;peel&quot; that known value out of all other
            equations (by XORing it into them). This might reduce a complex
            equation to a single-unknown equation. The process cascades.
          </p>

          <PeelingViz />

          <p>
            But what if the peeling stalls? What if every remaining equation
            depends on at least 2 unknowns?
          </p>
          <div className="bg-black/50 border border-white/5 rounded-2xl p-4 md:p-6 my-12">
            <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-3">
              A Stuck System (The 2-Core)
            </div>
            <div className="font-mono text-sm text-slate-300 leading-relaxed">
              y₁ = A ⊕ B
              <br />
              y₂ = B ⊕ C
              <br />
              y₃ = C ⊕ D
              <br />
              y₄ = D ⊕ E
              <br />
              y₅ = E ⊕ A
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mt-4 mb-0">
              Five equations, five unknowns, every equation degree-2. No
              equation has a single unknown; peeling can&rsquo;t start. The equations
              form a cycle. This is the{" "}
              <strong>
                <J t="stopping-set">2-core</J>
              </strong>
              , and pure peeling is helpless against it.
            </p>
          </div>
          <p>
            This is where RaptorQ introduces{" "}
            <strong>
              <J t="inactivation-decoding">Inactivation Decoding</J>
            </strong>
            . Instead of giving up, the algorithm picks a variable, marks it as
            &quot;Inactive,&quot; and treats it as a known quantity for now. Suddenly the
            cascade resumes. At the end, only a tiny &quot;core&quot; of Inactive
            variables remains, solved via{" "}
            <J t="gaussian-elimination">Gaussian Elimination</J>.
          </p>
          <div className="bg-black/50 border border-white/5 rounded-2xl p-4 md:p-6 my-12">
            <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-4">
              Inactivation Decoding In 4 Phases
            </div>
            <ol className="list-decimal list-inside space-y-3 text-slate-300 ml-2 text-sm leading-relaxed mb-0">
              <li>
                <strong>Triangulate (Peel):</strong> greedily eliminate degree-1
                checks; this solves the easy majority in linear time.
              </li>
              <li>
                <strong>Inactivate:</strong> when the ripple dies (2-core), pick
                a variable to &quot;park&quot; as unknown and keep peeling around it.
              </li>
              <li>
                <strong>Dense solve:</strong> run Gaussian elimination on the
                inactive core only (this is where the GF(256) insurance matters).
              </li>
              <li>
                <strong>Back-substitute:</strong> push the solved core back into
                the sparse system and finish peeling.
              </li>
            </ol>
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== ENGINEERING TRICKS ========== */}
      <section data-section="engineering">
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white">
            The Engineering Tricks
          </h2>
          <p>
            So we have sparse equations for speed, a precode for the tail, and
            inactivation for stalls. The reason it works in production is the{" "}
            <em>engineering</em> around those ideas.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-12 items-stretch">
            <div className="rq-insight-card !my-0 !bg-slate-900/50 hover:bg-slate-900 transition-colors flex flex-col h-full group">
              <h4 className="text-white font-bold mb-4 text-lg md:text-xl shrink-0 group-hover:text-cyan-400 transition-colors">
                <J t="systematic-encoding">Systematic Encoding</J>
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed flex-1 mb-0">
                The first <M t="K" /> encoding symbols are the source symbols
                themselves. If the channel is clean, the receiver doesn&rsquo;t decode
                at all.
              </p>
            </div>
            <div className="rq-insight-card !my-0 !bg-slate-900/50 hover:bg-slate-900 transition-colors flex flex-col h-full group">
              <h4 className="text-white font-bold mb-4 text-lg md:text-xl shrink-0 group-hover:text-cyan-400 transition-colors">
                One Integer of Metadata
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed flex-1 mb-0">
                A repair packet carries an{" "}
                <strong>
                  <J t="esi">Encoding Symbol ID</J>
                </strong>{" "}
                (ESI). Both sender and receiver run the same deterministic
                generator to reconstruct which symbols were combined.
                Broadcast-friendly, coordination-free.
              </p>
            </div>
            <div className="rq-insight-card !my-0 !bg-slate-900/50 hover:bg-slate-900 transition-colors flex flex-col h-full group">
              <h4 className="text-white font-bold mb-4 text-lg md:text-xl shrink-0 group-hover:text-cyan-400 transition-colors">
                Padding to <M t="K'" />
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed flex-1 mb-0">
                RFC 6330 quietly pads your block from <M t="K" /> to{" "}
                <M t="K'" /> using a lookup table, adding padding symbols that
                are never transmitted. This lets encoder and decoder reuse fixed
                parameters and keeps behavior interoperable.
              </p>
            </div>
            <div className="rq-insight-card !my-0 !bg-slate-900/50 hover:bg-slate-900 transition-colors flex flex-col h-full group">
              <h4 className="text-white font-bold mb-4 text-lg md:text-xl shrink-0 group-hover:text-cyan-400 transition-colors">
                A Degree Table, Not Pure Randomness
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed flex-1 mb-0">
                RFC 6330 hardcodes a degree distribution heavily weighted toward
                low degrees (2 and 3 dominate). The expected LT degree is about{" "}
                <strong>4.8</strong>. With permanently-inactivated symbols, each
                repair symbol touches about <strong>7</strong> intermediates on
                average: constant work per packet.
              </p>
            </div>
            <div className="rq-insight-card !my-0 !bg-slate-900/50 hover:bg-slate-900 transition-colors md:col-span-2 group">
              <h4 className="text-white font-bold mb-4 text-lg md:text-xl group-hover:text-cyan-400 transition-colors">
                Permanent Inactivation
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed mb-0">
                RaptorQ pre-selects a small set of intermediate symbols (the PI
                symbols) to be treated as inactivated from the start. The count
                scales as roughly <M t="\sqrt{'{K}'}" />: for{" "}
                <M t="K = 10{,}000" />, the dense core is about{" "}
                <M t="100 \times 100" />. That&rsquo;s cubic work on a 100-variable
                system, not a 10,000-variable one.
              </p>
            </div>
          </div>

          <div className="bg-black/50 border border-white/5 rounded-2xl p-4 md:p-6 my-10 overflow-x-auto">
            <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-4">
              How One ID Becomes An Equation (Simplified)
            </div>
            <pre className="font-mono text-sm text-slate-300 leading-relaxed mb-0">
{`id  = ESI
isi = id (source), or id + (K' - K) (repair)
d   = degree_from_table(isi)   // mostly 2,3,4...
b,a = tuple_params(isi)        // stepping params

indices = []
for t in 0..d-1:
  indices.push(b)
  b = (b + a) mod L

y = XOR(C[i] for i in indices)`}
            </pre>
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== WHY +2 CHANGES EVERYTHING ========== */}
      <section data-section="plus-two">
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white">
            Why +2 Packets Changes Everything
          </h2>
          <p>
            The RFC 6330 failure rates look almost too good to be true:{" "}
            <M t="\le 1\%" /> at <M t="K'" />, <M t="\le 0.01\%" /> at{" "}
            <M t="K'+1" />, <M t="\le 10^{-6}" /> at <M t="K'+2" />. Two extra
            packets improve reliability by four orders of magnitude?
          </p>
          <p>
            A clean piece of math demystifies the dramatic drop. If you pick a
            random <M t="K \times K" /> matrix over <M t="GF(q)" />, the
            probability it&rsquo;s full rank is:
          </p>
          <MBlock t="P(\text{full rank}) = \prod_{j=1}^{K} \left(1 - q^{-j}\right)" explanation="full-rank-probability" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10 items-stretch">
            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 md:p-6 flex flex-col h-full">
              <h4 className="text-red-300 font-bold mb-3 shrink-0">
                Over <J t="gf2">GF(2)</J>{" "}
                <span className="text-xs font-mono text-red-400 font-normal">(pure XOR)</span>
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed mb-4 flex-1">
                The product converges to about{" "}
                <strong className="text-red-300 font-black">0.289</strong>. That&rsquo;s a ~71%
                chance of failure with exactly <M t="K" /> random binary
                equations.
              </p>
              <p className="text-xs text-slate-500 mb-0 font-mono tracking-tighter shrink-0 border-t border-red-500/10 pt-3">
                <M t="K" /> rows: ~29% success · <M t="K+1" />: ~57% ·{" "}
                <M t="K+2" />: ~78%
              </p>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 md:p-6 flex flex-col h-full">
              <h4 className="text-emerald-300 font-bold mb-3 shrink-0">
                Over <J t="gf256">GF(256)</J>{" "}
                <span className="text-xs font-mono text-emerald-400 font-normal">
                  (byte arithmetic)
                </span>
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed mb-4 flex-1">
                The product converges to about{" "}
                <strong className="text-emerald-300 font-black">0.996</strong>. Nearly full
                rank with exactly <M t="K" /> rows. And each extra row crushes
                failure probability by a factor of <M t="\sim 1/256" />.
              </p>
              <p className="text-xs text-slate-500 mb-0 font-mono tracking-tighter shrink-0 border-t border-emerald-500/10 pt-3">
                <M t="K" /> rows: ~99.6% · <M t="K+1" />: ~99.998% ·{" "}
                <M t="K+2" />: ~99.99999%
              </p>
            </div>
          </div>
          <p>
            This is why RaptorQ uses <J t="gf256">GF(256)</J> for its dense{" "}
            <J t="hdpc">HDPC</J> &quot;insurance&quot; component: the larger field makes
            random coefficient vectors dramatically more independent.
          </p>

          <h3 className="text-lg md:text-xl font-bold text-white mt-12 md:mt-16 mb-6">
            The Composition Trick
          </h3>
          <p>
            The overall overhead of a Raptor-style code is the product of its two
            layers. The <J t="precode">precode</J> adds a small constant expansion{" "}
            <M t="\delta" /> (say, 3%), and the LT layer requires a small extra
            fraction <M t="\epsilon'" /> (say, 2%) to get peeling &quot;close enough.&quot;
            Combined:
          </p>
          <MBlock
            t="K(1+\delta)(1+\epsilon') = K(1 + \delta + \epsilon' + \delta\epsilon') \approx K(1 + 0.05)"
            explanation="composition-overhead"
          />
          <p>
            Both <M t="\delta" /> and <M t="\epsilon'" /> are{" "}
            <strong>constants independent of <M t="K" /></strong>. The{" "}
            <M t="\log K" /> is gone. Raptor codes are provably{" "}
            <strong>universally capacity-achieving</strong> on the binary erasure
            channel: for <em>any</em> erasure rate <M t="q" />, a Raptor code can
            transmit at rate <M t="1 - q - \epsilon" explanation="shannon-capacity" /> for arbitrarily small{" "}
            <M t="\epsilon" />, with linear encoding and decoding time.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== HOW WE GOT HERE ========== */}
      <section data-section="history">
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white">
            How We Got Here
          </h2>
          <p>
            RaptorQ is the polished endpoint of a sequence of tricks that kept
            attacking the same tradeoff: <em>overhead vs. speed</em>.
          </p>
          <div className="mt-10 border-l border-white/10 pl-6 space-y-10">
            {[
              {
                date: "1997",
                title: "Tornado Codes (Luby, Mitzenmacher, Shokrollahi, Spielman)",
                text: "The first linear-time erasure codes, using layered bipartite graph structures with peeling decoders. Fixed-rate, not rateless, but they proved that sparse graph codes could match the performance of dense codes.",
              },
              {
                date: "1998",
                title: "Digital Fountain",
                text: 'Michael Luby founded Digital Fountain around the "fountain" idea: an endless spray of packets so receivers can join late, suffer loss, and still finish without feedback. Qualcomm later acquired the company and its patent portfolio.',
              },
              {
                date: "2002",
                title: "LT Codes (Luby)",
                text: "Sparse XOR equations + a tuned degree distribution so a peeling decoder can run fast. Revolutionary, but the last few symbols still force a non-constant tail overhead.",
              },
              {
                date: "2006",
                title: "Raptor Codes (Shokrollahi)",
                text: '"RAPid TORnado": take the Tornado code architecture and make it fast and rateless. The breakthrough is adding a high-rate precode so the fountain layer only needs to get you "almost there."',
              },
              {
                date: "2011",
                title: "RaptorQ (RFC 6330)",
                text: "RaptorQ is Raptor done as if you cared about finite-length behavior. Systematic encoding, deterministic symbol generation from a single integer ID, permanent inactivation decoding, and a GF(256) HDPC layer.",
              },
            ].map((item) => (
              <div key={item.date}>
                <div className="text-xs text-slate-500 uppercase tracking-widest font-black mb-2">
                  {item.date} · {item.title}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-0 font-light">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== CRYPTOGRAPHIC COUSIN ========== */}
      <section data-section="crypto-cousin">
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white">
            The Cryptographic Cousin
          </h2>
          <p>
            In 1979, Adi Shamir published a scheme for splitting a secret into{" "}
            <M t="N" /> pieces such that any <M t="K" explanation="k-plus-epsilon" /> of them can reconstruct
            the secret, but <M t="K-1" /> pieces reveal <em>absolutely nothing</em>.
            It&rsquo;s called{" "}
            <strong>
              <J t="shamirs-secret-sharing">Shamir&rsquo;s Secret Sharing</J>
            </strong>
            , and if you squint, it&rsquo;s doing the same thing as a fountain code,
            just with a very different goal.
          </p>

          <div className="rq-insight-card">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-6">
              A Concrete Example
            </h3>
            <p className="text-slate-300 mb-4">
              Suppose your secret is a number <M t="S = 42" /> (the combination to
              a vault). You want to split it into 5 shares such that any 3 can
              reconstruct it, but 2 reveal nothing.
            </p>
            <p className="text-slate-300 mb-4">
              Pick a random polynomial of degree <M t="K-1 = 2" />, pinning the
              constant term to your secret:
            </p>
            <div className="bg-black/50 border border-white/5 rounded-2xl p-4 font-mono text-sm text-cyan-400 leading-relaxed mb-6">
              <M t="f(x) = 42 + 7x + 3x^2" explanation="polynomial-secret" />
            </div>
            <p className="text-slate-300 mb-4">
              Evaluate at 5 distinct points to create shares:
            </p>
            <div className="bg-black/50 border border-white/5 rounded-2xl p-4 font-mono text-sm text-slate-300 leading-relaxed mb-6 overflow-x-auto">
              Share 1: <M t="f(1) = 42 + 7 + 3 = 52" />
              <br />
              Share 2: <M t="f(2) = 42 + 14 + 12 = 68" />
              <br />
              Share 3: <M t="f(3) = 42 + 21 + 27 = 90" />
              <br />
              Share 4: <M t="f(4) = 42 + 28 + 48 = 118" />
              <br />
              Share 5: <M t="f(5) = 42 + 35 + 75 = 152" />
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-0 font-serif italic">
              To reconstruct the secret, any 3 people pool their shares and use{" "}
              <strong>Lagrange interpolation</strong> to recover the unique
              degree-2 polynomial. The secret is <M t="f(0) = 42" />.
            </p>
          </div>

          <h3 className="text-lg md:text-xl font-bold text-white mt-12 md:mt-16 mb-6">
            Same Continent, Different Countries
          </h3>
          <p>
            Both Shamir and RaptorQ are solving the same abstract problem with
            the same mathematical tools:
          </p>
          <ul className="list-disc list-inside space-y-3 text-slate-300 ml-4 mb-10 text-base leading-relaxed font-light">
            <li>
              <strong>Linear algebra over finite fields.</strong> Both generate
              redundant linear measurements of unknown data.
            </li>
            <li>
              <strong>Redundancy through structure, not duplication.</strong> The
              polynomial (Shamir) or XOR constraint (RaptorQ) encodes
              relationships, not copies.
            </li>
            <li>
              <strong>Decoding as solving.</strong> Recovery means inverting a
              matrix: Vandermonde for Shamir, sparse + precode for RaptorQ.
            </li>
            <li>
              <strong>&quot;Any <M t="K" /> of <M t="N" />&quot; from rank.</strong>{" "}
              The system is solvable precisely when you have <M t="K" />{" "}
              independent equations.
            </li>
          </ul>

          <div className="flex flex-wrap gap-3 mb-12">
             <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 w-full mb-2">Related Terms:</div>
             <J t="mds">
                <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/10 transition-colors">Maximum Distance Separable</span>
             </J>
             <J t="shamirs-secret-sharing">
                <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/10 transition-colors">Secret Sharing</span>
             </J>
          </div>

          <div className="rq-callout">
            If you understand{" "}
            <J t="shamirs-secret-sharing">Shamir&rsquo;s Secret Sharing</J>, you&rsquo;re
            80% of the way to understanding fountain codes. The leap from
            &quot;secret sharing&quot; to &quot;erasure coding&quot; is smaller than it appears,
            and the bridge is the Rank-Nullity Theorem.
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== COMPARISON TABLE ========== */}
      <section data-section="comparison">
        <EC>
          <h2 className="rq-section-title mb-8 mt-16 text-white">
            RaptorQ vs. The Alternatives
          </h2>
          <p>It helps to see RaptorQ in context.</p>
          <div className="overflow-x-auto my-12 -mx-4 md:mx-0 custom-scrollbar">
            <table className="min-w-[600px] w-full text-sm text-slate-300 border border-white/10 rounded-2xl overflow-hidden">
              <thead className="bg-white/5 text-slate-400 uppercase tracking-widest text-[10px]">
                <tr>
                  <th className="text-left p-3 md:p-4 font-black">Scheme</th>
                  <th className="text-left p-3 md:p-4 font-black">Overhead</th>
                  <th className="text-left p-3 md:p-4 font-black">Speed</th>
                  <th className="text-left p-3 md:p-4 font-black">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  ["Reed-Solomon", "0 (MDS)", "O(K\u00b2)", "Optimal but slow. Fixed-rate."],
                  ["Random Linear", "~0", "O(K\u00b3)", "Theoretically ideal, computationally brutal."],
                  ["LT Codes", "O(\u221aK log\u00b2K)", "O(K log K)", "First practical fountain code."],
                  ["Raptor", "O(1)", "O(K)", "Precode trick eliminates log tax."],
                  ["RaptorQ (RFC 6330)", "+2 symbols", "O(K)", "Production-grade. GF(256) insurance. Near-MDS at finite K."],
                ].map(([scheme, overhead, speed, notes]) => (
                  <tr key={scheme} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 md:p-4 font-bold text-white">{scheme}</td>
                    <td className="p-3 md:p-4 font-mono text-cyan-400">{overhead}</td>
                    <td className="p-3 md:p-4 font-mono">{speed}</td>
                    <td className="p-3 md:p-4 text-slate-400 font-light italic">{notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </EC>
      </section>

      {/* Footer spacing */}
      <div className="h-32" />
    </div>
  );
}
