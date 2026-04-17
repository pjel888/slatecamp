# Architecture Audit

## Scope

- `src/`
- `public/`
- `.storybook/`
- `next.config.ts`
- `middleware.ts`

## Linked findings

- `ARC-001`
- `ARC-002`
- `ARC-003`
- `ARC-004`
- `CQ-001`
- `PERF-002`
- `META-001`
- `META-003`

## Observed

- `src/` remains the dominant application surface with 2141 files at T0
- Key hotspots are concentrated in 3D Lab registry/rendering, admin authoring, and the dashboard shell
- Route files still embed local presentation helpers in multiple portal surfaces
- Server-first documentation exists, but major shared render paths still accumulate nontrivial orchestration and writes

## Material findings

### `ARC-001` 3D Lab registry drift

Observed in:
- `src/features/3d-lab/components/ModuleViewer.tsx`
- `src/features/3d-lab/config/registry/index.ts`
- `src/features/3d-lab/utils/registryLoader.ts`
- `src/features/3d-lab/components/LabBrowser.tsx`

Impact:
- multiple registry authorities for one flagship subsystem
- duplicated loading logic and higher drift risk

### `ARC-002` Dashboard shell overload

Observed in:
- `src/app/dashboard/layout.tsx`
- `src/components/dashboard/DashboardLayoutContent.tsx`
- `src/lib/supabase/bootstrap.ts`
- `src/app/(auth)/onboarding/page.tsx`

Impact:
- broad blast radius for dashboard shell changes
- hidden render-time writes and unclear ownership of bootstrap behavior

### `ARC-003` Monolithic high-churn surfaces

Observed examples:
- `src/components/admin/unified-editor/QuestionsPanel.tsx`
- `src/lib/actions/admin/content.ts`
- `src/features/3d-lab/config/modules/08-vertical/stairway-configurator.ts`
- `src/app/developer/architecture/page.tsx`

Impact:
- fragile review surface
- difficult ownership boundaries
- higher risk of incidental regressions during future fixes

### `ARC-004` Route files are not consistently thin assembly layers

Observed examples:
- `src/app/(protected)/ceo/page.tsx`
- `src/app/developer/page.tsx`
- `src/app/developer/architecture/page.tsx`
- `src/app/dashboard/area-c/design-problems/[problemId]/page.tsx`

Impact:
- route-level files mix orchestration and presentation
- App Router boundaries are harder to test and refactor safely

## Inferred

- Architecture doctrine exists, but it is not yet enforced strongly enough to keep dashboard shell logic, admin authoring, and 3D Lab loading paths structurally consistent

## Unknown

- Exact refactor slice boundaries that would minimize change risk across the admin editor and 3D lab
