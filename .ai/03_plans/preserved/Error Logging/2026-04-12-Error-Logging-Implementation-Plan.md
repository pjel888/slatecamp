# Error Logging Implementation Plan

**Date:** 2026-04-12
**Mode:** `$ralplan` consensus planning, deliberate mode
**Primary grounding:** `.ai/plans/2026-04-11-Error-Logging-Audit.md` + live repository state
**Spec gate:** `.ai/docs/01-product/011-Error-Logging-Feature-Specification.md` is currently empty. That file must be backfilled from this plan before execution begins.

## Requirements Summary

Implement error logging in a phased, migration-safe way that fits the current SlateCamp architecture instead of bolting on another isolated event system.

The plan must preserve these repo realities:

- The app already has one partial structured event path: entitlement events log structured payloads and persist selected events to `analytics_events` via [`src/lib/entitlements/audit.ts`](src/lib/entitlements/audit.ts), while middleware emits a `traceId` via [`src/lib/supabase/middleware.ts`](src/lib/supabase/middleware.ts).
- Server actions and routes still use mixed patterns: typed returns, `throw new Error`, `console.error`, `console.warn`, and selective best-effort persistence across the critical surfaces identified in the audit.
- `audit_logs` is an immutable trigger-driven admin/content audit table, not a general-purpose engineering error store, per [`supabase/migrations/007_add_audit_logs.sql`](supabase/migrations/007_add_audit_logs.sql).
- At least one consumer currently disagrees with the real `audit_logs` schema: [`src/app/developer/tools/logs/page.tsx`](src/app/developer/tools/logs/page.tsx) reads `user_id/action/details`, while the actual schema and audit helpers use `actor_id/event_type/table_name/record_id/metadata/content_snapshot`.
- No external monitoring dependency is installed today in [`package.json`](package.json), so phase 1 must not depend on vendor-specific SDKs.

**Phase-1 storage decision**

- `audit_logs` stays reserved for immutable audit/business history.
- Middleware and edge-like runtime paths use **console-only structured logging** in phase 1.
- Non-middleware server-side operational error events use **`analytics_events` as the explicit phase-1 durable sink**, behind a dedicated logging adapter and read model.
- A dedicated `application_error_logs` table is a later evaluation item, not a phase-1 prerequisite.

## Non-Goals

- Repo-wide normalization of all throw/result contracts in the first rollout
- Reusing `audit_logs` as a general engineering telemetry table
- Adding Sentry or another vendor SDK in phase 1
- Behavioral refactors to quiz-v2 or admin flows beyond boundary logging and schema/read-model repair

## Acceptance Criteria

1. A written feature spec exists at `.ai/docs/01-product/011-Error-Logging-Feature-Specification.md` and matches this phased architecture.
2. A shared logging module exists with:
   - typed event taxonomy
   - explicit severity levels
   - redaction rules for secrets/PII
   - request/trace correlation support
   - pluggable sinks
3. Runtime profiles are explicit:
   - edge-safe logger for middleware/runtime-edge paths: console-only, non-throwing, no durable DB write
   - server logger for standard server actions/routes: console + `analytics_events` durable sink + future vendor adapter seam
4. Middleware auth refresh failures are logged with request context instead of failing silently around [`src/lib/supabase/middleware.ts:48-63`](src/lib/supabase/middleware.ts).
5. First-wave critical surfaces are migrated to the shared logger **without changing their existing throw/return contracts**:
   - `quiz-v2/start-session`
   - `quiz-v2/submit-answer`
   - admin question/wiki/roles/taxonomy/content mutations
   - LemonSqueezy and PayRex webhook handlers
6. Non-critical quiz background work remains non-blocking:
   - `after(...)` hooks in [`src/lib/actions/quiz-v2/submit-answer.ts:443-447`](src/lib/actions/quiz-v2/submit-answer.ts) continue to log failures without breaking the quiz flow.
