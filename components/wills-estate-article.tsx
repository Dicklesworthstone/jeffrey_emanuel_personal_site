"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import Image from "next/image";
import illustration from "@/assets/wills_estate_post_illustration.webp";
import {
  Crimson_Pro,
  JetBrains_Mono,
  Bricolage_Grotesque,
} from "next/font/google";
import {
  BookOpen,
  FileDown,
  HandCoins,
  Landmark,
  Sparkles,
} from "lucide-react";
import { MathTooltip } from "./math-tooltip";
import { getJargon } from "@/lib/wills-estate-jargon";
import { getScrollMetrics } from "@/lib/utils";
// Dynamic, SSR-disabled visualizations wrapped in an error boundary
// so a runtime failure in any single chart falls back to a friendly
// placeholder rather than taking down the whole article.
import {
  TierTriageViz,
  DeliverablesTreeViz,
  AntiPatternCardsViz,
  PricingComparisonViz,
  InstallFlowViz,
  WorkingFolderViz,
} from "./viz-error-boundary";

// Fonts — the editorial system shared across this site's long-form articles
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

// Inline jargon component: dotted-underline term that opens a tooltip / bottom sheet
function J({ t, children }: { t: string; children?: ReactNode }) {
  const term = getJargon(t);
  if (!term) return <>{children ?? t}</>;
  return (
    <MathTooltip term={term} mode="text" variant="cyan" simple>
      {children ?? term.term}
    </MathTooltip>
  );
}

// Primer download link constants
const PRIMER_HREF = "/wills-and-estate-planning-primer.md";
const PRIMER_FILENAME = "WILLS_AND_ESTATE_PLANNING_PRIMER.md";
const SKILL_PAGE_HREF =
  "https://jeffreys-skills.md/skills/wills-and-estate-planning-skill";
const JSM_HOME_HREF = "https://jeffreys-skills.md/";
const JSM_DASHBOARD_HREF = "https://jeffreys-skills.md/dashboard";
const CLAUDE_DESKTOP_INSTALL_HREF =
  "https://support.anthropic.com/en/articles/10065433-installing-claude-desktop";
const CODEX_DESKTOP_HREF = "https://openai.com/codex/";

const ARTICLE_SLUG = "wills-and-estate-planning";

