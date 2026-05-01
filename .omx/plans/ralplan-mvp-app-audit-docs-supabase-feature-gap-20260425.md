# RALPLAN: MVP App Audit, Docs Sync, Supabase Cleanup, and Feature Gap Closure

Created: 2026-04-25
Mode: `$ralplan` / `$plan --consensus`
Status: Approved after architect and critic consensus

## Task

Run a comprehensive MVP-readiness program across SlateCamp:

1. Audit the UX and UI of the whole app, including all routes.
2. Bring `.ai` documentation up to date and archive outdated, completed, or superseded documents.
3. Keep Supabase active with safe account calls, update `DATABASE_SCHEMA.sql`, and audit/remove stale database concepts.
4. Check whether promised product features exist. If launch-critical features are missing, implement them; if non-launch promises are unimplemented, hide or defer their claims.

The user explicitly stated that SlateCamp is pre-launch and should not preserve legacy behavior for its own sake.

## Current Evidence Snapshot

Repository counts are stale in several active docs:

- Live route count: `src/app` has 104 `page.tsx` files by `find`, 15 layouts, 91 loading files, 7 error boundaries, and 12 route handlers.
- `.ai/10_state/current-state.md` still claims 125 pages, 16 layouts, 96 loading files, 9 errors, 12 route handlers, and 89 migrations.
- `.ai/00_system/ROUTE_SURFACE_MAP.md` and `.ai/06_specs/route-inventory.md` claim 124 pages, 16 layouts, 95 loading files, 9 errors, 12 handlers.
- `.ai/01_roadmap/current-phase.md` claims 125 pages, 146 action files, 89 migrations, and 113 AGENTS files.
- The live repo has 91 Supabase migration files and 992 `.ai` files.

Supabase keepalive and schema preflight were already run with read-only requests:

- Existing environment keys are present: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
- Read-only counts succeeded for `questions`, `wiki_articles`, and `quiz_sessions`.
- PostgREST OpenAPI introspection returned status `200` with 97 definitions.
- Live OpenAPI definitions include old or drifted objects such as `blindspot_queues` and old `proof_simulation` column names.
- `DATABASE_SCHEMA.sql` says it was updated on 2026-04-07 and claims 86 tables, 2 views, and 39 functions; simple parsing found 76 `CREATE TABLE` statements.
- Live OpenAPI definitions missing from `DATABASE_SCHEMA.sql` include `blindspot_queues`, `session_questions`, `user_capabilities`, multiple materialized views, and other launch-relevant objects.
- `DATABASE_SCHEMA.sql` includes `focus_review_queues`, but live OpenAPI still exposes `blindspot_queues`.
- `supabase/migrations/20260418120000_absolute_unification.sql` already defines the intended MVP rename from `blindspot` to `focus_review`, `proof_sim` to `full_exam`, and `blindspot_queues` to `focus_review_queues`.
- App code already expects the new names in places such as `src/app/api/cron/focus-review-scan/route.ts` and `src/lib/actions/quiz-v2/start-session.ts`.

Supabase inactivity policy is current enough to treat this as a launch risk:

- Supabase's production checklist says Free Plan apps with low activity in a 7-day period may be paused and that Pro avoids inactivity pausing: https://supabase.com/docs/guides/deployment/going-into-prod
- Supabase status-code docs describe `540 project paused`, including Free Plan inactivity pausing: https://supabase.com/docs/guides/troubleshooting/http-status-codes
- Supabase billing docs state that Pro-plan projects are not paused for inactivity: https://supabase.com/docs/guides/platform/billing-on-supabase
- Supabase restore docs say projects paused for more than 90 days can no longer be restored through Studio: https://supabase.com/docs/guides/troubleshooting/restore-project-after-90-days-pause

Route and navigation drift exists:

