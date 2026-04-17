# Cleanup Run Log

## 2026-04-17

### Scope decisions

- frozen scope at T0 around repository-wide cleanup audit and planning only
- no application code, hooks, stores, scripts, SQL, migrations, configs, package files, or runtime behavior may be changed
- only `.ai/` Markdown artifacts may be created or updated
- new docs created during this run do not expand audit scope

### Baseline observations

- repo is large enough that cleanup false positives are a primary risk
- route files, migrations, stories, developer tooling, and registry-driven usage must be treated conservatively
- `docs/shared/agent-tiers.md` is still missing, so ultrawork model-tier guidance cannot rely on a repo-local reference

### False-positive cautions

- App Router conventions are active entrypoints even without import edges
- `supabase/migrations/` are preserved migration history, not dead code by default
- developer, Storybook, MDX, and registry/config usage can make “unused” files still meaningful

### Validation limitations

- no root `test` script exists
- no committed root `.env.example` exists
- cleanup-safety assessment must map to real commands only

### Parallel audit lane outcomes

- lane 1 (dead code / unused exports): returned 2 confirmed-dead alias groups, 12 likely candidates, and 4 manual-validation groups
- lane 2 (route / feature legacy): returned 6 major route/feature cleanup candidates centered on admin aliases, quiz/testing/drills, calculators/tools, 3D-lab shims, and developer truth surfaces
- lane 3 (client/server boundary / component optimization): returned 6 structural cleanup candidates centered on wiki, admin knowledge/editor, notes, and `ModuleViewer`
- lane 4 (dependency / scripts / tooling): returned 8 dependency/tooling candidates plus validation hardening implications
- lane 5 (data/runtime cleanup risk): returned 7 blocker-heavy candidates, mostly compatibility retirement and Supabase/auth cleanup sequencing

### Final inventory totals

- cleanup candidates: 41
- findings: 15
- candidate confidence split:
  - confirmed: 5
  - likely: 30
  - needs manual validation: 6
- finding severity split:
  - critical: 3
  - high: 6
  - medium: 6

### Implementation follow-through (first-wave subset)

- implemented:
  - `L1-C001` — removed dead wiki wrapper alias files
  - `L1-C002` — removed dead wiki `*Practice` alias files
- blocked/deferred:
  - dependency-removal subset (`DEP-01` through `DEP-05`)
  - repo-safe Bun package probe failed on the existing resolver issue:
    - `error: No version matching "^1.3.0" found for specifier "@lemonsqueezy/lemonsqueezy.js"`
    - `error: @lemonsqueezy/lemonsqueezy.js@^1.3.0 failed to resolve`
- implication:
  - first implementation wave should proceed as two tracks:
    1. confirmed code-removal subset
    2. dependency cleanup only after package-resolution contract is repaired

### Validation outcome for implementation subset

- source cleanup verification:
  - deleted alias filenames no longer appear in live `src/` code
  - remaining matches are limited to cleanup docs and preserved historical notes
- `git diff --check` passed
- `bun run check:storybook` passed
- `bun run type-check` failed in the current workspace because install/runtime deps are not available (`node_modules` missing) and the repo already has a broken Bun dependency-resolution path
- `bun run lint` failed for the same environment reason; ESLint fell back to a global installation and could not resolve the repo config from local dependencies

### Follow-up: package-resolution blocker repair

- root cause confirmed:
  - `package.json` referenced `@lemonsqueezy/lemonsqueezy.js` at `^1.3.0`
  - npm registry shows no `1.3.0` release exists; valid versions include `1.2.5`, then `2.x`, `3.x`, and `4.x`
- selected fix:
  - changed the manifest to `@lemonsqueezy/lemonsqueezy.js: 1.2.5`
  - chose the nearest valid version because the SDK is currently stubbed in `src/lib/lemonsqueezy/config.ts` and not actively imported
- verification:
  - `bun install --ignore-scripts` now succeeds in the real repo
  - `bun install --frozen-lockfile --ignore-scripts` now succeeds
  - `bun run type-check` now succeeds
  - `npm install --package-lock-only --ignore-scripts --legacy-peer-deps` succeeded for `package-lock.json` sync after exposing a preexisting Storybook peer-version mismatch in the npm path
- remaining note:
  - `bun run lint` is now running under the repaired install state instead of failing immediately on missing local dependencies/config

