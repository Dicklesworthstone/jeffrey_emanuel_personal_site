export const siteConfig = {
  name: "Jeffrey Emanuel",
  title: "Jeffrey Emanuel: Agentic Coding Tooling, AI Infrastructure & Markets",
  description:
    "Founder & CEO of Lumera Network. Creator of the Agentic Coding Tooling Flywheel, a self-reinforcing ecosystem of 7 interconnected tools (MCP Agent Mail, Beads Viewer, CASS, and more) that transform how AI coding agents collaborate. 30+ open-source projects with 10K+ GitHub stars.",
  email: "jeffreyemanuel@gmail.com",
  location: "",
  social: {
    x: "https://x.com/doodlestein",
    github: "https://github.com/Dicklesworthstone",
    linkedin: "https://www.linkedin.com/in/jeffreyemanuel",
  },
} satisfies {
  name: string;
  title: string;
  description: string;
  email: string;
  location: string;
  social: { x: string; github: string; linkedin: string };
};

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
    label: "GitHub Stars",
    value: "10K+",
    helper: "Across 30+ open-source agent tools and infrastructure.",
  },
  {
    label: "Flywheel Tools",
    value: "7",
    helper: "Interconnected tools that amplify multi-agent workflows.",
  },
  {
    label: "Years Building AI",
    value: "15+",
    helper: "Deep learning since 2010, agents since 2023.",
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
    "I built the Agentic Coding Tooling Flywheel: 7 interconnected tools including MCP Agent Mail (1K+ stars), Beads Viewer, and CASS that let coding agents collaborate, coordinate, and remember. I run 10+ agents simultaneously on complex projects using these.",
    "My 30+ open-source projects span agent infrastructure, static analysis, memory systems, and research tools. The flywheel keeps spinning faster; my GitHub squares get darker green each month because each tool amplifies the others.",
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

export type Project = {
  name: string;
  kind: "product" | "oss" | "research";
  badge?: string;
  href: string;
  short: string;
  description: string;
  tags: string[];
  size?: "wide" | "tall" | "large" | "normal";
  gradient?: string;
};

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
      "SmartEdgar pulls, normalizes, and slices SEC filings into agent‑ready formats. It exposes a clean MCP API so analysts and AI tools can ask structured questions about filings instead of fighting PDFs.",
    tags: ["EDGAR", "MCP", "Agents", "Finance"],
    size: "large",
    gradient: "from-emerald-500/20 via-teal-500/20 to-cyan-500/20",
  },
  {
    name: "Lumera Network",
    kind: "product",
    badge: "Layer‑1 protocol",
    href: "https://pastel.network",
    short: "Cosmos-based L1 for decentralized storage, AI inference, and cross‑chain interoperability.",
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
    badge: "138 stars",
    href: "https://github.com/Dicklesworthstone/coding_agent_session_search",
    short: "Unified TUI for searching local history across Claude Code, Codex, Cursor, Gemini, and more.",
    description:
      "A centralized search interface for all your AI coding sessions. Indexes conversation history from Claude Code, Codex, Cursor, Gemini, ChatGPT, and Cline using Tantivy full-text search. Find that solution you generated weeks ago and prevent re-solving problems.",
    tags: ["Rust", "TUI", "Search", "DevTools", "Agents", "Flywheel"],
    size: "wide",
  },
  {
    name: "Claude Code Agent Farm",
    kind: "oss",
    badge: "596 stars",
    href: "https://github.com/Dicklesworthstone/claude_code_agent_farm",
    short: "Orchestrate an army of Claude Code agents to autonomously improve codebases.",
    description:
      "Transforms code improvement into a scalable, parallel process by deploying a coordinated team of AI developers. This framework orchestrates multiple Claude Code sessions simultaneously to fix bugs, refactor legacy code, and implement best practices across 34 different tech stacks without conflict.",
    tags: ["Agents", "Automation", "Claude", "DevOps"],
    size: "large",
    gradient: "from-purple-600/20 via-fuchsia-500/20 to-pink-500/20",
  },
  {
    name: "Ultimate MCP Client",
    kind: "oss",
    badge: "141 stars",
    href: "https://github.com/Dicklesworthstone/ultimate_mcp_client",
    short: "Universal bridge for AI models to interact with the real world via MCP.",
    description:
      "A comprehensive, feature-rich client for the Model Context Protocol that unlocks complex, stateful AI capabilities. It includes both CLI and Web UIs, advanced conversation state management, and deep observability, serving as the robust connective tissue between LLMs and external tools, servers, and data.",
    tags: ["MCP", "AI Tools", "Interoperability", "Python"],
    size: "wide",
  },
  {
    name: "MCP Agent Mail",
    kind: "oss",
    badge: "1,001 stars",
    href: "https://github.com/Dicklesworthstone/mcp_agent_mail",
    short: "Gmail for your coding agents. A coordination layer with messaging, file leases, and audit trails.",
    description:
      "A complete coordination system for multi-agent workflows. Agents register identities, send/receive GitHub-flavored Markdown messages, search conversation history, and declare advisory file reservations to prevent edit conflicts. Git-backed for full auditability with optional web UI for human oversight.",
    tags: ["MCP", "Agents", "Developer Tools", "Git", "Collaboration", "Flywheel"],
    size: "wide",
    gradient: "from-violet-500/20 via-purple-500/20 to-fuchsia-500/20",
  },
  {
    name: "Beads Viewer",
    kind: "oss",
    badge: "490 stars",
    href: "https://github.com/Dicklesworthstone/beads_viewer",
    short: "Terminal UI for Steve Yegge's Beads system with graph analytics for agent task management.",
    description:
      "Transforms how agents visualize task dependencies using DAG-based analysis. Features nine graph metrics (PageRank, Betweenness, HITS, Critical Path), robot protocol for AI-ready JSON output, and time-travel diffing across git revisions. Built in Go with 60fps rendering via Bubble Tea.",
    tags: ["Go", "TUI", "Task Management", "Graph Analytics", "Agents", "Flywheel"],
    size: "wide",
    gradient: "from-emerald-500/20 via-teal-500/20 to-cyan-500/20",
  },
  {
    name: "Named Tmux Manager",
    kind: "oss",
    badge: "15 stars",
    href: "https://github.com/Dicklesworthstone/ntm",
    short: "Multi-agent tmux orchestration. Spawn and coordinate Claude Code, Codex, and Gemini agents.",
    description:
      "Transform tmux into a multi-agent command center. Spawn named agent panes, broadcast prompts to specific agent types, capture outputs with regex filtering, and manage persistent SSH-compatible sessions. Features real-time dashboard, command palette, and pre/post hooks for automation.",
    tags: ["Go", "Tmux", "Multi-Agent", "Claude Code", "DevTools", "Flywheel"],
    size: "tall",
  },
  {
    name: "Simultaneous Launch Button",
    kind: "oss",
    badge: "20 stars",
    href: "https://github.com/Dicklesworthstone/simultaneous_launch_button",
    short: "Two-person rule for AI agents: peer review before dangerous commands execute.",
    description:
      "Adds safety friction for autonomous agents. Three-tier risk classification (CRITICAL/DANGEROUS/CAUTION), cryptographic command binding with SHA256+HMAC, dynamic quorum based on active agents, and complete audit trails. Integrates with Claude Code hooks and MCP Agent Mail for notifications.",
    tags: ["Go", "Security", "Multi-Agent", "Safety", "Audit", "Flywheel"],
  },
  {
    name: "CASS Memory System",
    kind: "oss",
    badge: "60 stars",
    href: "https://github.com/Dicklesworthstone/cass_memory_system",
    short: "ACE-framework persistent memory for coding agents. Stores procedural, episodic, and semantic knowledge.",
    description:
      "Implements the Autonomous Cognitive Entity framework to give agents human-like memory. Stores procedural knowledge (how-to playbooks), episodic memory (session histories), and semantic facts. Exposes MCP tools so agents can recall context across sessions without re-learning.",
    tags: ["TypeScript", "MCP", "Memory", "ACE Framework", "Agents", "Flywheel"],
  },
  {
    name: "Mindmap Generator",
    kind: "oss",
    badge: "172 stars",
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
    badge: "2,790 stars",
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
    badge: "1,037 stars",
    href: "https://github.com/Dicklesworthstone/swiss_army_llama",
    short: "A high-performance 'Swiss Army Knife' FastAPI service for local LLMs.",
    description:
      "Streamlines complex local LLM operations into a unified API. It handles multi-modal embedding generation, sophisticated semantic search, and grammar-enforced text completions with aggressive caching and RAM disk optimization for maximum efficiency.",
    tags: ["FastAPI", "Local LLM", "Embeddings", "Search"],
  },
  {
    name: "Visual A* Pathfinding",
    kind: "oss",
    badge: "175 stars",
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
    badge: "693 stars",
    href: "https://github.com/Dicklesworthstone/your-source-to-prompt.html",
    short: "Secure, browser-based tool to turn codebases into optimized LLM prompts.",
    description:
      "A single-file HTML tool that runs entirely locally to protect your IP. It allows you to filter, combine, and minify code files from your machine into context-aware prompts for LLMs, streamlining the workflow for AI-assisted development without sending code to a third-party server.",
    tags: ["Developer Tools", "Privacy", "Prompt Engineering"],
  },
  {
    name: "Bulk YouTube Transcriber",
    kind: "oss",
    badge: "618 stars",
    href: "https://github.com/Dicklesworthstone/bulk_transcribe_youtube_videos_from_playlist",
    short: "Convert entire playlists into structured, searchable text with Whisper.",
    description:
      "Automates the ingestion of massive amounts of video content, leveraging GPU-accelerated Whisper models to generate high-fidelity transcripts with timestamps. Includes an interactive HTML reader and NLP processing to turn hours of video into a queryable knowledge base.",
    tags: ["YouTube", "Whisper", "NLP", "Data Mining"],
  },
  {
    name: "Automatic Log Collector",
    kind: "oss",
    badge: "411 stars",
    href: "https://github.com/Dicklesworthstone/automatic_log_collector_and_analyzer",
    short: "Open-source Splunk alternative for efficient multi-server log analysis.",
    description:
      "A cost-effective solution for aggregating and analyzing gigabytes of logs from distributed fleets. It uses aggressive parallelization to pull data, stores it in SQLite/Datasette for instant querying, and provides a lightweight web interface for deep insights without the enterprise price tag.",
    tags: ["DevOps", "Logging", "SQLite", "Automation"],
  },
  {
    name: "Fast Vector Similarity",
    kind: "oss",
    badge: "413 stars",
    href: "https://github.com/Dicklesworthstone/fast_vector_similarity",
    short: "Lightning-fast Rust library for complex vector similarity metrics.",
    description:
      "Delivers robust, high-performance computation of advanced similarity measures like Hoeffding's D and Kendall's Tau. Built in Rust with seamless Python bindings, it's essential for statistical analysis of large-scale embeddings where standard cosine similarity isn't enough.",
    tags: ["Rust", "Python", "Math", "Vector DB"],
  },
  {
    name: "SQLAlchemy Visualizer",
    kind: "oss",
    badge: "282 stars",
    href: "https://github.com/Dicklesworthstone/sqlalchemy_data_model_visualizer",
    short: "Instantly turns SQLAlchemy ORM models into interactive SVG diagrams.",
    description:
      "Eliminates the need to manually diagram database schemas. This utility parses your Python code and generates clear, directed graphs of your data models, making it effortless to visualize and communicate complex database architectures.",
    tags: ["Database", "Visualization", "Python", "ORM"],
  },
  {
    name: "Next.js GitHub Blog",
    kind: "oss",
    badge: "81 stars",
    href: "https://github.com/Dicklesworthstone/nextjs-github-markdown-blog",
    short: "Seamless blogging platform using your GitHub repo as a CMS.",
    description:
      "Transforms a standard GitHub repository of Markdown files into a high-performance, SEO-optimized blog. It combines the developer-friendly workflow of git-based content management with the speed and polish of a modern Next.js 14 application.",
    tags: ["Next.js", "CMS", "Blogging", "React"],
  },
  {
    name: "LLM Tournament",
    kind: "oss",
    badge: "43 stars",
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
    badge: "17 stars",
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
    badge: "89 stars",
    href: "https://github.com/Dicklesworthstone/ultimate_bug_scanner",
    short: "Meta-runner for language-specific bug scanners, tuned for AI coding agents.",
    description:
      "Wraps best‑in‑class static analyzers (ESLint, Ruff, Clippy, golangci-lint, and more) with a consistent JSON interface. Perfect as a pre-commit hook or post-processing step for autonomous agents to catch bugs before they ship.",
    tags: ["Static Analysis", "Agents", "Code Quality", "CI/CD", "Multi-Language", "Flywheel"],
    size: "wide",
  },
  {
    name: "Kissinger Thesis Reader",
    kind: "oss",
    badge: "45 stars",
    href: "https://github.com/Dicklesworthstone/kissinger_undergraduate_thesis",
    short: "A vibe‑coded reader for Henry Kissinger's 400‑page undergraduate thesis.",
    description:
      "Takes a painful scanned PDF and turns it into a clean, phone‑friendly reading experience, with structure that plays nicely with modern models and human readers.",
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
    badge: "14 stars",
    href: "https://github.com/Dicklesworthstone/chat_shared_conversation_to_file",
    short: "Convert ChatGPT, Gemini, and Grok share links to Markdown and HTML.",
    description:
      "CLI tool that extracts AI conversations from share links and saves them as clean, archivable Markdown and static HTML. Preserves fenced code blocks with syntax highlighting, creates deterministic filenames, and supports one-command GitHub Pages deployment. Uses Playwright for reliable extraction.",
    tags: ["Bun", "TypeScript", "CLI", "ChatGPT", "Gemini", "Playwright"],
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
};

