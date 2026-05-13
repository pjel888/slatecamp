<!-- Generated: 2026-04-18 | Reality Refresh: 2026-04-18 -->

# SlateCamp Repository

## Pre-launch MVP Mandate
**Status**: The repository is in a pre-launch MVP phase.
**Objective**: Create the best, most effective, accurate, and true product for launch.
**Directive**: **Focus on the MVP.** Do not spend cycles or mental load accommodating legacy code or past iterations. The goal is velocity and quality for the launch MVP, not backwards compatibility.

## Scope
This file governs the whole repository unless a deeper `AGENTS.md` overrides it.



## AI Orchestration Workflow

This repository uses an AI-assisted workflow coordinated by Hermes.

Primary roles:
- Hermes: orchestrator, memory, routing, task dispatcher, operating-system assistant
- Codex: primary implementation agent for production code, refactors, tests, bug fixes, and PR-ready diffs
- Claude: senior planner/reviewer when available; use for architecture, edge cases, critique, simplification, and checking fit to brief
- OpenCode Go: fallback planner/reviewer, codebase explorer, and flexible model bench
- Kimi direct: fallback long-context coding/review model when OpenCode Go is unavailable or insufficient
- DeepSeek: debugging, reasoning, hidden-assumption checks, and second-opinion review

For every non-trivial change:
1. Create or infer a clear task brief: goal, non-goals, constraints, affected files/systems, acceptance criteria, risks, definition of done.
2. Identify affected files and likely risks before editing.
3. Make a short implementation plan.
4. Implement in a branch, git worktree, or clearly isolated task environment. Do not edit `main` directly unless Philip explicitly says so.
5. Run tests, lint, typecheck, and design checks where applicable, following this file's validation expectations.
6. Review the diff using a model different from the builder whenever practical.
7. Summarize the final result with evidence: changed files, commands run, failures, risks, and recommended next action.

Routing defaults:
- Implementation: Codex -> OpenCode Go Build -> Kimi direct -> DeepSeek for diagnosis/manual patch planning.
- Planning/review: Claude -> OpenCode Go Plan/Explore -> Kimi direct -> Codex reviewer thread/agent.

If Claude runs out of credits, is rate-limited, unavailable, too slow, or blocked, immediately continue with OpenCode Go. If OpenCode Go fails, continue with Kimi direct. If Kimi direct fails, use Codex.

Safety rules:
- Never modify `.env`, secrets, private keys, production credentials, billing, DNS, production database state, or migration history unless explicitly instructed.
- Never run destructive commands without explicit approval: `rm -rf`, `git reset --hard`, `git clean -fd`, force-push, destructive database migrations.
- Never merge, deploy, or push to `main` automatically.
- Do not expose secrets in logs, summaries, commits, prompts, screenshots, or external tools.

Subagent rules:
- Use subagents only for bounded work: codebase exploration, review, test investigation, security check, documentation check, UI consistency check.
- Avoid parallel write-heavy agents, especially agents editing the same files or architecture area.
- Every subagent must return concise findings, evidence, risk level, and recommended action. Do not dump raw logs unless necessary.

Definition of done:
- Requested behavior is implemented or the task is explicitly scoped as audit/planning only.
- Tests/lint/typecheck have been run or explicitly deemed unavailable/not applicable.
- Diff or artifact has been reviewed.
- Risks and remaining uncertainty are disclosed.
- Final recommendation is clear.

## Current repository reality
SlateCamp is a large Next.js App Router codebase for LEA preparation. It is a **pre-launch MVP** that is broad, mature, and operationally heavy.

Live evidence from the repo on 2026-05-03:
- `src/app/` contains 128 `page.tsx` routes, 15 layouts, 105 loading files, 7 error boundaries, and 11 route handlers
- `src/lib/actions/` contains 160 files across root and feature subdirectories
- `src/components/` contains 667 files
- `src/features/` contains 540 files
- `supabase/migrations/` contains 100 migration files
- `src/` contains 81 test files
- the repo tracks 128 `AGENTS.md` files

This is not a greenfield app or a toy demo. Treat it like a multi-surface product with significant documentation and governance needs.