7. `audit_logs` consumers are aligned to the real schema, and the Developer tooling presents two explicit sources:
   - `Audit Logs`
   - `Application Errors`
8. The correlation contract is explicit and consistently implemented where applicable:
   - `request_id`
   - optional `trace_id`
   - `route_or_action`
   - `user_id`
   - optional `session_id`
   - webhook `provider` + `event_id`
9. Dedupe/cardinality rules are explicit for:
   - webhook retries
   - background-task repeat failures
10. Tests cover logger normalization, redaction, trace propagation, middleware failure logging, webhook failure logging/idempotency, contract-preserving action capture, and at least one admin + one quiz-v2 migration path.
11. Verification passes for targeted tests plus `bun run lint`, `bun run type-check`, and `bun run build`, with any unrelated baseline failures explicitly documented.

## RALPLAN-DR Summary

### Principles

1. Keep audit logging and engineering telemetry separate.
2. Prefer incremental compatibility bridges over big-bang rewrites.
3. Preserve current user-visible semantics on critical paths unless a separate contract-change effort is approved.
4. Make runtime profile, request context, and redaction first-class, not follow-up polish.
5. Migrate highest-risk surfaces first, then fan out mechanically.

### Decision Drivers

1. **Operational visibility:** current failures are easy to miss in middleware, webhooks, and server actions.
2. **Compatibility risk:** quiz-v2 and admin flows already mix typed returns and throws, so behavior changes should not hide inside a logging rollout.
3. **Storage boundary correctness:** `audit_logs` is too narrow for generic engineering logging, and phase 1 still needs a stable durable read model.

### Viable Options

#### Option A: Shared logger + `analytics_events` as the phase-1 durable sink

**Approach:** introduce a shared logging core, keep middleware console-only, use `analytics_events` as the phase-1 durable operational sink for non-middleware server paths, keep `audit_logs` unchanged, and defer vendor monitoring to a later adapter phase.

**Pros**
- Matches current repo shape and existing entitlement precedent.
- Gives phase 1 a concrete storage decision instead of deferring it into implementation.
- Preserves a clean audit-versus-telemetry boundary.

**Cons**
- `analytics_events` is not a perfect long-term semantic fit for operational failures.
- Leaves a temporary mixed state where some legacy `console.*` calls remain outside first-wave scope.

#### Option B: Shared logger + dedicated `application_error_logs` table in phase 1

**Approach:** introduce the same shared logging core, but add a new migration and dedicated operational-log store immediately in phase 1 instead of using `analytics_events`.

**Pros**
- Strongest semantic separation between analytics, audit, and operational failures from day one.
- Cleaner long-term Developer tooling, retention rules, and indexes.
- Avoids overloading `analytics_events` with dual purpose.

**Cons**
- Higher initial migration and policy-design cost.
- Slower first-wave rollout because schema, read policies, and tooling all have to land before operational value is realized.
- Increases phase-1 blast radius while the feature spec is still being backfilled.

#### Option C: External monitoring first, then retrofit app code

**Approach:** install Sentry/another vendor first, wire raw exceptions directly, and normalize app surfaces later.

**Pros**
- Fastest path to some crash visibility.
- Simplifies vendor-managed stack-trace capture.

**Cons**
- Solves vendor ingestion before taxonomy, redaction, runtime split, and read-model boundaries.
- Adds dependency and rollout surface before the internal contract is stable.

#### Option D: Expand `audit_logs` into the canonical log store

**Approach:** push most logging into Supabase by broadening `audit_logs` and routing application errors there.

**Pros**
- One queryable database destination.
- Reuses existing audit-table concepts.

**Cons**
- Conflicts with the current `audit_logs` schema and semantics in [`supabase/migrations/007_add_audit_logs.sql`](supabase/migrations/007_add_audit_logs.sql).
- Risks turning a low-volume immutable audit table into an overloaded engineering telemetry sink.
- Makes future external observability harder, not easier.

### Recommendation

Choose **Option A** over **Option B** for phase 1.

