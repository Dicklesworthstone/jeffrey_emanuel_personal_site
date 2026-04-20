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
  StackViz,
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
const CLAUDE_DESKTOP_INSTALL_HREF = "https://claude.com/download";
const CODEX_DESKTOP_HREF = "https://chatgpt.com/codex";

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
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") emitDepth();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", emitDepth);
    return () => {
      window.removeEventListener("scroll", trackMax);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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
              A structured intake that walks you through the questions a good
              estate-planning attorney would ask, and produces a complete
              document package. Hand it to your attorney for review and
              sign-off, or, if you are willing to skip the lawyer step,
              execute the will the skill generates directly.
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
                  label: "Works at $500K or $500M",
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
          className="mt-12 flex flex-col items-center gap-4 z-20 transition-opacity duration-500 md:absolute md:bottom-16 md:left-0 md:w-full md:mt-0"
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

      {/* ========== INTRO (hgjp.9) ========== */}
      <section id="intro" data-section="intro" className="pb-10 md:pb-14">
        <EC>
          <p className="sm-drop-cap">
            A surprising number of the people I know will eventually die
            without a serious plan for what happens to their money, their
            house, their pets, their data, or their kids. Some will leave
            handwritten notes a grieving
            spouse cannot legally execute. Some will leave a will from 2011 that
            still names an ex. Some will leave nothing, and a county court will
            decide for them. This is not because they don&apos;t care.
            It&apos;s because estate planning is expensive, emotionally heavy,
            and the good lawyers who do it well charge five hundred dollars an
            hour for the parts that are basically asking you careful questions
            and writing down your answers.
          </p>

          <p>
            Before I go further, a note for anyone who has not heard the word
            before: a <em>skill</em> can be thought of as a bundle of
            &ldquo;how to&rdquo; knowledge that is prepared for use by an AI
            agent such as Claude Code or OpenAI&apos;s Codex (yes, both names
            have &ldquo;Code&rdquo; in them; more on that in a moment). It
            combines reference materials, workflows, scripts, subagents, and
            so on, all in a way that is maximally agent-intuitive and
            agent-ergonomic and optimized for context efficiency (at least
            for a well-designed skill, which most are not). The agent loads
            the skill at the start of a session and then behaves like a
            prepared specialist for the rest of that conversation.
          </p>

          <p>
            A quick reassurance before anyone decides this is not for them:
            you are the right reader for this even if you are not a
            programmer and have never opened a terminal. The desktop apps I
            recommend below (Claude Code and Codex Desktop) were originally
            built for software engineers, and the &ldquo;Code&rdquo; in
            those names is a legacy name; nothing you will do in them is
            code-specific. You chat in a text box, drop documents into a
            folder, and approve the occasional file read when the agent
            asks. You will never type a command. You will never see a black
            terminal window. If you can use Gmail and know how to open a
            folder on your computer, you can use this.
          </p>

          <p>
            I recently posted a tax-preparation skill on my paid skills
            site,{" "}
            <a
              href="https://jeffreys-skills.md/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 underline underline-offset-2"
            >
              jeffreys-skills.md
            </a>
            . At least five readers have since told me they saved more than
            a thousand dollars on their taxes using it. One saved twenty
            thousand. That is on a twenty-dollar-a-month subscription. It got
            me thinking about which other expensive-specialist problems look
            the same shape as tax prep, where the billable hours are mostly
            good questions, patient listening, and a disciplined checklist. One
            reply suggested writing a will, and I knew right away it was the
            right answer.
          </p>

          <p>
            So I built it. This article is the long-form explanation of what
            the skill is, what you need to run it, and how a smart
            non-technical reader with three to six hours (across a couple of
            sittings, not a forced marathon) can walk away with an actual
            finished will that is incredibly thoughtful and well-informed and
            custom-tailored to their specific situation, along with the
            polished package an estate-planning attorney actually wants to
            receive if they choose to engage one.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== HOOK + COST TABLE ========== */}
      <section id="cost" data-section="cost" className="pb-10 md:pb-14">
        <EC>
          <SectionHeader
            id="cost-heading"
            eyebrow="The pitch"
            title="One weekend, roughly $120, instead of $20,000."
          />

          <p>
            A full estate-plan consultation with a decent attorney runs
            somewhere between fifteen and twenty-five thousand dollars for a
            household with any real complexity. Most of those hours are not
            the attorney drafting. They are the attorney walking you through
            tradeoffs, asking careful questions, explaining what each option
            actually means, and building the plan one decision at a time. The
            expensive part is the expertise, not the typing.
          </p>

          <p>
            A good agent-plus-skill can do that same work for roughly the cost
            of a nice dinner, across a couple of sittings. The skill arms the
            model with an unbelievably rich framework and reference corpus,
            the same body of material a white-shoe firm&apos;s
            wills-and-trusts division draws on every day, so what you get out
            of the conversation is expert advice custom-tailored to your
            specific situation. You need four things:
          </p>

          <RefTable
            caption="One-month cost to run the whole process"
            cols={[
              { key: "item", label: "What" },
              { key: "price", label: "Price" },
              { key: "note", label: "Notes" },
            ]}
            rows={[
              {
                item: <strong>Claude Max (5x tier)</strong>,
                price: "$100/mo",
                note: "Sign up at claude.ai → Settings → Upgrade. Runs Claude Code, which is where you do the initial deep work. Cancel after the month if you want.",
              },
              {
                item: <strong>GPT Pro</strong>,
                price: "$100/mo",
                note: "Sign up at chatgpt.com. Runs Codex, which is what you use to audit the package Claude produced. Highly recommended to subscribe to both.",
              },
              {
                item: <strong>jeffreys-skills.md</strong>,
                price: "$20/mo",
                note: "Pay with Stripe or PayPal. Install the wills-and-estate-planning skill from the dashboard.",
              },
              {
                item: <strong>Your attorney&apos;s review</strong>,
                price: "$2-4k",
                note: "Strictly optional. If you decide you want a licensed attorney to review and bless the result, the packet the skill produces makes that meeting dramatically shorter and cheaper than starting from scratch.",
              },
            ]}
          />

          <p>
            The recommended setup is both. Do the initial deep work in
            Claude Code with Opus 4.7 at the maximum thinking-effort tier,
            then hand the resulting package to Codex with GPT-5.4 at the
            maximum reasoning-effort tier and ask it to audit what Claude
            produced. The two frontier models do not overlap perfectly; a
            gap one misses the other usually catches. About two hundred
            and twenty dollars for a month of both is the cheapest
            quality insurance you will buy this year, and you can cancel
            either next month. If budget is tight, Claude Max alone is
            enough to produce a real plan. You keep every document the
            skill produces forever.
          </p>

          <p>
            Setting the top reasoning tier takes a moment in each
            desktop app. The controls live right in the message entry
            field. In Codex Desktop, click the{" "}
            <Mono>Select reasoning effort</Mono> control and set it to{" "}
            <Mono>Extra High</Mono>. In Claude Code, pick{" "}
            <Mono>Opus 4.7</Mono> as the model and turn on{" "}
            <Mono>Adaptive Thinking</Mono>. These are the highest
            reasoning tiers each tool exposes as of 2026, and that is
            all it takes.
          </p>

          <p>
            The other thing worth saying about a Claude Max or GPT Pro
            subscription: the wills skill is one of a growing library on
            the skills site. The same setup gives you access to a
            world-class tax consultation for US residents (see{" "}
            <a
              href="https://x.com/doodlestein/status/2043875653951307854"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 underline underline-offset-2"
            >
              my post on that one
            </a>
            ), my modes-of-reasoning skill for pressure-testing any
            project, business plan, or serious decision you are working
            through (see{" "}
            <a
              href="https://x.com/doodlestein/status/2041660563005100220"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 underline underline-offset-2"
            >
              this short post
            </a>
            ), and more than a hundred other skills across different
            specialist domains. The estate plan is one of several reasons
            the subscription pays for itself in the first month.
          </p>

          {/* TOC */}
          <nav className="sm-toc mt-10" aria-label="Table of contents">
            <p className="sm-subheading">Contents</p>
            <ol>
              <li>
                <a href="#cost" onClick={(event) => handleTocJump(event, "cost")}>
                  One weekend, roughly $120, instead of $20,000
                </a>
              </li>
              <li>
                <a href="#what-is-it" onClick={(event) => handleTocJump(event, "what-is-it")}>
                  What is an AI agent, and what is a skill?
                </a>
              </li>
              <li>
                <a href="#setup" onClick={(event) => handleTocJump(event, "setup")}>
                  What you need (twenty minutes of setup)
                </a>
              </li>
              <li>
                <a href="#folder" onClick={(event) => handleTocJump(event, "folder")}>
                  Using the skill: your working folder
                </a>
              </li>
              <li>
                <a href="#tips" onClick={(event) => handleTocJump(event, "tips")}>
                  How to get the most out of it
                </a>
              </li>
              <li>
                <a href="#showcase" onClick={(event) => handleTocJump(event, "showcase")}>
                  What the skill actually does for you
                </a>
              </li>
              <li>
                <a href="#attorney" onClick={(event) => handleTocJump(event, "attorney")}>
                  When (and whether) to involve an attorney
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

      {/* ========== WHAT IS AN AGENT + SKILL ========== */}
      <section id="what-is-it" data-section="what-is-it" className="pb-10 md:pb-14">
        <EC>
          <SectionHeader
            id="what-is-it-heading"
            eyebrow="The basics"
            title="What is an AI agent, and what is a skill?"
          />

          <p>
            If you use AI products at all, you have probably chatted with
            Claude or ChatGPT on the web. Those models are very good, and
            they start from zero every time: fresh session, no memory, no
            idea whether you are asking about quantum physics or your
            divorce.
          </p>

          <p>
            An <strong>agent</strong> is the same frontier model, but given
            a set of tools that let it actually do things on your local
            computer. It can read the files you point it at, edit them,
            save new files, run code, open a browser to check a source,
            and carry a long multi-sitting conversation forward without
            losing the thread. Same model, same reasoning; the difference
            is that it can act on your machine instead of just answering
            one-shot questions in a chat box.
          </p>

          <p>
            A <strong>skill</strong> is a package of domain knowledge and
            workflow that sits alongside the agent and bootstraps it into
            being an expert at exactly one thing. You can think of it as
            hiring an apprentice lawyer who has already read a hundred
            estate-planning textbooks, knows the standard interview
            questions, and will not forget to ask you about the 401(k)
            beneficiary form. When you start a session, the skill quietly
            loads into the agent&apos;s context and says: &ldquo;for the
            next few hours, you are an estate-planning intake specialist;
            here is exactly how to do that job.&rdquo;
          </p>

          <p>
            The division of labor matters. The frontier model is clever.
            The skill is disciplined. Your job is just to answer good
            questions honestly. The skill makes sure the agent asks the
            right ones, cross-checks the answers, catches contradictions,
            and produces a complete, signable document package at the
            quality level a top estate-planning firm would put its name
            on.
          </p>

          <p>
            The whole complexity lives inside the skill. You do not have to
            understand <J t="revocable-trust">revocable trusts</J>,{" "}
            <J t="poa">POAs</J>, or the 2026 <J t="obbba">OBBBA</J>{" "}
            exemption to use it. You have to know the names of your family
            members, roughly what you own, and where the important documents
            live. The skill handles the rest, and flags anything it is
            genuinely unsure about so you (or an attorney, if you choose
            to involve one) can verify before anything gets signed.
          </p>

          <div className="my-8 w-full lg:relative lg:left-1/2 lg:my-10 lg:w-[min(calc(100vw-48px),1200px)] lg:-translate-x-1/2">
            <StackViz />
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== SETUP (hgjp.11) ========== */}
      <section id="setup" data-section="setup" className="pb-10 md:pb-14">
        <EC>
          <SectionHeader
            id="setup-heading"
            eyebrow="Setup"
            title="What you need, in about twenty minutes."
          />

          <p>
            Four things, in order. Each one takes two to five minutes.
            Twenty minutes total, and you only pay for things you are going
            to keep anyway.
          </p>

          <ol className="mt-6 space-y-6 text-slate-300">
            <li>
              <p className="text-base md:text-lg">
                <strong className="text-white">1. A frontier-model subscription.</strong>
              </p>
              <p className="mt-2 leading-relaxed">
                Go to{" "}
                <a
                  href="https://claude.ai"
                  className="text-cyan-400 underline underline-offset-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  claude.ai
                </a>{" "}
                → Settings → Upgrade → Max 5x ($100/mo). Or{" "}
                <a
                  href="https://chatgpt.com"
                  className="text-cyan-400 underline underline-offset-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  chatgpt.com
                </a>{" "}
                → Upgrade → Pro ($100/mo). Both work. The recommended
                setup is to subscribe to both and use Claude Code for the
                initial deep work plus Codex for the audit pass; if
                budget is tight, Claude Max alone is the cheaper
                starting point. Pay by card. Cancel next month. No
                long-term contract.
              </p>
            </li>

            <li>
              <p className="text-base md:text-lg">
                <strong className="text-white">2. The desktop app (free).</strong>
              </p>
              <p className="mt-2 leading-relaxed">
                For Claude, download{" "}
                <a
                  href={CLAUDE_DESKTOP_INSTALL_HREF}
                  className="text-cyan-400 underline underline-offset-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Claude Code Desktop
                </a>{" "}
                (Mac or Windows). For OpenAI, download{" "}
                <a
                  href={CODEX_DESKTOP_HREF}
                  className="text-cyan-400 underline underline-offset-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Codex Desktop
                </a>
                . Sign in with the same account from step 1. This is the app
                the agent lives in. It can open folders on your computer and
                read the documents you drop into them.
              </p>
            </li>

            <li>
              <p className="text-base md:text-lg">
                <strong className="text-white">3. A jeffreys-skills.md account ($20/mo).</strong>
              </p>
              <p className="mt-2 leading-relaxed">
                Go to{" "}
                <a
                  href={JSM_HOME_HREF}
                  className="text-cyan-400 underline underline-offset-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  jeffreys-skills.md
                </a>{" "}
                → Sign up → pay with Stripe or PayPal. Same cancel-anytime
                rules. Same &ldquo;you keep the documents&rdquo; rules.
              </p>
            </li>

            <li>
              <p className="text-base md:text-lg">
                <strong className="text-white">4. Install the skill.</strong>
              </p>
              <p className="mt-2 leading-relaxed">
                From the jeffreys-skills.md dashboard, open the{" "}
                <a
                  href={SKILL_PAGE_HREF}
                  className="text-cyan-400 underline underline-offset-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  wills-and-estate-planning skill
                </a>{" "}
                page (the link only works once you are signed in with an
                active subscription from step 3; otherwise it bounces to
                the login screen). Click{" "}
                <strong>Generate install prompt</strong>. Copy
                the block of text it gives you. Paste that block into your
                desktop app&apos;s chat box. Press enter. The agent reads it,
                asks you to approve one download, installs itself, and
                reloads. Ninety seconds.
              </p>
            </li>
          </ol>

          <div className="my-8 w-full lg:relative lg:left-1/2 lg:my-10 lg:w-[min(calc(100vw-48px),1200px)] lg:-translate-x-1/2">
            <InstallFlowViz />
          </div>

          <div className="sm-insight-card mt-8">
            <p className="text-[11px] font-mono text-purple-300 uppercase tracking-[0.25em] mb-3">
              Why it works without a terminal
            </p>
            <p className="text-base md:text-lg leading-relaxed text-slate-200">
              The agent is the terminal. You never type a command; you
              approve one. The install prompt the dashboard generates is
              tied to your paid account and expires after roughly ten
              minutes, so copying it to someone else&apos;s machine does
              not give them a reusable installer.
            </p>
          </div>

          <p className="mt-6 text-[13px] md:text-sm text-slate-400">
            <strong>Comfortable in a terminal?</strong> You can install via
            the <Mono>jsm</Mono> CLI instead:{" "}
            <Mono>jsm install wills-and-estate-planning-skill</Mono> after{" "}
            <Mono>jsm login</Mono>. Same signed bundle, same outcome.
            Everyone else should stick with the desktop-app flow above.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== WORKING FOLDER ========== */}
      <section id="folder" data-section="folder" className="pb-10 md:pb-14">
        <EC>
          <SectionHeader
            id="folder-heading"
            eyebrow="Using the skill"
            title="Make a folder, put documents in it, start the conversation."
          />

          <p>
            Once the skill is installed, the whole workflow is:
            one folder, one conversation, as many sittings as you need.
            The agent remembers what you told it between sessions because
            everything it writes lands in that folder.
          </p>

          <ol className="mt-6 space-y-6 text-slate-300">
            <li>
              <p className="text-base md:text-lg">
                <strong className="text-white">1. Make a new folder on your computer.</strong>
              </p>
              <p className="mt-2 leading-relaxed">
                Anywhere is fine. Your desktop, your Documents folder,
                wherever. Call it something you will recognize later.{" "}
                <Mono>my-estate-plan</Mono> is a reasonable default. This is
                where everything will live: your input documents, the
                drafts the skill produces, and the final packet (which
                you can execute yourself or hand to an attorney if you
                want one in the loop).
              </p>
            </li>

            <li>
              <p className="text-base md:text-lg">
                <strong className="text-white">
                  2. Drop every document that matters into the folder.
                </strong>
              </p>
              <p className="mt-2 leading-relaxed">
                Messy is fine. The skill will organize it. The documents
                can be PDFs, Microsoft Word files, or even photos or
                scans of paper pages; the skill will read all of them.
                What you want in there: last year&apos;s tax return, a
                statement from each
                brokerage / 401(k) / IRA / bank account, current beneficiary
                designations on retirement accounts and life insurance, any
                existing will or trust (even if it is old or wrong), deeds,
                titles, and vehicle registrations, your passport for
                identity reference, and a short list of the bank and crypto
                accounts you have. Do not put your{" "}
                <J t="crypto-seed">crypto seed phrase</J> itself in the
                folder; a pointer to where it is stored is enough.
              </p>
            </li>

            <li>
              <p className="text-base md:text-lg">
                <strong className="text-white">
                  3. Open the folder in Claude Code or Codex Desktop.
                </strong>
              </p>
              <p className="mt-2 leading-relaxed">
                Launch the desktop app. File → Open Folder → pick the folder
                you just made. The agent is now pointed at it and can read
                any document you drop in.
              </p>
            </li>

            <li>
              <p className="text-base md:text-lg">
                <strong className="text-white">4. Start the conversation.</strong>
              </p>
              <p className="mt-2 leading-relaxed">
                In the chat box, type:{" "}
                <em>
                  &ldquo;please use the wills-and-estate-planning skill to
                  help me draft an estate plan&rdquo;
                </em>{" "}
                and press enter. The skill loads. The agent asks its first
                question. Answer honestly.
              </p>
            </li>

            <li>
              <p className="text-base md:text-lg">
                <strong className="text-white">5. Answer its questions.</strong>
              </p>
              <p className="mt-2 leading-relaxed">
                It will ask about the people in your life, what you own,
                what you owe, who is currently named on each beneficiary
                form, what you actually want to happen, and what keeps you
                up at night. Take breaks whenever you need to; close the
                app and come back tomorrow if you want. The agent remembers
                the state of the conversation because the files it is
                writing are all in your folder.
              </p>
            </li>
          </ol>

          <div className="my-8 w-full lg:relative lg:left-1/2 lg:my-10 lg:w-[min(calc(100vw-48px),1200px)] lg:-translate-x-1/2">
            <WorkingFolderViz />
          </div>

          <div className="mt-10 rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-6 md:p-8">
            <p className="text-[11px] font-mono text-cyan-300 uppercase tracking-[0.25em] mb-3">
              What a session actually feels like
            </p>
            <p className="text-sm md:text-base leading-relaxed text-slate-300 mb-6">
              Two composite exchanges (invented details, real question
              pattern) that show the rhythm: the agent asks a specific
              question, you answer honestly, and it flags the landmine you
              would not have known to look for.
            </p>

            <div className="space-y-5">
              <div className="rounded-xl border border-white/5 bg-black/20 p-4 md:p-5">
                <p className="text-[10px] font-mono text-amber-300 uppercase tracking-widest mb-3">
                  Exchange 1 · the stale beneficiary form
                </p>
                <p className="text-sm md:text-[15px] leading-relaxed text-slate-300 mb-2">
                  <strong className="text-white">Agent:</strong> When did
                  you last update the beneficiary forms on your retirement
                  accounts?
                </p>
                <p className="text-sm md:text-[15px] leading-relaxed text-slate-300 mb-2">
                  <strong className="text-white">You:</strong> When I
                  started the job, so... 2009? I think I put my ex-wife
                  down on the IRA. That was before I met Sam.
                </p>
                <p className="text-sm md:text-[15px] leading-relaxed text-slate-300">
                  <strong className="text-white">Agent:</strong> That is a
                  landmine. Beneficiary forms override your will for
                  retirement accounts, and whoever is named on the form at
                  the time of your death is who gets the money. For the
                  IRA, it is whatever the form says, full stop. The 401(k)
                  has some federal-law protection for your current spouse
                  by default, but the details depend on whether Sam ever
                  signed a spousal consent. Every retirement form needs to
                  be re-verified; we are flagging this as a first-action
                  item so it gets fixed before you sign anything (and if
                  you do decide to loop in an attorney, it is already at
                  the top of the Attorney Engagement Brief).
                </p>
              </div>

              <div className="rounded-xl border border-white/5 bg-black/20 p-4 md:p-5">
                <p className="text-[10px] font-mono text-amber-300 uppercase tracking-widest mb-3">
                  Exchange 2 · the blended-family default
                </p>
                <p className="text-sm md:text-[15px] leading-relaxed text-slate-300 mb-2">
                  <strong className="text-white">Agent:</strong> Walk me
                  through your current marriage and the kids from your
                  first marriage. How do you picture it all working
                  together?
                </p>
                <p className="text-sm md:text-[15px] leading-relaxed text-slate-300 mb-2">
                  <strong className="text-white">You:</strong> I&apos;d
                  leave everything to my wife and trust her to take care
                  of my two kids from my first marriage.
                </p>
                <p className="text-sm md:text-[15px] leading-relaxed text-slate-300">
                  <strong className="text-white">Agent:</strong> That is
                  the most common blended-family pattern, and the most
                  common one to go sideways. If you leave everything to
                  her outright, she can later rewrite her own will and
                  leave it all to her daughter from her first marriage;
                  your kids end up with nothing and have very limited
                  recourse. The usual structure that fixes this is a{" "}
                  <J t="qtip">QTIP trust</J>: your wife gets the income
                  from the assets for her whole life; whatever remains at
                  her death goes to your kids, not to whoever she names
                  in her own will. Should we draft that structure into
                  the plan, or did you want something different?
                </p>
              </div>
            </div>
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== TIPS ========== */}
      <section id="tips" data-section="tips" className="pb-10 md:pb-14">
        <EC>
          <SectionHeader
            id="tips-heading"
            eyebrow="Getting the most out of it"
            title="A few things that actually matter."
          />

          <p>
            Short list. These are the tips that separate a good first
            pass from a great final package.
          </p>

          <ul className="list-disc pl-6 space-y-3 text-slate-300 mt-4">
            <li>
              <strong>Run the skill at least twice.</strong> Treat the first
              session as the rough draft. Start a second session in the same
              folder a day later and say &ldquo;audit the estate-planning
              packet you produced last time.&rdquo; The skill will review
              its own work, catch missing facts, and flag weak spots.
              Almost everyone finds something important on the second pass.
            </li>
            <li>
              <strong>If you have both Claude Max and GPT Pro, use both.</strong>{" "}
              Open the folder in Claude Code, run through the skill there.
              Then open the same folder in Codex Desktop and run it again.
              The two frontier models do not overlap perfectly: Claude often
              surfaces family-dynamics and emotional-coordination issues
              earlier; GPT often surfaces cold tax and structural issues
              earlier. Compare the two packets. Merge the best of each.
            </li>
            <li>
              <strong>
                When it asks something you don&apos;t know, say so.
              </strong>{" "}
              &ldquo;I don&apos;t know&rdquo; and &ldquo;I need to check
              with my spouse&rdquo; and &ldquo;I need to look that up&rdquo;
              are good answers. The skill will explain the question, tell
              you why it matters, and re-ask once you have the information.
              Pretending to be certain when you are not is how mistakes
              get baked into estate plans.
            </li>
            <li>
              <strong>It is fine to not have every document ready.</strong>{" "}
              When the skill asks for something you cannot put your hands on
              in the next ten minutes, tell it{" "}
              <em>&ldquo;I don&apos;t have that right now.&rdquo;</em> The
              session continues. When you find the document a day later,
              drop it into the folder, open a new sitting, and say
              something like{" "}
              <em>
                &ldquo;I found the 401(k) statement; please re-check
                whatever you flagged about beneficiaries.&rdquo;
              </em>{" "}
              Nothing is blocked by a single missing document; the skill
              notes what is still unanswered and will revisit it when you
              come back.
            </li>
            <li>
              <strong>Save the final packet in your folder.</strong> It
              is yours. If you decide to engage an attorney, email them
              the Attorney Engagement Brief plus whichever supporting
              documents they ask for. Either way, keep the folder itself
              backed up somewhere sane, the same way you would keep your
              tax returns.
            </li>
          </ul>
        </EC>
      </section>

      <Divider />

      {/* ========== WHAT THE SKILL DOES (compressed showcase) ========== */}
      <section id="showcase" data-section="showcase" className="pb-10 md:pb-14">
        <EC>
          <SectionHeader
            id="showcase-heading"
            eyebrow="What you get"
            title="What the skill actually does for you."
          />

          <p>
            Four things the skill handles automatically, without your
            having to think about them or understand the mechanics.
          </p>

          <Sub>1. It auto-adjusts to your complexity.</Sub>

          <p>
            The skill scales from a twenty-six-year-old renter with a
            first 401(k) through to a hundred-million-dollar industrialist
            with four generations to plan for. Same interview; different
            depth. Tap a rung below to see which tier matches your facts.
            A blended family, a business stake, self-custodied crypto, or
            a second-state property bumps you a tier regardless of net
            worth.
          </p>

          <div className="my-8 w-full lg:relative lg:left-1/2 lg:my-10 lg:w-[min(calc(100vw-48px),1200px)] lg:-translate-x-1/2">
            <TierTriageViz />
          </div>

          <Sub>2. It catches the mistakes that wreck most plans.</Sub>

          <p>
            Most estate-plan disasters are not exotic. They are a
            handful of patterns the skill runs every plan through before
            it hands you anything: the 401(k) that still names an
            ex-spouse, the trust that was drafted but never funded, the
            springing POA that does not trigger when you need it, the
            pet with a longer life expectancy than yours. Tap a card to
            see what actually goes wrong and which subagent catches it.
          </p>

          <div className="my-8 w-full lg:relative lg:left-1/2 lg:my-10 lg:w-[min(calc(100vw-48px),1200px)] lg:-translate-x-1/2">
            <AntiPatternCardsViz />
          </div>

          <Sub>3. You walk away with a real document package.</Sub>

          <p>
            A serious session produces a structured project directory
            with roughly forty-five files, one per template the skill
            carries, organized so you, your spouse, or a future version
            of you (or an attorney, if you decide to involve one) can
            pick up where you left off. Intake files, analyses, draft
            documents, and an Attorney Engagement Brief structured to
            top-firm standards in case you want a human review.
          </p>

          <div className="my-8 w-full lg:relative lg:left-1/2 lg:my-10 lg:w-[min(calc(100vw-48px),1200px)] lg:-translate-x-1/2">
            <DeliverablesTreeViz />
          </div>

          <Sub>4. The math versus a cold-start attorney consult.</Sub>

          <p>
            Attorney rates and timelines vary. The point is the order of
            magnitude. Slide the net-worth bar and toggle the complexity
            overlays to see a rough estimate of what an attorney
            would quote for a comparable cold-start consultation versus
            what this skill costs you in a month.
          </p>

          <div className="my-8 w-full lg:relative lg:left-1/2 lg:my-10 lg:w-[min(calc(100vw-48px),1200px)] lg:-translate-x-1/2">
            <PricingComparisonViz />
          </div>

          <p>
            The comparison is a rough guide, not a legal fee quote.
            Exact quotes vary by state, firm, and facts. The skill
            subscription is the real number. The attorney number is the
            rough order of magnitude you are skipping past by showing up
            already prepared.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== VERIFICATION + ATTORNEY HANDOFF (hgjp.18) ========== */}
      <section id="attorney" data-section="attorney" className="pb-10 md:pb-14">
        <EC>
          <SectionHeader
            id="attorney-heading"
            eyebrow="The optional handoff"
            title="Using an attorney is strictly optional."
          />

          <p>
            Estate-planning law is a moving target. The federal exemption
            changed in 2018, changed again in 2026 under the{" "}
            <J t="obbba">OBBBA</J>, and will likely change again. State
            thresholds drift. Execution formalities vary across fifty
            jurisdictions. The skill separates the evergreen methodology
            it trusts in full from the volatile law it has to re-verify at
            session time; every live-law lookup is logged in{" "}
            <Mono>official-source-log.md</Mono> with source URL and date,
            so you can audit what the skill relied on (and hand that
            audit trail to an attorney too, if you bring one in) and your
            future self can see what needs rechecking.
          </p>

          <p>
            The expertise itself lives in the skill. It brings the same
            framework, checklists, and reference material a white-shoe
            firm&apos;s wills-and-trusts division would apply to a client
            in your situation, and it works through that material
            carefully, case by case, against your specific facts. What
            you walk away with is a complete package: a finished will,
            the supporting documents, an{" "}
            <strong>Attorney Engagement Brief</strong> of about four
            pages for the case where you do want a second opinion, a set
            of <strong>Interview Questions</strong> ready for that
            meeting, a <strong>Handoff Readiness</strong> scorecard the
            skill runs on its own output before anything leaves your
            laptop, and a <strong>Document Package Index</strong> so
            nothing is lost. The skill does not itself sign, notarize,
            or file anything, and it does not form an attorney-client
            relationship; the execution formalities (witnesses,
            sometimes a notary) are on you or on whatever attorney you
            choose to engage.
          </p>

          <p>
            Most readers find that a straightforward will produced by
            the skill stands on its own. Readers with genuinely
            complicated situations often still want a short attorney
            review, and the packet is designed to make that review a
            ninety-minute sign-off rather than a fifteen-thousand-dollar
            intake. Either way, the expert analysis is already done by
            the time you close the laptop.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== FAQ (hgjp.37) ========== */}
      <section id="faq" data-section="faq" className="pb-10 md:pb-14">
        <EC>
          <SectionHeader
            id="faq-heading"
            eyebrow="FAQ"
            title="Questions you are about to ask."
          />

          <details className="sm-details">
            <summary>Is this legal advice?</summary>
            <div className="sm-details-body">
              <p>
                Not in the formal legal sense. The skill produces audit
                documents, a complete plan, and the full set of drafts.
                Using the skill does not create an attorney-client
                relationship with anyone, and the skill itself is not a
                law firm. If you want formal legal advice from a licensed
                professional, engage an attorney; if you choose not to,
                the documents are still yours to execute under your
                state&apos;s formalities.
              </p>
            </div>
          </details>

          <details className="sm-details">
            <summary>Do I still need an attorney?</summary>
            <div className="sm-details-body">
              <p>
                Not strictly. The skill produces a thorough,
                custom-tailored plan built on the same kind of analysis a
                white-shoe firm&apos;s wills-and-trusts division would
                apply, and for many readers that is enough. If your case
                has real complications (minor children, a blended family,
                a business, a special-needs beneficiary, unusual assets,
                or property across multiple states), having a licensed
                attorney review the packet is cheap insurance, and the
                packet is designed to make that review short. An attorney
                is recommended but not required.
              </p>
            </div>
          </details>

          <details className="sm-details">
            <summary>Is my data private?</summary>
            <div className="sm-details-body">
              <p>
                Your files stay on your computer. The agent reads documents
                you explicitly point it at; it does not upload them to any
                remote storage, and nothing the skill produces leaves your
                folder unless you choose to send it.
              </p>
              <p className="mt-3">
                What does go to Anthropic or OpenAI is the conversation
                itself: your questions, the agent&apos;s responses, and
                whatever the agent quotes from your files while reasoning.
                On consumer subscriptions (Claude Max, GPT Pro), transcripts
                are retained per each provider&apos;s published policy.
                Training defaults and opt-outs differ between providers and
                change over time; Anthropic does not train on Claude
                Max/Pro conversations by default, while OpenAI&apos;s
                consumer plans have historically opted users in unless you
                turn training off in settings. Check your account&apos;s
                privacy settings before doing sensitive work. Both
                providers offer enterprise plans with zero-retention if
                you need stronger guarantees.
              </p>
              <p className="mt-3">
                For most readers planning for themselves, this is a
                reasonable tradeoff: the same tradeoff you make every time
                you type something into ChatGPT or Claude. If you are a
                lawyer, doctor, or business owner planning around
                professionally-confidential material, talk to your attorney
                about whether your specific situation warrants an
                enterprise plan or a different tool. See the next question
                for the narrower but important topic of{" "}
                <em>attorney-client privilege</em>.
              </p>
            </div>
          </details>

          <details className="sm-details">
            <summary>
              Does using an AI skill waive attorney-client privilege?
            </summary>
            <div className="sm-details-body">
              <p>
                Short answer: AI chatbots are not attorneys, so
                conversations with them are not themselves privileged, and
                at least one recent New York case has held that discussing
                otherwise-privileged legal matters with a consumer-grade AI
                can forfeit the privilege you would have had in a
                conversation with a human lawyer on the same subject. The
                law here is new and under-developed, and I personally
                think it is outrageous that a human lawyer gets privilege
                on the same conversation an AI does not; that should
                change. Today, it has not.
              </p>
              <p className="mt-3">
                For most readers using this skill to prepare a
                simple-to-moderate estate plan, this is a non-issue: you
                are not hiring a lawyer in the first place. The skill
                produces the plan; the output is your property; you
                execute the documents under your state&apos;s formalities.
                If you do loop in an attorney for the parts that only
                humans can do (deathbed witnessing, contested estates,
                certain international filings), the packet is designed
                to make that short.
              </p>
              <p className="mt-3">
                If you are a high-net-worth or ultra-high-net-worth
                testator and you think your estate might be contested,
                take this seriously. The skill&apos;s intake architecture
                (detailed interview, intake record, decision ledger, letter
                of wishes) inadvertently builds exactly the kind of
                contemporaneous record a contest lawyer would love to see.
                The skill will, at the end of a session, offer to delete
                every intermediate work product from your working folder
                and clear the session history once you confirm you have
                saved the final document somewhere safe; those files are
                your property to destroy, and doing so is not spoliation
                of evidence since no litigation is pending. Your attorney
                may additionally want any further work to run under an
                enterprise plan with zero-retention or under their direct
                supervision so that the process is papered properly from
                the start.
              </p>
              <p className="mt-3">
                For bedside or deathbed drafting of a high-stakes will,
                use a lawyer, not this skill. The drafting attorney is the
                single most important future witness to testator capacity,
                and that is not a role an agent can fill.
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
            <summary>Can I use this for my spouse too?</summary>
            <div className="sm-details-body">
              <p>
                Yes. You can run the skill a second time in the same
                session, reusing the working folder, and ask it to
                generate the parallel set of documents for your
                spouse. Most household facts (assets, kids, state of
                residence) are identical, so the second pass is
                faster than the first.
              </p>
              <p>
                The license covers your own household: you and your
                spouse, under one subscription. It does not cover
                sharing or redistributing the skill files to anyone
                else. The skill content is copyrighted and licensed
                for personal use the same way a piece of software is,
                so please do not post, resell, or hand the files to a
                friend. If a friend wants to use it, point them at the
                skills site.
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
                Not today. Claude Code Desktop and Codex Desktop run on Mac
                or Windows. There is no mobile app. You need a computer.
              </p>
            </div>
          </details>

          <details className="sm-details">
            <summary>Can I share what the skill produced with an attorney?</summary>
            <div className="sm-details-body">
              <p>
                Yes. The Attorney Engagement Brief is designed precisely
                for that handoff if you decide to engage one. Most
                attorneys who have seen the output say some version of
                &ldquo;thank god, I usually spend my whole first meeting
                just digging this information out of clients.&rdquo;
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
            Estate planning is one of a handful of expensive-by-default life
            admin domains where the professional is plentiful and
            well-trained, and most of the hours they bill for are actually
            just asking you careful questions and writing your answers down.
            Tax preparation is another. Medicare plan selection. Social
            Security claiming strategy. College financial aid. Divorce
            financial planning. Medical bill auditing. Long-term-care
            insurance. In every one of these, you pay an expert for a long
            initial intake before they can do the part only they can do.
          </p>

          <p>
            That shape of problem is exactly what an agent-plus-skill
            can compress and, in many cases, fully replace. Frontier
            models in 2026 are that good. Agent harnesses are that
            capable. Marry them with a skill that is comprehensive,
            correct, well-conceived, and deliberately optimized for
            agent use, and the combination can replace the specialist
            outright across a surprising range of situations, at a
            quality level that holds up against what a top firm would
            produce.
          </p>

          <p>
            The caveat is the skill. A generic chatbot with a vague
            prompt does not produce this result. The skill is where the
            expertise is encoded: the frameworks a top firm uses
            internally, the checklists, the decision trees, the edge
            cases, the ugly special situations, the questions that
            actually matter, the references that ground the reasoning.
            Get that part right, and the frontier model plus agent
            harness does the rest. Get it wrong, and what you get back
            is shallow, generic, and not worth trusting.
          </p>

          <p>
            This is the shape of a lot of what is coming. The older
            view was that AI assists the professional. What is actually
            happening, for a broad category of professional work that
            is mostly careful intake, pattern-matching, and disciplined
            drafting, is that AI running the right skill replaces the
            professional entirely. For the cases where a licensed human
            still has to sign something personally, you hand them a
            finished, audited packet. For the many cases where no
            signature is legally required, you skip that step and keep
            the money.
          </p>

          <p>
            If you want the other concrete proof point, the{" "}
            <a
              href="/writing/tax_gpt_using_ai_for_tax_prep"
              className="text-cyan-400 underline underline-offset-2"
            >
              tax-preparation article
            </a>{" "}
            is the first place this pattern became obvious to me. Estate
            planning is the second. If you have a frontier-model
            subscription already, the only real barrier to trying this
            one yourself is the{" "}
            <a
              href="#setup"
              onClick={(event) => handleTocJump(event, "setup")}
              className="text-cyan-400 underline underline-offset-2"
            >
              twenty minutes of setup
            </a>{" "}
            above.
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
                  One skill. One weekend. Roughly $120. Attorney optional.
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