- `src/lib/routes.ts` contains static constants for routes without page implementations, including `/dashboard/campfire`, `/dashboard/library`, `/dashboard/settings/billing`, `/dashboard/settings/developer`, `/dashboard/trails`, and `/admin/wiki`.
- `auth.callback` is a route handler, not a page, so it should not be classified as a broken page.
- `/auth/reset-password` is a route constant with no page implementation and must be classified as missing, redirected, or removed from consumers.
- Many actual routes are dynamic or not represented by static route constants; this is not automatically a bug but must be audited for navigation, redirects, and breadcrumb behavior.
- Multiple navigation systems coexist: dashboard shell, portal shell, marketing nav, admin shell variants, CEO protected shell, developer shell, and page-local auth nav.
- Dead or questionable path consumers exist outside `src/lib/routes.ts`, including dashboard welcome steps, shared mobile nav, result-day pass flow CTAs, and 3D Lab entitlement CTAs.

Promised-feature evidence:

- The landing page claims real-time Readiness Score, expert-verified wiki, interactive 3D building code models, taxonomy heatmap, and structured path features.
- Pricing constants claim Free, Pro, Prime, Institutional, and Enterprise capabilities, including SRS, 3D Lab, Personal Notes, Readiness Score, Storm Mode, AI Tutor, advanced spatial tools, instructor dashboards, custom content tools, ad placements, product placement, recruitment pipeline, and corporate training mode.
- Public trust claims also exist in marketing comparison, question-bank, testimonial, about, contact, FAQ, footer, notification, and dashboard-empty-state surfaces.
- `FEATURE_PAYMENTS_ENABLED` defaults payments off unless explicitly enabled, and LemonSqueezy checkout is still marked as a placeholder.
- Onboarding, comp exam, dashboard, quiz, wiki, analytics, 3D Lab, and core learning surfaces exist, but several promises appear partial or gated.
- `Campfire` is referenced in route constants, notifications, and result-day flows but has no route page.
- The copy guide forbids student-facing terms such as "fail", "failed", "failure", "retry", "retake", and "try again"; a broad copy scan found violations that must be filtered for student-facing UI.

Pre-existing working tree note:

- `package.json` and `bun.lock` already had unrelated modifications before this planning run. Execution must not revert or overwrite those changes without an explicit reason.

Verification tooling note:

- `package.json` has no general e2e or route-crawler script.
- `package.json` does expose `bones:build`, which runs `boneyard-js build http://localhost:3000/dashboard --out ./src/bones`.
- `playwright` resolves from `node_modules` and `bunx playwright --version` reports `1.59.1`, but there is no first-class Playwright test suite configured.

## Planning Decision

Use a deliberate, staged execution plan rather than jumping directly into app-wide edits.

This is broader than a normal feature task because it touches user-visible UX, product claims, documentation governance, live Supabase state, schema truth, and likely data migrations. Some parts are safe and reversible, while database cleanup can become destructive if done casually. The plan below deliberately separates read-only discovery, reversible documentation updates, guarded schema reconciliation, UX fixes, and final implementation.

## Operating Principles

1. MVP truth beats legacy compatibility.
   Remove, rename, or hide stale concepts when they conflict with the current launch product.

2. Do not make the database lean by guessing.
   First prove live usage, code references, RLS/policy dependencies, and data retention needs. Then migrate, archive, or drop with a rollback path.

3. Product promises must match implemented capability.
   For launch, either implement the promise, narrow the claim, or move it to an explicit future-facing surface.

4. Route inventory is a source-of-truth problem before it is a UI problem.
   The app needs a current route map, navigation map, and static route constant reconciliation before reliable visual QA.

5. Documentation cleanup should preserve history.
   Archive superseded or completed docs with pointers to the current source, not silent deletion.

## Options Considered

### Option A: Audit-first, then fix P0/P1 only

Run complete discovery and audit passes first, produce ranked findings, then implement only launch-blocking or high-confidence fixes.

Pros:

- Lowest chance of breaking live data or app flows.
- Produces durable route, docs, DB, and feature inventories.
- Best fit for app-wide scope and active pre-launch cleanup.
- Makes later `$team`, `$ultrawork`, or `$autopilot` execution parallelizable.

Cons:

- Delays visible feature implementation until the gap list is ranked.
- Requires discipline to avoid over-documenting instead of fixing.

### Option B: Fix while auditing

Patch stale docs, broken route constants, and obvious UI issues as they are discovered.

Pros:

- Faster visible progress.
- Good for low-risk stale counts and dead links.

Cons:

- Easy to create inconsistent partial truth across `.ai`, route constants, and app surfaces.
- Higher risk of repeatedly revising the same files as new evidence appears.