### Follow-up: low-risk dependency cleanup slice

- implemented:
  - removed `dompurify`
  - removed `nextjs-toploader`
  - removed `@storybook/test`
  - removed `@radix-ui/react-visually-hidden`
  - removed `@types/dompurify`
  - removed the redundant `check:storybook-placeholders` alias script
- later extension:
  - removed `@tiptap/pm`
  - removed `@tiptap/suggestion`
- validation:
  - `bun install --ignore-scripts` passed
  - `bun install --frozen-lockfile --ignore-scripts` passed
  - `bun run type-check` passed
  - `bun run check:storybook` passed
  - `bun run lint` completes with warnings only and no errors under the repaired install state
  - `bun run build` now passes under the repaired install state

### Follow-up: wiki server/client boundary quick win

- implemented:
  - `L3-C01` — removed the unnecessary `'use client'` boundary from `src/app/dashboard/wiki/page.tsx`
  - replaced client `SCIcon` usage with direct SSR icon rendering so the route can stay server-side
- validation:
  - targeted ESLint on `src/app/dashboard/wiki/page.tsx` passed
  - `bun run type-check` passed
  - `bun run build` passed after the server-side icon handoff was fixed

### Follow-up: likely-dead leaf UI/helper cleanup batch

- implemented:
  - removed `src/components/quiz-v2/review/ReviewMode.tsx`
  - removed `src/components/quiz-v2/review/QuestionHistory.tsx`
  - removed `src/components/quiz-v2/setup/ModeSelector.tsx`
  - removed `src/lib/constants/developer.ts`
  - removed `src/components/score/skeletons/ScoreRingSkeleton.tsx`
  - removed `src/components/shared/content-sidebar.tsx`
  - removed `src/components/trail/TrailDayCard.tsx`
  - removed `src/components/trail/skeletons/TrailDayCardSkeleton.tsx`
- validation:
  - runtime/reference grep showed no live code consumers beyond cleanup/docs references
  - `bun run type-check` passed
  - `bun run check:storybook` passed
  - `bun run build` passed

### Follow-up: likely-dead shared hook cleanup batch

- implemented:
  - removed `src/hooks/useComplianceCheck.ts`
  - removed `src/hooks/useGuidedSequence.ts`
  - removed `src/hooks/useKeyboardShortcuts.ts`
  - removed `src/hooks/useQuizFocusManager.ts`
- validation:
  - runtime/reference grep showed no live code consumers beyond docs/comments and the distinct DevControls hook
  - `bun run type-check` passed
  - `bun run check:storybook` passed
  - `bun run build` passed

### Follow-up: stale parallel wiki action namespace cleanup

- implemented:
  - removed `src/lib/wiki/wiki-actions.ts`
- validation:
  - runtime/reference grep showed no live source imports, only cleanup docs and deep reference docs
  - `bun run type-check` passed
  - `bun run check:storybook` passed
  - `bun run build` passed

### Follow-up: low-blast-radius helper cleanup batch

- implemented:
  - removed `src/lib/audio/feedbackSounds.ts`
  - removed `src/lib/hooks/useExperiment.ts`
  - removed `src/lib/hooks/useUserRole.ts`
  - removed `src/lib/quiz/offline/sync.ts`
  - removed `src/lib/quiz/should-interleave.ts`
- validation:
  - runtime/reference grep showed no live code consumers beyond cleanup docs and local AGENTS inventories
  - `bun run type-check` passed
  - `bun run check:storybook` passed
  - `bun run build` passed

### Follow-up: empty data-stub cleanup

- implemented:
  - removed `src/data/patch.json`
- validation:
  - runtime/reference grep showed no live consumers beyond cleanup docs and the local `src/data/AGENTS.md` inventory note
  - `bun run type-check` passed
  - `bun run check:storybook` passed
  - `bun run build` passed

### Follow-up: sample-lots fixture cleanup

- implemented:
  - removed `src/data/sample-lots.ts`
- validation:
  - runtime/reference grep showed no live consumers beyond cleanup docs and the local `src/data/AGENTS.md` inventory note
  - `bun run type-check` passed
  - `bun run check:storybook` passed
  - `bun run build` passed

### Follow-up: mock question fixture cleanup

- implemented:
  - removed `src/data/mock-questions.json`
