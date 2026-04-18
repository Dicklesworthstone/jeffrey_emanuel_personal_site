"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
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
} from "lucide-react";
import illustration from "@/assets/slack_migration_post_illustration.webp";
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
          Download the operator primer as Markdown
        </p>
        <p className="text-[11px] md:text-xs text-slate-400 font-mono tracking-wide mt-0.5">
          agent-readable handoff · pairs with the three skills
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

// ─────────────────────────────────────────────────────────────
// Decision matrix: 4 question cards, each with 3 routing branches.
// Replaces an ASCII-art tree so screen readers + mobile work nicely.
// ─────────────────────────────────────────────────────────────
type DecisionAccent = "purple" | "cyan" | "emerald" | "amber";

type DecisionBranch = {
  answer: ReactNode;
  pill?: ReactNode;
  body: ReactNode;
};

type DecisionCardData = {
  num: string;
  accent: DecisionAccent;
  question: string;
  branches: DecisionBranch[];
};

function DecisionMatrix() {
  const cards: DecisionCardData[] = [
    {
      num: "1",
      accent: "purple",
      question: "What Slack plan are you on?",
      branches: [
        {
          answer: "Free or Pro",
          pill: <DecisionPill accent="purple">Track B · slackdump-primary</DecisionPill>,
          body: (
            <>
              Expect public channels plus the private channels and DMs your
              authenticated account is a member of. Other people’s DMs are
              invisible.
            </>
          ),
        },
        {
          answer: "Business+",
          pill: <DecisionPill accent="purple">Track A · official admin export</DecisionPill>,
          body: (
            <>
              Full workspace content, including private channels and every
              user’s DMs.
            </>
          ),
        },
        {
          answer: "Enterprise Grid",
          pill: <DecisionPill accent="purple">Track C · grid split</DecisionPill>,
          body: (
            <>
              Either grid-wide export plus a per-workspace split, or
              per-workspace exports.
            </>
          ),
        },
      ],
    },
    {
      num: "2",
      accent: "cyan",
      question: "Where will Mattermost live?",
      branches: [
        {
          answer: "Hetzner AX42/AX52 dedicated",
          pill: <DecisionPill accent="emerald">recommended</DecisionPill>,
          body: (
            <>
              AX42 comfortably serves ~250 users; AX52 handles 1,000.
            </>
          ),
        },
        {
          answer: "OVH Advance / Contabo VPS",
          pill: <DecisionPill accent="cyan">cheaper</DecisionPill>,
          body: <>Same sizing table, different vendor. Lower cost, slightly less headroom.</>,
        },
        {
          answer: "Existing infra you run",
          pill: <DecisionPill accent="cyan">BYO host</DecisionPill>,
          body: (
            <>
              Supply the SSH target as <Mono>TARGET_HOST</Mono>; the skill
              provisions on top of whatever Ubuntu box you point it at.
            </>
          ),
        },
      ],
    },
    {
      num: "3",
      accent: "emerald",
      question: "How do you want to drive the agent?",
      branches: [
        {
          answer: "Click, don’t type",
          pill: <DecisionPill accent="emerald">Path A · Desktop app</DecisionPill>,
          body: (
            <>
              Claude Code or Codex desktop app plus <Mono>jsm</Mono>.
            </>
          ),
        },
        {
          answer: "Terminal-native",
          pill: <DecisionPill accent="emerald">Path B · CLI only</DecisionPill>,
          body: <>Leanest install. Claude Code or Codex CLI, skills symlinked or jsm-installed.</>,
        },
        {
          answer: "Multi-machine",
          pill: <DecisionPill accent="emerald">Path C · CLI + jsm sync</DecisionPill>,
          body: (
            <>
              Cross-device skill sync via <Mono>jsm sync</Mono>. Right when
              two different laptops drive the same migration at different
              stages.
            </>
          ),
        },
      ],
    },
    {
      num: "4",
      accent: "amber",
      question: "Where is your Mattermost database going to live?",
      branches: [
        {
          answer: "Same box as Mattermost",
          pill: <DecisionPill accent="amber">default</DecisionPill>,
          body: (
            <>
              <Mono>{"POSTGRES_DSN=postgres://…@localhost:5432"}</Mono>. Skill
              provisions local PostgreSQL for you.
            </>
          ),
        },
        {
          answer: "Supabase (managed)",
          pill: <DecisionPill accent="amber">managed PG</DecisionPill>,
          body: (
            <>
              Supabase <strong className="text-white">session pooler</strong>{" "}
              on 5432. <em>Not</em> the transaction pooler on 6543 — the
              import job needs session state.
            </>
          ),
        },
        {
          answer: "Your own managed PG",
          pill: <DecisionPill accent="amber">BYO DB</DecisionPill>,
          body: (
            <>
              Provide the DSN; the skill is hands-off on provisioning and only
              reads/writes to what you hand it.
            </>
          ),
        },
      ],
    },
  ];

  return (
    <div className="sm-decisions my-6 md:my-8 grid grid-cols-1 gap-4 md:gap-5">
      {cards.map((c) => (
        <DecisionCard key={c.num} data={c} />
      ))}
    </div>
  );
}

const DECISION_ACCENT: Record<
  DecisionAccent,
  {
    border: string;
    bg: string;
    text: string;
    numBg: string;
    rail: string;
    pillBg: string;
    pillBorder: string;
    pillText: string;
  }