### Option C: Database cleanup first

Prioritize Supabase drift, schema regeneration, stale tables, and migration application before UX/docs work.

Pros:

- Addresses the most dangerous technical drift first.
- Could unblock app flows already expecting new table names.

Cons:

- Highest blast radius.
- UX and promised-feature findings may change what schema is actually needed.
- Requires backup, branch, RLS, policy, and app verification before destructive actions.

## Decision

Proceed with Option A, with one exception: keep running safe, read-only Supabase keepalive calls during the audit. Treat Pro upgrade or account/billing action as the only durable guarantee against inactivity pausing, because API calls are not documented as a formal guarantee.

## Execution Architecture

Use four independent evidence lanes after this plan is approved:

1. Docs and route truth lane.
2. Supabase/schema lane.
3. UX/UI audit lane.
4. Promised-feature gap lane.

Run evidence gathering in parallel under `$team` or `$ultrawork` only after the shared source-of-truth snapshot is complete. Implementation must then be serialized by write scope:

- DB/schema/types/migrations: one owner only.
- `.ai` and touched `AGENTS.md` sync: one owner only.
- Route constants/navigation: one owner only.
- Pricing/public-claim changes: one owner only.
- UX fixes: split by route subtree only when file ownership does not overlap.

Keep database mutation gated by a separate checklist, backup, dependency report, and rollback artifact.

## Phase 0: Source-of-Truth Freeze

Goal: create a stable baseline before making broad changes.

Tasks:

- Capture current `git status --short` and mark pre-existing unrelated changes.
- Verify `package.json` scripts and use Bun for all repo scripts.
- Recount `src/app`, `src/components`, `src/features`, `src/lib/actions`, `supabase/migrations`, `.ai`, and AGENTS files.
- Capture route inventory from the filesystem and compare it with `src/lib/routes.ts`.
- Capture current `.ai` document map and archive candidates.
- Capture Supabase live OpenAPI definitions and compare with `DATABASE_SCHEMA.sql`, migrations, and generated types.
- Save findings to `.ai/02_audits/2026-04-25-mvp-readiness-baseline.md`.

Acceptance criteria:

- A single baseline audit file exists with current counts and command evidence.
- Every later change links back to the baseline ID or finding.
- No app code or database mutation happens in this phase.

## Phase 1: `.ai` Documentation Inventory and Early Corrections

Goal: create a reliable documentation inventory and immediately fix stale facts that would mislead the rest of the audit.

Tasks:

- Read `.ai/AGENTS.md`, `.ai/00_system/AGENTS.md`, `.ai/06_specs/AGENTS.md`, `.ai/06_specs/deep/AGENTS.md`, and `.ai/09_archive/AGENTS.md` before editing docs.
- Update active source-of-truth docs only where the baseline already proves the current fact, such as route counts, migration counts, and app-surface counts.
- Reconcile at minimum:
  - `.ai/10_state/current-state.md`
  - `.ai/00_system/ROUTE_SURFACE_MAP.md`
  - `.ai/06_specs/route-inventory.md`
  - `.ai/01_roadmap/current-phase.md`
  - `.ai/01_roadmap/feature-status-map.md`
  - `.ai/00_system/baseline-markdown-list.md` if still active
- Mark archive candidates and completed/historical planning docs, but defer broad archive moves until Phase 7 after route, DB, and feature decisions are stable.
- Record replacement pointers or archive reasons for each candidate.

Acceptance criteria:

- Active `.ai` docs no longer contradict live route/migration counts.
- Completed or superseded docs have candidate dispositions and replacement pointers.
- No active guidance points to stale route handler names such as `api/cron/blindspot-scan` unless explicitly historical.
- `git diff --check` passes for early documentation changes.

## Phase 2: Supabase Keepalive and Schema Reconciliation

Goal: keep Supabase responsive, align live DB with MVP terminology, and regenerate canonical schema truth.

Preflight tasks:

- Confirm active project status with a safe read-only REST or SQL call.
- Run the read-only keepalive script against lightweight tables and PostgREST OpenAPI.
- Capture live object inventory:
  - tables
  - views/materialized views
  - functions
  - enums
  - policies
  - triggers
  - indexes
  - storage buckets
