# Legacy Code Audit

## Overlapping and superseded systems

### `L2-ADM-001` — admin alias route surface
Legacy namespaces still exist under:
- `/admin/content`
- `/admin/articles`
- `/admin/questions`
- `/admin/dashboard`

Canonical surfaces already exist under:
- `/admin/knowledge`
- `/admin/knowledge/questions`

The current state is compatibility-heavy, not cleanly retired.

Implementation note (2026-04-17):
- internal navigation and login redirect targets now point at canonical `knowledge*` / `/admin` surfaces
- admin bulk/wiki actions now revalidate canonical `knowledge*` / `wiki` surfaces instead of the legacy alias pages
- unused legacy admin route constants have been removed from `ROUTES.admin`
- legacy admin alias route files have now been retired after the internal consumer migration completed and the build remained green

### `L2-QUIZ-002` — testing/quiz/drills route matrix
The same engine is exposed through:
- `src/app/quiz/**`
- `src/app/dashboard/testing/**`
- `src/app/dashboard/drills/**`

There are also duplicate layout/loading shells in testing vs drills.

Implementation note (2026-04-17):
- internal consumers now prefer canonical `ROUTES.quiz.*` and `ROUTES.dashboard.drills`
- remaining hardcoded internal quiz/drill links now also prefer canonical route helpers
- the top-level `/dashboard/testing` redirect page has now been retired
- legacy uppercase helpers and alias route files still remain and should be retired in later compatibility-focused passes

### `L2-CALC-003` — `/tools` vs `/calculators`
Current behavior suggests a deliberate split between:
- public/simple calculators under `/tools`
- authenticated/3D-heavy calculators under `/calculators`

The naming and route-constant contract is inconsistent enough to be a cleanup concern even if the split remains.

### `L2-3DLAB-004` — 3D-lab compatibility scaffolding
3D Lab still carries:
- legacy route redirects
- legacy store wrappers
- duplicate re-export store paths
- stale route-level architecture docs

## Duplicate business-logic families

- duplicate/stale wiki action namespace: `src/lib/wiki/wiki-actions.ts` vs `src/lib/actions/wiki-actions.ts`
- duplicated signal/churn helper surfaces: `src/lib/signals/compute.ts` and `src/lib/readiness/churn.ts` vs live cron/runtime paths
- duplicated notes orchestration across route/shell/drawer (covered structurally in component audit)

## Giant files and complexity hotspots

- `src/features/3d-lab/config/modules/08-vertical/stairway-configurator.ts`
- `src/features/3d-lab/config/modules/08-vertical/stairway-computation.ts`
- `src/app/developer/api-reference/page.tsx`
- `src/app/developer/architecture/page.tsx`

## Main caution

Many of these are not delete-first candidates. The safe first move is to inventory canonical vs compatibility surfaces, then retire aliases and shims in a planned sequence.

## Linked findings and plans

- findings: `CLN-003`, `CLN-004`, `CLN-005`, `CLN-006`, `CLN-007`
- plans: `../03_plans/legacy-removal-plan.md`, `../03_plans/cleanup-implementation-plan.md`
