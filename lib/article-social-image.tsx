import { ImageResponse } from "next/og";

export type SocialImageVariant = "opengraph" | "twitter";

export type WritingSocialData = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
};

const WRITING_SOCIAL_DATA: Record<string, Omit<WritingSocialData, "slug">> = {
  overprompting: {
    title: "The Overprompting Trap",
    excerpt:
      "Why giving AI models too many constraints degrades output quality, and a two-phase workflow that improves results.",
    category: "AI & Prompting",
  },
  raptorq: {
    title: "RaptorQ: The Black Magic of Liquid Data",
    excerpt:
      "How fountain codes turn one file into an interchangeable stream of packets with near-optimal recovery overhead.",
    category: "Algorithms & Networking",
  },
  cmaes_explainer: {
    title: "The Incredible Magic of CMA-ES",
    excerpt:
      "An interactive guide to covariance adaptation in black-box optimization where gradients fail.",
    category: "Algorithms",
  },
  bakery_algorithm: {
    title: "Lamport's Bakery Algorithm",
    excerpt:
      "A visual deep dive into fair mutual exclusion without atomic hardware primitives.",
    category: "Algorithms",
  },
  "barra-factor-model": {
    title: "Factor Risk Models and the Hedge Fund Business",
    excerpt:
      "An insider's look at how factor models shape incentives, crowding, and risk in multi-manager platforms.",
    category: "Investing",
  },
  barra_factor_model_article: {
    title: "Factor Risk Models and the Hedge Fund Business",
    excerpt:
      "An insider's look at how factor models shape incentives, crowding, and risk in multi-manager platforms.",
    category: "Investing",
  },
  bio_inspired_architecture: {
    title: "Building a Brain, Not a Calculator",
    excerpt:
      "A bio-inspired architecture for AI systems with metabolic, adaptive behavior instead of static weights.",
    category: "Frontier Research",
  },
  dr_gpt_empowering_your_healthcare_with_ai: {
    title: "Dr. GPT: Empowering Your Healthcare Decisions",
    excerpt:
      "A workflow for using AI as a patient advocate across fragmented records, diagnoses, and treatments.",
    category: "Healthcare & AI",
  },
  hermann_grassmann_nature_of_abstractions: {
    title: "The Lessons of Hermann Grassmann",
    excerpt:
      "How a radical abstraction reshaped modern mathematics despite decades of rejection.",
    category: "History of Math",
  },
  hoeffdings_d_explainer: {
    title: "My Favorite Statistical Measure: Hoeffding's D",
    excerpt:
      "A non-parametric measure that catches non-linear dependence where Pearson and Spearman fail.",
    category: "Statistics",
  },
  intro_post_discussing_blogging_system: {
    title: "Introducing a Next.js GitHub Blogging System",
    excerpt:
      "A pragmatic architecture for markdown-driven publishing with static generation and fast iteration.",
    category: "Web Development",
  },
  llm_introspective_compression: {
    title: "LLM Introspective Compression",
    excerpt:
      "Treating context as a save state to unlock better backtracking, memory, and iterative reasoning.",
    category: "AI Research",
  },
  llm_multi_round_coding_tournament: {
    title: "Multi-Round LLM Coding Tournament",
    excerpt:
      "A framework where multiple models iteratively review and improve code to escape local optima.",
    category: "AI Research",
  },
  making_complex_code_changes_with_cc: {
    title: "Making Complex Code Changes with Claude Code",
    excerpt:
      "Separate planning from implementation to increase reliability on non-trivial code transformations.",
    category: "Dev Workflow",
  },
  making_of_the_mindmap_generator: {
    title: "Engineering the Mindmap Generator",
    excerpt:
      "Why non-linear exploration beats simple pipelines for extracting structure from complex documents.",
    category: "Software Architecture",
  },
  model_guided_math: {
    title: "11 Ways to Break the Transformer",
    excerpt:
      "A model-guided mathematical exploration across geometry, algebra, and alternative representational systems.",
    category: "Frontier Research",
  },
  nextjs_github_blogging_system: {
    title: "Next.js GitHub Markdown Blog System",
    excerpt:
      "Using GitHub as a headless CMS with static generation for speed, scale, and versioned publishing.",
    category: "Web Dev",
  },
  ppp_loan_fraud_analysis: {
    title: "PPP Loan Fraud: A Data Science Detective Story",
    excerpt:
      "How simple heuristics and network analysis could have caught large-scale financial abuse.",
    category: "Data Science",
  },
  protecting_against_prompt_injection: {
    title: "Protecting Against AI Prompt Injection",
    excerpt:
      "A practical look at jailbreak evolution and external guardrail strategies that actually hold up.",
    category: "Security",
  },
  some_thoughts_on_ai_alignment: {
    title: "Some Thoughts on AI Alignment",
    excerpt:
      "Why external monitoring and enforcement mechanisms may scale better than internal constraints.",
    category: "AI Safety",
  },
  tax_gpt_using_ai_for_tax_prep: {
    title: "TaxGPT: Using AI for Tax Prep",
    excerpt:
      "Chunking dense financial records into model-friendly units to find deductions and reduce errors.",
    category: "Utility",
  },
  the_most_impressive_prediction_of_all_time: {
    title: "The Most Impressive Prediction of All Time",
    excerpt:
      "A historical case study in forecasting, evidence, and disciplined Bayesian-style updating.",
    category: "History & Science",
  },
  the_short_case_for_nvda: {
    title: "The Short Case for Nvidia Stock",
    excerpt:
      "A deep analysis of valuation risk, AI capex reflexivity, and market narratives under stress.",
    category: "Markets & AI",
  },
  what_i_learned_making_the_python_backend_for_yto: {
    title: "Building the Python Backend for YTO",
    excerpt:
      "Lessons from shipping an async FastAPI backend with heavy workloads and concurrency constraints.",
    category: "Engineering",
  },
};