> = {
  purple: {
    border: "border-purple-500/25",
    bg: "bg-purple-500/[0.04]",
    text: "text-purple-300",
    numBg: "bg-purple-500/15 border-purple-500/30 text-purple-200",
    rail: "bg-purple-500/40",
    pillBg: "bg-purple-500/12",
    pillBorder: "border-purple-500/30",
    pillText: "text-purple-200",
  },
  cyan: {
    border: "border-cyan-500/25",
    bg: "bg-cyan-500/[0.04]",
    text: "text-cyan-300",
    numBg: "bg-cyan-500/15 border-cyan-500/30 text-cyan-200",
    rail: "bg-cyan-500/40",
    pillBg: "bg-cyan-500/12",
    pillBorder: "border-cyan-500/30",
    pillText: "text-cyan-200",
  },
  emerald: {
    border: "border-emerald-500/25",
    bg: "bg-emerald-500/[0.04]",
    text: "text-emerald-300",
    numBg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
    rail: "bg-emerald-500/40",
    pillBg: "bg-emerald-500/12",
    pillBorder: "border-emerald-500/30",
    pillText: "text-emerald-200",
  },
  amber: {
    border: "border-amber-500/25",
    bg: "bg-amber-500/[0.04]",
    text: "text-amber-300",
    numBg: "bg-amber-500/15 border-amber-500/30 text-amber-200",
    rail: "bg-amber-500/40",
    pillBg: "bg-amber-500/12",
    pillBorder: "border-amber-500/30",
    pillText: "text-amber-200",
  },
};