- Compare live inventory against:
  - `DATABASE_SCHEMA.sql`
  - `supabase/migrations/`
  - `src/types/supabase.ts`
  - app code references under `src/`

Schema decisions:

- Treat `focus_review` and `full_exam` as the canonical MVP language.
- If live Supabase still has `blindspot_queues` and old `proof_simulation` columns, derive a guarded repair migration from live introspection.
- Do not rerun `20260418120000_absolute_unification.sql` blindly. It documents the intended rename direction, but it contains unconditional rename statements and should not be treated as idempotent.
- If old names are only OpenAPI cache artifacts, refresh schema cache and verify actual SQL state before editing migrations.
- Do not delete tables simply because they are not in `DATABASE_SCHEMA.sql`; first determine whether the generated schema snapshot is stale.
- For truly stale tables, use a two-step plan:
  1. Mark as deprecated/archive with a migration and reference scan.
  2. Drop only after backup and verification that no launch code, RLS, functions, policies, or analytics jobs depend on them.

Known high-risk checks:

- `src/types/supabase.ts` may contain mixed old/new names.
- Payment schema appears inconsistent: code writes `lemon_squeezy_*` fields while canonical schema uses `lemonsqueezy_*`.
- App code expects `focus_review_queues` and `is_full_exam`; live OpenAPI currently exposes old names.
- `feature_flags` count query errored, so permissions, table existence, or API exposure must be checked explicitly.

Required pre-mutation artifacts:

- Backup artifact path or Supabase backup/export evidence.
- Dependency report covering app references, generated types, RLS policies, functions, triggers, indexes, cron/API routes, and analytics queries.
- Rollback SQL for every rename/drop/change.
- Schema-cache refresh check that distinguishes actual SQL drift from PostgREST cache drift.
- Explicit list of objects that are read-only verified, renamed, retained, deprecated, or dropped.

Outputs:

- Updated `DATABASE_SCHEMA.sql` generated from live DB after reconciliation.
- Updated generated Supabase TypeScript types.
- A drift report in `.ai/02_audits/2026-04-25-supabase-schema-drift.md`.
- A short keepalive script or documented command that uses only read-only calls.

Acceptance criteria:

- Supabase read-only health call succeeds after reconciliation.
- App code, generated types, `DATABASE_SCHEMA.sql`, and migrations agree on canonical table and column names.
- No destructive DB cleanup occurs without backup evidence and explicit migration.
- Payment table/field naming is resolved or flagged as launch-blocking.
- Every DB mutation has matching rollback SQL and post-mutation read-only verification.

## Phase 3: Route, Redirect, CTA, and Navigation Truth Cleanup

Goal: make route constants, redirects, CTAs, navigation, and actual app pages agree.

Tasks:

- Reconcile `src/lib/routes.ts` against actual routes.
- Build a repo-wide inbound-link manifest for route strings and route constants. Include `Link`, `router.push`, `redirect`, anchor `href`, email/notification/deep-link targets, CTA config objects, and hardcoded path strings.
- Classify mismatches:
  - legitimate route handlers
  - dynamic routes
  - intentionally hidden pages
  - broken/dead links
  - promised but missing pages
- For every removed, hidden, or redirected path, document all inbound consumers and the replacement destination.
- Audit navigation shells:
  - marketing
  - auth/onboarding
  - dashboard
  - admin
  - developer
  - CEO protected
  - quiz/session
  - 3D Lab
- Remove or replace dead constants for unimplemented features unless the feature is implemented during Phase 5.
- Add tests or route-map checks for constants that are intended to map to pages.

Known priority items:

- `/dashboard/campfire` is referenced but missing.
- `/dashboard/library` is referenced but missing.
- `/dashboard/trails` may be stale relative to `camptrails`.
- `/admin/wiki` is referenced but missing.
- Settings billing/developer routes appear referenced but missing.
- `/auth/reset-password` appears as a reset route constant and needs a deliberate page/redirect/removal decision.
- Dashboard welcome CTAs, shared mobile nav, result-day CTAs, 3D Lab entitlement CTAs, notifications, and email templates must be checked as path consumers.

Acceptance criteria:

- No student-facing navigation link points to a missing page.
- Static route constants either resolve to actual pages/handlers or are explicitly typed as dynamic/hidden/internal.
- Every hidden, removed, or redirected path has an inbound-link/redirect/CTA manifest entry with replacement behavior.
- Route inventory docs match the filesystem.

## Phase 4: Comprehensive UX/UI Audit

Goal: identify and fix launch-blocking UX/UI defects across all routes.

Audit method:

- Start local dev server with Bun.
- Public HTTP crawl: create or run a repo-local Bun script at `scripts/audits/public-route-smoke.ts` that reads a generated public route manifest, uses built-in `fetch`, detects status/redirect loops/content-type, and writes JSON evidence to `.ai/02_audits/evidence/2026-04-25-public-route-smoke.json`.
- Authenticated browser crawl: create or run `scripts/audits/auth-route-browser.ts` using the already installed `playwright` package and Chromium. It logs in with dedicated audit fixtures, visits role-appropriate route manifests, captures screenshots, console errors, page errors, failed network requests, redirect chains, and per-route metadata under `.ai/02_audits/evidence/2026-04-25-auth-browser/`.
- Existing structural snapshot: run `bun run bones:build` for the dashboard route and save the output path in the UX audit.
- Capture screenshots for representative breakpoints:
  - mobile
  - tablet
  - desktop
- Run accessibility checks with available lint/Storybook a11y coverage and record any gap where a route-level axe pass is not yet configured.
- Run visual smoke checks for route shells, nav, loading states, error boundaries, form states, empty states, and paywall states.
- Filter copy-guide violations to student-facing UI only.

Auth and route fixture contract:

- Do not use the owner's personal account as an audit fixture.
- Prefer dedicated env-provided audit fixtures: `AUDIT_STUDENT_EMAIL`, `AUDIT_STUDENT_PASSWORD`, `AUDIT_ADMIN_EMAIL`, `AUDIT_ADMIN_PASSWORD`.
- If those env vars are missing, create dedicated disposable audit users through the Supabase Admin API only after the Phase 0 baseline identifies the project as the intended pre-launch project; record the created user IDs in the evidence log and mark them as audit fixtures.
- Public/static pages are always crawled.
- Authenticated dashboard pages are crawled with the student fixture.
- Admin, developer, and CEO pages are crawled only with a fixture that has the required role; otherwise they are marked `gated` and receive source-level review.
- Dynamic paths use read-only discovered fixtures, such as an active camptrail slug, a 3D module id, a quiz session created by the audit flow, or an existing preview id. If no safe fixture exists, mark the route `fixture-missing` instead of inventing IDs.
- Route handlers under `src/app/api` are excluded from browser screenshot crawl and get separate safe-method API smoke checks only.
- Evidence collected with demo mode, `DEV_FORCE_USER_ID`, `ALLOW_DEV_PORTAL_BYPASS`, owner personal credentials, or any local bypass does not count as launch signoff.
- The public HTTP crawl can only sign off public/static reachability. Authenticated and role-gated UX signoff requires the browser crawl with real Supabase session cookies.

Priority surfaces:

- Admin question creation and editing:
  - `src/app/admin/knowledge/questions/new/page.tsx`
  - `src/app/admin/knowledge/questions/[id]/page.tsx`
- Quiz lifecycle:
  - `src/app/quiz/[mode]/session/[sessionId]/page.tsx`
  - `src/app/quiz/[mode]/session/[sessionId]/results/page.tsx`
  - `src/app/quiz/[mode]/session/[sessionId]/review/page.tsx`
- Camptrails:
  - `src/app/dashboard/camptrails/[slug]/today/page.tsx`
  - `src/app/dashboard/camptrails/[slug]/day/[dayNumber]/complete/page.tsx`
- Admin preview:
  - `src/app/admin/preview/[previewId]/page.tsx`
- 3D Lab:
  - `src/app/dashboard/3d-lab/[moduleId]/page.tsx`
- Onboarding and comp exam:
  - `src/app/(auth)/onboarding/page.tsx`
  - `src/app/(auth)/onboarding/comp-exam/page.tsx`
- Pricing and payment messaging:
  - `src/app/pricing/page.tsx`

UX severity rubric:

- P0: broken route, missing promised core flow, DB/API mismatch causing runtime failure, payment or onboarding blocker, inaccessible launch-critical flow.
- P1: confusing navigation, severe mobile layout defect, student-facing forbidden copy, broken empty/error state, major visual inconsistency.
- P2: polish, small layout inconsistency, admin-only friction, copy inconsistency not affecting student trust.

Acceptance criteria:

- Each visited route has a status: pass, needs fix, gated, hidden, or intentionally deferred.
- P0 issues are fixed before launch.
- P1 issues are fixed or explicitly deferred with rationale.
- Visual screenshots or crawler logs are saved as evidence.
- The route manifest records whether each route was public, authenticated, role-gated, dynamic-fixtured, hidden, or intentionally excluded.
- Browser crawl evidence includes console-error counts, page-error counts, failed-network counts, redirect-loop checks, skipped/gated/fixture-missing counts, and screenshots for each visited route.

## Phase 5: Promised Feature Gap Audit and Closure

Goal: make public claims, pricing claims, and implemented product behavior match.

Active claim surfaces:

- Landing page.
- Pricing page and `src/lib/constants/pricing.ts`.
- Marketing sections, including comparison, question-bank, feature, testimonial, FAQ, and CTA sections.
- Contact and about pages.
- Onboarding promises.
- Email/notification copy.
- Dashboard empty states.
- Auth pages and result-day pages.
- `.ai` active product specs.

Core B2C MVP promises to verify:

- Onboarding and diagnostic/comp exam setup.
- Readiness Score.
- Taxonomy/topic heatmap.
- Personalized study path or Camptrails equivalent.
- Quiz modes, session, review, and results.
- Full exam mode.
- Focus review.
- Wiki/expert-verified learning content.
- SRS and notes.
- 3D Lab MVP.
- Basic analytics.
- Payment/free-access messaging that reflects actual runtime config.

Likely action choices:

- Implement missing launch-critical features when scoped and bounded.
- Hide or narrow pricing/marketing promises that are not launch-critical.
- Default to hide/narrow for unsupported non-student B2C, institutional, and enterprise claims before attempting to build them.
- Convert institutional/enterprise claims into "contact us" or remove from launch pricing if unsupported.
- Replace stale legacy language (`blindspot`, `proof sim`, `retaker`, forbidden failure terms) with current copy-guide language.

Launch hide-vs-implement policy:

- Implement/fix when the promise is core B2C and already materially present or clearly intended for launch: route truth, onboarding, diagnostic/comp exam, quiz/session/results/review, CampTrails, readiness score, taxonomy/heatmap, focus review/full exam DB naming, wiki, SRS/notes, basic analytics, and 3D Lab MVP.
- Hide or narrow by default when the promise is non-core, commercial, unsupported, or lacks runtime proof: billing/settings-billing, settings-developer, Campfire, Library, educational/institutional/enterprise pricing, payment-method claims, cancel-anytime claims, student-discount claims, team-pricing claims, placeholder testimonials/social proof, unsupported operational promises, AI Tutor entitlement/token claims without direct proof, and any enterprise/institutional capability without a live route and data path.

Known gap candidates:

- Campfire references exist without a page.
- LemonSqueezy checkout is placeholder while pricing/payment surfaces may imply payment readiness.
- AI Tutor route exists but token limits and entitlement enforcement need verification.
- Institutional and enterprise pricing claims likely exceed launch MVP.
- Student-facing forbidden copy appears in onboarding/auth/error/result flows.

Acceptance criteria:

- A claim matrix exists at `.ai/02_audits/2026-04-25-public-claim-matrix.md`.
- Every public or student-facing promise has `implemented | evidence path | narrowed | hidden | deferred` status.
- Launch-critical missing promises are implemented and tested.
- Non-launch promises no longer appear as active commitments on public/student-facing surfaces.
- Placeholder testimonials and social proof are removed, replaced with truthful non-testimonial copy, or backed by real approved evidence.

## Phase 6: Implementation Passes

Goal: perform tightly scoped fixes from the ranked audits.

Expected implementation buckets:

- Docs updates and archive moves.
- Route constant, inbound-link, redirect, CTA, email, and notification target cleanup.
- Student-facing copy cleanup.
- Supabase schema/type regeneration and guarded migrations.
- Payment messaging correction.
- Missing or stale route handling, likely Campfire/library/trails/admin wiki decisions.
- UX fixes for onboarding, quiz lifecycle, dashboard, 3D Lab, and pricing.

