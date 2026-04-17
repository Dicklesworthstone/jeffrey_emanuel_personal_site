/**
 * Slack → Mattermost Migration Jargon Dictionary
 *
 * Terminology covering chat platforms, compliance, infrastructure,
 * and the specific vocabulary of the Phase 1 / Phase 2 / Phase 3 skills.
 */

import type { JargonTerm } from "@/lib/jargon-types";

export type { JargonTerm };

export const jargonDictionary: Record<string, JargonTerm> = {
  mattermost: {
    term: "Mattermost",
    short: "An open-source, self-hosted chat server that speaks the same idioms as Slack.",
    long: "Channels, DMs, threads, reactions, custom emoji, file sharing, slash commands — Mattermost has them all, and it ships official tooling for ingesting Slack's export format. The Team Edition is free. Professional Edition ($10/user/month) adds SAML, guest accounts, and compliance features that Slack reserves for the Business+ tier.",
    analogy: "Postgres is to Oracle as Mattermost is to Slack: it does 90% of what the commercial product does, the 10% it skips is rarely load-bearing, and you own the schema.",
    related: ["mmctl", "mmetl", "team-edition"],
  },
  skill: {
    term: "Agent Skill",
    short: "A bundle of prompts, scripts, and references that teaches a coding agent how to do a specific job.",
    long: "A skill is a directory with a SKILL.md describing its purpose, a set of scripts it can shell out to, references the agent should consult, and an operator library encoding decision logic. Claude Code and Codex both load skills from `~/.claude/skills/` and `~/.codex/skills/`. The agent picks the right skill for a request, loads its context, and drives the scripts on your behalf.",
    analogy: "A runbook a senior engineer wrote, except the engineer is also the one reading and executing it.",
    related: ["claude-code", "codex", "jsm"],
  },
  "claude-code": {
    term: "Claude Code",
    short: "Anthropic's coding agent, available as a CLI or desktop app.",
    long: "Runs locally on your machine, can read/write files, run shell commands, SSH to servers, and — crucially for this migration — load skills. Asks for approval before touching anything destructive. The Pro, Max, Team, and Enterprise plans all include it.",
    related: ["skill", "codex"],
  },
  codex: {
    term: "Codex",
    short: "OpenAI's coding agent, available as a CLI or desktop app.",
    long: "Functionally similar to Claude Code: local execution, skill loading, permission prompts before destructive operations. Requires a ChatGPT Plus / Pro / Business / Edu / Enterprise subscription or an OpenAI API key with Codex access.",
    related: ["skill", "claude-code"],
  },
  jsm: {
    term: "jsm (Jeffrey's Skills)",
    short: "A single-binary Rust CLI for installing, updating, and syncing agent skills.",
    long: "Downloads skills from the jeffreys-skills.md catalog, verifies SHA-256 hashes, drops them into the canonical `~/.claude/skills/` and `~/.codex/skills/` directories, and tracks versions in a local database. `jsm install`, `jsm upgrade`, `jsm pin`, `jsm sync` across machines.",
    analogy: "Homebrew, but for agent skills instead of Unix CLIs.",
    related: ["skill"],
  },
  slackdump: {
    term: "slackdump",
    short: "A Go CLI that pulls messages and files out of Slack using an authenticated account's view.",
    long: "When the official admin-export path isn't available (Free / Pro plans), slackdump logs in as a user or bot token and walks every channel and DM that account can see. It's a partial view — it cannot see private channels the account doesn't belong to — but it's the best tool for Track B migrations.",
    related: ["mmetl", "xoxc-token"],
  },
  mmetl: {
    term: "mmetl",
    short: "The transform tool that converts a Slack export ZIP into Mattermost's bulk-import JSONL.",
    long: "Reads `channels.json`, `users.json`, and per-day message files out of a Slack export, maps users by email, preserves thread structure, and emits a JSONL file plus an `attachments/` directory laid out exactly the way Mattermost's `mmctl import` expects. Linux and macOS only; running it on Windows corrupts the output.",
    why: "Without mmetl the conversion would be thousands of lines of glue code per migration. It's the single most load-bearing Go tool in the pipeline.",
    related: ["mmctl", "bulk-import"],
  },
  mmctl: {
    term: "mmctl",
    short: "Mattermost's official CLI, used here to upload and process the bulk-import ZIP.",
    long: "`mmctl import upload` streams the ZIP to the server, `mmctl import process` kicks off the import job, `mmctl import job show` polls progress. Also used for admin tasks like `mmctl user list`, `mmctl channel users add`, and — for disaster recovery — `mmctl --local` over SSH to bypass network auth entirely.",
    related: ["mmetl", "bulk-import"],
  },
  "bulk-import": {
    term: "Bulk Import",
    short: "Mattermost's native JSONL-based ingestion format.",
    long: "One JSON object per line. Version line first, then emoji, team, channels, users, posts, direct_channels, direct_posts, in that strict order. Thread replies reference their parent's `thread_ts`. The import is idempotent: re-running with the same payload doesn't duplicate posts, which makes delta catch-up and interrupted-cutover recovery possible.",
    why: "Idempotence is what lets a solo operator run a production cutover without fear: if the run is interrupted at 80%, re-running the exact same command finishes the job rather than double-posting everything.",
  },
  "fountain-code": {
    term: "Fail-Closed Gate",
    short: "A readiness check that defaults to blocking if any input is missing or stale.",
    long: "Phase 2's `ready` stage reads the intake report, the staging-rehearsal result, the smoke-test counts, the reconciliation diffs, and the `ROLLBACK_OWNER` env var. If any one is missing, it returns `status: blocked`. The opposite — fail-open — would assume-success in the absence of data, which is exactly the shape of a catastrophic cutover.",
    analogy: "A vault whose default state is locked. Removing a requirement doesn't silently unlock it; you have to explicitly satisfy every single one.",
  },
  "rollback-owner": {
    term: "Rollback Owner",
    short: "A named human with pre-committed authority to abort the cutover.",
    long: "Not a role, not 'whoever is on call', not a team alias. A specific person's name and email, populated into `ROLLBACK_OWNER` before cutover is allowed to start. Phase 2 refuses to run `cutover` without it, on purpose.",
    why: "In a live migration, the worst failure mode is ambiguity about who can pull the trigger. Naming the owner in advance removes that ambiguity at the exact moment it would otherwise cost you.",
  },
  baa: {
    term: "Business Associate Agreement (BAA)",
    short: "A HIPAA-mandated contract that a vendor must sign to handle protected health information on your behalf.",
    long: "In Slack's pricing, a BAA is locked behind the Business+ tier. A 40-person healthcare workspace paying $6k/year on Pro gets quoted $21k/year the moment a customer-contract clause requires a BAA. Self-hosting Mattermost sidesteps this: you are the data custodian, so you sign your own BAA with whatever downstream parties need it.",
    related: ["compliance", "self-hosted"],
  },
  hetzner: {
    term: "Hetzner",
    short: "A German hosting provider with unusually cheap dedicated servers.",
    long: "Hetzner's auction pages rent bare-metal NVMe machines with 64 GB RAM for €50–70/month. The AX42 comfortably serves ~250 Mattermost users; the AX52 handles 1,000. Ordering requires one-time ID verification on the paying human (the one step the agent cannot do for you).",
    related: ["self-hosted"],
  },
  "cloudflare-origin-ca": {
    term: "Cloudflare Origin CA",
    short: "A free, Cloudflare-issued TLS cert valid only for traffic that comes through their proxy.",
    long: "Issued by Cloudflare's internal CA (not a public root), valid for 15 years, and trusted only by Cloudflare's edge. Browsers would reject it if they hit the origin directly — but they never do, because the proxy is always in the way. It eliminates ACME / Let's Encrypt renewal crons for Mattermost origins fronted by Cloudflare.",
    why: "Fifteen years of zero-maintenance TLS for the cost of one API call is a very good deal.",
    related: ["orange-cloud", "self-hosted"],
  },
  "orange-cloud": {
    term: "Orange-Clouded DNS",
    short: "A Cloudflare DNS record whose traffic is intercepted by Cloudflare's proxy.",
    long: "Orange-clouded A records terminate TLS at Cloudflare's edge, get DDoS filtering, and optionally cache static assets. Grey-clouded records (DNS-only) return the origin's IP directly — needed for anything Cloudflare can't proxy, like the Calls plugin's UDP 8443.",
    related: ["cloudflare-origin-ca"],
  },
  "enterprise-grid": {
    term: "Enterprise Grid",
    short: "Slack's top-tier SKU: multiple workspaces federated under one org.",
    long: "Grid admins can request a grid-wide export (one giant ZIP) or per-workspace exports (one ZIP per team). Per-workspace is cleaner because each maps to a Mattermost team. The Phase 1 skill includes a `split-phase1-import.py` helper for the grid-wide case.",
  },
  playwright: {
    term: "Playwright MCP",
    short: "A Model Context Protocol server that gives the agent a real Chromium browser.",
    long: "Used here to drive Slack's admin-export UI (which has no public API), to log in, kick off an export, wait for the email, and download the resulting ZIP. Also used for one-off Mattermost System Console toggles that lack clean API equivalents.",
    related: ["mcp"],
  },
  mcp: {
    term: "Model Context Protocol (MCP)",
    short: "An open protocol that lets LLM agents call into external tools via a uniform interface.",
    long: "Think of an MCP server as a plugin for the agent: it registers tools (functions with typed arguments), the agent can call them, and results flow back as context. The Slack MCP, Playwright MCP, and Mattermost MCP each expose their service's API as agent-callable tools.",
    analogy: "An LSP for LLMs: any agent that speaks MCP can use any MCP server.",
    related: ["playwright", "slack-mcp"],
  },
  "slack-mcp": {
    term: "Slack MCP",
    short: "The MCP server that exposes Slack's API to the agent via a bot (`xoxb-`) token.",
    long: "Lets the agent count messages in a channel, fetch a user's email, or verify the last post in #general byte-for-byte against an imported Mattermost — useful gap-hunting during Phase 1 verification.",
    related: ["mcp"],
  },
  "xoxc-token": {
    term: "Session Token (xoxc / xoxd)",
    short: "Slack's browser-session cookies, extracted from a logged-in tab.",
    long: "When the Slack app's OAuth flow isn't available (Free/Pro plans without an admin app), you can extract a `xoxc-` session token and `xoxd-` session cookie directly from a browser's DevTools → Application → Cookies pane. slackdump uses them to act as your logged-in user, which is the only way to see private DMs on Pro.",
    why: "Not elegant, but it's the difference between migrating your history and silently losing it.",
  },
  "track-a": {
    term: "Track A: Official Admin Export",
    short: "The clean path for Business+ and Enterprise Grid — Slack hands you a complete ZIP.",
    long: "Full workspace content: public channels, private channels, DMs, group DMs, thread structure, reactions, file references. Initiated through Slack admin UI, delivered via email link 1–7 days later. The Phase 1 skill's Playwright automation can drive the UI for you; for recurring delta exports, the SLACK_EXPORT_AUTOMATION flag turns the whole loop into a scheduled agent run.",
    related: ["track-b", "track-c"],
  },
  "track-b": {
    term: "Track B: slackdump-primary",
    short: "The fallback for Free and Pro — scrape what the logged-in account can see.",
    long: "The Phase 1 skill routes you here automatically when SLACK_PLAN_TIER is set to Free or Pro. You get public channels, plus private channels and DMs the authenticated account is a member of. Everything else goes into `unresolved-gaps.md`.",
    related: ["track-a", "track-c"],
  },
  "track-c": {
    term: "Track C: Enterprise Grid Split",
    short: "Grid-wide export split into per-workspace bundles.",
    long: "If Slack hands Grid admins a single giant ZIP covering every workspace, the skill's `split-phase1-import.py` peels it apart into one sub-ZIP per workspace, each of which then flows through the normal per-workspace pipeline.",
    related: ["track-a", "enterprise-grid"],
  },
  sidecar: {
    term: "Sidecar Channel",
    short: "An auto-created archive channel in Mattermost that holds Slack-native artifacts that have no native Mattermost equivalent.",
    long: "Slack canvases land in `slack-canvases-archive` as HTML-attached posts. Lists go to `slack-lists-archive` as JSON. Admin CSVs end up in `slack-export-admin`. Nothing Slack-native gets silently dropped — if Mattermost can't hold it natively, it becomes a sidecar post in one of these channels.",
    why: "Sidecars turn 'unrecoverable' into 'preserved as evidence' for anything that can't be rebuilt.",
  },
  "unresolved-gaps": {
    term: "unresolved-gaps.md",
    short: "The handoff's explicit list of every Slack feature that did NOT migrate.",
    long: "Each entry is classified: `native-importable`, `sidecar-only`, `manual-rebuild`, or `unrecoverable`. The document is ground truth — if something isn't in it, the skill is asserting nothing was lost. Compliance teams read this alongside the evidence pack.",
    why: "Known-unknowns named in advance are cheaper than unknown-unknowns discovered in production.",
  },
  "idempotent-import": {
    term: "Idempotent Import",
    short: "Re-running the import with the same payload does not duplicate posts.",
    long: "Mattermost's bulk-import recognizes previously imported posts by their Slack message IDs and no-ops on duplicates. This is what enables the 'baseline + deltas' pattern — run the full import days in advance, then re-run with each incremental export to catch new messages — and it's the safety net when a cutover import gets interrupted at 80%.",
    related: ["bulk-import"],
  },
  "asymmetric-bet": {
    term: "Asymmetric Bet",
    short: "A decision whose downside is small and recoverable but whose upside is large.",
    long: "Migrating off Slack with this skill pair fits the shape: real Slack keeps working the whole time, the new Mattermost is built on separate hardware, and if anything goes wrong you cancel the Hetzner server and delete the workdir. Cost of failure: a few weeks of server rent. Cost of success: tens of thousands of dollars a year indefinitely.",
    analogy: "Buying a lottery ticket is an asymmetric bet with terrible EV. This one has terrible loss-given-failure and large, near-certain loss-given-success, in your favor.",
  },
  "evidence-pack": {
    term: "Evidence Pack",
    short: "A hash-anchored, machine-readable bundle proving what was exported and what was imported.",
    long: "`manifests[]` with SHA-256s, counts of users / channels / posts / DMs, `known_gaps[]` with dispositions, `secret_scan_findings`, and the full chain from raw Slack ZIP to imported Mattermost. Tar it, encrypt with age or gpg, and it satisfies every 'prove it' question a compliance reviewer will ever ask.",
    why: "Auditors ask three questions: what did you move, who approved it, where's the hash? The pack answers all three without ever needing to re-open the migration.",
  },
  "readiness-gate": {
    term: "Readiness Gate",
    short: "The fail-closed check that gates production cutover.",
    long: "Reads the intake report, render-config validation, live-stack probes, the newest staging-summary, smoke-test counts, reconciliation diffs, restore-drill result (if done), and `ROLLBACK_OWNER`. Emits `cutover-readiness.json` with `status: ready` or `status: blocked`. No 'yellow' state — it's a boolean. Blocked stays blocked until every input is green.",
    related: ["rollback-owner"],
  },
  esr: {
    term: "ESR (Enterprise-Scale Release)",
    short: "Mattermost's stable release track, upgraded less frequently than main.",
    long: "Instead of every minor release, ESR receives security backports for a long support window and one major bump a year. For small self-hosted deployments driven by the Phase 3 maintenance skill, `upgrade.policy: esr` is the sane default — fewer upgrades, each one well-tested.",
  },
  "weekly-sweep": {
    term: "Weekly Sweep",
    short: "The Phase 3 maintenance combo: health → update-os → backup → db-health.",
    long: "Runs unattended off-hours, typically Saturday night. The agent SSHes to the target, runs each stage, writes a summary report, and optionally posts a red-status alert to a Mattermost channel. The operator's attention budget is one minute on Monday morning reading the summary.",
    why: "The whole point of self-hosting is to make ongoing maintenance cheap. This is what cheap looks like when an agent is doing it.",
  },
  "auto-rollback": {
    term: "Auto-Rollback Upgrade",
    short: "A Mattermost version bump that reverts itself on failure.",
    long: "The Phase 3 `update-mattermost` stage takes a pre-upgrade `pg_dump`, stops Mattermost, installs the target version, polls `/api/v4/system/ping` for 3 minutes, and — if the new version doesn't come up — stops the service, downgrades the package, drops and recreates the database, and streams the dump back in. Total downtime on failure: 2–6 minutes. Data loss: zero.",
    why: "It's the loop that lets a solo operator run production upgrades without a pager rotation.",
  },
};

/**
 * Look up a jargon term by key (lowercase with hyphens).
 */
export function getJargon(key: string): JargonTerm | undefined {
  const normalizedKey = key.toLowerCase().replace(/[\s_]+/g, "-");
  return jargonDictionary[normalizedKey];
}
