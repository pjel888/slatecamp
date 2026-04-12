# Error Logging Phase 2 Plan

**Date:** 2026-04-12  
**Mode:** `$ralplan` consensus planning, deliberate mode  
**Primary grounding:** `.ai/plans/2026-04-12-Error-Logging-Implementation-Plan.md` + implemented `HEAD` after Phase 1  
**Current baseline:** Phase 1 is complete. The shared logging layer exists, middleware is console-only, operational errors persist to `analytics_events`, the Developer logs page shows `Audit Logs` + `Application Errors`, repo lint completes with warnings only, and `HEAD` is clean.

## 1. Requirements Summary

Phase 2 should be the **storage-and-read-model hardening tranche**, not a second broad observability sweep.

The actual remaining bottleneck from Phase 1 is narrow:

- `src/lib/logging/server.ts` still persists operational errors to `analytics_events`
- the current operational read model also reads from `analytics_events`
- Developer Logs therefore still depends on a transitional storage choice
- historical continuity during cutover is not yet decided
- `createWikiArticle` still has a tolerated phase-1 compromise on taxonomy-link failure semantics

Phase 2 should therefore focus on four things:

1. introduce a dedicated `application_error_logs` durable store
2. cut over the operational sink and read model from `analytics_events` to that store
3. explicitly choose the historical continuity strategy during cutover
4. make `createWikiArticle` semantics explicit and testable

This phase should **not** require broad repo-wide adoption expansion or a full vendor rollout to be considered complete.

## 2. Acceptance Criteria

1. A dedicated `application_error_logs` durable store exists via Supabase migration, with explicit indexes for timestamp, severity, family, source, request/trace identifiers, and webhook/provider identifiers.
2. The shared logging layer supports writing operational errors to `application_error_logs` without broad call-site rewrites.
3. The `Application Errors` read model and [src/app/developer/tools/logs/page.tsx](</C:/Users/Philip Lewis/Desktop/slatecamp/src/app/developer/tools/logs/page.tsx>) no longer depend on `analytics_events` as the primary source for operational errors.
4. The storage contract for `application_error_logs` is explicit:
   - service-role or privileged server-side writes only
   - no direct client-side reads
   - server-gated read path only
   - documented retention owner/policy
5. Historical continuity is explicitly implemented as a **bounded dual-read window**:
   - new writes go to `application_error_logs`
   - Developer Logs reads `application_error_logs` first and includes legacy `analytics_events` operational rows only through a temporary compatibility read path
   - the compatibility read path has an explicit sunset rule and removal step at the end of the phase
6. `createWikiArticle` moves to an explicit **rollback-on-taxonomy-failure** contract:
   - article creation is not considered successful if taxonomy-link creation fails
   - tests prove no orphaned article success path remains
7. Developer Logs has direct verification coverage proving:
   - `Audit Logs` and `Application Errors` remain separate
   - application errors render from the Phase 2 read model
   - empty/error/gated states behave correctly
8. Verification passes for targeted tests plus `bun run lint`, `bun run type-check`, and `bun run build`.

## 3. RALPLAN-DR Summary

### Principles

1. Replace the transitional sink before widening scope.
2. Preserve the shared logging API while changing infrastructure beneath it.
3. Keep audit history, analytics, and operational error telemetry as distinct domains.
4. Use a temporary bridge only when its sunset rule is explicit.
5. Resolve accepted Phase 1 behavior compromises by choosing and testing the replacement contract up front.

### Decision Drivers

1. **Durable storage fit:** `analytics_events` was an acceptable Phase 1 bridge but is still the wrong long-term home for operational errors.
2. **Historical continuity:** cutover without a chosen continuity path will fragment the operational history visible in Developer Logs.
3. **Scope discipline:** the next tranche should fix the storage architecture first, not mix that with a full vendor rollout and broad adoption sweep.

### Viable Options

#### Option A: Dedicated `application_error_logs` store now; vendor rollout deferred

**Approach:** add the new table, migrate the durable sink and read model off `analytics_events`, choose a continuity strategy, and resolve `createWikiArticle` semantics now. Keep vendor work out of the required tranche.

