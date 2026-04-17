# A Comprehensive Guide to Migrating From Slack to Mattermost With Claude Code / Codex

This guide walks a Slack workspace admin through an end-to-end migration to a self-hosted Mattermost server, driven by two paired Claude Code / Codex skills:

- **`slack-migration-to-mattermost-phase-1-extraction`** runs on your Mac, Windows, or Linux workstation. It pulls everything out of Slack (public and private channels, DMs, files, emoji, canvases, lists, admin audit CSVs, Workflow Builder JSON) and transforms it into a hash-stamped `mattermost-bulk-import.zip` plus a machine-readable `handoff.json`.
- **`slack-migration-to-mattermost-phase-2-setup-and-import`** runs from the same workstation over SSH to an Ubuntu server at Hetzner, OVH, or Contabo. It provisions Mattermost behind Cloudflare and Nginx, validates the Phase 1 bundle, rehearses the import on a staging target, computes a fail-closed readiness gate, and executes the production cutover with explicit rollback.

The skills automate almost everything, but there are human decisions along the way: what date range to export, which channels to sidecar rather than import, whether to bind PostgreSQL locally or put it on Supabase, who is the rollback owner, and so on. This guide explains where each decision lives in the pipeline and how to make it.

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

The migration takes a single operator one focused weekend for a small workspace, or 1 to 2 weeks of part-time attention for a 1,000-user workspace including rehearsals. You're not running the import yourself; Claude Code or Codex is driving the scripts, and you're reading the output and approving the destructive steps when they come up. There's no migration team, no PM standup, no SOW with a consultant. After cutover, ongoing maintenance is roughly an hour a month of reading reports the agent generates (OS patches, Mattermost version bumps, backup verification), and this guide's paired [Phase 3 maintenance skill](#part-12-ongoing-mattermost-maintenance-phase-3) drives those for you too.

**Other reasons, in rough order of how often they matter:**

1. **You own your history.** Slack's 90-day-message-retention on Free, plus the fact that your export is JSON with dead file links, means that the moment you stop paying, your history is effectively gone. Self-hosted Mattermost keeps your data in a Postgres database you can back up, restore, inspect, and re-import.
2. **Compliance without the BAA premium.** If you're running your own server, you're the data custodian; you sign your own BAA, your own DPA, your own SCCs. Mattermost Team Edition (free) supports SSO via OAuth/SAML with the Professional Edition upgrade at $10/user/month if you need it, which is still well below Slack's Business+ premium.
3. **AI features, your way.** Slack's recent enterprise tier bundles AI features into the price. With Mattermost, you pick your AI: OpenAI, Anthropic, Groq, your own Llama-on-a-GPU, or no AI at all. Cost scales with actual usage, not per-seat.
4. **No more price hikes from a vendor.** Your costs are fixed infrastructure you rent by the month; no one quietly raises the seat price overnight or changes the retention policy.
5. **Works offline / on a locked-down network.** Useful for regulated industries, field teams on unreliable internet, or a deliberate "no cloud" policy.
6. **No seat counting, no guest-user surcharge, no "inactive user" rebuilds.** Mattermost Team Edition doesn't have the same SKU inventory Slack does.

**What this guide does not try to convince you of:** that Mattermost is more polished than Slack for every end-user scenario. Slack has spent a decade on UX details Mattermost is still catching up on (huddles have no drop-in equivalent; some channel-management ergonomics are less clicky). If you're 5 people and pay $0/month on Slack's Free tier and love it, this whole exercise is a waste of time. The migration pays off when your Slack bill is a real line item and the vendor's next price-hike email is about to hit your inbox.

## The five-minute version (read this first, even if you never run a command)

Slack charges **$7.25–$12.50 per user per month**. A 1,000-person workspace pays Slack $87,000–$150,000 per year, and the export you get at the end is a pile of JSON files with dead links to your own attachments. You don't own your history; Slack does. Every year they raise the price or retire another tier.

Mattermost is an open-source, self-hosted chat server that looks and feels almost identical to Slack (same channels, DMs, threads, reactions, emoji, file sharing, voice/video calls, slash commands). It has official tooling for importing Slack exports. A Hetzner AX52 dedicated server plus Cloudflare (free tier) runs a full 1,000-person Mattermost for **about $75 a month, total**. That's roughly a **99% cost reduction**, and the data lives on a machine you own.

The hard part is moving your Slack history over without losing anything. Slack's export format is structured but full of traps: file links expire, private-channel exports require Business+, individual messages in Slack can be 10× longer than Mattermost's default character limit, custom emoji aren't in the export, and so on. The two skills this guide describes encode the safe path through all of that.

The overall flow looks like this:

1. **You decide a few things** (plan tier, domain, server size, cutover date, who pulls the rollback trigger if something goes wrong).
2. **An AI agent (Claude Code or Codex) runs Phase 1 on your laptop**, which downloads your Slack history, downloads every attached file while the links still work, resolves user emails, and packages everything into one zip plus a set of reports you can read.
3. **The same agent runs Phase 2**, which SSHes into an Ubuntu server you ordered from Hetzner, OVH, or Contabo, installs Mattermost behind Cloudflare, rehearses the import on a throwaway copy, and does the real cutover only once a fail-closed readiness check says green.
4. **Users activate their accounts** by visiting `https://chat.yourdomain.com/reset_password`, typing the same email they used in Slack, and setting a new password. All their old messages, channels, DMs, and reactions are there waiting.

You will spend most of the elapsed wall-clock time **waiting** (waiting for Slack to email the export, waiting for the server to provision, waiting for the import to finish). The skills are structured so waiting stays waiting and doesn't turn into operator attention: you start a step, the agent watches it, and it calls you back when the step is done or stuck.

## Can a non-technical person do this?

Yes, and it's genuinely less work than the length of this guide might suggest. The guide is long because it covers the whole problem space (edge cases, troubleshooting, compliance, every credential, every failure mode) so you have an answer for whatever you hit. In practice, **most operators spend a handful of hours of actual attention spread across 1 to 2 weeks**, and the agent is doing the rest in the background.

What you actually do:

- **Paste tokens the agent asks for** (Slack admin token, Cloudflare token, Postmark token). You collect these from browser tabs once; the agent handles them from there.
- **Click "Approve" on permission prompts** when the agent asks before it does something destructive (SSHing into your server, importing the ZIP into production, etc.). Roughly 20 to 40 approvals over the entire migration. Each takes 5 seconds.
- **Read a few reports** (readiness score, reconciliation output, cutover status) when the agent tells you it's waiting on your go/no-go.
- **Send user comms** at cutover (copy-paste-from-templates; see [Part 10.4](#104-user-communications-kit)).

What you do **not** do: write Bash, edit config files by hand, install software, configure Nginx, tune Postgres, write Cloudflare API calls, run `mmctl` commands, or SSH into the server. The agent does all of that.

### This is an asymmetric bet

The single most important fact about this whole migration: **your real Slack keeps working the entire time**. You don't touch it until you have independently verified that Mattermost is working. Specifically:

- You order a Mattermost server, the agent sets it up, imports your Slack history, and runs a full staging rehearsal on a throwaway copy. Slack is untouched.
- You log into the new Mattermost yourself, click around, confirm your history is there, your channels look right, your DMs are readable. Still untouched.
- You optionally activate a few volunteer users on Mattermost and let them use both for a few days in parallel. Slack is still the source of truth.
- **Only when you're satisfied** do you flip Slack to read-only and do the final cutover. Even then, Slack stays accessible as a read-only archive until you decide to downgrade or cancel.

If anything goes wrong at any point before cutover, you cancel the Hetzner server (billing stops immediately), delete the local `workdir/` directory, and you're out the price of a few weeks of server rent plus a Postmark subscription you can cancel the next day. Your Slack workspace is unaffected because the migration never wrote to it; Phase 1 only ever read from Slack, Phase 2 only ever wrote to the new server. There are no Slack credentials in Phase 2's config at all.

That asymmetry is the whole point: **downside is small and recoverable, upside is potentially tens of thousands of dollars a year in saved Slack fees for a typical business workspace**.

### What "running it" actually looks like

A realistic Saturday morning:

1. You open Claude Code or Codex, paste the setup prompt from [Part 2.4](#24-how-you-drive-the-skill-desktop-app-vs-cli), and go make coffee.
2. 15 minutes in, the agent pings you: "I need your Slack admin token. Here's the 4-click path to generate one." You do the 4 clicks in a browser, paste the token, and go back to whatever you were doing.
3. An hour in, the agent says: "I've kicked off the `enrich` stage. It's downloading 8 GB of attachments. ETA 2 hours. Want me to ping you when it's done?" You say yes and go to lunch.
4. That afternoon you come back to a message: "Enrich finished. Validation green. Ready for `transform`?" You glance at the report it linked, say yes, and go back to whatever.
5. By evening, Phase 1 is done. You can either tell the agent to go on to Phase 2 or stop for the day.

**Your laptop can sleep during any of this.** The long-running stages resume cleanly when you wake the laptop and re-open the session. You don't have to sit in front of it.

For a 40-person workspace this typically wraps in a weekend of light attention. For a 1,000-person workspace it's 1 to 2 weeks of calendar time with the same level of light attention; the agent is doing the actual work, you're just supervising and approving.

### What does need your attention

Two things the agent can't do for you:

1. **Order the server at Hetzner (or OVH, Contabo).** Hetzner requires ID verification on the human paying. You sign up, ID-verify (~2 hours clearance during business hours), and click "Order"; the agent does everything from there.
2. **Pick a named rollback owner for cutover.** This is you, or someone you designate, who has pre-committed to making the call to abort if cutover goes sideways. Phase 2 refuses to run cutover without `ROLLBACK_OWNER` set, on purpose.

Everything else is either automated or a 30-second paste-a-value interaction.

## Which path through this guide is for you?

There are three supported paths, and this guide covers all of them. Pick one now and stay with it:

| Path | Who it's for | Where skills live | What you install |
|------|--------------|-------------------|------------------|
| **A: Desktop app + jsm (recommended for most)** | Prefers clicking over typing; has a Mac or Windows laptop | jsm manages `~/.claude/skills/` (and `~/.codex/skills/`) for you | Claude Code desktop app **or** Codex desktop app, plus the `jsm` CLI |
| **B: CLI only** | Comfortable with terminals; wants the leanest install | Manual symlink or `jsm install` | Claude Code CLI **or** Codex CLI |
| **C: CLI + jsm** | Wants the CLI but wants skills auto-synced across machines | jsm-managed | CLI plus `jsm` |

All three paths use the exact same two skills and produce the exact same result. The only difference is **how you load the skills** and **what you click or type to drive the agent**. If you're not sure, pick Path A.

## Decision tree: which path through this guide fits your situation?

Use this tree to find the right branch before you start reading linearly:

```
  ┌────────────────────────────────────────────────────────────────┐
  │ What Slack plan are you on?                                    │
  └────────────────────────────────────────────────────────────────┘
      │
      ├── Free or Pro ──────→ Track B (slackdump-primary). See 3.2.2.
      │                       Expect: public + accessible private channels
      │                       and DMs only. Other people's DMs are invisible.
      │                       Legal approval path available; see 2.5.
      │
      ├── Business+ ───────→ Track A (official admin export). See 3.2.1.
      │                       Expect: full workspace content.
      │                       Go to 2.1 for approval workflow.
      │
      └── Enterprise Grid ─→ Track C (grid split). See 3.2.3 + Part 3 Grid
                              callout. Either grid-wide export + split, or
                              per-workspace exports.

  ┌────────────────────────────────────────────────────────────────┐
  │ Where will Mattermost live?                                    │
  └────────────────────────────────────────────────────────────────┘
      │
      ├── Hetzner AX42/AX52 dedicated (recommended) ─→ Part 2.3 sizing table
      ├── OVH Advance / Contabo VPS ─────────────────→ Same table, cheaper tier
      └── Existing infra you run ─────────────────────→ Provide your own
                                                          SSH target; skill
                                                          provisions remotely.

  ┌────────────────────────────────────────────────────────────────┐
  │ How do you want to drive the agent?                            │
  └────────────────────────────────────────────────────────────────┘
      │
      ├── Click, don't type ───→ Path A (Claude Code or Codex DESKTOP app)
      │                           See 1.1a/1.1b. Skills install via `jsm`.
      │
      ├── Terminal-native ────→ Path B (CLI-only)
      │                          See 1.1c/1.1d.
      │
      └── Multi-machine ──────→ Path C (CLI + jsm for cross-device sync)
                                  See 1.2 + Part 11.

  ┌────────────────────────────────────────────────────────────────┐
  │ Where is your Mattermost database going to live?               │
  └────────────────────────────────────────────────────────────────┘
      │
      ├── Same box as Mattermost (default) ─→ `POSTGRES_DSN=postgres://…@localhost:5432`
      │                                        Skill provisions local PG for you.
      ├── Supabase (managed) ───────────────→ Supabase **session pooler** on port
      │                                        5432 (NOT transaction pooler at 6543).
      └── Your own managed PG ──────────────→ Provide the DSN; skill is hands-off.
```

If any branch surprises you, read the linked section before continuing.

---

## Who this guide is for

- You are a Workspace Owner or Admin on a Slack Business+ or Enterprise Grid workspace. (If you are on Free or Pro, the guide still applies; the Phase 1 skill routes you into Track B / slackdump-primary automatically and tells you exactly which blind spots you inherit.)
- You can click through a Hetzner, OVH, or Contabo signup form and order an Ubuntu 25.10 (or 24.04 LTS) VPS or bare-metal server. (The agent does the rest of the server setup; you just own the account.)
- You're willing to paste values into a `config.env` file when the agent asks for them (tokens, your domain, your email). You do not need to write Bash, edit scripts, or invent passwords; the agent offers safe defaults, generates secrets, and can fill in most of the file from a short conversation.
- You have a Claude Code or Codex session (desktop app or CLI) open on your Mac / Windows / Linux laptop. That agent session does the actual work: it runs the skills, drives the scripts, SSHes into the server, and calls you back when it needs approval for a destructive step.

## What you will end up with

- A self-hosted Mattermost 10.11+ server behind Cloudflare with Origin CA TLS and proper WebSocket upgrade.
- All of your Slack history (public, private, DMs, group DMs, threads, reactions) imported and searchable.
- File attachments either in local storage or Cloudflare R2 (your choice), preserved not just linked.
- Custom emoji, canvases (as sidecar HTML posts), lists (as sidecar JSON posts), and admin audit CSVs (as sidecar posts in a dedicated channel). Nothing Slack-native gets silently dropped.
- User accounts pre-created, matched by email. Users activate via `/reset_password` with their Slack email.
- A complete evidence pack: SHA256 hashes of every raw ZIP, enriched ZIP, and import ZIP; reconciliation reports; cutover status JSON; activation proof.

---

## Timeline and effort expectations

A single operator driving the agent can take a small workspace (fewer than 50 users, under 1 GB of Slack history, no exotic integrations) start-to-finish in a single weekend. A 1,000-user workspace with a few years of history typically runs 1 to 2 weeks of calendar time if the operator rehearses twice, but the operator's actual attention is still just a few hours spread over that window. Plan for:

| Phase | Duration | Your attention |
|-------|----------|---------------------|
| Slack export approval (Business+) | 1 to 7 days, out of your control | none while waiting |
| Download + enrich + transform | 1 to 6 hours, scales with data | 5 to 15 minutes to kick off, then the agent runs it |
| Server provisioning + deploy | 20 to 60 min | you click "approve" on the SSH/install prompts as they appear |
| Staging rehearsal | 1 to 4 hours | 10 minutes to kick off + read the reconciliation report |
| Production cutover window | 15 to 45 min after staging is green | full attention (read the agent's approval prompts, send the user comms) |
| Activation week | 3 to 7 days | respond to help-desk questions as they come in |

The skills are structured so waiting is waiting, not operator time. The agent kicks off a long download, watches it, and pings you when it finishes or gets stuck. During a 6-hour `enrich` stage your laptop can be asleep; resume the agent session when you come back and it picks up where it left off.

---

# Part 1: One-time workstation setup

You do this once per laptop. The skills install themselves via Claude Code's plugin / skills mechanism; the tooling they call (slackdump, mmetl, mmctl, etc.) is installed by a bootstrap script that is included with the skill.

Start with Part 1.0 if you have never ordered a server or generated an SSH key. If you already have a server and SSH working, skip to 1.1.

## 1.0 Day zero: order a server and wire up SSH

Phase 2 installs Mattermost on an Ubuntu server that you rent. You order that server *before* you install the skill so the IP address and SSH access are ready when you need them. This takes roughly 2 hours of wall-clock time (most of it Hetzner's ID verification) and about 15 minutes of your attention.

### 1.0.1 Order a Hetzner dedicated server (recommended path)

1. Go to <https://www.hetzner.com/dedicated-rootserver> and click **Server Auction** (or **Dedicated Root Servers** for new hardware). The auction has the same specs at lower prices.
2. Sign up for a Hetzner account. Use your company email. Hetzner requires government-issued ID upload for first-time account verification; this usually clears in 1 to 2 hours during business hours (German time).
3. Pick an **AX42** (for up to ~250 users) or **AX52** (for 250 to 1,000 users) from the auction, or the equivalent from the "Dedicated Root Server" list. Prefer **NVMe** storage. Datacenter location: Falkenstein or Helsinki for Europe, Ashburn for the US.
4. When the order form asks for **OS**: choose **Ubuntu 24.04 LTS (noble)**. If 24.04 is not offered in the order form, pick Ubuntu 22.04 LTS and upgrade to 24.04 post-provision (the skill's provisioner handles this). Avoid Ubuntu 25.10 unless you have a reason, because the Mattermost APT package lags on newer release names (the skill can work around this with Docker; see 4.5).
5. Leave **Rescue System** and **KVM** options on their defaults.
6. Do **not** set a root password here. Instead, paste your SSH public key (you'll generate it in 1.0.3) into the "SSH keys" field. Hetzner will install that key into `/root/.ssh/authorized_keys` automatically and disable password login, which is exactly what you want.
7. Submit the order. You'll get a "Server installed" email with the IP address (something like `95.217.12.34`) and confirmation that your SSH key was installed.

**OVH** (for US operators preferring a North American provider) and **Contabo** (for small workspaces under 50 users at ~$10/month) work the same way: sign up, ID-verify, order, paste SSH key in the order form. OVH uses the "Bare Metal Cloud" → "Advance" series; Contabo uses "VPS" tiers (M for under 50 users, L for up to 250, XL for up to 1,000).

### 1.0.2 I don't have a domain yet

You need something like `chat.yourcompany.com`. Options:

- **Cloudflare Registrar** (<https://dash.cloudflare.com/?to=/:account/domains/register>): at-cost pricing, ~$10/year for `.com`, auto-adds the zone to Cloudflare. Fastest path.
- **Any existing registrar** (GoDaddy, Namecheap, Porkbun, Route 53). You'll then need to update the registrar's nameservers to point at Cloudflare; see [Part 10.13](#1013-cloudflare-walkthrough) for the exact click path.

Buy the domain now. DNS propagation after nameserver update is anywhere from 15 minutes to 24 hours, and you want that clock running in parallel with the ID-verification wait.

### 1.0.3 Generate an SSH keypair on your laptop

An SSH keypair is two files: a private key that stays on your laptop (treat it like a password) and a public key you paste into the server. They unlock the server together; without the private file on your laptop, nobody can log in as you.

**On macOS:**

Open **Terminal** (Cmd+Space, type "Terminal", Enter). Run:

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

Three prompts:

- **"Enter file in which to save the key"**: press Enter to accept the default (`~/.ssh/id_ed25519`).
- **"Enter passphrase"**: optional. If you set one, you'll type it every time you SSH in (or add it to your macOS Keychain once with `ssh-add --apple-use-keychain ~/.ssh/id_ed25519`). Empty passphrase is acceptable for this use case; the laptop's own disk encryption is your protection.
- **"Enter same passphrase again"**: repeat.

The output tells you it created two files:

```
Your identification has been saved in /Users/you/.ssh/id_ed25519       ← private key, never share
Your public key has been saved in /Users/you/.ssh/id_ed25519.pub        ← public key, share this
```

Print the public key to copy:

```bash
cat ~/.ssh/id_ed25519.pub
```

You'll see a single line starting with `ssh-ed25519 AAAAC3...`. Select the whole line and copy it. That's what goes into Hetzner's order form.

**On Windows 10 or 11:**

Open **PowerShell** (Start menu → type "PowerShell" → Enter). Modern Windows ships `ssh-keygen`. Run:

```powershell
ssh-keygen -t ed25519 -C "your_email@example.com"
```

Answer the prompts the same way as Mac. Files land in `C:\Users\<you>\.ssh\id_ed25519` (private) and `id_ed25519.pub` (public). Print the public key:

```powershell
Get-Content $HOME\.ssh\id_ed25519.pub
```

Copy the `ssh-ed25519 AAAAC3...` line into Hetzner's order form.

### 1.0.4 First SSH login after the server is installed

When Hetzner emails "server installed", open your terminal and run:

```bash
ssh root@95.217.12.34     # replace with your real IP
```

The first time you connect, SSH prints a host-key fingerprint and asks:

```
The authenticity of host '95.217.12.34' can't be established.
ED25519 key fingerprint is SHA256:xyz...
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

Type `yes` and press Enter. This records the server's key in your `~/.ssh/known_hosts` so future logins don't prompt again. You should land at a `root@Ubuntu-...#` prompt. Type `exit` and press Enter to log back out. The fact that you got in confirms: server up, SSH reachable, your key installed.

**If it asks for a password instead of logging in directly**, Hetzner did not install the SSH key. Fix: go to <https://robot.hetzner.com/server>, click your server, add the key under "Linux rescue system" → SSH keys, and use the robot's "Reset root password" to get a one-time password. SSH in with that password, then manually paste your public key into `/root/.ssh/authorized_keys` (one line, no extra quotes), and `chmod 600 /root/.ssh/authorized_keys`.

### 1.0.5 If you lose your private SSH key

This is a recoverable problem. Options, in order of preference:

1. **Boot into Hetzner's rescue system** (in the robot UI: your server → "Rescue" → activate Linux rescue → reboot server). You'll get a temporary root password by email, SSH in with that, mount the installed filesystem (`mount /dev/sda1 /mnt`), paste a new public key into `/mnt/root/.ssh/authorized_keys`, `umount`, and reboot. Works for every provider with a rescue console.
2. **Re-order the server** and start fresh. If you're at day zero and nothing is installed yet, this is faster than rescue-system diagnosis.

Once you have the server IP, a working SSH key, and a domain, you're ready for Part 1.1. Do not try to start Phase 2's `provision` stage until all three are in hand.

> **Sidebar: for Windows operators**
>
> The guide is written with a Mac-first bias because the tooling (Homebrew, `ssh-keygen`, `brew install`) is a little shorter on Mac. Everything works on Windows 10 / 11; here's the consolidated set of Windows-specific notes so you don't have to hunt for them:
>
> - **Use PowerShell, not Command Prompt.** All of this guide's commands assume a POSIX-ish shell. On Windows, that means PowerShell 7+ (`winget install Microsoft.PowerShell`) or the built-in Windows PowerShell. The Command Prompt (`cmd.exe`) is a different, older shell; commands like `ln -s` will not work there.
> - **Install Git for Windows** (<https://git-scm.com/downloads/win>). This provides `git`, plus a bundled Bash shell ("Git Bash") that behaves like a Mac / Linux terminal. The Claude Code desktop app's Code tab needs Git to work with local folders.
> - **Chocolatey** is the Windows equivalent of Homebrew. Install from <https://chocolatey.org/install> in an **Admin PowerShell** (right-click PowerShell → "Run as administrator"). The skill's `bootstrap-tools.sh` will tell you the exact Chocolatey lines to paste.
> - **WSL2** (Windows Subsystem for Linux) is optional but convenient for power users. If you prefer to run the whole migration in an Ubuntu-inside-Windows environment, install it once with `wsl --install -d Ubuntu-24.04` from an Admin PowerShell, then `wsl` to drop into a Linux shell. The skill works identically inside WSL2.
> - **Paths**: this guide uses Mac-style `~/.claude/skills/` paths. On Windows, that's `%USERPROFILE%\.claude\skills\` (PowerShell) or `$HOME/.claude/skills/` (Git Bash). The Claude Code and Codex desktop apps handle the translation automatically.
> - **Symlinks** (the `ln -s` command) need either Admin PowerShell (`New-Item -ItemType SymbolicLink`) or Git Bash with Developer Mode enabled (Settings → Privacy & security → For developers → Developer Mode).
> - **SSH**: built into Windows 10 (1809+) and Windows 11. Run `ssh -V` in PowerShell to confirm; if missing, install via Settings → Apps → Optional Features → "OpenSSH Client".
> - **Firewall**: Windows Defender may block local ports the agent wants to use for MCP servers. If the Slack MCP stealth server hangs on connect, allow inbound for `node.exe` when prompted.
>
> Everywhere else in this guide, when you see a Mac-specific command (e.g. `brew install jq`), the Windows equivalent is either one line below in parentheses or is printed by `./scripts/bootstrap-tools.sh` during Phase 1 setup.

## 1.1 Pick an agent harness (GUI app or CLI)

You need **one** of the following. You don't need both; either one can run the skills end to end. Both Claude Code and Codex ship as GUI desktop apps and as command-line tools. The desktop apps shipped in early 2026 and are the friendlier path for operators who prefer clicking to typing.

### Option 1a: Claude Code desktop app (recommended for non-technical users)

The Claude Code desktop app is a graphical wrapper around the same engine as the CLI. It supports skills, MCP servers, and SSH to remote machines; everything the CLI can do. Requires an Anthropic account on a **Pro, Max, Team, or Enterprise** plan.

1. **Download**: go to <https://claude.ai/download> (or the direct links: <https://claude.ai/api/desktop/darwin/universal/dmg/latest/redirect> for Mac, <https://claude.ai/api/desktop/win32/x64/setup/latest/redirect> for Windows x64, and <https://claude.ai/api/desktop/win32/arm64/setup/latest/redirect> for Windows ARM).
2. **Install**: open the `.dmg` (Mac) or run the installer `.exe` (Windows). Launch the app from the Applications folder / Start menu. Sign in with your Anthropic account.
3. **Open the Code tab** at the top of the app. (The other tabs are Chat and Cowork; you want **Code**.)
4. **On Windows only**, install Git for Windows: <https://git-scm.com/downloads/win>. The Code tab needs Git to work with local folders; Macs already ship with it.
5. Click **Select folder**, pick an empty working directory somewhere on your disk (e.g. `~/slack-migration`), and choose the **Local** environment. That folder becomes the agent's working directory for this migration.

The desktop app shares `~/.claude/skills/`, MCP server wiring, and CLAUDE.md files with the CLI, so if you later install skills via `jsm`, both surfaces see them automatically.

### Option 1b: Codex desktop app

OpenAI's Codex desktop app was released for macOS in late 2025 and for Windows (Microsoft Store) and Intel Macs in early 2026. Requires a **ChatGPT Plus / Pro / Business / Edu / Enterprise** subscription, or an OpenAI API key with Codex access.

1. **Download**: <https://developers.openai.com/codex/app> has links for Apple Silicon, Intel Mac, and the Microsoft Store listing for Windows.
2. **Install** the downloaded package. Launch the app. Sign in with your ChatGPT account or paste an OpenAI API key.
3. **Select a project folder**, same idea as Claude Code: pick an empty working directory (e.g. `~/slack-migration`) and let Codex open it.

Codex reads skills from `~/.codex/skills/` on most setups (set `CODEX_HOME` to override). The `jsm` CLI writes to that location by default, so installing skills via `jsm install` makes them available to the Codex app on the next restart.

### Option 1c: Claude Code CLI

Install the CLI from <https://code.claude.com/docs/en/quickstart> (typically `npm install -g @anthropic-ai/claude-code` or a platform installer). Sign in with `claude login`. Verify with `claude --version`. You use it by running `claude` in an empty working directory; a chat prompt opens in your terminal.

### Option 1d: Codex CLI

Install from <https://github.com/openai/codex>. Sign in with `codex login`. Verify with `codex --version`. Same usage pattern: `cd` into a working directory and run `codex`.

### Which one should I pick?

- **Non-technical operator, Mac or Windows** → Option 1a (Claude Code desktop).
- **You already have a ChatGPT Plus / Pro subscription** and don't want another AI subscription → Option 1b (Codex desktop).
- **Terminal-native, want the leanest setup** → Option 1c or 1d.

You do not need more than one. The skills detect whichever agent harness is present and register MCP servers accordingly, so everything works the same either way.

### What "running the skill" looks like in each harness

In all four options, running a skill means opening a session in your migration working directory and asking the agent, in plain English, to use the skill. Examples:

- Claude Code desktop: in the prompt box, type `/` to see available skills and slash commands, then pick `slack-migration-to-mattermost-phase-1-extraction`. Or just say: *"Use the Phase 1 Slack-to-Mattermost skill to run the setup stage."*
- Codex desktop: same idea. The Skills pane shows installed skills; you select one, or you type a natural-language request and the app picks the right skill automatically.
- Claude Code CLI: `claude`, then type *"Use the slack-migration-to-mattermost-phase-1-extraction skill to run setup."*
- Codex CLI: `codex`, then the same plain-English request.

Behind the scenes the agent runs scripts like `./migrate.sh setup` for you and shows you the output. You'll see commands flash by; you don't need to memorize them.

## 1.2 Install the two skills

You need the two skills on your machine so that Claude Code / Codex can see and run them. There are three ways to do this; pick whichever matches the path you chose in 1.1.

### Recommended: install via Jeffrey's Skills.md (`jsm`)

This is the easiest path for non-technical users and is how both skills are distributed publicly. `jsm` is a small single-file CLI that downloads skills into the right directories for Claude Code and Codex automatically, keeps them up to date, and verifies integrity.

Full step-by-step for signup and `jsm` installation is in [Part 11](#part-11-installing-the-skills-via-jeffreys-skillsmd-jsm). The short version:

```bash
# macOS / Linux
curl -fsSL https://jeffreys-skills.md/install.sh | bash
# Windows (PowerShell as Admin)
irm https://jeffreys-skills.md/install.ps1 | iex

jsm setup                        # First-time wizard; creates config, picks skill dirs
jsm login                        # Opens browser → sign in with Google
jsm install slack-migration-to-mattermost-phase-1-extraction
jsm install slack-migration-to-mattermost-phase-2-setup-and-import
```

After the two `jsm install` calls, restart the Claude Code and/or Codex desktop app (or restart `claude` / `codex` in the terminal) and the skills will show up in the skills picker.

**What just happened, in plain English:** `jsm` downloaded a verified copy of each skill from <https://jeffreys-skills.md>, unzipped it into `~/.claude/skills/` (and `~/.codex/skills/`), checked that the hash on disk matches the hash the server published (so you know nothing was tampered with in transit), and recorded the version in a local database so future `jsm upgrade` knows what you have.

### Alternative: install via `claude plugins` (if they're published there)

If the two skills are published in the built-in Claude plugin marketplace:

```bash
claude plugins install slack-migration-to-mattermost-phase-1-extraction
claude plugins install slack-migration-to-mattermost-phase-2-setup-and-import
```

### Alternative: install from a local clone of the skills repo (developers only)

If you are a developer who has cloned the skills repo, symlink the two skill directories into Claude's and Codex's skill search paths:

```bash
# Once per laptop. This symlinks the skills into Claude's skill search path.
ln -s /path/to/je_private_skills_repo/.claude/skills/slack-migration-to-mattermost-phase-1-extraction  ~/.claude/skills/
ln -s /path/to/je_private_skills_repo/.claude/skills/slack-migration-to-mattermost-phase-2-setup-and-import ~/.claude/skills/
# mirror to Codex too:
ln -s /path/to/je_private_skills_repo/.claude/skills/slack-migration-to-mattermost-phase-1-extraction  ~/.codex/skills/
ln -s /path/to/je_private_skills_repo/.claude/skills/slack-migration-to-mattermost-phase-2-setup-and-import ~/.codex/skills/
```

On Windows (from Git Bash or PowerShell 7+ as Admin), use `mklink /D` or `New-Item -ItemType SymbolicLink` instead of `ln -s`.

Restart `claude` / `codex` / the desktop apps so the skills are picked up.

### How do I verify the skills are installed?

Regardless of which method you used, confirm with one of:

```bash
jsm list                          # If you used jsm; shows installed skills + versions
ls -la ~/.claude/skills/ | grep slack-migration      # On Mac/Linux; should list both skill directories
dir %USERPROFILE%\.claude\skills  # On Windows; same idea
```

Inside Claude Code desktop, click **+** → **Slash commands** (or type `/`) and scroll for `slack-migration-to-mattermost-phase-1-extraction`. Inside Codex desktop, open the Skills panel. If the skill appears, you're ready.

## 1.3 Bootstrap the workstation for Phase 1

The "bootstrap" step installs the underlying command-line tools that Phase 1 shells out to. Slackdump does the Slack extraction; mmetl transforms the export into Mattermost format; and so on. The skill ships a script that figures out what's already installed and installs the rest for you.

**How to run this inside your agent harness:**

- **Claude Code / Codex desktop app:** open the app's integrated terminal (in Claude Code, press Ctrl+backtick, or click the **+** next to the prompt and pick **Terminal**) and type the commands below. Or paste them into the prompt and ask the agent to run them for you.
- **Claude Code / Codex CLI:** you're already in a terminal. Just run them.

```bash
cd ~/.claude/skills/slack-migration-to-mattermost-phase-1-extraction
./scripts/doctor.sh                    # what is missing?
./scripts/bootstrap-tools.sh           # install missing system + Go tools
./scripts/doctor.sh                    # confirm all required checks are green
```

**What each command does, in plain English:**

- `cd ~/.claude/skills/slack-migration-to-mattermost-phase-1-extraction` moves the terminal into the skill's directory so the scripts can see their own files. The `~` means "your home folder" (on Mac, `/Users/yourname`; on Windows, `C:\Users\yourname`).
- `./scripts/doctor.sh` is the health-check script. It prints a table showing every tool the skill needs and whether each one is installed, up to date, and reachable. You want the ones labeled "required" to be green. The first run will typically be all red; that's expected. The next command fixes it.
- `./scripts/bootstrap-tools.sh` is the installer. It detects whether you're on macOS, Linux, Ubuntu, WSL, or Windows and uses the right package manager for your platform.
- `./scripts/doctor.sh` (again) re-verifies. Green across the "required" row means you're done.

**Platforms covered automatically:** On macOS it uses Homebrew (and installs Homebrew first if it's missing); on Ubuntu, Debian, or WSL it uses `apt`; on Windows it prints a Chocolatey checklist for you to paste into an Admin PowerShell. What gets installed:

- `python3`, `jq`, `zip`, `unzip`, `curl`, `rsync`, `git`, `sha256sum` (via coreutils on Mac)
- `go` (so the next step can `go install` the Go-based extraction tooling)
- `slackdump`, `slack-advanced-exporter`, `mmetl`, `mmctl` (installed into `$(go env GOPATH)/bin`)
- Python packages `requests` and `beautifulsoup4`

**What to do if something goes wrong:**

- `command not found: ./scripts/doctor.sh` → you forgot the `cd` line above, or your skills directory is somewhere else. Find it with `jsm list` if you used jsm, or `ls ~/.claude/skills/` to eyeball it.
- `permission denied` → run `chmod +x scripts/*.sh` from inside the skill directory, then retry.
- One Go install fails (bad network, yanked release) → the script warns and continues; the other tools still get installed. Re-run once your network is cooperating. Alternatively, download that specific tool's release binary from GitHub manually and put it on your PATH; doctor.sh will see it next time.
- On Windows you hit permission errors → open PowerShell **as Administrator** (right-click, then Run as administrator) before pasting the Chocolatey commands.

If the agent is running the commands for you, it will narrate what's happening and paste the output back. If anything is red after the second `doctor.sh` run, tell it: *"doctor.sh is still reporting that `mmetl` isn't installed. Install it for me."* and it will take another pass.

## 1.4 Bootstrap the workstation for Phase 2

```bash
cd ~/.claude/skills/slack-migration-to-mattermost-phase-2-setup-and-import
./scripts/doctor.sh                       # what is missing?
./scripts/bootstrap-tools.sh              # install workstation-side tools
./scripts/doctor.sh --require-remote      # probe SSH to your target once TARGET_HOST is set
```

Phase 2 needs `mmctl`, `jq`, `psql`, `ssh`, `scp`, `rsync`, `openssl`, and the Python `requests` module. Same platform rules. On macOS, the script will also nudge you to add `$(brew --prefix)/opt/libpq/bin` to your PATH so `psql` is runnable after a fresh libpq install.

`--require-remote` is how you confirm your SSH key is on the target server and `ssh -o BatchMode=yes` works. Do this right before you run `./operate.sh provision` or `./operate.sh deploy`.

## 1.5 Wire up MCP servers (optional but recommended)

The skills ship installers that register Slack / Playwright / Mattermost MCP servers into whichever agent CLIs you have. After you set the relevant credentials in `config.env`:

```bash
# Phase 1 (workstation)
./scripts/install-mcp-servers.sh
./scripts/doctor.sh --require-mcp

# Phase 2 (workstation)
./scripts/install-mcp-servers.sh
./scripts/doctor.sh --require-mcp
```

What they give you inside Claude Code / Codex:

| MCP | When it helps | Phase |
|-----|---------------|-------|
| Slack MCP (Anthropic official, `xoxb-` bot token) | "count channels", "verify last message in #general", "check user U0ABC's email" | Phase 1 |
| Slack MCP stealth (korotovsky, `xoxc-` + `xoxd-`) | full visibility including DMs for gap-fill verification | Phase 1 |
| Playwright MCP | driving the Slack admin UI's export flow, or Mattermost System Console screens that lack clean API equivalents | Phase 1 + 2 |
| Mattermost MCP (community, admin PAT) | "which users are inactive", "stamp a test post in #migration-check", "list team roles" | Phase 2 |

You do not need any of them for the skill itself to run. They are accelerators for verification, gap-hunting, and UI steps.

---

# Part 2: Before you touch Slack

Three things need to be decided before your first `./migrate.sh export` call. Spending 20 minutes on these now saves hours downstream.

## 2.1 Slack plan tier and export privileges

Log into Slack as an owner / admin and open **Workspace Settings → Security → Import & export data**. The export page tells you which scope you are authorized for:

- **Free or Pro**: public channels only. Private channels, DMs, and group DMs cannot be exported via the official path. The Phase 1 skill will route you into **Track B** (slackdump as primary extractor) and emit an explicit `unresolved-gaps.md` listing the private content you can't pull.
- **Pro with legal exception**: Workspace Owners can apply to Slack for a full export under `"valid legal process, consent of members, or a requirement under applicable laws"`. If granted, you use **Track A**.
- **Business+ or Enterprise Grid**: full content export of public, private, and DM is available. **Track A** is the default path.

Write down the answer. The value will go into `config.env` as `SLACK_PLAN_TIER` and controls several downstream validators.

## 2.2 Scope of the export

Default: full history from workspace creation to now. Before you commit:

- Is there content legal has told you *must not* be exported? (Example: a private HR channel whose members did not consent.) Either exclude those channels via Slack admin before kicking off the export, or accept them and redact post-export.
- Are there moribund channels older than your retention policy that you would rather never import? You can leave them in Slack and just skip them in the Mattermost archive-channel mapping.
- Is the export size going to blow past the server's disk budget? Rough rule: plan for 3x the compressed Slack export size of free disk on the server. If your workspace has many years of heavy attachments, use the `split-phase1-import.py` flow (per-year batch ZIPs) so the import fits in RAM.

## 2.3 Server sizing

Mattermost's official 1000-user recommendation is 4 vCPU / 8 GB RAM / 90-180 GB storage. That is bare-minimum. For a real production deployment you want headroom.

| User count | Target hardware | Hetzner example | OVH example | Contabo example | Est. monthly |
|------------|-----------------|-----------------|-------------|-----------------|--------------|
| Up to 50 | 2 vCPU / 4 GB / 80 GB SSD | AX21 (or small VPS) | VLE-4 | VPS M | $10-20 |
| 50 to 250 | 4 vCPU / 16 GB / 250 GB NVMe | AX42 / CCX23 | Advance-1 | VPS L | $40-60 |
| 250 to 1000 | 8 cores / 64 GB / 2x 1 TB NVMe RAID 1 | **AX52** (recommended) | Advance-2 | VPS XL | $65-90 |
| Over 1000 | 8-16 cores / 64-128 GB, separate PG | AX52 + Supabase Pro | Advance-2 + managed PG | enterprise | $100-300+ |

Pick **AX52 at Hetzner** as the default for anything 250-1000 users; it is by far the cheapest dedicated-bare-metal-with-NVMe option in that class. Put **Ubuntu 24.04 LTS** on it (or 25.10 if you need the newer kernel). Ubuntu 22.04 still works but unattended-upgrades gets noisier as it ages.

Ordering the server is the one step the agent cannot do for you (Hetzner's signup requires ID verification tied to the human paying). See [Part 1.0](#10-day-zero-order-a-server-and-wire-up-ssh) for the walkthrough: click through the Hetzner order form, paste the SSH public key from the keypair the agent generated (or from `ssh-keygen` if you already have one), and hand the resulting IP address to the agent. From there Phase 2's `provision` stage takes over: it locks down root login, creates a non-root `deploy` user, installs Nginx and PostgreSQL, enables fail2ban and UFW, and runs unattended-upgrades. You don't touch the server's OS yourself at any point.

Also decide (these four values go into `config.env.phase2` when the agent asks for them; for most you're just picking a name, not doing any setup):

- **Domain**: typically `chat.yourdomain.com`. Add the domain to Cloudflare if it is not already there (see [Part 10.13](#1013-cloudflare-walkthrough) for the click-path).
- **SMTP**: Mailgun, Postmark, SES, or a Google Workspace relay. You pick a provider and sign up; the agent wires the credentials into Mattermost's config. Mattermost cannot send password-reset emails without this, and users cannot log in without password-reset emails. See [Part 10.14](#1014-smtp-postmark-walkthrough).
- **Admin email**: a mailbox you own. The agent creates the Mattermost `admin` account during `deploy`; the password it generates can be stored in 1Password or typed by you.
- **Rollback owner**: a named human (can be yourself) who will make the call to roll back if cutover goes sideways. The agent refuses to run `cutover` without `ROLLBACK_OWNER` set, so this is enforced.

## 2.4 How you drive the skill (desktop app vs. CLI)

The rest of this guide shows commands like `./migrate.sh export` or `./operate.sh cutover`. Those are the underlying scripts that the skill runs; you almost never type them yourself. Instead, ask the agent, in plain English, to run the next stage. The skill knows what script to invoke.

**Shortcut: hand the agent this guide.** Open your Claude Code or Codex session in your migration working directory and paste something like:

> *"Read this guide end-to-end: <https://github.com/Dicklesworthstone/je_private_skills_repo/blob/main/COMPREHENSIVE_GUIDE_TO_APPLYING_SLACK_TO_MATTERMOST_MIGRATION_SKILLS.md>. Then read the Phase 1 and Phase 2 skills. I'm planning a migration for [company name, user count, Slack plan tier]. Walk me through what I need to do before we start (server, domain, SMTP, tokens), then plan the full sequence of stages with me."*

The agent will produce a tailored checklist, tell you which tokens to collect, and pause before each destructive step. If you have a downloaded copy of this guide on disk, pass its path instead (e.g. `~/Downloads/COMPREHENSIVE_GUIDE_TO_APPLYING_SLACK_TO_MATTERMOST_MIGRATION_SKILLS.md`).

**Inside the Claude Code or Codex desktop app (Path A):**

1. Open the app and click the session that has your migration working directory selected (e.g. `~/slack-migration/acme`).
2. In the prompt box, type one of:
   - *"Use the slack-migration-to-mattermost-phase-1-extraction skill to run the `setup` stage."*
   - *"Run Phase 1 stage `enrich` and show me the validation report when it's done."*
   - *"Drive Phase 2 through the `provision`, `deploy`, `verify-live`, and `staging` stages. Pause after each and summarize what happened."*
3. The agent will run the scripts, stream their output into the session, and narrate what it's seeing. For anything that touches a live system (SSH to the server, import to production), it will pause and ask you to confirm before proceeding.
4. If the output contains a report file path (e.g. `workdir/artifacts/reports/verification.md`), click the path or drag it into the file-viewer pane to open it. The desktop app shows `.md` and `.json` reports with syntax highlighting.

**Inside the Claude Code or Codex CLI (Path B/C):**

1. Open a terminal, cd into your working directory, and run `claude` (or `codex`).
2. At the prompt, type the same kind of natural-language instructions as above. The agent will run scripts and show you output inline.
3. If you'd rather run a stage directly without the agent narrating, you can; just type the command, e.g. `./migrate.sh setup`. But the agent is also watching the logs and will catch errors you might miss, so prefer the agent path unless you have a reason not to.

**The "pause and confirm" pattern:**

Both Claude Code and Codex will pause before any action that touches a server (SSH, DB writes, HTTP POST to your Mattermost, etc.) and ask you to approve it. Read the command carefully before you approve, especially during Phase 2 cutover. You can approve a single action, a full run, or change your permission mode in the app's settings to "Ask every time" for peace of mind.

### When to say yes to a permission prompt

Non-technical operators find the permission prompts nerve-wracking because the command-line text is unfamiliar. Use this rule of thumb:

| Looks like | Decision |
|------------|----------|
| `./migrate.sh <stage>` or `./operate.sh <stage>` matching the stage you asked for | **Approve** |
| `ssh <user>@<your TARGET_HOST>` | **Approve** (confirm the hostname matches your `config.env`) |
| `mmctl <anything> --url https://<your MATTERMOST_URL>` | **Approve** (confirm the URL is yours) |
| `curl` to `jeffreys-skills.md`, `*.hetzner.com`, `*.cloudflare.com`, your own domain | **Approve** |
| `sudo apt install <package>` during `bootstrap-tools.sh` or `provision` | **Approve** |
| `psql` / `pg_dump` / `pg_restore` against `$POSTGRES_DSN` or `$SCRATCH_DB_URL` | **Approve** |
| `rm -rf /opt/mattermost` or any delete outside `workdir/` and `workdir-phase2/` | **Deny** and ask the agent why |
| `ssh <some hostname you don't recognize>` | **Deny** |
| Anything that reads `~/.ssh/id_*` and pipes it somewhere | **Deny and investigate** |
| A `git push` to a remote you didn't set up | **Deny** |
| Anything right after the agent has seemed confused | **Deny and ask the agent to re-read the prompt** |

When in doubt, type: *"Explain what this command does and why you're running it at this stage."* The agent will tell you, and you can decide.

### Keep your laptop awake during long stages

Phase 1 `enrich` and Phase 2 `staging` / `cutover` can run for 30 to 120 minutes. If your laptop sleeps mid-run, the SSH session dies and the stage aborts. Before kicking off a long stage:

- **macOS**: in a separate Terminal tab, run `caffeinate -dims` and leave it running. The laptop stays awake even with the lid closed (if you have an external display) or with the lid open and the screen dim. Ctrl+C to release when the stage is done.
- **Windows (PowerShell as Admin)**: run `powercfg /requestsoverride process powershell.exe DISPLAY SYSTEM AWAYMODE`. Reverse when done with `powercfg /requestsoverride process powershell.exe` (no flags).
- **Either platform, simplest option**: plug in power, disable sleep in system settings for the duration of the migration week, re-enable afterward.

The Claude Code and Codex desktop apps do not themselves prevent sleep. If the agent was running a command when the laptop slept, it will resume cleanly when you wake the laptop *if* the stage is one of the idempotent ones (see [Part 10.7](#107-resuming-an-interrupted-migration)); just ask the agent to re-run.

**If you get stuck, ask the agent in plain English.** *"What does the output of doctor.sh mean?"*, *"Is it safe to re-run enrich?"*, *"Explain the verification report to me in simple terms."* All of those work, and the agent has the skill's operator library (see Part 8) loaded as context so it can give you correct, skill-specific answers.

---

# Part 3: Driving Phase 1 (extraction and transformation)

Claude Code and Codex earn their keep here. The skill exposes an ordered set of stages, all accessible through `./migrate.sh <stage>` or, equivalently, by asking the agent to run the stage for you.

The canonical pipeline:

```
setup  ->  export  ->  enrich  ->  transform  ->  package  ->  verify  ->  handoff
```

You can run `./migrate.sh all` to do the whole thing; in practice most operators step through stage by stage and read the reports between each. That is what I recommend.

## 3.1 Set up the working directory

Pick a working directory with plenty of disk. For a 50-user workspace, 50 GB free is enough. For 1000 users with heavy file attachments, assume 500 GB to 1 TB.

```bash
mkdir -p ~/slack-migration/acme
cd ~/slack-migration/acme
cp ~/.claude/skills/slack-migration-to-mattermost-phase-1-extraction/config.env.example ./config.env
# Edit config.env; see the table below for minimum fields
$EDITOR config.env
```

Minimum fields for a Business+ / Track A run:

```bash
WORKSPACE_NAME="acme-slack"
SLACK_PLAN_TIER="Business+"
PHASE1_WORKSPACE_ROOT="./workdir"
MATTERMOST_TEAM_NAME="acme"                       # becomes the target team in Mattermost
MATTERMOST_TEAM_DISPLAY_NAME="Acme Corp"

# Fill one of these two blocks:
# (A) official export. Paste the path to the downloaded ZIP here once you have it.
SLACK_EXPORT_ZIP=""
SLACK_CHANNEL_AUDIT_CSV=""
SLACK_MEMBER_CSV=""
# (B) slackdump-primary. You will fetch tokens from a logged-in browser session.
# SLACK_TOKEN="xoxp-..."     # slack app user token, for enrichment API calls
# SLACKDUMP_PRIMARY="1"
```

Then run `./migrate.sh setup` (or ask Claude to do it). This creates the `workdir/artifacts/{raw,enriched,import-ready,reports}/` tree the rest of the pipeline expects, and re-runs `doctor.sh`-style tool checks so you find out now if something is missing.

## 3.2 Acquire the Slack export (stage: `export`)

There are three possible paths here. Work out which one you are on, then execute.

### 3.2.1 Track A: official admin export (recommended when available)

Slack has no public API to *trigger* a workspace export; it is a UI-only operation. Three ways to get past that:

- **Agent-driven via Playwright MCP (recommended).** If the Playwright MCP is registered (Phase 1's bootstrap script wires it up), just ask the agent: *"Open the Slack admin export page and kick off an export for the full date range. Wait for the email, grab the download URL, and pull the ZIP into `artifacts/raw/`."* The agent opens a browser session, clicks through, waits for the mail, and completes the intake. You approve the browser-control permission once.
- **Automated via `SLACK_EXPORT_AUTOMATION=1`.** Set a Slack session cookie in `config.env` and point the skill at an IMAP mailbox; `automate-official-export.py` does the POST, polls for the email, downloads the ZIP, hashes it, and writes provenance. This is the path for recurring baseline+delta cadences (a scheduled agent run every few hours during the rehearsal window). The full field list is in `config.env.example`.
- **Fully manual (only if the above two fail).** Click through the Slack admin UI yourself, wait for the email, download the ZIP, tell the agent where you saved it. The agent picks up from there and runs `./migrate.sh export` to hash the file and write `manifest.raw.json`.

Regardless of which sub-path the agent uses, by the end of this step the working directory has:

```
workdir/artifacts/raw/
├── slack-export.zip           # hashed
├── channel-audit-YYYY-MM-DD.csv   # hashed
├── member-list-YYYY-MM-DD.csv     # hashed (if available)
└── manifest.raw.json          # names every file + its SHA256
```

### 3.2.2 Track B: slackdump as primary (Pro / Free, or official export unavailable)

Set `SLACKDUMP_PRIMARY=1` in `config.env`. Obtain either a Slack App `xoxp-` user token (preferred) or extract a `xoxc-` / `xoxd-` pair from a logged-in browser (`AUTHENTICATION.md` explains the exact Chrome DevTools steps). Put the token(s) into `config.env`.

Then:

```bash
./migrate.sh export
```

`run-slackdump-export.sh` walks the authenticated account's view of the workspace, downloads messages and files for every channel / DM that account can see, zips it up, and hashes it. This is a *partial view*: slackdump can only see what the logged-in account can see. Private channels the account is not a member of, DMs the account is not a party to, and messages in channels that predate the account's join date are all invisible. The skill captures this reality in `unresolved-gaps.md` later; your job now is to run the export and not pretend it sees more than it does.

### 3.2.3 Track C: Enterprise Grid with per-workspace export

Grid admins can request either a grid-wide export (one giant file) or per-workspace exports (one per team). Per-workspace is cleaner. If you get a grid-level export, the skill's `split-phase1-import.py` + `ENTERPRISE-GRID-WORKSPACE-SPLIT-WORKFLOW.md` reference handles splitting it for you.

### Common: channel-audit CSV and member-list CSV

Both of these are available from the same admin area (`Workspace settings → Security`). Download them at the same time as the export ZIP and put their paths into `SLACK_CHANNEL_AUDIT_CSV` and `SLACK_MEMBER_CSV`. The channel-audit CSV is what the reconciliation validator uses to cross-check channel counts; without it the validator warns but cannot block. The member-list CSV preserves SSO-linked email addresses, which is how Slack users get matched to Mattermost accounts at import time.

### Common: Workflow Builder JSON

Supported workflows can be exported as JSON individually from **Settings → Workflows**. There is no bulk export. For each workflow that still matters operationally, export it and drop it into a directory. Reference that directory in `PHASE1_WORKFLOW_INPUTS` (comma-separated paths) so `extract-phase1-sidecars.py` preserves them. Workflows cannot be imported to Mattermost automatically; they are preserved as an archival artifact and later rebuilt as Mattermost Playbooks or slash commands in post-cutover ops.

## 3.3 Enrich the export (stage: `enrich`)

Official Slack exports contain file **links**, not the files themselves, and those links expire. The `enrich` stage downloads every `url_private` referenced in the export and bakes the bytes into the enriched ZIP so your imported Mattermost doesn't end up with a sea of dead attachment placeholders. The agent runs this stage unattended; for a typical workspace it's 1 to 6 hours of background downloading. You don't need to watch it.

```bash
./migrate.sh enrich
```

What runs under the hood:

1. `run-slack-advanced-exporter.sh fetch-emails`: resolves Slack user IDs to email addresses via the API, rewriting `users.json` in place inside a copy of the ZIP. Requires a `xoxp-` token with `users:read.email`.
2. `run-slack-advanced-exporter.sh fetch-attachments`: walks every message's `files[]` and downloads the bytes into `__uploads/F<id>/<filename>` inside the enriched ZIP. Also requires `xoxp-` with `files:read`.
3. `export-custom-emoji.py`: hits Slack's `emoji.list` API, downloads every custom emoji image, writes a manifest plus an alias map.
4. `extract-phase1-sidecars.py`: pulls canvases, lists, `integration_logs.json`, and any admin CSV / workflow JSON you pointed at via `PHASE1_SIDECAR_INPUTS` or `PHASE1_WORKFLOW_INPUTS` into a sidecar bundle.
5. `build-artifact-manifest.py`: rewrites `manifest.enriched.json` with hashes for all new artifacts.

The ordering matters. Emails before attachments because `mmetl` uses the email-rewritten `users.json` to generate user records. Attachments before sidecars because the sidecar extractor wants to know what was covered natively so it does not duplicate.

When this stage finishes, run `scripts/validate-enrichment-completeness.py --archive workdir/artifacts/enriched/slack-export.enriched.zip --output-json /tmp/enrich.json` and read the report. A non-empty `missing_file_references` array (the operator cards call this "attachments_missing") means a file was referenced but could not be downloaded, usually because it had already expired or the account lost access. You need to decide whether each of those is acceptable (mark as `unrecoverable` gap) or worth re-running.

## 3.4 Transform to Mattermost bulk-import format (stage: `transform`)

```bash
./migrate.sh transform
```

This runs `mmetl check slack` (which exits nonzero if the ZIP is corrupt or has a version Slack has changed under you) and then `mmetl transform slack` with the flags needed to produce JSONL output plus an `data/bulk-export-attachments/` directory.

Key `mmetl` flags the skill sets:

- `--team "$MATTERMOST_TEAM_NAME"`: target team name
- `--default-email-domain`: only if `MMETL_DEFAULT_EMAIL_DOMAIN` is set (use when some Slack users have no email; mmetl will fabricate `<username>@<domain>` for them)
- `--skip-empty-emails`, `--discard-invalid-props`: passed via `MMETL_EXTRA_FLAGS` if needed
- `--attachments-dir data/bulk-export-attachments`: forces binary files to land in the canonical import location

Important: **mmetl is Linux and macOS only**. Running it on Windows corrupts the JSONL. The bootstrap script does not install a mmetl Windows binary for this reason. If you are on Windows, either use WSL or run Phase 1 on a Mac or Linux machine and SCP the result.

## 3.5 Patch and package (stage: `package`)

`mmetl` gets you close but not all the way. Three things still need patching into the JSONL:

1. Custom emoji objects (must go before the first `team` line).
2. Archive channels for sidecar content (`slack-canvases-archive`, `slack-lists-archive`, `slack-export-admin`), and a post per canvas, list, or admin artifact that attaches the sidecar file.
3. User membership into those archive channels (otherwise no one can see them in Mattermost).

```bash
./migrate.sh package
```

This runs `patch-phase1-import.py` (which does the above) and `package-phase1-import.py` (which zips the JSONL plus the attachments tree plus emoji images plus sidecars into `mattermost-bulk-import.zip` and writes `manifest.import-ready.json`).

The names of the archive channels are configurable through `PHASE1_SIDECAR_CHANNELS`; the default is the three listed above. You can also pick a specific `PHASE1_ARCHIVE_USER` who will be the "author" of the sidecar posts (defaults to the first admin it finds in the export).

## 3.6 Verify and build the evidence pack (stage: `verify`)

```bash
./migrate.sh verify
```

This is the most important stage because it catches silent data loss. It runs five validators:

1. **`validate-phase1-artifacts.py`**: hashes in `manifest.*.json` match the files on disk; required artifacts (ZIP, CSV, JSONL, final ZIP) all exist.
2. **`validate-phase1-jsonl.py`**: JSONL is well-ordered (version first, then emoji, team, channel, user, post, direct_channel, direct_post), every `thread_ts` reference is to an earlier post, every channel has at least one member, counts for users, channels, and posts are non-zero.
3. **`validate-enrichment-completeness.py`**: every `files[]` entry in the enriched ZIP has a downloaded binary, every user in `users.json` has an email (or a documented exception).
4. **`reconcile-phase1-counts.py`**: message counts across raw ZIP, enriched ZIP, channel-audit CSV, and JSONL all agree within tolerance. Channels present in the audit CSV but missing from the JSONL are reported as discrepancies with severity.
5. **`export-integration-inventory.py`**: parses `integration_logs.json` and emits `integration-inventory.md`, a concrete list of bots, webhooks, and apps that must be rebuilt in Mattermost post-cutover. (Slack integrations do not migrate.)

Then it assembles the evidence pack (`build-migration-evidence-pack.py`) and runs the secret scanner (`scan-and-redact-migration-secrets.py`) across `workdir/artifacts/reports/` and `config.env`. The scanner writes a findings JSON; if it exits nonzero, it found a secret somewhere in your generated reports and you should decide whether to redact and re-share or accept the finding.

At the end of this stage, open `workdir/artifacts/reports/verification.md` and read it. If any reconciliation line item is red, **stop and resolve it before handoff**. The Phase 2 skill will reject a handoff with unresolved criticals; fixing it now is easier than fixing it mid-cutover.

## 3.7 Handoff (stage: `handoff`)

```bash
./migrate.sh handoff
```

Emits the three artifacts Phase 2 needs to trust your bundle:

- `handoff.md`: human-readable summary for you and the war room.
- `handoff.json`: the machine-readable contract. Contains `schema_version`, `generated_at`, `workspace`, `plan_tier`, `export_basis`, `final_package.path`, `final_package.sha256`, `jsonl_path`, `manifests[]`, `counts{users,channels,posts,direct_channels,direct_posts,emoji,attachments}`, `sidecar_channels[]`, and `known_gaps[]`.
- `unresolved-gaps.md`: one entry per classified gap, each with a disposition class (`native-importable` / `sidecar-only` / `manual-rebuild` / `unrecoverable`). This document is the closest Phase 2 and your users will get to "what is NOT in the imported Mattermost."

The final ZIP is at `workdir/artifacts/import-ready/mattermost-bulk-import.zip`. Its SHA256 is in `manifest.import-ready.json` and, crucially, also in `handoff.json.final_package.sha256`. Phase 2 will refuse to import a ZIP whose hash does not match the handoff's claimed hash, no matter how close the other metadata is.

You are done with Phase 1. Close the skill session if you like; all state is on disk.

---

# Part 4: Driving Phase 2 (deploy, rehearse, cutover)

Phase 2 runs from the same workstation as Phase 1. It does not need the Phase 1 ZIP to still exist on disk as long as `HANDOFF_JSON` points at a readable location with the final ZIP reachable from there. In practice, just stay in the same working directory.

Open a fresh Claude Code / Codex session (context from Phase 1 is not needed) and cd to the Phase 2 skill directory, or symlink its `operate.sh` into your working directory. Copy the config template:

```bash
cd ~/slack-migration/acme
cp ~/.claude/skills/slack-migration-to-mattermost-phase-2-setup-and-import/config.env.example ./config.env.phase2
# Copy over from Phase 1 what is shared:
echo "HANDOFF_JSON=$(pwd)/workdir/artifacts/reports/handoff.json"    >> ./config.env.phase2
echo "IMPORT_ZIP=$(pwd)/workdir/artifacts/import-ready/mattermost-bulk-import.zip" >> ./config.env.phase2
# Edit to fill in Mattermost URL, admin creds, DB DSN, SMTP, server target, rollback owner.
$EDITOR ./config.env.phase2
```

Then in that session:

```bash
export PHASE2_CONFIG=./config.env.phase2
```

Or symlink it to `./config.env` in the Phase 2 skill directory if you prefer.

Minimum fields for a typical VPS deployment with a self-hosted PostgreSQL on the same box:

```bash
WORKSPACE_NAME="acme-slack"
PHASE2_WORKSPACE_ROOT="./workdir-phase2"
HANDOFF_JSON="<abs path>"
IMPORT_ZIP="<abs path>"

MATTERMOST_URL="https://chat.acme.com"
MATTERMOST_ADMIN_USER="admin"
MATTERMOST_ADMIN_PASS="<strong random password>"
MATTERMOST_TEAM_NAME="acme"

TARGET_HOST="chat.acme.com"   # or the raw IP if DNS isn't set up yet
TARGET_SSH_USER="root"        # root initially; the provisioner will create a deploy user
DEPLOY_METHOD="apt"           # "apt" for production, "docker" for staging
PROVISION_MODE="ssh"
DEPLOY_MODE="ssh"

# local Postgres in the default path:
POSTGRES_DSN="postgres://mmuser:<strong random password>@localhost:5432/mattermost?sslmode=disable"
SMOKE_DATABASE_URL="${POSTGRES_DSN}"   # same DSN for smoke tests

# SMTP is required for user activation:
SMTP_SERVER="smtp.postmarkapp.com"
SMTP_PORT="587"
SMTP_USERNAME="<postmark-token>"
SMTP_PASSWORD="<postmark-token>"
SMTP_TEST_EMAIL="admin@acme.com"      # your email, for activation proof

# Cloudflare edge (optional but recommended):
CLOUDFLARE_ENABLED="1"
CLOUDFLARE_MODE="plan"                # "plan" prints, "execute" uses CF API
CLOUDFLARE_API_TOKEN="<zone edit token>"
CF_ZONE_ID="<zone id for acme.com>"
ORIGIN_SERVER_IP="<IP address>"

ROLLBACK_OWNER="Jane Admin"            # named human responsible for pulling the trigger
```

Then the pipeline:

```
intake  ->  render-config  ->  edge  ->  provision  ->  deploy  ->  verify-live
        ->  staging  ->  restore  ->  ready  ->  cutover
```

## 4.1 Intake the Phase 1 handoff (stage: `intake`)

```bash
./operate.sh intake
```

This runs `build-phase2-intake-manifest.py` (snapshots the handoff + final ZIP to the Phase 2 workdir and hashes them) and `validate-phase2-intake.py` (verifies `handoff.json` is well-formed, the hash claimed inside matches the ZIP on disk, and the sidecar channel list is explicit). Output: `workdir-phase2/reports/phase2-intake-report.json`.

If this fails, do not try to force through. The typical failure modes are:

- the ZIP moved between phases and the hash no longer matches → re-copy or re-run Phase 1's `handoff`;
- `sidecar_channels[]` is empty but Phase 1 produced sidecars → bug in your Phase 1 config. Re-run `./migrate.sh handoff`.

## 4.2 Render config (stage: `render-config`)

```bash
./operate.sh render-config
```

Emits `workdir-phase2/rendered/config.json` (Mattermost server config), `workdir-phase2/rendered/mattermost.nginx.conf` (Nginx vhost), and `workdir-phase2/reports/config-validation.json`. The rendered `config.json` contains everything the import needs:

- `SiteURL` = `$MATTERMOST_URL`
- `ListenAddress` = `127.0.0.1:8065` (never exposed directly)
- `SqlSettings.DataSource` = `$POSTGRES_DSN`
- `MaxPostSize` = 16383 (Slack allows 40000; default 4000 would truncate)
- `MaxFileSize` = 52428800 (50 MB)
- `EnableOpenServer` = true (required for bulk import to create users)
- `EnableSignUpWithEmail` = true + `RequireEmailVerification` = false (so imported users can reset password without pre-verifying email they haven't seen yet)
- SMTP block from `$SMTP_*`
- `AllowCorsFrom` = whatever you put in `ALLOW_CORS_ORIGINS`, if you are fronted by more than one hostname

Read `config-validation.json` and make sure it says `"status": "ready"`. If it flags an import-critical setting (e.g. `MaxPostSize` not 16383), fix `config.env` and re-run.

## 4.3 Cloudflare edge (stage: `edge`)

```bash
./operate.sh edge
```

Only runs if `CLOUDFLARE_ENABLED=1`. In `plan` mode it prints the DNS records and origin-CA cert it *would* create. In `execute` mode (requires an `Edit` scoped `CLOUDFLARE_API_TOKEN`) it calls the Cloudflare API to:

1. Create / update `chat.acme.com` A record pointing at `$ORIGIN_SERVER_IP`, orange-clouded (proxied).
2. Generate a 15-year Cloudflare Origin CA certificate for `chat.acme.com`, save it to `workdir-phase2/rendered/origin.{pem,-key.pem}`. The subsequent `deploy` stage will SCP these onto the server.
3. Optionally create a second DNS-only (grey-clouded) record `calls.acme.com` for the Calls plugin's UDP traffic (UDP 8443); Cloudflare cannot proxy UDP.

If you skip this stage, you are responsible for putting a valid cert at `/etc/nginx/ssl/origin.pem` on the server yourself. Using Let's Encrypt directly on the origin is fine too; just set `NGINX_CERT_PATH` and `NGINX_KEY_PATH` accordingly and leave `CLOUDFLARE_ENABLED=0`.

## 4.4 Provision the host (stage: `provision`)

```bash
./operate.sh provision
```

Generates `provision-host.sh` (plan script) and, in `ssh` mode, executes it over SSH against `TARGET_HOST`. What the plan does:

1. `apt-get install -y curl jq nginx ufw fail2ban unattended-upgrades postgresql-client` (or `postgresql` too, when `PROVISION_DATABASE_MODE=local` or `auto` + `POSTGRES_DSN` is localhost).
2. Opens UFW for 22/tcp, 80/tcp, 443/tcp, 8443/udp (Calls). Enables UFW.
3. Enables `fail2ban` and `unattended-upgrades`.
4. If local Postgres is provisioned, creates the Mattermost role + database from the DSN credentials.

Runs in `plan` mode first (just prints the script) if you want to eyeball it. `ssh` mode reads the DSN envs, packages them into a one-shot bash invocation, and pipes the plan script over SSH for execution. The target must have Python3 (used for parsing DSN components; the plan script embeds a small Python snippet).

After this stage, `systemctl status fail2ban` and `sudo ufw status verbose` on the target should show both services active. `/etc/postgresql/*/main/pg_hba.conf` should be default (peer / md5). If you chose Supabase or another managed PG, this step is a no-op for DB and only does the ufw, fail2ban, and apt parts.

## 4.5 Deploy Mattermost + Nginx (stage: `deploy`)

```bash
./operate.sh deploy
```

Runs `deploy-mattermost-stack.sh` in whichever mode you set. For APT:

1. `curl -o- https://deb.packages.mattermost.com/repo-setup.sh | bash -s mattermost`
2. `apt-get install -y mattermost nginx`
3. Install the rendered `config.json` to `/opt/mattermost/config/config.json` with `0600 mattermost:mattermost`.
4. Install the rendered `mattermost.nginx.conf` to `/etc/nginx/sites-available/mattermost.conf`, symlink into `sites-enabled/`, install origin cert + key to `/etc/nginx/ssl/origin.{pem,-key.pem}` if present.
5. `nginx -t` then `systemctl enable --now nginx` and `systemctl enable --now mattermost`.

For Docker deploys (staging), it pulls `mattermost/mattermost-team-edition:latest`, runs it with `--network host`, mounts `config/` and `data/` volumes, and fronts it with the same Nginx config. Docker is NOT recommended for production HA (Mattermost's own docs say so); use APT for anything that needs to scale beyond a single node.

**If the target is a newer Ubuntu (25.10, codename `questing`) where the Mattermost APT package isn't available yet**, the repo-setup will succeed but `apt install mattermost` will fail. The skill's exact-flow validation has hit this; the fix is to fall back to `DEPLOY_METHOD=docker`. Do this by editing `config.env.phase2` and re-running `./operate.sh deploy`.

## 4.6 Verify live stack (stage: `verify-live`)

```bash
./operate.sh verify-live
```

Three HTTPS probes against your `MATTERMOST_URL`, each with 6 retries and 5 seconds between to absorb the initial JIT startup:

1. `GET /api/v4/system/ping` → expect 200 + JSON `{"status":"OK"}`
2. WebSocket upgrade against `/api/v4/websocket` → expect 101 Switching Protocols
3. SMTP reachability: TCP connect to `$SMTP_SERVER:$SMTP_PORT` + STARTTLS negotiation

If `CLOUDFLARE_ENABLED=1`, also runs `verify-cloudflare-edge.py` which checks:
- DNS A record resolves and is proxied
- Cloudflare TLS offers a Cloudflare-issued cert (i.e. traffic is going through CF, not hitting origin directly)
- Origin cert is installed and has not expired
- `calls.yourdomain.com` (if set) is DNS-only, not proxied

Read `live-stack.md`, the human-readable summary. Anything red here needs resolving before staging. Typical failures:
- WebSocket fails → Nginx config missing the `Upgrade`/`Connection: upgrade` location block; `render-config` should have emitted it, so check that the deploy picked up the rendered file.
- SMTP fails → your SMTP provider is blocking port 587 for new accounts, or the credentials are wrong. Test with `swaks --to $SMTP_TEST_EMAIL --from $SMTP_FROM --server $SMTP_SERVER:$SMTP_PORT --auth-user $SMTP_USERNAME --auth-password $SMTP_PASSWORD` to isolate.

## 4.7 Staging rehearsal (stage: `staging`)

This is the single most valuable stage in Phase 2. You do it at least once before production cutover.

```bash
./operate.sh staging
```

Safety: `run-staging-rehearsal.sh` refuses to run against a URL that looks like production unless `ALLOW_NON_STAGING=1`. The default heuristic: URL is `http://localhost:*`, `http://127.0.0.1:*`, or contains the string `staging`.

### Recommended staging path for non-technical operators: a second cheap VPS

The simplest, safest staging target is a second VPS that mirrors your production server at ~$4 to $10/month, kept alive only for the rehearsal window.

1. **Order a staging VPS.** Hetzner CX22 (€4/month), Contabo VPS S ($4/month), or OVH VLE-1. Same Ubuntu 24.04 LTS, same SSH key you're already using. Provisioning is minutes, not hours (these are virtualized, not dedicated).
2. **Add a DNS record** for `staging.chat.yourcompany.com` pointing at the staging VPS's IP. DNS-only (grey-clouded) is fine; you don't need Cloudflare's edge in front of it.
3. **Copy your production `config.env.phase2`** to `config.env.phase2.staging` and override three fields:
   ```bash
   STAGING_URL="https://staging.chat.acme.com"
   TARGET_HOST="staging.chat.acme.com"
   MATTERMOST_URL="${STAGING_URL}"
   ```
4. **Run the full Phase 2 pipeline** against the staging VPS: `PHASE2_CONFIG=./config.env.phase2.staging ./operate.sh intake render-config provision deploy verify-live staging`. The skill provisions the VPS, deploys Mattermost, imports your bundle, and reconciles counts, doing exactly what production will do, at full scale, on separate hardware.
5. **After cutover is confirmed green on production**, cancel the staging VPS. Total cost for a 2-week rehearsal window: under $10. You get a full-scale dress rehearsal of both provisioning and import.

This is simpler than Docker on your laptop, and more realistic because the staging environment is a real server with a real DNS record, real TLS, real SMTP, and real SSH.

### Alternative: Docker staging on your laptop (advanced)

If you'd rather not rent a second VPS and you're comfortable with Docker, you can stand up a Mattermost container locally and point `STAGING_URL` at `http://127.0.0.1:8065`. `DEPLOY_METHOD=docker` does this for you; see the skill's `references/DOCKER-STAGING.md`. This avoids the VPS cost but tests only the import path, not the provisioning path, and may not reveal provisioning bugs that only show up on a real server.

What it does:

1. `mmctl auth login` with `MATTERMOST_ADMIN_USER` and `MATTERMOST_ADMIN_PASS`.
2. `mmctl import upload`: streams the final ZIP onto the server into `/opt/mattermost/data/imports/`.
3. `mmctl import list available --json`: parses the uploaded filename.
4. `mmctl import process <filename>`: kicks off the import job.
5. `monitor-import.sh`: polls `mmctl import job show --json` every few seconds, writing one JSONL line per poll to `import-watch.*.jsonl`, until the job hits `success` or `error`.
6. Post-import smoke tests: `run-import-smoke-tests.py` hits PostgreSQL directly (or via SSH when the DB port is local only) and counts `users`, `channels`, and `posts`. `reconcile-handoff-vs-import.py` compares those against `handoff.json.counts`. Anything missing is logged as a discrepancy.

If `ENABLE_LOCAL_MODE=1` and `TARGET_HOST` are both set, `operate.sh` materializes an SSH-backed `mmctl` wrapper that drives the server-bundled `mmctl --local` over SSH. That's the exact-flow path that works against a remote Mattermost even when you don't have `mmctl` on your laptop.

When this stage finishes green (meaning `workdir-phase2/reports/latest-staging.json` has `status == "success"` and observed counts match expected), you have proved:
- The ZIP imports cleanly in your exact configuration.
- User, channel, and post counts land where Phase 1 claimed they would.
- The SSH, DB, and mmctl plumbing all work end to end.

If it fails, the `note` field in `latest-staging.json` tells you what went wrong. Common ones:
- "mmctl import process failed": check `import-watch.*.jsonl` for mmetl errors, usually truncated posts or missing user emails.
- "post-import smoke tests failed": counts don't match. Either Phase 1 is wrong (go back) or mmctl swallowed part of the import (check Mattermost's `/opt/mattermost/logs/mattermost.log`).

## 4.8 Restore drill (stage: `restore`, optional but recommended)

```bash
./operate.sh restore
```

Before cutover, prove that your backup strategy works. Configure `BACKUP_PATH` and `SCRATCH_DB_URL` (a *different* Postgres you can safely restore into). The script `restore-drill.sh` runs `pg_restore` into the scratch DB and reports on success. An un-restored backup is not a backup; it's wishful thinking. Do the drill.

This stage is not strictly blocking for `ready`, but the readiness gate will flag an unproven restore path. For a real production cutover, unblock it.

## 4.9 Compute readiness (stage: `ready`)

```bash
./operate.sh ready
```

Runs `validate-cutover-readiness.py`, `generate-readiness-score.py`, and `generate-phase2-readiness.py` to produce a fail-closed gate:

- `cutover-readiness.json.status` is `ready` or `blocked`.
- `readiness-score.md` gives you the rubric with per-category scores (intake, config, live, staging, smoke, reconciliation, restore, activation-ready, edge).
- `phase2-readiness.md` is the war-room summary. Paste it into Slack, Teams, or Mattermost on the morning of cutover.

The gate is *fail-closed*. If `ROLLBACK_OWNER` is unset or any input report is missing, it blocks. Fix the gap, re-run. This is intentional.

## 4.10 Cutover (stage: `cutover`)

Only run this after `ready` says green and the war room has explicitly called go.

```bash
./operate.sh cutover
```

Under the hood, `execute-production-cutover.sh` runs the same import-upload-process-monitor loop as staging, plus:

1. Post-import smoke (against production DB).
2. Reconciliation vs. handoff (production observed counts).
3. Activation proof: if `SMTP_TEST_EMAIL` is set, triggers a password-reset flow for that user against the live Mattermost and confirms the email arrives and the reset link resolves to `https://chat.acme.com/reset_password`.

Outputs land in `workdir-phase2/reports/cutover/` as timestamped files. The final `cutover-status.<timestamp>.json.status` (grab the newest one with `ls -t workdir-phase2/reports/cutover/cutover-status.*.json | head -1`) is `success` or `failed`. Activation proof lands in `workdir-phase2/reports/latest-activation.json`. If `failed`, read the note, decide: is this fixable in place, or time to roll back?

**Rollback**:

```bash
ROLLBACK_CONFIRMATION="I_UNDERSTAND_THIS_RESTORES_BACKUPS" ./operate.sh rollback
```

The phrase is required verbatim by `rollback-cutover.sh`. The script refuses to run without it, on purpose: rollback restores the DB and optionally `/opt/mattermost/config` and `/opt/mattermost/data`, which is destructive.

## 4.11 The Slack → Mattermost cutover day sequence

A typical cutover day looks like this, with the skill handling the mechanical parts and you handling the announcements:

1. **T − 24 h**: freeze Slack integrations (deactivate bots that auto-post). Send the first user announcement: "Tomorrow we move to Mattermost at 10 AM. Slack will go read-only at 09:30. Please log in at `https://chat.acme.com/reset_password` using your Slack email starting at 10:15."
2. **T − 1 h**: final Phase 1 delta export (see 4.12 below). Import is idempotent so re-running does not double-post; it only catches new messages.
3. **T − 15 min**: make Slack read-only. (In Slack admin: *Workspace settings → Permissions → Messages & files → disable posting for everyone except admins*.)
4. **T = 0**: `./operate.sh cutover`.
5. **T + cutover window end**: confirm the newest `workdir-phase2/reports/cutover/cutover-status.<timestamp>.json` has `status == "success"`. Send the activation announcement.
6. **T + 1 h**: monitor `/opt/mattermost/logs/mattermost.log` and the help desk. Watch for bounced password-reset emails, locked-out users, broken mentions.
7. **T + 1 day**: check activation count (`mmctl user list --all --json | jq 'length'`). Nudge any users who haven't activated.
8. **T + 7 days**: revoke the Slack migration app's tokens, delete the Slack admin app. Archive the Phase 1 / Phase 2 workdirs to long-term storage as the evidence pack.

## 4.12 Baseline + deltas pattern

For workspaces that take more than a day to export and transform, use the baseline-plus-deltas pattern:

1. **Baseline**: run the full Phase 1 pipeline at T − several days. Do the Phase 2 staging rehearsal. Do NOT do production cutover yet.
2. **Delta N**: periodically (every few hours or once a day), re-run Phase 1 with the same source ZIP path but a different `WORKSPACE_NAME` suffix, or point it at a new export covering only the recent date range. Run `./operate.sh staging` against production; since Mattermost import is idempotent, this just catches new messages without duplicating old ones.
3. **Final delta**: at T − 0, one last Phase 1 + Phase 2 staging run. Then `./operate.sh cutover` (which is now essentially a no-op import of any final messages).

The Phase 1 skill has `DELTA-CADENCE-WORKFLOW.md` documenting the scheduled export setup. Business+ also supports Slack-side *scheduled recurring exports*, which are the cleanest way to get deltas; turn that on and combine with `SLACK_EXPORT_AUTOMATION=1`.

## 4.13 What cutover day looks like on your screen (minute by minute)

Non-technical operators find cutover day easier when they know exactly what to expect. Here is what you'll see in the Claude Code or Codex desktop app between T-1h and T+30min, assuming a 340-user workspace like Acme Corp.

**T − 60 min: preflight readiness re-check**

You paste: *"Run Phase 2 stage `ready` against production and show me the readiness score."*

You'll see:
- A short log block: "Reading `handoff.json`... loaded. Checking `latest-staging.json`... status=success. Checking `latest-smoke.json`... counts match. Checking `latest-reconciliation.json`... diffs=[]. Checking `ROLLBACK_OWNER`... set to 'Jane Admin <jane@acme.com>'."
- A final line: `cutover-readiness.json.status = "ready"`.
- A rendered `readiness-score.md` in the app's file-viewer pane with category scores (intake: 10/10, config: 10/10, etc.). All green.

If any category is yellow or red, the agent will stop and tell you why. Do not proceed past this point with anything red.

**T − 15 min: freeze Slack, post the freeze notice**

You do this yourself in a browser tab, not in the agent. Slack admin → Workspace settings → Permissions → Messages & files → disable posting for everyone except admins. Post the T-15m comms template from [10.4](#104-user-communications-kit) into #general.

**T = 0: kick off the cutover**

You paste: *"Run Phase 2 stage `cutover` against production. Pause before any destructive step and explain it to me."*

The agent will ask for your approval in roughly this sequence (exact number of prompts depends on your config; expect 6 to 10):

| Prompt | What it's doing | Decision |
|--------|-----------------|----------|
| `ssh deploy@chat.acme.com 'sudo systemctl status mattermost'` | Sanity-check Mattermost is up on the target | Approve |
| `mmctl auth login --url https://chat.acme.com ...` | Authenticating to your production Mattermost as admin | Approve |
| `mmctl import upload --url https://chat.acme.com mattermost-bulk-import.zip` | Streaming the 22 GB ZIP to the server | Approve |
| `mmctl import list available --json` | Reading back what just landed | Approve |
| `mmctl import process <filename>` | Starting the import job | Approve (this is the moment of commit) |
| `ssh deploy@chat.acme.com 'tail -f /opt/mattermost/logs/mattermost.log'` | Tailing the server log for the import duration | Approve |
| (post-import) `psql "$POSTGRES_DSN" -c 'SELECT COUNT(*) FROM users'` | Counting imported users | Approve |
| (post-import) `curl -sf https://chat.acme.com/api/v4/system/ping` | Verifying Mattermost is still serving | Approve |

Between the "import process" and "post-import count" prompts is the longest wait. For a 340-user workspace with ~1.3 M posts, expect ~15 to 30 minutes. You'll see a live stream of lines in the session:

```
{"ts":"...","state":"pending","progress":0}
{"ts":"...","state":"running","progress":0.12,"posts_imported":154000}
{"ts":"...","state":"running","progress":0.45,"posts_imported":578000}
...
{"ts":"...","state":"success","progress":1.0,"posts_imported":1284903}
```

Each of those lines is written to `workdir-phase2/reports/cutover/import-watch.*.jsonl` so you can re-read them later.

**T + ~20 min: reconciliation and activation**

After the import finishes, the agent automatically runs the smoke tests and reconciliation. You'll see:

```
reconcile-handoff-vs-import.py: observed 337 users / 142 channels / 1284903 posts
                                 handoff 337 users / 142 channels / 1284903 posts
                                 status: ok (diffs: [])
activation: sending password-reset to admin@acme.com...
activation: reset_link_received = true (proof in latest-activation.json)
cutover-status.2026-04-22T14-31-04Z.json written
status: success
```

If status is `success`, you're done with the mechanical part. Send the activation comms template.

**T + 30 min: confirm for yourself**

In a new browser tab, go to `https://chat.acme.com/reset_password`, enter your own Slack email, click the link in your email, set a password, and log in. You should see #general populated with your Slack history. This is the single highest-confidence check, and it takes 90 seconds.

**If any step fails during this sequence**, the agent stops and shows you the error. Three common ones:

- **"mmctl import upload: 413 Request Entity Too Large"**: your Nginx `client_max_body_size` is too small. Edit `/etc/nginx/sites-enabled/mattermost.conf` to raise it to `client_max_body_size 25G;` and `sudo systemctl reload nginx`. Ask the agent to do this for you.
- **"import job state=error note='user foo@bar.com invalid email'"**: a user record slipped through without a valid email. Usually it's a bot. Either set `MMETL_DEFAULT_EMAIL_DOMAIN` in Phase 1 and re-run from `transform`, or manually delete that user from the JSONL and re-import.
- **"activation: reset_link_received = false"**: SMTP is not working. Test with swaks (see [10.14](#1014-smtp-postmark-walkthrough)). This does not block cutover success, but users can't activate until you fix it. Fix and re-run only the activation helper, not the full cutover.

**What the agent's approvals look like in the UI**

In the Claude Code desktop app, each approval shows up as a card in the main pane with:
- A command (grey monospace)
- Its working directory (usually your `~/slack-migration/acme`)
- Three buttons: **Approve once**, **Approve for the rest of the session**, **Deny**

Pick **Approve once** for each destructive step during cutover. **Approve for the rest of the session** is fine during `enrich` (which is idempotent and read-only to Slack), but risky during `cutover` (one approval then covers everything after, including things you haven't seen the command for yet).

---

# Part 5: Post-cutover week

The skills hand off a working Mattermost. Users still need to activate, integrations still need to be rebuilt, and ops still needs to converge.

## 5.1 Activation

Users receive the password-reset link via `$MATTERMOST_URL/reset_password`. To track activation rate, paste into the agent:

> *"What's the current activation rate on Mattermost? List users who still haven't logged in."*

The agent runs the relevant `mmctl user list` query for you and gives you a count plus a list. Ask it to filter by team, by date, or by email domain if you want a narrower slice.

If activation is under 50% by T + 48 h, send a reminder (templates in [Part 10.4](#104-user-communications-kit)). If under 80% by T + 7 days, paste:

> *"For everyone who hasn't activated, generate a temporary password, then email each of them with their password and the login URL. Show me the list before you send."*

The agent generates passwords via `mmctl user change-password`, composes the emails, and sends via your Postmark SMTP, pausing for you to review the list before anything goes out.

Enable the `Calls` plugin on day 1 if voice or video matters; it needs its own UDP 8443 and a DNS-only record for `calls.acme.com`. See `references/CALLS-PLUGIN.md` for exact config.

## 5.2 Rebuilding integrations

`workdir/artifacts/reports/integration-inventory.md` is your checklist. Typical categories:

- **Incoming webhooks (Slack → Slack)**: recreate one Mattermost incoming webhook per Slack one. Update the sender service (GitHub / Datadog / whatever) to POST to the new URL.
- **Outgoing webhooks**: same trigger words, new endpoint.
- **Slash commands**: recreate. Mattermost's trigger-word matching is different from Slack's; test each one.
- **Bot users**: Mattermost bot framework is fine, or use a personal access token for light use cases.
- **Custom apps**: port to Mattermost's Plugin API (Go-native) or Apps Framework (HTTP + manifest).

For each one: add a line to a tracking doc, assign an owner, verify it works, close it out.

## 5.3 Backups and monitoring

Set up `pg_dump` to run nightly and ship to off-site (Hetzner Storage Box or Cloudflare R2). Example cron:

```bash
# on the server, as deploy user
cat > /home/deploy/backup-mattermost.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
DATE=$(date +%Y%m%d)
pg_dump -U mmuser mattermost | gzip > /var/backups/mattermost/mm_${DATE}.sql.gz
find /var/backups/mattermost -name 'mm_*.sql.gz' -mtime +30 -delete
rclone copy /var/backups/mattermost/mm_${DATE}.sql.gz r2:mm-backups/
EOF
chmod +x /home/deploy/backup-mattermost.sh
(crontab -l 2>/dev/null; echo "0 3 * * * /home/deploy/backup-mattermost.sh") | crontab -
```

Enable Mattermost metrics on port 8067, scrape with Prometheus, dashboard with Grafana. Mattermost recommends running those off-box. The server itself should have fail2ban alerts, UFW logs, and at least one "is chat.acme.com returning 200?" uptime check.

## 5.4 File storage: local vs R2

Default is local at `/opt/mattermost/data/`. For production, consider switching to Cloudflare R2:

```json
{
  "FileSettings": {
    "DriverName": "amazons3",
    "AmazonS3AccessKeyId": "<R2 access key>",
    "AmazonS3SecretAccessKey": "<R2 secret>",
    "AmazonS3Bucket": "mattermost-files",
    "AmazonS3Endpoint": "<accountid>.r2.cloudflarestorage.com",
    "AmazonS3Region": "",
    "AmazonS3SSL": true
  }
}
```

R2 pricing: ~$0.015 / GB / month storage, **no egress fees**. For a 1000-user org uploading 10 MB / user / month, that is $1.50 / month of storage plus $0 in egress. Worth it.

Migrating existing local files to R2 post-cutover: either use Mattermost's built-in `mmctl` migration (newer versions) or rclone from `/opt/mattermost/data/` into the bucket.

---

# Part 6: Troubleshooting index

## 6.1 Phase 1

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `./migrate.sh setup` can't find `slackdump` or `mmetl` | Go-based tools not on PATH | `./scripts/bootstrap-tools.sh` again; add `$(go env GOPATH)/bin` to shell rc |
| `intake-official-export.py` fails with "invalid ZIP" | Download truncated or is an HTML error page | Re-download from the admin-email link; verify size matches |
| `slack-advanced-exporter fetch-emails` returns 403 | `SLACK_TOKEN` lacks `users:read.email` scope | Reinstall the Slack app with proper scopes, re-issue token |
| `mmetl transform` panics on some post | Rare Slack message schema quirk | Set `MMETL_EXTRA_FLAGS="--discard-invalid-props"` and re-run transform |
| Reconciliation shows channels in audit CSV but not JSONL | mmetl dropped them; usually archived channels with zero messages in the window | Classify as `native-importable` but empty, or extend the export window |

## 6.2 Phase 2

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `./operate.sh intake` fails "hash mismatch" | ZIP got re-zipped between phases | Re-copy the canonical ZIP from Phase 1's `import-ready/` |
| `./operate.sh deploy` on Ubuntu 25.10: no `mattermost` package | Repo doesn't have a `questing` build yet | Switch `DEPLOY_METHOD=docker` and re-run; Docker images cover all distros |
| `verify-live` WebSocket check fails | Nginx is missing the `Upgrade` / `Connection: upgrade` block | Re-run `render-config`; confirm deploy copied the regenerated nginx conf |
| `verify-live` SMTP fails but provider says credentials are right | Provider's outbound port 587 blocked for new accounts | Test from the server: `nc -vz $SMTP_SERVER 587`. Use port 465 + SSL instead, or contact provider |
| Staging import stuck in `pending` for > 10 min | mmctl import worker crashed | Check `/opt/mattermost/logs/mattermost.log`. `mmctl import job cancel <id>` and re-process |
| Reconciliation shows fewer users than handoff claims | `--skip-empty-emails` dropped users without emails | Set a fallback `MMETL_DEFAULT_EMAIL_DOMAIN` in Phase 1 and re-run |
| Users report password-reset email lands in spam | SPF / DKIM / DMARC not set for sender domain | Add the records in Cloudflare DNS per your SMTP provider's docs |
| Cutover succeeds but users say "I can't see #general history" | They weren't added to the channel during import | `mmctl channel users add myteam general <username>`; investigate why their `user_id` wasn't in the JSONL's channel membership |

## 6.3 Evidence and audit

If you need to produce evidence later (for compliance, audit, or a "prove we migrated this channel" question), everything you need is already on disk:

- `workdir/artifacts/reports/evidence-pack.json` (Phase 1): the hashed manifest of everything that was produced, with provenance.
- `workdir-phase2/reports/` (Phase 2): intake, config, live-stack, staging, smoke, reconciliation, cutover, activation, readiness. Each has its own JSON and MD sibling.

Tar them, encrypt with age or gpg, store off-site for as long as your retention policy requires.

---

# Part 7: Operator checklist (print and keep on the desk during cutover)

## 7.1 Two days before

- [ ] `./scripts/doctor.sh` green on the workstation (Phase 1 and Phase 2).
- [ ] `./scripts/doctor.sh --require-remote` green (can SSH non-interactively to the target).
- [ ] `./scripts/doctor.sh --require-mcp` green, if you're using MCP servers.
- [ ] DNS A record for `chat.acme.com` exists (orange-clouded if Cloudflare).
- [ ] Server ordered and SSH reachable as root.
- [ ] SMTP provider set up; `swaks` test email arrived.
- [ ] Slack plan tier known, export scope decided, legal approval in hand if needed.

## 7.2 One day before

- [ ] Full Phase 1 pipeline done once (baseline); `handoff.json` + final ZIP + evidence pack exist.
- [ ] `./operate.sh intake` + `render-config` + `provision` + `deploy` + `verify-live` green.
- [ ] `./operate.sh staging` green; staging-observed counts match handoff counts.
- [ ] `./operate.sh restore` green (or explicitly waived by rollback owner).
- [ ] `./operate.sh ready` returns `"status": "ready"`.
- [ ] First user announcement sent with cutover time + reset URL.
- [ ] Help desk bucket / channel named; on-call owner identified.

## 7.3 Cutover day

- [ ] T − 1 h: freeze Slack (admin UI). Start final Phase 1 delta export.
- [ ] T − 15 min: confirm `./operate.sh ready` still green with the final handoff.
- [ ] T = 0: `./operate.sh cutover`. Watch the newest `workdir-phase2/reports/cutover/cutover-status.*.json`.
- [ ] T + cutover: send activation announcement. Watch help desk.
- [ ] T + 4 h: `mmctl user list --all --json | jq 'length'` + spot-check top channels.
- [ ] T + 1 day: activation reminder if < 50 %.
- [ ] T + 7 days: revoke Slack tokens, delete migration app, archive workdirs to evidence storage.

## 7.4 If cutover fails

- [ ] Do not try to fix in place under time pressure. Check the `note` field in the newest `cutover-status.*.json`.
- [ ] If the issue is mechanical (stuck mmctl job, config typo), fix and re-run `cutover`; imports are idempotent.
- [ ] If the issue is data loss or state corruption, roll back: `ROLLBACK_CONFIRMATION=I_UNDERSTAND_THIS_RESTORES_BACKUPS ./operate.sh rollback`. The rollback restores the DB to the pre-cutover backup.
- [ ] Unfreeze Slack and tell users you are rolling back; commit to a new date.

---

# Part 8: Philosophy and quick reference

The two skills embody a few rules worth internalizing so you can make good judgment calls at the edges:

1. **Official export beats scraping** when it is available. Slackdump is a supplement, not a first choice.
2. **Enrich before transform.** Slack file links expire; if you transform first and enrich later, you're chasing your tail.
3. **Channel-audit CSV is a first-class artifact.** Without it, reconciliation is structural only, not semantic.
4. **Every artifact crossing a stage boundary carries a SHA256 and a manifest entry.** Hashless handoffs are rejected.
5. **Import is idempotent.** Safe to re-run. Used both for delta-catch-up and for "the cutover import was interrupted at 80%, can we resume?"
6. **Staging before production is mandatory.** Mattermost's own docs say so. Phase 2 will refuse `cutover` if staging hasn't passed.
7. **Rollback owner is a named human, before cutover.** Not a role, not "whoever is on call". A name.
8. **Known gaps are written down, never inferred away.** `unresolved-gaps.md` is the ground truth; if it's not in there, it shouldn't be talked about in the cutover announcement.

### Operator library quick reference

If you want the "why" behind each stage, the skill ships operator cards with triggers, failure modes, and prompt modules:

- Phase 1: `.claude/skills/slack-migration-to-mattermost-phase-1-extraction/references/OPERATOR-LIBRARY.md` (TIER, AUTH, SCOPE, ENRICH, XFORM, VERIFY, SPLIT, HANDOFF).
- Phase 2: `.claude/skills/slack-migration-to-mattermost-phase-2-setup-and-import/references/OPERATOR-LIBRARY.md` (INTAKE, PROV, DEPLOY, NET/TLS, LIVE, STAGE, SMTP, READY, CUTOVER, ACTIVATE, OPS, ROLLBACK).

These are what the agent (Claude Code / Codex) consults when you ask "now what?" in the middle of a stage. You can read them directly too.

### Quote bank

Load-bearing rules in each skill trace back to anchors in `QUOTE-BANK.md`. When you hit an edge case and the skill's behavior surprises you, read the relevant `[Q-*]` anchor; it tells you where the rule came from and whether the source has changed under you.

---

# Part 10: Expanded Appendices for Operators

These appendices ship with answers to the questions operators ask most often. Read them in any order; nothing here blocks you from starting Part 1.

## 10.1 Meet Acme Corp, a worked example threaded through the guide

Throughout this guide and the two skills, a fictitious workspace anchors the examples:

- **Company:** Acme Corp (340 users, engineering + ops + sales)
- **Plan:** Business+ (routed to Track A, the official admin export)
- **Target:** `chat.acme.com`, served from a Hetzner AX42 in Falkenstein
- **Email:** Postmark for transactional SMTP (admin@acme.com is the rollback owner mailbox)
- **Storage:** Cloudflare R2 for files; local `/opt/mattermost/data/` during cutover, migrate post-cutover
- **Calls:** enabled; `calls.acme.com` is grey-clouded so UDP 8443 works

Acme Corp's fully populated Phase 1 `config.env` looks like this (paste into a new working directory and edit):

```bash
WORKSPACE_NAME="acme-slack"
PHASE1_WORKSPACE_ROOT="./workdir"
MATTERMOST_TEAM_NAME="acme"
MATTERMOST_TEAM_DISPLAY_NAME="Acme Corp"
SLACK_PLAN_TIER="Business+"

SLACK_EXPORT_ZIP="/Users/jane/Downloads/acme_slack_export_2026-04-15.zip"
SLACK_CHANNEL_AUDIT_CSV="/Users/jane/Downloads/acme_channel_audit_2026-04-15.csv"
SLACK_MEMBER_CSV="/Users/jane/Downloads/acme_member_list_2026-04-15.csv"

SLACK_TOKEN="xoxp-ACME-USER-TOKEN-WITH-READ-SCOPES"
MMETL_DEFAULT_EMAIL_DOMAIN="acme.com"
PHASE1_SIDECAR_INPUTS="/Users/jane/acme/canvases,/Users/jane/acme/lists"
PHASE1_WORKFLOW_INPUTS="/Users/jane/acme/workflows"
PHASE1_SIDECAR_CHANNELS="slack-canvases-archive,slack-lists-archive,slack-export-admin"

SLACK_BOT_TOKEN="xoxb-ACME-BOT-TOKEN"
SLACK_TEAM_ID="TACMETEAM"
```

Acme Corp's Phase 2 `config.env` (extends the Phase 1 handoff):

```bash
WORKSPACE_NAME="acme-slack"
PHASE2_WORKSPACE_ROOT="./workdir-phase2"
HANDOFF_JSON="/Users/jane/slack-migration/acme/workdir/artifacts/reports/handoff.json"
IMPORT_ZIP="/Users/jane/slack-migration/acme/workdir/artifacts/import-ready/mattermost-bulk-import.zip"

MATTERMOST_URL="https://chat.acme.com"
MATTERMOST_ADMIN_USER="admin"
MATTERMOST_ADMIN_PASS="<generated, stored in 1Password>"
MATTERMOST_TEAM_NAME="acme"
ENABLE_LOCAL_MODE="1"

TARGET_HOST="chat.acme.com"
TARGET_SSH_USER="deploy"
DEPLOY_METHOD="apt"
POSTGRES_DSN="postgres://mmuser:<strong>@localhost:5432/mattermost?sslmode=disable"
SMOKE_DATABASE_URL="${POSTGRES_DSN}"

SMTP_SERVER="smtp.postmarkapp.com"
SMTP_PORT="587"
SMTP_USERNAME="<postmark-server-token>"
SMTP_PASSWORD="<postmark-server-token>"
SMTP_TEST_EMAIL="admin@acme.com"

CLOUDFLARE_ENABLED="1"
CLOUDFLARE_MODE="execute"
CLOUDFLARE_API_TOKEN="<zone-edit-scoped>"
CF_ZONE_ID="<acme-com-zone-id>"
ORIGIN_SERVER_IP="95.217.12.34"
CALLS_HOSTNAME="calls.acme.com"
CALLS_SERVER_IP="95.217.12.34"

MATTERMOST_ADMIN_TOKEN="<system_admin-PAT-created-post-deploy>"
ROLLBACK_OWNER="Jane Admin <jane@acme.com>"
BACKUP_PATH="/var/backups/mattermost/mm_2026-04-22.sql.gz"
SCRATCH_DB_URL="postgres://mmuser:<strong>@localhost:5432/mm_restore_drill?sslmode=disable"
```

A typical prompt Jane pastes into Claude Code's desktop-app prompt box to kick off Phase 1:

> *"Use the slack-migration-to-mattermost-phase-1-extraction skill. Read the prompts directory, then run the `setup` stage for Acme Corp. Pause and show me the doctor.sh summary after it finishes so I can confirm we're green before export."*

Expected reply (abridged): *"doctor.sh says 14/14 required passing (100%). Tools: slackdump 3.2.0, slack-advanced-exporter 1.0.4, mmetl v2.3.0, mmctl v9.11. Disk: 420 GiB free on `/`. Config loaded: Track A, Acme Corp. Ready for `export`. Shall I proceed?"*

Successful Phase 2 `cutover-status.<timestamp>.json` excerpt from Acme's production run (the newest one in `workdir-phase2/reports/cutover/`):

```json
{
  "status": "success",
  "started_at": "2026-04-22T14:05:12Z",
  "completed_at": "2026-04-22T14:31:04Z",
  "import": {"job_id": "8hxm...", "state": "success", "final_lines": 218451},
  "smoke": {"users": 337, "channels": 142, "posts": 1_284_903, "direct_channels": 4921},
  "reconciliation": {"status": "ok", "diffs": []},
  "activation": {"smtp_test_email": "admin@acme.com", "reset_link_received": true},
  "rollback_owner": "Jane Admin <jane@acme.com>"
}
```

Use these numbers to sanity-check your own runs; Acme's shape is the canonical "this is what a healthy migration looks like."

## 10.2 Data-preservation matrix: what survives, what doesn't, what becomes a sidecar

Readers should be able to answer every "will X survive?" question in 60 seconds. The matrix below is derived from Phase 1's `integration-inventory` + `unresolved-gaps` classification. Three dispositions: **native** (imports as-first-class Mattermost data), **sidecar** (preserved as a post in an archive channel), **unrecoverable** (document in `unresolved-gaps.md`; plan a rebuild or an acceptance).

| Slack feature                          | Disposition      | Notes |
|---------------------------------------|------------------|-------|
| Public channel messages                | native           | Every supported plan. |
| Private channel messages               | native (Business+) / slackdump-partial (Pro) | Pro: only if the export token is a member. |
| DMs                                    | native (Business+) / own-only (Pro) | Other people's DMs are never exportable. |
| Group DMs (mpim)                       | native (Business+) / own-only | Same as DMs. |
| Threads / thread replies               | native           | `thread_ts` preserved; Phase 1 validator blocks orphans. |
| Reactions                              | native (partial) | mmetl drops unknown custom emoji reactions; builtins OK. |
| File attachments (images, video, PDFs) | native           | Phase 1 enrich stage downloads bytes before links expire. |
| Pinned messages                        | native           | Preserved as pinned in Mattermost. |
| Channel topic + purpose                | native           | Applied at import time. |
| Custom emoji images                    | native           | `export-custom-emoji.py` pulls and repackages. |
| Canvases                               | sidecar          | `slack-canvases-archive` channel, one post per canvas (HTML attachment). |
| Lists                                  | sidecar          | `slack-lists-archive` channel, JSON attachment. |
| Admin channel-audit CSV                | sidecar          | `slack-export-admin` channel. |
| Workflow Builder automations           | unrecoverable    | Preserve the JSON as sidecar; rebuild as Playbooks or slash commands post-cutover. |
| Slackbot replies                       | unrecoverable    | Rebuild with Mattermost bot + keyword triggers. |
| Bookmarks (channel bar)                | unrecoverable    | Rebuild in Mattermost channel header. |
| Saved items / later                    | unrecoverable    | Per-user; users re-save after activation. |
| Scheduled messages                     | unrecoverable    | Slack doesn't export them; tell users to re-schedule. |
| User statuses + presence               | unrecoverable    | Transient data; not in export. |
| Huddles recordings                     | unrecoverable    | Huddles don't export. |
| Slack Connect channels                 | unrecoverable (your org's posts only) | Other org's content never leaves Slack. |
| Message edit history                   | unrecoverable (latest version only) | Slack only exports final text. |
| Bot messages / app messages            | native (as "System" user by default) | Preserve with `Enable Integrations to Override Usernames`. |
| User profile fields (custom)           | partial          | Only email, display_name, first/last import cleanly. |
| SSO session state                      | N/A              | Doesn't migrate; users do `/reset_password` anyway. |

### FAQ: "will X survive?" fast answers

- **"Will threads survive?"** Yes, natively. The `thread_ts` is preserved and Phase 1's JSONL validator fails-closed if any reply points at a missing parent.
- **"Will my custom emoji show up in Mattermost?"** Yes: names, images, and aliases. Reactions using them may or may not re-bind depending on how mmetl processed the name.
- **"Will DMs migrate?"** On Business+, yes. On Pro, only DMs where the export token's user is a participant; other people's DMs simply aren't in Slack's export.
- **"What about Slack Connect channels (shared with other orgs)?"** Only your organization's messages migrate. The other org's messages stay in Slack.
- **"Do reactions survive?"** Native and standard Unicode emoji: yes. Custom emoji reactions depend on whether mmetl mapped the custom name successfully; Phase 1's reconciliation report lists any that were dropped.
- **"Pinned messages?"** Yes.
- **"Scheduled messages I set up last week?"** No; Slack doesn't include them in exports. Tell users who rely on them to re-schedule on the morning of T+0.
- **"Will my user profile pictures migrate?"** Yes, as part of the user import.
- **"Will people's 'saved messages' migrate?"** No, and there's no way around this in the Slack export. Send a reminder: "open Slack once after cutover and re-save anything you need from your saved items."

## 10.3 Stage cheatsheet: outcome, proof, recovery

For each stage, what you'll have, how to tell it worked, and the recovery move if it didn't.

### Phase 1

| Stage | After this stage you will have | How to tell it worked | If it failed |
|-------|-------------------------------|------------------------|-------------|
| `setup` | `workdir/artifacts/{raw,enriched,import-ready,reports}/` tree; config validated; tools resolved | `doctor.sh` prints `Health score: N/N required passing (100%)` | Missing tool → re-run `bootstrap-tools.sh`; missing env → edit `config.env` and re-run |
| `export` | `workdir/artifacts/raw/slack-export.zip` + audit/member CSVs + `manifest.raw.json` | `jq '.files | length' manifest.raw.json` matches file count; every file has SHA256 | Truncated ZIP → re-download; rate-limited slackdump → retry with backoff already built in |
| `enrich` | `workdir/artifacts/enriched/slack-export.enriched.zip` with `__uploads/`, rewritten `users.json`, emoji manifest, sidecar bundle | `validate-enrichment-completeness.py` reports empty `missing_file_references` + empty `users_missing_email` (or each documented in gaps) | Missing attachments → decide per-file: accept as unrecoverable or re-run after fixing scope |
| `transform` | `workdir/artifacts/import-ready/mattermost_import.jsonl` + `data/bulk-export-attachments/` | `mmetl check slack` exits 0; JSONL has users/channels/posts lines | mmetl panic → `MMETL_EXTRA_FLAGS="--discard-invalid-props"` |
| `package` | `workdir/artifacts/import-ready/mattermost-bulk-import.zip` + `manifest.import-ready.json` | Sidecar channels populated; emoji objects precede team line | Warning about missing user in memberships → trace to source in JSONL, fix patch script input |
| `verify` | `reports/verification.md`, `evidence-pack.json`, `secret-scan.json` (+ `reports/redacted/` if findings) | `verification.md` has no red lines; scan findings empty or accepted | Red reconciliation → go back to `enrich` or `export`; do not proceed |
| `handoff` | `handoff.md`, `handoff.json`, `unresolved-gaps.md` | `shasum -a 256 final.zip` == `handoff.json.final_package.sha256` | Mismatch → re-run `handoff` (never edit `handoff.json` by hand) |

### Phase 2

| Stage | After this stage you will have | How to tell it worked | If it failed |
|-------|-------------------------------|------------------------|-------------|
| `intake` | `workdir-phase2/reports/phase2-intake-report.json` | Hash match confirmed, sidecar_channels[] non-empty | Re-copy canonical ZIP from Phase 1 |
| `render-config` | `rendered/config.json` + `mattermost.nginx.conf` + `config-validation.json` | `config-validation.json.status == "ready"`; MaxPostSize=16383 | Missing env → fix `config.env`; re-run |
| `edge` | Cloudflare A record proxied; origin CA cert in `rendered/origin.{pem,-key.pem}` | `verify-cloudflare-edge.py` green | Fall back to `NGINX_ENABLE_TLS=1` with Let's Encrypt |
| `provision` | UFW, fail2ban, unattended-upgrades, optional local PG on the target | `systemctl status fail2ban` active; `ufw status verbose` active | Re-run in `plan` mode, eyeball script, then `ssh` mode |
| `deploy` | Mattermost + Nginx running, config.json in place, TLS cert installed | `/api/v4/system/ping` returns 200 via HTTPS | Ubuntu 25.10 + APT fail → switch to `DEPLOY_METHOD=docker` |
| `verify-live` | `reports/live-stack.md` with ping + WS + SMTP results | All three probes green, 6× retries exhausted without falling back | WS fail → re-`render-config`+`deploy`; SMTP fail → verify creds with swaks |
| `staging` | `reports/latest-staging.json` + timestamped `staging-summary.*.json`, import-watch JSONL | `latest-staging.json.status=success`, observed counts ≈ handoff counts | Counts off → go back to Phase 1 |
| `restore` | Proof that `pg_restore` works against `SCRATCH_DB_URL` | `restore-drill.sh` exits 0; tables populate | Fix `BACKUP_PATH`; redo the drill |
| `ready` | `cutover-readiness.json`, `readiness-score.md`, `phase2-readiness.md` | `status: "ready"` verbatim | Fix every blocker listed; re-run |
| `cutover` | `reports/cutover/cutover-status.<timestamp>.json` + `reports/latest-activation.json` | newest `cutover-status.*.json` has `status: "success"` | Read `note`; fix-in-place or rollback |
| `rollback` | Restored pre-cutover state, archived rollback artifacts | Users can't reach new Mattermost; DB is back to pre-cutover dump | Unfreeze Slack; schedule a new attempt |

## 10.4 User-communications kit

Phase 2 ships `references/comms/USER-COMMS-KIT.md` with longer versions of each template. Quick copy-paste versions below; edit for your voice.

### T-7d: "Heads up, we're moving"

> Subject: We're moving from Slack to Mattermost in 7 days
>
> Hi team, quick heads-up: on **[DATE]** we're migrating from Slack to a self-hosted Mattermost server at `https://chat.acme.com`. This saves us about [$X] per year and keeps our chat history on infrastructure we own.
>
> What you need to do: **nothing yet**. We'll send instructions the day before and the day of.
>
> What won't change: public channels, private channels you're in, DMs, threads, files, and reactions all move over.
>
> What will change: Slackbot automations, scheduled messages, saved items, and a few other per-user things don't migrate. If you rely on any of these, I'll list them in the "day of" email so you can recreate them.
>
> Questions? [help channel / ticket link]

### T-24h: freeze notice

> Subject: Slack goes read-only tomorrow at 09:30
>
> Tomorrow, **[DATE]** at 09:30 local, Slack will be set to read-only. You'll still be able to read everything, but not post.
>
> At 10:15 your Mattermost account will be waiting at `https://chat.acme.com/reset_password`. Enter the email you use in Slack. You'll get a password-reset email. Set a password, log in, and you're done.
>
> All your Slack history (public, private channels you're in, DMs, threads, files) will already be there.
>
> Who to ask if something goes wrong: [name, email, Slack handle for today / Mattermost handle post-cutover]

### T-15m: "Slack is now read-only"

> #general: heads up, Slack is now read-only. Do not start new threads here. Mattermost opens for activation at 10:15 at `https://chat.acme.com/reset_password`. Use your Slack email.

### T+0: activation

> Subject: Mattermost is live. Activate your account.
>
> Mattermost is live at `https://chat.acme.com`. To activate:
>
> 1. Go to `https://chat.acme.com/reset_password`.
> 2. Enter your Slack email (the one you use day to day).
> 3. Check that email for a password-reset link.
> 4. Set a password. Log in.
>
> Your Slack history is already there. If something looks off, ping [support handle].
>
> **Not migrated (recreate these yourself):** Slackbot auto-replies, saved items, scheduled messages, bookmarks, custom notification rules. See [link to internal doc] for step-by-steps.

### T+24h: activation reminder

> Subject: If you haven't activated Mattermost yet…
>
> About [N]% of the team has activated. If you haven't, take 90 seconds now: `https://chat.acme.com/reset_password`, your Slack email, done.
>
> If you never got the reset email, check spam first, then reply to this message and I'll either resend or set a temp password for you.

### T+7d: wrap-up

> Subject: One week in; Slack is going away
>
> Everything's been running on Mattermost for a week. Today I'm:
>
> 1. Revoking the Slack migration app (we only needed it for one-time access).
> 2. Downgrading the Slack workspace to the cheapest read-only tier so we can still reference old content for 90 days if anyone needs it.
> 3. Closing this migration ticket. Retrospective thread: [link].
>
> If you still haven't activated Mattermost: do it today.

## 10.5 Concrete monthly cost breakdown

For a 340-user deployment (Acme Corp profile), numbers as of April 2026:

| Line item | Price | Notes |
|-----------|-------|-------|
| Hetzner AX42 dedicated (Falkenstein or Helsinki) | €46/month (~$50) | AMD Ryzen 7 PRO 8700GE, 64 GB DDR5, 2× 512 GB NVMe. One-time setup €39. |
| **OR** Hetzner AX52 (recommended for 500–1000 users) | €64/month (~$70) | Ryzen 7 7700, 64 GB DDR5, 2× 1 TB NVMe. One-time €39. |
| Cloudflare Free plan | $0 | TLS termination, DDoS, WAF, WebSockets, CDN for static assets. |
| Postmark (100K emails/month) | $15/month | SPF/DKIM/DMARC built in. Alternatives: Mailgun Flex ($35), SES ($1/10K but setup-heavy). |
| Domain + DNS (if not already owned) | $10–15/year | Cloudflare charges cost; any registrar fine. |
| Cloudflare R2 (file storage, optional) | ~$1.50/month | For 100 GB files. Zero egress. |
| Hetzner Storage Box 1 TB (off-site backups) | €4/month (~$4) | Nightly pg_dump target. |
| **Total / month (AX42 + R2 + backups)** | **~$70/month** | |
| **Total / month (AX52 + R2 + backups)** | **~$90/month** | |

Compared to Slack pricing for 340 users (Business+ is ~$12.50/user/month, or **~$4,250/month, ~$51,000/year**), self-hosting at this scale is a **98–99% cost reduction**, and the data lives on hardware you own.

One-time costs (not recurring):

- Hetzner setup fee: €39 per server.
- Operator time to run the migration: about one weekend for under 100 users, one to two weeks for 1,000 users with rehearsals.
- Optional: Mattermost Professional Edition license (~$10/user/month) if you want SAML SSO, compliance features, or guest accounts. Team Edition is free and sufficient for most orgs.

## 10.6 Legal approval gate: copy-paste email template to legal / HR

The Phase 1 skill's `references/playbooks/LEGAL-APPROVAL-GATE.md` is the authoritative playbook. A starter email for impatient operators:

> Subject: Approval to export Slack workspace data for migration to self-hosted Mattermost
>
> Hi [Legal / HR contact],
>
> As part of the planned chat-platform migration (ticket [#ID]), I need written approval to export the company's Slack workspace content. Specifics:
>
> **Scope I'm requesting:** full content export under our Business+ plan. That's public channels, private channels, direct messages, and group DMs; the full set the plan tier authorizes.
>
> **Purpose:** one-time migration to a self-hosted Mattermost server at `chat.acme.com`, owned and operated by [Company]. The migration uses Slack's own admin export feature plus Mattermost's official import tooling.
>
> **Data handling during migration:**
> - Export ZIP is downloaded directly to my workstation at [location]; not uploaded to third parties.
> - During processing, the ZIP lives in `~/slack-migration/` on my laptop, deleted after T+30 days.
> - Import artifacts are SHA256-hashed and a machine-readable evidence pack is generated.
> - Slack session tokens and the Slack admin app are revoked within 7 days of cutover.
>
> **Retention:** unchanged. Slack data that today expires per [retention policy] will expire in Mattermost on the same schedule.
>
> **Regulatory basis:** [pick one of: "consent of the members via the prior communication sent on [DATE]" / "legitimate business interest under [policy]" / "contractual requirement under [customer contract clause]"].
>
> **What I need from you:** a "yes, proceed" reply in this thread, plus any concerns or scope-trimming requests before I kick off the export. I'll cc you on the final `handoff.md` plus evidence pack as proof of handling.
>
> Happy to hop on a call if easier.
>
> Thanks,
> [Name]

Save the approving reply alongside `handoff.md` in the final evidence pack.

## 10.7 Resuming an interrupted migration

Migrations take hours to days. Laptops sleep, SSH sessions drop, Cloudflare glitches. The safe-resume playbook for each stage:

**The single most important fact:** both `./migrate.sh <stage>` and `./operate.sh <stage>` are **idempotent per stage**. Re-running a stage is always safe *unless noted below*. The skill reads the existing artifact tree, notices what's already done, and either short-circuits or re-derives.

### How to figure out where you are

Ask the agent: *"Read the Phase 1 resume.md prompt and follow it"* (or the Phase 2 equivalent). The agent will:

1. Inspect `workdir/artifacts/` or `workdir-phase2/reports/` and enumerate what exists.
2. Read the `latest-*.json` convenience copies (`latest-staging.json`, `latest-smoke.json`, `latest-reconciliation.json`, `latest-activation.json`, `latest-restore.json`) plus the newest `cutover-status.*.json` if present, and tell you what the last green stage was.
3. Recommend exactly one next move.

If you're driving without the agent, the cheat sheet is:

| Symptom | Most likely last green stage | Next action |
|---------|-------------------------------|-------------|
| `manifest.raw.json` exists but no `enriched/` dir | `export` | `./migrate.sh enrich` |
| `enriched/slack-export.enriched.zip` exists but no JSONL | `enrich` | `./migrate.sh transform` |
| `mattermost-bulk-import.zip` exists but no `verification.md` | `package` | `./migrate.sh verify` |
| `handoff.json` exists | `handoff` (Phase 1 is done) | Move to Phase 2 `intake` |
| any `cutover-status.*.json` exists with `"status":"success"` | cutover done | `post-cutover` operations |

### Not safely idempotent (exceptions)

- **`./operate.sh cutover`** is idempotent in the sense that Mattermost's import is idempotent (same post IDs don't double-post), but you should not run it twice without first re-running `ready` to check whether anything changed on the server between runs.
- **`./operate.sh rollback`** is destructive and gated by `ROLLBACK_CONFIRMATION="I_UNDERSTAND_THIS_RESTORES_BACKUPS"`. Never re-run after success.
- **`./operate.sh edge` in `execute` mode** creates real DNS records. Re-running does a no-op update if records already match; re-running with different values modifies DNS. Eyeball the plan first (`CLOUDFLARE_MODE=plan`).

### Recovering from a partial Phase 1

If `enrich` died 80% through a large workspace, the skill keeps partial downloads under `workdir/artifacts/enriched/`. Re-running `./migrate.sh enrich` picks up where it left off (resumable via `slack-advanced-exporter`'s internal state). If files remain stuck, manually delete the specific `__uploads/F<id>/` directories that are incomplete and re-run.

### Recovering from a partial Phase 2

If `deploy` finished but `verify-live` hasn't, re-run `verify-live` alone; you don't need to redeploy. If `staging` failed mid-import, run `monitor-import.sh` against the staging `mmctl import job list --json` to see if the job is still in flight or crashed; if crashed, `mmctl import job cancel <id>` and re-run.

## 10.8 MCP worked examples (what each server unlocks)

You installed MCP servers in 1.5. This section shows what each one gives the agent, with concrete "ask the agent" examples.

**Slack MCP (Anthropic official, `xoxb-` bot token):** gives the agent read access to your workspace while it's still alive.

- *"Use the Slack MCP to count the total messages in #general over the last 90 days and compare to Phase 1's channel-audit CSV for the same channel."*
- *"Use the Slack MCP to list every user whose email ends in `@acme.com` but who hasn't posted in 6 months. I want to decide whether to exclude them from the migration."*
- *"Fetch the 3 most-recent messages in the support channel so I can compare them byte-for-byte after import."*

**Slack MCP stealth (korotovsky, `xoxc-` + `xoxd-`):** full visibility, including private channels and DMs the session account can see. Use for gap-fill verification.

- *"Via the stealth Slack MCP, confirm that my export ZIP includes all my own DMs with Bob. The export should contain X messages; tell me if anything's missing."*

**Playwright MCP:** drives a real browser for anything that's UI-only.

- *"Use Playwright MCP to log into Slack admin and start a workspace export for dates 2023-01-01 to 2026-04-15. Wait for the email, click the download link, save the ZIP to `~/Downloads/`, and tell me its SHA256."*
- *"In the Mattermost System Console, use Playwright to toggle `EnableOpenServer=false` after the import finishes. I don't want to hand-edit config.json just for this."*

**Mattermost MCP (community, admin PAT):** give the agent direct API access to your live Mattermost.

- *"Via the Mattermost MCP, how many users have activated (have a non-zero `last_activity_at`) and how many are dormant?"*
- *"List every bot user on the new Mattermost, and for each one tell me whether it was present in Phase 1's integration-inventory."*
- *"Create a test post in #migration-check as the admin user, then delete it. I'm verifying the admin PAT works."*

You do not have to use any of these. The skill runs end-to-end without them. They're accelerators for verification and one-off operator questions that would otherwise require hand-driven browsers or SQL.

## 10.9 Disk footprint per stage

A worked-example table for a 340-user Business+ workspace with ~3 years of history, ~12 GB raw export, ~8 GB of attached files:

| Stage | New files added | Cumulative disk |
|-------|-----------------|-----------------|
| `setup` | empty directory tree + config copies | ~1 MB |
| `export` | `slack-export.zip` (~12 GB), audit CSV (~2 MB), member CSV (~100 KB), manifest.raw.json | ~12 GB |
| `enrich` | `slack-export.enriched.zip` (~20 GB including downloaded attachments), emoji images (~50 MB), sidecar bundle (~500 MB) | ~33 GB |
| `transform` | `mattermost_import.jsonl` (~500 MB), `data/bulk-export-attachments/` (~8 GB, deduped from enriched) | ~42 GB |
| `package` | `mattermost-bulk-import.zip` (~22 GB) | ~64 GB |
| `verify` + `handoff` | reports/ (~5 MB), evidence-pack.json (~1 MB) | ~64 GB |

**Rough scaling rule:** total disk needed ≈ **3× the raw Slack export ZIP size**. For a 1000-user workspace with 5 years of history, plan for 500 GB free.

Temp space: `mmetl` uses a scratch directory up to ~1.5× the JSONL size. Make sure `$TMPDIR` (or the rendered JSONL output directory) has headroom.

After a successful `handoff`, the only file you need to keep is `mattermost-bulk-import.zip`. The rest can be archived to cold storage (Storage Box / R2) for the evidence pack and then deleted.

## 10.10 Enterprise Grid per-workspace migration

Grid admins have one extra decision: **grid-wide export** (one giant ZIP containing every workspace) vs **per-workspace export** (one ZIP per team). Per-workspace is usually cleaner because each workspace becomes its own Mattermost team.

### Canonical flow for per-workspace

1. In each Slack Grid workspace you want to migrate, run a separate official admin export.
2. Create a fresh working directory per workspace (`~/slack-migration/acme-engineering`, `~/slack-migration/acme-sales`, etc.), each with its own `config.env`.
3. Run the Phase 1 pipeline per directory. Each emits its own `handoff.json`.
4. In Phase 2, either:
   - Stand up one Mattermost server with multiple teams, and run `./operate.sh intake` + `cutover` per workspace, each pointing at the same `MATTERMOST_URL` but different `MATTERMOST_TEAM_NAME`.
   - Stand up separate Mattermost servers per division.

### Canonical flow for grid-wide

If you got a single grid-wide ZIP (Slack sometimes issues this), use the skill's `split-phase1-import.py` helper before enrichment:

```bash
./scripts/split-phase1-import.py \
    --input /path/to/grid-export.zip \
    --output-dir workdir/split/ \
    --by workspace
```

This creates `workdir/split/<workspace>/slack-export.zip`. Treat each as a per-workspace export and continue the normal pipeline. The skill's `references/ENTERPRISE-GRID.md` has the detailed walkthrough including edge cases (users in multiple workspaces, cross-workspace shared channels).

### Edge cases specific to Grid

- **Users in multiple workspaces:** their email is the same. Mattermost merges them on import. If you ran per-workspace Phase 1s, run the Phase 2 imports in dependency order (least-dependent workspace first) to keep username conflicts predictable.
- **Grid-wide search channels:** these don't migrate as first-class; preserve the channel's member list as a sidecar and flag for rebuild if operationally important.
- **IdP / SSO in Grid:** Grid's enterprise SSO won't follow the users into Mattermost. Configure Mattermost's SAML separately (System Console → Authentication → SAML 2.0) and map on email.

## 10.11 Compliance & audit handoff

If your org has a compliance reviewer or external auditor, here's what you hand them and where it lives.

### The evidence pack (Phase 1)

Location: `workdir/artifacts/reports/evidence-pack.json`. Its fields (summarized):

- `schema_version`: frozen format identifier.
- `generated_at`: UTC timestamp.
- `workspace`: Slack workspace slug (not the raw data, just the identifier).
- `plan_tier`, `export_basis`: legal basis for the export (from `SLACK_PLAN_TIER` plus the legal-approval memo).
- `manifests[]`: list of hash-anchored manifest files (raw, enriched, import-ready).
- `counts`: users, channels, posts, DMs, emoji, attachments, sidecars.
- `known_gaps[]`: every documented not-migrated item with disposition class.
- `secret_scan_findings`: `scan-and-redact-migration-secrets.py` output (should be empty or explicitly accepted).

### The cutover pack (Phase 2)

Location: `workdir-phase2/reports/`. Key artifacts:

- `phase2-intake-report.json`: hash match proof (Phase 1 to Phase 2).
- `config-validation.json`: server config drift check (before vs rendered).
- `live-stack.md`: TLS + WebSocket + SMTP reachability evidence.
- `latest-staging.json` (alongside the timestamped `staging-summary.*.json`): rehearsal results, observed counts, reconciliation.
- `cutover-readiness.json` + `readiness-score.md`: pre-cutover gate, with ROLLBACK_OWNER named.
- `cutover/cutover-status.<timestamp>.json` (newest) + `latest-activation.json`: final import state, activation proof, reconciliation.

### What an auditor typically asks for

- **"Prove the data we imported matches the data we exported."** → Show `handoff.json.final_package.sha256` + `phase2-intake-report.json` hash match + `latest-staging.json` count reconciliation (and the corresponding `latest-reconciliation.json`).
- **"Prove who authorized the export."** → The legal-approval email (see 10.6) stored alongside the evidence pack. This is not in the skill's output; you attach it from your email.
- **"Prove no secrets leaked into reports."** → `secret-scan.json` from the secret scanner; redacted copies (if any) are alongside it in `reports/redacted/`.
- **"Prove the cutover had a rollback plan."** → `cutover-readiness.json.rollback_owner` (named human) + `restore-drill` result if you did one.
- **"Retention: where is the raw Slack data now?"** → Answer: deleted from `workdir/artifacts/raw/` after T+[retention period]. The skill's scan-and-redact helper plus the final handoff gives you the last point the raw ZIP was referenced.

### Recommended handoff format

1. `tar czf acme-migration-evidence-pack_2026-04-22.tgz workdir/artifacts/reports/ workdir-phase2/reports/`
2. Encrypt: `age -r <auditor's age public key> -o acme-migration-evidence-pack_2026-04-22.tgz.age acme-migration-evidence-pack_2026-04-22.tgz` (or `gpg -e -r auditor@firm.com`).
3. Store the encrypted blob off-site (R2 + a different cloud for redundancy). Retention: at least as long as your Slack retention policy, or per audit requirement.

The unencrypted evidence pack contains organizational metadata (counts, channel names from `channel-audit.csv`, user counts) but, thanks to `scan-and-redact-migration-secrets.py`, should not contain secrets. Still, encrypt it: cheap insurance.

### Retention recommendations

- **Raw export ZIP + enriched ZIP**: delete from operator workstation T+30 days after cutover, unless an auditor has asked for it.
- **Final import ZIP** (`mattermost-bulk-import.zip`): keep for T+90 days in case a post-cutover re-import is needed.
- **Evidence pack + cutover pack**: keep per your compliance retention policy. Typically 7 years for US SOX / EU GDPR article 5 compliance, or your sector-specific rule.

## 10.12 Credential inventory: what you collect and where it goes

Over the course of a migration you will create and store roughly a dozen credentials. Collect them in a password manager (1Password, Bitwarden, Dashlane), not in a text file on your desktop, and never commit them to git. The skill's `config.env` files should stay on your laptop only; `workdir/` and `workdir-phase2/` are in a gitignore pattern the skill ships with.

### The full list, in the order you'll collect them

| # | Credential | What it is | Where you get it | Which `config.env` | Needed at stage |
|---|-----------|------------|------------------|---------------------|-----------------|
| 1 | **Anthropic or OpenAI subscription login** | Sign-in for Claude Code / Codex desktop app | <https://claude.ai> or <https://chat.openai.com> | n/a (stays in the app) | Before Part 1 |
| 2 | **jsm account (Google OAuth)** | Subscription at jeffreys-skills.md | <https://jeffreys-skills.md> | n/a (stored in OS keychain) | Part 1.2 / Part 11 |
| 3 | **SSH keypair** | `~/.ssh/id_ed25519` + `id_ed25519.pub` | Generate with `ssh-keygen -t ed25519` (see Part 1.0.3) | n/a (SSH uses it automatically) | Part 1.0, Phase 2 `provision` |
| 4 | **Domain + registrar login** | Your future `chat.yourcompany.com` DNS | Cloudflare Registrar or existing registrar | n/a | Part 1.0.2 |
| 5 | **Cloudflare API token** | Scoped token: `Zone.DNS:Edit` + `Zone.SSL:Edit` for your one zone | Cloudflare → My Profile → API Tokens → Create → Custom (see 10.13) | Phase 2: `CLOUDFLARE_API_TOKEN` | Phase 2 `edge` |
| 6 | **Cloudflare Zone ID** | 32-hex identifier for your zone | Cloudflare → your zone → Overview → right sidebar | Phase 2: `CF_ZONE_ID` | Phase 2 `edge` |
| 7 | **Slack user token (`xoxp-...`)** | Read-scoped user OAuth token for Slack | Slack → Apps → Create app → OAuth scopes (`users:read.email`, `channels:read`, `groups:read`, `im:history`, `mpim:history`) → install | Phase 1: `SLACK_TOKEN` | Phase 1 `enrich` |
| 8 | **Slack bot token (`xoxb-...`)** | Bot-scoped token for the same Slack app | Same app's Install page, bot token section | Phase 1: `SLACK_BOT_TOKEN` | Phase 1 (optional, for MCP verification) |
| 9 | **Slack team ID (`T...`)** | Your workspace identifier | Slack URL bar (`/T0ABCDEFG/...`) or `admin.teams.list` | Phase 1: `SLACK_TEAM_ID` | Phase 1 `enrich` |
| 10 | **Slack session cookies (`xoxc-` + `xoxd-`)** | For slackdump stealth mode on Free/Pro | Browser DevTools → Application → Cookies → `slack.com` | Phase 1: `SLACKDUMP_XOXC` + `SLACKDUMP_XOXD` | Phase 1 `export` on Free/Pro only |
| 11 | **Postmark server token** | SMTP credential for sending password-reset emails | Postmark → Servers → your server → API Tokens | Phase 2: `SMTP_USERNAME` **and** `SMTP_PASSWORD` (same value; Postmark convention) | Phase 2 `verify-live`, `cutover` |
| 12 | **Mattermost admin password** | System admin password you pick for the `admin` account created during deploy | You invent it; store in 1Password | Phase 2: `MATTERMOST_ADMIN_PASS` | Phase 2 `deploy` onwards |
| 13 | **Mattermost admin PAT** | Personal access token, created post-deploy | Mattermost System Console → Integrations → Personal Access Tokens → Create (requires `Enable Personal Access Tokens` first) | Phase 2: `MATTERMOST_ADMIN_TOKEN` | Phase 2 `ready`, `cutover` |
| 14 | **PostgreSQL password (`mmuser`)** | Local PG password the provisioner uses | You invent it; embedded inside `POSTGRES_DSN` | Phase 2: inside `POSTGRES_DSN` | Phase 2 `provision`, `deploy` |
| 15 | **Rollback-owner email** | Your (or a named human's) email; goes into the readiness-gate record | Pick a real human with authority to halt cutover | Phase 2: `ROLLBACK_OWNER` | Phase 2 `ready`, `cutover` |

### Lifecycle rules

- **Never commit to git.** The skill's `workdir/` and `workdir-phase2/` directories, plus `config.env`, are in its default `.gitignore`. If you make your own working directory a git repo, double-check the `.gitignore` before your first commit. Both phases ship a `scan-and-redact-migration-secrets.py` that the skill runs automatically; a failure there blocks `handoff` until you remediate.
- **Revoke after cutover.** Within 7 days of a successful cutover, revoke the Slack user token, Slack bot token, and Slack session cookies (Slack → Apps → your app → Settings → Revoke or Delete). Rotate the Mattermost admin PAT (create a new one, delete the old one) if you shared it with any automation.
- **Keep Cloudflare + Postmark + SSH long-term.** These credentials remain useful for operating the Mattermost server after cutover. Rotate the Postmark token if a former admin ever had access to it.
- **Chicken-and-egg: PAT after deploy.** The Mattermost admin PAT doesn't exist until `deploy` has finished and you've logged in as admin once. Leave `MATTERMOST_ADMIN_TOKEN=""` during `intake` / `render-config` / `edge` / `provision` / `deploy`, then come back and fill it in before `verify-live`. The skill's `doctor.sh --require-mcp` pass will remind you if it's missing.

### Quick "lost credential" recovery

- **Lost Slack user token**: re-install the Slack app, issue a new token, update `config.env`. Tokens are cheap; your identity is not.
- **Lost SSH key**: see [Part 1.0.5](#10-day-zero-order-a-server-and-wire-up-ssh).
- **Lost Cloudflare API token**: delete the old token in Cloudflare → My Profile → API Tokens, create a new one with the same scopes, paste into `config.env`.
- **Lost Mattermost admin password**: SSH to the server and reset with `sudo -u mattermost mmctl --local user change-password admin <new-password>`. Write the new one into your password manager.
- **Lost rollback owner**: pick a new one; update `ROLLBACK_OWNER`; re-run `./operate.sh ready` to regenerate the gate record with the new name.

## 10.13 Cloudflare walkthrough

This appendix is a click-by-click path for operators who have never set up Cloudflare before. Skip if you already have a domain managed in Cloudflare.

### 10.13.1 Add your domain to Cloudflare

If you bought the domain at Cloudflare Registrar, it's already on Cloudflare; skip to 10.13.2. Otherwise:

1. Sign up / log in at <https://dash.cloudflare.com>.
2. Click **+ Add a domain**. Paste `yourcompany.com` (no `https://`, no subdomain).
3. Pick the **Free** plan. Free covers TLS termination, DDoS, WAF, CDN, and WebSockets, which is everything the migration needs. Click **Continue**.
4. Cloudflare scans your current DNS and imports the records. Confirm the list looks right (your A records for web, MX records for email). Click **Continue**.
5. Cloudflare shows you two nameservers, like `ada.ns.cloudflare.com` and `joel.ns.cloudflare.com`. Copy both.
6. Go to your existing registrar (GoDaddy / Namecheap / wherever) → domain settings → nameservers. Change from the registrar's defaults to the two Cloudflare nameservers. Save.
7. Wait for propagation. Cloudflare's dashboard shows a yellow "Pending" next to your domain and flips to green "Active" when propagation lands, usually within 15 to 60 minutes, occasionally up to 24 hours. Don't proceed past this point until it's green.

### 10.13.2 Find your Zone ID

1. In the Cloudflare dashboard, click your domain name (`yourcompany.com`).
2. On the **Overview** page, look at the **right-hand sidebar**. You'll see a section titled **API**.
3. The first line under API is **Zone ID**: a 32-character hex string like `7e6c1f9b40a8d3e2f5c9b1a7e4d3f8c2`. Click the clipboard icon to copy.
4. Paste into `config.env.phase2` as `CF_ZONE_ID=7e6c1f9b40a8d3e2f5c9b1a7e4d3f8c2` (no quotes, no spaces).

### 10.13.3 Create a scoped API token

Never paste your global Cloudflare API Key into the skill. Use a scoped token instead.

1. Top-right avatar → **My Profile** → left sidebar → **API Tokens** → **Create Token**.
2. Scroll past the templates and click **Create Custom Token** → **Get started**.
3. Name: `slack-migration-phase-2` (any label you'll recognize later).
4. Under **Permissions**, click **+ Add more** to build this exact set:
   - `Zone` → `DNS` → `Edit`
   - `Zone` → `SSL and Certificates` → `Edit`
5. Under **Zone Resources**, switch from "All zones" to **Include** → **Specific zone** → your domain.
6. Leave **Client IP Address Filtering** and **TTL** defaults. Click **Continue to summary** → **Create Token**.
7. Cloudflare displays the token **exactly once**. Copy it immediately and paste into `config.env.phase2` as `CLOUDFLARE_API_TOKEN=<long-string>`.
8. On the confirmation page, Cloudflare shows a **Test** curl command. Run it in your terminal; you should get a `"status":"active"` JSON response. If so, the token works.

### 10.13.4 What the skill does with these credentials

At Phase 2's `edge` stage, the skill:

- Creates or updates an A record for `chat.yourcompany.com` pointing at `$ORIGIN_SERVER_IP`, with Cloudflare's orange-cloud proxy enabled.
- If you set `CALLS_HOSTNAME`, also creates a grey-clouded (DNS-only) A record for `calls.yourcompany.com` so UDP 8443 traffic for the Calls plugin bypasses Cloudflare's proxy (Cloudflare doesn't proxy UDP).
- Generates a 15-year Cloudflare Origin CA certificate for `chat.yourcompany.com` and saves the PEM files into `workdir-phase2/rendered/`. The subsequent `deploy` stage SCPs these onto the server and installs them at `/etc/nginx/ssl/origin.pem`.

Origin CA is a Cloudflare-specific concept: the certificate is valid only for traffic passing *through* Cloudflare's proxy; browsers would reject it if they hit the origin directly, but they never do, because Cloudflare's proxy is in the way. It's free, lasts 15 years, and saves you the ACME / Let's Encrypt renewal cron. If you want a different approach (Let's Encrypt directly on the origin), set `CLOUDFLARE_ENABLED=0` and supply your own cert at `NGINX_CERT_PATH`/`NGINX_KEY_PATH`.

### 10.13.5 Orange-cloud vs grey-cloud in one sentence each

- **Orange-clouded** (proxied): traffic is intercepted by Cloudflare, which terminates TLS, filters attacks, caches static assets, and forwards to your origin. Use for `chat.yourcompany.com` and anything user-facing over HTTP/HTTPS.
- **Grey-clouded** (DNS-only): Cloudflare hands back your origin's IP directly. No proxy, no TLS termination. Use for `calls.yourcompany.com` (UDP), for `staging.yourcompany.com` during rehearsal, and for mail DNS records (`MX`).

### 10.13.6 Troubleshooting Cloudflare

- **Zone stuck in "Pending"**: the nameserver change hasn't propagated. Check with `dig NS yourcompany.com +short`; if you see your old registrar's nameservers, the change hasn't gone through. Give it time, or re-verify the change in the registrar.
- **API token returns 403**: wrong zone selected under Zone Resources. Create a new token; don't try to edit the old one's scopes (Cloudflare requires token recreation for scope changes).
- **Origin CA cert doesn't work**: the `edge` stage wrote the cert but `deploy` didn't copy it. Check `workdir-phase2/rendered/origin.pem` exists, then SCP it manually to the target's `/etc/nginx/ssl/origin.pem` and `sudo systemctl reload nginx`.

## 10.14 SMTP (Postmark) walkthrough

Mattermost sends password-reset emails to every user on activation. If SMTP is broken, users cannot log in after cutover, and you've effectively done the migration for nothing. This is the single most under-documented piece of the stack for non-technical operators, so here's the full click-path using Postmark as the recommended provider.

### 10.14.1 Why Postmark

- Cheapest entry tier ($15/month for 10K emails, more than enough for a 340-user activation burst).
- Highest reputation for transactional email (fast inbox placement, rare spam-folder issues).
- Simple domain verification (3 TXT records).
- Server Tokens can be used directly as SMTP credentials, which keeps the config simple.

Mailgun Flex ($35/month), Amazon SES ($1 per 10K emails but setup-heavy), and Google Workspace SMTP relay (free with a Workspace account but rate-limited) are all valid alternatives. The click-path for each is similar. This walkthrough uses Postmark.

### 10.14.2 Sign up for Postmark

1. Go to <https://postmarkapp.com> → **Sign up**. Use your company email.
2. Confirm your email. Log in.
3. Postmark asks what you're sending. Pick **Transactional email**.
4. Create a **server** (Postmark's term for a sending pool). Name it `acme-chat-transactional` or similar. Stream type: **Transactional**.

### 10.14.3 Add and verify your sending domain

1. Postmark dashboard → **Sender Signatures** → **Domains** → **+ Add Domain**.
2. Enter `acme.com` (your root domain, not `chat.acme.com`). Click **Verify domain**.
3. Postmark shows you **3 DNS records** to add:
   - A **DKIM** TXT record. Name like `20260416pm._domainkey.acme.com`, value is a very long `k=rsa; p=MII...` string.
   - A **Return-Path** CNAME record. Name like `pm-bounces.acme.com`, value like `pm.mtasv.net`.
   - Optionally, **DMARC** TXT record at `_dmarc.acme.com` with a starter value like `v=DMARC1; p=none; rua=mailto:dmarc-reports@acme.com`.
4. Copy each one, then:
   - Cloudflare dashboard → your domain → **DNS** → **Records** → **Add record**.
   - For each of the 3 records: set Type, Name, and Content exactly as Postmark showed. Leave TTL on Auto. **Important**: set proxy status to **DNS only** (grey cloud); proxied TXT records don't exist anyway, but for the Return-Path CNAME, grey-cloud is required.
5. Back in Postmark, click **Verify**. First check usually succeeds within 2 minutes. If it fails, recheck the record value character-for-character (DKIM keys are easy to truncate).

You want DKIM **and** Return-Path both verified (green checkmarks). DMARC is optional but recommended.

### 10.14.4 Grab the Server Token

1. Postmark dashboard → your server → **API Tokens** tab.
2. Copy the **Server Token** (starts with a UUID-like string; reveal and copy).
3. Paste it into `config.env.phase2` as **both** `SMTP_USERNAME` and `SMTP_PASSWORD`. Postmark's SMTP expects the same token in both fields; this is a Postmark convention, not a mistake.

Also set:

```bash
SMTP_SERVER="smtp.postmarkapp.com"
SMTP_PORT="587"
SMTP_TEST_EMAIL="admin@acme.com"   # your email, for activation-proof at cutover
# Optional: override the from-address; default is ${SMTP_TEST_EMAIL}
SMTP_FROM_ADDRESS="noreply@acme.com"
```

### 10.14.5 Test before you need it

From the Mattermost target server (or from your laptop with swaks installed: `brew install swaks` on Mac, `apt install swaks` on Ubuntu):

```bash
swaks --to $SMTP_TEST_EMAIL \
      --from noreply@acme.com \
      --server smtp.postmarkapp.com:587 \
      --tls \
      --auth-user "$SMTP_USERNAME" \
      --auth-password "$SMTP_PASSWORD" \
      --header "Subject: migration SMTP test" \
      --body "If you're reading this, Postmark works."
```

You should see a `250 OK` from the server and the email should land in your inbox within 30 seconds. If it lands in spam, don't panic; the first few emails from a new Postmark sender often do. Send 3 or 4 more over the next hour; deliverability usually improves as Postmark warms up your reputation.

Phase 2's `verify-live` stage does the equivalent automatically. If `verify-live` reports SMTP success but Mattermost's own reset-password emails fail at cutover, it's almost always one of:

- `SMTP_FROM_ADDRESS` doesn't match the verified domain (Postmark rejects the message). Fix: set `SMTP_FROM_ADDRESS=noreply@acme.com` where `acme.com` matches the Sender Signature you verified.
- `RequireEmailVerification=true` in Mattermost config. Phase 2's `render-config` sets this to false by default; re-check if you've edited the rendered file.
- User's email provider classifies Mattermost's template as marketing. Mitigation: make sure DMARC is set (10.14.3 step 3, third record).

### 10.14.6 Cost at cutover scale

For a 340-user activation burst, you'll send ~340 welcome / reset emails in the first hour, plus retries over the following week (<50 typically). Well within Postmark's 10K/month $15 plan. After activation week you'll send only 1 to 5 emails a day (new hire onboarding, admin-triggered resets), so the same plan covers you indefinitely.

---

# Part 11: Installing the skills via Jeffrey's Skills.md (`jsm`)

The two migration skills are published on <https://jeffreys-skills.md>, a subscription skill library built around a small Rust CLI called `jsm`. A $20 / month individual subscription gets you access to every premium skill in the catalog (the migration skills included), plus the ability to store your own private skills in the cloud and sync them across machines.

If you completed the quick version in Part 1.2, this section walks through the full flow with more context, troubleshooting, and the non-technical path.

## 11.1 Sign up for a subscription

1. Open <https://jeffreys-skills.md> in a browser.
2. Click **Sign up** (or **Subscribe**). You will be prompted to sign in with **Google**; there's no separate email/password to manage. Your Google account identity becomes your `jsm` identity.
3. On the pricing page, pick **Individual ($20/month)** and check out via **Stripe** or **PayPal**. The subscription auto-renews monthly; you can cancel any time from the dashboard and access continues through the end of the current billing period.
4. When the Stripe / PayPal flow completes, you land on your dashboard. It shows your subscription state (active), your subscribed email, and a button to install the `jsm` CLI.

You can manage your subscription, view receipts, and cancel at <https://jeffreys-skills.md/dashboard> at any time. A full refund rolls back access immediately; a cancellation without refund keeps access until the period end. Skills you have already installed keep working offline regardless; subscription state only gates *downloading* new versions or *syncing* across machines.

### What you get for the $20/month

- Access to every Jeffrey-authored premium skill on the site, including **both** `slack-migration-to-mattermost-phase-1-extraction` and `slack-migration-to-mattermost-phase-2-setup-and-import`.
- Automatic updates when a skill gets a new version (with the option to pin specific versions if you'd rather stay on a known-good release).
- Personal cloud skill storage: you can `jsm push` your own private skills and pull them down on any machine you're signed in on.
- Cross-device sync: run the migration from your Mac today, keep going on your Windows workstation tomorrow, with the same skill versions on both.
- Hash-verified downloads: every skill is SHA-256 hashed, so `jsm verify` will catch any tampering-in-transit.

## 11.2 Install the `jsm` CLI

### macOS / Linux

Paste this into your terminal (Mac: Terminal.app or iTerm; Linux: your usual terminal):

```bash
curl -fsSL https://jeffreys-skills.md/install.sh | bash
```

**What this does:** downloads a one-shot installer script, runs it, and drops the `jsm` binary into `~/.local/bin`. The script also adds `~/.local/bin` to your shell's PATH if it isn't already there, so the next time you open a terminal you can just type `jsm` from anywhere.

After it finishes, restart your terminal (or run `source ~/.bashrc` / `source ~/.zshrc`) and check:

```bash
jsm --version
# should print something like: jsm 0.1.7
```

### Windows

Open **PowerShell as Administrator** (right-click the Start-menu PowerShell icon → **Run as administrator**) and paste:

```powershell
irm https://jeffreys-skills.md/install.ps1 | iex
```

Verify:

```powershell
jsm --version
```

### Verifying by hand (optional)

If you prefer not to pipe installers from the internet, grab a release archive manually:

1. Visit <https://jeffreys-skills.md/api/v1/downloads/jsm/latest.txt> and note the version.
2. Download the archive for your platform from `https://jeffreys-skills.md/api/v1/downloads/jsm/<version>/`. Filenames:
   - Linux x86_64: `jsm-x86_64-unknown-linux-musl.tar.gz`
   - macOS Intel: `jsm-x86_64-apple-darwin.tar.gz`
   - macOS Apple Silicon: `jsm-aarch64-apple-darwin.tar.gz`
   - Windows x64: `jsm-x86_64-pc-windows-msvc.zip`
3. Extract the `jsm` binary (or `jsm.exe`) and put it anywhere on your PATH (e.g. `/usr/local/bin` on macOS; `C:\Tools\jsm` plus a PATH entry on Windows).

## 11.3 First-time setup and authentication

```bash
jsm setup
```

This runs a short interactive wizard that asks where you want your projects directory and confirms the default locations where skills should be written (`~/.claude/skills/`, `~/.codex/skills/`, `~/.gemini/skills/`). Accept the defaults unless you have a reason to change them. The wizard writes a config file to `~/.config/jsm/config.toml` (macOS/Linux) or `%APPDATA%\jsm\config.toml` (Windows).

Then sign in:

```bash
jsm login
```

**What this does:**

1. Opens a browser window pointing at the jeffreys-skills.md login flow.
2. You sign in with the same Google account you subscribed with. jsm never sees your Google password; the OAuth flow gives it a long-lived API token.
3. The browser redirects back to a local `http://localhost:<port>/callback` handler that jsm spun up.
4. jsm exchanges the code for a `jsm_...` token and stores it in your system keychain (macOS Keychain, Windows Credential Manager, Linux Secret Service).

Confirm you're signed in:

```bash
jsm whoami
# Signed in as you@example.com (subscription: active)
```

### If you're behind a corporate proxy or on a weird network

```bash
jsm login --remote     # uses a device-code style flow: jsm prints a short code, you paste it into a browser anywhere
# or
jsm login --manual     # prints the full callback URL so you can paste it into jsm yourself
```

These are the two fallbacks for environments where the loopback callback can't reach back to your terminal (WSL2, containers, SSH sessions). For the typical Mac or Windows laptop, plain `jsm login` is what you want.

## 11.4 Install the two migration skills

```bash
jsm install slack-migration-to-mattermost-phase-1-extraction
jsm install slack-migration-to-mattermost-phase-2-setup-and-import
```

**What each install does:** jsm talks to the server, checks that your subscription covers the skill, downloads a signed zip, re-computes the SHA-256 hash from the extracted files, compares against the hash the server published, and, only on a match, moves the skill into `~/.claude/skills/<name>/` and `~/.codex/skills/<name>/`. It also records the version in its local database so `jsm upgrade` knows what you have.

You can also install both skills in one command with the `--related` flag (the two skills declare each other as `pairs_with` relationships):

```bash
jsm install slack-migration-to-mattermost-phase-1-extraction --related
```

### Verify

```bash
jsm list
# Shows both installed skills, versions, and install paths.

jsm verify slack-migration-to-mattermost-phase-1-extraction
# Re-hashes the installed files and confirms they match the published hash.

jsm info slack-migration-to-mattermost-phase-1-extraction
# Prints the full SKILL.md description, author notes, and curated examples.
```

Now restart your Claude Code / Codex desktop app (or terminal session). Open a prompt and ask:

> *"Do you see the slack-migration-to-mattermost-phase-1-extraction skill? Use it to run the setup stage."*

If the agent confirms the skill is available and offers to run setup, you're fully wired up. Continue with [Part 1.3](#13-bootstrap-the-workstation-for-phase-1) for the platform bootstrap.

## 11.5 Keeping skills up to date

```bash
jsm upgrade                      # Apply any available updates to all installed skills
jsm upgrade --list               # Show what would update without applying
jsm upgrade slack-migration-to-mattermost-phase-1-extraction   # Upgrade just one
```

Or have updates applied automatically on sync:

```bash
jsm config update-preference auto      # apply updates on every sync
jsm config update-preference notify    # just tell me there's an update
jsm config update-preference manual    # never auto-update
```

Between migrations (especially if Slack changes its export format or a new Mattermost release changes the import API), check for updates before you kick off a fresh run. Read the changelog first:

```bash
jsm changelog slack-migration-to-mattermost-phase-1-extraction
jsm changelog slack-migration-to-mattermost-phase-2-setup-and-import
```

### Pinning a known-good version

If you rehearsed successfully on version 1.3.0 and you're about to do the production cutover next week, pin to that exact version so a well-meaning `jsm upgrade` can't swap the skill under you mid-migration:

```bash
jsm pin slack-migration-to-mattermost-phase-1-extraction 1.3.0
jsm pin slack-migration-to-mattermost-phase-2-setup-and-import 1.3.0
# After cutover:
jsm unpin slack-migration-to-mattermost-phase-1-extraction
jsm unpin slack-migration-to-mattermost-phase-2-setup-and-import
```

## 11.6 Multi-machine sync

If you run Phase 1 on your Mac but have a separate Windows laptop you use for Phase 2, install `jsm` on both, `jsm login` on both, and:

```bash
jsm sync
```

`jsm sync` compares your installed skills, local hashes, and last-synced hashes against the catalog, and pulls anything new. It does **not** upload secrets or your per-migration `config.env`; those live in your working directory, never in jsm's cloud. Only the skill definitions sync.

## 11.7 Troubleshooting `jsm`

```bash
jsm doctor
```

This runs a structured health-check: are you authenticated, are your skill directories writable, is the local database healthy, can you reach the server, is your CLI version current? Add `--fix` to have it auto-repair the common issues. This is the first command to run if anything feels off.

**Common problems:**

- `jsm: command not found` after install → your shell hasn't re-read its PATH. Open a new terminal, or `export PATH="$HOME/.local/bin:$PATH"` and add that line to your `~/.zshrc` or `~/.bashrc` so it sticks.
- `jsm whoami` says "not authenticated" after a successful `jsm login` → the keychain entry didn't persist (common on WSL2 / headless Linux). Retry with `jsm login --remote`.
- `jsm install` says "subscription required" but you're subscribed → your subscription email and your Google-OAuth email don't match. Check <https://jeffreys-skills.md/dashboard> and `jsm whoami`; if the emails differ, sign out and sign back in with the correct Google account.
- Install hangs on a slow network → `jsm install --retries 5 <skill>`. Or fall back to manual: download the archive from the link on the skill's dashboard page, extract into `~/.claude/skills/<skill-name>/` yourself, and `jsm verify` to confirm.
- Claude Code or Codex don't see the skill after install → restart the app (desktop) or the session (CLI). The desktop apps index `~/.claude/skills/` on launch.

## 11.8 Manual install without `jsm` (zip-download fallback)

If `jsm` refuses to install on your machine and you can't get past it, you don't have to. The skills are just directories of files; the only thing `jsm` does is fetch them, verify a hash, and drop them in the right place. You can do the same thing by hand, and you can ask Claude Code or Codex to do the bookkeeping for you.

### Step 1: download the skill zip from the website

1. Sign in at <https://jeffreys-skills.md/dashboard> with the Google account on your subscription.
2. Find **`slack-migration-to-mattermost-phase-1-extraction`** in the catalog and click it.
3. On the skill's detail page, click **Download zip**. You get a file like `slack-migration-to-mattermost-phase-1-extraction-1.3.0.zip`, along with a displayed SHA-256 hash you can copy.
4. Repeat for **`slack-migration-to-mattermost-phase-2-setup-and-import`**.

Both zips now sit in your `~/Downloads/` folder (or wherever your browser saves). Don't unzip them manually.

### Step 2: ask the agent to install them

Open a Claude Code or Codex session in any working directory and paste one of these prompts. Substitute your own paths if your browser saved elsewhere.

**For Claude Code:**

> *"I downloaded two skill zip files from jeffreys-skills.md. Please install them into `~/.claude/skills/` by: (1) verifying each zip's SHA-256 matches the hash I'll paste below, (2) extracting each zip into `~/.claude/skills/<skill-name>/` so that `SKILL.md` lands at the top level of that directory, (3) running `chmod +x` on any `.sh` scripts, (4) listing the final tree so I can confirm. The zips are at `~/Downloads/slack-migration-to-mattermost-phase-1-extraction-1.3.0.zip` and `~/Downloads/slack-migration-to-mattermost-phase-2-setup-and-import-1.3.0.zip`. Expected hashes: [paste from the dashboard]."*

**For Codex:** the same prompt, with `~/.codex/skills/` instead of `~/.claude/skills/`. If you want the skills visible to both apps, tell the agent to install them into **both** locations.

### What the agent will do

The agent runs commands roughly equivalent to:

```bash
# Verify hash
sha256sum ~/Downloads/slack-migration-to-mattermost-phase-1-extraction-1.3.0.zip
# Compare against the hash shown on the dashboard

# Extract to the right place
mkdir -p ~/.claude/skills/slack-migration-to-mattermost-phase-1-extraction
unzip -q ~/Downloads/slack-migration-to-mattermost-phase-1-extraction-1.3.0.zip \
  -d ~/.claude/skills/slack-migration-to-mattermost-phase-1-extraction

# Fix script permissions (the zip preserves them, but double-check)
chmod +x ~/.claude/skills/slack-migration-to-mattermost-phase-1-extraction/migrate.sh
chmod +x ~/.claude/skills/slack-migration-to-mattermost-phase-1-extraction/scripts/*.sh
chmod +x ~/.claude/skills/slack-migration-to-mattermost-phase-1-extraction/scripts/*.py

# Confirm SKILL.md is at the top level (not nested inside an extra directory)
ls ~/.claude/skills/slack-migration-to-mattermost-phase-1-extraction/SKILL.md
```

The only part the agent can't do for you is read the hash off the dashboard page; you paste that in. Everything else is file manipulation the agent does safely.

### Confirm the install worked

Restart your Claude Code or Codex session so it re-indexes `~/.claude/skills/` (desktop) or `~/.codex/skills/` (CLI). Then ask:

> *"Do you see the slack-migration-to-mattermost-phase-1-extraction skill?"*

If the agent confirms, you're done; the skill is identical to what `jsm install` would have produced. You miss two niceties: no `jsm list`/`jsm upgrade`/`jsm verify` bookkeeping, and no cross-machine `jsm sync`. Both are recoverable later: once `jsm` starts working, run `jsm adopt <skill-name>` and it will hash the already-installed files, register them in its local database, and treat them as if it had installed them itself.

### Updating a manually-installed skill

When a new version ships, download the new zip from the dashboard, and ask the agent to redo the install (it will overwrite the previous files). Your `config.env`, `workdir/`, and `workdir-phase2/` directories are **outside** the skill directory, so they aren't touched.

### When this fallback is worth it

- You're on a locked-down corporate laptop where you can't install new CLIs but browsers and `unzip` work.
- You hit a `jsm login` keychain bug on a weird platform and don't have time to debug it.
- You want to rehearse the install on an air-gapped machine: copy the zip across by USB, install by hand.
- You just prefer to do it yourself and skip the subscription tooling.

The skills are self-contained: they don't call back to jeffreys-skills.md at runtime. Once the files are on disk, `jsm` is optional.

## 11.9 Uninstalling (if you change your mind)

```bash
jsm uninstall slack-migration-to-mattermost-phase-1-extraction
jsm uninstall slack-migration-to-mattermost-phase-2-setup-and-import
# or:
jsm uninstall --all                  # removes everything jsm installed
```

If you want to uninstall but keep any per-skill configuration you'd written, add `--keep-data`. To cancel the subscription itself, do that from <https://jeffreys-skills.md/dashboard>; `jsm` doesn't touch your billing.

---

# Part 12: Ongoing Mattermost Maintenance (Phase 3)

Phase 1 and Phase 2 got you onto Mattermost. **Phase 3** is a third skill, `slack-migration-to-mattermost-phase-3-ongoing-mattermost-maintainance`, that keeps the server healthy from cutover day forward. Install it once you're live; the ongoing maintenance load is small but it's real, and the skill automates almost all of it.

## 12.1 What the maintenance skill does

Nine stages driven by one orchestrator (`./maintain.sh <stage>`), plus a `weekly-sweep` combo that chains the routine ones:

- **`health`**: live HTTPS + WebSocket + SMTP probe, plus SSH-read disk %, Postgres connection count, log error rate, and service status. Emits a red/yellow/green JSON.
- **`update-os`**: SSH to target, `apt update` + `unattended-upgrade` (security-only by default) + `autoremove`. Detects whether a reboot is required but does not reboot immediately.
- **`schedule-reboot`**: if a reboot is pending, queues it via `at` on the target for the next off-hours window you configured (Sunday 03:00 UTC by default), appends a timestamped entry to `reboot-history.json`.
- **`update-mattermost`**: pins a target Mattermost version, takes a pre-upgrade `pg_dump`, stop/apt-install/start, verifies the new version responds. On failure, auto-rolls-back to the previous version and restores the dump. Details in §12.5.
- **`backup`**: SSH-trigger `pg_dump`, gzip, SHA-256, rotate on-host (30/12/12 daily/weekly/monthly), upload to off-site (rclone → Cloudflare R2 or Hetzner Storage Box), verify upload hash.
- **`db-health`**: Postgres snapshot: DB size, top 20 tables, connection %, vacuum status, lock waits, longest query. Useful trend data.
- **`restore-drill`**: the quarterly canary test. Downloads the newest off-site backup, restores into `SCRATCH_DB_URL`, runs row-count sanity checks. If this fails, your backups are broken; the skill refuses to run `update-mattermost` until it is fixed. Details in §12.6.
- **`rotate-credentials`**: rotates the scoped secret you ask for (`--scope pat`, `--scope ssh`, `--scope offsite`, `--scope session-secret`). Details in §12.11.
- **`disaster-recovery`**: a manual playbook (not a single command) for "the host is gone, rebuild from backups." Walks the agent through ordering a replacement, re-running Phase 2 provision + deploy, restoring from the latest backup, and swapping DNS. Details in §12.9.

Wrapped around those stages: a library of paste-ready agent prompts (§12.4), seven focused subagents for one-off audits (§12.7), scenario packs you drop into cron (§12.8), and the operator library plus quote bank that anchor every decision to a reproducible procedure.

## 12.2 Setup

Install via jsm like the others:

```bash
jsm install slack-migration-to-mattermost-phase-3-ongoing-mattermost-maintainance
```

Copy `config.env.example` → `config.env`, fill in: `MATTERMOST_URL`, `MATTERMOST_ADMIN_TOKEN`, `TARGET_HOST`, `POSTGRES_DSN`, `BACKUP_PATH`, `OFFSITE_REMOTE` (rclone target), `SCRATCH_DB_URL` (for the restore-drill), and a `REBOOT_WINDOW_*` you will accept as downtime. The agent can walk you through filling this in from a Phase 2 `config.env` you already have. The example config is heavily annotated with working values from the Acme Corp scenario so you can see what each field actually looks like.

`./scripts/doctor.sh` is the readiness gate. It runs in three layers:

```bash
./scripts/doctor.sh                      # layer 1: tools + config completeness (fast)
./scripts/doctor.sh --require-remote     # layer 2: SSH reachability + Mattermost ping + PAT check
./scripts/doctor.sh --require-mcp        # layer 3: MCP server registration + reachability
```

Each layer prints a table plus a banner like `=== Health score: 12/12 required passing (100%); READY ===`. Run layer 1 after editing `config.env`; layer 2 before your first real run; layer 3 if you want an agent to drive the skill through its MCP integration instead of shell invocations. Red means blocked; yellow means it ran but something optional is missing; green means you can proceed.

## 12.3 The weekly cadence

This is the whole point: the agent runs everything, you read a one-paragraph status on Monday morning.

- **Saturday night (or any off-peak window), ~20 minutes of agent runtime**: paste the `weekly-sweep.md` prompt. The agent runs `health` → `update-os` → `backup` → `db-health` in order and writes a summary.
- **Monday morning, 1 minute of your attention**: skim the summary. If anything is red, tell the agent to investigate.
- **First Saturday of the quarter, ~60 minutes**: paste `restore-drill.md`. The agent downloads the newest backup, restores it into your scratch DB, and confirms row counts. If the drill fails, treat it as a production incident.
- **On a Mattermost security release**: paste `update-mattermost.md` with the pinned version. The agent takes a pre-upgrade backup, upgrades, and auto-rolls-back if the health check fails.

You can automate the weekly sweep entirely with cron on your workstation plus a webhook alert on failure (set `ALERT_WEBHOOK_URL` in `config.env`), or keep it a scheduled agent-run item. §12.8 shows the exact scenario pack Acme Corp uses.

## 12.4 Paste-ready prompts: you don't hand-roll the wording

The `prompts/` directory is a library of agent prompts already phrased for good outcomes. Pick one, paste, done:

| Prompt file | What the agent does |
|---|---|
| `orient.md` | Reads `config.env`, runs `doctor.sh`, reports where the deployment is and what is known |
| `health.md` | One-shot health snapshot; posts summary |
| `update-os.md` | Applies OS patches, schedules reboot if required |
| `update-mattermost.md` | Bumps Mattermost to the pinned version, verifies, auto-rolls-back on failure |
| `backup.md` | Takes a `pg_dump`, uploads off-site, verifies the hash, reports size and destination |
| `db-health.md` | Postgres sizing, bloat, connections; flags anything slow-burning |
| `restore-drill.md` | Quarterly restore-from-backup verification |
| `schedule-reboot.md` | Queues a pending reboot in the next off-hours window |
| `weekly-sweep.md` | The combo for Saturday nights (health + update-os + backup + db-health) |
| `major-upgrade.md` | Extended sequence for a major (not minor/patch) Mattermost upgrade |
| `plugin-upgrade.md` | Plugin lifecycle: compatibility check, staging, prod install |
| `rotate-credentials.md` | PAT / SSH / off-site / session-secret rotation, one scope at a time |
| `incident-response.md` | Live-incident coordinator: triage, comms cadence, timeline capture |
| `disaster-recovery.md` | Rebuild onto a fresh host from the latest backup |
| `all.md` | Meta-prompt: the agent picks which sub-prompt fits your ask |

These are the exact prompts the skill's operator library points at, so they load the right references and specify the evidence the agent has to emit. Handwriting your own tends to produce mushier outcomes.

## 12.5 Auto-rollback: the upgrade safety net

The `update-mattermost` stage is the one most solo operators lose sleep over. Here is what actually happens when you paste `update-mattermost.md` with a pinned target version:

1. `doctor.sh --require-remote` confirms SSH + ping + PAT still work.
2. `pg_dump` streams the current database to `/var/backups/mattermost/pre-upgrade-<timestamp>.sql.gz` (root-owned, 600). SHA-256 captured.
3. `systemctl stop mattermost` on the target.
4. `apt-get install -y --allow-downgrades mattermost=<target_version>`.
5. `systemctl start mattermost`, then poll `/api/v4/system/ping` for up to 3 minutes.
6. Read the version off `/api/v4/config/client?format=old` and compare to the pinned target.

If step 5 or 6 fails and `MATTERMOST_UPGRADE_ROLLBACK=auto` (the default), the stage:

1. Stops Mattermost.
2. `apt-get install -y --allow-downgrades mattermost=<previous_version>`.
3. `DROP DATABASE mattermost; CREATE DATABASE mattermost OWNER mmuser;`.
4. Streams the pre-upgrade dump back in.
5. Starts Mattermost and records `status: failed_rolled_back` in the report.

The blast radius is: Mattermost is offline for the duration of the upgrade + rollback (typically 2–6 minutes). Data stays intact because the DROP/CREATE restores the pre-upgrade snapshot before it recreates tables. Message history, files, users, sessions, PATs: all back. Users see "reconnecting" in their clients and then it comes back.

This is the loop that lets a solo operator run production upgrades without a pager rotation. Pair it with the quarterly restore-drill (§12.6) and you know the backup side of that loop actually works, because you tested it last quarter on the same dump pipeline.

## 12.6 Restore-drill: the quarterly canary

If you have never restored a backup, you do not have backups. You have files.

`./maintain.sh restore-drill` exercises the backup pipeline end to end:

1. Lists the off-site destination (or local `BACKUP_PATH`) and picks the newest `mm_*.sql.gz`.
2. `DROP DATABASE / CREATE DATABASE` on `SCRATCH_DB_URL`, which is a separate Postgres instance you provisioned specifically for drills. Never point this at the prod DB.
3. Streams the compressed dump through `gunzip | psql` into the scratch DB.
4. Counts rows in `"Users"`, `"Channels"`, `"Posts"` (PascalCase, quoted, per Mattermost's schema convention).
5. Compares each count against `RESTORE_MIN_USERS`, `RESTORE_MIN_CHANNELS`, `RESTORE_MIN_POSTS` you configured.
6. Emits `latest-restore-drill.json` with `status: ok|failed` and the counts.

Three distinct failure modes, each with its own remediation:

- **No backup found**: off-site credentials expired, or the nightly backup has been silently failing. Check `latest-backup.json` from the last week.
- **Restore fails mid-stream**: dump is corrupted or the scratch DB's Postgres major version is older than prod's. `pg_dump` is forward-compatible but not backward.
- **Row counts below minimums**: the backup succeeded but captured an empty or partial DB. This has happened in the wild when a failed migration left Mattermost writing to a scratch schema; the backup job dutifully captured the empty one.

A passing drill costs you ~45 minutes of agent-watched runtime per quarter on a small deployment. A failing drill is the cheapest production incident you will ever have, because it happens on a scratch DB instead of on the day the host dies.

## 12.7 Subagents for deep audits

Seven focused subagents live in `subagents/`. They are not part of the weekly sweep; you invoke them on-demand when you want a second opinion on a specific dimension. Each is already wired to the skill's references, scripts, and config, so you just say "run the X auditor."

| Subagent | Use when |
|---|---|
| `backup-integrity-auditor` | You want judgement on backup completeness, SHA-256 coverage, off-site freshness, and restore-drill recency, not just stage runs |
| `db-bloat-auditor` | DB size is climbing faster than user count can explain; this one looks at table bloat, vacuum status, index health, `pg_stat_user_tables` |
| `health-drift-auditor` | Nothing is red yet, but you want to know what is slowly getting worse across the last 8 weeks of health reports |
| `version-drift-auditor` | You want to know how far behind the recommended upgrade target you are, framed against Mattermost's ESR policy |
| `security-posture-auditor` | Credential rotation cadence, SSH key hygiene, `fail2ban` / UFW state, exposed ports |
| `maintenance-scheduler` | Planning a maintenance window; coordinates comms, picks off-hours, writes the user-facing heads-up |
| `incident-coordinator` | Live incident: triage playbook, comms cadence, timeline capture for the post-mortem |

Think of these as "ask a specialist" tools. They are cheaper than escalating to a human consultant, and they read the same data you can see in `workdir-phase3/reports/`.

## 12.8 Scenario pack: Acme Corp's actual schedule

`assets/scenario-packs/acme-corp-weekly.yaml` is a worked schedule for the 40-user Acme Corp profile threaded through the rest of the guide. Drop it into your scheduler (cron, systemd timers, or a scheduled agent run):

```yaml
workspace: acme-corp
timezone: America/Los_Angeles
operator: alex@acme.com

schedule:
  - name: nightly-backup
    cron: "0 10 * * *"            # 10:00 UTC = 02:00-03:00 Pacific
    command: "./maintain.sh backup"
    log: /var/log/mm-backup.log

  - name: weekly-sweep
    cron: "0 10 * * 0"            # Sunday 10:00 UTC
    command: "./maintain.sh weekly-sweep"
    log: /var/log/mm-sweep.log

  - name: quarterly-restore-drill
    cron: "0 11 1-7 1,4,7,10 0"   # First Sunday of each quarter, 11:00 UTC
    command: "./maintain.sh restore-drill"
    log: /var/log/mm-drill.log

alert_webhook: https://chat.acme.com/hooks/abcdef12345

thresholds:
  disk_pct_red: 85
  pg_conn_pct_red: 80
  log_err_per_min_red: 10

upgrade:
  policy: esr                     # Track ESR releases only
  max_delay_patch_security: 72h
  rollback: auto
```

Lift the cron lines into `crontab -e` on the workstation that holds the agent credentials. The `alert_webhook` posts a red-status summary to a Mattermost channel (you can reuse the one you created for ops-team heads-ups in Phase 2). The `upgrade.policy: esr` line is the most consequential one for small teams: ESR (Enterprise-Scale Release) means fewer, more-stable bumps instead of every minor release.

## 12.9 Disaster-recovery drill

Once a year (pick a Saturday, budget 2 hours), run a full DR simulation: order a fresh cheap Hetzner CX22, restore the latest backup into it with `restore-drill.sh` pointed at that host's PG, and verify it comes up as a working Mattermost. Cancel the CX22 when you are satisfied. This tests the whole DR path without touching production and costs about €0.10 in server-hours.

Full playbook in the skill's `references/DISASTER-RECOVERY.md`. The `incident-coordinator` subagent (§12.7) can also walk you through it live.

## 12.10 Reading the weekly report and spotting trends

`assets/templates/maintenance-report.md` is the shape the agent follows. The summary table looks like this:

| Stage | Result | Notes |
|-------|--------|-------|
| health | green | all probes green, 0 red |
| update-os | 4 security patches, reboot required: yes | reboot scheduled for Sun 03:00 UTC |
| backup | success | 1.4 GB, sha256=ab12…, off-site verified |
| db-health | yellow | Posts table up 8 % week over week, vacuum last ran 14 hours ago |

The trend block matters more than any single week. Look at four-week deltas for disk growth, DB size, and error-rate baseline; these are the slow-burn numbers that predict when you need to upsize the server, not the acute "red" alerts. The `health-drift-auditor` subagent (§12.7) does this reading for you and flags what is getting slowly worse.

Incident post-mortems share a template too (`assets/templates/incident-status.md`): timeline in UTC, root cause (not the symptom), what fixed it, five whys. If you had an incident, fill one of these and drop it next to the weekly report so future-you has context.

## 12.11 Credential-rotation cadence

`./maintain.sh rotate-credentials --scope <name>` rotates one thing at a time. Which scopes and how often:

| Scope | Cadence | What rotates |
|---|---|---|
| `pat` | 90 days | `MATTERMOST_ADMIN_TOKEN` (Mattermost personal access token for the bot admin) |
| `ssh` | annually | Deploy-user SSH key used by the workstation to reach `TARGET_HOST` |
| `offsite` | annually | rclone credentials for `OFFSITE_REMOTE` (R2 / Hetzner Storage Box token) |
| `session-secret` | on compromise only | Mattermost session signing secret; forces all users to re-login |

The security-posture-auditor subagent reads your `rotation-history.json` and tells you what is overdue. For the rare session-secret rotation, expect a full-team re-login and a heads-up message posted 24 hours in advance. Comms templates in `references/comms/` have the wording.

## 12.12 When to bring in more tooling

The Phase 3 skill is deliberately "point-in-time health probes plus scheduled tasks." It does not replace continuous observability. If you eventually need:

- **SLO dashboards and alerting**: spin up Grafana + Prometheus scraping Mattermost's metrics port 8067.
- **Synthetic end-to-end user checks**: Uptime Robot, Better Stack, or Cronitor hitting `/api/v4/system/ping` every 5 minutes.
- **Log aggregation**: Loki or Grafana Cloud for `mattermost.log`.
- **Incident-response runbooks**: Statuspage or a markdown repo your on-call reads on their phone.

All of those are complementary, not replacements for the Phase 3 skill's automation of the routine work. The `OBSERVABILITY-LADDER.md` reference in the skill lays out a graduated path; each rung of the ladder has a "when it is worth the complexity" criterion, so you are not adding dashboards for their own sake.

---

*Last updated: April 2026. Applies to Phase 1 skill v1.x, Phase 2 skill v1.x, Phase 3 skill v1.x, Mattermost 10.11+, the Slack export format in use as of the date above, Claude Code desktop app (April 2026 redesign) and Codex desktop app (Windows Microsoft Store release March 2026), and `jsm` 0.1.x. If Slack substantially changes its export ZIP schema or its admin-UI export flow, expect the "Track A" automation helpers to need adjustment; the structural validators in Phase 1 will catch the break and tell you what moved. If the Claude Code or Codex desktop app shifts how skills are surfaced, `jsm install` will still put the skill files in the canonical `~/.claude/skills/` and `~/.codex/skills/` directories, which are the stable contract the apps honor.*