It gives the rollout a concrete storage decision while preserving the right architectural split:

- middleware/edge-safe paths: console-only structured transport
- non-middleware server paths: `analytics_events` behind an operational logging adapter
- immutable business/data audit: `audit_logs`

Option B remains the strongest alternative and should be re-evaluated after phase-1 usage data is available. It is not chosen for phase 1 because the current repo still has an empty official spec, a broken logs UI, and high-risk first-wave call sites that benefit more from faster contract stabilization than from a brand-new schema immediately.

## Pre-Mortem

### Scenario 1: The logger becomes another sidecar nobody uses

**Failure mode:** new code uses the shared logger, but legacy actions and routes keep throwing/logging ad hoc.
**Why it happens:** no migration wave, no grep-driven checklist, no enforcement pass.
**Mitigation:** phase the rollout by named surfaces, add targeted grep verification for `throw new Error` and `console.error` in migrated directories, and add a follow-up enforcement pass only after the core proves stable.

### Scenario 2: Middleware logging adds auth latency or breaks redirects

**Failure mode:** request-context logging inside middleware changes cookies/response handling or slows every request.
**Why it happens:** middleware is edge-sensitive and the logger incorrectly assumes Node/service-role capabilities.
**Mitigation:** keep middleware logging edge-safe, non-throwing, and console-only in phase 1; do not do synchronous durable writes from middleware.

### Scenario 3: Sensitive data leaks into durable logs

**Failure mode:** tokens, cookies, raw webhook payloads, or PII are written to `analytics_events` or future vendor sinks.
**Why it happens:** event metadata is passed through directly from current errors or request bodies.
**Mitigation:** define redaction helpers before wiring any sink, add unit tests for forbidden fields, and require explicit allowlists for persisted metadata.

## Expanded Test Plan

### Unit

- logger event normalization and severity mapping
- redaction helper strips tokens, auth headers, cookies, and payment secrets
- Supabase/PostgREST error formatting composes with the new logger around [`src/lib/supabase/format-error.ts`](src/lib/supabase/format-error.ts)
- request/trace helper behavior when trace IDs are present or absent
- correlation and dedupe key helpers
- contract-preserving boundary helpers for admin + quiz-v2 flows

### Integration

- middleware auth refresh failure path logs context and still redirects correctly
- `startSession` logs recoverable and fatal failures without changing its current success/error payloads
- `submitAnswer` logs fatal path and background-task failures without breaking the quiz flow or changing phase-1 rethrow behavior
- webhook handlers record durable business failures and idempotency outcomes around `processed_webhook_events`
- Developer tooling reads both `audit_logs` and the operational error read model correctly

### End-to-End

- admin question create/update/delete emits the expected audit/operational evidence and UI still revalidates
- quiz session start/submit flow still behaves correctly under success and forced-failure conditions
- webhook replay/idempotency path returns the expected JSON result and logs only once per processed event fingerprint

### Observability

- grep-based migration check for first-wave directories after implementation
- one smoke query against the `analytics_events`-backed operational error read model
- one smoke path proving correlation/trace IDs survive from route/middleware entry into emitted events where applicable
- explicit Developer tools validation that `Audit Logs` and `Application Errors` are separate and accurate

## Pre-Execution Gate

Before coding starts:

1. Backfill `.ai/docs/01-product/011-Error-Logging-Feature-Specification.md` from this plan.
2. Freeze the phase-1 storage boundary in the spec:
   - middleware/edge-safe console transport only
   - non-middleware durable operational events in `analytics_events`
   - immutable business/data audit stays in `audit_logs`
3. Freeze the correlation contract:
   - `request_id`
   - optional `trace_id`
   - `route_or_action`
   - `user_id`
   - optional `session_id`
   - webhook `provider` + `event_id`
4. Freeze dedupe rules:
   - webhook dedupe by `provider + external event id`
   - background-task repeat-failure dedupe by source + route/action + request/session context + normalized error fingerprint within a bounded time window