const WRITING_SOCIAL_SLUG_ALIASES: Record<string, string> = {
  barra_factor_model_article: "barra-factor-model",
};

function normalizeWritingSocialSlug(slug: string): string {
  const normalizedSlug = slug.trim().replace(/\.md$/i, "");
  return WRITING_SOCIAL_SLUG_ALIASES[normalizedSlug] ?? normalizedSlug;
}

type Theme = {
  bgStart: string;
  bgMid: string;
  bgEnd: string;
  grid: string;
  orbA: string;
  orbB: string;
  accentA: string;
  accentB: string;
  accentSoft: string;
  titleStart: string;
  titleEnd: string;
  body: string;
  pillBg: string;
  pillBorder: string;
  pillText: string;
  tagBg: string;
  tagBorder: string;
  tagText: string;
};

const THEMES: Theme[] = [
  {
    bgStart: "#070b14",
    bgMid: "#0d1628",
    bgEnd: "#0a0f1b",
    grid: "#22d3ee",
    orbA: "rgba(34,211,238,0.18)",
    orbB: "rgba(59,130,246,0.16)",
    accentA: "#22d3ee",
    accentB: "#60a5fa",
    accentSoft: "#0e7490",
    titleStart: "#f8fafc",
    titleEnd: "#7dd3fc",
    body: "#94a3b8",
    pillBg: "rgba(34,211,238,0.12)",
    pillBorder: "rgba(34,211,238,0.28)",
    pillText: "#67e8f9",
    tagBg: "rgba(15,23,42,0.62)",
    tagBorder: "rgba(56,189,248,0.34)",
    tagText: "#bae6fd",
  },
  {
    bgStart: "#0f0b08",
    bgMid: "#1c120a",
    bgEnd: "#140d08",
    grid: "#f59e0b",
    orbA: "rgba(245,158,11,0.18)",
    orbB: "rgba(249,115,22,0.16)",
    accentA: "#f59e0b",
    accentB: "#f97316",
    accentSoft: "#b45309",
    titleStart: "#fff7ed",
    titleEnd: "#fdba74",
    body: "#cbd5e1",
    pillBg: "rgba(245,158,11,0.14)",
    pillBorder: "rgba(245,158,11,0.28)",
    pillText: "#fdba74",
    tagBg: "rgba(28,25,23,0.66)",
    tagBorder: "rgba(251,146,60,0.34)",
    tagText: "#fed7aa",
  },
  {
    bgStart: "#07110a",
    bgMid: "#0d1a12",
    bgEnd: "#09130d",
    grid: "#10b981",
    orbA: "rgba(16,185,129,0.18)",
    orbB: "rgba(20,184,166,0.15)",
    accentA: "#10b981",
    accentB: "#2dd4bf",
    accentSoft: "#047857",
    titleStart: "#f0fdf4",
    titleEnd: "#6ee7b7",
    body: "#9ca3af",
    pillBg: "rgba(16,185,129,0.14)",
    pillBorder: "rgba(16,185,129,0.28)",
    pillText: "#6ee7b7",
    tagBg: "rgba(6,18,12,0.7)",
    tagBorder: "rgba(45,212,191,0.34)",
    tagText: "#99f6e4",
  },
  {
    bgStart: "#121017",
    bgMid: "#1a1224",
    bgEnd: "#130f1a",
    grid: "#e11d48",
    orbA: "rgba(225,29,72,0.17)",
    orbB: "rgba(251,113,133,0.14)",
    accentA: "#e11d48",
    accentB: "#fb7185",
    accentSoft: "#9f1239",
    titleStart: "#fff1f2",
    titleEnd: "#fda4af",
    body: "#c4b5fd",
    pillBg: "rgba(225,29,72,0.15)",
    pillBorder: "rgba(251,113,133,0.28)",
    pillText: "#fda4af",
    tagBg: "rgba(27,11,18,0.72)",
    tagBorder: "rgba(251,113,133,0.36)",
    tagText: "#fecdd3",
  },
  {
    bgStart: "#091019",
    bgMid: "#0d1622",
    bgEnd: "#0a1018",
    grid: "#a855f7",
    orbA: "rgba(168,85,247,0.17)",
    orbB: "rgba(59,130,246,0.14)",
    accentA: "#a855f7",
    accentB: "#6366f1",
    accentSoft: "#7c3aed",
    titleStart: "#eef2ff",
    titleEnd: "#c4b5fd",
    body: "#94a3b8",
    pillBg: "rgba(168,85,247,0.14)",
    pillBorder: "rgba(168,85,247,0.27)",
    pillText: "#d8b4fe",
    tagBg: "rgba(17,20,33,0.72)",
    tagBorder: "rgba(99,102,241,0.34)",
    tagText: "#c7d2fe",
  },
  {
    bgStart: "#120d07",
    bgMid: "#201406",
    bgEnd: "#150f08",
    grid: "#fb7185",
    orbA: "rgba(251,113,133,0.17)",
    orbB: "rgba(239,68,68,0.14)",
    accentA: "#fb7185",
    accentB: "#f87171",
    accentSoft: "#be123c",
    titleStart: "#fff7ed",
    titleEnd: "#fecaca",
    body: "#cbd5e1",
    pillBg: "rgba(251,113,133,0.14)",
    pillBorder: "rgba(251,113,133,0.28)",
    pillText: "#fecdd3",
    tagBg: "rgba(26,12,10,0.72)",
    tagBorder: "rgba(248,113,113,0.34)",
    tagText: "#fecdd3",
  },
];