function getViewportClass() {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function emitArticleEvent(name: string, props: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (navigator.doNotTrack === "1") return;
  const payload = {
    article_slug: ARTICLE_SLUG,
    viewport_class: getViewportClass(),
    ...props,
  };
  if (process.env.NODE_ENV !== "production") {
    console.info(`[${name}]`, payload);
    return;
  }
  if (typeof window.gtag === "function") {
    window.gtag("event", name, payload);
  }
}

type InstallPathKey = "desktop" | "cli" | "manual";

function MarkdownDownloadButton({ compact = false }: { compact?: boolean }) {
  return (
    <a
      href={PRIMER_HREF}
      download={PRIMER_FILENAME}
      onClick={() => emitArticleEvent("primer_download_clicked")}
      className={`group relative inline-flex items-center gap-4 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-purple-500/10 via-cyan-500/10 to-emerald-500/10 backdrop-blur-xl transition-all hover:border-cyan-400/60 hover:shadow-[0_0_32px_rgba(6,182,212,0.3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
        compact ? "px-4 py-3" : "px-5 py-4 md:px-6 md:py-5"
      }`}
      aria-label="Download the estate-planning primer as Markdown"
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/0 via-cyan-500/0 to-emerald-500/0 group-hover:from-purple-500/10 group-hover:via-cyan-500/10 group-hover:to-emerald-500/10 transition-all pointer-events-none"
      />
      <div className="relative flex h-11 w-11 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:bg-cyan-500/20 group-hover:border-cyan-400/40 transition-colors">
        <FileDown className="w-5 h-5 md:w-6 md:h-6 text-cyan-300" aria-hidden="true" />
      </div>
      <div className="relative text-left min-w-0">
        <p className="text-sm md:text-base font-bold text-white tracking-tight">
          Download the operator primer as Markdown
        </p>
        <p className="text-[11px] md:text-xs text-slate-400 font-mono tracking-wide mt-0.5">
          agent-readable · paste into any fresh session
        </p>
      </div>
      <span className="relative ml-1 md:ml-2 inline-flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/15 px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-cyan-200 shrink-0">
        <FileDown className="w-3 h-3" aria-hidden="true" />
        .md
      </span>
    </a>
  );
}

// Editorial container: 800px centered
function EC({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-[800px] mx-auto px-4 md:px-6 relative z-10">
      {children}
    </div>
  );
}

// Horizontal section divider
function Divider() {
  return (
    <div
      data-section
      className="w-full h-px my-12 md:my-16 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
    />
  );
}

// Code block for multi-line commands / snippets
function Code({ children }: { children: ReactNode }) {
  return (
    <pre className="sm-code-block">
      <code>{children}</code>
    </pre>
  );
}

// Inline monospace snippet
function Mono({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[0.85em] text-cyan-200 bg-cyan-500/10 border border-cyan-500/10 rounded px-1.5 py-[1px] whitespace-nowrap">
      {children}
    </span>
  );
}

// Reference table wrapper
type TableCol = { key: string; label: string; className?: string };
type TableRow = Record<string, ReactNode>;
function RefTable({
  cols,
  rows,
  caption,
}: {
  cols: TableCol[];
  rows: TableRow[];
  caption?: string;
}) {
  return (
    <div className="sm-table-wrap">
      {caption && (
        <p className="px-4 pt-3 pb-1 text-[10px] font-mono uppercase tracking-widest text-slate-500">
          {caption}
        </p>
      )}
      <table className="sm-table">
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c.key} className={c.className}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {cols.map((c) => (
                <td key={c.key}>{r[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Section title helper — renders an H2 with data-anchor id for TOC jumps
function SectionHeader({
  id,
  eyebrow,
  title,
}: {
  id: string;
  eyebrow?: string;
  title: ReactNode;
}) {
  return (
    <div id={id} data-anchor>
      {eyebrow && (
        <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-cyan-400 mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="sm-section-title mb-6 mt-4 text-white">{title}</h2>
    </div>
  );
}

// Subsection heading
function Sub({
  id,
  eyebrow,
  children,
}: {
  id?: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <>
      {eyebrow && (
        <span
          className="sm-subheading-eyebrow"
          id={id}
          {...(id ? { "data-anchor": true } : {})}
        >
          {eyebrow}
        </span>
      )}
      <h3 className="sm-subheading">{children}</h3>
    </>
  );
}

export function WillsEstateArticle() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeInstallPath, setActiveInstallPath] =
    useState<InstallPathKey>("desktop");
  const articleRef = useRef<HTMLDivElement>(null);
  const tocScrollFrameRef = useRef<number | null>(null);
  const tocScrollTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (tocScrollFrameRef.current !== null) {
        window.cancelAnimationFrame(tocScrollFrameRef.current);
      }
      if (tocScrollTimerRef.current !== null) {
        window.clearTimeout(tocScrollTimerRef.current);
      }
    };
  }, []);

  const handleTocJump = (
    event: ReactMouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey ||
      event.shiftKey
    ) {
      return;
    }

    const anchor = document.getElementById(id);
    if (!anchor) return;

    event.preventDefault();
    emitArticleEvent("toc_link_clicked", { anchor_id: id });
    if (tocScrollFrameRef.current !== null) {
      window.cancelAnimationFrame(tocScrollFrameRef.current);
      tocScrollFrameRef.current = null;
    }
    if (tocScrollTimerRef.current !== null) {
      window.clearTimeout(tocScrollTimerRef.current);
      tocScrollTimerRef.current = null;
    }

    window.history.pushState(null, "", `#${id}`);
    anchor.scrollIntoView({ behavior: "auto", block: "start" });

    const deadline = window.performance.now() + 2400;
    const keepAnchorInView = () => {
      if (!anchor.isConnected) return;

      const rect = anchor.getBoundingClientRect();
      const anchorInViewport = rect.bottom > 0 && rect.top < window.innerHeight;
      if (!anchorInViewport) {
        anchor.scrollIntoView({ behavior: "auto", block: "start" });
      }

      if (window.performance.now() >= deadline) {
        tocScrollFrameRef.current = null;
        tocScrollTimerRef.current = null;
        return;
      }

      tocScrollTimerRef.current = window.setTimeout(() => {
        tocScrollFrameRef.current = window.requestAnimationFrame(keepAnchorInView);
      }, 160);
    };

    tocScrollFrameRef.current = window.requestAnimationFrame(keepAnchorInView);
  };

  // Scroll progress bar
  useEffect(() => {
    const handleScroll = () => {
      const { progress } = getScrollMetrics();
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    emitArticleEvent("article_viewed");
    let maxProgress = 0;
    const trackMax = () => {
      const { progress } = getScrollMetrics();
      if (progress > maxProgress) maxProgress = progress;
    };
    window.addEventListener("scroll", trackMax, { passive: true });
    const emitDepth = () => {
      const bucket =
        maxProgress < 0.25 ? "0-25" : maxProgress < 0.5 ? "25-50" : maxProgress < 0.75 ? "50-75" : "75-100";
      emitArticleEvent("article_scroll_depth", { scroll_depth_bucket: bucket });
    };
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") emitDepth();
    });
    window.addEventListener("beforeunload", emitDepth);
    return () => {
      window.removeEventListener("scroll", trackMax);
      window.removeEventListener("beforeunload", emitDepth);
    };
  }, []);

  // Section reveal on scroll
  useEffect(() => {
    const root = articleRef.current;
    if (!root) return;
    const readyClass = "sm-reveal-ready";
    root.classList.add(readyClass);

    const targets = root.querySelectorAll(
      ":scope > section:not(:first-child), :scope > article, [data-section]",
    );

    if (typeof IntersectionObserver === "undefined") {
      targets.forEach((el) => el.classList.add("sm-visible"));
      return () => {
        root.classList.remove(readyClass);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("sm-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -60px 0px" },
    );
    targets.forEach((el) => {
      el.classList.add("sm-fade-section");
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
      role="main"
      className={`sm-scope sm-body ${crimsonPro.variable} ${jetbrainsMono.variable} ${bricolageGrotesque.variable}`}
      style={{ background: "#020204", color: "#f8fafc" }}
      onClick={(e) => {
        const a = (e.target as HTMLElement).closest?.("a[href]") as HTMLAnchorElement | null;
        if (a?.href?.includes("jeffreys-skills.md")) {
          emitArticleEvent("jsm_skill_page_outbound_clicked", { target: a.href });
        }
      }}
    >
      {/* Scroll progress */}
      <div
        className="sm-progress-bar"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      {/* ========== HERO (hgjp.7) ========== */}
      <section
        data-section="hero"
        className="min-h-screen flex flex-col justify-start relative overflow-hidden pb-20 pt-24 md:pt-32"
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(168,85,247,0.08) 0%, rgba(6,182,212,0.05) 45%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full pointer-events-none hidden md:block"
          style={{
            background:
              "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)",
          }}
        />

        <EC>
          <div className="text-center relative z-20">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 mb-10 md:mb-12 px-4 md:px-6 py-2.5 rounded-full border border-white/10 bg-white/5 text-[11px] md:text-[12px] font-mono text-cyan-400 tracking-[0.3em] uppercase backdrop-blur-xl">
              <span
                aria-hidden="true"
                className="w-2 h-2 bg-cyan-400 rounded-full motion-safe:animate-pulse"
              />
              AI Agents · Estate Planning · Skills
            </div>

            {/* Title */}
            <h1 className="sm-display-title mb-6 text-white text-balance">
              An AI Skill for
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 drop-shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                Wills &amp; Estate Planning.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl lg:text-3xl text-slate-400 max-w-3xl mx-auto leading-tight mt-8 md:mt-12 font-light">
              One skill. Twelve axioms. A structured intake that turns a
              chaotic family situation into a handoff packet for attorney
              review.
            </p>

            {/* Illustration */}
            <div className="relative mt-12 md:mt-16 mx-auto max-w-[560px]">
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(6,182,212,0.10) 45%, transparent 70%)",
                  filter: "blur(40px)",
                  transform: "scale(1.2)",
                }}
              />
              <Image
                src={illustration}
                alt="Warmly-lit desk scene with estate-planning documents, a laptop running an AI agent, and a parrot, evoking an estate plan drafted at home with the help of an AI skill"
                className="relative z-10 rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl"
                priority
                placeholder="blur"
              />
            </div>

            {/* Stat chips */}
            <div className="mt-10 md:mt-14 flex flex-wrap justify-center gap-3 md:gap-4">
              {[
                {
                  icon: BookOpen,
                  label: "201 files · 17 subagents · 45 templates",
                  tone: "purple" as const,
                },
                {
                  icon: Landmark,
                  label: "Tier 1 renter → Tier 5 industrialist",
                  tone: "cyan" as const,
                },
                {
                  icon: HandCoins,
                  label: "Works at $500/mo or $500M",
                  tone: "emerald" as const,
                },
              ].map(({ icon: Icon, label, tone }) => (
                <div
                  key={label}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border backdrop-blur-xl text-[11px] font-mono tracking-wide ${
                    tone === "purple"
                      ? "border-purple-500/20 bg-purple-500/5 text-purple-200"
                      : tone === "cyan"
                        ? "border-cyan-500/20 bg-cyan-500/5 text-cyan-200"
                        : "border-emerald-500/20 bg-emerald-500/5 text-emerald-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </EC>

        {/* Scroll indicator */}
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

      <Divider />

      {/* ========== DOWNLOAD CTA (hgjp.8) ========== */}
      <section data-section="download" className="pt-4 pb-8 md:pt-6 md:pb-12">
        <EC>
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-[10px] md:text-[11px] font-mono uppercase tracking-[0.3em] text-slate-500">
              For readers who want to try before subscribing
            </p>
            <MarkdownDownloadButton />
            <p className="text-[11px] md:text-xs text-slate-500 font-mono max-w-[560px] leading-relaxed">
              Paste this into Claude, Codex, or ChatGPT and the agent has
              enough to run a basic estate-planning intake, even without
              subscribing to the full skill.
            </p>
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== INTRO + TOC (hgjp.9) ========== */}
      <section id="intro" data-section="intro" className="pb-10 md:pb-14">
        <EC>
          <p className="sm-drop-cap">
            Almost everyone I know is eventually going to die without a serious
            plan for what happens to their money, their house, their pets, their
            data, or their kids. Some will leave handwritten notes a grieving
            spouse cannot legally execute. Some will leave a{" "}
            <J t="will">will</J> from 2011 that still names an ex. Some will
            leave nothing, and a county court will decide for them. This is not
            because they don&apos;t care. It&apos;s because estate planning is
            expensive, emotionally heavy, and the good lawyers who do it well
            charge five hundred dollars an hour for the parts that are basically
            asking you careful questions and writing down your answers.
          </p>

          <p>
            A few months ago I posted a <J t="skill">skill</J> for tax
            preparation on my paid skills site. At least five readers have since
            told me they saved more than a thousand dollars on their taxes using
            it. One saved twenty thousand. That is on a twenty-dollar-a-month
            subscription. It got me thinking about which other
            expensive-specialist problems look the same shape as tax prep,
            where the billable hours you are paying for are, honestly, mostly
            good questions, patient listening, and a disciplined checklist. The
            replies kept pointing at the same one: writing a will.
          </p>

          <p>
            So I built it, and I went a little further than I meant to. The
            wills-and-estate-planning skill now runs to over two hundred files and
            something like twenty-four thousand lines of text. It has seventeen
            subagents, one hundred thirty-five reference documents covering
            federal and state law through the 2026{" "}
            <J t="obbba">OBBBA</J> exemption changes, and forty-five output
            templates that together describe a structured project directory:
            not a will, a whole estate plan. A will is one document in it.
          </p>

          <p>
            The skill does not replace your attorney. That needs to be explicit,
            because the whole thing is designed to end at one. What it can
            replace is a large chunk of the first fact-finding and
            document-gathering work your attorney would normally bill for
            before they can start drafting. By the time you send them the
            Attorney Engagement Brief the skill produces, the conversation can
            start much closer to drafting than to discovery. That is where much
            of the savings can come from. Exact rates vary wildly by state and
            firm. The point is not a guaranteed number. The point is that you
            can spend a Saturday with your agent and show up to your actual
            lawyer&apos;s office with the packet already organized.
          </p>

          <p>
            The thing I had not appreciated before writing the skill is that
            most estate-plan disasters are not drafting errors. They are
            coordination errors between documents. A beautifully-drafted will
            that says &ldquo;everything to my kids equally&rdquo; does exactly
            nothing if the <J t="401k-spousal-consent">401(k)</J> still names
            the ex-spouse, because retirement accounts pass by contract, not by
            will. Titling, <J t="beneficiary">beneficiary</J> forms,{" "}
            <J t="poa">POAs</J>, healthcare directives, trust funding, and the
            digital inventory of where the{" "}
            <J t="crypto-seed">crypto seed phrase</J> lives have to tell one
            coherent story. If they contradict each other, whichever one has the
            most legal weight wins, and it&apos;s usually the one you forgot to
            update. Catching those mismatches is the skill&apos;s main job.
          </p>

          <p>
            This article is the long-form explanation of how the skill works,
            who it is for, and how you install it without needing to know
            anything about the command line. You sign into{" "}
            <J t="jsm">jeffreys-skills.md</J>, click one button on the skill
            page, and paste one block of text into Claude or Codex Desktop. The
            agent does the rest. If you are already comfortable with a terminal,
            there is a one-line command for you too. If you are not, the next
            ninety seconds are genuinely the whole install.
          </p>

          {/* TOC */}
          <nav className="sm-toc" aria-label="Table of contents">
            <p className="sm-subheading">Contents</p>
            <ol>
              <li>
                <a href="#install" onClick={(event) => handleTocJump(event, "install")}>
                  Install the skill (ninety seconds, no terminal)
                </a>
              </li>
              <li>
                <a href="#who" onClick={(event) => handleTocJump(event, "who")}>
                  Who this is for, and who it isn&apos;t
                </a>
              </li>
              <li>
                <a href="#insight" onClick={(event) => handleTocJump(event, "insight")}>
                  Why a will alone is not the plan
                </a>
              </li>
              <li>
                <a href="#intake" onClick={(event) => handleTocJump(event, "intake")}>
                  The conversation: nine phases of intake
                </a>
              </li>
              <li>
                <a href="#produces" onClick={(event) => handleTocJump(event, "produces")}>
                  Forty-five artifacts you walk away with
                </a>
              </li>
              <li>
                <a href="#workflow" onClick={(event) => handleTocJump(event, "workflow")}>
                  The nine steps, in order
                </a>
              </li>
              <li>
                <a href="#anti" onClick={(event) => handleTocJump(event, "anti")}>
                  Anti-patterns: the parrot, the ex-spouse, the springing POA
                </a>
              </li>
              <li>
                <a href="#attorney" onClick={(event) => handleTocJump(event, "attorney")}>
                  Handing off to a real attorney
                </a>
              </li>
              <li>
                <a href="#faq" onClick={(event) => handleTocJump(event, "faq")}>
                  Questions you are about to ask
                </a>
              </li>
              <li>
                <a href="#pattern" onClick={(event) => handleTocJump(event, "pattern")}>
                  A pattern, not a product
                </a>
              </li>
            </ol>
          </nav>
        </EC>
      </section>

      <Divider />

      {/* ========== SKILL CATALOG CALLOUTS (hgjp.10) ========== */}
      <section data-section="catalog" className="pb-10 md:pb-14">
        <EC>
          <div className="my-5 md:my-6 rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-purple-500/[0.05] via-cyan-500/[0.05] to-emerald-500/[0.05] p-5 md:p-6 backdrop-blur-xl">
            <p className="text-[10px] md:text-[11px] font-mono uppercase tracking-[0.25em] text-cyan-300 mb-3">
              Skill catalog page · opens in a new tab
            </p>
            <ul className="space-y-2.5 text-[13px] md:text-[14px] leading-relaxed">
              <li>
                <a
                  href="https://jeffreys-skills.md/skills/wills-and-estate-planning-skill"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-cyan-300 hover:text-cyan-200 underline decoration-cyan-500/40 underline-offset-4 break-all"
                >
                  jeffreys-skills.md/skills/wills-and-estate-planning-skill
                </a>
                <span className="text-slate-400">
                  {" "}
                  hosts the full <Mono>SKILL.md</Mono>, a live visualization
                  of the architecture, the version history, the release
                  notes, and the &ldquo;Install in Claude or Codex
                  Desktop&rdquo; button.
                </span>
              </li>
            </ul>
            <p className="mt-4 text-[12px] md:text-[13px] text-slate-400 leading-relaxed">
              <strong className="text-amber-200">Heads up:</strong> that URL
              shows a page-not-found screen unless you are signed in to a
              jeffreys-skills.md account with an active subscription. Sign up
              (or log in) at <Mono>jeffreys-skills.md/dashboard</Mono> first.
              It&apos;s the same account the install flow uses, so doing the
              sign-in step now means the install button below will already
              know who you are.
            </p>
          </div>

          <div className="my-5 md:my-6 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.04] via-cyan-500/[0.04] to-emerald-500/[0.04] p-5 md:p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-4">
              <span
                aria-hidden="true"
                className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse"
              />
              <p className="text-[10px] md:text-[11px] font-mono uppercase tracking-[0.25em] text-emerald-300">
                What shipped in the latest release · April 2026
              </p>
            </div>

            <div className="space-y-4 md:space-y-5">
              <div>
                <p className="text-[11px] md:text-[12px] font-mono mb-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-emerald-200">
                    v1
                  </span>
                  <span className="ml-2 text-purple-300 font-semibold">
                    the kernel
                  </span>
                </p>
                <p className="text-[13px] md:text-[14px] text-slate-300 leading-relaxed">
                  Twelve axioms. Fourteen cognitive operators
                  (Probate-Bypass, Spousal-Rights Check, Beneficiary-Title
                  Coherence, Step-Up-vs-Transfer, Liquidity-at-Death,
                  Incapacity-Transition, Lumpy-Asset Division, Cross-State
                  Domicile, Vulnerable-Beneficiary Filter, Tax-Apportionment,
                  Blended-Family QTIP, Disclaimer Window, Trust-Situs
                  Selection, Basis-Consistency). Five wealth tiers routed by
                  net worth with complexity overlays that bump tier
                  regardless.
                </p>
              </div>

              <div>
                <p className="text-[11px] md:text-[12px] font-mono mb-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-emerald-200">
                    v1
                  </span>
                  <span className="ml-2 text-cyan-300 font-semibold">
                    the intake engine
                  </span>
                </p>
                <p className="text-[13px] md:text-[14px] text-slate-300 leading-relaxed">
                  Nine adaptive phases (Orientation → People → Assets →
                  Beneficiary Audit → Family Dynamics → Goals → Incapacity →
                  Jurisdiction → Wealth-Tier Routing). Eight operating modes
                  (<Mono>new-plan</Mono>, <Mono>existing-plan-audit</Mono>,{" "}
                  <Mono>life-event-delta</Mono>,{" "}
                  <Mono>urgent-bedside-signing</Mono>,{" "}
                  <Mono>executor-activation</Mono>,{" "}
                  <Mono>business-owner-succession</Mono>,{" "}
                  <Mono>uhnw-restructure</Mono>,{" "}
                  <Mono>maintenance-review</Mono>). Archetype start packs for
                  the common patterns.
                </p>
              </div>

              <div>
                <p className="text-[11px] md:text-[12px] font-mono mb-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-emerald-200">
                    v1
                  </span>
                  <span className="ml-2 text-emerald-300 font-semibold">
                    the output contract
                  </span>
                </p>
                <p className="text-[13px] md:text-[14px] text-slate-300 leading-relaxed">
                  Two intake files, twenty analyses, twenty-three
                  deliverables, for forty-five structured artifacts in total.
                  The contract is enforced:{" "}
                  <Mono>plan-validator.py</Mono> runs as a backstop that
                  checks for untouched starter outputs and missing
                  coverage-matrix entries.
                </p>
              </div>

              <div>
                <p className="text-[11px] md:text-[12px] font-mono mb-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-emerald-200">
                    v1
                  </span>
                  <span className="ml-2 text-amber-300 font-semibold">
                    seventeen subagents
                  </span>
                </p>
                <p className="text-[13px] md:text-[14px] text-slate-300 leading-relaxed">
                  <Mono>intake-conductor</Mono>,{" "}
                  <Mono>document-organizer</Mono>,{" "}
                  <Mono>asset-discovery-auditor</Mono>,{" "}
                  <Mono>beneficiary-audit</Mono>,{" "}
                  <Mono>anti-pattern-scanner</Mono>,{" "}
                  <Mono>tax-analyzer</Mono>,{" "}
                  <Mono>execution-formalities-router</Mono>,{" "}
                  <Mono>state-law-verifier</Mono>,{" "}
                  <Mono>overlay-resolver</Mono>,{" "}
                  <Mono>fiduciary-bench-builder</Mono>,{" "}
                  <Mono>implementation-ops-planner</Mono>,{" "}
                  <Mono>funding-checklist-generator</Mono>,{" "}
                  <Mono>conflict-prevention-planner</Mono>,{" "}
                  <Mono>litigation-defense-reviewer</Mono>,{" "}
                  <Mono>multi-model-validator</Mono>,{" "}
                  <Mono>deliverables-generator</Mono>, and a
                  meta-coordinator that routes between them.
                </p>
              </div>

              <div>
                <p className="text-[11px] md:text-[12px] font-mono mb-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-emerald-200">
                    v1
                  </span>
                  <span className="ml-2 text-purple-300 font-semibold">
                    the reference corpus
                  </span>
                </p>
                <p className="text-[13px] md:text-[14px] text-slate-300 leading-relaxed">
                  One hundred thirty-five markdown documents across
                  methodology, intake, foundations, family structures,
                  assets, incapacity, advanced planning, tiers, post-death,
                  legacy and logistics, anti-patterns, states, professions,
                  life events, situations, and execution formalities.
                </p>
              </div>

              <div>
                <p className="text-[11px] md:text-[12px] font-mono mb-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-emerald-200">
                    v1
                  </span>
                  <span className="ml-2 text-cyan-300 font-semibold">
                    verification-first discipline
                  </span>
                </p>
                <p className="text-[13px] md:text-[14px] text-slate-300 leading-relaxed">
                  Every recommendation that depends on volatile law (2026{" "}
                  <J t="obbba">OBBBA</J> thresholds, state estate tax rates,
                  execution formalities, <J t="secure-act">Secure Act</J>{" "}
                  beneficiary rules) is checked against primary sources at
                  session time and logged in{" "}
                  <Mono>analyses/official-source-log.md</Mono>. Plans stay
                  auditable.
                </p>
              </div>
            </div>

            <p className="mt-5 text-[11px] md:text-[12px] text-slate-500 leading-relaxed italic">
              The skill page linked above has the full changelog, a live
              visualization of the flow, and the verbatim{" "}
              <Mono>SKILL.md</Mono> the agent loads into its context.
            </p>
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== INSTALL (hgjp.11) ========== */}
      <section data-section="install" className="pb-10 md:pb-14">
        <EC>
          <SectionHeader
            id="install"
            eyebrow="Install"
            title="Get the skill into your agent in 90 seconds."
          />

          <p>
            If you&apos;re not a developer, Path 1 below is the only install
            flow you need. You already have Claude or Codex Desktop installed.
            If you still need the app, start with the official{" "}
            <a
              href={CLAUDE_DESKTOP_INSTALL_HREF}
              className="text-cyan-400 underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Claude Desktop setup page
            </a>{" "}
            or the{" "}
            <a
              href={CODEX_DESKTOP_HREF}
              className="text-cyan-400 underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Codex app page
            </a>
            . Then come back here with a paid <J t="jsm">jeffreys-skills.md</J>{" "}
            subscription. No Homebrew. No YAML. No package-manager archaeology.
          </p>

          <p className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-5 py-4 text-[15px] leading-relaxed text-amber-100">
            This skill is educational planning support, not legal advice. It
            does not create an attorney-client relationship, and a licensed
            estate-planning attorney in your state still needs to review and
            sign the final documents.
          </p>

          <p>
            Three routes exist because readers show up with very different
            setups. Path 1 is the default. Path 2 is for developers who already
            use <Mono>jsm</Mono>. Path 3 exists for restricted laptops and
            weird environments where the agent cannot complete the download
            itself.
          </p>

          <div
            className="mt-8 grid gap-3 md:grid-cols-3"
            role="tablist"
            aria-label="Install paths"
          >
            <article
              className={`rounded-3xl border p-5 md:p-6 backdrop-blur-xl transition-all ${
                activeInstallPath === "desktop"
                  ? "border-cyan-400/60 bg-cyan-500/10 shadow-[0_0_28px_rgba(34,211,238,0.15)]"
                  : "border-white/10 bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-cyan-300">
                  Path 1
                </p>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-emerald-200">
                  Recommended
                </span>
              </div>
              <h3 className="mt-4 text-[1.15rem] font-semibold text-white">
                In Claude or Codex Desktop
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Click <strong>Generate install prompt</strong>, paste once,
                approve one download, and reload skills. This is the no-terminal
                path.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <a
                  href={SKILL_PAGE_HREF}
                  className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/40 bg-cyan-500/15 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition-colors hover:border-cyan-300 hover:bg-cyan-500/25"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open the skill page
                </a>
                <button
                  id="install-tab-desktop"
                  type="button"
                  role="tab"
                  aria-label="In Claude or Codex Desktop"
                  aria-selected={activeInstallPath === "desktop"}
                  aria-controls="install-panel-desktop"
                  tabIndex={activeInstallPath === "desktop" ? 0 : -1}
                  onClick={() => { setActiveInstallPath("desktop"); emitArticleEvent("install_section_cta_clicked", { target: "desktop" }); }}
                  className={`rounded-2xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                    activeInstallPath === "desktop"
                      ? "border-cyan-300/60 bg-white/10 text-white"
                      : "border-white/10 bg-black/20 text-slate-300 hover:border-cyan-400/30 hover:text-white"
                  }`}
                >
                  {activeInstallPath === "desktop"
                    ? "Showing the exact steps"
                    : "Show the exact steps"}
                </button>
              </div>
            </article>

            <article
              className={`rounded-3xl border p-5 md:p-6 backdrop-blur-xl transition-all ${
                activeInstallPath === "cli"
                  ? "border-cyan-400/60 bg-cyan-500/10 shadow-[0_0_28px_rgba(34,211,238,0.15)]"
                  : "border-white/10 bg-white/[0.04]"
              }`}
            >
              <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-cyan-300">
                Path 2
              </p>
              <h3 className="mt-4 text-[1.15rem] font-semibold text-white">
                Via the jsm CLI
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                For developers who already use <Mono>jsm</Mono>. No mystery
                bash block here: you authenticate once, then install the skill
                you actually want.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <a
                  href={JSM_HOME_HREF}
                  className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/40 bg-cyan-500/15 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition-colors hover:border-cyan-300 hover:bg-cyan-500/25"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Install or update jsm
                </a>
                <button
                  id="install-tab-cli"
                  type="button"
                  role="tab"
                  aria-label="Via the jsm CLI"
                  aria-selected={activeInstallPath === "cli"}
                  aria-controls="install-panel-cli"
                  tabIndex={activeInstallPath === "cli" ? 0 : -1}
                  onClick={() => { setActiveInstallPath("cli"); emitArticleEvent("install_section_cta_clicked", { target: "cli" }); }}
                  className={`rounded-2xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                    activeInstallPath === "cli"
                      ? "border-cyan-300/60 bg-white/10 text-white"
                      : "border-white/10 bg-black/20 text-slate-300 hover:border-cyan-400/30 hover:text-white"
                  }`}
                >
                  {activeInstallPath === "cli"
                    ? "Showing the exact steps"
                    : "Show the exact steps"}
                </button>
              </div>
            </article>

            <article
              className={`rounded-3xl border p-5 md:p-6 backdrop-blur-xl transition-all ${
                activeInstallPath === "manual"
                  ? "border-cyan-400/60 bg-cyan-500/10 shadow-[0_0_28px_rgba(34,211,238,0.15)]"
                  : "border-white/10 bg-white/[0.04]"
              }`}
            >
              <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-cyan-300">
                Path 3
              </p>
              <h3 className="mt-4 text-[1.15rem] font-semibold text-white">
                Manual ZIP fallback
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                When the agent-paste flow is blocked by a locked-down machine or
                browser environment, download the signed ZIP and drop it into
                the skill directory yourself.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <a
                  href={SKILL_PAGE_HREF}
                  className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/40 bg-cyan-500/15 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition-colors hover:border-cyan-300 hover:bg-cyan-500/25"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open the ZIP download page
                </a>
                <button
                  id="install-tab-manual"
                  type="button"
                  role="tab"
                  aria-label="Manual ZIP fallback"
                  aria-selected={activeInstallPath === "manual"}
                  aria-controls="install-panel-manual"
                  tabIndex={activeInstallPath === "manual" ? 0 : -1}
                  onClick={() => { setActiveInstallPath("manual"); emitArticleEvent("install_section_cta_clicked", { target: "manual" }); }}
                  className={`rounded-2xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                    activeInstallPath === "manual"
                      ? "border-cyan-300/60 bg-white/10 text-white"
                      : "border-white/10 bg-black/20 text-slate-300 hover:border-cyan-400/30 hover:text-white"
                  }`}
                >
                  {activeInstallPath === "manual"
                    ? "Showing the exact steps"
                    : "Show the exact steps"}
                </button>
              </div>
            </article>
          </div>

          <div className="mt-6">
            <div
              id="install-panel-desktop"
              role="tabpanel"
              aria-labelledby="install-tab-desktop"
              hidden={activeInstallPath !== "desktop"}
              className={`rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.07] via-white/[0.03] to-emerald-500/[0.06] p-5 md:p-6 ${
                activeInstallPath === "desktop" ? "block" : "hidden"
              }`}
            >
              <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-cyan-300">
                Path 1 · in Claude or Codex Desktop
              </p>
              <h3 className="mt-3 text-[1.2rem] font-semibold text-white">
                The whole flow fits in four short steps.
              </h3>
              <ol className="mt-5 space-y-4 text-slate-300">
                <li>
                  <strong>Step 1.</strong> Open{" "}
                  <a
                    href={SKILL_PAGE_HREF}
                    className="text-cyan-400 underline underline-offset-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    jeffreys-skills.md/skills/wills-and-estate-planning-skill
                  </a>{" "}
                  in your browser. Make sure you are signed in. If you see a
                  page-not-found screen, sign in at{" "}
                  <a
                    href={JSM_DASHBOARD_HREF}
                    className="text-cyan-400 underline underline-offset-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    jeffreys-skills.md/dashboard
                  </a>{" "}
                  first and reload.
                </li>
                <li>
                  <strong>Step 2.</strong> Find the card labeled{" "}
                  <strong>Install in Claude or Codex Desktop</strong>. Click{" "}
                  <strong>Generate install prompt</strong>. A textarea appears
                  below the button with a ten-minute countdown
                  (&ldquo;Expires in 9:58&rdquo;). Click <strong>Copy</strong>.
                </li>
                <li>
                  <strong>Step 3.</strong> Open Claude Desktop or Codex
                  Desktop, click in the chat box, paste the prompt, and hit
                  Enter.
                </li>
                <li>
                  <strong>Step 4.</strong> The agent reads the prompt, asks for
                  permission to run one download command, and installs the skill
                  into the right folder. Click <strong>Allow</strong>. Then
                  reload skills. On Claude Desktop that is ⌘-Shift-P →
                  &ldquo;Reload skills&rdquo;; on Codex Desktop, quit and
                  reopen. The skill appears when you type <Mono>/</Mono>.
                </li>
              </ol>
            </div>

            <div
              id="install-panel-cli"
              role="tabpanel"
              aria-labelledby="install-tab-cli"
              hidden={activeInstallPath !== "cli"}
              className={`rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.07] via-white/[0.03] to-emerald-500/[0.06] p-5 md:p-6 ${
                activeInstallPath === "cli" ? "block" : "hidden"
              }`}
            >
              <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-cyan-300">
                Path 2 · via the jsm CLI
              </p>
              <h3 className="mt-3 text-[1.2rem] font-semibold text-white">
                The familiar path for people who already live in the terminal.
              </h3>
              <ol className="mt-5 space-y-4 text-slate-300">
                <li>
                  <strong>Step 1.</strong> Install or update <Mono>jsm</Mono>{" "}
                  from{" "}
                  <a
                    href={JSM_HOME_HREF}
                    className="text-cyan-400 underline underline-offset-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    jeffreys-skills.md
                  </a>{" "}
                  if it is not already on the machine you use for Claude or
                  Codex.
                </li>
                <li>
                  <strong>Step 2.</strong> Run <Mono>jsm login</Mono> once so
                  the CLI is tied to the same paid account you use on the site.
                </li>
                <li>
                  <strong>Step 3.</strong> Run{" "}
                  <Mono>jsm install wills-and-estate-planning-skill</Mono>. The
                  CLI downloads the signed bundle, verifies it, and installs it
                  into <Mono>~/.claude/skills/</Mono> or{" "}
                  <Mono>~/.codex/skills/</Mono> automatically.
                </li>
              </ol>
              <p className="mt-5 text-sm leading-relaxed text-slate-300">
                If Claude&apos;s plugin channel is available in your environment,
                that route is fine too. The important contract is the same: the
                signed bundle still comes from <J t="jsm">jeffreys-skills.md</J>
                .
              </p>
            </div>

            <div
              id="install-panel-manual"
              role="tabpanel"
              aria-labelledby="install-tab-manual"
              hidden={activeInstallPath !== "manual"}
              className={`rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.07] via-white/[0.03] to-emerald-500/[0.06] p-5 md:p-6 ${
                activeInstallPath === "manual" ? "block" : "hidden"
              }`}
            >
              <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-cyan-300">
                Path 3 · manual ZIP fallback
              </p>
              <h3 className="mt-3 text-[1.2rem] font-semibold text-white">
                Use this only when Path 1 cannot complete the download.
              </h3>
              <ol className="mt-5 space-y-4 text-slate-300">
                <li>
                  <strong>Step 1.</strong> Open the same skill page and click{" "}
                  <strong>Download ZIP</strong>. It uses the same signed,
                  single-use install token under the hood.
                </li>
                <li>
                  <strong>Step 2.</strong> Unzip the archive and drag the
                  resulting <Mono>wills-and-estate-planning-skill/</Mono>{" "}
                  folder into the right skills directory:
                  <ul className="mt-3 list-disc pl-6 space-y-2 text-slate-300">
                    <li>
                      macOS / Linux: <Mono>~/.claude/skills/</Mono> for Claude
                      Desktop, <Mono>~/.codex/skills/</Mono> or{" "}
                      <Mono>~/.agents/skills/</Mono> for Codex
                    </li>
                    <li>
                      Windows: <Mono>%USERPROFILE%\.claude\skills\</Mono>,{" "}
                      <Mono>%USERPROFILE%\.codex\skills\</Mono>, or{" "}
                      <Mono>%USERPROFILE%\.agents\skills\</Mono>
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>Step 3.</strong> If you are unsure where that folder
                  lives, use the <strong>Reveal folder</strong> helper on the
                  install card. Then reload skills exactly as in Path 1.
                </li>
              </ol>
            </div>
          </div>

          <div className="sm-insight-card mt-8">
            <p className="text-[11px] font-mono text-purple-300 uppercase tracking-[0.25em] mb-3">
              Why this works without a terminal
            </p>
            <p className="text-base md:text-lg leading-relaxed text-slate-200">
              The agent <em>is</em> the terminal. You never type a command
              yourself; you approve one. The URL embedded in the generated
              prompt is tied to your paid account and expires after roughly ten
              minutes, so copying that prompt onto someone else&apos;s machine
              does not give them a reusable installer.
            </p>
          </div>

          <Sub>If something goes wrong</Sub>

          <ul className="list-disc pl-6 space-y-2 text-slate-300">
            <li>
              <strong>The code expired before I pasted it.</strong> Go back and
              click <strong>Generate install prompt</strong> again. They are
              intentionally short-lived.
            </li>
            <li>
              <strong>The agent refused the download step.</strong> Click
              &ldquo;Allow&rdquo; on the permission dialog. If you denied it by
              mistake, ask the agent to retry.
            </li>
            <li>
              <strong>The skill did not appear in the picker after reload.</strong>{" "}
              Quit and reopen the desktop app once. If it still does not show,
              use Path 3 to confirm the folder landed in the expected skills
              directory.
            </li>
          </ul>
        </EC>
      </section>

      <Divider />

      {/* ========== WHO THIS IS FOR (hgjp.12) ========== */}
      <section data-section="who" className="pb-10 md:pb-14">
        <EC>
          <SectionHeader
            id="who"
            eyebrow="Scope"
            title="Who this is for, and who it isn't."
          />

          <p>
            Most Americans think estate planning is for rich people. It is
            not. It is for anyone who owns anything, cares about anyone,
            or would prefer a county court not decide what happens to
            their children. The skill is specifically designed to scale:
            from a twenty-six-year-old renter with a first job and a
            401(k) through to a hundred-and-fifty-million-dollar
            industrialist with four generations to plan for. The same
            interview adapts to whichever tier actually fits your facts.
          </p>

          <TierTriageViz />

          <p>
            Tap a rung to see the archetype, the primary goals for that
            tier, and the core documents it typically produces.
            Default-selected is Tier 2, the modal American reader
            (homeowner, retirement accounts, minor children), because that
            is who most of you are.
          </p>

          <Sub>What bumps you up a tier, regardless of net worth</Sub>

          <p>
            Complexity sometimes matters more than net worth. The skill
            treats each of the following as a complexity overlay that
            increases the depth of analysis regardless of which tier the
            raw net-worth number puts you in:
          </p>

          <ul className="list-disc pl-6 space-y-2 text-slate-300">
            <li>
              <J t="blended-family">Blended family</J>: stepchildren,
              remarriage, children from prior relationships
            </li>
            <li>
              A non-U.S.-citizen spouse (<J t="qdot">QDOT</J> and treaty
              analysis territory)
            </li>
            <li>A privately-held business or partnership interest</li>
            <li>
              A disabled or vulnerable heir who may need a special-needs
              trust
            </li>
            <li>Assets in multiple states or multiple countries</li>
            <li>
              Specialty items: firearms under the <J t="nfa">NFA</J>,{" "}
              <J t="self-custody">self-custodied crypto</J>,
              creator-economy royalty streams, pre-IPO stock, a
              concentrated position in one company, a known capacity or
              cognition concern
            </li>
          </ul>

          <p>
            Any one of these bumps you up a tier of depth. Two or more and
            you are probably in the Tier 3 or 4 range regardless of what
            your net worth says.
          </p>

          <Sub>Who this is <strong>not</strong> for (honest scope limits)</Sub>

          <ul className="list-disc pl-6 space-y-3 text-slate-300">
            <li>
              <strong>Non-U.S. domiciliaries.</strong> The skill is U.S.
              federal plus all fifty states. If you live outside the U.S.
              and your assets are outside the U.S., this is not the right
              tool for you yet. We can handle a U.S. citizen living abroad
              with U.S. assets; we cannot handle a Singaporean with
              Singaporean property and Singaporean heirs.
            </li>
            <li>
              <strong>People who need a will today.</strong> The skill has
              an <Mono>urgent-bedside-signing</Mono> mode for
              capacity-on-the-clock situations, but for a genuinely acute
              emergency you want a real lawyer on the phone and ideally in
              the room. The right tool for that is your phone, not a
              laptop.
            </li>
            <li>
              <strong>
                People who want a one-page &ldquo;just write my will&rdquo;
                experience.
              </strong>{" "}
              The skill is deliberately thorough, producing forty-five
              artifacts, because coordination across documents is the
              whole point. If all you want is a single cheap will, buy one
              from LegalZoom and close the tab. You are not being served
              by the skill&apos;s depth if depth is not what you need.
            </li>
          </ul>

          <Sub>Who this absolutely is for</Sub>

          <p>
            Anyone with a blended family. Anyone with kids under eighteen.
            Anyone with property in more than one state. Anyone with a
            business, or a substantial stake in one. Anyone who has crypto
            they self-custody. Anyone whose plan was last updated before
            the 2026 <J t="obbba">OBBBA</J>, or before their remarriage,
            or before their move, or before their kid was born. Anyone who
            has been meaning to do this for the last decade and has not.
          </p>

          <p>
            If any of those describe you, the rest of the article is for
            you.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== WHAT THE SKILL PRODUCES (hgjp.15) ========== */}
      <section data-section="produces" className="pb-10 md:pb-14">
        <EC>
          <SectionHeader
            id="produces"
            eyebrow="The output"
            title="Forty-five artifacts you walk away with."
          />

          <p>
            A serious session does not leave you with a pile of loose
            files. It produces a structured project directory:{" "}
            <Mono>my-estate-plan/</Mono> with three subdirectories (
            <Mono>intake/</Mono>, <Mono>analyses/</Mono>,{" "}
            <Mono>deliverables/</Mono>) and forty-five files organized so
            a lawyer, a spouse, or a future version of you can pick up
            where you left off. The skill enforces the structure through a
            coverage matrix it writes at the start of the session and
            updates throughout;{" "}
            <Mono>scripts/plan-validator.py</Mono> runs as a backstop that
            flags untouched starter outputs and missing overlay entries
            before the skill declares the session complete.
          </p>

          <p>What forty-five artifacts, concretely, look like:</p>

          <DeliverablesTreeViz />

          <p>
            Click any file to see what it is and a representative snippet.
            Filter by category (intake, analyses, deliverables) or by
            the operating mode that triggers it.
          </p>

          <Sub>Three deliverables that deserve extra attention</Sub>

          <p>
            Of the forty-five, three are disproportionately important. Any
            serious reader should pay extra attention to these three.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 my-6 md:my-8">
            <div className="rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-cyan-500/[0.05] via-purple-500/[0.04] to-emerald-500/[0.05] p-5 backdrop-blur-xl">
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-300 mb-2">
                Spotlight · day one
              </p>
              <p className="font-mono text-[13px] text-cyan-200 mb-3 break-all">
                if-i-die-tomorrow.md
              </p>
              <p className="text-[13px] md:text-[14px] text-slate-300 leading-relaxed">
                One page. Where every critical document lives. Who to call
                first. A pointer to where passwords and seed phrases are
                stored (never the passwords themselves). The name of the
                lawyer who drafted the plan. This is the page your spouse
                or executor actually opens in the first forty-eight hours
                after a death. Everything else in the packet is for the
                months after.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.05] via-cyan-500/[0.04] to-purple-500/[0.05] p-5 backdrop-blur-xl">
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-emerald-300 mb-2">
                Spotlight · coordination
              </p>
              <p className="font-mono text-[13px] text-emerald-200 mb-3 break-all">
                beneficiary-map.md
              </p>
              <p className="text-[13px] md:text-[14px] text-slate-300 leading-relaxed">
                Every account, every contract, every life-insurance
                policy. Who is currently named. Who should be named. The
                delta. This is the single artifact that catches eighty
                percent of real-world plan failures before they happen. It
                is also the hardest to produce by hand; you have to pull
                up every beneficiary form across every institution, which
                is exactly why the skill&apos;s{" "}
                <Mono>beneficiary-audit</Mono> subagent walks you through
                it.
              </p>
            </div>

            <div className="rounded-2xl border border-purple-500/25 bg-gradient-to-br from-purple-500/[0.05] via-cyan-500/[0.04] to-emerald-500/[0.05] p-5 backdrop-blur-xl">
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-purple-300 mb-2">
                Spotlight · handoff
              </p>
              <p className="font-mono text-[13px] text-purple-200 mb-3 break-all">
                attorney-engagement-brief.md
              </p>
              <p className="text-[13px] md:text-[14px] text-slate-300 leading-relaxed">
                Four pages, structured in the way an estates attorney
                actually wants to read a new client. Your facts, your
                goals in your own words, the design choices the skill
                recommended, the open legal questions the skill could not
                resolve, and the specific state-law items that need
                verification. Hand this to your lawyer and their first
                billable meeting can start in the &ldquo;here are the
                remaining legal questions&rdquo; mode instead of the
                &ldquo;tell me your whole life story from scratch&rdquo;
                mode.
              </p>
            </div>
          </div>

          <p>
            The skill does not sign, witness, notarize, file, or record
            any document. Every path ends at a licensed attorney who does.
            The artifacts make that attorney&apos;s work smaller and their
            billable hours more focused, not optional.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== ANTI-PATTERNS (hgjp.17) ========== */}
      <section data-section="anti" className="pb-10 md:pb-14">
        <EC>
          <SectionHeader
            id="anti"
            eyebrow="What goes wrong"
            title="Anti-patterns: the parrot, the ex-spouse, the springing POA."
          />

          <p>
            Most estate-plan disasters are not exotic. They are one of
            about fifteen patterns the skill is specifically designed to
            catch, and once you know them they are obvious in retrospect.
            The skill runs every plan through them before it hands you
            anything. Here are the ones most worth burning into your
            memory.
          </p>

          <AntiPatternCardsViz />

          <p>
            Each card flips on tap or focus. Front: the pattern name plus
            a one-line hook. Back: what actually goes wrong, the worst
            case, and which subagent the skill uses to catch it. A small
            bit of insider baseball for the curious reader.
          </p>

          <p>
            The skill cannot prevent grief. It cannot change the fact that
            someone you love will die, or that you will. What it can do
            is make sure that on the day that matters most, none of the
            patterns above are live in your plan, and that the people you
            love are not the ones doing the discovering.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== VERIFICATION + ATTORNEY HANDOFF (hgjp.18) ========== */}
      <section data-section="attorney" className="pb-10 md:pb-14">
        <EC>
          <SectionHeader
            id="attorney"
            eyebrow="Handing off"
            title="The attorney still signs the documents."
          />

          <p>
            One of the things that is genuinely hard about estate planning is
            that the law is a moving target. The federal exemption changed
            materially in 2018, changed again in 2026 under the{" "}
            <J t="obbba">OBBBA</J>, and will likely change again. State estate
            tax thresholds drift. State execution formalities (how many
            witnesses, notarization requirements, whether the will can be
            electronic) vary across fifty jurisdictions and some of them have
            updated their rules inside the last three years. The{" "}
            <J t="secure-act">Secure Act</J> and Secure 2.0 rewrote how
            inherited retirement accounts work.{" "}
            <J t="medicaid-lookback">Medicaid lookback</J> periods are
            state-specific and politically volatile.
          </p>

          <p>
            The skill separates two kinds of knowledge. The evergreen
            methodology (the kernel&apos;s twelve axioms, the cognitive
            operators, the tier-routing logic, the coordination discipline)
            is stable. Those are the parts you can trust. The volatile law
            (current thresholds, current formalities, current{" "}
            <J t="portability">portability</J> mechanics, current domicile
            rules) is handled under what the skill calls its{" "}
            <strong>verification-first discipline</strong>. Nothing in that
            category gets treated as final until it has been checked against
            primary sources in the current session. The skill&apos;s output
            contract includes a file called{" "}
            <Mono>official-source-log.md</Mono> in which every live-law lookup
            is recorded with the source URL and the date it was checked. Your
            attorney can audit it. Your future self, doing a plan review in
            2028, can see exactly which pieces of your 2026 analysis need
            rechecking.
          </p>

          <ul className="list-disc pl-6 space-y-2 text-slate-300">
            <li>
              Federal transfer-tax thresholds, annual exclusion amounts, and{" "}
              <J t="portability">portability</J> mechanics
            </li>
            <li>
              State estate-tax and inheritance-tax thresholds, plus domicile
              rules for anyone with assets in more than one jurisdiction
            </li>
            <li>
              Execution formalities: witness counts, notarization, self-proving
              affidavit rules, and whether electronic wills are recognized
            </li>
            <li>
              Spousal-rights questions such as elective share, community
              property, and whether a transfer-on-death or Lady Bird deed is
              even available in the state at issue
            </li>
            <li>
              Volatile edge-case overlays such as{" "}
              <J t="medicaid-lookback">Medicaid lookback</J> windows,
              POLST/MOLST naming, and <J t="nfa">NFA</J> transfer rules
            </li>
          </ul>

          <p>
            That is not scrupulous overkill; it is the only defensible posture
            for an AI-driven tool in a volatile-law domain. If the skill ever
            recommended a strategy that was correct in 2022 but wrong under the
            current year&apos;s law, the result would not be a cute hallucination
            bug. It would be a family losing real money, real time, or both.
            Verification-first is the alternative.
          </p>

          <Sub eyebrow="The handoff">What your attorney receives</Sub>

          <p>
            Every session ends at a licensed estate-planning attorney in your
            state. This is true for the Tier 1 renter with a modest estate and
            it is true for the Tier 5 industrialist. What changes is the size
            of the packet you bring.
          </p>

          <p>
            The skill produces, at minimum, four documents aimed specifically
            at the attorney:
          </p>

          <p>
            An <strong>Attorney Engagement Brief</strong> of about four pages.
            It summarizes your situation, your goals in your own words, the
            design choices the skill recommended, every open legal question the
            skill could not resolve without a lawyer, and the specific
            state-law items that need verification. It is structured to be read
            in ten minutes.
          </p>

          <p>
            A set of <strong>Attorney Interview Questions</strong>: the
            questions you should ask your lawyer on the first call to confirm
            that they are the right fit, are familiar with your state&apos;s
            edge cases, and are not going to drop the ball on one of the
            flagged items. Useful for anyone hiring counsel for the first time.
          </p>

          <p>
            An <strong>Attorney Handoff Readiness</strong> scorecard. The skill
            grades its own output against the question &ldquo;can counsel draft
            efficiently from this packet?&rdquo; before it ever leaves your
            laptop. If the grade comes back yellow or red, the skill flags what
            is missing and loops you back to fix it before you send anything.
          </p>

          <p>
            A <strong>Document Package Index</strong> listing everything the
            attorney will need: your drafts, your supporting financial
            documents, the beneficiary forms you have confirmed, the titling
            records you have pulled. No &ldquo;I think I sent you the deed,
            didn&apos;t I?&rdquo; email chains.
          </p>

          <Sub>The honest framing</Sub>

          <p>
            None of what the skill produces is legal advice. None of it creates
            an attorney-client relationship. None of it can be filed with a
            court or executed without a human lawyer&apos;s involvement. The
            skill does not sign, witness, notarize, or record any document. It
            does not file <J t="form-706">Form 706</J>. It does not transfer
            title to a trust.
          </p>

          <p>
            What it does is make the lawyer&apos;s job smaller. The first
            meeting with an estates attorney for a case like Maya&apos;s is
            often many billable hours of &ldquo;let me understand your life
            before I can draft anything.&rdquo; With the skill&apos;s packet in
            hand, that can become a shorter, more drafting-oriented
            conversation: &ldquo;good, I can draft this, here are the three
            questions I have for you before I start.&rdquo; The savings can be
            meaningful, but they depend on the lawyer, the state, and the
            facts.
          </p>

          <p>
            The skill&apos;s job is to give your attorney the best first
            meeting they have ever had from a new client. Theirs is to sign the
            documents. That is the whole thing.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== COMPARISON TABLE (hgjp.38) ========== */}
      <section data-section="comparison" className="pb-10 md:pb-14">
        <EC>
          <SectionHeader
            id="comparison"
            eyebrow="Vs. form-based tools"
            title="Why not just use LegalZoom?"
          />

          <p>
            The obvious question a serious reader asks at this point is:
            why not just use{" "}
            <a
              href="https://legalzoom.com"
              className="text-cyan-400 underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              LegalZoom
            </a>
            ?{" "}
            <a
              href="https://trustandwill.com"
              className="text-cyan-400 underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Trust &amp; Will
            </a>{" "}
            runs a full estate-plan bundle for a few hundred dollars, flat
            rate.{" "}
            <a
              href="https://rocketlawyer.com"
              className="text-cyan-400 underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Rocket Lawyer
            </a>{" "}
            has a subscription. Both of them are fine for what they do.
            They are not the same kind of thing as this skill and it is
            worth spelling out why.
          </p>

          <RefTable
            cols={[
              { key: "dim", label: "Dimension" },
              {
                key: "them",
                label: "LegalZoom / Trust & Will / Rocket Lawyer",
              },
              { key: "us", label: "wills-and-estate-planning skill" },
            ]}
            rows={[
              {
                dim: <strong>What you get</strong>,
                them: "One document at a time from a form-based intake (a will, a trust, a POA).",
                us: "A coordinated plan: will + trust + beneficiary audit + titling audit + POAs + digital inventory + attorney handoff packet, checked for cross-document coherence.",
              },
              {
                dim: <strong>Coordination across documents</strong>,
                them: "None. Your will is produced in isolation from your 401(k) beneficiary forms, your deeds, or your insurance.",
                us: "The main feature. Catches the 80% of real-world plan failures (mismatched beneficiaries, trusts that were never funded, ex-spouses still on contracts) before they happen.",
              },
              {
                dim: <strong>State-law accuracy</strong>,
                them: "Static templates, often months behind actual law.",
                us: (
                  <>
                    Verification-first against primary sources on every
                    live-law check; logged in{" "}
                    <Mono>official-source-log.md</Mono> per session.
                  </>
                ),
              },
              {
                dim: <strong>Where it ends</strong>,
                them: "The document is the endpoint. If you want an attorney to review, you start over with them.",
                us: "Every session ends at a licensed attorney in your state. Produces an Attorney Engagement Brief designed to reduce redundant intake and make the first billable meeting materially shorter.",
              },
              {
                dim: <strong>What it costs</strong>,
                them: "$79-499 per document, or $100-200/year for a subscription bundle.",
                us: "$20/month, cancel anytime. Over a year, either cost is small, but the output is a different category of thing.",
              },
            ]}
          />

          <p>
            If you rent, have no dependents, own no property, and just want
            a single do-it-yourself will in case of emergency, buy a $79
            will from LegalZoom and move on with your life. It is a better
            use of your money than this skill. The skill earns its keep
            the moment coordination across more than one document starts
            to matter: the blended family, the business interest, the
            second-state property, the vulnerable heir, the concentrated
            stock position, the pet with a longer life expectancy than
            yours. If any two of those describe you, the skill is a much
            better fit than a form-based will generator, and an initial
            consultation with an estates attorney is better than either.
          </p>

          <PricingComparisonViz />
        </EC>
      </section>

      <Divider />

      {/* ========== FAQ (hgjp.37) ========== */}
      <section data-section="faq" className="pb-10 md:pb-14">
        <EC>
          <SectionHeader
            id="faq"
            eyebrow="FAQ"
            title="Questions you are about to ask."
          />

          <details className="sm-details">
            <summary>Is this legal advice?</summary>
            <div className="sm-details-body">
              <p>
                No. The skill produces audit documents, drafts, and a handoff
                packet for your attorney. Your attorney is the one who actually
                advises you, drafts the final documents, and signs off on
                execution. Nothing the skill produces creates an
                attorney-client relationship with anyone.
              </p>
            </div>
          </details>

          <details className="sm-details">
            <summary>Do I still need an attorney?</summary>
            <div className="sm-details-body">
              <p>
                Yes. For anyone with more than a trivial estate, minor
                children, a blended family, a business, disability in the
                family, or unusual circumstances, you want a real attorney.
                The skill can make that attorney&apos;s first meeting more
                efficient and better prepared. It does not replace the
                meeting.
              </p>
            </div>
          </details>

          <details className="sm-details">
            <summary>Is my data private?</summary>
            <div className="sm-details-body">
              <p>
                Yes. The agent runs on your computer, reading files you
                explicitly give it. It does not upload your financial
                documents, your tax returns, or your family history to any
                server. Nothing leaves your laptop except, at your
                direction, the sanitized Attorney Engagement Brief you
                choose to send your lawyer.
              </p>
            </div>
          </details>

          <details className="sm-details">
            <summary>What if I&apos;m not in the United States?</summary>
            <div className="sm-details-body">
              <p>
                The skill is U.S.-only. It covers federal law plus all fifty
                states. If you are a U.S. citizen domiciled abroad with U.S.
                assets, it handles the cross-border overlay. If you are not
                U.S.-domiciled, this is not the right tool for you yet.
              </p>
            </div>
          </details>

          <details className="sm-details">
            <summary>Will the skill work after tax law changes?</summary>
            <div className="sm-details-body">
              <p>
                The skill separates evergreen methodology from volatile law.
                Every federal threshold, state exemption, and execution
                formality is verified against primary sources at the time of
                use and logged in <Mono>official-source-log.md</Mono>. When
                the 2026 <J t="obbba">OBBBA</J> rules change, the skill
                picks up the new numbers. Old plans carry their own
                verification trail so you can see exactly what needs
                re-checking.
              </p>
            </div>
          </details>

          <details className="sm-details">
            <summary>Why a subscription instead of a one-time purchase?</summary>
            <div className="sm-details-body">
              <p>
                Because the thing you are paying for (the living, verified
                set of axioms plus the reference corpus plus the subagents
                plus the updates when the law changes) is not a one-time
                thing. A static PDF of estate-planning templates from three
                years ago is a trap, not a service. Cancel anytime. The
                artifacts you have produced stay on your computer after you
                cancel.
              </p>
            </div>
          </details>

          <details className="sm-details">
            <summary>What if I only need a simple will?</summary>
            <div className="sm-details-body">
              <p>
                If you rent, have no dependents, and the sum of your worldly
                possessions is a car and a laptop,{" "}
                <a
                  href="https://legalzoom.com"
                  className="text-cyan-400 underline underline-offset-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LegalZoom
                </a>{" "}
                or Trust &amp; Will are probably fine for you. The skill
                starts earning its keep once coordination across more than
                one document matters: a blended family, a business, a
                second state, a concentrated stock position, a child with
                special needs, enough savings to cross any state&apos;s
                estate-tax threshold.
              </p>
            </div>
          </details>

          <details className="sm-details">
            <summary>Can I share the skill with my spouse?</summary>
            <div className="sm-details-body">
              <p>
                One subscription per user. Your spouse needs their own,
                which at twenty dollars a month is a reasonable thing to
                ask them for. Every bundle you download is watermarked with
                your account identity, which is mostly honor-system
                deterrence, but it is the honor system.
              </p>
            </div>
          </details>

          <details className="sm-details">
            <summary>What happens when I cancel?</summary>
            <div className="sm-details-body">
              <p>
                You keep everything you have already produced. Your files
                are yours. You lose access to future updates, new versions
                of the skill, and re-downloads on a new computer. If you
                cancel mid-planning, you can finish with the files you
                already have locally.
              </p>
            </div>
          </details>

          <details className="sm-details">
            <summary>Does it work on my phone?</summary>
            <div className="sm-details-body">
              <p>
                Not today. Claude Code Desktop and Codex Desktop are Mac,
                Windows, and Linux. There is no mobile app. You need a
                computer.
              </p>
            </div>
          </details>

          <details className="sm-details">
            <summary>Can my attorney see what the skill produced?</summary>
            <div className="sm-details-body">
              <p>
                Yes, and they should. The Attorney Engagement Brief is
                designed precisely for that handoff. Most attorneys who have
                seen the output say some version of &ldquo;thank god, I
                usually spend my whole first meeting just digging this
                information out of clients.&rdquo;
              </p>
            </div>
          </details>

          <details className="sm-details">
            <summary>What if I start, then lose interest?</summary>
            <div className="sm-details-body">
              <p>
                Your partial <Mono>intake-record.md</Mono> persists. You can
                pick up a week, three months, or a year later. The skill
                has a <Mono>maintenance-review</Mono> mode for periodic
                refresh after life events.
              </p>
            </div>
          </details>

          <details className="sm-details">
            <summary>
              My crypto is self-custodied. You&apos;re not asking me for my
              seed phrase, right?
            </summary>
            <div className="sm-details-body">
              <p>
                Correct. The skill never asks for your seed phrase. The
                digital inventory template has an explicit field that says
                &ldquo;pointer to where the seed phrase is stored; do NOT
                write the seed phrase itself here.&rdquo; If you
                accidentally put it in, the skill flags it and asks you to
                move it out before continuing.
              </p>
            </div>
          </details>

          <details className="sm-details">
            <summary>How long does this actually take?</summary>
            <div className="sm-details-body">
              <p>
                A full first pass is three to six hours, usually spread
                across a weekend rather than done in a single sitting.
                Updates after life events take thirty to sixty minutes. The
                first time is the slow one; everything after is fast.
              </p>
            </div>
          </details>

          <details className="sm-details">
            <summary>
              I&apos;ve never paid for something like this before. What if
              I hate it?
            </summary>
            <div className="sm-details-body">
              <p>
                Email the support address in your account settings. Jeffrey
                reads those emails himself and there is a cheerful refund
                policy. You should not be stuck paying for something that
                did not give you value.
              </p>
            </div>
          </details>
        </EC>
      </section>

      <Divider />

      {/* ========== THE GENERAL PATTERN (closing — hgjp.19) ========== */}
      <section id="pattern" data-section="pattern" className="pb-10 md:pb-14">
        <EC>
          <h2 className="sm-section-title mb-6 mt-4 text-white">
            A pattern, not a product.
          </h2>

          <p>
            Estate planning is one of a small set of problems where the
            judgment-layer professionals are plentiful and well-trained, and
            the billable hours they charge are mostly for asking you good
            questions and writing down your answers. Tax preparation is
            another. Medicare plan selection. Social Security claiming
            strategy. College financial aid optimization. Divorce financial
            planning. Medical bill auditing. Long-term care insurance
            purchase. In every one of these, you are often paying an expert
            for a long initial intake before they can do the part only they can
            do.
          </p>

          <p>
            That shape of problem is exactly what an agent-driven skill can
            compress: the preparation, not the judgment. Your attorney
            still signs. Your CPA still files. Your Medicare broker still
            enrolls you. What changes is that a large share of the
            preparation can happen on your Saturday afternoon at the kitchen
            table with your agent, instead of entirely inside the
            specialist&apos;s intake process.
          </p>

          <p>
            I do not want to overclaim. None of this compresses to zero. A
            good estates attorney or CPA is still worth their fee; you are
            now paying them for the part that is actually them, not for the
            part that was intake. If anything the skill makes your
            professional relationships more efficient, not less necessary.
            A family of modest means with a complicated situation will
            still benefit from an hour of an attorney&apos;s time. A family
            with fifty million dollars and three generations to plan for
            will still need ongoing counsel for the next two decades. The
            skill does not replace any of that. It can make the first meeting
            more useful and shorten some of the work that follows.
          </p>

          <p>
            What it gives you, if you use it well, is two things. Your
            family&apos;s affairs, organized coherently, for maybe the
            first time in your adult life. And a packet an attorney can
            draft against on a much shorter timeline than a cold start.
          </p>

          <p>
            If you have been putting this off for a decade (and
            statistically you probably have), the{" "}
            <a
              href="#install"
              className="text-cyan-400 underline underline-offset-2"
            >
              ninety-second install
            </a>{" "}
            above is the only barrier left.
          </p>

          <p>
            If you want the other concrete proof point for this pattern, start
            at{" "}
            <a
              href="https://jeffreys-skills.md/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 underline underline-offset-2"
            >
              jeffreys-skills.md/dashboard
            </a>{" "}
            and then read{" "}
            <a
              href="/writing/tax_gpt_using_ai_for_tax_prep"
              className="text-cyan-400 underline underline-offset-2"
            >
              the tax-preparation article
            </a>
            . Tax prep was the first place this shape of problem became obvious
            to me; estate planning is the second.
          </p>

          <div className="sm-sign-off">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 via-cyan-500/20 to-emerald-500/20 border border-white/10">
                <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-400">
                  TL;DR
                </p>
                <p className="text-[13px] text-slate-300">
                  Two hundred files of estate-planning judgment. One
                  conversation with your agent. Your attorney still signs.
                  Your spouse can find the 401(k) beneficiary form. Your
                  parrot is provided for.
                </p>
              </div>
            </div>
          </div>
        </EC>
      </section>
    </div>
  );
}
