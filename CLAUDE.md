# CLAUDE.md

Code, config, schema, scripts, and the live repository tree are the source of truth in this repository.
If `README.md`, `.ai/`, `.ai/06_specs/deep/`, `AGENTS.md`, or older plans disagree with the live codebase, follow the live codebase.

**Reality refresh:** 2026-04-17
**Intent:** This file is the high-signal, policy-heavy repository contract for AI-assisted work in SlateCamp.

---

# 1. Repository identity

SlateCamp is a large Next.js App Router codebase for the **Licensure Examination for Architects (LEA)**.

**Current Status**: **Pre-launch MVP**. The absolute priority is to create the best, most effective, and accurate MVP for launch.

**Core Mandate**: Build for the MVP. **Do not accommodate legacy code or mental load from past iterations.** Backwards compatibility is not a priority; true and effective product execution for the launch is.

This repository already contains substantial product, platform, and operational complexity. It is **not** a greenfield app, toy demo, or single-surface product.

Live audited reality includes:
- multi-portal route surfaces
- broad shared UI/component layers
- large shared logic and server-action layers
- Supabase schema + migration history
- operational scripts and maintenance utilities
- extensive `.ai` operational documentation
- deep `AGENTS.md` hierarchy

Treat every task as work inside an already-evolved, multi-surface system.

---

# 2. Documentation topology and ownership policy

Use documentation surfaces intentionally. They do different jobs.

| Surface | Canonical role |
| --- | --- |
| `README.md` | Comprehensive repository entrypoint for onboarding, setup, navigation, and high-level system orientation |
| `docs/` | Root-level bridge / pointer surface |
| `.ai/` | Operational intelligence layer: audits, plans, tasks, roadmap, logs, state, and agent governance |
| `.ai/06_specs/deep/` | Deep reference / specification corpus |
| `AGENTS.md` hierarchy | Scope-specific operating instructions for humans and AI agents |

Current `.ai` routing source of truth:
- `.ai/00_system/ai-folder-canonical-map.md`

## Policies
1. Do not let these surfaces silently diverge.
2. `README.md` should be comprehensive, but it must not become a mirror of all deep docs.
3. `.ai/` is where operational truth, sequencing, and agent governance belong.
4. `.ai/06_specs/deep/` holds deeper reference and specification material.
5. `AGENTS.md` files define scope-local working rules and must stay aligned with the live subtree they govern.
6. If a topic appears in multiple surfaces, duplication must be intentional and role-based.
7. If a doc becomes stale but historically useful, preserve it and mark it historical, transitional, or superseded.

---

# 3. Canonical truth sources by topic

## Commands and tooling
- `package.json`
- actual files in `scripts/`

## Database and schema truth
- `DATABASE_SCHEMA.sql`
- `supabase/migrations/`

## Runtime / framework behavior
- `next.config.ts`
- `middleware.ts`
- `src/app/`

## Product and subsystem implementation truth
- `src/app/`
- `src/components/`
- `src/features/`
- `src/lib/`
- `src/stores/`
- `src/hooks/`
- `src/config/`

## Operational truth
- `.ai/10_state/`
- `.ai/02_audits/`
- `.ai/03_plans/`
- `.ai/05_logs/`

## Deep reference truth
- `.ai/06_specs/deep/`

## Scope-local working rules
- root `AGENTS.md`
- nearest in-scope nested `AGENTS.md`

---

# 4. Live architecture snapshot (audited 2026-04-17)

These figures are time-sensitive and must be revalidated if reused later.

- `src/app/`: **128** `page.tsx` files, **15** layouts, **105** loading files, **7** error files, **11** route handlers
- `src/lib/actions/`: **160** files
- `src/components/`: **667** files
- `src/features/`: **540** files
- `supabase/migrations/`: **100** files
- `src/`: **81** test files
- tracked `AGENTS.md` files: **128**

## Major active surfaces

### App / portal layer
- dashboard
- admin
- developer
- protected/internal business surfaces
- quiz routes
- calculators/tools
- public pages

### UI layer
Large shared component system spanning admin, analytics, dashboard, notes, portal, quiz-v2, graphics, shared/ui, wiki, and more.

### Feature layer
Larger domain modules, especially 3D and geometry-heavy systems.

### Logic / service layer
Server actions, queries, entitlements, readiness, SRS, quiz logic, wiki logic, payments, paywall, analytics, logging, admin helpers, schema helpers, geometry helpers.

### Data layer
Supabase schema, migration chronology, reset/seed SQL, inspection scripts.

### Operational layer
`.ai` and `AGENTS.md` hierarchy now act as the repo intelligence and governance system.

---

# 5. Mandatory working protocol for AI agents

## Before editing anything
1. Read this file.
2. Read root `AGENTS.md`.
3. Read the nearest in-scope nested `AGENTS.md` files from root down to the target subtree.
4. Inspect the live code/config/schema/scripts/docs in scope.
5. Identify the canonical truth source for the claim or change you are about to make.
6. If you touch structure, ownership, workflow, docs, or key references, update the relevant documentation in the same change.

