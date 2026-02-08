import tldrToolStarsData from "./data/tldr-tool-stars.json";

export const siteConfig = {
  name: "Jeffrey Emanuel",
  title: "Jeffrey Emanuel: Agentic Coding Tooling, AI Infrastructure & Markets",
  description:
    "Founder & CEO of Lumera Network. Creator of the Agentic Coding Tooling Flywheel, a self-reinforcing ecosystem of 14 core tools (MCP Agent Mail, Beads Viewer, CASS, and more) that transform how AI coding agents collaborate. 90+ open-source projects with 16K+ GitHub stars.",
  email: "jeffreyemanuel@gmail.com",
  location: "",
  social: {
    x: "https://x.com/doodlestein",
    github: "https://github.com/Dicklesworthstone",
    linkedin: "https://www.linkedin.com/in/jeffreyemanuel",
  },
  features: {
    /** Enable newsletter signup section on homepage. Set to true once Buttondown is configured. */
    newsletter: true,
  },
} satisfies {
  name: string;
  title: string;
  description: string;
  email: string;
  location: string;
  social: { x: string; github: string; linkedin: string };
  features: { newsletter: boolean };
};

export type NavItem = { href: string; label: string };

export const navItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/consulting", label: "Consulting" },
  { href: "/projects", label: "Projects" },
  { href: "/tldr", label: "Flywheel" },
  { href: "/writing", label: "Writing" },
  { href: "/media", label: "Media" },
  { href: "/contact", label: "Contact" },
];

export type Stat = { label: string; value: string; helper?: string };

export const heroStats: Stat[] = [
  {
    label: "GitHub Stars",
    value: "16K+",
    helper: "Across 90+ open-source agent tools and infrastructure.",
  },
  {
    label: "Flywheel Tools",
    value: "14",
    helper: "Core tools that amplify multi-agent workflows.",
  },
  {
    label: "Years Building AI",
    value: "15+",
    helper: "Deep learning since 2010, agents since 2023.",
  },
  {
    label: "Audience on X",
    value: "29K+",
    helper: "Analysts, founders, researchers, and engineers.",
  },
];

export const heroContent = {
  eyebrow: "Founder • Engineer • Former Hedge Fund Analyst",
  title: "Building the tools that sit between markets and frontier AI.",
  intro:
    "Beginning in October of 2025, I began developing what I call my \"Agentic Coding Flywheel\": a collection of 14 core tools.",
  tools: [
    {
      name: "MCP Agent Mail",
      tagline: '"Gmail for Agents"',
      highlight: "1K+ stars",
    },
    {
      name: "BV",
      tagline: "Beads Viewer",
      description:
        "Apply PageRank and graph theory to prioritize which tasks unblock the most work",
    },
    {
      name: "Cass",
      tagline: "Coding Agent Session Search",
      description: "Sub-millisecond search across all your past agent sessions",
    },
    {
      name: "CM",
      tagline: "CASS Memory System",
      description:
        "Persistent memory built on CASS - agents learn and remember across sessions",
    },
    {
      name: "UBS",
      tagline: "Ultimate Bug Scanner",
      description:
        "1,000+ pattern-based detection rules for catching bugs before they ship",
    },
  ],
  highlight: {
    metric: "20,000+",
    label: "lines of sophisticated Go code",
    context: "BV was conceived, designed, and shipped in a single day",
    subtext: "Loved by thousands of users with 500+ GitHub stars in under a month",
  },
  body: [
    "Using these tools, I've been able to conceive, design, architect, and implement completely some extraordinarily powerful and complex software systems in extremely accelerated timelines.",
    "My 90+ open-source projects span agent infrastructure, static analysis, memory systems, and research tools. The flywheel keeps spinning faster; the cadence of my GitHub commits increases more and more each passing week because each tool amplifies the others.",
    "I also founded Lumera Network (formerly Pastel), a Cosmos L1 for storage and AI verification. I consult to PE and hedge funds on AI automation after a decade as a long/short equity analyst.",
  ],
  primaryCta: {
    label: "Explore the Flywheel",
    href: "/projects",
  },
  secondaryCta: {
    label: "Work with me",
    href: "/consulting",
  },
} as const;

// ============================================================================
// ENDORSEMENTS
// ============================================================================

export type EndorsementSource = "linkedin" | "twitter" | "podcast" | "email" | "other";

export interface Endorsement {
  id: string;
  quote: string;
  author: {
    name: string;
    title?: string;
    company?: string;
    avatar?: string;
  };
  source: {
    type: EndorsementSource;
    url?: string;
    platform?: string;
  };
  date?: string;
  tags: string[];
  featured: boolean;
  context?: string;
}

export const endorsements: Endorsement[] = [
  {
    id: "naval-ravikant",
    quote: "Come for the trade, stay for the dazzling 60-minute education on the state of AI.",
    author: {
      name: "Naval Ravikant",
      title: "Founder",
      company: "AngelList",
    },
    source: {
      type: "twitter",
      url: "https://x.com/naval/status/1883751264082969057",
      platform: "X/Twitter",
    },
    date: "2025",
    tags: ["nvidia", "ai", "finance"],
    featured: true,
    context: "Sharing Jeffrey's Nvidia short thesis",
  },
  {
    id: "levine-nvidia",
    quote: "A candidate for the most impactful short research report ever written.",
    author: {
      name: "Matt Levine",
      title: "Columnist",
      company: "Bloomberg",
    },
    source: {
      type: "other",
      url: "https://www.bloomberg.com/opinion/authors/ARbTQlRLRjE/matthew-s-levine",
      platform: "Bloomberg Opinion",
    },
    date: "2024",
    tags: ["nvidia", "finance", "research"],
    featured: true,
    context: "On Jeffrey's Nvidia short thesis essay",
  },
  {
    id: "bankless-interview",
    quote: "This is one of the most thorough analyses of a company I've ever seen. The level of detail is extraordinary.",
    author: {
      name: "Ryan Sean Adams",
      title: "Host",
      company: "Bankless",
    },
    source: {
      type: "podcast",
      url: "https://www.bankless.com/",
      platform: "Bankless Podcast",
    },
    date: "2024",
    tags: ["nvidia", "podcast", "research"],
    featured: true,
    context: "During Bankless podcast interview",
  },
  {
    id: "slashdot-feature",
    quote: "Emanuel's essay went viral across finance Twitter and tech circles, drawing attention from analysts and investors worldwide.",
    author: {
      name: "Slashdot Editors",
      company: "Slashdot",
    },
    source: {
      type: "other",
      url: "https://slashdot.org/",
      platform: "Slashdot",
    },
    date: "2024",
    tags: ["nvidia", "media", "tech"],
    featured: false,
    context: "Slashdot feature coverage",
  },
  {
    id: "willison-nvidia",
    quote:
      "Long, excellent...capturing the current state of the AI/LLM industry. Jeffrey has a rare combination of experience in both computer science and investment analysis.",
    author: {
      name: "Simon Willison",
      title: "Creator",
      company: "Datasette",
    },
    source: {
      type: "other",
      url: "https://simonwillison.net/2025/Jan/27/deepseek-nvidia/",
      platform: "Personal Blog",
    },
    date: "2025",
    tags: ["nvidia", "tech", "ai"],
    featured: false,
    context: "Analysis of the Nvidia short thesis",
  },
];

// Helper to get featured endorsements
export function getFeaturedEndorsements(): Endorsement[] {
  return endorsements.filter((e) => e.featured);
}

// Helper to filter endorsements by tag
export function getEndorsementsByTag(tag: string): Endorsement[] {
  return endorsements.filter((e) => e.tags.includes(tag));
}

// ============================================================================
// FEATURED SITES
// ============================================================================

export interface FeaturedSite {
  id: string;
  title: string;
  tagline: string;
  url: string;
  ogImage: string;
  gradient: string;
  icon: string;
}

export const featuredSites: FeaturedSite[] = [
  {
    id: "jeffreysprompts",
    title: "JeffreysPrompts.com",
    tagline: "Battle-tested prompts for AI coding agents. Browse, copy, or install directly as Claude Code skills.",
    url: "https://jeffreysprompts.com",
    ogImage: "https://jeffreysprompts.com/og-image.png",
    gradient: "from-amber-500 via-orange-500 to-red-500",
    icon: "Sparkles",
  },
  {
    id: "agent-flywheel",
    title: "Agent-Flywheel.com",
    tagline: "Interactive setup wizard for the complete flywheel ecosystem. One command, 30 minutes, fully configured.",
    url: "https://agent-flywheel.com",
    ogImage: "https://agent-flywheel.com/og-image.png",
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    icon: "Workflow",
  },
  {
    id: "brennerbot",
    title: "BrennerBot.org",
    tagline: "Multi-agent research orchestration using Sydney Brenner's scientific methods. Harness Opus, GPT-5.2, and Gemini 3 as a collaborative research group.",
    url: "https://brennerbot.org",
    ogImage: "https://brennerbot.org/og-image.png",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    icon: "Microscope",
  },
];

// ============================================================================
// LIVE DEMOS
// ============================================================================

export type DemoCategory = "ai-tools" | "education" | "developer-tools";

export interface LiveDemo {
  id: string;
  title: string;
  url: string;
  description: string;
  longDescription?: string;
  previewImage?: string;
  technologies: string[];
  category: DemoCategory;
  featured: boolean;
  githubUrl?: string;
}

export const liveDemos: LiveDemo[] = [
  {
    id: "agent-mail-viewer",
    title: "Agent Mail Viewer",
    url: "https://dicklesworthstone.github.io/cass-memory-system-agent-mailbox-viewer/viewer/",
    description: "Real-time viewer for multi-agent coordination and messaging",
    longDescription:
      "An interactive web interface for monitoring MCP Agent Mail communications. Watch agents coordinate in real-time, browse message threads, and understand how multiple AI coding agents collaborate on complex tasks.",
    technologies: ["React", "TypeScript", "MCP Protocol", "WebSocket"],
    category: "ai-tools",
    featured: true,
    githubUrl: "https://github.com/Dicklesworthstone/cass-memory-system-agent-mailbox-viewer",
  },
  {
    id: "beads-viewer-demo",
    title: "Beads Viewer",
    url: "https://dicklesworthstone.github.io/beads_viewer-pages/",
    description: "Visual explorer for the beads distributed issue tracking system",
    longDescription:
      "A web-based interface for exploring Beads issue tracking data. Visualize task dependencies as directed graphs, analyze project health metrics, and understand complex multi-agent workflows. Features real-time graph rendering and filtering.",
    technologies: ["React", "D3.js", "Git Integration", "Graph Visualization"],
    category: "developer-tools",
    featured: true,
    githubUrl: "https://github.com/Dicklesworthstone/beads_viewer",
  },
  {
    id: "phage-explorer",
    title: "Phage Explorer",
    url: "https://phage-explorer.org/",
    description: "Interactive educational site exploring bacteriophages and their potential",
    longDescription:
      "An immersive educational experience about bacteriophages - viruses that infect bacteria. Features 3D visualizations, genome browsers, and interactive lessons about phage therapy's potential to combat antibiotic-resistant infections.",
    technologies: ["Next.js", "Three.js", "Scientific Visualization", "WebGL"],
    category: "education",
    featured: true,
    githubUrl: "https://github.com/Dicklesworthstone/phage_explorer",
  },
];

// Helper to get featured demos
export function getFeaturedDemos(): LiveDemo[] {
  return liveDemos.filter((d) => d.featured);
}

// Helper to filter demos by category
export function getDemosByCategory(category: DemoCategory): LiveDemo[] {
  return liveDemos.filter((d) => d.category === category);
}

// ============================================================================
// PROJECTS
// ============================================================================

export type ProjectDetails = {
  features?: string[];
  installation?: string;
  usage?: string;
  relatedProjects?: string[]; // slugs of related projects
};

export type Project = {
  name: string;
  kind: "product" | "oss" | "research" | "rust-port";
  badge?: string;
  href: string;
  short: string;
  description: string;
  tags: string[];
  size?: "wide" | "tall" | "large" | "normal";
  gradient?: string;
  slug?: string; // If provided, project has a detail page at /projects/[slug]
  details?: ProjectDetails;
};

// Helper to get project by slug
export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

// Get all projects with slugs (for generateStaticParams)
export function getProjectSlugs(): string[] {
  return projects.filter((p) => p.slug).map((p) => p.slug!);
}

