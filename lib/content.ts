export const siteConfig = {
  name: "Jeffrey Emanuel",
  title: "Jeffrey Emanuel – Lumera, SmartEdgar, Agents & Markets",
  description:
    "Founder & CEO of Lumera Network. Building agent-first infrastructure and research tools: SmartEdgar, MCP Agent Mail, Ultimate Bug Scanner, and more.",
  email: "jeffreyemanuel@gmail.com",
  location: "Brooklyn, New York",
  social: {
    x: "https://x.com/doodlestein",
    github: "https://github.com/Dicklesworthstone",
    linkedin: "https://www.linkedin.com/in/jeffreyemanuel",
  },
} as const;

export type NavItem = { href: string; label: string };

export const navItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/consulting", label: "Consulting" },
  { href: "/projects", label: "Projects" },
  { href: "/writing", label: "Writing" },
  { href: "/media", label: "Media" },
  { href: "/contact", label: "Contact" },
];

export type Stat = { label: string; value: string; helper?: string };

export const heroStats: Stat[] = [
  {
    label: "Years as a hedge-fund analyst",
    value: "~10",
    helper: "Generalist long/short across platforms and partnerships.",
  },
  {
    label: "Time in deep learning",
    value: "2010+",
    helper: "Studying neural nets since pre-Transformer days.",
  },
  {
    label: "Open-source projects",
    value: "30+",
    helper: "Agent tooling, infra, research notes, and experiments.",
  },
  {
    label: "Audience on X",
    value: "20K+",
    helper: "Analysts, founders, researchers, and engineers.",
  },
];

export const heroContent = {
  eyebrow: "Founder • Engineer • Former Hedge Fund Analyst",
  title: "Building the tools that sit between markets and frontier AI.",
  body: [
    "I run Lumera Network (formerly Pastel Network), a Cosmos-based L1 for storage, AI, and interoperability.",
    "I also build tools like SmartEdgar, MCP Agent Mail, and Ultimate Bug Scanner—plus an ecosystem of open-source infrastructure for AI agents and serious research workflows.",
  ],
  primaryCta: {
    label: "Work with me",
    href: "/consulting",
  },
  secondaryCta: {
    label: "Read the Nvidia essay",
    href: "https://youtubetranscriptoptimizer.com/blog/05_the_short_case_for_nvda",
  },
} as const;

export type Project = {
  name: string;
  kind: "product" | "oss";
  badge?: string;
  href: string;
  short: string;
  description: string;
  tags: string[];
};

export const projects: Project[] = [
  {
    name: "Lumera Network",
    kind: "product",
    badge: "Layer‑1 protocol",
    href: "https://pastel.network",
    short: "Cosmos-based L1 for decentralized storage, AI inference, and cross‑chain interoperability.",
    description:
      "Originally launched as Pastel Network, Lumera is a sovereign Cosmos chain designed for long-lived storage of digital assets, on-chain AI authenticity, and agentic access to data and compute across ecosystems.",
    tags: ["L1", "Cosmos", "Storage", "AI", "Interoperability"],
  },
  {
    name: "SmartEdgar",
    kind: "product",
    badge: "In development",
    href: "https://github.com/Dicklesworthstone/smartedgar",
    short: "Modern SEC ingestion and research stack with an MCP server at its core.",
    description:
      "SmartEdgar pulls, normalizes, and slices SEC filings into agent‑ready formats. It exposes a clean MCP API so analysts and AI tools can ask structured questions about filings instead of fighting PDFs.",
    tags: ["EDGAR", "MCP", "Agents", "Finance"],
  },
  {
    name: "MCP Agent Mail",
    kind: "oss",
    badge: "HTTP‑only MCP server",
    href: "https://github.com/Dicklesworthstone/mcp_agent_mail",
    short: "Mail‑like coordination layer for coding agents.",
    description:
      "Provides inboxes, search, threads, and advisory file leases so coding agents and humans can coordinate without trampling edits. Git‑backed so everything is auditable.",
    tags: ["MCP", "Agents", "Developer Tools"],
  },
  {
    name: "Ultimate Bug Scanner",
    kind: "oss",
    badge: "Static analysis orchestrator",
    href: "https://github.com/Dicklesworthstone/ultimate_bug_scanner",
    short: "Meta-runner for language-specific bug scanners, tuned for AI coding agents.",
    description:
      "Wraps best‑in‑class static analyzers and exposes a consistent JSON interface. Ideal as a pre‑commit or as a post‑processing step for autonomous coding agents.",
    tags: ["Static analysis", "Agents", "Code Quality"],
  },
  {
    name: "LLM Docs",
    kind: "oss",
    badge: "Docs pipeline",
    href: "https://github.com/Dicklesworthstone/llm_docs",
    short: "Pipeline that ingests and distills Python library docs into LLM‑friendly bundles.",
    description:
      "Automatically discovers, scrapes, and compresses Python docs into high‑signal corpora that can be plugged into toolchains, retrieval systems, or vendor‑specific knowledge formats.",
    tags: ["Documentation", "Infra", "LLMs"],
  },
  {
    name: "Kissinger Thesis Reader",
    kind: "oss",
    badge: "Historical tooling",
    href: "https://github.com/Dicklesworthstone/kissinger_undergraduate_thesis",
    short: "A vibe‑coded reader for Henry Kissinger’s 400‑page undergraduate thesis.",
    description:
      "Takes a painful scanned PDF and turns it into a clean, phone‑friendly reading experience, with structure that plays nicely with modern models and human readers.",
    tags: ["History", "Tooling"],
  },
];

