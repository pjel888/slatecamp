# Quiz Route Consolidation Context Snapshot

## Task statement
Consolidate the current drills/quiz product surface so the canonical user-facing and internal route/name is `/quiz`, with one normal configurable quiz mode. Keep design and endurance as explicit exceptions. Update `.ai` markdown docs.

## Desired outcome
- `/quiz` becomes the primary quiz configurator/launcher surface.
- Old `/dashboard/drills` and related routes do not remain the preferred surface; they redirect or become compatibility only.
- Normal quiz mode is one configurable flow: topics, question count, filters/settings, slide to start, slide to submit, results.
- Preserve session/result/review continuity.
- Preserve special experiences for design quiz and endurance where they are materially distinct.
- Update tests and docs to prevent route/copy regression.

## Known facts/evidence
- Existing routes include `src/app/dashboard/drills`, `src/app/dashboard/drills/sessions`, and `src/app/quiz/[mode]/...`.
- Existing real-user E2E covers seeded drills session flow via `/dashboard/drills`.
- Recent verification passed: unit tests, coverage, type-check, lint, Playwright default/smoke, drills-real E2E.
- `.ai/01_roadmap/repo-priority-map.md` prioritizes MVP core effectiveness and boundary hardening.
- `.ai/00_system/ROUTE_SURFACE_MAP.md` lists `dashboard/testing` and `quiz/*` as high-value audit targets.

## Constraints
- Use Bun.
- No destructive DB/data operations.
- Preserve compatibility via redirects where old URLs exist.
- Do not fake E2E success; UI journey must remain real.
- Update `.ai` markdown docs.
- Team/tmux runtime is unavailable from this native Codex App surface.

## Unknowns/open questions
- Exact dependency graph for `/dashboard/drills` page/client components.
- Whether navigation/sidebar labels point to `/dashboard/drills` or `/quiz`.
- Which mode keys are hard-coded in analytics/routes/tests.
- Whether current `/quiz` root page exists or only layout/loading.

## Likely codebase touchpoints
- `src/app/dashboard/drills/**`
- `src/app/quiz/**`
- `src/components/testing/hub/**`
- `src/components/quiz-v2/**`
- `src/lib/actions/quiz-v2/**`
- `src/lib/quiz/mode-presets.ts`
- `src/lib/routes.ts`
- `next.config.ts`
- `e2e/drills-real-user-flow.spec.ts`
- `.ai/00_system/ROUTE_SURFACE_MAP.md`
- `.ai/04_tasks/drill-quiz-readiness-checklist.md`