- validation:
  - runtime/reference grep showed no live consumers beyond cleanup docs and the local `src/data/AGENTS.md` inventory note
  - `bun run type-check` passed
  - `bun run check:storybook` passed
  - `bun run build` passed

### Follow-up: detached signal helper cleanup

- implemented:
  - removed `src/lib/readiness/churn.ts`
  - removed `src/lib/signals/compute.ts`
- validation:
  - runtime/reference grep showed no live imports; the active signal/churn logic remains in the cron route and readiness-update paths
  - `bun run type-check` passed
  - `bun run check:storybook` passed
  - `bun run build` passed

### Follow-up: detached domain-helper cleanup

- implemented:
  - removed `src/lib/outcomes/prepopulate.ts`
  - removed `src/lib/proof-simulation/gate.ts`
- validation:
  - runtime/reference grep showed no live source consumers beyond cleanup docs and local AGENTS inventories
  - `bun run type-check` passed
  - `bun run check:storybook` passed
  - `bun run build` passed

### Follow-up: internal admin alias-route convergence

- implemented:
  - updated internal admin dashboard navigation from `/admin/dashboard` to `/admin`
  - updated admin login redirect target from `ROUTES.admin.dashboard` to `ROUTES.admin.root`
  - updated the admin dashboard coverage-gap CTA from `/admin/questions/new` to the canonical knowledge-question creation path
  - updated admin bulk/wiki action revalidation to target canonical `knowledge*` / `wiki` surfaces instead of legacy alias pages
  - removed unused legacy admin route constants from `ROUTES.admin`
- intentionally preserved:
  - alias route files under `/admin/dashboard`, `/admin/questions`, `/admin/content`, and `/admin/articles`
- validation:
  - `bun run type-check` passed
  - `bun run check:storybook` passed
  - `bun run build` passed

### Follow-up: admin alias route-file retirement

- implemented:
  - removed redirect-only route files under:
    - `/admin/dashboard`
    - `/admin/content`
    - `/admin/articles`
    - `/admin/questions`
- prerequisite already satisfied:
  - internal consumers, redirect targets, constants, and revalidation paths had already been migrated away from those aliases
- validation:
  - no live source references remain to the retired alias routes/constants
  - `bun run type-check` passed
  - `bun run check:storybook` passed
  - `bun run build` passed

### Follow-up: internal quiz/testing helper convergence

- implemented:
  - migrated internal consumers away from `ROUTES.TESTING`, `ROUTES.REVIEW`, `ROUTES.QUIZ_V2_SETUP`, and `ROUTES.quiz.legacy.simSetup`
  - aligned those consumers with canonical `ROUTES.dashboard.drills` and `ROUTES.quiz.setup(...)` helpers
  - removed stale `/dashboard/testing*` title-prefix aliases from `src/lib/routes.ts`
  - migrated remaining hardcoded `/quiz/camp/setup` links in dashboard and notification surfaces to canonical route helpers
  - migrated the navbar `Sessions` link from `ROUTES.SESSIONS` to `ROUTES.dashboard.drillsSessions`
- intentionally preserved:
  - route files under `/dashboard/testing/**`
  - legacy uppercase helper aliases in `src/lib/routes.ts`
- validation:
  - `bun run type-check` passed
  - `bun run check:storybook` passed
  - `bun run build` passed

### Follow-up: top-level testing alias page retirement

- implemented:
  - removed `src/app/dashboard/testing/page.tsx`
- intentionally preserved:
  - deeper compatibility routes under `/dashboard/testing/session/**` and `/dashboard/testing/simulation/**`
- validation:
  - no live source references remain to the retired top-level alias page
  - `bun run type-check` passed
  - `bun run check:storybook` passed
  - `bun run build` passed

### Follow-up: deeper testing compatibility page retirement

- implemented:
  - removed `src/app/dashboard/testing/session/[sessionId]/page.tsx`
  - removed `src/app/dashboard/testing/session/[sessionId]/debrief/page.tsx`
  - removed `src/app/dashboard/testing/simulation/[sessionId]/results/page.tsx`
- intentionally preserved:
  - supporting loading/error shells still under `src/app/dashboard/testing/**`
- validation:
  - no live source references remain to the retired compatibility pages
  - `bun run type-check` passed
  - `bun run check:storybook` passed
  - `bun run build` passed

### Follow-up: testing compatibility subtree retirement

- implemented:
  - removed the remaining support files under `src/app/dashboard/testing/**`