## Implementation Steps

### Phase 0: Restore the product contract before coding

**Goal:** stop the implementation from depending on an empty spec file.

- Backfill `.ai/docs/01-product/011-Error-Logging-Feature-Specification.md` from this plan before feature execution starts.
- Record the storage boundary explicitly:
  - `audit_logs` remains immutable audit/business history
  - middleware uses edge-safe console-only structured logging
  - non-middleware support-worthy application failures persist to `analytics_events` in phase 1 through a filtered sink and namespaced event envelope

**Grounding**
- Spec file is currently empty.
- App-level guidance already requires “try-catch with structured error logging” in [`src/app/AGENTS.md:112`](src/app/AGENTS.md).

### Phase 1: Build the shared logging core

**Goal:** create the internal abstraction before touching critical paths.

Create a new logging area, likely under `src/lib/logger/` or `src/lib/logging/`, with two runtime profiles:

- `edge-safe logger`
  - console-only
  - non-throwing
  - no service-role or durable DB dependency
- `server logger`
  - console sink
  - durable sink backed by `analytics_events`
  - future vendor adapter seam

Build the shared core with:

- typed event contract: family, action, severity, message, error payload, trace/request identifiers, actor/user context, route/action context, durability classification
- redaction helpers for secrets and disallowed fields
- sink interface with at least:
  - edge-safe console sink
  - server console sink
  - filtered durable sink backed by `analytics_events`
  - stubbed external-monitoring sink interface
- wrappers/helpers for:
  - `formatSupabaseError` integration from [`src/lib/supabase/format-error.ts`](src/lib/supabase/format-error.ts)
  - request/action context creation
  - safe `captureException`-style calls that never throw

**Reuse targets**
- [`src/lib/entitlements/audit.ts:12-41`](src/lib/entitlements/audit.ts) for structured payload + best-effort persistence shape
- [`src/lib/analytics-server.ts:5-18`](src/lib/analytics-server.ts) for non-blocking server persistence pattern

### Phase 2: Define the phase-1 read model and repair schema drift

**Goal:** align what is persisted with the real schema instead of forcing all logs into one table.

- Keep `audit_logs` scoped to immutable audit/business records defined by [`supabase/migrations/007_add_audit_logs.sql:6-11`](supabase/migrations/007_add_audit_logs.sql).
- Do **not** repurpose `audit_logs` for generic engineering exceptions.
- Use `analytics_events` as the explicit phase-1 durable operational sink for non-middleware application errors.
- Add a dedicated query/read-model layer for Developer tooling so the UI is not coupled directly to raw `analytics_events` shape.
- Make the phase-1 enforcement model explicit:
  - `analytics_events` already has user-own RLS for normal app access in [`supabase/migrations/010_schema_hardening.sql:97-99`](supabase/migrations/010_schema_hardening.sql)
  - Developer-tool operational-log reads do **not** rely on user-own RLS
  - Developer-tool reads happen only through a gated server-side query/action path for developer/super-admin users
  - if privileged access is needed, it is confined to that query layer and never exposed as direct client-side table access
- Fix consumers that currently assume the wrong schema:
  - [`src/app/developer/tools/logs/page.tsx:8-26`](src/app/developer/tools/logs/page.tsx)
  - any other stale readers found by grep
- Normalize all audit-log reads behind the existing helpers in:
  - [`src/lib/audit/audit-actions.ts`](src/lib/audit/audit-actions.ts)
  - [`src/lib/audit/audit-queries.ts`](src/lib/audit/audit-queries.ts)
- Present Developer tooling as two explicit sources:
  - `Audit Logs`
  - `Application Errors`

### Phase 3: Add request/trace context propagation

**Goal:** make logs traceable across middleware, actions, and routes.

- Introduce a canonical trace/request context helper.
- Reuse the existing `traceId` concept already emitted by entitlements instead of inventing parallel names everywhere:
  - [`src/lib/supabase/middleware.ts:121-124`](src/lib/supabase/middleware.ts)
  - [`src/lib/entitlements/get-viewer-entitlements.ts:42`](src/lib/entitlements/get-viewer-entitlements.ts) and downstream consumers