## Anti-laziness doctrine
You are not allowed to:
- stop at folder names
- infer behavior from old docs without checking code
- preserve stale instructions out of convenience
- claim validation you did not actually run
- write generic cleanup notes detached from actual repo evidence

You must:
- open implementation files
- trace actual consumers/callers when relevant
- verify command names against `package.json`
- verify schema claims against `DATABASE_SCHEMA.sql` and migrations
- update docs and instructions when reality changes

## Scope discipline
Default posture:
- documentation updates for documentation tasks
- operational-state updates for operational-state changes
- no product refactors unless absolutely necessary to document truthfully, and then only with explicit explanation

---

# 6. Command policy

## Canonical commands
### Install
```bash
bun install
```

### Development
```bash
bun run dev
bun run dev:turbo
bun run dev:webpack
```

### Validation
```bash
bun run lint
bun run type-check
bun run build
```

### Storybook
```bash
bun run storybook
bun run build-storybook
bun run check:storybook
```

### Other important scripts
```bash
bun run db:seed
bun run check:entitlements
```

## Command rules
1. Do not invent commands.
2. Do not claim a script exists unless it exists in `package.json` or as an actual executable workflow.
3. Do not assume a top-level `test` script exists — **it currently does not**.
4. If documenting a script, inspect the source and/or the `package.json` entry first.

---

# 7. Validation policy

## For documentation / governance changes
Minimum:
- referenced files and paths exist
- referenced commands exist in `package.json` or as real scripts
- `git diff --check`
- no unsupported stale claims remain in touched docs

## For source-behavior changes
Use as applicable:
- `bun run type-check`
- `bun run lint`
- targeted tests for affected logic areas
- `bun run build` when route/runtime behavior is impacted

## Validation honesty rule
Never write:
- “should work”
- “appears correct”
- “probably fine”

when the task requires actual verification.

---

# 8. Documentation maintenance policy

## When you must update docs
If you change any of the following, update the relevant docs in the same change:
- repo structure
- subsystem ownership
- commands/scripts
- validation workflow
- architecture claims
- documentation topology
- subtree scope or responsibilities

## Which docs to update
### Update `README.md` when
- onboarding/setup changes
- repo structure changes
- command surface changes
- high-level architecture/navigation changes

### Update `.ai/` when
- operational truth changes
- roadmap/priority/risk changes
- audit findings change
- plans/tasks/logs/state need to reflect new reality

### Update `.ai/06_specs/deep/` when
- deep architecture/product/spec/reference content changes

### Update `AGENTS.md` when
- a subtree changes structure
- a subtree changes ownership
- a subtree changes workflow or validation expectations
- path references or major responsibilities drift

---

# 9. AGENTS.md hierarchy policy

The repo has a large `AGENTS.md` hierarchy.

## Rules
1. Root `AGENTS.md` governs globally.
2. Nested `AGENTS.md` files refine rules for their subtree.
3. Local scope wins when it is more specific and not in conflict with higher-order truth.
4. If a nested `AGENTS.md` becomes stale, update it rather than relying on humans to infer new behavior.
5. If you change a subtree and do not update the relevant `AGENTS.md`, your work is incomplete.

## Practical expectation
When working in any subtree, assume the instructions are part of the system, not optional commentary.

---

# 10. Database and migration policy

1. Read `DATABASE_SCHEMA.sql` before making DB claims.
2. Check relevant files in `supabase/migrations/` before asserting migration or policy history.
3. Do not invent table names, columns, relations, or policy counts.
4. Do not run destructive reset/drop scripts casually.
5. Treat schema truth and app behavior as separate things — verify both.
6. When updating DB-related docs, cite both schema and migration evidence where needed.

---

# 11. App / route policy

1. Treat `src/app/` as the live App Router truth.
2. When documenting or editing a route subtree, inspect together:
   - `page.tsx`
   - `layout.tsx`
   - `loading.tsx`
   - `error.tsx`
   - `route.ts`
3. Cross-check route behavior against:
   - matching components
   - server actions / queries / helpers
   - middleware and auth/role boundaries
   - portal docs when relevant
4. Do not describe a portal from route folder names alone.

---

# 12. Components and UI policy

1. `src/components/` is broad and reused across many surfaces.
2. Before changing shared UI, inspect where it is consumed.
3. Preserve current client/server boundaries unless there is a clear reason to change them.
4. Reuse the existing design-system and shared UI structure rather than inventing disconnected patterns.
5. For R3F / 3D-adjacent components, inspect the feature module and performance-sensitive context too.

---

# 13. Shared logic / server actions policy

1. Treat `src/lib/` as a high-risk logic layer.
2. Treat `src/lib/actions/` as mutation/orchestration code.
3. Verify callers, data contracts, and schema dependencies before editing actions.
4. Preserve explicit auth/permission checks and error handling.
5. Inspect adjacent tests and consumers before changing behavior.

## High-risk logic areas
- entitlements
- readiness / SRS / quiz logic
- payments / paywall
- Supabase access patterns
- analytics / logging
- 3D / geometry-adjacent logic when tied to product behavior

---

# 14. Design-system policy

## Core visual constraints
Use design tokens and current design-system patterns.

