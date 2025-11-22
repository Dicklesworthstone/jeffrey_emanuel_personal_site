export const siteConfig = {
  name: "Jeffrey Emanuel",
  title: "Jeffrey Emanuel – Lumera, SmartEdgar, Agents & Markets",
  description:
    "Founder & CEO of Lumera Network. Building agent-first infrastructure and research tools: SmartEdgar, MCP Agent Mail, Ultimate Bug Scanner, and more.",
  email: "jeffreyemanuel@gmail.com",
  location: "Westchester, New York",
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
    name: "LLM-Aided OCR",
    kind: "oss",
    badge: "2.8K stars",
    href: "https://github.com/Dicklesworthstone/llm_aided_ocr",
    short: "Enhances Tesseract OCR output for scanned PDFs using LLM corrections.",
    description:
      "An advanced system that significantly improves OCR quality by leveraging large language models to convert raw OCR text into accurate, well-formatted documents. Supports local and cloud-based LLMs, includes smart text chunking, markdown formatting, async processing, and quality assessment.",
    tags: ["OCR", "Tesseract", "LLMs", "PDF", "NLP"],
  },
  {
    name: "Swiss Army Llama",
    kind: "oss",
    badge: "1K stars",
    href: "https://github.com/Dicklesworthstone/swiss_army_llama",
    short: "FastAPI service for semantic text search using embeddings.",
    description:
      "Swiss Army Llama is a FastAPI-based service enabling semantic text search through precomputed embeddings and sophisticated similarity calculations. It supports multiple file formats via textract, includes audio transcription with Whisper, and offers advanced semantic search using FAISS and specialized similarity measures.",
    tags: ["FastAPI", "Embeddings", "Semantic Search", "LLMs", "Vector Similarity"],
  },
  {
    name: "MCP Agent Mail",
    kind: "oss",
    badge: "756 stars",
    href: "https://github.com/Dicklesworthstone/mcp_agent_mail",
    short: "Mail‑like coordination layer for coding agents.",
    description:
      "Provides inboxes, search, threads, and advisory file leases so coding agents and humans can coordinate without trampling edits. Git‑backed so everything is auditable.",
    tags: ["MCP", "Agents", "Developer Tools", "Git", "Collaboration"],
  },
  {
    name: "Your Source to Prompt",
    kind: "oss",
    badge: "679 stars",
    href: "https://github.com/Dicklesworthstone/your-source-to-prompt.html",
    short: "Convert code projects into LLM prompts securely offline.",
    description:
      "A single HTML file providing a browser-based GUI for selecting and combining code files into structured prompts for large language models. The tool runs entirely locally using the File System Access API, ensuring complete privacy while offering preset management, file filtering, and context awareness.",
    tags: ["LLMs", "Prompts", "Developer Tools", "Privacy", "Browser"],
  },
  {
    name: "Bulk YouTube Transcriber",
    kind: "oss",
    badge: "611 stars",
    href: "https://github.com/Dicklesworthstone/bulk_transcribe_youtube_videos_from_playlist",
    short: "Transcribe YouTube playlists using Whisper speech-to-text.",
    description:
      "This Python tool automates transcription of YouTube videos and playlists using OpenAI's Whisper model with optional GPU acceleration via CUDA. It generates transcripts in multiple formats and includes an interactive HTML reader for formatted viewing with customizable display options.",
    tags: ["YouTube", "Whisper", "Transcription", "Audio-to-Text", "Python"],
  },
  {
    name: "Claude Code Agent Farm",
    kind: "oss",
    badge: "574 stars",
    href: "https://github.com/Dicklesworthstone/claude_code_agent_farm",
    short: "Orchestrate multiple Claude Code agents in parallel for automated codebase improvements.",
    description:
      "A powerful orchestration framework that runs multiple Claude Code sessions simultaneously to systematically enhance codebases. Supports 34 technology stacks with features including parallel processing, agent coordination, smart monitoring, auto-recovery, and context management for large-scale code improvements.",
    tags: ["Claude AI", "Code Generation", "Automation", "Parallel Processing", "Multi-Agent"],
  },
  {
    name: "Automatic Log Collector",
    kind: "oss",
    badge: "411 stars",
    href: "https://github.com/Dicklesworthstone/automatic_log_collector_and_analyzer",
    short: "Collect and analyze logs from remote machines effortlessly.",
    description:
      "This Python application automates downloading and parsing log files from remote servers, storing them in SQLite, and exposing results via a web interface. Originally designed for blockchain logs, it's adaptable to any standard format and handles gigabytes of data from dozens of machines efficiently.",
    tags: ["Logging", "DevOps", "SQLite", "Web Interface", "Automation"],
  },
  {
    name: "Fast Vector Similarity",
    kind: "oss",
    badge: "408 stars",
    href: "https://github.com/Dicklesworthstone/fast_vector_similarity",
    short: "High-performance Rust library for vector similarity computation.",
    description:
      "A Rust-based tool designed to efficiently compute multiple similarity measures between vectors, including Spearman's correlation, Kendall's Tau, and distance correlation. It provides Python bindings for seamless integration and includes bootstrapping functionality for robust statistical analysis using parallel processing.",
    tags: ["Vector Similarity", "Statistics", "Rust", "Python Bindings", "Performance"],
  },
  {
    name: "SQLAlchemy Data Model Visualizer",
    kind: "oss",
    badge: "281 stars",
    href: "https://github.com/Dicklesworthstone/sqlalchemy_data_model_visualizer",
    short: "Convert SQLAlchemy models to visual SVG diagrams.",
    description:
      "A Python utility that automatically generates visual representations of SQLAlchemy ORM models. The tool converts database schemas into directed graphs rendered as SVG files, making it easier to understand table relationships and database architecture at a glance.",
    tags: ["SQLAlchemy", "Visualization", "Database", "Python", "SVG"],
  },
  {
    name: "Visual A* Pathfinding",
    kind: "oss",
    badge: "177 stars",
    href: "https://github.com/Dicklesworthstone/visual_astar_python",
    short: "Animated maze generation and A* pathfinding visualization.",
    description:
      "A high-performance implementation of the A* pathfinding algorithm with 15+ maze generation techniques. The system creates visually striking animated demonstrations showing how pathfinding algorithms navigate through algorithmically-generated mazes, with support for MP4 video output and high-resolution rendering.",
    tags: ["A*", "Pathfinding", "Visualization", "Algorithms", "Python"],
  },
  {
    name: "Ultimate MCP Client",
    kind: "oss",
    badge: "139 stars",
    href: "https://github.com/Dicklesworthstone/ultimate_mcp_client",
    short: "Comprehensive async client for Model Context Protocol with dual Web UI and CLI.",
    description:
      "A feature-rich asynchronous client for the Model Context Protocol (MCP) that bridges AI models like Claude with external tools and data sources. Offers dual interfaces (modern Web UI and interactive CLI), advanced state management with branching conversations, intelligent server discovery, and built-in observability via OpenTelemetry.",
    tags: ["MCP", "Claude Integration", "Async Python", "Web UI", "CLI"],
  },
  {
    name: "Ultimate Bug Scanner",
    kind: "oss",
    badge: "28 stars",
    href: "https://github.com/Dicklesworthstone/ultimate_bug_scanner",
    short: "Meta-runner for language-specific bug scanners, tuned for AI coding agents.",
    description:
      "Wraps best‑in‑class static analyzers and exposes a consistent JSON interface. Ideal as a pre‑commit or as a post‑processing step for autonomous coding agents.",
    tags: ["Static Analysis", "Agents", "Code Quality", "CI/CD", "Multi-Language"],
  },
  {
    name: "Mindmap Generator",
    kind: "oss",
    badge: "127 stars",
    href: "https://github.com/Dicklesworthstone/mindmap-generator",
    short: "Generates intelligent, hierarchical mindmaps from documents using LLMs.",
    description:
      "An intelligent document analysis tool that leverages LLMs to create comprehensive mindmaps from text documents. Adapts to different document types, creates multi-level hierarchical representations, supports multiple LLM providers (OpenAI, Anthropic, DeepSeek, Google), and outputs in Mermaid, HTML, and Markdown formats.",
    tags: ["LLMs", "Mindmaps", "Document Analysis", "NLP", "Visualization"],
  },
  {
    name: "LLM Docs",
    kind: "oss",
    badge: "11 stars",
    href: "https://github.com/Dicklesworthstone/llm_docs",
    short: "Pipeline that ingests and distills Python library docs into LLM‑friendly bundles.",
    description:
      "Automatically discovers, scrapes, and compresses Python docs into high‑signal corpora that can be plugged into toolchains, retrieval systems, or vendor‑specific knowledge formats.",
    tags: ["Documentation", "Python", "LLMs", "Pipeline", "Knowledge"],
  },
  {
    name: "Next.js GitHub Markdown Blog",
    kind: "oss",
    badge: "81 stars",
    href: "https://github.com/Dicklesworthstone/nextjs-github-markdown-blog",
    short: "NextJS blogging system using GitHub Repo as CMS.",
    description:
      "A modern blogging platform leveraging GitHub as a content management system. This project transforms Markdown files stored in a GitHub repository into a beautiful, responsive blog with minimal configuration. It includes static site generation, SEO optimization, and customizable design through Tailwind CSS.",
    tags: ["Next.js", "Markdown", "CMS", "GitHub", "Blogging"],
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
    name: "LLM Tournament",
    kind: "oss",
    badge: "25 stars",
    href: "https://github.com/Dicklesworthstone/llm-tournament",
    short: "Automated tournament where multiple LLMs compete and refine coding solutions.",
    description:
      "This project implements an automated coding tournament featuring multiple advanced LLMs that collaboratively compete and iteratively refine solutions across multiple rounds. It harnesses collective intelligence through continual peer feedback and code synthesis, tracking comprehensive performance metrics including complexity, efficiency, and robustness indicators.",
    tags: ["LLM Agents", "Code Generation", "AI Collaboration", "Competition"],
  },
  {
    name: "Anti-Alzheimer's Flasher",
    kind: "oss",
    badge: "22 stars",
    href: "https://github.com/Dicklesworthstone/anti_alzheimers_flasher",
    short: "Web app exploring 40Hz light and sound stimulation therapy.",
    description:
      "An experimental web-based application exploring potential therapeutic benefits of 40Hz light and sound stimulation for Alzheimer's disease management. The tool delivers immersive therapy sessions with educational content about the scientific research underlying this approach, with responsive design supporting mobile devices.",
    tags: ["Healthcare", "Therapy", "Wellness", "40Hz", "Web"],
  },
  {
    name: "GitHub Repo Stars Analyzer",
    kind: "oss",
    badge: "17 stars",
    href: "https://github.com/Dicklesworthstone/most-influential-github-repo-stars",
    short: "Analyzes influential users who have starred or forked GitHub repos by importance score.",
    description:
      "A tool that examines stargazers and forkers to calculate an influencer importance score based on GitHub activity metrics. Features SQLite caching, API rate limit handling, and custom GitHub API key support.",
    tags: ["GitHub", "Analytics", "Open Source", "Data Analysis"],
  },
  {
    name: "PPP Loan Fraud Analysis",
    kind: "oss",
    badge: "13 stars",
    href: "https://github.com/Dicklesworthstone/ppp_loan_fraud_analysis",
    short: "Analyzes PPP loan data to detect fraud using machine learning and statistical methods.",
    description:
      "A Python-based data analysis tool employing a three-step fraud detection process: risk scoring using heuristics, sorting by risk, and statistical/ML analysis. Uses XGBoost and advanced techniques to uncover patterns in PPP loan fraud.",
    tags: ["Fraud Detection", "Data Analysis", "Machine Learning", "XGBoost"],
  },
  {
    name: "ACIP: AI Cognitive Inoculation Protocol",
    kind: "oss",
    badge: "7 stars",
    href: "https://github.com/Dicklesworthstone/acip",
    short: "Security framework enhancing LLM resilience against prompt injection attacks.",
    description:
      "ACIP is an engineered defense mechanism that inoculates large language models through detailed guidance and examples of malicious prompt strategies. It combines directive frameworks with real-world injection examples to help models detect and neutralize sophisticated attacks leveraging semantic nuance, psychological manipulation, and obfuscation techniques.",
    tags: ["Prompt Injection", "LLM Security", "AI Safety", "Prompt Engineering"],
  },
  {
    name: "Multivariate Normality Testing",
    kind: "oss",
    badge: "3 stars",
    href: "https://github.com/Dicklesworthstone/multivariate_normality_testing",
    short: "Interactive web app testing multivariate normality via 3D projections.",
    description:
      "This application implements a novel approach to multivariate normality testing using random 3D projections. It examines whether high-dimensional data is normally distributed by analyzing ellipsoid fit errors across multiple random projections, providing both statistical tests and interactive 3D visualizations.",
    tags: ["Statistics", "3D Projections", "Data Visualization", "Linear Algebra"],
  },
  {
    name: "Letter Learning Game",
    kind: "oss",
    badge: "Educational",
    href: "https://github.com/Dicklesworthstone/letter_learning_game",
    short: "Educational game helping children learn the alphabet through sound and drawing.",
    description:
      "A browser-based learning tool with three core modes: Find Letters, Word Builder, and Tracing Practice. Features adaptive difficulty tracking, phonics instruction, mini-games, achievement systems, and local data persistence with no backend required.",
    tags: ["Education", "Children", "Game", "Alphabet", "Learning"],
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
    title: "Hoeffding's D: A Statistical Measure Explained",
    href: "https://github.com/Dicklesworthstone/hoeffdings_d_explainer",
    source: "GitHub",
    category: "Statistics",
    blurb:
      "Educational guide comparing Hoeffding's D to Pearson's correlation and Kendall's Tau, with intuitive explanations and Python implementation.",
  },
  {
    title: "Lamport's Bakery Algorithm for Concurrent Locking",
    href: "https://github.com/Dicklesworthstone/bakery_algorithm",
    source: "GitHub",
    category: "Algorithms",
    blurb:
      "Python implementation demonstrating mutual exclusion in multi-threaded environments using Lamport's classic concurrency algorithm.",
  },
  {
    title: "LLM Introspective Compression and Metacognition",
    href: "https://github.com/Dicklesworthstone/llm_introspective_compression_and_metacognition",
    source: "GitHub",
    category: "AI Research",
    blurb:
      "Novel approach enabling transformers to save, compress, and manipulate internal thought states for reasoning backtracking and metacognitive control.",
  },
  {
    title: "Multi-Round LLM Coding Tournament",
    href: "https://github.com/Dicklesworthstone/llm_multi_round_coding_tournament",
    source: "GitHub",
    category: "AI Research",
    blurb:
      "Competitive framework where multiple LLMs iteratively refine coding solutions by reviewing and learning from each other's approaches.",
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
    title: "Acting as Claude's Research Helper in AI",
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