export const projects: Project[] = [
  {
    name: "Bio-Inspired Nanochat",
    kind: "research",
    badge: "Active Research",
    href: "https://github.com/Dicklesworthstone/bio_inspired_nanochat",
    short: "Replacing static transformer weights with fluid, metabolic biological analogs.",
    description:
      "A research fork of GPT that implements 'living' weights. It introduces presynaptic fatigue (to prevent repetition), postsynaptic fast-weights (for infinite local context), and structural plasticity (experts that are born and die based on energy usage). Optimized via CMA-ES on a 48-parameter biological search space.",
    tags: ["Neuroscience", "Triton", "Rust", "ALife", "Transformer"],
    size: "large",
    gradient: "from-rose-500/20 via-purple-500/20 to-indigo-500/20",
  },
  {
    name: "Model-Guided Research",
    kind: "research",
    badge: "Math + AI",
    href: "https://github.com/Dicklesworthstone/model_guided_research",
    short: "11 exotic mathematical frameworks for AI, proposed and designed by GPT-5.",
    description:
      "An experimental collaboration where the AI model itself proposed, scored, and helped implement new research directions. Includes JAX demos and PyTorch implementations of Lie group attention, p-adic ultrametric spaces, tropical geometry (max-plus), knot-theoretic braiding, and nonstandard analysis optimizers.",
    tags: ["JAX", "PyTorch", "Math", "Geometry", "Automated Research"],
    size: "wide",
    gradient: "from-blue-500/20 via-cyan-500/20 to-teal-500/20",
  },
  {
    name: "SmartEdgar",
    kind: "product",
    badge: "In development",
    href: "https://github.com/Dicklesworthstone/smartedgar",
    short: "Modern SEC ingestion and research stack with an MCP server at its core.",
    description:
      "SmartEdgar pulls, normalizes, and slices SEC filings into agent-ready formats. It exposes a clean MCP API so analysts and AI tools can ask structured questions about filings instead of fighting PDFs.",
    tags: ["EDGAR", "MCP", "Agents", "Finance"],
    size: "large",
    gradient: "from-emerald-500/20 via-teal-500/20 to-cyan-500/20",
  },
  {
    name: "Lumera Network",
    kind: "product",
    badge: "Layer-1 protocol",
    href: "https://pastel.network",
    short: "Cosmos-based L1 for decentralized storage, AI inference, and cross-chain interoperability.",
    description:
      "Originally launched as Pastel Network, Lumera is a sovereign Cosmos chain designed for long-lived storage of digital assets, on-chain AI authenticity, and agentic access to data and compute across ecosystems.",
    tags: ["L1", "Cosmos", "Storage", "AI", "Interoperability"],
    size: "wide",
    gradient: "from-indigo-500/20 via-purple-500/20 to-pink-500/20",
  },
  {
    name: "Rust ScriptBots",
    kind: "oss",
    badge: "Simulation",
    href: "https://github.com/Dicklesworthstone/rust_scriptbots",
    short: "Deterministic, GPU-accelerated artificial life simulator written in idiomatic Rust.",
    description:
      "A modern reimplementation of Andrej Karpathy's ScriptBots. Features a deterministic tick pipeline, GPUI rendering, massive parallelism, and pluggable 'brains' to study emergent behavior in evolving agent populations.",
    tags: ["Rust", "Simulation", "ALife", "GPUI", "GPU"],
    size: "tall",
  },
  {
    name: "Fast CMA-ES",
    kind: "oss",
    badge: "Rust",
    href: "https://github.com/Dicklesworthstone/fast_cmaes",
    short: "Hyper-optimized, SIMD-accelerated CMA-ES implementation in Rust with Python bindings.",
    description:
      "A high-performance evolution strategy optimizer. Features SIMD acceleration, Rayon parallelism, deterministic seeding, and a rich TUI. Designed for heavy optimization tasks where Python's GIL is a bottleneck.",
    tags: ["Rust", "Python", "Optimization", "SIMD", "CMA-ES"],
  },
  {
    name: "WASM CMA-ES",
    kind: "oss",
    badge: "WebAssembly",
    href: "https://github.com/Dicklesworthstone/wasm_cmaes",
    short: "Run high-performance optimization algorithms directly in the browser via WebAssembly.",
    description:
      "Brings the power of the Rust CMA-ES engine to the web. Includes a visual interactive playground using Three.js and D3 to visualize convergence in real-time without server-side processing.",
    tags: ["WASM", "Rust", "Visualization", "Three.js", "Optimization"],
  },
  {
    name: "CMA-ES Explainer",
    kind: "oss",
    badge: "Education",
    href: "https://github.com/Dicklesworthstone/cmaes_explainer",
    short: "Interactive deep dive into the Covariance Matrix Adaptation Evolution Strategy.",
    description:
      "A comprehensive educational resource demystifying evolutionary algorithms. Features interactive visualizations to demonstrate how CMA-ES adapts to high-dimensional, non-convex landscapes where gradient descent fails.",
    tags: ["Algorithms", "Education", "Visualization", "Math"],
    size: "wide",
    gradient: "from-orange-500/20 via-amber-500/20 to-yellow-500/20",
  },
  {
    name: "Markdown Web Browser",
    kind: "oss",
    badge: "Agent Tool",
    href: "https://github.com/Dicklesworthstone/markdown_web_browser",
    short: "Headless browser that renders modern websites into clean, proven Markdown for agents.",
    description:
      "Transforms complex, JavaScript-heavy web pages into structured Markdown. Uses deterministic Chrome for Testing to capture screenshots, perform OCR, and stitch everything into a format LLMs can actually read and cite.",
    tags: ["Python", "Agents", "Scraping", "OCR", "LLM"],
  },
  {
    name: "UltraSearch",
    kind: "oss",
    badge: "Rust",
    href: "https://github.com/Dicklesworthstone/ultrasearch",
    short: "Instant file search engine for Windows using NTFS USN journals and Tantivy.",
    description:
      "A modern 'Everything' alternative written in Rust. Indexes metadata and content in real-time using low-level NTFS hooks. Features a memory-efficient background service and a GPUI-based frontend for instant results.",
    tags: ["Rust", "Search", "Windows", "NTFS", "Systems"],
  },
  {
    name: "System Resource Protection",
    kind: "oss",
    badge: "Linux/WSL",
    href: "https://github.com/Dicklesworthstone/system_resource_protection_script",
    short: "Intelligent resource guardrails to prevent dev tools from freezing your Linux desktop.",
    description:
      "A comprehensive tuning script that wires together `ananicy-cpp`, `earlyoom`, and kernel tweaks. Prevents runaway builds or IDEs from locking up your UI by intelligently prioritizing interactive processes.",
    tags: ["Linux", "WSL", "Performance", "DevOps", "Bash"],
  },
  {
    name: "Coding Agent Session Search",
    kind: "oss",
    badge: "446 stars",
    href: "https://github.com/Dicklesworthstone/coding_agent_session_search",
    short: "Unified TUI for searching local history across Claude Code, Codex, Cursor, Gemini, and more.",
    description:
      "A centralized search interface for all your AI coding sessions. Indexes conversation history from Claude Code, Codex, Cursor, Gemini, ChatGPT, and Cline using Tantivy full-text search. Find that solution you generated weeks ago and prevent re-solving problems.",
    tags: ["Rust", "TUI", "Search", "DevTools", "Agents", "Flywheel"],
    size: "wide",
    slug: "cass",
    details: {
      features: [
        "Unified search across Claude Code, Codex, Cursor, Gemini, ChatGPT, Cline",
        "Tantivy full-text search engine for instant results",
        "TUI with Vim-style navigation",
        "Robot mode for AI agent integration",
        "Auto-discovery of session files",
        "Result highlighting and context preview",
        "Export sessions to Markdown",
        "Health check and index management",
      ],
      installation: "```bash\n# Install via Cargo\ncargo install coding_agent_session_search\n\n# Or download pre-built binary from releases\n# https://github.com/Dicklesworthstone/coding_agent_session_search/releases\n```",
      usage: "```bash\n# Interactive TUI mode\ncass\n\n# Search with query\ncass search \"Three.js performance\"\n\n# Robot mode for agents (NEVER use bare cass in agents!)\ncass search \"error handling\" --robot --limit 5\ncass health  # Check index status\n```",
      relatedProjects: ["cass-memory-system", "beads-viewer", "mcp-agent-mail"],
    },
  },
  {
    name: "Claude Code Agent Farm",
    kind: "oss",
    badge: "640 stars",
    href: "https://github.com/Dicklesworthstone/claude_code_agent_farm",
    short: "Orchestrate an army of Claude Code agents to autonomously improve codebases.",
    description:
      "Transforms code improvement into a scalable, parallel process by deploying a coordinated team of AI developers. This framework orchestrates multiple Claude Code sessions simultaneously to fix bugs, refactor legacy code, and implement best practices across 34 different tech stacks without conflict.",
    tags: ["Agents", "Automation", "Claude", "DevOps"],
    size: "large",
    gradient: "from-purple-600/20 via-fuchsia-500/20 to-pink-500/20",
  },
  {
    name: "Agentic Flywheel Setup",
    kind: "oss",
    badge: "1,006 stars",
    href: "https://github.com/Dicklesworthstone/agentic_coding_flywheel_setup",
    short: "One-command setup for a fully-armed agentic coding environment.",
    description:
      "From zero to fully-configured agentic coding VPS in 30 minutes. A single curl command installs 30+ tools, configures zsh with powerlevel10k, sets up language runtimes (bun, Python, Rust, Go), and deploys three AI coding agents (Claude Code, Codex CLI, Gemini CLI) with the complete Dicklesworthstone coordination stack.",
    tags: ["DevOps", "Setup", "Agents", "Automation", "Bash", "Flywheel"],
    size: "wide",
    gradient: "from-lime-500/20 via-emerald-500/20 to-teal-500/20",
  },
  {
    name: "Ultimate MCP Client",
    kind: "oss",
    badge: "145 stars",
    href: "https://github.com/Dicklesworthstone/ultimate_mcp_client",
    short: "Universal bridge for AI models to interact with the real world via MCP.",
    description:
      "A comprehensive, feature-rich client for the Model Context Protocol that unlocks complex, stateful AI capabilities. It includes both CLI and Web UIs, advanced conversation state management, and deep observability, serving as the robust connective tissue between LLMs and external tools, servers, and data.",
    tags: ["MCP", "AI Tools", "Interoperability", "Python"],
    size: "wide",
  },
  {
    name: "Ultimate MCP Server",
    kind: "oss",
    badge: "136 stars",
    href: "https://github.com/Dicklesworthstone/ultimate_mcp_server",
    short: "Unified MCP server exposing dozens of powerful tools to AI models.",
    description:
      "The server counterpart to Ultimate MCP Client. Provides a comprehensive Model Context Protocol implementation that exposes a wide variety of tools (file operations, web scraping, database access, and more) through a unified interface. Designed for extensibility and seamless integration with Claude, GPT, and other frontier models.",
    tags: ["MCP", "AI Tools", "Server", "Python", "Interoperability"],
  },
  {
    name: "MCP Agent Mail",
    kind: "oss",
    badge: "1,654 stars",
    href: "https://github.com/Dicklesworthstone/mcp_agent_mail",
    short: "Gmail for your coding agents. A coordination layer with messaging, file leases, and audit trails.",
    description:
      "A complete coordination system for multi-agent workflows. Agents register identities, send/receive GitHub-flavored Markdown messages, search conversation history, and declare advisory file reservations to prevent edit conflicts. SQLite-backed for full auditability with optional web UI for human oversight.",
    tags: ["MCP", "Agents", "Developer Tools", "Python", "Collaboration", "Flywheel"],
    size: "wide",
    gradient: "from-violet-500/20 via-purple-500/20 to-fuchsia-500/20",
    slug: "mcp-agent-mail",
    details: {
      features: [
        "Agent identity registration with persistent profiles",
        "GitHub-flavored Markdown messaging between agents",
        "Full-text search across conversation history",
        "Advisory file reservations to prevent edit conflicts",
        "Thread-based conversations with reply threading",
        "SQLite-backed storage for complete audit trails",
        "FastMCP server protocol for easy integration",
        "Optional web UI for human oversight",
      ],
      installation: "```bash\n# Clone and run locally\ngit clone https://github.com/Dicklesworthstone/mcp_agent_mail\ncd mcp_agent_mail\npip install -e .\n\n# Or install via pip\npip install mcp-agent-mail\n```",
      usage: "Add to your Claude Code MCP settings:\n\n```json\n{\n  \"mcpServers\": {\n    \"agent-mail\": {\n      \"command\": \"npx\",\n      \"args\": [\"@anthropic/mcp-agent-mail\"]\n    }\n  }\n}\n```\n\nAgents can then register, send messages, and coordinate work through the MCP tools.",
      relatedProjects: ["beads-viewer", "cass", "named-tmux-manager"],
    },
  },
  {
    name: "Beads Viewer",
    kind: "oss",
    badge: "1,211 stars",
    href: "https://github.com/Dicklesworthstone/beads_viewer",
    short: "Terminal UI for Steve Yegge's Beads system with graph analytics for agent task management.",
    description:
      "Transforms how agents visualize task dependencies using DAG-based analysis. Features nine graph metrics (PageRank, Betweenness, HITS, Critical Path), robot protocol for AI-ready JSON output, and time-travel diffing across git revisions. Built in Go with 60fps rendering via Bubble Tea.",
    tags: ["Go", "TUI", "Task Management", "Graph Analytics", "Agents", "Flywheel"],
    size: "wide",
    gradient: "from-emerald-500/20 via-teal-500/20 to-cyan-500/20",
    slug: "beads-viewer",
    details: {
      features: [
        "9 graph metrics: PageRank, Betweenness, HITS, Critical Path, and more",
        "Robot protocol (--robot-*) for AI-ready JSON output",
        "Time-travel diffing across git revisions",
        "60fps TUI rendering via Bubble Tea",
        "Dependency-aware task prioritization",
        "Cycle detection and resolution suggestions",
        "Integration with bd (beads CLI)",
        "Vim-style keyboard navigation",
      ],
      installation: "```bash\n# Install via Go\ngo install github.com/Dicklesworthstone/beads_viewer@latest\n\n# Or download pre-built binary from releases\n# https://github.com/Dicklesworthstone/beads_viewer/releases\n```",
      usage: "```bash\n# Interactive TUI mode\nbv\n\n# Robot mode for AI agents (REQUIRED for agents)\nbv --robot-priority    # Get priority recommendations\nbv --robot-plan        # Get execution plan with parallel tracks\nbv --robot-insights    # Get graph metrics as JSON\n```",
      relatedProjects: ["mcp-agent-mail", "cass", "ultimate-bug-scanner"],
    },
  },
  {
    name: "Named Tmux Manager",
    kind: "oss",
    badge: "133 stars",
    href: "https://github.com/Dicklesworthstone/ntm",
    short: "Multi-agent tmux orchestration. Spawn and coordinate Claude Code, Codex, and Gemini agents.",
    description:
      "Transform tmux into a multi-agent command center. Spawn named agent panes, broadcast prompts to specific agent types, capture outputs with regex filtering, and manage persistent SSH-compatible sessions. Features real-time dashboard, command palette, and pre/post hooks for automation.",
    tags: ["Go", "Tmux", "Multi-Agent", "Claude Code", "DevTools", "Flywheel"],
    size: "tall",
    slug: "named-tmux-manager",
    details: {
      features: [
        "Named agent panes with type classification (Claude, Codex, Gemini)",
        "Broadcast prompts to specific agent types or all agents",
        "Capture outputs with regex filtering",
        "Persistent SSH-compatible sessions",
        "Real-time dashboard showing agent status",
        "Command palette for quick actions",
        "Pre/post hooks for automation",
        "Session persistence across reboots",
      ],
      installation: "```bash\n# Install via Go\ngo install github.com/Dicklesworthstone/ntm@latest\n\n# Requires tmux to be installed\nsudo apt install tmux  # Debian/Ubuntu\nbrew install tmux      # macOS\n```",
      usage: "```bash\n# Start the manager\nntm\n\n# Spawn agents\nntm spawn claude my-project\nntm spawn codex backend-work\n\n# Broadcast to all agents\nntm broadcast \"Check the latest changes\"\n```",
      relatedProjects: ["mcp-agent-mail", "simultaneous-launch-button", "cass"],
    },
  },
  {
    name: "Simultaneous Launch Button",
    kind: "oss",
    badge: "56 stars",
    href: "https://github.com/Dicklesworthstone/slb",
    short: "Two-person rule for AI agents: peer review before dangerous commands execute.",
    description:
      "Adds safety friction for autonomous agents. Three-tier risk classification (CRITICAL/DANGEROUS/CAUTION), cryptographic command binding with SHA256+HMAC, dynamic quorum based on active agents, and complete audit trails. Integrates with Claude Code hooks and MCP Agent Mail for notifications.",
    tags: ["Go", "Security", "Multi-Agent", "Safety", "Audit", "Flywheel"],
    slug: "simultaneous-launch-button",
    details: {
      features: [
        "Three-tier risk classification: CRITICAL, DANGEROUS, CAUTION",
        "Cryptographic command binding with SHA256+HMAC",
        "Dynamic quorum based on active agents",
        "Complete audit trails for all operations",
        "Integration with Claude Code hooks",
        "MCP Agent Mail notifications for approvals",
        "Configurable timeout and approval thresholds",
        "Command replay protection",
      ],
      installation: "```bash\n# Install via Go\ngo install github.com/Dicklesworthstone/slb@latest\n```",
      usage: "```bash\n# Request approval for a dangerous command\nslb request --command \"rm -rf /tmp/build\" --risk DANGEROUS\n\n# Approve a pending request (from another agent)\nslb approve <request-id>\n\n# List pending requests\nslb list\n```",
      relatedProjects: ["mcp-agent-mail", "named-tmux-manager", "ultimate-bug-scanner"],
    },
  },
  {
    name: "CASS Memory System",
    kind: "oss",
    badge: "212 stars",
    href: "https://github.com/Dicklesworthstone/cass_memory_system",
    short: "ACE-framework persistent memory for coding agents. Stores procedural, episodic, and semantic knowledge.",
    description:
      "Implements the Autonomous Cognitive Entity framework to give agents human-like memory. Stores procedural knowledge (how-to playbooks), episodic memory (session histories), and semantic facts. Exposes MCP tools so agents can recall context across sessions without re-learning.",
    tags: ["TypeScript", "MCP", "Memory", "ACE Framework", "Agents", "Flywheel"],
    slug: "cass-memory-system",
    details: {
      features: [
        "ACE (Autonomous Cognitive Entity) framework implementation",
        "Procedural memory for how-to playbooks",
        "Episodic memory for session histories",
        "Semantic memory for facts and knowledge",
        "MCP tools for agent memory access",
        "Cross-session context persistence",
        "Memory consolidation and summarization",
        "Integration with CASS search",
      ],
      installation: "```bash\n# Clone and install\ngit clone https://github.com/Dicklesworthstone/cass_memory_system\ncd cass_memory_system\nbun install\nbun run build\n```",
      usage: "Add to your MCP settings to give agents persistent memory:\n\n```json\n{\n  \"mcpServers\": {\n    \"cass-memory\": {\n      \"command\": \"node\",\n      \"args\": [\"path/to/cass_memory_system/dist/index.js\"]\n    }\n  }\n}\n```",
      relatedProjects: ["cass", "mcp-agent-mail", "beads-viewer"],
    },
  },
  {
    name: "Mindmap Generator",
    kind: "oss",
    badge: "197 stars",
    href: "https://github.com/Dicklesworthstone/mindmap-generator",
    short: "Intelligently distills documents into hierarchical, context-aware mindmaps.",
    description:
      "Transforms dense documents into clear, structured visual maps using advanced LLM techniques. It verifies content against the source to prevent hallucinations, eliminates redundancy, and outputs in multiple formats, making it a powerful tool for rapid knowledge extraction and synthesis.",
    tags: ["LLM", "Visualization", "Knowledge Management", "NLP"],
    size: "tall",
  },
  {
    name: "LLM-Aided OCR",
    kind: "oss",
    badge: "2,855 stars",
    href: "https://github.com/Dicklesworthstone/llm_aided_ocr",
    short: "Tesseract + LLMs = Perfect PDFs. Corrects OCR errors with language models.",
    description:
      "Dramatically improves the quality of scanned documents by using Large Language Models to intelligently correct Tesseract's raw output. It handles smart chunking, layout preservation, and markdown formatting, turning messy scans into pristine, semantic digital text.",
    tags: ["OCR", "LLM", "Python", "PDF"],
    size: "wide",
    gradient: "from-green-500/20 via-emerald-500/20 to-teal-500/20",
  },
  {
    name: "Swiss Army Llama",
    kind: "oss",
    badge: "1,043 stars",
    href: "https://github.com/Dicklesworthstone/swiss_army_llama",
    short: "A high-performance 'Swiss Army Knife' FastAPI service for local LLMs.",
    description:
      "Streamlines complex local LLM operations into a unified API. It handles multi-modal embedding generation, sophisticated semantic search, and grammar-enforced text completions with aggressive caching and RAM disk optimization for maximum efficiency.",
    tags: ["FastAPI", "Local LLM", "Embeddings", "Search"],
  },
  {
    name: "Visual A* Pathfinding",
    kind: "oss",
    badge: "176 stars",
    href: "https://github.com/Dicklesworthstone/visual_astar_python",
    short: "Captivating, cinematic visualizations of pathfinding algorithms in action.",
    description:
      "Turns abstract computer science concepts into visual art. Features a high-performance A* implementation navigating through intricately generated mazes (using algorithms like Wave Function Collapse), offering a beautiful and intuitive way to understand algorithmic behavior.",
    tags: ["Algorithms", "Visualization", "Python", "Education"],
    size: "large",
    gradient: "from-red-500/20 via-orange-500/20 to-yellow-500/20",
  },
  {
    name: "Your Source to Prompt",
    kind: "oss",
    badge: "733 stars",
    href: "https://github.com/Dicklesworthstone/your-source-to-prompt.html",
    short: "Secure, browser-based tool to turn codebases into optimized LLM prompts.",
    description:
      "A single-file HTML tool that runs entirely locally to protect your IP. It allows you to filter, combine, and minify code files from your machine into context-aware prompts for LLMs, streamlining the workflow for AI-assisted development without sending code to a third-party server.",
    tags: ["Developer Tools", "Privacy", "Prompt Engineering"],
  },
  {
    name: "Bulk YouTube Transcriber",
    kind: "oss",
    badge: "643 stars",
    href: "https://github.com/Dicklesworthstone/bulk_transcribe_youtube_videos_from_playlist",
    short: "Convert entire playlists into structured, searchable text with Whisper.",
    description:
      "Automates the ingestion of massive amounts of video content, leveraging GPU-accelerated Whisper models to generate high-fidelity transcripts with timestamps. Includes an interactive HTML reader and NLP processing to turn hours of video into a queryable knowledge base.",
    tags: ["YouTube", "Whisper", "NLP", "Data Mining"],
  },
  {
    name: "Automatic Log Collector",
    kind: "oss",
    badge: "423 stars",
    href: "https://github.com/Dicklesworthstone/automatic_log_collector_and_analyzer",
    short: "Open-source Splunk alternative for efficient multi-server log analysis.",
    description:
      "A cost-effective solution for aggregating and analyzing gigabytes of logs from distributed fleets. It uses aggressive parallelization to pull data, stores it in SQLite/Datasette for instant querying, and provides a lightweight web interface for deep insights without the enterprise price tag.",
    tags: ["DevOps", "Logging", "SQLite", "Automation"],
  },
  {
    name: "Fast Vector Similarity",
    kind: "oss",
    badge: "425 stars",
    href: "https://github.com/Dicklesworthstone/fast_vector_similarity",
    short: "Lightning-fast Rust library for complex vector similarity metrics.",
    description:
      "Delivers robust, high-performance computation of advanced similarity measures like Hoeffding's D and Kendall's Tau. Built in Rust with seamless Python bindings, it's essential for statistical analysis of large-scale embeddings where standard cosine similarity isn't enough.",
    tags: ["Rust", "Python", "Math", "Vector DB"],
  },
  {
    name: "SQLAlchemy Visualizer",
    kind: "oss",
    badge: "284 stars",
    href: "https://github.com/Dicklesworthstone/sqlalchemy_data_model_visualizer",
    short: "Instantly turns SQLAlchemy ORM models into interactive SVG diagrams.",
    description:
      "Eliminates the need to manually diagram database schemas. This utility parses your Python code and generates clear, directed graphs of your data models, making it effortless to visualize and communicate complex database architectures.",
    tags: ["Database", "Visualization", "Python", "ORM"],
  },
  {
    name: "Next.js GitHub Blog",
    kind: "oss",
    badge: "89 stars",
    href: "https://github.com/Dicklesworthstone/nextjs-github-markdown-blog",
    short: "Seamless blogging platform using your GitHub repo as a CMS.",
    description:
      "Transforms a standard GitHub repository of Markdown files into a high-performance, SEO-optimized blog. It combines the developer-friendly workflow of git-based content management with the speed and polish of a modern Next.js 14 application.",
    tags: ["Next.js", "CMS", "Blogging", "React"],
  },
  {
    name: "LLM Tournament",
    kind: "oss",
    badge: "45 stars",
    href: "https://github.com/Dicklesworthstone/llm-tournament",
    short: "Arena for LLMs to compete and collaborate on coding challenges.",
    description:
      "An automated framework where multiple LLMs iteratively refine solutions to complex problems. It fosters a 'survival of the fittest' evolution of code, using peer feedback to break out of local optima and produce solutions superior to any single model.",
    tags: ["AI Research", "Evaluation", "Agents"],
  },
  {
    name: "ACIP",
    kind: "oss",
    badge: "Security",
    href: "https://github.com/Dicklesworthstone/acip",
    short: "AI Cognitive Inoculation Protocol: Defense against prompt injection.",
    description:
      "A security framework that 'inoculates' LLMs against semantic attacks. Inspired by cognitive psychology, it uses narrative directives and few-shot examples to help models recognize and neutralize sophisticated prompt injection attempts before they can execute.",
    tags: ["Security", "AI Safety", "Prompt Injection"],
  },
  {
    name: "Anti-Alzheimer's Flasher",
    kind: "oss",
    badge: "Experimental",
    href: "https://github.com/Dicklesworthstone/anti_alzheimers_flasher",
    short: "Web-based therapeutic tool exploring 40Hz neural stimulation.",
    description:
      "An accessible implementation of 40Hz gamma entrainment therapy. This web app delivers precise light and sound stimulation directly in the browser, democratizing access to promising non-invasive experimental treatments for Alzheimer's.",
    tags: ["Health Tech", "Web Audio", "Neuroscience"],
  },
  {
    name: "GitHub Repo Stars Analyzer",
    kind: "oss",
    badge: "20 stars",
    href: "https://github.com/Dicklesworthstone/most-influential-github-repo-stars",
    short: "Discover who *really* matters among your stargazers.",
    description:
      "Goes beyond vanity metrics to calculate an 'influencer score' for everyone who stars your repo. It helps maintainers identify key community members by analyzing the reach and activity of their stargazers.",
    tags: ["Analytics", "GitHub", "Community"],
  },
  {
    name: "PPP Loan Fraud Analysis",
    kind: "oss",
    badge: "Data Science",
    href: "https://github.com/Dicklesworthstone/ppp_loan_fraud_analysis",
    short: "Forensic data science tool for unmasking financial fraud.",
    description:
      "A powerful analytical engine that applies network analysis and XGBoost to massive loan datasets. It successfully identifies suspicious patterns, synthetic identities, and coordinated fraud rings that slipped past standard banking checks.",
    tags: ["Fraud", "Data Science", "Machine Learning"],
  },
  {
    name: "Multivariate Normality Testing",
    kind: "oss",
    badge: "Math",
    href: "https://github.com/Dicklesworthstone/multivariate_normality_testing",
    short: "Interactive 3D visualization for high-dimensional statistical testing.",
    description:
      "Tackles the curse of dimensionality by projecting complex data onto random 3D subspaces. It fits ellipsoids and compares error distributions to provide a visual and statistical assessment of normality in high-dimensional datasets.",
    tags: ["Statistics", "Visualization", "3D", "Math"],
  },
  {
    name: "Letter Learning Game",
    kind: "oss",
    badge: "Education",
    href: "https://github.com/Dicklesworthstone/letter_learning_game",
    short: "Adaptive, browser-based literacy tool for early childhood education.",
    description:
      "A comprehensive single-file React application that teaches the alphabet through phonics, tracing, and gamification. It features adaptive difficulty and local progress tracking, making high-quality educational software accessible without backend infrastructure.",
    tags: ["Education", "React", "Game"],
  },
  {
    name: "Ultimate Bug Scanner",
    kind: "oss",
    badge: "152 stars",
    href: "https://github.com/Dicklesworthstone/ultimate_bug_scanner",
    short: "Meta-runner for language-specific bug scanners, tuned for AI coding agents.",
    description:
      "Wraps best-in-class static analyzers (ESLint, Ruff, Clippy, golangci-lint, and more) with a consistent JSON interface. Perfect as a pre-commit hook or post-processing step for autonomous agents to catch bugs before they ship.",
    tags: ["Static Analysis", "Agents", "Code Quality", "CI/CD", "Multi-Language", "Flywheel"],
    size: "wide",
    slug: "ultimate-bug-scanner",
    details: {
      features: [
        "Wraps best-in-class analyzers: ESLint, Ruff, Clippy, golangci-lint, and more",
        "Consistent JSON output for all languages",
        "Auto-detects project languages",
        "Exit code 0 = safe, >0 = issues found",
        "Fix suggestions with line:column references",
        "Perfect for pre-commit hooks",
        "Designed for AI agent post-processing",
        "Supports TypeScript, Python, Rust, Go, and more",
      ],
      installation: "```bash\n# Install via pip (recommended)\npip install ultimate-bug-scanner\n\n# Or install from source\ngit clone https://github.com/Dicklesworthstone/ultimate_bug_scanner\ncd ultimate_bug_scanner\npip install -e .\n```",
      usage: "```bash\n# Scan specific files (fastest)\nubs file.ts file2.py\n\n# Scan staged files before commit\nubs $(git diff --name-only --cached)\n\n# Scan entire project\nubs .\n\n# Language filter\nubs --only=ts,tsx components/\n```",
      relatedProjects: ["beads-viewer", "simultaneous-launch-button", "cass"],
    },
  },
  {
    name: "Kissinger Thesis Reader",
    kind: "oss",
    badge: "46 stars",
    href: "https://github.com/Dicklesworthstone/kissinger_undergraduate_thesis",
    short: "A vibe-coded reader for Henry Kissinger's 400-page undergraduate thesis.",
    description:
      "Takes a painful scanned PDF and turns it into a clean, phone-friendly reading experience, with structure that plays nicely with modern models and human readers.",
    tags: ["History", "PDF", "Reading", "Education", "OCR"],
  },
  {
    name: "Jazz Chord Progression Editor",
    kind: "oss",
    badge: "Music tool",
    href: "https://github.com/Dicklesworthstone/jazz_chord_progression_editor_html",
    short: "Web-based jazz chord progression editor with playback.",
    description:
      "A web application that enables musicians to create, edit, and play jazz chord progressions. The tool combines intuitive interface design with advanced music theory algorithms for proper voicings and smooth voice leading. It runs entirely in-browser as a single HTML file with real-time audio playback.",
    tags: ["Music", "Jazz", "Chords", "Web", "HTML"],
  },
  {
    name: "Phage Explorer",
    kind: "oss",
    badge: "Bioinformatics",
    href: "https://github.com/Dicklesworthstone/phage_explorer",
    short: "Terminal UI for exploring bacteriophage genomes with 3D ASCII visualization.",
    description:
      "An offline-first TUI for browsing, visualizing, and analyzing bacteriophage genetic data. Features rotating 3D ASCII phage models, color-coded DNA/amino acid displays, GC skew analysis, motif detection, and 12 real phage genomes. Built with Bun and Ink for 60fps scrolling through large genomes.",
    tags: ["Bun", "TypeScript", "TUI", "Bioinformatics", "Genomics", "SQLite"],
    size: "tall",
  },
  {
    name: "Source to Prompt TUI",
    kind: "oss",
    badge: "Dev Tool",
    href: "https://github.com/Dicklesworthstone/source_to_prompt_tui",
    short: "Convert source code to LLM-ready prompts with real-time token counting.",
    description:
      "Terminal app that transforms codebases into structured XML prompts for LLMs. Features Vim-style navigation, live tiktoken counting against 128K context windows, JS/CSS/HTML minification, .gitignore support, and a preset system for saved file selections. Cross-platform single binary.",
    tags: ["Bun", "TypeScript", "TUI", "LLM", "Prompt Engineering", "DevTools"],
  },
  {
    name: "Chat to File",
    kind: "oss",
    badge: "21 stars",
    href: "https://github.com/Dicklesworthstone/chat_shared_conversation_to_file",
    short: "Convert ChatGPT, Gemini, and Grok share links to Markdown and HTML.",
    description:
      "CLI tool that extracts AI conversations from share links and saves them as clean, archivable Markdown and static HTML. Preserves fenced code blocks with syntax highlighting, creates deterministic filenames, and supports one-command GitHub Pages deployment. Uses Playwright for reliable extraction.",
    tags: ["Bun", "TypeScript", "CLI", "ChatGPT", "Gemini", "Playwright"],
  },
  {
    name: "Coding Agent Tips & Scripts",
    kind: "oss",
    badge: "191 stars",
    href: "https://github.com/Dicklesworthstone/misc_coding_agent_tips_and_scripts",
    short: "Battle-tested solutions for AI coding agents, terminal setup, and dev workflows.",
    description:
      "Practical guides documenting real problems and their solutions. Covers destructive command protection for AI agents, host-aware terminal themes, persistent SSH sessions, macOS NFS auto-mount, budget 10GbE networking, Claude Code hook safety guards, and more. Copy-paste configurations for immediate use.",
    tags: ["Agents", "Tips", "DevTools", "Workflow", "Safety"],
  },
  {
    name: "Brenner Bot",
    kind: "research",
    badge: "51 stars",
    href: "https://github.com/Dicklesworthstone/brenner_bot",
    short: "Multi-agent research system embodying Sydney Brenner's scientific methodology.",
    description:
      "A research 'seed crystal' combining curated Sydney Brenner transcripts with multi-model AI syntheses. Coordinates Claude (Opus 4.5), GPT-5, and Gemini agents via Agent Mail to conduct collaborative scientific research conversations following the Brenner approach. Includes Next.js web app at brennerbot.org and terminal-first Bun CLI.",
    tags: ["AI Research", "Science", "Agents", "Methodology", "Multi-Agent"],
  },
  {
    name: "Repo Updater",
    kind: "oss",
    badge: "49 stars",
    href: "https://github.com/Dicklesworthstone/repo_updater",
    short: "Keep dozens of GitHub repos in sync with a single command.",
    description:
      "A beautiful, automation-friendly CLI for synchronizing GitHub repositories. Clone missing repos, pull updates, detect conflicts, and get actionable resolution commands. Pure Bash with git plumbing for reliable status detection, JSON output for scripting, and meaningful exit codes for CI.",
    tags: ["CLI", "GitHub", "DevTools", "Automation", "Bash"],
  },
  {
    name: "Clawdbot Skills",
    kind: "oss",
    badge: "42 stars",
    href: "https://github.com/Dicklesworthstone/agent_flywheel_clawdbot_skills_and_integrations",
    short: "Modular skills teaching Clawdbot to use the Flywheel toolkit.",
    description:
      "A curated collection of Clawdbot skills for professional agentic coding workflows. Includes skills for NTM, Agent Mail, Beads Viewer, CASS, and more, plus cloud CLIs and workflow methodologies. Enables Claude-powered assistants across WhatsApp, Telegram, and web interfaces to orchestrate multi-agent development.",
    tags: ["Agents", "Claude", "Skills", "DevTools", "Flywheel"],
  },
  {
    name: "Meta Skill",
    kind: "oss",
    badge: "108 stars",
    href: "https://github.com/Dicklesworthstone/meta_skill",
    short: "Complete skill management platform with MCP server for AI agent integration.",
    description:
      "Store skills, search them, track their effectiveness, package them for sharing, and integrate them natively with AI agents via MCP server. Skills come from hand-written files, CASS mining, bundles, or guided workflows. Thompson sampling learns which skills work best. Multi-layer security: ACIP for prompt injection, DCG for command safety, path policy for traversal attacks, secret scanner for redaction.",
    tags: ["Rust", "Claude", "Skills", "CLI", "DevTools", "Flywheel", "MCP"],
    slug: "meta-skill",
    details: {
      features: [
        "MCP server exposes 6 native tools for AI agent integration",
        "Thompson sampling bandit learns from usage to optimize suggestions",
        "ACIP prompt-injection detection with quarantine system",
        "DCG command safety tiers (Safe/Caution/Danger/Critical)",
        "Hybrid search: BM25 + hash embeddings with RRF fusion",
        "Token packing for context budget optimization",
        "Graph analysis via bv for dependency insights",
      ],
      installation: "```bash\n# Install via Cargo\ncargo install meta_skill\n\n# Or download pre-built binary from releases\n```",
      usage: "```bash\n# Start MCP server for AI agents\nms mcp serve\n\n# Search for skills\nms search 'error handling'\n\n# Token-packed loading within budget\nms load <skill> --pack 2000\n\n# Security scan for prompt injection\nms security scan <file>\n\n# Graph analysis via bv\nms graph insights\n```",
      relatedProjects: ["cass", "mcp-agent-mail"],
    },
  },
  {
    name: "Destructive Command Guard",
    kind: "oss",
    badge: "349 stars",
    href: "https://github.com/Dicklesworthstone/destructive_command_guard",
    short: "Hook for Claude Code and Gemini CLI that blocks destructive commands.",
    description:
      "High-performance safety hook that intercepts catastrophic commands before they execute. Protects against git reset --hard, rm -rf, DROP TABLE, and other irreversible operations that AI agents occasionally attempt. Works on Linux, macOS, and WSL with clear explanations and safer alternatives.",
    tags: ["Safety", "Claude", "Hooks", "Git", "DevTools", "Flywheel"],
  },
  {
    name: "JeffreysPrompts.com",
    kind: "oss",
    badge: "64 stars",
    href: "https://github.com/Dicklesworthstone/jeffreysprompts.com",
    short: "Curated prompt library for agentic coding workflows.",
    description:
      "A Next.js platform for discovering, copying, and installing battle-tested prompts that supercharge AI coding agents. Browse categorized prompts, one-click copy, or install directly as Claude Code skills. Built with Next.js 16, React 19, and TypeScript.",
    tags: ["Prompts", "Next.js", "Claude", "DevTools", "Web"],
  },
  {
    name: "GIIL",
    kind: "oss",
    badge: "27 stars",
    href: "https://github.com/Dicklesworthstone/giil",
    short: "Git-backed interactive issue list with dependency tracking.",
    description:
      "A lightweight issue tracker that stores everything in git. Features dependency relationships between issues, markdown descriptions, and seamless integration with standard git workflows. Perfect for solo developers or small teams who want issue tracking without external services.",
    tags: ["Git", "Issues", "CLI", "DevTools", "Productivity"],
  },
  {
    name: "Coding Agent Account Manager",
    kind: "oss",
    badge: "46 stars",
    href: "https://github.com/Dicklesworthstone/coding_agent_account_manager",
    short: "Manage multiple AI coding agent subscriptions and accounts.",
    description:
      "Streamlines the management of multiple AI coding agent accounts (Claude, Codex, Gemini). Track subscription status, API keys, usage limits, and billing across providers. Essential for power users running multiple agent sessions.",
    tags: ["Agents", "DevTools", "Management", "Subscriptions"],
  },
  {
    name: "Flywheel Gateway",
    kind: "oss",
    badge: "19 stars",
    href: "https://github.com/Dicklesworthstone/flywheel_gateway",
    short: "Central API gateway for the Agentic Coding Flywheel ecosystem.",
    description:
      "Unified entry point for Flywheel tools, providing authentication, rate limiting, and routing across the ecosystem. Enables seamless integration between NTM, Agent Mail, Beads, and other Flywheel components.",
    tags: ["Gateway", "API", "DevOps", "Flywheel"],
  },
  {
    name: "Flywheel Connectors",
    kind: "oss",
    badge: "27 stars",
    href: "https://github.com/Dicklesworthstone/flywheel_connectors",
    short: "Integration adapters for external services in the Flywheel ecosystem.",
    description:
      "Pre-built connectors for integrating external services with the Agentic Coding Flywheel. Includes adapters for cloud providers, CI/CD systems, and third-party APIs to extend Flywheel workflows.",
    tags: ["Integrations", "Connectors", "DevOps", "Flywheel"],
  },
  {
    name: "XF",
    kind: "oss",
    badge: "67 stars",
    href: "https://github.com/Dicklesworthstone/xf",
    short: "Fast cross-file search and replace tool for codebases.",
    description:
      "A high-performance CLI for searching and replacing text across large codebases. Supports regex patterns, preview modes, and bulk operations with git-aware filtering. Optimized for use in agentic workflows.",
    tags: ["CLI", "Search", "DevTools", "Refactoring"],
  },

  {
    name: "Suno2CD",
    kind: "oss",
    badge: "12 stars",
    href: "https://github.com/Dicklesworthstone/suno2cd",
    short: "Export Suno AI music to CD-quality audio formats.",
    description:
      "Tool for downloading and converting Suno AI-generated music to high-quality audio formats suitable for CD burning or archival. Preserves metadata and supports batch processing.",
    tags: ["Music", "Audio", "CLI", "AI"],
  },
  {
    name: "FrankenTUI",
    kind: "oss",
    badge: "94 stars",
    href: "https://github.com/Dicklesworthstone/frankentui",
    short: "Minimal, high-performance terminal UI kernel focused on correctness, determinism, and clean architecture.",
    description:
      "A kernel-level TUI foundation for Rust with a disciplined runtime, diff-based renderer, and inline-mode support that preserves scrollback while keeping UI chrome stable. Features a layered crate architecture (core → render → runtime → widgets), one-writer rule for serialized output, RAII cleanup even on panic, and snapshot/time-travel harness for deterministic testing. Designed as a foundation you build your own UI framework on top of.",
    tags: ["Rust", "TUI", "Terminal", "Rendering", "Systems"],
    size: "wide",
    gradient: "from-orange-500/20 via-red-500/20 to-rose-500/20",
    slug: "frankentui",
    details: {
      features: [
        "Inline mode with scrollback preservation — stable UI chrome while logs scroll",
        "Deterministic buffer diff rendering pipeline (Buffer → Diff → Presenter → ANSI)",
        "One-writer rule enforcing serialized terminal output for correctness",
        "RAII cleanup via TerminalSession — terminal state restored even on panic",
        "11-crate layered workspace: core, render, style, text, layout, runtime, widgets, extras",
        "Snapshot and time-travel harness for regression testing",
        "Optional OpenTelemetry integration for runtime instrumentation",
        "JSONL evidence logs for diff strategy and resize decisions",
      ],
      installation: "```bash\n# Clone and build\ngit clone https://github.com/Dicklesworthstone/frankentui.git\ncd frankentui\ncargo build --release\n\n# Run the demo showcase\ncargo run -p ftui-demo-showcase\n```",
      usage: "```bash\n# Primary demo showcase\ncargo run -p ftui-demo-showcase\n\n# Pick a specific demo view\nFTUI_HARNESS_VIEW=dashboard cargo run -p ftui-demo-showcase\nFTUI_HARNESS_VIEW=visual_effects cargo run -p ftui-demo-showcase\n```",
      relatedProjects: ["beads-rust", "beads-viewer", "named-tmux-manager"],
    },
  },
  {
    name: "Beads Rust",
    kind: "oss",
    badge: "489 stars",
    href: "https://github.com/Dicklesworthstone/beads_rust",
    short: "Fast Rust port of Steve Yegge's beads — a local-first, non-invasive issue tracker for git repos.",
    description:
      "A high-performance reimplementation of the beads issue tracker in Rust. Provides dependency-aware issue tracking that exports to JSONL for version control, with JSON output for AI agent integration. Features ready-work detection, discovered-from linking, and seamless git-friendly state management without ever running git commands itself.",
    tags: ["Rust", "CLI", "Issue Tracking", "Git", "Agents", "Flywheel"],
    size: "large",
    gradient: "from-amber-500/20 via-orange-500/20 to-red-500/20",
    slug: "beads-rust",
    details: {
      features: [
        "Dependency-aware issue tracking with blocker/blocked-by relationships",
        "JSONL export for git-friendly version control",
        "Ready-work detection for unblocked issues",
        "Discovered-from linking to trace how issues relate",
        "JSON output mode for AI agent integration",
        "SQLite-backed with sync to JSONL for durability",
        "Non-invasive — never executes git commands",
        "Compatible with bv (Beads Viewer) for graph analytics",
      ],
      installation: "```bash\n# Install via Cargo\ncargo install beads_rust\n\n# Or download pre-built binary from releases\n# https://github.com/Dicklesworthstone/beads_rust/releases\n```",
      usage: "```bash\n# Check for ready work\nbr ready --json\n\n# Create an issue\nbr create \"Fix rendering bug\" -t bug -p 1 --json\n\n# Update status\nbr update br-42 --status in_progress\n\n# Close when done\nbr close br-42 --reason \"Fixed in commit abc123\"\n```",
      relatedProjects: ["beads-viewer", "mcp-agent-mail", "cass"],
    },
  },
  {
    name: "WezTerm Automata",
    kind: "oss",
    badge: "22 stars",
    href: "https://github.com/Dicklesworthstone/wezterm_automata",
    short: "Terminal hypervisor for AI agent swarms with pattern detection and event-driven workflows.",
    description:
      "Coordinates fleets of AI coding agents across WezTerm panes. Features real-time pane output capture, pattern-matching state detection, event-driven workflows, FTS5 full-text search, and a policy engine for safe multi-agent control. Includes a Robot Mode JSON API for programmatic orchestration.",
    tags: ["Rust", "Terminal", "Multi-Agent", "Automation", "Flywheel"],
  },
  {
    name: "Pi Agent Rust",
    kind: "oss",
    badge: "26 stars",
    href: "https://github.com/Dicklesworthstone/pi_agent_rust",
    short: "High-performance AI coding agent CLI with sub-100ms startup and native SSE streaming.",
    description:
      "A lightweight AI coding agent written in Rust with instant startup, a ~15MB binary, and 7 built-in tools. Features session branching, structured concurrency via asupersync, and beautiful terminal output via rich_rust. Designed for speed-critical agentic workflows.",
    tags: ["Rust", "CLI", "Agents", "AI", "Performance"],
  },
  {
    name: "Remote Compilation Helper",
    kind: "oss",
    badge: "25 stars",
    href: "https://github.com/Dicklesworthstone/remote_compilation_helper",
    short: "Transparent compilation offloading for AI agents via Claude Code hooks.",
    description:
      "Intercepts cargo and gcc builds via Claude Code PreToolUse hooks and routes them to remote workers. Features sub-millisecond routing decisions, smart worker load-balancing, project affinity caching, multi-agent deduplication, and fail-open design for zero-disruption fallback.",
    tags: ["Rust", "DevOps", "Build Tools", "Agents", "Performance", "Flywheel"],
  },
  {
    name: "Automated Plan Reviser Pro",
    kind: "oss",
    badge: "41 stars",
    href: "https://github.com/Dicklesworthstone/automated_plan_reviser_pro",
    short: "Iterative specification refinement using GPT Pro Extended Reasoning.",
    description:
      "Multi-round AI review automation for architecture optimization. Bundles project documents, runs iterative GPT-powered review sessions with background processing, and tracks round history with git integration. Features session attach/detach and a beautiful gum-based TUI.",
    tags: ["Bash", "AI", "Architecture", "Planning", "Automation"],
  },
  {
    name: "Process Triage",
    kind: "oss",
    badge: "17 stars",
    href: "https://github.com/Dicklesworthstone/process_triage",
    short: "Bayesian zombie process detection and safe cleanup for dev environments.",
    description:
      "Uses a four-class Bayesian inference model to identify abandoned and zombie processes with conservative defaults. Features transparent decision evidence, staged SIGTERM→SIGKILL, protected process lists, and cross-platform support. Never auto-kills without explicit confirmation.",
    tags: ["Rust", "Linux", "Systems", "DevOps", "Safety"],
  },
  {
    name: "ASupersync",
    kind: "oss",
    badge: "17 stars",
    href: "https://github.com/Dicklesworthstone/asupersync",
    short: "Spec-first, cancel-correct, capability-secure async runtime for Rust.",
    description:
      "A structured concurrency runtime with regions, cancel-correct protocols with bounded cleanup, and capability-based context. Features two-phase effects, a deterministic lab runtime for testing, and guarantees no orphan tasks. Used as the async foundation for pi_agent_rust and fastmcp_rust.",
    tags: ["Rust", "Async", "Concurrency", "Runtime", "Systems"],
  },
  {
    name: "TOON Rust",
    kind: "oss",
    badge: "16 stars",
    href: "https://github.com/Dicklesworthstone/toon_rust",
    short: "Reference Rust implementation of TOON, a token-optimized serialization format for LLMs.",
    description:
      "Spec-first Rust port of Token-Optimized Object Notation. Features streaming decode, deterministic output, native binary with no Node.js dependency, and token-efficiency optimizations including key folding and delimiter support. 100% spec conformance.",
    tags: ["Rust", "Serialization", "LLM", "Performance"],
  },
  {
    name: "RANO",
    kind: "oss",
    badge: "16 stars",
    href: "https://github.com/Dicklesworthstone/rano",
    short: "Network observer for AI CLI processes with provider attribution and SQLite logging.",
    description:
      "Tracks outbound connections from Claude Code, Codex CLI, and Gemini CLI with automatic provider-aware tagging (Anthropic, OpenAI, Google). Features descendant process tracking, live terminal stats, SQLite durable logging, and flexible JSON output.",
    tags: ["Rust", "Networking", "Monitoring", "Agents", "Flywheel"],
  },
  {
    name: "FastMCP Rust",
    kind: "rust-port",
    badge: "9 stars",
    href: "https://github.com/Dicklesworthstone/fastmcp_rust",
    short: "High-performance MCP framework for Rust with attribute macros and cancel-correct async.",
    description:
      "A zero-boilerplate Model Context Protocol framework built on asupersync. Features attribute macros for tools and resources, automatic timeout budgets, structured concurrency, and a 4-valued Outcome type. No unsafe code.",
    tags: ["Rust", "MCP", "Async", "AI Tools", "Rust Port"],
  },
  {
    name: "Charmed Rust",
    kind: "rust-port",
    badge: "9 stars",
    href: "https://github.com/Dicklesworthstone/charmed_rust",
    short: "Port of Charm's Bubbletea, Lipgloss, and Bubbles TUI libraries to idiomatic Rust.",
    description:
      "Brings the Elm architecture (pure update/view), CSS-like styling, 16 pre-built components, spring animations, Markdown rendering, and SSH app framework to Rust. 100% type-safe with no unsafe code.",
    tags: ["Rust", "TUI", "Terminal", "UI Components", "Rust Port"],
  },
  {
    name: "Rich Rust",
    kind: "rust-port",
    badge: "11 stars",
    href: "https://github.com/Dicklesworthstone/rich_rust",
    short: "Beautiful terminal output library for Rust inspired by Python's Rich.",
    description:
      "Markup syntax for styled text, auto-sizing tables, panels, progress bars, spinners, syntax highlighting for 100+ languages, Markdown rendering, and automatic color downgrade. Zero unsafe code.",
    tags: ["Rust", "TUI", "Terminal", "Output", "Rust Port"],
  },
  {
    name: "OpenTUI Rust",
    kind: "rust-port",
    badge: "10 stars",
    href: "https://github.com/Dicklesworthstone/opentui_rust",
    short: "High-performance TUI rendering engine with RGBA alpha blending and scissor clipping.",
    description:
      "Cell-based buffers with real alpha blending, scissor clipping for nested viewports, double-buffered diff rendering, rope-based text editing with undo/redo. A zero-opinion rendering engine for building terminal UI frameworks.",
    tags: ["Rust", "TUI", "Rendering", "Graphics", "Rust Port"],
  },
  {
    name: "Post Compact Reminder",
    kind: "oss",
    badge: "15 stars",
    href: "https://github.com/Dicklesworthstone/post_compact_reminder",
    short: "Claude Code hook that re-reads AGENTS.md after context compaction.",
    description:
      "A SessionStart hook for Claude Code that reminds the agent to re-read AGENTS.md after context compaction, preventing loss of project conventions during long coding sessions.",
    tags: ["Claude Code", "Hooks", "DevTools", "Agents", "Flywheel"],
  },
  {
    name: "Agent Settings Backup",
    kind: "oss",
    badge: "16 stars",
    href: "https://github.com/Dicklesworthstone/agent_settings_backup_script",
    short: "Backup and sync settings across AI coding agents.",
    description:
      "Backs up and synchronizes configuration for Claude Code, Cursor, Codex, and other AI coding agents. Preserves settings, MCP configurations, and customizations across machines and reinstalls.",
    tags: ["Bash", "DevOps", "Agents", "Configuration", "Flywheel"],
  },
  {
    name: "Vibe Cockpit",
    kind: "oss",
    badge: "9 stars",
    href: "https://github.com/Dicklesworthstone/vibe_cockpit",
    short: "Monitoring and observability dashboard for AI coding agent fleets.",
    description:
      "Comprehensive monitoring tool for AI coding agent fleets. Tracks agent health, resource usage, and work progress across multiple concurrent sessions.",
    tags: ["Monitoring", "Agents", "Dashboard", "DevOps", "Flywheel"],
  },
  {
    name: "Coding Agent Usage Tracker",
    kind: "oss",
    badge: "9 stars",
    href: "https://github.com/Dicklesworthstone/coding_agent_usage_tracker",
    short: "Cross-platform CLI for tracking LLM provider usage across Codex, Claude, and Gemini.",
    description:
      "Tracks API token consumption and costs across multiple LLM providers (Codex, Claude, Gemini). Provides usage reports, cost breakdowns, and trend analysis for managing AI coding budgets.",
    tags: ["Rust", "CLI", "Analytics", "LLM", "Cost Management"],
  },
  {
    name: "FrankenSQLite",
    kind: "oss",
    badge: "10 stars",
    href: "https://github.com/Dicklesworthstone/frankensqlite",
    short: "Clean-room Rust reimplementation of SQLite with MVCC page-level versioning.",
    description:
      "A from-scratch SQLite implementation in Rust featuring MVCC page-level versioning for concurrent read/write access. Designed as both a learning exercise and a foundation for specialized embedded database use cases.",
    tags: ["Rust", "Database", "SQLite", "Systems"],
  },
];

