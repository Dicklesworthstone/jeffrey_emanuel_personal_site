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
  Hash,
  Lock,
  MessagesSquare,
  Rocket,
  Sparkles,
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

      {/* ========== INTRO ========== */}
      <article data-section="intro">
        <EC>
          <p className="sm-drop-cap">
            {
              "There is a tweet from April 2026 that I keep coming back to. It is a founder named Alex Cohen — 40 employees, paying Slack about six thousand dollars a year, just quoted twenty-one thousand a year to move onto the Business+ tier so he can get a BAA for a customer contract. A three-and-a-half-times price hike to keep using the same software he's already using."
            }
          </p>
          <p>
            {
              "That is the moment, more or less, when almost every growing company decides it is done with Slack. Not because the product is bad — Slack is a genuinely polished piece of software — but because the pricing is designed to make the decision for you, and because the thing you get back when you cancel is a pile of JSON files with dead links to your own attachments. You never really owned your history. You were renting it, on a meter that keeps going up."
            }
          </p>
          <p>
            {"For as long as I can remember, the reason most companies didn't migrate off "}<J t="mattermost">Slack onto something self-hosted</J>{" was that the migration itself was a project. Someone had to write a script, chase expiring file links, rebuild per-channel membership lists, reconcile message counts, stand up a Postgres, configure Nginx with the right WebSocket upgrade, and get SMTP working well enough that password-reset emails would actually land in inboxes. Then keep it all running, every week, forever."}
          </p>
          <p>
            {"What changed, very recently, is that a sufficiently capable coding agent — "}<J t="claude-code">Claude Code</J>{" or "}<J t="codex">Codex</J>{" — can do every single one of those things in the background while you drink coffee. Not with you writing bash. With you reading a handful of reports, clicking approve on twenty or thirty prompts spread over a week, and pasting a short English sentence when the agent is ready for the next stage."}
          </p>
          <p>
            {"The thing that actually encodes the migration is not a fragile custom script. It is a pair of "}<J t="skill">agent skills</J>{" — one for extraction, one for setup and import — each a directory of prompts, references, and scripts that the agent loads into its context and drives on your behalf. That is what this piece is about: not the migration in detail (the skills do the details), but the shape of using agents and structured skills to move a team off Slack, safely, for a weekend of attention."}
          </p>
        </EC>
      </article>

      <Divider />

      {/* ========== THE MONEY — VIZ 1 ========== */}
      <section data-section="cost">
        <EC>
          <h2 className="sm-section-title mb-6 mt-4 text-white">The money math.</h2>
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
          <h2 className="sm-section-title mb-6 mt-4 text-white">Why this wasn&rsquo;t practical before.</h2>
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

      {/* ========== PIPELINE VIZ ========== */}
      <section data-section="pipeline">
        <EC>
          <h2 className="sm-section-title mb-6 mt-4 text-white">The two-phase pipeline.</h2>
          <p>
            {
              "Both skills expose an ordered list of stages. You don't typically run them all at once. Most operators step through stage by stage and read the reports between each, because the reports are where the decisions live — what was exported, what's on disk, whether reconciliation counts line up, whether the staging rehearsal passed. Tap any stage below to see what it actually does."
            }
          </p>

          <div className="sm-viz-wrap">
            <PhasePipelineViz />
          </div>
        </EC>

        <EC>
          <p>
            {
              "A few stages deserve attention, because they are where the skill is doing real work the operator shouldn't need to understand in detail but should understand the "
            }<em>purpose</em>{" of:"}
          </p>
          <ul className="sm-bullet-list">
            <li>
              <span className="font-mono text-purple-200">enrich</span> is the reason Phase 1 downloads files before transforming. Slack&rsquo;s file URLs expire in a few hours. If you transform first and enrich later, you&rsquo;re chasing dead links across every channel for every attached image, video, and PDF the team ever sent. Do enrich first and it&rsquo;s a one-time background download you can walk away from.
            </li>
            <li>
              <span className="font-mono text-purple-200">verify</span> runs five separate validators — manifest hashes, JSONL ordering, enrichment completeness, message-count reconciliation, integration inventory — plus a secret scanner over every report the pipeline generated. If any of them finds a red line, the handoff is blocked. This is the point at which silent data loss would otherwise pass through.
            </li>
            <li>
              <span className="font-mono text-cyan-200">staging</span> is the single most valuable stage in Phase 2. It runs the entire production import against a throwaway target — a four-dollar-a-month cheap VPS is fine — so you can see the ZIP import cleanly, observe counts match the handoff, and confirm the SSH / DB / mmctl plumbing works end-to-end, before you touch production.
            </li>
            <li>
              <span className="font-mono text-emerald-200">ready</span> is a <J t="readiness-gate">fail-closed readiness gate</J>. It reads every prior report plus the <J t="rollback-owner">ROLLBACK_OWNER</J> env var. If any single input is missing or stale, the status is <span className="font-mono text-rose-300">blocked</span>. There is no <span className="font-mono text-amber-300">yellow</span>. Fix every blocker, re-run.
            </li>
            <li>
              <span className="font-mono text-emerald-200">cutover</span> is the only stage the skill refuses to run without <span className="font-mono">ROLLBACK_OWNER</span> populated by a named human. Not an alias. Not a role. A name.
            </li>
          </ul>
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
            <strong>Native</strong> means it imports as first-class Mattermost data: public and private channel messages, DMs, threads, reactions, file attachments, pinned messages, channel topics, custom emoji images. <strong><J t="sidecar">Sidecar</J></strong> means the content is preserved, but as posts in a dedicated archive channel rather than as native Mattermost objects — canvases, lists, and admin audit CSVs all end up this way. <strong>Unrecoverable</strong> means the content is genuinely not in Slack&rsquo;s export and cannot be migrated; the best you can do is document it in <J t="unresolved-gaps">unresolved-gaps.md</J>, which the skill generates automatically, and plan a rebuild or an acceptance.
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
              The gate reads every prior report plus one environment variable, and emits <span className="font-mono text-white">status: &ldquo;ready&rdquo;</span> or <span className="font-mono text-white">status: &ldquo;blocked&rdquo;</span>. There is no middle state. If any of the inputs below is missing or stale, it blocks.
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
            {" before the gate is allowed to pass. Not &ldquo;whoever is on call.&rdquo; Not a team alias. A specific human who has pre-committed to being the one who calls the abort. In practice this is usually the operator running the migration, or their CTO. The point is to remove ambiguity at the exact moment it would otherwise cost you."}
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== CUTOVER DAY ========== */}
      <section data-section="cutover-day">
        <EC>
          <h2 className="sm-section-title mb-6 mt-4 text-white">Cutover day, minute by minute.</h2>
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
            {" click, not an &ldquo;Approve for the rest of the session&rdquo; click. The approvals are cheap and the alternative is risky. Second: the import is "}
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
        </EC>
      </section>

      <Divider />

      {/* ========== PHASE 3 ========== */}
      <section data-section="phase-3">
        <EC>
          <h2 className="sm-section-title mb-6 mt-4 text-white">The week after, and every week after that.</h2>
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
                If the new version doesn&rsquo;t come up: stop, downgrade the package, DROP / CREATE the database, stream the pre-upgrade dump back in, start. Record <span className="font-mono text-xs text-white">status: failed_rolled_back</span>.
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
              "A decade ago, a company that wanted to move off Slack had three options. Hire a consultant for a six-figure fixed bid. Assign an internal engineer and lose them for a month. Or stay on Slack, grumble every April, and pay the price hike. The middle option — &ldquo;assign an engineer&rdquo; — was the right one for a lot of companies, but it was not cheap, and every time a new platform came out the institutional knowledge from the previous migration was gone."
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