function DecisionCard({ data }: { data: DecisionCardData }) {
  const cls = DECISION_ACCENT[data.accent];
  return (
    <div
      className={`relative rounded-2xl border ${cls.border} ${cls.bg} p-5 md:p-6 backdrop-blur-xl overflow-hidden`}
    >
      <div
        aria-hidden
        className={`absolute left-0 top-5 bottom-5 w-[3px] rounded-full ${cls.rail} opacity-70`}
      />
      <div className="flex items-center gap-3 mb-4 md:mb-5 pl-2">
        <span
          className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border ${cls.numBg} font-mono text-[12px] font-bold`}
        >
          {data.num}
        </span>
        <p
          className={`text-[11px] md:text-[12px] font-mono uppercase tracking-[0.22em] ${cls.text}`}
        >
          {data.question}
        </p>
      </div>
      <div className="flex flex-col gap-2 md:gap-2.5 pl-2">
        {data.branches.map((b, i) => (
          <DecisionBranchRow key={i} accent={data.accent} branch={b} />
        ))}
      </div>
    </div>
  );
}

function DecisionBranchRow({
  accent,
  branch,
}: {
  accent: DecisionAccent;
  branch: DecisionBranch;
}) {
  const cls = DECISION_ACCENT[accent];
  return (
    <div className="grid grid-cols-1 md:grid-cols-[180px_minmax(0,1fr)] gap-2 md:gap-4 items-start rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5 md:px-4 md:py-3">
      <div className="flex items-center gap-2 min-w-0">
        <span aria-hidden className={`text-[14px] ${cls.text}`}>
          →
        </span>
        <span className="text-[13px] md:text-[14px] font-semibold text-slate-100 truncate">
          {branch.answer}
        </span>
      </div>
      <div className="flex flex-col gap-1.5 min-w-0">
        {branch.pill && <div className="flex flex-wrap gap-2">{branch.pill}</div>}
        <div className="text-[12px] md:text-[13px] text-slate-400 leading-relaxed">
          {branch.body}
        </div>
      </div>
    </div>
  );
}

function DecisionPill({
  accent,
  children,
}: {
  accent: DecisionAccent;
  children: ReactNode;
}) {
  const cls = DECISION_ACCENT[accent];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10.5px] md:text-[11px] font-mono font-semibold ${cls.pillBg} ${cls.pillBorder} ${cls.pillText}`}
    >
      {children}
    </span>
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
              <span className="text-emerald-300">99% cut</span> in ongoing cost,
              and your whole chat history on hardware you own.
            </p>

            {/* Illustration */}
            <div className="relative mt-12 md:mt-16 mx-auto max-w-[560px]">
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, rgba(6,182,212,0.18) 0%, rgba(168,85,247,0.10) 45%, transparent 70%)",
                  filter: "blur(40px)",
                  transform: "scale(1.2)",
                }}
              />
              <Image
                src={illustration}
                alt="Illustration depicting a migration from a Slack-style chat workspace to a self-hosted Mattermost server, driven by an AI agent pair"
                className="relative z-10 rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl"
                priority
                placeholder="blur"
              />
            </div>

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
              The agent-readable companion to the three skills. Paste the path into Claude Code or Codex and the agent has everything it needs to drive the migration.
            </p>
          </div>
        </EC>
      </section>

      {/* ========== INTRO ========== */}
      <article data-section="intro">
        <EC>
          <p className="sm-drop-cap">
            {"Every few months now, some founder posts a screenshot of Slack’s latest renewal quote and it goes viral. "}
            <a
              href="https://x.com/anothercohen/status/2044255819290525739"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-300 underline decoration-cyan-500/40 underline-offset-4 hover:text-cyan-200"
            >
              This week’s example
            </a>
            {" is a tweet from Alex Cohen, who runs a 40-person company. Slack’s renewal desk quoted him twenty-one thousand dollars a year to move onto the Business+ tier, up from about six thousand a year on Pro, because a customer contract now requires him to sign a BAA. Same software, same workspace, three-and-a-half times the bill. It’s the kind of quote that makes you read it twice and then go check when your own renewal is up."}
          </p>
          <p>
            {"That kind of quote is basically the moment every growing company decides it’s done with Slack. Not because the product is bad (Slack is a pretty polished piece of software), but because the pricing is designed to make the decision for you, and the thing you get back when you cancel is a pile of JSON files with dead links to your own attachments. You never really owned your history. You were renting it, on a meter that only goes up."}
          </p>
          <p>
            {"Until very recently, the reason most companies didn’t actually go through with migrating off "}<J t="mattermost">Slack onto something self-hosted</J>{" was that the migration itself was a real project. Someone had to write a script, chase file links before they expired, rebuild per-channel membership lists, reconcile message counts, stand up a Postgres database, configure Nginx with the right WebSocket upgrade block, and get SMTP working well enough that password-reset emails would actually land in people’s inboxes. Then keep all of that running, every week, forever."}
          </p>
          <p>
            {"What changed is that coding agents got good enough to do the whole project themselves. "}<J t="claude-code">Claude Code</J>{" and "}<J t="codex">Codex</J>{" can run every one of those steps in the background while you drink your coffee. You don’t write bash scripts or SSH into servers. You read a handful of short reports, click Approve on twenty or thirty permission prompts spread out over a week, and paste a short English sentence whenever the agent is ready to move on to the next stage."}
          </p>
          <p>
            {"The actual migration isn’t a fragile custom script. It’s a pair of "}<J t="skill">agent skills</J>{" (one for extraction, one for setup and import), each of which is a directory of prompts, references, and scripts that the agent loads into its context and then drives on your behalf. Those two skills, plus a third that handles the ongoing maintenance, are what the rest of this piece walks through: how they decompose the problem, how the agent actually drives them, and every operational detail you’ll want in front of you on cutover day."}
          </p>
          <p>
            {"The thing that actually got me interested in writing this up, by the way, isn’t Slack specifically. It’s the broader shape of problems like Slack: expensive enterprise software whose moat is mostly the difficulty of migrating off. Jira is one of these. Splunk is one of these. The pattern is always the same: your vendor quietly raises the price every year, you shop around, you find something plausible and open-source, you sit down and think about how much of a project it would actually be to move your data over, and you just stay and pay. Two well-designed agent skills break that pattern. The rest of this article is the Slack case in full operational detail; the pattern itself generalizes to other corners of enterprise software, and I’ll come back to it at the end."}
          </p>

          {/* Table of contents */}
          <nav className="sm-toc" aria-label="Table of contents">
            <h3>Contents</h3>
            <ol>
              <li><a href="#install">Install the skills</a></li>
              <li><a href="#why-bother">Why bother migrating?</a></li>
              <li><a href="#cost-math">The money math</a></li>
              <li><a href="#decision-tree">Which path through this guide</a></li>
              <li><a href="#pipeline">The two-phase pipeline</a></li>
              <li><a href="#preservation">What survives the move</a></li>
              <li><a href="#ready-gate">The fail-closed readiness gate</a></li>
              <li><a href="#cutover-day">Cutover day, minute by minute</a></li>
              <li><a href="#phase-3">Ongoing maintenance</a></li>
              <li><a href="#pattern">A pattern, not a migration</a></li>
            </ol>
          </nav>
        </EC>
      </article>

      {/* ========== SKILL CATALOG CALLOUTS ========== */}
      <section data-section="catalog">
        <EC>
          <div className="my-5 md:my-6 rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-purple-500/[0.05] via-cyan-500/[0.05] to-emerald-500/[0.05] p-5 md:p-6 backdrop-blur-xl">
            <p className="text-[10px] md:text-[11px] font-mono uppercase tracking-[0.25em] text-cyan-300 mb-3">
              Skill catalog pages · open in a new tab
            </p>
            <ul className="space-y-2.5 text-[13px] md:text-[14px] leading-relaxed">
              <li>
                <a
                  href="https://jeffreys-skills.md/skills/slack-migration-to-mattermost-phase-1-extraction"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-cyan-300 hover:text-cyan-200 underline decoration-cyan-500/40 underline-offset-4 break-all"
                >
                  jeffreys-skills.md/skills/slack-migration-to-mattermost-phase-1-extraction
                </a>
                <span className="text-slate-400"> — Phase 1, the Slack-side extraction skill.</span>
              </li>
              <li>
                <a
                  href="https://jeffreys-skills.md/skills/slack-migration-to-mattermost-phase-2-setup-and-import"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-cyan-300 hover:text-cyan-200 underline decoration-cyan-500/40 underline-offset-4 break-all"
                >
                  jeffreys-skills.md/skills/slack-migration-to-mattermost-phase-2-setup-and-import
                </a>
                <span className="text-slate-400"> — Phase 2, the Mattermost-side deploy + import skill.</span>
              </li>
              <li>
                <a
                  href="https://jeffreys-skills.md/skills/slack-migration-to-mattermost-phase-3-ongoing-maintenance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-cyan-300 hover:text-cyan-200 underline decoration-cyan-500/40 underline-offset-4 break-all"
                >
                  jeffreys-skills.md/skills/slack-migration-to-mattermost-phase-3-ongoing-maintenance
                </a>
                <span className="text-slate-400"> — Phase 3, the ongoing-maintenance skill (weekly sweep, auto-rollback upgrades, restore drills).</span>
              </li>
            </ul>
            <p className="mt-4 text-[12px] md:text-[13px] text-slate-400 leading-relaxed">
              <strong className="text-amber-200">Heads up:</strong> those three URLs return a 404 unless you are signed in to a jeffreys-skills.md account with an active subscription. If you hit a 404, sign up (or log in) at <Mono>jeffreys-skills.md/dashboard</Mono> first and reload. It’s the same account the <Mono>jsm</Mono> CLI authenticates against below, so doing this step first means <Mono>jsm install</Mono> will already know who you are.
            </p>
          </div>

          <div className="my-5 md:my-6 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.04] via-cyan-500/[0.04] to-emerald-500/[0.04] p-5 md:p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[10px] md:text-[11px] font-mono uppercase tracking-[0.25em] text-emerald-300">
                What shipped in the latest release · April 2026
              </p>
            </div>

            <div className="space-y-4 md:space-y-5">
              <div>
                <p className="text-[11px] md:text-[12px] font-mono mb-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-emerald-200">
                    v2
                  </span>
                  <span className="ml-2 text-purple-300 font-semibold">Phase 1 · extraction</span>
                </p>
                <p className="text-[13px] md:text-[14px] text-slate-300 leading-relaxed">
                  7-stage <Mono>migrate.sh</Mono> with a plan-tier router that picks <em>official-export-primary</em> (Business+ / Enterprise Grid), <em>slackdump-primary</em> (Pro / Free), or <em>Grid split</em> automatically. Four non-negotiable validators run before the bundle is declared import-ready: artifact hash + layout, JSONL ordering + linkage, enrichment completeness, and raw-vs-enriched-vs-JSONL count reconciliation. The machine-readable Phase 1 → Phase 2 contract ships four files: <Mono>handoff.json</Mono>, <Mono>verification.md</Mono>, <Mono>unresolved-gaps.md</Mono>, <Mono>evidence-pack.json</Mono>. 21 scripts and 6 focused subagents (<Mono>acquisition-auditor</Mono>, <Mono>gap-hunter</Mono>, <Mono>token-exposure-redteam</Mono>, <Mono>compliance-approval-auditor</Mono>, <Mono>slack-plan-tier-router</Mono>, <Mono>reconciliation-analyst</Mono>) each emit a verdict of <span className="text-emerald-300 font-mono">ready</span>, <span className="text-rose-300 font-mono">blocked</span>, or <span className="text-amber-300 font-mono">needs-review</span>.
                </p>
              </div>

              <div>
                <p className="text-[11px] md:text-[12px] font-mono mb-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-emerald-200">
                    v2
                  </span>
                  <span className="ml-2 text-cyan-300 font-semibold">Phase 2 · setup &amp; import</span>
                </p>
                <p className="text-[13px] md:text-[14px] text-slate-300 leading-relaxed">
                  Eight <Mono>operate.sh</Mono> stages (<Mono>intake</Mono> through <Mono>live</Mono>). Opinionated stack: Ubuntu + PostgreSQL 16 (Supabase pooler or self-hosted) + Cloudflare R2 for files + Cloudflare Tunnel for origin + Nginx with the WebSocket upgrade block wired so realtime works on first try. <strong className="text-white">Staging rehearsal is mandatory</strong>; the full cutover runs against staging first, with smoke tests and an e2e pass, before anyone touches production. Seven explicit Go/No-Go gates with a <em>named</em> rollback owner sit between the rehearsal and the DNS flip: <Mono>intake-valid</Mono>, <Mono>infra-provisioned</Mono>, <Mono>stack-deployed</Mono>, <Mono>import-reconciled</Mono>, <Mono>staging-passed</Mono>, <Mono>war-room-GO</Mono>, <Mono>cutover-complete</Mono>. One red gate stops the pipeline. No improvising at 11 pm on cutover night.
                </p>
              </div>

              <div>
                <p className="text-[11px] md:text-[12px] font-mono mb-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-emerald-200">
                    v3
                  </span>
                  <span className="ml-2 text-emerald-300 font-semibold">Phase 3 · ongoing maintenance</span>
                </p>
                <p className="text-[13px] md:text-[14px] text-slate-300 leading-relaxed">
                  Eight <Mono>maintain.sh</Mono> stages that turn maintenance into code instead of tribal knowledge: <Mono>health</Mono>, <Mono>update-os</Mono>, <Mono>update-mattermost</Mono>, <Mono>db-backup</Mono>, <Mono>restore-drill</Mono>, <Mono>rotate-credentials</Mono>, <Mono>incident</Mono>, <Mono>disaster-recovery</Mono>. The quarterly restore drill is a gate, not a suggestion: <Mono>update-mattermost</Mono> <em>refuses</em> to run if the last successful drill is older than 90 days, on the grounds that a backup you have never restored from is not a backup. Credential rotation cadences are code, not tribal knowledge: Mattermost PAT on a 90-day wall clock, <Mono>mmuser</Mono> Postgres password on 180 days, SSH keys and rclone tokens annually. The rotation-audit JSON is the source of truth. Seven subagents (<Mono>health-drift-auditor</Mono>, <Mono>backup-integrity-auditor</Mono>, <Mono>version-drift-auditor</Mono>, <Mono>db-bloat-auditor</Mono>, <Mono>security-posture-auditor</Mono>, <Mono>incident-coordinator</Mono>, <Mono>maintenance-scheduler</Mono>) deliver deep second opinions on demand.
                </p>
              </div>
            </div>

            <p className="mt-5 text-[11px] md:text-[12px] text-slate-500 leading-relaxed italic">
              Each skill page linked above has the full changelog, a live visualization of the flow, and the verbatim <Mono>SKILL.md</Mono> the agent loads into its context.
            </p>
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== INSTALL THE SKILLS ========== */}
      <section data-section="install">
        <EC>
          <SectionHeader id="install" eyebrow="Install" title="Get the skills onto your laptop." />

          <p>
            {"Two recommended ways to install the three skills, depending on how you like your tooling. The jsm path is what most operators use: it verifies hashes on download, tracks installed versions locally, and handles upgrades and multi-machine sync for you."}
          </p>

          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-400 mt-5">
            Recommended: via jsm (Jeffrey’s Skills.md)
          </p>
          <Code>
{`# macOS / Linux
curl -fsSL https://jeffreys-skills.md/install.sh | bash
# Windows (PowerShell as Admin)
irm https://jeffreys-skills.md/install.ps1 | iex

jsm setup                        # first-time wizard: config + skill dirs
jsm login                        # browser → sign in with Google
jsm install slack-migration-to-mattermost-phase-1-extraction
jsm install slack-migration-to-mattermost-phase-2-setup-and-import
jsm install slack-migration-to-mattermost-phase-3-ongoing-maintenance`}
          </Code>

          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-400 mt-4">
            Alternative: via claude plugins
          </p>
          <Code>
{`claude plugins install slack-migration-to-mattermost-phase-1-extraction
claude plugins install slack-migration-to-mattermost-phase-2-setup-and-import
claude plugins install slack-migration-to-mattermost-phase-3-ongoing-maintenance`}
          </Code>

          <p>
            {"Restart the Claude Code or Codex desktop app (or CLI session) and the skills show up in the skill picker. On first use each skill runs its own "}
            <Mono>bootstrap-tools.sh</Mono>
            {", which installs the underlying CLIs it needs (slackdump, mmetl, mmctl, jq, psql, etc.) via Homebrew on macOS, apt on Ubuntu / Debian / WSL, and a Chocolatey checklist on Windows. If you want the agent to drive your browser and the Mattermost admin UI directly, the skill’s "}
            <Mono>setup-mcp.sh</Mono>
            {" wires up the Slack, Playwright, and Mattermost "}
            <J t="mcp">MCP</J>
            {" servers for whichever agent CLIs you have. You do not run any of that by hand."}
          </p>

          <div className="sm-insight-card">
            <p className="text-[11px] font-mono text-purple-300 uppercase tracking-[0.25em] mb-3">
              Then the interface is English
            </p>
            <p className="text-base md:text-lg leading-relaxed text-slate-200 mb-3">
              Once the skills are installed, you open Claude Code or Codex and say something like:
            </p>
            <p className="text-[14px] md:text-[15px] font-mono text-cyan-200 bg-black/40 border border-cyan-500/20 rounded-lg px-4 py-3 leading-relaxed">
              {"“Use the slack-migration-to-mattermost-phase-1-extraction skill to run the setup stage against my Slack workspace.”"}
            </p>
            <p className="text-[13px] md:text-sm text-slate-400 mt-3 leading-relaxed">
              The agent reads the skill, executes the stage, writes a report, and waits for your next sentence. Every destructive step prompts for approval. Everything else is the agent doing the thing the skill already knows how to do. The rest of this piece is mostly here so you know what the visualizations are showing and why the gates are where they are; the operational detail lives in the skills themselves, and the agent is the one who has to read it.
            </p>
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== WHY BOTHER ========== */}
      <section data-section="why-bother">
        <EC>
          <SectionHeader id="why-bother" eyebrow="Part 0 · Why bother" title="Why bother with any of this?" />

          <p>
            {"Honest answer: to save a lot of money without losing your history. Alex Cohen’s tweet is just one data point. The pattern underneath it is universal: Slack’s Pro plan keeps you hooked with decent features, and when you grow past the point where Pro’s limits hurt, or need a BAA, or need to export private channels, or want SSO, or just want a saner admin, the vendor hands you a quote that makes your eyes water."}
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

          <p>
            {"What this article does "}
            <em>not</em>
            {" try to convince you of: that Mattermost is more polished than Slack for every end-user scenario. Slack has spent a decade on UX details Mattermost is still catching up on (huddles have no drop-in equivalent; some channel-management ergonomics are less clicky). If you’re 5 people and pay $0/month on Slack’s Free tier and love it, this whole exercise is a waste of time. The migration pays off when your Slack bill is a real line item and the vendor’s next price-hike email is about to hit your inbox."}
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== DECISION TREE / THREE PATHS ========== */}
      <section data-section="decision-tree">
        <EC>
          <SectionHeader id="decision-tree" eyebrow="Before you start" title="Which path through this guide is for you?" />

          <p>
            {"There are three supported paths. Pick one now and stay with it; they produce the exact same result, and the only difference is how the skills get onto your machine and how you drive the agent."}
          </p>

          <DecisionMatrix />


          <p>
            {"If any branch surprises you, read its linked section before continuing. The skills themselves detect which path the operator is on and route accordingly; the Slack plan tier alone changes validators downstream."}
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
            {" for Business+. A thousand-person company is paying somewhere between ninety and a hundred and fifty thousand dollars a year just to have a chat window. A forty-person company is paying between thirty-five hundred and six thousand, modest in absolute terms, but a reliable target for the next "}
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
            {"Run the slider below. The absolute savings are large, but the more interesting thing is how the curve shape changes with scale. Slack compounds linearly with headcount. The Mattermost bill barely moves until you need a second box."}
          </p>
        </EC>

        <EC>
          <div className="sm-viz-wrap">
            <CostCompoundingViz />
          </div>
        </EC>
      </section>

      <Divider />

      {/* ========== PIPELINE VIZ ========== */}
      <section data-section="pipeline">
        <EC>
          <SectionHeader id="pipeline" eyebrow="The two-phase pipeline" title="Phase 1 → handoff → Phase 2." />
          <p>
            {
              "Both skills expose an ordered list of stages. You don’t typically run them all at once. Most operators step through stage by stage and read the reports between each, because the reports are where the decisions live: what was exported, what’s on disk, whether reconciliation counts line up, whether the staging rehearsal passed. Tap any node or edge below to see what it actually does."
            }
          </p>

          <div className="sm-viz-wrap">
            <PhasePipelineViz />
          </div>
        </EC>

        {/* PHASE 1 ZOOM-OUT CARD (moved from phase-1-stages) */}
        <EC>
          <Sub eyebrow="§3.8 · zoom out">What Phase 1 actually ships: 21 scripts, 6 subagents, 4 validators</Sub>
          <p>
            {"The seven "}
            <Mono>migrate.sh</Mono>
            {" stages above are the "}
            <em>interface</em>
            {". Underneath, Phase 1 is a 112-file skill with 21 scripts, 6 focused subagents, and four non-negotiable validators that run before the bundle is allowed to hand off to Phase 2."}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/[0.04] p-4 md:p-5">
              <p className="text-[10px] md:text-[11px] font-mono uppercase tracking-[0.25em] text-purple-300 mb-3">
                Four non-negotiable validators
              </p>
              <ul className="space-y-2 text-[13px] md:text-[14px] text-slate-300 leading-relaxed">
                <li><strong className="text-white">Artifact hash + layout.</strong> Every ZIP, CSV, and emoji asset lives in a quarantined tree under a SHA-256 manifest.</li>
                <li><strong className="text-white">JSONL ordering + linkage.</strong> Strict object order (version, emoji, team, channel, user, post, direct_channel, direct_post); threads reference their parent before the parent is redefined.</li>
                <li><strong className="text-white">Enrichment completeness.</strong> Attachment count against <Mono>url_private</Mono> count; email coverage vs users in the export.</li>
                <li><strong className="text-white">Raw-vs-enriched-vs-JSONL count reconciliation.</strong> Three independent counts must agree or the bundle is refused.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04] p-4 md:p-5">
              <p className="text-[10px] md:text-[11px] font-mono uppercase tracking-[0.25em] text-cyan-300 mb-3">
                Six focused subagents
              </p>
              <ul className="space-y-2 text-[13px] md:text-[14px] text-slate-300 leading-relaxed font-mono">
                <li><strong className="text-cyan-200">acquisition-auditor</strong>, which proves the export actually represents the workspace.</li>
                <li><strong className="text-cyan-200">gap-hunter</strong>, which finds features that did not migrate and classifies them.</li>
                <li><strong className="text-cyan-200">token-exposure-redteam</strong>, which scans for leaked xoxp / xoxb / xoxc tokens in artifacts.</li>
                <li><strong className="text-cyan-200">compliance-approval-auditor</strong>, which produces the legal-approval packet.</li>
                <li><strong className="text-cyan-200">slack-plan-tier-router</strong>, which decides Track A vs Track B vs Track C automatically.</li>
                <li><strong className="text-cyan-200">reconciliation-analyst</strong>, which reads raw / enriched / JSONL counts and explains any drift.</li>
              </ul>
              <p className="mt-3 text-[11px] text-slate-500 italic">
                Each subagent emits a verdict of <span className="text-emerald-300 font-mono">ready</span> · <span className="text-rose-300 font-mono">blocked</span> · <span className="text-amber-300 font-mono">needs-review</span>.
              </p>
            </div>
          </div>
          <p>
            {"The four-file handoff contract Phase 2 consumes ("}
            <Mono>handoff.json</Mono>, <Mono>verification.md</Mono>, <Mono>unresolved-gaps.md</Mono>, <Mono>evidence-pack.json</Mono>
            {") is built exactly when every validator passes and every subagent verdict is accounted for. No tribal knowledge crosses the phase boundary; the import phase reads structured inputs, not a README and a prayer."}
          </p>
        </EC>

      </section>

      <Divider />

      {/* ========== THE ASYMMETRIC BET — CALLOUT ========== */}
      <section id="asymmetric-bet" data-section="asymmetric">
        <EC>
          <h2 className="sm-section-title mb-6 mt-4 text-white">An asymmetric bet.</h2>
          <p>
            {
              "The most important property of this whole migration, and the reason it’s worth running even if you are a little skeptical: "
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
      <section id="preservation" data-section="preservation">
        <EC>
          <h2 className="sm-section-title mb-6 mt-4 text-white">What survives the move.</h2>
          <p>
            {
              "Every internal stakeholder will ask some variant of this (legal, HR, the people who ran Slackbot automations, the guy with four hundred saved items): "
            }
            <em>“does my X survive?”</em>
            {" There are three possible answers, and the skill classifies each Slack feature into exactly one of them. "}
            <strong>Native</strong> means it imports as first-class Mattermost data: public and private channel messages, DMs, threads, reactions, file attachments, pinned messages, channel topics, custom emoji images. <strong><J t="sidecar">Sidecar</J></strong> means the content is preserved, but as posts in a dedicated archive channel rather than as native Mattermost objects. Canvases, lists, and admin audit CSVs all end up this way. <strong>Unrecoverable</strong> means the content is not in Slack’s export at all and cannot be migrated; the best you can do is document it in <J t="unresolved-gaps">unresolved-gaps.md</J>, which the skill generates automatically, and plan a rebuild or an acceptance.
          </p>
          <p>
            {
              "The matrix below lets you filter by disposition and toggle between Business+ and Pro plans. On Business+, most things are native. On Pro, private channels and DMs downgrade because Slack's Free/Pro export cannot see content the export token's user is not a party to; you fall back to "
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
              "The rule the skills enforce: known-unknowns named in advance are cheaper than unknown-unknowns discovered in production. Anything that doesn't survive as native, and can't be preserved as a sidecar, gets an entry with one of four classifications: "
            }
            <span className="font-mono text-cyan-200">native-importable</span>, <span className="font-mono text-cyan-200">sidecar-only</span>, <span className="font-mono text-cyan-200">manual-rebuild</span>, or <span className="font-mono text-cyan-200">unrecoverable</span>
            {", so that when a user says at T+3 days “where are my saved items?”, you already have the answer written down and a rebuild plan."}
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== THE READY GATE ========== */}
      <section id="ready-gate" data-section="ready-gate">
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
              "The skill also enforces a closely related rule, almost comically low-tech: the rollback owner must be "
            }
            <em>a name and an email</em>
            {", populated into "}
            <span className="font-mono text-sm">ROLLBACK_OWNER</span>
            {" before the gate is allowed to pass. Not “whoever is on call.” Not a team alias. A specific human who has pre-committed to being the one who calls the abort. In practice this is usually the operator running the migration, or their CTO. The point is to remove ambiguity at the exact moment it would otherwise cost you."}
          </p>

          <Sub eyebrow="§4.9 · zoom out">The seven Go/No-Go gates, not just the ready gate</Sub>
          <p>
            {"The "}
            <Mono>ready</Mono>
            {" stage is one of "}
            <strong>seven</strong>
            {" explicit gates Phase 2 walks through between the Phase 1 handoff bundle and users typing into production. Every gate has a written-down pass criterion before the migration starts, and every gate can block the next one. One red gate stops the pipeline. No improvising at 11 pm on cutover night."}
          </p>
          <RefTable
            cols={[
              { key: "n", label: "#" },
              { key: "gate", label: "Gate" },
              { key: "pass", label: "Passes when" },
            ]}
            rows={[
              { n: "1", gate: <Mono>intake-valid</Mono>, pass: <>Phase 1 bundle checksum-verified, row counts reconciled against <Mono>handoff.json</Mono>, secret-scan clean, <Mono>ROLLBACK_OWNER</Mono> named.</> },
              { n: "2", gate: <Mono>infra-provisioned</Mono>, pass: <>Ubuntu host, PostgreSQL 16 (Supabase pooler or self-hosted), Cloudflare R2 bucket, Cloudflare Tunnel, Nginx all reachable; <Mono>doctor.sh</Mono> green.</> },
              { n: "3", gate: <Mono>stack-deployed</Mono>, pass: <>Mattermost serving <Mono>/api/v4/system/ping</Mono>; WebSocket upgrade block live; TLS terminating at the edge; SMTP sends a test email.</> },
              { n: "4", gate: <Mono>import-reconciled</Mono>, pass: <><Mono>mmctl</Mono> bulk-import completed; reconciliation report matches the handoff manifest for users / channels / posts / DMs.</> },
              { n: "5", gate: <Mono>staging-passed</Mono>, pass: <>Full cutover rehearsed against a throwaway staging VPS first; smoke tests + e2e pass captured in <Mono>latest-staging.json</Mono>.</> },
              { n: "6", gate: <Mono>war-room-GO</Mono>, pass: <>Named rollback owner acknowledges; status-page update drafted; 60-second TTL on the DNS record already set; comms kit paged.</> },
              { n: "7", gate: <Mono>cutover-complete</Mono>, pass: <>DNS flipped; <Mono>cutover-status.*.json</Mono> records <Mono>status: success</Mono>; reconciliation second-pass green; activation announcement sent.</> },
            ]}
          />
          <p>
            {"Writing the gates down isn’t bureaucracy; it removes the 11-pm-on-cutover-night temptation to improvise. Every gate is a place the skill will cheerfully stop, file a blocked-reason, and let the operator fix the input rather than guess at what “good enough” looks like."}
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
              "The moment non-technical operators worry about most is when the old and new systems switch. That moment is the most orchestrated, best-narrated part of the whole process, because the skill has been thinking about cutover since before it was written. Here is what it looks like on your screen."
            }
          </p>
          <p>
            {
              "At T minus sixty minutes, you paste a short sentence asking the agent to run "
            }
            <span className="font-mono text-emerald-200">ready</span>
            {" one more time. The agent re-reads every report and emits a readiness score with each category graded green. At T minus fifteen, you flip Slack to read-only yourself, in a browser tab (this is a human-in-the-loop step on purpose) and post the freeze notice from the comms kit. At T equals zero, you paste: “Run Phase 2 stage "}
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
          <Sub id="phase3-stages" eyebrow="§12.2">The eight maintain.sh stages</Sub>
          <p>
            {"Every Phase 3 operation is a named stage of "}
            <Mono>maintain.sh</Mono>
            {". Each stage has an input contract, a named rollback owner, and emits a JSON artifact that the next stage reads. It’s the same "}
            <em>fail-closed, evidence-first</em>
            {" shape as Phase 1 and Phase 2, now operating on a one-week rather than one-weekend clock:"}
          </p>

          <RefTable
            cols={[
              { key: "stage", label: "Stage" },
              { key: "does", label: "What it does" },
              { key: "cadence", label: "Cadence" },
            ]}
            rows={[
              {
                stage: <Mono>health</Mono>,
                does: "Single-shot probe of uptime, queue depth, p99 latency, disk headroom, TLS expiry, and Postgres vacuum state. Emits the baseline every subsequent change is measured against.",
                cadence: "weekly",
              },
              {
                stage: <Mono>update-os</Mono>,
                does: <>Stages <Mono>unattended-upgrade</Mono>, schedules the reboot inside <Mono>REBOOT_WINDOW_*</Mono> off-hours bounds, posts a status-page message, and <strong>refuses</strong> to reboot outside the window.</>,
                cadence: "monthly",
              },
              {
                stage: <Mono>update-mattermost</Mono>,
                does: <>Follows the ESR track, verifies DB schema compatibility, tests the new <Mono>mmctl</Mono> binary against the new server, and fails closed on plugin-breaking version skew. Auto-rollback on a 3-minute <Mono>/api/v4/system/ping</Mono> check.</>,
                cadence: "quarterly",
              },
              {
                stage: <Mono>db-backup</Mono>,
                does: <><Mono>pg_dump</Mono> → hashed artifact → mirror to <Mono>OFFSITE_REMOTE</Mono> via rclone. Refuses to mark the backup complete until the uploaded SHA-256 matches the local dump.</>,
                cadence: "nightly",
              },
              {
                stage: <Mono>restore-drill</Mono>,
                does: <>Spins up a scratch database, restores the most recent backup end-to-end, compares row counts against the source. <strong className="text-amber-200">Gates</strong> <Mono>update-mattermost</Mono>: the upgrade refuses to run if the last successful drill is older than 90 days.</>,
                cadence: "quarterly (gate)",
              },
              {
                stage: <Mono>rotate-credentials</Mono>,
                does: "Walks the operator through each credential on its own wall clock. PAT 90 days, mmuser Postgres password 180 days, SSH keys yearly, rclone tokens yearly. The rotation-audit JSON is the source of truth.",
                cadence: "per-scope",
              },
              {
                stage: <Mono>incident</Mono>,
                does: <>Opens a per-incident quarantine directory, snapshots process + network + disk state, kicks a status-page update, and links the playbook keyed to the symptom class (DB down, TLS expired, disk full, abuse). Post-mortem skeleton pre-populated.</>,
                cadence: "on demand",
              },
              {
                stage: <Mono>disaster-recovery</Mono>,
                does: <>Restores the most recent offsite backup onto a <em>fresh</em> host and keeps the original machine offline as forensic evidence. Produces a runbook instead of a panic.</>,
                cadence: "on DR trigger",
              },
            ]}
          />

          <p>
            {"Of the eight stages, "}
            <Mono>update-mattermost</Mono>
            {" is the one most worth zooming into, because its "}
            <J t="auto-rollback">auto-rollback loop</J>
            {" is what turns Mattermost upgrades from a sweaty-palm activity into a background task:"}
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
              "Pair the auto-rollback loop with the quarterly restore drill and you have a backup pipeline that is actually tested, not one that will let you down the exact day the host dies. That is the whole point of running your own chat server. You own the schema, the hardware, the upgrade path, and the knowledge that the loops you depend on have been exercised on a scratch database recently enough to be trusted."
            }
          </p>

          <p>
            {"The remaining stages, subagents, prompts library, scenario packs, weekly-cadence runbook, disaster-recovery drill, credential-rotation cadence, and “when to bring in more tooling” playbook all live inside the Phase 3 skill. See the skill page at the top of the article for the full catalog."}
          </p>
        </EC>
      </section>

      <Divider />

      {/* ========== THE GENERAL PATTERN ========== */}
      <section id="pattern" data-section="pattern" className="pb-10 md:pb-14">
        <EC>
          <h2 className="sm-section-title mb-6 mt-4 text-white">A pattern, not a migration.</h2>
          <p>
            {
              "Zooming out, the interesting thing here isn’t about chat software. It’s about the shape of problems that get dramatically cheaper to solve when a coding agent is driving a well-written skill."
            }
          </p>
          <p>
            {
              "A decade ago, a company that wanted to move off Slack had three options. Hire a consultant for a six-figure fixed bid. Assign an internal engineer and lose them for a month. Or stay on Slack, grumble every April, and pay the price hike. The middle option, “assign an engineer,” was the right one for a lot of companies, but it wasn’t cheap, and every time a new platform came out the institutional knowledge from the previous migration was gone."
            }
          </p>
          <p>
            {
              "The agent-plus-skill pattern collapses the expense side of that decision. The senior engineer writes the skill "
            }
            <em>once</em>
            {", against the problem as it exists today, and every subsequent user inherits the whole thing, including the edge cases that cost the first engineer two weekends to discover. The skill is version-controlled, signed, installable in a minute, and pinnable to a known-good release for a production run. It doesn’t decay the way a custom pipeline does. It behaves more like infrastructure, published like a library, that any company with a Claude Code or Codex subscription can run against their own Slack."}
          </p>
          <p>
            {
              "The pattern generalizes beyond Slack, of course. One-off infrastructure migrations (databases between providers, DNS between registrars, CI systems between vendors, Jira to an open-source tracker, Splunk to OpenSearch) are exactly the shape of problem that fits into a paired-skill architecture. Each has a sensitive extract step, a transform, a staging rehearsal, a fail-closed gate, and a cutover that needs to be "
            }
            <J t="asymmetric-bet">an asymmetric bet</J>
            {" by construction. Each is worth doing at most once per company, and the institutional knowledge is worth retaining forever. Each is a project a senior engineer would resent being assigned. Each is a thing an agent-driven skill, well-designed, can do in a weekend."}
          </p>
          <p>
            {"If you’re still paying Slack today, at some point in the next eighteen months the vendor will email you a new number, and it will be larger than the current one by some multiple that is too painful to ignore. When it happens, you have two options. You can pay. Or you can open a new Claude Code session, paste one sentence, and be somewhere better by the end of the weekend."}
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