export type TimelineItem = {
  title: string;
  org: string;
  period: string;
  location: string;
  body: string;
};

export const careerTimeline: TimelineItem[] = [
  {
    title: "Founder & CEO",
    org: "Lumera Network (formerly Pastel Network)",
    period: "Dec 2021 – Present",
    location: "New York / Remote",
    body: "Building a Cosmos-based L1 focused on long-term storage, AI verification, and cross-chain interoperability.",
  },
  {
    title: "Senior Analyst",
    org: "Balyasny Asset Management L.P.",
    period: "Aug 2020 – Dec 2021",
    location: "New York",
    body: "Generalist long/short equity role at a multi-manager platform, covering both longs and shorts across sectors.",
  },
  {
    title: "Analyst",
    org: "Millennium Management",
    period: "Jun 2019 – Jul 2020",
    location: "New York",
    body: "Long/short equity analyst focused on catalyst-driven situations and idiosyncratic risk.",
  },
  {
    title: "Generalist Investor",
    org: "Dayah Capital",
    period: "Jun 2016 – Mar 2018",
    location: "Greater New York City Area",
    body: "Fundamental research across multiple sectors, with a heavy focus on complex special situations.",
  },
  {
    title: "Generalist Investor",
    org: "Dasoma Capital",
    period: "Jul 2015 – May 2016",
    location: "Greater New York City Area",
    body: "Long/short generalist investing in structurally mispriced businesses.",
  },
  {
    title: "Principal",
    org: "EigenValue Partners",
    period: "Dec 2012 – Aug 2015",
    location: "Greater New York City Area",
    body: "Partner-level role at a long/short fund, leading research and portfolio construction.",
  },
  {
    title: "Generalist",
    org: "Scoggin Capital Management, LP II",
    period: "Jan 2011 – Aug 2012",
    location: "New York",
    body: "Researching long and short ideas across sectors and capital structures.",
  },
  {
    title: "Generalist",
    org: "Tyndall Management",
    period: "Oct 2008 – Jan 2011",
    location: "New York",
    body: "First buyside role, covering a wide array of industries as a generalist analyst.",
  },
  {
    title: "BA, Mathematics",
    org: "Reed College",
    period: "2001 – 2005",
    location: "Portland, Oregon",
    body: "Formal math training plus a lot of time thinking about how abstractions map back to reality.",
  },
];

export type WritingItem = {
  title: string;
  href: string;
  source: "YTO" | "FMD" | "GitHub";
  category: string;
  blurb: string;
};