export const flywheelTools: FlywheelTool[] = [
  {
    id: "ntm",
    name: "Named Tmux Manager",
    shortName: "NTM",
    href: "https://github.com/Dicklesworthstone/ntm",
    icon: "LayoutGrid",
    color: "from-sky-500 to-blue-600",
    tagline: "Spawn & orchestrate multiple agents",
    connectsTo: ["slb", "mail", "cass"],
    connectionDescriptions: {
      slb: "Routes dangerous commands through safety checks",
      mail: "Agents communicate via mail threads",
      cass: "Session history indexed for search",
    },
  },
  {
    id: "slb",
    name: "Simultaneous Launch Button",
    shortName: "SLB",
    href: "https://github.com/Dicklesworthstone/simultaneous_launch_button",
    icon: "ShieldCheck",
    color: "from-amber-500 to-orange-600",
    tagline: "Peer review for dangerous commands",
    connectsTo: ["mail", "ubs"],
    connectionDescriptions: {
      mail: "Notifications sent to reviewer inboxes",
      ubs: "Pre-flight scans before execution",
    },
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
  },
  {
    id: "ubs",
    name: "Ultimate Bug Scanner",
    shortName: "UBS",
    href: "https://github.com/Dicklesworthstone/ultimate_bug_scanner",
    icon: "Bug",
    color: "from-rose-500 to-red-600",
    tagline: "Multi-language static analysis",
    connectsTo: ["bv", "slb"],
    connectionDescriptions: {
      bv: "Creates issues for discovered bugs",
      slb: "Validates code before risky commits",
    },
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
  },
  {
    id: "cass",
    name: "Coding Agent Session Search",
    shortName: "CASS",
    href: "https://github.com/Dicklesworthstone/coding_agent_session_search",
    icon: "Search",
    color: "from-cyan-500 to-sky-600",
    tagline: "Full-text search across all sessions",
    connectsTo: ["cm", "ntm", "bv"],
    connectionDescriptions: {
      cm: "Indexes stored memories for retrieval",
      ntm: "Searches all managed agent histories",
      bv: "Links search results to related tasks",
    },
  },
];

