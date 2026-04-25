# 2026-04-25 MVP Readiness Baseline

## Scope and method

This Phase 0 artifact freezes the live repository baseline before remediation work. It documents current-repo evidence only.

### Governing instructions read
- `AGENTS.md`
- `.ai/AGENTS.md`

### Snapshot context
- Worktree: `bootstrap-approved-slatecamp-m/worktrees/worker-2`
- Snapshot date: `2026-04-25`
- Mode: documentation-only baseline; no remediation in this pass

## Working tree baseline

### Live `git status --short`

```text
 M .ai/00_system/CODEX_ENABLEMENT_GUIDE.md
 M .ai/00_system/DOCS_SOURCE_OF_TRUTH.md
 M .ai/12_agents/repo-agent-model.md
 M bun.lock
 M docs/README.md
 M package.json
?? docs/shared/
```

### Baseline note
- This task started from a dirty worktree.
- The new audit artifact below is additive and does not normalize or remediate pre-existing drift.

## Inventory snapshot

### Core counts from live filesystem

| Surface | Live count | Evidence command |
| --- | ---: | --- |
| `src/app/**/page.tsx` | 104 | `find src/app -type f -name 'page.tsx' | wc -l` |
| `src/app/**/layout.tsx` | 15 | `find src/app -type f -name 'layout.tsx' | wc -l` |
| `src/app/**/loading.tsx` | 91 | `find src/app -type f -name 'loading.tsx' | wc -l` |
| `src/app/**/error.tsx` | 7 | `find src/app -type f -name 'error.tsx' | wc -l` |
| `src/app/**/route.ts` | 12 | `find src/app -type f -name 'route.ts' | wc -l` |
| `src/components/**` files | 704 | `find src/components -type f | wc -l` |
| `src/features/**` files | 549 | `find src/features -type f | wc -l` |
| `src/lib/actions/**` files | 156 | `find src/lib/actions -type f | wc -l` |
| `supabase/migrations/**` files | 91 | `find supabase/migrations -type f | wc -l` |
| `.ai/**` files | 995 | `find .ai -type f | wc -l` |
| `docs/**` files in worktree | 3 | `find docs -type f | wc -l` |

### Route shell inventory notes
- Error boundaries currently exist at:
  - `src/app/error.tsx`
  - `src/app/(auth)/error.tsx`
  - `src/app/admin/error.tsx`
  - `src/app/dashboard/error.tsx`
  - `src/app/dashboard/3d-lab/error.tsx`
  - `src/app/dashboard/analytics/error.tsx`
  - `src/app/developer/error.tsx`
- `route.ts` handlers currently exist at 12 paths under `src/app/api/**` plus `src/app/auth/callback/route.ts`.
- There is also a route-handler outlier at `src/app/api/og/score/route.tsx`, so the route-handler surface is effectively `12 route.ts + 1 route.tsx`.

## Drift versus root `AGENTS.md` repository-reality snapshot

The root `AGENTS.md` was generated/refreshed on `2026-04-18`, so its embedded counts no longer match the live tree in several places.

| Metric | Root `AGENTS.md` | Live now | Drift |
| --- | ---: | ---: | ---: |
| `page.tsx` routes | 125 | 104 | -21 |
| layouts | 16 | 15 | -1 |
| loading files | 96 | 91 | -5 |
| error boundaries | 9 | 7 | -2 |
| route handlers (`route.ts`) | 12 | 12 | 0 |
| `src/lib/actions/**` files | 156 | 156 | 0 |
| `src/components/**` files | 716 | 704 | -12 |
| `src/features/**` files | 551 | 549 | -2 |
| `supabase/migrations/**` files | 89 | 91 | +2 |
| test files in `src/` | 64 | 65 | +1 |
| tracked `AGENTS.md` files | 122 documented | 121 tracked via `git ls-files '*AGENTS.md'` | -1 |

### Drift interpretation
- The route and component counts in root `AGENTS.md` are stale enough to avoid using them as live sizing truth.
- Migration count has increased beyond the root snapshot (`89 -> 91`).
- The tracked `AGENTS.md` count in git is `121`, while the root document still says `122`.

## Package-script baseline

Live `package.json` scripts:

```json
{
  "dev": "bun run scripts/dev.js",
  "dev:turbo": "next dev --turbopack",
  "dev:webpack": "next dev --webpack",
  "build": "next build",
  "start": "next start",
  "check:storybook": "bun scripts/check-storybook.ts",
  "storybook": "bun run check:storybook && storybook dev -p 6006",
  "build-storybook": "bun run check:storybook && storybook build",
  "lint": "bun run check:storybook && eslint .",
  "lint:fix": "eslint . --fix",
  "check:entitlements": "bun run scripts/check-entitlement-legacy-usage.ts",
  "type-check": "tsc --noEmit",
  "db:seed": "bun scripts/seed.ts",
  "bones:build": "boneyard-js build http://localhost:3000/dashboard --out ./src/bones"
}
```