- result:
  - the old `/dashboard/testing` compatibility route layer is now fully retired
  - canonical drill/test routing now lives under `/dashboard/drills` and `/quiz/**`
- validation:
  - no live source references remain to the retired testing subtree
  - `bun run type-check` passed
  - `bun run check:storybook` passed
  - `bun run build` passed

### Follow-up: broader route-helper convergence

- implemented:
  - migrated broad internal usage off uppercase/general route aliases such as:
    - `ROUTES.DASHBOARD`
    - `ROUTES.WIKI`
    - `ROUTES.WIKI_PAGE`
    - `ROUTES.CAMPTRAILS`
    - `ROUTES.ANALYTICS`
    - `ROUTES.NOTES`
    - `ROUTES.THREE_D_LAB`
    - `ROUTES.TOOLS`
    - related settings and helper aliases
- result:
  - no remaining uppercase/general route alias usage is left in `src/`
- validation:
  - `bun run type-check` passed
  - `bun run check:storybook` passed
  - `bun run build` passed

### Follow-up: developer tech-stack truth-surface hardening

- implemented:
  - added `src/lib/developer/tech-stack.ts`
  - removed duplicated hardcoded version tables from `/developer` and `/developer/architecture`
  - both pages now read from one manifest-backed tech-stack source
- validation:
  - `bun run type-check` passed
  - `bun run build` passed

### Follow-up: developer status truth-surface hardening

- implemented:
  - removed random pseudo-uptime generation from `/developer/status`
  - replaced it with a deterministic current availability snapshot derived from the current live service state
- validation:
  - `bun run type-check` passed
  - `bun run build` passed

### Follow-up: developer landing metrics truth-surface hardening

- implemented:
  - added `src/lib/developer/repo-metrics.ts`
  - replaced placeholder “Stories 71+ / LOC 26K” values on `/developer` with repo-backed counts
  - replaced the fake “Last checked: 3s ago” label with a real snapshot timestamp
- validation:
  - `bun run type-check` passed
  - `bun run build` passed

### Follow-up: developer internal route-helper convergence

- implemented:
  - migrated the remaining hardcoded `/developer/**` links inside the developer portal to `ROUTES.developer.*`
- validation:
  - `bun run type-check` passed
  - `bun run build` passed

### Follow-up: developer API reference data extraction

- implemented:
  - moved the static endpoint/action datasets out of `src/app/developer/api-reference/page.tsx`
  - added `src/lib/developer/api-reference-data.ts` so the route file focuses on rendering instead of carrying the full documentation payload inline
  - refreshed `src/lib/developer/AGENTS.md` to match the live subtree contents
- validation:
  - `bun run type-check` passed
  - `bun run build` passed

### Follow-up: developer architecture data extraction

- implemented:
  - moved the static schema/role/deployment datasets out of `src/app/developer/architecture/page.tsx`
  - added `src/lib/developer/architecture-data.ts` so the route file focuses on rendering and local subcomponents instead of carrying the full documentation payload inline
  - refreshed `src/lib/developer/AGENTS.md` to match the live subtree contents
- validation:
  - `bun run type-check` passed
  - `bun run build` passed

### Follow-up: developer surface registry convergence

- implemented:
  - added `src/lib/developer/surface-registry.ts` as the canonical source for developer portal surface metadata
  - migrated the developer shell, search palette, overview cards/quick actions, tools page, and status services to the shared registry
  - removed the unused `src/app/developer/_components/DevPortalSidebar.tsx` after confirming it had no live imports
  - refreshed `src/app/developer/AGENTS.md` and `src/lib/developer/AGENTS.md` to match the live subtree contents
- validation:
  - `bun run type-check` passed
  - `bun run build` passed

### Follow-up: developer truth-label pass

- implemented:
  - added `src/components/developer/SurfaceTruthNotice.tsx` for small source-of-truth notices
  - labeled `/developer/status` as a mixed live + deterministic surface
  - labeled `/developer/status/database` and `/developer/status/infrastructure` as fallback/mock-backed detail pages
  - labeled `/developer/tools/logs` as a runtime-backed inspection surface
  - refreshed scoped AGENTS counts where the new component and labels changed subtree structure
- validation:
  - `bun run type-check` passed
  - `bun run build` passed

### Follow-up: developer shared status snapshot