// =============================================================================
// AGENTIC CODING TOOLING FLYWHEEL
// =============================================================================
// These tools work together in a self-reinforcing loop to supercharge
// multi-agent coding workflows.

export type FlywheelTool = {
  id: string;
  name: string;
  shortName: string;
  href: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind gradient
  tagline: string;
  connectsTo: string[]; // IDs of tools this one connects to
  connectionDescriptions: Record<string, string>; // ID -> description of connection
  // Enhanced fields for rich tooltips
  stars?: number; // GitHub star count
  demoUrl?: string; // Live demo URL if available
  projectSlug?: string; // Slug for "Learn More" link to /projects/[slug]
  features: string[]; // 2-3 key features for tooltip
};

export const flywheelTools: FlywheelTool[] = [
  {
    id: "ntm",
    name: "Named Tmux Manager",
    shortName: "NTM",
    href: "https://github.com/Dicklesworthstone/ntm",
    icon: "LayoutGrid",
    color: "from-sky-500 to-blue-600",
    tagline: "Multi-agent tmux orchestration",
    connectsTo: ["slb", "mail", "cass", "bv"],
    connectionDescriptions: {
      slb: "Routes dangerous commands through safety checks",
      mail: "Human Overseer messaging and file reservations",
      cass: "Duplicate detection and session history search",
      bv: "Dashboard shows beads status; --robot-triage for dispatch",
    },
    stars: 133,
    projectSlug: "named-tmux-manager",
    features: [
      "Spawn 10+ Claude/Codex/Gemini agents in parallel",
      "Smart broadcast with type/variant/tag filtering",
      "60fps animated dashboard with health monitoring",
    ],
  },
  {
    id: "slb",
    name: "Simultaneous Launch Button",
    shortName: "SLB",
    href: "https://github.com/Dicklesworthstone/slb",
    icon: "ShieldCheck",
    color: "from-amber-500 to-orange-600",
    tagline: "Peer review for dangerous commands",
    connectsTo: ["mail", "ubs"],
    connectionDescriptions: {
      mail: "Notifications sent to reviewer inboxes",
      ubs: "Pre-flight scans before execution",
    },
    stars: 56,
    projectSlug: "simultaneous-launch-button",
    features: [
      "Three-tier risk classification (CRITICAL/DANGEROUS/CAUTION)",
      "Cryptographic command binding with SHA256+HMAC",
      "Dynamic quorum based on active agents",
    ],
  },
  {
    id: "mail",
    name: "MCP Agent Mail",
    shortName: "Mail",
    href: "https://github.com/Dicklesworthstone/mcp_agent_mail",
    icon: "Mail",
    color: "from-violet-500 to-purple-600",
    tagline: "Inter-agent messaging & coordination",
    connectsTo: ["bv", "cm", "slb"],
    connectionDescriptions: {
      bv: "Task IDs link conversations to Beads issues",
      cm: "Shared context across agent sessions",
      slb: "Approval requests delivered to inboxes",
    },
    stars: 1654,
    demoUrl: "https://dicklesworthstone.github.io/cass-memory-system-agent-mailbox-viewer/viewer/",
    projectSlug: "mcp-agent-mail",
    features: [
      "GitHub-flavored Markdown messaging between agents",
      "Advisory file reservations to prevent conflicts",
      "SQLite-backed storage for complete audit trails",
    ],
  },
  {
    id: "bv",
    name: "Beads Viewer",
    shortName: "BV",
    href: "https://github.com/Dicklesworthstone/beads_viewer",
    icon: "GitBranch",
    color: "from-emerald-500 to-teal-600",
    tagline: "Graph analytics for task dependencies",
    connectsTo: ["mail", "ubs", "cass"],
    connectionDescriptions: {
      mail: "Task updates trigger mail notifications",
      ubs: "Bug scanner results create blocking issues",
      cass: "Search prior sessions for task context",
    },
    stars: 1211,
    demoUrl: "https://dicklesworthstone.github.io/beads_viewer-pages/",
    projectSlug: "beads-viewer",
    features: [
      "9 graph metrics: PageRank, Betweenness, Critical Path",
      "Robot protocol (--robot-*) for AI-ready JSON",
      "60fps TUI rendering via Bubble Tea",
    ],
  },
  {
    id: "ubs",
    name: "Ultimate Bug Scanner",
    shortName: "UBS",
    href: "https://github.com/Dicklesworthstone/ultimate_bug_scanner",
    icon: "Bug",
    color: "from-rose-500 to-red-600",
    tagline: "Pattern-based bug detection",
    connectsTo: ["bv", "slb"],
    connectionDescriptions: {
      bv: "Creates issues for discovered bugs",
      slb: "Validates code before risky commits",
    },
    stars: 152,
    projectSlug: "ultimate-bug-scanner",
    features: [
      "1,000+ custom detection patterns across languages",
      "Consistent JSON output for all languages",
      "Perfect for pre-commit hooks and CI/CD",
    ],
  },
  {
    id: "cm",
    name: "CASS Memory System",
    shortName: "CM",
    href: "https://github.com/Dicklesworthstone/cass_memory_system",
    icon: "Brain",
    color: "from-pink-500 to-fuchsia-600",
    tagline: "Persistent memory across sessions",
    connectsTo: ["mail", "cass", "bv"],
    connectionDescriptions: {
      mail: "Stores conversation summaries for recall",
      cass: "Semantic search over stored memories",
      bv: "Remembers task patterns and solutions",
    },
    stars: 212,
    demoUrl: "https://dicklesworthstone.github.io/cass-memory-system-agent-mailbox-viewer/viewer/",
    projectSlug: "cass-memory-system",
    features: [
      "Three-layer cognitive: episodic, working, procedural memory",
      "MCP tools for cross-session context persistence",
      "Built on top of CASS for semantic search",
    ],
  },
  {
    id: "cass",
    name: "Coding Agent Session Search",
    shortName: "CASS",
    href: "https://github.com/Dicklesworthstone/coding_agent_session_search",
    icon: "Search",
    color: "from-cyan-500 to-sky-600",
    tagline: "Unified search across 11+ agent formats",
    connectsTo: ["cm", "ntm", "bv", "mail"],
    connectionDescriptions: {
      cm: "CM integrates CASS for memory retrieval",
      ntm: "Duplicate detection before broadcasting",
      bv: "Links search results to related tasks",
      mail: "Agents query history before asking colleagues",
    },
    stars: 446,
    projectSlug: "cass",
    features: [
      "11 formats: Claude Code, Codex, Cursor, Gemini, ChatGPT, Aider, etc.",
      "Sub-5ms cached search, hybrid semantic + keyword",
      "Multi-machine sync via SSH with path mapping",
    ],
  },
  {
    id: "acfs",
    name: "Flywheel Setup",
    shortName: "ACFS",
    href: "https://github.com/Dicklesworthstone/agentic_coding_flywheel_setup",
    icon: "Cog",
    color: "from-purple-500 to-violet-600",
    tagline: "One-command environment bootstrap",
    connectsTo: ["ntm", "mail", "dcg"],
    connectionDescriptions: {
      ntm: "Installs and configures NTM",
      mail: "Sets up Agent Mail MCP server",
      dcg: "Installs DCG safety hooks",
    },
    stars: 1006,
    projectSlug: "agentic-coding-flywheel-setup",
    features: [
      "30-minute zero-to-hero setup",
      "Installs Claude Code, Codex, Gemini CLI",
      "All flywheel tools pre-configured",
    ],
  },
  {
    id: "dcg",
    name: "Destructive Command Guard",
    shortName: "DCG",
    href: "https://github.com/Dicklesworthstone/destructive_command_guard",
    icon: "ShieldAlert",
    color: "from-red-500 to-rose-600",
    tagline: "Intercepts dangerous shell commands",
    connectsTo: ["slb", "ntm"],
    connectionDescriptions: {
      slb: "Works alongside SLB for layered command safety",
      ntm: "Guards all commands in NTM-managed sessions",
    },
    stars: 349,
    projectSlug: "destructive-command-guard",
    features: [
      "Intercepts rm -rf, git reset --hard, etc.",
      "SIMD-accelerated pattern matching",
      "Command audit logging",
    ],
  },
  {
    id: "ru",
    name: "Repo Updater",
    shortName: "RU",
    href: "https://github.com/Dicklesworthstone/repo_updater",
    icon: "RefreshCw",
    color: "from-orange-500 to-amber-600",
    tagline: "Multi-repo sync in one command",
    connectsTo: ["ubs", "ntm"],
    connectionDescriptions: {
      ubs: "Run bug scans across all synced repos",
      ntm: "NTM integration for agent-driven sweeps",
    },
    stars: 49,
    features: [
      "One-command multi-repo sync",
      "Parallel operations with conflict detection",
      "AI code review integration",
    ],
  },
  {
    id: "giil",
    name: "Get Image from Internet Link",
    shortName: "GIIL",
    href: "https://github.com/Dicklesworthstone/giil",
    icon: "Image",
    color: "from-slate-500 to-gray-600",
    tagline: "Download images from share links",
    connectsTo: ["mail", "cass"],
    connectionDescriptions: {
      mail: "Downloaded images can be referenced in Agent Mail",
      cass: "Image analysis sessions are searchable",
    },
    stars: 27,
    features: [
      "iCloud share link support",
      "CLI-based image download",
      "Works over SSH without GUI",
    ],
  },
  {
    id: "xf",
    name: "X Archive Search",
    shortName: "XF",
    href: "https://github.com/Dicklesworthstone/xf",
    icon: "Archive",
    color: "from-blue-500 to-indigo-600",
    tagline: "Ultra-fast X/Twitter archive search",
    connectsTo: ["cass", "cm"],
    connectionDescriptions: {
      cass: "Similar search architecture and patterns",
      cm: "Found tweets can become memories",
    },
    stars: 67,
    features: [
      "Sub-second search over large archives",
      "Semantic + keyword hybrid search",
      "Privacy-preserving local processing",
    ],
  },
  {
    id: "s2p",
    name: "Source to Prompt TUI",
    shortName: "s2p",
    href: "https://github.com/Dicklesworthstone/source_to_prompt_tui",
    icon: "FileCode",
    color: "from-green-500 to-emerald-600",
    tagline: "Combine source files into LLM prompts",
    connectsTo: ["cass", "cm"],
    connectionDescriptions: {
      cass: "Generated prompts can be searched later",
      cm: "Effective prompts stored as memories",
    },
    stars: 13,
    features: [
      "Interactive file selection TUI",
      "Real-time token counting",
      "Gitignore-aware filtering",
    ],
  },
  {
    id: "ms",
    name: "Meta Skill",
    shortName: "MS",
    href: "https://github.com/Dicklesworthstone/meta_skill",
    icon: "Sparkles",
    color: "from-teal-500 to-emerald-600",
    tagline: "Skill management with effectiveness tracking",
    connectsTo: ["cass", "cm", "bv"],
    connectionDescriptions: {
      cass: "One input source for skill extraction",
      cm: "Skills and CM memories are complementary layers",
      bv: "Graph analysis for skill dependency insights",
    },
    stars: 108,
    features: [
      "MCP server for native AI agent integration",
      "Thompson sampling optimizes suggestions",
      "Multi-layer security (ACIP, DCG, path policy)",
    ],
  },
];

