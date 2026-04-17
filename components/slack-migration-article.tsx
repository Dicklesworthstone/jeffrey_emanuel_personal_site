"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import {
  Crimson_Pro,
  JetBrains_Mono,
  Bricolage_Grotesque,
} from "next/font/google";
import {
  CheckCircle2,
  FileDown,
  Hash,
  Lock,
  MessagesSquare,
  Rocket,
  Sparkles,
  Wrench,
} from "lucide-react";
import { MathTooltip } from "./math-tooltip";
import { getJargon } from "@/lib/slack-migration-jargon";
import { getScrollMetrics } from "@/lib/utils";

// Dynamic import visualizations (no SSR — they use browser APIs / framer-motion)
const CostCompoundingViz = dynamic(
  () =>
    import("./slack-migration-visualizations").then((m) => ({
      default: m.CostCompoundingViz,
    })),
  { ssr: false },
);
const PhasePipelineViz = dynamic(
  () =>
    import("./slack-migration-visualizations").then((m) => ({
      default: m.PhasePipelineViz,
    })),
  { ssr: false },
);
const DataPreservationMatrixViz = dynamic(
  () =>
    import("./slack-migration-visualizations").then((m) => ({
      default: m.DataPreservationMatrixViz,
    })),
  { ssr: false },
);
const CutoverSimulatorViz = dynamic(
  () =>
    import("./slack-migration-visualizations").then((m) => ({
      default: m.CutoverSimulatorViz,
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

// The full 185 KB source guide. Served from /public as a static file so the
// user (or their agent) can download it with a single click.
const SOURCE_GUIDE_HREF = "/slack-mattermost-migration-guide.md";
const SOURCE_GUIDE_FILENAME =
  "COMPREHENSIVE_GUIDE_TO_APPLYING_SLACK_TO_MATTERMOST_MIGRATION_SKILLS.md";

function MarkdownDownloadButton({ compact = false }: { compact?: boolean }) {
  return (
    <a
      href={SOURCE_GUIDE_HREF}
      download={SOURCE_GUIDE_FILENAME}
      className={`group relative inline-flex items-center gap-4 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-purple-500/10 via-cyan-500/10 to-emerald-500/10 backdrop-blur-xl transition-all hover:border-cyan-400/60 hover:shadow-[0_0_32px_rgba(6,182,212,0.3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
        compact ? "px-4 py-3" : "px-5 py-4 md:px-6 md:py-5"
      }`}
      aria-label="Download the full migration guide as Markdown"
    >
      {/* Subtle animated gradient border glow on hover */}
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/0 via-cyan-500/0 to-emerald-500/0 group-hover:from-purple-500/10 group-hover:via-cyan-500/10 group-hover:to-emerald-500/10 transition-all pointer-events-none"
      />
      <div className="relative flex h-11 w-11 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:bg-cyan-500/20 group-hover:border-cyan-400/40 transition-colors">
        <FileDown className="w-5 h-5 md:w-6 md:h-6 text-cyan-300" />
      </div>
      <div className="relative text-left min-w-0">
        <p className="text-sm md:text-base font-bold text-white tracking-tight">
          Download the full guide as Markdown
        </p>
        <p className="text-[11px] md:text-xs text-slate-400 font-mono tracking-wide mt-0.5">
          for feeding to an AI agent · ~185 KB · 2.5k lines
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

// Expandable reference section
function Details({
  summary,
  children,
  open,
}: {
  summary: ReactNode;
  children: ReactNode;
  open?: boolean;
}) {
  return (
    <details className="sm-details" open={open}>
      <summary>{summary}</summary>
      <div className="sm-details-body">{children}</div>
    </details>
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
function Sub({ id, eyebrow, children }: { id?: string; eyebrow?: string; children: ReactNode }) {
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

export function SlackMigrationArticle() {
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

      {/* ========== HERO ========== */}
      <section
        data-section="hero"
        className="min-h-screen flex flex-col justify-start relative overflow-hidden pb-20 pt-24 md:pt-32"
      >
        {/* Ambient glows */}
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
              AI Agents · Infrastructure · Cost
            </div>

            {/* Title */}
            <h1 className="sm-display-title mb-6 text-white text-balance">
              Using AI Agents
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 drop-shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                to Migrate Off Slack.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl lg:text-3xl text-slate-400 max-w-3xl mx-auto leading-tight mt-8 md:mt-12 font-light">
              Two paired skills. One focused weekend. Roughly a{" "}
              <span className="text-emerald-300">99% cut</span> in ongoing cost —
              and your whole chat history on hardware you own.
            </p>

            {/* Stat chips */}
            <div className="mt-10 md:mt-14 flex flex-wrap justify-center gap-3 md:gap-4">
              {[
                { icon: Hash, label: "Slack → Mattermost", tone: "purple" as const },
                { icon: MessagesSquare, label: "Public · private · DMs · threads", tone: "cyan" as const },
                { icon: Rocket, label: "Agent-driven cutover", tone: "emerald" as const },
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
                  <Icon className="w-3.5 h-3.5" />
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

      {/* ========== DOWNLOAD CTA (agent-ready markdown) ========== */}
      <section data-section="download-cta" className="pt-4 pb-8 md:pt-6 md:pb-12">
        <EC>
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-[10px] md:text-[11px] font-mono uppercase tracking-[0.3em] text-slate-500">
              For operators who want to run this
            </p>
            <MarkdownDownloadButton />
            <p className="text-[11px] md:text-xs text-slate-500 font-mono max-w-[560px] leading-relaxed">
              The 2.5k-line source guide — paste the path into Claude Code or Codex and the agent drives the migration from there.
            </p>
          </div>
        </EC>
      </section>

      {/* ========== INTRO ========== */}
      <article data-section="intro">
        <EC>
          <p className="sm-drop-cap">
            {
              "There is a tweet from April 2026 that I keep coming back to. It is a founder named Alex Cohen — 40 employees, paying Slack about six thousand dollars a year, just quoted twenty-one thousand a year to move onto the Business+ tier so he can get a BAA for a customer contract. A three-and-a-half-times price hike to keep using the same software he’s already using."
            }
          </p>
          <p>
            {
              "That is the moment, more or less, when almost every growing company decides it is done with Slack. Not because the product is bad — Slack is a genuinely polished piece of software — but because the pricing is designed to make the decision for you, and because the thing you get back when you cancel is a pile of JSON files with dead links to your own attachments. You never really owned your history. You were renting it, on a meter that keeps going up."
            }
          </p>
          <p>
            {"For as long as I can remember, the reason most companies didn’t migrate off "}<J t="mattermost">Slack onto something self-hosted</J>{" was that the migration itself was a project. Someone had to write a script, chase expiring file links, rebuild per-channel membership lists, reconcile message counts, stand up a Postgres, configure Nginx with the right WebSocket upgrade, and get SMTP working well enough that password-reset emails would actually land in inboxes. Then keep it all running, every week, forever."}
          </p>
          <p>
            {"What changed, very recently, is that a sufficiently capable coding agent — "}<J t="claude-code">Claude Code</J>{" or "}<J t="codex">Codex</J>{" — can do every single one of those things in the background while you drink coffee. Not with you writing bash. With you reading a handful of reports, clicking approve on twenty or thirty prompts spread over a week, and pasting a short English sentence when the agent is ready for the next stage."}
          </p>
          <p>
            {"The thing that actually encodes the migration is not a fragile custom script. It is a pair of "}<J t="skill">agent skills</J>{" — one for extraction, one for setup and import — each a directory of prompts, references, and scripts that the agent loads into its context and drives on your behalf. Those two skills (plus a third that runs ongoing maintenance) are the subject of this article: how they decompose the problem, how the agent drives them, and every operational detail an operator will need in front of them on cutover day."}
          </p>

          {/* Table of contents */}
          <nav className="sm-toc" aria-label="Table of contents">
            <h3>Contents</h3>
            <ol>
              <li><a href="#why-bother">Why bother migrating?</a></li>
              <li><a href="#five-minute">The five-minute version</a></li>
              <li><a href="#non-technical">Can a non-technical person do this?</a></li>
              <li><a href="#asymmetric-bet">An asymmetric bet</a></li>
              <li><a href="#what-you-end-up-with">What you end up with</a></li>
              <li><a href="#timeline">Timeline and effort</a></li>
              <li><a href="#decision-tree">Which path through this guide</a></li>
              <li><a href="#cost-math">The money math</a></li>
              <li><a href="#why-now">Why this wasn’t practical before</a></li>
              <li><a href="#part-1">Part 1 — Workstation setup</a></li>
              <li><a href="#part-2">Part 2 — Before you touch Slack</a></li>
              <li><a href="#pipeline">The two-phase pipeline</a></li>
              <li><a href="#phase-1-stages">Phase 1 stages in detail</a></li>
              <li><a href="#phase-2-stages">Phase 2 stages in detail</a></li>
              <li><a href="#preservation">What survives the move</a></li>
              <li><a href="#ready-gate">The fail-closed readiness gate</a></li>
              <li><a href="#mcp-examples">MCP worked examples</a></li>
              <li><a href="#cutover-day">Cutover day, minute by minute</a></li>
              <li><a href="#baseline-deltas">Baseline + deltas pattern</a></li>
              <li><a href="#post-cutover">Part 5 — Post-cutover week</a></li>
              <li><a href="#operator-checklist">Part 7 — Operator checklist</a></li>
              <li><a href="#troubleshooting">Part 6 — Troubleshooting index</a></li>
              <li><a href="#resume">Resuming an interrupted migration</a></li>
              <li><a href="#acme-corp">Worked example: Acme Corp</a></li>
              <li><a href="#stage-cheatsheet">Stage cheatsheet</a></li>
              <li><a href="#comms-kit">User-communications kit</a></li>
              <li><a href="#legal-approval">Legal-approval gate</a></li>
              <li><a href="#cost-breakdown">Concrete monthly cost breakdown</a></li>
              <li><a href="#disk-footprint">Disk footprint per stage</a></li>
              <li><a href="#grid-migration">Enterprise Grid per-workspace migration</a></li>
              <li><a href="#compliance">Compliance &amp; audit handoff</a></li>
              <li><a href="#credentials">Credential inventory</a></li>
              <li><a href="#cloudflare">Cloudflare walkthrough</a></li>
              <li><a href="#smtp">SMTP (Postmark) walkthrough</a></li>
              <li><a href="#jsm">Part 11 — Installing via jsm</a></li>
              <li><a href="#phase-3">Part 12 — Phase 3 ongoing maintenance</a></li>
              <li><a href="#pattern">A pattern, not a migration</a></li>
            </ol>
          </nav>
        </EC>
      </article>

      <Divider />

      {/* ========== WHY BOTHER ========== */}
      <section data-section="why-bother">
        <EC>
          <SectionHeader id="why-bother" eyebrow="Part 0 · Why bother" title="Why bother with any of this?" />

          <p>
            {"Honest answer: to save a lot of money without losing your history. Alex Cohen’s tweet is just one data point. The pattern underneath it is universal: Slack’s Pro plan keeps you hooked with decent features, and when you grow past the point where Pro’s limits hurt — or you need a BAA, or you need to export private channels, or you want SSO, or you simply want a saner admin — the vendor hands you a quote that makes your eyes water."}
          </p>
          <p>
            {"Self-hosting Mattermost for the same 40-person workspace comes out to roughly $71/month for the whole stack. Against Alex’s $21,000/year Slack Business+ quote, that’s a "}
            <strong>96% cost reduction</strong>
            {", about $20,150 saved per year. Against the $6,000/year Slack Pro bill he was already paying, it’s still an "}
            <strong>86% cost reduction</strong>
            {", about $5,150 saved per year. Both include compliance features Slack would charge extra for: you own the server, so you can sign your own "}
            <J t="baa">BAA</J>
            {", configure retention your own way, and audit the data at the byte level."}
          </p>
          <p>
            {"At 1,000 users, the numbers get even less forgiving for Slack. Business+ at $12.50/user/month is $150,000/year. The same "}
            <J t="hetzner">Hetzner</J>
            {" AX52 + Cloudflare + Postmark + R2 stack serves 1,000 users for about $90/month, or $1,080/year. A "}
            <strong>99.3% cost reduction</strong>
            {", roughly $149,000 saved annually, and the data sits on hardware you own and can put in any jurisdiction you want."}
          </p>

          <Sub eyebrow="Other reasons, in rough order of how often they matter">Why else self-host?</Sub>

          <RefTable
            cols={[
              { key: "reason", label: "Reason" },
              { key: "detail", label: "What it unlocks" },
            ]}
            rows={[
              {
                reason: <strong className="text-white">You own your history</strong>,
                detail: "Slack's 90-day retention on Free, plus dead-link exports, means the moment you stop paying, your history is effectively gone. Self-hosted Mattermost keeps data in a Postgres you can back up, restore, inspect, and re-import.",
              },
              {
                reason: <strong className="text-white">Compliance without the BAA premium</strong>,
                detail: "You're the data custodian; you sign your own BAA, DPA, SCCs. Mattermost Team Edition (free) supports SSO via OAuth/SAML with the Professional Edition upgrade at $10/user/month if needed — still well below Slack Business+.",
              },
              {
                reason: <strong className="text-white">AI features, your way</strong>,
                detail: "Slack's enterprise tier bundles AI into the price. With Mattermost you pick: OpenAI, Anthropic, Groq, your own Llama-on-a-GPU, or no AI at all. Cost scales with actual usage, not per-seat.",
              },
              {
                reason: <strong className="text-white">No vendor price hikes</strong>,
                detail: "Your costs are fixed infrastructure rented by the month; no one quietly raises the seat price or changes the retention policy overnight.",
              },
              {
                reason: <strong className="text-white">Works on a locked-down network</strong>,
                detail: "Useful for regulated industries, field teams on unreliable internet, or a deliberate “no cloud” policy.",
              },
              {
                reason: <strong className="text-white">No seat counting</strong>,
                detail: "No guest-user surcharge, no “inactive user” rebuilds. Mattermost Team Edition doesn't have the same SKU inventory Slack does.",
              },
            ]}
          />

          <p>
            {"What this article does "}
            <em>not</em>
            {" try to convince you of: that Mattermost is more polished than Slack for every end-user scenario. Slack has spent a decade on UX details Mattermost is still catching up on (huddles have no drop-in equivalent; some channel-management ergonomics are less clicky). If you’re 5 people and pay $0/month on Slack’s Free tier and love it, this whole exercise is a waste of time. The migration pays off when your Slack bill is a real line item and the vendor’s next price-hike email is about to hit your inbox."}
          </p>

          <Sub id="five-minute" eyebrow="The 60-second version">Read this first, even if you never run a command.</Sub>
          <p>
            {"Slack charges $7.25–$12.50 per user per month. A 1,000-person workspace pays $87k–$150k per year, and the export you get at the end is JSON with dead links. Mattermost is open-source, self-hosted, and feels nearly identical to Slack — same channels, DMs, threads, reactions, emoji, file sharing, voice/video calls, slash commands — plus official tooling for importing Slack exports. A "}
            <J t="hetzner">Hetzner</J>
            {" AX52 + Cloudflare (free) runs the whole thing for about $75/month. "}
            <strong>~99% cost reduction</strong>
            {". The hard part is moving your history without losing anything; the two skills this article describes encode the safe path."}
          </p>
          <p>{"The overall flow:"}</p>
          <ol className="sm-bullet-list" style={{ listStyle: "decimal", paddingLeft: "1.5rem" }}>
            <li>You decide a few things (plan tier, domain, server size, cutover date, rollback owner).</li>
            <li>An AI agent runs Phase 1 on your laptop — downloads Slack history, pulls every file while the link still works, resolves user emails, packages it into one zip.</li>
            <li>The agent runs Phase 2 — SSHes into an Ubuntu server, installs Mattermost behind Cloudflare, rehearses on a throwaway copy, runs the real cutover once the fail-closed readiness gate says green.</li>
            <li>Users activate their accounts at <Mono>https://chat.yourdomain.com/reset_password</Mono> with their Slack email.</li>
          </ol>
          <p>
            {"You will spend most of the elapsed wall-clock time "}
            <em>waiting</em>
            {" (for Slack to email the export, for the server to provision, for the import to finish). The skills are structured so waiting stays waiting and doesn’t turn into operator attention."}
          </p>

          <Sub id="non-technical" eyebrow="For non-technical operators">Can a non-technical person do this?</Sub>
          <p>
            {"Yes, and it’s genuinely less work than the length of this article might suggest. The article is long because it covers the whole problem space so you have an answer for whatever you hit. In practice, "}
            <strong>most operators spend a handful of hours of actual attention spread across 1 to 2 weeks</strong>
            {", and the agent is doing the rest in the background."}
          </p>
          <p>{"What you actually do:"}</p>
          <RefTable
            cols={[
              { key: "action", label: "Action" },
              { key: "effort", label: "Effort" },
            ]}
            rows={[
              { action: "Paste tokens the agent asks for (Slack admin, Cloudflare, Postmark).", effort: "One browser-tab fetch per token." },
              { action: "Click “Approve” on permission prompts before the agent does something destructive.", effort: "~20–40 approvals, 5 seconds each." },
              { action: "Read a few reports (readiness score, reconciliation output, cutover status).", effort: "5–15 minutes per report." },
              { action: "Send user comms at cutover (copy-paste from templates).", effort: "5 minutes total." },
            ]}
          />
          <p>
            {"What you do "}
            <strong>not</strong>
            {" do: write Bash, edit config files by hand, install software, configure Nginx, tune Postgres, write Cloudflare API calls, run mmctl commands, or SSH into the server. The agent does all of that."}
          </p>
          <p>
            {"Two things the agent cannot do for you:"}
          </p>
          <ol className="sm-bullet-list" style={{ listStyle: "decimal", paddingLeft: "1.5rem" }}>
            <li>
              <strong>Order the server at Hetzner (or OVH, Contabo).</strong> Hetzner requires ID verification on the human paying. You sign up, ID-verify (~2 hours clearance during business hours), and click “Order”; the agent does everything from there.
            </li>
            <li>
              <strong>Pick a named <J t="rollback-owner">rollback owner</J> for cutover.</strong> This is you, or someone you designate, who has pre-committed to making the call to abort if cutover goes sideways. Phase 2 refuses to run cutover without <Mono>ROLLBACK_OWNER</Mono> set, on purpose.
            </li>
          </ol>

          <Sub id="what-you-end-up-with" eyebrow="When you’re done">What you end up with</Sub>
          <ul className="sm-bullet-list">
            <li>A self-hosted Mattermost 10.11+ server behind Cloudflare with Origin CA TLS and proper WebSocket upgrade.</li>
            <li>All your Slack history (public, private, DMs, group DMs, threads, reactions) imported and searchable.</li>
            <li>File attachments either in local storage or Cloudflare R2 — preserved, not linked.</li>
            <li>Custom emoji, canvases (as sidecar HTML posts), lists (as sidecar JSON posts), and admin audit CSVs (as sidecar posts in a dedicated channel). Nothing Slack-native gets silently dropped.</li>
            <li>User accounts pre-created, matched by email. Users activate via <Mono>/reset_password</Mono> with their Slack email.</li>
            <li>A complete <J t="evidence-pack">evidence pack</J>: SHA-256 hashes of every raw ZIP, enriched ZIP, import ZIP; reconciliation reports; cutover status JSON; activation proof.</li>
          </ul>

          <Sub id="timeline" eyebrow="How long this takes">Timeline and effort expectations</Sub>
          <p>
            {"A single operator driving the agent can take a small workspace (fewer than 50 users, under 1 GB of Slack history) start-to-finish in a single weekend. A 1,000-user workspace with a few years of history typically runs 1 to 2 weeks of calendar time if the operator rehearses twice, but the operator’s actual attention is still just a few hours spread over that window."}
          </p>
          <RefTable
            cols={[
              { key: "phase", label: "Phase" },
              { key: "duration", label: "Duration" },
              { key: "attention", label: "Your attention" },
            ]}
            rows={[
              { phase: "Slack export approval (Business+)", duration: "1–7 days, out of your control", attention: "none while waiting" },
              { phase: "Download + enrich + transform", duration: "1–6 hours, scales with data", attention: "5–15 min to kick off" },
              { phase: "Server provisioning + deploy", duration: "20–60 min", attention: "approve SSH/install prompts" },
              { phase: "Staging rehearsal", duration: "1–4 hours", attention: "10 min kick-off + read report" },
              { phase: "Production cutover window", duration: "15–45 min after staging green", attention: "full attention (approvals, comms)" },
              { phase: "Activation week", duration: "3–7 days", attention: "respond to help-desk questions" },
            ]}
          />
          <p>
            {"The skills are structured so waiting is waiting, not operator time. The agent kicks off a long download, watches it, and pings you when it finishes or gets stuck. During a 6-hour "}
            <Mono>enrich</Mono>
            {" stage your laptop can be asleep; resume the agent session when you come back and it picks up where it left off."}
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== DECISION TREE / THREE PATHS ========== */}
      <section data-section="decision-tree">
        <EC>
          <SectionHeader id="decision-tree" eyebrow="Before you start" title="Which path through this guide is for you?" />

          <p>
            {"There are three supported paths. Pick one now and stay with it — they produce the exact same result, the only difference is how the skills get onto your machine and how you drive the agent."}
          </p>

          <RefTable
            cols={[
              { key: "path", label: "Path" },
              { key: "who", label: "Who it’s for" },
              { key: "skills", label: "Where skills live" },
              { key: "install", label: "What you install" },
            ]}
            rows={[
              {
                path: <strong className="text-white">A: Desktop app + jsm</strong>,
                who: "Prefers clicking over typing; Mac or Windows laptop. Recommended for most.",
                skills: <>jsm manages <Mono>~/.claude/skills/</Mono> (and <Mono>~/.codex/skills/</Mono>) for you.</>,
                install: "Claude Code desktop app or Codex desktop app, plus the jsm CLI.",
              },
              {
                path: <strong className="text-white">B: CLI only</strong>,
                who: "Comfortable with terminals; wants the leanest install.",
                skills: <>Manual symlink or <Mono>jsm install</Mono>.</>,
                install: "Claude Code CLI or Codex CLI.",
              },
              {
                path: <strong className="text-white">C: CLI + jsm</strong>,
                who: "Wants the CLI but wants skills auto-synced across machines.",
                skills: "jsm-managed.",
                install: "CLI plus jsm.",
              },
            ]}
          />

          <Sub eyebrow="Decision tree">Quick routing before you commit</Sub>

          <Code>
{`┌────────────────────────────────────────────────────────────────┐
│ What Slack plan are you on?                                    │
└────────────────────────────────────────────────────────────────┘
    │
    ├── Free or Pro ──────→ Track B (slackdump-primary). See §3.
    │                       Expect: public + accessible private channels
    │                       and DMs only. Other people's DMs are invisible.
    │
    ├── Business+ ───────→ Track A (official admin export). See §3.
    │                       Expect: full workspace content.
    │
    └── Enterprise Grid ─→ Track C (grid split). See §Grid-migration.
                            Either grid-wide export + split, or
                            per-workspace exports.

┌────────────────────────────────────────────────────────────────┐
│ Where will Mattermost live?                                    │
└────────────────────────────────────────────────────────────────┘
    │
    ├── Hetzner AX42/AX52 dedicated (recommended) ─→ §2.3 sizing
    ├── OVH Advance / Contabo VPS ─────────────────→ same table, cheaper
    └── Existing infra you run ─────────────────────→ supply SSH target

┌────────────────────────────────────────────────────────────────┐
│ How do you want to drive the agent?                            │
└────────────────────────────────────────────────────────────────┘
    │
    ├── Click, don't type ───→ Path A (Desktop app). See §Part 1.
    ├── Terminal-native ────→ Path B (CLI-only).
    └── Multi-machine ──────→ Path C (CLI + jsm for cross-device sync).

┌────────────────────────────────────────────────────────────────┐
│ Where is your Mattermost database going to live?               │
└────────────────────────────────────────────────────────────────┘
    │
    ├── Same box as Mattermost (default)  →  POSTGRES_DSN=postgres://…@localhost:5432
    │                                         Skill provisions local PG for you.
    ├── Supabase (managed)                →  Supabase session pooler on 5432
    │                                         (NOT the transaction pooler on 6543).
    └── Your own managed PG               →  Provide the DSN; skill is hands-off.`}
          </Code>

          <p>
            {"If any branch surprises you, read its linked section before continuing. The skills themselves detect which path the operator is on and route accordingly — the Slack plan tier alone changes validators downstream."}
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== THE MONEY — VIZ 1 ========== */}
      <section data-section="cost">
        <EC>
          <SectionHeader id="cost-math" eyebrow="The math" title="The money math." />
          <p>
            {
              "Start with the arithmetic, because everything else follows from it. Slack's list prices are "
            }
            <span className="font-mono text-sm text-purple-200">$7.25/user/month</span>
            {" for Pro and "}
            <span className="font-mono text-sm text-purple-200">$12.50/user/month</span>
            {" for Business+. A thousand-person company is paying somewhere between ninety and a hundred and fifty thousand dollars a year just to have a chat window. A forty-person company is paying between thirty-five hundred and six thousand — modest in absolute terms, but a reliable target for the next "}
            <J t="baa">compliance-triggered price jump</J>.
          </p>
          <p>
            {
              "Self-hosted Mattermost is not close in price. A single "
            }
            <J t="hetzner">Hetzner</J>
            {" AX42 with NVMe and 64 GB of RAM serves a couple hundred users for roughly fifty dollars a month. An AX52 handles a thousand. Add Cloudflare's free plan in front, Postmark for password-reset emails, a little R2 for files, and an off-site backup target, and the total bill for a 340-person company rounds to "}
            <span className="font-mono text-sm text-emerald-200">$90/month</span>
            {". At 1,000 users it is still under "}
            <span className="font-mono text-sm text-emerald-200">$100/month</span>
            {", against Slack's six-figure ARR."}
          </p>
          <p>
            {"Run the slider below. The interesting thing is less the absolute savings — which are large — than how the curve shape changes with scale. Slack compounds linearly with headcount. The Mattermost bill barely moves until you need a second box."}
          </p>
        </EC>

        <EC>
          <div className="sm-viz-wrap">
            <CostCompoundingViz />
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== WHY NOW ========== */}
      <section data-section="why-now">
        <EC>
          <SectionHeader id="why-now" eyebrow="Why now" title="Why this wasn’t practical before." />
          <p>
            {
              "Every piece of the migration has existed in open source for years. slackdump can walk an authenticated Slack session and pull messages. mmetl turns a Slack export ZIP into Mattermost's bulk-import JSONL. mmctl uploads the ZIP and runs the import. Mattermost itself is a production-grade server you can apt-install on a plain Ubuntu box. None of this is new."
            }
          </p>
          <p>
            {"What was new, and genuinely painful, was the "}<em>glue</em>{". The Slack export's file links expire in a few hours. mmctl needs a JSONL with lines in a very specific order (version, emoji, team, channel, user, post, direct_channel, direct_post) or it rejects the whole import. Thread replies must reference their parent before the parent is redefined. Custom emoji objects must appear before the team line, not after. Mattermost's default MaxPostSize of 4,000 characters will truncate every long-form Slack message silently, so you have to set it to 16,383 before import, via a config.json value that has to match the server's apt-installed layout exactly. Nginx in front of it needs a WebSocket upgrade block or your client disconnects every few minutes without any visible error."}
          </p>
          <p>
            {
              "In the old world, one senior engineer spent two or three weeks figuring all of that out, writing a pile of bespoke scripts that worked for their workspace and no one else's, and then the migration happened. In the new world, a skill encodes the whole procedure once, and anyone who installs the skill inherits everything that senior engineer learned. The agent reads the skill, follows the runbook, and narrates what it is doing. You read the reports."
            }
          </p>
          <p>
            {"The specific pair of skills this whole piece is about:"}
          </p>

          <ul className="sm-bullet-list">
            <li>
              <span className="font-mono text-cyan-200">slack-migration-to-mattermost-phase-1-extraction</span>
              {" runs on your laptop. Picks "}
              <J t="track-a">Track A</J>
              {" / "}
              <J t="track-b">Track B</J>
              {" / "}
              <J t="track-c">Track C</J>
              {" based on your Slack plan, pulls the content, downloads every file before the link expires, resolves users to emails, extracts canvases and lists as "}
              <J t="sidecar">sidecar</J>
              {" content, transforms through mmetl, patches the JSONL, packages the ZIP, runs five validators, and emits a hash-anchored "}
              <J t="evidence-pack">evidence pack</J>
              {"."}
            </li>
            <li>
              <span className="font-mono text-cyan-200">slack-migration-to-mattermost-phase-2-setup-and-import</span>
              {" runs from the same laptop over SSH to a fresh Ubuntu VPS. Provisions the server, installs Mattermost and Nginx, wires up Cloudflare, rehearses the import on a throwaway staging target, computes a fail-closed readiness gate, and executes the production cutover with explicit rollback semantics."}
            </li>
          </ul>

          <p>
            {"Together they are about eight thousand lines of scripts and references, hash-verified at install time via "}<J t="jsm">jsm</J>{", updated on a subscription cadence. The thing you type, when it is time to run them, is “Use the slack-migration-to-mattermost-phase-1-extraction skill to run the setup stage.”"}
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== PART 1 — WORKSTATION SETUP ========== */}
      <section data-section="part-1">
        <EC>
          <SectionHeader id="part-1" eyebrow="Part 1 · one-time setup" title="Workstation setup: day zero to first skill call." />

          <p>
            {"You do this once per laptop. The skills install themselves via Claude Code’s plugin / skills mechanism; the tooling they call (slackdump, mmetl, mmctl, etc.) is installed by a bootstrap script that ships with the skill."}
          </p>

          <Sub id="day-zero" eyebrow="§1.0">Day zero — order a server and wire up SSH</Sub>

          <p>
            {"Phase 2 installs Mattermost on an Ubuntu server that you rent. Order it "}
            <em>before</em>
            {" you install the skill so the IP address and SSH access are ready when you need them. Takes about 2 hours wall-clock (most of it Hetzner’s ID verification) and ~15 minutes of attention."}
          </p>

          <Sub eyebrow="1.0.1">Order a Hetzner dedicated server</Sub>
          <ol className="sm-bullet-list" style={{ listStyle: "decimal", paddingLeft: "1.5rem" }}>
            <li>
              Go to <Mono>hetzner.com/dedicated-rootserver</Mono> and click <strong>Server Auction</strong>. The auction has the same specs at lower prices.
            </li>
            <li>
              Sign up with company email. Hetzner requires government-ID upload for first-time verification; usually clears in 1–2 hours during German business hours.
            </li>
            <li>
              Pick an <strong>AX42</strong> (up to ~250 users) or <strong>AX52</strong> (250–1,000 users) from the auction. Prefer <strong>NVMe</strong> storage. Datacenter: Falkenstein or Helsinki for EU, Ashburn for US.
            </li>
            <li>
              <strong>OS</strong>: Ubuntu 24.04 LTS (noble). If 24.04 isn’t offered, pick 22.04 LTS and upgrade post-provision.
            </li>
            <li>
              Leave <strong>Rescue System</strong> and <strong>KVM</strong> on defaults. Do <strong>not</strong> set a root password. Paste your SSH public key (from §1.0.3 below) into the “SSH keys” field.
            </li>
            <li>
              Submit. You’ll receive a “Server installed” email with the IP and confirmation the key was installed.
            </li>
          </ol>

          <p>
            {"OVH (US operators preferring a North American provider) and Contabo (small workspaces under 50 users at ~$10/mo) work the same way. OVH uses the Bare Metal Cloud → Advance series; Contabo uses VPS M (under 50 users), L (up to 250), XL (up to 1,000)."}
          </p>

          <Sub eyebrow="1.0.2">I don’t have a domain yet</Sub>
          <ul className="sm-bullet-list">
            <li><strong>Cloudflare Registrar</strong> — at-cost ~$10/year for <Mono>.com</Mono>, auto-adds the zone to Cloudflare. Fastest path.</li>
            <li><strong>Any existing registrar</strong> (GoDaddy, Namecheap, Porkbun, Route 53) — update nameservers to Cloudflare later. See §Cloudflare walkthrough.</li>
          </ul>
          <p>
            {"Buy the domain now. DNS propagation after nameserver update takes 15 minutes to 24 hours; you want that clock running in parallel with ID-verification."}
          </p>

          <Sub eyebrow="1.0.3">Generate an SSH keypair on your laptop</Sub>
          <p>
            {"An SSH keypair is two files: a private key that stays on your laptop (treat it like a password) and a public key you paste into the server. They unlock the server together; without the private file on your laptop, nobody can log in as you."}
          </p>

          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-400 mt-4">macOS</p>
          <Code>
{`ssh-keygen -t ed25519 -C "your_email@example.com"
# press Enter to accept default path (~/.ssh/id_ed25519)
# passphrase is optional; empty is acceptable if your disk is encrypted

cat ~/.ssh/id_ed25519.pub
# copy the ssh-ed25519 AAAAC3... line into Hetzner's order form`}
          </Code>

          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-400 mt-4">Windows 10/11 (PowerShell)</p>
          <Code>
{`ssh-keygen -t ed25519 -C "your_email@example.com"
# files land in C:\\Users\\<you>\\.ssh\\
Get-Content $HOME\\.ssh\\id_ed25519.pub`}
          </Code>

          <Sub eyebrow="1.0.4">First SSH login after the server is installed</Sub>
          <Code>
{`ssh root@95.217.12.34     # replace with your real IP
# SSH prints a host-key fingerprint — type 'yes' to record it in ~/.ssh/known_hosts
# you should land at root@Ubuntu-...#
# type 'exit' to return`}
          </Code>
          <p>
            {"If it asks for a password instead of logging in directly, Hetzner didn’t install the SSH key. Go to robot.hetzner.com → your server → add key under Linux rescue system, use Reset root password, SSH in with the temp password, and manually append your public key to "}
            <Mono>/root/.ssh/authorized_keys</Mono>
            {"; then "}
            <Mono>chmod 600 /root/.ssh/authorized_keys</Mono>
            {"."}
          </p>

          <Details summary={<>If you lose your private SSH key (recoverable)</>}>
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>
                <strong>Boot into Hetzner’s rescue system</strong> (robot UI → server → Rescue → activate Linux rescue → reboot). Get a temp root password by email, SSH in, mount the installed filesystem (<Mono>mount /dev/sda1 /mnt</Mono>), paste a new public key into <Mono>/mnt/root/.ssh/authorized_keys</Mono>, <Mono>umount</Mono>, reboot. Works for every provider with a rescue console.
              </li>
              <li>
                <strong>Re-order the server</strong> and start fresh. If you’re at day zero and nothing is installed yet, this is faster than rescue-system diagnosis.
              </li>
            </ol>
          </Details>

          <Details summary={<>Sidebar: Windows-specific notes</>}>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>PowerShell, not Command Prompt</strong> — this article’s commands assume a POSIX-ish shell. On Windows, PowerShell 7+ or Git Bash.</li>
              <li><strong>Install Git for Windows</strong> (<Mono>git-scm.com/downloads/win</Mono>). Provides <Mono>git</Mono> plus Git Bash.</li>
              <li><strong>Chocolatey</strong> is the Windows equivalent of Homebrew — install from <Mono>chocolatey.org/install</Mono> in an Admin PowerShell.</li>
              <li><strong>WSL2</strong> is optional but convenient: <Mono>wsl --install -d Ubuntu-24.04</Mono>, then <Mono>wsl</Mono>.</li>
              <li><strong>Paths</strong>: Mac-style <Mono>~/.claude/skills/</Mono> = Windows <Mono>%USERPROFILE%\.claude\skills\</Mono>.</li>
              <li><strong>Symlinks</strong> need Admin PowerShell (<Mono>New-Item -ItemType SymbolicLink</Mono>) or Git Bash with Developer Mode.</li>
              <li><strong>SSH</strong> built into Windows 10 (1809+) and 11. Run <Mono>ssh -V</Mono>; if missing, Settings → Apps → Optional Features → OpenSSH Client.</li>
            </ul>
          </Details>

          <Sub id="agent-harness" eyebrow="§1.1">Pick an agent harness (GUI app or CLI)</Sub>
          <p>
            {"You need "}
            <strong>one</strong>
            {" of the following. Either can run the skills end to end. Both Claude Code and Codex ship as GUI desktop apps and as CLIs."}
          </p>

          <RefTable
            cols={[
              { key: "option", label: "Option" },
              { key: "requires", label: "Requires" },
              { key: "install", label: "Install" },
            ]}
            rows={[
              {
                option: <strong className="text-white">1a · Claude Code desktop</strong>,
                requires: "Anthropic Pro, Max, Team, or Enterprise plan",
                install: <>Download from <Mono>claude.ai/download</Mono> · sign in · open Code tab · Select folder</>,
              },
              {
                option: <strong className="text-white">1b · Codex desktop</strong>,
                requires: "ChatGPT Plus/Pro/Business/Edu/Enterprise, or OpenAI API key with Codex access",
                install: <>Download from <Mono>developers.openai.com/codex/app</Mono> · sign in · pick project folder</>,
              },
              {
                option: <strong className="text-white">1c · Claude Code CLI</strong>,
                requires: "Anthropic plan",
                install: <><Mono>npm install -g @anthropic-ai/claude-code</Mono> · <Mono>claude login</Mono> · <Mono>claude</Mono> in your workdir</>,
              },
              {
                option: <strong className="text-white">1d · Codex CLI</strong>,
                requires: "ChatGPT plan or API key",
                install: <>Install from <Mono>github.com/openai/codex</Mono> · <Mono>codex login</Mono> · <Mono>codex</Mono> in workdir</>,
              },
            ]}
          />

          <div className="sm-insight-card">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15 border border-cyan-500/30">
                <Wrench className="w-4 h-4 text-cyan-300" />
              </div>
              <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-cyan-300">
                What “running the skill” looks like
              </p>
            </div>
            <p className="text-sm md:text-[15px] text-slate-300 leading-relaxed mb-3">
              In all four options, running a skill means opening a session in your working directory and asking the agent, in plain English, to use it. Examples:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-300 leading-relaxed">
              <li>Desktop app: type <Mono>/</Mono> in the prompt box to see slash commands, pick <Mono>slack-migration-to-mattermost-phase-1-extraction</Mono>. Or just say <em>“Use the Phase 1 Slack-to-Mattermost skill to run the setup stage.”</em></li>
              <li>CLI: <Mono>claude</Mono> (or <Mono>codex</Mono>) in the workdir, then the same plain-English request.</li>
            </ul>
            <p className="text-sm text-slate-400 italic mt-3">
              Behind the scenes the agent runs <Mono>./migrate.sh setup</Mono> for you and shows the output. You’ll see commands flash by; you don’t need to memorize them.
            </p>
          </div>

          <Sub id="install-skills" eyebrow="§1.2">Install the two skills</Sub>
          <p>
            {"Three ways to install. Pick whichever matches the path you chose above."}
          </p>

          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-400 mt-4">
            Recommended: via jsm (Jeffrey’s Skills.md)
          </p>
          <Code>
{`# macOS / Linux
curl -fsSL https://jeffreys-skills.md/install.sh | bash
# Windows (PowerShell as Admin)
irm https://jeffreys-skills.md/install.ps1 | iex

jsm setup                        # first-time wizard: creates config, picks skill dirs
jsm login                        # opens browser → sign in with Google
jsm install slack-migration-to-mattermost-phase-1-extraction
jsm install slack-migration-to-mattermost-phase-2-setup-and-import`}
          </Code>
          <p>
            {"Restart the Claude Code and/or Codex desktop app (or "}
            <Mono>claude</Mono>
            {" / "}
            <Mono>codex</Mono>
            {") and the skills show up in the picker. jsm downloaded a verified copy of each skill, unzipped into "}
            <Mono>~/.claude/skills/</Mono>
            {" and "}
            <Mono>~/.codex/skills/</Mono>
            {", checked the hash matches what the server published, and recorded the version in a local database."}
          </p>

          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-400 mt-4">
            Alternative: via claude plugins
          </p>
          <Code>
{`claude plugins install slack-migration-to-mattermost-phase-1-extraction
claude plugins install slack-migration-to-mattermost-phase-2-setup-and-import`}
          </Code>

          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-400 mt-4">
            Alternative: symlink from a local clone (developers only)
          </p>
          <Code>
{`ln -s /path/to/je_private_skills_repo/.claude/skills/slack-migration-to-mattermost-phase-1-extraction  ~/.claude/skills/
ln -s /path/to/je_private_skills_repo/.claude/skills/slack-migration-to-mattermost-phase-2-setup-and-import ~/.claude/skills/
# mirror to Codex too:
ln -s /path/to/je_private_skills_repo/.claude/skills/slack-migration-to-mattermost-phase-1-extraction  ~/.codex/skills/
ln -s /path/to/je_private_skills_repo/.claude/skills/slack-migration-to-mattermost-phase-2-setup-and-import ~/.codex/skills/`}
          </Code>
          <p>
            {"On Windows (Git Bash or PowerShell 7+ as Admin), use "}
            <Mono>mklink /D</Mono>
            {" or "}
            <Mono>New-Item -ItemType SymbolicLink</Mono>
            {"."}
          </p>

          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-400 mt-4">Verify</p>
          <Code>
{`jsm list                          # lists installed skills + versions
ls -la ~/.claude/skills/ | grep slack-migration
# Windows:
dir %USERPROFILE%\\.claude\\skills`}
          </Code>

          <Sub id="bootstrap-phase-1" eyebrow="§1.3">Bootstrap the workstation for Phase 1</Sub>
          <p>
            {"Installs the underlying CLI tools the skill shells out to: slackdump does extraction, mmetl does transformation, mmctl does import upload, and so on."}
          </p>
          <Code>
{`cd ~/.claude/skills/slack-migration-to-mattermost-phase-1-extraction
./scripts/doctor.sh                    # what's missing?
./scripts/bootstrap-tools.sh           # install missing system + Go tools
./scripts/doctor.sh                    # confirm all required checks are green`}
          </Code>
          <p>
            {"Platforms covered automatically: macOS uses Homebrew (and installs Homebrew first if missing); Ubuntu/Debian/WSL uses apt; Windows prints a Chocolatey checklist. Installed: "}
            <Mono>python3</Mono>, <Mono>jq</Mono>, <Mono>zip</Mono>, <Mono>unzip</Mono>, <Mono>curl</Mono>, <Mono>rsync</Mono>, <Mono>git</Mono>, <Mono>sha256sum</Mono>, <Mono>go</Mono>, then the Go tools (<Mono>slackdump</Mono>, <Mono>slack-advanced-exporter</Mono>, <Mono>mmetl</Mono>, <Mono>mmctl</Mono>) into <Mono>$(go env GOPATH)/bin</Mono>, plus the Python packages <Mono>requests</Mono> and <Mono>beautifulsoup4</Mono>.
          </p>

          <Details summary={<>If something goes wrong</>}>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><Mono>command not found: ./scripts/doctor.sh</Mono> → you forgot the <Mono>cd</Mono>, or the skills dir is elsewhere. Find it with <Mono>jsm list</Mono>.</li>
              <li><Mono>permission denied</Mono> → run <Mono>chmod +x scripts/*.sh</Mono> inside the skill dir, then retry.</li>
              <li>One Go install fails (bad network, yanked release) → the script warns and continues. Re-run once network cooperates.</li>
              <li>Windows permission errors → open PowerShell as Administrator.</li>
            </ul>
          </Details>

          <Sub id="bootstrap-phase-2" eyebrow="§1.4">Bootstrap the workstation for Phase 2</Sub>
          <Code>
{`cd ~/.claude/skills/slack-migration-to-mattermost-phase-2-setup-and-import
./scripts/doctor.sh                       # what's missing?
./scripts/bootstrap-tools.sh              # install workstation-side tools
./scripts/doctor.sh --require-remote      # probe SSH to your target once TARGET_HOST is set`}
          </Code>
          <p>
            {"Phase 2 needs "}
            <Mono>mmctl</Mono>, <Mono>jq</Mono>, <Mono>psql</Mono>, <Mono>ssh</Mono>, <Mono>scp</Mono>, <Mono>rsync</Mono>, <Mono>openssl</Mono>{", and the Python "}
            <Mono>requests</Mono>
            {" module. On macOS it will nudge you to add "}
            <Mono>$(brew --prefix)/opt/libpq/bin</Mono>
            {" to your PATH so "}
            <Mono>psql</Mono>
            {" is runnable after a fresh libpq install. "}
            <Mono>--require-remote</Mono>
            {" confirms your SSH key is on the target and "}
            <Mono>ssh -o BatchMode=yes</Mono>
            {" works. Run this right before "}
            <Mono>./operate.sh provision</Mono>
            {" / "}
            <Mono>deploy</Mono>
            {"."}
          </p>

          <Sub id="mcp-setup" eyebrow="§1.5">Wire up MCP servers (optional but recommended)</Sub>
          <p>
            {"The skills ship installers that register Slack / Playwright / Mattermost "}
            <J t="mcp">MCP</J>
            {" servers into whichever agent CLIs you have."}
          </p>
          <Code>
{`# Phase 1 (workstation)
./scripts/install-mcp-servers.sh
./scripts/doctor.sh --require-mcp

# Phase 2 (workstation)
./scripts/install-mcp-servers.sh
./scripts/doctor.sh --require-mcp`}
          </Code>

          <RefTable
            cols={[
              { key: "mcp", label: "MCP" },
              { key: "unlocks", label: "When it helps" },
              { key: "phase", label: "Phase" },
            ]}
            rows={[
              {
                mcp: <>Slack MCP (Anthropic official, <Mono>xoxb-</Mono>)</>,
                unlocks: "“count channels”, “verify last message in #general”, “check user U0ABC’s email”",
                phase: "Phase 1",
              },
              {
                mcp: <>Slack MCP stealth (korotovsky, <Mono>xoxc-</Mono> + <Mono>xoxd-</Mono>)</>,
                unlocks: "full visibility including DMs for gap-fill verification",
                phase: "Phase 1",
              },
              {
                mcp: <>Playwright MCP</>,
                unlocks: "drives the Slack admin UI’s export flow, or Mattermost System Console screens that lack API equivalents",
                phase: "Phase 1 + 2",
              },
              {
                mcp: <>Mattermost MCP (community, admin PAT)</>,
                unlocks: "“which users are inactive”, “stamp a test post”, “list team roles”",
                phase: "Phase 2",
              },
            ]}
          />

          <p>
            {"You do not need any of these for the skill itself to run. They are accelerators for verification, gap-hunting, and UI steps. See the §MCP worked examples section later for concrete prompts."}
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== PART 2 — BEFORE YOU TOUCH SLACK ========== */}
      <section data-section="part-2">
        <EC>
          <SectionHeader id="part-2" eyebrow="Part 2 · pre-flight" title="Before you touch Slack." />

          <p>
            {"Three things need to be decided before your first "}
            <Mono>./migrate.sh export</Mono>
            {" call. Spending 20 minutes on these now saves hours downstream."}
          </p>

          <Sub id="plan-tier" eyebrow="§2.1">Slack plan tier and export privileges</Sub>
          <p>
            {"Log into Slack as an owner/admin and open "}
            <strong>Workspace Settings → Security → Import &amp; export data</strong>
            {". The export page tells you which scope you’re authorized for:"}
          </p>
          <ul className="sm-bullet-list">
            <li>
              <strong>Free or Pro</strong>: public channels only. Private channels, DMs, and group DMs cannot be exported via the official path. Phase 1 routes you into <J t="track-b">Track B</J> (slackdump as primary) and emits an explicit <Mono>unresolved-gaps.md</Mono> listing the private content it can’t pull.
            </li>
            <li>
              <strong>Pro with legal exception</strong>: Workspace Owners can apply to Slack for full export under “valid legal process, consent of members, or a requirement under applicable laws.” If granted → Track A.
            </li>
            <li>
              <strong>Business+ or Enterprise Grid</strong>: full content export of public, private, and DM is available. <J t="track-a">Track A</J> is the default path.
            </li>
          </ul>
          <p>
            {"Write down the answer. The value goes into "}
            <Mono>config.env</Mono>
            {" as "}
            <Mono>SLACK_PLAN_TIER</Mono>
            {" and controls several downstream validators."}
          </p>

          <Sub id="scope" eyebrow="§2.2">Scope of the export</Sub>
          <p>
            {"Default: full history from workspace creation to now. Before you commit:"}
          </p>
          <ul className="sm-bullet-list">
            <li>Is there content legal has told you <em>must not</em> be exported? (A private HR channel whose members did not consent, for example.) Exclude those channels via Slack admin before the export, or accept them and redact post-export.</li>
            <li>Are there moribund channels older than your retention policy that you’d rather never import? Leave them in Slack and skip them in the Mattermost archive-channel mapping.</li>
            <li>Is the export size going to blow past the server’s disk budget? Rule of thumb: plan for 3× the compressed Slack export size of free disk. For many years of heavy attachments, use <Mono>split-phase1-import.py</Mono> (per-year batch ZIPs).</li>
          </ul>

          <Sub id="server-sizing" eyebrow="§2.3">Server sizing</Sub>
          <p>
            {"Mattermost’s official 1000-user recommendation is 4 vCPU / 8 GB RAM / 90–180 GB storage. That’s bare-minimum. Real production wants headroom:"}
          </p>

          <RefTable
            cols={[
              { key: "users", label: "User count" },
              { key: "hw", label: "Target hardware" },
              { key: "hetzner", label: "Hetzner" },
              { key: "ovh", label: "OVH" },
              { key: "contabo", label: "Contabo" },
              { key: "monthly", label: "Est. $/mo" },
            ]}
            rows={[
              { users: "Up to 50", hw: "2 vCPU / 4 GB / 80 GB SSD", hetzner: "AX21 or small VPS", ovh: "VLE-4", contabo: "VPS M", monthly: "$10–20" },
              { users: "50–250", hw: "4 vCPU / 16 GB / 250 GB NVMe", hetzner: "AX42 / CCX23", ovh: "Advance-1", contabo: "VPS L", monthly: "$40–60" },
              { users: "250–1000", hw: "8 cores / 64 GB / 2×1 TB NVMe RAID 1", hetzner: <strong>AX52 (recommended)</strong>, ovh: "Advance-2", contabo: "VPS XL", monthly: "$65–90" },
              { users: "1000+", hw: "8–16 cores / 64–128 GB, separate PG", hetzner: "AX52 + Supabase Pro", ovh: "Advance-2 + managed PG", contabo: "enterprise", monthly: "$100–300+" },
            ]}
          />

          <p>
            {"Pick "}
            <strong>AX52 at Hetzner</strong>
            {" as the default for anything 250–1,000 users — by far the cheapest dedicated-bare-metal-with-NVMe option in that class. Put "}
            <strong>Ubuntu 24.04 LTS</strong>
            {" on it. Ordering the server is the one step the agent cannot do for you."}
          </p>

          <p>
            {"Four values go into "}
            <Mono>config.env.phase2</Mono>
            {" when the agent asks; you’re picking a name, not doing setup:"}
          </p>
          <RefTable
            cols={[
              { key: "field", label: "Field" },
              { key: "what", label: "What" },
              { key: "note", label: "Notes" },
            ]}
            rows={[
              { field: <Mono>DOMAIN</Mono>, what: <>Typically <Mono>chat.yourdomain.com</Mono></>, note: <>Add to Cloudflare if not already there (§Cloudflare walkthrough).</> },
              { field: <Mono>SMTP</Mono>, what: "Mailgun, Postmark, SES, or Google Workspace relay", note: "Sign up for a provider; the agent wires credentials into Mattermost. Users can’t log in without password-reset emails." },
              { field: <Mono>ADMIN_EMAIL</Mono>, what: "A mailbox you own", note: "The agent creates the Mattermost admin account during deploy. Password is generated; store in 1Password." },
              { field: <Mono>ROLLBACK_OWNER</Mono>, what: <>A named human (can be yourself)</>, note: "Phase 2 refuses cutover without this set, so it’s enforced." },
            ]}
          />

          <Sub id="driving-the-skill" eyebrow="§2.4">How you drive the skill</Sub>
          <p>
            {"The rest of this guide shows commands like "}
            <Mono>./migrate.sh export</Mono>
            {" or "}
            <Mono>./operate.sh cutover</Mono>
            {". Those are the scripts the skill runs; you almost never type them yourself. Ask the agent, in plain English, to run the next stage."}
          </p>

          <div className="sm-insight-card">
            <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-cyan-300 mb-3">
              Shortcut: hand the agent the guide
            </p>
            <p className="text-sm md:text-[15px] text-slate-300 leading-relaxed">
              Open your Claude Code or Codex session in your working directory and paste something like:
            </p>
            <div className="mt-3 rounded-lg border border-white/10 bg-black/40 p-4 italic text-[13px] text-slate-300 leading-relaxed">
              “Read this guide end-to-end: <Mono>/slack-mattermost-migration-guide.md</Mono>. Then read the Phase 1 and Phase 2 skills. I’m planning a migration for [company name, user count, Slack plan tier]. Walk me through what I need to do before we start (server, domain, SMTP, tokens), then plan the full sequence of stages with me.”
            </div>
            <p className="text-sm text-slate-400 italic mt-3">
              The agent produces a tailored checklist, tells you which tokens to collect, and pauses before each destructive step. Download the guide with the button near the top of this page.
            </p>
          </div>

          <Sub id="pause-and-confirm" eyebrow="§2.4 · cont.">The pause-and-confirm pattern</Sub>
          <p>
            {"Both Claude Code and Codex pause before any action that touches a server (SSH, DB writes, HTTP POST to Mattermost) and ask you to approve it. Read the command carefully before you approve, especially during Phase 2 cutover."}
          </p>

          <Sub eyebrow="When to say yes to a permission prompt">Non-technical operator cheat-sheet</Sub>
          <RefTable
            cols={[
              { key: "pattern", label: "Looks like" },
              { key: "decision", label: "Decision" },
            ]}
            rows={[
              { pattern: <><Mono>./migrate.sh &lt;stage&gt;</Mono> / <Mono>./operate.sh &lt;stage&gt;</Mono> matching the stage you asked for</>, decision: <span className="text-emerald-300 font-semibold">Approve</span> },
              { pattern: <><Mono>ssh &lt;user&gt;@&lt;your TARGET_HOST&gt;</Mono></>, decision: <><span className="text-emerald-300 font-semibold">Approve</span> (confirm hostname matches config.env)</> },
              { pattern: <><Mono>mmctl &lt;anything&gt; --url https://&lt;your MATTERMOST_URL&gt;</Mono></>, decision: <><span className="text-emerald-300 font-semibold">Approve</span> (confirm URL is yours)</> },
              { pattern: <><Mono>curl</Mono> to jeffreys-skills.md / hetzner.com / cloudflare.com / your own domain</>, decision: <span className="text-emerald-300 font-semibold">Approve</span> },
              { pattern: <><Mono>sudo apt install &lt;package&gt;</Mono> during bootstrap-tools.sh or provision</>, decision: <span className="text-emerald-300 font-semibold">Approve</span> },
              { pattern: <><Mono>psql</Mono> / <Mono>pg_dump</Mono> / <Mono>pg_restore</Mono> against <Mono>$POSTGRES_DSN</Mono> or <Mono>$SCRATCH_DB_URL</Mono></>, decision: <span className="text-emerald-300 font-semibold">Approve</span> },
              { pattern: <><Mono>rm -rf /opt/mattermost</Mono> or delete outside workdir/</>, decision: <span className="text-rose-300 font-semibold">Deny and ask why</span> },
              { pattern: <><Mono>ssh &lt;some unknown hostname&gt;</Mono></>, decision: <span className="text-rose-300 font-semibold">Deny</span> },
              { pattern: <>Anything reading <Mono>~/.ssh/id_*</Mono> and piping somewhere</>, decision: <span className="text-rose-300 font-semibold">Deny and investigate</span> },
              { pattern: <><Mono>git push</Mono> to a remote you didn’t set up</>, decision: <span className="text-rose-300 font-semibold">Deny</span> },
              { pattern: <>Anything right after the agent has seemed confused</>, decision: <span className="text-rose-300 font-semibold">Deny and re-read prompt</span> },
            ]}
          />
          <p>
            {"When in doubt, type: "}
            <em>“Explain what this command does and why you’re running it at this stage.”</em>
            {" The agent will tell you."}
          </p>

          <Sub eyebrow="Keep your laptop awake">During long stages</Sub>
          <p>
            {"Phase 1 "}
            <Mono>enrich</Mono>
            {" and Phase 2 "}
            <Mono>staging</Mono>
            {" / "}
            <Mono>cutover</Mono>
            {" can run 30–120 min. If your laptop sleeps mid-run, the SSH session dies and the stage aborts."}
          </p>
          <Code>
{`# macOS — separate Terminal tab, leave running
caffeinate -dims

# Windows — PowerShell as Admin
powercfg /requestsoverride process powershell.exe DISPLAY SYSTEM AWAYMODE
# reverse when done
powercfg /requestsoverride process powershell.exe

# Simplest: plug in, disable sleep for the migration week, re-enable after`}
          </Code>
        </EC>
      </section>

      <Divider />

      {/* ========== PIPELINE VIZ ========== */}
      <section data-section="pipeline">
        <EC>
          <SectionHeader id="pipeline" eyebrow="The two-phase pipeline" title="Phase 1 → handoff → Phase 2." />
          <p>
            {
              "Both skills expose an ordered list of stages. You don’t typically run them all at once. Most operators step through stage by stage and read the reports between each, because the reports are where the decisions live — what was exported, what’s on disk, whether reconciliation counts line up, whether the staging rehearsal passed. Tap any node or edge below to see what it actually does."
            }
          </p>

          <div className="sm-viz-wrap">
            <PhasePipelineViz />
          </div>
        </EC>

        {/* PHASE 1 STAGES IN DETAIL */}
        <EC>
          <SectionHeader id="phase-1-stages" eyebrow="Part 3 · Phase 1" title="Driving Phase 1 — extraction and transformation." />
          <p>
            {"The canonical Phase 1 pipeline:"}
          </p>
          <Code>
{`setup  ->  export  ->  enrich  ->  transform  ->  package  ->  verify  ->  handoff`}
          </Code>
          <p>
            {"You can run "}
            <Mono>./migrate.sh all</Mono>
            {" to chain the whole thing; in practice most operators step through stage by stage and read the reports between each."}
          </p>

          <Sub id="p1-setup" eyebrow="§3.1">Set up the working directory (stage: setup)</Sub>
          <p>{"Pick a working directory with plenty of disk. For a 50-user workspace, 50 GB free is enough. For 1,000 users with heavy file attachments, assume 500 GB to 1 TB."}</p>
          <Code>
{`mkdir -p ~/slack-migration/acme
cd ~/slack-migration/acme
cp ~/.claude/skills/slack-migration-to-mattermost-phase-1-extraction/config.env.example ./config.env
$EDITOR config.env`}
          </Code>
          <p>{"Minimum fields for a Business+ / Track A run:"}</p>
          <Code>
{`WORKSPACE_NAME="acme-slack"
SLACK_PLAN_TIER="Business+"
PHASE1_WORKSPACE_ROOT="./workdir"
MATTERMOST_TEAM_NAME="acme"
MATTERMOST_TEAM_DISPLAY_NAME="Acme Corp"

# Fill one of these two blocks:
# (A) official export — paste the path to the downloaded ZIP here.
SLACK_EXPORT_ZIP=""
SLACK_CHANNEL_AUDIT_CSV=""
SLACK_MEMBER_CSV=""
# (B) slackdump-primary — fetch tokens from a logged-in browser session.
# SLACK_TOKEN="xoxp-..."     # slack app user token, for enrichment API calls
# SLACKDUMP_PRIMARY="1"`}
          </Code>
          <p>
            {"Then run "}
            <Mono>./migrate.sh setup</Mono>
            {" (or ask the agent to do it). This creates the "}
            <Mono>workdir/artifacts/{`{raw,enriched,import-ready,reports}`}/</Mono>
            {" tree the rest of the pipeline expects, and re-runs doctor.sh-style tool checks so you find out now if something is missing."}
          </p>

          <Sub id="p1-export" eyebrow="§3.2">Acquire the Slack export (stage: export)</Sub>
          <p>{"Three possible paths — work out which one you’re on, then execute."}</p>

          <Sub eyebrow="3.2.1">Track A — official admin export (recommended when available)</Sub>
          <p>
            {"Slack has no public API to "}
            <em>trigger</em>
            {" a workspace export; it’s a UI-only operation. Three sub-paths past that:"}
          </p>
          <ul className="sm-bullet-list">
            <li>
              <strong>Agent-driven via Playwright MCP (recommended).</strong> If the Playwright MCP is registered, ask the agent: <em>“Open the Slack admin export page and kick off an export for the full date range. Wait for the email, grab the download URL, and pull the ZIP into <Mono>artifacts/raw/</Mono>.”</em> The agent opens a browser session, clicks through, waits for mail, completes intake. You approve browser-control permission once.
            </li>
            <li>
              <strong>Automated via <Mono>SLACK_EXPORT_AUTOMATION=1</Mono>.</strong> Set a Slack session cookie in <Mono>config.env</Mono> and point the skill at an IMAP mailbox; <Mono>automate-official-export.py</Mono> does the POST, polls for the email, downloads the ZIP, hashes, writes provenance. This is the path for recurring baseline+delta cadences.
            </li>
            <li>
              <strong>Fully manual.</strong> Click through the Slack admin UI yourself, wait, download, tell the agent where you saved it. The agent runs <Mono>./migrate.sh export</Mono> to hash and write <Mono>manifest.raw.json</Mono>.
            </li>
          </ul>
          <p>{"Regardless of which sub-path, the working directory ends up with:"}</p>
          <Code>
{`workdir/artifacts/raw/
├── slack-export.zip           # hashed
├── channel-audit-YYYY-MM-DD.csv   # hashed
├── member-list-YYYY-MM-DD.csv     # hashed (if available)
└── manifest.raw.json          # names every file + its SHA256`}
          </Code>

          <Sub eyebrow="3.2.2">Track B — slackdump as primary (Pro / Free, or official unavailable)</Sub>
          <p>
            {"Set "}
            <Mono>SLACKDUMP_PRIMARY=1</Mono>
            {" in config.env. Obtain either a Slack App "}
            <Mono>xoxp-</Mono>
            {" user token (preferred) or extract "}
            <Mono>xoxc-</Mono>
            {" / "}
            <Mono>xoxd-</Mono>
            {" session cookies from a logged-in browser ("}
            <Mono>AUTHENTICATION.md</Mono>
            {" has the Chrome DevTools steps). Then:"}
          </p>
          <Code>{`./migrate.sh export`}</Code>
          <p>
            {"This is a "}
            <em>partial view</em>
            {": slackdump can only see what the logged-in account can see. Private channels the account is not a member of, DMs the account is not a party to, and messages in channels predating the account’s join date are all invisible. The skill captures this reality in "}
            <Mono>unresolved-gaps.md</Mono>
            {" later; your job now is to run the export and not pretend it sees more than it does."}
          </p>

          <Sub eyebrow="3.2.3">Track C — Enterprise Grid with per-workspace export</Sub>
          <p>
            {"Grid admins can request grid-wide (one giant file) or per-workspace exports. Per-workspace is cleaner. If you get a grid-level export, "}
            <Mono>split-phase1-import.py</Mono>
            {" + "}
            <Mono>ENTERPRISE-GRID-WORKSPACE-SPLIT-WORKFLOW.md</Mono>
            {" handles splitting it for you."}
          </p>

          <Sub eyebrow="Common to all tracks">Channel-audit CSV, member list, workflows</Sub>
          <p>
            {"Both CSVs are downloadable from "}
            <strong>Workspace settings → Security</strong>
            {". Download at the same time as the ZIP and put paths into "}
            <Mono>SLACK_CHANNEL_AUDIT_CSV</Mono>
            {" and "}
            <Mono>SLACK_MEMBER_CSV</Mono>
            {". The channel-audit CSV is what the reconciliation validator uses to cross-check channel counts; without it the validator warns but cannot block. The member-list CSV preserves SSO-linked email addresses."}
          </p>
          <p>
            {"Workflow Builder JSON: individually exportable from "}
            <strong>Settings → Workflows</strong>
            {". No bulk export. For each workflow that still matters, export it and drop it into a directory referenced by "}
            <Mono>PHASE1_WORKFLOW_INPUTS</Mono>
            {" so "}
            <Mono>extract-phase1-sidecars.py</Mono>
            {" preserves it. Workflows cannot be imported to Mattermost automatically; they are preserved as archival artifacts and later rebuilt as Mattermost Playbooks or slash commands post-cutover."}
          </p>

          <Sub id="p1-enrich" eyebrow="§3.3">Enrich the export (stage: enrich)</Sub>
          <p>
            {"Official Slack exports contain file "}
            <em>links</em>
            {", not the files themselves, and those links expire. The enrich stage downloads every "}
            <Mono>url_private</Mono>
            {" referenced in the export and bakes the bytes into the enriched ZIP so your imported Mattermost doesn’t end up with a sea of dead attachment placeholders. The agent runs this unattended; for a typical workspace it’s 1–6 hours of background downloading."}
          </p>
          <Code>{`./migrate.sh enrich`}</Code>
          <p>{"What runs under the hood:"}</p>
          <ol className="list-decimal pl-6 space-y-2 text-[15px] text-slate-300 leading-relaxed">
            <li><Mono>run-slack-advanced-exporter.sh fetch-emails</Mono> — resolves Slack user IDs to email addresses, rewriting <Mono>users.json</Mono> in place inside a copy of the ZIP. Requires <Mono>xoxp-</Mono> with <Mono>users:read.email</Mono>.</li>
            <li><Mono>run-slack-advanced-exporter.sh fetch-attachments</Mono> — walks every message’s <Mono>files[]</Mono> and downloads bytes into <Mono>__uploads/F&lt;id&gt;/&lt;filename&gt;</Mono> inside the enriched ZIP. Requires <Mono>xoxp-</Mono> with <Mono>files:read</Mono>.</li>
            <li><Mono>export-custom-emoji.py</Mono> — hits Slack’s <Mono>emoji.list</Mono> API, downloads every custom emoji image, writes a manifest plus an alias map.</li>
            <li><Mono>extract-phase1-sidecars.py</Mono> — pulls canvases, lists, <Mono>integration_logs.json</Mono>, and any admin CSV / workflow JSON from <Mono>PHASE1_SIDECAR_INPUTS</Mono> or <Mono>PHASE1_WORKFLOW_INPUTS</Mono> into a sidecar bundle.</li>
            <li><Mono>build-artifact-manifest.py</Mono> — rewrites <Mono>manifest.enriched.json</Mono> with hashes for all new artifacts.</li>
          </ol>
          <p>
            {"The ordering matters. Emails before attachments because mmetl uses the email-rewritten "}
            <Mono>users.json</Mono>
            {" to generate user records. Attachments before sidecars because the sidecar extractor wants to know what was covered natively so it doesn’t duplicate."}
          </p>
          <p>
            {"When this stage finishes, run "}
            <Mono>scripts/validate-enrichment-completeness.py --archive workdir/artifacts/enriched/slack-export.enriched.zip --output-json /tmp/enrich.json</Mono>
            {" and read the report. A non-empty "}
            <Mono>missing_file_references</Mono>
            {" array (the operator cards call this “attachments_missing”) means a file was referenced but could not be downloaded, usually because it had already expired or the account lost access. Decide per-file whether acceptable (mark as unrecoverable gap) or worth re-running."}
          </p>

          <Sub id="p1-transform" eyebrow="§3.4">Transform to Mattermost bulk-import format (stage: transform)</Sub>
          <Code>{`./migrate.sh transform`}</Code>
          <p>
            {"Runs "}
            <Mono>mmetl check slack</Mono>
            {" (which exits non-zero if the ZIP is corrupt or has a version Slack changed under you) and then "}
            <Mono>mmetl transform slack</Mono>
            {" with flags needed to produce JSONL output plus a "}
            <Mono>data/bulk-export-attachments/</Mono>
            {" directory. Key flags the skill sets:"}
          </p>
          <ul className="sm-bullet-list">
            <li><Mono>--team &quot;$MATTERMOST_TEAM_NAME&quot;</Mono> — target team name.</li>
            <li><Mono>--default-email-domain</Mono> — only if <Mono>MMETL_DEFAULT_EMAIL_DOMAIN</Mono> is set (use when some Slack users have no email; mmetl fabricates <Mono>&lt;username&gt;@&lt;domain&gt;</Mono>).</li>
            <li><Mono>--skip-empty-emails</Mono>, <Mono>--discard-invalid-props</Mono> — passed via <Mono>MMETL_EXTRA_FLAGS</Mono> if needed.</li>
            <li><Mono>--attachments-dir data/bulk-export-attachments</Mono> — forces binary files into the canonical import location.</li>
          </ul>
          <p>
            <strong>Important:</strong> mmetl is Linux and macOS only. Running it on Windows corrupts the JSONL. The bootstrap script doesn’t install a Windows binary for this reason. If you’re on Windows, either use WSL or run Phase 1 on a Mac/Linux machine and SCP the result.
          </p>

          <Sub id="p1-package" eyebrow="§3.5">Patch and package (stage: package)</Sub>
          <p>{"mmetl gets you close but not all the way. Three things still need patching into the JSONL:"}</p>
          <ol className="list-decimal pl-6 space-y-1.5 text-[15px] text-slate-300 leading-relaxed">
            <li>Custom emoji objects (must go before the first <Mono>team</Mono> line).</li>
            <li>Archive channels for sidecar content (<Mono>slack-canvases-archive</Mono>, <Mono>slack-lists-archive</Mono>, <Mono>slack-export-admin</Mono>), and a post per canvas, list, or admin artifact that attaches the sidecar file.</li>
            <li>User membership into those archive channels (otherwise no one can see them in Mattermost).</li>
          </ol>
          <Code>{`./migrate.sh package`}</Code>
          <p>
            {"Runs "}
            <Mono>patch-phase1-import.py</Mono>
            {" (does the above) and "}
            <Mono>package-phase1-import.py</Mono>
            {" (zips the JSONL + attachments tree + emoji images + sidecars into "}
            <Mono>mattermost-bulk-import.zip</Mono>
            {" and writes "}
            <Mono>manifest.import-ready.json</Mono>
            {"). Archive channel names are configurable via "}
            <Mono>PHASE1_SIDECAR_CHANNELS</Mono>
            {"; the default is the three listed above. You can also pick a specific "}
            <Mono>PHASE1_ARCHIVE_USER</Mono>
            {" as the author of sidecar posts (defaults to the first admin in the export)."}
          </p>

          <Sub id="p1-verify" eyebrow="§3.6">Verify and build the evidence pack (stage: verify)</Sub>
          <p>
            {"This is the most important stage because it catches silent data loss."}
          </p>
          <Code>{`./migrate.sh verify`}</Code>
          <p>{"It runs five validators:"}</p>
          <ol className="list-decimal pl-6 space-y-2 text-[15px] text-slate-300 leading-relaxed">
            <li><Mono>validate-phase1-artifacts.py</Mono> — hashes in <Mono>manifest.*.json</Mono> match files on disk; required artifacts (ZIP, CSV, JSONL, final ZIP) all exist.</li>
            <li><Mono>validate-phase1-jsonl.py</Mono> — JSONL is well-ordered (version, emoji, team, channel, user, post, direct_channel, direct_post), every <Mono>thread_ts</Mono> reference is to an earlier post, every channel has at least one member, counts are non-zero.</li>
            <li><Mono>validate-enrichment-completeness.py</Mono> — every <Mono>files[]</Mono> entry in the enriched ZIP has a downloaded binary; every user in <Mono>users.json</Mono> has an email (or a documented exception).</li>
            <li><Mono>reconcile-phase1-counts.py</Mono> — message counts across raw ZIP, enriched ZIP, channel-audit CSV, and JSONL all agree within tolerance. Channels in the audit CSV but missing from the JSONL are reported as discrepancies with severity.</li>
            <li><Mono>export-integration-inventory.py</Mono> — parses <Mono>integration_logs.json</Mono> and emits <Mono>integration-inventory.md</Mono>, a concrete list of bots, webhooks, and apps that must be rebuilt in Mattermost post-cutover.</li>
          </ol>
          <p>
            {"Then it assembles the evidence pack ("}
            <Mono>build-migration-evidence-pack.py</Mono>
            {") and runs the secret scanner ("}
            <Mono>scan-and-redact-migration-secrets.py</Mono>
            {") across "}
            <Mono>workdir/artifacts/reports/</Mono>
            {" and "}
            <Mono>config.env</Mono>
            {". A non-zero exit from the scanner means it found a secret somewhere in generated reports; decide whether to redact and re-share or accept."}
          </p>
          <p>
            {"Open "}
            <Mono>workdir/artifacts/reports/verification.md</Mono>
            {" and read it. If any reconciliation line item is red, "}
            <strong>stop and resolve it before handoff</strong>
            {". Phase 2 rejects a handoff with unresolved criticals; fixing it now is easier than fixing it mid-cutover."}
          </p>

          <Sub id="p1-handoff" eyebrow="§3.7">Handoff (stage: handoff)</Sub>
          <Code>{`./migrate.sh handoff`}</Code>
          <p>{"Emits the three artifacts Phase 2 needs to trust your bundle:"}</p>
          <ul className="sm-bullet-list">
            <li><Mono>handoff.md</Mono> — human-readable summary for you and the war room.</li>
            <li>
              <Mono>handoff.json</Mono> — the machine-readable contract. Contains <Mono>schema_version</Mono>, <Mono>generated_at</Mono>, <Mono>workspace</Mono>, <Mono>plan_tier</Mono>, <Mono>export_basis</Mono>, <Mono>final_package.path</Mono>, <Mono>final_package.sha256</Mono>, <Mono>jsonl_path</Mono>, <Mono>manifests[]</Mono>, counts (users, channels, posts, DMs, emoji, attachments), <Mono>sidecar_channels[]</Mono>, and <Mono>known_gaps[]</Mono>.
            </li>
            <li><Mono>unresolved-gaps.md</Mono> — one entry per classified gap, each with disposition class (<Mono>native-importable</Mono> / <Mono>sidecar-only</Mono> / <Mono>manual-rebuild</Mono> / <Mono>unrecoverable</Mono>).</li>
          </ul>
          <p>
            {"The final ZIP is at "}
            <Mono>workdir/artifacts/import-ready/mattermost-bulk-import.zip</Mono>
            {". Its SHA-256 is in "}
            <Mono>manifest.import-ready.json</Mono>
            {" and, crucially, also in "}
            <Mono>handoff.json.final_package.sha256</Mono>
            {". Phase 2 refuses to import a ZIP whose hash does not match the handoff’s claimed hash, no matter how close the other metadata is."}
          </p>
        </EC>

        {/* PHASE 2 STAGES IN DETAIL */}
        <EC>
          <SectionHeader id="phase-2-stages" eyebrow="Part 4 · Phase 2" title="Driving Phase 2 — deploy, rehearse, cut over." />
          <p>
            {"Phase 2 runs from the same workstation as Phase 1. It does not need the Phase 1 ZIP to still exist on disk as long as "}
            <Mono>HANDOFF_JSON</Mono>
            {" points at a readable location with the final ZIP reachable from there."}
          </p>

          <Sub eyebrow="Setup">Open a fresh session, copy the config</Sub>
          <Code>
{`cd ~/slack-migration/acme
cp ~/.claude/skills/slack-migration-to-mattermost-phase-2-setup-and-import/config.env.example ./config.env.phase2
echo "HANDOFF_JSON=$(pwd)/workdir/artifacts/reports/handoff.json"    >> ./config.env.phase2
echo "IMPORT_ZIP=$(pwd)/workdir/artifacts/import-ready/mattermost-bulk-import.zip" >> ./config.env.phase2
$EDITOR ./config.env.phase2

export PHASE2_CONFIG=./config.env.phase2`}
          </Code>
          <p>
            {"Minimum fields for a typical VPS deployment with self-hosted PostgreSQL on the same box:"}
          </p>
          <Code>
{`WORKSPACE_NAME="acme-slack"
PHASE2_WORKSPACE_ROOT="./workdir-phase2"
HANDOFF_JSON="<abs path>"
IMPORT_ZIP="<abs path>"

MATTERMOST_URL="https://chat.acme.com"
MATTERMOST_ADMIN_USER="admin"
MATTERMOST_ADMIN_PASS="<strong random password>"
MATTERMOST_TEAM_NAME="acme"

TARGET_HOST="chat.acme.com"
TARGET_SSH_USER="root"
DEPLOY_METHOD="apt"          # "apt" for production, "docker" for staging
PROVISION_MODE="ssh"
DEPLOY_MODE="ssh"

POSTGRES_DSN="postgres://mmuser:<pwd>@localhost:5432/mattermost?sslmode=disable"
SMOKE_DATABASE_URL="${"${POSTGRES_DSN}"}"

SMTP_SERVER="smtp.postmarkapp.com"
SMTP_PORT="587"
SMTP_USERNAME="<postmark-token>"
SMTP_PASSWORD="<postmark-token>"
SMTP_TEST_EMAIL="admin@acme.com"

CLOUDFLARE_ENABLED="1"
CLOUDFLARE_MODE="plan"                # "plan" prints, "execute" uses CF API
CLOUDFLARE_API_TOKEN="<zone edit token>"
CF_ZONE_ID="<zone id for acme.com>"
ORIGIN_SERVER_IP="<IP address>"

ROLLBACK_OWNER="Jane Admin"`}
          </Code>

          <p>{"Then the Phase 2 pipeline:"}</p>
          <Code>{`intake  ->  render-config  ->  edge  ->  provision  ->  deploy  ->  verify-live
        ->  staging  ->  restore  ->  ready  ->  cutover`}</Code>

          <Sub id="p2-intake" eyebrow="§4.1">Intake the Phase 1 handoff (stage: intake)</Sub>
          <Code>{`./operate.sh intake`}</Code>
          <p>
            {"Runs "}
            <Mono>build-phase2-intake-manifest.py</Mono>
            {" (snapshots the handoff + final ZIP to the Phase 2 workdir and hashes them) and "}
            <Mono>validate-phase2-intake.py</Mono>
            {" (verifies handoff.json is well-formed, the hash claimed inside matches the ZIP on disk, and the sidecar channel list is explicit). Output: "}
            <Mono>workdir-phase2/reports/phase2-intake-report.json</Mono>
            {"."}
          </p>
          <p>{"If this fails, do not force through. Typical failure modes:"}</p>
          <ul className="sm-bullet-list">
            <li>The ZIP moved between phases and the hash no longer matches → re-copy or re-run Phase 1’s handoff.</li>
            <li><Mono>sidecar_channels[]</Mono> is empty but Phase 1 produced sidecars → bug in Phase 1 config. Re-run <Mono>./migrate.sh handoff</Mono>.</li>
          </ul>

          <Sub id="p2-render" eyebrow="§4.2">Render config (stage: render-config)</Sub>
          <Code>{`./operate.sh render-config`}</Code>
          <p>
            {"Emits "}
            <Mono>workdir-phase2/rendered/config.json</Mono>
            {" (Mattermost server config), "}
            <Mono>workdir-phase2/rendered/mattermost.nginx.conf</Mono>
            {" (Nginx vhost), and "}
            <Mono>workdir-phase2/reports/config-validation.json</Mono>
            {". Key settings the import needs:"}
          </p>
          <ul className="sm-bullet-list">
            <li><Mono>SiteURL</Mono> = <Mono>$MATTERMOST_URL</Mono></li>
            <li><Mono>ListenAddress</Mono> = <Mono>127.0.0.1:8065</Mono> (never exposed directly)</li>
            <li><Mono>SqlSettings.DataSource</Mono> = <Mono>$POSTGRES_DSN</Mono></li>
            <li><Mono>MaxPostSize</Mono> = <Mono>16383</Mono> (Slack allows 40000; default 4000 would truncate)</li>
            <li><Mono>MaxFileSize</Mono> = <Mono>52428800</Mono> (50 MB)</li>
            <li><Mono>EnableOpenServer</Mono> = true (required for bulk import to create users)</li>
            <li><Mono>EnableSignUpWithEmail</Mono> = true + <Mono>RequireEmailVerification</Mono> = false</li>
            <li>SMTP block from <Mono>$SMTP_*</Mono></li>
            <li><Mono>AllowCorsFrom</Mono> = whatever you put in <Mono>ALLOW_CORS_ORIGINS</Mono> if fronted by multiple hostnames</li>
          </ul>

          <Sub id="p2-edge" eyebrow="§4.3">Cloudflare edge (stage: edge)</Sub>
          <Code>{`./operate.sh edge`}</Code>
          <p>
            {"Only runs if "}
            <Mono>CLOUDFLARE_ENABLED=1</Mono>
            {". In "}
            <Mono>plan</Mono>
            {" mode it prints the DNS records and origin-CA cert it "}
            <em>would</em>
            {" create. In "}
            <Mono>execute</Mono>
            {" mode (requires an Edit-scoped "}
            <Mono>CLOUDFLARE_API_TOKEN</Mono>
            {") it calls the Cloudflare API to:"}
          </p>
          <ol className="list-decimal pl-6 space-y-1.5 text-[15px] text-slate-300 leading-relaxed">
            <li>Create/update <Mono>chat.acme.com</Mono> A record pointing at <Mono>$ORIGIN_SERVER_IP</Mono>, orange-clouded.</li>
            <li>Generate a 15-year <J t="cloudflare-origin-ca">Cloudflare Origin CA</J> certificate for <Mono>chat.acme.com</Mono>, save to <Mono>workdir-phase2/rendered/origin.{`{pem,-key.pem}`}</Mono>.</li>
            <li>Optionally create a second <J t="orange-cloud">grey-clouded</J> <Mono>calls.acme.com</Mono> for the Calls plugin’s UDP 8443 traffic.</li>
          </ol>

          <Sub id="p2-provision" eyebrow="§4.4">Provision the host (stage: provision)</Sub>
          <Code>{`./operate.sh provision`}</Code>
          <p>
            {"Generates "}
            <Mono>provision-host.sh</Mono>
            {" (plan script) and in ssh mode executes it over SSH against TARGET_HOST. What the plan does:"}
          </p>
          <ol className="list-decimal pl-6 space-y-1.5 text-[15px] text-slate-300 leading-relaxed">
            <li><Mono>apt-get install -y curl jq nginx ufw fail2ban unattended-upgrades postgresql-client</Mono> (or <Mono>postgresql</Mono> too when local PG is provisioned).</li>
            <li>Opens UFW for 22/tcp, 80/tcp, 443/tcp, 8443/udp (Calls). Enables UFW.</li>
            <li>Enables fail2ban and unattended-upgrades.</li>
            <li>If local Postgres is provisioned, creates the Mattermost role + database from the DSN credentials.</li>
          </ol>
          <p>
            {"Runs in plan mode first (just prints the script) if you want to eyeball it. ssh mode reads the DSN envs, packages them into a one-shot bash invocation, and pipes the plan script over SSH. The target must have Python3."}
          </p>

          <Sub id="p2-deploy" eyebrow="§4.5">Deploy Mattermost + Nginx (stage: deploy)</Sub>
          <Code>{`./operate.sh deploy`}</Code>
          <p>{"Runs deploy-mattermost-stack.sh in whichever mode you set. For APT:"}</p>
          <ol className="list-decimal pl-6 space-y-1.5 text-[15px] text-slate-300 leading-relaxed">
            <li><Mono>curl -o- https://deb.packages.mattermost.com/repo-setup.sh | bash -s mattermost</Mono></li>
            <li><Mono>apt-get install -y mattermost nginx</Mono></li>
            <li>Install rendered <Mono>config.json</Mono> to <Mono>/opt/mattermost/config/config.json</Mono> with <Mono>0600 mattermost:mattermost</Mono>.</li>
            <li>Install rendered <Mono>mattermost.nginx.conf</Mono> to <Mono>/etc/nginx/sites-available/</Mono>, symlink, install origin cert + key if present.</li>
            <li><Mono>nginx -t</Mono> then <Mono>systemctl enable --now nginx</Mono> and <Mono>systemctl enable --now mattermost</Mono>.</li>
          </ol>
          <p>
            <strong>Ubuntu 25.10 workaround:</strong> the Mattermost APT package isn&rsquo;t available there yet. Fall back with <Mono>DEPLOY_METHOD=docker</Mono> and re-run. Docker is <em>not</em> recommended for production HA (Mattermost’s own docs say so); use APT for anything that needs to scale beyond a single node.
          </p>

          <Sub id="p2-verify-live" eyebrow="§4.6">Verify live stack (stage: verify-live)</Sub>
          <Code>{`./operate.sh verify-live`}</Code>
          <p>{"Three HTTPS probes, 6 retries, 5 s apart to absorb JIT startup:"}</p>
          <ol className="list-decimal pl-6 space-y-1.5 text-[15px] text-slate-300 leading-relaxed">
            <li><Mono>GET /api/v4/system/ping</Mono> → expect 200 + JSON <Mono>{`{"status":"OK"}`}</Mono>.</li>
            <li>WebSocket upgrade against <Mono>/api/v4/websocket</Mono> → expect 101 Switching Protocols.</li>
            <li>SMTP reachability: TCP connect to <Mono>$SMTP_SERVER:$SMTP_PORT</Mono> + STARTTLS negotiation.</li>
          </ol>
          <p>
            {"If "}
            <Mono>CLOUDFLARE_ENABLED=1</Mono>
            {", also runs "}
            <Mono>verify-cloudflare-edge.py</Mono>
            {" which checks DNS A record resolves and is proxied, Cloudflare TLS offers a Cloudflare-issued cert (traffic goes through CF), origin cert is installed and not expired, and "}
            <Mono>calls.yourdomain.com</Mono>
            {" (if set) is DNS-only."}
          </p>
          <p>
            {"Typical failures: WebSocket fails → Nginx config missing the <Mono>Upgrade</Mono>/<Mono>Connection: upgrade</Mono> block; SMTP fails → provider blocks port 587 for new accounts or credentials are wrong (test with "}
            <Mono>swaks</Mono>
            {" to isolate)."}
          </p>

          <Sub id="p2-staging" eyebrow="§4.7">Staging rehearsal (stage: staging)</Sub>
          <Code>{`./operate.sh staging`}</Code>
          <p>
            {"This is the single most valuable stage in Phase 2. Safety: "}
            <Mono>run-staging-rehearsal.sh</Mono>
            {" refuses to run against a URL that looks like production unless "}
            <Mono>ALLOW_NON_STAGING=1</Mono>
            {". Default heuristic: URL is localhost, 127.0.0.1, or contains the string “staging”."}
          </p>

          <div className="sm-insight-card">
            <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-cyan-300 mb-2">Recommended staging path</p>
            <p className="text-sm md:text-[15px] text-slate-200 leading-relaxed mb-3">
              A second cheap VPS that mirrors production at ~$4–10/mo, kept alive only for the rehearsal window.
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-sm text-slate-300 leading-relaxed">
              <li>Order a staging VPS (Hetzner CX22 €4/mo, Contabo VPS S $4/mo, OVH VLE-1). Ubuntu 24.04, same SSH key.</li>
              <li>Add a DNS record for <Mono>staging.chat.yourcompany.com</Mono> pointing at the VPS’s IP (grey-clouded fine).</li>
              <li>Copy your production config to <Mono>config.env.phase2.staging</Mono> and override: <Mono>STAGING_URL</Mono>, <Mono>TARGET_HOST</Mono>, <Mono>MATTERMOST_URL</Mono>.</li>
              <li>Run the full Phase 2 pipeline: <Mono>PHASE2_CONFIG=./config.env.phase2.staging ./operate.sh intake render-config provision deploy verify-live staging</Mono>.</li>
              <li>After cutover is confirmed green on production, cancel the staging VPS. Total cost ~&lt;$10 for a full-scale dress rehearsal.</li>
            </ol>
          </div>

          <p>
            {"What it does: "}
            <Mono>mmctl auth login</Mono>
            {" with admin creds → "}
            <Mono>mmctl import upload</Mono>
            {" streams the final ZIP onto the server → "}
            <Mono>mmctl import list available --json</Mono>
            {" → "}
            <Mono>mmctl import process &lt;filename&gt;</Mono>
            {" kicks off the job → "}
            <Mono>monitor-import.sh</Mono>
            {" polls "}
            <Mono>mmctl import job show --json</Mono>
            {" every few seconds, writing one JSONL line per poll to "}
            <Mono>import-watch.*.jsonl</Mono>
            {", until job hits success or error. Post-import smoke tests: "}
            <Mono>run-import-smoke-tests.py</Mono>
            {" hits PostgreSQL directly and counts "}
            <Mono>users</Mono>, <Mono>channels</Mono>, <Mono>posts</Mono>
            {". "}
            <Mono>reconcile-handoff-vs-import.py</Mono>
            {" compares against "}
            <Mono>handoff.json.counts</Mono>
            {". Anything missing is logged as a discrepancy."}
          </p>

          <Sub id="p2-restore" eyebrow="§4.8">Restore drill (stage: restore, optional but recommended)</Sub>
          <Code>{`./operate.sh restore`}</Code>
          <p>
            {"Before cutover, prove that your backup strategy works. Configure "}
            <Mono>BACKUP_PATH</Mono>
            {" and "}
            <Mono>SCRATCH_DB_URL</Mono>
            {" (a different Postgres you can safely restore into). The script runs "}
            <Mono>pg_restore</Mono>
            {" into the scratch DB and reports on success. An un-restored backup is not a backup; it’s wishful thinking. Do the drill."}
          </p>

          <Sub id="p2-ready" eyebrow="§4.9">Compute readiness (stage: ready)</Sub>
          <Code>{`./operate.sh ready`}</Code>
          <p>
            {"Runs "}
            <Mono>validate-cutover-readiness.py</Mono>
            {", "}
            <Mono>generate-readiness-score.py</Mono>
            {", and "}
            <Mono>generate-phase2-readiness.py</Mono>
            {" to produce the fail-closed gate covered in the next section."}
          </p>

          <Sub id="p2-cutover" eyebrow="§4.10">Cutover (stage: cutover)</Sub>
          <p>{"Only run after ready says green and the war room has explicitly called go."}</p>
          <Code>{`./operate.sh cutover`}</Code>
          <p>
            {"Under the hood, "}
            <Mono>execute-production-cutover.sh</Mono>
            {" runs the same import-upload-process-monitor loop as staging, plus:"}
          </p>
          <ol className="list-decimal pl-6 space-y-1.5 text-[15px] text-slate-300 leading-relaxed">
            <li>Post-import smoke (against production DB).</li>
            <li>Reconciliation vs. handoff (production observed counts).</li>
            <li>Activation proof: if <Mono>SMTP_TEST_EMAIL</Mono> is set, triggers a password-reset flow against the live Mattermost and confirms the email arrives with a reset link that resolves to <Mono>https://chat.acme.com/reset_password</Mono>.</li>
          </ol>
          <p>
            {"Outputs land in "}
            <Mono>workdir-phase2/reports/cutover/</Mono>
            {" as timestamped files. The final "}
            <Mono>cutover-status.&lt;timestamp&gt;.json.status</Mono>
            {" (grab the newest with "}
            <Mono>ls -t workdir-phase2/reports/cutover/cutover-status.*.json | head -1</Mono>
            {") is success or failed. Activation proof lands in "}
            <Mono>workdir-phase2/reports/latest-activation.json</Mono>
            {"."}
          </p>

          <div className="sm-callout" style={{ borderLeftColor: "rgba(244, 63, 94, 0.55)" }}>
            <p>
              <strong>Rollback:</strong>
            </p>
            <p>
              <Mono>ROLLBACK_CONFIRMATION=&quot;I_UNDERSTAND_THIS_RESTORES_BACKUPS&quot; ./operate.sh rollback</Mono>
            </p>
            <p>
              The phrase is required verbatim by <Mono>rollback-cutover.sh</Mono>. The script refuses to run without it, on purpose: rollback restores the DB and optionally <Mono>/opt/mattermost/config</Mono> and <Mono>/opt/mattermost/data</Mono>, which is destructive.
            </p>
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== THE ASYMMETRIC BET — CALLOUT ========== */}
      <section data-section="asymmetric">
        <EC>
          <h2 className="sm-section-title mb-6 mt-4 text-white">An asymmetric bet.</h2>
          <p>
            {
              "The single most important property of this whole migration, and the reason it is worth running even if you are a little skeptical: "
            }
            <strong>your real Slack keeps working the entire time</strong>
            {". You never touch it until you have independently verified Mattermost is good."}
          </p>

          <div className="sm-callout sm-callout-emerald">
            <p>
              You order a Hetzner server. The agent sets it up and imports your history into it. You run a full <em>staging</em> rehearsal on a throwaway copy. Slack is untouched.
            </p>
            <p>
              You log into the new Mattermost yourself, click around, read your DMs, spot-check the big channels. Still untouched.
            </p>
            <p>
              You optionally activate a few volunteers on Mattermost and let them use both in parallel for a few days. Slack is still source of truth.
            </p>
            <p>
              <strong>Only when you are satisfied</strong> do you flip Slack to read-only and do the final cutover. Even then, Slack stays accessible as a read-only archive until you choose to downgrade or cancel.
            </p>
          </div>

          <p>
            {"If anything goes wrong at any point before cutover, you cancel the Hetzner server, delete the workdir on your laptop, and you are out the price of a few weeks of server rent and a month of Postmark. Your Slack workspace is unaffected, because the migration never wrote to it: Phase 1 only ever read from Slack; Phase 2 only ever wrote to the new server. There are no Slack credentials in Phase 2's config at all."}
          </p>
          <p>
            {"That is the "}<J t="asymmetric-bet">asymmetric bet</J>{". Downside is small and recoverable. Upside is tens of thousands of dollars a year, indefinitely."}
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== DATA PRESERVATION ========== */}
      <section data-section="preservation">
        <EC>
          <h2 className="sm-section-title mb-6 mt-4 text-white">What survives the move.</h2>
          <p>
            {
              "The question every internal stakeholder will ask — legal, HR, the people who ran Slackbot automations, the guy with four hundred saved items — is some variant of "
            }
            <em>“does my X survive?”</em>
            {" There are three possible answers, and the skill classifies each Slack feature into exactly one of them. "}
            <strong>Native</strong> means it imports as first-class Mattermost data: public and private channel messages, DMs, threads, reactions, file attachments, pinned messages, channel topics, custom emoji images. <strong><J t="sidecar">Sidecar</J></strong> means the content is preserved, but as posts in a dedicated archive channel rather than as native Mattermost objects — canvases, lists, and admin audit CSVs all end up this way. <strong>Unrecoverable</strong> means the content is genuinely not in Slack’s export and cannot be migrated; the best you can do is document it in <J t="unresolved-gaps">unresolved-gaps.md</J>, which the skill generates automatically, and plan a rebuild or an acceptance.
          </p>
          <p>
            {
              "The matrix below lets you filter by disposition and toggle between Business+ and Pro plans. On Business+, most things are native. On Pro, private channels and DMs downgrade because Slack's Free/Pro export simply cannot see content the export token's user is not a party to — you fall back to "
            }
            <J t="track-b">slackdump-primary</J>
            {" and inherit that blind spot. The honest way to handle it is to write the blind spot into "}
            <span className="font-mono text-cyan-200">unresolved-gaps.md</span>
            {" in advance, not to pretend the export sees more than it does."}
          </p>

          <div className="sm-viz-wrap">
            <DataPreservationMatrixViz />
          </div>

          <p>
            {
              "The rule the skills enforce: known-unknowns named in advance are cheaper than unknown-unknowns discovered in production. Anything that doesn't survive as native, and can't be preserved as a sidecar, gets an entry with a classification — "
            }
            <span className="font-mono text-cyan-200">native-importable</span>, <span className="font-mono text-cyan-200">sidecar-only</span>, <span className="font-mono text-cyan-200">manual-rebuild</span>, or <span className="font-mono text-cyan-200">unrecoverable</span>
            {" — so that when a user says at T+3 days “where are my saved items?”, you already have the answer written down and a rebuild plan."}
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== THE READY GATE ========== */}
      <section data-section="ready-gate">
        <EC>
          <h2 className="sm-section-title mb-6 mt-4 text-white">The fail-closed gate.</h2>
          <p>
            {
              "Production cutover is the moment when every bad decision earlier in the pipeline stops being recoverable for free. The skill treats it that way: the "
            }
            <span className="font-mono text-emerald-200">ready</span>
            {" stage is a fail-closed gate between everything and the production import."}
          </p>

          <div className="sm-insight-card">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30">
                <Lock className="w-4 h-4 text-emerald-300" />
              </div>
              <p className="text-[11px] font-mono text-emerald-300 uppercase tracking-[0.25em]">
                cutover-readiness.json
              </p>
            </div>
            <p className="text-base md:text-lg leading-relaxed text-slate-200 mb-4">
              The gate reads every prior report plus one environment variable, and emits <span className="font-mono text-white">status: “ready”</span> or <span className="font-mono text-white">status: “blocked”</span>. There is no middle state. If any of the inputs below is missing or stale, it blocks.
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-300 font-mono">
              {[
                "phase2-intake-report.json",
                "config-validation.json",
                "live-stack.md",
                "latest-staging.json",
                "latest-smoke.json",
                "latest-reconciliation.json",
                "latest-restore.json",
                "ROLLBACK_OWNER",
              ].map((input) => (
                <li key={input} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{input}</span>
                </li>
              ))}
            </ul>
          </div>

          <p>
            {
              "The point of fail-closed is that ambiguity at cutover is catastrophic. If you cannot produce evidence that staging passed, the gate assumes staging failed. If you cannot name the rollback owner, the gate assumes no one is empowered to pull the trigger. That framing is not paranoid; it is the same principle as a safety-critical interlock in any other engineering domain."
            }
          </p>
          <p>
            {
              "There is a closely related rule, almost comically low-tech, that the skill enforces: the rollback owner must be "
            }
            <em>a name and an email</em>
            {", populated into "}
            <span className="font-mono text-sm">ROLLBACK_OWNER</span>
            {" before the gate is allowed to pass. Not “whoever is on call.” Not a team alias. A specific human who has pre-committed to being the one who calls the abort. In practice this is usually the operator running the migration, or their CTO. The point is to remove ambiguity at the exact moment it would otherwise cost you."}
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== MCP WORKED EXAMPLES ========== */}
      <section data-section="mcp-examples">
        <EC>
          <SectionHeader id="mcp-examples" eyebrow="§10.8" title="MCP worked examples — what each server unlocks." />
          <p>
            {"You installed MCP servers back in §1.5. Here is what each one actually gives the agent, with concrete prompts you can paste."}
          </p>

          <Sub eyebrow="Slack MCP (Anthropic official, xoxb-)">Read access while Slack is still alive</Sub>
          <ul className="sm-bullet-list">
            <li><em>“Use the Slack MCP to count the total messages in #general over the last 90 days and compare to Phase 1’s channel-audit CSV for the same channel.”</em></li>
            <li><em>“Use the Slack MCP to list every user whose email ends in @acme.com but who hasn’t posted in 6 months. I want to decide whether to exclude them from the migration.”</em></li>
            <li><em>“Fetch the 3 most-recent messages in the support channel so I can compare them byte-for-byte after import.”</em></li>
          </ul>

          <Sub eyebrow="Slack MCP stealth (korotovsky, xoxc- + xoxd-)">Full visibility for gap-fill verification</Sub>
          <ul className="sm-bullet-list">
            <li><em>“Via the stealth Slack MCP, confirm that my export ZIP includes all my own DMs with Bob. The export should contain X messages; tell me if anything’s missing.”</em></li>
          </ul>

          <Sub eyebrow="Playwright MCP">Drives a real browser for UI-only work</Sub>
          <ul className="sm-bullet-list">
            <li><em>“Use Playwright MCP to log into Slack admin and start a workspace export for dates 2023-01-01 to 2026-04-15. Wait for the email, click the download link, save the ZIP to ~/Downloads/, and tell me its SHA256.”</em></li>
            <li><em>“In the Mattermost System Console, use Playwright to toggle EnableOpenServer=false after the import finishes. I don’t want to hand-edit config.json just for this.”</em></li>
          </ul>

          <Sub eyebrow="Mattermost MCP (community, admin PAT)">Direct API access to live Mattermost</Sub>
          <ul className="sm-bullet-list">
            <li><em>“Via the Mattermost MCP, how many users have activated (non-zero last_activity_at) and how many are dormant?”</em></li>
            <li><em>“List every bot user on the new Mattermost, and for each one tell me whether it was present in Phase 1’s integration-inventory.”</em></li>
            <li><em>“Create a test post in #migration-check as the admin user, then delete it. I’m verifying the admin PAT works.”</em></li>
          </ul>

          <p>
            {"You do not have to use any of them. The skill runs end-to-end without them. They are accelerators for verification and one-off operator questions that would otherwise require hand-driven browsers or SQL."}
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== CUTOVER DAY ========== */}
      <section data-section="cutover-day">
        <EC>
          <SectionHeader id="cutover-day" eyebrow="§4.13" title="Cutover day, minute by minute." />
          <p>
            {
              "The thing non-technical operators worry about most is the moment where the old and new systems switch. It is actually the most orchestrated, best-narrated part of the whole process, because the skill has been thinking about cutover since before it was written. Here is what it looks like on your screen."
            }
          </p>
          <p>
            {
              "At T minus sixty minutes, you paste a short sentence asking the agent to run "
            }
            <span className="font-mono text-emerald-200">ready</span>
            {" one more time. The agent re-reads every report and emits a readiness score with each category graded green. At T minus fifteen, you flip Slack to read-only yourself, in a browser tab — this is a human-in-the-loop step on purpose — and post the freeze notice from the comms kit. At T equals zero, you paste: “Run Phase 2 stage "}
            <span className="font-mono text-emerald-200">cutover</span>
            {" against production. Pause before any destructive step and explain it to me.”"}
          </p>
          <p>
            {
              "The agent then asks for approval, one command at a time, in roughly this sequence: SSH sanity-check the service on the target, authenticate to Mattermost as admin, upload the bulk-import ZIP, list the uploaded filename, kick off the import job, tail the server log, count imported users, and confirm the ping endpoint still serves. Between upload and kickoff there is usually one last decision point; between kickoff and smoke-test there is fifteen to thirty minutes of the agent streaming JSON progress lines while you drink coffee."
            }
          </p>

          <div className="sm-viz-wrap">
            <CutoverSimulatorViz />
          </div>

          <p>
            {
              "Three things to internalize about the stream above. First: every single approval is an "
            }
            <strong>Approve once</strong>
            {" click, not an “Approve for the rest of the session” click. The approvals are cheap and the alternative is risky. Second: the import is "}
            <J t="idempotent-import">idempotent</J>
            {", which is the reason you can re-run cutover if the network flakes at seventy percent. Mattermost de-duplicates posts by Slack message ID; a second run catches what the first missed without double-posting anything. Third: if anything goes sideways after the import job completes, rollback is one command with a deliberately annoying confirmation phrase baked in: "}
            <span className="font-mono text-xs bg-white/[0.04] border border-white/10 rounded px-1.5 py-0.5">ROLLBACK_CONFIRMATION=I_UNDERSTAND_THIS_RESTORES_BACKUPS</span>
            {". The verbatim phrase is required on purpose; rollback restores the DB from the pre-cutover dump and is not a thing you want to kick off accidentally."}
          </p>
          <p>
            {"Thirty minutes after cutover, you open a browser tab, navigate to "}
            <span className="font-mono text-sm text-cyan-200">https://chat.acme.com/reset_password</span>
            {", enter your own Slack email, click the link that arrives, set a password, and log in. Your whole history is already there. That is the single highest-confidence check, and it takes ninety seconds."}
          </p>

          <Sub id="cutover-sequence" eyebrow="§4.11">The Slack → Mattermost cutover day sequence</Sub>
          <RefTable
            cols={[
              { key: "when", label: "When" },
              { key: "what", label: "What happens" },
            ]}
            rows={[
              { when: <strong>T − 24 h</strong>, what: "Freeze Slack integrations (deactivate bots that auto-post). Send first user announcement: “Tomorrow we move to Mattermost at 10 AM. Slack will go read-only at 09:30. Please log in at chat.acme.com/reset_password using your Slack email starting at 10:15.”" },
              { when: <strong>T − 1 h</strong>, what: <>Final Phase 1 delta export (see baseline+deltas below). Import is idempotent so re-running does not double-post; it only catches new messages.</> },
              { when: <strong>T − 15 min</strong>, what: "Make Slack read-only. In Slack admin: Workspace settings → Permissions → Messages & files → disable posting for everyone except admins." },
              { when: <strong>T = 0</strong>, what: <><Mono>./operate.sh cutover</Mono></> },
              { when: <strong>T + cutover end</strong>, what: <>Confirm the newest <Mono>cutover-status.&lt;ts&gt;.json</Mono> has <Mono>status == &quot;success&quot;</Mono>. Send activation announcement.</> },
              { when: <strong>T + 1 h</strong>, what: <>Monitor <Mono>/opt/mattermost/logs/mattermost.log</Mono> and help desk. Watch for bounced password-reset emails, locked-out users, broken mentions.</> },
              { when: <strong>T + 1 day</strong>, what: <>Check activation count: <Mono>mmctl user list --all --json | jq &apos;length&apos;</Mono>. Nudge stragglers.</> },
              { when: <strong>T + 7 days</strong>, what: "Revoke Slack migration app tokens, delete the Slack admin app. Archive Phase 1 / Phase 2 workdirs to long-term storage as the evidence pack." },
            ]}
          />

          <Sub id="baseline-deltas" eyebrow="§4.12">Baseline + deltas pattern</Sub>
          <p>
            {"For workspaces that take more than a day to export and transform, use the baseline-plus-deltas pattern:"}
          </p>
          <ol className="list-decimal pl-6 space-y-2 text-[15px] text-slate-300 leading-relaxed">
            <li><strong>Baseline:</strong> run the full Phase 1 pipeline at T − several days. Do the Phase 2 staging rehearsal. Do <em>not</em> do production cutover yet.</li>
            <li><strong>Delta N:</strong> every few hours or daily, re-run Phase 1 against the same path (or against a new export covering only the recent range). Run <Mono>./operate.sh staging</Mono> against production; since import is idempotent, this catches new messages without duplicating old ones.</li>
            <li><strong>Final delta:</strong> at T = 0, one last Phase 1 + Phase 2 staging run. Then <Mono>./operate.sh cutover</Mono>, which is now essentially a no-op import of any final messages.</li>
          </ol>
          <p>
            {"Phase 1 ships "}
            <Mono>DELTA-CADENCE-WORKFLOW.md</Mono>
            {" documenting the scheduled export setup. Business+ also supports Slack-side scheduled recurring exports, which are the cleanest way to get deltas; turn that on and combine with "}
            <Mono>SLACK_EXPORT_AUTOMATION=1</Mono>
            {"."}
          </p>

          <Sub eyebrow="§4.13 · Acme Corp, 340 users">What cutover day looks like on your screen</Sub>
          <p>
            {"Here is what you’ll actually see in the Claude Code or Codex desktop app between T-1h and T+30min, assuming a 340-user workspace."}
          </p>
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-400 mt-4">T − 60 min — preflight readiness re-check</p>
          <p>
            {"You paste: "}
            <em>“Run Phase 2 stage ready against production and show me the readiness score.”</em>
            {" You see a log block: “Reading handoff.json... loaded. Checking latest-staging.json... status=success. Checking latest-smoke.json... counts match. Checking latest-reconciliation.json... diffs=[]. Checking ROLLBACK_OWNER... set to ‘Jane Admin’.” Final line: "}
            <Mono>cutover-readiness.json.status = &quot;ready&quot;</Mono>
            {". A rendered "}
            <Mono>readiness-score.md</Mono>
            {" with category scores (intake: 10/10, config: 10/10, etc.). All green."}
          </p>
          <p>
            {"If any category is yellow or red, the agent stops and tells you why. Do not proceed past this point with anything red."}
          </p>

          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-400 mt-4">T − 15 min — freeze Slack, post the notice</p>
          <p>
            {"You do this yourself in a browser tab, not in the agent. Slack admin → Workspace settings → Permissions → Messages &amp; files → disable posting for everyone except admins. Post the T-15m comms template (see §comms kit) into #general."}
          </p>

          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-400 mt-4">T = 0 — kick off the cutover</p>
          <p>
            {"You paste: "}
            <em>“Run Phase 2 stage cutover against production. Pause before any destructive step and explain it to me.”</em>
            {" The agent asks for approval in roughly this sequence (exact count depends on config; expect 6–10):"}
          </p>
          <RefTable
            cols={[
              { key: "prompt", label: "Prompt" },
              { key: "what", label: "What it’s doing" },
              { key: "decision", label: "Decision" },
            ]}
            rows={[
              { prompt: <Mono>ssh deploy@chat.acme.com &apos;sudo systemctl status mattermost&apos;</Mono>, what: "Sanity-check Mattermost is up on target", decision: <span className="text-emerald-300 font-semibold">Approve</span> },
              { prompt: <Mono>mmctl auth login --url https://chat.acme.com …</Mono>, what: "Authenticate as sysadmin", decision: <span className="text-emerald-300 font-semibold">Approve</span> },
              { prompt: <Mono>mmctl import upload … 22-GB.zip</Mono>, what: "Stream the ZIP to the server", decision: <span className="text-emerald-300 font-semibold">Approve</span> },
              { prompt: <Mono>mmctl import list available --json</Mono>, what: "Read back what just landed", decision: <span className="text-emerald-300 font-semibold">Approve</span> },
              { prompt: <Mono>mmctl import process &lt;filename&gt;</Mono>, what: "Start the import job — moment of commit", decision: <span className="text-amber-300 font-semibold">Approve (destructive)</span> },
              { prompt: <Mono>ssh deploy@chat.acme.com &apos;tail -f …/mattermost.log&apos;</Mono>, what: "Tail server log for the import duration", decision: <span className="text-emerald-300 font-semibold">Approve</span> },
              { prompt: <Mono>psql &quot;$POSTGRES_DSN&quot; -c &apos;SELECT COUNT(*) FROM users&apos;</Mono>, what: "Count imported users", decision: <span className="text-emerald-300 font-semibold">Approve</span> },
              { prompt: <Mono>curl -sf https://chat.acme.com/api/v4/system/ping</Mono>, what: "Verify Mattermost still serves", decision: <span className="text-emerald-300 font-semibold">Approve</span> },
            ]}
          />
          <p>
            {"Between “import process” and “post-import count” is the longest wait. For a 340-user workspace with ~1.3 M posts, expect ~15–30 minutes. You’ll see a live stream of lines in the session:"}
          </p>
          <Code>
{`{"ts":"...","state":"pending","progress":0}
{"ts":"...","state":"running","progress":0.12,"posts_imported":154000}
{"ts":"...","state":"running","progress":0.45,"posts_imported":578000}
...
{"ts":"...","state":"success","progress":1.0,"posts_imported":1284903}`}
          </Code>
          <p>
            {"Each line is written to "}
            <Mono>workdir-phase2/reports/cutover/import-watch.*.jsonl</Mono>
            {" so you can re-read them later."}
          </p>

          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-400 mt-4">T + ~20 min — reconciliation + activation</p>
          <Code>
{`reconcile-handoff-vs-import.py: observed 337 users / 142 channels / 1284903 posts
                                 handoff 337 users / 142 channels / 1284903 posts
                                 status: ok (diffs: [])
activation: sending password-reset to admin@acme.com...
activation: reset_link_received = true (proof in latest-activation.json)
cutover-status.2026-04-22T14-31-04Z.json written
status: success`}
          </Code>

          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-400 mt-4">T + 30 min — confirm for yourself</p>
          <p>
            {"New browser tab → "}
            <Mono>https://chat.acme.com/reset_password</Mono>
            {" → your own Slack email → click the link → set password → log in. You should see #general populated with your Slack history. Single highest-confidence check. ~90 seconds."}
          </p>

          <Sub eyebrow="If any step fails">Three common failures</Sub>
          <RefTable
            cols={[
              { key: "err", label: "Error" },
              { key: "fix", label: "Fix" },
            ]}
            rows={[
              {
                err: <Mono>mmctl import upload: 413 Request Entity Too Large</Mono>,
                fix: <>Nginx <Mono>client_max_body_size</Mono> is too small. Raise to <Mono>client_max_body_size 25G;</Mono> in <Mono>/etc/nginx/sites-enabled/mattermost.conf</Mono> and <Mono>sudo systemctl reload nginx</Mono>.</>,
              },
              {
                err: <Mono>{`import job state=error note='user foo@bar.com invalid email'`}</Mono>,
                fix: <>A user record slipped through without a valid email (usually a bot). Either set <Mono>MMETL_DEFAULT_EMAIL_DOMAIN</Mono> in Phase 1 and re-run from transform, or manually delete that user from the JSONL and re-import.</>,
              },
              {
                err: <Mono>activation: reset_link_received = false</Mono>,
                fix: <>SMTP not working. Test with <Mono>swaks</Mono> (see §SMTP walkthrough). Does not block cutover success, but users can’t activate. Fix and re-run only the activation helper.</>,
              },
            ]}
          />

          <Sub eyebrow="What approvals look like in the UI">In Claude Code desktop</Sub>
          <p>
            {"Each approval is a card with: command (grey monospace) + working directory + three buttons — "}
            <strong>Approve once</strong>
            {", "}
            <strong>Approve for the rest of the session</strong>
            {", "}
            <strong>Deny</strong>
            {". Pick "}
            <strong>Approve once</strong>
            {" for each destructive step during cutover. “Approve for the session” is fine during "}
            <Mono>enrich</Mono>
            {" (idempotent, read-only to Slack), but risky during cutover (one approval then covers everything after, including things you haven’t seen the command for yet)."}
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== PART 5 — POST-CUTOVER WEEK ========== */}
      <section data-section="post-cutover">
        <EC>
          <SectionHeader id="post-cutover" eyebrow="Part 5 · post-cutover week" title="Activation, integrations, backups, file storage." />
          <p>
            {"The skills hand off a working Mattermost. Users still need to activate, integrations still need to be rebuilt, and ops still needs to converge."}
          </p>

          <Sub id="activation" eyebrow="§5.1">Activation</Sub>
          <p>
            {"Users receive the password-reset link via "}
            <Mono>$MATTERMOST_URL/reset_password</Mono>
            {". To track activation rate, paste into the agent:"}
          </p>
          <div className="mt-2 mb-4 rounded-lg border border-white/10 bg-black/40 p-3 italic text-[13px] text-slate-300">
            “What’s the current activation rate on Mattermost? List users who still haven’t logged in.”
          </div>
          <p>
            {"The agent runs the relevant "}
            <Mono>mmctl user list</Mono>
            {" query and gives you a count plus a list. Ask it to filter by team, date, or email domain for a narrower slice."}
          </p>
          <p>
            {"If activation is under 50% by T+48h, send a reminder (templates in §comms kit). If under 80% by T+7 days, paste:"}
          </p>
          <div className="mt-2 mb-4 rounded-lg border border-white/10 bg-black/40 p-3 italic text-[13px] text-slate-300">
            “For everyone who hasn’t activated, generate a temporary password, then email each of them with their password and the login URL. Show me the list before you send.”
          </div>
          <p>
            {"The agent generates passwords via "}
            <Mono>mmctl user change-password</Mono>
            {", composes the emails, sends via your Postmark SMTP, and pauses for review before anything goes out. Enable the Calls plugin on day 1 if voice or video matters; it needs its own UDP 8443 and a DNS-only record for "}
            <Mono>calls.acme.com</Mono>
            {" (see "}
            <Mono>references/CALLS-PLUGIN.md</Mono>
            {")."}
          </p>

          <Sub id="integrations" eyebrow="§5.2">Rebuilding integrations</Sub>
          <p>
            <Mono>workdir/artifacts/reports/integration-inventory.md</Mono>
            {" is your checklist. Typical categories:"}
          </p>
          <ul className="sm-bullet-list">
            <li><strong>Incoming webhooks (Slack → Slack):</strong> recreate one Mattermost incoming webhook per Slack one. Update the sender service (GitHub, Datadog, etc.) to POST to the new URL.</li>
            <li><strong>Outgoing webhooks:</strong> same trigger words, new endpoint.</li>
            <li><strong>Slash commands:</strong> recreate. Mattermost’s trigger-word matching differs from Slack’s; test each one.</li>
            <li><strong>Bot users:</strong> Mattermost bot framework is fine, or use a personal access token for light use cases.</li>
            <li><strong>Custom apps:</strong> port to Mattermost’s Plugin API (Go-native) or Apps Framework (HTTP + manifest).</li>
          </ul>
          <p>
            {"For each: add a line to a tracking doc, assign an owner, verify it works, close it out."}
          </p>

          <Sub id="backups-monitoring" eyebrow="§5.3">Backups and monitoring</Sub>
          <p>
            {"Set up "}
            <Mono>pg_dump</Mono>
            {" nightly and ship off-site (Hetzner Storage Box or Cloudflare R2). Example cron:"}
          </p>
          <Code>
{`# on the server, as deploy user
cat > /home/deploy/backup-mattermost.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
DATE=$(date +%Y%m%d)
pg_dump -U mmuser mattermost | gzip > /var/backups/mattermost/mm_\${DATE}.sql.gz
find /var/backups/mattermost -name 'mm_*.sql.gz' -mtime +30 -delete
rclone copy /var/backups/mattermost/mm_\${DATE}.sql.gz r2:mm-backups/
EOF
chmod +x /home/deploy/backup-mattermost.sh
(crontab -l 2>/dev/null; echo "0 3 * * * /home/deploy/backup-mattermost.sh") | crontab -`}
          </Code>
          <p>
            {"Enable Mattermost metrics on port 8067, scrape with Prometheus, dashboard with Grafana (off-box, per Mattermost’s own recommendation). Add fail2ban alerts, UFW logs, and at least one “is chat.acme.com returning 200?” uptime check."}
          </p>

          <Sub id="file-storage" eyebrow="§5.4">File storage — local vs Cloudflare R2</Sub>
          <p>
            {"Default is local at "}
            <Mono>/opt/mattermost/data/</Mono>
            {". For production, consider switching to R2:"}
          </p>
          <Code>
{`{
  "FileSettings": {
    "DriverName": "amazons3",
    "AmazonS3AccessKeyId": "<R2 access key>",
    "AmazonS3SecretAccessKey": "<R2 secret>",
    "AmazonS3Bucket": "mattermost-files",
    "AmazonS3Endpoint": "<accountid>.r2.cloudflarestorage.com",
    "AmazonS3Region": "",
    "AmazonS3SSL": true
  }
}`}
          </Code>
          <p>
            {"R2 pricing: ~$0.015 / GB / month storage, "}
            <strong>no egress fees</strong>
            {". For a 1,000-user org uploading 10 MB / user / month, that’s $1.50 / month of storage plus $0 in egress. Worth it. Migrating existing local files to R2 post-cutover: either use Mattermost’s built-in "}
            <Mono>mmctl</Mono>
            {" migration (newer versions) or "}
            <Mono>rclone</Mono>
            {" from "}
            <Mono>/opt/mattermost/data/</Mono>
            {" into the bucket."}
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== PART 7 — OPERATOR CHECKLIST ========== */}
      <section data-section="operator-checklist">
        <EC>
          <SectionHeader id="operator-checklist" eyebrow="Part 7" title="Operator checklist — print and keep on the desk." />

          <Sub id="two-days-before" eyebrow="§7.1">Two days before</Sub>
          <ul className="sm-bullet-list">
            <li><Mono>./scripts/doctor.sh</Mono> green on the workstation (Phase 1 and Phase 2).</li>
            <li><Mono>./scripts/doctor.sh --require-remote</Mono> green (can SSH non-interactively to the target).</li>
            <li><Mono>./scripts/doctor.sh --require-mcp</Mono> green, if you’re using MCP servers.</li>
            <li>DNS A record for <Mono>chat.acme.com</Mono> exists (orange-clouded if Cloudflare).</li>
            <li>Server ordered and SSH reachable as root.</li>
            <li>SMTP provider set up; <Mono>swaks</Mono> test email arrived.</li>
            <li>Slack plan tier known, export scope decided, legal approval in hand if needed.</li>
          </ul>

          <Sub id="one-day-before" eyebrow="§7.2">One day before</Sub>
          <ul className="sm-bullet-list">
            <li>Full Phase 1 pipeline done once (baseline); <Mono>handoff.json</Mono> + final ZIP + evidence pack exist.</li>
            <li><Mono>./operate.sh intake</Mono> + <Mono>render-config</Mono> + <Mono>provision</Mono> + <Mono>deploy</Mono> + <Mono>verify-live</Mono> green.</li>
            <li><Mono>./operate.sh staging</Mono> green; staging-observed counts match handoff counts.</li>
            <li><Mono>./operate.sh restore</Mono> green (or explicitly waived by rollback owner).</li>
            <li><Mono>./operate.sh ready</Mono> returns <Mono>&quot;status&quot;: &quot;ready&quot;</Mono>.</li>
            <li>First user announcement sent with cutover time + reset URL.</li>
            <li>Help desk bucket / channel named; on-call owner identified.</li>
          </ul>

          <Sub id="cutover-day-checklist" eyebrow="§7.3">Cutover day</Sub>
          <ul className="sm-bullet-list">
            <li>T − 1 h: freeze Slack (admin UI). Start final Phase 1 delta export.</li>
            <li>T − 15 min: confirm <Mono>./operate.sh ready</Mono> still green with the final handoff.</li>
            <li>T = 0: <Mono>./operate.sh cutover</Mono>. Watch the newest <Mono>workdir-phase2/reports/cutover/cutover-status.*.json</Mono>.</li>
            <li>T + cutover: send activation announcement. Watch help desk.</li>
            <li>T + 4 h: <Mono>mmctl user list --all --json | jq &apos;length&apos;</Mono> + spot-check top channels.</li>
            <li>T + 1 day: activation reminder if &lt; 50 %.</li>
            <li>T + 7 days: revoke Slack tokens, delete migration app, archive workdirs to evidence storage.</li>
          </ul>

          <Sub id="if-cutover-fails" eyebrow="§7.4">If cutover fails</Sub>
          <ul className="sm-bullet-list">
            <li>Do not try to fix in place under time pressure. Check the <Mono>note</Mono> field in the newest <Mono>cutover-status.*.json</Mono>.</li>
            <li>If the issue is mechanical (stuck mmctl job, config typo), fix and re-run <Mono>cutover</Mono>; imports are idempotent.</li>
            <li>If the issue is data loss or state corruption, roll back: <Mono>ROLLBACK_CONFIRMATION=I_UNDERSTAND_THIS_RESTORES_BACKUPS ./operate.sh rollback</Mono>. The rollback restores the DB to the pre-cutover backup.</li>
            <li>Unfreeze Slack and tell users you’re rolling back; commit to a new date.</li>
          </ul>
        </EC>
      </section>

      <Divider />

      {/* ========== PART 6 — TROUBLESHOOTING ========== */}
      <section data-section="troubleshooting">
        <EC>
          <SectionHeader id="troubleshooting" eyebrow="Part 6" title="Troubleshooting index." />

          <Sub id="tshoot-p1" eyebrow="§6.1">Phase 1</Sub>
          <RefTable
            cols={[
              { key: "symptom", label: "Symptom" },
              { key: "cause", label: "Likely cause" },
              { key: "fix", label: "Fix" },
            ]}
            rows={[
              {
                symptom: <><Mono>./migrate.sh setup</Mono> can’t find <Mono>slackdump</Mono> or <Mono>mmetl</Mono></>,
                cause: "Go-based tools not on PATH",
                fix: <><Mono>./scripts/bootstrap-tools.sh</Mono> again; add <Mono>$(go env GOPATH)/bin</Mono> to shell rc</>,
              },
              {
                symptom: <><Mono>intake-official-export.py</Mono> fails with &ldquo;invalid ZIP&rdquo;</>,
                cause: "Download truncated or is an HTML error page",
                fix: "Re-download from the admin-email link; verify size matches",
              },
              {
                symptom: <><Mono>slack-advanced-exporter fetch-emails</Mono> returns 403</>,
                cause: <><Mono>SLACK_TOKEN</Mono> lacks <Mono>users:read.email</Mono> scope</>,
                fix: "Reinstall the Slack app with proper scopes, re-issue token",
              },
              {
                symptom: <><Mono>mmetl transform</Mono> panics on some post</>,
                cause: "Rare Slack message schema quirk",
                fix: <>Set <Mono>MMETL_EXTRA_FLAGS=&quot;--discard-invalid-props&quot;</Mono> and re-run transform</>,
              },
              {
                symptom: "Reconciliation shows channels in audit CSV but not JSONL",
                cause: "mmetl dropped them; usually archived channels with zero messages in the window",
                fix: "Classify as native-importable but empty, or extend the export window",
              },
            ]}
          />

          <Sub id="tshoot-p2" eyebrow="§6.2">Phase 2</Sub>
          <RefTable
            cols={[
              { key: "symptom", label: "Symptom" },
              { key: "cause", label: "Likely cause" },
              { key: "fix", label: "Fix" },
            ]}
            rows={[
              {
                symptom: <><Mono>./operate.sh intake</Mono> fails &ldquo;hash mismatch&rdquo;</>,
                cause: "ZIP got re-zipped between phases",
                fix: <>Re-copy the canonical ZIP from Phase 1’s <Mono>import-ready/</Mono></>,
              },
              {
                symptom: <><Mono>./operate.sh deploy</Mono> on Ubuntu 25.10: no <Mono>mattermost</Mono> package</>,
                cause: "Repo doesn’t have a questing build yet",
                fix: <>Switch <Mono>DEPLOY_METHOD=docker</Mono> and re-run; Docker images cover all distros</>,
              },
              {
                symptom: <><Mono>verify-live</Mono> WebSocket check fails</>,
                cause: <>Nginx missing the <Mono>Upgrade</Mono> / <Mono>Connection: upgrade</Mono> block</>,
                fix: <>Re-run <Mono>render-config</Mono>; confirm deploy copied the regenerated nginx conf</>,
              },
              {
                symptom: <><Mono>verify-live</Mono> SMTP fails but provider says creds are right</>,
                cause: "Provider’s outbound port 587 blocked for new accounts",
                fix: <>Test from the server: <Mono>nc -vz $SMTP_SERVER 587</Mono>. Use port 465 + SSL, or contact provider</>,
              },
              {
                symptom: "Staging import stuck in pending for > 10 min",
                cause: "mmctl import worker crashed",
                fix: <>Check <Mono>/opt/mattermost/logs/mattermost.log</Mono>. <Mono>mmctl import job cancel &lt;id&gt;</Mono> and re-process</>,
              },
              {
                symptom: "Reconciliation shows fewer users than handoff claims",
                cause: <><Mono>--skip-empty-emails</Mono> dropped users without emails</>,
                fix: <>Set a fallback <Mono>MMETL_DEFAULT_EMAIL_DOMAIN</Mono> in Phase 1 and re-run</>,
              },
              {
                symptom: "Users report password-reset email lands in spam",
                cause: "SPF / DKIM / DMARC not set for sender domain",
                fix: "Add the records in Cloudflare DNS per your SMTP provider’s docs",
              },
              {
                symptom: "Cutover succeeds but users say &ldquo;I can’t see #general history&rdquo;",
                cause: "They weren’t added to the channel during import",
                fix: <><Mono>mmctl channel users add myteam general &lt;username&gt;</Mono>; investigate why their user_id wasn’t in the JSONL’s channel membership</>,
              },
            ]}
          />

          <Sub id="tshoot-evidence" eyebrow="§6.3">Evidence and audit</Sub>
          <p>
            {"If you need to produce evidence later (compliance, audit, or a &ldquo;prove we migrated this channel&rdquo; question), everything is already on disk:"}
          </p>
          <ul className="sm-bullet-list">
            <li><Mono>workdir/artifacts/reports/evidence-pack.json</Mono> (Phase 1) — hashed manifest of everything produced, with provenance.</li>
            <li><Mono>workdir-phase2/reports/</Mono> (Phase 2) — intake, config, live-stack, staging, smoke, reconciliation, cutover, activation, readiness. Each has JSON and MD siblings.</li>
          </ul>
          <p>
            {"Tar them, encrypt with "}
            <Mono>age</Mono>
            {" or "}
            <Mono>gpg</Mono>
            {", store off-site for as long as your retention policy requires."}
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== 10.7 — RESUMING AN INTERRUPTED MIGRATION ========== */}
      <section data-section="resume">
        <EC>
          <SectionHeader id="resume" eyebrow="§10.7" title="Resuming an interrupted migration." />
          <p>
            {"Migrations take hours to days. Laptops sleep, SSH sessions drop, Cloudflare glitches. Safe-resume playbook:"}
          </p>
          <div className="sm-insight-card">
            <p className="text-[11px] font-mono text-emerald-300 uppercase tracking-[0.25em] mb-2">
              Single most important fact
            </p>
            <p className="text-sm md:text-lg leading-relaxed text-slate-200">
              Both <Mono>./migrate.sh &lt;stage&gt;</Mono> and <Mono>./operate.sh &lt;stage&gt;</Mono> are <strong>idempotent per stage</strong>. Re-running a stage is always safe unless noted below. The skill reads the existing artifact tree, notices what’s already done, and either short-circuits or re-derives.
            </p>
          </div>

          <Sub eyebrow="How to figure out where you are">Ask the agent</Sub>
          <p>
            <em>“Read the Phase 1 resume.md prompt and follow it”</em>
            {" (or the Phase 2 equivalent). The agent will:"}
          </p>
          <ol className="list-decimal pl-6 space-y-1.5 text-[15px] text-slate-300 leading-relaxed">
            <li>Inspect <Mono>workdir/artifacts/</Mono> or <Mono>workdir-phase2/reports/</Mono> and enumerate what exists.</li>
            <li>Read the <Mono>latest-*.json</Mono> convenience copies (<Mono>latest-staging.json</Mono>, <Mono>latest-smoke.json</Mono>, <Mono>latest-reconciliation.json</Mono>, <Mono>latest-activation.json</Mono>, <Mono>latest-restore.json</Mono>) plus the newest <Mono>cutover-status.*.json</Mono> if present, and tell you the last green stage.</li>
            <li>Recommend exactly one next move.</li>
          </ol>

          <Sub eyebrow="Driving without the agent">Cheat sheet</Sub>
          <RefTable
            cols={[
              { key: "symptom", label: "Symptom" },
              { key: "last", label: "Last green stage" },
              { key: "next", label: "Next action" },
            ]}
            rows={[
              { symptom: <><Mono>manifest.raw.json</Mono> exists but no <Mono>enriched/</Mono> dir</>, last: <Mono>export</Mono>, next: <Mono>./migrate.sh enrich</Mono> },
              { symptom: <><Mono>enriched/slack-export.enriched.zip</Mono> exists but no JSONL</>, last: <Mono>enrich</Mono>, next: <Mono>./migrate.sh transform</Mono> },
              { symptom: <><Mono>mattermost-bulk-import.zip</Mono> exists but no <Mono>verification.md</Mono></>, last: <Mono>package</Mono>, next: <Mono>./migrate.sh verify</Mono> },
              { symptom: <><Mono>handoff.json</Mono> exists</>, last: <Mono>handoff</Mono>, next: "Move to Phase 2 intake" },
              { symptom: <>Any <Mono>cutover-status.*.json</Mono> with <Mono>&quot;status&quot;:&quot;success&quot;</Mono></>, last: "cutover done", next: "Post-cutover operations" },
            ]}
          />

          <Sub eyebrow="Not safely idempotent">Exceptions</Sub>
          <ul className="sm-bullet-list">
            <li><Mono>./operate.sh cutover</Mono> is idempotent (same post IDs don’t double-post), but re-running without re-running <Mono>ready</Mono> could miss server-side changes. Always re-<Mono>ready</Mono> first.</li>
            <li><Mono>./operate.sh rollback</Mono> is destructive and gated by <Mono>ROLLBACK_CONFIRMATION</Mono>. Never re-run after success.</li>
            <li><Mono>./operate.sh edge</Mono> in execute mode creates real DNS records. Re-running with different values modifies DNS. Eyeball the plan first (<Mono>CLOUDFLARE_MODE=plan</Mono>).</li>
          </ul>

          <Sub eyebrow="Partial Phase 1">If enrich died 80% through</Sub>
          <p>
            {"The skill keeps partial downloads under "}
            <Mono>workdir/artifacts/enriched/</Mono>
            {". Re-running "}
            <Mono>./migrate.sh enrich</Mono>
            {" picks up where it left off (resumable via slack-advanced-exporter’s internal state). If files remain stuck, manually delete the specific "}
            <Mono>__uploads/F&lt;id&gt;/</Mono>
            {" directories that are incomplete and re-run."}
          </p>

          <Sub eyebrow="Partial Phase 2">Recovering mid-staging / mid-deploy</Sub>
          <p>
            {"If "}
            <Mono>deploy</Mono>
            {" finished but "}
            <Mono>verify-live</Mono>
            {" hasn’t, re-run <Mono>verify-live</Mono> alone; you don’t need to redeploy. If "}
            <Mono>staging</Mono>
            {" failed mid-import, run "}
            <Mono>monitor-import.sh</Mono>
            {" against the staging "}
            <Mono>mmctl import job list --json</Mono>
            {" to see if the job is still in flight or crashed; if crashed, "}
            <Mono>mmctl import job cancel &lt;id&gt;</Mono>
            {" and re-run."}
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== 10.1 — ACME CORP WORKED EXAMPLE ========== */}
      <section data-section="acme-corp">
        <EC>
          <SectionHeader id="acme-corp" eyebrow="§10.1 · worked example" title="Meet Acme Corp." />
          <p>
            {"Throughout this article and the two skills, a fictitious workspace anchors the examples:"}
          </p>
          <ul className="sm-bullet-list">
            <li><strong>Company:</strong> Acme Corp (340 users, engineering + ops + sales)</li>
            <li><strong>Plan:</strong> Business+ (routed to Track A, the official admin export)</li>
            <li><strong>Target:</strong> <Mono>chat.acme.com</Mono>, served from a Hetzner AX42 in Falkenstein</li>
            <li><strong>Email:</strong> Postmark for transactional SMTP (<Mono>admin@acme.com</Mono> is the rollback owner mailbox)</li>
            <li><strong>Storage:</strong> Cloudflare R2 for files; local <Mono>/opt/mattermost/data/</Mono> during cutover, migrate post-cutover</li>
            <li><strong>Calls:</strong> enabled; <Mono>calls.acme.com</Mono> is grey-clouded so UDP 8443 works</li>
          </ul>

          <Sub eyebrow="Phase 1 config">Acme Corp&rsquo;s Phase 1 config.env</Sub>
          <Code>
{`WORKSPACE_NAME="acme-slack"
PHASE1_WORKSPACE_ROOT="./workdir"
MATTERMOST_TEAM_NAME="acme"
MATTERMOST_TEAM_DISPLAY_NAME="Acme Corp"
SLACK_PLAN_TIER="Business+"

SLACK_EXPORT_ZIP="/Users/jane/Downloads/acme_slack_export_2026-04-15.zip"
SLACK_CHANNEL_AUDIT_CSV="/Users/jane/Downloads/acme_channel_audit_2026-04-15.csv"
SLACK_MEMBER_CSV="/Users/jane/Downloads/acme_member_list_2026-04-15.csv"

SLACK_TOKEN="xoxp-ACME-USER-TOKEN-WITH-READ-SCOPES"
MMETL_DEFAULT_EMAIL_DOMAIN="acme.com"
PHASE1_SIDECAR_INPUTS="/Users/jane/acme/canvases,/Users/jane/acme/lists"
PHASE1_WORKFLOW_INPUTS="/Users/jane/acme/workflows"
PHASE1_SIDECAR_CHANNELS="slack-canvases-archive,slack-lists-archive,slack-export-admin"

SLACK_BOT_TOKEN="xoxb-ACME-BOT-TOKEN"
SLACK_TEAM_ID="TACMETEAM"`}
          </Code>

          <Sub eyebrow="Phase 2 config">Acme Corp&rsquo;s Phase 2 config.env</Sub>
          <Code>
{`WORKSPACE_NAME="acme-slack"
PHASE2_WORKSPACE_ROOT="./workdir-phase2"
HANDOFF_JSON="/Users/jane/slack-migration/acme/workdir/artifacts/reports/handoff.json"
IMPORT_ZIP="/Users/jane/slack-migration/acme/workdir/artifacts/import-ready/mattermost-bulk-import.zip"

MATTERMOST_URL="https://chat.acme.com"
MATTERMOST_ADMIN_USER="admin"
MATTERMOST_ADMIN_PASS="<generated, stored in 1Password>"
MATTERMOST_TEAM_NAME="acme"
ENABLE_LOCAL_MODE="1"

TARGET_HOST="chat.acme.com"
TARGET_SSH_USER="deploy"
DEPLOY_METHOD="apt"
POSTGRES_DSN="postgres://mmuser:<strong>@localhost:5432/mattermost?sslmode=disable"
SMOKE_DATABASE_URL="${"${POSTGRES_DSN}"}"

SMTP_SERVER="smtp.postmarkapp.com"
SMTP_PORT="587"
SMTP_USERNAME="<postmark-server-token>"
SMTP_PASSWORD="<postmark-server-token>"
SMTP_TEST_EMAIL="admin@acme.com"

CLOUDFLARE_ENABLED="1"
CLOUDFLARE_MODE="execute"
CLOUDFLARE_API_TOKEN="<zone-edit-scoped>"
CF_ZONE_ID="<acme-com-zone-id>"
ORIGIN_SERVER_IP="95.217.12.34"
CALLS_HOSTNAME="calls.acme.com"
CALLS_SERVER_IP="95.217.12.34"

MATTERMOST_ADMIN_TOKEN="<system_admin-PAT-created-post-deploy>"
ROLLBACK_OWNER="Jane Admin <jane@acme.com>"
BACKUP_PATH="/var/backups/mattermost/mm_2026-04-22.sql.gz"
SCRATCH_DB_URL="postgres://mmuser:<strong>@localhost:5432/mm_restore_drill?sslmode=disable"`}
          </Code>

          <Sub eyebrow="Phase 1 kickoff prompt">Typical paste</Sub>
          <div className="rounded-lg border border-white/10 bg-black/40 p-4 italic text-[13px] text-slate-300 leading-relaxed">
            “Use the slack-migration-to-mattermost-phase-1-extraction skill. Read the prompts directory, then run the setup stage for Acme Corp. Pause and show me the doctor.sh summary after it finishes so I can confirm we’re green before export.”
          </div>
          <p className="text-[13px] text-slate-400 italic mt-3">
            Expected reply (abridged): “doctor.sh says 14/14 required passing (100%). Tools: slackdump 3.2.0, slack-advanced-exporter 1.0.4, mmetl v2.3.0, mmctl v9.11. Disk: 420 GiB free on /. Config loaded: Track A, Acme Corp. Ready for export. Shall I proceed?”
          </p>

          <Sub eyebrow="Successful cutover-status">Acme&rsquo;s production cutover</Sub>
          <Code>
{`{
  "status": "success",
  "started_at": "2026-04-22T14:05:12Z",
  "completed_at": "2026-04-22T14:31:04Z",
  "import": {"job_id": "8hxm...", "state": "success", "final_lines": 218451},
  "smoke": {"users": 337, "channels": 142, "posts": 1284903, "direct_channels": 4921},
  "reconciliation": {"status": "ok", "diffs": []},
  "activation": {"smtp_test_email": "admin@acme.com", "reset_link_received": true},
  "rollback_owner": "Jane Admin <jane@acme.com>"
}`}
          </Code>
          <p>
            {"Use these numbers to sanity-check your own runs; Acme&rsquo;s shape is the canonical &ldquo;this is what a healthy migration looks like.&rdquo;"}
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== 10.3 — STAGE CHEATSHEET ========== */}
      <section data-section="stage-cheatsheet">
        <EC>
          <SectionHeader id="stage-cheatsheet" eyebrow="§10.3" title="Stage cheatsheet — outcome, proof, recovery." />

          <Sub eyebrow="Phase 1">What you have after each stage</Sub>
          <RefTable
            cols={[
              { key: "stage", label: "Stage" },
              { key: "after", label: "After this stage you will have" },
              { key: "worked", label: "How to tell it worked" },
              { key: "failed", label: "If it failed" },
            ]}
            rows={[
              {
                stage: <Mono>setup</Mono>,
                after: <><Mono>workdir/artifacts/{`{raw,enriched,import-ready,reports}`}/</Mono> tree; config validated; tools resolved</>,
                worked: <><Mono>doctor.sh</Mono> prints &ldquo;Health score: N/N required passing (100%)&rdquo;</>,
                failed: <>Missing tool → re-run <Mono>bootstrap-tools.sh</Mono>; missing env → edit <Mono>config.env</Mono> and re-run</>,
              },
              {
                stage: <Mono>export</Mono>,
                after: <><Mono>slack-export.zip</Mono> + audit/member CSVs + <Mono>manifest.raw.json</Mono></>,
                worked: <><Mono>jq &apos;.files | length&apos; manifest.raw.json</Mono> matches file count; every file has SHA256</>,
                failed: "Truncated ZIP → re-download; rate-limited slackdump → retry with built-in backoff",
              },
              {
                stage: <Mono>enrich</Mono>,
                after: <><Mono>slack-export.enriched.zip</Mono> with <Mono>__uploads/</Mono>, rewritten <Mono>users.json</Mono>, emoji manifest, sidecar bundle</>,
                worked: <><Mono>validate-enrichment-completeness.py</Mono> reports empty <Mono>missing_file_references</Mono> + empty <Mono>users_missing_email</Mono></>,
                failed: "Missing attachments → per-file decision: accept as unrecoverable or re-run after fixing scope",
              },
              {
                stage: <Mono>transform</Mono>,
                after: <><Mono>mattermost_import.jsonl</Mono> + <Mono>data/bulk-export-attachments/</Mono></>,
                worked: <><Mono>mmetl check slack</Mono> exits 0; JSONL has users/channels/posts lines</>,
                failed: <>mmetl panic → <Mono>MMETL_EXTRA_FLAGS=&quot;--discard-invalid-props&quot;</Mono></>,
              },
              {
                stage: <Mono>package</Mono>,
                after: <><Mono>mattermost-bulk-import.zip</Mono> + <Mono>manifest.import-ready.json</Mono></>,
                worked: "Sidecar channels populated; emoji objects precede team line",
                failed: "Warning about missing user in memberships → trace to source in JSONL, fix patch script input",
              },
              {
                stage: <Mono>verify</Mono>,
                after: <><Mono>reports/verification.md</Mono>, <Mono>evidence-pack.json</Mono>, <Mono>secret-scan.json</Mono> (+ <Mono>reports/redacted/</Mono> if findings)</>,
                worked: <><Mono>verification.md</Mono> has no red lines; scan findings empty or accepted</>,
                failed: "Red reconciliation → go back to enrich or export; do not proceed",
              },
              {
                stage: <Mono>handoff</Mono>,
                after: <><Mono>handoff.md</Mono>, <Mono>handoff.json</Mono>, <Mono>unresolved-gaps.md</Mono></>,
                worked: <><Mono>shasum -a 256 final.zip</Mono> == <Mono>handoff.json.final_package.sha256</Mono></>,
                failed: <>Mismatch → re-run <Mono>handoff</Mono> (never edit <Mono>handoff.json</Mono> by hand)</>,
              },
            ]}
          />

          <Sub eyebrow="Phase 2">What you have after each stage</Sub>
          <RefTable
            cols={[
              { key: "stage", label: "Stage" },
              { key: "after", label: "After this stage you will have" },
              { key: "worked", label: "How to tell it worked" },
              { key: "failed", label: "If it failed" },
            ]}
            rows={[
              { stage: <Mono>intake</Mono>, after: <Mono>workdir-phase2/reports/phase2-intake-report.json</Mono>, worked: "Hash match confirmed, sidecar_channels[] non-empty", failed: "Re-copy canonical ZIP from Phase 1" },
              { stage: <Mono>render-config</Mono>, after: <><Mono>rendered/config.json</Mono> + <Mono>mattermost.nginx.conf</Mono> + <Mono>config-validation.json</Mono></>, worked: <><Mono>config-validation.json.status == &quot;ready&quot;</Mono>; <Mono>MaxPostSize=16383</Mono></>, failed: <>Missing env → fix <Mono>config.env</Mono>; re-run</> },
              { stage: <Mono>edge</Mono>, after: "Cloudflare A record proxied; origin CA cert in rendered/origin.{pem,-key.pem}", worked: <><Mono>verify-cloudflare-edge.py</Mono> green</>, failed: <>Fall back to <Mono>NGINX_ENABLE_TLS=1</Mono> with Let&rsquo;s Encrypt</> },
              { stage: <Mono>provision</Mono>, after: "UFW, fail2ban, unattended-upgrades, optional local PG on target", worked: <><Mono>systemctl status fail2ban</Mono> active; <Mono>ufw status verbose</Mono> active</>, failed: "Re-run in plan mode, eyeball script, then ssh mode" },
              { stage: <Mono>deploy</Mono>, after: "Mattermost + Nginx running, config.json in place, TLS cert installed", worked: <><Mono>/api/v4/system/ping</Mono> returns 200 via HTTPS</>, failed: <>Ubuntu 25.10 + APT fail → switch to <Mono>DEPLOY_METHOD=docker</Mono></> },
              { stage: <Mono>verify-live</Mono>, after: <><Mono>reports/live-stack.md</Mono> with ping + WS + SMTP results</>, worked: "All three probes green, 6× retries exhausted without falling back", failed: <>WS fail → re-render-config+deploy; SMTP fail → verify with swaks</> },
              { stage: <Mono>staging</Mono>, after: <><Mono>reports/latest-staging.json</Mono> + timestamped <Mono>staging-summary.*.json</Mono>, import-watch JSONL</>, worked: <><Mono>latest-staging.json.status=success</Mono>, observed counts ≈ handoff counts</>, failed: "Counts off → go back to Phase 1" },
              { stage: <Mono>restore</Mono>, after: <>Proof that <Mono>pg_restore</Mono> works against <Mono>SCRATCH_DB_URL</Mono></>, worked: <><Mono>restore-drill.sh</Mono> exits 0; tables populate</>, failed: <>Fix <Mono>BACKUP_PATH</Mono>; redo drill</> },
              { stage: <Mono>ready</Mono>, after: <><Mono>cutover-readiness.json</Mono>, <Mono>readiness-score.md</Mono>, <Mono>phase2-readiness.md</Mono></>, worked: <><Mono>status: &quot;ready&quot;</Mono> verbatim</>, failed: "Fix every blocker listed; re-run" },
              { stage: <Mono>cutover</Mono>, after: <><Mono>reports/cutover/cutover-status.&lt;ts&gt;.json</Mono> + <Mono>latest-activation.json</Mono></>, worked: <>newest <Mono>cutover-status.*.json</Mono> has <Mono>status: &quot;success&quot;</Mono></>, failed: <>Read <Mono>note</Mono>; fix-in-place or rollback</> },
              { stage: <Mono>rollback</Mono>, after: "Restored pre-cutover state, archived rollback artifacts", worked: "Users can’t reach new Mattermost; DB is back to pre-cutover dump", failed: "Unfreeze Slack; schedule a new attempt" },
            ]}
          />
        </EC>
      </section>

      <Divider />

      {/* ========== 10.5 — CONCRETE MONTHLY COST BREAKDOWN ========== */}
      <section data-section="cost-breakdown">
        <EC>
          <SectionHeader id="cost-breakdown" eyebrow="§10.5" title="Concrete monthly cost breakdown (340 users)." />
          <p>
            {"For a 340-user deployment (Acme Corp profile), numbers as of April 2026:"}
          </p>
          <RefTable
            cols={[
              { key: "line", label: "Line item" },
              { key: "price", label: "Price" },
              { key: "notes", label: "Notes" },
            ]}
            rows={[
              { line: "Hetzner AX42 dedicated (Falkenstein or Helsinki)", price: "€46/month (~$50)", notes: "AMD Ryzen 7 PRO 8700GE, 64 GB DDR5, 2× 512 GB NVMe. One-time setup €39." },
              { line: "OR Hetzner AX52 (recommended 500–1,000 users)", price: "€64/month (~$70)", notes: "Ryzen 7 7700, 64 GB DDR5, 2× 1 TB NVMe. One-time €39." },
              { line: "Cloudflare Free plan", price: "$0", notes: "TLS termination, DDoS, WAF, WebSockets, CDN for static assets." },
              { line: "Postmark (100K emails/month)", price: "$15/month", notes: "SPF/DKIM/DMARC built in. Alternatives: Mailgun Flex ($35), SES ($1/10K but setup-heavy)." },
              { line: "Domain + DNS (if not already owned)", price: "$10–15/year", notes: "Cloudflare charges cost; any registrar fine." },
              { line: "Cloudflare R2 (file storage, optional)", price: "~$1.50/month", notes: "For 100 GB files. Zero egress." },
              { line: "Hetzner Storage Box 1 TB (off-site backups)", price: "€4/month (~$4)", notes: "Nightly pg_dump target." },
              { line: <strong>Total / month (AX42 + R2 + backups)</strong>, price: <strong>~$70/month</strong>, notes: "" },
              { line: <strong>Total / month (AX52 + R2 + backups)</strong>, price: <strong>~$90/month</strong>, notes: "" },
            ]}
          />
          <p>
            {"Compared to Slack pricing for 340 users (Business+ is ~$12.50/user/month, or ~$4,250/month, ~$51,000/year), self-hosting at this scale is a "}
            <strong>98–99% cost reduction</strong>
            {", and the data lives on hardware you own."}
          </p>
          <p>{"One-time costs (not recurring):"}</p>
          <ul className="sm-bullet-list">
            <li>Hetzner setup fee: €39 per server.</li>
            <li>Operator time: one weekend for under 100 users, 1–2 weeks for 1,000 users with rehearsals.</li>
            <li>Optional: Mattermost Professional Edition license (~$10/user/month) if you want SAML SSO, compliance features, or guest accounts. Team Edition is free and sufficient for most orgs.</li>
          </ul>
        </EC>
      </section>

      <Divider />

      {/* ========== 10.4 — USER COMMUNICATIONS KIT ========== */}
      <section data-section="comms-kit">
        <EC>
          <SectionHeader id="comms-kit" eyebrow="§10.4" title="User-communications kit." />
          <p>
            {"Phase 2 ships "}
            <Mono>references/comms/USER-COMMS-KIT.md</Mono>
            {" with longer versions of each template. Quick copy-paste versions below — edit for your voice."}
          </p>

          <Details open summary={<>T−7d — &ldquo;Heads up, we&rsquo;re moving&rdquo;</>}>
            <p><strong>Subject:</strong> We’re moving from Slack to Mattermost in 7 days</p>
            <p>Hi team, quick heads-up: on <strong>[DATE]</strong> we’re migrating from Slack to a self-hosted Mattermost server at <Mono>https://chat.acme.com</Mono>. This saves us about [$X] per year and keeps our chat history on infrastructure we own.</p>
            <p>What you need to do: <strong>nothing yet</strong>. We’ll send instructions the day before and the day of.</p>
            <p>What won’t change: public channels, private channels you’re in, DMs, threads, files, and reactions all move over.</p>
            <p>What will change: Slackbot automations, scheduled messages, saved items, and a few other per-user things don’t migrate. If you rely on any of these, I’ll list them in the “day of” email so you can recreate them.</p>
            <p>Questions? [help channel / ticket link]</p>
          </Details>

          <Details summary={<>T−24h — freeze notice</>}>
            <p><strong>Subject:</strong> Slack goes read-only tomorrow at 09:30</p>
            <p>Tomorrow, <strong>[DATE]</strong> at 09:30 local, Slack will be set to read-only. You’ll still be able to read everything, but not post.</p>
            <p>At 10:15 your Mattermost account will be waiting at <Mono>https://chat.acme.com/reset_password</Mono>. Enter the email you use in Slack. You’ll get a password-reset email. Set a password, log in, and you’re done.</p>
            <p>All your Slack history (public, private channels you’re in, DMs, threads, files) will already be there.</p>
            <p>Who to ask if something goes wrong: [name, email, Slack handle for today / Mattermost handle post-cutover]</p>
          </Details>

          <Details summary={<>T−15m — &ldquo;Slack is now read-only&rdquo;</>}>
            <p>#general: heads up, Slack is now read-only. Do not start new threads here. Mattermost opens for activation at 10:15 at <Mono>https://chat.acme.com/reset_password</Mono>. Use your Slack email.</p>
          </Details>

          <Details summary={<>T+0 — activation</>}>
            <p><strong>Subject:</strong> Mattermost is live. Activate your account.</p>
            <p>Mattermost is live at <Mono>https://chat.acme.com</Mono>. To activate:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Go to <Mono>https://chat.acme.com/reset_password</Mono>.</li>
              <li>Enter your Slack email (the one you use day to day).</li>
              <li>Check that email for a password-reset link.</li>
              <li>Set a password. Log in.</li>
            </ol>
            <p>Your Slack history is already there. If something looks off, ping [support handle].</p>
            <p><strong>Not migrated (recreate these yourself):</strong> Slackbot auto-replies, saved items, scheduled messages, bookmarks, custom notification rules. See [link to internal doc] for step-by-steps.</p>
          </Details>

          <Details summary={<>T+24h — activation reminder</>}>
            <p><strong>Subject:</strong> If you haven’t activated Mattermost yet…</p>
            <p>About [N]% of the team has activated. If you haven’t, take 90 seconds now: <Mono>https://chat.acme.com/reset_password</Mono>, your Slack email, done.</p>
            <p>If you never got the reset email, check spam first, then reply to this message and I’ll either resend or set a temp password for you.</p>
          </Details>

          <Details summary={<>T+7d — wrap-up</>}>
            <p><strong>Subject:</strong> One week in; Slack is going away</p>
            <p>Everything’s been running on Mattermost for a week. Today I’m:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Revoking the Slack migration app (we only needed it for one-time access).</li>
              <li>Downgrading the Slack workspace to the cheapest read-only tier so we can still reference old content for 90 days if anyone needs it.</li>
              <li>Closing this migration ticket. Retrospective thread: [link].</li>
            </ol>
            <p>If you still haven’t activated Mattermost: do it today.</p>
          </Details>
        </EC>
      </section>

      <Divider />

      {/* ========== 10.6 — LEGAL APPROVAL ========== */}
      <section data-section="legal-approval">
        <EC>
          <SectionHeader id="legal-approval" eyebrow="§10.6" title="Legal approval gate — copy-paste email to legal / HR." />
          <p>
            {"The Phase 1 skill&rsquo;s "}
            <Mono>references/playbooks/LEGAL-APPROVAL-GATE.md</Mono>
            {" is the authoritative playbook. A starter email for impatient operators:"}
          </p>
          <div className="rounded-lg border border-white/10 bg-black/40 p-5 text-[13px] text-slate-300 leading-relaxed space-y-3">
            <p><strong>Subject:</strong> Approval to export Slack workspace data for migration to self-hosted Mattermost</p>
            <p>Hi [Legal / HR contact],</p>
            <p>As part of the planned chat-platform migration (ticket [#ID]), I need written approval to export the company’s Slack workspace content. Specifics:</p>
            <p><strong>Scope I’m requesting:</strong> full content export under our Business+ plan. That’s public channels, private channels, direct messages, and group DMs; the full set the plan tier authorizes.</p>
            <p><strong>Purpose:</strong> one-time migration to a self-hosted Mattermost server at <Mono>chat.acme.com</Mono>, owned and operated by [Company]. The migration uses Slack’s own admin export feature plus Mattermost’s official import tooling.</p>
            <p><strong>Data handling during migration:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Export ZIP is downloaded directly to my workstation at [location]; not uploaded to third parties.</li>
              <li>During processing, the ZIP lives in <Mono>~/slack-migration/</Mono> on my laptop, deleted after T+30 days.</li>
              <li>Import artifacts are SHA256-hashed and a machine-readable evidence pack is generated.</li>
              <li>Slack session tokens and the Slack admin app are revoked within 7 days of cutover.</li>
            </ul>
            <p><strong>Retention:</strong> unchanged. Slack data that today expires per [retention policy] will expire in Mattermost on the same schedule.</p>
            <p><strong>Regulatory basis:</strong> [pick one of: “consent of the members via the prior communication sent on [DATE]” / “legitimate business interest under [policy]” / “contractual requirement under [customer contract clause]”].</p>
            <p><strong>What I need from you:</strong> a “yes, proceed” reply in this thread, plus any concerns or scope-trimming requests before I kick off the export. I’ll cc you on the final <Mono>handoff.md</Mono> plus evidence pack as proof of handling.</p>
            <p>Happy to hop on a call if easier.</p>
            <p>Thanks,<br />[Name]</p>
          </div>
          <p className="mt-4">
            {"Save the approving reply alongside "}
            <Mono>handoff.md</Mono>
            {" in the final evidence pack."}
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== 10.9 — DISK FOOTPRINT ========== */}
      <section data-section="disk-footprint">
        <EC>
          <SectionHeader id="disk-footprint" eyebrow="§10.9" title="Disk footprint per stage." />
          <p>
            {"A worked-example table for a 340-user Business+ workspace with ~3 years of history, ~12 GB raw export, ~8 GB of attached files:"}
          </p>
          <RefTable
            cols={[
              { key: "stage", label: "Stage" },
              { key: "added", label: "New files added" },
              { key: "cumulative", label: "Cumulative disk" },
            ]}
            rows={[
              { stage: <Mono>setup</Mono>, added: "empty directory tree + config copies", cumulative: "~1 MB" },
              { stage: <Mono>export</Mono>, added: <><Mono>slack-export.zip</Mono> (~12 GB), audit CSV (~2 MB), member CSV (~100 KB), manifest.raw.json</>, cumulative: "~12 GB" },
              { stage: <Mono>enrich</Mono>, added: <><Mono>slack-export.enriched.zip</Mono> (~20 GB including downloaded attachments), emoji images (~50 MB), sidecar bundle (~500 MB)</>, cumulative: "~33 GB" },
              { stage: <Mono>transform</Mono>, added: <><Mono>mattermost_import.jsonl</Mono> (~500 MB), <Mono>data/bulk-export-attachments/</Mono> (~8 GB, deduped from enriched)</>, cumulative: "~42 GB" },
              { stage: <Mono>package</Mono>, added: <><Mono>mattermost-bulk-import.zip</Mono> (~22 GB)</>, cumulative: "~64 GB" },
              { stage: <><Mono>verify</Mono> + <Mono>handoff</Mono></>, added: "reports/ (~5 MB), evidence-pack.json (~1 MB)", cumulative: "~64 GB" },
            ]}
          />
          <p>
            <strong>Rough scaling rule:</strong>
            {" total disk needed ≈ "}
            <strong>3× the raw Slack export ZIP size</strong>
            {". For a 1,000-user workspace with 5 years of history, plan for 500 GB free. Temp space: mmetl uses a scratch directory up to ~1.5× the JSONL size; make sure "}
            <Mono>$TMPDIR</Mono>
            {" (or the rendered JSONL output dir) has headroom. After successful handoff, the only file you need to keep is "}
            <Mono>mattermost-bulk-import.zip</Mono>
            {"; the rest can be archived to cold storage (Storage Box / R2) for the evidence pack and then deleted."}
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== 10.10 — ENTERPRISE GRID ========== */}
      <section data-section="grid-migration">
        <EC>
          <SectionHeader id="grid-migration" eyebrow="§10.10" title="Enterprise Grid — per-workspace migration." />
          <p>
            {"Grid admins have one extra decision: "}
            <strong>grid-wide export</strong>
            {" (one giant ZIP covering every workspace) vs "}
            <strong>per-workspace export</strong>
            {" (one ZIP per team). Per-workspace is usually cleaner because each workspace becomes its own Mattermost team."}
          </p>

          <Sub eyebrow="Canonical flow">Per-workspace</Sub>
          <ol className="list-decimal pl-6 space-y-1.5 text-[15px] text-slate-300 leading-relaxed">
            <li>In each Slack Grid workspace you want to migrate, run a separate official admin export.</li>
            <li>Create a fresh working directory per workspace (<Mono>~/slack-migration/acme-engineering</Mono>, <Mono>~/slack-migration/acme-sales</Mono>, etc.), each with its own <Mono>config.env</Mono>.</li>
            <li>Run the Phase 1 pipeline per directory. Each emits its own <Mono>handoff.json</Mono>.</li>
            <li>In Phase 2, either:
              <ul className="list-disc pl-5 space-y-1 mt-1.5">
                <li>Stand up one Mattermost server with multiple teams, and run <Mono>./operate.sh intake</Mono> + <Mono>cutover</Mono> per workspace, each pointing at the same <Mono>MATTERMOST_URL</Mono> but different <Mono>MATTERMOST_TEAM_NAME</Mono>.</li>
                <li>Or stand up separate Mattermost servers per division.</li>
              </ul>
            </li>
          </ol>

          <Sub eyebrow="Canonical flow">Grid-wide</Sub>
          <p>
            {"If you got a single grid-wide ZIP, use the skill&rsquo;s "}
            <Mono>split-phase1-import.py</Mono>
            {" helper before enrichment:"}
          </p>
          <Code>
{`./scripts/split-phase1-import.py \\
    --input /path/to/grid-export.zip \\
    --output-dir workdir/split/ \\
    --by workspace`}
          </Code>
          <p>
            {"Creates "}
            <Mono>workdir/split/&lt;workspace&gt;/slack-export.zip</Mono>
            {". Treat each as a per-workspace export. "}
            <Mono>references/ENTERPRISE-GRID.md</Mono>
            {" has the detailed walkthrough including edge cases."}
          </p>

          <Sub eyebrow="Grid edge cases">What to watch for</Sub>
          <ul className="sm-bullet-list">
            <li><strong>Users in multiple workspaces:</strong> same email. Mattermost merges them on import. If per-workspace Phase 1s, run Phase 2 imports in dependency order (least-dependent first) to keep username conflicts predictable.</li>
            <li><strong>Grid-wide search channels:</strong> don’t migrate as first-class; preserve the member list as a sidecar and flag for rebuild if operationally important.</li>
            <li><strong>IdP / SSO in Grid:</strong> Grid’s enterprise SSO doesn’t follow users into Mattermost. Configure Mattermost’s SAML separately (System Console → Authentication → SAML 2.0) and map on email.</li>
          </ul>
        </EC>
      </section>

      <Divider />

      {/* ========== 10.11 — COMPLIANCE & AUDIT ========== */}
      <section data-section="compliance">
        <EC>
          <SectionHeader id="compliance" eyebrow="§10.11" title="Compliance &amp; audit handoff." />
          <p>
            {"If your org has a compliance reviewer or external auditor, here is what you hand them."}
          </p>

          <Sub eyebrow="Phase 1 evidence pack">Location + fields</Sub>
          <p>
            {"Location: "}
            <Mono>workdir/artifacts/reports/evidence-pack.json</Mono>
            {". Fields (summarized):"}
          </p>
          <ul className="sm-bullet-list">
            <li><Mono>schema_version</Mono> — frozen format identifier</li>
            <li><Mono>generated_at</Mono> — UTC timestamp</li>
            <li><Mono>workspace</Mono> — Slack workspace slug</li>
            <li><Mono>plan_tier</Mono>, <Mono>export_basis</Mono> — legal basis for the export (from <Mono>SLACK_PLAN_TIER</Mono> plus the legal-approval memo)</li>
            <li><Mono>manifests[]</Mono> — list of hash-anchored manifest files (raw, enriched, import-ready)</li>
            <li><Mono>counts</Mono> — users, channels, posts, DMs, emoji, attachments, sidecars</li>
            <li><Mono>known_gaps[]</Mono> — every documented not-migrated item with disposition class</li>
            <li><Mono>secret_scan_findings</Mono> — <Mono>scan-and-redact-migration-secrets.py</Mono> output (should be empty or explicitly accepted)</li>
          </ul>

          <Sub eyebrow="Phase 2 cutover pack">Location + artifacts</Sub>
          <p>
            {"Location: "}
            <Mono>workdir-phase2/reports/</Mono>
            {". Key artifacts:"}
          </p>
          <ul className="sm-bullet-list">
            <li><Mono>phase2-intake-report.json</Mono> — hash match proof (Phase 1 to Phase 2)</li>
            <li><Mono>config-validation.json</Mono> — server config drift check</li>
            <li><Mono>live-stack.md</Mono> — TLS + WebSocket + SMTP reachability evidence</li>
            <li><Mono>latest-staging.json</Mono> + timestamped <Mono>staging-summary.*.json</Mono> — rehearsal results, observed counts, reconciliation</li>
            <li><Mono>cutover-readiness.json</Mono> + <Mono>readiness-score.md</Mono> — pre-cutover gate, with ROLLBACK_OWNER named</li>
            <li><Mono>cutover/cutover-status.&lt;ts&gt;.json</Mono> + <Mono>latest-activation.json</Mono> — final import state, activation proof, reconciliation</li>
          </ul>

          <Sub eyebrow="What an auditor typically asks">Five common questions</Sub>
          <RefTable
            cols={[
              { key: "q", label: "Question" },
              { key: "a", label: "Where the answer lives" },
            ]}
            rows={[
              { q: "Prove the data we imported matches the data we exported.", a: <>Show <Mono>handoff.json.final_package.sha256</Mono> + <Mono>phase2-intake-report.json</Mono> hash match + <Mono>latest-staging.json</Mono> count reconciliation.</> },
              { q: "Prove who authorized the export.", a: "The legal-approval email (§10.6) stored alongside the evidence pack. Not in the skill’s output; you attach it." },
              { q: "Prove no secrets leaked into reports.", a: <><Mono>secret-scan.json</Mono> from the secret scanner; redacted copies in <Mono>reports/redacted/</Mono> if any.</> },
              { q: "Prove the cutover had a rollback plan.", a: <><Mono>cutover-readiness.json.rollback_owner</Mono> (named human) + restore-drill result if done.</> },
              { q: "Retention: where is the raw Slack data now?", a: <>Deleted from <Mono>workdir/artifacts/raw/</Mono> after T+[retention period]. The scan-and-redact helper plus the final handoff give you the last point the raw ZIP was referenced.</> },
            ]}
          />

          <Sub eyebrow="Handoff format">Recommended</Sub>
          <Code>
{`tar czf acme-migration-evidence-pack_2026-04-22.tgz \\
       workdir/artifacts/reports/ workdir-phase2/reports/

# Encrypt with age (or gpg)
age -r <auditor's age public key> \\
    -o acme-migration-evidence-pack_2026-04-22.tgz.age \\
    acme-migration-evidence-pack_2026-04-22.tgz`}
          </Code>
          <p>
            {"Store the encrypted blob off-site (R2 + a different cloud for redundancy). Retention: at least as long as your Slack retention policy, or per audit requirement. The unencrypted evidence pack contains organizational metadata (counts, channel names, user counts) but thanks to the secret scanner should not contain secrets. Still, encrypt it: cheap insurance."}
          </p>

          <Sub eyebrow="Retention recommendations">How long to keep</Sub>
          <ul className="sm-bullet-list">
            <li><strong>Raw export ZIP + enriched ZIP:</strong> delete from operator workstation T+30 days after cutover, unless an auditor has asked for it.</li>
            <li><strong>Final import ZIP</strong> (<Mono>mattermost-bulk-import.zip</Mono>): keep for T+90 days in case a post-cutover re-import is needed.</li>
            <li><strong>Evidence pack + cutover pack:</strong> keep per your compliance retention policy. Typically 7 years for US SOX / EU GDPR article 5 compliance, or your sector-specific rule.</li>
          </ul>
        </EC>
      </section>

      <Divider />

      {/* ========== 10.12 — CREDENTIAL INVENTORY ========== */}
      <section data-section="credentials">
        <EC>
          <SectionHeader id="credentials" eyebrow="§10.12" title="Credential inventory — what you collect and where it goes." />
          <p>
            {"Over the course of a migration you will create and store roughly a dozen credentials. Collect them in a password manager (1Password, Bitwarden, Dashlane), not in a text file on your desktop, and never commit them to git. The skill&rsquo;s "}
            <Mono>workdir/</Mono>
            {" and "}
            <Mono>workdir-phase2/</Mono>
            {" directories, plus "}
            <Mono>config.env</Mono>
            {", are in the default .gitignore."}
          </p>

          <Sub eyebrow="In order of collection">The full list</Sub>
          <RefTable
            cols={[
              { key: "n", label: "#" },
              { key: "cred", label: "Credential" },
              { key: "what", label: "What it is" },
              { key: "where", label: "Which config.env" },
              { key: "stage", label: "Needed at stage" },
            ]}
            rows={[
              { n: "1", cred: "Anthropic or OpenAI subscription login", what: "Sign-in for Claude Code / Codex desktop app", where: "n/a (stays in the app)", stage: "Before Part 1" },
              { n: "2", cred: "jsm account (Google OAuth)", what: "Subscription at jeffreys-skills.md", where: "n/a (stored in OS keychain)", stage: "§1.2 / Part 11" },
              { n: "3", cred: "SSH keypair", what: <><Mono>~/.ssh/id_ed25519</Mono> + <Mono>.pub</Mono></>, where: "n/a (SSH uses it automatically)", stage: "§1.0, Phase 2 provision" },
              { n: "4", cred: "Domain + registrar login", what: <>Your future <Mono>chat.yourcompany.com</Mono> DNS</>, where: "n/a", stage: "§1.0.2" },
              { n: "5", cred: "Cloudflare API token", what: <>Scoped: <Mono>Zone.DNS:Edit</Mono> + <Mono>Zone.SSL:Edit</Mono> for your one zone</>, where: <><Mono>CLOUDFLARE_API_TOKEN</Mono></>, stage: <>Phase 2 <Mono>edge</Mono></> },
              { n: "6", cred: "Cloudflare Zone ID", what: "32-hex identifier for your zone", where: <><Mono>CF_ZONE_ID</Mono></>, stage: <>Phase 2 <Mono>edge</Mono></> },
              { n: "7", cred: <>Slack user token (<Mono>xoxp-…</Mono>)</>, what: "Read-scoped user OAuth token", where: <><Mono>SLACK_TOKEN</Mono></>, stage: <>Phase 1 <Mono>enrich</Mono></> },
              { n: "8", cred: <>Slack bot token (<Mono>xoxb-…</Mono>)</>, what: "Bot-scoped token for the same Slack app", where: <><Mono>SLACK_BOT_TOKEN</Mono></>, stage: "Phase 1 (optional, MCP verification)" },
              { n: "9", cred: <>Slack team ID (<Mono>T…</Mono>)</>, what: "Workspace identifier", where: <><Mono>SLACK_TEAM_ID</Mono></>, stage: <>Phase 1 <Mono>enrich</Mono></> },
              { n: "10", cred: <>Slack session cookies (<Mono>xoxc-</Mono> + <Mono>xoxd-</Mono>)</>, what: "For slackdump stealth mode on Free/Pro", where: <><Mono>SLACKDUMP_XOXC</Mono> + <Mono>SLACKDUMP_XOXD</Mono></>, stage: "Phase 1 export on Free/Pro only" },
              { n: "11", cred: "Postmark server token", what: "SMTP credential for password-reset emails", where: <><Mono>SMTP_USERNAME</Mono> + <Mono>SMTP_PASSWORD</Mono> (same value; Postmark convention)</>, stage: <>Phase 2 verify-live, cutover</> },
              { n: "12", cred: "Mattermost admin password", what: "System admin password for the admin account", where: <><Mono>MATTERMOST_ADMIN_PASS</Mono></>, stage: "Phase 2 deploy onwards" },
              { n: "13", cred: "Mattermost admin PAT", what: "Personal access token, created post-deploy", where: <><Mono>MATTERMOST_ADMIN_TOKEN</Mono></>, stage: "Phase 2 ready, cutover" },
              { n: "14", cred: "PostgreSQL password (mmuser)", what: "Local PG password the provisioner uses", where: <>inside <Mono>POSTGRES_DSN</Mono></>, stage: "Phase 2 provision, deploy" },
              { n: "15", cred: "Rollback-owner email", what: "Your (or a named human’s) email", where: <><Mono>ROLLBACK_OWNER</Mono></>, stage: "Phase 2 ready, cutover" },
            ]}
          />

          <Sub eyebrow="Lifecycle rules">Rotate and revoke</Sub>
          <ul className="sm-bullet-list">
            <li><strong>Never commit to git.</strong> Both phases ship a secret scanner that runs automatically; failure blocks handoff until you remediate.</li>
            <li><strong>Revoke after cutover.</strong> Within 7 days: revoke the Slack user token, bot token, and session cookies. Rotate the Mattermost admin PAT (create new, delete old) if you shared it with any automation.</li>
            <li><strong>Keep Cloudflare + Postmark + SSH long-term.</strong> Useful for operating the Mattermost server. Rotate Postmark if a former admin ever had access.</li>
            <li><strong>Chicken-and-egg: PAT after deploy.</strong> The Mattermost admin PAT doesn’t exist until deploy has finished and you’ve logged in as admin once. Leave <Mono>MATTERMOST_ADMIN_TOKEN=&quot;&quot;</Mono> during intake/render-config/edge/provision/deploy, then come back and fill before verify-live.</li>
          </ul>

          <Sub eyebrow="Quick recovery">If you lose a credential</Sub>
          <ul className="sm-bullet-list">
            <li><strong>Lost Slack user token:</strong> re-install the Slack app, issue a new token, update <Mono>config.env</Mono>. Tokens are cheap; your identity is not.</li>
            <li><strong>Lost SSH key:</strong> see §1.0.5 (Hetzner rescue-system playbook).</li>
            <li><strong>Lost Cloudflare API token:</strong> delete old in Cloudflare → My Profile → API Tokens, create new with same scopes, paste into <Mono>config.env</Mono>.</li>
            <li><strong>Lost Mattermost admin password:</strong> SSH to the server and reset with <Mono>sudo -u mattermost mmctl --local user change-password admin &lt;new-password&gt;</Mono>. Write the new one into your password manager.</li>
            <li><strong>Lost rollback owner:</strong> pick a new one; update <Mono>ROLLBACK_OWNER</Mono>; re-run <Mono>./operate.sh ready</Mono> to regenerate the gate record with the new name.</li>
          </ul>
        </EC>
      </section>

      <Divider />

      {/* ========== 10.13 — CLOUDFLARE WALKTHROUGH ========== */}
      <section data-section="cloudflare">
        <EC>
          <SectionHeader id="cloudflare" eyebrow="§10.13" title="Cloudflare walkthrough — click-by-click." />
          <p>
            {"If you bought the domain at Cloudflare Registrar, skip step 1. Otherwise:"}
          </p>

          <Sub eyebrow="§10.13.1">Add your domain to Cloudflare</Sub>
          <ol className="list-decimal pl-6 space-y-1.5 text-[15px] text-slate-300 leading-relaxed">
            <li>Sign up / log in at <Mono>dash.cloudflare.com</Mono>.</li>
            <li>Click <strong>+ Add a domain</strong>. Paste <Mono>yourcompany.com</Mono> (no https://, no subdomain).</li>
            <li>Pick the <strong>Free</strong> plan. Free covers TLS, DDoS, WAF, CDN, and WebSockets — everything the migration needs. Continue.</li>
            <li>Cloudflare scans your current DNS and imports the records. Confirm. Continue.</li>
            <li>Cloudflare shows you two nameservers (e.g. <Mono>ada.ns.cloudflare.com</Mono>, <Mono>joel.ns.cloudflare.com</Mono>). Copy both.</li>
            <li>Go to your registrar → nameservers → swap to Cloudflare&rsquo;s two. Save.</li>
            <li>Wait. Pending yellow → Active green in 15–60 min (occasionally up to 24 h). Don’t proceed past this until it’s green.</li>
          </ol>

          <Sub eyebrow="§10.13.2">Find your Zone ID</Sub>
          <ol className="list-decimal pl-6 space-y-1.5 text-[15px] text-slate-300 leading-relaxed">
            <li>Click your domain name in the dashboard.</li>
            <li>On <strong>Overview</strong>, right sidebar → <strong>API</strong> section.</li>
            <li>Copy the 32-char hex <strong>Zone ID</strong> (e.g. <Mono>7e6c1f9b40a8d3e2f5c9b1a7e4d3f8c2</Mono>).</li>
            <li>Paste into <Mono>config.env.phase2</Mono> as <Mono>CF_ZONE_ID=…</Mono> (no quotes, no spaces).</li>
          </ol>

          <Sub eyebrow="§10.13.3">Create a scoped API token</Sub>
          <p>{"Never paste your global Cloudflare API Key. Use a scoped token."}</p>
          <ol className="list-decimal pl-6 space-y-1.5 text-[15px] text-slate-300 leading-relaxed">
            <li>Top-right avatar → <strong>My Profile</strong> → <strong>API Tokens</strong> → <strong>Create Token</strong>.</li>
            <li>Scroll past the templates → <strong>Create Custom Token</strong> → Get started.</li>
            <li>Name: <Mono>slack-migration-phase-2</Mono> (any label you&rsquo;ll recognize later).</li>
            <li>Under <strong>Permissions</strong>, add:
              <ul className="list-disc pl-5 mt-1.5 space-y-1">
                <li><Mono>Zone</Mono> → <Mono>DNS</Mono> → <Mono>Edit</Mono></li>
                <li><Mono>Zone</Mono> → <Mono>SSL and Certificates</Mono> → <Mono>Edit</Mono></li>
              </ul>
            </li>
            <li>Under <strong>Zone Resources</strong>: Include → Specific zone → your domain.</li>
            <li>Leave IP filtering and TTL defaults. Continue to summary → Create Token.</li>
            <li>Cloudflare displays the token <strong>exactly once</strong>. Copy immediately. Paste into <Mono>config.env.phase2</Mono> as <Mono>CLOUDFLARE_API_TOKEN=…</Mono></li>
            <li>The confirmation page shows a Test curl — run it; expect <Mono>&quot;status&quot;:&quot;active&quot;</Mono> JSON.</li>
          </ol>

          <Sub eyebrow="§10.13.4">What the skill does with these</Sub>
          <ul className="sm-bullet-list">
            <li>Creates/updates an A record for <Mono>chat.yourcompany.com</Mono> pointing at <Mono>$ORIGIN_SERVER_IP</Mono>, orange-clouded.</li>
            <li>If <Mono>CALLS_HOSTNAME</Mono> is set, also creates a grey-clouded (DNS-only) A record for <Mono>calls.yourcompany.com</Mono> so UDP 8443 bypasses Cloudflare’s proxy.</li>
            <li>Generates a 15-year Cloudflare Origin CA certificate for <Mono>chat.yourcompany.com</Mono> and saves PEMs into <Mono>workdir-phase2/rendered/</Mono>. The subsequent deploy stage SCPs these to <Mono>/etc/nginx/ssl/origin.pem</Mono>.</li>
          </ul>
          <p>
            <J t="cloudflare-origin-ca">Origin CA</J>
            {" is a Cloudflare-specific concept: valid only for traffic through Cloudflare&rsquo;s proxy. Free, 15 years, no ACME renewal cron. If you prefer Let&rsquo;s Encrypt directly on origin, set "}
            <Mono>CLOUDFLARE_ENABLED=0</Mono>
            {" and supply your own cert at "}
            <Mono>NGINX_CERT_PATH</Mono>
            {" / "}
            <Mono>NGINX_KEY_PATH</Mono>
            {"."}
          </p>

          <Sub eyebrow="§10.13.5">Orange-cloud vs grey-cloud in one sentence each</Sub>
          <ul className="sm-bullet-list">
            <li><strong>Orange-clouded (proxied):</strong> traffic intercepted by Cloudflare — TLS terminated, attacks filtered, static cached, forwarded to origin. Use for user-facing HTTP/HTTPS.</li>
            <li><strong>Grey-clouded (DNS-only):</strong> Cloudflare hands back your origin IP directly. Use for UDP (Calls 8443), staging, and MX records.</li>
          </ul>

          <Sub eyebrow="§10.13.6">Cloudflare troubleshooting</Sub>
          <ul className="sm-bullet-list">
            <li><strong>Zone stuck in Pending:</strong> nameserver change hasn’t propagated. Check <Mono>dig NS yourcompany.com +short</Mono>; if you see old nameservers, give it time or re-verify at the registrar.</li>
            <li><strong>API token returns 403:</strong> wrong zone in Zone Resources. Create a new token; Cloudflare requires recreation for scope changes.</li>
            <li><strong>Origin CA cert doesn’t work:</strong> edge stage wrote the cert but deploy didn’t copy. Check <Mono>workdir-phase2/rendered/origin.pem</Mono>, SCP manually to <Mono>/etc/nginx/ssl/origin.pem</Mono>, <Mono>sudo systemctl reload nginx</Mono>.</li>
          </ul>
        </EC>
      </section>

      <Divider />

      {/* ========== 10.14 — SMTP WALKTHROUGH ========== */}
      <section data-section="smtp">
        <EC>
          <SectionHeader id="smtp" eyebrow="§10.14" title="SMTP (Postmark) walkthrough." />
          <p>
            {"Mattermost sends password-reset emails to every user on activation. If SMTP is broken, users can&rsquo;t log in after cutover. This is the single most under-documented piece of the stack for non-technical operators."}
          </p>

          <Sub eyebrow="§10.14.1">Why Postmark</Sub>
          <ul className="sm-bullet-list">
            <li>Cheapest entry tier ($15/month for 10K emails, more than enough for a 340-user activation burst).</li>
            <li>Highest reputation for transactional email (fast inbox placement, rare spam-folder issues).</li>
            <li>Simple domain verification (3 TXT records).</li>
            <li>Server Tokens can be used directly as SMTP credentials.</li>
          </ul>
          <p>
            {"Mailgun Flex ($35/month), Amazon SES ($1 per 10K emails but setup-heavy), and Google Workspace SMTP relay (free with a Workspace account but rate-limited) are valid alternatives with similar click-paths."}
          </p>

          <Sub eyebrow="§10.14.2">Sign up for Postmark</Sub>
          <ol className="list-decimal pl-6 space-y-1.5 text-[15px] text-slate-300 leading-relaxed">
            <li>Go to <Mono>postmarkapp.com</Mono> → Sign up. Use your company email.</li>
            <li>Confirm email. Log in.</li>
            <li>Pick <strong>Transactional email</strong>.</li>
            <li>Create a <strong>server</strong> (Postmark&rsquo;s term for a sending pool). Name: <Mono>acme-chat-transactional</Mono>. Stream type: Transactional.</li>
          </ol>

          <Sub eyebrow="§10.14.3">Add and verify your sending domain</Sub>
          <ol className="list-decimal pl-6 space-y-1.5 text-[15px] text-slate-300 leading-relaxed">
            <li>Postmark dashboard → <strong>Sender Signatures</strong> → <strong>Domains</strong> → <strong>+ Add Domain</strong>.</li>
            <li>Enter <Mono>acme.com</Mono> (your root domain, not <Mono>chat.acme.com</Mono>). Verify.</li>
            <li>Postmark shows 3 DNS records:
              <ul className="list-disc pl-5 mt-1.5 space-y-1">
                <li><strong>DKIM</strong> TXT at <Mono>20260416pm._domainkey.acme.com</Mono>, value <Mono>k=rsa; p=MII…</Mono></li>
                <li><strong>Return-Path</strong> CNAME at <Mono>pm-bounces.acme.com</Mono> → <Mono>pm.mtasv.net</Mono></li>
                <li>Optionally <strong>DMARC</strong> TXT at <Mono>_dmarc.acme.com</Mono> with <Mono>v=DMARC1; p=none; rua=mailto:dmarc-reports@acme.com</Mono></li>
              </ul>
            </li>
            <li>Add each in Cloudflare → DNS → Records. Type, Name, Content exactly as shown. TTL Auto. Proxy status <strong>DNS only</strong> (grey cloud) — required for Return-Path CNAME.</li>
            <li>Back in Postmark, Verify. Usually succeeds within 2 minutes. If fail, recheck value character-for-character (DKIM keys are easy to truncate).</li>
          </ol>
          <p>{"You want DKIM and Return-Path both verified (green checkmarks). DMARC is optional but recommended."}</p>

          <Sub eyebrow="§10.14.4">Grab the Server Token</Sub>
          <ol className="list-decimal pl-6 space-y-1.5 text-[15px] text-slate-300 leading-relaxed">
            <li>Postmark dashboard → your server → <strong>API Tokens</strong> tab.</li>
            <li>Copy the <strong>Server Token</strong>.</li>
            <li>Paste into <Mono>config.env.phase2</Mono> as <strong>both</strong> <Mono>SMTP_USERNAME</Mono> and <Mono>SMTP_PASSWORD</Mono>. Postmark&rsquo;s SMTP expects the same token in both — Postmark convention, not a mistake.</li>
          </ol>
          <Code>
{`SMTP_SERVER="smtp.postmarkapp.com"
SMTP_PORT="587"
SMTP_TEST_EMAIL="admin@acme.com"
# Optional: override the from-address; default is $SMTP_TEST_EMAIL
SMTP_FROM_ADDRESS="noreply@acme.com"`}
          </Code>

          <Sub eyebrow="§10.14.5">Test before you need it</Sub>
          <p>
            {"From the target server (or your laptop with "}
            <Mono>swaks</Mono>
            {" installed — "}
            <Mono>brew install swaks</Mono>
            {" on Mac, "}
            <Mono>apt install swaks</Mono>
            {" on Ubuntu):"}
          </p>
          <Code>
{`swaks --to $SMTP_TEST_EMAIL \\
      --from noreply@acme.com \\
      --server smtp.postmarkapp.com:587 \\
      --tls \\
      --auth-user "$SMTP_USERNAME" \\
      --auth-password "$SMTP_PASSWORD" \\
      --header "Subject: migration SMTP test" \\
      --body "If you're reading this, Postmark works."`}
          </Code>
          <p>
            {"Expect "}
            <Mono>250 OK</Mono>
            {" and the email in your inbox within 30 seconds. If it lands in spam, don&rsquo;t panic — first emails from a new Postmark sender often do. Send 3–4 more over the next hour; deliverability improves as Postmark warms up your reputation."}
          </p>
          <p>
            {"Phase 2&rsquo;s "}
            <Mono>verify-live</Mono>
            {" does the equivalent automatically. If it reports success but Mattermost&rsquo;s own reset-password emails fail at cutover, it&rsquo;s almost always:"}
          </p>
          <ul className="sm-bullet-list">
            <li><Mono>SMTP_FROM_ADDRESS</Mono> doesn’t match the verified domain (Postmark rejects). Fix: <Mono>SMTP_FROM_ADDRESS=noreply@acme.com</Mono> where <Mono>acme.com</Mono> matches the verified signature.</li>
            <li><Mono>RequireEmailVerification=true</Mono> in Mattermost config. render-config sets this false by default; re-check if you edited the rendered file.</li>
            <li>User&rsquo;s email provider classifies Mattermost&rsquo;s template as marketing. Mitigation: ensure DMARC is set (§10.14.3 record 3).</li>
          </ul>

          <Sub eyebrow="§10.14.6">Cost at cutover scale</Sub>
          <p>
            {"For a 340-user activation burst you&rsquo;ll send ~340 welcome/reset emails in the first hour, plus retries over the following week (&lt;50 typically). Well within Postmark&rsquo;s 10K/month $15 plan. After activation week you&rsquo;ll send 1–5 emails/day (new hires, admin-triggered resets), so the same plan covers you indefinitely."}
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== PART 11 — jsm ========== */}
      <section data-section="jsm-install">
        <EC>
          <SectionHeader id="jsm" eyebrow="Part 11" title="Installing the skills via Jeffrey’s Skills.md (jsm)." />
          <p>
            {"The two migration skills are published on "}
            <Mono>jeffreys-skills.md</Mono>
            {", a subscription skill library built around a small Rust CLI. $20/month individual subscription gets you access to every premium skill, plus storing your own private skills in the cloud and syncing across machines."}
          </p>

          <Sub id="jsm-signup" eyebrow="§11.1">Sign up for a subscription</Sub>
          <ol className="list-decimal pl-6 space-y-1.5 text-[15px] text-slate-300 leading-relaxed">
            <li>Open <Mono>jeffreys-skills.md</Mono>.</li>
            <li>Sign up / subscribe. Sign in with <strong>Google</strong>; no separate email/password.</li>
            <li>Pick <strong>Individual ($20/month)</strong> and check out via Stripe or PayPal. Auto-renews monthly; cancel any time.</li>
            <li>Dashboard shows active subscription and a button to install the <Mono>jsm</Mono> CLI.</li>
          </ol>
          <p>{"What you get for $20/month:"}</p>
          <ul className="sm-bullet-list">
            <li>Access to every premium skill on the site, including both <Mono>slack-migration-to-mattermost-phase-1-extraction</Mono> and <Mono>-phase-2-setup-and-import</Mono>.</li>
            <li>Automatic updates (pinnable to specific versions).</li>
            <li>Personal cloud skill storage — push private skills with <Mono>jsm push</Mono>, pull on any signed-in machine.</li>
            <li>Cross-device sync.</li>
            <li>Hash-verified downloads — <Mono>jsm verify</Mono> catches tampering.</li>
          </ul>

          <Sub id="jsm-install-cli" eyebrow="§11.2">Install the jsm CLI</Sub>
          <Code>
{`# macOS / Linux
curl -fsSL https://jeffreys-skills.md/install.sh | bash

# Windows PowerShell as Admin
irm https://jeffreys-skills.md/install.ps1 | iex

# Verify
jsm --version
# should print something like: jsm 0.1.7`}
          </Code>
          <p>
            {"Drops the binary into "}
            <Mono>~/.local/bin</Mono>
            {" and adds it to PATH. Restart your terminal (or "}
            <Mono>source ~/.bashrc</Mono>
            {")."}
          </p>

          <Sub id="jsm-setup" eyebrow="§11.3">First-time setup and authentication</Sub>
          <Code>
{`jsm setup        # interactive wizard — where should skills live
jsm login        # opens a browser → sign in with Google
jsm whoami
# Signed in as you@example.com (subscription: active)`}
          </Code>
          <p>{"For corporate proxies / weird networks:"}</p>
          <Code>
{`jsm login --remote     # device-code style — paste a code in a browser anywhere
jsm login --manual     # prints the callback URL to paste into jsm yourself`}
          </Code>

          <Sub id="jsm-install-skills" eyebrow="§11.4">Install the two migration skills</Sub>
          <Code>
{`jsm install slack-migration-to-mattermost-phase-1-extraction
jsm install slack-migration-to-mattermost-phase-2-setup-and-import
# or in one command (they declare pairs_with)
jsm install slack-migration-to-mattermost-phase-1-extraction --related

jsm list
jsm verify slack-migration-to-mattermost-phase-1-extraction
jsm info slack-migration-to-mattermost-phase-1-extraction`}
          </Code>

          <Sub id="jsm-upgrade" eyebrow="§11.5">Keeping skills up to date</Sub>
          <Code>
{`jsm upgrade                      # apply any available updates
jsm upgrade --list               # show what would update
jsm upgrade slack-migration-to-mattermost-phase-1-extraction

# update preference
jsm config update-preference auto      # apply on every sync
jsm config update-preference notify    # just tell me
jsm config update-preference manual    # never auto-update

# pin a known-good version before production cutover
jsm pin slack-migration-to-mattermost-phase-1-extraction 1.3.0
jsm pin slack-migration-to-mattermost-phase-2-setup-and-import 1.3.0

# after cutover:
jsm unpin slack-migration-to-mattermost-phase-1-extraction
jsm unpin slack-migration-to-mattermost-phase-2-setup-and-import`}
          </Code>

          <Sub id="jsm-sync" eyebrow="§11.6">Multi-machine sync</Sub>
          <Code>
{`jsm sync`}
          </Code>
          <p>
            {"Compares installed skills, local hashes, and last-synced hashes against the catalog; pulls anything new. Does "}
            <strong>not</strong>
            {" upload secrets or per-migration "}
            <Mono>config.env</Mono>
            {"; only the skill definitions sync."}
          </p>

          <Sub id="jsm-troubleshoot" eyebrow="§11.7">Troubleshooting jsm</Sub>
          <Code>{`jsm doctor
jsm doctor --fix     # auto-repair common issues`}</Code>
          <ul className="sm-bullet-list">
            <li><Mono>jsm: command not found</Mono> → shell hasn’t re-read PATH. New terminal or <Mono>export PATH=&quot;$HOME/.local/bin:$PATH&quot;</Mono>.</li>
            <li><Mono>jsm whoami</Mono> says “not authenticated” after a successful <Mono>jsm login</Mono> → keychain didn’t persist (common on WSL2/headless Linux). Retry with <Mono>jsm login --remote</Mono>.</li>
            <li><Mono>jsm install</Mono> says “subscription required” but you’re subscribed → subscription email and Google-OAuth email don’t match. Check <Mono>jeffreys-skills.md/dashboard</Mono>; sign out and in with the correct Google account.</li>
            <li>Install hangs on slow network → <Mono>jsm install --retries 5 &lt;skill&gt;</Mono>. Fall back to manual zip download if needed.</li>
            <li>Claude Code / Codex don’t see the skill after install → restart the app (desktop) or session (CLI). Desktop apps index <Mono>~/.claude/skills/</Mono> on launch.</li>
          </ul>

          <Sub id="jsm-manual" eyebrow="§11.8">Manual install without jsm (zip-download fallback)</Sub>
          <p>
            {"If jsm refuses to install and you can&rsquo;t get past it, you don&rsquo;t have to use it. The skills are directories of files; jsm just fetches, verifies a hash, and drops them in the right place."}
          </p>
          <ol className="list-decimal pl-6 space-y-1.5 text-[15px] text-slate-300 leading-relaxed">
            <li>Sign in at <Mono>jeffreys-skills.md/dashboard</Mono>.</li>
            <li>Find each skill in the catalog, click it, click <strong>Download zip</strong>. Copy the SHA-256 hash.</li>
          </ol>
          <p>{"Then ask the agent to install, pasting the hashes:"}</p>
          <div className="rounded-lg border border-white/10 bg-black/40 p-4 italic text-[13px] text-slate-300 leading-relaxed">
            “I downloaded two skill zip files from jeffreys-skills.md. Please install them into <Mono>~/.claude/skills/</Mono> by: (1) verifying each zip’s SHA-256 matches the hash I’ll paste below, (2) extracting each zip into <Mono>~/.claude/skills/&lt;skill-name&gt;/</Mono> so that SKILL.md lands at the top level, (3) running <Mono>chmod +x</Mono> on any .sh scripts, (4) listing the final tree. Zips at <Mono>~/Downloads/slack-migration-to-mattermost-phase-1-extraction-1.3.0.zip</Mono> and <Mono>…-phase-2-setup-and-import-1.3.0.zip</Mono>. Expected hashes: [paste].”
          </div>
          <p className="mt-3">
            {"Once jsm works later, "}
            <Mono>jsm adopt &lt;skill-name&gt;</Mono>
            {" hashes the installed files, registers them in its local database, and treats them as if it had installed them itself."}
          </p>

          <Sub id="jsm-uninstall" eyebrow="§11.9">Uninstalling</Sub>
          <Code>
{`jsm uninstall slack-migration-to-mattermost-phase-1-extraction
jsm uninstall slack-migration-to-mattermost-phase-2-setup-and-import
# or:
jsm uninstall --all              # remove everything jsm installed
# add --keep-data to preserve per-skill config you'd written`}
          </Code>
          <p>{"Cancel the subscription itself from the dashboard; jsm doesn’t touch billing."}</p>
        </EC>
      </section>

      <Divider />

      {/* ========== PHASE 3 ========== */}
      <section data-section="phase-3">
        <EC>
          <SectionHeader id="phase-3" eyebrow="Part 12 · ongoing maintenance" title="The week after, and every week after that." />
          <p>
            {
              "Moving is not the part people are afraid of. Running the new server, forever, is. That is the fear Slack's pricing team is counting on. It is also the part the "
            }
            <strong>Phase 3 maintenance skill</strong>
            {" exists to automate."}
          </p>
          <p>
            {
              "Ongoing maintenance is a small list of tasks that would be irritating to do manually on a regular cadence but are exactly the shape of a job an agent does well: a nightly Postgres dump to off-site storage with a hash check; a weekly health probe of the live stack; an OS patch pass with a scheduled reboot; a quarterly "
            }
            <em>restore drill</em>
            {" where the newest backup is restored into a scratch database to prove it still restores. An unrestored backup is wishful thinking, not a backup. The drill is what keeps it from quietly decaying. Phase 3 wires all of it into a single "}
            <J t="weekly-sweep">weekly sweep</J>
            {" that the agent runs Saturday night and summarizes into a one-paragraph Monday-morning status you skim in sixty seconds."}
          </p>
          <p>
            {"The single piece of the maintenance skill worth pausing on, because it is the thing that turns Mattermost upgrades from a sweaty-palm activity into a background task, is the "}
            <J t="auto-rollback">auto-rollback upgrade</J>
            {" loop:"}
          </p>

          <div className="sm-insight-card">
            <p className="text-[11px] font-mono text-purple-300 uppercase tracking-[0.25em] mb-3">
              update-mattermost, auto-rollback on failure
            </p>
            <ol className="text-sm md:text-base text-slate-300 space-y-2 leading-relaxed list-decimal pl-5 marker:text-purple-400">
              <li>doctor.sh confirms SSH + ping + PAT still work.</li>
              <li>
                pg_dump streams the current DB to <span className="font-mono text-xs text-white">/var/backups/mattermost/pre-upgrade-&lt;ts&gt;.sql.gz</span>. SHA-256 captured.
              </li>
              <li>systemctl stop mattermost.</li>
              <li>
                apt-get install <span className="font-mono text-xs text-white">--allow-downgrades mattermost=&lt;target_version&gt;</span>.
              </li>
              <li>systemctl start, then poll /api/v4/system/ping for up to 3 minutes.</li>
              <li>
                If the new version doesn’t come up: stop, downgrade the package, DROP / CREATE the database, stream the pre-upgrade dump back in, start. Record <span className="font-mono text-xs text-white">status: failed_rolled_back</span>.
              </li>
            </ol>
            <p className="text-sm text-slate-400 mt-4 italic">
              Blast radius on failure: 2 to 6 minutes of Mattermost being offline. Data loss: zero. That loop is what lets a solo operator run production upgrades without a pager rotation.
            </p>
          </div>

          <p>
            {
              "Pair the auto-rollback loop with the quarterly restore drill and you have a backup pipeline that is actually tested, not one that will let you down the exact day the host dies. That is the whole point of running your own chat server. You own the schema, the hardware, the upgrade path, and — most importantly — the knowledge that the loops you depend on have been exercised on a scratch database recently enough to be trusted."
            }
          </p>

          <Sub id="phase3-weekly-sweep" eyebrow="§12.3">The weekly cadence</Sub>
          <p>{"This is the whole point: the agent runs everything, you read a one-paragraph status on Monday morning."}</p>
          <ul className="sm-bullet-list">
            <li><strong>Saturday night (~20 min agent runtime):</strong> paste the <Mono>weekly-sweep.md</Mono> prompt. The agent runs <Mono>health → update-os → backup → db-health</Mono> and writes a summary.</li>
            <li><strong>Monday morning (~1 min attention):</strong> skim the summary. If anything is red, tell the agent to investigate.</li>
            <li><strong>First Saturday of the quarter (~60 min):</strong> paste <Mono>restore-drill.md</Mono>. Agent downloads the newest backup, restores into scratch DB, confirms row counts. Failed drill = production incident.</li>
            <li><strong>On a Mattermost security release:</strong> paste <Mono>update-mattermost.md</Mono> with the pinned version. Auto-rollback loop kicks in if the health check fails.</li>
          </ul>
          <p>
            {"You can automate the weekly sweep with cron on your workstation plus a webhook alert on failure (set "}
            <Mono>ALERT_WEBHOOK_URL</Mono>
            {" in "}
            <Mono>config.env</Mono>
            {"), or keep it as a scheduled agent-run item."}
          </p>

          <Sub id="phase3-prompts" eyebrow="§12.4">Paste-ready prompts — you don&rsquo;t hand-roll the wording</Sub>
          <p>
            {"The "}
            <Mono>prompts/</Mono>
            {" directory is a library of agent prompts already phrased for good outcomes. Pick one, paste, done:"}
          </p>
          <RefTable
            cols={[
              { key: "file", label: "Prompt file" },
              { key: "does", label: "What the agent does" },
            ]}
            rows={[
              { file: <Mono>orient.md</Mono>, does: <>Reads <Mono>config.env</Mono>, runs doctor.sh, reports where the deployment is and what&rsquo;s known</> },
              { file: <Mono>health.md</Mono>, does: "One-shot health snapshot; posts summary" },
              { file: <Mono>update-os.md</Mono>, does: "Applies OS patches, schedules reboot if required" },
              { file: <Mono>update-mattermost.md</Mono>, does: "Bumps Mattermost to pinned version, verifies, auto-rolls-back on failure" },
              { file: <Mono>backup.md</Mono>, does: "Takes pg_dump, uploads off-site, verifies hash, reports size and destination" },
              { file: <Mono>db-health.md</Mono>, does: "Postgres sizing, bloat, connections; flags slow-burning issues" },
              { file: <Mono>restore-drill.md</Mono>, does: "Quarterly restore-from-backup verification" },
              { file: <Mono>schedule-reboot.md</Mono>, does: "Queues a pending reboot in the next off-hours window" },
              { file: <Mono>weekly-sweep.md</Mono>, does: "Saturday combo (health + update-os + backup + db-health)" },
              { file: <Mono>major-upgrade.md</Mono>, does: "Extended sequence for a major Mattermost upgrade" },
              { file: <Mono>plugin-upgrade.md</Mono>, does: "Plugin lifecycle: compatibility check, staging, prod install" },
              { file: <Mono>rotate-credentials.md</Mono>, does: "PAT / SSH / off-site / session-secret rotation, one scope at a time" },
              { file: <Mono>incident-response.md</Mono>, does: "Live-incident coordinator: triage, comms cadence, timeline capture" },
              { file: <Mono>disaster-recovery.md</Mono>, does: "Rebuild onto a fresh host from the latest backup" },
              { file: <Mono>all.md</Mono>, does: "Meta-prompt: the agent picks which sub-prompt fits your ask" },
            ]}
          />

          <Sub id="phase3-restore-drill" eyebrow="§12.6">Restore-drill — the quarterly canary</Sub>
          <p>
            <em>If you have never restored a backup, you do not have backups. You have files.</em>
          </p>
          <p>
            <Mono>./maintain.sh restore-drill</Mono>
            {" exercises the backup pipeline end to end:"}
          </p>
          <ol className="list-decimal pl-6 space-y-1.5 text-[15px] text-slate-300 leading-relaxed">
            <li>Lists the off-site destination (or local <Mono>BACKUP_PATH</Mono>) and picks the newest <Mono>mm_*.sql.gz</Mono>.</li>
            <li><Mono>DROP DATABASE / CREATE DATABASE</Mono> on <Mono>SCRATCH_DB_URL</Mono> — a separate Postgres instance provisioned specifically for drills. Never point this at prod.</li>
            <li>Streams the compressed dump through <Mono>gunzip | psql</Mono> into the scratch DB.</li>
            <li>Counts rows in <Mono>&quot;Users&quot;</Mono>, <Mono>&quot;Channels&quot;</Mono>, <Mono>&quot;Posts&quot;</Mono> (PascalCase, per Mattermost schema).</li>
            <li>Compares counts against <Mono>RESTORE_MIN_USERS</Mono>, <Mono>RESTORE_MIN_CHANNELS</Mono>, <Mono>RESTORE_MIN_POSTS</Mono>.</li>
            <li>Emits <Mono>latest-restore-drill.json</Mono> with <Mono>status: ok|failed</Mono> and counts.</li>
          </ol>
          <p>{"Three distinct failure modes, each with its own remediation:"}</p>
          <ul className="sm-bullet-list">
            <li><strong>No backup found:</strong> off-site credentials expired, or the nightly backup has been silently failing. Check <Mono>latest-backup.json</Mono> from the last week.</li>
            <li><strong>Restore fails mid-stream:</strong> dump corrupted or scratch DB Postgres major version older than prod&rsquo;s. pg_dump is forward-compatible but not backward.</li>
            <li><strong>Row counts below minimums:</strong> backup succeeded but captured an empty or partial DB. Has happened when a failed migration left Mattermost writing to a scratch schema; the backup job dutifully captured the empty one.</li>
          </ul>
          <p>
            {"Passing drill: ~45 min of agent-watched runtime per quarter on a small deployment. Failing drill is the cheapest production incident you&rsquo;ll ever have, because it happens on a scratch DB instead of on the day the host dies."}
          </p>

          <Sub id="phase3-subagents" eyebrow="§12.7">Subagents for deep audits</Sub>
          <p>
            {"Seven focused subagents live in "}
            <Mono>subagents/</Mono>
            {". They are not part of the weekly sweep; you invoke them on-demand when you want a second opinion on a specific dimension. Each is already wired to the skill&rsquo;s references, scripts, and config."}
          </p>
          <RefTable
            cols={[
              { key: "agent", label: "Subagent" },
              { key: "use", label: "Use when" },
            ]}
            rows={[
              { agent: <Mono>backup-integrity-auditor</Mono>, use: "You want judgement on backup completeness, SHA-256 coverage, off-site freshness, and restore-drill recency, not just stage runs" },
              { agent: <Mono>db-bloat-auditor</Mono>, use: <>DB size climbing faster than user count can explain; looks at table bloat, vacuum status, index health, <Mono>pg_stat_user_tables</Mono></> },
              { agent: <Mono>health-drift-auditor</Mono>, use: "Nothing is red yet, but you want to know what is slowly getting worse across the last 8 weeks of health reports" },
              { agent: <Mono>version-drift-auditor</Mono>, use: "How far behind the recommended upgrade target you are, framed against Mattermost&rsquo;s ESR policy" },
              { agent: <Mono>security-posture-auditor</Mono>, use: "Credential rotation cadence, SSH key hygiene, fail2ban / UFW state, exposed ports" },
              { agent: <Mono>maintenance-scheduler</Mono>, use: "Planning a maintenance window; coordinates comms, picks off-hours, writes the user-facing heads-up" },
              { agent: <Mono>incident-coordinator</Mono>, use: "Live incident: triage playbook, comms cadence, timeline capture for the post-mortem" },
            ]}
          />

          <Sub id="phase3-scenario" eyebrow="§12.8">Scenario pack — Acme Corp&rsquo;s actual schedule</Sub>
          <p>
            <Mono>assets/scenario-packs/acme-corp-weekly.yaml</Mono>
            {" is a worked schedule for a 40-user Acme Corp profile. Drop into your scheduler (cron, systemd timers, or scheduled agent runs):"}
          </p>
          <Code>
{`workspace: acme-corp
timezone: America/Los_Angeles
operator: alex@acme.com

schedule:
  - name: nightly-backup
    cron: "0 10 * * *"            # 10:00 UTC = 02:00-03:00 Pacific
    command: "./maintain.sh backup"
    log: /var/log/mm-backup.log

  - name: weekly-sweep
    cron: "0 10 * * 0"            # Sunday 10:00 UTC
    command: "./maintain.sh weekly-sweep"
    log: /var/log/mm-sweep.log

  - name: quarterly-restore-drill
    cron: "0 11 1-7 1,4,7,10 0"   # First Sunday of each quarter
    command: "./maintain.sh restore-drill"
    log: /var/log/mm-drill.log

alert_webhook: https://chat.acme.com/hooks/abcdef12345

thresholds:
  disk_pct_red: 85
  pg_conn_pct_red: 80
  log_err_per_min_red: 10

upgrade:
  policy: esr                     # track ESR releases only
  max_delay_patch_security: 72h
  rollback: auto`}
          </Code>
          <p>
            {"Lift the cron lines into "}
            <Mono>crontab -e</Mono>
            {" on the workstation that holds the agent credentials. The "}
            <Mono>alert_webhook</Mono>
            {" posts a red-status summary to a Mattermost channel. "}
            <J t="esr">ESR</J>
            {" policy is the most consequential line for small teams: ESR (Enterprise-Scale Release) means fewer, more-stable bumps instead of every minor release."}
          </p>

          <Sub id="phase3-dr" eyebrow="§12.9">Disaster-recovery drill</Sub>
          <p>
            {"Once a year (pick a Saturday, budget 2 hours), run a full DR simulation: order a fresh cheap Hetzner CX22, restore the latest backup into it with "}
            <Mono>restore-drill.sh</Mono>
            {" pointed at that host&rsquo;s PG, verify it comes up as a working Mattermost. Cancel the CX22 when you&rsquo;re satisfied. Tests the whole DR path without touching production and costs ~€0.10 in server-hours."}
          </p>
          <p>
            {"Full playbook in "}
            <Mono>references/DISASTER-RECOVERY.md</Mono>
            {". The "}
            <Mono>incident-coordinator</Mono>
            {" subagent (§12.7) can also walk you through it live."}
          </p>

          <Sub id="phase3-report" eyebrow="§12.10">Reading the weekly report and spotting trends</Sub>
          <p>
            <Mono>assets/templates/maintenance-report.md</Mono>
            {" is the shape the agent follows. The summary table looks like:"}
          </p>
          <RefTable
            cols={[
              { key: "stage", label: "Stage" },
              { key: "result", label: "Result" },
              { key: "notes", label: "Notes" },
            ]}
            rows={[
              { stage: "health", result: <span className="text-emerald-300">green</span>, notes: "all probes green, 0 red" },
              { stage: "update-os", result: "4 security patches, reboot required: yes", notes: "reboot scheduled for Sun 03:00 UTC" },
              { stage: "backup", result: <span className="text-emerald-300">success</span>, notes: "1.4 GB, sha256=ab12…, off-site verified" },
              { stage: "db-health", result: <span className="text-amber-300">yellow</span>, notes: "Posts table up 8 % week over week, vacuum last ran 14 hours ago" },
            ]}
          />
          <p>
            {"The trend block matters more than any single week. Look at four-week deltas for disk growth, DB size, and error-rate baseline — these are the slow-burn numbers that predict when you need to upsize the server, not acute red alerts. The "}
            <Mono>health-drift-auditor</Mono>
            {" subagent does this reading for you and flags what&rsquo;s getting slowly worse. Incident post-mortems share a template too ("}
            <Mono>assets/templates/incident-status.md</Mono>
            {"): timeline in UTC, root cause (not symptom), what fixed it, five whys."}
          </p>

          <Sub id="phase3-rotation" eyebrow="§12.11">Credential-rotation cadence</Sub>
          <p>
            <Mono>./maintain.sh rotate-credentials --scope &lt;name&gt;</Mono>
            {" rotates one thing at a time."}
          </p>
          <RefTable
            cols={[
              { key: "scope", label: "Scope" },
              { key: "cadence", label: "Cadence" },
              { key: "what", label: "What rotates" },
            ]}
            rows={[
              { scope: <Mono>pat</Mono>, cadence: "90 days", what: <><Mono>MATTERMOST_ADMIN_TOKEN</Mono> (Mattermost PAT for the bot admin)</> },
              { scope: <Mono>ssh</Mono>, cadence: "annually", what: <>Deploy-user SSH key used by the workstation to reach <Mono>TARGET_HOST</Mono></> },
              { scope: <Mono>offsite</Mono>, cadence: "annually", what: <>rclone credentials for <Mono>OFFSITE_REMOTE</Mono> (R2 / Hetzner Storage Box token)</> },
              { scope: <Mono>session-secret</Mono>, cadence: "on compromise only", what: "Mattermost session signing secret; forces all users to re-login" },
            ]}
          />
          <p>
            {"The "}
            <Mono>security-posture-auditor</Mono>
            {" subagent reads your "}
            <Mono>rotation-history.json</Mono>
            {" and tells you what&rsquo;s overdue. For the rare session-secret rotation, expect a full-team re-login and a heads-up message posted 24 hours in advance (comms templates in "}
            <Mono>references/comms/</Mono>
            {")."}
          </p>

          <Sub id="phase3-more-tooling" eyebrow="§12.12">When to bring in more tooling</Sub>
          <p>
            {"The Phase 3 skill is deliberately point-in-time health probes plus scheduled tasks. It does not replace continuous observability. If you eventually need:"}
          </p>
          <ul className="sm-bullet-list">
            <li><strong>SLO dashboards and alerting</strong> — spin up Grafana + Prometheus scraping Mattermost&rsquo;s metrics port 8067.</li>
            <li><strong>Synthetic end-to-end user checks</strong> — Uptime Robot, Better Stack, or Cronitor hitting <Mono>/api/v4/system/ping</Mono> every 5 minutes.</li>
            <li><strong>Log aggregation</strong> — Loki or Grafana Cloud for <Mono>mattermost.log</Mono>.</li>
            <li><strong>Incident-response runbooks</strong> — Statuspage or a markdown repo your on-call reads on their phone.</li>
          </ul>
          <p>
            {"All are complementary, not replacements for the Phase 3 skill&rsquo;s automation of routine work. The "}
            <Mono>OBSERVABILITY-LADDER.md</Mono>
            {" reference lays out a graduated path; each rung has a &ldquo;when it is worth the complexity&rdquo; criterion so you&rsquo;re not adding dashboards for their own sake."}
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== THE GENERAL PATTERN ========== */}
      <section data-section="pattern" className="pb-10 md:pb-14">
        <EC>
          <h2 className="sm-section-title mb-6 mt-4 text-white">A pattern, not a migration.</h2>
          <p>
            {
              "The deeper thing worth taking away from this is not about chat software. It is about the shape of problems that become tractable when a coding agent and a well-written skill are both in the room."
            }
          </p>
          <p>
            {
              "A decade ago, a company that wanted to move off Slack had three options. Hire a consultant for a six-figure fixed bid. Assign an internal engineer and lose them for a month. Or stay on Slack, grumble every April, and pay the price hike. The middle option — “assign an engineer” — was the right one for a lot of companies, but it was not cheap, and every time a new platform came out the institutional knowledge from the previous migration was gone."
            }
          </p>
          <p>
            {
              "The agent-plus-skill pattern collapses the expense side of that decision. The senior engineer writes the skill "
            }
            <em>once</em>
            {", against the problem as it exists today, and every subsequent user inherits the whole thing — including the edge cases that cost the first engineer two weekends to discover. The skill is version-controlled, signed, installable in a minute, and pinnable to a known-good release for a production run. It is not a custom pipeline that decays. It is infrastructure, published like a library, that any company with a Claude Code or Codex subscription can run against their own Slack."}
          </p>
          <p>
            {
              "The pattern generalizes beyond Slack, of course. One-off infrastructure migrations — databases between providers, DNS between registrars, CI systems between vendors — are exactly the shape of problem that fits into a paired-skill architecture. Each has a sensitive extract step, a transform, a staging rehearsal, a fail-closed gate, and a cutover that needs to be "
            }
            <J t="asymmetric-bet">an asymmetric bet</J>
            {" by construction. Each is worth doing at most once per company, and the institutional knowledge is worth retaining forever. Each is a project a senior engineer would resent being assigned. Each is a thing an agent-driven skill, well-designed, can do in a weekend."}
          </p>
          <p>
            {"If you are still paying Slack today, what is going to happen is that at some point in the next eighteen months the vendor will email you a new number, and it will be larger than the current one by some multiple that is too painful to ignore. When it happens, you will have two options. You can pay. Or you can open a new Claude Code session, paste one sentence, and be somewhere better by the end of the weekend."}
          </p>

          {/* Operator-ready source guide CTA */}
          <div className="my-10 md:my-12 rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-purple-500/[0.06] via-cyan-500/[0.06] to-emerald-500/[0.06] p-6 md:p-7 backdrop-blur-xl">
            <p className="text-[10px] md:text-[11px] font-mono uppercase tracking-[0.25em] text-cyan-300 mb-2">
              For operators who want to actually run this
            </p>
            <p className="text-base md:text-lg text-slate-200 leading-relaxed mb-4">
              This post is a distilled essay. The 2,500-line source guide that drives the two skills — and that an AI agent reads before kicking off the migration — includes everything this post skips:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 text-[13px] text-slate-300 font-mono mb-6">
              {[
                "Day-zero server ordering & SSH setup",
                "Bootstrap scripts (doctor.sh, bootstrap-tools.sh)",
                "MCP worked examples (Slack, Playwright, Mattermost)",
                "Full Phase 1 / Phase 2 config.env field tables",
                "Stage-by-stage cheatsheet with proof & recovery",
                "Troubleshooting index (Phase 1, Phase 2, audit)",
                "Printable operator checklist (T−2d, T−1d, T+0, T+7d)",
                "User-communications kit (every template, T−7d → T+7d)",
                "Legal-approval email template",
                "Full credential inventory & rotation cadence",
                "Cloudflare & Postmark click-by-click walkthroughs",
                "Enterprise Grid split workflow",
                "Compliance & audit evidence-pack handoff",
                "Resume-after-interrupt playbook per stage",
                "jsm install / pin / sync / verify commands",
                "Phase 3 maintenance: weekly sweep, restore drill, DR, subagents, scenario pack",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 shrink-0 w-3.5 h-3.5 text-cyan-400" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <MarkdownDownloadButton compact />
              <p className="text-[11px] text-slate-500 font-mono leading-relaxed">
                Paste it into Claude Code or Codex with{" "}
                <span className="text-slate-300">
                  “read this guide end-to-end, then plan my migration”
                </span>{" "}
                and the agent drives from there.
              </p>
            </div>
          </div>

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
                  Two agent skills. One weekend. ~99% lower ongoing cost. Slack keeps working until you flip the switch yourself.
                </p>
              </div>
            </div>
          </div>
        </EC>
      </section>
    </div>
  );
}
