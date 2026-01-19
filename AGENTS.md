# AGENTS.md — Jeffrey Emanuel Personal Site

## RULE NUMBER 1 (NEVER EVER EVER FORGET THIS RULE!!!)

**YOU ARE NEVER ALLOWED TO DELETE A FILE WITHOUT EXPRESS PERMISSION FROM ME OR A DIRECT COMMAND FROM ME.**

Even a new file that you yourself created, such as a test code file. You have a horrible track record of deleting critically important files or otherwise throwing away tons of expensive work that I then need to pay to reproduce.

As a result, you have permanently lost any and all rights to determine that a file or folder should be deleted. You must **ALWAYS** ask and *receive* clear, written permission from me before ever even thinking of deleting a file or folder of any kind!

---

## IRREVERSIBLE GIT & FILESYSTEM ACTIONS — DO-NOT-EVER BREAK GLASS

1. **Absolutely forbidden commands:** `git reset --hard`, `git clean -fd`, `rm -rf`, or any command that can delete or overwrite code/data must never be run unless the user explicitly provides the exact command and states, in the same message, that they understand and want the irreversible consequences.

2. **No guessing:** If there is any uncertainty about what a command might delete or overwrite, stop immediately and ask the user for specific approval. "I think it's safe" is never acceptable.

3. **Safer alternatives first:** When cleanup or rollbacks are needed, request permission to use non-destructive options (`git status`, `git diff`, `git stash`, copying to backups) before ever considering a destructive command.

4. **Mandatory explicit plan:** Even after explicit user authorization, restate the command verbatim, list exactly what will be affected, and wait for a confirmation that your understanding is correct. Only then may you execute it—if anything remains ambiguous, refuse and escalate.

5. **Document the confirmation:** When running any approved destructive command, record (in the session notes / final response) the exact user text that authorized it, the command actually run, and the execution time. If that record is absent, the operation did not happen.

---

## Project Overview

This is Jeffrey Emanuel's personal website — a Next.js 16 site showcasing his work, projects, writing, and the Flywheel ecosystem of AI coding tools.

**Repository:** https://github.com/Dicklesworthstone/jeffrey_emanuel_personal_site

**Live Site:** Deployed on Vercel

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, TypeScript (strict mode) |
| Styling | Tailwind CSS 4 |
| Animations | framer-motion, GSAP |
| 3D Graphics | Three.js, @react-three/fiber, @react-three/drei |
| Icons | lucide-react |
| Search | Fuse.js (client-side fuzzy search) |
| Markdown | gray-matter, react-markdown, rehype, remark |
| Math | KaTeX for LaTeX rendering |
| Testing | Playwright (E2E) |
| Package Manager | **bun** (NEVER npm, yarn, or pnpm) |
| Deployment | Vercel |

---

## Package Manager — BUN ONLY

We **only** use `bun` in this project. NEVER use `npm`, `yarn`, or `pnpm`.

```bash
# Install dependencies
bun install

# Run dev server
bun dev

# Build for production
bun run build

# Run linting
bun lint

# Run type checking
bun tsc --noEmit
```

Dependencies are managed **exclusively** via `package.json` + `bun.lock`. Do **not** introduce `package-lock.json`, `yarn.lock`, or any other lockfiles.

---

## Code Editing Discipline

**NEVER** run a script that processes/changes code files in this repo. No "code mods" you just invented, no giant regex-based `sed` one-liners, no auto-refactor scripts that touch large parts of the tree.

That sort of brittle, regex-based stuff is always a huge disaster and creates far more problems than it ever solves.

* If many changes are needed but they're **mechanical**, use several subagents in parallel to make the edits, but still apply them **manually** and review diffs.
* If changes are **subtle or complex**, you must methodically do them yourself, carefully, file by file.

---

## Backwards Compatibility & File Sprawl

We do **not** care about backwards compatibility — we want the cleanest possible architecture with **zero tech debt**:

* Do **not** create "compatibility shims".
* Do **not** keep old APIs around just in case. Migrate callers and delete the old API (subject to the no-deletion rule for files; code removal inside a file is fine).

**AVOID** uncontrolled proliferation of code files:

* If you want to change something or add a feature, you MUST revise the **existing** code file in place.
* You may NEVER create files like `componentV2.tsx`, `componentImproved.tsx`, `componentNew.tsx`, etc.
* New code files are reserved for **genuinely new domains** that make no sense to fold into any existing module.
* The bar for adding a new file should be **incredibly high**.

---

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage
│   ├── about/             # About page
│   ├── projects/          # Projects showcase
│   ├── writing/           # Blog/essays (markdown-driven)
│   ├── consulting/        # Consulting services
│   ├── media/             # Press & media appearances
│   └── contact/           # Contact page
├── components/            # React components
│   ├── hero.tsx          # Homepage hero with 3D scene
│   ├── flywheel-*.tsx    # Flywheel ecosystem visualization
│   ├── command-palette.tsx # Cmd+K search interface
│   ├── site-header.tsx   # Navigation header
│   └── ...
├── lib/                   # Utilities and data
│   ├── content.ts        # Site content (projects, threads, etc.)
│   ├── constants.ts      # Site configuration
│   ├── utils.ts          # Helper functions
│   └── mdx.ts            # Markdown processing
├── content/              # Markdown content files
│   └── writing/          # Blog posts in markdown
├── public/               # Static assets
│   └── images/           # Images, favicons
├── hooks/                # Custom React hooks
└── .beads/               # Issue tracking (br)
```

---

## Key Components & Patterns

### Three.js 3D Scene

The homepage features a 3D visualization using Three.js + React Three Fiber. Key considerations:

* **Performance:** The scene must respect `prefers-reduced-motion`. Mobile devices get reduced quality.
* **Error Boundaries:** The 3D scene has error boundaries to prevent crashes from breaking the page.
* **Lazy Loading:** Heavy 3D components are dynamically imported.

```tsx
// Pattern for 3D components
import dynamic from 'next/dynamic';

const HeroScene = dynamic(() => import('@/components/hero-scene'), {
  ssr: false,
  loading: () => <div className="hero-placeholder" />
});
```

### Content Management

All site content lives in `lib/content.ts`:

* **Projects:** Array of project objects with title, description, tags, links
* **Threads:** X/Twitter posts showcased on homepage
* **Timeline:** Career/experience timeline
* **Site Config:** Metadata, social links, etc.

When adding content, edit `lib/content.ts` directly — do NOT create separate data files.

### Markdown Processing

Blog posts in `/content/writing/` use frontmatter + markdown:

```markdown
---
title: "Post Title"
date: "2025-01-15"
description: "Brief description"
tags: ["ai", "coding"]
---

Post content with **markdown** support...
```

The `lib/mdx.ts` module handles parsing with gray-matter, rehype, and remark plugins.

### Command Palette (Search)

The site has a Cmd+K command palette using Fuse.js for fuzzy search:

* Searches across projects, writing, and navigation
* Implemented in `components/command-palette.tsx`
* Uses keyboard shortcuts and focus management

---

## Static Analysis & Type Safety

**CRITICAL:** After any substantive changes to TypeScript/React code, verify no lint or type errors:

```bash
# Type-check (no emit)
bun tsc --noEmit

# Lint
bun lint
```

If there are errors:
* Read enough context around each one to understand the *real* problem.
* Fix issues at the root cause rather than just silencing rules.
* Re-run until clean.

---

## Testing

We use **Playwright** for end-to-end testing:

```bash
# Install Playwright browsers (one-time)
bunx playwright install