Rules:

- Read the nearest `AGENTS.md` before editing each subtree.
- For source symbol edits, run GitNexus impact analysis if the tool is available. If unavailable, document the fallback and use direct code search plus tests.
- Keep changes small and reversible.
- Prefer deleting stale references over adding compatibility shims.
- Do not introduce new dependencies without an explicit separate decision.
- Serialize implementation by write scope. Do not let docs/archive, DB/schema/types, route/nav, pricing/claims, and UX route fixes edit the same files concurrently.

## Phase 7: Final Canonical Sync

Goal: ensure active guidance matches the final implementation state, not just the initial audit baseline.

Tasks:

- Re-read `.ai` archive policy and all nearest `AGENTS.md` files for touched areas.
- Update active `.ai` source-of-truth docs after DB, route, UX, and feature decisions are final.
- Update touched `AGENTS.md` files when counts, workflows, ownership, or canonical source references changed.
- Move completed/superseded `.ai` docs to archive according to archive policy.
- Update archive indexes and source maps.
- Remove or annotate any stale active references to abandoned legacy names, including `blindspot`, `proof_sim`, `retaker`, stale route counts, stale route handler names, and obsolete pricing promises.

Acceptance criteria:

- Active `.ai` docs and touched `AGENTS.md` files agree with the final route/schema/product state.
- Archive entries include replacement pointers or reasons.
- A stale-term scan is attached to the final evidence report with intentional historical matches separated from active guidance matches.

## Phase 8: Verification

Unit proof:

- `bun run type-check`
- `bun run lint`
- Focused Bun tests for changed modules if existing tests exist
- Route constant/path manifest test or script output for changed route/link surfaces.
- Claim-matrix stale-claim scan for public/student-facing files.

Integration proof:

- `bun run build` if route or runtime changes are broad
- `bun scripts/audits/public-route-smoke.ts` or the committed equivalent if the script is added during execution
- `bun run bones:build`
- Supabase read-only health and schema introspection after DB changes
- Payment provider smoke check for the configured runtime mode.
- Post-migration live DB proof that canonical objects are queryable and stale objects are absent, deprecated, or intentionally retained.

E2E/browser proof:

- `bun scripts/audits/auth-route-browser.ts` or the committed equivalent if the script is added during execution.
- Auth fixture crawl across student routes.
- Admin/developer/CEO routes either crawled with real role fixtures or marked `gated` with source-level review.
- Dynamic routes crawled with safe discovered fixtures or counted as `fixture-missing`.
- Console errors, page errors, failed network requests, redirect chains, screenshots, and skipped/gated/fixture-missing counts attached to evidence.

Observability and final hygiene:

- Student-facing forbidden-copy scan.
- `.ai` active-doc stale count scan.
- `.ai` plus touched `AGENTS.md` canonical-sync scan.
- 3D Lab visual/canvas nonblank check if 3D surfaces are changed.
- `git diff --check`
- `git status --short`

Completion criteria:

- No P0 UX/UI issues remain.
- P1 issues are either fixed or explicitly deferred in launch readiness docs.
- Active docs match live route/schema/product truth.
- Supabase schema, generated types, migrations, and app code agree.
- Public promises match implemented MVP behavior.
- Verification evidence is proof-shaped: command output alone is insufficient without route manifests, role fixture status, console/network/error captures, schema live-read proofs, and claim-matrix disposition.

## Pre-Mortem

Failure scenario 1: DB cleanup drops or renames a live dependency.

Mitigation:

- Require backup evidence, reference scan, RLS/function/policy scan, generated type update, and read-only smoke checks before destructive changes.
- Prefer rename/compatibility migration only long enough to move the MVP to canonical names, then remove stale concepts after verification.

Failure scenario 2: The audit generates a huge findings list but no launch progress.

Mitigation:

- Rank findings P0/P1/P2.
- Fix P0 immediately after discovery.
- Fix P1 only when it affects launch trust or core flow completion.
- Archive P2 in a follow-up backlog.

Failure scenario 3: Docs are updated but become another stale copy.