- Update middleware to wrap `supabase.auth.getUser()` in safe logging without altering redirect/cookie semantics:
  - [`src/lib/supabase/middleware.ts:48-63`](src/lib/supabase/middleware.ts)
- Define explicit dedupe/cardinality rules:
  - webhook: `provider + event_id + event_type`
  - background tasks: `source + route_or_action + request_id/session_id + normalized error fingerprint`

### Phase 4: Migrate the first-wave critical surfaces

**Goal:** cover the highest operational value before broadening scope.

#### 4A. Middleware auth refresh

- Replace silent failure around [`src/lib/supabase/middleware.ts:63`](src/lib/supabase/middleware.ts) with structured, non-throwing logging.
- Keep middleware persistence lightweight and console-only in phase 1.

#### 4B. Quiz-v2 critical path

- `start-session`
  - preserve typed-return behavior already present at [`src/lib/actions/quiz-v2/start-session.ts:69-74`](src/lib/actions/quiz-v2/start-session.ts) and [`:228-231`](src/lib/actions/quiz-v2/start-session.ts)
  - capture the remaining throw/console split at [`:201`](src/lib/actions/quiz-v2/start-session.ts) and [`:295-299`](src/lib/actions/quiz-v2/start-session.ts) through shared helpers without changing the current contract
- `submit-answer`
  - distinguish fatal request failures from non-critical background work
  - keep `after(...)` background path non-blocking per [`src/lib/actions/quiz-v2/submit-answer.ts:443-447`](src/lib/actions/quiz-v2/submit-answer.ts)
  - preserve the current terminal rethrow behavior at [`:467-468`](src/lib/actions/quiz-v2/submit-answer.ts) in phase 1; boundary logging wraps the failure but does not change semantics

#### 4C. Admin mutation cluster

- Start with the heavy-usage files called out by the audit:
  - [`src/lib/actions/admin/questions.ts`](src/lib/actions/admin/questions.ts)
  - [`src/lib/actions/admin/wiki.ts`](src/lib/actions/admin/wiki.ts)
  - [`src/lib/actions/admin/roles.ts`](src/lib/actions/admin/roles.ts)
  - [`src/lib/actions/admin/taxonomy.ts`](src/lib/actions/admin/taxonomy.ts)
  - [`src/lib/actions/admin/content.ts`](src/lib/actions/admin/content.ts)
- Preserve each file’s existing throw/return contract in phase 1.
- Add boundary capture wrappers only:
  - thrown failures stay thrown
  - `{ error }` returns stay `{ error }`
  - logging/classification becomes consistent even while contracts remain heterogeneous
- Where durable audit matters, emit explicit structured events in addition to existing DB triggers if the action falls outside the three trigger-covered tables.

#### 4D. Webhook handlers

- Wrap business failure points in:
  - [`src/app/api/webhooks/lemonsqueezy/route.ts:52-118`](src/app/api/webhooks/lemonsqueezy/route.ts)
  - [`src/app/api/webhooks/payrex/route.ts:46-79`](src/app/api/webhooks/payrex/route.ts)
- Preserve idempotency with `processed_webhook_events`.
- Emit durable business/operational events for failed subscription state transitions and webhook validation failures that matter operationally.
- Keep raw secrets and signed payload content out of persistent logs.

### Phase 5: Consolidate helper adoption and add enforcement

**Goal:** prevent the shared logger from becoming optional.

- Add reusable action helpers for:
  - unauthorized
  - validation failure
  - Supabase mutation failure
  - non-critical background failure
- Keep these helpers contract-preserving in phase 1.
- Add directory-level follow-up passes for:
  - `src/lib/actions/admin/**`
  - `src/lib/actions/quiz-v2/**`
  - `src/app/api/webhooks/**`
  - selected `src/app/api/ai/**` and `src/app/api/cron/**` routes after first-wave stabilization