**Pros**
- Fixes the actual architectural bottleneck directly.
- Keeps the phase bounded and easier to verify.
- Gives Developer Logs a stable long-term operational-error store.

**Cons**
- Requires migration, cutover, and continuity handling now.
- Leaves vendor integration for a later phase.

#### Option B: Dedicated store plus bounded vendor seam hardening in the same phase

**Approach:** do Option A plus extract/finish a concrete vendor adapter boundary, but stop short of broad vendor adoption.

**Pros**
- Leaves the storage architecture clean and prepares the system for future alerting/export.
- Still narrower than a full vendor rollout.

**Cons**
- Broader than strictly necessary for the immediate bottleneck.
- Increases verification burden across storage and adapter surfaces.

#### Option C: Keep `analytics_events` and widen adoption instead

**Approach:** accept the transitional sink for longer and spend the phase on broader adoption and better tooling/tests.

**Pros**
- Lowest migration risk in the short term.
- Fastest route to more call-site coverage.

**Cons**
- Leaves the main architectural debt untouched.
- Forces Developer Logs to keep depending on a semantically weak store.
- Risks another “temporary” phase becoming permanent by inertia.

### Recommendation

Choose **Option A**.

If you want a larger roadmap, treat vendor seam hardening as **optional Wave 2** after the dedicated store and read-model cutover are green. The approval gate for Phase 2 should attach to the storage migration tranche, not the optional vendor work.

**Frozen execution decisions**

- Historical continuity strategy: **bounded dual-read window**, not backfill and not hard cutoff.
- Wiki semantics strategy: **rollback article creation if taxonomy-link creation fails**.

## 4. Risks and Mitigations

| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| Historical fragmentation during sink cutover | Developer Logs currently depends on `analytics_events`-backed operational history | Use a bounded dual-read window with an explicit sunset step |
| Weak table-level security on `application_error_logs` | Error events may contain sensitive context even after redaction | Define storage-level posture explicitly: privileged writes only, no client read policy, server-gated read path |
| Scope creep into a full observability platform | Storage, vendor, UI, and adoption work can sprawl together | Keep vendor work optional; do not bundle broad adoption into the required tranche |
| Semantic regressions in wiki creation flow | Phase 1 accepted partial-success behavior for practical reasons | Move to rollback-on-taxonomy-failure and test it directly |
| Read-model drift | Developer Logs already drifted once from the real schema | Put Phase 2 behind a dedicated query layer and add page-level tests |

## 5. Verification Steps

1. Add migration-level verification for `application_error_logs` schema, indexes, and write expectations.
2. Add sink-transition tests proving the shared logger can write to the new table without changing first-wave call sites.
3. Add read-model tests proving `Application Errors` no longer depends on `analytics_events` as the primary source.
4. Add direct page-level tests for [src/app/developer/tools/logs/page.tsx](</C:/Users/Philip Lewis/Desktop/slatecamp/src/app/developer/tools/logs/page.tsx>) covering:
   - tab separation
   - populated application-error rendering
   - empty state
   - gated/error state
   - bounded dual-read continuity behavior during cutover
   - legacy compatibility path removal behavior at sunset
5. Add direct tests proving `createWikiArticle` rolls back article creation when taxonomy-link creation fails.
6. Run a migration smoke path proving new operational events land in `application_error_logs` and are visible in Developer tooling while the temporary compatibility read path is still active.
7. Run:
   - `bun run lint`
   - `bun run type-check`
   - `bun run build`
   - targeted `bun test` suites for logging, read model, Developer Logs page, and wiki semantics

## 6. ADR

### Decision

Use Phase 2 to replace the transitional `analytics_events` operational-error sink with a dedicated `application_error_logs` store, cut the read model and Developer Logs over to that store through a bounded dual-read window, and change `createWikiArticle` to rollback on taxonomy-link failure.

### Drivers

- The shared logger contract already exists and does not need another architectural rewrite.
- The real remaining debt is storage semantics plus read-model continuity.
- Developer tooling should not stay coupled to a temporary sink longer than necessary.

### Alternatives Considered

