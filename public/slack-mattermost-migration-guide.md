# A Comprehensive Guide to Migrating From Slack to Mattermost With Claude Code / Codex

This guide walks a Slack workspace admin through an end-to-end migration to a self-hosted Mattermost server, driven by two paired Claude Code / Codex skills:

- **`slack-migration-to-mattermost-phase-1-extraction`** runs on your Mac, Windows, or Linux workstation. It pulls everything out of Slack (public and private channels, DMs, files, emoji, canvases, lists, admin audit CSVs, Workflow Builder JSON) and transforms it into a hash-stamped `mattermost-bulk-import.zip` plus a machine-readable `handoff.json`.
- **`slack-migration-to-mattermost-phase-2-setup-and-import`** runs from the same workstation over SSH to an Ubuntu server at Hetzner, OVH, or Contabo. It provisions Mattermost behind Cloudflare and Nginx, validates the Phase 1 bundle, rehearses the import on a staging target, computes a fail-closed readiness gate, and executes the production cutover with explicit rollback.

The skills automate almost everything, but there are human decisions along the way: what date range to export, which channels to sidecar rather than import, whether to bind PostgreSQL locally or put it on Supabase, who is the rollback owner, and so on. This guide explains where each decision lives in the pipeline and how to make it.

The three skill catalog pages (each has the verbatim `SKILL.md` the agent loads, plus a live visualization of the flow and the changelog):

- https://jeffreys-skills.md/skills/slack-migration-to-mattermost-phase-1-extraction
- https://jeffreys-skills.md/skills/slack-migration-to-mattermost-phase-2-setup-and-import
- https://jeffreys-skills.md/skills/slack-migration-to-mattermost-phase-3-ongoing-mattermost-maintenance

Heads up: those URLs return a 404 unless you are signed in to a `jeffreys-skills.md` account with an active subscription. If you hit a 404, sign up (or log in) at `jeffreys-skills.md/dashboard` first and reload. That is the same account the `jsm` CLI authenticates against below, so doing this step first means `jsm install` will already know who you are.

---

## Why bother with any of this?

Honest answer: to save a lot of money without losing your history.

Here's a real example from April 2026, a founder's post on X:

> I'm tempted to finally churn off Slack.
>
> We're paying ~$6k/year for 40 people and they just quoted me $21k/year for the business version that includes a BAA (and all the shitty AI features).
>
> Incredibly overrated software.
> — Alex Cohen (@anothercohen)

That's a **3.5× price hike** to move from Pro to Business+, and the reason he even needs Business+ is usually a compliance requirement (HIPAA's Business Associate Agreement in Alex's case, or a legal/audit need for full export access that Pro doesn't grant). Slack's pricing psychology is consistent: Pro keeps you hooked with decent features, and when you grow past the point where Pro's limits hurt (or you need a BAA, or you need to export private channels, or you want SSO, or you simply want a saner admin), they hand you a quote that makes your eyes water.

Self-hosting Mattermost for the same 40-person workspace, using the approach this guide walks through, comes out to roughly:

| Line item | Monthly | Annual |
|-----------|---------|--------|
| Hetzner AX42 dedicated server | ~$50 | ~$600 |
| Cloudflare Free plan | $0 | $0 |
| Postmark transactional email | $15 | $180 |
| Cloudflare R2 for file storage | ~$2 | ~$24 |
| Hetzner Storage Box backups | ~$4 | ~$48 |
| **Total infrastructure** | **~$71** | **~$852** |

Against Alex Cohen's $21,000/year Slack Business+ quote, that's a **96% cost reduction**, or about **$20,150 saved per year**. Against the $6,000/year Slack Pro bill he was already paying, it's still an **86% cost reduction**, or about **$5,150 saved per year**. Both include compliance features Slack would charge extra for: you own the server, so you can sign your own BAA, configure retention your own way, and audit the data at the byte level.

At 1,000 users, the numbers get even less forgiving for Slack. Business+ at $12.50/user/month is **$150,000/year**. The same Hetzner AX52 + Cloudflare + Postmark + R2 stack serves 1,000 users for about **$90/month**, or **$1,080/year**. A **99.3% cost reduction, ~$149,000 saved annually**, and the data sits on hardware you own and can put in any jurisdiction you want.

**Other reasons, in rough order of how often they matter:**