Mitigation:

- Keep one active source per fact.
- Archive superseded docs with pointers.
- Add route/schema count commands to docs so future agents refresh rather than repeat stale values.

## Agent Staffing Recommendation

Use this plan as the handoff artifact for `$team` or `$ultrawork` after consensus approval.

Recommended parallel lanes:

- `explore`: route map, broken constants, docs inventory, static promised-feature scans.
- `designer`: UX/UI audit rubric, screenshots, visual severity classification.
- `security-reviewer`: Supabase RLS, service-role usage, destructive migration review.
- `executor`: implementation patches, split by non-overlapping write scope.
- `test-engineer`: route crawler, Playwright/smoke scripts, regression test coverage.
- `verifier`: final evidence matrix and completion proof.

Named implementation ownership:

- DB/schema owner: one `executor`, reviewed by `security-reviewer`.
- Docs/AGENTS owner: one `writer` or `executor`.
- Route/nav owner: one `executor`.
- Pricing/claim owner: one `designer` plus one `executor`.
- Verification owner: one `test-engineer` plus final `verifier`.

Keep database mutation in one owner lane. Do not let multiple workers edit migrations, generated DB types, or `DATABASE_SCHEMA.sql` at the same time.

## Deliverables

Planning and audit deliverables:

- `.omx/context/mvp-app-audit-docs-supabase-feature-gap-20260425T075454Z.md`
- `.ai/02_audits/2026-04-25-mvp-readiness-baseline.md`
- `.ai/02_audits/2026-04-25-ux-ui-route-audit.md`
- `.ai/02_audits/2026-04-25-supabase-schema-drift.md`
- `.ai/02_audits/2026-04-25-promised-feature-gap-audit.md`

Implementation deliverables:

- Updated `.ai` active docs and archive index.
- Updated touched `AGENTS.md` files when their live facts or guidance drift.
- Updated route constants and navigation links.
- Updated `DATABASE_SCHEMA.sql`.
- Updated Supabase generated types.
- Guarded migration(s) if live DB needs reconciliation.
- UX/UI fixes for P0/P1 findings.
- Public/pricing/copy updates so claims match MVP.

## RALPLAN Consensus Checklist

Architect review must answer:

- Does this plan sequence DB, docs, route, UX, and feature work safely?
- Are the acceptance criteria testable enough?
- Are destructive DB actions adequately gated?
- Is the parallelization plan coherent?

Critic review must answer:

- What hidden failure modes remain?
- Where is the plan too broad, too vague, or too risky?
- Which promises should be implemented versus hidden for launch?
- What evidence would be insufficient at final verification?

## Status

Architect verdict: `APPROVE_WITH_CHANGES`.

Architect changes incorporated:

- Split early docs inventory from final canonical sync.
- Replaced unsafe idempotent-migration wording with guarded introspection-driven repair requirements.
- Added concrete route smoke, screenshot, auth fixture, and evidence-output contracts.
- Clarified parallel audit versus serialized implementation ownership.
- Made hide/narrow the default for unsupported non-core launch promises.

Critic verdict: `ITERATE`.

Critic changes incorporated:

- Expanded public-claim audit scope beyond landing/pricing/onboarding to marketing, contact, about, testimonials, FAQ, notifications, auth, and student-facing dashboard/result surfaces.
- Added claim-matrix deliverable with `implemented | evidence path | narrowed | hidden | deferred` status.
- Widened route cleanup to repo-wide inbound path consumers, redirects, CTAs, email, and notification targets.
- Split public HTTP crawl from authenticated browser crawl and banned demo/bypass evidence from launch signoff.
- Strengthened verification into unit, integration, e2e/browser, and observability proof.
- Made default-hide explicit for unsupported billing, settings, Campfire, Library, institutional/enterprise, team/student-discount, payment, social-proof, AI Tutor, and operational promises without runtime proof.

Final critic verdict: `APPROVE`.

Consensus outcome:

- Architect: `APPROVE_WITH_CHANGES`, changes incorporated.
- Critic iteration 1: `ITERATE`, changes incorporated.
- Critic final: `APPROVE`.

Execution is ready for a follow-up `$team`, `$ultrawork`, or direct implementation run using this plan as the controlling artifact.