function hash(input: string): number {
  let value = 0;
  for (let i = 0; i < input.length; i += 1) {
    value = (value * 31 + input.charCodeAt(i)) >>> 0;
  }
  return value;
}

function trimText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function splitTitle(title: string, maxLineLength: number): [string, string?] {
  const normalized = title.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLineLength) return [normalized];

  const words = normalized.split(" ");
  let lineOne = "";
  let pivot = 0;

  for (let i = 0; i < words.length; i += 1) {
    const candidate = lineOne ? `${lineOne} ${words[i]}` : words[i];
    if (candidate.length > maxLineLength && lineOne) {
      break;
    }
    lineOne = candidate;
    pivot = i + 1;
  }

  const remaining = words.slice(pivot).join(" ");
  if (!remaining) return [trimText(lineOne, maxLineLength)];

  return [trimText(lineOne, maxLineLength), trimText(remaining, maxLineLength + 12)];
}

function pickTheme(category: string, slug: string): Theme {
  const categoryKey = category.toLowerCase();
  if (categoryKey.includes("security")) return THEMES[3];
  if (categoryKey.includes("algorithm") || categoryKey.includes("math")) return THEMES[1];
  if (categoryKey.includes("market") || categoryKey.includes("invest")) return THEMES[2];
  if (categoryKey.includes("history")) return THEMES[5];
  if (categoryKey.includes("research")) return THEMES[4];
  return THEMES[hash(`${slug}:${category}`) % THEMES.length];
}