1. **You own your history.** Slack's 90-day-message-retention on Free, plus the fact that your export is JSON with dead file links, means that the moment you stop paying, your history is effectively gone. Self-hosted Mattermost keeps your data in a Postgres database you can back up, restore, inspect, and re-import.
2. **Compliance without the BAA premium.** If you're running your own server, you're the data custodian; you sign your own BAA, your own DPA, your own SCCs. Mattermost Team Edition (free) supports SSO via OAuth/SAML with the Professional Edition upgrade at $10/user/month if you need it, which is still well below Slack's Business+ premium.
3. **AI features, your way.** Slack's recent enterprise tier bundles AI features into the price. With Mattermost, you pick your AI: OpenAI, Anthropic, Groq, your own Llama-on-a-GPU, or no AI at all. Cost scales with actual usage, not per-seat.
4. **No more price hikes from a vendor.** Your costs are fixed infrastructure you rent by the month; no one quietly raises the seat price overnight or changes the retention policy.

**What this guide does not try to convince you of:** that Mattermost is more polished than Slack for every end-user scenario. Slack has spent a decade on UX details Mattermost is still catching up on (huddles have no drop-in equivalent; some channel-management ergonomics are less clicky). If you're 5 people and pay $0/month on Slack's Free tier and love it, this whole exercise is a waste of time. The migration pays off when your Slack bill is a real line item and the vendor's next price-hike email is about to hit your inbox.

---

## The two skills + a third for maintenance

Three skills handle the full lifecycle. Each is a self-contained Claude Code / Codex skill with its own `SKILL.md`, scripts, validators, and operator library; the skill is where the operational detail lives. This guide is the conceptual primer.

**`slack-migration-to-mattermost-phase-1-extraction`** runs on your workstation. It owns everything from "I have a Slack workspace" to "I have a hash-stamped, validated `mattermost-bulk-import.zip`." It ships stages (setup → export → enrich → transform → package → verify → handoff), a `bootstrap-tools.sh` that installs slackdump / mmetl / mmctl / slack-advanced-exporter, four non-negotiable validators, and six subagents that each produce a `ready` / `blocked` / `needs-review` verdict before the bundle is allowed to leave Phase 1. Find it at `https://jeffreys-skills.md/skills/slack-migration-to-mattermost-phase-1-extraction`.

**`slack-migration-to-mattermost-phase-2-setup-and-import`** runs from the same workstation over SSH to your Ubuntu target. It owns everything from "I have a validated bundle and a fresh Ubuntu host" to "Mattermost is live, users are activating, and the cutover evidence pack is on disk." It ships stages (intake → render-config → edge → provision → deploy → verify-live → staging → restore → ready → cutover), a fail-closed seven-gate readiness model, and an explicit rollback path gated by a verbatim confirmation phrase. Find it at `https://jeffreys-skills.md/skills/slack-migration-to-mattermost-phase-2-setup-and-import`.

**`slack-migration-to-mattermost-phase-3-ongoing-mattermost-maintenance`** takes over once you're live. It owns the weekly / monthly / quarterly cadence that keeps a self-hosted Mattermost healthy: health probes, OS and Mattermost upgrades with auto-rollback, nightly backups with SHA-256 verification, quarterly restore drills, credential rotation, and an incident playbook. The eight stages and their cadences are summarized below in "Phase 3 · 8 maintain.sh stages." Find it at `https://jeffreys-skills.md/skills/slack-migration-to-mattermost-phase-3-ongoing-mattermost-maintenance`.

Each skill's own `SKILL.md` is the authoritative operational reference. When you're inside a stage and want to know "how does this work, exactly?", the answer is in the skill, not in this guide.

---

## Install

The skills are distributed through Jeffrey's Skills.md (`jsm`), a small CLI that downloads signed skill bundles into `~/.claude/skills/` and `~/.codex/skills/` where Claude Code and Codex pick them up.

```bash
# macOS / Linux
curl -fsSL https://jeffreys-skills.md/install.sh | bash
# Windows (PowerShell as Admin)
irm https://jeffreys-skills.md/install.ps1 | iex

jsm setup                        # First-time wizard; creates config, picks skill dirs
jsm login                        # Opens browser → sign in with Google
jsm install slack-migration-to-mattermost-phase-1-extraction
jsm install slack-migration-to-mattermost-phase-2-setup-and-import
jsm install slack-migration-to-mattermost-phase-3-ongoing-mattermost-maintenance
```

Each skill ships its own `scripts/bootstrap-tools.sh`, which handles the underlying tool install (slackdump, mmetl, mmctl, psql, rsync, etc.) per platform. Run it once per skill per laptop. From there, open Claude Code or Codex in your migration working directory and ask the agent, in plain English, to drive the skill: *"Use the Phase 1 skill to run setup."*

