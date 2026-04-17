# Cleanup Scope Baseline

Audit timestamp: 2026-04-17

## Frozen baseline top-level tree

```text
.
├── .agents
├── .ai
├── .claude
├── .code-review-graph
├── .codex
├── .cursor
├── .gemini
├── .github
├── .gitnexus
├── .omx
├── .storybook
├── docs
├── public
├── scripts
├── src
├── supabase
├── README.md
├── AGENTS.md
├── CLAUDE.md
├── DATABASE_SCHEMA.sql
├── package.json
├── next.config.ts
├── middleware.ts
└── root configs and dotfiles
```

## In-scope areas

- root docs and root configs relevant to cleanup risk
- `src/app`
- `src/components`
- `src/features`
- `src/lib`
- `src/hooks`
- `src/stores`
- `src/config`
- `src/data`
- `src/types`
- `scripts`
- `supabase`
- `public`
- `.storybook`
- `.ai`
- root package/dependency/tooling surface through `package.json`

## Excluded or inventory-only areas

| Area | Status | Rationale |
| --- | --- | --- |
| `.git/` | excluded | VCS internals are not repository cleanup targets |
| `.omx/` | inventory-only | local runtime state can create cleanup noise but is not canonical repo code |
| `.claude/`, `.codex/`, `.cursor/`, `.gemini/`, `.gitnexus/`, `.code-review-graph/` | inventory-only | tracked/meta tool mirrors are relevant to governance drift, but this run is centered on codebase cleanup rather than agent-payload parity |
| new docs created during this run | excluded from baseline scope | deliverables only; they do not expand audit scope |

## Major cleanup categories being audited

1. dead code
2. likely dead code
3. legacy and superseded patterns
4. duplicate or overlapping implementations
5. component optimization opportunities
6. client/server boundary misuse
7. dependency rationalization opportunities
8. script and tooling cleanup opportunities
9. validation/readiness blockers
10. safest later implementation sequence

## Current live baseline metrics

- `src/app`: `125` pages, `16` layouts, `96` loading files, `9` error files, `12` route handlers
- `src/components`: `716` files
- `src/features`: `551` files
- `src/lib`: `396` files
- `src/hooks`: `16` files
- `src/stores`: `5` files
- `src/config`: `3` files
- `src/data`: `7` files
- `src/types`: `17` files
- `scripts`: `38` files
- `supabase/migrations`: `89` files

## Anti-recursion statement

New docs created during this cleanup audit run are deliverables only.
They do not expand the audit universe and must not be treated as fresh cleanup targets.
