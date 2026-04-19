"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
// import Image from "next/image";
import {
  Crimson_Pro,
  JetBrains_Mono,
  Bricolage_Grotesque,
} from "next/font/google";
import {
  BookOpen,
  FileDown,
  HandCoins,
  HeartPulse,
  Landmark,
  ScrollText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
// TODO: uncomment when hero illustration lands (hgjp.2)
// import illustration from "@/assets/wills_estate_post_illustration.webp";
import { MathTooltip } from "./math-tooltip";
import { getJargon } from "@/lib/wills-estate-jargon";
import { getScrollMetrics } from "@/lib/utils";

// Dynamic import visualizations (no SSR — they use browser APIs / framer-motion)
const TierTriageViz = dynamic(
  () =>
    import("./wills-estate-visualizations").then((m) => ({
      default: m.TierTriageViz,
    })),
  { ssr: false },
);
const AxiomCoherenceViz = dynamic(
  () =>
    import("./wills-estate-visualizations").then((m) => ({
      default: m.AxiomCoherenceViz,
    })),
  { ssr: false },
);
const IntakePhasesViz = dynamic(
  () =>
    import("./wills-estate-visualizations").then((m) => ({
      default: m.IntakePhasesViz,
    })),
  { ssr: false },
);
const DeliverablesTreeViz = dynamic(
  () =>
    import("./wills-estate-visualizations").then((m) => ({
      default: m.DeliverablesTreeViz,
    })),
  { ssr: false },
);
const AntiPatternCardsViz = dynamic(
  () =>
    import("./wills-estate-visualizations").then((m) => ({
      default: m.AntiPatternCardsViz,
    })),
  { ssr: false },
);

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

function MarkdownDownloadButton({ compact = false }: { compact?: boolean }) {
  return (
    <a
      href={PRIMER_HREF}
      download={PRIMER_FILENAME}
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
        <FileDown className="w-5 h-5 md:w-6 md:h-6 text-cyan-300" />
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
        <FileDown className="w-3 h-3" />
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

// ─────────────────────────────────────────────────────────────
// Suppress unused-variable warnings for helpers that downstream
// beads will use when filling in section stubs.
// ─────────────────────────────────────────────────────────────
void J;
void MarkdownDownloadButton;
void EC;
void Divider;
void Code;
void Mono;
void RefTable;
void SectionHeader;
void Sub;
void TierTriageViz;
void AxiomCoherenceViz;
void IntakePhasesViz;
void DeliverablesTreeViz;
void AntiPatternCardsViz;
void BookOpen;
void HandCoins;
void HeartPulse;
void Landmark;
void ScrollText;
void ShieldCheck;
void Sparkles;

export function WillsEstateArticle() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const articleRef = useRef<HTMLDivElement>(null);

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
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
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
              {/* TODO: body from hgjp.7 — subtitle, illustration, stat chips */}
              One skill. Twelve axioms. A structured intake that turns a
              chaotic family situation into an attorney-ready handoff package.
            </p>

            {/* TODO: hero illustration from hgjp.2 + hgjp.7 */}
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== DOWNLOAD CTA (hgjp.8) ========== */}
      <section data-section="download" className="pb-10 md:pb-14">
        <EC>
          {/* TODO: body from hgjp.8 — download-the-primer CTA section */}
          <MarkdownDownloadButton />
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
            expensive-specialist problems look the same shape as tax prep —
            where the billable hours you are paying for are, honestly, mostly
            good questions, patient listening, and a disciplined checklist. The
            replies kept pointing at the same one: writing a will.
          </p>

          <p>
            So I built it, and I went a little further than I meant to. The
            wills-and-estate-planning skill now runs to two hundred files and
            something like twenty-four thousand lines of text. It has seventeen
            subagents, one hundred thirty-five reference documents covering
            federal and state law through the 2026{" "}
            <J t="obbba">OBBBA</J> exemption changes, and forty-five output
            templates that together describe a structured project directory —
            not a will, a whole estate plan. A will is one document in it.
          </p>

          <p>
            The skill does not replace your attorney. That needs to be explicit,
            because the whole thing is designed to end at one. What it does
            replace is the first eight to fifteen hours of billable time your
            attorney would normally spend understanding your life before they
            can start drafting. By the time you send them the Attorney
            Engagement Brief the skill produces, they can go from reading to
            drafting in a single sitting. That is where the savings come from.
            Sullivan &amp; Cromwell&apos;s rate for an initial estates
            consultation is a closely-guarded secret they will tell you only
            after you make an appointment. You don&apos;t have to call them.
            You can spend a Saturday with your agent and show up to your actual
            lawyer&apos;s office with the packet already done.
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
            <h3>Contents</h3>
            <ol>
              <li>
                <a href="#install">
                  Install the skill (ninety seconds, no terminal)
                </a>
              </li>
              <li>
                <a href="#who">
                  Who this is for, and who it isn&apos;t
                </a>
              </li>
              <li>
                <a href="#insight">Why a will alone is not the plan</a>
              </li>
              <li>
                <a href="#intake">
                  The conversation: nine phases of intake
                </a>
              </li>
              <li>
                <a href="#produces">
                  Forty-five artifacts you walk away with
                </a>
              </li>
              <li>
                <a href="#workflow">The nine steps, in order</a>
              </li>
              <li>
                <a href="#anti">
                  Anti-patterns: the parrot, the ex-spouse, the springing POA
                </a>
              </li>
              <li>
                <a href="#attorney">Handing off to a real attorney</a>
              </li>
              <li>
                <a href="#faq">Questions you are about to ask</a>
              </li>
              <li>
                <a href="#pattern">A pattern, not a product</a>
              </li>
            </ol>
          </nav>
        </EC>
      </section>

      <Divider />

      {/* ========== SKILL CATALOG CALLOUTS (hgjp.10) ========== */}
      <section data-section="catalog" className="pb-10 md:pb-14">
        <EC>
          {/* TODO: body from hgjp.10 — jsm.md links + what shipped in latest release */}
          <span />
        </EC>
      </section>

      <Divider />

      {/* ========== INSTALL (hgjp.11) ========== */}
      <section id="install" data-section="install" className="pb-10 md:pb-14">
        <EC>
          <SectionHeader
            id="install"
            eyebrow="Install"
            title="Ninety seconds, no terminal."
          />

          <p>
            If you&apos;re not a developer, this is the only install path you
            need to read. You already have Claude or Codex Desktop installed
            (if you don&apos;t, the download links for both are at the bottom
            of this section). You have a paid{" "}
            <J t="jsm">jeffreys-skills.md</J> subscription. That is it. No
            command line, no Homebrew, no package managers, no YAML files.
          </p>

          <Sub eyebrow="Path 1">
            In Claude or Codex Desktop (recommended)
          </Sub>

          <p>
            The whole flow fits in three clicks and one paste.
          </p>

          <p>
            <strong>Step 1.</strong> Open{" "}
            <a
              href="https://jeffreys-skills.md/skills/wills-and-estate-planning-skill"
              className="text-cyan-400 underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              jeffreys-skills.md/skills/wills-and-estate-planning-skill
            </a>{" "}
            in your browser. Make sure you are signed in — the skill page
            returns a 404 if you are not. If you see a 404, sign in at the
            dashboard first and reload.
          </p>

          <p>
            <strong>Step 2.</strong> On the right side of the skill page, find
            the card labeled <strong>Install in Claude or Codex Desktop</strong>.
            Click the blue <strong>Generate install prompt</strong> button. A
            block of text appears in a textarea below the button, along with a
            countdown (&ldquo;Expires in 9:58&rdquo;). Click{" "}
            <strong>Copy</strong> to the right of the textarea.
          </p>

          <p>
            <strong>Step 3.</strong> Open Claude Desktop or Codex Desktop.
            Click in the chat input at the bottom. Paste the text with ⌘-V (or
            Ctrl-V on Windows). Hit Enter.
          </p>

          <p>
            <strong>Step 4.</strong> The agent will read the prompt, show you a
            &ldquo;Would you like to allow this command?&rdquo; dialog (for the
            download), click <strong>Allow</strong>. Thirty seconds pass. The
            agent will tell you the skill has been installed and ask you to
            reload skills. On Claude Desktop that is ⌘-Shift-P →
            &ldquo;Reload skills&rdquo;; on Codex Desktop, quit and reopen.
            The skill will appear when you type <Mono>/</Mono> in the prompt.
          </p>

          <p>
            That is the whole install. The URL embedded in the prompt is a
            one-time token bound to your paid account and valid for ten
            minutes, so even if you paste the prompt into someone else&apos;s
            computer it will not work for them. If the code expires before you
            get to pasting it, just click <strong>Generate install prompt</strong>{" "}
            again.
          </p>

          {/* TODO: install screencast embed from hgjp.40 */}

          <Sub eyebrow="Path 2">From the terminal (power users)</Sub>

          <p>
            If you are comfortable with a command line:
          </p>

          <Code>
{`# macOS / Linux
curl -fsSL https://jeffreys-skills.md/install.sh | bash

# Windows (PowerShell as Admin)
irm https://jeffreys-skills.md/install.ps1 | iex

jsm login
jsm install wills-and-estate-planning-skill`}
          </Code>

          <p>
            That path authenticates via an OAuth hand-off to your browser
            session, installs the skill into your agent&apos;s skills directory
            (<Mono>~/.claude/skills/</Mono> or <Mono>~/.codex/skills/</Mono>),
            and is done in about the same time as Path 1. Power users may
            prefer it. Everyone else should ignore it.
          </p>

          <Sub eyebrow="Path 3">Direct download (if both above fail)</Sub>

          <p>
            For the small number of readers on restricted corporate laptops or
            in environments where the agent can&apos;t be trusted to run a
            download command, there is a direct{" "}
            <strong>Download ZIP</strong> button on the same install card. Same
            single-use token under the hood. Unzip the file and drag the
            resulting folder into:
          </p>

          <ul className="list-disc pl-6 space-y-1 text-slate-300">
            <li>
              macOS / Linux: <Mono>~/.claude/skills/</Mono> (for Claude
              Desktop) or <Mono>~/.codex/skills/</Mono> (for Codex Desktop)
            </li>
            <li>
              Windows: <Mono>%USERPROFILE%\.claude\skills\</Mono> or{" "}
              <Mono>%USERPROFILE%\.codex\skills\</Mono>
            </li>
          </ul>

          <p>
            A <strong>Reveal folder</strong> helper next to the button opens
            Finder or Explorer pointing at the right directory. After dragging,
            reload skills in the app as in Step 4 above.
          </p>

          <Sub>If something goes wrong</Sub>

          <ul className="list-disc pl-6 space-y-2 text-slate-300">
            <li>
              <strong>The code expired before I pasted it.</strong> Click{" "}
              <strong>Generate install prompt</strong> again. They&apos;re
              cheap.
            </li>
            <li>
              <strong>The agent refused the download step.</strong> Click
              &ldquo;Allow&rdquo; on the permission dialog; it only asks once
              per session. If you clicked Deny by mistake, ask the agent to try
              again.
            </li>
            <li>
              <strong>
                The skill did not appear in the picker after reload.
              </strong>{" "}
              Quit and reopen the desktop app. If it still doesn&apos;t show,
              use Path 3 to verify the skill folder is present at the expected
              path. If it is present but not loading, email support with the
              correlation ID shown on the install card.
            </li>
          </ul>
        </EC>
      </section>

      <Divider />

      {/* ========== WHO THIS IS FOR (hgjp.12) ========== */}
      <section id="who" data-section="who" className="pb-10 md:pb-14">
        <EC>
          <SectionHeader
            id="who"
            eyebrow="Audience"
            title="Who this is for"
          />
          {/* TODO: body from hgjp.12 — tier-triage text + TierTriageViz */}
        </EC>
      </section>

      <Divider />

      {/* ========== CORE INSIGHT (hgjp.13) ========== */}
      <section id="insight" data-section="insight" className="pb-10 md:pb-14">
        <EC>
          <SectionHeader
            id="insight"
            eyebrow="The thesis"
            title="Why a will alone is not the plan."
          />

          <p>
            The most common failure mode in estate planning is not a drafting
            mistake. It is incoherence between documents. A
            beautifully-written <J t="will">will</J> that says
            &ldquo;everything to my kids equally&rdquo; does exactly nothing if
            the <J t="401k-spousal-consent">401(k)</J> still names the
            ex-spouse, because retirement accounts pass by contract, not by
            will. The plan administrator has a statutory duty to pay whoever is
            on the <J t="beneficiary">beneficiary</J> form. Your will never
            enters the conversation.
          </p>

          <p>
            This is Axiom 0 of the skill, and it is the source of more
            real-world family catastrophe than any handwritten error clause.
            Your will does not control the whole estate. Retirement accounts,
            life insurance, annuities, <J t="tod-deed">TOD</J> and POD
            accounts, survivorship-titled real estate, trust-owned assets, and
            property subject to buy-sell agreements pass by contract or by
            title. The will touches everything else.
          </p>

          <Sub eyebrow="Axiom 1">One coherent story</Sub>

          <p>
            What follows from Axiom 0 is Axiom 1, which is what the skill is
            really organized around. Every document in the plan has to tell the
            same story. Your will, your{" "}
            <J t="revocable-trust">revocable trust</J> (if you have one), your
            beneficiary forms on every retirement account and insurance policy,
            your deed titling on every piece of property, your durable and
            healthcare <J t="poa">POAs</J>, your letter of instruction, and
            your digital inventory — all of them have to point at the same
            people, in the same shares, under the same contingencies, under the
            same state&apos;s law. Silos produce the deepest failures, and most
            plans have silos.
          </p>

          <p>
            Imagine you die tonight. Your spouse, who is already grieving, has
            to locate and call about eight institutions inside of seven days to
            begin paperwork: your 401(k) administrator, two IRA custodians,
            your life-insurance company, your county&apos;s register of deeds,
            your bank, your brokerage, and the{" "}
            <J t="guardian">guardian</J> you named for your kids. Each
            institution will ask a slightly different question. Each will accept
            a slightly different document as proof. The skill&apos;s main job
            is to make sure that the answer they get from your paperwork, and
            the answer from the one you told at the kitchen table, line up — so
            your spouse is not spending six months learning{" "}
            <J t="probate">probate</J> law at the worst possible time.
          </p>

          <AxiomCoherenceViz />

          <p>
            Toggle the diagram between coherent and incoherent mode. In the
            first, every spoke shows the same person inheriting each asset
            class, through whichever document controls it. In the second, three
            spokes turn red: the 401(k) still names your ex-spouse, the house
            is jointly titled with an estranged sibling, and the crypto wallet
            has no pointer in the digital inventory. None of these
            contradictions would be caught by even a well-drafted will. They
            get caught by the coordination check the skill runs across every
            document in your plan.
          </p>

          <Sub eyebrow="Axioms 2, 5, 10">
            Three more that are load-bearing
          </Sub>

          <p>
            There are eleven axioms in the skill&apos;s kernel; I will not list
            all of them here. But three more are load-bearing and worth naming.
          </p>

          <p>
            <strong>Axiom 2 — plan for incapacity first, death second.</strong>
            {" "}Dementia, stroke, coma, and severe mental illness affect more
            families than sudden death does, and they last longer. The default
            incapacity package is a <J t="durable-poa">durable financial
            POA</J>, a <J t="healthcare-proxy">healthcare POA</J>, a{" "}
            <J t="living-will">living will</J>, and a{" "}
            <J t="hipaa">HIPAA authorization</J>. For anyone with property,
            throw in a funded revocable trust. If you only plan for death and
            ignore incapacity, you have planned for maybe half the realistic
            scenarios.
          </p>

          <p>
            <strong>
              Axiom 5 — under the 2026 fifteen-million exemption, basis often
              dominates tax.
            </strong>
            {" "}Most families are below the federal estate tax threshold and
            have no good reason to gift appreciated assets out of the estate
            during their lifetime. Doing so trades the{" "}
            <J t="step-up-basis">step-up in basis</J> at death — which is
            free — for a transfer-tax saving the estate would not have owed in
            the first place. A surprising number of expensive estate plans
            written between 2017 and 2022 still live by the old playbook of
            aggressive lifetime gifting. Under current law, that is often
            actively wrong.
          </p>

          <p>
            <strong>
              Axiom 10 — communication is the actual work.
            </strong>
            {" "}Legal documents are the deliverable. Family conversations are
            the plan. Surprise at the reading of the will is one of the fastest
            ways to turn a workable plan into a multi-year lawsuit between
            siblings. The skill produces an &ldquo;Ethical Will&rdquo;
            template, a Letter of Wishes, and a Family Meeting Agenda
            specifically for this reason, and grades the plan lower if these
            are missing.
          </p>

          <p>
            If you leave this article having internalized nothing else, let it
            be Axiom 1. The plan is the whole story. The will is one chapter.
            Read every document you have against that standard, and most of you
            will find at least one mismatch waiting for the worst possible day.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== SAMPLE SESSION / INTAKE (hgjp.14) ========== */}
      <section id="intake" data-section="intake" className="pb-10 md:pb-14">
        <EC>
          <SectionHeader
            id="intake"
            eyebrow="A sample session"
            title="What it actually feels like, hour by hour."
          />

          <p>
            What a session with the skill actually looks like is best explained
            through one. Maya is fifty-four, remarried four years ago, and has
            the kind of life estate planners politely describe as
            &ldquo;fact-patterned.&rdquo; Her first marriage produced two adult
            children; her husband Karl has a daughter from his first marriage
            who lives with them half the time. One of Maya&apos;s kids, Theo,
            is two years into recovery from heroin addiction and doing well.
            Maya and Karl own a primary residence in Westchester County, New
            York, and a small condo in Palm Beach, Florida, that Maya inherited
            from her mother. Karl has a 4% stake in a Series-B SaaS company he
            advises. Maya has a small Bitcoin{" "}
            <J t="self-custody">self-custody</J> position from 2018. And there
            is, truly, a Congo African Grey parrot named Sylvan who has a life
            expectancy longer than hers and who has bonded most strongly with
            Theo.
          </p>

          <p>
            This is a Tier 3 high-net-worth{" "}
            <J t="blended-family">blended family</J> with three state
            overlays, one vulnerable-heir overlay, two concentrated-position
            overlays, a pet, and a crypto self-custody item. If you passed this
            through a generic fill-in-the-blank will site, almost every
            interesting thing about her situation would be invisible to the
            output. Here is what the skill does with her on a Saturday
            afternoon.
          </p>

          <IntakePhasesViz />

          <span data-intake-phase="1">
            <Sub eyebrow="Phase 1">Orient (5 min)</Sub>
            <p>
              Maya types: &ldquo;I want to update my will. We moved from
              California to New York three years ago and I never changed it.
              Also Karl and I got married two years ago and I haven&apos;t
              fixed anything.&rdquo; The agent asks her why now, specifically —
              what triggered this, what she is worried about. She says her
              younger sister was diagnosed with early-onset Alzheimer&apos;s
              last month and it spooked her. The agent marks the session as
              mode: <Mono>existing-plan-audit</Mono> with a secondary overlay
              for incapacity-motivated intake. It asks her to upload her 2018
              California will, any trust documents, current beneficiary forms
              she can find, the Palm Beach deed, and the last two years of tax
              returns. She uploads what she has; about half.
            </p>
          </span>

          <span data-intake-phase="2">
            <Sub eyebrow="Phase 2">People (10 min)</Sub>
            <p>
              The agent walks through the cast. Karl. Maya&apos;s two adult
              children, Theo and Julia. Karl&apos;s daughter Hannah.
              Maya&apos;s sister (now relevant for{" "}
              <J t="poa">POA</J> naming). Her mother has passed; father in
              assisted living in Virginia, cognitively intact. The agent asks,
              gently, about relationships — does Theo&apos;s recovery affect
              how Maya wants distributions to flow? She thinks for a long time
              and says yes, she is afraid a sudden large inheritance could
              destabilize him. She mentions that her first husband died three
              years ago; there is no ex-spouse on paper. The agent writes this
              down verbatim, in Maya&apos;s own words, because it will inform
              the letter of wishes later.
            </p>
          </span>

          <span data-intake-phase="3">
            <Sub eyebrow="Phase 3">Assets and liabilities (15 min)</Sub>
            <p>
              The agent produces a structured inventory form and Maya fills it
              with the agent&apos;s help, section by section. The Westchester
              house is{" "}
              <J t="tenancy-by-entirety">tenancy by the entirety</J> with
              Karl. The Palm Beach condo is in Maya&apos;s name alone —
              inherited, never retitled. She has a rollover IRA at Fidelity, a
              401(k) from her employer, a joint taxable brokerage with Karl, a
              529 for a nephew, and the Bitcoin in a Ledger hardware wallet.
              Karl has his own IRA, his advisory equity in the startup (with a
              right-of-first-refusal clause buried in the stock agreement that
              Maya has never read), and a life insurance policy he bought in
              1998 that still names his first wife as{" "}
              <J t="beneficiary">beneficiary</J>.
            </p>
            <p>
              <strong>The agent flags this immediately.</strong> The policy is
              twenty-eight years old. Karl has been married to Maya for two.
              His first wife, whom he divorced, is still the named beneficiary.
              The policy&apos;s face value is $750,000. If Karl dies tomorrow,
              his ex gets three-quarters of a million dollars regardless of
              what any will says, because life insurance passes by contract.
              This is a red-flag entry in{" "}
              <Mono>red-flag-triage.md</Mono>, filed under priority:{" "}
              <strong>critical</strong>, and the agent does not let the
              conversation continue until Maya has texted Karl to ask him to
              log in to MetLife and update the form while she is still on the
              call.
            </p>
          </span>

          <span data-intake-phase="4">
            <Sub eyebrow="Phase 4">Beneficiary audit (10 min)</Sub>
            <p>
              Every account gets one row in{" "}
              <Mono>beneficiary-form-audit.md</Mono>. Who is named now; who
              should be named; the delta. Maya&apos;s rollover IRA still names
              her mother as primary beneficiary — her mother died four years
              ago, which makes the{" "}
              <J t="contingent-beneficiary">contingent</J> (her brother) the
              actual taker unless she updates. Maya is mortified. She had not
              thought about it once. The agent does not scold; it just logs it
              and moves on.
            </p>
          </span>

          <span data-intake-phase="5">
            <Sub eyebrow="Phase 5">Family dynamics (10 min)</Sub>
            <p>
              This is where the session&apos;s tone changes. The agent has
              enough context to recognize a blended family with a vulnerable
              heir and it loads the corresponding overlay. Questions get more
              specific. If you wanted to protect Theo from a sudden windfall
              without disinheriting him, what structures are you open to? Maya
              is unfamiliar with the vocabulary but not with the problem; the
              agent explains an incentive trust in plain English (&ldquo;a
              trust where the <J t="trustee">trustee</J> releases money on a
              schedule and for specific purposes you define in advance, not as
              a lump sum&rdquo;). Maya says that sounds exactly right. The
              agent asks her who she would want as trustee and she names her
              brother. It asks her if her brother knows. She says no.
            </p>
            <p>
              The agent also asks about Karl&apos;s daughter Hannah. Does Maya
              want Hannah included in the residuary, or not? Maya says she
              loves Hannah but does not feel she should be an equal
              beneficiary, because Hannah has her mother&apos;s family money
              already. The agent writes this down verbatim in Maya&apos;s own
              words, both for the Letter of Wishes and for the Litigation Risk
              memo — because unequal treatment of step-children is one of the
              top drivers of contested estates, and the honest explanation from
              the person themselves is the strongest defense.
            </p>
          </span>

          <span data-intake-phase="6">
            <Sub eyebrow="Phase 6">Goals and values (15 min)</Sub>
            <p>
              Maya talks about what she actually wants. Not what the documents
              say; what she wants. That Theo be protected, but not
              infantilized. That Julia and Hannah be treated fairly but not
              identically. That the parrot Sylvan be cared for by Theo as long
              as Theo is stable, with a pet-trust backup to a sanctuary if
              Theo ever relapses. That the Palm Beach condo stay in the family
              &ldquo;but not become a thing we fight about&rdquo; — the agent
              notes this, and flags <Mono>lumpy-asset-division</Mono> for the
              design phase. That Karl&apos;s business interests not be forced
              into a distress sale at the worst possible time if he dies first.
              That her father, in assisted living in Virginia, be looked after
              if Maya predeceases him. She is not ready to talk about
              charitable giving yet; the agent notes this as a deferred
              question.
            </p>
          </span>

          <span data-intake-phase="7">
            <Sub eyebrow="Phase 7">Incapacity and end-of-life (10 min)</Sub>
            <p>
              This is the phase that was most urgent for her coming in — her
              sister&apos;s diagnosis. The agent walks her through{" "}
              <J t="durable-poa">durable financial POA</J>,{" "}
              <J t="healthcare-proxy">healthcare POA</J>,{" "}
              <J t="living-will">living will</J>,{" "}
              <J t="hipaa">HIPAA authorization</J>. She picks Karl as primary
              agent for all of them, with her brother as successor. It asks
              about <J t="ulysses-clause">Ulysses-clause</J> considerations —
              advance directives that bind future her in the event of capacity
              loss — and she chooses to add one specifying that if she ever
              develops cognitive decline similar to her sister&apos;s, her
              healthcare agent may admit her to a memory-care facility against
              her future objection. This is a heavy decision and she says so.
              The agent records it and flags it for attorney review because
              Ulysses clauses have state-specific enforceability.
            </p>
          </span>

          <span data-intake-phase="8">
            <Sub eyebrow="Phase 8">Jurisdiction (5 min)</Sub>
            <p>
              <J t="domicile">Domicile</J> is New York. She also owns real
              estate in Florida. She has tax filings in three states over the
              last five years because of the move from California. The agent
              builds a domicile-audit entry and notes that New York state
              estate tax kicks in at $7.16M (as of current law), the Palm
              Beach condo will require{" "}
              <J t="ancillary-probate">ancillary probate</J> in Florida if it
              is not transferred into a trust or to{" "}
              <J t="tod-deed">TOD</J>, and the California filings are
              tax-immaterial going forward but should be cross-checked for any
              revocable trust with California situs that was not re-sited to
              New York.
            </p>
          </span>

          <span data-intake-phase="9">
            <Sub eyebrow="Phase 9">Wealth-tier routing (5 min)</Sub>
            <p>
              Combined household net worth is about $8.4 million. Karl&apos;s
              startup equity is speculative but if the company hits on its
              current round he could be up several million more. The agent
              routes them to Tier 3 planning with a complexity overlay bumping
              them toward Tier 4 for advanced planning (primarily for the
              startup stake&apos;s{" "}
              <J t="liquidity-at-death">liquidity-at-death</J> exposure). It
              recommends a <J t="revocable-trust">revocable trust</J> each, a{" "}
              <J t="credit-shelter-trust">credit shelter</J> or{" "}
              <J t="qtip">QTIP</J> bypass at the first death,{" "}
              <J t="ilit">ILIT</J> consideration for the startup equity, an
              incentive trust for Theo&apos;s share, a pet trust for Sylvan, a
              Palm Beach condo transfer plan, and a full beneficiary-form
              cleanup sweep.
            </p>
          </span>

          <Sub>What Maya walks out with</Sub>

          <p>
            Three hours of conversation, spread across two sittings, produces
            about forty artifacts. The Comprehensive Plan Report. The Asset
            Inventory. The Beneficiary Map (with the Karl-MetLife update marked
            as completed during the session). The Letter of Instruction. The
            Letter of Wishes with Maya&apos;s exact words. The Attorney
            Engagement Brief — four pages, structured the way an estates
            attorney actually wants to read it, with every open legal question
            flagged. The Implementation Ledger with about thirty specific
            institution-by-institution actions. An &ldquo;If I die
            tomorrow&rdquo; one-pager for Karl. A Family Meeting Agenda for
            the conversation Maya wants to have with Theo and Julia next month.
          </p>

          <p>
            She takes the packet to a New York estates attorney her friend
            recommends. The first meeting lasts two and a half hours. The
            attorney, who usually quotes fifteen to twenty hours at seven
            hundred dollars for a case like Maya&apos;s, tells her the draft
            will be ready in six billable hours. Maya pays for four. Three
            weeks later she and Karl sign in the attorney&apos;s office, and
            the parrot is provided for.
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== WHAT THE SKILL PRODUCES (hgjp.15) ========== */}
      <section id="produces" data-section="produces" className="pb-10 md:pb-14">
        <EC>
          <SectionHeader
            id="produces"
            eyebrow="Output"
            title="What the skill produces"
          />
          {/* TODO: body from hgjp.15 — deliverables section + DeliverablesTreeViz */}
        </EC>
      </section>

      <Divider />

      {/* ========== 9-STEP WORKFLOW (hgjp.16) ========== */}
      <section id="workflow" data-section="workflow" className="pb-10 md:pb-14">
        <EC>
          <SectionHeader
            id="workflow"
            eyebrow="Process"
            title="The nine-step workflow"
          />
          {/* TODO: body from hgjp.16 — 9-step workflow narrative */}
        </EC>
      </section>

      <Divider />

      {/* ========== ANTI-PATTERNS (hgjp.17) ========== */}
      <section id="anti" data-section="anti" className="pb-10 md:pb-14">
        <EC>
          <SectionHeader
            id="anti"
            eyebrow="Pitfalls"
            title="The anti-patterns"
          />
          {/* TODO: body from hgjp.17 — anti-patterns text + AntiPatternCardsViz */}
        </EC>
      </section>

      <Divider />

      {/* ========== VERIFICATION + ATTORNEY HANDOFF (hgjp.18) ========== */}
      <section id="attorney" data-section="attorney" className="pb-10 md:pb-14">
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
            tax thresholds drift. State execution formalities — how many
            witnesses, notarization requirements, whether the will can be
            electronic — vary across fifty jurisdictions and some of them have
            updated their rules inside the last three years. The{" "}
            <J t="secure-act">Secure Act</J> and Secure 2.0 rewrote how
            inherited retirement accounts work.{" "}
            <J t="medicaid-lookback">Medicaid lookback</J> periods are
            state-specific and politically volatile.
          </p>

          <p>
            The skill separates two kinds of knowledge. The evergreen
            methodology — the kernel&apos;s eleven axioms, the cognitive
            operators, the tier-routing logic, the coordination discipline — is
            stable. Those are the parts you can trust. The volatile law —
            current thresholds, current formalities, current{" "}
            <J t="portability">portability</J> mechanics, current domicile
            rules — has to be verified against primary sources before it gets
            treated as final. The skill&apos;s output contract includes a file
            called <Mono>official-source-log.md</Mono> in which every live-law
            lookup is recorded with the source URL and the date it was checked.
            Your attorney can audit it. Your future self, doing a plan review
            in 2028, can see exactly which pieces of your 2026 analysis need
            rechecking.
          </p>

          <p>
            That discipline is not paranoia; it is the only defensible posture
            for an AI-driven tool in a volatile-law domain. If the skill ever
            recommended something based on stale law and a family lost real
            money over it, the damage would be irreparable. The discipline is
            the alternative.
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
            A set of <strong>Attorney Interview Questions</strong> — the
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
            attorney will need — your drafts, your supporting financial
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
            normally eight to fifteen billable hours of &ldquo;let me
            understand your life before I can draft anything.&rdquo; With the
            skill&apos;s packet in hand, that collapses to two to three hours
            of &ldquo;good, I can draft this, here are the three questions I
            have for you before I start.&rdquo; The savings are real and they
            are repeatable.
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
          {/* TODO: body from hgjp.38 — comparison vs LegalZoom, Trust & Will, Rocket Lawyer */}
          <span />
        </EC>
      </section>

      <Divider />

      {/* ========== FAQ (hgjp.37) ========== */}
      <section id="faq" data-section="faq" className="pb-10 md:pb-14">
        <EC>
          <SectionHeader
            id="faq"
            eyebrow="Questions"
            title="FAQ"
          />
          {/* TODO: body from hgjp.37 — FAQ section */}
        </EC>
      </section>

      <Divider />

      {/* ========== THE GENERAL PATTERN (closing) ========== */}
      <section id="pattern" data-section="pattern" className="pb-10 md:pb-14">
        <EC>
          <h2 className="sm-section-title mb-6 mt-4 text-white">
            A pattern, not a product.
          </h2>
          {/* TODO: body — closing section (similar to slack article's "A pattern, not a migration") */}
          <p>
            {
              "The interesting thing here isn't about wills. It's about the shape of problems that get dramatically better when a coding agent is driving a well-written skill."
            }
          </p>
          <p>
            {
              "Estate planning has always had a structural inefficiency: the knowledge required to do it well is expensive, the consequences of doing it badly are invisible until someone dies, and the people who need it most — blended families, small-business owners, anyone with assets in multiple states — are exactly the people whose situations are too complex for a template."
            }
          </p>
          <p>
            {
              "An agent-driven skill doesn't replace the attorney. It replaces the forty hours of disorganized intake, the missed beneficiary forms, the coherence gaps between documents, and the family meeting that never happens. The attorney still drafts and signs. But the attorney's first meeting starts from a structured handoff instead of a blank intake form."
            }
          </p>

          <div className="sm-sign-off">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 via-cyan-500/20 to-emerald-500/20 border border-white/10">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-400">
                  TL;DR
                </p>
                <p className="text-[13px] text-slate-300">
                  One skill. Twelve axioms. A structured intake that makes the
                  attorney&apos;s first meeting start from a handoff, not a blank
                  form.
                </p>
              </div>
            </div>
          </div>
        </EC>
      </section>
    </div>
  );
}