## Docs count drift

| Metric | Count | Evidence |
| --- | ---: | --- |
| Tracked `docs/**` files at `HEAD` | 2 | `git ls-tree -r --name-only HEAD docs | wc -l` |
| Worktree `docs/**` files now | 3 | `find docs -type f | wc -l` |
| Drift | +1 | untracked `docs/shared/agent-tiers.md` |

### Interpretation
- `docs/` is no longer just the tracked two-file bridge surface (`docs/AGENTS.md`, `docs/README.md`) in this worktree snapshot.
- `docs/README.md` is also modified, so docs topology is currently mid-edit.

## Route constants mismatch summary

Evidence reviewed:
- `src/lib/routes.ts`
- `src/lib/__tests__/routes.test.ts`
- `src/lib/supabase/middleware.ts`

### Static constants with no matching live page/handler path

The static route constants in `src/lib/routes.ts` include at least these unmatched paths when compared against current `src/app/**/page.tsx` and `src/app/**/route.ts` surfaces:

- `/admin/wiki`
- `/auth/reset-password`
- `/dashboard/campfire`
- `/dashboard/library`
- `/dashboard/settings/billing`
- `/dashboard/settings/developer`
- `/dashboard/trails`
- `/quiz/full_exam/setup`

### Static app paths without a corresponding static route constant

Current static app paths with no matching static constant include at least:

- `/admin/knowledge/analytics`
- `/admin/knowledge/import`
- `/admin/knowledge/new`
- `/admin/knowledge/questions/new`
- `/admin/taxonomy/coverage`
- `/calculators/chb`
- `/calculators/drywall`
- `/calculators/flooring`
- `/calculators/paint`
- `/ceo/analytics`
- `/ceo/insights`
- `/dashboard/area-c/calculator`
- `/dashboard/area-c/design-quiz`
- `/dashboard/exam-outcome`
- `/dashboard/score-reveal`
- `/dashboard/welcome-pro`
- `/onboarding/comp-exam`
- `/quiz`

### Structural mismatch inside `src/lib/routes.ts`
- `DASHBOARD_ROUTES` currently labels a `3D Lab` sidebar item but points it at `ROUTES.dashboard.root` instead of the dedicated `ROUTES.lab.root` path.
- API route constants are only partially represented. The file exposes `/api/analytics/3d-lab` and `/auth/callback`, but most live `/api/**` handlers are not modeled there.
- Middleware public-route logic (`src/lib/supabase/middleware.ts`) depends on `PUBLIC_ROUTES`, so constant drift is operationally relevant even in a documentation-only pass.

### Existing test evidence tied to the mismatch
- `bun test src/lib/__tests__/routes.test.ts` currently fails on `getPageTitle('/dashboard')`.
- Expected title: `Dashboard`
- Received title: `3D Lab`
- That failure is consistent with the duplicated `ROUTES.dashboard.root` entry inside `DASHBOARD_ROUTES`.

## Supabase read-only evidence available at baseline

This task did not run fresh database or remote Supabase checks. The read-only evidence available in-repo at snapshot time is:

- `src/lib/supabase/middleware.ts` imports `ROUTES` and `PUBLIC_ROUTES` and uses them to gate auth redirects and protected-route access.
- `.ai/00_system/ENVIRONMENT_CONTRACT.md` documents required Supabase environment variables and the runtime surfaces that depend on them.
- `.ai/00_system/DATA_BOUNDARY_MAP.md` identifies the main Supabase helper surfaces:
  - `src/lib/supabase/server.ts`
  - `src/lib/supabase/client.ts`
  - `src/lib/supabase/admin.ts`
  - `src/lib/supabase/middleware.ts`
- `.ai/00_system/VALIDATION_MATRIX.md` already treats Supabase/data-boundary validation as a first-class audit surface.

### Baseline interpretation
- The repo already has static documentation showing Supabase as a core runtime boundary.
- No new Supabase runtime evidence was added in this artifact.
- Any later Supabase repair task should treat this document as inventory only, not as proof of runtime health.

## Source paths used for this baseline
- `AGENTS.md`
- `.ai/AGENTS.md`
- `package.json`
- `src/lib/routes.ts`
- `src/lib/__tests__/routes.test.ts`
- `src/lib/supabase/middleware.ts`
- `.ai/00_system/ENVIRONMENT_CONTRACT.md`
- `.ai/00_system/DATA_BOUNDARY_MAP.md`
- `.ai/00_system/VALIDATION_MATRIX.md`
- `docs/README.md`
- `.ai/00_system/DOCS_SOURCE_OF_TRUTH.md`

## Non-remediation constraint
- This artifact intentionally stops at baseline capture.
- It should be used as a source-of-truth freeze for subsequent readiness remediation, not as an implementation change log.