---

## What survives the move

Three dispositions classify every Slack feature. This is the framing Phase 1's `integration-inventory` + `unresolved-gaps.md` produces for you; the full matrix lives in the skill, but the top-level picture is short:

- **Native** (imports as first-class Mattermost data): public and private channel messages (private on Business+; on Pro, only what the export token can see), DMs and group DMs (same caveat), threads, reactions, file attachments, pinned messages, channel topics and purposes, custom emoji, and user accounts matched by email.
- **Sidecar** (preserved as posts in an archive channel, not in their Slack-native UI): canvases (`slack-canvases-archive`), lists (`slack-lists-archive`), admin channel-audit CSV (`slack-export-admin`), and Workflow Builder JSON.
- **Unrecoverable** (documented in `unresolved-gaps.md`; plan a rebuild or an acceptance): Slackbot replies, bookmarks, saved items, scheduled messages, user statuses, huddles recordings, the other org's content in Slack Connect channels, and message edit history (you keep the latest version only).

Phase 1's validators fail closed on anything that would drop silently. If a feature is not in the native column for you, it shows up in `unresolved-gaps.md` with its disposition class, and the Phase 1 → Phase 2 handoff records that explicitly.

---

## Readiness: fail-closed gate + 7 Go/No-Go gates

Phase 2 refuses to run `cutover` without a named rollback owner. `ROLLBACK_OWNER` must be a specific human (can be yourself); not a role, not "whoever is on call." The fail-closed `ready` stage checks this alongside every other input and produces a `cutover-readiness.json` with status `ready` or `blocked`. If any input report is missing or any criterion is red, it blocks.

The `ready` stage is one of **seven** explicit gates Phase 2 walks through between the Phase 1 handoff bundle and users typing into production. Every gate has a written-down pass criterion before the migration starts, and any one red gate stops the pipeline.

| # | Gate | Passes when |
|---|------|-------------|
| 1 | `intake-valid` | Phase 1 bundle checksum-verified, row counts reconciled against `handoff.json`, secret-scan clean, `ROLLBACK_OWNER` named |
| 2 | `infra-provisioned` | Ubuntu host, PostgreSQL 16 (Supabase pooler or self-hosted), Cloudflare R2 bucket, Cloudflare Tunnel, Nginx all reachable; `doctor.sh` green |
| 3 | `stack-deployed` | Mattermost serving `/api/v4/system/ping`; WebSocket upgrade block live; TLS terminating at the edge; SMTP sends a test email |
| 4 | `import-reconciled` | `mmctl` bulk-import completed; reconciliation report matches the handoff manifest for users / channels / posts / DMs |
| 5 | `staging-passed` | Full cutover rehearsed against a throwaway staging VPS first; smoke tests + e2e pass captured in `latest-staging.json` |
| 6 | `war-room-GO` | Named rollback owner acknowledges; status-page update drafted; 60-second TTL on the DNS record already set; comms kit paged |
| 7 | `cutover-complete` | DNS flipped; `cutover-status.*.json` records `status: success`; reconciliation second-pass green; activation announcement sent |

Writing the gates down isn't bureaucracy; it removes the 11-pm-on-cutover-night temptation to improvise. Every gate is a place the skill will cheerfully stop, file a blocked-reason, and let the operator fix the input rather than guess at what "good enough" looks like.

Phase 1 runs 7 stages: `setup → export → enrich → transform → package → verify → handoff`. Phase 2 runs 8 stages: `intake → render-config → edge → provision → deploy → verify-live → staging → cutover` (with optional `restore` and `rollback`). The skills own the per-stage detail; this guide does not duplicate it.

---

## Phase 3 · 8 `maintain.sh` stages

Phase 3 is a third skill that keeps the server healthy from cutover day forward. The maintenance load is small but real; the skill automates almost all of it. Eight stages driven by one orchestrator, plus a `weekly-sweep` combo that chains the routine ones. Each stage has an input contract, a named rollback owner, and emits a JSON artifact that the next stage reads (same fail-closed, evidence-first shape as Phase 1 and Phase 2):

