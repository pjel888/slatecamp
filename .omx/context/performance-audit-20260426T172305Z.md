# Ralph Context Snapshot — Whole-App Performance Audit

## Task statement
Run a comprehensive, reproducible performance audit for the entire SlateCamp app and preserve evidence under `.ai/00_performance`.

## Desired outcome
- Required report structure under `.ai/00_performance` exists.
- Repo inventory, measurement plan, environment capture, frontend/API/Supabase/build/hotspot audits, regression/CI plans, ranked bottlenecks, recommendations, and README are written.
- Reusable measurement scripts and package scripts exist where appropriate.
- Actual commands are run where possible and raw logs/results are saved.
- Blocked measurements are explicitly documented with reasons and next steps.

## Known facts/evidence
- Repository root is `/Users/philiplewis/slatecamp`.
- Repo is a Next.js App Router SlateCamp MVP with Bun, Supabase, Playwright, and existing `.ai` operational docs.
- Current execution surface is Codex App/native outside tmux; `$team` tmux runtime is unavailable from this pane.
- `AGENTS.md` requires Bun for scripts, package script verification, current code inspection, and evidence-backed claims.

## Constraints
- Never print/store secrets, tokens, cookies, private Supabase credentials, or user data.
- Prefer read-only Supabase/database tests unless safe fixtures already exist.
- Do not run destructive database operations.
- Prefer existing tools before adding dependencies; no new dependencies without need.
- Measurement/instrumentation changes must be separated from optimization changes.
- No speculative optimizations without baseline and follow-up measurement.
- All performance artifacts live under `.ai/00_performance` unless a repo tool requires otherwise; link back when needed.

## Unknowns/open questions
- Which runtime commands currently pass/fail in this checkout.
- Whether local env has valid Supabase credentials and whether live auth/API flows are reachable.
- Which routes require auth and which can be measured unauthenticated.
- Whether Kimi/Gemini CLIs are available locally.
- Whether existing Playwright tests cover performance or only functional checks.

## Likely codebase touchpoints
- `package.json`, `playwright.config.ts`, `next.config.ts`, `middleware.ts`, `src/app/**`, `src/lib/supabase/**`, `src/lib/actions/**`, `src/lib/queries/**`, `src/components/**`, `src/features/**`, `supabase/migrations/**`, `DATABASE_SCHEMA.sql`, `.ai/00_performance/**`.
