# Applicability Gates

<!-- FRONTIER-PLAN-SUITE: 2026-07-20 -->

Apply only gates triggered by the requested change. A gate adds analysis, not
automatic artifacts, tests, agents, or approval.

## GATE-UX-01: UI And Accessibility

Define user states, keyboard/focus behavior, responsive constraints, and failure
feedback. Verify against `DESIGN.md` (agent-readable identity) and
`src/app/globals.css` (implemented tokens). Browser proof requires explicit
current-task user authorization.

## GATE-NEXT-01: Next.js App Router And React 19

Verify only the server/client boundaries, caching, streaming, serialization,
middleware (`middleware.ts` + `src/lib/supabase/middleware.ts`), route groups,
and runtime behavior actually touched. This is Next.js 16 App Router on React
19 — not the Next.js in model memory. Inspect the actual route files
(`page.tsx`/`layout.tsx`/`loading.tsx`/`error.tsx`/`route.ts`) together when a
route subtree changes. Preserve server-component defaults unless interactivity
truly requires a client boundary.

## GATE-CONTRACT-01: Types And Shared APIs

Map current consumers, validation, error semantics, and compatibility only when
an active consumer requires it. `src/lib/actions/` is a high-risk mutation
layer (~160 files); `src/lib/queries/` is the read layer; `src/types/` holds
shared types including the generated `supabase.ts`. Regenerate Supabase types
when schema changes (see GATE-DATA-01).

## GATE-DATA-01: Supabase And Postgres State

Define schema/data invariants, RLS policies, RPC security definer boundaries,
authorization, concurrency, idempotency, failure recovery, and fix-forward path.
Authoritative inputs: `DATABASE_SCHEMA.sql` + `supabase/migrations/`. Any
migration/RLS/RPC/grant/Supabase-client change **must** follow
`../../00_system/supabase-change--protocol--v1.md` (advisor baseline capture,
`bunx supabase db push --dry-run --linked`, rollback smoke test, post-apply
advisor rerun, generated-type reconciliation). Do **not** run destructive
reset/drop scripts casually. Production data mutation and table drops are out of
scope without fresh authority.

## GATE-SEC-01: Auth, Entitlements, And Secrets

Model identities (Supabase Auth), roles (`user_roles`), entitlements
(`src/lib/entitlements/`), portal access (`admin`/`developer`/`ceo`), trust
boundaries, denial paths, cron-auth (`src/lib/api/cron-auth.ts`), production
guardrails (`src/lib/env/production-guardrails.ts`), token lifecycle, and
redaction. Never expose credential material. Dev bypasses
(`DEV_FORCE_USER_ID`, `ALLOW_DEV_PORTAL_BYPASS`, `DEV_FORCE_TIER`) must not be
enabled in production.

## GATE-VERIFY-01: Evidence

Map each acceptance criterion to the cheapest decisive authorized evidence and
the Completion Contract. Real commands live in `package.json` and
`../../00_system/VALIDATION_MATRIX.md`. Tests, builds, browser automation,
Storybook, and visual QA require explicit current-task user authorization
(`TEST_TASK`). `validate:release` is a heavy pre-release aggregate, not a
routine gate.

## GATE-PERF-01: Performance

Name the hot path, measurable budget, evaluator, and regression signal. The 3D
Lab (`src/features/3d-lab/`, `src/components/r3f/`) is performance-sensitive
and has dedicated perf scripts (`perf:3d:*`). Do not optimize hypothetical
bottlenecks. Use `.ai/00_performance/` tooling when performance is the actual
task.

## GATE-PEDAGOGY-01: Domain Learning Logic

Trigger when touching IRT/SRS (`src/lib/srs/`), readiness scoring
(`src/lib/readiness/`), quiz logic (`src/lib/quiz/`, `src/lib/actions/quiz-v2/`),
wiki (`src/lib/wiki/`), or mastery. These are domain-specific learning systems —
do not replace them with ad hoc assumptions. Inspect the relevant tests
(`src/lib/__tests__/readiness-score.test.ts` and neighbors).

## GATE-OPS-01: Release And Operations

Trigger only for actual external operations or release claims (Vercel
preview/production deploys, Supabase production). Separate local, hosted,
provider, and operator evidence. Add rollout or rollback only when the claim
requires it.

## GATE-AGENT-01: Agent Framework

Preserve authority precedence, the Task Contract, capability-based routing,
portable single-agent fallback, bounded delegation depth, one-writer ownership,
structured handoffs, retry escalation, lead-owned synthesis, context economy,
user test control, and deterministic contract validation.

Reject circular delegation, concurrent writes to the same file, unsupported
model identifiers, silent capability downgrade, and worker-summary completion.

## GATE-CLEAN-01: Cleanup And Migration

Map behavior to preserve, callers, deletion order, reference repair, and
recovery. Prefer deletion over compatibility when no current obligation requires
preservation (pre-launch MVP mandate). Supabase migration cleanup follows the
supabase-change protocol, not casual drops.
