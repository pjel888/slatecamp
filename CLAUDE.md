# CLAUDE.md

Code and executable config are the source of truth in this repository. If docs, README, or AGENTS files disagree with the live code, follow the code.

This file reflects the repository state validated on 2026-04-07.

## Build & Development Commands

```bash
bun install
```
- Installs dependencies from `package.json` and `bun.lock`.

```bash
bun run dev
```
- Runs `scripts/dev.js`.
- Uses Turbopack on all platforms (default in Next.js 16).
- Pass `-- --webpack` to force Webpack if needed.

```bash
bun run build
```
- Runs `next build`.
- May fail with `ENOENT: no such file or directory, open '.next/required-server-files.json'` if previous build was interrupted.

```bash
bun run dev:turbo
```
- Runs `next dev --turbopack` directly.

```bash
bun run dev:webpack
```
- Runs `next dev --webpack` directly.

## Test & Lint Instructions

```bash
bun run lint
```
- Runs Storybook check first, then ESLint.
- ESLint extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.
- Warns on unused vars and hardcoded hex colors inside Tailwind utility strings.
- Verified 2026-04-07: completes with warnings only.

```bash
bun run type-check
```
- Runs `tsc --noEmit`.
- Verified 2026-04-07: passes.

```bash
bun test
```
- Uses Bun as test runner.
- Verified 2026-04-07: suite runs but has failures.

## Project Architecture/Patterns

### Stack
- **Framework:** Next.js 16.1.6 App Router, React 19.2.4, TypeScript 5.9.3
- **Styling:** Tailwind CSS 4 (CSS-first config with semantic tokens)
- **Database:** Supabase SSR, PostgreSQL
- **Payments:** LemonSqueezy, PayRex
- **State:** Zustand for shared client state
- **Testing:** Bun test runner, Storybook 8 with Vite

### Route Structure
- App routes live under `src/app`.
- Public routes: `/`, `/about`, `/contact`, `/pricing`, `/try`, `/tools`, `/calculators`, `/test-3d`
- Dashboard routes: `src/app/dashboard`
- Admin routes: `src/app/admin`
- Developer routes: `src/app/developer`
- CEO routes: `src/app/(protected)/ceo` → resolves to `/ceo`
- API routes: `src/app/api`
- Webhooks: `/api/webhooks/lemonsqueezy`, `/api/webhooks/payrex`

### Code Organization
- **Components:** `src/components/` — shared UI, portal shells, stories
- **Features:** `src/features/` — larger vertical modules (3d-lab, wall-configurator)
- **Hooks:** `src/hooks/` and `src/lib/hooks/`
- **Actions/Queries:** `src/lib/actions/` (mutations), `src/lib/queries/` (reads)
- **Stores:** `src/stores/` — Zustand stores
- **Types:** `src/types/`
- **Database:** `supabase/` — migrations and SQL assets
- **Scripts:** `scripts/` — local tooling

### Styling & Typography
- Tailwind CSS-first config in `src/app/globals.css` with semantic tokens
- Prefer semantic classes and shared primitives from `src/components/ui/*`
- Fonts: Atkinson Hyperlegible (body/default), Plus Jakarta Sans (display headings), Syne (accent headings), Sora (logo), DM Mono (code/data)

### Path Alias
- `@/*` maps to `src/*`

## Important Context

### Design Tokens (Slatecamp System)
| Token | Hex | Tailwind Class |
|-------|-----|---------------|
| Slate Cobalt | `#1B3FC4` | `text-primary` / `bg-primary` |
| Slate Orange | `#E8853A` | Progress celebration |
| Emerald | `#2D9F6F` | `text-success` — mastery, correct |
| Warm Red | `#D64545` | `text-destructive` — errors |
| Amber | `#D4951A` | `text-warning` — warnings |
| Surface Light | `#F8F7F5` | `bg-background` |
| Ink Primary | `#1A2332` | `text-foreground` |

- Border radius: `rounded-sm` (buttons), `rounded-md` (cards), `rounded-lg` (modals)
- Shadows: `shadow-sm` (hover), `shadow-md` (dropdowns), `shadow-lg` (modals)
- Transitions: max 300ms, default `duration-150 ease-out`

### Pedagogical Engine
- IRT 2PL Model: `src/lib/srs/irt.ts`
- SM-2 SRS: `src/lib/srs/sm2.ts`
- Readiness Score: `src/lib/readiness-score.ts`

## Known Issues

### Type-Check Errors (2026-04-07)
- `src/app/api/webhooks/lemonsqueezy/route.ts`: Refactored from Stripe, requires SDK verification.
- `src/lib/actions/quiz-v2/submit-answer.test.ts`: Test-only type mismatch.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **slatecamp** (9666 symbols, 22111 relationships, 300 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/slatecamp/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/slatecamp/context` | Codebase overview, check index freshness |
| `gitnexus://repo/slatecamp/clusters` | All functional areas |
| `gitnexus://repo/slatecamp/processes` | All execution flows |
| `gitnexus://repo/slatecamp/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the GitNexus index becomes stale. Re-run analyze to update it:

```bash
npx gitnexus analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx gitnexus analyze --embeddings
```

To check whether embeddings exist, inspect `.gitnexus/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without `--embeddings` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after `git commit` and `git merge`.

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

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