export const flywheelDescription = {
  title: "The Agentic Coding Tooling Flywheel",
  subtitle: "Fourteen tools that work together in a self-reinforcing loop",
  description:
    "Each tool in this ecosystem enhances the others. NTM spawns agents that communicate via Mail, which coordinates with Beads for task tracking. SLB and DCG add safety gates, UBS catches bugs before commit, CM provides persistent memory, CASS lets you search everything, and ACFS bootstraps the entire environment in one command. The more you use them together, the more powerful they become.",
};

export type TimelineItem = {
  title: string;
  org: string;
  period: string;
  location: string;
  body: string;
};

export const careerTimeline: TimelineItem[] = [
  {
    title: "Senior Analyst",
    org: "Balyasny Asset Management L.P.",
    period: "Aug 2020 – Dec 2021",
    location: "New York",
    body: "Generalist long/short equity role at a multi-manager platform, covering both longs and shorts across sectors.",
  },
  {
    title: "Founder & CEO",
    org: "Lumera Network (formerly Pastel Network)",
    period: "Dec 2021 – Present",
    location: "New York / Remote",
    body: "Building a Cosmos-based L1 focused on long-term storage, AI verification, and cross-chain interoperability.",
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
  source: "YTO" | "FMD" | "GitHub" | "Blog";
  category: string;
  blurb: string;
  date: string; // ISO 8601 date string (YYYY-MM-DD)
  featured?: boolean;
  gradient?: string;
};

export type MediaItem = {
  title: string;
  href: string;
  outlet: string;
  kind: "Article" | "Podcast" | "Blog" | "Profile";
  category: "Nvidia & Markets" | "AI & Agents" | "Lumera/Pastel" | "Profile";
  blurb: string;
};

export const mediaItems: MediaItem[] = [
  // =============================================================================
  // PODCASTS
  // =============================================================================
  {
    title: "DeepSeek R1 & The Short Case For Nvidia Stock",
    href: "https://www.bankless.com/podcast/deepseek-r1-the-short-case-for-nvidia-stock-jeffrey-emanuel",
    outlet: "Bankless Podcast",
    kind: "Podcast",
    category: "Nvidia & Markets",
    blurb:
      "In-depth discussion of my viral 12,000-word analysis on Nvidia's competitive vulnerabilities, DeepSeek's efficiency breakthroughs, and the shifting landscape of AI infrastructure. This episode aired January 28, 2025, the day after Nvidia's historic $600B single-day market cap drop.",
  },
  {
    title: "Viral Author of The Short Case for Nvidia Stock",
    href: "https://members.delphidigital.io/media/jeffrey-emanuel-viral-author-of-the-short-case-for-nvidia-stock-cohosted-by-pondering-durian",
    outlet: "Delphi Digital Podcast",
    kind: "Podcast",
    category: "Nvidia & Markets",
    blurb:
      "Tom Shaughnessy and Pondering Durian host an exploration of AI infrastructure disruption, open-source model innovation, and the societal implications of accelerating AGI development. Deep dive into model distillation, scaling laws, and US vs China AI development.",
  },
  {
    title: "Viral NVIDIA Short on Record Breaking $600B Loss",
    href: "https://open.spotify.com/episode/59UKRipYaHjsrQjEXHFR5z",
    outlet: "Farzad Podcast",
    kind: "Podcast",
    category: "Nvidia & Markets",
    blurb:
      "A 2+ hour conversation covering why, despite being bullish on AI, I'm skeptical about Nvidia's ability to sustain its enormous profit margins. Also explores Elon Musk's XAI, Tesla's FSD, and the transformative potential of humanoid robots.",
  },
  {
    title: "CEO Jeff Emanuel Interviewed by CGTN America",
    href: "https://lumera.io/ceo-jeff-emanuel-interviewed-by-cgtn-america/",
    outlet: "CGTN America",
    kind: "Podcast",
    category: "Lumera/Pastel",
    blurb:
      "Television interview discussing Pastel Network's vision for decentralized digital art infrastructure, eliminating intermediaries in art trading, and the future of blockchain-based creative markets.",
  },

  // =============================================================================
  // NEWS ARTICLES
  // =============================================================================
  {
    title: "Jeffrey Emanuel and the lessons we should all learn from the $2 trillion DeepSeek AI market correction",
    href: "https://diginomica.com/jeffrey-emanuel-and-lessons-we-should-all-learn-2-trillion-deepseek-ai-market-correction",
    outlet: "Diginomica",
    kind: "Article",
    category: "Nvidia & Markets",
    blurb:
      "In-depth interview covering the story behind writing 'The Short Case for Nvidia Stock,' the unexpected viral spread through Chamath Palihapitiya and Naval Ravikant's networks, and broader lessons about AI market dynamics and the Dunning-Kruger effect in tech investing.",
  },
  {
    title: "One Blogger Helped Spark NVIDIA's $600B Stock Collapse",
    href: "https://hardware.slashdot.org/story/25/02/01/2235213/one-blogger-helped-spark-nvidias-600b-stock-collapse",
    outlet: "Slashdot",
    kind: "Article",
    category: "Nvidia & Markets",
    blurb:
      "Coverage of how a 12,000-word blog post written from my Brooklyn apartment contributed to the largest single-day market cap drop in stock market history. Bloomberg's Matt Levine called it 'a candidate for the most impactful short research report ever.'",
  },
  {
    title: "DeepSeek Disruption Has Its Upside",
    href: "https://www.bloomberg.com/opinion/articles/2025-01-28/deepseek-disruption-has-its-upside",
    outlet: "Bloomberg (Matt Levine)",
    kind: "Article",
    category: "Nvidia & Markets",
    blurb:
      "Matt Levine's Money Stuff column where he characterized my analysis as 'a candidate for the most impactful short research report ever' and noted the online chatter claiming my post 'was an important catalyst' for the stock-market selloff.",
  },
  {
    title: "Is CoreWeave another WeWork? Blogger who caused Nvidia market cap to drop by $600 billion thinks so",
    href: "https://www.techradar.com/pro/is-coreweave-another-wework-blogger-who-caused-nvidia-market-capitalization-to-drop-by-usd600-billion-in-a-day-thinks-so",
    outlet: "TechRadar",
    kind: "Article",
    category: "Nvidia & Markets",
    blurb:
      "Coverage of my analysis calling CoreWeave 'the WeWork of AI' due to its reliance on quickly depreciating GPUs, lack of durable moat, and structural disadvantages versus hyperscalers. I noted: 'If it really IPOs for $30b+ then it's a much better short than NVDA ever was.'",
  },
  {
    title: "A bear case for Nvidia: hardware competitors, LLM code translation, DeepSeek breakthroughs",
    href: "https://www.techmeme.com/250126/p10",
    outlet: "Techmeme",
    kind: "Article",
    category: "Nvidia & Markets",
    blurb:
      "Featured on Techmeme's front page covering Nvidia's four-part moat (Linux drivers, CUDA lock-in, Mellanox interconnect, R&D flywheel) and the emerging threats to each pillar from competitors and efficiency breakthroughs.",
  },
  {
    title: "Quote: Jeffrey Emanuel",
    href: "https://globaladvisors.biz/2025/01/27/quote-jeffrey-emanuel/",
    outlet: "Global Advisors",
    kind: "Article",
    category: "Nvidia & Markets",
    blurb:
      "Global Advisors highlighted my analysis of DeepSeek's R1 model, which made significant strides in enabling step-by-step reasoning without traditional reliance on vast supervised datasets—a groundbreaking achievement in AI.",
  },

  // =============================================================================
  // TECH BLOGS
  // =============================================================================
  {
    title: "The impact of competition and DeepSeek on Nvidia",
    href: "https://simonwillison.net/2025/Jan/27/deepseek-nvidia/",
    outlet: "Simon Willison's Weblog",
    kind: "Blog",
    category: "Nvidia & Markets",
    blurb:
      "Simon Willison's analysis calling my piece 'Long, excellent...capturing the current state of the AI/LLM industry' and noting my 'rare combination of experience in both computer science and investment analysis.'",
  },
  {
    title: "Two good Deepseek explainers",
    href: "https://ericholscher.com/blog/2025/jan/27/two-good-deepseek-explainers/",
    outlet: "Eric Holscher's Blog",
    kind: "Blog",
    category: "Nvidia & Markets",
    blurb:
      "Read the Docs founder Eric Holscher recommended my piece as one of two essential DeepSeek explainers, describing it as 'a long post (~60m read time) that goes through the whole context of R1 in great depth, but very readable with a bit of technical knowledge.'",
  },
  {
    title: "Six New Tips for Better Coding With Agents",
    href: "https://steve-yegge.medium.com/six-new-tips-for-better-coding-with-agents-d4e9c86e42a9",
    outlet: "Steve Yegge (Medium)",
    kind: "Blog",
    category: "AI & Agents",
    blurb:
      "Steve Yegge features my 'Rule of Five' discovery: forcing agents to review their work 4-5 times leads to the best designs and implementations. Each iteration uses slightly broader reviews until the agent declares it's converged.",
  },
  {
    title: "Beads Best Practices",
    href: "https://steve-yegge.medium.com/beads-best-practices-2db636b9760c",
    outlet: "Steve Yegge (Medium)",
    kind: "Blog",
    category: "AI & Agents",
    blurb:
      "Steve Yegge calls me 'a top-tier engineer, mathematician, AI researcher, and hedge-fund financier, equally rarified-air at all of them' and notes I 'wiped 2 trillion dollars off the global stock market' with my Nvidia essay. Features my MCP Agent Mail integration with Beads.",
  },

  // =============================================================================
  // PROFILES & ENCYCLOPEDIAS
  // =============================================================================
  {
    title: "Jeffrey Emanuel Profile",
    href: "https://wikitia.com/wiki/Jeffrey_Emanuel",
    outlet: "Wikitia",
    kind: "Profile",
    category: "Profile",
    blurb:
      "Comprehensive biographical profile covering my background from Reed College mathematics to Wall Street hedge fund analyst roles at Millennium and Balyasny, two-time Value Investors Club Best Idea Award winner, and transition to AI infrastructure and blockchain.",
  },
];

export type ThreadItem = {
  title: string;
  href: string;
  blurb: string;
};

export const threads: ThreadItem[] = [
  {
    title: "The prompts I use to make daily progress on every project",
    href: "https://x.com/doodlestein/status/1999934160442687526",
    blurb:
      "I like to make sure that I'm making some forward progress on every one of my active projects each day, even when I'm too busy to spend real mental bandwidth on all of them. So I've come up with a few prompts that I use a lot with the agents so they're always moving forward.",
  },
  {
    title: "My current coding agent stack",
    href: "https://x.com/doodlestein/status/1998417768325206045",
    blurb:
      "The best stack now: Agent Mail MCP, warp-grep MCP, playwright MCP for frontend. CLI tools: Beads, bv, ubs, cass. Need the right stuff in your AGENTS.md. This combo lets me run 10+ agents simultaneously on complex projects.",
  },
  {
    title: "Why the Unix philosophy works for AI agent tooling",
    href: "https://x.com/doodlestein/status/2000271365816131942",
    blurb:
      "I'm getting more and more convinced that the Unix tool approach of having a bunch of focused, composable functional units that can be used in isolation or as part of a larger pipeline is also the best approach for tooling for coding agents.",
  },
  {
    title: "Intellectual humility and AI productivity",
    href: "https://x.com/doodlestein/status/1998450142408487059",
    blurb:
      "If you really want your productivity to take off, you should show some intellectual humility and truly accept that the latest frontier models with max effort and the right tooling are superhuman. They're already simply smarter and more knowledgeable than you.",
  },
  {
    title: "From idea to full plan in one hour",
    href: "https://x.com/doodlestein/status/1999969044561375694",
    blurb:
      "Since I think people are interested in my workflow and process, I literally thought of a new idea for a tool an hour ago and already have the full plan document in an initial version. Now I'm going to have GPT Pro and others go to town on improving it.",
  },
  {
    title: "The coding agent tooling flywheel",
    href: "https://x.com/doodlestein/status/1998792857008910751",
    blurb:
      "I just realized that if I can keep making my coding agent tooling flywheel spin faster and faster, then my most recent GitHub squares will always be much darker green than the previous ones. Each tool amplifies the others.",
  },
  {
    title: "How I update all coding agents at once",
    href: "https://x.com/doodlestein/status/1999941858303136000",
    blurb:
      "These coding agents get updated so frequently by OpenAI, Anthropic, and Google that I made an alias so I can update all of them instantly at once just by typing 'uca' (for 'update coding agents').",
  },
  {
    title: "Beads Viewer as a compass for agents",
    href: "https://x.com/doodlestein/status/2000686310026305568",
    blurb:
      "I find myself using beads_viewer (bv) constantly, or rather my agents use it all the time, as a kind of compass directing them on what to work on next. Funny because I literally made bv in one day. It goes to show that effort doesn't always correlate with value.",
  },
  {
    title: "The simultaneous launch button idea",
    href: "https://x.com/doodlestein/status/1999946295356825696",
    blurb:
      "You know how in movies like WarGames they show how two guys have to turn keys at the same time to arm nuclear warheads? I want to make something like that for confirming dangerous operations across multiple agents at once.",
  },
];

export const writingHighlights: WritingItem[] = [
  {
    title: "The Short Case for Nvidia Stock",
    href: "/writing/the_short_case_for_nvda",
    source: "YTO",
    category: "Markets & AI",
    blurb:
      "A 12,000-word deep dive into how AI economics, models like DeepSeek, and GPU supply can collide with valuation narratives. Explores the potential reflexivity of the AI capex cycle.",
    date: "2025-01-25",
    featured: true,
    gradient: "from-amber-500/20 via-orange-500/20 to-red-500/20",
  },
  {
    title: "The Most Impressive Prediction of All Time",
    href: "/writing/the_most_impressive_prediction_of_all_time",
    source: "YTO",
    category: "History & Science",
    blurb:
      "Analyzes Pyotr Durnovo's 1914 memorandum to Tsar Nicholas II—an eerily accurate forecast of WWI, the exact alignment of powers, and the inevitable Russian Revolution that would follow.",
    date: "2025-01-16",
    featured: true,
    gradient: "from-cyan-500/20 via-blue-500/20 to-indigo-500/20",
  },
  {
    title: "The Lessons of Hermann Grassmann",
    href: "/writing/hermann_grassmann_nature_of_abstractions",
    source: "FMD",
    category: "History of Math",
    blurb:
      "The story of the self-taught genius who invented linear algebra (the wedge product) decades before it was understood. A lesson on how radical abstractions are often rejected by the establishment.",
    date: "2024-06-01",
    featured: true,
    gradient: "from-pink-500/20 via-rose-500/20 to-red-500/20",
  },
  {
    title: "The Incredible Magic of CMA-ES",
    href: "/writing/cmaes_explainer",
    source: "GitHub",
    category: "Algorithms",
    blurb:
      "An interactive deep dive into the Covariance Matrix Adaptation Evolution Strategy. Explains how it adapts to high-dimensional, non-convex landscapes where gradient descent fails.",
    date: "2025-02-25",
  },
  {
    title: "Factor Risk Models and the Hedge Fund Business",
    href: "/writing/barra_factor_model_article",
    source: "FMD",
    category: "Investing",
    blurb:
      "An insider's look at how 'smart' risk models like Barra often unknowingly distort incentives, encourage crowding, and create hidden systemic risks within multi-manager platforms.",
    date: "2025-09-23",
  },
  {
    title: "LLM Introspective Compression",
    href: "/writing/llm_introspective_compression",
    source: "GitHub",
    category: "AI Research",
    blurb:
      "Proposes treating LLM context as a 'save state'. By allowing models to compress and manipulate their own internal thought states, we unlock capabilities like reasoning backtracking and reinforcement learning.",
    date: "2025-11-22",
  },
  {
    title: "PPP Loan Fraud: A Data Science Detective Story",
    href: "/writing/ppp_loan_fraud_analysis",
    source: "FMD",
    category: "Data Science",
    blurb:
      "Reconstructs massive fraud patterns in the PPP loan program. Shows how network analysis and simple heuristics could have caught billions in theft that standard banking checks missed.",
    date: "2025-02-20",
  },
  {
    title: "Multi-Round LLM Coding Tournament",
    href: "/writing/llm_multi_round_coding_tournament",
    source: "GitHub",
    category: "AI Research",
    blurb:
      "Demonstrates that collective intelligence outperforms individual genius. A framework where multiple LLMs iteratively refine coding solutions via peer review to break out of local optima.",
    date: "2025-11-22",
  },
  {
    title: "Dr. GPT: Empowering Your Healthcare Decisions",
    href: "/writing/dr_gpt_empowering_your_healthcare_with_ai",
    source: "FMD",
    category: "Healthcare & AI",
    blurb:
      "How to use AI as a tireless patient advocate. Describes a method for synthesizing scattered medical records into a unified dossier to catch missed diagnoses and dangerous drug interactions.",
    date: "2025-03-20",
  },
  {
    title: "Protecting Against AI Prompt Injection",
    href: "/writing/protecting_against_prompt_injection",
    source: "FMD",
    category: "Security",
    blurb:
      "Traces the history of 'jailbreaking' from simple commands to recursive meta-prompts. Argues that internal guardrails always fail and proposes external 'inoculation' strategies.",
    date: "2025-04-20",
  },
  {
    title: "Making Complex Code Changes with Claude Code",
    href: "/writing/making_complex_code_changes_with_cc",
    source: "FMD",
    category: "Dev Workflow",
    blurb:
      "Advocates for 'separating cognition' when using agents. Instead of asking for code directly, use agents to generate granular plans first, spreading the reasoning load across more tokens.",
    date: "2025-08-16",
  },
  {
    title: "Some Thoughts on AI Alignment",
    href: "/writing/some_thoughts_on_ai_alignment",
    source: "FMD",
    category: "AI Safety",
    blurb:
      "Argues that internal alignment (Asimov's laws) is a losing battle. Proposes an external 'criminal justice system' for AI: helper models that monitor and police the primary model's output.",
    date: "2024-06-20",
  },

  {
    title: "Engineering the Mindmap Generator",
    href: "/writing/making_of_the_mindmap_generator",
    source: "FMD",
    category: "Software Architecture",
    blurb:
      "Why pipelines aren't enough. Details the 'non-linear exploration model' architecture needed to extract deep, hierarchical structure from complex documents without hallucination.",
    date: "2025-02-25",
  },
  {
    title: "Building the Python Backend for YTO",
    href: "/writing/what_i_learned_making_the_python_backend_for_yto",
    source: "YTO",
    category: "Engineering",
    blurb:
      "A technical retrospective on using FastAPI, SQLModel, and Pydantic to build a heavy-duty async backend. Covers Whisper integration and optimizing for concurrency.",
    date: "2024-10-09",
  },
  {
    title: "TaxGPT: Using AI for Tax Prep",
    href: "/writing/tax_gpt_using_ai_for_tax_prep",
    source: "FMD",
    category: "Utility",
    blurb:
      "A practical guide to decomposing tax returns into context-sized chunks for AI analysis. How to find deductions, spot errors, and out-perform human accountants on complex personal returns.",
    date: "2025-03-18",
  },
  {
    title: "Hoeffding's D Explained",
    href: "/writing/hoeffdings_d_explainer",
    source: "GitHub",
    category: "Statistics",
    blurb:
      "Standard correlation misses non-linear relationships. This guide explains Hoeffding's D, a powerful non-parametric measure that detects complex dependencies where Pearson and Spearman fail.",
    date: "2025-11-22",
  },
  {
    title: "Lamport's Bakery Algorithm",
    href: "/writing/bakery_algorithm",
    source: "GitHub",
    category: "Algorithms",
    blurb:
      "A visual, Pythonic implementation of Leslie Lamport's classic solution to the mutual exclusion problem. Illustrates how fair concurrency can be achieved without atomic hardware primitives.",
    date: "2025-11-22",
  },
  {
    title: "Next.js GitHub Markdown Blog System",
    href: "/writing/nextjs_github_blogging_system",
    source: "YTO",
    category: "Web Dev",
    blurb:
      "Explains the architecture behind the open-source blogging engine. How to treat GitHub as a headless CMS, using static generation for speed and Git for version control.",
    date: "2024-03-30",
  },
];

// =============================================================================
// NVIDIA STORY PAGE DATA
// =============================================================================

export type NvidiaStoryTimelineEvent = {
  id: string;
  date: string;
  displayDate: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  featured?: boolean;
  sourceUrl?: string;
};

export const nvidiaStoryData = {
  // Hero section stats
  stats: {
    marketCapDrop: 600_000_000_000, // $600B
    marketCapDropDisplay: "$600B",
    essayWordCount: 12000,
    publishDate: "2025-01-25",
    dropDate: "2025-01-27",
  },

  // Hero content
  hero: {
    headline: "The $600B Drop",
    subheadline:
      "How a 12,000-word blog post from a Brooklyn apartment contributed to the largest single-day market cap drop in stock market history.",
    essayUrl: "/writing/the_short_case_for_nvda",
  },

  // Timeline events (chronological)
  timeline: [
    {
      id: "deepseek-r1",
      date: "2025-01-20",
      displayDate: "January 20, 2025",
      title: "DeepSeek R1 Released",
      description:
        "Chinese AI startup releases breakthrough reasoning model at a fraction of typical training costs. Market reaction: none.",
      icon: "Cpu",
      featured: false,
    },
    {
      id: "essay-published",
      date: "2025-01-25",
      displayDate: "January 25, 2025",
      title: "Essay Published",
      description:
        '"The Short Case for Nvidia Stock" goes live on Your Token Online, connecting the dots on what DeepSeek meant for Nvidia\'s moat.',
      icon: "FileText",
      featured: true,
    },
    {
      id: "chamath-shares",
      date: "2025-01-26",
      displayDate: "January 26, 2025",
      title: "Chamath Shares",
      description: "Chamath Palihapitiya shares the essay to his millions of followers.",
      icon: "Share2",
      sourceUrl: "https://x.com/chamath/status/1883579259769462819",
    },
    {
      id: "naval-amplifies",
      date: "2025-01-26",
      displayDate: "January 26, 2025",
      title: "Naval Amplifies",
      description: 'Naval Ravikant shares the essay, calling it "required reading."',
      icon: "TrendingUp",
      sourceUrl: "https://x.com/naval/status/1883751264082969057",
    },
    {
      id: "the-drop",
      date: "2025-01-27",
      displayDate: "January 27, 2025",
      title: "The Drop",
      description:
        "$600B single-day market cap decline. The largest in stock market history.",
      icon: "TrendingDown",
      featured: true,
    },
    {
      id: "matt-levine",
      date: "2025-01-28",
      displayDate: "January 28, 2025",
      title: "Matt Levine Weighs In",
      description:
        'Bloomberg columnist calls it "a candidate for the most impactful short research report ever."',
      icon: "Quote",
      featured: true,
    },
    {
      id: "media-coverage",
      date: "2025-01-28",
      displayDate: "January 28-30, 2025",
      title: "Media Coverage",
      description:
        "Slashdot, TechRadar, Diginomica, Techmeme, and others cover the story.",
      icon: "Newspaper",
    },
  ] as NvidiaStoryTimelineEvent[],

  // Key narrative point
  narrativeInsight:
    "DeepSeek V3 was released in late December 2024, and R1 on January 20. The market had NO reaction to either release. It took the essay—explaining what these efficiency breakthroughs meant for Nvidia's moat—to catalyze the selloff a full week later. This proves the essay was the proximate cause, not the DeepSeek releases themselves.",

  // Podcast appearances
  podcasts: [
    {
      id: "bankless",
      title: "DeepSeek R1 & The Short Case For Nvidia Stock",
      outlet: "Bankless Podcast",
      date: "2025-01-28",
      duration: "~90 min",
      description: "In-depth discussion aired the day after the $600B drop.",
      spotifyUrl:
        "https://www.bankless.com/podcast/deepseek-r1-the-short-case-for-nvidia-stock-jeffrey-emanuel",
    },
    {
      id: "delphi",
      title: "Viral Author of The Short Case for Nvidia Stock",
      outlet: "Delphi Digital",
      description:
        "AI infrastructure disruption, open-source innovation, AGI implications.",
      spotifyUrl:
        "https://members.delphidigital.io/media/jeffrey-emanuel-viral-author-of-the-short-case-for-nvidia-stock-cohosted-by-pondering-durian",
    },
    {
      id: "farzad",
      title: "Viral NVIDIA Short on Record Breaking $600B Loss",
      outlet: "Farzad Podcast",
      duration: "2+ hours",
      description: "Deep dive on Nvidia, XAI, Tesla FSD, and humanoid robots.",
      spotifyUrl: "https://open.spotify.com/episode/59UKRipYaHjsrQjEXHFR5z",
    },
  ],
};

// =============================================================================
// TLDR PAGE - FLYWHEEL ECOSYSTEM DETAILED DATA
// =============================================================================
// Extended data for the /tldr page showcasing all flywheel tools with
// comprehensive descriptions, implementation highlights, and synergies.

export type TldrToolCategory = "core" | "supporting";

export type TldrFlywheelTool = {
  id: string;
  name: string;
  shortName: string;
  href: string;
  icon: string;
  color: string;
  category: TldrToolCategory;
  stars?: number;
  // TLDR sections
  whatItDoes: string;
  whyItsUseful: string;
  implementationHighlights: string[];
  synergies: Array<{
    toolId: string;
    description: string;
  }>;
  techStack: string[];
  keyFeatures: string[];
  useCases: string[];
};

export const tldrFlywheelTools: TldrFlywheelTool[] = [
  // ===========================================================================
  // CORE FLYWHEEL TOOLS - Ordered by importance for workflow
  // ===========================================================================
  {
    id: "mail",
    name: "MCP Agent Mail",
    shortName: "Mail",
    href: "https://github.com/Dicklesworthstone/mcp_agent_mail",
    icon: "Mail",
    color: "from-violet-500 to-purple-600",
    category: "core",
    stars: 1654,
    whatItDoes:
      "A mail-like coordination layer for multi-agent workflows. Agents send messages, read threads, and reserve files asynchronously via MCP tools - like Gmail for AI coding agents.",
    whyItsUseful:
      "Critical for multi-agent setups. When 5+ Claude Code instances work the same codebase, they need to coordinate who's editing what. Agent Mail prevents merge conflicts and builds an audit trail of all agent decisions.",
    implementationHighlights: [
      "FastMCP server implementation for universal agent compatibility",
      "SQLite-backed storage for complete audit trails",
      "Advisory file locking to prevent edit conflicts",
      "GitHub-flavored Markdown support in messages",
    ],
    synergies: [
      {
        toolId: "bv",
        description: "Task IDs in mail threads link to Beads issues",
      },
      {
        toolId: "cm",
        description: "Shared context persists across agent sessions via CM",
      },
      {
        toolId: "slb",
        description: "Launched agents coordinate via mail threads",
      },
    ],
    techStack: ["Python 3.14+", "FastMCP", "FastAPI", "SQLite"],
    keyFeatures: [
      "Threaded messaging between AI agents",
      "Advisory file reservations",
      "SQLite-backed persistent storage",
      "MCP integration for any compatible agent",
    ],
    useCases: [
      "Coordinating file ownership across parallel agents",
      "Passing context between session restarts",
      "Building audit trails of agent decisions",
    ],
  },
  {
    id: "bv",
    name: "Beads Viewer",
    shortName: "BV",
    href: "https://github.com/Dicklesworthstone/beads_viewer",
    icon: "GitBranch",
    color: "from-emerald-500 to-teal-600",
    category: "core",
    stars: 1211,
    whatItDoes:
      "A fast terminal UI for viewing and analyzing Beads issues. Applies graph theory (PageRank, betweenness centrality, critical path) to identify which tasks unblock the most other work.",
    whyItsUseful:
      "Issue tracking is really a dependency graph. BV lets Claude prioritize beads intelligently by computing actual bottlenecks. The --robot-insights flag gives PageRank rankings for what to tackle first.",
    implementationHighlights: [
      "20,000+ lines of Go shipped in a single day",
      "Graph theory inspired by Frank Harary ('Mr. Graph Theory')",
      "Robot protocol (--robot-*) for AI-ready JSON output",
      "60fps TUI rendering with vim keybindings",
    ],
    synergies: [
      {
        toolId: "mail",
        description: "Task updates trigger notifications via Agent Mail",
      },
      {
        toolId: "ubs",
        description: "Bug scanner findings become blocking issues",
      },
      {
        toolId: "cass",
        description: "Search prior sessions for task context",
      },
    ],
    techStack: ["Go", "Bubble Tea", "Lip Gloss", "Graph algorithms"],
    keyFeatures: [
      "PageRank-based issue prioritization",
      "Critical path analysis",
      "Robot mode for AI agent integration",
      "Interactive TUI with vim keybindings",
    ],
    useCases: [
      "Identifying which task unblocks the most other work",
      "Visualizing complex dependency graphs",
      "Generating execution plans for AI agents",
    ],
  },
  {
    id: "cass",
    name: "Coding Agent Session Search",
    shortName: "CASS",
    href: "https://github.com/Dicklesworthstone/coding_agent_session_search",
    icon: "Search",
    color: "from-cyan-500 to-sky-600",
    category: "core",
    stars: 446,
    whatItDoes:
      "A unified TUI/CLI search engine that indexes 11+ coding agent formats (Claude Code, Codex, Cursor, Gemini, ChatGPT, Aider, Cline, and more) into a single searchable timeline. Supports BM25 keyword search, ML-powered semantic search, and hybrid RRF fusion.",
    whyItsUseful:
      "Every AI agent creates fragmented, unsearchable conversation trails. CASS unifies all this institutional knowledge - search 'React hydration fix' and find the exact solution from any agent. Enables agents to learn from their own and each other's past sessions.",
    implementationHighlights: [
      "21,000+ lines of Rust with Tantivy full-text engine",
      "Sub-5ms cached prefix search, <100ms typical queries",
      "FastEmbed semantic search with custom CVVI vector format",
      "11 format connectors (JSONL, SQLite, encrypted JSON)",
      "Multi-machine sync via rsync/SSH with provenance tracking",
    ],
    synergies: [
      {
        toolId: "ntm",
        description: "NTM uses CASS for duplicate detection before broadcasting and context retrieval",
      },
      {
        toolId: "cm",
        description: "CM integrates CASS for memory retrieval across sessions",
      },
      {
        toolId: "mail",
        description: "Agents query CASS to find prior solutions before asking colleagues via mail",
      },
    ],
    techStack: ["Rust (nightly)", "Tantivy", "FastEmbed", "Ratatui", "Rusqlite"],
    keyFeatures: [
      "11 agent formats: Claude Code, Codex, Cursor, Gemini, ChatGPT, Aider, Cline, etc.",
      "Three search modes: lexical, semantic (ML embeddings), hybrid (RRF K=60)",
      "Robot mode: --robot-format json/jsonl/compact/sessions for automation",
      "Self-documenting API: cass --robot-help, cass capabilities --json",
      "Multi-machine search with SSH host discovery and path mapping",
    ],
    useCases: [
      "Finding how a similar bug was fixed across any agent's history",
      "Enabling agents to learn from each other's past solutions",
      "Cross-datacenter search with provenance tracking",
      "Building institutional knowledge base from all AI interactions",
    ],
  },
  {
    id: "acfs",
    name: "Flywheel Setup",
    shortName: "ACFS",
    href: "https://github.com/Dicklesworthstone/agentic_coding_flywheel_setup",
    icon: "Cog",
    color: "from-purple-500 to-violet-600",
    category: "core",
    stars: 1006,
    whatItDoes:
      "One-command bootstrap that transforms a fresh Ubuntu VPS into a fully-configured agentic coding environment with all flywheel tools installed.",
    whyItsUseful:
      "Setting up a new development environment takes hours. ACFS does it in 30 minutes, installing 30+ tools, three AI agents, and all the flywheel tooling automatically.",
    implementationHighlights: [
      "Single curl | bash installation",
      "Idempotent (safe to re-run)",
      "Manifest-driven architecture",
      "SHA256 checksum verification for security",
    ],
    synergies: [
      {
        toolId: "ntm",
        description: "Installs and configures NTM",
      },
      {
        toolId: "mail",
        description: "Sets up Agent Mail MCP server",
      },
      {
        toolId: "dcg",
        description: "Installs DCG safety hooks",
      },
    ],
    techStack: ["Bash", "YAML manifest", "Next.js wizard"],
    keyFeatures: [
      "30-minute zero-to-hero setup",
      "Installs Claude Code, Codex, Gemini CLI",
      "All flywheel tools pre-configured",
      "Step-by-step wizard for beginners",
    ],
    useCases: [
      "Setting up new development VPS",
      "Onboarding team members",
      "Reproducible environment provisioning",
    ],
  },
  {
    id: "ubs",
    name: "Ultimate Bug Scanner",
    shortName: "UBS",
    href: "https://github.com/Dicklesworthstone/ultimate_bug_scanner",
    icon: "Bug",
    color: "from-rose-500 to-red-600",
    category: "core",
    stars: 152,
    whatItDoes:
      "Custom pattern-based bug scanner with 1,000+ detection rules across multiple languages. Catches common bugs, security issues, and code smells before they become problems.",
    whyItsUseful:
      "Instead of managing dozens of separate linters, UBS provides comprehensive bug detection in a single tool. Its pattern-based approach catches issues that traditional static analyzers miss.",
    implementationHighlights: [
      "1,000+ custom detection patterns across languages",
      "Pattern-based scanning with extensible rule definitions",
      "Consistent JSON output across all languages",
      "Exit codes designed for CI/CD integration",
    ],
    synergies: [
      {
        toolId: "bv",
        description: "Bug findings become blocking issues in Beads",
      },
      {
        toolId: "slb",
        description: "Pre-flight scans before risky operations",
      },
    ],
    techStack: ["Bash", "Pattern matching", "JSON output"],
    keyFeatures: [
      "1,000+ built-in detection patterns",
      "Consistent JSON output format",
      "Multi-language support",
      "Perfect for pre-commit hooks",
    ],
    useCases: [
      "Pre-commit validation across polyglot repos",
      "CI/CD pipeline integration",
      "Catching AI-generated code errors",
    ],
  },
  {
    id: "dcg",
    name: "Destructive Command Guard",
    shortName: "DCG",
    href: "https://github.com/Dicklesworthstone/destructive_command_guard",
    icon: "ShieldAlert",
    color: "from-red-500 to-rose-600",
    category: "core",
    stars: 349,
    whatItDoes:
      "Intercepts dangerous shell commands (rm -rf, git reset --hard, etc.) before execution. Requires confirmation for destructive operations.",
    whyItsUseful:
      "AI agents can and will run 'rm -rf /' if they think it solves your problem. DCG is the safety net that catches catastrophic commands before they execute.",
    implementationHighlights: [
      "Rust implementation with SIMD-accelerated pattern matching",
      "Sub-microsecond command analysis overhead",
      "Configurable risk levels and bypass rules",
      "Logging of all intercepted commands",
    ],
    synergies: [
      {
        toolId: "slb",
        description: "Works alongside SLB for layered command safety",
      },
      {
        toolId: "ntm",
        description: "Guards all commands in NTM-managed sessions",
      },
    ],
    techStack: ["Rust", "SIMD", "Shell integration"],
    keyFeatures: [
      "Intercepts rm -rf, git reset --hard, etc.",
      "SIMD-accelerated pattern matching",
      "Configurable allowlists",
      "Command audit logging",
    ],
    useCases: [
      "Protecting against accidental data loss",
      "Auditing dangerous commands from agents",
      "Training wheels for new AI agent setups",
    ],
  },
  {
    id: "ru",
    name: "Repo Updater",
    shortName: "RU",
    href: "https://github.com/Dicklesworthstone/repo_updater",
    icon: "RefreshCw",
    color: "from-orange-500 to-amber-600",
    category: "core",
    stars: 49,
    whatItDoes:
      "Keeps dozens (or hundreds) of Git repositories in sync with a single command. Clones missing repos, pulls updates, detects conflicts.",
    whyItsUseful:
      "Managing many repos across machines is painful. 'ru sync' handles everything: cloning what's missing, pulling what's stale, and reporting conflicts with resolution commands.",
    implementationHighlights: [
      "Pure Bash with git plumbing (no string parsing)",
      "Parallel sync with configurable worker count",
      "AI-assisted code review integration",
      "Meaningful exit codes for CI/CD",
    ],
    synergies: [
      {
        toolId: "ubs",
        description: "Run bug scans across all synced repos",
      },
      {
        toolId: "ntm",
        description: "NTM integration for agent-driven sweeps",
      },
    ],
    techStack: ["Bash 4.0+", "Git plumbing", "GitHub CLI"],
    keyFeatures: [
      "One-command multi-repo sync",
      "Parallel operations",
      "Conflict detection with resolution hints",
      "AI code review integration",
    ],
    useCases: [
      "Keeping development machines in sync",
      "CI/CD repo management",
      "Automated codebase maintenance",
    ],
  },
  {
    id: "cm",
    name: "CASS Memory System",
    shortName: "CM",
    href: "https://github.com/Dicklesworthstone/cass_memory_system",
    icon: "Brain",
    color: "from-pink-500 to-fuchsia-600",
    category: "core",
    stars: 212,
    whatItDoes:
      "A memory system built on top of CASS. Implements three-layer cognitive architecture: Episodic (experiences), Working (active context), and Procedural (skills and lessons learned).",
    whyItsUseful:
      "Without persistent memory, every agent session starts from scratch. CM lets agents learn from past sessions - remembering what worked, what failed, and extracting reusable playbook rules for future work.",
    implementationHighlights: [
      "Three-layer cognitive architecture (Episodic, Working, Procedural)",
      "MCP tools for cross-session context persistence",
      "Memory consolidation and summarization",
      "Hierarchical memory organization",
    ],
    synergies: [
      {
        toolId: "mail",
        description:
          "Conversation summaries from mail threads stored as memories",
      },
      {
        toolId: "cass",
        description: "Semantic search over stored memories",
      },
      {
        toolId: "bv",
        description: "Task patterns and solutions remembered",
      },
    ],
    techStack: ["TypeScript", "Bun", "MCP Protocol", "SQLite"],
    keyFeatures: [
      "Three memory layers: episodic, working, procedural",
      "MCP integration for any compatible agent",
      "Automatic memory consolidation",
      "Cross-session context persistence",
    ],
    useCases: [
      "Remembering project conventions across sessions",
      "Learning from past debugging sessions",
      "Building institutional knowledge over time",
    ],
  },
  {
    id: "ntm",
    name: "Named Tmux Manager",
    shortName: "NTM",
    href: "https://github.com/Dicklesworthstone/ntm",
    icon: "LayoutGrid",
    color: "from-sky-500 to-blue-600",
    category: "core",
    stars: 133,
    whatItDoes:
      "A tmux session orchestration platform that transforms tmux into a multi-agent command center. Spawn, broadcast to, and coordinate Claude/Codex/Gemini agents across tiled panes with smart routing and real-time monitoring.",
    whyItsUseful:
      "Enables true multi-agent development at scale. Spawn 10+ AI agents in parallel, broadcast prompts by type/variant/tag, monitor progress via animated dashboard, and coordinate work through integrated Agent Mail and CASS. Sessions survive SSH disconnects.",
    implementationHighlights: [
      "38,000+ lines of Go with 50+ internal packages",
      "Bubble Tea TUI with 60fps animated dashboard",
      "Smart routing: least-loaded, round-robin, affinity strategies",
      "CASS integration for duplicate detection before broadcasting",
      "Checkpoint system for automatic session snapshots",
    ],
    synergies: [
      {
        toolId: "mail",
        description:
          "Human Overseer messaging, file reservations, and audit trail logging integrated directly into NTM",
      },
      {
        toolId: "cass",
        description:
          "Duplicate detection before sending, context retrieval from 7+ days of session history",
      },
      {
        toolId: "bv",
        description:
          "Dashboard shows ready/blocked beads alongside agent status; --robot-triage for smart dispatch",
      },
    ],
    techStack: ["Go 1.25+", "Bubble Tea", "Cobra", "tmux 3.0+", "TOML/YAML config"],
    keyFeatures: [
      "Multi-agent spawn: ntm spawn project --cc=3 --cod=2 --gmi=1",
      "Smart broadcast: filter by type, variant (opus/sonnet), or custom tags",
      "Robot mode API: --robot-status, --robot-send, --robot-snapshot for automation",
      "Animated dashboard with token velocity, health checks, and alert panels",
      "Checkpoint/restore for session state management",
    ],
    useCases: [
      "Running 10+ AI agents in parallel on different features",
      "Broadcasting same prompt to Claude AND Codex simultaneously",
      "Auto-routing work to least-loaded agent with CASS dedup",
      "Persistent sessions for multi-day refactoring projects",
    ],
  },
  {
    id: "slb",
    name: "Simultaneous Launch Button",
    shortName: "SLB",
    href: "https://github.com/Dicklesworthstone/slb",
    icon: "ShieldCheck",
    color: "from-amber-500 to-orange-600",
    category: "core",
    stars: 56,
    whatItDoes:
      "Two-person rule CLI for approving dangerous shell commands. Requires a second human or AI reviewer to approve risky operations before execution.",
    whyItsUseful:
      "AI agents can accidentally run destructive commands. SLB implements a 'two-person rule' where dangerous commands require explicit approval from another party before executing, preventing catastrophic mistakes.",
    implementationHighlights: [
      "Go implementation with Bubble Tea TUI",
      "SQLite-backed persistent command queue",
      "Configurable risk detection patterns",
      "Real-time approval/rejection notifications",
    ],
    synergies: [
      {
        toolId: "ntm",
        description: "Protects NTM-managed sessions from dangerous commands",
      },
      {
        toolId: "dcg",
        description: "Works alongside DCG for layered command safety",
      },
      {
        toolId: "mail",
        description: "Approval requests can be sent via Agent Mail",
      },
    ],
    techStack: ["Go", "Bubble Tea", "SQLite"],
    keyFeatures: [
      "Two-person rule enforcement",
      "Command queue with approval workflow",
      "Pattern-based risk detection",
      "SQLite persistence",
    ],
    useCases: [
      "Requiring approval for rm -rf and git reset operations",
      "Adding safety gates to autonomous agent workflows",
      "Audit trail of dangerous command approvals",
    ],
  },
  // ===========================================================================
  // SUPPORTING FLYWHEEL TOOLS
  // ===========================================================================
  {
    id: "giil",
    name: "Get Image from Internet Link",
    shortName: "GIIL",
    href: "https://github.com/Dicklesworthstone/giil",
    icon: "Image",
    color: "from-slate-500 to-gray-600",
    category: "supporting",
    stars: 27,
    whatItDoes:
      "Downloads images from iCloud public share links for use in remote debugging sessions. Converts iCloud URLs to direct image downloads.",
    whyItsUseful:
      "When debugging remotely via SSH, you can't easily share screenshots. GIIL lets you upload to iCloud, share the link, and the remote machine downloads the image directly for AI agents to analyze.",
    implementationHighlights: [
      "iCloud public share URL parsing",
      "Direct image download without browser",
      "Automatic file naming from URL metadata",
      "Works over SSH without GUI",
    ],
    synergies: [
      {
        toolId: "mail",
        description: "Downloaded images can be referenced in Agent Mail",
      },
      {
        toolId: "cass",
        description: "Image analysis sessions are searchable",
      },
    ],
    techStack: ["Bash", "curl", "iCloud API"],
    keyFeatures: [
      "iCloud share link support",
      "CLI-based image download",
      "No browser required",
      "Works over SSH",
    ],
    useCases: [
      "Sharing screenshots for remote debugging",
      "Getting images to headless servers",
      "AI agent image analysis workflows",
    ],
  },
  {
    id: "xf",
    name: "X Archive Search",
    shortName: "XF",
    href: "https://github.com/Dicklesworthstone/xf",
    icon: "Archive",
    color: "from-blue-500 to-indigo-600",
    category: "supporting",
    stars: 67,
    whatItDoes:
      "Ultra-fast search over X/Twitter data archives. Uses hybrid BM25 + semantic search with Reciprocal Rank Fusion.",
    whyItsUseful:
      "Your X archive is a goldmine of bookmarks, threads, and ideas, but Twitter's search is terrible. XF makes your archive instantly searchable with both keyword and semantic matching.",
    implementationHighlights: [
      "Rust implementation for maximum performance",
      "Hybrid BM25 + semantic search with RRF fusion",
      "Zero-dependency hash embedder (no Python/API calls)",
      "Privacy-first, fully local processing",
    ],
    synergies: [
      {
        toolId: "cass",
        description: "Similar search architecture and patterns",
      },
      {
        toolId: "cm",
        description: "Found tweets can become memories",
      },
    ],
    techStack: ["Rust", "Tantivy", "Hash embeddings", "RRF"],
    keyFeatures: [
      "Sub-second search over large archives",
      "Semantic + keyword hybrid search",
      "No external API dependencies",
      "Privacy-preserving local processing",
    ],
    useCases: [
      "Finding that thread you bookmarked months ago",
      "Researching past discussions on a topic",
      "Building on ideas from your tweet history",
    ],
  },
  {
    id: "s2p",
    name: "Source to Prompt TUI",
    shortName: "s2p",
    href: "https://github.com/Dicklesworthstone/source_to_prompt_tui",
    icon: "FileCode",
    color: "from-green-500 to-emerald-600",
    category: "supporting",
    stars: 13,
    whatItDoes:
      "Terminal UI for combining source code files into LLM-ready prompts. Select files, preview output, copy to clipboard with token counting.",
    whyItsUseful:
      "Crafting prompts with code context is tedious. s2p lets you interactively select files, see the combined output, and track token count, all in a beautiful TUI.",
    implementationHighlights: [
      "Bun single-binary distribution",
      "React/Ink terminal UI framework",
      "tiktoken-accurate token counting",
      "Gitignore-aware file filtering",
    ],
    synergies: [
      {
        toolId: "cass",
        description: "Generated prompts can be searched later",
      },
      {
        toolId: "cm",
        description: "Effective prompts stored as memories",
      },
    ],
    techStack: ["TypeScript", "Bun", "React", "Ink", "tiktoken"],
    keyFeatures: [
      "Interactive file selection",
      "Real-time token counting",
      "Clipboard integration",
      "Gitignore-aware filtering",
    ],
    useCases: [
      "Preparing code context for Claude/GPT",
      "Creating reproducible prompt templates",
      "Managing context window budget",
    ],
  },
  {
    id: "ms",
    name: "Meta Skill",
    shortName: "MS",
    href: "https://github.com/Dicklesworthstone/meta_skill",
    icon: "Sparkles",
    color: "from-teal-500 to-emerald-600",
    category: "core",
    stars: 108,
    whatItDoes:
      "Complete skill management platform: store, search, track effectiveness, package for sharing, and integrate with AI agents via MCP. Skills come from hand-written files, CASS mining, bundles, or guided workflows.",
    whyItsUseful:
      "AI agents need reusable context to be effective. MS doesn't just store skills—it learns which ones work. Thompson sampling optimizes suggestions over time, security systems (ACIP, DCG) keep content safe, and the MCP server makes skills native to any AI agent.",
    implementationHighlights: [
      "Dual persistence: SQLite for queries + Git for audit trails",
      "Thompson sampling bandit learns from usage to optimize suggestions",
      "MCP server exposes 6 native tools for AI agent integration",
      "ACIP prompt-injection detection with quarantine system",
      "DCG command safety tiers (Safe/Caution/Danger/Critical)",
    ],
    synergies: [
      {
        toolId: "cass",
        description: "One input source for skill extraction (not the only one)",
      },
      {
        toolId: "cm",
        description: "Skills and CM memories are complementary knowledge layers",
      },
      {
        toolId: "bv",
        description: "Graph analysis via bv for skill dependency insights",
      },
    ],
    techStack: ["Rust", "SQLite", "Tantivy", "Git", "MCP"],
    keyFeatures: [
      "MCP server for native AI agent integration",
      "Thompson sampling optimizes suggestions over time",
      "Multi-layer security (ACIP, DCG, path policy, secrets)",
      "Hybrid search: BM25 + hash embeddings with RRF",
      "Token packing for context budget optimization",
    ],
    useCases: [
      "AI agents querying skills via MCP during sessions",
      "Building team-wide skill libraries with effectiveness tracking",
      "Packaging and sharing skills via signed bundles",
    ],
  },
];

// Merge build-time star counts (overrides hardcoded fallbacks)
const _starsMap = tldrToolStarsData as Record<string, number>;
for (const tool of tldrFlywheelTools) {
  if (_starsMap[tool.id] !== undefined) {
    tool.stars = _starsMap[tool.id];
  }
}

export const tldrPageData = {
  hero: {
    title: "The Agentic Coding Flywheel",
    subtitle: "TL;DR Edition",
    description:
      "14 interconnected tools that transform multi-agent AI coding workflows. Each tool makes the others more powerful - the more you use it, the faster it spins. While others argue about agentic coding, we're just over here building as fast as we can.",
    stats: [
      { label: "Ecosystem Tools", value: "14" },
      { label: "GitHub Stars", value: "16K+" },
      { label: "Languages", value: "5" },
    ],
  },
  coreDescription:
    "The core flywheel tools form the backbone: Agent Mail for coordination, BV for graph-based prioritization, CASS for instant session search, CM for persistent memory, UBS for bug detection, MS for skill management with MCP integration, plus session management, safety guards, and automated setup.",
  supportingDescription:
    "Supporting tools extend the ecosystem: GIIL for remote image debugging, XF for searching your X archive, and S2P for crafting prompts from source code.",
  flywheelExplanation: {
    title: "Why a Flywheel?",
    paragraphs: [
      "A flywheel stores rotational energy - the more you spin it, the easier each push becomes. These tools work the same way. The more you use them, the more valuable the system becomes.",
      "Every agent session generates searchable history (CASS). Past solutions become retrievable memory (CM). Dependencies surface bottlenecks (BV). Agents coordinate without conflicts (Mail). Each piece feeds the others.",
      "The result: I shipped 20,000+ lines of production Go code in a single day with BV. The flywheel keeps spinning faster - my GitHub commits accelerate each week because each tool amplifies the others.",
    ],
  },
};