export const writingHighlights: WritingItem[] = [
  {
    title: "The Short Case for Nvidia Stock",
    href: "https://youtubetranscriptoptimizer.com/blog/05_the_short_case_for_nvda",
    source: "YTO",
    category: "Markets & AI",
    blurb:
      "A 12,000-word deep dive into how AI economics, models like DeepSeek, and GPU supply can collide with valuation narratives.",
  },
  {
    title: "Factor Risk Models and the Hedge Fund Business",
    href: "https://fixmydocuments.com/blog/01_factor_risk_models_and_the_hedge_fund_business",
    source: "FMD",
    category: "Investing",
    blurb:
      "Explains how factor models really get used inside funds, and where they quietly distort incentives and risk taking.",
  },
  {
    title: "Acting as Claude’s Research Helper in AI",
    href: "https://fixmydocuments.com/blog/07_acting_as_claudes_research_helper_in_ai",
    source: "FMD",
    category: "AI Research",
    blurb:
      "Very-long-form exploration of using LLMs to probe mathematical structures that might inspire new model architectures.",
  },
  {
    title: "PPP Loan Fraud: A Data Science Detective Story",
    href: "https://fixmydocuments.com/blog/06_ppp_loan_fraud_a_data_science_detective_story",
    source: "FMD",
    category: "Data Science",
    blurb:
      "Reconstructs fraud patterns in the PPP loan program and shows how simple tools could have caught much of it.",
  },
  {
    title: "The Most Impressive Prediction of All Time",
    href: "https://youtubetranscriptoptimizer.com/blog/04_the_most_impressive_prediction_of_all_time",
    source: "YTO",
    category: "History",
    blurb:
      "Uses a forgotten historical prediction as a lens on evidence, updating, and how we reason under massive uncertainty.",
  },
];

export type MediaItem = {
  title: string;
  outlet: string;
  kind: "Article" | "Podcast" | "Video";
  href: string;
  blurb: string;
};

export const mediaItems: MediaItem[] = [
  {
    title: "The blogger who helped spark Nvidia’s $600 billion stock collapse",
    outlet: "MarketWatch",
    kind: "Article",
    href: "https://www.marketwatch.com/story/the-blogger-who-helped-spark-nvidias-600-billion-stock-collapse-and-a-panic-in-silicon-valley-52aba340",
    blurb:
      "Profile on how the Nvidia essay moved from an obscure blog post into trading desks and boardrooms.",
  },
  {
    title: "Nvidia stock crash: how a Brooklyn-based blogger fueled the AI giant’s selloff",
    outlet: "Mint",
    kind: "Article",
    href: "https://www.livemint.com/market/stock-market-news/nvidia-stock-crash-how-a-brooklyn-based-blogger-fueled-the-ai-giants-600-bn-market-collapse-heres-what-report-says-11738580355807.html",
    blurb:
      "Covers the Nvidia drawdown and the role of the essay in reframing risk for global investors.",
  },
  {
    title: "Jeffrey Emanuel and the lessons we should all learn from the $2 trillion DeepSeek AI market correction",
    outlet: "Diginomica",
    kind: "Article",
    href: "https://diginomica.com/jeffrey-emanuel-and-lessons-we-should-all-learn-2-trillion-deepseek-ai-market-correction",
    blurb:
      "Places the post inside the broader DeepSeek-driven repricing of AI and compute-heavy names.",
  },
  {
    title: "DeepSeek R1 & The Short Case For Nvidia Stock",
    outlet: "Bankless",
    kind: "Podcast",
    href: "https://www.bankless.com/podcast/deepseek-r1-the-short-case-for-nvidia-stock-jeffrey-emanuel",
    blurb:
      "Long-form conversation on DeepSeek, Nvidia, market reflexivity, and what the next decade of AI might look like.",
  },
  {
    title: "Jeffrey Emanuel: Viral Author of The Short Case for Nvidia Stock",
    outlet: "Delphi / YouTube",
    kind: "Video",
    href: "https://www.youtube.com/watch?v=3x-KxQ4p8J0",
    blurb:
      "Covers background, Lumera, and how a long blog post ended up moving billions in market cap.",
  },
];

export type Thread = { title: string; href: string; blurb: string };

export const threads: Thread[] = [
  {
    title: "A vibe-coded reader for Kissinger’s thesis",
    href: "https://x.com/doodlestein/status/1961817172516168098",
    blurb:
      "Turning a 400-page scanned thesis into something that feels native on a modern phone and for LLMs.",
  },
  {
    title: "Python 3.14, the GIL, and AI-powered refactors",
    href: "https://x.com/doodlestein/status/1976478297744699771",
    blurb:
      "Story of upgrading a complex codebase to GIL‑less Python using AI coding tools, plus real benchmarks.",
  },
  {
    title: "DeepSeek, OCR tokens, and a new scaling law",
    href: "https://x.com/doodlestein/status/1980282222893535376",
    blurb:
      "Argues that vision tokens as compressed text tokens change how we think about long context and memory.",
  },
  {
    title: "Project organization for SmartEdgar and agent tooling",
    href: "https://x.com/doodlestein/status/1985405083488755740",
    blurb:
      "Notes on keeping a large constellation of agent‑focused projects coherent with a simple filesystem discipline.",
  },
];