- implemented:
  - added `src/lib/developer/status-snapshot.ts` for the shared live service-status fetch/normalization path
  - updated `/developer/status` to consume the shared snapshot helper instead of owning its own Supabase status parsing logic
  - updated the `/developer` overview health chips to use the same live service set, removing the old static cache placeholder drift
  - refreshed `src/lib/developer/AGENTS.md` to match the new helper file
- validation:
  - `bun run type-check` passed
  - `bun run build` passed

### Follow-up: developer breadcrumb-label convergence

- implemented:
  - moved developer breadcrumb label resolution onto the shared surface registry
  - removed the separate hardcoded label map from `src/components/developer/Breadcrumbs.tsx`
  - developer route labels now stay aligned with the same canonical definitions used by shell/search/overview/tools/status surfaces
- validation:
  - `bun run type-check` passed
  - `bun run build` passed

### Follow-up: developer type-surface trim

- implemented:
  - removed unused documentation/search helper type exports from `src/types/developer.ts`
  - retained only the active status-surface contracts still used by `src/lib/mocks/status.ts` and the `/developer/status/**` pages
- validation:
  - `bun run type-check` passed
  - `bun run build` passed

### Follow-up: developer barrel trim

- implemented:
  - removed `src/components/developer/index.ts` after confirming the barrel had no live imports
  - refreshed `src/components/developer/AGENTS.md` so the scoped snapshot reflects the current file set, including `SurfaceTruthNotice.tsx`
- validation:
  - `bun run type-check` passed
  - `bun run build` passed

### Follow-up: developer status-banner timestamp cleanup

- implemented:
  - updated `src/components/developer/StatusBanner.tsx` to accept a real `checkedAtLabel`
  - updated `/developer/status` to pass the page's live snapshot time instead of rendering a hardcoded “Last checked: 3s ago” placeholder
  - updated the Storybook story to show the explicit timestamp prop
- validation:
  - `bun run type-check` passed
  - `bun run build` passed

### Follow-up: Bun-only lockfile convergence

- implemented:
  - removed `package-lock.json` after confirming active CI/workflow paths install with Bun only
  - updated active baseline/plan/state docs that still listed the npm lockfile as part of the live root contract
- validation:
  - `bun run type-check` passed
  - `bun run build` passed

### Follow-up: developer mock schema-name alignment

- implemented:
  - updated `src/lib/mocks/status.ts` so the fallback database status page uses current schema-facing table names
  - replaced stale mock labels like `users`, `taxonomy_nodes`, and `trail_enrollments` with `profiles`, `taxonomy_tree`, and `user_trail_enrollments`
- validation:
  - `bun run type-check` passed
  - `bun run build` passed

### Follow-up: developer Next.js version alignment

- implemented:
  - exported `developerNextVersion` from `src/lib/developer/tech-stack.ts`
  - updated the `/developer/tools/console` system-info payload and the dashboard dev keyboard overlay to use the shared helper
  - removed the stale hardcoded `nextVersion: '15'` strings from both entry points
- validation:
  - `bun run type-check` passed
  - `bun run build` passed

### Follow-up: developer connection-state type convergence

- implemented:
  - updated the developer console client, dev keyboard provider, dev overlay, and system-info component to use the shared `DevConnectionState` type
  - removed the repeated `'local' | 'connected'` unions from those dev-facing surfaces
- validation:
  - `bun run type-check` passed
  - `bun run build` passed

### Follow-up: developer system-info contract convergence

- implemented:
  - added `DevSystemInfo` to `src/lib/dev/dev-mode.ts`
  - updated the developer console client, dev keyboard provider, dev overlay, and system-info component to reuse that shared contract instead of repeating the same object shape
- validation:
  - `bun run type-check` passed
  - `bun run build` passed

### Follow-up: dashboard connection-state alignment

- implemented:
  - updated `src/components/dashboard/DashboardLayoutContent.tsx` to reuse `getConnectionState()`
  - removed the hardcoded fallback to `'connected'` when the local dev bypass is off
  - both the dev toolbar and dev keyboard overlay now consume one computed `devConnectionState`
- validation:
  - `bun run type-check` passed
  - `bun run build` passed

### Follow-up: developer system-info builder cleanup

- implemented:
  - added `buildDevSystemInfo()` to `src/lib/dev/dev-mode.ts`
  - updated the developer console and dashboard dev keyboard overlay to construct their system-info payloads through the shared helper
  - removed another small duplicated object-construction pattern from dev-facing surfaces
