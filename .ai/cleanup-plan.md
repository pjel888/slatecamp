# Cleanup and Simplification Plan

**Audit date:** 2026-04-29

## Plan A — Minimal launch cleanup

**Philosophy:** remove only obvious blockers and stale compatibility; fastest low-risk launch path.

- Remove/stop advertising LemonSqueezy unless implemented.
- Hide billing/payment UI unless PayRex staging is verified.
- Remove redirect-only legacy pages from launch route tests; optionally keep Next redirects only if SEO decision says so.
- Mark docs mirrors as compatibility/reference.
- Resolve dirty working tree and rerun build/test/lint/typecheck/design.

**Risk:** Low to medium.  
**Benefit:** avoids half-enabled launch surface.  
**Verification:** build, Bun tests, lint, typecheck, design lint, launch-smoke e2e.  
**Acceptance:** no public route links to stubbed payments/AI/legacy paths.

## Plan B — Recommended pre-launch cleanup

**Philosophy:** balanced default. Ship the core learner loop and internal content operations; remove legacy compatibility and hide/defer optional experiments.

- Apply Plan A.
- Consolidate `/tools` and `/calculators` into one public namespace.
- Remove legacy redirect pages and old quiz route aliases unless explicit backlink evidence exists.
- Hide/defer DAE/studio/professional/results-day/score-reveal/pods/notifications/code-updates from public nav and launch tests.
- Pick PayRex-only or no-payment launch; delete LemonSqueezy path if not chosen.
- Decide AI cutline; keep only Socratic if it is in quiz launch, otherwise defer AI endpoints.
- Reconcile schema/types and plan prelaunch migration squash/reset.
- Rewrite e2e smoke to protect only canonical launch behavior.

**Risk:** Medium.  
**Benefit:** clean launch base without over-pruning core differentiators.  
**Required verification:** route tests, entitlements tests, quiz/wiki/3D/SRS/calculator tests, selected Playwright launch smoke, full build.

## Plan C — Aggressive pre-launch reset

**Philosophy:** assume no production data or legacy URLs must be preserved; reduce app to launch-critical core.

- Apply Plan B.
- Delete all non-cutline routes/actions/components/tests/tables after caller audits.
- Reset/squash migrations to a clean launch schema.
- Remove CEO/pods/social/notifications/DAE/studio/professional/results-day/score-reveal unless founder explicitly opts in.
- Remove AI endpoints and dependencies unless a single launch AI feature is chosen and verified.
- Remove duplicate docs mirrors and old deep docs from active maps; archive only.

**Risk:** High.  
**Benefit:** simplest long-term launch codebase.  
**Rollback:** requires git branch discipline and schema reset backups.  
**Acceptance:** route count, schema table count, test matrix, and env surface all shrink to launch cutline.

## Recommended PR Roadmap

| Phase | Task | Files/Areas | Risk | Dependencies | Verification | Acceptance Criteria |
| --- | --- | --- | --- | --- | --- | --- |
| Phase 0 | Baseline verification and working-tree triage | git status, build/test/lint/typecheck/design, existing source diffs | High | None | bun run build; bun run test; bun run type-check; bun run lint; bun run design:lint | Dirty source changes reviewed/committed/stashed; baseline green. |
| Phase 1 | Confirm launch cutline and canonical docs | `.ai/launch-cutline.md`; README; `.ai/README.md` | Medium | Phase 0 | Doc path check; founder decision log | Cutline accepted; docs mirrors marked compatibility. |
| Phase 2 | Route/navigation simplification | src/app redirect pages; next.config.ts; src/lib/routes.ts; sidebar constants; e2e launch-smoke | Medium | Phase 1 | routes test; build; launch smoke | Legacy redirects removed; canonical nav stable. |
| Phase 3 | Feature defer/removal PR | optional dashboard modes, pods, CEO/dev public links, calculators namespace | High | Phase 2 | targeted feature tests; e2e smoke | Non-launch features hidden/removed without breaking core flows. |
| Phase 4 | API/server/integration cleanup | AI endpoints, LemonSqueezy, payment checkout/webhooks, cron routes, env docs | High | Payment/AI/cron decisions | API route tests; webhook mock tests; build | Only chosen providers/routes remain launch-visible. |
| Phase 5 | Data/schema cleanup | DATABASE_SCHEMA.sql; migrations; generated types; table callers | High | Feature/API cutline | typegen; DB tests; seed smoke | Schema matches launch feature set or reset/squash plan approved. |
| Phase 6 | UI/design-system cleanup | sidebar/layouts/landing/3D shell/Storybook | Medium | Route/feature cutline | storybook guard; design lint; visual smoke | One canonical layout/nav system; no dead stories. |
| Phase 7 | Test suite rewrite/consolidation | Bun tests, e2e, perf scripts, route tests | Medium | All cleanup PRs | bun run validate:release; selected perf | Tests protect canonical launch only. |
| Phase 8 | Final launch readiness verification | all app/docs/config/env | High | Phase 7 | validate:release; manual QA; security review | No launch blockers; risk register closed/accepted. |

## Task execution notes

- Start every cleanup PR with caller/import search and route tests.
- Do not delete DB tables without generated-type/schema/migration plan.
- Do not delete passing tests blindly; first decide whether the behavior is launch-canonical.
- Update README and canonical `.ai` docs in the same PR when route/feature/schema/test/env surfaces change.