- Add grep-driven checks or review checklist items that flag legacy `throw new Error` + raw `console.error` patterns in migrated surfaces.

### Phase 6: Add external monitoring adapter after the internal contract is stable

**Goal:** avoid vendor-first architecture.

- Only after phases 1-5 stabilize, choose and integrate an external monitoring vendor.
- Route high-volume engineering errors there instead of Supabase.
- Keep the adapter behind the shared sink interface so the rest of the repo does not know or care which vendor is installed.

## Risks and Mitigations

| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| Empty official spec | Execution can drift because the intended feature contract is not documented | Backfill the spec file before coding starts |
| Big-bang action rewrite | Quiz/admin regressions are likely if all actions change contract at once | Migrate first-wave surfaces only, preserve existing contracts exactly, then expand |
| `audit_logs` misuse | The schema is narrow and immutable by design | Keep it for audit/business only; use a separate durable boundary for operational failures |
| PII leakage in logs | Webhooks and auth surfaces can expose secrets | Redaction-first logger core + unit tests |
| Middleware latency | Auth refresh runs on many requests | Use non-blocking, edge-safe middleware logging |
| Tooling/schema drift | Existing developer logs page already mismatches the table | Repair consumers before using them as verification evidence |
| `analytics_events` semantic overload | Phase-1 operational errors share a table with analytics | Use a namespaced event family and a dedicated read model; re-evaluate dedicated storage in a later phase |

## Verification Steps

1. Add focused unit tests for the logging core, redaction, trace helpers, and dedupe helpers.
2. Extend `submit-answer` tests and add `start-session` tests for fatal versus non-critical logging behavior while preserving current contracts.
3. Add route tests for both webhook handlers covering:
   - invalid signature
   - duplicate event
   - business update failure
4. Add at least one middleware-focused test around `getUser()` failure behavior.
5. Add at least one admin mutation test proving boundary logging without contract change.
6. Validate audit-log readers against the real schema using the existing audit helpers.
7. Validate the operational-error read model against the `analytics_events`-backed sink.
8. Run:
   - `bun run lint`
   - `bun run type-check`
   - `bun run build`
   - targeted `bun test` files for logger, middleware/auth, quiz-v2, webhooks, and admin mutations
9. Run post-migration grep checks for first-wave directories to confirm legacy patterns were intentionally reduced, not just moved.

## ADR

### Decision

Adopt a phased shared-logger architecture that separates:

- immutable audit/business events
- filtered durable support-worthy application events
- high-volume engineering telemetry via a future external adapter

Phase-1 persistence is explicitly split:

- middleware/edge-safe logging: console-only
- non-middleware operational logging: `analytics_events` behind a dedicated adapter and read model

### Drivers

- Middleware, quiz-v2, admin actions, and webhooks need immediate operational visibility.
- `audit_logs` is structurally and semantically too narrow for general engineering errors.
- The repo already has a partial traceable structured event precedent in entitlement logging.

### Alternatives Considered

- Shared logger + dedicated phase-1 `application_error_logs` table
- Vendor-first monitoring rollout
- Supabase-only logging via `audit_logs`
- Status quo with more `console.error`

### Why Chosen

The chosen approach improves visibility now without coupling the entire repo to a vendor or mutating `audit_logs` into something it was never designed to be, while still giving phase 1 a concrete durable storage decision.

### Consequences

- There will be a temporary mixed state during migration.
- Execution must maintain a clear event taxonomy to avoid recreating ad hoc patterns under a new name.
- A later external monitoring decision remains necessary for high-volume engineering telemetry.
- Phase-1 persistence intentionally uses `analytics_events` only for non-middleware operational errors until a later schema decision is justified by real usage.

### Follow-Ups

- Backfill the empty feature spec file.
- Choose the vendor for the external monitoring adapter once the internal API stabilizes.
- Revisit whether `analytics_events` should be replaced by a dedicated `application_error_logs` store after real rollout data is available.

