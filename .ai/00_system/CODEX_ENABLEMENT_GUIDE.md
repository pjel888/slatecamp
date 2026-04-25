# CODEX_ENABLEMENT_GUIDE

## Purpose

This guide is the fastest way for future Codex sessions to orient in SlateCamp and avoid wasting time on stale docs, missing commands, or unclear ownership.

## Read first by default

1. `README.md`
2. `AGENTS.md`
3. `CLAUDE.md`
4. `.ai/00_system/repo-map.md`
5. `.ai/00_system/ai-folder-canonical-map.md`
6. `.ai/00_system/DOCS_SOURCE_OF_TRUTH.md`
7. `.ai/00_system/VALIDATION_MATRIX.md`
8. `.ai/00_system/ENVIRONMENT_CONTRACT.md`
9. `DESIGN.md` for visual/design-system work

## Read next by task type

### General repository orientation

- `.ai/02_audits/CODEX_ENABLEMENT_AUDIT.md`
- `.ai/10_state/current-state.md`
- `.ai/10_state/findings-register.md`

### `/admin` work

- `src/app/admin/AGENTS.md`
- `.ai/02_audits/ADMIN_SURFACE_AUDIT.md`
- `.ai/03_plans/ADMIN_SURFACE_PLAN.md`
- `.ai/00_system/ROUTE_SURFACE_MAP.md`
- `.ai/00_system/VALIDATION_MATRIX.md`

### `/developer` work

- `src/app/developer/AGENTS.md`
- `.ai/02_audits/DEVELOPER_SURFACE_AUDIT.md`
- `.ai/03_plans/DEVELOPER_SURFACE_PLAN.md`
- `.ai/00_system/ROUTE_SURFACE_MAP.md`

### Data, auth, or Supabase work

- `supabase/AGENTS.md`
- `src/lib/AGENTS.md`
- `.ai/00_system/DATA_BOUNDARY_MAP.md`
- `.ai/00_system/ENVIRONMENT_CONTRACT.md`
- `.ai/00_system/VALIDATION_MATRIX.md`

### Docs or AGENTS work

- `.ai/00_system/DOCS_SOURCE_OF_TRUTH.md`
- `.ai/02_audits/AGENTS_AND_DOCS_AUDIT.md`
- `.ai/03_plans/DOCS_AND_AGENTS_HARDENING_PLAN.md`

### Design-system or UI styling work

- `DESIGN.md`
- `src/app/globals.css`
- `.ai/06_specs/deep/03-design/001-design-system.md`
- `/developer/design-system` when the app is running
- run `bun run design:lint` when `DESIGN.md` changes

### Skill-assisted Codex work

- `.agents/README.md`
- `.ai/00_system/CODEX_SKILLS_MAP.md`

### Companion AI CLI work

- Kimi Code CLI is available locally and should be used opportunistically when it can improve quality, speed, or independent verification.
- Verified on 2026-04-25:
  - binary: `/Users/philiplewis/.local/bin/kimi`
  - `kimi info`: `kimi-cli version: 1.37.0`
  - health check: `kimi --quiet -p 'Health check only. Reply exactly: KIMI_CODE_OK'`
- Good uses:
  - independent review of broad plans, audits, and risky implementation strategies
  - second-pass code review on bounded diffs
  - UX copy alternatives and product-claim tightening
  - test strategy, edge-case brainstorming, and migration pre-mortems
  - summarizing large read-only context when Codex needs a parallel perspective
- Guardrails:
  - Codex remains responsible for final edits, verification, and claims.
  - Do not send secrets, credentials, private env values, production data, or service-role keys to Kimi.
  - Prefer read-only prompts unless explicitly delegating a contained draft or review task.
  - Use Kimi when it materially helps; do not block simple local work on Kimi.
- Typical non-interactive commands:
  - `kimi --quiet -p 'Health check only. Reply exactly: KIMI_CODE_OK'`
  - `kimi --work-dir /Users/philiplewis/slatecamp --quiet -p 'Read-only review: ...'`
  - `kimi --work-dir /Users/philiplewis/slatecamp --plan --quiet -p 'Plan review only: ...'`

## What the major surfaces own

- `/admin` = content, review, publishing, taxonomy, knowledge/question management, and internal ops workflows
- `/developer` = internal inspection, documentation, status, DB/tools, and future runtime truth surfaces
- `src/lib` = shared logic, server actions, queries, auth/entitlements, payments, logging, and data access
- `supabase` = schema chronology, reset/seed helpers, and DB-side operational scripts
- `.ai` = operational docs, audits, plans, logs, state, and governance
- `.agents/skills` = Codex-discoverable repo-shared skill surface

## Known repo-wide friction points

- no committed root `.env.example`
- no root `test` script in `package.json`
- Bun bootstrap currently fails on one manifest dependency in this environment
- `/developer` mixes true inspection surfaces with mock/static displays
- many active `.ai` docs are still stale from the 2026-04-16 pass and need staged refresh
- Kimi Code is available as a companion CLI, but it is not a substitute for local inspection, tests, or Codex-owned verification

## Anti-loop rule

New docs created during a run are outputs, not fresh audit scope.
Do not recursively reopen scope just because a newly created doc mentions another area.
