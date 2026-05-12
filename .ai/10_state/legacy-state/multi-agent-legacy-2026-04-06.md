> Legacy note
> Preserved orchestration guide from 2026-04-06.
> Its filesystem contract is historical and no longer the active `.ai` authority model.

# Multi-Agent Orchestration Guide

**Status:** Active
**Version:** 1.0
**Last Updated:** 2026-04-06
**Applies To:** OpenCode, Antigravity, Codex

---

## Overview

SlateCamp uses a **shared filesystem-based orchestration layer** to coordinate multiple AI agents across OpenCode, Antigravity, and Codex. The `.ai/` directory is the **single source of truth** for all agents, committed to git and cloned by each platform.

```
.ai/
├── prd.md                    # Project definition — ALL agents read first
├── rules/                    # Strict implementation constraints
│   ├── stack.md              # Next.js 16, React 19, TypeScript rules
│   ├── design.md             # Campfire design token rules
│   └── pedagogy.md           # IRT/SRS learning model rules
├── state/
│   ├── active-tasks/         # ONE FILE PER AGENT — concurrency control
│   ├── pending-reviews/       # Artifacts awaiting human approval
│   └── memory.md             # Universal knowledge base (verified facts)
├── artifacts/
│   ├── plans/                # Pre-execution plans (require approval)
│   ├── verifications/        # Screenshots, diffs, browser recordings
│   └── deliverables/         # Completed work outputs
├── tasks/                    # Task files (one per work item)
├── logs/
│   └── changelog.md          # All meaningful changes
├── opencode.json             # OpenCode agent configs
└── mcp-servers.json          # Shared MCP config (OpenCode + Antigravity + Codex)
```

---

## Agent Spawning Protocol

### Step 1: Check Active Tasks

Before spawning any agent, check `.ai/state/active-tasks/`. If files exist, read them to understand what other agents are doing.

### Step 2: Claim a Task File

Each spawned agent must create a task claim file at `.ai/state/active-tasks/{agent-slug}-{task-slug}.md`:

```markdown
# Agent Task: {Task Name}

**Agent:** {agent_name}
**Platform:** {opencode|antigravity|codex}
**Status:** in_progress
**Started:** {YYYY-MM-DD HH:MM}
**Expected completion:** {YYYY-MM-DD HH:MM} (+4h TTL)

## Files being modified
- `src/app/dashboard/analytics/page.tsx`
- `src/lib/queries/analytics.ts`

## Blocked by
- (none, or list other active task files)

## Progress log
- {YYYY-MM-DD HH:MM} — Started analysis of analytics page
- {YYYY-MM-DD HH:MM} — Writing chart components

---

**Status:** in_progress
**Last heartbeat:** {YYYY-MM-DD HH:MM}
```

### Step 3: Log to Artifacts

- **Pre-execution plans** → `.ai/artifacts/plans/{task-slug}.md`
- **Verification outputs** → `.ai/artifacts/verifications/{task-slug}/`
- **Completed deliverables** → `.ai/artifacts/deliverables/{task-slug}/`

### Step 4: Mark Complete

When done, update the task claim file:
```markdown
**Status:** completed
**Completed:** {YYYY-MM-DD HH:MM}
**Verification:** [link to artifacts/verifications/]
```

Or if blocked:
```markdown
**Status:** blocked
**Blocker:** {description}
```

---

## OpenCode Configuration

See `.ai/opencode.json` for:
- Agent prompt injections
- Task claiming rules
- Pre-commit hooks
- Artifact directory locations

### OpenCode Agents

| Agent | Role | Prompt Summary |
|-------|------|---------------|
| `primary` | Orchestrator | Read prd + memory + active-tasks before any work |
| `plan` | Planner | Save plans to `.ai/artifacts/plans/` before implementation |
| `build` | Builder | Check active-tasks, claim task file, read rules |
| `oracle` | Verifier | Verify claims against memory.md facts |
| `verifier` | QA | Write results to `.ai/artifacts/verifications/` |
| `librarian` | Researcher | Use MCP Context7 for library docs |

---

## Antigravity Configuration

1. **Workspace Setup**: Point Antigravity workspace to this repo
2. **MCP Servers**: Import `.ai/mcp-servers.json` into Antigravity's MCP config
3. **Custom Instructions**: Add to Antigravity workspace instructions:

```
You are part of a SlateCamp multi-agent swarm.
Your source of truth is the `.ai/` directory.
- Read `.ai/prd.md` before starting any task
- Check `.ai/state/active-tasks/` to avoid conflicts
- Claim a task file before modifying any code
- Save pre-execution plans to `.ai/artifacts/plans/` for human approval
- Write verification artifacts to `.ai/artifacts/verifications/`
- Update `.ai/state/memory.md` with verified facts
- Update `.ai/logs/changelog.md` with meaningful changes
```

