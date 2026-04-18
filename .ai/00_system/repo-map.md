# Repository Map

## Repository purpose

SlateCamp is a **Pre-launch MVP** for Philippine Architecture Licensure Exam preparation.
The primary goal is to build the most effective, accurate, and true product for launch. **This is not a backwards-compatibility environment.** Work must focus on MVP quality and correctness, not on accommodating legacy code or past mental load.
It combines student study flows, admin content tooling, internal developer and business portals, wiki/content systems, analytics, testing modes, calculators, and interactive 3D learning modules.

## High-level architecture

### Runtime application

- `src/app/`: App Router routes, layouts, loading/error boundaries, route handlers, and portal entrypoints
- `src/components/`: UI surface spanning admin, dashboard, analytics, notes, wiki, testing, shared UI, and 3D-adjacent presentation
- `src/features/`: large feature modules, especially `3d-lab` and `wall-configurator`
- `src/lib/`: server actions, queries, payments, Supabase helpers, entitlements, readiness, SRS, quiz logic, PD 1096 helpers, wiki/content logic, and shared utilities
- `src/hooks/`, `src/stores/`, `src/config/`, `src/data/`, `src/types/`: client state, runtime configuration, fixture data, and shared contracts

### Data and operational layer

- `supabase/`: migration chronology, reset/seed utilities, and DB inspection scripts
- `DATABASE_SCHEMA.sql`: schema snapshot, but not currently policy-complete for post-2026-04-07 RLS/authz changes
- `scripts/`: operational tooling for DB checks, content upload/normalization, Storybook validation, entitlements checks, and data maintenance

### Documentation and governance layer

- `README.md`: repo entrypoint
- `docs/`: root bridge surface
- `.ai/`: operational intelligence layer for audits, plans, state, logs, prompts, skills, and agent governance
- `.ai/06_specs/deep/`: deep reference/specification corpus
- `AGENTS.md` hierarchy: scope-specific operating instructions

### Meta-tooling and runtime overlays

- `.claude`, `.codex`, `.cursor`, `.gemini`: tracked agent/skill mirror trees
- `.omx`: local runtime state, plans, notes, and session overlays for oh-my-codex
- `.mcp.json`, `.ai/mcp.json`, `.opencode.json`: MCP/tool wiring surfaces

## Top-level directory responsibilities

| Path | Responsibility |
| --- | --- |
| `.ai/` | Operational audits, plans, logs, state, agent docs, and documentation governance |
| `.claude/`, `.codex/`, `.cursor/`, `.gemini/` | Tool-specific mirror copies of agent/skill content |
| `.github/` | PR template and CI workflow definitions |
| `.omx/` | Local runtime state and planning overlays |
| `.storybook/` | Storybook runtime config |
| `docs/` | Root bridge docs only |
| `public/` | Public static assets |
| `scripts/` | Maintenance and operational scripts |
| `src/` | Main product runtime |
| `supabase/` | Schema and migration chronology |

## Major runtime flows

### App request flow

1. Incoming request reaches `middleware.ts`
2. `src/lib/supabase/middleware.ts` refreshes auth state and gates protected routes
3. Route/layout in `src/app/` composes server and client components
4. Data access flows through `src/lib/actions/`, `src/lib/queries/`, `src/lib/supabase/*`, and related helpers

### Admin/content flow

1. Admin routes under `src/app/admin/`
2. Large editor panels and admin tables under `src/components/admin/`
3. Content mutations through `src/lib/actions/admin/*`
4. Persistence in Supabase-backed tables and migrations

### Payment/webhook flow

1. Provider webhook requests hit `src/app/api/webhooks/lemonsqueezy/route.ts` and `src/app/api/webhooks/payrex/route.ts`
2. Both use admin Supabase access
3. Subscription and analytics side effects update tables before current idempotency marker insert

### 3D learning flow

1. Dashboard 3D Lab routes under `src/app/dashboard/3d-lab/`
2. Runtime module/config/template logic under `src/features/3d-lab/`
3. Client-heavy rendering via React Three Fiber / Three.js

## Data flow and external systems

- Supabase/PostgreSQL: primary data store, auth, RLS, and admin/service-role operations
- LemonSqueezy and PayRex: payment and webhook providers
- Vercel cron paths: `/api/cron/focus-review-scan`, `/api/cron/compute-signals`
- Storybook: component/dev validation surface
- Anthropic/OpenAI-related SDKs are present in dependencies, but the main audited external systems with live route evidence are Supabase and payments

## Deployment, release, and tooling shape

- Package manager contract is documented as Bun-first
- CI currently enforces Storybook build only
- No app-wide GitHub Action currently enforces `build`, `lint`, `type-check`, or policy checks
- Local Bun bootstrap currently fails on manifest resolution, which blocks clean environment hydration through the documented path

## AI and agent tooling surface

- Root `AGENTS.md` defines repo-wide execution rules
- Nested `AGENTS.md` coverage is broad in `src/`, partial in docs/governance areas
- `.ai` now uses a numbered-only top-level taxonomy
- large preserved payload and history stores live under numbered parents such as `03_plans/preserved`, `09_archive/store`, `11_skills/payloads`, and `12_agents/payloads`
- Tool-specific mirror trees are tracked copies without a declared generator/parity contract
- `.omx` is a local runtime surface and should not be treated as durable repository truth

## Documentation structure

- `README.md`: onboarding and navigation
- `docs/`: bridge layer
- `.ai/`: operational state, audits, plans, logs, prompts, skills, agents
- `.ai/06_specs/deep/`: deep reference corpus with active and historical content
- Current drift centers on authority ambiguity, not lack of documentation volume

## Areas of ambiguity or drift

- Numbered `.ai` overlay vs unnumbered preserved folders
- `10_state/legacy-state` vs `10_state` vs `.omx/state`
- `08_prompts/legacy` vs `08_prompts`
- `09_archive/store` vs `09_archive` vs `06_specs/deep/archive`
- Root MCP config vs `.ai/mcp.json`
- Bun-first docs vs dual-lockfile reality
- Server-first conventions vs the current breadth of client-heavy and monolithic runtime surfaces