export function getWritingSocialData(slug: string): WritingSocialData {
  const normalizedSlug = normalizeWritingSocialSlug(slug);
  const known = WRITING_SOCIAL_DATA[normalizedSlug];
  if (!known) {
    const resolved = normalizedSlug || "(empty)";
    throw new Error(`[article-social-image] Unknown writing slug: ${resolved}`);
  }

  return {
    slug: normalizedSlug,
    ...known,
  };
}

export function hasWritingSocialData(slug: string): boolean {
  const normalizedSlug = normalizeWritingSocialSlug(slug);
  return Boolean(normalizedSlug && WRITING_SOCIAL_DATA[normalizedSlug]);
}

export function createArticleSocialImage(
  data: WritingSocialData,
  variant: SocialImageVariant
): ImageResponse {
  const isTwitter = variant === "twitter";
  const width = 1200;
  const height = isTwitter ? 600 : 630;
  const theme = pickTheme(data.category, data.slug);
  const [headlineOne, headlineTwo] = splitTitle(data.title, isTwitter ? 30 : 34);
  const description = trimText(data.excerpt, isTwitter ? 156 : 178);
  const category = trimText(data.category, 34);
  const focusTag = trimText(data.title.split(":")[0], 26);
  const tagValues = Array.from(
    new Set([focusTag, category, "jeffreyemanuel.com"].map((tag) => tag.trim()).filter(Boolean))
  );
  const gradientId = `writing-gradient-${hash(data.slug).toString(16)}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(145deg, ${theme.bgStart} 0%, ${theme.bgMid} 45%, ${theme.bgEnd} 100%)`,
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.026,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='42' height='42' viewBox='0 0 42 42' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='${encodeURIComponent(theme.grid)}' stroke-width='0.6'%3E%3Cpath d='M0 21h42M21 0v42'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div
          style={{
            display: "flex",
            position: "absolute",
            width: 620,
            height: 620,
            borderRadius: "50%",
            top: -240,
            left: -220,
            background: `radial-gradient(circle, ${theme.orbA} 0%, transparent 62%)`,
          }}
        />

        <div
          style={{
            display: "flex",
            position: "absolute",
            width: 700,
            height: 700,
            borderRadius: "50%",
            bottom: -300,
            right: -230,
            background: `radial-gradient(circle, ${theme.orbB} 0%, transparent 62%)`,
          }}
        />

        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: isTwitter ? 54 : 66,
            padding: isTwitter ? "38px 70px" : "44px 72px",
            zIndex: 5,
          }}
        >
          <div
            style={{
              display: "flex",
              width: isTwitter ? 265 : 290,
              height: isTwitter ? 265 : 290,
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                position: "absolute",
                width: isTwitter ? 224 : 240,
                height: isTwitter ? 224 : 240,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${theme.accentSoft}33 0%, transparent 70%)`,
              }}
            />

            <svg
              width={isTwitter ? "186" : "205"}
              height={isTwitter ? "186" : "205"}
              viewBox="0 0 100 100"
              fill="none"
              style={{
                display: "flex",
                filter: `drop-shadow(0 0 26px ${theme.accentA}66)`,
              }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={theme.accentA} />
                  <stop offset="100%" stopColor={theme.accentB} />
                </linearGradient>
              </defs>

              <circle cx="50" cy="50" r="44" stroke={`url(#${gradientId})`} strokeWidth="2" opacity="0.74" />
              <circle cx="50" cy="50" r="32" stroke={theme.accentA} strokeWidth="0.9" opacity="0.45" />

              <rect x="20" y="22" width="20" height="13" rx="3" fill="#020617" stroke={theme.accentA} strokeWidth="1.4" opacity="0.96" />
              <rect x="60" y="22" width="20" height="13" rx="3" fill="#020617" stroke={theme.accentA} strokeWidth="1.4" opacity="0.96" />
              <rect x="40" y="64" width="20" height="13" rx="3" fill="#020617" stroke={theme.accentB} strokeWidth="1.4" opacity="0.96" />

              <line x1="40" y1="29" x2="50" y2="64" stroke={theme.accentA} strokeWidth="1.1" opacity="0.74" />
              <line x1="60" y1="29" x2="50" y2="64" stroke={theme.accentB} strokeWidth="1.1" opacity="0.74" />
              <line x1="50" y1="35" x2="50" y2="45" stroke={theme.accentA} strokeWidth="1.1" opacity="0.55" />

              <circle cx="50" cy="50" r="6" fill={theme.accentB} opacity="0.9" />
              <circle cx="50" cy="50" r="2.4" fill="#ffffff" opacity="0.9" />
            </svg>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              maxWidth: isTwitter ? 720 : 690,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: isTwitter ? 16 : 20,
                padding: "8px 16px",
                borderRadius: 18,
                background: theme.pillBg,
                border: `1px solid ${theme.pillBorder}`,
              }}
            >
              <span
                style={{
                  display: "flex",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: theme.pillText,
                }}
              >
                {category}
              </span>
            </div>

            <h1
              style={{
                display: "flex",
                margin: 0,
                fontSize: isTwitter ? 56 : 61,
                lineHeight: 1.14,
                letterSpacing: "-0.03em",
                fontWeight: 850,
                color: "#ffffff",
              }}
            >
              {headlineOne}
            </h1>

            {headlineTwo ? (
              <h1
                style={{
                  display: "flex",
                  margin: 0,
                  fontSize: isTwitter ? 56 : 61,
                  lineHeight: 1.14,
                  letterSpacing: "-0.03em",
                  fontWeight: 850,
                  marginTop: 2,
                  background: `linear-gradient(90deg, ${theme.titleStart} 0%, ${theme.titleEnd} 100%)`,
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {headlineTwo}
              </h1>
            ) : null}

            <p
              style={{
                display: "flex",
                margin: 0,
                marginTop: isTwitter ? 18 : 20,
                marginBottom: isTwitter ? 24 : 30,
                fontSize: isTwitter ? 20 : 22,
                lineHeight: 1.45,
                color: theme.body,
              }}
            >
              {description}
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 11,
              }}
            >
              {tagValues.map((tag, index) => (
                <div
                  key={`${tag}-${index}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "6px 12px",
                    borderRadius: 7,
                    background: theme.tagBg,
                    border: `1px solid ${theme.tagBorder}`,
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      color: theme.tagText,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {trimText(tag, 28)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 4,
            background: `linear-gradient(90deg, transparent 0%, ${theme.accentA} 35%, ${theme.accentB} 65%, transparent 100%)`,
          }}
        />
      </div>
    ),
    {
      width,
      height,
    }
  );
}