Primary palette:
- Camp Cobalt — `#1B3FC4`
- Camp Orange — `#E8853A`
- Emerald — `#2D9F6F`
- Warm Red — `#D64545`
- Amber — `#D4951A`
- Surface Light — `#F8F7F5`
- Ink Primary — `#1A2332`

Rules:
- prefer tokens over ad hoc hardcoded styles
- keep radii restrained
- keep shadows modest
- keep transitions restrained and purposeful
- reuse shared UI patterns before inventing new ones

## Copy / tone policy
Avoid empty hype, generic gamification language, and misleading certainty.
Keep copy calm, concrete, and useful.

---

# 15. Pedagogical and domain policy

Respect the domain-specific learning systems already present in the repo.

Key areas:
- IRT / SRS in `src/lib/srs/`
- readiness logic in readiness/readiness-score-related code
- quiz/testing logic in `src/lib/quiz/` and related routes/components/actions
- wiki/reference systems in `src/lib/wiki/` and wiki UI/docs
- 3D and code-compliance learning surfaces in `src/features/3d-lab/` and related modules

Do not replace domain-specific systems with ad hoc assumptions in either implementation or documentation.

---

# 16. Operational `.ai` policy

`.ai/` is not a dumping ground.
Every file there should do at least one of the following clearly:
- explain current operational reality
- record an audit finding
- capture a plan, task, or state snapshot
- preserve historical context
- define governance or agent behavior

## Start here for current operational truth
- `.ai/10_state/current-state.md`
- `.ai/10_state/active-risks.md`
- `.ai/10_state/blockers.md`
- `.ai/02_audits/master-audit.md`
- `.ai/01_roadmap/current-phase.md`
- `.ai/12_agents/repo-agent-model.md`

## Non-destructive rule
Prefer:
- additive updates
- bridge docs
- supersession notes
- archive references
- logs

over deletion of historical material.

---

# 17. Current repo-level risks

As of the 2026-04-16 repo intelligence refresh, major risks are:
1. documentation drift across `README.md`, `.ai`, `.ai/06_specs/deep`, and `AGENTS.md`
2. large surface area making shallow audits misleading
3. no single canonical top-level `test` script
4. missing centralized environment contract / `.env.example`
5. maintenance-sensitive counts and operational claims drifting over time

See also:
- `.ai/10_state/active-risks.md`
- `.ai/10_state/blockers.md`

---

# 18. Change-safety policy

1. Default to documentation-first changes for documentation tasks.
2. Preserve history unless there is a compelling, explicit reason not to.
3. If a file is substantially rewritten, maintain continuity and log the change when appropriate.
4. If you supersede a doc, point to the replacement.
5. Do not perform product refactors under the cover of docs work.

---

# 19. GitNexus / code-intelligence note

This repo includes GitNexus, code-review-graph, and ChunkHound guidance for graph-aware code-intelligence expectations.
If a task depends on blast radius, caller tracing, dependency impact, or refactor safety, run the mandatory three-signal pass in root `AGENTS.md`: GitNexus impact/context, code-review-graph minimal context plus impact radius, and ChunkHound search/research corroboration. Do not improvise blind search-and-replace work, and do not present a high-confidence blast-radius conclusion if any required signal is stale, unavailable, or failed.

---

# 20. If you update this file

When `CLAUDE.md` changes, verify alignment with:
- `README.md`
- root `AGENTS.md`
- `.ai/README.md`
- `.ai/10_state/current-state.md`
- `.ai/00_system/documentation-governance.md`

This file should be policy-heavy, current, and operationally useful.
It must not become a stale parallel universe.

## Mandatory blast-radius triad
- Any blast-radius, caller tracing, dependency impact, or refactor-safety analysis must use **all three** code-intelligence systems before conclusions or edits: GitNexus, code-review-graph, and ChunkHound.
- GitNexus is the authoritative call/process graph signal. Run `gitnexus_impact({target: "symbolName", direction: "upstream"})` before editing any function, class, or method, and use `gitnexus_detect_changes()` before commit/completion checks that involve source edits.
- code-review-graph is the changed-file impact signal. Use the `code-review-graph` MCP tools, starting with `get_minimal_context_tool`, then `get_impact_radius_tool` for changed files or the intended diff. If MCP is unavailable, use `uvx code-review-graph==2.3.2 detect-changes --repo C:\Users\phili\Desktop\slatecamp`.
- ChunkHound is the code-search corroboration signal. Run a targeted ChunkHound search or research query for the symbol, file, route, or workflow being changed (semantic/multi-hop when embeddings are available; regex/path-filtered search otherwise) so non-obvious related code is not missed.
- Report the three-signal result together. If any system is stale, unavailable, or fails, state that explicitly, refresh/retry when safe, and do not present a high-confidence blast-radius conclusion from only one tool.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **slatecamp** (32690 symbols, 53358 relationships, 300 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/slatecamp/context` | Codebase overview, check index freshness |
| `gitnexus://repo/slatecamp/clusters` | All functional areas |
| `gitnexus://repo/slatecamp/processes` | All execution flows |
| `gitnexus://repo/slatecamp/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