# Run E2E tests
bunx playwright test
```

Test files live in the project root or a `tests/` directory. Tests should:
* Cover critical user flows (navigation, search, 3D scene loading)
* Use realistic scenarios, not mocked data
* Verify the site works across viewport sizes

---

## Deployment (Vercel)

The site deploys automatically to Vercel on push to `main`.

**Before pushing:**
1. Ensure `bun run build` succeeds locally
2. Check for TypeScript errors with `bun tsc --noEmit`
3. Verify the dev server works: `bun dev`

**Vercel Configuration:**
* Framework: Next.js
* Build Command: `bun run build`
* Install Command: `bun install`
* Output Directory: `.next`

---

## Issue Tracking with br (beads_rust)

**IMPORTANT**: This project uses **br (beads_rust)** for ALL issue tracking. Do NOT use markdown TODOs, task lists, or other tracking methods.

**Note:** `br` is non-invasive and never executes git commands. After syncing, you must manually commit the `.beads/` directory.

**CRITICAL GIT RULE**: The `.beads/` directory contains issue tracking state and **MUST ALWAYS BE COMMITTED** with code changes. When committing code changes, you MUST also commit the corresponding `.beads/` files in the same commit to keep issue state synchronized with code state.

**NEVER FORGET THIS**: The ONLY allowed way to interact with beads is via the `br` command. DO NOT TRY TO DIRECTLY READ, CREATE, OR MODIFY BEADS BY MODIFYING JSON OR JSONL FILES. ONLY VIA `br`!

### Why br?

* Dependency-aware: Track blockers and relationships between issues.
* Git-friendly: Exports to JSONL for version control.
* Agent-optimized: JSON output, ready work detection, discovered-from links.
* Prevents duplicate tracking systems and confusion.

### Quick Start

```bash
# Check for ready work
br ready --json

# Create new issues
br create "Issue title" -t bug|feature|task -p 0-4 --json
br create "Issue title" -p 1 --deps discovered-from:br-123 --json

# Claim and update
br update br-42 --status in_progress --json
br update br-42 --priority 1 --json

# Complete work
br close br-42 --reason "Completed" --json

# View statistics
br stats
```

### Issue Types

* `bug` - Something broken
* `feature` - New functionality
* `task` - Work item (tests, docs, refactoring)
* `epic` - Large feature with subtasks
* `chore` - Maintenance (dependencies, tooling)

### Priorities

* `0` - Critical (security, broken builds)
* `1` - High (major features, important bugs)
* `2` - Medium (default, nice-to-have)
* `3` - Low (polish, optimization)
* `4` - Backlog (future ideas)

### Workflow for AI Agents

1. **Check ready work**: `br ready` shows unblocked issues.
2. **Claim your task**: `br update <id> --status in_progress`.
3. **Work on it**: Implement, test, document.
4. **Discover new work?** Create linked issue:
   * `br create "Found bug" -p 1 --deps discovered-from:<parent-id>`.
5. **Complete**: `br close <id> --reason "Done"`.
6. **Sync**: `br sync --flush-only` then manually `git add .beads/ && git commit`.

### Important Rules

* Use br for ALL task tracking
* Always use `--json` flag for programmatic use
* Link discovered work with `discovered-from` dependencies
* Check `br ready` before asking "what should I work on?"
* Do NOT create markdown TODO lists
* Do NOT use external issue trackers
* Do NOT duplicate tracking systems

---

## Using bv as an AI sidecar

`bv` is a fast terminal UI for Beads projects. For agents, it's a graph sidecar that provides dependency-aware outputs.

**IMPORTANT: As an agent, you must ONLY use bv with the robot flags, otherwise you'll get stuck in the interactive TUI!**

```bash
bv --robot-help          # Shows all AI-facing commands
bv --robot-insights      # JSON graph metrics (PageRank, critical path, cycles)
bv --robot-plan          # JSON execution plan with parallel tracks
bv --robot-priority      # JSON priority recommendations with reasoning
bv --robot-recipes       # List recipes (actionable, blocked, etc.)
```

---

## ast-grep vs ripgrep

**Use `ast-grep` when structure matters.** It parses code and matches AST nodes, so results ignore comments/strings, understand syntax, and can safely rewrite code.

**Use `ripgrep` when text is enough.** It's the fastest way to grep literals/regex across files.

**Rule of thumb:**
* Need correctness or you'll **apply changes** → start with `ast-grep`
* Need raw speed or just **hunting text** → start with `rg`

```bash
# Find structured code (ignores comments/strings)
ast-grep run -l TypeScript -p 'import $X from "$P"'

# Codemod
ast-grep run -l JavaScript -p 'var $A = $B' -r 'let $A = $B' -U