## Canonical sources by topic
- Commands and tooling: `package.json`
- Database truth: `DATABASE_SCHEMA.sql` and `supabase/migrations/`
- Next.js/runtime truth: `next.config.ts`, `middleware.ts`, `src/app/`
- Design-system contract: `DESIGN.md` for agent-readable visual identity, `src/app/globals.css` for implemented CSS/Tailwind tokens
- Operational truth: `.ai/`
- Deep reference/spec docs: `.ai/06_specs/deep/`
- Repo entrypoint: `README.md`
- Policy-heavy repo contract: `CLAUDE.md`
- `.ai` canonical map: `.ai/00_system/ai-folder-canonical-map.md`
- Codex startup guide: `.ai/00_system/CODEX_ENABLEMENT_GUIDE.md`
- Validation contract: `.ai/00_system/VALIDATION_MATRIX.md`
- Environment contract: `.ai/00_system/ENVIRONMENT_CONTRACT.md`

## What agents must do before editing
1. Read the nearest in-scope `AGENTS.md` files from root down to the target subtree.
2. Inspect the live code, config, schema, and scripts in scope before making claims or edits.
3. Update documentation and agent guidance in the same change when structure, workflow, ownership, or key file references drift.
4. Keep `.ai`, `README.md`, and the `AGENTS.md` hierarchy aligned.

## Global rules
- Use Bun for package and script execution.
- Read `DATABASE_SCHEMA.sql` before any database-related work.
- Verify commands against `package.json`; do not assume a top-level `test` script exists.
- Prefer non-destructive documentation updates: annotate, supersede, or index rather than silently delete history.
- Avoid shallow scanning. Folder names are not enough in this repository.
- Generated audit, plan, and log artifacts do not recursively expand audit scope.
- When a run is explicitly audit/planning only, stop at documentation and planning artifacts; remediation belongs to a later implementation-approved run.

## Validation expectations
- Run `bun run type-check` when source-behavior or architectural claims change.
- Run `bun run lint` when workflow, tooling, or style claims change.
- Run `bun run design:lint` when design-system tokens, visual identity guidance, or `DESIGN.md` changes.
- Check every referenced route, script, schema file, and doc link by path.
- Run `git diff --check` before completion for documentation-heavy changes.

## Documentation topology
- `README.md` = comprehensive repository entrypoint
- `CLAUDE.md` = policy-heavy repository contract
- `docs/` = root-level bridge surface
- `.ai/` = operational intelligence layer
- `.ai/06_specs/deep/` = deep reference/specification corpus
- `.ai/00_system/ai-folder-canonical-map.md` = current `.ai` canonical routing map
- `.agents/skills/` = repo-shared Codex skill surface

Use these roles intentionally. Do not let them drift into contradictory copies.

## Anti-laziness rule
- Do not stop at the directory tree.
- Open the implementation files that define the behavior you are documenting or changing.
- If a deeper `AGENTS.md` or live code contradicts an older note, follow the narrower scope and current code reality.

## Audit and planning rule
- Audit outputs must tie findings to evidence paths and stable IDs.
- Plans must link back to findings and stop short of implementation details.
- Generated audit artifacts are deliverables, not new baseline scope.

## Mandatory blast-radius triad
- Any blast-radius, caller tracing, dependency impact, or refactor-safety analysis must use **all three** code-intelligence systems before conclusions or edits: GitNexus, code-review-graph, and ChunkHound.
- GitNexus is the authoritative call/process graph signal. Run `gitnexus_impact({target: "symbolName", direction: "upstream"})` before editing any function, class, or method, and use `gitnexus_detect_changes()` before commit/completion checks that involve source edits.
- code-review-graph is the changed-file impact signal. Use the `code-review-graph` MCP tools, starting with `get_minimal_context_tool`, then `get_impact_radius_tool` for changed files or the intended diff. If MCP is unavailable, use `uvx code-review-graph==2.3.2 detect-changes --repo C:\Users\phili\Desktop\slatecamp`.
- ChunkHound is the code-search corroboration signal. Run a targeted ChunkHound search or research query for the symbol, file, route, or workflow being changed (semantic/multi-hop when embeddings are available; regex/path-filtered search otherwise) so non-obvious related code is not missed.
- Report the three-signal result together. If any system is stale, unavailable, or fails, state that explicitly, refresh/retry when safe, and do not present a high-confidence blast-radius conclusion from only one tool.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **slatecamp** (10595 symbols, 24826 relationships, 300 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

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