export const flywheelDescription = {
  title: "The Agentic Coding Tooling Flywheel",
  subtitle: "Seven tools that work together in a self-reinforcing loop",
  description:
    "Each tool in this ecosystem enhances the others. NTM spawns agents that communicate via Mail, which coordinates with Beads for task tracking. SLB adds safety gates, UBS catches bugs before commit, CM provides persistent memory, and CASS lets you search everything. The more you use them together, the more powerful they become.",
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
  source: "YTO" | "FMD" | "GitHub";
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
  kind: "Article" | "Podcast";
  blurb: string;
};

export const mediaItems: MediaItem[] = [
  {
    title: "DeepSeek R1 & The Short Case For Nvidia Stock",
    href: "https://www.bankless.com/podcast/deepseek-r1-the-short-case-for-nvidia-stock-jeffrey-emanuel",
    outlet: "Bankless Podcast",
    kind: "Podcast",
    blurb:
      "In-depth discussion of my viral 12,000-word analysis on Nvidia's competitive vulnerabilities, DeepSeek's efficiency breakthroughs, and the shifting landscape of AI infrastructure. This episode aired January 28, 2025, the day after Nvidia's historic $600B single-day market cap drop.",
  },
  {
    title: "Viral Author of The Short Case for Nvidia Stock",
    href: "https://members.delphidigital.io/media/jeffrey-emanuel-viral-author-of-the-short-case-for-nvidia-stock-cohosted-by-pondering-durian",
    outlet: "Delphi Digital Podcast",
    kind: "Podcast",
    blurb:
      "Tom Shaughnessy and Pondering Durian host an exploration of AI infrastructure disruption, open-source model innovation, and the societal implications of accelerating AGI development. Deep dive into model distillation, scaling laws, and US vs China AI development.",
  },
  {
    title: "Jeffrey Emanuel and the lessons we should all learn from the $2 trillion DeepSeek AI market correction",
    href: "https://diginomica.com/jeffrey-emanuel-and-lessons-we-should-all-learn-2-trillion-deepseek-ai-market-correction",
    outlet: "Diginomica",
    kind: "Article",
    blurb:
      "In-depth interview covering the story behind writing 'The Short Case for Nvidia Stock,' the unexpected viral spread through Chamath Palihapitiya and Naval Ravikant's networks, and broader lessons about AI market dynamics and the Dunning-Kruger effect in tech investing.",
  },
  {
    title: "One Blogger Helped Spark NVIDIA's $600B Stock Collapse",
    href: "https://hardware.slashdot.org/story/25/02/01/2235213/one-blogger-helped-spark-nvidias-600b-stock-collapse",
    outlet: "Slashdot",
    kind: "Article",
    blurb:
      "Coverage of how a 12,000-word blog post written from my Brooklyn apartment contributed to the largest single-day market cap drop in stock market history. Bloomberg's Matt Levine called it 'a candidate for the most impactful short research report ever.'",
  },
  {
    title: "The impact of competition and DeepSeek on Nvidia",
    href: "https://simonwillison.net/2025/Jan/27/deepseek-nvidia/",
    outlet: "Simon Willison's Weblog",
    kind: "Article",
    blurb:
      "Simon Willison's analysis calling my piece 'Long, excellent...capturing the current state of the AI/LLM industry' and noting my 'rare combination of experience in both computer science and investment analysis.'",
  },
  {
    title: "A bear case for Nvidia: hardware competitors, LLM code translation, DeepSeek breakthroughs",
    href: "https://www.techmeme.com/250126/p10",
    outlet: "Techmeme",
    kind: "Article",
    blurb:
      "Featured on Techmeme's front page covering Nvidia's four-part moat (Linux drivers, CUDA lock-in, Mellanox interconnect, R&D flywheel) and the emerging threats to each pillar from competitors and efficiency breakthroughs.",
  },
  {
    title: "CEO Jeff Emanuel Interviewed by CGTN America",
    href: "https://lumera.io/ceo-jeff-emanuel-interviewed-by-cgtn-america/",
    outlet: "CGTN America",
    kind: "Podcast",
    blurb:
      "Television interview discussing Pastel Network's vision for decentralized digital art infrastructure, eliminating intermediaries in art trading, and the future of blockchain-based creative markets.",
  },
  {
    title: "Jeffrey Emanuel Profile",
    href: "https://wikitia.com/wiki/Jeffrey_Emanuel",
    outlet: "Wikitia",
    kind: "Article",
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
    title: "Building a Brain, Not a Calculator: Bio-Inspired Nanochat",
    href: "/writing/bio_inspired_architecture",
    source: "GitHub",
    category: "Frontier Research",
    blurb:
      "A deep technical dive into replacing static Transformer weights with metabolic, fatigue-prone, and evolving biological analogs. Explores presynaptic fatigue, Hebbian fast-weights, and structural plasticity.",
    date: "2025-11-22",
    featured: true,
    gradient: "from-pink-500/20 via-rose-500/20 to-red-500/20",
  },
  {
    title: "11 Ways to Break the Transformer: Model-Guided Research",
    href: "/writing/model_guided_math",
    source: "GitHub",
    category: "Frontier Research",
    blurb:
      "What happens when GPT-5 acts as Principal Investigator? An exploration of 11 exotic architectures including Matrix Exponential Gauge Learning, Tropical Geometry, and p-adic Attention.",
    date: "2025-11-22",
    featured: true,
    gradient: "from-cyan-500/20 via-blue-500/20 to-indigo-500/20",
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
      "Uses a forgotten historical prediction (the wave theory of light and the Poisson Spot) as a lens on evidence, updating priors, and how we reason under massive uncertainty.",
    date: "2025-01-16",
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
    title: "The Lessons of Hermann Grassmann",
    href: "/writing/hermann_grassmann_nature_of_abstractions",
    source: "FMD",
    category: "History of Math",
    blurb:
      "The story of the self-taught genius who invented linear algebra (the wedge product) decades before it was understood. A lesson on how radical abstractions are often rejected by the establishment.",
    date: "2024-06-01",
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