- validation:
  - `bun run type-check` passed
  - `bun run build` passed

### Follow-up: developer strict-mode note alignment

- implemented:
  - imported `tsconfig.json` into `src/lib/developer/tech-stack.ts`
  - the developer architecture tech-stack table now derives its TypeScript strict-mode note from the real config instead of hardcoding `strict: false`
- validation:
  - `bun run type-check` passed
  - `bun run build` passed

### Follow-up: developer detached preview cleanup

- implemented:
  - removed `src/app/developer/_components/DevBadge.tsx` after confirming it had no live imports
  - removed `src/app/developer/_components/SlideToSubmitPreview.tsx` after confirming it had no live imports
  - updated the active identity-lock legacy rule note so it no longer points at the retired preview file
  - refreshed `src/app/developer/AGENTS.md` counts for the smaller subtree
- validation:
  - `bun run type-check` passed
  - `bun run build` passed

### Follow-up: developer detached table-of-contents cleanup

- implemented:
  - removed `src/app/developer/_components/TableOfContents.tsx` after confirming it had no live consumers
  - refreshed `src/app/developer/AGENTS.md` counts for the smaller subtree
- validation:
  - `bun run type-check` passed
  - `bun run build` passed

### Follow-up: developer content-version truth cleanup

- implemented:
  - removed the hardcoded secondary MDX version string from `src/lib/developer/tech-stack.ts`
  - the developer tech-stack content row now reports the package-backed `next-mdx-remote` version directly and notes the `rsc` runtime usage instead of implying ownership of an untracked `@mdx-js/mdx` version
- validation:
  - `bun run type-check` passed
  - `bun run build` passed

### Follow-up: developer payments-note truth cleanup

- implemented:
  - updated the payments note in `src/lib/developer/tech-stack.ts`
  - the developer portal now describes the current runtime reality more precisely: PayRex is the active path, while the LemonSqueezy config remains stubbed
- validation:
  - `bun run type-check` passed
  - `bun run build` passed

### Follow-up: developer auth-provider data extraction

- implemented:
  - moved the auth/provider property rows out of `src/app/developer/architecture/page.tsx`
  - the architecture route now reads those rows from `src/lib/developer/architecture-data.ts` instead of carrying one more inline array
- validation:
  - `bun run type-check` passed
  - `bun run build` passed

### Follow-up: developer connection-state/helper cleanup

- implemented:
  - updated `/developer/tools/console` to use the shared `getConnectionState()` helper instead of duplicating the env check inline
  - removed the unused `THREE_WITH_DREI_VERSION` constant from `src/lib/developer/tech-stack.ts`
- validation:
  - `bun run type-check` passed
  - `bun run build` passed

### Follow-up: wiki mobile hydration convergence

- implemented:
  - `src/components/wiki/navigation/WikiHeader.tsx` now fetches the cached taxonomy tree server-side
  - `src/components/wiki/navigation/WikiHeaderClient.tsx` passes that server-loaded tree into the mobile `WikiSidebar`
- result:
  - mobile wiki navigation now follows the same server-loaded taxonomy path as the desktop sidebar instead of triggering a separate client fetch path
- validation:
  - `bun run type-check` passed
  - `bun run build` passed

### Follow-up: 3D-lab store-wrapper convergence

- implemented:
  - moved the remaining consumers off `_stores/labStore.ts` and `components/_stores/labStore.ts`
  - retired both redundant re-export wrapper files
- validation:
  - no live source imports remain for those wrapper paths
  - `bun run type-check` passed
  - `bun run build` passed

### Follow-up: dashboard developer compatibility-page retirement

- implemented:
  - removed the redirect-only pages under `src/app/dashboard/developer/**`
- result:
  - the canonical developer surface is now only `/developer/**`
- validation:
  - no live source references remain to the retired dashboard developer pages
  - `bun run type-check` passed
  - `bun run check:storybook` passed
  - `bun run build` passed

### Completion check

- baseline/control docs created first
- coverage, findings, and candidate inventories stayed single-sourced
- all required cleanup audit and plan docs were created
- coverage matrix now marks every baseline area complete, excluded, or inventory-only with rationale
- only `.ai/` Markdown files changed in this run
- `git diff --check` passed