- Keep `analytics_events` as the long-term operational store and widen adoption instead.
- Add vendor seam hardening in the same required tranche.
- Stop after Phase 1 and accept the transitional sink as acceptable long-term debt.

### Why Chosen

This is the narrowest phase that fixes the most important remaining architecture problem without reopening the completed Phase 1 rollout.

### Consequences

- A migration and bounded dual-read cutover period is required.
- Developer Logs and query infrastructure will change again, but toward a stable long-term model.
- Vendor integration remains a later or optional follow-on concern.
- `createWikiArticle` will stop returning partial success when taxonomy-link creation fails.

### Follow-Ups

- Optional Wave 2: vendor adapter hardening or one provider spike after the store/read-model cutover is green.
- Later phase: named adoption expansion clusters after the storage model is stable.

## 7. Available-Agent-Types Roster

- `planner` — sequencing and tranche control
- `architect` — storage boundary, migration strategy, continuity decision
- `critic` — plan quality gate
- `executor` — migration, read model, tooling, and semantics implementation
- `debugger` — cutover regressions and behavioral edge-case diagnosis
- `test-engineer` — migration, page-level, and semantic contract coverage
- `verifier` — evidence collection and rollout sign-off
- `security-reviewer` — storage policy, redaction, and gated read-path review
- `dependency-expert` — optional vendor spike only if Wave 2 is approved

## 8. Follow-Up Staffing Guidance

### `$ralph` path

Use this when one owner should preserve strict ordering across migration, continuity strategy, and semantics cleanup.

- `architect` — `high`
  - own the dedicated-store shape, bounded dual-read cutover, and storage policy
- `executor` — `high`
  - implement migration, sink transition, bounded dual-read read-model cutover, and wiki rollback semantics
- `test-engineer` — `medium`
  - add migration, page-level, and semantics tests
- `security-reviewer` — `medium`
  - validate table-level posture and server-gated read path
- `verifier` — `high`
  - run final evidence pass across migration and tooling

**Launch hint**

```text
$ralph "Implement .ai/plans/2026-04-12-Error-Logging-Phase-2-Plan.md Wave 1 only: application_error_logs storage, continuity strategy, read-model cutover, Developer Logs verification, and explicit wiki semantics cleanup."
```

### `$team` path

Use this when you want parallel execution after the continuity strategy is fixed.

- Lane 1: `executor` — `high`
  - `application_error_logs` migration, indexes, sink transition
- Lane 2: `executor` — `high`
  - read model, Developer Logs updates, page-level test support
- Lane 3: `executor` — `high`
  - wiki semantics cleanup and continuity implementation
- Lane 4: `test-engineer` — `medium`
  - migration tests, page tests, semantics tests
- Lane 5: `security-reviewer` — `medium`
  - storage posture and gated read-path review
- Lane 6: `verifier` — `high`
  - evidence bundle, lint/type/build/test summary

**Launch hint**

```text
$team "Execute Error Logging Phase 2 Wave 1: dedicated operational store, continuity strategy, read-model cutover, Developer Logs verification, and wiki semantics cleanup."
```

## 9. Team Verification Path

Before sign-off, the team should prove:

1. operational errors no longer depend on `analytics_events` as the primary durable sink
2. the shared logging interface still works without broad call-site rewrites
3. Developer Logs reads `Application Errors` from the Phase 2 read model and still keeps `Audit Logs` separate
4. bounded dual-read continuity behavior is explicit, verified during cutover, and removed by the phase sunset step
5. operational-log reads are gated server-side and do not introduce direct client table access
6. `createWikiArticle` rollback-on-taxonomy-failure is explicit, tested, and implemented
7. migration, targeted tests, `bun run lint`, `bun run type-check`, and `bun run build` all pass

The final evidence bundle should include:

- changed files grouped by migration, read model, Developer Logs, and semantics cleanup
- migration summary and resulting schema shape
- bounded dual-read continuity strategy, proof, and sunset/removal evidence
- Developer Logs page verification evidence
- wiki rollback semantics and test proof
- lint/type-check/build outputs
- targeted test outputs