4. **Spawning**: When dispatching 5 agents simultaneously, each must:
   - Read existing task files from `.ai/state/active-tasks/`
   - Create their own task claim
   - Report back to `.ai/state/active-tasks/` on completion

---

## Codex Configuration

1. **Workspace Setup**: Clone this repo into Codex workspace
2. **MCP Servers**: Import `.ai/mcp-servers.json`
3. **Custom Instructions**: Add to Codex workspace:

```
You are part of SlateCamp's multi-agent engineering team.
Rules:
1. Read `.ai/prd.md` before any task
2. Check `.ai/state/active-tasks/` before claiming work
3. Create a task claim file: `.ai/state/active-tasks/codex-{task}.md`
4. Save plans to `.ai/artifacts/plans/` for review
5. Never modify code without a task claim file
6. Log changes to `.ai/logs/changelog.md`
```

---

## Concurrency Rules

### File-Level Locking

When multiple agents work simultaneously:

| Situation | Rule |
|-----------|------|
| Two agents need same file | First to claim wins; second waits or takes different file |
| No claim file exists | Agent may proceed but must create claim immediately |
| Claim file is stale (>4h old) | Agent may claim it; mark previous owner as `stale` |
| Human overrides agent | Human wins; document in `pending-reviews/` |

### Claim File Template

Each agent creates: `.ai/state/active-tasks/{platform}-{task-slug}.md`

```markdown
# Task: {Brief title}

**Platform:** opencode | antigravity | codex
**Agent:** {agent identifier}
**Status:** in_progress
**Started:** {ISO timestamp}
**TTL:** 4 hours

**Files targeted:** (list)
**Blockers:** (list other active tasks blocking this one)

---

## Progress

## Notes
```

### Conflict Resolution

1. Read all existing claim files in `.ai/state/active-tasks/`
2. If your target file is claimed by another active agent → coordinate or defer
3. If no conflict → create your claim and proceed
4. After completion → mark `status: completed` and optionally delete file

---

## Artifact Trust Layer

### Plans (`.ai/artifacts/plans/`)

Pre-execution plans generated by agents. **Require human approval before implementation.**

Format:
```markdown
# Plan: {Task title}

**Generated by:** {agent}
**Date:** {date}
**Status:** pending_review | approved | rejected

## What this plan does

## Files to change

## Verification criteria

## Risks

---
**Reviewer:** (human name or agent)
**Approved:** (date)
**Notes:** (optional)
```

### Verifications (`.ai/artifacts/verifications/`)

Outputs from agent work — browser recordings, screenshots, test logs, diffs.

Naming: `{task-slug}/{YYYY-MM-DD}-{type}.{ext}`

Examples:
- `analytics-fix/2026-04-06-screenshot-dashboard.png`
- `quiz-mode/2026-04-06-test-log.txt`
- `refactor/2026-04-06-diff.patch`

### Deliverables (`.ai/artifacts/deliverables/`)

Completed work outputs — PR descriptions, release notes, documentation.

---

## Pre-Commit Hooks

The `.ai/opencode.json` defines three pre-commit checks:

1. **no-sql-outside-archive** — `.sql` files must be in `.ai/docs/archive/`
2. **no-omc-state** — No `.omc/` directories in `.ai/`
3. **no-hardcoded-secrets** — No `.env`, `credentials.*`, or `.pem` files

These run on every `git commit` via Husky.

---

## MCP Server Sharing

See `.ai/mcp-servers.json` for the unified MCP configuration manifest. This file is the **single source of truth** for all MCP server configurations across OpenCode, Antigravity, and Codex.

**Current Status:**
- Supabase MCP: ✅ Active (OpenCode)
- Chrome DevTools MCP: ✅ Active (OpenCode)
- Context7 MCP: ✅ Active (OpenCode)
- GitHub MCP: ✅ Active (OpenCode)
- Stitch MCP: ⚠️ Available (needs API key)

**To enable Antigravity + Codex:**
1. Import `.ai/mcp-servers.json` into each platform's MCP config
2. Set required environment variables (Supabase keys, etc.)
3. Verify connectivity with a test query

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Stale claim files blocking work | Check timestamp; if >4h old, mark `stale` and proceed |
| Two agents modified same file | Last commit wins in git; revert if needed |
| Agent left no artifact | Document in `pending-reviews/`; address in next session |
| MCP server not responding | Check `.ai/mcp-servers.json`; verify env vars set |
| Plan not approved but agent proceeded | Flag in `pending-reviews/`; review in next session |

---

*This file is the canonical multi-agent orchestration guide. Update when adding new agents or changing workflows.*
