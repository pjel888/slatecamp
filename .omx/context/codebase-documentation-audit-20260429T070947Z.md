# Ralph Context Snapshot — Codebase Documentation Audit

## Task statement
Comprehensively audit the current SlateCamp app codebase and update README.md plus relevant .ai documentation so they accurately reflect routes, features, server/API behavior, data models, tests, environment variables, integrations, UI/design system, security, IP-relevant implementations, known gaps, and operational details.

## Desired outcome
A synchronized documentation set where README.md is the human-readable top-level current-state reference and .ai/ docs are detailed machine/developer-oriented context, with complete route/feature/API/test/env inventories and an audit log.

## Known facts/evidence
- Repository root: /Users/philiplewis/slatecamp.
- Next.js App Router codebase with src/app, src/components, src/features, src/lib, supabase, e2e, scripts, public, and .ai docs.
- User requires strict second-pass verification before finalizing.
- There are many pre-existing uncommitted source changes; docs audit must avoid overwriting unrelated working tree edits.

## Constraints
- Codebase is source of truth.
- Do not expose secrets from env files.
- Prefer Bun and verify scripts against package.json.
- Do not fix unrelated code; documentation accuracy is primary.
- Preserve existing .ai structure where reasonable.
- Team mode requested; shared documentation edits remain in leader/local lane to avoid conflicts.

## Unknowns/open questions
- Exact current route count, API route count, env var set, test file count, implemented feature inventory, and current .ai structure must be discovered from files.
- Test/build/lint feasibility depends on current worktree state and local environment.

## Likely codebase touchpoints
README.md; .ai/**/*.md; src/app/**/*; src/lib/actions/**/*; src/lib/**/*; src/features/**/*; src/components/**/*; supabase/migrations/**/*; DATABASE_SCHEMA.sql; package.json; next.config.ts; middleware.ts; vitest/playwright configs; e2e/**/*; tests in src/**/*.{test,spec}.*; env examples.