| # | Stage | What it does | Cadence |
|---|-------|--------------|---------|
| 1 | `health` | Live HTTPS + WebSocket + SMTP probe, plus SSH-read disk %, Postgres connection count, log error rate, and service status. Emits a red/yellow/green JSON that every subsequent change is measured against. | weekly |
| 2 | `update-os` | SSH to target, `apt update` + `unattended-upgrade` (security-only by default) + `autoremove`. Schedules reboot inside `REBOOT_WINDOW_*` off-hours bounds; **refuses** to reboot outside the window. | monthly |
| 3 | `update-mattermost` | Pins a target Mattermost version, takes a pre-upgrade `pg_dump`, stop/apt-install/start, verifies the new version responds. Auto-rollback on a 3-minute `/api/v4/system/ping` health check. **Gated by `restore-drill`**: refuses to run if the last successful drill is older than 90 days. | quarterly |
| 4 | `db-backup` | SSH-trigger `pg_dump`, gzip, SHA-256, rotate on-host (30/12/12 daily/weekly/monthly), upload to off-site (rclone → Cloudflare R2 or Hetzner Storage Box). Refuses to mark the backup complete until the uploaded SHA-256 matches the local dump. | nightly |
| 5 | `restore-drill` | The quarterly canary. Downloads the newest off-site backup, restores into `SCRATCH_DB_URL`, runs row-count sanity checks. **Gates `update-mattermost`**: the upgrade refuses to run if the last successful drill is older than 90 days, on the grounds that a backup you have never restored from is not a backup. | quarterly (gate) |
| 6 | `rotate-credentials` | Walks the operator through each credential on its own wall clock (see cadences below). The rotation-audit JSON is the source of truth. | per-scope |
| 7 | `incident` | Opens a per-incident quarantine directory, snapshots process + network + disk state, kicks a status-page update, and links the playbook keyed to the symptom class (DB down, TLS expired, disk full, abuse). Post-mortem skeleton pre-populated. | on demand |
| 8 | `disaster-recovery` | Restores the most recent off-site backup onto a *fresh* host and keeps the original machine offline as forensic evidence. Produces a runbook instead of a panic. | on DR trigger |

**Credential-rotation cadences are code, not tribal knowledge:**

| Scope | Cadence |
|-------|---------|
| Mattermost PAT (`MATTERMOST_ADMIN_TOKEN`) | 90 days |
| `mmuser` Postgres password | 180 days |
| SSH keys | annually |
| rclone off-site tokens | annually |

The `restore-drill` → `update-mattermost` gate is the loop that lets a solo operator run production upgrades without a pager rotation. Paired with the pre-upgrade `pg_dump` and the 3-minute auto-rollback inside `update-mattermost`, you know the backup side of the loop actually works, because you tested it last quarter on the same dump pipeline.

---

## Pattern, not a migration

The two skills embody a few rules worth internalizing so you can make good judgment calls at the edges:

1. **Official export beats scraping** when it is available. Slackdump is a supplement, not a first choice.
2. **Enrich before transform.** Slack file links expire; if you transform first and enrich later, you're chasing your tail.
3. **Channel-audit CSV is a first-class artifact.** Without it, reconciliation is structural only, not semantic.
4. **Every artifact crossing a stage boundary carries a SHA256 and a manifest entry.** Hashless handoffs are rejected.
5. **Import is idempotent.** Safe to re-run. Used both for delta-catch-up and for "the cutover import was interrupted at 80%, can we resume?"
6. **Staging before production is mandatory.** Mattermost's own docs say so. Phase 2 will refuse `cutover` if staging hasn't passed.
7. **Rollback owner is a named human, before cutover.** Not a role, not "whoever is on call". A name.
8. **Known gaps are written down, never inferred away.** `unresolved-gaps.md` is the ground truth; if it's not in there, it shouldn't be talked about in the cutover announcement.

None of this is Slack-specific. The same shape — extract with validators, rehearse on a throwaway, fail-closed gate before the destructive step, named rollback owner, evidence pack on disk — applies to any migration where you don't get a second chance to prove you didn't silently drop data. The skills are one worked example; the pattern is the portable part.

---

*Last updated: April 2026. Applies to Phase 1 skill v1.x, Phase 2 skill v1.x, Phase 3 skill v1.x, Mattermost 10.11+, the Slack export format in use as of the date above, Claude Code desktop app (April 2026 redesign) and Codex desktop app (Windows Microsoft Store release March 2026), and `jsm` 0.1.x. If Slack substantially changes its export ZIP schema or its admin-UI export flow, expect the "Track A" automation helpers to need adjustment; the structural validators in Phase 1 will catch the break and tell you what moved. If the Claude Code or Codex desktop app shifts how skills are surfaced, `jsm install` will still put the skill files in the canonical `~/.claude/skills/` and `~/.codex/skills/` directories, which are the stable contract the apps honor.*