# Quick textual hunt
rg -n 'console\.log\(' -t ts
```

---

## UBS Quick Reference

UBS (Ultimate Bug Scanner) flags likely bugs before they become problems.

**Golden Rule:** `ubs <changed-files>` before every commit. Exit 0 = safe. Exit >0 = fix & re-run.

```bash
ubs file.ts file2.ts                    # Specific files (< 1s)
ubs $(git diff --name-only --cached)    # Staged files
ubs --only=ts,tsx components/           # Language filter
ubs .                                   # Whole project
```

**Output Format:**
```text
⚠️  Category (N errors)
    file.ts:42:5 – Issue description
    💡 Suggested fix
Exit code: 1
```

**Fix Workflow:**
1. Read finding → category + fix suggestion
2. Navigate `file:line:col` → view context
3. Verify real issue (not false positive)
4. Fix root cause (not symptom)
5. Re-run `ubs <file>` → exit 0
6. Commit

---

## cass — Search Agent History

`cass` indexes conversations from Claude Code, Codex, Cursor, and more into a searchable index. Before solving a problem from scratch, check if any agent already solved something similar.

**NEVER run bare `cass` — it launches an interactive TUI. Always use `--robot` or `--json`.**

```bash
# Check index health
cass health

# Search across all agent histories
cass search "Three.js performance" --robot --limit 5

# View a specific result
cass view /path/to/session.jsonl -n 42 --json

# Feature discovery
cass capabilities --json
```

---

## Common Tasks

### Adding a New Project

Edit `lib/content.ts` and add to the `projects` array:

```typescript
{
  title: "Project Name",
  description: "Brief description",
  href: "https://github.com/...",
  tags: ["typescript", "ai"],
  kind: "oss", // or "product", "research", "flywheel"
  stars: 123,  // optional GitHub stars
}
```

### Adding a Blog Post

1. Create `content/writing/post-slug.md` with frontmatter
2. The post will automatically appear in the writing section

### Updating the Flywheel Visualization

The flywheel tools are defined in `lib/content.ts` under `flywheelTools`. Edit there to add/modify tools.

### Adding a New Page

1. Create `app/new-page/page.tsx`
2. Add navigation link in `components/site-header.tsx`
3. Add to search index in `components/command-palette.tsx`

---

## Performance Considerations

### Core Web Vitals

* **LCP:** Hero image should have `priority` prop, use blur placeholder
* **CLS:** All images need explicit width/height
* **INP:** Avoid blocking the main thread, especially in 3D scene

### Three.js Optimization

* Reduce geometry complexity on mobile
* Cap device pixel ratio at 2
* Respect `prefers-reduced-motion`
* Use `useFrame` carefully — avoid expensive computations every frame

### Bundle Size

* Use dynamic imports for heavy components (Three.js, syntax highlighter)
* Analyze with `ANALYZE=true bun run build` (if configured)
* Watch for large dependencies being imported unnecessarily

---

## Accessibility

* All interactive elements need visible focus states
* Skip link at top of page for keyboard navigation
* Images need meaningful alt text (or `alt=""` for decorative)
* Respect `prefers-reduced-motion` for all animations
* Maintain proper heading hierarchy (h1 > h2 > h3)

---

## Git Workflow

1. Make changes
2. Run `bun tsc --noEmit` and `bun lint`
3. Run `ubs` on changed files
4. Update beads: `br close <id>` for completed work
5. Run `br sync --flush-only` to export beads to JSONL
6. Commit code AND `.beads/` changes together: `git add . && git commit`
7. Push to trigger Vercel deployment

---

## Environment Variables

This project has minimal env vars. If any are needed, they go in `.env.local` (never committed).

Currently the site is mostly static with no external API dependencies for core functionality.

---

## Important Files

| File | Purpose |
|------|---------|
| `lib/content.ts` | All site content (projects, timeline, threads) |
| `lib/constants.ts` | Site configuration and metadata |
| `components/hero.tsx` | Homepage hero with 3D scene |
| `components/command-palette.tsx` | Cmd+K search interface |
| `app/layout.tsx` | Root layout with metadata |
| `tailwind.config.ts` | Tailwind configuration |
| `next.config.mjs` | Next.js configuration |
