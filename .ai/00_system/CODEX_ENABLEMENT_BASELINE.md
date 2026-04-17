# Codex Enablement Baseline

Timestamp: 2026-04-17 12:20 +08:00

## Scope freeze

This run audits the repository as it exists at T0 for Codex enablement:
- orientation
- documentation authority
- validation clarity
- `/admin` and `/developer` understanding
- environment/runtime/data boundaries
- reusable Codex skill opportunities

New docs and skills created during this run are deliverables, not new audit scope.

## Top-level baseline tree

```text
.DS_Store
.agents
.ai
.claude
.code-review-graph
.codex
.cursor
.cursorrules
.gemini
.git
.gitattributes
.github
.gitignore
.gitnexus
.mcp.json
.omx
.opencode.json
.storybook
.windsurfrules
AGENTS.md
CLAUDE.md
DATABASE_SCHEMA.sql
GEMINI.md
README.md
bun.lock
components.json
db-spec.json
docs
eslint.config.mjs
middleware.ts
next.config.ts
package-lock.json
package.json
postcss.config.mjs
public
schema.sql
scripts
src
supabase
tsconfig.json
tsconfig.tsbuildinfo
vercel.json
```

## In-scope areas

- Root contract stack: `README.md`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `package.json`
- `.ai/` operating layer
- `docs/` bridge layer
- `src/app/admin/`
- `src/app/developer/`
- `src/lib/` and `src/lib/supabase/`
- `supabase/` and `DATABASE_SCHEMA.sql`
- `scripts/`
- `AGENTS.md` hierarchy relevant to Codex operation
- Repo-shared skill surface under `.agents/skills/`

## Excluded or inventory-only

- Product/runtime code changes: excluded by run mode
- SQL/migrations/config/package mutations: excluded by run mode
- `.git/`: inventory-only
- `.omx/` runtime residue: inventory-only unless needed as evidence
- Generated baseline inventories from prior runs: evidence only, not fresh audit scope

## Baseline `AGENTS.md` sources relevant to Codex

- `AGENTS.md`
- `.ai/AGENTS.md`
- `src/AGENTS.md`
- `src/app/AGENTS.md`
- `src/app/admin/AGENTS.md`
- `src/app/developer/AGENTS.md`
- `src/lib/AGENTS.md`
- `scripts/AGENTS.md`
- `supabase/AGENTS.md`

## Baseline major docs relevant to Codex operation

- `README.md`
- `CLAUDE.md`
- `.ai/00_system/repo-map.md`
- `.ai/00_system/ai-folder-canonical-map.md`
- `.ai/00_system/naming-conventions.md`
- `.ai/00_system/documentation-governance.md`
- `.ai/02_audits/master-audit.md`
- `.ai/02_audits/2026-04-17-ai-file-lifecycle-audit.md`
- `.ai/03_plans/executive-remediation-roadmap.md`
- `.ai/10_state/current-state.md`
- `.ai/10_state/findings-register.md`

## Immediate observed Codex-friction facts

- No committed root `.env.example`
- No root `test` script in `package.json`
- `docs/shared/agent-tiers.md` is still missing despite the `ultrawork` skill expecting it