## Available-Agent-Types Roster

- `planner` — sequencing and rollout shaping
- `architect` — boundary design, sink separation, schema strategy
- `critic` — plan quality gate
- `executor` — implementation across logging core, routes, actions, and schema readers
- `debugger` — regression isolation for middleware/webhooks/quiz-v2
- `test-engineer` — test additions and harness hardening
- `verifier` — completion evidence and final validation
- `security-reviewer` — redaction, secret handling, auth/webhook logging review
- `dependency-expert` — external monitoring vendor evaluation when phase 6 begins
- `code-reviewer` — post-implementation review across maintainability and correctness

## Follow-Up Staffing Guidance

### `$ralph` path

Use sequential execution when one owner needs to preserve cross-cutting consistency.

- `architect` — `high`
  - own the runtime split, storage boundary, and read-model decisions
- `executor` — `high`
  - implement the core logger and first-wave migrations
- `test-engineer` — `medium`
  - add focused tests after each migrated surface
- `security-reviewer` — `medium`
  - validate redaction and secret handling before widening rollout
- `verifier` — `high`
  - run final evidence pass before declaring done

**Launch hint**

```text
$ralph "Implement .ai/plans/2026-04-12-Error-Logging-Implementation-Plan.md phase by phase. Honor the pre-execution spec gate, preserve existing action contracts, keep middleware console-only in phase 1, and use analytics_events only behind the operational logging adapter."
```

### `$team` path

Use coordinated parallel execution only after the logging core boundary is agreed and phase ordering is fixed.

- Lane 1: `executor` — `high`
  - shared logger core, runtime split, redaction, trace helpers
- Lane 2: `executor` — `high`
  - middleware + webhook migration
- Lane 3: `executor` — `high`
  - quiz-v2 + admin mutation migration
- Lane 4: `test-engineer` — `medium`
  - logger/webhook/middleware/admin/quiz-v2 tests
- Lane 5: `security-reviewer` — `medium`
  - redaction review and secret-safe payload verification
- Lane 6: `verifier` — `high`
  - integration proof, grep checks, lint/type-check/test summary

**Launch hints**

```text
$team "Execute .ai/plans/2026-04-12-Error-Logging-Implementation-Plan.md. Wave 1: spec gate + logging core + operational read-model + audit schema repair. Wave 2: middleware/webhooks and quiz-v2/admin in parallel. Wave 3: tests, security review, verification."
```

```text
omx team "Execute .ai/plans/2026-04-12-Error-Logging-Implementation-Plan.md with lanes for core logging/runtime split, middleware/webhooks, quiz-v2/admin, test hardening, security review, and final verification."
```

## Team Verification Path

Before shutdown, the team should prove:

1. the shared logger exists and is used by all first-wave surfaces
2. middleware auth refresh failures are logged safely through the edge-safe profile
3. webhook idempotency still works and failures are visible with correct dedupe keys
4. quiz-v2 fatal versus non-critical failures preserve intended behavior
5. admin mutation contracts are preserved while failures become auditable
6. `audit_logs` readers use the real schema, not stale column names
7. `Application Errors` reads come from the explicit operational read model, not a raw table guess
8. redaction tests pass
9. lint, type-check, and targeted tests pass with any unrelated baseline failures called out
10. `bun run build` passes, or any unrelated baseline build failure is explicitly called out

After team handoff, Ralph or the final verifier should run one last repo-wide evidence pass:

- inspect the changed first-wave files
- confirm no new secret leakage paths were introduced
- summarize residual legacy logging debt outside first-wave scope

## Changelog

- Initial deliberate-mode implementation plan drafted from the 2026-04-11 audit, live repository inspection, and the empty spec-file finding.
- Revised after architect review to fix the phase-1 storage decision, preserve existing action contracts, define the middleware/runtime split, and add explicit correlation/dedupe/read-model rules.
